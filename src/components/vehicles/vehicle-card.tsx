import Link from "next/link";

import { AVAILABILITY_LABEL, type Availability } from "@/domain/availability";
import { formatMileage, type VehicleOffer } from "@/domain/offer";
import { formatMoney } from "@/domain/pricing";
import { formatDate } from "@/lib/dates";
import type { Vehicle } from "@/domain/vehicle";
import { cn } from "@/lib/cn";

import { buttonClass } from "../shared/ui";
import { VehicleImage } from "./vehicle-image";
import { VehicleSpecs } from "./vehicle-specs";

interface CardProps {
  vehicle: Vehicle;
  offer: VehicleOffer;
  href: string;
  availability?: Availability;
  /** Total do período devolvido pela API (Rent a Car com datas). */
  total?: number;
  days?: number;
}

/** Card de viatura (doc §12, §40): cada produto tem o seu (doc §127). */
export function VehicleCard(props: CardProps) {
  return props.offer.type === "tvde" ? <TvdeCard {...props} /> : <RentACarCard {...props} />;
}

/** Disponibilidade só quando é exceção: "Disponível" em todos os cards era ruído. */
function AvailabilityFlag({ availability, dark }: { availability?: Availability; dark?: boolean }) {
  if (!availability || availability.status === "available") return null;
  const unavailable = availability.status === "unavailable";
  return (
    <p className={cn("self-start rounded-control px-2 py-0.5 text-caption font-semibold", unavailable ? "bg-negative-surface text-negative" : dark ? "bg-on-dark/10 text-on-dark" : "bg-caution-surface text-caution")}>
      {unavailable && availability.nextAvailableAt ? `Indisponível até ${formatDate(availability.nextAvailableAt.slice(0, 10))}` : AVAILABILITY_LABEL[availability.status]}
    </p>
  );
}

/**
 * Rent a Car (direção A): o número grande é o que o cliente paga. Com datas, é o
 * total do período; sem datas, o preço por dia. O card inteiro é o link.
 */
function RentACarCard({ vehicle, offer, href, availability, total, days }: CardProps) {
  const unavailable = availability?.status === "unavailable";
  const hasTotal = total !== undefined;
  return (
    <article className={cn("group relative flex flex-col overflow-hidden rounded-panel border border-line bg-panel text-copy transition-colors hover:border-copy has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-focus has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-on-dark", unavailable && "opacity-70")}>
      <div className="relative">
        <VehicleImage image={vehicle.images[0]} className="aspect-vehicle" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" />
        {vehicle.category && (
          <span className="slant absolute left-3 top-3 bg-panel-dark px-3 py-0.5 text-caption font-semibold text-on-dark">{vehicle.category.name}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <h3 className="text-body-large font-bold leading-tight">
          {/* Link esticado: todo o card é clicável, com um só nome acessível */}
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {vehicle.name}
          </Link>
        </h3>
        <p className="-mt-1.5 text-caption text-copy-muted">ou similar</p>
        <VehicleSpecs vehicle={vehicle} compact />
        <AvailabilityFlag availability={availability} />
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
          <p className="display text-h2 tabular">{formatMoney(hasTotal ? total : offer.pricing.amount)}</p>
          <p className="text-right text-caption text-copy-secondary">
            {hasTotal ? (
              <>
                {days} {days === 1 ? "dia" : "dias"}
                <br />
                {formatMoney(offer.pricing.amount)} por dia
              </>
            ) : (
              <>
                por dia
                <br />
                total ao escolher datas
              </>
            )}
          </p>
        </div>
      </div>
    </article>
  );
}

/**
 * TVDE (direção B, "o recibo"): responde à pergunta do motorista, quanto paga agora
 * e quanto paga por semana. O escuro fica reservado ao produto profissional.
 */
function TvdeCard({ vehicle, offer, href, availability }: CardProps) {
  const now = offer.pricing.reservationAmount ?? offer.deposit;
  const conditions = [
    offer.deposit !== undefined && `Caução de ${formatMoney(offer.deposit)}`,
    formatMileage(offer),
    offer.minimumPeriod !== undefined && `mínimo de ${offer.minimumPeriod} semanas`,
  ].filter(Boolean);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-panel bg-panel-dark text-on-dark ring-1 ring-on-dark/10 transition-shadow hover:ring-on-dark/40 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-focus has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-on-dark">
      <VehicleImage image={vehicle.images[0]} surface="dark" className="aspect-vehicle" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" />
      <div className="flex flex-1 flex-col gap-3.5 p-5">
        <div>
          <h3 className="text-body-large font-bold leading-tight">
            <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
              {vehicle.name}
            </Link>
          </h3>
          <p className="mt-1 text-body-small text-on-dark/75">
            {[vehicle.category?.name, vehicle.transmission === "automatic" ? "automático" : vehicle.transmission === "manual" ? "manual" : null, vehicle.seats && `${vehicle.seats} lugares`].filter(Boolean).join(", ")}
          </p>
        </div>
        <AvailabilityFlag availability={availability} dark />
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card bg-on-dark/15">
          {now !== undefined && (
            <div className="bg-panel-dark px-3.5 py-3">
              <dt className="text-caption text-on-dark/75">Sinal (pago agora)</dt>
              <dd className="display mt-1 text-h3 tabular">{formatMoney(now)}</dd>
            </div>
          )}
          <div className="bg-panel-dark px-3.5 py-3">
            <dt className="text-caption text-on-dark/75">Por semana</dt>
            <dd className="display mt-1 text-h3 tabular">{formatMoney(offer.pricing.amount)}</dd>
          </div>
        </dl>
        {conditions.length > 0 && <p className="text-body-small text-on-dark/75">{conditions.join(", ")}.</p>}
        <span className={buttonClass("light", "md", "mt-auto w-full")} aria-hidden>
          Ver viatura
        </span>
      </div>
    </article>
  );
}
