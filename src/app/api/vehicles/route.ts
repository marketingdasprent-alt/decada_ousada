import { fromError, ok } from "@/lib/api";
import { regionFromRequest } from "@/lib/region";
import { listVehicles } from "@/services/wegest";

/** GET /api/vehicles?produto=rentacar|tvde: catálogo normalizado (doc §118). */
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams.get("produto");
  try {
    const vehicles = await listVehicles(regionFromRequest(req), p === "tvde" || p === "rentacar" ? p : undefined);
    return ok(vehicles, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=240" } });
  } catch (err) {
    return fromError(err);
  }
}
