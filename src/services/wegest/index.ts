import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";

import type { ApplicationForm, TvdeApplication } from "@/domain/application";
import type { Availability } from "@/domain/availability";
import type { Booking, CancellationPreview, Coverage, Extra, RentalSearch, SelectedExtra } from "@/domain/booking";
import type { Customer, CustomerInput, CustomerType, Invoice } from "@/domain/customer";
import type { Location } from "@/domain/location";
import type { ProductType, VehicleOffer } from "@/domain/offer";
import type { Quote } from "@/domain/pricing";
import type { Region } from "@/domain/region";
import { getOffer, type Vehicle, type VehicleCategory } from "@/domain/vehicle";
import { toApiDateTime } from "@/lib/dates";

import { httpTransport } from "./http-transport";
import {
  customerInputToWg,
  mapApplication,
  mapApplicationForm,
  mapAvailability,
  mapBooking,
  mapCategory,
  mapCoverage,
  mapCustomer,
  mapExtra,
  mapInvoice,
  mapLocation,
  mapQuote,
  mapVehicle,
} from "./mappers";
import { mockTransport } from "./mock/transport";
import type { WeGestTransport } from "./transport";
import { REGION_CODE } from "./types";

export { WeGestError } from "./types";

/**
 * Serviço WeGest: a ÚNICA porta de entrada da app para dados operacionais.
 *
 * WEGEST_MODE=mock  → dados de demonstração em memória (por omissão)
 * WEGEST_MODE=http  → API real (https://api.wegest.pt/v1)
 *
 * Cache (doc §90): catálogo até 5 min (limite da própria API);
 * preço, disponibilidade, reservas e candidaturas nunca em cache.
 */
function transport(): WeGestTransport {
  return process.env.WEGEST_MODE === "http" ? httpTransport : mockTransport;
}

export const integrationMode = () => transport().mode;

const PRODUCT_CODE: Record<ProductType, "RAC" | "TVDE"> = { rentacar: "RAC", tvde: "TVDE" };

// ───────────────────────────── Catálogo (cacheável) ─────────────────────────────

export async function listLocations(region: Region, product?: ProductType): Promise<Location[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("wegest:locations");
  const raw = await transport().listLocations(REGION_CODE[region]);
  const locations = raw.map(mapLocation);
  return product ? locations.filter((l) => !l.products || l.products.includes(product)) : locations;
}

export async function listCategories(): Promise<VehicleCategory[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("wegest:categories");
  return (await transport().listCategories()).map(mapCategory);
}

export async function listVehicles(region: Region, product?: ProductType): Promise<Vehicle[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("wegest:vehicles");
  const t = transport();
  const regionCode = REGION_CODE[region];
  const [raw, categories, locations] = await Promise.all([
    t.listVehicles({ regionCode, product: product ? PRODUCT_CODE[product] : undefined }),
    t.listCategories(),
    t.listLocations(regionCode),
  ]);
  return raw.map((v) => mapVehicle(v, { categories, locations }));
}

export async function getVehicleBySlug(region: Region, slug: string): Promise<Vehicle | null> {
  const all = await listVehicles(region);
  return all.find((v) => v.slug === slug) ?? null;
}

export async function getVehicleById(region: Region, id: string): Promise<Vehicle | null> {
  const all = await listVehicles(region);
  return all.find((v) => v.id === id) ?? null;
}

export async function listExtras(region: Region): Promise<Extra[]> {
  "use cache";
  cacheLife("minutes");
  return (await transport().listExtras({ regionCode: REGION_CODE[region] })).map(mapExtra);
}

export async function listCoverages(region: Region): Promise<Coverage[]> {
  "use cache";
  cacheLife("minutes");
  return (await transport().listCoverages({ regionCode: REGION_CODE[region] })).map(mapCoverage);
}

/** "Desde X €/semana" para a homepage: calculado sobre ofertas devolvidas pela API. */
export async function getStartingPrice(region: Region, product: ProductType): Promise<number | null> {
  const vehicles = await listVehicles(region, product);
  const prices = vehicles.map((v) => getOffer(v, product)?.pricing.amount).filter((n): n is number => typeof n === "number");
  return prices.length ? Math.min(...prices) : null;
}

