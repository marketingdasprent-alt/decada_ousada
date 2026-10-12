import { ok } from "@/lib/api";
import { getInstagramFeed } from "@/services/instagram";

/** GET /api/instagram: últimas publicações do Instagram (usado pela landing /motoristas). */
export async function GET() {
  const feed = await getInstagramFeed(8);
  return ok(feed, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" } });
}
