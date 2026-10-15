import type { Location } from "@/domain/location";
import type { Vehicle } from "@/domain/vehicle";

/**
 * Locais de levantamento de cada viatura, com a mesma regra da página da viatura: os
 * locais do produto (`locations`) onde a viatura está; sem restrição no WeGest, todos.
 * Assim o cartão nunca mostra um local que depois não se pode escolher.
 */
export function withPickupLocations(vehicles: Vehicle[], locations: Location[]): Vehicle[] {
  return vehicles.map((v) => ({ ...v, locations: v.locations ? locations.filter((l) => v.locations!.some((vl) => vl.id === l.id)) : locations }));
}