// ───────────────────────────── Disponibilidade (sem cache) ─────────────────────────────

export interface RentACarResult {
  vehicle: Vehicle;
  offer: VehicleOffer;
  availability: Availability;
  /** Preço total do período, devolvido pela API (cotação base, sem extras). */
  quote: Quote;
}

export async function searchRentACar(search: RentalSearch): Promise<RentACarResult[]> {
  await connection();
  const t = transport();
  const [vehicles, availability] = await Promise.all([
    listVehicles(search.region, "rentacar"),
    t.searchAvailability({
      regionCode: REGION_CODE[search.region],
      product: "RAC",
      pickupLocationId: search.pickupLocationId,
      returnLocationId: search.returnLocationId,
      pickupDatetime: toApiDateTime(search.pickupAt, search.region),
      returnDatetime: toApiDateTime(search.returnAt, search.region),
    }),
  ]);
  const results = await Promise.all(
    availability.map(async (a) => {
      const vehicle = vehicles.find((v) => v.id === a.vehicle_id);
      const offer = vehicle && getOffer(vehicle, "rentacar");
      if (!vehicle || !offer) return null;
      const quote = await t.quote({
        vehicleId: vehicle.id,
        rateId: offer.id,
        pickupLocationId: search.pickupLocationId,
        returnLocationId: search.returnLocationId,
        pickupDatetime: toApiDateTime(search.pickupAt, search.region),
        returnDatetime: toApiDateTime(search.returnAt, search.region),
        extras: [],
      });
      return { vehicle, offer, availability: mapAvailability(a), quote: mapQuote(quote) };
    }),
  );
  return results.filter((r): r is RentACarResult => r !== null);
}

export async function checkVehicleAvailability(params: {
  region: Region;
  product: ProductType;
  vehicleId: string;
  pickupLocationId: string;
  returnLocationId?: string;
  pickupAt: string;
  returnAt?: string;
}): Promise<Availability> {
  await connection();
  const res = await transport().searchAvailability({
    regionCode: REGION_CODE[params.region],
    product: PRODUCT_CODE[params.product],
    vehicleId: params.vehicleId,
    pickupLocationId: params.pickupLocationId,
    returnLocationId: params.returnLocationId,
    pickupDatetime: toApiDateTime(params.pickupAt, params.region),
    returnDatetime: params.returnAt ? toApiDateTime(params.returnAt, params.region) : undefined,
  });
  const hit = res.find((r) => r.vehicle_id === params.vehicleId);
  return hit ? mapAvailability(hit) : { status: "unavailable", checkedAt: new Date().toISOString() };
}

export async function quoteRentACar(params: {
  vehicleId: string;
  offerId: string;
  search: RentalSearch;
  extras: SelectedExtra[];
  coverageId?: string | null;
}): Promise<Quote> {
  await connection();
  const q = await transport().quote({
    vehicleId: params.vehicleId,
    rateId: params.offerId,
    pickupLocationId: params.search.pickupLocationId,
    returnLocationId: params.search.returnLocationId,
    pickupDatetime: toApiDateTime(params.search.pickupAt, params.search.region),
    returnDatetime: toApiDateTime(params.search.returnAt, params.search.region),
    extras: params.extras.map((e) => ({ extra_id: e.extraId, qty: e.quantity })),
    coverageId: params.coverageId,
  });
  return mapQuote(q);
}

// ───────────────────────────── Clientes ─────────────────────────────

export async function upsertCustomer(type: CustomerType, input: CustomerInput, existingId?: string): Promise<Customer> {
  await connection();
  const t = transport();
  const payload = customerInputToWg(input);
  if (existingId) return mapCustomer(await t.updateCustomer(existingId, payload));
  return mapCustomer(
    await t.createCustomer({ ...(payload as Required<typeof payload>), customer_type: type === "tvde" ? "TVDE" : "RAC" }),
  );
}

export async function updateCustomer(customerId: string, input: Partial<CustomerInput>): Promise<Customer> {
  await connection();
  return mapCustomer(await transport().updateCustomer(customerId, customerInputToWg(input)));
}

export async function getCustomer(customerId: string): Promise<Customer | null> {
  await connection();
  const c = await transport().getCustomer(customerId);
  return c ? mapCustomer(c) : null;
}

