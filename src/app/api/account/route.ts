import { fail, fromError, ok } from "@/lib/api";
import { bearerToken } from "@/services/auth/driver";
import { getAccount } from "@/services/wegest/account";
import { WeGestError } from "@/services/wegest/types";

/**
 * GET /api/account: a conta WeGest de quem entrou (GET /conta), com a ficha de cliente ligada. A ficha
 * nasce do registo (signUp com os dados pessoais) e liga-se depois de confirmar o email.
 */
export async function GET(request: Request) {
  const token = bearerToken(request);
  let response: Response;
  if (!token || token.length > 4096) response = fail("unauthorized", "Inicie sessão para ver os seus dados.", 401);
  else try { response = ok(await getAccount(token)); }
  catch (error) {
    response = error instanceof WeGestError && error.apiCode === "SESSAO_INVALIDA"
      ? fail("unauthorized", "A sessão terminou. Entre de novo.", 401) : fromError(error);
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
