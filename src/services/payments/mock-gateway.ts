import "server-only";

import type { CreatePaymentInput, Payment, PaymentGateway, PaymentInstructions } from "@/domain/payment";
import type { Refund } from "@/domain/refund";

/**
 * Gateway de demonstração. Simula aprovação/recusa sem dinheiro real.
 * Token "tok_fail" → pagamento recusado (cartão de teste 4000 0000 0000 0002 na UI).
 * Multibanco e MB WAY ficam pendentes e confirmam-se sozinhos ao fim de
 * PENDING_MS (simula o webhook). Entidade e referência são de demonstração.
 */
const PENDING_MS = { multibanco: 120_000, mbway: 30_000 } as const;

function instructionsFor(input: CreatePaymentInput, now: Date): PaymentInstructions | undefined {
  if (input.method === "multibanco") {
    const digits = String(Math.floor(Math.random() * 1e9)).padStart(9, "0");
    return {
      kind: "multibanco",
      entity: "12345",
      reference: digits.replace(/(\d{3})(?=\d)/g, "$1 "),
      amount: input.amount,
      expiresAt: new Date(now.getTime() + 3 * 86_400_000).toISOString(),
    };
  }
  if (input.method === "mbway") {
    return { kind: "mbway", phone: input.phone ?? "", expiresAt: new Date(now.getTime() + 4 * 60_000).toISOString() };
  }
  return undefined;
}
const g = globalThis as unknown as { __mockPayments?: Map<string, Payment> };
const store = () => (g.__mockPayments ??= new Map<string, Payment>());

export const mockGateway: PaymentGateway = {
  name: "mock",

  async createPayment(input: CreatePaymentInput): Promise<Payment> {
    const existing = [...store().values()].find((p) => p.providerPaymentId === `mock_${input.idempotencyKey}`);
    if (existing) return existing;
    await new Promise((r) => setTimeout(r, 600));
    const date = new Date();
    const now = date.toISOString();
    const pending = input.method === "mbway" || input.method === "multibanco";
    const payment: Payment = {
      id: `pay_${crypto.randomUUID().slice(0, 12)}`,
      provider: "mock",
      providerPaymentId: `mock_${input.idempotencyKey}`,
      status: input.paymentToken === "tok_fail" ? "failed" : pending ? "pending" : "paid",
      amount: input.amount,
      currency: input.currency,
      purpose: input.purpose,
      method: input.method,
      reference: input.reference,
      instructions: pending ? instructionsFor(input, date) : undefined,
      createdAt: now,
      updatedAt: now,
    };
    store().set(payment.id, payment);
    return payment;
  },

  async getPayment(paymentId: string): Promise<Payment> {
    const p = store().get(paymentId);
    if (!p) throw new Error("Pagamento não encontrado");
    // MB WAY / Multibanco: simula a confirmação assíncrona (webhook) após alguns segundos
    const wait = p.method === "multibanco" || p.method === "mbway" ? PENDING_MS[p.method] : 4000;
    if (p.status === "pending" && Date.now() - new Date(p.createdAt).getTime() > wait) {
      const updated = { ...p, status: "paid" as const, updatedAt: new Date().toISOString() };
      store().set(p.id, updated);
      return updated;
    }
    return p;
  },

  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<Refund> {
    const p = store().get(paymentId);
    if (!p) throw new Error("Pagamento não encontrado");
    const value = amount ?? p.amount;
    const now = new Date().toISOString();
    store().set(p.id, { ...p, status: value < p.amount ? "partially_refunded" : "refunded", updatedAt: now });
    return {
      id: `ref_${crypto.randomUUID().slice(0, 12)}`,
      paymentId,
      providerRefundId: `mock_ref_${paymentId}`,
      status: "processing",
      amount: value,
      currency: p.currency,
      reason,
      createdAt: now,
      updatedAt: now,
    };
  },
};
