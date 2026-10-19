import "server-only";

import { normalizeIban } from "@/lib/dynamic-form";

import type {
  ApiCategoria,
  ApiCobertura,
  ApiCotacao,
  ApiExtra,
  ApiLocalizacao,
  ApiModelo,
  ApiModeloDetalhe,
  ApiModeloDisponivel,
  ApiModeloTvde,
  ApiPreco,
  ApiReserva,
} from "./api-types";
import { wegestRequest } from "./client";
import type { WeGestTransport } from "./transport";
import {
  WeGestError,
  type WgApplication,
  type WgBooking,
  type WgCategory,
  type WgCustomer,
  type WgFormField,
  type WgLocation,
  type WgQuote,
  type WgRate,
  type WgVehicle,
} from "./types";

/**
 * Implementação HTTP do WeGest: API v1 (https://api.wegest.pt/v1, docs/wegest/openapi.json).
 * Converte as respostas reais para os DTOs Wg* que o mock também produz, para o resto da
 * app não depender do transporte.
 *
 * O que a API não tem (docs/wegest/analise-gaps.md) fica aqui, em memória por instância:
 * fichas de cliente, a lista de reservas e candidaturas de cada cliente, faturas (vazio).
 * Em produção isto tem de passar para a base de dados local (DATABASE_URL).
 */

type RegionCode = WgVehicle["region_code"];

// ───────────────────────────── Estado local (o que a API não guarda) ─────────────────────────────

interface LocalState {
  customers: Map<string, WgCustomer>;
  bookingsByCustomer: Map<string, Set<number>>;
  applicationsByCustomer: Map<string, Map<string, WgApplication>>;
}

const g = globalThis as unknown as { __wegestHttp?: LocalState };
const local = (): LocalState =>
  (g.__wegestHttp ??= { customers: new Map(), bookingsByCustomer: new Map(), applicationsByCustomer: new Map() });

// ───────────────────────────── Conversões ─────────────────────────────

const money = (p: ApiPreco | null | undefined) => p?.com_iva;

/** A API não tem região: uma localização é dos Açores pelo nome, cidade ou morada. */
const AZORES = /a[çc]ores|azores|ponta delgada|angra|horta|terceira|s[ãa]o miguel|faial|pico|lajes|ribeira grande|praia da vit[óo]ria/i;
const regionOf = (l: ApiLocalizacao): RegionCode => (AZORES.test([l.nome, l.cidade, l.morada].filter(Boolean).join(" ")) ? "PT-AC" : "PT-CONT");

function toLocation(l: ApiLocalizacao): WgLocation {
  return {
    location_id: l.id,
    location_name: l.nome,
    region_code: regionOf(l),
    address: [l.morada, l.cidade].filter(Boolean).join(", ") || undefined,
    lat: l.latitude ?? undefined,
    lng: l.longitude ?? undefined,
    allows_pickup: true,
    allows_return: true,
    opening_hours: l.horario ?? undefined,
  };
}

/** Combustível em texto livre no WeGest ("Diesel", "diesel", "Elétrico"…). */
function fuelOf(text: string | null): WgVehicle["fuel_type"] {
  if (!text) return undefined;
  const t = text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  if (/plug|phev/.test(t)) return "PHEV";
  if (/hibrid|hybrid/.test(t)) return "HIBRIDO";
  if (/eletric|electric|^ev$/.test(t)) return "ELETRICO";
  if (/diesel|gasoleo/.test(t)) return "DIESEL";
  if (/gpl|lpg/.test(t)) return "GPL";
  if (/gasolina|petrol/.test(t)) return "GASOLINA";
  return undefined;
}

const transmissionOf = (c: ApiModelo["caixa"]): WgVehicle["transmission_type"] =>
  c === "automatica" ? "AUTOMATICA" : c === "manual" ? "MANUAL" : undefined;

