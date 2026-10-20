import { fail, fromError, ok } from "@/lib/api";
import { bearerToken } from "@/services/auth/driver";
import { cancelAccountBooking } from "@/services/wegest/account";
import { WeGestError } from "@/services/wegest/types";

/** DELETE /api/account/bookings/{codigo}: cancela uma reserva pendente da conta (DELETE /conta/reservas/{codigo}). */
export async function DELETE(request: Request, { params }: RouteContext<"/api/account/bookings/[codigo]">) {
  const { codigo } = await params;
  const token = bearerToken(request);
  let response: Response;
  if (!token || token.length > 4096) response = fail("unauthorized", "Inicie sessão para cancelar a reserva.", 401);
  else if (!/^[1-9]\d{0,9}$/.test(codigo)) response = fail("not_found", "Reserva não encontrada.", 404);
  else try { response = ok(await cancelAccountBooking(token, Number(codigo))); }
  catch (error) {
    response = error instanceof WeGestError && error.apiCode === "SESSAO_INVALIDA"
      ? fail("unauthorized", "A sessão terminou. Entre de novo.", 401) : fromError(error);
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
