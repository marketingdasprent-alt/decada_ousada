import { fromError, ok } from "@/lib/api";
import { regionFromRequest } from "@/lib/region";
import { listLocations } from "@/services/wegest";

/** GET /api/locations?produto= */
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams.get("produto");
  try {
    return ok(await listLocations(regionFromRequest(req), p === "tvde" || p === "rentacar" ? p : undefined));
  } catch (err) {
    return fromError(err);
  }
}
