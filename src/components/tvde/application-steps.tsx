"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { ApplicationDocument, DocumentRequirement, FormField } from "@/domain/application";
import { formatMoney } from "@/domain/pricing";
import { track } from "@/lib/analytics";
import { validateDynamicForm } from "@/lib/dynamic-form";
import { apiFetch } from "@/lib/fetcher";

import { PaymentForm, type PaymentDraft } from "../payment/payment-form";
import { Checkbox, ErrorSummary } from "../shared/form";
import { Notice } from "../shared/states";
import { Button, buttonClass, Card, disabledButtonClass } from "../shared/ui";
import { DocumentUploader } from "./document-uploader";
import { DynamicWeGestForm } from "./dynamic-form";

/** Passo 2: cadastro do motorista com a ficha dinâmica do WeGest. */
export function RegistrationStep({
  fields,
  initial,
  vehicleId,
  pickupAt,
  pickupLocationId,
}: {
  fields: FormField[];
  initial: Record<string, string>;
  vehicleId: string;
  pickupAt: string;
  pickupLocationId: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateDynamicForm(fields, values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await apiFetch<{ applicationId: string }>("/api/tvde/applications", {
      method: "POST",
      body: JSON.stringify({ vehicleId, pickupAt, pickupLocationId, formData: values }),
    });
    if (res.ok) {
      track("tvde_application_started", { vehicleId, applicationId: res.data.applicationId });
      router.push(`/tvde/candidatura/documentos?id=${encodeURIComponent(res.data.applicationId)}`);
      return;
    }
    setSubmitting(false);
    if (res.error.fieldErrors) setErrors(res.error.fieldErrors);
    setError(res.error.message);
  }

  return (
    <form onSubmit={submit} noValidate>
      <Card className="p-5 sm:p-6">
        <DynamicWeGestForm fields={fields} values={values} errors={errors} onChange={(f, v) => setValues((s) => ({ ...s, [f]: v }))} />
      </Card>
      {error && <Notice tone="danger" className="mt-4">{error}</Notice>}
      <ErrorSummary count={Object.keys(errors).length} className="mt-4" />
      <div className="mt-6 flex justify-end">
        <Button type="submit" size="lg" className="max-sm:w-full" loading={submitting}>Guardar e continuar</Button>
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
          O pagamento do sinal ou caução não representa aprovação automática da candidatura. A candidatura será analisada pela DÉCADA OUSADA. Caso não seja aprovada, o valor pago será devolvido de acordo com o procedimento aplicável.
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
