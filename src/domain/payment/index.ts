import type { Currency } from "@/domain/pricing";
import type { Refund } from "@/domain/refund";

/** Estados de pagamento (doc §26). */
export type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export type PaymentPurpose = "rentacar_booking" | "tvde_reservation" | "tvde_deposit";

export type PaymentMethod = "card" | "mbway" | "multibanco" | "apple_pay" | "google_pay";

/**
 * O que falta o cliente fazer num pagamento pendente: pagar a referência
 * Multibanco ou aprovar o pedido MB WAY no telemóvel. Vem do fornecedor.
 */
export type PaymentInstructions =
  | { kind: "multibanco"; entity: string; reference: string; amount: number; expiresAt: string }
  | { kind: "mbway"; phone: string; expiresAt: string };

export interface Payment {
  id: string;
  provider: string;
  providerPaymentId: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  purpose: PaymentPurpose;
  method: PaymentMethod;
  /** Referência da entidade associada (quote, candidatura ou reserva). */
  reference: string;
  /** URL de redirecionamento (3DS, MB WAY, página hospedada), quando aplicável. */
  nextActionUrl?: string;
  instructions?: PaymentInstructions;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  amount: number;
  currency: Currency;
  purpose: PaymentPurpose;
  method: PaymentMethod;
  reference: string;
  customerEmail?: string;
  /**
   * Token devolvido pelos hosted fields do fornecedor.
   * O número completo do cartão e o CVV NUNCA passam pelo nosso servidor.
   */
  paymentToken?: string;
  /** Telemóvel para o pedido MB WAY. */
  phone?: string;
  idempotencyKey: string;
}

/** Abstração do fornecedor de pagamentos (doc §25, §100). */
export interface PaymentGateway {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<Payment>;
  getPayment(paymentId: string): Promise<Payment>;
  refundPayment(paymentId: string, amount?: number, reason?: string): Promise<Refund>;
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Pendente",
  processing: "Em processamento",
  paid: "Pago",
  failed: "Falhou",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
  partially_refunded: "Parcialmente reembolsado",
};
