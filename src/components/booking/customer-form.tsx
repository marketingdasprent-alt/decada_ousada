"use client";

import { useId } from "react";

import type { CustomerFormValues } from "@/lib/validation";

import { Field, Input, Select } from "../shared/form";

export const EMPTY_CUSTOMER: Required<CustomerFormValues> = {
  fullName: "",
  email: "",
  phone: "",
  birthDate: "",
  taxId: "",
  addressLine1: "",
  postalCode: "",
  city: "",
  country: "Portugal",
  licenseNumber: "",
  licenseCountry: "Portugal",
  licenseExpiresAt: "",
};

const COUNTRIES = ["Portugal", "Espanha", "França", "Alemanha", "Reino Unido", "Itália", "Países Baixos", "Bélgica", "Suíça", "Brasil", "Estados Unidos", "Canadá", "Outro"];

/** Ficha do cliente Rent a Car (doc §20). Enviada para o WeGest via backend. */
export function CustomerForm({
  values,
  errors,
  onChange,
  lockEmail,
}: {
  values: Required<CustomerFormValues>;
  errors: Record<string, string>;
  onChange: (patch: Partial<CustomerFormValues>) => void;
  lockEmail?: boolean;
}) {
  const id = useId();
  const f = (name: keyof CustomerFormValues) => ({
    id: `${id}-${name}`,
    name,
    value: values[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ [name]: e.target.value }),
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
  });

  return (
    <div className="space-y-8">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 font-semibold">Condutor principal</legend>
        <Field label="Nome completo" htmlFor={`${id}-fullName`} required error={errors.fullName} className="sm:col-span-2">
          <Input {...f("fullName")} autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor={`${id}-email`} required error={errors.email}>
          <Input {...f("email")} type="email" autoComplete="email" readOnly={lockEmail} />
        </Field>
        <Field label="Telefone" htmlFor={`${id}-phone`} required error={errors.phone}>
          <Input {...f("phone")} type="tel" autoComplete="tel" placeholder="+351 912 345 678" />
        </Field>
        <Field label="Data de nascimento" htmlFor={`${id}-birthDate`} required error={errors.birthDate}>
          <Input {...f("birthDate")} type="date" autoComplete="bday" />
        </Field>
        <Field label="NIF" htmlFor={`${id}-taxId`} error={errors.taxId} help="Opcional para clientes estrangeiros.">
          <Input {...f("taxId")} inputMode="numeric" maxLength={9} />
        </Field>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 font-semibold">Morada</legend>
        <Field label="Morada" htmlFor={`${id}-addressLine1`} error={errors.addressLine1} className="sm:col-span-2">
          <Input {...f("addressLine1")} autoComplete="street-address" />
        </Field>
        <Field label="Código postal" htmlFor={`${id}-postalCode`} error={errors.postalCode}>
          <Input {...f("postalCode")} className="max-w-field-short" autoComplete="postal-code" />
        </Field>
        <Field label="Localidade" htmlFor={`${id}-city`} error={errors.city}>
          <Input {...f("city")} autoComplete="address-level2" />
        </Field>
        <Field label="País de residência" htmlFor={`${id}-country`} required error={errors.country}>
          <Select {...f("country")}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</Select>
        </Field>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="mb-3 font-semibold">Carta de condução</legend>
        <Field label="Número da carta" htmlFor={`${id}-licenseNumber`} required error={errors.licenseNumber}>
          <Input {...f("licenseNumber")} />
        </Field>
        <Field label="País emissor" htmlFor={`${id}-licenseCountry`} required error={errors.licenseCountry}>
          <Select {...f("licenseCountry")}>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</Select>
        </Field>
        <Field label="Validade" htmlFor={`${id}-licenseExpiresAt`} required error={errors.licenseExpiresAt} help="Tem de ser válida até ao fim do aluguer.">
          <Input {...f("licenseExpiresAt")} type="date" />
        </Field>
      </fieldset>
    </div>
  );
}
