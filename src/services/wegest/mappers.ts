/**
 * Normalização WeGest → modelo interno (doc §82).
 * O frontend depende APENAS dos tipos de @/domain. Quando a API real entrar,
 * só este ficheiro (e types.ts) precisa de acompanhar o formato do WeGest.
 */
import type { ApplicationForm, ApplicationStatus, FormField, FormFieldType, TvdeApplication } from "@/domain/application";
import type { Availability, AvailabilityStatus } from "@/domain/availability";
import type { Booking, BookingStatus, Coverage, Extra } from "@/domain/booking";
import type { Customer, CustomerInput, Invoice } from "@/domain/customer";
import type { Location } from "@/domain/location";
import type { VehicleOffer } from "@/domain/offer";
import type { PaymentStatus } from "@/domain/payment";
import type { PriceLine, Quote } from "@/domain/pricing";
import type { Region } from "@/domain/region";
import type { FuelType, Vehicle, VehicleBody, VehicleCategory, VehicleImage } from "@/domain/vehicle";
import { slugify } from "@/lib/slug";
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
  WgRate,
  WgVehicle,
} from "./types";

export const regionFromCode = (code: WgVehicle["region_code"]): Region => (code === "PT-AC" ? "azores" : "mainland");

export function mapLocation(l: WgLocation): Location {
  return {
    id: l.location_id,
    slug: slugify(l.location_name),
    name: l.location_name,
    region: regionFromCode(l.region_code),
    address: l.address,
    latitude: l.lat,
    longitude: l.lng,
    pickupAvailable: l.allows_pickup,
    returnAvailable: l.allows_return,
    openingHours: l.opening_hours,
    products: l.services?.map((s) => (s === "TVDE" ? "tvde" : "rentacar")),
  };
}

export function mapCategory(c: WgCategory): VehicleCategory {
  return { id: c.category_id, slug: slugify(c.category_name), name: c.category_name, family: c.group === "COM" ? "commercial" : "passenger" };
}

const FUEL: Record<WgVehicle["fuel_type"], FuelType> = {
  GASOLINA: "petrol",
  DIESEL: "diesel",
  HIBRIDO: "hybrid",
  PHEV: "plugin_hybrid",
  ELETRICO: "electric",
  GPL: "lpg",
};

/** Carroçaria a partir da categoria (WeGest real: Modelo.tipo e categoria.nome). */
export function bodyFromCategory(cat: WgCategory | undefined): VehicleBody {
  if (!cat) return "sedan";
  if (cat.group === "COM") return "van";
  return /suv|7 lugares|monovolume|familiar/i.test(cat.category_name) ? "suv" : "sedan";
}

const STOCK_PHOTO_HOSTS = ["https://images.unsplash.com/", "/demo/"];

function mapImages(v: WgVehicle, cat: WgCategory | undefined): VehicleImage[] {
  const photos = v.photos.filter((p) => !p.url.startsWith("placeholder:"));
  if (photos.length) {
    return photos.map((p, i) => ({
      url: p.url,
      alt: `${v.vehicle_name}${i === 0 ? "" : `, imagem ${i + 1}`}`,
      // Fotografias de banco de imagens (dados de demonstração): o modelo é o mesmo, a viatura não
      illustrative: STOCK_PHOTO_HOSTS.some((h) => p.url.startsWith(h)),
    }));
  }
  // Sem fotografia: uma só ilustração (nada de galeria de ângulos inventados)
  return [{ url: "", alt: v.vehicle_name, placeholder: { paint: v.paint ?? "default", body: bodyFromCategory(cat) } }];
}

function mapOffer(v: WgVehicle, r: WgRate): VehicleOffer {
  const isTvde = r.product === "TVDE";
  return {
    id: r.rate_id,
    vehicleId: v.vehicle_id,
    type: isTvde ? "tvde" : "rentacar",
    region: regionFromCode(v.region_code),
    pricing: {
      unit: isTvde ? "week" : "day",
      // Nunca derivar semana = dia × 7: cada oferta tem o seu valor (doc §43)
      amount: (isTvde ? r.weekly_rate : r.daily_rate) ?? 0,
      currency: "EUR",
      deposit: r.deposit_amount,
      reservationAmount: isTvde ? (r.reservation_amount ?? r.deposit_amount) : undefined,
    },
    deposit: r.deposit_amount,
    mileageLimit: r.km_limit,
    mileagePeriod: r.km_limit === undefined ? undefined : isTvde ? "month" : "day",
    extraKmPrice: r.extra_km_price,
    minimumPeriod: r.min_period,
    excess: r.excess_amount,
    fuelPolicy: r.fuel_policy,
    cancellationPolicy: r.cancellation_policy,
    includes: r.includes,
    terms: r.conditions,
    requiredDocuments: r.required_documents,
  };
}

