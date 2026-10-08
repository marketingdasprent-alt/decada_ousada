import type { Location } from "@/domain/location";
import type { ProductType, VehicleOffer } from "@/domain/offer";
import type { Region } from "@/domain/region";

export interface VehicleImage {
  url: string;
  alt: string;
  /** Ilustração gerada enquanto o WeGest não fornecer fotografia do modelo. */
  placeholder?: { paint: string; body: VehicleBody };
  /** Fotografia de banco de imagens (modelo igual, não a viatura da frota): mostra "Imagem ilustrativa". */
  illustrative?: boolean;
}

/** Carroçaria, para a ilustração quando não há fotografia. */
export type VehicleBody = "sedan" | "suv" | "van";

export type FuelType = "petrol" | "diesel" | "hybrid" | "plugin_hybrid" | "electric" | "lpg";
export type Transmission = "manual" | "automatic";
export type VehicleFamily = "passenger" | "commercial";

export interface VehicleCategory {
  id: string;
  slug: string;
  name: string;
  family: VehicleFamily;
}

/** Modelo interno de viatura (doc §83). O frontend depende apenas deste modelo. */
export interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  /** "Peugeot 208" */
  name: string;
  description?: string;
  images: VehicleImage[];
  category?: VehicleCategory;
  fuel?: FuelType;
  transmission?: Transmission;
  seats?: number;
  doors?: number;
  luggage?: number;
  /** Autonomia em km (relevante em elétricos/TVDE). */
  range?: number;
  features?: string[];
  region?: Region;
  locations?: Location[];
  offers: VehicleOffer[];
}

export const FUEL_LABEL: Record<FuelType, string> = {
  petrol: "Gasolina",
  diesel: "Diesel",
  hybrid: "Híbrido",
  plugin_hybrid: "Híbrido plug-in",
  electric: "Elétrico",
  lpg: "GPL",
};

export const TRANSMISSION_LABEL: Record<Transmission, string> = {
  manual: "Manual",
  automatic: "Automático",
};

export const FAMILY_LABEL: Record<VehicleFamily, string> = {
  passenger: "Passageiros",
  commercial: "Comerciais",
};

export function getOffer(vehicle: Vehicle, type: ProductType): VehicleOffer | undefined {
  return vehicle.offers.find((o) => o.type === type);
}
