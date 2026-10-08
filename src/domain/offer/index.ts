import type { Availability } from "@/domain/availability";
import type { VehiclePricing } from "@/domain/pricing";
import type { Region } from "@/domain/region";

/**
 * Produtos comerciais. A arquitetura não se limita aos atuais (doc §1):
 * novos produtos (renting, long term, corporate, subscrição) entram aqui.
 */
export type ProductType = "rentacar" | "tvde";
export type FutureProductType = "renting" | "long_term" | "corporate" | "subscription";

/**
 * Separação VIATURA ↔ OFERTA COMERCIAL (doc §3).
 * A mesma viatura pode ter uma oferta Rent a Car (€/dia) e uma oferta TVDE (€/semana).
 */
export interface VehicleOffer {
  id: string;
  vehicleId: string;
  type: ProductType;
  region: Region;
  pricing: VehiclePricing;
  availability?: Availability;
  deposit?: number;
  /** Quilometragem incluída, por `mileagePeriod`. */
  mileageLimit?: number;
  /** Período da quilometragem incluída: no WeGest é por dia no Rent a Car e por mês no TVDE. */
  mileagePeriod?: "day" | "week" | "month";
  /** Custo por km adicional. */
  extraKmPrice?: number;
  /** Período mínimo, na unidade do preço. */
  minimumPeriod?: number;
  /** Franquia (Rent a Car). */
  excess?: number;
  fuelPolicy?: string;
  cancellationPolicy?: string;
  includes?: string[];
  terms?: string[];
  requiredDocuments?: string[];
}

export const PRODUCT_LABEL: Record<ProductType, string> = {
  rentacar: "Rent a Car",
  tvde: "TVDE",
};

const MILEAGE_PERIOD_LABEL = { day: "dia", week: "semana", month: "mês" } as const;

/** "6000 km por mês": quilometragem incluída com a unidade que vem da API. */
export function formatMileage(offer: Pick<VehicleOffer, "mileageLimit" | "mileagePeriod">): string | undefined {
  if (offer.mileageLimit === undefined) return undefined;
  const km = `${offer.mileageLimit.toLocaleString("pt-PT")} km`;
  return offer.mileagePeriod ? `${km} por ${MILEAGE_PERIOD_LABEL[offer.mileagePeriod]}` : km;
}
