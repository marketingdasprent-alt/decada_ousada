"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { DRIVER_AUTH, DRIVER_CONFIRM_PATH, driverAuthMessage } from "@/lib/driver-account";
import { driverAuth, rememberNext, takeNext } from "@/lib/driver-auth-client";
import { registrationSchema } from "@/lib/registration";
import { track } from "@/lib/analytics";
import { Checkbox, Field, Input } from "../shared/form";
import { Notice } from "../shared/states";
import { Button } from "../shared/ui";
import { PasswordInput } from "./auth-forms";
import { RegistrationUnavailable, useAuthCaptcha } from "./auth-captcha";
import { enterSite, ResendConfirmation } from "./driver-auth-forms";

type Kind = "cliente" | "motorista";
const linkClass = "font-medium text-brand underline underline-offset-4";

export function WeGestRegisterForm({ next, kind = "cliente" }: { next?: string; kind?: Kind }) {
  const uid = useId();
  const captcha = useAuthCaptcha();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sentTo, setSentTo] = useState<string | null>(null);
  const login = kind === "motorista" ? "/entrar?tipo=motorista" : "/entrar";
  const loginHref = next ? login + (login.includes("?") ? "&" : "?") + "next=" + encodeURIComponent(next) : login;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "");
    const parsed = registrationSchema.safeParse({
      tipo_utilizador: kind, nome: value("nome"), telefone: value("telefone"), email: value("email").trim(),
      password: value("password"), confirm: value("confirm"), data_nascimento: value("data_nascimento"),
      pais: value("pais"), nif: value("nif"), morada: value("morada"), codigo_postal: value("codigo_postal"),
      localidade: value("localidade"), termos: data.get("termos") === "on",
    });
    setError(null);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
      setErrors(fieldErrors);
      const first = form.elements.namedItem(Object.keys(fieldErrors)[0]);
      if (first instanceof HTMLElement) first.focus();
      return;
    }
    setErrors({});
    if (!captcha.ready) { setError("Conclua a verificação de segurança antes de criar a conta."); return; }
    setPending(true);
    try {
      const { email, password, confirm: _confirm, termos: _termos, ...fields } = parsed.data;
      void _confirm; void _termos;
      // Os opcionais vazios não seguem: o WeGest grava o que vier na ficha de cliente
      const metadata = kind === "motorista"
        ? { tipo_utilizador: kind, nome: fields.nome, telefone: fields.telefone, cargo_nome: "Motorista" }
        : Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== ""));
      rememberNext(next ?? (kind === "cliente" ? "/minha-conta" : "/tvde/minha-conta"));
      if (kind === "motorista") track("tvde_registration_started");
      const { data: result, error: authError } = await driverAuth().auth.signUp({ email, password, options: {
        captchaToken: captcha.token,
        emailRedirectTo: window.location.origin + DRIVER_CONFIRM_PATH,
        data: { ...metadata, org_id: DRIVER_AUTH.orgId,
          // Registo informativo do site, sem atribuir permissões nem alterar a ficha fiscal.
          site_consentimento: { termos: "/termos", privacidade: "/privacidade", aceite_em: new Date().toISOString() },
        },
      } });
      if (authError) { setError(driverAuthMessage(authError)); return; }
      if (result.session) { const failure = await enterSite(takeNext()); if (failure) setError(failure); }
      else setSentTo(email);
    } catch { setError("Falha de ligação. Tente de novo."); }
    finally { setPending(false); captcha.reset(); }
  }

  if (!captcha.configured) return <RegistrationUnavailable />;
  if (sentTo) return <div className="space-y-5">
    <Notice tone="ok" title="Confirme o seu email">Abra o link enviado para <strong className="break-words">{sentTo}</strong> para ativar a conta.</Notice>
    <ResendConfirmation email={sentTo} />
    <p className="text-body-small text-copy-secondary">Já tem conta? <Link href={loginHref} className={linkClass}>Entrar</Link></p>
  </div>;

  const field = (name: string, label: string, autoComplete: string, required = false, type = "text", maxLength = 200) => <Field key={name} label={label} htmlFor={uid + name} required={required} error={errors[name]}>
    <Input id={uid + name} name={name} type={type} autoComplete={autoComplete} required={required} maxLength={maxLength}
      aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? uid + name + "-error" : undefined} />
  </Field>;
  return <form onSubmit={submit} method="post" className="space-y-5" noValidate>
    {field("nome", "Nome completo", "name", true)}
    <Field label="Telefone" htmlFor={uid + "telefone"} required error={errors.telefone} help="Inclua o indicativo internacional, por exemplo +351.">
      <Input id={uid + "telefone"} name="telefone" type="tel" autoComplete="tel" required maxLength={26} aria-invalid={Boolean(errors.telefone)} aria-describedby={errors.telefone ? uid + "telefone-error" : undefined} />
    </Field>
    {field("email", "Email", "email", true, "email", 254)}
    {kind === "cliente" && <div className="grid gap-5 sm:grid-cols-2">
      {field("data_nascimento", "Data de nascimento", "bday", true, "date")}
      {field("pais", "País", "country-name", true, "text", 100)}
    </div>}
    <Field label="Password" htmlFor={uid + "password"} required error={errors.password} help="Mínimo 8 caracteres, com letras e números.">
      <PasswordInput id={uid + "password"} name="password" autoComplete="new-password" required minLength={8} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? uid + "password-error" : undefined} />
    </Field>
    <Field label="Confirmar password" htmlFor={uid + "confirm"} required error={errors.confirm}>
      <PasswordInput id={uid + "confirm"} name="confirm" autoComplete="new-password" required aria-invalid={Boolean(errors.confirm)} aria-describedby={errors.confirm ? uid + "confirm-error" : undefined} />
    </Field>
    {kind === "cliente" && <details className="border-y border-line py-4">
      <summary className="cursor-pointer font-medium focus-visible:outline-2 focus-visible:outline-focus">Dados de faturação (opcional)</summary>
      <div className="mt-5 space-y-5">
        {field("nif", "NIF", "off", false, "text", 30)}
        {field("morada", "Morada", "street-address")}
        <div className="grid gap-5 sm:grid-cols-2">{field("codigo_postal", "Código postal", "postal-code", false, "text", 30)}{field("localidade", "Localidade", "address-level2", false, "text", 100)}</div>
      </div>
    </details>}
    <div>
      <Checkbox name="termos" required aria-invalid={Boolean(errors.termos)} aria-describedby={errors.termos ? uid + "termos-error" : undefined}
        label={<>Aceito os <Link href="/termos" target="_blank" rel="noopener" className={linkClass}>termos e condições</Link> e a <Link href="/privacidade" target="_blank" rel="noopener" className={linkClass}>política de privacidade</Link>.</>} />
      {errors.termos && <p id={uid + "termos-error"} className="mt-1.5 text-body-small text-negative">{errors.termos}</p>}
    </div>
    {captcha.field}
    {error && <Notice tone="danger">{error}</Notice>}
    <Button type="submit" size="lg" className="w-full" loading={pending}>Criar conta</Button>
    <p className="text-center text-body-small text-copy-secondary">Já tem conta? <Link href={loginHref} className={linkClass}>Entrar</Link></p>
  </form>;
}
