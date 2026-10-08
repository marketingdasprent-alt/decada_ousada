import { REGION_CONFIG, REGIONS, isRegion, type Region } from "@/domain/region";

/** Lê a região do segmento [region] (definido pelo proxy). */
export async function regionFromParams(params: Promise<{ region: string }>): Promise<Region> {
  const { region } = await params;
  return isRegion(region) ? region : "mainland";
}

export function regionStaticParams() {
  return REGIONS.map((region) => ({ region }));
}

/** Link para a outra região: domínio próprio em produção, ?regiao= em desenvolvimento. */
export function regionSwitchHref(target: Region): string {
  const prodUrl = target === "azores" ? process.env.AZORES_APP_URL : process.env.APP_URL;
  if (process.env.NODE_ENV === "production" && prodUrl) return prodUrl;
  return `/?regiao=${target === "azores" ? "acores" : "continente"}`;
}

/** Região para Route Handlers (cabeçalho definido pelo proxy). */
export function regionFromRequest(req: Request): Region {
  const r = req.headers.get("x-do-region");
  return isRegion(r) ? r : "mainland";
}

export { REGION_CONFIG };
