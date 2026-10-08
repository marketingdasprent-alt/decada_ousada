import { fromError, ok } from "@/lib/api";
import { regionFromRequest } from "@/lib/region";
import { listCoverages, listExtras } from "@/services/wegest";

/** GET /api/rentacar/extras: extras e coberturas. */
export async function GET(req: Request) {
  const region = regionFromRequest(req);
  try {
    const [extras, coverages] = await Promise.all([listExtras(region), listCoverages(region)]);
    return ok({ extras, coverages });
  } catch (err) {
    return fromError(err);
  }
}
