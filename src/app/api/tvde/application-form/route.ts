import { fromError, ok } from "@/lib/api";
import { regionFromRequest } from "@/lib/region";
import { getApplicationForm } from "@/services/wegest";

/** GET /api/tvde/application-form: ficha dinâmica definida pelo WeGest (doc §51). */
export async function GET(req: Request) {
  try {
    return ok(await getApplicationForm(regionFromRequest(req)));
  } catch (err) {
    return fromError(err);
  }
}
