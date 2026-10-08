import { CalendarDays, MapPin } from "lucide-react";
import type { ReactNode } from "react";

import { formatMoney, type Quote } from "@/domain/pricing";
import type { Vehicle } from "@/domain/vehicle";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/dates";

import { VehicleImage } from "../vehicles/vehicle-image";

/** Resumo da reserva: os valores vêm SEMPRE da cotação da API (doc §17, §76). */
export function BookingSummary({
  vehicle,
  quote,
  pickup,
  ret,
  pickupAt,
  returnAt,
  updating,
  footer,
}: {
  vehicle: Vehicle;
  quote: Quote | null;
  pickup?: string;
  ret?: string;
  pickupAt: string;
  returnAt: string;
  updating?: boolean;
  footer?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-panel border border-line bg-panel">
      <div className="flex gap-4 border-b border-line p-4">
        <VehicleImage image={vehicle.images[0]} className="aspect-vehicle w-28 shrink-0 rounded-control" sizes="112px" />
        <div className="min-w-0">
          <p className="font-bold leading-tight">{vehicle.name}</p>
          <p className="text-caption text-copy-muted">{vehicle.category?.name}, ou similar</p>
        </div>
      </div>
      <dl className="space-y-3 border-b border-line p-4 text-body-small">
        <div className="flex gap-3">
          <MapPin className="mt-0.5 size-4 shrink-0 text-copy-muted" aria-hidden />
          <div>
            <dt className="sr-only">Locais</dt>
            <dd>{pickup}{ret && ret !== pickup ? ` → ${ret}` : ""}</dd>
          </div>
        </div>
        <div className="flex gap-3">
          <CalendarDays className="mt-0.5 size-4 shrink-0 text-copy-muted" aria-hidden />
          <div>
            <dt className="sr-only">Datas</dt>
            <dd>{formatDateTime(pickupAt)}<br />{formatDateTime(returnAt)}</dd>
          </div>
        </div>
      </dl>
      <div className={cn("p-4 transition-opacity", updating && "opacity-50")} aria-live="polite" aria-busy={updating}>
        {quote ? (
          <>
            <ul className="space-y-2 text-body-small">
              {quote.lines.map((l) => (
                <li key={l.id} className="flex justify-between gap-4">
                  <span className={cn(l.kind === "discount" ? "text-positive" : "text-copy-secondary")}>{l.label}</span>
                  <span className="shrink-0 tabular">{formatMoney(l.amount, "EUR", { decimals: true })}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 border-t border-line pt-4 text-body-small">
              <div className="flex justify-between text-copy-secondary"><span>Subtotal (sem IVA)</span><span className="tabular">{formatMoney(quote.subtotal, "EUR", { decimals: true })}</span></div>
              <div className="flex justify-between text-copy-secondary"><span>IVA</span><span className="tabular">{formatMoney(quote.taxes, "EUR", { decimals: true })}</span></div>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-h3 font-bold tabular">{formatMoney(quote.total, "EUR", { decimals: true })}</span>
            </div>
            {(quote.deposit !== undefined || quote.excess !== undefined) && (
              <div className="mt-4 rounded-control bg-panel-alt p-3 text-caption text-copy-secondary">
                {quote.deposit !== undefined && <p>Caução no levantamento: <strong className="tabular">{formatMoney(quote.deposit)}</strong></p>}
                {quote.excess !== undefined && quote.excess !== null && <p>Franquia: <strong className="tabular">{formatMoney(quote.excess)}</strong></p>}
                {quote.kmIncludedPerDay !== undefined && <p>{quote.kmIncludedPerDay === null ? "Quilómetros ilimitados" : `${quote.kmIncludedPerDay.toLocaleString("pt-PT")} km por dia incluídos`}</p>}
              </div>
            )}
          </>
        ) : (
          <p className="text-body-small text-copy-muted">A calcular o preço…</p>
        )}
      </div>
      {footer && <div className="border-t border-line p-4">{footer}</div>}
    </div>
  );
}
