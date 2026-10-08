import { fail, fromError, fromZod, ok } from "@/lib/api";
import { regionFromRequest } from "@/lib/region";
import { quoteRequestSchema } from "@/lib/validation";
import { quoteRentACar } from "@/services/wegest";

/** POST /api/rentacar/quote: cotação com extras e cobertura (proxy para o WeGest). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return fail("validation", "Pedido inválido.", 400);
  const parsed = quoteRequestSchema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);
  try {
    const region = regionFromRequest(req);
    const quote = await quoteRentACar({ ...parsed.data, search: { ...parsed.data.search, region } });
    return ok(quote, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return fromError(err);
  }
}