export function vehicleSlug(v: Pick<WgVehicle, "vehicle_id" | "vehicle_name">): string {
  const suffix = slugify(v.vehicle_id).split("-").pop();
  return `${slugify(v.vehicle_name)}-${suffix}`;
}

export function mapVehicle(v: WgVehicle, ctx: { categories: WgCategory[]; locations?: WgLocation[] }): Vehicle {
  const cat = ctx.categories.find((c) => c.category_id === v.category_id);
  return {
    id: v.vehicle_id,
    slug: vehicleSlug(v),
    brand: v.brand,
    model: v.model,
    name: v.vehicle_name,
    description: v.description,
    images: mapImages(v, cat),
    category: cat ? mapCategory(cat) : undefined,
    fuel: FUEL[v.fuel_type],
    transmission: v.transmission_type === "AUTOMATICA" ? "automatic" : "manual",
    seats: v.seats,
    doors: v.doors,
    luggage: v.luggage,
    range: v.range_km,
    features: v.features,
    region: regionFromCode(v.region_code),
    locations: ctx.locations?.filter((l) => v.location_ids.includes(l.location_id)).map(mapLocation),
    offers: v.rates.map((r) => mapOffer(v, r)),
  };
}

const AVAIL: Record<"AVAILABLE" | "LIMITED" | "UNAVAILABLE", AvailabilityStatus> = {
  AVAILABLE: "available",
  LIMITED: "limited",
  UNAVAILABLE: "unavailable",
};

export function mapAvailability(a: { status: "AVAILABLE" | "LIMITED" | "UNAVAILABLE"; next_available?: string }): Availability {
  return { status: AVAIL[a.status], nextAvailableAt: a.next_available, checkedAt: new Date().toISOString() };
}

export function mapExtra(e: WgExtra): Extra {
  return {
    id: e.extra_id,
    name: e.extra_name,
    description: e.extra_description,
    price: e.price,
    chargeUnit: e.charge_type === "PER_DAY" ? "day" : "booking",
    maxQuantity: e.max_qty,
    icon: e.code as Extra["icon"],
  };
}

export function mapCoverage(c: WgCoverage): Coverage {
  return { id: c.coverage_id, name: c.coverage_name, description: c.coverage_description, pricePerDay: c.price_per_day, excess: c.excess_amount };
}

const LINE_KIND: Record<WgQuote["lines"][number]["type"], PriceLine["kind"]> = {
  BASE: "base",
  EXTRA: "extra",
  COVERAGE: "coverage",
  FEE: "fee",
  TAX: "tax",
  DISCOUNT: "discount",
};

export function mapQuote(q: WgQuote): Quote {
  return {
    id: q.quote_id,
    currency: "EUR",
    lines: q.lines.map((l) => ({ id: l.code, label: l.description, amount: l.amount, kind: LINE_KIND[l.type] })),
    subtotal: q.subtotal,
    taxes: q.tax_total,
    total: q.grand_total,
    deposit: q.deposit,
    excess: q.excess,
    kmIncludedPerDay: q.km_included_per_day,
    expiresAt: q.valid_until,
  };
}

export function mapCustomer(c: WgCustomer): Customer {
  return {
    id: c.customer_id,
    type: c.customer_type === "TVDE" ? "tvde" : "rentacar",
    fullName: c.name,
    firstName: c.name.split(" ")[0] ?? c.name,
    email: c.email,
    phone: c.phone,
    birthDate: c.birth_date,
    taxId: c.nif,
    address: { line1: c.address, postalCode: c.zip_code, city: c.city, country: c.country },
    driverLicense: { number: c.license_number, country: c.license_country, expiresAt: c.license_expiry },
    extra: c.custom_fields,
  };
}

export function customerInputToWg(input: Partial<CustomerInput>): Partial<WgCustomer> {
  const out: Partial<WgCustomer> = {
    name: input.fullName,
    email: input.email,
    phone: input.phone,
    birth_date: input.birthDate,
    nif: input.taxId,
    address: input.addressLine1,
    zip_code: input.postalCode,
    city: input.city,
    country: input.country,
    license_number: input.licenseNumber,
    license_country: input.licenseCountry,
    license_expiry: input.licenseExpiresAt,
  };
  return Object.fromEntries(Object.entries(out).filter(([, v]) => v !== undefined));
}

