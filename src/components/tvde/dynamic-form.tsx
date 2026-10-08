"use client";

import type { FormField } from "@/domain/application";
import { cn } from "@/lib/cn";

import { Checkbox, Field, Input, Select, Textarea } from "../shared/form";

/**
 * Formulário dinâmico TVDE: os campos, tipos, validações e opções vêm da API (doc §51–52).
 * Campos do tipo "file" são tratados no passo de documentos.
 */
export function DynamicWeGestForm({
  fields,
  values,
  errors,
  onChange,
}: {
  fields: FormField[];
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}) {
  const sections = [...new Set(fields.filter((f) => f.type !== "file").map((f) => f.section ?? "Dados"))];

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <fieldset key={section} className="grid gap-4 sm:grid-cols-2">
          <legend className="mb-3 font-semibold">{section}</legend>
          {fields
            .filter((f) => f.type !== "file" && (f.section ?? "Dados") === section)
            .map((f) => {
              const id = `f-${f.field}`;
              const common = {
                id,
                name: f.field,
                required: f.required,
                "aria-invalid": errors[f.field] ? true : undefined,
                "aria-describedby": errors[f.field] ? `${id}-error` : undefined,
              };
              const wide = f.type === "textarea" || f.type === "radio" || f.field === "full_name" || f.field === "address";
              // Formato curto indicado pela API (ex.: código postal "0000-000"): campo curto
              const short = f.type === "text" && !!f.placeholder && f.placeholder.length <= 10;

              if (f.type === "checkbox") {
                return (
                  <div key={f.field} className="sm:col-span-2">
                    <Checkbox label={f.label} checked={values[f.field] === "true"} onChange={(e) => onChange(f.field, e.target.checked ? "true" : "")} />
                    {errors[f.field] && <p id={`${id}-error`} className="mt-1.5 text-body-small text-negative">{errors[f.field]}</p>}
                  </div>
                );
              }

              if (f.type === "radio") {
                return (
                  <fieldset key={f.field} className="sm:col-span-2" aria-invalid={errors[f.field] ? true : undefined} aria-describedby={errors[f.field] ? `${f.field}-error` : undefined}>
                    <legend className="mb-2 text-body-small font-medium text-copy-secondary">
                      {f.label}{f.required && <span className="text-brand" aria-hidden> *</span>}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {f.options?.map((o) => (
                        <label key={o.value} className={cn("flex min-h-11 cursor-pointer items-center rounded-control border-2 px-4 py-2 text-body-small has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus", values[f.field] === o.value ? "border-selected bg-selected-surface font-medium" : "border-line")}>
                          <input type="radio" name={f.field} value={o.value} checked={values[f.field] === o.value} onChange={() => onChange(f.field, o.value)} className="sr-only" />
                          {o.label}
                        </label>
                      ))}
                    </div>
                    {errors[f.field] && <p id={`${f.field}-error`} className="mt-1.5 text-body-small text-negative">{errors[f.field]}</p>}
                  </fieldset>
                );
              }

              return (
                <Field key={f.field} label={f.label} htmlFor={id} required={f.required} error={errors[f.field]} help={f.help} className={wide ? "sm:col-span-2" : undefined}>
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
                      type={f.type}
                      className={short ? "max-w-field-short" : undefined}
                      placeholder={f.placeholder}
                      min={f.validation?.min}
                      max={f.validation?.max}
                      maxLength={f.validation?.maxLength}
                      value={values[f.field] ?? ""}
                      onChange={(e) => onChange(f.field, e.target.value)}
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
