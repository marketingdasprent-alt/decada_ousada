import { fail, fromError, ok } from "@/lib/api";
import { getSession } from "@/services/auth";
import { refreshPayment } from "@/services/payments";

/** GET /api/payments/:id: estado atualizado no fornecedor (ex.: MB WAY a aguardar). */
export async function GET(_: Request, { params }: RouteContext<"/api/payments/[id]">) {
  const { id } = await params;
  try {
    if (!(await getSession())) return fail("unauthorized", "Sessão expirada.", 401);
    const payment = await refreshPayment(id);
    if (!payment) return fail("not_found", "Pagamento não encontrado.", 404);
    const { id: pid, status, amount, currency, method, updatedAt } = payment;
    return ok({ id: pid, status, amount, currency, method, updatedAt }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return fromError(err);
  }
}
