import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PageHeader, PageSkeleton } from "@/components/shared/page-header";
import { TrackEvent } from "@/components/shared/track-event";
import { Card, Container, Section } from "@/components/shared/ui";
import { ApplicationChecklist } from "@/components/tvde/application-checklist";
import { PickupSelector } from "@/components/tvde/pickup-selector";
import { VehicleOverview } from "@/components/vehicles/vehicle-details";
import { formatMoney } from "@/domain/pricing";
import { isRegion, REGIONS } from "@/domain/region";
import { formatMileage } from "@/domain/offer";
import { getOffer } from "@/domain/vehicle";
import type { Location } from "@/domain/location";
import { attempt } from "@/lib/attempt";
import { firstParam } from "@/lib/search";
import { getApplicationForm, getVehicleBySlug, listLocations, listVehicles } from "@/services/wegest";

export async function generateStaticParams({ params }: { params: { region: string } }) {
  const regions = isRegion(params?.region) ? [params.region] : REGIONS;
  const all = await Promise.all(regions.map((r) => listVehicles(r, "tvde")));
  return all.flat().map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[region]/tvde/viatura/[slug]">): Promise<Metadata> {
  const { region, slug } = await params;
  const v = isRegion(region) ? await getVehicleBySlug(region, slug) : null;
  const offer = v && getOffer(v, "tvde");
  if (!v || !offer) return {};
  return { title: `${v.name} TVDE`, description: `${v.name} para TVDE por ${formatMoney(offer.pricing.amount)}/semana. Consulte caução, limite de quilómetros e condições.` };
}


type SP = Record<string, string | string[] | undefined>;

export default function Page({ params, searchParams }: { params: Promise<{ region: string; slug: string }>; searchParams: Promise<SP> }) {
  return (
    <Suspense fallback={<PageSkeleton tone="dark" />}>
      <TvdeVehicle params={params} searchParams={searchParams} />
    </Suspense>
  );
}

/** Seletor de levantamento com o local e a data vindos da pesquisa TVDE (?local=&inicio=). */
async function PickupFromSearch({ searchParams, vehicleId, locations }: { searchParams: Promise<SP>; vehicleId: string; locations: Location[] }) {
  const sp = await searchParams;
  return <PickupSelector vehicleId={vehicleId} locations={locations} initialLocationId={firstParam(sp.local)} initialPickupAt={firstParam(sp.inicio)} />;
}

async function TvdeVehicle({ params, searchParams }: { params: Promise<{ region: string; slug: string }>; searchParams: Promise<SP> }) {
  const { region, slug } = await params;
  if (!isRegion(region)) notFound();
  const vehicle = await getVehicleBySlug(region, slug);
  const offer = vehicle && getOffer(vehicle, "tvde");
  if (!vehicle || !offer) notFound();
  const [allLocations, form] = await Promise.all([listLocations(region, "tvde"), attempt(() => getApplicationForm(region))]);
  const locations = allLocations.filter((l) => !vehicle.locations || vehicle.locations.some((vl) => vl.id === l.id));
  const reservation = offer.pricing.reservationAmount ?? offer.deposit ?? 0;

  return (
    <>
      <TrackEvent name="tvde_vehicle_view" data={{ vehicleId: vehicle.id }} />
      <PageHeader tone="dark"
        title={vehicle.name}
        description="Viatura TVDE, ou similar"
        crumbs={[{ href: "/tvde", label: "TVDE" }, { href: "/tvde/viaturas", label: "Viaturas" }, { label: vehicle.name }]}
      />
      <Section><Container>
        <VehicleOverview
          vehicle={vehicle}
          offer={offer}
          aside={
            <div className="space-y-4">
            <Card className="p-6">
              {/* Preço semanal: nunca derivado de diária × 7 (doc §43) */}
              <p className="text-h1 font-bold tabular">{formatMoney(offer.pricing.amount)}<span className="text-body font-medium text-copy-muted">/semana</span></p>
              <dl className="mt-5 grid grid-cols-2 gap-3 rounded-card bg-panel-alt p-4 text-body-small">
                {offer.deposit !== undefined && <div><dt className="text-copy-muted">Caução</dt><dd className="font-bold tabular">{formatMoney(offer.deposit)}</dd></div>}
                {reservation > 0 && <div><dt className="text-copy-muted">Sinal (pago agora)</dt><dd className="font-bold tabular">{formatMoney(reservation)}</dd></div>}
                {offer.mileageLimit !== undefined && <div><dt className="text-copy-muted">Km incluídos</dt><dd className="font-bold tabular">{formatMileage(offer)}</dd></div>}
                {offer.extraKmPrice !== undefined && <div><dt className="text-copy-muted">Km adicional</dt><dd className="font-bold tabular">{formatMoney(offer.extraKmPrice, "EUR", { decimals: true })}</dd></div>}
                {offer.minimumPeriod !== undefined && <div><dt className="text-copy-muted">Período mínimo</dt><dd className="font-bold">{offer.minimumPeriod} semanas</dd></div>}
              </dl>
              {offer.deposit !== undefined && reservation > 0 && reservation < offer.deposit && (
                <p className="mt-3 text-caption text-copy-muted">O restante da caução ({formatMoney(offer.deposit - reservation)}) é pago no levantamento.</p>
              )}
              <hr className="my-6 border-line" />
              {locations.length ? (
                <Suspense fallback={<PickupSelector vehicleId={vehicle.id} locations={locations} />}>
                  <PickupFromSearch searchParams={searchParams} vehicleId={vehicle.id} locations={locations} />
                </Suspense>
              ) : <p className="text-body-small text-copy-secondary">Sem pontos de levantamento TVDE disponíveis.</p>}
            </Card>
            {form.ok && <ApplicationChecklist form={form.data} reservationAmount={reservation || undefined} />}
            </div>
          }
        />
      </Container></Section>
    </>
  );
}
