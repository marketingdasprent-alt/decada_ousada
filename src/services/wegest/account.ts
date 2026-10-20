import "server-only";
import type { AccountBooking, AccountInvoice, WeGestAccount } from "@/domain/customer/account";
import { wegestRequest } from "./client";
import { WeGestError } from "./types";

export const getAccount = (token: string) => wegestRequest<WeGestAccount>("/conta", { headers: { "X-Conta-Token": token } });
export const getAccountInvoices = (token: string) => wegestRequest<AccountInvoice[]>("/conta/faturas", { headers: { "X-Conta-Token": token } });
/** Reservas da ficha ligada à conta, mais recentes primeiro. O WeGest só devolve as da própria conta. */
export const getAccountBookings = (token: string) => wegestRequest<AccountBooking[]>("/conta/reservas", { headers: { "X-Conta-Token": token } });
/** Só cancela uma reserva da conta com pode_cancelar: true (pendente, levantamento por chegar). */
export const cancelAccountBooking = (token: string, codigo: number) =>
  wegestRequest<AccountBooking>("/conta/reservas/" + codigo, { method: "DELETE", headers: { "X-Conta-Token": token } });

/** O programa de faturação pode demorar 45 s. Sem retry: cada pedido gera um PDF. */
export async function getAccountInvoicePdf(token: string, id: string): Promise<Response> {
  const base = process.env.WEGEST_API_URL;
  const key = process.env.WEGEST_API_KEY;
  if (!base || !key) throw new WeGestError("unavailable", "Integração de faturas indisponível.", 503);
  const url = new URL("conta/faturas/" + encodeURIComponent(id), base.replace(/\/?$/, "/"));
  const response = await fetch(url, { headers: { "X-API-Key": key, "X-Conta-Token": token, Accept: "application/pdf" }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(55_000) });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { erro?: { codigo?: string } } | null;
    throw new WeGestError(response.status === 404 ? "not_found" : response.status === 401 ? "unauthorized" : "unavailable", "Não foi possível obter a fatura.", response.status, undefined, undefined, body?.erro?.codigo);
  }
  if (!response.headers.get("content-type")?.includes("application/pdf")) throw new WeGestError("upstream", "Formato de fatura inesperado.", 502);
  return response;
}

// Import aqui (e não no topo) para este bloco ficar acrescentado sem mexer no que está acima.
import type { AccountApplication, AccountApplicationDraft, ApplicationDocType, ApplicationUploadTicket } from "@/domain/customer/account";

// Candidatura TVDE da conta. Sem cache e sem retry nas escritas (wegestRequest só repete GET).
const contaToken = (token: string) => ({ "X-Conta-Token": token });
const docPath = (tipo: ApplicationDocType) => "/conta/candidatura-documentos/" + encodeURIComponent(tipo);
type ApplicationEnvelope = { candidatura: AccountApplication };

export const getAccountApplication = (token: string) =>
  wegestRequest<ApplicationEnvelope>("/conta/candidatura", { headers: contaToken(token) });
export const saveAccountApplication = (token: string, draft: AccountApplicationDraft) =>
  wegestRequest<ApplicationEnvelope>("/conta/candidatura", { method: "PUT", body: draft, headers: contaToken(token) });
export const submitAccountApplication = (token: string) =>
  wegestRequest<ApplicationEnvelope>("/conta/candidatura", { method: "POST", headers: contaToken(token) });
export const requestApplicationUpload = (token: string, tipo: ApplicationDocType, file: { content_type: string; tamanho: number }) =>
  wegestRequest<ApplicationUploadTicket>(docPath(tipo), { method: "POST", body: file, headers: contaToken(token) });
export const confirmApplicationUpload = (token: string, tipo: ApplicationDocType, caminho: string) =>
  wegestRequest<ApplicationEnvelope>(docPath(tipo), { method: "PUT", body: { caminho }, headers: contaToken(token) });
export const deleteApplicationDocument = (token: string, tipo: ApplicationDocType) =>
  wegestRequest<ApplicationEnvelope>(docPath(tipo), { method: "DELETE", headers: contaToken(token) });
