"use client";

import { Check } from "lucide-react";
import type { HTMLAttributes } from "react";

import type { FormField } from "@/domain/application";
import { cn } from "@/lib/cn";
import { formatFieldValue, isRequired, isWaived, licenseCategories } from "@/lib/dynamic-form";

import { Checkbox, Field, Input, Select, Textarea } from "../shared/form";

/** Preenchimento automático do browser e teclado certo no telemóvel, pelos campos conhecidos. */
const INPUT_HINTS: Record<string, { autoComplete?: string; inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"] }> = {
  full_name: { autoComplete: "name" },
  email: { autoComplete: "email", inputMode: "email" },
  phone: { autoComplete: "tel", inputMode: "tel" },
  nif: { autoComplete: "off", inputMode: "numeric" },
  address: { autoComplete: "address-line1" },
  zip_code: { autoComplete: "postal-code", inputMode: "numeric" },
  city: { autoComplete: "address-level2" },
  iban: { autoComplete: "off" },
};

const chip = "flex min-h-11 cursor-pointer items-center gap-1.5 rounded-control border-2 px-4 py-2 text-body-small has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus";
const chipOn = "border-selected bg-selected-surface font-medium";

/**
 * Formulário dinâmico TVDE: os campos, tipos, validações e opções vêm da API (doc §51–52).
 * Campos do tipo "file" são tratados no passo de documentos.
 */
export function DynamicWeGestForm({
  fields,
  values,
  errors,
  onChange,
  onBlur,
  locked = {},
}: {
  fields: FormField[];
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  /** Ao sair de um campo (validação desse campo). */
  onBlur?: (field: string) => void;
  /** Campos que não se podem mudar, com a explicação (ex.: o email da conta de motorista). */
  locked?: Record<string, string>;
}) {
  // Campos dispensados (ex.: licença TVDE de quem está em formação) não aparecem
  const visible = fields.filter((f) => f.type !== "file" && !isWaived(f, values));
  const sections = [...new Set(visible.map((f) => f.section ?? "Dados"))];

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <fieldset key={section} className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 font-semibold">{section}</legend>
          {visible
            .filter((f) => (f.section ?? "Dados") === section)
            .map((f) => {
              const id = `f-${f.field}`;
              const required = isRequired(f, values);
              // Opcional dito no rótulo, para ninguém parar num campo que pode saltar
              const label = !required && f.type !== "checkbox" ? <>{f.label} <span className="font-normal text-copy-muted">(opcional)</span></> : f.label;
              const invalid = {
                "aria-invalid": errors[f.field] ? true : undefined,
                "aria-describedby": errors[f.field] ? `${id}-error` : undefined,
              };
              const common = { id, name: f.field, required, ...invalid, onBlur: () => onBlur?.(f.field) };
              const wide = f.type === "textarea" || f.type === "radio" || f.type === "chips" || f.field === "full_name" || f.field === "address";
              // Formato curto indicado pela API (ex.: código postal "0000-000"): campo curto
              const short = f.type === "text" && !!f.placeholder && f.placeholder.length <= 10;
              const error = errors[f.field] && <p id={`${id}-error`} className="mt-1.5 text-body-small text-negative">{errors[f.field]}</p>;

              if (f.type === "checkbox") {
                return (
                  <div key={f.field} className="sm:col-span-2">
                    <Checkbox label={f.label} name={f.field} checked={values[f.field] === "true"} {...invalid} onChange={(e) => onChange(f.field, e.target.checked ? "true" : "")} />
                    {error}
                  </div>
                );
              }

              if (f.type === "radio" || f.type === "chips") {
                const multi = f.type === "chips";
                const picked = multi ? licenseCategories(values[f.field] ?? "") : [values[f.field] ?? ""];
                const toggle = (v: string) => {
                  if (!multi) return onChange(f.field, v);
                  const next = picked.includes(v) ? picked.filter((p) => p !== v) : [...picked, v];
                  // Mesma ordem das opções, para o valor enviado ser estável
                  onChange(f.field, (f.options ?? []).map((o) => o.value).filter((o) => next.includes(o)).join(", "));
                };
                return (
                  <fieldset key={f.field} id={id} tabIndex={-1} className="sm:col-span-2" {...invalid}>
                    <legend className="mb-2 text-body-small font-medium text-copy-secondary">
                      {label}{required && <span className="text-brand" aria-hidden> *</span>}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {f.options?.map((o) => {
                        const on = picked.includes(o.value);
                        return (
                          <label key={o.value} className={cn(chip, on ? chipOn : "border-line", multi && "min-w-12 justify-center px-3")}>
                            <input type={multi ? "checkbox" : "radio"} name={f.field} value={o.value} checked={on} onChange={() => toggle(o.value)} className="sr-only" />
                            {/* O visto marca a escolha sem depender só da cor (uma ou várias) */}
                            {on && <Check className="size-3.5" aria-hidden />}
                            {o.label}
                          </label>
                        );
                      })}
                    </div>
                    {f.help && !errors[f.field] && <p className="mt-1.5 text-caption text-copy-muted">{f.help}</p>}
                    {error}
                  </fieldset>
                );
              }

              return (
                <Field key={f.field} label={label} htmlFor={id} required={required} error={errors[f.field]} help={locked[f.field] ?? f.help} className={wide ? "sm:col-span-2" : undefined}>
                  {f.type === "select" ? (
                    <Select {...common} value={values[f.field] ?? ""} onChange={(e) => onChange(f.field, e.target.value)}>
                      <option value="">Selecione…</option>
                      {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Select>
                  ) : f.type === "textarea" ? (
                    <Textarea {...common} placeholder={f.placeholder} maxLength={f.validation?.maxLength} value={values[f.field] ?? ""} onChange={(e) => onChange(f.field, e.target.value)} />
                  ) : (
                    <Input
                      {...common}
                      {...INPUT_HINTS[f.field]}
                      type={f.type}
                      className={cn(short && "max-w-field-short", locked[f.field] && "bg-panel-sunken text-copy-secondary")}
                      readOnly={f.field in locked}
                      placeholder={f.placeholder}
                      min={f.validation?.min}
                      max={f.validation?.max}
                      maxLength={f.format === "iban" ? 42 : f.validation?.maxLength}
                      value={values[f.field] ?? ""}
                      onChange={(e) => onChange(f.field, formatFieldValue(f.format, e.target.value))}
                    />
                  )}
                </Field>
              );
            })}
        </fieldset>
      ))}
    </div>
  );
}
