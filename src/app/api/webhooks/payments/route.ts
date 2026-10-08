/**
 * POST /api/webhooks/payments: webhooks financeiros do fornecedor (doc §79).
 * Fornecedor por decidir: cada gateway valida a sua assinatura e atualiza payment_transactions/refunds.
 * TODO(pagamentos): implementar quando o fornecedor for escolhido (Stripe, Ifthenpay, Eupago, ...).
 */
export async function POST() {
  return Response.json({ ok: false, error: "fornecedor de pagamentos por configurar" }, { status: 501 });
}
