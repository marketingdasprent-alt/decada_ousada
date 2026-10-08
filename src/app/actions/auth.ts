"use server";

import { redirect } from "next/navigation";

import { changePassword, getSession, login, logout, register } from "@/services/auth";
import { sendEmail } from "@/services/email";

export interface FormState {
  error?: string;
  success?: string;
}

/** Só aceita redirecionamentos internos (evita open redirect). */
function safeNext(next: FormDataEntryValue | null, fallback: string): string {
  const v = typeof next === "string" ? next : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : fallback;
}

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  const res = await login(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
  if (!res.ok) return { error: res.error };
  redirect(safeNext(form.get("next"), "/minha-conta"));
}

export async function registerAction(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "");
  const res = await register(email, String(form.get("password") ?? ""), String(form.get("name") ?? "") || undefined);
  if (!res.ok) return { error: res.error };
  await sendEmail(email, "rac.registration_received");
  redirect(safeNext(form.get("next"), "/minha-conta"));
}

export async function logoutAction() {
  await logout();
  redirect("/");
}

export async function recoverPasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim();
  if (!email.includes("@")) return { error: "Indique um email válido." };
  // TODO(auth): gerar token de recuperação com o fornecedor de autenticação escolhido.
  // A resposta é sempre igual, exista ou não a conta (não revela emails registados).
  return { success: "Se existir uma conta com este email, vai receber as instruções para redefinir a password." };
}

export async function changePasswordAction(_: FormState, form: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: "Sessão expirada. Inicie sessão novamente." };
  const next = String(form.get("next_password") ?? "");
  if (next !== String(form.get("confirm_password") ?? "")) return { error: "As passwords não coincidem." };
  const res = await changePassword(session.user.id, String(form.get("current_password") ?? ""), next);
  return res.ok ? { success: "Password alterada com sucesso." } : { error: res.error };
}
