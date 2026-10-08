export type AvailabilityStatus = "available" | "limited" | "unavailable" | "on_request";

export interface Availability {
  status: AvailabilityStatus;
  /** Próxima data disponível (ISO), quando indisponível. */
  nextAvailableAt?: string;
  /** Momento da consulta: disponibilidade nunca é assumida como permanente (doc §89). */
  checkedAt: string;
}

/** Hold temporário de uma viatura durante o checkout/candidatura (doc §67). */
export interface TemporaryHold {
  id: string;
  vehicleId: string;
  offerId: string;
  expiresAt: string;
}

export const AVAILABILITY_LABEL: Record<AvailabilityStatus, string> = {
  available: "Disponível",
  limited: "Últimas unidades",
  unavailable: "Indisponível",
  on_request: "Sob consulta",
};
