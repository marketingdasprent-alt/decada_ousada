"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { ApplicationDocument, DocumentRequirement, FormField } from "@/domain/application";
import { formatMoney } from "@/domain/pricing";
import { track } from "@/lib/analytics";
import { validateDynamicForm } from "@/lib/dynamic-form";
import { cn } from "@/lib/cn";
import { apiFetch } from "@/lib/fetcher";

import { PaymentForm, type PaymentDraft } from "../payment/payment-form";
import { Checkbox, ErrorSummary } from "../shared/form";
import { Notice } from "../shared/states";
import { Button, buttonClass, Card, disabledButtonClass } from "../shared/ui";
import { DocumentUploader } from "./document-uploader";
import { DynamicWeGestForm } from "./dynamic-form";

/** Partes da ficha, pela ordem dos campos. Sem `step` nos campos, a ficha é uma só parte. */
function partsOf(fields: FormField[]): Array<{ name: string; fields: FormField[] }> {
  const names = [...new Set(fields.map((f) => f.step ?? ""))];
  return names.map((name) => ({ name, fields: fields.filter((f) => (f.step ?? "") === name) }));
}

const without = (o: Record<string, string>, key: string) => Object.fromEntries(Object.entries(o).filter(([k]) => k !== key));

const focusFirstError = () => requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());

/** Partes da ficha: barras curtas com o nome de cada parte. */
function PartProgress({ parts, current }: { parts: string[]; current: number }) {
  return (
    <ol className="mb-6 flex gap-2" aria-label={`Parte ${current + 1} de ${parts.length}`}>
      {parts.map((name, i) => (
        <li key={name} className="min-w-0 flex-1" aria-current={i === current ? "step" : undefined}>
          <span className={cn("block h-1 rounded-pill", i <= current ? "bg-brand" : "bg-line")} aria-hidden />
          <span className={cn("mt-2 block text-caption", i === current ? "font-semibold text-copy" : "text-copy-muted", i !== current && "max-sm:sr-only")}>{name}</span>
        </li>
      ))}
    </ol>
  );
}

