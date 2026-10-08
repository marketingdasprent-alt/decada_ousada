import { fail, fromError, ok } from "@/lib/api";
import { regionFromRequest } from "@/lib/region";
import { checkVehicleAvailability } from "@/services/wegest";

/** GET /api/tvde/availability?viatura=&inicio=YYYY-MM-DDTHH:mm&local=: nova consulta ao escolher levantamento (doc §48). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const vehicleId = url.searchParams.get("viatura");
  const pickupAt = url.searchParams.get("inicio");
  const locationId = url.searchParams.get("local");
  if (!vehicleId || !pickupAt || !locationId || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(pickupAt)) {
    return fail("validation", "Escolha data, hora e local.", 400);
  }
  if (new Date(pickupAt).getTime() < Date.now()) return fail("validation", "A data de levantamento tem de ser no futuro.", 400);
  try {
    const availability = await checkVehicleAvailability({ region: regionFromRequest(req), product: "tvde", vehicleId, pickupLocationId: locationId, pickupAt });
    return ok(availability, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return fromError(err);
  }
}
