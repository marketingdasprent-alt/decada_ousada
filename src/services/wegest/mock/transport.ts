import "server-only";

import type { WeGestTransport } from "../transport";
import {
  WeGestError,
  type WgApplication,
  type WgBooking,
  type WgCustomer,
  type WgInvoice,
  type WgQuote,
} from "../types";
import {
  MOCK_APPLICATION_FORM,
  MOCK_CATEGORIES,
  MOCK_COVERAGES,
  MOCK_EXTRAS,
  MOCK_LOCATIONS,
  MOCK_VEHICLES,
} from "./data";

/**
 * Simulação em memória do WeGest: permite desenvolver e demonstrar
 * todos os fluxos antes de existir acesso à API real.
 * O estado vive em globalThis para sobreviver ao HMR em desenvolvimento.
 */
interface MockState {
  customers: Map<string, WgCustomer>;
  bookings: Map<string, WgBooking>;
  applications: Map<string, WgApplication>;
  quotes: Map<string, WgQuote & { _params: QuoteParams }>;
  invoices: Map<string, WgInvoice[]>;
  idempotency: Map<string, string>;
  seq: number;
}

type QuoteParams = Parameters<WeGestTransport["quote"]>[0];

const g = globalThis as unknown as { __wegestMock?: MockState };

function state(): MockState {
  if (!g.__wegestMock) g.__wegestMock = seed();
  return g.__wegestMock;
}

const VAT: Record<string, number> = { "PT-CONT": 0.23, "PT-AC": 0.16 };
const LATENCY_MS = Number(process.env.WEGEST_MOCK_LATENCY_MS ?? 120);

