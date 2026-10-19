import { fail, fromError } from "@/lib/api";
import { bearerToken } from "@/services/auth/driver";
import { getAccountInvoicePdf } from "@/services/wegest/account";
import { WeGestError } from "@/services/wegest/types";

export const maxDuration = 60;
export async function GET(request: Request, { params }: RouteContext<"/api/account/invoices/[id]">) {
  const { id } = await params;
  const token = bearerToken(request);
  let response: Response;
  if (!token || token.length > 4096) response = fail("unauthorized", "Inicie sessão para consultar a fatura.", 401);
  else if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) response = fail("not_found", "Fatura não encontrada.", 404);
  else try {
    const pdf = await getAccountInvoicePdf(token, id);
    response = new Response(pdf.body, { headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="fatura-' + id + '.pdf"', "X-Content-Type-Options": "nosniff" } });
  } catch (error) {
    response = error instanceof WeGestError && error.apiCode === "SESSAO_INVALIDA"
      ? fail("unauthorized", "A sessão terminou. Entre de novo.", 401)
      : error instanceof WeGestError && error.status === 429 ? fail("unavailable", "Demasiados pedidos de faturas. Aguarde um minuto.", 429) : fromError(error);
  }
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex");
  return response;
}