export async function findCustomerByEmail(email: string, type: CustomerType): Promise<Customer | null> {
  await connection();
  const c = await transport().findCustomerByEmail(email, type === "tvde" ? "TVDE" : "RAC");
  return c ? mapCustomer(c) : null;
}

// ───────────────────────────── Reservas Rent a Car ─────────────────────────────

export async function createBooking(input: {
  customerId: string;
  quoteId: string;
  vehicleId: string;
  offerId: string;
  search: RentalSearch;
  extras: SelectedExtra[];
  coverageId?: string | null;
  driver: { birthDate: string; licenseNumber: string; licenseExpiry: string; licenseCountry: string };
  message?: string;
  paymentReference: string;
  idempotencyKey: string;
}): Promise<Booking> {
  await connection();
  const b = await transport().createBooking({
    customerId: input.customerId,
    quoteId: input.quoteId,
    vehicleId: input.vehicleId,
    rateId: input.offerId,
    pickupLocationId: input.search.pickupLocationId,
    returnLocationId: input.search.returnLocationId,
    pickupDatetime: toApiDateTime(input.search.pickupAt, input.search.region),
    returnDatetime: toApiDateTime(input.search.returnAt, input.search.region),
    extras: input.extras.map((e) => ({ extra_id: e.extraId, qty: e.quantity })),
    coverageId: input.coverageId,
    driver: input.driver,
    message: input.message,
    paymentReference: input.paymentReference,
    idempotencyKey: input.idempotencyKey,
  });
  return mapBooking(b);
}

export async function getBooking(bookingId: string): Promise<Booking | null> {
  await connection();
  const b = await transport().getBooking(bookingId);
  return b ? mapBooking(b) : null;
}

export async function listCustomerBookings(customerId: string): Promise<Booking[]> {
  await connection();
  const list = await transport().listCustomerBookings(customerId);
  return list.map(mapBooking).sort((a, b) => b.pickupAt.localeCompare(a.pickupAt));
}

export async function previewCancellation(bookingId: string): Promise<CancellationPreview> {
  await connection();
  return transport().previewCancellation(bookingId);
}

export async function cancelBooking(bookingId: string): Promise<Booking> {
  await connection();
  return mapBooking(await transport().cancelBooking(bookingId));
}

export async function listCustomerInvoices(customerId: string): Promise<Invoice[]> {
  await connection();
  return (await transport().listCustomerInvoices(customerId)).map(mapInvoice);
}

// ───────────────────────────── TVDE ─────────────────────────────

export async function getApplicationForm(region: Region): Promise<ApplicationForm> {
  await connection();
  return mapApplicationForm(await transport().getApplicationForm(REGION_CODE[region]));
}

export async function createApplication(input: {
  region: Region;
  customerId: string;
  vehicleId: string;
  offerId: string;
  pickupAt: string;
  pickupLocationId: string;
  formData: Record<string, string>;
}): Promise<TvdeApplication> {
  await connection();
  return mapApplication(
    await transport().createApplication({
      customerId: input.customerId,
      vehicleId: input.vehicleId,
      rateId: input.offerId,
      pickupDatetime: toApiDateTime(input.pickupAt, input.region),
      pickupLocationId: input.pickupLocationId,
      formData: input.formData,
    }),
  );
}

export async function getApplication(applicationId: string): Promise<TvdeApplication | null> {
  await connection();
  const a = await transport().getApplication(applicationId);
  return a ? mapApplication(a) : null;
}

export async function listCustomerApplications(customerId: string): Promise<TvdeApplication[]> {
  await connection();
  const list = await transport().listCustomerApplications(customerId);
  return list.map(mapApplication).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function uploadApplicationDocument(
  applicationId: string,
  doc: { docType: string; fileName: string; mimeType: string; content: ArrayBuffer },
): Promise<TvdeApplication> {
  await connection();
  await connection();
  return mapApplication(await transport().uploadApplicationDocument(applicationId, doc));
}

export async function submitApplication(applicationId: string, paymentReference: string): Promise<TvdeApplication> {
  await connection();
  return mapApplication(await transport().submitApplication(applicationId, paymentReference));
}

export async function pingWeGest() {
  await connection();
  return transport().ping();
}
