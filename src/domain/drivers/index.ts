/**
 * Recrutamento de motoristas TVDE (página /motoristas). Factos, contactos e prazos vindos
 * da landing de motoristas da equipa, confirmados pela DÉCADA OUSADA em 2026-10-12
 * (DECISIONS.md). Não acrescentar números, prémios ou promessas sem nova confirmação.
 */

/** Contactos da equipa de motoristas (diferentes dos contactos gerais por região). */
export const DRIVER_CONTACT = {
  phone: "+351 912 023 234",
  phoneHref: "tel:+351912023234",
  whatsappHref: "https://wa.me/351912023234",
  email: "motoristas.tvde@decadaousada.pt",
} as const;

export type DriverMode = "aluguer" | "slot";

/**
 * Formulários de candidatura alojados no WeGest. Abrem noutro separador: o WeGest envia
 * X-Frame-Options: DENY, por isso não podem ficar dentro da página.
 */
export const DRIVER_FORMS: Record<DriverMode, string> = {
  aluguer: "https://www.wegest.pt/formulario/4588f264-ce79-40fa-9827-b985af4ee68e",
  slot: "https://www.wegest.pt/formulario/e5aa523d-ae86-43bf-8985-780c1fc943b8",
};

/** Área do motorista no WeGest (para quem já trabalha com a DÉCADA OUSADA). */
export const DRIVER_AREA_URL = "https://wegest.pt/motorista/login";