const racRateId = (modelId: string) => `rac:${modelId}`;
const tvdeRateId = (modelId: string) => `tvde:${modelId}`;

function racRate(m: ApiModelo | ApiModeloDetalhe): WgRate {
  const t = "tarifa" in m ? m.tarifa : undefined;
  return {
    rate_id: racRateId(m.id),
    product: "RAC",
    daily_rate: money(m.preco_dia),
    deposit_amount: money(t?.caucao),
    km_limit: t?.km_incluidos ?? undefined,
    extra_km_price: money(t?.km_adicional),
    excess_amount: money(t?.franquia),
  };
}

function tvdeRate(m: ApiModeloTvde): WgRate {
  return {
    rate_id: tvdeRateId(m.id),
    product: "TVDE",
    weekly_rate: money(m.preco_semana),
    deposit_amount: money(m.caucao),
    km_limit: m.km_incluidos ?? undefined,
    extra_km_price: money(m.km_adicional),
    excess_amount: money(m.franquia),
  };
}

/** Modelo da API → viatura. A API trabalha por modelo ("ou similar"), sem viatura nem local. */
function toVehicle(m: ApiModelo | ApiModeloTvde, rate: WgRate, regionCode: RegionCode, locationIds: string[]): WgVehicle {
  return {
    vehicle_id: m.id,
    vehicle_name: `${m.marca} ${m.modelo}`,
    brand: m.marca,
    model: m.modelo,
    category_id: m.categoria?.id ?? "",
    photos: m.imagem_url ? [{ url: m.imagem_url }] : [],
    fuel_type: fuelOf(m.combustivel),
    transmission_type: transmissionOf(m.caixa),
    seats: m.lugares ?? undefined,
    doors: m.portas ?? undefined,
    luggage: m.bagageira ?? undefined,
    features: m.ar_condicionado ? ["Ar condicionado"] : undefined,
    region_code: regionCode,
    location_ids: locationIds,
    rates: [rate],
    status: "ACTIVE",
    // Só quando a API o devolve: uma chave a undefined apagava o valor ao juntar com o TVDE
    ...("tipo" in m && m.disponivel_desde !== undefined && { available_from: m.disponivel_desde }),
  };
}

/** Junta o mesmo modelo de Rent a Car e de TVDE numa só viatura com as duas ofertas. */
function mergeVehicles(list: WgVehicle[]): WgVehicle[] {
  const byId = new Map<string, WgVehicle>();
  for (const v of list) {
    const prev = byId.get(v.vehicle_id);
    if (!prev) byId.set(v.vehicle_id, v);
    else byId.set(v.vehicle_id, { ...prev, ...v, photos: prev.photos.length ? prev.photos : v.photos, rates: [...prev.rates, ...v.rates] });
  }
  return [...byId.values()];
}

const LINE_TYPE = { aluguer: "BASE", cobertura: "COVERAGE", extra: "EXTRA" } as const;

function toQuote(c: ApiCotacao, id: string): WgQuote {
  const total = c.subtotal.com_iva;
  return {
    quote_id: id,
    lines: c.linhas.map((l, i) => ({
      code: `${l.tipo}-${i}`,
      description: l.quantidade && l.quantidade > 1 ? `${l.descricao} (×${l.quantidade})` : l.descricao,
      amount: l.total.com_iva,
      type: LINE_TYPE[l.tipo] ?? "BASE",
    })),
    subtotal: c.subtotal.sem_iva,
    tax_total: Math.round((total - c.subtotal.sem_iva) * 100) / 100,
    grand_total: total,
    deposit: money(c.caucao),
    excess: money(c.franquia) ?? null,
    km_included_per_day: c.km_incluidos ?? null,
  };
}

