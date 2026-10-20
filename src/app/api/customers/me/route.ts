import { fail, fromError, fromZod, ok } from "@/lib/api";
import { customerSchema } from "@/lib/validation";
import { getCustomerId, getSession } from "@/services/auth";
import { getCustomer, updateCustomer } from "@/services/wegest";

/** GET /api/customers/me: ficha do cliente, lida do WeGest (source of truth). */
export async function GET(req: Request) {
  const type = new URL(req.url).searchParams.get("tipo") === "tvde" ? "tvde" : "rentacar";
  try {
    const session = await getSession();
    if (!session) return fail("unauthorized", "Sessão expirada.", 401);
    const id = await getCustomerId(session, type);
    if (!id) return fail("not_found", "Ainda não tem ficha de cliente.", 404);
    const customer = await getCustomer(id);
    return customer ? ok(customer, { headers: { "Cache-Control": "no-store" } }) : fail("not_found", "Ficha não encontrada.", 404);
  } catch (err) {
    return fromError(err);
  }
}

/** PATCH /api/customers/me: atualiza no WeGest; a UI só muda após confirmação (doc §33). */
export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null);
  const type = body?.type === "tvde" ? "tvde" : "rentacar";
  const parsed = customerSchema.omit({ email: true }).partial().safeParse(body?.customer ?? {});
  if (!parsed.success) return fromZod(parsed.error);
  try {
    const session = await getSession();
    if (!session) return fail("unauthorized", "Sessão expirada.", 401);
    const id = await getCustomerId(session, type);
    if (!id) return fail("not_found", "Ainda não tem ficha de cliente.", 404);
    return ok(await updateCustomer(id, parsed.data));
  } catch (err) {
    return fromError(err);
  }
}
