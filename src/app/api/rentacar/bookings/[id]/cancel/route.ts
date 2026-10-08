import { fail, fromError, ok } from "@/lib/api";
import { getOwnBooking } from "@/lib/ownership";
import { sendEmail } from "@/services/email";
import { refundPayment } from "@/services/payments";
import { paymentsRepo } from "@/services/store";
import { cancelBooking, previewCancellation } from "@/services/wegest";

/** GET: política e valores do cancelamento, calculados pelo WeGest (doc §37). */
export async function GET(_: Request, { params }: RouteContext<"/api/rentacar/bookings/[id]/cancel">) {
  const { id } = await params;
  try {
    const own = await getOwnBooking(id);
    if (!own) return fail("not_found", "Reserva não encontrada.", 404);
    if (!own.booking.canCancel) return fail("conflict", "Esta reserva já não pode ser cancelada online.", 409);
    return ok(await previewCancellation(id));
  } catch (err) {
    return fromError(err);
  }
}

/** POST: cancela no WeGest e reembolsa o valor indicado por ele. */
export async function POST(_: Request, { params }: RouteContext<"/api/rentacar/bookings/[id]/cancel">) {
  const { id } = await params;
  try {
    const own = await getOwnBooking(id);
    if (!own) return fail("not_found", "Reserva não encontrada.", 404);
    const preview = await previewCancellation(id);
    const booking = await cancelBooking(id);

    // Reembolso do valor que o WeGest considera devolvível (nunca calculado no frontend)
    const payments = [...(await paymentsRepo.findByReference(booking.id)), ...(await paymentsRepo.findByReference(booking.quote.id))];
    const paid = payments.find((p) => p.status === "paid");
    let refundStatus: string = "not_required";
    if (paid && preview.refundable > 0) {
      const refund = await refundPayment(paid.id, preview.refundable, "Cancelamento pelo cliente");
      refundStatus = refund.status;
    }
    await sendEmail(own.session.user.email, "rac.booking_cancelled", { reference: booking.reference });
    return ok({ status: booking.status, refundable: preview.refundable, refundStatus });
  } catch (err) {
    return fromError(err);
  }
}