/** Cotação sem extras, a partir do que a disponibilidade já devolve. */
function quoteFromAvailability(m: ApiModeloDisponivel): WgQuote | undefined {
  const c = m.cotacao;
  if (!c) return undefined;
  return toQuote(
    {
      linhas: [{ tipo: "aluguer", descricao: `Aluguer, ${c.dias} ${c.dias === 1 ? "dia" : "dias"}`, quantidade: 1, total: c.aluguer }],
      subtotal: c.aluguer,
      franquia: c.franquia,
      caucao: c.caucao,
    },
    `disp:${m.id}`,
  );
}

const BOOKING_STATE: Record<ApiReserva["estado"], WgBooking["state"]> = {
  pendente: "PENDING",
  confirmada: "CONFIRMED",
  em_curso: "OPEN",
  concluida: "CLOSED",
  cancelada: "CANCELLED",
  expirada: "EXPIRED",
};

function toBooking(r: ApiReserva, customerId = ""): WgBooking {
  const entrega = r.estacoes?.entrega;
  const recolha = r.estacoes?.recolha ?? entrega;
  const name = `${r.modelo.marca} ${r.modelo.modelo}`;
  return {
    booking_id: String(r.codigo),
    booking_number: String(r.codigo),
    state: BOOKING_STATE[r.estado],
    region_code: entrega && AZORES.test(entrega.nome) ? "PT-AC" : "PT-CONT",
    customer_id: customerId,
    vehicle_id: r.modelo.id,
    vehicle_name: name,
    rate_id: racRateId(r.modelo.id),
    pickup_location_id: entrega?.id ?? "",
    pickup_location_name: entrega?.nome ?? "",
    return_location_id: recolha?.id ?? "",
    return_location_name: recolha?.nome ?? "",
    pickup_datetime: r.periodo.inicio,
    return_datetime: r.periodo.fim,
    // O GET da reserva não devolve as linhas: só o total
    extras: [],
    quote: {
      quote_id: `res:${r.codigo}`,
      lines: [{ code: "total", description: `Aluguer ${name}, ${r.periodo.dias} ${r.periodo.dias === 1 ? "dia" : "dias"}`, amount: r.total.com_iva, type: "BASE" }],
      subtotal: r.total.sem_iva,
      tax_total: Math.round((r.total.com_iva - r.total.sem_iva) * 100) / 100,
      grand_total: r.total.com_iva,
    },
    // Só uma reserva pendente se cancela pela API
    can_modify: false,
    can_cancel: r.estado === "pendente",
    created_at: r.criada_em,
  };
}

// ───────────────────────────── Candidatura TVDE ─────────────────────────────

/** Versão do texto de consentimento mostrado na ficha (enviada à API com a data de aceitação). */
const CONSENT_VERSION = "site-2026-10";

/** Ficha da candidatura com os campos que POST /tvde/candidaturas pede. Os documentos não vão pela API. */
/**
 * Ficha da candidatura com os campos que POST /tvde/candidaturas pede. Os documentos não vão pela API.
 * Fica em três partes curtas (`step`), cada uma validada antes de passar à seguinte.
 */
