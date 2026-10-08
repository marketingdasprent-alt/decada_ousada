import type { FormField } from "@/domain/application";

/** "Nome completo" → "nome completo"; siglas como "NIF" ficam como estão. */
function lowerLabel(label: string): string {
  return /^[A-ZÀ-Ý]{2}/.test(label) ? label : label.charAt(0).toLowerCase() + label.slice(1);
}

/**
 * Validação do formulário dinâmico TVDE, definida pela API (doc §51–52).
 * Usada no browser (UX) e no servidor (segurança) com as mesmas regras.
 */
export function validateDynamicForm(fields: FormField[], data: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    if (f.type === "file") continue;
    const raw = (data[f.field] ?? "").trim();
    if (!raw) {
      if (f.required) {
        errors[f.field] =
          f.type === "checkbox" ? "Tem de confirmar para continuar."
          : f.type === "select" || f.type === "radio" ? `Escolha ${lowerLabel(f.label)}.`
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
