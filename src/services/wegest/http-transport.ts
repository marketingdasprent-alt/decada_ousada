import "server-only";

import { wegestRequest } from "./client";
import type { WeGestTransport } from "./transport";
import { WeGestError, type WgApplication, type WgBooking, type WgCustomer, type WgVehicle } from "./types";

/**
 * Implementação HTTP do WeGest.
 *
 * TODO(WeGest): TODOS os caminhos abaixo são provisórios: confirmar com o Swagger/OpenAPI.
 * Ver lista de perguntas em docs/perguntas-wegest.md.
 */
const orNull = async <T,>(p: Promise<T>): Promise<T | null> => {
  try {
    return await p;
  } catch (e) {
    if (e instanceof WeGestError && e.code === "not_found") return null;
    throw e;
  }
};

export const httpTransport: WeGestTransport = {
  mode: "http",

  listLocations: (regionCode) => wegestRequest("/locations", { query: { region: regionCode } }),
  listCategories: () => wegestRequest("/categories"),
  listVehicles: ({ regionCode, product }) => wegestRequest("/vehicles", { query: { region: regionCode, product } }),
  getVehicle: (id) => orNull(wegestRequest<WgVehicle>(`/vehicles/${encodeURIComponent(id)}`)),

  searchAvailability: (p) =>
    wegestRequest("/availability", {
      query: {
        region: p.regionCode,
        product: p.product,
        pickup_location: p.pickupLocationId,
        return_location: p.returnLocationId,
        pickup: p.pickupDatetime,
        return: p.returnDatetime,
        vehicle_id: p.vehicleId,
      },
    }),

  listExtras: ({ regionCode, vehicleId }) => wegestRequest("/extras", { query: { region: regionCode, vehicle_id: vehicleId } }),

  listCoverages: ({ regionCode }) => wegestRequest("/coberturas", { query: { region: regionCode } }),

  quote: (p) =>
    wegestRequest("/quotes", {
      method: "POST",
      retry: true,
      body: {
        vehicle_id: p.vehicleId,
        rate_id: p.rateId,
        pickup_location_id: p.pickupLocationId,
        return_location_id: p.returnLocationId,
        pickup_datetime: p.pickupDatetime,
        return_datetime: p.returnDatetime,
        extras: p.extras,
        cobertura_id: p.coverageId ?? null,
      },
    }),

  createCustomer: (input) => wegestRequest("/customers", { method: "POST", body: input }),
  updateCustomer: (id, input) => wegestRequest(`/customers/${encodeURIComponent(id)}`, { method: "PATCH", body: input }),
  getCustomer: (id) => orNull(wegestRequest<WgCustomer>(`/customers/${encodeURIComponent(id)}`)),
  findCustomerByEmail: async (email, type) => {
    const list = await wegestRequest<WgCustomer[]>("/customers", { query: { email, type } });
    return list[0] ?? null;
  },

  createBooking: (input) =>
    wegestRequest("/bookings", {
      method: "POST",
      idempotencyKey: input.idempotencyKey,
      retry: true,
      body: {
        customer_id: input.customerId,
        quote_id: input.quoteId,
        vehicle_id: input.vehicleId,
        rate_id: input.rateId,
        pickup_location_id: input.pickupLocationId,
        return_location_id: input.returnLocationId,
        pickup_datetime: input.pickupDatetime,
        return_datetime: input.returnDatetime,
        extras: input.extras,
        cobertura_id: input.coverageId ?? null,
        driver: input.driver,
        mensagem: input.message ?? null,
        payment_reference: input.paymentReference,
      },
    }),
  getBooking: (id) => orNull(wegestRequest<WgBooking>(`/bookings/${encodeURIComponent(id)}`)),
  listCustomerBookings: (customerId) => wegestRequest(`/customers/${encodeURIComponent(customerId)}/bookings`),
  previewCancellation: (id) => wegestRequest(`/bookings/${encodeURIComponent(id)}/cancellation-preview`),
  cancelBooking: (id) => wegestRequest(`/bookings/${encodeURIComponent(id)}/cancel`, { method: "POST" }),
  listCustomerInvoices: (customerId) => wegestRequest(`/customers/${encodeURIComponent(customerId)}/invoices`),

  getApplicationForm: (regionCode) => wegestRequest("/tvde/application-form", { query: { region: regionCode } }),
  createApplication: (input) =>
    wegestRequest("/tvde/applications", {
      method: "POST",
      body: {
        customer_id: input.customerId,
        vehicle_id: input.vehicleId,
        rate_id: input.rateId,
        pickup_datetime: input.pickupDatetime,
        pickup_location_id: input.pickupLocationId,
        form_data: input.formData,
      },
    }),
  getApplication: (id) => orNull(wegestRequest<WgApplication>(`/tvde/applications/${encodeURIComponent(id)}`)),
  listCustomerApplications: (customerId) => wegestRequest(`/tvde/applications`, { query: { customer_id: customerId } }),
  uploadApplicationDocument: (id, doc) => {
    const form = new FormData();
    form.set("doc_type", doc.docType);
    form.set("file", new Blob([doc.content], { type: doc.mimeType }), doc.fileName);
    return wegestRequest(`/tvde/applications/${encodeURIComponent(id)}/documents`, { method: "POST", form });
  },
  submitApplication: (id, paymentReference) =>
    wegestRequest(`/tvde/applications/${encodeURIComponent(id)}/submit`, { method: "POST", body: { payment_reference: paymentReference } }),

  ping: async () => {
    const t = performance.now();
    try {
      await wegestRequest("/health");
      return { ok: true, latencyMs: Math.round(performance.now() - t) };
    } catch {
      return { ok: false, latencyMs: Math.round(performance.now() - t) };
    }
  },
};
