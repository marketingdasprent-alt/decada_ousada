import { DRIVER_FORM_OPEN, DRIVER_FORMS, type DriverMode } from "@/domain/drivers";

/**
 * Atributos de um botão de candidatura: o link vai sempre para o formulário do WeGest (funciona
 * sem JavaScript). Com DRIVER_FORM_OPEN = "popup", o DriverApplyDialog interceta o clique pelo
 * `data-candidatura` e abre o formulário num popup.
 */
export function applyLink(mode: DriverMode) {
  return { href: DRIVER_FORMS[mode], target: "_blank", rel: "noopener noreferrer", "data-candidatura": mode } as const;
}

/** Texto para leitores de ecrã quando o link abre noutro separador. */
export const opensNewTab = DRIVER_FORM_OPEN === "tab";
