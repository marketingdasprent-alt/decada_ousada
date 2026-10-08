/**
 * Eventos do funil (doc §106), com os nomes exatos do documento.
 * Ainda sem fornecedor: `track()` só guarda o evento em memória, emite
 * `do:analytics` na window e escreve na consola em desenvolvimento. Ligar um
 * fornecedor (com consentimento de cookies) é escutar esse evento.
 * Nunca enviar dados pessoais: só ids, valores e escolhas.
 */
export type AnalyticsEvent =
  | "rentacar_search"
  | "rentacar_results"
  | "rentacar_vehicle_view"
  | "rentacar_extra_added"
  | "rentacar_checkout_started"
  | "rentacar_customer_created"
  | "rentacar_payment_started"
  | "rentacar_payment_completed"
  | "rentacar_booking_completed"
  | "tvde_vehicle_view"
  | "tvde_pickup_selected"
  | "tvde_registration_started"
  | "tvde_application_started"
  | "tvde_document_uploaded"
  | "tvde_payment_started"
  | "tvde_payment_completed"
  | "tvde_application_submitted"
  | "tvde_application_approved"
  | "tvde_application_rejected";

export type AnalyticsData = Record<string, string | number | boolean | undefined>;

const w = () => (typeof window === "undefined" ? null : (window as Window & { __doEvents?: Array<{ name: AnalyticsEvent; data: AnalyticsData; at: string }> }));

export function track(name: AnalyticsEvent, data: AnalyticsData = {}): void {
  const win = w();
  if (!win) return;
  const event = { name, data, at: new Date().toISOString() };
  (win.__doEvents ??= []).push(event);
  win.dispatchEvent(new CustomEvent("do:analytics", { detail: event }));
  if (process.env.NODE_ENV === "development") console.debug("[analytics]", name, data);
}

/** Evento que só deve contar uma vez por sessão do browser (ex.: candidatura aprovada vista no portal). */
export function trackOnce(key: string, name: AnalyticsEvent, data: AnalyticsData = {}): void {
  try {
    if (sessionStorage.getItem(`do:ev:${key}`)) return;
    sessionStorage.setItem(`do:ev:${key}`, "1");
  } catch {
    // Sem sessionStorage: conta na mesma
  }
  track(name, data);
}
