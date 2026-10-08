import { fromError, ok } from "@/lib/api";
import { regionFromRequest } from "@/lib/region";
import { listVehicles } from "@/services/wegest";

/** GET /api/tvde/vehicles */
export async function GET(req: Request) {
  try {
    return ok(await listVehicles(regionFromRequest(req), "tvde"));
  } catch (err) {
    return fromError(err);
  }
}
