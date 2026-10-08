import "server-only";

import type { TvdeApplication } from "@/domain/application";
import { sendEmail } from "@/services/email";
import { refundPayment } from "@/services/payments";
import { paymentsRepo, refundsRepo } from "@/services/store";

/**
 * Junta à candidatura (estado do WeGest) o estado do pagamento e do reembolso
 * (fornecedor de pagamentos). São estados independentes: doc §66.
 */
export async function withPayment(app: TvdeApplication): Promise<TvdeApplication> {
  const payments = await paymentsRepo.findByReference(app.id);
  const payment = payments.find((p) => p.status === "paid" || p.status === "refunded" || p.status === "partially_refunded") ?? payments[0];
  if (!payment) return app;
  const refund = await refundsRepo.findByPayment(payment.id);
  return {
    ...app,
    payment: { id: payment.id, status: payment.status, amount: payment.amount },
    refund: refund ? { id: refund.id, status: refund.status, amount: refund.amount } : undefined,
  };
}

/**
 * Reconciliação: candidatura recusada no WeGest + pagamento feito → reembolso (doc §63).
 * Corre ao ler a candidatura (substitui o webhook enquanto o WeGest não o disponibiliza).
 * É idempotente: refundPayment nunca cria dois reembolsos para o mesmo pagamento.
 */
export async function reconcileApplication(app: TvdeApplication, email?: string): Promise<TvdeApplication> {
  const enriched = await withPayment(app);
  if ((app.status === "rejected" || app.status === "cancelled") && enriched.payment?.status === "paid" && !enriched.refund) {
    await refundPayment(enriched.payment.id, undefined, `Candidatura ${app.reference} ${app.status === "rejected" ? "não aprovada" : "cancelada"}`);
    if (email) await sendEmail(email, "tvde.refund_started", { reference: app.reference });
    return withPayment(app);
  }
  return enriched;
}
