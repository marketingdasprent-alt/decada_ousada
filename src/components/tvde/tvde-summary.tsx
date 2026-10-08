import { CalendarDays, MapPin } from "lucide-react";

import { formatMoney } from "@/domain/pricing";
import type { Vehicle } from "@/domain/vehicle";
import { formatDateTime } from "@/lib/dates";

import { VehicleImage } from "../vehicles/vehicle-image";

/** Linha curta do resumo para mobile: "Toyota Yaris Hybrid, 220 €/semana, sinal 200 €". */
export function tvdeSummaryLabel({ vehicleName, weeklyPrice, deposit, reservationAmount }: { vehicleName?: string; weeklyPrice: number; deposit?: number; reservationAmount?: number }): string {
  const now = reservationAmount ?? deposit ?? 0;
  return [vehicleName, `${formatMoney(weeklyPrice)}/semana`, now ? `sinal ${formatMoney(now)}` : null].filter(Boolean).join(", ");
}

export function TvdeSummary({
  vehicle,
  weeklyPrice,
  deposit,
  reservationAmount,
  pickupAt,
  locationName,
  reference,
}: {
  vehicle?: Vehicle | null;
  weeklyPrice: number;
  deposit?: number;
  reservationAmount?: number;
  pickupAt: string;
  locationName?: string;
  reference?: string;
}) {
  const now = reservationAmount ?? deposit ?? 0;
  return (
    <div className="overflow-hidden rounded-panel border border-line bg-panel">
      {vehicle && (
        <div className="flex gap-4 border-b border-line p-4">
          <VehicleImage image={vehicle.images[0]} className="aspect-vehicle w-28 shrink-0 rounded-control" sizes="112px" />
          <div>
            <p className="font-bold leading-tight">{vehicle.name}</p>
            <p className="text-caption text-copy-muted">TVDE, ou similar</p>
            {reference && <p className="mt-1 text-caption text-copy-muted">Candidatura {reference}</p>}
          </div>
        </div>
      )}
      <dl className="space-y-3 border-b border-line p-4 text-body-small">
        <div className="flex gap-3"><CalendarDays className="mt-0.5 size-4 text-copy-muted" aria-hidden /><dd>{formatDateTime(pickupAt)}</dd></div>
        {locationName && <div className="flex gap-3"><MapPin className="mt-0.5 size-4 text-copy-muted" aria-hidden /><dd>{locationName}</dd></div>}
      </dl>
      <dl className="space-y-2 p-4 text-body-small">
        <div className="flex justify-between"><dt className="text-copy-secondary">Preço semanal</dt><dd className="font-semibold tabular">{formatMoney(weeklyPrice)}/semana</dd></div>
        {deposit !== undefined && <div className="flex justify-between"><dt className="text-copy-secondary">Caução</dt><dd className="tabular">{formatMoney(deposit)}</dd></div>}
        {deposit !== undefined && now < deposit && <div className="flex justify-between"><dt className="text-copy-secondary">Restante (no levantamento)</dt><dd className="tabular">{formatMoney(deposit - now)}</dd></div>}
        <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
          <dt className="font-semibold">Sinal (pago agora)</dt>
          <dd className="text-h3 font-bold tabular">{formatMoney(now)}</dd>
        </div>
      </dl>
    </div>
  );
}
