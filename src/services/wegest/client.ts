import "server-only";

import { recordIntegrationCall } from "@/services/store/integration-log";
import { WeGestError } from "./types";

/**
 * Cliente HTTP do WeGest.
 * - credenciais apenas no servidor (nunca NEXT_PUBLIC_*): doc §97
 * - timeout obrigatório: doc §93
 * - retry limitado apenas para erros temporários e métodos idempotentes: doc §94
 * - logs sem dados sensíveis: doc §116
 */
const BASE_URL = process.env.WEGEST_API_URL ?? "";
const TIMEOUT_MS = Number(process.env.WEGEST_TIMEOUT ?? 10_000);
const MAX_RETRIES = 2;

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestOptions {
  method?: Method;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  /** FormData para upload de documentos. */
  form?: FormData;
  idempotencyKey?: string;
  /** Força retry mesmo em POST (só quando o endpoint é idempotente com Idempotency-Key). */
  retry?: boolean;
}

function authHeaders(): Record<string, string> {
  // TODO: confirmar o mecanismo de autenticação da API WeGest (API key, OAuth2 client credentials, ...)
  const headers: Record<string, string> = {};
  if (process.env.WEGEST_API_KEY) headers["X-Api-Key"] = process.env.WEGEST_API_KEY;
  if (process.env.WEGEST_API_SECRET) headers["X-Api-Secret"] = process.env.WEGEST_API_SECRET;
  return headers;
}

const isTransient = (status: number) => status === 408 || status === 429 || status >= 500;

export async function wegestRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  if (!BASE_URL) throw new WeGestError("unavailable", "WEGEST_API_URL não configurado", 503);

  const method = opts.method ?? "GET";
  const url = new URL(path.replace(/^\//, ""), BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`);
  for (const [k, v] of Object.entries(opts.query ?? {})) if (v !== undefined) url.searchParams.set(k, String(v));

  const canRetry = method === "GET" || opts.retry === true;
  const requestId = crypto.randomUUID();
  let attempt = 0;

  while (true) {
    const started = performance.now();
    try {
      const res = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...(opts.idempotencyKey ? { "Idempotency-Key": opts.idempotencyKey } : {}),
          "X-Request-Id": requestId,
          ...authHeaders(),
        },
        body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
        signal: AbortSignal.timeout(TIMEOUT_MS),
        cache: "no-store",
      });
      const elapsed = Math.round(performance.now() - started);
      const wegestRequestId = res.headers.get("x-request-id") ?? undefined;
      recordIntegrationCall({ requestId, endpoint: url.pathname, method, status: res.status, responseTimeMs: elapsed, wegestRequestId });

      if (res.ok) {
        if (res.status === 204) return undefined as T;
        return (await res.json()) as T;
      }
      if (isTransient(res.status) && canRetry && attempt < MAX_RETRIES) {
        attempt++;
        await new Promise((r) => setTimeout(r, 300 * 2 ** attempt));
        continue;
      }
      const payload = (await res.json().catch(() => ({}))) as { message?: string; errors?: Record<string, string> };
      throw new WeGestError(
        res.status === 404 ? "not_found" : res.status === 409 ? "conflict" : res.status === 422 || res.status === 400 ? "validation" : res.status === 401 || res.status === 403 ? "unauthorized" : "upstream",
        payload.message ?? `WeGest respondeu ${res.status}`,
        res.status,
        payload.errors,
        wegestRequestId,
      );
    } catch (err) {
      if (err instanceof WeGestError) throw err;
      const elapsed = Math.round(performance.now() - started);
      const isTimeout = err instanceof DOMException && (err.name === "TimeoutError" || err.name === "AbortError");
      recordIntegrationCall({ requestId, endpoint: url.pathname, method, status: 0, responseTimeMs: elapsed, errorCode: isTimeout ? "timeout" : "network" });
      if (canRetry && attempt < MAX_RETRIES) {
        attempt++;
        await new Promise((r) => setTimeout(r, 300 * 2 ** attempt));
        continue;
      }
      throw new WeGestError(isTimeout ? "timeout" : "unavailable", isTimeout ? "O WeGest não respondeu a tempo." : "Não foi possível contactar o WeGest.", 503);
    }
  }
}
