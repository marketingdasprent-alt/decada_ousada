import { CalendarRange } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { RentACarSearchForm } from "@/components/rentacar/search-form";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorState, Notice } from "@/components/shared/states";
import { ButtonLink, Container, Section, Skeleton } from "@/components/shared/ui";
import { VehicleResults, type ResultItem } from "@/components/vehicles/vehicle-results";
import type { Region } from "@/domain/region";
import { familyFromSlug } from "@/domain/vehicle";
import { attempt } from "@/lib/attempt";
import { addDays, formatDateShort, formatDateTime, rentalDays } from "@/lib/dates";
import { regionFromParams } from "@/lib/region";
import { firstParam, parseRentalSearch, rentalSearchQuery, searchToFormValues } from "@/lib/search";
import { listCategories, listLocations, searchRentACar, suggestRentACarDates } from "@/services/wegest";

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
  // ?tipo= vem da pesquisa (carros ou comerciais); ?categoria= da página Frota.
  // Uma categoria de outro tipo é ignorada (o tipo foi escolhido depois, na pesquisa).
  const family = familyFromSlug(firstParam(sp.tipo));
  const category = categories.find((c) => c.slug === firstParam(sp.categoria) && (!family || c.family === family));
  const header = (
    <PageHeader
      title={category ? `Viaturas ${category.name}` : "Viaturas"}
      crumbs={[{ href: "/rent-a-car", label: "Rent a Car" }, { label: category?.name ?? "Viaturas" }]}
    />
  );

  // A pesquisa é o primeiro passo: só se pergunta ao WeGest com local e datas
  const res = search ? await attempt(() => searchRentACar(search)) : null;
  const periodError = res && !res.ok && res.code === "validation" ? res.message : undefined;

  const searchBar = (
    <Container className="-mt-6 relative">
      <div className="rounded-panel bg-panel p-4 shadow-floating sm:p-5">
        <RentACarSearchForm
          key={JSON.stringify(sp)}
          locations={locations}
          initial={searchToFormValues(search) ?? partialFormValues(sp)}
          initialFamily={family ?? category?.family}
          initialError={periodError}
          variant="bar"
          collapsible={!!search}
          extraParams={category ? { categoria: category.slug } : undefined}
        />
      </div>
    </Container>
  );

  // Sem datas: só o formulário. O catálogo (com o preço por dia) fica na página Frota
  if (!search || !res) {
    return (
      <>
        {header}
        {searchBar}
        <Section><Container>
          <Notice title="Escolha o local e as datas para ver as viaturas livres">
            Mostramos só as viaturas disponíveis no período, com o preço total já calculado.{" "}
            <Link href="/rent-a-car/frota" className="font-medium text-brand underline underline-offset-4">Ver a frota completa</Link>
          </Notice>
        </Container></Section>
      </>
    );
  }

  // Datas recusadas pelo WeGest (400 PERIODO_INVALIDO e afins): a mensagem já está no formulário
  if (periodError) return <>{header}{searchBar}</>;

  const pickup = locations.find((l) => l.id === search.pickupLocationId);
  const days = rentalDays(search.pickupAt, search.returnAt);
  const query = rentalSearchQuery(search);
  const suggestions = res.ok && res.data.length === 0 ? await suggestRentACarDates(search) : [];
  const extra = new URLSearchParams({ ...(family && { tipo: firstParam(sp.tipo)! }), ...(category && { categoria: category.slug }) }).toString();

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
          <EmptyState
            title="Sem viaturas para estas datas."
            description={suggestions.length
              ? `Há viaturas livres noutras datas, para os mesmos ${days} ${days === 1 ? "dia" : "dias"}:`
              : "Experimente outras datas ou outro local de levantamento."}
            action={suggestions.length > 0 && (
              <ul className="flex flex-wrap justify-center gap-3">
                {suggestions.map((s) => (
                  <li key={s.search.pickupAt}>
                    <ButtonLink href={`/rent-a-car/viaturas?${rentalSearchQuery(s.search)}${extra ? `&${extra}` : ""}`} variant="outline" size="sm">
                      {formatDateShort(s.search.pickupAt)} a {formatDateShort(s.search.returnAt)}
                    </ButtonLink>
                  </li>
                ))}
              </ul>
            )}
          />
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

/** Pesquisa incompleta vinda de outra página (?levantamento= da página da cidade, ?data= da Frota). */
function partialFormValues(sp: SP) {
  const pickupLocationId = firstParam(sp.levantamento);
  const date = firstParam(sp.data);
  const pickupDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
  return {
    pickupLocationId,
    returnLocationId: firstParam(sp.devolucao) || pickupLocationId,
    pickupDate,
    returnDate: pickupDate && addDays(pickupDate, 3),
  };
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
