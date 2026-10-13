import "server-only";

import { DRIVER_LEAD_FORMS } from "@/domain/drivers";
import type { DriverLeadInput } from "@/lib/validation";
import { WeGestError } from "@/services/wegest/types";

/**
 * Leads de motoristas no WeGest (DECISIONS.md 2026-10-13). A API pública do WeGest não tem
 * leads; o lead entra como o dos formulários públicos do WeGest: na tabela `leads_dasprent`,
 * com o mesmo `formulario_id`, a mesma campanha e as respostas em `observacoes`, para a
 * equipa o ver no mesmo sítio. Só no servidor; os dados pessoais nunca vão para os logs.
 *
 *   WEGEST_LEADS_URL  URL do projeto do WeGest (https://….supabase.co)
 *   WEGEST_LEADS_KEY  chave pública ("anon") que os formulários do WeGest já usam
 * Com WEGEST_MODE=mock não grava nada (demonstração).
 */

/** Os formulários do site podem receber pedidos: demonstração, ou ligação ao WeGest configurada. */
export const driverLeadsReady = () => process.env.WEGEST_MODE !== "http" || (!!process.env.WEGEST_LEADS_URL && !!process.env.WEGEST_LEADS_KEY);

type Answer = { label: string; value: string; type: string };

const yesNo = (v: "sim" | "nao") => (v === "sim" ? "Sim" : "Não");

/** Mesmo formato do formulário público do WeGest: uma entrada por campo, com o rótulo da pergunta. */
function answers(input: DriverLeadInput): Record<string, Answer> {
  const base: Record<string, Answer> = {
    origem: { label: "Origem", value: "Site DÉCADA OUSADA, página /motoristas", type: "text" },
    nome: { label: "Nome", value: input.name, type: "text" },
    email: { label: "Email", value: input.email, type: "email" },
    telefone: { label: "Telefone/WhatsApp", value: input.phone, type: "tel" },
  };
  if (input.mode === "aluguer") {
    base.licenca = { label: "Tem Licença TVDE?", value: yesNo(input.hasTvdeLicense), type: "radio" };
    if (input.notes) base.observacoes = { label: "Observações", value: input.notes, type: "textarea" };
  } else {
    base.tvde = { label: "Atualmente trabalhas como TVDE?", value: yesNo(input.worksTvde), type: "select" };
    base.viatura = { label: "Qual é a sua viatura?", value: input.vehicle, type: "text" };
  }
  return base;
}

export async function submitDriverLead(input: DriverLeadInput): Promise<void> {
  if (process.env.WEGEST_MODE !== "http") return;

  const url = process.env.WEGEST_LEADS_URL?.replace(/\/$/, "");
  const key = process.env.WEGEST_LEADS_KEY;
  if (!url || !key) throw new WeGestError("unavailable", "Os pedidos de contacto ainda não estão ligados ao WeGest.", 503);

  const form = DRIVER_LEAD_FORMS[input.mode];
  const row = {
    nome: input.name,
    email: input.email,
    telefone: input.phone,
    zona: "",
    data_aluguer: null,
    tipo_viatura: input.mode === "slot" ? input.vehicle : null,
    observacoes: JSON.stringify(answers(input)),
    status: "novo",
    formulario_id: form.formId,
    campaign_tags: [form.campaign],
    tem_formacao_tvde: input.mode === "aluguer" ? input.hasTvdeLicense === "sim" : null,
  };

  const res = await fetch(`${url}/rest/v1/leads_dasprent`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(row),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!res.ok) {
    // Só o estado: a resposta pode repetir os dados enviados
    console.error(`[leads] o WeGest recusou o lead (${input.mode}): HTTP ${res.status}`);
    throw new WeGestError("upstream", "Não foi possível enviar o pedido. Tente novamente.", res.status);
  }
}
