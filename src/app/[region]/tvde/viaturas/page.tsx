import { MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { ButtonLink, Container, Section, Skeleton } from "@/components/shared/ui";
import { VehicleResults } from "@/components/vehicles/vehicle-results";
import type { Region } from "@/domain/region";
import { getOffer } from "@/domain/vehicle";
import { attempt } from "@/lib/attempt";
import { regionFromParams } from "@/lib/region";
import { withPickupLocations } from "@/lib/pickup-locations";
import { firstParam } from "@/lib/search";
import { listLocations, listVehicles } from "@/services/wegest";

export const metadata: Metadata = { title: "Viaturas TVDE" };

type SP = Record<string, string | string[] | undefined>;

export default async function TvdeVehiclesPage({ params, searchParams }: PageProps<"/[region]/tvde/viaturas">) {
  const region = await regionFromParams(params);
  return (
    <>
      <PageHeader tone="dark"
        title="Viaturas TVDE"
        description="Preço por semana. A data de levantamento escolhe-se em cada viatura, onde a disponibilidade é confirmada."
        crumbs={[{ href: "/tvde", label: "TVDE" }, { label: "Viaturas" }]}
      />
      <Section><Container>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <Results region={region} searchParams={searchParams} />
        </Suspense>
      </Container></Section>
    </>
  );
}

/**
 * Com ?local= (pesquisa TVDE): só viaturas desse local, e o local segue para a viatura,
 * onde se escolhe a data.
 */
async function Results({ region, searchParams }: { region: Region; searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [res, locations] = await Promise.all([attempt(() => listVehicles(region, "tvde")), listLocations(region, "tvde")]);
  const location = locations.find((l) => l.id === firstParam(sp.local));
  const pickupQuery = location ? `?${new URLSearchParams({ local: location.id })}` : "";

  if (!res.ok) return <ErrorState timeout={res.timeout} retryHref="/tvde/viaturas" />;
  const vehicles = withPickupLocations(location ? res.data.filter((v) => !v.locations || v.locations.some((l) => l.id === location.id)) : res.data, locations);

  return (
    <>
      {location && (
        // Uma linha de contexto: ícone, local e "Alterar" na mesma fila, mesmo a 360 px
        <p className="mb-6 flex items-center gap-2 text-body-small text-copy-secondary">
          <MapPin className="size-4 shrink-0 text-copy-muted" aria-hidden />
          <span className="min-w-0 flex-1 sm:flex-none">
            Viaturas com levantamento em <span className="font-semibold text-copy">{location.name}</span>.
          </span>
          <Link href="/tvde#pesquisa" className="shrink-0 font-medium text-brand underline underline-offset-4 max-md:tap-target">Alterar</Link>
        </p>
      )}
      {vehicles.length === 0 ? (
        <EmptyState
          title={location ? `Sem viaturas TVDE em ${location.name} de momento` : "Sem viaturas TVDE de momento"}
          description={location ? "Experimente outro local de levantamento." : "Volte em breve ou contacte-nos."}
          action={location ? <ButtonLink href="/tvde/viaturas" variant="outline">Ver todas as viaturas</ButtonLink> : undefined}
        />
      ) : (
        <VehicleResults product="tvde" items={vehicles.map((v) => ({ vehicle: v, offer: getOffer(v, "tvde")!, href: `/tvde/viatura/${v.slug}${pickupQuery}` }))} />
      )}
    </>
  );
}