const APPLICATION_FORM: { version: string; fields: WgFormField[] } = {
  version: "api-v1",
  fields: [
    // Parte 1: sobre o motorista
    { key: "full_name", required_message: "Indique o nome completo.", label: "Nome completo", input_type: "text", mandatory: true, max_length: 200, group: "Dados pessoais", step: "Sobre si" },
    { key: "email", required_message: "Indique o email.", label: "Email", input_type: "email", mandatory: true, max_length: 254, group: "Dados pessoais", step: "Sobre si" },
    { key: "phone", required_message: "Indique o telemóvel.", label: "Telemóvel", input_type: "tel", mandatory: true, max_length: 20, placeholder: "+351 912 345 678", hint: "Com o indicativo do país.", check: "phone_intl", group: "Dados pessoais", step: "Sobre si" },
    { key: "nif", required_message: "Indique o NIF.", label: "NIF", input_type: "text", mandatory: true, placeholder: "9 dígitos", regex: "^\\d{9}$", regex_message: "O NIF tem 9 dígitos.", check: "nif", group: "Dados pessoais", step: "Sobre si" },
    { key: "address", required_message: "Indique a morada.", label: "Morada", input_type: "text", mandatory: true, max_length: 200, placeholder: "Rua, número e andar", group: "Morada", step: "Sobre si" },
    { key: "zip_code", required_message: "Indique o código postal.", label: "Código postal", input_type: "text", mandatory: true, placeholder: "0000-000", regex: "^\\d{4}-\\d{3}$", regex_message: "Use o formato 0000-000.", format: "postal_code", group: "Morada", step: "Sobre si" },
    { key: "city", required_message: "Indique a localidade.", label: "Localidade", input_type: "text", mandatory: true, max_length: 100, group: "Morada", step: "Sobre si" },

    // Parte 2: documento, carta e licença
    {
      key: "id_type", required_message: "Escolha o tipo de documento.",
      label: "Tipo de documento",
      input_type: "radio",
      mandatory: true,
      choices: [
        { value: "cc", label: "Cartão de cidadão" },
        { value: "ar", label: "Autorização de residência" },
        { value: "tr", label: "Título de residência" },
        { value: "passaporte", label: "Passaporte" },
        { value: "bi", label: "Bilhete de identidade" },
      ],
      group: "Documento de identificação",
      step: "Identificação e carta",
    },
    { key: "id_number", required_message: "Indique o número do documento.", label: "Número do documento", input_type: "text", mandatory: true, max_length: 40, group: "Documento de identificação", step: "Identificação e carta" },
    { key: "id_expiry", required_message: "Indique até quando o documento é válido.", label: "Válido até", input_type: "date", mandatory: true, check: "after_today", group: "Documento de identificação", step: "Identificação e carta" },
    { key: "license_number", required_message: "Indique o número da carta.", label: "Número da carta", input_type: "text", mandatory: true, max_length: 40, group: "Carta de condução", step: "Identificação e carta" },
    { key: "license_expiry", required_message: "Indique até quando a carta é válida.", label: "Válida até", input_type: "date", mandatory: true, check: "after_today", group: "Carta de condução", step: "Identificação e carta" },
    // Para TVDE só conta a B (ligeiro de passageiros); o motorista confirma-a e a API recebe ["B"]
    { key: "license_has_b", label: "Tenho carta de condução de categoria B.", input_type: "checkbox", mandatory: true, required_message: "Para TVDE é precisa a carta de categoria B.", group: "Carta de condução", step: "Identificação e carta" },
    { key: "em_formacao_tvde", label: "Ainda estou a tirar a formação TVDE e não tenho licença.", input_type: "checkbox", mandatory: false, group: "Licença TVDE", step: "Identificação e carta" },
    { key: "tvde_certificate", required_message: "Indique o número da licença TVDE, ou marque que está em formação.", label: "Número da licença TVDE", input_type: "text", mandatory: false, required_unless: "em_formacao_tvde", max_length: 40, group: "Licença TVDE", step: "Identificação e carta" },
    { key: "tvde_certificate_expiry", required_message: "Indique até quando a licença TVDE é válida.", label: "Válida até", input_type: "date", mandatory: false, required_unless: "em_formacao_tvde", check: "after_today", group: "Licença TVDE", step: "Identificação e carta" },

    // Parte 3: pagamentos e envio
    { key: "iban", required_message: "Indique o IBAN.", label: "IBAN", input_type: "text", mandatory: true, max_length: 42, placeholder: "PT50 0000 0000 0000 0000 0000 0", hint: "A conta onde recebe os pagamentos.", check: "iban", format: "iban", group: "Pagamentos", step: "IBAN e envio" },
    { key: "notes", label: "Observações", input_type: "textarea", mandatory: false, max_length: 1000, hint: "Por exemplo, o dia em que pode começar.", group: "Para terminar", step: "IBAN e envio" },
    { key: "consent", required_message: "Para enviar, autorize o tratamento dos dados.", label: "Autorizo o tratamento dos meus dados pessoais para a análise desta candidatura.", input_type: "checkbox", mandatory: true, group: "Para terminar", step: "IBAN e envio" },
  ],
};

