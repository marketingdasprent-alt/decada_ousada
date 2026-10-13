"use client";

import Script from "next/script";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";

import { DRIVER_FORMS, type DriverMode } from "@/domain/drivers";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { apiFetch } from "@/lib/fetcher";
import { driverLeadSchema } from "@/lib/validation";

import { ErrorSummary, Field, FieldError, Input, Textarea } from "../shared/form";
import { Button } from "../shared/ui";

import { ModeSwitch, useModeFromHash } from "./mode-switch";

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

type Values = Record<string, string>;
const EMPTY: Values = { name: "", email: "", phone: "", hasTvdeLicense: "", notes: "", worksTvde: "", vehicle: "", website: "" };

/**
 * Formulários de motoristas (Aluguer = TVDE GERAL, Slot = SLOT) dentro do site, com os campos
 * dos formulários do WeGest. Envia para /api/motoristas/lead, que verifica o CAPTCHA e grava o
 * lead no WeGest. Sem licença TVDE o Aluguer não avança, como no formulário do WeGest.
 */
export function DriverLeadForm({ siteKey }: { siteKey?: string }) {
  const uid = useId();
  const [mode, setMode] = useState<DriverMode>("aluguer");
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [failMessage, setFailMessage] = useState("");
  const [token, setToken] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const captchaBox = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);

  useModeFromHash(setMode);

  const renderCaptcha = useCallback(() => {
    if (!siteKey || !captchaBox.current || !window.turnstile || widget.current) return;
    widget.current = window.turnstile.render(captchaBox.current, {
      sitekey: siteKey,
      language: "pt-PT",
      theme: "light",
      callback: (t: string) => setToken(t),
      "expired-callback": () => setToken(""),
      "error-callback": () => setToken(""),
    });
  }, [siteKey]);

  // O script pode já estar carregado (navegação no site): desenha o widget sem esperar pelo onLoad
  useEffect(() => {
    renderCaptcha();
    return () => {
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, [renderCaptcha]);

  const set = (key: string) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key])
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
  };

  const noLicense = mode === "aluguer" && values.hasTvdeLicense === "nao";
  const id = (name: string) => `${uid}-${name}`;
  const invalid = (name: string) => (errors[name] ? { "aria-invalid": true as const, "aria-describedby": `${id(name)}-error` } : {});

  async function submit(e: FormEvent) {
    e.preventDefault();
    const payload = mode === "aluguer"
      ? { mode, name: values.name, email: values.email, phone: values.phone, hasTvdeLicense: values.hasTvdeLicense, notes: values.notes, website: values.website, captcha: token }
      : { mode, name: values.name, email: values.email, phone: values.phone, worksTvde: values.worksTvde, vehicle: values.vehicle, website: values.website, captcha: token };

    const parsed = driverLeadSchema.safeParse(payload);
    const fieldErrors: Record<string, string> = {};
    if (!parsed.success) for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    if (siteKey && !token) fieldErrors.captcha = "Confirme que não é um robô.";
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      // O foco vai para o primeiro campo inválido, que lê o seu próprio erro
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')?.focus());
      return;
    }

    setStatus("sending");
    const res = await apiFetch<{ received: boolean }>("/api/motoristas/lead", { method: "POST", body: JSON.stringify(payload) });
    if (res.ok) {
      track("drivers_lead_submitted", { mode });
      setStatus("sent");
      return;
    }
    if (widget.current && window.turnstile) window.turnstile.reset(widget.current);
    setToken("");
    if (res.error.fieldErrors && Object.keys(res.error.fieldErrors).length) {
      setErrors(res.error.fieldErrors);
      setStatus("idle");
      return;
    }
    setFailMessage(res.error.message);
    setStatus("failed");
  }

  if (status === "sent") {
    return (
      <div className="rounded-panel border border-line bg-panel p-6 sm:p-8" role="status">
        <p className="display text-h3">Pedido enviado</p>
        <p className="mt-2 text-copy-secondary">Obrigado. A equipa de motoristas liga-lhe em menos de 24 horas.</p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setValues(EMPTY);
            setErrors({});
            setStatus("idle");
          }}
        >
          Enviar outro pedido
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-panel border border-line bg-panel p-6 sm:p-8">
      {siteKey && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={renderCaptcha} />
      )}

      <ModeSwitch
        mode={mode}
        labelId={id("modo")}
        onChange={(m) => {
          setMode(m);
          setErrors({});
        }}
      />

      <form ref={form} onSubmit={submit} noValidate className="mt-6 grid gap-5" aria-label={mode === "aluguer" ? "Pedido de contacto para alugar uma viatura" : "Pedido de contacto para trabalhar como Slot"}>
        <ErrorSummary count={Object.keys(errors).length} />

        <Field label="Nome completo" htmlFor={id("name")} required error={errors.name}>
          <Input id={id("name")} name="name" autoComplete="name" value={values.name} onChange={set("name")} {...invalid("name")} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" htmlFor={id("email")} required error={errors.email}>
            <Input id={id("email")} name="email" type="email" autoComplete="email" inputMode="email" value={values.email} onChange={set("email")} {...invalid("email")} />
          </Field>
          <Field label="Telefone ou WhatsApp" htmlFor={id("phone")} required error={errors.phone}>
            <Input id={id("phone")} name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+351 912 345 678" value={values.phone} onChange={set("phone")} {...invalid("phone")} />
          </Field>
        </div>

        {mode === "aluguer" ? (
          <>
            <YesNo
              name="hasTvdeLicense"
              legend="Tem licença TVDE?"
              value={values.hasTvdeLicense}
              onChange={set("hasTvdeLicense")}
              error={noLicense ? undefined : errors.hasTvdeLicense}
              idPrefix={id("licenca")}
            />
            {noLicense && (
              <p className="rounded-panel bg-caution-surface px-4 py-3 text-body-small text-caution" role="status">
                A licença TVDE é obrigatória por lei para trabalhar como motorista TVDE. Para a obter, procure um centro de formação certificado na sua zona.
              </p>
            )}
            <Field label="Observações" htmlFor={id("notes")} error={errors.notes} help="Opcional. Por exemplo, a categoria que procura ou quando quer começar.">
              <Textarea id={id("notes")} name="notes" maxLength={1000} value={values.notes} onChange={set("notes")} {...invalid("notes")} />
            </Field>
          </>
        ) : (
          <>
            <YesNo name="worksTvde" legend="Atualmente trabalha como motorista TVDE?" value={values.worksTvde} onChange={set("worksTvde")} error={errors.worksTvde} idPrefix={id("tvde")} />
            <Field label="Qual é a sua viatura?" htmlFor={id("vehicle")} required error={errors.vehicle} help="Marca, modelo e ano. Se ainda não tem viatura, escreva que não tem.">
              <Input id={id("vehicle")} name="vehicle" maxLength={120} value={values.vehicle} onChange={set("vehicle")} {...invalid("vehicle")} />
            </Field>
          </>
        )}

        {/* Campo-armadilha: invisível para pessoas, preenchido por robôs */}
        <div className="sr-only" aria-hidden>
          <label htmlFor={id("website")}>Não preencher</label>
          <input id={id("website")} name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} />
        </div>

        {siteKey && (
          <div>
            <div ref={captchaBox} />
            <FieldError id={`${id("captcha")}-error`}>{errors.captcha}</FieldError>
          </div>
        )}

        {status === "failed" && (
          <div className="rounded-panel bg-negative-surface px-4 py-3 text-body-small text-negative" role="alert">
            <p className="font-semibold">{failMessage}</p>
            <p className="mt-1">
              Se o problema continuar, use o{" "}
              <a href={DRIVER_FORMS[mode]} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">
                formulário alternativo<span className="sr-only"> (abre noutro separador)</span>
              </a>
              .
            </p>
          </div>
        )}

        <div>
          <Button type="submit" size="lg" loading={status === "sending"} disabled={noLicense} className="w-full sm:w-auto">
            {mode === "aluguer" ? "Pedir contacto para alugar" : "Pedir contacto como Slot"}
          </Button>
          <p className="mt-3 text-body-small text-copy-muted">Cerca de 2 minutos, sem compromisso. A equipa liga-lhe em menos de 24 horas.</p>
        </div>
      </form>
    </div>
  );
}

