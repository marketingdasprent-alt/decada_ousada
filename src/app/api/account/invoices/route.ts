import { fail, fromError, ok } from "@/lib/api";
import { bearerToken } from "@/services/auth/driver";
import { getAccountInvoices } from "@/services/wegest/account";
import { WeGestError } from "@/services/wegest/types";

export async function GET(request: Request) {
  const token = bearerToken(request);
  let response: Response;
  if (!token || token.length > 4096) response = fail("unauthorized", "Inicie sessão para consultar as faturas.", 401);
  else try { response = ok(await getAccountInvoices(token)); }
  catch (error) {
    response = error instanceof WeGestError && error.apiCode === "SESSAO_INVALIDA"
      ? fail("unauthorized", "A sessão terminou. Entre de novo.", 401) : fromError(error);
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