const APPLICATION_STATE: Record<string, WgApplication["state"]> = {
  submetido: "SUBMITTED",
  em_analise: "IN_REVIEW",
  aprovado: "APPROVED",
  rejeitado: "REJECTED",
};

interface ApiCandidatura {
  id: string;
  estado: string;
  criada_em: string;
  decidida_em: string | null;
}

// ───────────────────────────── Pedidos ─────────────────────────────

const CATALOG = { catalog: true } as const;

const orNull = async <T,>(p: Promise<T>): Promise<T | null> => {
  try {
    return await p;
  } catch (e) {
    if (e instanceof WeGestError && e.code === "not_found") return null;
    throw e;
  }
};

async function regionLocations(regionCode: RegionCode) {
  const all = await wegestRequest<ApiLocalizacao[]>("/localizacoes", CATALOG);
  return all.filter((l) => regionOf(l) === regionCode);
}

/** Detalhe de cada modelo (km, franquia, caução); a lista não os traz. Um pedido por modelo. */
async function racModels(): Promise<ApiModeloDetalhe[]> {
  const list = await wegestRequest<ApiModelo[]>("/modelos", CATALOG);
  return Promise.all(list.map(async (m) => (await orNull(wegestRequest<ApiModeloDetalhe>(`/modelos/${encodeURIComponent(m.id)}`, CATALOG))) ?? m));
}

const notSupported = (what: string) => new WeGestError("unavailable", `${what} não está disponível online. Contacte-nos.`, 501);

