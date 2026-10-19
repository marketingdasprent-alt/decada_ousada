import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { apiFetch } from "./fetcher";
import { DRIVER_AUTH } from "./driver-account";

/**
 * Cliente do Supabase Auth do WeGest, só no browser. A sessão fica no localStorage e o
 * supabase-js renova o token sozinho (dura cerca de 1 hora).
 */
let client: SupabaseClient | null = null;

export function driverAuth(): SupabaseClient {
  client ??= createClient(DRIVER_AUTH.url, DRIVER_AUTH.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

/** O token atual, lido na hora. Nunca guardar uma cópia: o supabase-js troca-o ao renovar. */
export async function currentDriverToken(): Promise<string | null> {
  return (await driverAuth().auth.getSession()).data.session?.access_token ?? null;
}

/** Abre a sessão do site para a conta WeGest (o servidor confirma o token no WeGest). */
export async function startSiteSession(): Promise<{ kind: "cliente" | "motorista" } | null> {
  const token = await currentDriverToken();
  if (!token) return null;
  const res = await apiFetch<{ kind: "cliente" | "motorista" }>("/api/driver-session", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
  return res.ok ? res.data : null;
}

export async function signOutDriver() {
  await driverAuth().auth.signOut().catch(() => undefined);
  await apiFetch("/api/driver-session", { method: "DELETE" });
}

/**
 * Para onde voltar depois de confirmar o email. O link de confirmação abre sempre em
 * /entrar?confirmado=1 (URL autorizado no WeGest), por isso o destino fica no browser.
 */
const NEXT_KEY = "do_driver_next";

export function rememberNext(next: string | undefined) {
  try {
    if (next?.startsWith("/") && !next.startsWith("//") && !next.includes("\\")) localStorage.setItem(NEXT_KEY, next);
    else localStorage.removeItem(NEXT_KEY);
  } catch {
    // Sem armazenamento (modo privado): volta à página da conta
  }
}

export function takeNext(): string | null {
  try {
    const next = localStorage.getItem(NEXT_KEY);
    localStorage.removeItem(NEXT_KEY);
    return next?.startsWith("/") && !next.startsWith("//") ? next : null;
  } catch {
    return null;
  }
}
