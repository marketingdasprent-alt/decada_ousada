import type { ApiError } from "@/domain/shared";

/**
 * fetch do browser para a API interna, com timeout obrigatório (doc §93).
 * Devolve sempre um resultado tipado: nunca fica pendurado em "loading".
 */
export type FetchResult<T> = { ok: true; data: T } | { ok: false; error: ApiError; status: number; raw?: Record<string, unknown> };

export async function apiFetch<T>(url: string, init?: RequestInit & { timeoutMs?: number }): Promise<FetchResult<T>> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { ...(init?.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}), ...init?.headers },
      signal: AbortSignal.timeout(init?.timeoutMs ?? 20_000),
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.ok) return { ok: true, data: json.data as T };
    return {
      ok: false,
      status: res.status,
      error: json?.error ?? { code: "internal", message: "Ocorreu um erro inesperado." },
      raw: json ?? undefined,
    };
  } catch (err) {
    const timeout = err instanceof DOMException && (err.name === "TimeoutError" || err.name === "AbortError");
    return {
      ok: false,
      status: 0,
      error: { code: timeout ? "timeout" : "unavailable", message: timeout ? "O pedido demorou demasiado. Tente novamente." : "Sem ligação. Verifique a internet e tente novamente." },
    };
  }
}
