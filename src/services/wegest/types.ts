/**
 * DTOs "crus" do WeGest.
 *
 * ATENÇÃO: a API real ainda não foi documentada. Estes formatos são HIPÓTESES
 * (snake_case, como no exemplo do doc §82). Quando o Swagger/OpenAPI chegar,
 * ajustar apenas este ficheiro + mappers.ts: o resto da app não muda.
 */
import type { Region } from "@/domain/region";

export interface WgLocation {
  location_id: string;
  location_name: string;
  region_code: "PT-CONT" | "PT-AC";
  address?: string;
  lat?: number;
  lng?: number;
  allows_pickup: boolean;
  allows_return: boolean;
  opening_hours?: string;
  services?: Array<"RAC" | "TVDE">;
}

export interface WgCategory {
  category_id: string;
  category_name: string;
  group: "PAX" | "COM";
}

export interface WgRate {
  rate_id: string;
  product: "RAC" | "TVDE";
  daily_rate?: number;
  weekly_rate?: number;
  deposit_amount?: number;
  reservation_amount?: number;
  km_limit?: number;
  extra_km_price?: number;
  min_period?: number;
  excess_amount?: number;
  fuel_policy?: string;
  cancellation_policy?: string;
  includes?: string[];
  conditions?: string[];
  required_documents?: string[];
}

export interface WgVehicle {
  vehicle_id: string;
  vehicle_name: string;
  brand: string;
  model: string;
  plate?: string;
  category_id: string;
  description?: string;
  photos: Array<{ url: string; view?: string }>;
  /** Cor da pintura (nome). Hipótese: o WeGest v1 não devolve cor. */
  paint?: string;
  fuel_type: "GASOLINA" | "DIESEL" | "HIBRIDO" | "PHEV" | "ELETRICO" | "GPL";
  transmission_type: "MANUAL" | "AUTOMATICA";
  seats?: number;
  doors?: number;
  luggage?: number;
  range_km?: number;
  features?: string[];
  region_code: "PT-CONT" | "PT-AC";
  location_ids: string[];
  rates: WgRate[];
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
}

export interface WgExtra {
  extra_id: string;
  extra_name: string;
  extra_description?: string;
  price: number;
  charge_type: "PER_DAY" | "PER_RENTAL";
  max_qty: number;
  code: string;
}

export interface WgCoverage {
  coverage_id: string;
  coverage_name: string;
  coverage_description?: string;
  price_per_day: number;
  excess_amount: number | null;
}

export interface WgQuote {
  quote_id: string;
  lines: Array<{ code: string; description: string; amount: number; type: "BASE" | "EXTRA" | "COVERAGE" | "FEE" | "TAX" | "DISCOUNT" }>;
  subtotal: number;
  tax_total: number;
  grand_total: number;
  deposit?: number;
  excess?: number | null;
  km_included_per_day?: number | null;
  valid_until?: string;
}

export interface WgCustomer {
  customer_id: string;
  customer_type: "RAC" | "TVDE";
  name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  nif?: string;
  address?: string;
  zip_code?: string;
  city?: string;
  country?: string;
  license_number?: string;
  license_country?: string;
  license_expiry?: string;
  custom_fields?: Record<string, string | number | boolean | null>;
}

export interface WgBooking {
  booking_id: string;
  booking_number: string;
  state: "PENDING" | "CONFIRMED" | "OPEN" | "CLOSED" | "CANCELLED" | "NO_SHOW" | "EXPIRED";
  region_code: "PT-CONT" | "PT-AC";
  customer_id: string;
  vehicle_id: string;
  vehicle_name: string;
  rate_id: string;
  pickup_location_id: string;
  pickup_location_name: string;
  return_location_id: string;
  return_location_name: string;
  pickup_datetime: string;
  return_datetime: string;
  extras: Array<{ extra_id: string; extra_name: string; qty: number; total: number }>;
  drivers?: string[];
  coverage_name?: string | null;
  message?: string | null;
  quote: WgQuote;
  payment_state?: string;
  can_modify: boolean;
  can_cancel: boolean;
  created_at: string;
}

export interface WgFormField {
  key: string;
  label: string;
  input_type: string;
  mandatory: boolean;
  placeholder?: string;
  hint?: string;
  choices?: Array<{ value: string; label: string }>;
  regex?: string;
  regex_message?: string;
  min?: string | number;
  max?: string | number;
  min_length?: number;
  max_length?: number;
  group?: string;
}

export interface WgDocumentType {
  doc_type: string;
  doc_label: string;
  mandatory: boolean;
  doc_description?: string;
  mime_types: string[];
  max_mb: number;
}

export interface WgApplication {
  application_id: string;
  application_number: string;
  state:
    | "DRAFT"
    | "AWAITING_PAYMENT"
    | "SUBMITTED"
    | "IN_REVIEW"
    | "PENDING_DOCS"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED";
  region_code: "PT-CONT" | "PT-AC";
  customer_id: string;
  vehicle_id: string;
  vehicle_name: string;
  rate_id: string;
  pickup_datetime: string;
  pickup_location_id: string;
  pickup_location_name: string;
  weekly_rate: number;
  deposit_amount: number;
  reservation_amount: number;
  documents: Array<{ document_id: string; doc_type: string; file_name: string; state: string; uploaded_at?: string; note?: string }>;
  requested_documents?: Array<{ doc_type: string; doc_label: string; message?: string }>;
  hold_until?: string;
  state_message?: string;
  contract_id?: string;
  created_at: string;
  updated_at: string;
}

export interface WgInvoice {
  invoice_id: string;
  invoice_number: string;
  issue_date: string;
  total: number;
  booking_number?: string;
}

export const REGION_CODE: Record<Region, WgVehicle["region_code"]> = {
  mainland: "PT-CONT",
  azores: "PT-AC",
};

/** Erro normalizado da camada de integração. */
export class WeGestError extends Error {
  constructor(
    public readonly code: "timeout" | "unavailable" | "not_found" | "validation" | "conflict" | "unauthorized" | "upstream",
    message: string,
    public readonly status?: number,
    public readonly fieldErrors?: Record<string, string>,
    public readonly wegestRequestId?: string,
  ) {
    super(message);
    this.name = "WeGestError";
  }
}
