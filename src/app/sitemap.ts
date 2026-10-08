import type { MetadataRoute } from "next";

import { REGIONS, type Region } from "@/domain/region";
import { getOffer } from "@/domain/vehicle";
import { listLocations, listVehicles } from "@/services/wegest";

const BASE: Record<Region, string> = {
  mainland: process.env.APP_URL ?? "https://www.decadaousada.pt",
  azores: process.env.AZORES_APP_URL ?? "https://acores.decadaousada.pt",
};

/** Sitemap dos dois domínios regionais (doc §109). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (const region of REGIONS) {
    const base = BASE[region];
    const [locations, vehicles] = await Promise.all([listLocations(region), listVehicles(region)]);
    for (const path of ["", "/rent-a-car", "/rent-a-car/viaturas", "/tvde", "/tvde/viaturas", "/contactos", "/perguntas-frequentes"]) {
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
