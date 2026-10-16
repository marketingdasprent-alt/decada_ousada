import type { FieldCheck, FormField } from "@/domain/application";

/** "Nome completo" → "nome completo"; siglas como "NIF" ficam como estão. */
function lowerLabel(label: string): string {
  return /^[A-ZÀ-Ý]{2}/.test(label) ? label : label.charAt(0).toLowerCase() + label.slice(1);
}

/** Hoje em Lisboa, AAAA-MM-DD (as datas da ficha não têm hora). */
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" }).format(new Date());

/** NIF português: 9 dígitos e dígito de controlo (módulo 11). */
function validNif(nif: string): boolean {
  if (!/^[1-9]\d{8}$/.test(nif)) return false;
  const sum = [...nif.slice(0, 8)].reduce((acc, d, i) => acc + Number(d) * (9 - i), 0);
  const check = 11 - (sum % 11);
  return (check >= 10 ? 0 : check) === Number(nif[8]);
}

/** IBAN: país, dígitos de controlo e módulo 97 (ISO 13616). Um IBAN português tem 25 caracteres. */
export const normalizeIban = (iban: string) => iban.replace(/\s+/g, "").toUpperCase();
function validIban(raw: string): boolean {
  const iban = normalizeIban(raw);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban) || (iban.startsWith("PT") && iban.length !== 25)) return false;
  const digits = (iban.slice(4) + iban.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rest = 0;
  for (const d of digits) rest = (rest * 10 + Number(d)) % 97;
  return rest === 1;
}

/** Formatação enquanto se escreve: "1200192" → "1200-192"; IBAN em grupos de 4. */
export function formatFieldValue(format: FormField["format"], value: string): string {
  if (format === "postal_code") {
    const d = value.replace(/\D/g, "").slice(0, 7);
    return d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
  }
  if (format === "iban") return normalizeIban(value).replace(/[^A-Z0-9]/g, "").slice(0, 34).replace(/(.{4})(?=.)/g, "$1 ");
  return value;
}

export const licenseCategories = (raw: string) => raw.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);

const CHECKS: Record<FieldCheck, { test: (v: string) => boolean; message: string }> = {
  phone_intl: { test: (v) => /^\+[1-9](?: ?[0-9]){7,14}$/.test(v), message: "Indique o telefone com o indicativo do país, ex. +351 912 345 678." },
  nif: { test: validNif, message: "Este NIF não é válido. Confirme os 9 dígitos." },
  iban: { test: validIban, message: "Este IBAN não é válido. Confirme os caracteres, ex. PT50 0002 0123 1234 5678 9015 4." },
  after_today: { test: (v) => v > today(), message: "A validade tem de ser depois de hoje." },
  includes_b: { test: (v) => licenseCategories(v).includes("B"), message: "As categorias têm de incluir a B." },
};

/** Obrigatório neste envio: `required`, ou `requiredUnless` com a caixa desmarcada. */
export const isRequired = (f: FormField, data: Record<string, string>) => f.required || (!!f.requiredUnless && data[f.requiredUnless] !== "true");

/** Campo que deixa de contar (ex.: licença TVDE de quem está em formação). */
export const isWaived = (f: FormField, data: Record<string, string>) => !!f.requiredUnless && data[f.requiredUnless] === "true";

/**
 * Validação do formulário dinâmico TVDE, definida pela API (doc §51–52).
 * Usada no browser (UX) e no servidor (segurança) com as mesmas regras.
 */
export function validateDynamicForm(fields: FormField[], data: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    if (f.type === "file" || isWaived(f, data)) continue;
    const raw = (data[f.field] ?? "").trim();
    if (!raw) {
      if (isRequired(f, data)) {
        errors[f.field] =
          f.validation?.requiredMessage ? f.validation.requiredMessage
          : f.type === "checkbox" ? "Tem de confirmar para continuar."
          : f.type === "select" || f.type === "radio" || f.type === "chips" ? `Escolha ${lowerLabel(f.label)}.`
          : `Indique ${lowerLabel(f.label)}.`;
      }
      continue;
    }
    const v = f.validation;
    if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) errors[f.field] = "Indique um email válido, por exemplo nome@exemplo.pt.";
    else if (v?.pattern && !new RegExp(v.pattern).test(raw)) errors[f.field] = v.patternMessage ?? `Verifique ${lowerLabel(f.label)}.`;
    else if (v?.minLength && raw.length < v.minLength) errors[f.field] = `Mínimo ${v.minLength} caracteres.`;
    else if (v?.maxLength && raw.length > v.maxLength) errors[f.field] = `Máximo ${v.maxLength} caracteres.`;
    else if (f.type === "date" && v?.max && raw > String(v.max)) errors[f.field] = f.help ?? "Data fora do intervalo permitido.";
    else if (f.type === "date" && v?.min && raw < String(v.min)) errors[f.field] = "Data fora do intervalo permitido.";
    else if ((f.type === "select" || f.type === "radio") && f.options && !f.options.some((o) => o.value === raw)) errors[f.field] = `Escolha uma das opções em ${lowerLabel(f.label)}.`;
    else if (f.type === "chips" && f.options && !licenseCategories(raw).every((c) => f.options!.some((o) => o.value === c))) errors[f.field] = `Escolha uma das opções em ${lowerLabel(f.label)}.`;
    else if (v?.check && !CHECKS[v.check].test(raw)) errors[f.field] = CHECKS[v.check].message;
  }
  return errors;
}

/** Campos conhecidos da ficha → usados para criar/atualizar o motorista no WeGest. */
export const KNOWN_FIELD_MAP = {
  full_name: "fullName",
  email: "email",
  phone: "phone",
  birth_date: "birthDate",
  nif: "taxId",
  address: "addressLine1",
  zip_code: "postalCode",
  city: "city",
  license_number: "licenseNumber",
  license_expiry: "licenseExpiresAt",
} as const;
