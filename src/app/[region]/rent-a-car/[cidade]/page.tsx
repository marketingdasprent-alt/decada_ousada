import { Clock, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { RentACarSearchForm } from "@/components/rentacar/search-form";
import { PageHeader, PageSkeleton } from "@/components/shared/page-header";
import { Container, Section, SectionHeading } from "@/components/shared/ui";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { isRegion, REGIONS } from "@/domain/region";
import { getOffer } from "@/domain/vehicle";
import { listLocations, listVehicles } from "@/services/wegest";

/** Páginas SEO regionais: /rent-a-car/leiria, /rent-a-car/ponta-delgada… (doc §109). */
export async function generateStaticParams({ params }: { params: { region: string } }) {
  const regions = isRegion(params?.region) ? [params.region] : REGIONS;
  const all = await Promise.all(regions.map((r) => listLocations(r, "rentacar")));
  return all.flat().map((l) => ({ cidade: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[region]/rent-a-car/[cidade]">): Promise<Metadata> {
  const { region, cidade } = await params;
  if (!isRegion(region)) return {};
  const loc = (await listLocations(region, "rentacar")).find((l) => l.slug === cidade);
  return loc ? { title: `Rent a Car ${loc.name}`, description: `Aluguer de viaturas em ${loc.name}. Levantamento em ${loc.address ?? loc.name}. Reserve online com preço final.` } : {};
}


export default function Page({ params }: { params: Promise<{ region: string; cidade: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <City params={params} />
    </Suspense>
  );
}

async function City({ params }: { params: Promise<{ region: string; cidade: string }> }) {
  const { region, cidade } = await params;
  if (!isRegion(region)) notFound();
  const locations = await listLocations(region, "rentacar");
  const loc = locations.find((l) => l.slug === cidade);
  if (!loc) notFound();
  const vehicles = (await listVehicles(region, "rentacar")).filter((v) => !v.locations || v.locations.some((l) => l.id === loc.id));

  return (
    <>
      <PageHeader title={`Rent a Car ${loc.name}`} description={`Levante a sua viatura em ${loc.name}. Preço final com IVA e extras antes de pagar.`} crumbs={[{ href: "/rent-a-car", label: "Rent a Car" }, { label: loc.name }]}>
        <div className="flex flex-wrap gap-6 text-body-small text-on-dark/70">
          {loc.address && <p className="flex items-center gap-2"><MapPin className="size-4" aria-hidden />{loc.address}</p>}
          {loc.openingHours && <p className="flex items-center gap-2"><Clock className="size-4" aria-hidden />{loc.openingHours}</p>}
        </div>
      </PageHeader>
      <Container className="relative -mt-6">
        <RentACarSearchForm locations={locations} initial={{ pickupLocationId: loc.id, returnLocationId: loc.id }} />
      </Container>
      <Section><Container>
        <SectionHeading title={`Frota disponível em ${loc.name}`} />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => <VehicleCard key={v.id} vehicle={v} offer={getOffer(v, "rentacar")!} href={`/rent-a-car/viatura/${v.slug}`} />)}
        </div>
      </Container></Section>
    </>
  );
}
