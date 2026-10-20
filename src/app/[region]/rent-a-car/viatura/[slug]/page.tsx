import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { RentACarSearchForm } from "@/components/rentacar/search-form";
import { PageHeader, PageSkeleton } from "@/components/shared/page-header";
import { PriceDisplay } from "@/components/shared/price-display";
import { Notice } from "@/components/shared/states";
import { TrackEvent } from "@/components/shared/track-event";
import { Badge, ButtonLink, Card, Container, Section, Skeleton } from "@/components/shared/ui";
import { OfferCostFacts } from "@/components/vehicles/offer-cost-facts";
import { VehicleOverview } from "@/components/vehicles/vehicle-details";
import { AVAILABILITY_LABEL } from "@/domain/availability";
import type { VehicleOffer } from "@/domain/offer";
import { formatMoney } from "@/domain/pricing";
import { isRegion, REGIONS, type Region } from "@/domain/region";
import { getOffer, type Vehicle } from "@/domain/vehicle";
import { attempt } from "@/lib/attempt";
import { formatDateTime, rentalDays } from "@/lib/dates";
import { parseRentalSearch, rentalSearchQuery, searchToFormValues } from "@/lib/search";
import { checkVehicleAvailability, getVehicleBySlug, listLocations, listVehicles, onlineRequestsEnabled, quoteRentACar } from "@/services/wegest";
import { wegestStaticParams } from "@/lib/static-params";

export async function generateStaticParams({ params }: { params: { region: string } }) {
  const regions = isRegion(params?.region) ? [params.region] : REGIONS;
  return wegestStaticParams(async () => {
    const all = await Promise.all(regions.map((r) => listVehicles(r, "rentacar")));
    return all.flat().map((v) => ({ slug: v.slug }));
  }, "slug");
}

export async function generateMetadata({ params }: PageProps<"/[region]/rent-a-car/viatura/[slug]">): Promise<Metadata> {
  const { region, slug } = await params;
  const v = isRegion(region) ? await getVehicleBySlug(region, slug) : null;
  if (!v) return {};
  const offer = getOffer(v, "rentacar");
  return {
    title: `Alugar ${v.name}`,
    description: `${v.name} ou similar${offer ? ` desde ${formatMoney(offer.pricing.amount)}/dia` : ""}. ${v.description ?? ""}`.trim(),
  };
}

type SP = Record<string, string | string[] | undefined>;

export default function RentACarVehiclePage({ params, searchParams }: PageProps<"/[region]/rent-a-car/viatura/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <RacVehicle params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function RacVehicle({ params, searchParams }: { params: Promise<{ region: string; slug: string }>; searchParams: Promise<SP> }) {
  const { region: r, slug } = await params;
  if (!isRegion(r)) notFound();
  const vehicle = await getVehicleBySlug(r, slug);
  const offer = vehicle && getOffer(vehicle, "rentacar");
  if (!vehicle || !offer) notFound();

  return (
    <>
      <TrackEvent name="rentacar_vehicle_view" data={{ vehicleId: vehicle.id }} />
      <PageHeader
        title={vehicle.name}
        description={`${vehicle.category?.name ?? ""}, ou similar`}
        crumbs={[{ href: "/rent-a-car", label: "Rent a Car" }, { href: "/rent-a-car/frota", label: "Frota" }, { label: vehicle.name }]}
      />
      <Section><Container>
        <VehicleOverview
          vehicle={vehicle}
          offer={offer}
          aside={
            <Suspense fallback={<Skeleton className="h-96" />}>
              <BookingPanel region={r} vehicle={vehicle} offer={offer} searchParams={searchParams} />
            </Suspense>
          }
        />
      </Container></Section>
    </>
  );
}

