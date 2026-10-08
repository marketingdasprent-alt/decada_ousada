import type { PaymentStatus } from "@/domain/payment";
import type { Quote } from "@/domain/pricing";
import type { Region } from "@/domain/region";

export interface Extra {
  id: string;
  name: string;
  description?: string;
  /** Preço por unidade de cobrança. */
  price: number;
  chargeUnit: "day" | "booking";
  /** Quantidade máxima por reserva (1 = apenas ligar/desligar). */
  maxQuantity: number;
  icon?: "baby" | "child" | "driver" | "gps" | "wifi" | "shield" | "km" | "clock";
}

/** Cobertura de seguro (WeGest: /coberturas). A franquia substitui a do modelo. */
export interface Coverage {
  id: string;
  name: string;
  description?: string;
  pricePerDay: number;
  /** null = franquia standard do modelo */
  excess: number | null;
}

export interface SelectedExtra {
  extraId: string;
  quantity: number;
}

export interface RentalSearch {
  pickupLocationId: string;
  returnLocationId: string;
  /** ISO local "2026-10-12T10:00" */
  pickupAt: string;
  returnAt: string;
  region: Region;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show"
  | "expired";

export interface Booking {
  id: string;
  /** Referência pública, ex.: DO-28471 */
  reference: string;
  status: BookingStatus;
  region: Region;
  customerId: string;
  vehicleId: string;
  vehicleName: string;
  offerId: string;
  pickupLocation: { id: string; name: string };
  returnLocation: { id: string; name: string };
  pickupAt: string;
  returnAt: string;
  extras: Array<SelectedExtra & { name: string; total: number }>;
  drivers?: string[];
  coverageName?: string;
  message?: string;
  quote: Quote;
  paymentStatus?: PaymentStatus;
  canModify: boolean;
  canCancel: boolean;
  createdAt: string;
}

export interface CancellationPreview {
  paid: number;
  refundable: number;
  fee: number;
  policy: string;
}

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Aguarda confirmação",
  confirmed: "Confirmada",
  in_progress: "A decorrer",
  completed: "Concluída",
  cancelled: "Cancelada",
  no_show: "Não comparência",
  expired: "Expirada",
};
