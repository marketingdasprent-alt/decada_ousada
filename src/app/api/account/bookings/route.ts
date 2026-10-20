import { fail, fromError, ok } from "@/lib/api";
import { bearerToken } from "@/services/auth/driver";
import { getAccountBookings } from "@/services/wegest/account";
import { WeGestError } from "@/services/wegest/types";

/**
 * GET /api/account/bookings: as reservas Rent a Car da conta WeGest de quem entrou (GET /conta/reservas).
 * O WeGest filtra pela ficha ligada à conta; o site não guarda quem é dono de cada reserva.
 */
export async function GET(request: Request) {
  const token = bearerToken(request);
  let response: Response;
  if (!token || token.length > 4096) response = fail("unauthorized", "Inicie sessão para ver as suas reservas.", 401);
  else try { response = ok(await getAccountBookings(token)); }
  catch (error) {
    response = error instanceof WeGestError && error.apiCode === "SESSAO_INVALIDA"
      ? fail("unauthorized", "A sessão terminou. Entre de novo.", 401) : fromError(error);
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
