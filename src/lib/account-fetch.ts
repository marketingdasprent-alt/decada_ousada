import { driverAuth, currentDriverToken } from "./driver-auth-client";

export async function accountFetch(url: string, timeoutMs = 20_000): Promise<Response> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const token = await currentDriverToken();
    if (!token) return new Response(null, { status: 401 });
    const response = await fetch(url, { headers: { Authorization: "Bearer " + token }, cache: "no-store", signal: AbortSignal.timeout(timeoutMs) });
    if (response.status !== 401 || attempt === 1) return response;
    const refreshed = await driverAuth().auth.refreshSession();
    if (refreshed.error || !refreshed.data.session) return response;
  }
  return new Response(null, { status: 401 });
}
