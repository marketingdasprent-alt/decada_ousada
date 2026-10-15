import "server-only";

import { DRIVER_AUTH } from "@/lib/driver-account";

export interface DriverAccount {
  /** Id da conta no Supabase Auth do WeGest. */
  id: string;
  email: string;
}

export class DriverAuthUnavailable extends Error {}

/**
 * Confirma no WeGest que o token é de uma sessão válida e devolve a conta. Usa só a chave
 * pública. O token nunca é guardado nem escrito em logs: serve para este pedido e é largado.
 * `null` = token inválido ou expirado; DriverAuthUnavailable = o serviço de contas não respondeu.
 */
export async function verifyDriverToken(token: string): Promise<DriverAccount | null> {
  let res: Response;
  try {
    res = await fetch(`${DRIVER_AUTH.url}/auth/v1/user`, {
      headers: { apikey: DRIVER_AUTH.publishableKey, Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
  } catch {
    throw new DriverAuthUnavailable("Serviço de contas do WeGest sem resposta");
  }
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) throw new DriverAuthUnavailable(`Serviço de contas do WeGest: ${res.status}`);
  const user = (await res.json().catch(() => null)) as { id?: string; email?: string; email_confirmed_at?: string | null } | null;
  if (!user?.id || !user.email || !user.email_confirmed_at) return null;
  return { id: user.id, email: user.email.toLowerCase() };
}

/** Lê o token de `Authorization: Bearer …`. */
export function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  return token || null;
}
