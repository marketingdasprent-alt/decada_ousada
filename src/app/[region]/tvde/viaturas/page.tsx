import { CalendarRange } from "lucide-react";
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
import { formatDateTime } from "@/lib/dates";
import { regionFromParams } from "@/lib/region";
import { firstParam } from "@/lib/search";
import { listLocations, listVehicles } from "@/services/wegest";

export const metadata: Metadata = { title: "Viaturas TVDE" };

type SP = Record<string, string | string[] | undefined>;
const LOCAL_DT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export default async function TvdeVehiclesPage({ params, searchParams }: PageProps<"/[region]/tvde/viaturas">) {
  const region = await regionFromParams(params);
  return (
    <>
      <PageHeader tone="dark"
        title="Viaturas TVDE"
        description="Preço por semana. A disponibilidade é confirmada ao escolher a data e o local de levantamento."
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

/** Com ?local= e ?inicio= (pesquisa TVDE): só viaturas desse local, e o levantamento segue para a viatura. */
async function Results({ region, searchParams }: { region: Region; searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [res, locations] = await Promise.all([attempt(() => listVehicles(region, "tvde")), listLocations(region, "tvde")]);
  const location = locations.find((l) => l.id === firstParam(sp.local));
  const start = firstParam(sp.inicio);
  const pickupAt = start && LOCAL_DT.test(start) ? start : undefined;
  const pickupQuery = location && pickupAt ? `?${new URLSearchParams({ local: location.id, inicio: pickupAt })}` : "";

  if (!res.ok) return <ErrorState timeout={res.timeout} retryHref="/tvde/viaturas" />;
  const vehicles = location ? res.data.filter((v) => !v.locations || v.locations.some((l) => l.id === location.id)) : res.data;

  return (
    <>
      {location && (
        <p className="mb-6 flex flex-wrap items-center gap-2 text-body-small text-copy-secondary">
          <CalendarRange className="size-4 text-copy-muted" aria-hidden />
          <span>
            Levantamento em <span className="font-semibold text-copy">{location.name}</span>
            {pickupAt && <>, a partir de {formatDateTime(pickupAt)}</>}. A disponibilidade confirma-se na viatura.
          </span>
          <Link href="/tvde" className="font-medium text-brand underline underline-offset-4 max-md:tap-target">Alterar</Link>
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
