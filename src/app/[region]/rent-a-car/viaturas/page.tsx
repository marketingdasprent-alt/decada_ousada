import { CalendarRange } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { RentACarSearchForm } from "@/components/rentacar/search-form";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorState, Notice } from "@/components/shared/states";
import { Container, Section, Skeleton } from "@/components/shared/ui";
import { VehicleResults, type ResultItem } from "@/components/vehicles/vehicle-results";
import type { Region } from "@/domain/region";
import { familyFromSlug, getOffer } from "@/domain/vehicle";
import { attempt } from "@/lib/attempt";
import { formatDateTime, rentalDays } from "@/lib/dates";
import { regionFromParams } from "@/lib/region";
import { firstParam, parseRentalSearch, rentalSearchQuery, searchToFormValues } from "@/lib/search";
import { listCategories, listLocations, listVehicles, searchRentACar } from "@/services/wegest";

export const metadata: Metadata = { title: "Viaturas Rent a Car" };

type SP = Record<string, string | string[] | undefined>;

export default async function RentACarResultsPage({ params, searchParams }: PageProps<"/[region]/rent-a-car/viaturas">) {
  const region = await regionFromParams(params);
  return (
    <Suspense fallback={<><PageHeader title="Viaturas" crumbs={[{ href: "/rent-a-car", label: "Rent a Car" }, { label: "Viaturas" }]} /><ResultsSkeleton /></>}>
      <Results region={region} searchParams={searchParams} />
    </Suspense>
  );
}

async function Results({ region, searchParams }: { region: Region; searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const search = parseRentalSearch(sp, region);
  const [locations, categories] = await Promise.all([listLocations(region, "rentacar"), listCategories()]);
  // ?tipo= vem da pesquisa (carros ou comerciais); ?categoria= da página de categorias.
  // Uma categoria de outro tipo é ignorada (o tipo foi escolhido depois, na pesquisa).
  const family = familyFromSlug(firstParam(sp.tipo));
  const category = categories.find((c) => c.slug === firstParam(sp.categoria) && (!family || c.family === family));
  const header = (
    <PageHeader
      title={category ? `Viaturas ${category.name}` : "Viaturas"}
      crumbs={[{ href: "/rent-a-car", label: "Rent a Car" }, { label: category?.name ?? "Viaturas" }]}
    />
  );

  const searchBar = (
    <Container className="-mt-6 relative">
      <div className="rounded-panel bg-panel p-4 shadow-floating sm:p-5">
        <RentACarSearchForm key={JSON.stringify(sp)} locations={locations} initial={searchToFormValues(search)} initialFamily={family ?? category?.family} variant="bar" collapsible={!!search} extraParams={category ? { categoria: category.slug } : undefined} />
      </div>
    </Container>
  );

  // Sem datas: mostra a frota com preço "desde", sem total (doc §10)
  if (!search) {
    const res = await attempt(() => listVehicles(region, "rentacar"));
    return (
      <>
        {header}
        {searchBar}
        <Section><Container>
          <Notice className="mb-6" title="Escolha as datas para ver disponibilidade e preço total">
            Os preços abaixo são por dia, com IVA. Disponibilidade e total do período são calculados pelo nosso sistema ao pesquisar.
          </Notice>
          {res.ok ? (
            <VehicleResults
              product="rentacar"
              items={res.data.map((v) => ({ vehicle: v, offer: getOffer(v, "rentacar")!, href: `/rent-a-car/viatura/${v.slug}` }))}
              initialCategory={category?.name}
              initialFamily={family ?? category?.family}
            />
          ) : (
            <ErrorState timeout={res.timeout} retryHref="/rent-a-car/viaturas" />
          )}
        </Container></Section>
      </>
    );
  }

  const res = await attempt(() => searchRentACar(search));
  const pickup = locations.find((l) => l.id === search.pickupLocationId);
  const days = rentalDays(search.pickupAt, search.returnAt);
  const query = rentalSearchQuery(search);

  return (
    <>
      {header}
      {searchBar}
      <Section><Container>
        <p className="mb-6 flex flex-wrap items-center gap-2 text-body-small text-copy-secondary">
          <CalendarRange className="size-4 text-copy-muted" aria-hidden />
          <span>
            <span className="font-semibold text-copy">{pickup?.name}</span>, {formatDateTime(search.pickupAt)} → {formatDateTime(search.returnAt)}, {days} {days === 1 ? "dia" : "dias"}
          </span>
        </p>
        {!res.ok ? (
          <ErrorState timeout={res.timeout} retryHref={`/rent-a-car/viaturas?${query}`} />
        ) : res.data.length === 0 ? (
          <EmptyState title="Não há viaturas disponíveis para estas datas." description="Experimente outras datas ou outro local de levantamento." />
        ) : (
          <VehicleResults
            product="rentacar"
            items={res.data.map<ResultItem>((r) => ({
              vehicle: r.vehicle,
              offer: r.offer,
              availability: r.availability,
              total: r.quote.total,
              days,
              href: `/rent-a-car/viatura/${r.vehicle.slug}?${query}`,
            }))}
            initialCategory={category?.name}
            initialFamily={family ?? category?.family}
          />
        )}
      </Container></Section>
    </>
  );
}

function ResultsSkeleton() {
  return (
    <Section><Container>
      <Skeleton className="mb-10 h-24 w-full" />
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-96" />)}
      </div>
    </Container></Section>
  );
}