async function BookingPanel({ region, vehicle, offer, searchParams }: { region: Region; vehicle: Vehicle; offer: VehicleOffer; searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const search = parseRentalSearch(sp, region);
  const locations = (await listLocations(region, "rentacar")).filter((l) => !vehicle.locations || vehicle.locations.some((vl) => vl.id === l.id));

  if (!search) {
    return (
      <Card className="p-6">
        <PriceDisplay amount={offer.pricing.amount} unit="day" prefix="Desde" size="xl" note="IVA incluído" />
        {/* Caução, franquia, km e cancelamento junto do preço: o custo real não fica escondido no fim da página */}
        <OfferCostFacts offer={offer} className="mt-5" />
        <p className="mt-5 text-body text-copy-secondary">Escolha as datas para confirmar a disponibilidade e ver o preço total.</p>
        <div className="mt-5">
          <RentACarSearchForm locations={locations} variant="stack" action={`/rent-a-car/viatura/${vehicle.slug}`} />
        </div>
      </Card>
    );
  }

  // Disponibilidade e preço consultados no momento (doc §89–90)
  const [avail, quote] = await Promise.all([
    attempt(() => checkVehicleAvailability({ region, product: "rentacar", vehicleId: vehicle.id, pickupLocationId: search.pickupLocationId, returnLocationId: search.returnLocationId, pickupAt: search.pickupAt, returnAt: search.returnAt })),
    attempt(() => quoteRentACar({ vehicleId: vehicle.id, offerId: offer.id, search, extras: [] })),
  ]);
  const days = rentalDays(search.pickupAt, search.returnAt);
  const pickup = locations.find((l) => l.id === search.pickupLocationId);
  const ret = locations.find((l) => l.id === search.returnLocationId);
  const available = avail.ok && avail.data.status !== "unavailable";

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <p className="text-body-small font-semibold">A sua pesquisa</p>
        {avail.ok && <Badge tone={available ? "ok" : "danger"}>{AVAILABILITY_LABEL[avail.data.status]}</Badge>}
      </div>
      <dl className="mt-4 space-y-3 text-body-small">
        <div>
          <dt className="text-copy-muted">Levantamento</dt>
          <dd className="font-medium">{pickup?.name ?? "Local por confirmar"}, {formatDateTime(search.pickupAt)}</dd>
        </div>
        <div>
          <dt className="text-copy-muted">Devolução</dt>
          <dd className="font-medium">{ret?.name ?? pickup?.name ?? "Local por confirmar"}, {formatDateTime(search.returnAt)}</dd>
        </div>
      </dl>
      <hr className="my-5 border-line" />
      {quote.ok ? (
        <>
          {/* O total do período é o número que o cliente paga: o maior, no tipo display dos preços */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-body-small font-semibold">Total, {days} {days === 1 ? "dia" : "dias"}</p>
              <p className="text-caption text-copy-muted">{formatMoney(offer.pricing.amount)} por dia, IVA incluído</p>
            </div>
            <p className="display text-h2 tabular">{formatMoney(quote.data.total)}</p>
          </div>
          {quote.data.lines.some((l) => l.kind === "discount" || l.kind === "fee") && (
            <ul className="mt-3 space-y-1 text-caption text-copy-secondary">
              {quote.data.lines.filter((l) => l.kind === "discount" || l.kind === "fee").map((l) => (
                <li key={l.id} className="flex justify-between"><span>{l.label}</span><span className="tabular">{formatMoney(l.amount, "EUR", { decimals: true })}</span></li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <Notice tone="warn">Não foi possível obter o preço neste momento. Tente novamente.</Notice>
      )}
      {!onlineRequestsEnabled() ? (
        <ButtonLink href="/contactos" size="lg" className="mt-6 w-full">Contactar a equipa</ButtonLink>
      ) : available && quote.ok ? (
        <ButtonLink href={`/rent-a-car/reserva?viatura=${vehicle.id}&${rentalSearchQuery(search)}`} size="lg" className="mt-6 w-full">
          Reservar
        </ButtonLink>
      ) : (
        <Notice tone="warn" className="mt-6">
          {avail.ok ? "Esta viatura não está disponível nestas datas. Altere as datas ou veja outras viaturas." : "Não foi possível confirmar a disponibilidade."}
        </Notice>
      )}
      {/* Total, ação e logo a seguir os custos e o cancelamento: a 1280x800 o "Reservar" fica à
          vista sem scroll, e os custos continuam no mesmo cartão (e no resumo antes de pagar) */}
      <OfferCostFacts offer={offer} className="mt-5" />
      <details className="mt-5 text-body-small">
        <summary className="cursor-pointer font-medium text-brand max-md:min-h-(--layout-tap) max-md:py-2.5">Alterar datas</summary>
        <div className="mt-4">
          <RentACarSearchForm locations={locations} initial={searchToFormValues(search)} variant="stack" action={`/rent-a-car/viatura/${vehicle.slug}`} />
        </div>
      </details>
    </Card>
  );
}
