import { fail, fromError, fromZod, ok } from "@/lib/api";
import { regionFromRequest } from "@/lib/region";
import { bookingRequestSchema } from "@/lib/validation";
import { getCustomerId, getSession, linkCustomer, register } from "@/services/auth";
import { sendEmail } from "@/services/email";
import { createPayment, linkPayment, refundPayment } from "@/services/payments";
import { checkVehicleAvailability, createBooking, quoteRentACar, upsertCustomer, WeGestError } from "@/services/wegest";

/**
 * POST /api/rentacar/bookings: fluxo completo de reserva (doc §27):
 * conta → cotação (preço protegido) → disponibilidade → cliente WeGest → pagamento → reserva WeGest.
 * Se o WeGest recusar depois do pagamento, o pagamento é reembolsado automaticamente.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);
  const input = parsed.data;
  const region = regionFromRequest(req);
  const search = { ...input.search, region };

  try {
    // 1. Conta do website (autenticação ≠ ficha WeGest, doc §23)
    let session = await getSession();
    if (!session) {
      if (!input.account) {
        return fail("unauthorized", "A sua sessão terminou. Entre novamente para concluir a reserva; as suas escolhas ficam guardadas.", 401, { reason: "session_expired" });
      }
      const reg = await register(input.customer.email, input.account.password, input.customer.fullName);
      if (!reg.ok) return fail("validation", reg.error, 422, { fieldErrors: { "account.password": reg.error } });
      session = await getSession();
    }
    if (!session) return fail("unauthorized", "Sessão inválida.", 401);

    // 2. Preço revalidado no WeGest: o frontend nunca é a fonte oficial (doc §76)
    const quote = await quoteRentACar({ vehicleId: input.vehicleId, offerId: input.offerId, search, extras: input.extras, coverageId: input.coverageId });
    if (Math.abs(quote.total - input.expectedTotal) > 0.009) {
      return priceChanged(quote);
    }

    // 3. Nova verificação de disponibilidade (doc §89)
    const availability = await checkVehicleAvailability({
      region, product: "rentacar", vehicleId: input.vehicleId,
      pickupLocationId: search.pickupLocationId, returnLocationId: search.returnLocationId,
      pickupAt: search.pickupAt, returnAt: search.returnAt,
    });
    if (availability.status === "unavailable") {
      return fail("conflict", "Esta viatura acabou de ser reservada por outra pessoa. Não foi cobrado nada.", 409, { reason: "vehicle_unavailable" });
    }

    // 4. Cliente criado/atualizado no WeGest e ligado à conta (doc §19, §22)
    const existingId = await getCustomerId(session, "rentacar");
    const customer = await upsertCustomer("rentacar", input.customer, existingId ?? undefined);
    if (!existingId) await linkCustomer(session.user.id, { wegestCustomerId: customer.id, customerType: "rentacar", region });

    // 5. Pagamento
    const payment = await createPayment({
      amount: quote.total,
      currency: "EUR",
      purpose: "rentacar_booking",
      method: input.payment.method,
      reference: quote.id,
      customerEmail: input.customer.email,
      paymentToken: input.payment.token,
      phone: input.payment.phone,
      idempotencyKey: input.idempotencyKey,
    });
    if (payment.status === "failed") return fail("payment_failed", "O pagamento foi recusado. Verifique os dados ou use outro método.", 402);

    // 6. Reserva no WeGest
    try {
      const booking = await createBooking({
        customerId: customer.id,
        quoteId: quote.id,
        vehicleId: input.vehicleId,
        offerId: input.offerId,
        search,
        extras: input.extras,
        coverageId: input.coverageId,
        driver: {
          birthDate: input.customer.birthDate,
          licenseNumber: input.customer.licenseNumber,
          licenseExpiry: input.customer.licenseExpiresAt,
          licenseCountry: input.customer.licenseCountry,
        },
        message: input.message,
        paymentReference: payment.id,
        idempotencyKey: input.idempotencyKey,
      });
      await linkPayment(payment.id, booking.id);
      await sendEmail(input.customer.email, "rac.booking_received", { reference: booking.reference });
      if (payment.status === "paid") await sendEmail(input.customer.email, "rac.payment_confirmed", { reference: booking.reference });
      return ok({ bookingId: booking.id, reference: booking.reference, status: booking.status, paymentStatus: payment.status });
    } catch (err) {
      // Nunca deixar um cliente pago sem reserva
      if (payment.status === "paid") await refundPayment(payment.id, undefined, "Reserva recusada pelo sistema de gestão");
      if (err instanceof WeGestError && err.code === "conflict") {
        const money = payment.status === "paid" ? "O valor pago foi devolvido." : "Não foi cobrado nada.";
        return fail("conflict", `Esta viatura acabou de ser reservada por outra pessoa. ${money}`, 409, { reason: "vehicle_unavailable" });
      }
      throw err;
    }
  } catch (err) {
    return fromError(err);
  }
}

function priceChanged(quote: unknown) {
  return Response.json(
    { ok: false, error: { code: "conflict", reason: "price_changed", message: "O preço foi atualizado. Reveja o novo total antes de continuar." }, quote },
    { status: 409 },
  );
}
