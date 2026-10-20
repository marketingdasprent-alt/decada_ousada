import type { AccountApplicationDraft, ID_DOCUMENT_TYPES } from "@/domain/customer/account";

import { normalizeIban, validIban, validNif } from "./dynamic-form";

/**
 * Regras dos campos da candidatura TVDE da conta. As mesmas no browser (mensagem junto ao campo)
 * e no servidor (PUT /api/account/application), para que nenhum valor sem formato válido chegue
 * ao WeGest. Confirmam o formato e os dígitos de controlo; que os dados são da pessoa é a equipa
 * que confirma com os documentos enviados.
 */

const LETTERS = /\p{L}/u;

/** "929 318 185" ou "929318185" → "+351 929318185"; o resto fica como foi escrito. */
export function normalizePhone(raw: string): string {
  const compact = raw.replace(/[\s-]/g, "");
  if (/^9\d{8}$/.test(compact)) return "+351 " + compact;
  if (/^00[1-9]/.test(compact)) return "+" + compact.slice(2);
  return raw.trim();
}

function phone(raw: string): string | null {
  const v = raw.replace(/[\s-]/g, "");
  if (!/^\+[1-9]\d{7,14}$/.test(v)) return "Indique o telemóvel com o indicativo do país, ex. +351 912 345 678.";
  if (v.startsWith("+351") && !/^\+3519[1236]\d{7}$/.test(v)) return "Um telemóvel português tem 9 dígitos e começa por 91, 92, 93 ou 96.";
  return null;
}

function name(raw: string): string | null {
  if (!/^[\p{L}][\p{L}' .-]*$/u.test(raw)) return "O nome só pode ter letras, espaços, hífen e apóstrofo.";
  if (raw.split(/\s+/).filter((part) => part.length > 1).length < 2) return "Indique o nome completo, com pelo menos um apelido.";
  return null;
}

function address(raw: string): string | null {
  if (raw.length < 5 || !LETTERS.test(raw)) return "Indique a morada completa: rua, número e andar.";
  return null;
}

function city(raw: string): string | null {
  return /^\p{L}[\p{L} .'-]+$/u.test(raw) ? null : "Indique a localidade só com letras.";
}

/** Cartão de cidadão completo (12 caracteres, ex. 12345678 9 ZZ1): controlo de módulo 10. */
function validCcNumber(cc: string): boolean {
  let sum = 0;
  for (let i = cc.length - 1, second = false; i >= 0; i--, second = !second) {
    let v = Number.parseInt(cc[i], 36);
    if (second) v = v * 2 > 9 ? v * 2 - 9 : v * 2;
    sum += v;
  }
  return sum % 10 === 0;
}

function idNumber(tipo: (typeof ID_DOCUMENT_TYPES)[number] | undefined, raw: string): string | null {
  const v = raw.replace(/[\s-]/g, "").toUpperCase();
  if (tipo === "cc") {
    if (/^\d{8,9}$/.test(v)) return null;
    if (/^\d{9}[A-Z]{2}\d$/.test(v)) return validCcNumber(v) ? null : "Este número de cartão de cidadão não é válido. Confirme os caracteres.";
    return "Indique o número do cartão de cidadão, ex. 12345678 9 ZZ1.";
  }
  if (tipo === "bi") return /^\d{6,9}$/.test(v) ? null : "O número do bilhete de identidade tem 6 a 9 dígitos.";
  if (tipo === "passaporte") return /^[A-Z0-9]{6,9}$/.test(v) ? null : "O número do passaporte tem 6 a 9 letras ou dígitos.";
  return /^[A-Z0-9]{5,15}$/.test(v) && /\d/.test(v) ? null : "Indique o número do documento só com letras e dígitos.";
}

/** Carta de condução portuguesa (ex. L-1234567 8) ou estrangeira: letras, dígitos e hífen, com dígitos. */
function licenceNumber(raw: string): string | null {
  return /^[A-Z0-9][A-Z0-9 /-]{3,19}$/i.test(raw) && /\d/.test(raw) ? null : "Indique o número da carta como está no documento, ex. L-1234567 8.";
}

function tvdeNumber(raw: string): string | null {
  return /^[A-Z0-9][A-Z0-9 ./-]{2,39}$/i.test(raw) && /\d/.test(raw) ? null : "Indique o número do certificado TVDE como está no documento.";
}

/** Erros por campo (chaves como no WeGest: "nif", "documento.numero"…). Só valida o que vem no rascunho. */
export function validateApplicationDraft(draft: AccountApplicationDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  const add = (key: string, error: string | null) => { if (error) errors[key] = error; };
  if (draft.nome) add("nome", name(draft.nome));
  if (draft.telefone) add("telefone", phone(draft.telefone));
  if (draft.nif) add("nif", validNif(draft.nif) ? null : "Este NIF não é válido. Confirme os 9 dígitos.");
  if (draft.morada) add("morada", address(draft.morada));
  if (draft.codigo_postal) add("codigo_postal", /^\d{4}-\d{3}$/.test(draft.codigo_postal) ? null : "Use o formato 0000-000.");
  if (draft.cidade) add("cidade", city(draft.cidade));
  if (draft.documento?.numero) add("documento.numero", idNumber(draft.documento.tipo, draft.documento.numero));
  if (draft.carta_conducao?.numero) add("carta_conducao.numero", licenceNumber(draft.carta_conducao.numero));
  if (draft.licenca_tvde?.numero) add("licenca_tvde.numero", tvdeNumber(draft.licenca_tvde.numero));
  if (draft.iban) add("iban", validIban(normalizeIban(draft.iban)) ? null : "Este IBAN não é válido. Confirme os caracteres, ex. PT50 0002 0123 1234 5678 9015 4.");
  return errors;
}
