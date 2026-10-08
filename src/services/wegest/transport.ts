import type {
  WgApplication,
  WgBooking,
  WgCategory,
  WgCoverage,
  WgCustomer,
  WgDocumentType,
  WgExtra,
  WgFormField,
  WgInvoice,
  WgLocation,
  WgQuote,
  WgVehicle,
} from "./types";

/**
 * Contrato de baixo nível com o WeGest (formato cru).
 * Implementações: MockTransport (desenvolvimento/demo) e HttpTransport (API real).
 */
export interface WeGestTransport {
  readonly mode: "mock" | "http";

  listLocations(regionCode: string): Promise<WgLocation[]>;
  listCategories(): Promise<WgCategory[]>;
  listVehicles(params: { regionCode: string; product?: "RAC" | "TVDE" }): Promise<WgVehicle[]>;
  getVehicle(vehicleId: string): Promise<WgVehicle | null>;

  /** Disponibilidade Rent a Car para um período: devolve ids disponíveis. */
  searchAvailability(params: {
    regionCode: string;
    product: "RAC" | "TVDE";
    pickupLocationId: string;
    returnLocationId?: string;
    pickupDatetime: string;
    returnDatetime?: string;
    vehicleId?: string;
  }): Promise<Array<{ vehicle_id: string; status: "AVAILABLE" | "LIMITED" | "UNAVAILABLE"; next_available?: string }>>;

  listExtras(params: { regionCode: string; vehicleId?: string }): Promise<WgExtra[]>;
  listCoverages(params: { regionCode: string }): Promise<WgCoverage[]>;

  quote(params: {
    vehicleId: string;
    rateId: string;
    pickupLocationId: string;
    returnLocationId: string;
    pickupDatetime: string;
    returnDatetime: string;
    extras: Array<{ extra_id: string; qty: number }>;
    coverageId?: string | null;
  }): Promise<WgQuote>;

  createCustomer(input: Omit<WgCustomer, "customer_id">): Promise<WgCustomer>;
  updateCustomer(customerId: string, input: Partial<WgCustomer>): Promise<WgCustomer>;
  getCustomer(customerId: string): Promise<WgCustomer | null>;
  findCustomerByEmail(email: string, type: "RAC" | "TVDE"): Promise<WgCustomer | null>;

  createBooking(input: {
    customerId: string;
    quoteId: string;
    vehicleId: string;
    rateId: string;
    pickupLocationId: string;
    returnLocationId: string;
    pickupDatetime: string;
    returnDatetime: string;
    extras: Array<{ extra_id: string; qty: number }>;
    coverageId?: string | null;
    driver: { birthDate: string; licenseNumber: string; licenseExpiry: string; licenseCountry: string };
    message?: string;
    paymentReference: string;
    idempotencyKey: string;
  }): Promise<WgBooking>;
  getBooking(bookingId: string): Promise<WgBooking | null>;
  listCustomerBookings(customerId: string): Promise<WgBooking[]>;
  previewCancellation(bookingId: string): Promise<{ paid: number; refundable: number; fee: number; policy: string }>;
  cancelBooking(bookingId: string): Promise<WgBooking>;
  listCustomerInvoices(customerId: string): Promise<WgInvoice[]>;

  getApplicationForm(regionCode: string): Promise<{ version: string; fields: WgFormField[]; documents: WgDocumentType[] }>;
  createApplication(input: {
    customerId: string;
    vehicleId: string;
    rateId: string;
    pickupDatetime: string;
    pickupLocationId: string;
    formData: Record<string, string>;
  }): Promise<WgApplication>;
  getApplication(applicationId: string): Promise<WgApplication | null>;
  listCustomerApplications(customerId: string): Promise<WgApplication[]>;
  uploadApplicationDocument(
    applicationId: string,
    doc: { docType: string; fileName: string; mimeType: string; content: ArrayBuffer },
  ): Promise<WgApplication>;
  /** Marca o sinal/caução como pago e submete a candidatura para análise. */
  submitApplication(applicationId: string, paymentReference: string): Promise<WgApplication>;

  ping(): Promise<{ ok: boolean; latencyMs: number }>;
}
