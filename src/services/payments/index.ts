import "server-only";

import type { CreatePaymentInput, Payment, PaymentGateway } from "@/domain/payment";
import type { Refund } from "@/domain/refund";
import { paymentsRepo, refundsRepo } from "@/services/store";

import { mockGateway } from "./mock-gateway";

/**
 * Seleção do fornecedor (doc §25, §100, §124). Para adicionar Stripe, Ifthenpay, Eupago, ...:
 * criar `<fornecedor>-gateway.ts` que implemente PaymentGateway e registá-lo aqui.
 */
const GATEWAYS: Record<string, PaymentGateway> = {
  mock: mockGateway,
};

export function paymentGateway(): PaymentGateway {
  const name = process.env.PAYMENT_PROVIDER ?? "mock";
  const gw = GATEWAYS[name];
  if (!gw) throw new Error(`Fornecedor de pagamentos "${name}" não implementado`);
  return gw;
}

/** Cria o pagamento e regista a transação localmente (payment_transactions). */
export async function createPayment(input: CreatePaymentInput): Promise<Payment> {
  const payment = await paymentGateway().createPayment(input);
  await paymentsRepo.save(payment);
  return payment;
}

export async function refreshPayment(paymentId: string): Promise<Payment | null> {
  const local = await paymentsRepo.get(paymentId);
  if (!local) return null;
  // A referência é nossa (cotação → reserva): o fornecedor não a atualiza
  const remote = { ...(await paymentGateway().getPayment(paymentId)), reference: local.reference };
  await paymentsRepo.save(remote);
  return remote;
}

/** Liga o pagamento à entidade criada com ele (ex.: a reserva, depois da cotação). */
export async function linkPayment(paymentId: string, reference: string): Promise<void> {
  const local = await paymentsRepo.get(paymentId);
  if (local) await paymentsRepo.save({ ...local, reference });
}

/**
 * Pagamento ainda por fazer de uma entidade (cotação da reserva, candidatura),
 * com as instruções do fornecedor. Atualiza o estado antes de responder.
 */
export async function pendingPaymentFor(reference: string): Promise<Payment | null> {
  const [latest] = (await paymentsRepo.findByReference(reference)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (!latest || latest.status !== "pending") return null;
  const current = await refreshPayment(latest.id);
  return current?.status === "pending" ? current : null;
}

/** Reembolso idempotente: não cria um segundo reembolso para o mesmo pagamento. */
export async function refundPayment(paymentId: string, amount?: number, reason?: string): Promise<Refund> {
  const existing = await refundsRepo.findByPayment(paymentId);
  if (existing) return existing;
  const refund = await paymentGateway().refundPayment(paymentId, amount, reason);
  await refundsRepo.save(refund);
  const local = await paymentsRepo.get(paymentId);
  const updated = await paymentGateway().getPayment(paymentId);
  await paymentsRepo.save(local ? { ...updated, reference: local.reference } : updated);
  return refund;
}
