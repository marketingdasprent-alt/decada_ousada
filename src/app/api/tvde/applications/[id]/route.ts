import { fail, fromError, ok } from "@/lib/api";
import { getOwnApplication } from "@/lib/ownership";
import { reconcileApplication } from "@/services/tvde";

/** GET /api/tvde/applications/:id: estado (WeGest) + pagamento/reembolso (fornecedor). */
export async function GET(_: Request, { params }: RouteContext<"/api/tvde/applications/[id]">) {
  const { id } = await params;
  try {
    const own = await getOwnApplication(id);
    if (!own) return fail("not_found", "Candidatura não encontrada.", 404);
    return ok(await reconcileApplication(own.application, own.session.user.email), { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return fromError(err);
  }
}
