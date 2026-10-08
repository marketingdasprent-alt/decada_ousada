import type { Region } from "@/domain/region";

/** Localização (doc §88). Preferencialmente obtida da API. */
export interface Location {
  id: string;
  slug: string;
  name: string;
  region: Region;
  address?: string;
  latitude?: number;
  longitude?: number;
  pickupAvailable: boolean;
  returnAvailable: boolean;
  /** Horário em texto livre, se a API disponibilizar. */
  openingHours?: string;
  /** Produtos disponíveis neste ponto. */
  products?: Array<"rentacar" | "tvde">;
}