export const httpTransport: WeGestTransport = {
  mode: "http",

  listLocations: async (regionCode) => (await regionLocations(regionCode as RegionCode)).map(toLocation),

  listCategories: async () => {
    const [cats, rac, tvde] = await Promise.all([
      wegestRequest<ApiCategoria[]>("/categorias", CATALOG),
      wegestRequest<ApiModelo[]>("/modelos", CATALOG),
      wegestRequest<ApiModeloTvde[]>("/tvde/modelos", CATALOG),
    ]);
    const commercial = new Set(rac.filter((m) => m.tipo === "comercial").map((m) => m.categoria?.id));
    const out = new Map<string, WgCategory>(
      cats.map((c) => [c.id, { category_id: c.id, category_name: c.nome, group: commercial.has(c.id) ? "COM" : "PAX" }]),
    );
    // Categorias que só aparecem nos modelos TVDE (sem tarifa de Rent a Car)
    for (const m of tvde) if (m.categoria && !out.has(m.categoria.id)) out.set(m.categoria.id, { category_id: m.categoria.id, category_name: m.categoria.nome, group: "PAX" });
    return [...out.values()];
  },

  listVehicles: async ({ regionCode, product }) => {
    const code = regionCode as RegionCode;
    const [locations, rac, tvde] = await Promise.all([
      regionLocations(code),
      product === "TVDE" ? [] : racModels(),
      product === "RAC" ? [] : wegestRequest<ApiModeloTvde[]>("/tvde/modelos", CATALOG),
    ]);
    const ids = locations.map((l) => l.id);
    return mergeVehicles([
      ...rac.map((m) => toVehicle(m, racRate(m), code, ids)),
      ...tvde.map((m) => toVehicle(m, tvdeRate(m), code, ids)),
    ]);
  },

  getVehicle: async (id) => {
    const [rac, tvde] = await Promise.all([
      orNull(wegestRequest<ApiModeloDetalhe>(`/modelos/${encodeURIComponent(id)}`, CATALOG)),
      orNull(wegestRequest<ApiModeloTvde>(`/tvde/modelos/${encodeURIComponent(id)}`, CATALOG)),
    ]);
    const list = [...(rac ? [toVehicle(rac, racRate(rac), "PT-CONT", [])] : []), ...(tvde ? [toVehicle(tvde, tvdeRate(tvde), "PT-CONT", [])] : [])];
    return mergeVehicles(list)[0] ?? null;
  },

  searchAvailability: async (p) => {
    if (p.product === "TVDE") {
      // TVDE: sem local nem fim (renova-se semana a semana)
      const res = await wegestRequest<{ modelos: ApiModeloTvde[] }>("/tvde/disponibilidade", { query: { inicio: p.pickupDatetime } });
      return res.modelos
        .filter((m) => !p.vehicleId || m.id === p.vehicleId)
        .map((m) => ({ vehicle_id: m.id, status: (m.quantidade_disponivel ?? 1) > 1 ? "AVAILABLE" : "LIMITED" }));
    }
    if (!p.returnDatetime) throw new WeGestError("validation", "Indique a data de devolução.", 400);
    const res = await wegestRequest<{ modelos: ApiModeloDisponivel[] }>("/disponibilidade", {
      query: { inicio: p.pickupDatetime, fim: p.returnDatetime, entrega: p.pickupLocationId, recolha: p.returnLocationId ?? p.pickupLocationId },
    });
    return res.modelos
      .filter((m) => !p.vehicleId || m.id === p.vehicleId)
      .map((m) => ({ vehicle_id: m.id, status: m.quantidade_disponivel > 1 ? "AVAILABLE" : "LIMITED", quantity: m.quantidade_disponivel, quote: quoteFromAvailability(m) }));
  },

  listExtras: async () =>
    (await wegestRequest<ApiExtra[]>("/extras", CATALOG)).map((e) => ({
      extra_id: e.id,
      extra_name: e.nome,
      extra_description: e.descricao ?? undefined,
      price: e.preco.com_iva,
      charge_type: e.tipo_calculo === "dia" ? "PER_DAY" : "PER_RENTAL",
      // null = sem limite na API; no site, um por reserva
      max_qty: e.quantidade_maxima ?? 1,
      code: "",
    })),

  listCoverages: async () =>
    (await wegestRequest<ApiCobertura[]>("/coberturas", CATALOG)).map((c) => ({
      coverage_id: c.id,
      coverage_name: c.nome,
      coverage_description: c.descricao ?? undefined,
      price_per_day: c.preco_dia.com_iva,
      excess_amount: money(c.franquia) ?? null,
    })),

  quote: async (p) => {
    const c = await wegestRequest<ApiCotacao>("/cotacoes", {
      method: "POST",
      retry: true,
      body: {
        modelo_id: p.vehicleId,
        inicio: p.pickupDatetime,
        fim: p.returnDatetime,
        entrega: p.pickupLocationId,
        recolha: p.returnLocationId,
        extras: p.extras.map((e) => ({ extra_id: e.extra_id, quantidade: e.qty })),
        cobertura_id: p.coverageId ?? null,
      },
    });
    // A API não dá id à cotação: o preço fica protegido por total_esperado na reserva
    return toQuote(c, `cot:${p.vehicleId}:${c.subtotal.com_iva}`);
  },

  // Sem endpoints de cliente na API: o cliente vai no corpo de POST /reservas
  createCustomer: async (input) => {
    const customer: WgCustomer = { ...input, customer_id: `cli-${crypto.randomUUID()}` };
    local().customers.set(customer.customer_id, customer);
    return customer;
  },
  updateCustomer: async (id, input) => {
    const prev = local().customers.get(id);
    if (!prev) throw new WeGestError("not_found", "Cliente não encontrado.", 404);
    const next = { ...prev, ...input, customer_id: id };
    local().customers.set(id, next);
    return next;
  },
  getCustomer: async (id) => local().customers.get(id) ?? null,
  findCustomerByEmail: async (email, type) =>
    [...local().customers.values()].find((c) => c.email.toLowerCase() === email.toLowerCase() && c.customer_type === type) ?? null,

  createBooking: async (input) => {
    const c = local().customers.get(input.customerId);
    if (!c) throw new WeGestError("validation", "Faltam os dados do condutor.", 400);
    const r = await wegestRequest<ApiReserva>("/reservas", {
      method: "POST",
      // A referencia_externa torna o pedido idempotente: repetir devolve a mesma reserva
      retry: true,
      body: {
        modelo_id: input.vehicleId,
        inicio: input.pickupDatetime,
        fim: input.returnDatetime,
        entrega: input.pickupLocationId,
        recolha: input.returnLocationId,
        extras: input.extras.map((e) => ({ extra_id: e.extra_id, quantidade: e.qty })),
        cobertura_id: input.coverageId ?? null,
        cliente: {
          nome: c.name,
          email: c.email,
          telefone: c.phone ?? "",
          nif: c.nif ?? null,
          data_nascimento: input.driver.birthDate,
          morada: c.address ?? null,
          codigo_postal: c.zip_code ?? null,
          localidade: c.city ?? null,
          pais: c.country ?? "PT",
        },
        carta_conducao: { numero: input.driver.licenseNumber, validade: input.driver.licenseExpiry, pais: input.driver.licenseCountry },
        total_esperado: input.expectedTotal,
        referencia_externa: input.idempotencyKey,
        mensagem: input.message ?? null,
      },
    });
    const set = local().bookingsByCustomer.get(input.customerId) ?? new Set<number>();
    set.add(r.codigo);
    local().bookingsByCustomer.set(input.customerId, set);
    return toBooking(r, input.customerId);
  },

  getBooking: async (id) => {
    if (!/^\d+$/.test(id)) return null;
    const r = await orNull(wegestRequest<ApiReserva>(`/reservas/${id}`));
    if (!r) return null;
    const owner = [...local().bookingsByCustomer.entries()].find(([, codes]) => codes.has(r.codigo))?.[0];
    return toBooking(r, owner);
  },

  listCustomerBookings: async (customerId) => {
    const codes = [...(local().bookingsByCustomer.get(customerId) ?? [])];
    const list = await Promise.all(codes.map((c) => orNull(wegestRequest<ApiReserva>(`/reservas/${c}`))));
    return list.filter((r): r is ApiReserva => r !== null).map((r) => toBooking(r, customerId));
  },

  // Sem pré-visualização na API: cancela-se só enquanto pendente, sem taxa pela API
  previewCancellation: async () => {
    throw notSupported("O cálculo do valor a devolver");
  },

  cancelBooking: async (id) => {
    const r = await wegestRequest<ApiReserva>(`/reservas/${encodeURIComponent(id)}`, { method: "DELETE" });
    const owner = [...local().bookingsByCustomer.entries()].find(([, codes]) => codes.has(r.codigo))?.[0];
    return toBooking(r, owner);
  },

  // Sem faturas na API
  listCustomerInvoices: async () => [],

  getApplicationForm: async () => ({ ...APPLICATION_FORM, documents: [] }),

  createApplication: async (input) => {
    const c = local().customers.get(input.customerId);
    if (!c) throw new WeGestError("validation", "Faltam os dados do motorista.", 400);
    const f = input.formData;
    // Em formação, a licença não vai (a API dispensa-a com em_formacao_tvde: true)
    const inTraining = f.em_formacao_tvde === "true";
    const res = await wegestRequest<ApiCandidatura>("/tvde/candidaturas", {
      method: "POST",
      retry: true,
      // Liga a candidatura à conta WeGest do motorista (resposta com com_conta: true).
      // X-Conta-Token desde 16/10/2026; o nome antigo X-Motorista-Token continua aceite.
      headers: input.driverToken ? { "X-Conta-Token": input.driverToken } : undefined,
      body: {
        referencia_externa: `site-cand-${crypto.randomUUID()}`,
        nome: f.full_name ?? c.name,
        email: f.email ?? c.email,
        telefone: f.phone ?? c.phone ?? "",
        nif: f.nif ?? c.nif ?? "",
        morada: f.address ?? c.address ?? "",
        codigo_postal: f.zip_code ?? c.zip_code ?? "",
        cidade: f.city ?? c.city ?? "",
        documento: { tipo: f.id_type, numero: f.id_number, validade: f.id_expiry },
        carta_conducao: {
          numero: f.license_number,
          categorias: ["B"],
          validade: f.license_expiry,
        },
        licenca_tvde: inTraining ? null : { numero: f.tvde_certificate?.trim(), validade: f.tvde_certificate_expiry },
        em_formacao_tvde: inTraining,
        iban: normalizeIban(f.iban ?? ""),
        // Opcionais: só com uma viatura escolhida
        modelo_pretendido_id: input.vehicleId || undefined,
        data_inicio_pretendida: input.pickupDatetime?.slice(0, 10),
        observacoes: f.notes || null,
        consentimento: { versao: CONSENT_VERSION, aceite_em: new Date().toISOString() },
      },
    });
    const app: WgApplication = {
      application_id: res.id,
      application_number: res.id.slice(0, 8).toUpperCase(),
      state: APPLICATION_STATE[res.estado] ?? "SUBMITTED",
      region_code: "PT-CONT",
      customer_id: input.customerId,
      vehicle_id: input.vehicleId ?? "",
      vehicle_name: "",
      rate_id: input.rateId ?? "",
      pickup_datetime: input.pickupDatetime ?? "",
      pickup_location_id: input.pickupLocationId ?? "",
      pickup_location_name: "",
      weekly_rate: 0,
      deposit_amount: 0,
      reservation_amount: 0,
      documents: [],
      created_at: res.criada_em,
      updated_at: res.decidida_em ?? res.criada_em,
    };
    const apps = local().applicationsByCustomer.get(input.customerId) ?? new Map<string, WgApplication>();
    apps.set(app.application_id, app);
    local().applicationsByCustomer.set(input.customerId, apps);
    return app;
  },

  getApplication: async (id) => {
    const res = await orNull(wegestRequest<ApiCandidatura>(`/tvde/candidaturas/${encodeURIComponent(id)}`));
    if (!res) return null;
    const known = [...local().applicationsByCustomer.values()].map((m) => m.get(id)).find(Boolean);
    return {
      ...(known ?? {
        application_id: res.id,
        application_number: res.id.slice(0, 8).toUpperCase(),
        region_code: "PT-CONT" as const,
        customer_id: "",
        vehicle_id: "",
        vehicle_name: "",
        rate_id: "",
        pickup_datetime: res.criada_em,
        pickup_location_id: "",
        pickup_location_name: "",
        weekly_rate: 0,
        deposit_amount: 0,
        reservation_amount: 0,
        documents: [],
      }),
      state: APPLICATION_STATE[res.estado] ?? "SUBMITTED",
      created_at: res.criada_em,
      updated_at: res.decidida_em ?? res.criada_em,
    };
  },

  listCustomerApplications: async (customerId) => [...(local().applicationsByCustomer.get(customerId)?.values() ?? [])],

  // Os documentos não vão pela API: a equipa pede-os depois da candidatura
  uploadApplicationDocument: async () => {
    throw notSupported("O envio de documentos");
  },

  // A candidatura já fica submetida no POST; aqui só se lê o estado atual
  submitApplication: async (id) => {
    const app = await httpTransport.getApplication(id);
    if (!app) throw new WeGestError("not_found", "Candidatura não encontrada.", 404);
    return app;
  },

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