/** Passo 2: cadastro do motorista com a ficha dinâmica do WeGest, em partes curtas. */
export function RegistrationStep({
  fields,
  initial,
  vehicleId,
  pickupAt,
  pickupLocationId,
  driverAccount = false,
  loginHref,
}: {
  fields: FormField[];
  initial: Record<string, string>;
  vehicleId: string;
  pickupAt: string;
  pickupLocationId: string;
  /** Contas de motorista (WeGest): envia o token da conta e fixa o email no da conta. */
  driverAccount?: boolean;
  loginHref?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() => ({
    ...Object.fromEntries(fields.filter((f) => f.defaultValue).map((f) => [f.field, f.defaultValue!])),
    ...initial,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [part, setPart] = useState(0);
  const top = useRef<HTMLDivElement>(null);

  const parts = partsOf(fields);
  const last = part === parts.length - 1;
  const current = parts[part] ?? parts[0];

  function goTo(i: number) {
    setPart(i);
    // Novo ecrã: o topo da ficha fica à vista e o leitor de ecrã anuncia a parte
    requestAnimationFrame(() => {
      top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      top.current?.focus({ preventScroll: true });
    });
  }

  function change(field: string, value: string) {
    setValues((s) => ({ ...s, [field]: value }));
    if (errors[field]) setErrors((prev) => without(prev, field));
  }

  // Ao sair de um campo preenchido, diz logo o que está mal (um campo vazio só no fim da parte)
  function blur(field: string) {
    const f = fields.find((x) => x.field === field);
    if (!f || !(values[field] ?? "").trim()) return;
    const msg = validateDynamicForm([f], values)[field];
    setErrors((prev) => (msg ? { ...prev, [field]: msg } : without(prev, field)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!last) {
      const errs = validateDynamicForm(current.fields, values);
      setErrors(errs);
      if (Object.keys(errs).length) return focusFirstError();
      return goTo(part + 1);
    }
    const errs = validateDynamicForm(fields, values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      // Um erro numa parte anterior (ex.: dados mudados ao voltar atrás) leva a essa parte
      const back = parts.findIndex((p) => p.fields.some((f) => errs[f.field]));
      if (back >= 0 && back !== part) setPart(back);
      return focusFirstError();
    }
    setSubmitting(true);
    setError(null);
    setSessionEnded(false);
    const body = JSON.stringify({ vehicleId, pickupAt, pickupLocationId, formData: values });
    const send = (token?: string | null) =>
      apiFetch<{ applicationId: string }>("/api/tvde/applications", { method: "POST", body, headers: token ? { Authorization: `Bearer ${token}` } : undefined });

    let res;
    if (driverAccount) {
      // O token lê-se na hora (o supabase-js renova-o); com a sessão expirada, renova e repete uma vez
      const { currentDriverToken, driverAuth, signOutDriver } = await import("@/lib/driver-auth-client");
      res = await send(await currentDriverToken());
      if (!res.ok && res.error.reason === "session_expired") {
        const { data } = await driverAuth().auth.refreshSession();
        if (data.session) res = await send(data.session.access_token);
      }
      if (!res.ok && res.error.reason === "session_expired") {
        // Termina as duas sessões, para "Entrar de novo" mostrar o login
        await signOutDriver();
        setSessionEnded(true);
      }
    } else {
      res = await send();
    }
    if (res.ok) {
      track("tvde_application_started", { vehicleId, applicationId: res.data.applicationId });
      router.push(`/tvde/candidatura/documentos?id=${encodeURIComponent(res.data.applicationId)}`);
      return;
    }
    setSubmitting(false);
    if (res.error.fieldErrors) {
      const fe = res.error.fieldErrors;
      setErrors(fe);
      const back = parts.findIndex((p) => p.fields.some((f) => fe[f.field]));
      if (back >= 0 && back !== part) setPart(back);
    }
    setError(res.error.message);
  }

  return (
    <form onSubmit={submit} noValidate>
      <div ref={top} tabIndex={-1} className="scroll-mt-24 focus:outline-none">
        {parts.length > 1 && <PartProgress parts={parts.map((p) => p.name)} current={part} />}
      </div>
      <Card className="p-5 sm:p-6">
        <DynamicWeGestForm
          fields={current.fields}
          values={values}
          errors={errors}
          onChange={change}
          onBlur={blur}
          locked={driverAccount ? { email: "O email da sua conta de motorista." } : undefined}
        />
      </Card>
      {error && (
        <Notice tone="danger" className="mt-4">
          {error}
          {sessionEnded && loginHref && (
            <>
              {" "}
              <a href={loginHref} className="font-semibold underline">Entrar de novo</a>
            </>
          )}
        </Notice>
      )}
      <ErrorSummary count={Object.keys(errors).length} className="mt-4" />
      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        {part > 0 ? (
          <Button type="button" variant="ghost" size="lg" className="max-sm:w-full" onClick={() => goTo(part - 1)} disabled={submitting}>Voltar</Button>
        ) : <span aria-hidden />}
        <Button type="submit" size="lg" className="max-sm:w-full" loading={submitting}>
          {last ? "Guardar e continuar" : "Continuar"}
        </Button>
      </div>
    </form>
  );
}

/** Passo 3: documentos obrigatórios. */
export function DocumentsStep({ applicationId, requirements, documents }: { applicationId: string; requirements: DocumentRequirement[]; documents: ApplicationDocument[] }) {
  const [docs, setDocs] = useState(documents);
  const missing = requirements.filter((r) => r.required && !docs.some((d) => d.type === r.type));
  return (
    <div>
      <DocumentUploader applicationId={applicationId} requirements={requirements} documents={docs} onChange={(d) => setDocs(d)} />
      <div className="mt-6 flex flex-col items-end gap-2">
        {missing.length > 0 && <p className="text-body-small text-copy-muted">Falta enviar: {missing.map((m) => m.label).join(", ")}.</p>}
        {missing.length === 0 ? (
          <Link href={`/tvde/candidatura/pagamento?id=${encodeURIComponent(applicationId)}`} className={buttonClass("primary", "lg", "max-sm:w-full")}>
            Continuar para pagamento
          </Link>
        ) : (
          <span className={disabledButtonClass("lg", "max-sm:w-full")} aria-disabled>Continuar para pagamento</span>
        )}
      </div>
    </div>
  );
}

/** Passo 4: sinal/caução, com aviso obrigatório de aprovação condicionada (doc §46). */
export function TvdePaymentStep({ applicationId, amount }: { applicationId: string; amount: number }) {
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentDraft>({ method: "card", token: "", valid: false });
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const key = useRef("");
  useEffect(() => {
    key.current = crypto.randomUUID();
  }, []);

  async function pay() {
    setSubmitting(true);
    setError(null);
    track("tvde_payment_started", { applicationId, method: payment.method });
    const res = await apiFetch(`/api/tvde/applications/${applicationId}/payment`, {
      method: "POST",
      timeoutMs: 45_000,
      body: JSON.stringify({ payment: { method: payment.method, token: payment.token, phone: payment.phone }, acceptConditional: accepted, idempotencyKey: key.current }),
    });
    if (res.ok) {
      track("tvde_payment_completed", { applicationId, method: payment.method });
      router.push(`/tvde/candidatura/confirmacao?id=${encodeURIComponent(applicationId)}`);
      return;
    }
    setSubmitting(false);
    setError(res.error.message);
    if (res.status !== 0 && res.status < 500) key.current = crypto.randomUUID();
  }

  return (
    <div>
      <Card className="p-5 sm:p-6">
        <PaymentForm onChange={setPayment} />
      </Card>
      <div className="mt-6 rounded-panel border-2 border-caution/40 bg-caution-surface p-5">
        <p className="font-semibold text-copy">Importante</p>
        <p className="mt-1 text-body-small text-copy-secondary">
          O sinal confirma a reserva da viatura e é descontado na caução no levantamento. O pagamento do sinal não representa aprovação automática da candidatura. A candidatura será analisada pela DÉCADA OUSADA. Caso não seja aprovada, o valor pago será devolvido de acordo com o procedimento aplicável.
        </p>
        <Checkbox className="mt-4 font-medium text-copy" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} label="Compreendo e aceito esta condição." />
      </div>
      {error && <Notice tone="danger" className="mt-4">{error}</Notice>}
      <div className="mt-6 flex justify-end">
        <Button size="lg" className="max-sm:w-full" onClick={pay} loading={submitting} disabled={!payment.valid || !accepted}>
          {submitting ? "A processar…" : `Pagar ${formatMoney(amount)} e enviar candidatura`}
        </Button>
      </div>
    </div>
  );
}
