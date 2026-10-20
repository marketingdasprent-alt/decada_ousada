import { fail, fromError, fromZod, ok } from "@/lib/api";
import { regionFromRequest } from "@/lib/region";
import { customerSchema } from "@/lib/validation";
import { getCustomerId, getSession, linkCustomer } from "@/services/auth";
import { bearerToken, verifyDriverToken } from "@/services/auth/driver";
import { getCustomer, integrationMode, updateCustomer, upsertCustomer } from "@/services/wegest";
import { saveAccountCustomerFile } from "@/services/wegest/account";

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

/**
 * POST /api/customers/me: cria a ficha de cliente Rent a Car antes da primeira reserva. Com a API
 * real vai pela conta WeGest (X-Conta-Token), nunca como candidatura TVDE; no mock fica na ficha
 * de demonstração ligada à sessão. O email é sempre o da conta.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = customerSchema.omit({ email: true }).safeParse(body?.customer ?? {});
  if (!parsed.success) return fromZod(parsed.error);
  try {
    const session = await getSession();
    if (!session) return fail("unauthorized", "Sessão expirada.", 401);
    if (await getCustomerId(session, "rentacar")) return fail("conflict", "Já tem ficha de cliente.", 409);
    const input = { ...parsed.data, email: session.user.email };
    if (integrationMode() !== "mock") {
      const token = bearerToken(req);
      const account = token ? await verifyDriverToken(token) : null;
      if (!token || !account || !session.user.id.endsWith(":" + account.id)) return fail("unauthorized", "Sessão expirada.", 401);
      await saveAccountCustomerFile(token, input);
      return ok({ saved: true });
    }
    const customer = await upsertCustomer("rentacar", input);
    await linkCustomer(session.user.id, { wegestCustomerId: customer.id, customerType: "rentacar", region: regionFromRequest(req) });
    return ok({ saved: true });
  } catch (err) {
    return fromError(err);
  }
}
