import { z } from "zod";

import { fail, fromError, fromZod, ok } from "@/lib/api";
import { getOwnApplication } from "@/lib/ownership";
import { paymentInputSchema } from "@/lib/validation";
import { sendEmail } from "@/services/email";
import { createPayment, refundPayment } from "@/services/payments";
import { submitApplication } from "@/services/wegest";

const schema = z.object({
  payment: paymentInputSchema,
  acceptConditional: z.literal(true, { error: "Tem de aceitar a condição de aprovação." }),
  idempotencyKey: z.string().min(8),
});

/**
 * POST /api/tvde/applications/:id/payment: sinal/caução + submissão ao WeGest (doc §45–46, §65–66).
 * Pagamento concluído ≠ candidatura aprovada: a candidatura passa a "submetida" e segue para análise.
 */
export async function POST(req: Request, { params }: RouteContext<"/api/tvde/applications/[id]/payment">) {
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZod(parsed.error);

  try {
    const own = await getOwnApplication(id);
    if (!own) return fail("not_found", "Candidatura não encontrada.", 404);
    const app = own.application;
    if (app.status !== "payment_pending" && app.status !== "draft") return fail("conflict", "Esta candidatura já foi submetida.", 409);

    // Valor definido pelo WeGest (sinal ou caução): nunca pelo browser
    const amount = app.reservationAmount || app.deposit;
    const payment = await createPayment({
      amount,
      currency: "EUR",
      purpose: app.reservationAmount && app.reservationAmount < app.deposit ? "tvde_reservation" : "tvde_deposit",
      method: parsed.data.payment.method,
      reference: app.id,
      customerEmail: own.session.user.email,
      paymentToken: parsed.data.payment.token,
      idempotencyKey: parsed.data.idempotencyKey,
    });
    if (payment.status === "failed") return fail("payment_failed", "O pagamento foi recusado. Verifique os dados ou use outro método.", 402);

    try {
      const submitted = await submitApplication(app.id, payment.id);
      await sendEmail(own.session.user.email, "tvde.payment_received", { reference: submitted.reference });
      await sendEmail(own.session.user.email, "tvde.application_received", { reference: submitted.reference });
      return ok({ status: submitted.status, paymentStatus: payment.status });
    } catch (err) {
      if (payment.status === "paid") await refundPayment(payment.id, undefined, "Falha ao submeter a candidatura");
      throw err;
    }
  } catch (err) {
    return fromError(err);
  }
}