/** Pergunta Sim/Não com rádios nativos (teclado e leitores de ecrã sem trabalho extra). */
function YesNo({
  name,
  legend,
  value,
  onChange,
  error,
  idPrefix,
}: {
  name: string;
  legend: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  error?: string;
  idPrefix: string;
}) {
  return (
    <fieldset aria-describedby={error ? `${idPrefix}-error` : undefined}>
      <legend className="mb-2 block text-body-small font-medium text-copy-secondary">
        {legend}
        <span className="text-brand" aria-hidden> *</span>
      </legend>
      <div className="flex gap-3">
        {(["sim", "nao"] as const).map((v) => (
          <label
            key={v}
            className={cn(
              "flex min-h-(--layout-tap) cursor-pointer items-center gap-2 rounded-control border px-4 transition-colors",
              value === v ? "border-copy bg-panel-sunken font-semibold" : "border-line-control hover:border-copy",
            )}
          >
            <input type="radio" name={name} value={v} checked={value === v} onChange={onChange} data-invalid={error && v === "sim" ? "true" : undefined} className="size-4 accent-selected" />
            {v === "sim" ? "Sim" : "Não"}
          </label>
        ))}
      </div>
      <FieldError id={`${idPrefix}-error`}>{error}</FieldError>
    </fieldset>
  );
}
