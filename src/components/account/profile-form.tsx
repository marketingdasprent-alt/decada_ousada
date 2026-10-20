"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { CustomerType } from "@/domain/customer";
import { driverAuthEnabled } from "@/lib/driver-account";
import { currentDriverToken } from "@/lib/driver-auth-client";
import { apiFetch } from "@/lib/fetcher";
import { customerSchema, type CustomerFormValues } from "@/lib/validation";

import { CustomerForm, EMPTY_CUSTOMER } from "../booking/customer-form";
import { Notice } from "../shared/states";
import { Button, Card } from "../shared/ui";

/**
 * Ficha de cliente. `create`: ainda não há ficha (cliente Rent a Car antes da primeira reserva); o
 * POST cria-a e a página volta a ler-se do WeGest. Sem `create`, atualiza a ficha existente.
 */
export function ProfileForm({ initial, type, create = false }: { initial: Partial<CustomerFormValues>; type: CustomerType; create?: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState({ ...EMPTY_CUSTOMER, ...Object.fromEntries(Object.entries(initial).filter(([, v]) => v)) });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ tone: "ok" | "danger"; text: string } | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const parsed = customerSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[i.path.join(".")] ??= i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaving(true);
    const { email: _email, ...customer } = parsed.data;
    void _email;
    // Conta WeGest: a ficha nova vai pela conta, por isso segue o token da sessão (nunca é guardado)
    const token = create && driverAuthEnabled() ? await currentDriverToken() : null;
    const res = create
      ? await apiFetch("/api/customers/me", { method: "POST", body: JSON.stringify({ customer }), headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      : await apiFetch("/api/customers/me", { method: "PATCH", body: JSON.stringify({ type, customer }) });
    setSaving(false);
    if (res.ok) {
      setStatus({ tone: "ok", text: create ? "Ficha guardada no nosso sistema de gestão." : "Dados atualizados no nosso sistema de gestão." });
      // A página volta a ler a ficha do WeGest; o formulário mantém-se, já em modo de edição
      if (create) router.refresh();
    }
    else {
      if (res.error.fieldErrors) setErrors(res.error.fieldErrors);
      setStatus({ tone: "danger", text: res.error.message });
    }
  }

  return (
    <form onSubmit={save} noValidate>
      <Card className="p-5 sm:p-6">
        <CustomerForm values={form} errors={errors} onChange={(p) => setForm((f) => ({ ...f, ...p }))} lockEmail />
      </Card>
      {status && <Notice tone={status.tone} className="mt-4">{status.text}</Notice>}
      <div className="mt-6 flex justify-end">
        <Button type="submit" loading={saving}>{create ? "Guardar dados" : "Guardar alterações"}</Button>
      </div>
    </form>
  );
}
