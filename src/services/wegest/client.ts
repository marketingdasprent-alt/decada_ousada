import "server-only";

import { recordIntegrationCall } from "@/services/store/integration-log";
import type { ApiErro } from "./api-types";
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
  /**
   * Catálogo: a resposta é partilhada durante CATALOG_TTL_MS por todo o processo (pedidos
   * iguais em simultâneo fazem uma só chamada). Nunca em disponibilidade, preços ou reservas.
   */
  catalog?: boolean;
}

/** A API permite guardar o catálogo até 5 min; protege o limite de 120 pedidos/min por chave. */
const CATALOG_TTL_MS = 5 * 60_000;
const catalogCache = ((globalThis as unknown as { __wegestCatalog?: Map<string, { expires: number; value: Promise<unknown> }> }).__wegestCatalog ??=
  new Map());

function authHeaders(): Record<string, string> {
  // API v1: chave no cabeçalho X-API-Key, só a partir do servidor
  const key = process.env.WEGEST_API_KEY?.trim();
  return key ? { "X-API-Key": key } : {};
}

/**
 * Mensagens para o visitante por `erro.codigo` (a `erro.mensagem` do WeGest nunca chega ao
 * cliente). Códigos sem mensagem própria caem na mensagem genérica do estado HTTP.
 */
const CODE_MESSAGE: Record<string, string> = {
  PERIODO_INVALIDO: "As datas escolhidas não são válidas. Escolha um período no futuro.",
  PERIODO_EXCEDE_MAXIMO: "O período máximo de aluguer online é de 30 dias.",
  PARAMETRO_INVALIDO: "Alguns dados do pedido não são válidos. Reveja e tente novamente.",
  CORPO_INVALIDO: "Alguns dados do pedido não são válidos. Reveja e tente novamente.",
  SEM_DISPONIBILIDADE: "Esta viatura deixou de estar disponível para as datas escolhidas.",
  PRECO_ALTERADO: "O preço foi atualizado. Reveja o novo total antes de continuar.",
  TARIFA_INDISPONIVEL: "Ainda não há preços para estas datas. Escolha outras datas.",
  ESTADO_INVALIDO: "Esta reserva já não pode ser alterada online.",
  CANDIDATURA_EXISTENTE: "Não foi possível registar a candidatura. Contacte-nos para continuar.",
};

const CODE_KIND: Record<string, WeGestError["code"]> = {
  NAO_ENCONTRADO: "not_found",
  NAO_AUTENTICADO: "unauthorized",
  SEM_PERMISSAO: "unauthorized",
  CONFIG_EM_FALTA: "unavailable",
  LIMITE_EXCEDIDO: "unavailable",
  SEM_DISPONIBILIDADE: "conflict",
  PRECO_ALTERADO: "conflict",
  TARIFA_INDISPONIVEL: "validation",
  ESTADO_INVALIDO: "conflict",
  CANDIDATURA_EXISTENTE: "conflict",
};

function kindFromStatus(status: number): WeGestError["code"] {
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 400 || status === 422) return "validation";
  if (status === 401 || status === 403) return "unauthorized";
  if (status === 429 || status === 503) return "unavailable";
  return "upstream";
}

const isTransient = (status: number) => status === 408 || status === 429 || status >= 500;

export async function wegestRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  if (!opts.catalog) return request<T>(path, opts);
  const key = path + JSON.stringify(opts.query ?? {});
  const hit = catalogCache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as Promise<T>;
  const value = request<T>(path, opts);
  catalogCache.set(key, { expires: Date.now() + CATALOG_TTL_MS, value });
  // Um erro não fica guardado: o pedido seguinte tenta outra vez
  value.catch(() => catalogCache.delete(key));
  return value;
}

async function request<T>(path: string, opts: RequestOptions): Promise<T> {
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
        // 429: esperar o Retry-After da API (até 10 s); senão, recuo exponencial
        const retryAfter = Number(res.headers.get("retry-after"));
        const wait = res.status === 429 && retryAfter > 0 ? Math.min(retryAfter, 10) * 1000 : 300 * 2 ** attempt;
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      const payload = (await res.json().catch(() => ({}))) as ApiErro;
      const apiCode = payload.erro?.codigo;
      // O código fica no log (sem dados pessoais); a mensagem é a nossa, nunca a do WeGest
      if (apiCode) console.warn(`[wegest] ${method} ${url.pathname} → ${res.status} ${apiCode}`);
      throw new WeGestError(
        (apiCode ? CODE_KIND[apiCode] : undefined) ?? kindFromStatus(res.status),
        (apiCode ? CODE_MESSAGE[apiCode] : undefined) ?? "Não foi possível concluir o pedido. Tente novamente.",
        res.status,
        undefined,
        wegestRequestId,
        apiCode,
        payload.erro?.detalhes,
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
