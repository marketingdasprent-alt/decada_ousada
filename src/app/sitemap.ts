import type { MetadataRoute } from "next";
import { connection } from "next/server";

import { REGIONS, type Region } from "@/domain/region";
import { getOffer } from "@/domain/vehicle";
import { listLocations, listVehicles } from "@/services/wegest";
import { WeGestError } from "@/services/wegest/types";

const BASE: Record<Region, string> = {
  mainland: process.env.APP_URL ?? "https://www.decadaousada.pt",
  azores: process.env.AZORES_APP_URL ?? "https://acores.decadaousada.pt",
};

/**
 * Locais e viaturas da região. Se o WeGest não responder no build, connection() passa o sitemap
 * para o pedido em vez de falhar o deploy; se continuar sem resposta no pedido, o sitemap sai só
 * com as páginas fixas.
 */
async function catalog(region: Region) {
  try {
    return await Promise.all([listLocations(region), listVehicles(region)]);
  } catch (err) {
    if (!(err instanceof WeGestError)) throw err;
    await connection();
    console.warn(`[wegest] sitemap sem catálogo (${err.code}): só as páginas fixas.`);
    return [[], []] as const;
  }
}

/** Sitemap dos dois domínios regionais (doc §109). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (const region of REGIONS) {
    const base = BASE[region];
    const [locations, vehicles] = await catalog(region);
    for (const path of ["", "/rent-a-car", "/rent-a-car/viaturas", "/rent-a-car/frota", "/tvde", "/tvde/viaturas", "/motoristas", "/contactos", "/perguntas-frequentes", "/privacidade"]) {
      entries.push({ url: `${base}${path}` });
    }
    for (const l of locations) if (!l.products || l.products.includes("rentacar")) entries.push({ url: `${base}/rent-a-car/${l.slug}` });
    for (const v of vehicles) {
      if (getOffer(v, "rentacar")) entries.push({ url: `${base}/rent-a-car/viatura/${v.slug}` });
      if (getOffer(v, "tvde")) entries.push({ url: `${base}/tvde/viatura/${v.slug}` });
    }
  }
  return entries;
}
