"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

import { DRIVER_ACCOUNT, DRIVER_CONFIRM_PATH, DRIVER_NEW_PASSWORD_PATH, driverAuthMessage, driverPasswordError, isEmailNotConfirmed } from "@/lib/driver-account";
import { driverAuth, startSiteSession, takeNext } from "@/lib/driver-auth-client";

import { Field, Input } from "../shared/form";
import { Notice } from "../shared/states";
import { Button, ButtonLink, Skeleton } from "../shared/ui";
import { PasswordInput } from "./auth-forms";
import { useAuthCaptcha } from "./auth-captcha";

/**
 * Formulários da conta de motorista (conta WeGest). O browser fala diretamente com o
 * Supabase Auth do WeGest; o site só abre a sua sessão depois (/api/driver-session).
 * Guia: "Contas de motorista no site da Década" (WeGest, 2026-10-14).
 */

const withNext = (path: string, next?: string) => (next ? `${path}${path.includes("?") ? "&" : "?"}next=${encodeURIComponent(next)}` : path);
const link = "font-medium text-brand underline-offset-4 hover:underline max-md:tap-target";

/** Depois de entrar no WeGest: abre a sessão do site e segue para `next` ou para a área do motorista (recarrega, para o servidor ver a sessão). */
export async function enterSite(next?: string | null): Promise<string | null> {
  const session = await startSiteSession();
  if (!session) return "Não foi possível iniciar a sessão. Tente de novo.";
  const destination = next?.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : session.kind === "motorista" ? DRIVER_ACCOUNT : "/minha-conta";
  window.location.assign(destination);
  return null;
}

export function ResendConfirmation({ email }: { email: string }) {
  const captcha = useAuthCaptcha();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  async function resend() {
    if (captcha.configured && !captcha.ready) return;
    setState("sending");
    const { error } = await driverAuth().auth.resend({ type: "signup", email, options: { captchaToken: captcha.token || undefined, emailRedirectTo: `${window.location.origin}${DRIVER_CONFIRM_PATH}` } });
    captcha.reset();
    setState(error ? "error" : "sent");
  }
  if (state === "sent") return <p className="mt-2 text-body-small">Enviámos de novo o email de confirmação.</p>;
  return (
    <div className="mt-2 space-y-3 text-body-small">
      {captcha.field}
      {state === "error" && "Não foi possível reenviar agora. "}
      <button type="button" onClick={resend} disabled={state === "sending" || (captcha.configured && !captcha.ready)} className={`${link} cursor-pointer`}>
        {state === "sending" ? "A reenviar…" : "Reenviar email de confirmação"}
      </button>
    </div>
  );
}

export function DriverLoginForm({ next, secondary = false, kind = "motorista" }: { next?: string; secondary?: boolean; kind?: "cliente" | "motorista" }) {
  const captcha = useAuthCaptcha();
  const uid = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ message: string; unconfirmedEmail?: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (captcha.configured && !captcha.ready) { setError({ message: "Conclua a verificação de segurança." }); return; }
    setPending(true);
    setError(null);
    const { error: authError } = await driverAuth().auth.signInWithPassword({ email, password, options: { captchaToken: captcha.token || undefined } });
    captcha.reset();
    if (authError) {
      setPending(false);
      setError({ message: driverAuthMessage(authError), unconfirmedEmail: isEmailNotConfirmed(authError) ? email : undefined });
      return;
    }
    const failure = await enterSite(next);
    if (failure) {
      setPending(false);
      setError({ message: failure });
    }
  }

  return (
    <form onSubmit={submit} method="post" className="space-y-5">
      <Field label="Email" htmlFor={`${uid}-email`} required>
        <Input id={`${uid}-email`} name="email" type="email" autoComplete="email" required />
      </Field>
      <div>
        <Field label="Password" htmlFor={`${uid}-password`} required>
          <PasswordInput id={`${uid}-password`} name="password" autoComplete="current-password" required />
        </Field>
        <p className="mt-2 text-right text-body-small">
          <Link href={kind === "motorista" ? "/recuperar-password?tipo=motorista" : "/recuperar-password"} className="text-copy-secondary underline-offset-4 hover:text-copy hover:underline max-md:tap-target">Esqueci-me da password</Link>
        </p>
      </div>
      {captcha.field}
      {error && (
        <Notice tone="danger">
          {error.message}
          {error.unconfirmedEmail && <ResendConfirmation email={error.unconfirmedEmail} />}
        </Notice>
      )}
      <Button type="submit" size="lg" variant={secondary ? "outline" : "primary"} className="w-full" loading={pending}>Entrar</Button>
      {!secondary && (
        <div className="border-t border-line pt-5 text-center">
          <p className="text-body-small text-copy-secondary">Ainda não tem conta?</p>
          <ButtonLink href={withNext(kind === "motorista" ? "/registar?tipo=motorista" : "/registar", next)} variant="outline" size="lg" className="mt-3 w-full">Criar conta</ButtonLink>
        </div>
      )}
    </form>
  );
}

