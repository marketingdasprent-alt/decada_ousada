import { fail, ok } from "@/lib/api";
import { driverAuthEnabled } from "@/lib/driver-account";
import { logout, startDriverSession } from "@/services/auth";
import { bearerToken, DriverAuthUnavailable, verifyDriverToken } from "@/services/auth/driver";

/**
 * POST /api/driver-session: abre a sessão do site para a conta WeGest do motorista.
 * O browser entra no WeGest e envia aqui o token (Authorization: Bearer); o servidor confirma-o
 * no WeGest e guarda só o id e o email da conta no cookie da sessão. O token é largado.
 */
export async function POST(req: Request) {
  if (!driverAuthEnabled()) return fail("unavailable", "As contas de motorista ainda não estão disponíveis.", 503);
  const token = bearerToken(req);
  if (!token) return fail("unauthorized", "Inicie sessão para continuar.", 401);
  try {
    const account = await verifyDriverToken(token);
    if (!account) return fail("unauthorized", "A sessão terminou. Entre de novo.", 401, { reason: "session_expired" });
    await startDriverSession(account);
    return ok({ email: account.email });
  } catch (err) {
    if (err instanceof DriverAuthUnavailable) {
      console.warn("[driver-session]", err.message);
      return fail("unavailable", "O serviço de contas está indisponível. Tente de novo dentro de minutos.", 503);
    }
    throw err;
  }
}

/** DELETE /api/driver-session: termina a sessão do site (o browser termina a do WeGest). */
export async function DELETE() {
  await logout();
  return ok({});
}
