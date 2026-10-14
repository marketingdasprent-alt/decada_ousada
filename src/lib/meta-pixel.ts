import type { AnalyticsData, AnalyticsEvent } from "./analytics";

/**
 * Meta Pixel (pedido da equipa de marketing, 2026-10-14). O id não é segredo (aparece no
 * código de qualquer página com pixel), por isso pode ter o prefixo NEXT_PUBLIC_. Sem id,
 * nada carrega e o aviso de cookies não aparece (o site não tem outros cookies opcionais).
 */
const RAW_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
export const META_PIXEL_ID = RAW_ID && /^\d+$/.test(RAW_ID) ? RAW_ID : null;

type Fbq = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue: unknown[]; loaded: boolean; version: string; push: Fbq };
type MetaWindow = Window & { fbq?: Fbq; _fbq?: Fbq };

const SCRIPT_SRC = "https://connect.facebook.net/en_US/fbevents.js";

const win = () => window as MetaWindow;

/** Carrega o fbevents.js (só depois do consentimento) e inicia o pixel; se já estava carregado, volta a autorizar. */
export function loadPixel(id: string): void {
  const w = win();
  if (w.fbq) {
    w.fbq("consent", "grant");
    return;
  }
  // Fila do snippet oficial: as chamadas antes de o script chegar ficam guardadas
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  } as Fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  w.fbq = fbq;
  w._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = SCRIPT_SRC;
  document.head.appendChild(script);

  // Sem eventos automáticos nem correspondência avançada automática: o pixel não lê
  // botões nem campos dos formulários; só recebe os eventos abaixo (sem dados pessoais)
  fbq("set", "autoConfig", false, id);
  fbq("consent", "grant");
  fbq("init", id);
}

/** A pessoa retirou o consentimento: o pixel deixa de enviar e o cookie _fbp é apagado. */
export function revokePixel(): void {
  win().fbq?.("consent", "revoke");
  const host = location.hostname;
  const parts = host.split(".");
  const domains = ["", host, ...parts.slice(1).map((_, i) => `.${parts.slice(i + 1).join(".")}`)];
  for (const name of ["_fbp", "_fbc"]) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

export function pixelPageView(): void {
  win().fbq?.("track", "PageView");
}

const id = (v: AnalyticsData[string]) => (v === undefined ? undefined : [String(v)]);

/**
 * Eventos do funil traduzidos para os eventos padrão da Meta. Só ids, categorias e o total
 * vindo da API (nunca recalculado). Ficam de fora os pagamentos TVDE e as decisões das
 * candidaturas: pagar o sinal não é aprovação e a decisão não é dado de campanha.
 */
const MAP: Partial<Record<AnalyticsEvent, (d: AnalyticsData) => { name: string; custom?: boolean; params?: Record<string, unknown> }>> = {
  rentacar_search: () => ({ name: "Search", params: { content_category: "rentacar" } }),
  rentacar_vehicle_view: (d) => ({ name: "ViewContent", params: { content_ids: id(d.vehicleId), content_category: "rentacar" } }),
  tvde_vehicle_view: (d) => ({ name: "ViewContent", params: { content_ids: id(d.vehicleId), content_category: "tvde" } }),
  rentacar_checkout_started: (d) => ({ name: "InitiateCheckout", params: { content_ids: id(d.vehicleId), content_category: "rentacar" } }),
  rentacar_payment_started: (d) => ({ name: "AddPaymentInfo", params: { value: d.total, currency: "EUR", content_category: "rentacar" } }),
  rentacar_booking_completed: (d) => ({ name: "Purchase", params: { value: d.total, currency: "EUR", content_category: "rentacar" } }),
  tvde_application_started: (d) => ({ name: "CandidaturaTVDEIniciada", custom: true, params: { content_ids: id(d.vehicleId) } }),
  tvde_application_submitted: () => ({ name: "SubmitApplication", params: { content_category: "tvde" } }),
  drivers_apply_opened: (d) => ({ name: "CandidaturaMotoristaAberta", custom: true, params: { content_category: d.mode } }),
  drivers_lead_submitted: (d) => ({ name: "Lead", params: { content_category: d.mode } }),
};

export function pixelTrack(name: AnalyticsEvent, data: AnalyticsData): void {
  const fbq = win().fbq;
  const mapped = MAP[name]?.(data);
  if (!fbq || !mapped) return;
  // Purchase sem valor é rejeitado pela Meta: sem total da API, não se envia
  if (mapped.name === "Purchase" && typeof data.total !== "number") return;
  fbq(mapped.custom ? "trackCustom" : "track", mapped.name, mapped.params ?? {});
}
