import type { FetchResult } from "./fetcher";
import { apiFetch } from "./fetcher";
import { currentDriverToken, driverAuth } from "./driver-auth-client";

/**
 * Pedidos do browser às rotas /api/account/application. Com a conta WeGest, leva o token da
 * sessão em Authorization: Bearer e, num 401, renova a sessão e repete uma vez (como
 * lib/account-fetch). Em demonstração (`mock`) a rota usa o cookie da sessão do site.
 */
export async function applicationFetch<T>(
  url: string,
  mock: boolean,
  init: { method?: "GET" | "PUT" | "POST" | "DELETE"; body?: unknown } = {},
): Promise<FetchResult<T>> {
  const body = init.body === undefined ? undefined : JSON.stringify(init.body);
  for (let attempt = 0; attempt < 2; attempt++) {
    const token = mock ? null : await currentDriverToken();
    if (!mock && !token) return { ok: false, status: 401, error: { code: "unauthorized", message: "Inicie sessão para continuar." } };
    const result = await apiFetch<T>(url, {
      method: init.method ?? "GET",
      body,
      cache: "no-store",
      headers: token ? { Authorization: "Bearer " + token } : undefined,
      timeoutMs: 30_000,
    });
    if (result.ok || result.status !== 401 || mock || attempt === 1) return result;
    const refreshed = await driverAuth().auth.refreshSession();
    if (refreshed.error || !refreshed.data.session) return result;
  }
  return { ok: false, status: 401, error: { code: "unauthorized", message: "Inicie sessão para continuar." } };
}
