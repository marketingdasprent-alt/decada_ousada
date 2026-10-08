import "server-only";

import { NextResponse } from "next/server";
import type { ZodError } from "zod";

import type { ApiError, ErrorCode } from "@/domain/shared";
import { WeGestError } from "@/services/wegest/types";

/** Respostas normalizadas da API interna (doc §118). Nunca expõe detalhes do WeGest. */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(code: ErrorCode, message: string, status: number, extra?: Partial<ApiError>) {
  return NextResponse.json({ ok: false, error: { code, message, ...extra } }, { status });
}

export function fromZod(err: ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fail("validation", "Verifique os campos assinalados.", 422, { fieldErrors });
}

/** Converte qualquer erro numa resposta segura para o browser. */
export function fromError(err: unknown) {
  // Sinais internos do Next.js (prerender, redirect, notFound) têm de propagar
  if (err && typeof err === "object" && "digest" in err) throw err;
  if (err instanceof WeGestError) {
    const map: Record<WeGestError["code"], [ErrorCode, number, string]> = {
      timeout: ["timeout", 504, "O sistema de gestão não respondeu a tempo. Tente novamente."],
      unavailable: ["unavailable", 503, "O sistema de gestão está temporariamente indisponível."],
      not_found: ["not_found", 404, "Não encontrado."],
      validation: ["validation", 422, err.message],
      conflict: ["conflict", 409, err.message],
      unauthorized: ["upstream", 502, "Erro de integração. A nossa equipa foi notificada."],
      upstream: ["upstream", 502, "Erro no sistema de gestão. Tente novamente."],
    };
    const [code, status, message] = map[err.code];
    return fail(code, message, status, { fieldErrors: err.fieldErrors });
  }
  console.error("[api]", err instanceof Error ? err.message : err);
  return fail("internal", "Ocorreu um erro inesperado.", 500);
}
