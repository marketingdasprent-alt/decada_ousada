import type { RentalSearch, SelectedExtra } from "@/domain/booking";
import type { Region } from "@/domain/region";

type SP = Record<string, string | string[] | undefined>;

const LOCAL_DT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Lê a pesquisa Rent a Car dos query params (?levantamento=&devolucao=&inicio=&fim=). */
export function parseRentalSearch(sp: SP, region: Region): RentalSearch | null {
  const pickupLocationId = first(sp.levantamento);
  const returnLocationId = first(sp.devolucao) || pickupLocationId;
  const pickupAt = first(sp.inicio);
  const returnAt = first(sp.fim);
  if (!pickupLocationId || !returnLocationId || !pickupAt || !returnAt) return null;
  if (!LOCAL_DT.test(pickupAt) || !LOCAL_DT.test(returnAt)) return null;
  if (new Date(returnAt) <= new Date(pickupAt)) return null;
  return { pickupLocationId, returnLocationId, pickupAt, returnAt, region };
}

export function rentalSearchQuery(s: RentalSearch): string {
  return new URLSearchParams({ levantamento: s.pickupLocationId, devolucao: s.returnLocationId, inicio: s.pickupAt, fim: s.returnAt }).toString();
}

export function searchToFormValues(s: RentalSearch | null) {
  if (!s) return undefined;
  return {
    pickupLocationId: s.pickupLocationId,
    returnLocationId: s.returnLocationId,
    pickupDate: s.pickupAt.slice(0, 10),
    pickupTime: s.pickupAt.slice(11, 16),
    returnDate: s.returnAt.slice(0, 10),
    returnTime: s.returnAt.slice(11, 16),
  };
}

export { first as firstParam };

/**
 * Escolhas do checkout guardadas no URL ao sair para entrar na conta
 * (extras, cobertura e passo). Nunca dados pessoais no URL.
 */
export interface CheckoutDraft {
  extras: SelectedExtra[];
  coverageId: string | null;
  step: number;
}

export function parseCheckoutDraft(sp: SP): CheckoutDraft {
  const extras = (first(sp.extras) ?? "")
    .split(",")
    .map((pair) => pair.split(":"))
    .filter(([id, qty]) => id && Number(qty) > 0)
    .map(([extraId, qty]) => ({ extraId, quantity: Math.min(10, Math.floor(Number(qty))) }));
  const step = Number(first(sp.passo));
  return { extras, coverageId: first(sp.cobertura) || null, step: step === 1 || step === 2 ? step : 0 };
}

export function checkoutDraftQuery(draft: CheckoutDraft): string {
  const p = new URLSearchParams();
  if (draft.extras.length) p.set("extras", draft.extras.map((e) => `${e.extraId}:${e.quantity}`).join(","));
  if (draft.coverageId) p.set("cobertura", draft.coverageId);
  if (draft.step) p.set("passo", String(draft.step));
  return p.toString();
}
