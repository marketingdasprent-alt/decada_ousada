import { connection } from "next/server";

import { integrationMode, pingWeGest } from "@/services/wegest";

/** GET /api/health: estado do site e da integração (monitorização, doc §115). */
export async function GET() {
  await connection();
  const wegest = await pingWeGest();
  return Response.json(
    { ok: wegest.ok, wegest: { mode: integrationMode(), ok: wegest.ok, latencyMs: wegest.latencyMs }, time: new Date().toISOString() },
    { status: wegest.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