const BOOKING_STATUS: Record<WgBooking["state"], BookingStatus> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  OPEN: "in_progress",
  CLOSED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
  EXPIRED: "expired",
};

const PAYMENT_STATE: Record<string, PaymentStatus> = {
  PAID: "paid",
  PENDING: "pending",
  REFUND_PENDING: "paid",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially_refunded",
};

export function mapBooking(b: WgBooking): Booking {
  return {
    id: b.booking_id,
    reference: b.booking_number,
    status: BOOKING_STATUS[b.state],
    region: regionFromCode(b.region_code),
    customerId: b.customer_id,
    vehicleId: b.vehicle_id,
    vehicleName: b.vehicle_name,
    offerId: b.rate_id,
    pickupLocation: { id: b.pickup_location_id, name: b.pickup_location_name },
    returnLocation: { id: b.return_location_id, name: b.return_location_name },
    pickupAt: b.pickup_datetime,
    returnAt: b.return_datetime,
    extras: b.extras.map((e) => ({ extraId: e.extra_id, name: e.extra_name, quantity: e.qty, total: e.total })),
    drivers: b.drivers,
    coverageName: b.coverage_name ?? undefined,
    message: b.message ?? undefined,
    quote: mapQuote(b.quote),
    paymentStatus: b.payment_state ? PAYMENT_STATE[b.payment_state] : undefined,
    canModify: b.can_modify,
    canCancel: b.can_cancel,
    createdAt: b.created_at,
  };
}

export function mapInvoice(i: WgInvoice): Invoice {
  return { id: i.invoice_id, number: i.invoice_number, issuedAt: i.issue_date, total: i.total, bookingReference: i.booking_number, downloadPath: `/api/invoices/${encodeURIComponent(i.invoice_id)}` };
}

const FIELD_TYPES: FormFieldType[] = ["text", "email", "tel", "date", "number", "select", "radio", "checkbox", "textarea", "file"];

export function mapFormField(f: WgFormField): FormField {
  const type = (FIELD_TYPES as string[]).includes(f.input_type) ? (f.input_type as FormFieldType) : "text";
  return {
    field: f.key,
    label: f.label,
    type,
    required: f.mandatory,
    placeholder: f.placeholder,
    help: f.hint,
    options: f.choices,
    validation: {
      pattern: f.regex,
      patternMessage: f.regex_message,
      min: f.min,
      max: f.max,
      minLength: f.min_length,
      maxLength: f.max_length,
    },
    section: f.group,
  };
}

export function mapApplicationForm(raw: { version: string; fields: WgFormField[]; documents: WgDocumentType[] }): ApplicationForm {
  return {
    version: raw.version,
    fields: raw.fields.map(mapFormField),
    documents: raw.documents.map((d) => ({
      type: d.doc_type,
      label: d.doc_label,
      required: d.mandatory,
      description: d.doc_description,
      accept: d.mime_types,
      maxSizeMb: d.max_mb,
    })),
  };
}

const APP_STATUS: Record<WgApplication["state"], ApplicationStatus> = {
  DRAFT: "draft",
  AWAITING_PAYMENT: "payment_pending",
  SUBMITTED: "submitted",
  IN_REVIEW: "under_review",
  PENDING_DOCS: "additional_documents_required",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
};

const DOC_STATE: Record<string, TvdeApplication["documents"][number]["status"]> = {
  UPLOADED: "uploaded",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  REQUESTED: "requested",
};

export function mapApplication(a: WgApplication): TvdeApplication {
  return {
    id: a.application_id,
    reference: a.application_number,
    region: regionFromCode(a.region_code),
    status: APP_STATUS[a.state],
    customerId: a.customer_id,
    vehicleId: a.vehicle_id,
    vehicleName: a.vehicle_name,
    offerId: a.rate_id,
    pickupAt: a.pickup_datetime,
    pickupLocation: { id: a.pickup_location_id, name: a.pickup_location_name },
    weeklyPrice: a.weekly_rate,
    deposit: a.deposit_amount,
    reservationAmount: a.reservation_amount,
    documents: a.documents.map((d) => ({
      id: d.document_id,
      type: d.doc_type,
      fileName: d.file_name,
      status: DOC_STATE[d.state] ?? "uploaded",
      uploadedAt: d.uploaded_at,
      note: d.note,
    })),
    requestedDocuments: a.requested_documents?.map((r) => ({ type: r.doc_type, label: r.doc_label, message: r.message })),
    contract: a.contract_id ? { id: a.contract_id, available: true } : undefined,
    holdExpiresAt: a.hold_until,
    statusMessage: a.state_message,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
  };
}
