import type { PaymentStatus } from "@/domain/payment";
import type { RefundStatus } from "@/domain/refund";
import type { Region } from "@/domain/region";

/**
 * Estado da candidatura TVDE, normalizado a partir do WeGest (doc §58).
 * IMPORTANTE: é independente do estado do pagamento (doc §66).
 */
export type ApplicationStatus =
  | "draft"
  | "payment_pending"
  | "submitted"
  | "under_review"
  | "additional_documents_required"
  | "approved"
  | "rejected"
  | "cancelled";

/** Campo do formulário dinâmico, fornecido pela API (doc §51–52). */
export type FormFieldType =
  | "text"
  | "email"
  | "tel"
  | "date"
  | "number"
  | "select"
  | "radio"
  | "checkbox"
  | "textarea"
  | "file";

export interface FormField {
  field: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  help?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    pattern?: string;
    patternMessage?: string;
    minLength?: number;
    maxLength?: number;
    min?: string | number;
    max?: string | number;
  };
  /** Para type=file */
  accept?: string[];
  maxSizeMb?: number;
  /** Agrupamento visual opcional */
  section?: string;
}

export interface ApplicationForm {
  version: string;
  fields: FormField[];
  /** Documentos obrigatórios a enviar depois do cadastro. */
  documents: DocumentRequirement[];
}

export interface DocumentRequirement {
  type: string;
  label: string;
  required: boolean;
  description?: string;
  accept: string[];
  maxSizeMb: number;
}

export interface ApplicationDocument {
  id: string;
  type: string;
  fileName: string;
  status: "uploaded" | "accepted" | "rejected" | "requested";
  uploadedAt?: string;
  note?: string;
}

export interface TvdeApplication {
  id: string;
  reference: string;
  region: Region;
  status: ApplicationStatus;
  customerId: string;
  vehicleId: string;
  vehicleName: string;
  offerId: string;
  pickupAt: string;
  pickupLocation: { id: string; name: string };
  weeklyPrice: number;
  deposit: number;
  reservationAmount: number;
  documents: ApplicationDocument[];
  /** Pedido de documentação adicional vindo do WeGest. */
  requestedDocuments?: Array<{ type: string; label: string; message?: string }>;
  payment?: { id: string; status: PaymentStatus; amount: number };
  refund?: { id: string; status: RefundStatus; amount: number };
  contract?: { id: string; available: boolean };
  holdExpiresAt?: string;
  statusMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  draft: "Rascunho",
  payment_pending: "Pagamento pendente",
  submitted: "Submetida",
  under_review: "Em análise",
  additional_documents_required: "Documentação adicional",
  approved: "Aprovada",
  rejected: "Não aprovada",
  cancelled: "Cancelada",
};

export const ACCEPTED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
