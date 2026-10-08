import { Battery, Briefcase, DoorOpen, Fuel, Gauge, Settings2, Users } from "lucide-react";

import { FUEL_LABEL, TRANSMISSION_LABEL, type Vehicle } from "@/domain/vehicle";
import { cn } from "@/lib/cn";

/** Mostra apenas as características que existem nos dados (doc §13). */
export function VehicleSpecs({ vehicle, compact, className }: { vehicle: Vehicle; compact?: boolean; className?: string }) {
  const items = [
    vehicle.transmission && { icon: Settings2, label: TRANSMISSION_LABEL[vehicle.transmission] },
    vehicle.fuel && { icon: vehicle.fuel === "electric" ? Battery : Fuel, label: FUEL_LABEL[vehicle.fuel] },
    vehicle.seats && { icon: Users, label: `${vehicle.seats} lugares` },
    vehicle.doors && !compact && { icon: DoorOpen, label: `${vehicle.doors} portas` },
    vehicle.luggage !== undefined && vehicle.luggage > 0 && !compact && { icon: Briefcase, label: `${vehicle.luggage} malas` },
    vehicle.range && !compact && { icon: Gauge, label: `${vehicle.range} km autonomia` },
  ].filter(Boolean) as Array<{ icon: typeof Users; label: string }>;

  return (
    <ul className={cn("flex flex-wrap gap-x-4 gap-y-1.5 text-body-small text-copy-secondary", className)}>
      {items.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-1.5">
          <Icon className="size-4 text-copy-muted" aria-hidden />
          {label}
        </li>
      ))}
    </ul>
  );
}
