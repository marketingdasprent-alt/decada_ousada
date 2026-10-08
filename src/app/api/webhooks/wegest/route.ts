import { createHmac, timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";

/**
 * POST /api/webhooks/wegest: preparado para quando o WeGest disponibilizar webhooks (doc §95).
 * A API v1.0.0 ainda não tem webhooks: entretanto o estado é consultado ao abrir o portal.
 *
 * Eventos previstos: vehicle.*, availability.changed, booking.*, application.*, document.requested, contract.created.
 * TODO(WeGest): confirmar o cabeçalho e o algoritmo da assinatura.
 */
export async function POST(req: Request) {
  const secret = process.env.WEGEST_WEBHOOK_SECRET;
  if (!secret) return Response.json({ ok: false, error: "webhooks não configurados" }, { status: 501 });

  const body = await req.text();
  const signature = req.headers.get("x-wegest-signature") ?? "";
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const event = JSON.parse(body) as { type?: string };
  // Invalida a cache do catálogo quando a frota muda
  if (event.type?.startsWith("vehicle.") || event.type === "availability.changed") {
    revalidateTag("wegest:vehicles", "max");
  }
  // TODO: application.updated → reconciliação de reembolsos + emails; booking.updated → emails
  return Response.json({ ok: true });
}
