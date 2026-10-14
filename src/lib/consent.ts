/**
 * Consentimento de cookies (RGPD e Lei n.º 41/2004): os cookies necessários não pedem
 * consentimento; os de marketing (Meta Pixel) só depois de "Aceitar". A escolha fica no
 * localStorage deste browser e muda a qualquer momento no link "Cookies" do rodapé.
 * Sem localStorage (modo privado, bloqueado) não há escolha guardada: o aviso volta a aparecer
 * e nada de marketing carrega.
 */
export type Consent = { marketing: boolean; at: string };

const KEY = "do:consent";
/** Sobe quando as categorias mudam, para voltar a perguntar a quem já respondeu. */
const VERSION = 1;
/** Evento na window quando a escolha muda (o carregador do pixel escuta-o). */
export const CONSENT_EVENT = "do:consent";
/** Evento que abre as preferências (link "Cookies" do rodapé, página de privacidade). */
export const CONSENT_OPEN_EVENT = "do:consent-open";

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Consent> & { v?: number };
    if (parsed.v !== VERSION || typeof parsed.marketing !== "boolean" || typeof parsed.at !== "string") return null;
    return { marketing: parsed.marketing, at: parsed.at };
  } catch {
    return null;
  }
}

export function saveConsent(marketing: boolean): Consent {
  const consent: Consent = { marketing, at: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify({ v: VERSION, ...consent }));
  } catch {
    // Sem localStorage: vale só para esta página
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }));
  return consent;
}

export function openConsentSettings(): void {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
