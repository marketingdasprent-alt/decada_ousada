"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useActionState, useId, useState, type ComponentProps } from "react";

import { changePasswordAction, loginAction, recoverPasswordAction, registerAction, type FormState } from "@/app/actions/auth";

import { track } from "@/lib/analytics";

import { Field, Input } from "../shared/form";
import { Notice } from "../shared/states";
import { Button, ButtonLink } from "../shared/ui";

/** Campo de password com botão para mostrar o que se escreveu (evita erros no telemóvel). */
function PasswordInput(props: Omit<ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-12" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        aria-label={visible ? "Esconder password" : "Mostrar password"}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-control text-copy-muted hover:text-copy focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
      >
        {visible ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
      </button>
    </div>
  );
}

/** `secondary`: quando a ação principal da página é criar conta (entrada a partir do TVDE). */
export function LoginForm({ next, secondary = false }: { next?: string; secondary?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {});
  const uid = useId();
  const registerHref = `/registar${next ? `?next=${encodeURIComponent(next)}` : ""}`;
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Email" htmlFor={`${uid}-email`} required>
        <Input id={`${uid}-email`} name="email" type="email" autoComplete="email" required />
      </Field>
      <div>
        <Field label="Password" htmlFor={`${uid}-password`} required>
          <PasswordInput id={`${uid}-password`} name="password" autoComplete="current-password" required />
        </Field>
        <p className="mt-2 text-right text-body-small">
          <Link href="/recuperar-password" className="text-copy-secondary underline-offset-4 hover:text-copy hover:underline max-md:tap-target">Esqueci-me da password</Link>
        </p>
      </div>
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      <Button type="submit" size="lg" variant={secondary ? "outline" : "primary"} className="w-full" loading={pending}>Entrar</Button>
      {!secondary && (
        <div className="border-t border-line pt-5 text-center">
          <p className="text-body-small text-copy-secondary">Ainda não tem conta?</p>
          <ButtonLink href={registerHref} variant="outline" size="lg" className="mt-3 w-full">Criar conta</ButtonLink>
        </div>
      )}
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(registerAction, {});
  const uid = useId();
  return (
    <form action={action} onSubmit={() => next?.startsWith("/tvde/candidatura") && track("tvde_registration_started")} className="space-y-5">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Nome" htmlFor={`${uid}-name`}>
        <Input id={`${uid}-name`} name="name" autoComplete="name" />
      </Field>
      <Field label="Email" htmlFor={`${uid}-email`} required>
        <Input id={`${uid}-email`} name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password" htmlFor={`${uid}-password`} required help="Mínimo 8 caracteres.">
        <PasswordInput id={`${uid}-password`} name="password" autoComplete="new-password" minLength={8} required />
      </Field>
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      <Button type="submit" size="lg" className="w-full" loading={pending}>Criar conta</Button>
      <p className="text-center text-body-small text-copy-secondary">
        Já tem conta? <Link href={`/entrar${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-brand">Entrar</Link>
      </p>
    </form>
  );
}

export function RecoverForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(recoverPasswordAction, {});
  const uid = useId();
  return (
    <form action={action} className="space-y-5">
      <Field label="Email" htmlFor={`${uid}-email`} required>
        <Input id={`${uid}-email`} name="email" type="email" autoComplete="email" required />
      </Field>
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      {state.success && <Notice tone="ok">{state.success}</Notice>}
      <Button type="submit" size="lg" className="w-full" loading={pending}>Enviar instruções</Button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePasswordAction, {});
  const uid = useId();
  return (
    <form action={action} className="max-w-md space-y-5">
      <Field label="Password atual" htmlFor={`${uid}-current_password`} required>
        <Input id={`${uid}-current_password`} name="current_password" type="password" autoComplete="current-password" required />
      </Field>
      <Field label="Nova password" htmlFor={`${uid}-next_password`} required help="Mínimo 8 caracteres.">
        <Input id={`${uid}-next_password`} name="next_password" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      <Field label="Confirmar nova password" htmlFor={`${uid}-confirm_password`} required>
        <Input id={`${uid}-confirm_password`} name="confirm_password" type="password" autoComplete="new-password" required />
      </Field>
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      {state.success && <Notice tone="ok">{state.success}</Notice>}
      <Button type="submit" loading={pending}>Alterar password</Button>
    </form>
  );
}
