import type { Region } from "@/domain/region";

/**
 * Utilizador local: apenas dados técnicos de autenticação (doc §85).
 * Os dados pessoais/fiscais/carta vivem no WeGest.
 */
export interface LocalUser {
  id: string;
  authProviderId: string;
  email: string;
  createdAt: string;
}

export type CustomerType = "rentacar" | "tvde";

/** Vínculo conta do website → ficha WeGest (doc §22, §86). */
export interface UserIntegration {
  userId: string;
  wegestCustomerId: string;
  customerType: CustomerType;
  region?: Region;
  lastSyncAt?: string;
}

/**
 * Ficha do cliente normalizada a partir do WeGest.
 * Não é persistida localmente: o WeGest é a source of truth (doc §21).
 */
export interface Customer {
  id: string; // wegestCustomerId
  type: CustomerType;
  fullName: string;
  firstName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  taxId?: string; // NIF
  address?: {
    line1?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  };
  driverLicense?: {
    number?: string;
    country?: string;
    expiresAt?: string;
  };
  /** Campos adicionais que o WeGest devolva e que não tenham mapeamento dedicado. */
  extra?: Record<string, string | number | boolean | null>;
}

/** Dados enviados para criar/atualizar o cliente no WeGest. */
export interface CustomerInput {
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  taxId: string;
  addressLine1: string;
  postalCode: string;
  city: string;
  country: string;
  licenseNumber: string;
  licenseCountry: string;
  licenseExpiresAt: string;
}

export interface CustomerDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  status: "pending" | "accepted" | "rejected";
}

export interface Invoice {
  id: string;
  number: string;
  issuedAt: string;
  total: number;
  bookingReference?: string;
  /** Rota interna que faz proxy do PDF (nunca um URL público permanente). */
  downloadPath?: string;
}
