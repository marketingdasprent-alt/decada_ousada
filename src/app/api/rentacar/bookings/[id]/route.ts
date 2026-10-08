import { fail, fromError, ok } from "@/lib/api";
import { getOwnBooking } from "@/lib/ownership";

/** GET /api/rentacar/bookings/:id: estado atual no WeGest, só para o dono. */
export async function GET(_: Request, { params }: RouteContext<"/api/rentacar/bookings/[id]">) {
  const { id } = await params;
  try {
    const own = await getOwnBooking(id);
    return own ? ok(own.booking, { headers: { "Cache-Control": "no-store" } }) : fail("not_found", "Reserva não encontrada.", 404);
  } catch (err) {
    return fromError(err);
  }
}