const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS));
const clone = <T,>(v: T): T => structuredClone(v);
const round2 = (n: number) => Math.round(n * 100) / 100;

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function nextId(prefix: string): string {
  const s = state();
  s.seq += 1;
  return `${prefix}-${s.seq}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Dias faturados como na API real: blocos de 24 h no relógio local,
 * arredondados para cima. Uma mudança de hora não acrescenta um dia.
 */
function rentalDays(pickup: string, ret: string): number {
  const wallClock = (v: string) => new Date(`${v.slice(0, 16)}:00Z`).getTime();
  const ms = wallClock(ret) - wallClock(pickup);
  return Math.max(1, Math.ceil(ms / 86_400_000));
}

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);
}

function availabilityFor(vehicleId: string, product: "RAC" | "TVDE", pickup: string, ret?: string) {
  const s = state();
  const end = ret ?? new Date(new Date(pickup).getTime() + 28 * 86_400_000).toISOString();
  const blockedByBooking = [...s.bookings.values()].some(
    (b) => b.vehicle_id === vehicleId && b.state !== "CANCELLED" && overlaps(b.pickup_datetime, b.return_datetime, pickup, end),
  );
  const blockedByApplication = [...s.applications.values()].some(
    (a) =>
      a.vehicle_id === vehicleId &&
      !["REJECTED", "CANCELLED", "DRAFT"].includes(a.state) &&
      new Date(a.pickup_datetime) <= new Date(end),
  );
  if (blockedByBooking || blockedByApplication) {
    return { status: "UNAVAILABLE" as const, next_available: new Date(new Date(end).getTime() + 86_400_000).toISOString() };
  }
  // Variação determinística para a demo parecer realista
  const bucket = hash(`${vehicleId}|${product}|${pickup.slice(0, 10)}`) % 12;
  if (bucket === 0) return { status: "UNAVAILABLE" as const, next_available: new Date(new Date(end).getTime() + 3 * 86_400_000).toISOString() };
  if (bucket <= 2) return { status: "LIMITED" as const };
  return { status: "AVAILABLE" as const };
}

function vehicleOrThrow(id: string) {
  const v = MOCK_VEHICLES.find((x) => x.vehicle_id === id);
  if (!v) throw new WeGestError("not_found", `Viatura ${id} não encontrada`, 404);
  return v;
}

function buildQuote(p: QuoteParams): WgQuote {
  const v = vehicleOrThrow(p.vehicleId);
  const rate = v.rates.find((r) => r.rate_id === p.rateId);
  if (!rate?.daily_rate) throw new WeGestError("validation", "Tarifa inválida para Rent a Car", 422);
  const days = rentalDays(p.pickupDatetime, p.returnDatetime);
  const lines: WgQuote["lines"] = [
    { code: "BASE", description: `Aluguer, ${days} ${days === 1 ? "dia" : "dias"} × ${rate.daily_rate} €`, amount: rate.daily_rate * days, type: "BASE" },
  ];
  if (days >= 7) {
    lines.push({ code: "LONG", description: "Desconto aluguer 7+ dias (10%)", amount: -round2(rate.daily_rate * days * 0.1), type: "DISCOUNT" });
  }
  for (const sel of p.extras) {
    const ex = MOCK_EXTRAS.find((e) => e.extra_id === sel.extra_id);
    if (!ex || sel.qty <= 0) continue;
    const qty = Math.min(sel.qty, ex.max_qty);
    const amount = ex.charge_type === "PER_DAY" ? ex.price * days * qty : ex.price * qty;
    lines.push({ code: ex.extra_id, description: `${ex.extra_name}${qty > 1 ? ` × ${qty}` : ""}`, amount, type: "EXTRA" });
  }
  const cov = p.coverageId ? MOCK_COVERAGES.find((c) => c.coverage_id === p.coverageId) : undefined;
  if (cov && cov.price_per_day > 0) {
    lines.push({ code: cov.coverage_id, description: `${cov.coverage_name}, ${days} ${days === 1 ? "dia" : "dias"}`, amount: cov.price_per_day * days, type: "COVERAGE" });
  }
  if (p.returnLocationId !== p.pickupLocationId) {
    lines.push({ code: "ONEWAY", description: "Taxa de devolução noutro local", amount: 30, type: "FEE" });
  }
  const grand = round2(lines.reduce((acc, l) => acc + l.amount, 0));
  const vat = VAT[v.region_code];
  const net = round2(grand / (1 + vat));
  const q: WgQuote = {
    quote_id: `Q-${hash(JSON.stringify(p)).toString(36)}`,
    lines,
    subtotal: net,
    tax_total: round2(grand - net),
    grand_total: grand,
    deposit: rate.deposit_amount,
    excess: cov && cov.excess_amount !== null ? cov.excess_amount : rate.excess_amount,
    km_included_per_day: rate.km_limit ?? null,
    valid_until: new Date(Date.now() + 20 * 60_000).toISOString(),
  };
  return q;
}

export const mockTransport: WeGestTransport = {
  mode: "mock",

  async listLocations(regionCode) {
    await delay();
    return clone(MOCK_LOCATIONS.filter((l) => l.region_code === regionCode));
  },

  async listCategories() {
    await delay();
    return clone(MOCK_CATEGORIES);
  },

  async listVehicles({ regionCode, product }) {
    await delay();
    return clone(
      MOCK_VEHICLES.filter(
        (v) => v.status === "ACTIVE" && v.region_code === regionCode && (!product || v.rates.some((r) => r.product === product)),
      ),
    );
  },

  async getVehicle(id) {
    await delay();
    const v = MOCK_VEHICLES.find((x) => x.vehicle_id === id);
    return v ? clone(v) : null;
  },

  async searchAvailability(p) {
    await delay();
    const candidates = MOCK_VEHICLES.filter(
      (v) =>
        v.status === "ACTIVE" &&
        v.region_code === p.regionCode &&
        v.rates.some((r) => r.product === p.product) &&
        v.location_ids.includes(p.pickupLocationId) &&
        (!p.vehicleId || v.vehicle_id === p.vehicleId),
    );
    if (p.returnLocationId) {
      const ret = MOCK_LOCATIONS.find((l) => l.location_id === p.returnLocationId);
      if (!ret?.allows_return) return [];
    }
    return candidates.map((v) => ({ vehicle_id: v.vehicle_id, ...availabilityFor(v.vehicle_id, p.product, p.pickupDatetime, p.returnDatetime) }));
  },

  async listExtras() {
    await delay();
    return clone(MOCK_EXTRAS);
  },

  async listCoverages() {
    await delay();
    return clone(MOCK_COVERAGES);
  },

  async quote(p) {
    await delay();
    const q = buildQuote(p);
    state().quotes.set(q.quote_id, { ...q, _params: p });
    return clone(q);
  },

  async createCustomer(input) {
    await delay();
    const s = state();
    const existing = [...s.customers.values()].find(
      (c) => c.email.toLowerCase() === input.email.toLowerCase() && c.customer_type === input.customer_type,
    );
    if (existing) {
      const merged = { ...existing, ...input, customer_id: existing.customer_id };
      s.customers.set(existing.customer_id, merged);
      return clone(merged);
    }
    const c: WgCustomer = { ...input, customer_id: nextId(input.customer_type === "TVDE" ? "DRV" : "CLI") };
    s.customers.set(c.customer_id, c);
    return clone(c);
  },

  async updateCustomer(id, input) {
    await delay();
    const s = state();
    const c = s.customers.get(id);
    if (!c) throw new WeGestError("not_found", "Cliente não encontrado", 404);
    const updated = { ...c, ...input, customer_id: id };
    s.customers.set(id, updated);
    return clone(updated);
  },

  async getCustomer(id) {
    await delay();
    const c = state().customers.get(id);
    return c ? clone(c) : null;
  },

  async findCustomerByEmail(email, type) {
    await delay();
    const c = [...state().customers.values()].find((x) => x.email.toLowerCase() === email.toLowerCase() && x.customer_type === type);
    return c ? clone(c) : null;
  },

  async createBooking(input) {
    await delay();
    const s = state();
    const prior = s.idempotency.get(input.idempotencyKey);
    if (prior) return clone(s.bookings.get(prior)!);

    const v = vehicleOrThrow(input.vehicleId);
    // Nova verificação de disponibilidade no momento da reserva (doc §89)
    const av = availabilityFor(v.vehicle_id, "RAC", input.pickupDatetime, input.returnDatetime);
    if (av.status === "UNAVAILABLE") {
      throw new WeGestError("conflict", "A viatura deixou de estar disponível para o período escolhido.", 409);
    }
    const quote = buildQuote({ ...input, extras: input.extras, coverageId: input.coverageId });
    const pickup = MOCK_LOCATIONS.find((l) => l.location_id === input.pickupLocationId)!;
    const ret = MOCK_LOCATIONS.find((l) => l.location_id === input.returnLocationId)!;
    const id = nextId("BK");
    const booking: WgBooking = {
      booking_id: id,
      booking_number: `DO-${28470 + s.seq}`,
      // Como na API real: a reserva entra pendente e a equipa confirma no WeGest.
      state: "PENDING",
      region_code: v.region_code,
      customer_id: input.customerId,
      vehicle_id: v.vehicle_id,
      vehicle_name: v.vehicle_name,
      rate_id: input.rateId,
      pickup_location_id: pickup.location_id,
      pickup_location_name: pickup.location_name,
      return_location_id: ret.location_id,
      return_location_name: ret.location_name,
      pickup_datetime: input.pickupDatetime,
      return_datetime: input.returnDatetime,
      extras: quote.lines
        .filter((l) => l.type === "EXTRA")
        .map((l) => ({
          extra_id: l.code,
          extra_name: MOCK_EXTRAS.find((e) => e.extra_id === l.code)?.extra_name ?? l.description,
          qty: input.extras.find((e) => e.extra_id === l.code)?.qty ?? 1,
          total: l.amount,
        })),
      coverage_name: MOCK_COVERAGES.find((c) => c.coverage_id === input.coverageId)?.coverage_name ?? null,
      message: input.message ?? null,
      quote,
      payment_state: "PAID",
      can_modify: true,
      can_cancel: true,
      created_at: nowIso(),
    };
    s.bookings.set(id, booking);
    s.idempotency.set(input.idempotencyKey, id);
    const inv = s.invoices.get(input.customerId) ?? [];
    inv.unshift({ invoice_id: nextId("INV"), invoice_number: `FT 2026/${1200 + s.seq}`, issue_date: nowIso(), total: quote.grand_total, booking_number: booking.booking_number });
    s.invoices.set(input.customerId, inv);
    return clone(booking);
  },

  async getBooking(id) {
    await delay();
    const b = state().bookings.get(id);
    return b ? clone(b) : null;
  },

  async listCustomerBookings(customerId) {
    await delay();
    return clone([...state().bookings.values()].filter((b) => b.customer_id === customerId));
  },

  async previewCancellation(id) {
    await delay();
    const b = state().bookings.get(id);
    if (!b) throw new WeGestError("not_found", "Reserva não encontrada", 404);
    const hoursToPickup = (new Date(b.pickup_datetime).getTime() - Date.now()) / 3_600_000;
    const paid = b.quote.grand_total;
    const dayRate = b.quote.lines.find((l) => l.type === "BASE")!.amount / rentalDays(b.pickup_datetime, b.return_datetime);
    const fee = hoursToPickup >= 48 ? 0 : round2(Math.min(paid, dayRate));
    return {
      paid,
      fee,
      refundable: round2(paid - fee),
      policy: "Cancelamento gratuito até 48h antes do levantamento. Depois, é retido 1 dia de aluguer.",
    };
  },

  async cancelBooking(id) {
    await delay();
    const s = state();
    const b = s.bookings.get(id);
    if (!b) throw new WeGestError("not_found", "Reserva não encontrada", 404);
    if (!b.can_cancel) throw new WeGestError("conflict", "Esta reserva já não pode ser cancelada.", 409);
    const updated: WgBooking = { ...b, state: "CANCELLED", can_cancel: false, can_modify: false, payment_state: "REFUND_PENDING" };
    s.bookings.set(id, updated);
    return clone(updated);
  },

  async listCustomerInvoices(customerId) {
    await delay();
    return clone(state().invoices.get(customerId) ?? []);
  },

  async getApplicationForm() {
    await delay();
    return clone(MOCK_APPLICATION_FORM);
  },

  async createApplication(input) {
    await delay();
    const s = state();
    const v = vehicleOrThrow(input.vehicleId);
    const rate = v.rates.find((r) => r.rate_id === input.rateId && r.product === "TVDE");
    if (!rate?.weekly_rate) throw new WeGestError("validation", "Tarifa TVDE inválida", 422);
    const av = availabilityFor(v.vehicle_id, "TVDE", input.pickupDatetime);
    if (av.status === "UNAVAILABLE") throw new WeGestError("conflict", "A viatura já não está disponível nesta data.", 409);
    const loc = MOCK_LOCATIONS.find((l) => l.location_id === input.pickupLocationId);
    if (!loc) throw new WeGestError("validation", "Local de levantamento inválido", 422);
    const id = nextId("APP");
    const app: WgApplication = {
      application_id: id,
      application_number: `TVDE-${5100 + s.seq}`,
      state: "AWAITING_PAYMENT",
      region_code: v.region_code,
      customer_id: input.customerId,
      vehicle_id: v.vehicle_id,
      vehicle_name: v.vehicle_name,
      rate_id: rate.rate_id,
      pickup_datetime: input.pickupDatetime,
      pickup_location_id: loc.location_id,
      pickup_location_name: loc.location_name,
      weekly_rate: rate.weekly_rate,
      deposit_amount: rate.deposit_amount ?? 0,
      reservation_amount: rate.reservation_amount ?? rate.deposit_amount ?? 0,
      documents: [],
      hold_until: new Date(Date.now() + 30 * 60_000).toISOString(),
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    s.applications.set(id, app);
    return clone(app);
  },

  async getApplication(id) {
    await delay();
    const a = state().applications.get(id);
    return a ? clone(a) : null;
  },

  async listCustomerApplications(customerId) {
    await delay();
    return clone([...state().applications.values()].filter((a) => a.customer_id === customerId));
  },

  async uploadApplicationDocument(id, doc) {
    await delay();
    const s = state();
    const a = s.applications.get(id);
    if (!a) throw new WeGestError("not_found", "Candidatura não encontrada", 404);
    // O conteúdo é descartado no mock: nunca é escrito em disco nem em logs.
    void doc.content;
    const documents = a.documents.filter((d) => d.doc_type !== doc.docType);
    documents.push({ document_id: nextId("DOC"), doc_type: doc.docType, file_name: doc.fileName, state: "UPLOADED", uploaded_at: nowIso() });
    const requested = a.requested_documents?.filter((r) => r.doc_type !== doc.docType);
    const updated: WgApplication = {
      ...a,
      documents,
      requested_documents: requested,
      state: a.state === "PENDING_DOCS" && !requested?.length ? "IN_REVIEW" : a.state,
      updated_at: nowIso(),
    };
    s.applications.set(id, updated);
    return clone(updated);
  },

  async submitApplication(id) {
    await delay();
    const s = state();
    const a = s.applications.get(id);
    if (!a) throw new WeGestError("not_found", "Candidatura não encontrada", 404);
    if (a.state !== "AWAITING_PAYMENT" && a.state !== "DRAFT") return clone(a);
    const updated: WgApplication = { ...a, state: "SUBMITTED", hold_until: undefined, updated_at: nowIso() };
    s.applications.set(id, updated);
    return clone(updated);
  },

  async ping() {
    const t = performance.now();
    await delay();
    return { ok: true, latencyMs: Math.round(performance.now() - t) };
  },
};

/**
 * Simulador do backoffice WeGest: só para demonstração.
 * Permite aprovar/recusar candidaturas e pedir documentos, como faria a equipa no WeGest.
 */
export const mockBackoffice = {
  listApplications(): WgApplication[] {
    return clone([...state().applications.values()]).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  setApplicationState(
    id: string,
    next: WgApplication["state"],
    opts?: { message?: string; requestDoc?: { doc_type: string; doc_label: string; message?: string } },
  ): WgApplication {
    const s = state();
    const a = s.applications.get(id);
    if (!a) throw new WeGestError("not_found", "Candidatura não encontrada", 404);
    const updated: WgApplication = {
      ...a,
      state: next,
      state_message: opts?.message,
      requested_documents: opts?.requestDoc ? [...(a.requested_documents ?? []), opts.requestDoc] : a.requested_documents,
      contract_id: next === "APPROVED" ? `CT-${a.application_number}` : a.contract_id,
      updated_at: nowIso(),
    };
    s.applications.set(id, updated);
    return clone(updated);
  },
  listBookings(): WgBooking[] {
    return clone([...state().bookings.values()]).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  setBookingState(id: string, next: WgBooking["state"]): WgBooking {
    const s = state();
    const b = s.bookings.get(id);
    if (!b) throw new WeGestError("not_found", "Reserva não encontrada", 404);
    const updated: WgBooking = { ...b, state: next, can_cancel: next === "PENDING", can_modify: next === "PENDING" || next === "CONFIRMED" };
    s.bookings.set(id, updated);
    return clone(updated);
  },
  reset() {
    g.__wegestMock = seed();
  },
};

/** Dados de demonstração: um cliente Rent a Car e um motorista TVDE (ver services/auth/seed.ts). */
function seed(): MockState {
  const s: MockState = {
    customers: new Map(),
    bookings: new Map(),
    applications: new Map(),
    quotes: new Map(),
    invoices: new Map(),
    idempotency: new Map(),
    seq: 100,
  };
  const rac: WgCustomer = {
    customer_id: "CLI-DEMO",
    customer_type: "RAC",
    name: "João Silva",
    email: "demo@decadaousada.pt",
    phone: "+351 912 345 678",
    birth_date: "1988-04-12",
    nif: "123456789",
    address: "Rua Dr. Correia Mateus, 12",
    zip_code: "2400-123",
    city: "Leiria",
    country: "PT",
    license_number: "L-1234567",
    license_country: "PT",
    license_expiry: "2031-04-12",
  };
  const drv: WgCustomer = { ...rac, customer_id: "DRV-DEMO", customer_type: "TVDE", custom_fields: { niss: "12345678901", platform: "uber" } };
  s.customers.set(rac.customer_id, rac);
  s.customers.set(drv.customer_id, drv);

  const mk = (id: string, num: string, vehicleId: string, pickupLoc: string, from: string, to: string, st: WgBooking["state"], extras: Array<{ extra_id: string; qty: number }>): WgBooking => {
    const v = MOCK_VEHICLES.find((x) => x.vehicle_id === vehicleId)!;
    const rate = v.rates.find((r) => r.product === "RAC")!;
    const q = buildQuoteSeed({ vehicleId, rateId: rate.rate_id, pickupLocationId: pickupLoc, returnLocationId: pickupLoc, pickupDatetime: from, returnDatetime: to, extras });
    const loc = MOCK_LOCATIONS.find((l) => l.location_id === pickupLoc)!;
    return {
      booking_id: id, booking_number: num, state: st, region_code: v.region_code, customer_id: "CLI-DEMO",
      vehicle_id: vehicleId, vehicle_name: v.vehicle_name, rate_id: rate.rate_id,
      pickup_location_id: loc.location_id, pickup_location_name: loc.location_name,
      return_location_id: loc.location_id, return_location_name: loc.location_name,
      pickup_datetime: from, return_datetime: to,
      extras: q.lines.filter((l) => l.type === "EXTRA").map((l) => ({ extra_id: l.code, extra_name: l.description, qty: 1, total: l.amount })),
      quote: q, payment_state: st === "CANCELLED" ? "REFUNDED" : "PAID",
      can_modify: st === "CONFIRMED", can_cancel: st === "CONFIRMED", created_at: "2026-09-20T10:00:00.000Z",
    };
  };
  const seedBookings = [
    mk("BK-1", "DO-28471", "V-1001", "LOC-LRA", "2026-10-12T10:00", "2026-10-15T18:00", "CONFIRMED", [{ extra_id: "EX-BABY", qty: 1 }, { extra_id: "EX-DRIVER", qty: 1 }]),
    mk("BK-2", "DO-27310", "V-1007", "LOC-FAO", "2026-08-03T09:00", "2026-08-10T09:00", "CLOSED", [{ extra_id: "EX-CHILD", qty: 1 }]),
    mk("BK-3", "DO-26902", "V-1003", "LOC-LIS", "2026-06-14T10:00", "2026-06-16T10:00", "CANCELLED", []),
  ];
  for (const b of seedBookings) s.bookings.set(b.booking_id, b);
  s.invoices.set("CLI-DEMO", [
    { invoice_id: "INV-1", invoice_number: "FT 2026/1234", issue_date: "2026-09-20T10:05:00.000Z", total: seedBookings[0].quote.grand_total, booking_number: "DO-28471" },
    { invoice_id: "INV-2", invoice_number: "FT 2026/0987", issue_date: "2026-07-28T15:12:00.000Z", total: seedBookings[1].quote.grand_total, booking_number: "DO-27310" },
  ]);

  s.applications.set("APP-1", {
    application_id: "APP-1",
    application_number: "TVDE-5101",
    state: "IN_REVIEW",
    region_code: "PT-CONT",
    customer_id: "DRV-DEMO",
    vehicle_id: "V-1004",
    vehicle_name: "Toyota Corolla Hybrid",
    rate_id: "V-1004-TVDE",
    pickup_datetime: "2026-10-15T10:00",
    pickup_location_id: "LOC-LRA",
    pickup_location_name: "Leiria",
    weekly_rate: 275,
    deposit_amount: 750,
    reservation_amount: 250,
    documents: MOCK_APPLICATION_FORM.documents.slice(0, 4).map((d, i) => ({
      document_id: `DOC-${i + 1}`, doc_type: d.doc_type, file_name: `${d.doc_type}.pdf`, state: "UPLOADED", uploaded_at: "2026-10-05T18:20:00.000Z",
    })),
    created_at: "2026-10-05T18:00:00.000Z",
    updated_at: "2026-10-06T09:30:00.000Z",
  });
  return s;
}

/** buildQuote sem depender de state() (usado durante o seed). */
function buildQuoteSeed(p: QuoteParams): WgQuote {
  const q = buildQuote(p);
  return { ...q, valid_until: undefined };
}
