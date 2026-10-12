import { CalendarX } from "lucide-react";

import { formatMileage, type VehicleOffer } from "@/domain/offer";
import { formatMoney } from "@/domain/pricing";
import { cn } from "@/lib/cn";

/**
 * Custos que pesam na decisão de alugar (Rent a Car), junto do preço no painel da viatura:
 * caução, franquia, km incluídos e km adicional, e a política de cancelamento. Só os
 * valores que a oferta traz (API); nada é calculado aqui. Na página da viatura estes
 * campos saem da lista "Condições" (uma fonte por informação, VehicleOverview).
 */
export const OFFER_COST_LABELS = ["Caução", "Franquia", "Quilometragem incluída", "Km adicional", "Cancelamento"];

export function OfferCostFacts({ offer, className }: { offer: VehicleOffer; className?: string }) {
  const facts = [
    offer.deposit !== undefined && { label: "Caução", value: formatMoney(offer.deposit) },
    offer.excess !== undefined && { label: "Franquia", value: formatMoney(offer.excess) },
    offer.mileageLimit !== undefined && { label: "Km incluídos", value: formatMileage(offer) ?? "" },
    offer.extraKmPrice !== undefined && { label: "Km adicional", value: `${formatMoney(offer.extraKmPrice, "EUR", { decimals: true })}/km` },
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  if (!facts.length && !offer.cancellationPolicy) return null;
  return (
    <div className={className}>
      {facts.length > 0 && (
        <dl className="grid grid-cols-2 gap-3 rounded-card bg-panel-alt p-4 text-body-small">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="text-copy-muted">{f.label}</dt>
              <dd className="font-bold tabular">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {offer.cancellationPolicy && (
        <p className={cn("flex gap-2 text-body-small text-copy-secondary", facts.length > 0 && "mt-3")}>
          <CalendarX className="mt-0.5 size-4 shrink-0 text-copy-muted" aria-hidden />
          <span>{offer.cancellationPolicy}</span>
        </p>
      )}
    </div>
  );
}
