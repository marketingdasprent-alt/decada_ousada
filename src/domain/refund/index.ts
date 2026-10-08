import type { Currency } from "@/domain/pricing";

/** Estados do reembolso (doc §64). */
export type RefundStatus = "not_required" | "pending" | "processing" | "completed" | "failed";

export interface Refund {
  id: string;
  paymentId: string;
  providerRefundId?: string;
  status: RefundStatus;
  amount: number;
  currency: Currency;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export const REFUND_STATUS_LABEL: Record<RefundStatus, string> = {
  not_required: "Não aplicável",
  pending: "Pendente",
  processing: "Em processamento",
  completed: "Concluído",
  failed: "Falhou",
};
