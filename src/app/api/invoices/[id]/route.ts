import { connection } from "next/server";

import { fail } from "@/lib/api";
import { getCustomerId, getSession } from "@/services/auth";
import { listCustomerInvoices } from "@/services/wegest";

/**
 * GET /api/invoices/:id: proxy autenticado do documento (doc §38, §57).
 * Nunca expõe URLs públicas permanentes do WeGest.
 * TODO(WeGest): quando existir endpoint de PDF, fazer stream do ficheiro aqui.
 */
export async function GET(_: Request, { params }: RouteContext<"/api/invoices/[id]">) {
  await connection();
  const { id } = await params;
  const session = await getSession();
  const customerId = await getCustomerId(session, "rentacar");
  if (!customerId) return fail("unauthorized", "Sessão expirada.", 401);
  const invoice = (await listCustomerInvoices(customerId)).find((i) => i.id === id);
  if (!invoice) return fail("not_found", "Fatura não encontrada.", 404);
  const total = new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(invoice.total);
  const html = `<!doctype html><html lang="pt-PT"><meta charset="utf-8"><title>${invoice.number}</title>
<body style="font-family:system-ui;max-width:640px;margin:40px auto;padding:0 16px">
<h1>Fatura ${invoice.number}</h1><p>DÉCADA OUSADA</p><p>Data: ${invoice.issuedAt.slice(0, 10)}</p>
${invoice.bookingReference ? `<p>Reserva: ${invoice.bookingReference}</p>` : ""}<h2>Total: ${total}</h2>
<p>Documento de demonstração. O PDF oficial será fornecido pelo sistema de gestão.</p></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
}
