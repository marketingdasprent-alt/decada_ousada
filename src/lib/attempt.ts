import "server-only";

import { WeGestError } from "@/services/wegest/types";

export type Attempt<T> = { ok: true; data: T } | { ok: false; timeout: boolean; code?: string };

/** Executa uma chamada ao WeGest sem rebentar a página: a UI mostra ErrorState. */
export async function attempt<T>(fn: () => Promise<T>): Promise<Attempt<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (err) {
    if (err instanceof WeGestError) return { ok: false, timeout: err.code === "timeout", code: err.code };
    // Erros de pré-renderização do Next.js (ex.: dynamic usage) têm de continuar a propagar
    if (err && typeof err === "object" && "digest" in err) throw err;
    console.error("[wegest]", err instanceof Error ? err.message : err);
    return { ok: false, timeout: false };
  }
}
