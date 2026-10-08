/**
 * Região é um conceito de primeira classe (doc §6).
 * Cada viatura, oferta, cliente, reserva ou localização pode estar associada a uma região.
 */
export type Region = "mainland" | "azores";

export const REGIONS: readonly Region[] = ["mainland", "azores"] as const;

export interface RegionConfig {
  id: Region;
  label: string;
  shortLabel: string;
  /** Host de produção. */
  host: string;
  /** Prefixo de subdomínio usado para detetar a região (ex.: "acores."). */
  subdomain: string | null;
  logo: { light: string; dark: string; square: string };
  /** null = ainda não fornecido pelo cliente (mostrado como "A confirmar") */
  contact: { phone: string | null; email: string | null; address: string | null };
  seo: { title: string; description: string };
}

export const REGION_CONFIG: Record<Region, RegionConfig> = {
  mainland: {
    id: "mainland",
    label: "Portugal Continental",
    shortLabel: "Continente",
    host: "www.decadaousada.pt",
    subdomain: null,
    logo: {
      light: "/brand/mainland-light.png",
      dark: "/brand/mainland-dark.png",
      square: "/brand/mainland-square.png",
    },
    // TODO(conteúdo): contactos reais a fornecer pela DÉCADA OUSADA
    contact: { phone: null, email: null, address: null },
    seo: {
      title: "DÉCADA OUSADA | Rent a Car e TVDE em Portugal Continental",
      description:
        "Aluguer de viaturas ao dia e viaturas TVDE à semana em Portugal Continental. Pesquise, reserve e candidate-se online.",
    },
  },
  azores: {
    id: "azores",
    label: "Açores",
    shortLabel: "Açores",
    host: "acores.decadaousada.pt",
    subdomain: "acores",
    logo: {
      light: "/brand/azores-light.png",
      dark: "/brand/azores-dark.png",
      square: "/brand/azores-square.png",
    },
    contact: { phone: null, email: null, address: null },
    seo: {
      title: "DÉCADA OUSADA Açores | Rent a Car e TVDE",
      description:
        "Aluguer de viaturas e viaturas TVDE nos Açores. Levantamento em Ponta Delgada e restantes pontos da região.",
    },
  },
};

export function isRegion(value: unknown): value is Region {
  return value === "mainland" || value === "azores";
}

/** Deteta a região a partir do host do pedido (acores.decadaousada.pt, acores.localhost, ...). */
/** Domínio real do site (decadaousada.pt e subdomínios). Fora dele (localhost, *.vercel.app) é demo/pré-visualização. */
export function isLiveDomain(host: string | null | undefined): boolean {
  const hostname = (host ?? "").split(":")[0].toLowerCase();
  return hostname === "decadaousada.pt" || hostname.endsWith(".decadaousada.pt");
}

export function regionFromHost(host: string | null | undefined): Region {
  const hostname = (host ?? "").split(":")[0].toLowerCase();
  return hostname.startsWith("acores.") ? "azores" : "mainland";
}

/** Segmento usado no URL público das páginas SEO regionais. */
export const REGION_PATH_SLUG: Record<Region, string> = {
  mainland: "continente",
  azores: "acores",
};
