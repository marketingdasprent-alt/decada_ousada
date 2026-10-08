import { Check, Info } from "lucide-react";
import type { ReactNode } from "react";

import { formatMileage, type VehicleOffer } from "@/domain/offer";
import { formatMoney } from "@/domain/pricing";
import type { Vehicle } from "@/domain/vehicle";

import { VehicleGallery } from "./vehicle-gallery";
import { VehicleSpecs } from "./vehicle-specs";

/** Bloco comum da página de viatura (galeria, características, condições). */
export function VehicleOverview({ vehicle, offer, aside }: { vehicle: Vehicle; offer: VehicleOffer; aside: ReactNode }) {
  const isTvde = offer.type === "tvde";
  const conditions: Array<{ label: string; value: string }> = [
    offer.deposit !== undefined && { label: "Caução", value: formatMoney(offer.deposit) },
    offer.excess !== undefined && { label: "Franquia", value: formatMoney(offer.excess) },
    offer.mileageLimit !== undefined && { label: "Quilometragem incluída", value: formatMileage(offer) ?? "" },
    offer.extraKmPrice !== undefined && { label: "Km adicional", value: `${formatMoney(offer.extraKmPrice, "EUR", { decimals: true })}/km` },
    offer.minimumPeriod !== undefined && { label: "Período mínimo", value: `${offer.minimumPeriod} ${isTvde ? "semanas" : "dias"}` },
    offer.fuelPolicy && { label: "Combustível", value: offer.fuelPolicy },
    offer.cancellationPolicy && { label: "Cancelamento", value: offer.cancellationPolicy },
  ]
    .filter(Boolean)
    // TVDE: caução, km e período mínimo já estão no painel de decisão (uma fonte por informação)
    .filter((c) => !isTvde || !["Caução", "Quilometragem incluída", "Km adicional", "Período mínimo"].includes((c as { label: string }).label)) as Array<{ label: string; value: string }>;

  return (
    // Mobile: galeria, decisão (preço e ação), detalhes. Desktop: decisão fixa à direita.
    <div className="grid grid-cols-1 gap-10 lg:grid-main-aside lg:gap-x-10 lg:gap-y-0">
      <div className="min-w-0 lg:col-start-1">
        <VehicleGallery images={vehicle.images} name={vehicle.name} />
      </div>
      <aside className="lg:sticky-panel lg:col-start-2 lg:row-span-2 lg:row-start-1">{aside}</aside>
      <div className="min-w-0 lg:col-start-1">
        <section className="lg:mt-10" aria-labelledby="sobre">
          <h2 id="sobre" className="text-h4 font-bold">Sobre a viatura</h2>
          {vehicle.description && <p className="mt-2 text-copy-secondary">{vehicle.description}</p>}
          <VehicleSpecs vehicle={vehicle} className="mt-4" />
          <p className="mt-3 flex items-center gap-1.5 text-caption text-copy-muted">
            <Info className="size-3.5" aria-hidden /> Reserva por modelo: a viatura entregue pode ser este modelo ou similar da mesma categoria.
          </p>
        </section>

        {vehicle.features && vehicle.features.length > 0 && (
          <section className="mt-10" aria-labelledby="equip">
            <h2 id="equip" className="text-h4 font-bold">Equipamento</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {vehicle.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-body"><Check className="size-4 text-brand" aria-hidden />{f}</li>
              ))}
            </ul>
          </section>
        )}

        {offer.includes && offer.includes.length > 0 && (
          <section className="mt-10" aria-labelledby="inclui">
            <h2 id="inclui" className="text-h4 font-bold">Incluído no preço</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {offer.includes.map((f) => (
                <li key={f} className="flex items-center gap-2 text-body"><Check className="size-4 text-positive" aria-hidden />{f}</li>
              ))}
            </ul>
          </section>
        )}

        {conditions.length > 0 && (
          <section className="mt-10" aria-labelledby="condicoes">
            <h2 id="condicoes" className="text-h4 font-bold">Condições</h2>
            <dl className="mt-4 divide-y divide-line rounded-panel border border-line bg-panel">
              {conditions.map((c) => (
                <div key={c.label} className="grid gap-1 px-5 py-3.5 sm:grid-label-value">
                  <dt className="text-body-small text-copy-muted">{c.label}</dt>
                  <dd className="text-body font-medium">{c.value}</dd>
                </div>
              ))}
            </dl>
            {offer.terms && (
              <ul className="mt-4 list-disc space-y-1 pl-5 text-copy-secondary">
                {offer.terms.map((t) => <li key={t}>{t}</li>)}
              </ul>
            )}
          </section>
        )}

        {offer.requiredDocuments && offer.requiredDocuments.length > 0 && (
          <section className="mt-10" aria-labelledby="docs">
            <h2 id="docs" className="text-h4 font-bold">Documentação necessária</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {offer.requiredDocuments.map((d) => (
                <li key={d} className="flex items-center gap-2 text-body"><Check className="size-4 text-brand" aria-hidden />{d}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
