import { fail, fromError, ok } from "@/lib/api";
import { regionFromRequest } from "@/lib/region";
import { parseRentalSearch } from "@/lib/search";
import { searchRentACar } from "@/services/wegest";

/** GET /api/rentacar/availability?levantamento=&devolucao=&inicio=&fim=: nunca em cache (doc §90). */
export async function GET(req: Request) {
  const region = regionFromRequest(req);
  const search = parseRentalSearch(Object.fromEntries(new URL(req.url).searchParams), region);
  if (!search) return fail("validation", "Pesquisa inválida.", 400);
  try {
    const results = await searchRentACar(search);
    return ok(results, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return fromError(err);
  }
}
