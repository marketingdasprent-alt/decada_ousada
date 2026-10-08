import { fail, fromError, ok } from "@/lib/api";
import { regionFromRequest } from "@/lib/region";
import { getVehicleById } from "@/services/wegest";

/** GET /api/vehicles/:id */
export async function GET(req: Request, { params }: RouteContext<"/api/vehicles/[id]">) {
  const { id } = await params;
  try {
    const v = await getVehicleById(regionFromRequest(req), id);
    return v ? ok(v) : fail("not_found", "Viatura não encontrada.", 404);
  } catch (err) {
    return fromError(err);
  }
}