export function DriverRecoverForm() {
  const captcha = useAuthCaptcha();
  const uid = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (captcha.configured && !captcha.ready) { setError("Conclua a verificação de segurança."); return; }
    setPending(true);
    setError(null);
    const { error: authError } = await driverAuth().auth.resetPasswordForEmail(email, { captchaToken: captcha.token || undefined, redirectTo: `${window.location.origin}${DRIVER_NEW_PASSWORD_PATH}` });
    setPending(false);
    captcha.reset();
    // A API não revela se existe uma conta para este email.
    const message = authError ? driverAuthMessage(authError) : null;
    if (message) setError(message);
    else setSent(true);
  }

  if (sent) {
    return (
      <Notice tone="ok" title="Verifique o seu email">
        Se o email tiver conta, enviámos um link para definir uma nova password. O link é válido durante 1 hora.
      </Notice>
    );
  }
  return (
    <form onSubmit={submit} method="post" className="space-y-5">
      <Field label="Email" htmlFor={`${uid}-email`} required>
        <Input id={`${uid}-email`} name="email" type="email" autoComplete="email" required />
      </Field>
      {error && <Notice tone="danger">{error}</Notice>}
      {captcha.field}
      <Button type="submit" size="lg" className="w-full" loading={pending}>Enviar link</Button>
    </form>
  );
}

/** Erro devolvido no URL do link (expirado ou já usado), ex.: #error_code=otp_expired. */
function linkErrorInUrl(): boolean {
  const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search);
  return params.has("error") || params.has("error_code");
}

/** /nova-password: o link do email chega com uma sessão de recuperação. */
export function NewPasswordForm() {
  const uid = useId();
  const [stage, setStage] = useState<"checking" | "ready" | "invalid">("checking");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    // Ler o URL antes de o cliente o consumir
    const fromLink = window.location.hash.includes("type=recovery");
    if (linkErrorInUrl()) {
      const t = window.setTimeout(() => setStage("invalid"), 0);
      return () => window.clearTimeout(t);
    }
    const auth = driverAuth().auth;
    const { data } = auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (fromLink && session)) setStage("ready");
    });
    const timer = window.setTimeout(() => setStage((s) => (s === "checking" ? "invalid" : s)), 6_000);
    return () => {
      data.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password") ?? "");
    const weak = driverPasswordError(password) ?? (password !== String(data.get("confirm") ?? "") ? "As passwords não coincidem." : null);
    setFieldError(weak);
    if (weak) return;
    setPending(true);
    setError(null);
    const { error: authError } = await driverAuth().auth.updateUser({ password });
    if (authError) {
      setPending(false);
      setError(driverAuthMessage(authError));
      return;
    }
    const failure = await enterSite(null);
    if (failure) {
      setPending(false);
      setError(failure);
    }
  }

  if (stage === "checking") return <Skeleton className="h-56" />;
  if (stage === "invalid") {
    return (
      <div className="space-y-5">
        <Notice tone="warn" title="O link expirou ou já foi usado">
          Os links de recuperação são válidos durante 1 hora e só funcionam uma vez. Peça um novo.
        </Notice>
        <ButtonLink href="/recuperar-password?tipo=motorista" size="lg" className="w-full">Pedir novo link</ButtonLink>
      </div>
    );
  }
  return (
    <form onSubmit={submit} method="post" className="space-y-5" noValidate>
      <Field label="Nova password" htmlFor={`${uid}-password`} required help="Mínimo 8 caracteres, com letras e números." error={fieldError ?? undefined}>
        <PasswordInput
          id={`${uid}-password`}
          name="password"
          autoComplete="new-password"
          required
          aria-invalid={fieldError ? true : undefined}
          aria-describedby={fieldError ? `${uid}-password-error` : undefined}
        />
      </Field>
      <Field label="Confirmar nova password" htmlFor={`${uid}-confirm`} required>
        <PasswordInput id={`${uid}-confirm`} name="confirm" autoComplete="new-password" required />
      </Field>
      {error && <Notice tone="danger">{error}</Notice>}
      <Button type="submit" size="lg" className="w-full" loading={pending}>Guardar password</Button>
    </form>
  );
}

/** /entrar?confirmado=1: o link de confirmação chega com sessão; abre a do site e segue. */
export function DriverConfirmation() {
  const [stage, setStage] = useState<"checking" | "failed">("checking");

  useEffect(() => {
    if (linkErrorInUrl()) {
      const t = window.setTimeout(() => setStage("failed"), 0);
      return () => window.clearTimeout(t);
    }
    let done = false;
    const auth = driverAuth().auth;
    const { data } = auth.onAuthStateChange((_event, session) => {
      if (!session || done) return;
      done = true;
      enterSite(takeNext()).then((failure) => failure && setStage("failed"));
    });
    const timer = window.setTimeout(() => !done && setStage("failed"), 6_000);
    return () => {
      data.subscription.unsubscribe();
      window.clearTimeout(timer);
    };
  }, []);

  if (stage === "checking") {
    return (
      <div role="status" className="space-y-4">
        <p className="text-copy-secondary">A confirmar a sua conta…</p>
        <Skeleton className="h-40" />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <Notice tone="warn" title="Não foi possível confirmar com este link">
        O link pode ter expirado ou já ter sido usado. Se já confirmou a conta, entre com o email e a password. Se não, ao entrar pode pedir um novo email de confirmação.
      </Notice>
      <DriverLoginForm />
    </div>
  );
}
