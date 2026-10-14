/**
 * Recrutamento de motoristas TVDE (página /motoristas). Factos, contactos e prazos vindos
 * da landing de motoristas da equipa, confirmados pela DÉCADA OUSADA em 2026-10-12
 * (DECISIONS.md). Não acrescentar números, prémios ou promessas sem nova confirmação.
 */

/** Contactos da equipa de motoristas (diferentes dos contactos gerais por região). */
export const DRIVER_CONTACT = {
  phone: "+351 910 102 454",
  phoneHref: "tel:+351910102454",
  whatsappHref: "https://wa.me/351910102454",
  email: "motoristas.tvde@decadaousada.pt",
} as const;

export type DriverMode = "aluguer" | "slot";

/**
 * Formulários alojados no WeGest: a alternativa enquanto a ligação dos leads não está
 * configurada, ou se o envio no site falhar. Abrem noutro separador (o WeGest envia
 * X-Frame-Options: DENY, por isso não podem ficar dentro da página).
 */
export const DRIVER_FORMS: Record<DriverMode, string> = {
  aluguer: "https://www.wegest.pt/formulario/4588f264-ce79-40fa-9827-b985af4ee68e",
  slot: "https://www.wegest.pt/formulario/e5aa523d-ae86-43bf-8985-780c1fc943b8",
};

/**
 * Formulários de motoristas no site (DECISIONS.md 2026-10-13): os mesmos campos dos formulários
 * do WeGest e o lead entra no WeGest com o mesmo formulário e a mesma campanha, para a equipa o
 * ver no mesmo sítio. `formId` é o id desses formulários.
 */
export const DRIVER_LEAD_FORMS: Record<DriverMode, { formId: string; campaign: string }> = {
  aluguer: { formId: "4588f264-ce79-40fa-9827-b985af4ee68e", campaign: "TVDE GERAL" },
  slot: { formId: "e5aa523d-ae86-43bf-8985-780c1fc943b8", campaign: "SLOT" },
};

/**
 * O que mostra a secção de candidatura de /motoristas:
 *   "links" → os botões diretos para os formulários do WeGest, iguais aos do topo (pedido da
 *             equipa, 2026-10-13)
 *   "embed" → os formulários do WeGest incorporados (?embed=1), com o botão para os abrir
 *             noutro separador se o WeGest não deixar incorporar
 *   "site"  → os formulários do próprio site, que gravam o lead no WeGest (DriverLeadForm)
 */
export const DRIVER_FORM_KIND: "links" | "embed" | "site" = "links";

/**
 * Como abrem os botões de candidatura de /motoristas (data-candidatura):
 *   "tab"   → o formulário do WeGest diretamente, noutro separador (pedido da equipa, 2026-10-13:
 *             enquanto o WeGest não deixar incorporar, o popup só acrescentava um passo)
 *   "popup" → o formulário incorporado num popup na mesma página (DriverApplyDialog). Ativo
 *             desde 2026-10-13: o WeGest passou a permitir a incorporação (frame-ancestors *)
 */
export const DRIVER_FORM_OPEN: "tab" | "popup" = "popup";

/** Área do motorista no WeGest (para quem já trabalha com a DÉCADA OUSADA). */
export const DRIVER_AREA_URL = "https://www.wegest.pt/motorista/login";
