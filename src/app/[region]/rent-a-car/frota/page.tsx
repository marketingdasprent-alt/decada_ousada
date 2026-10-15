import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { ErrorState, Notice } from "@/components/shared/states";
import { Container, Section, Skeleton } from "@/components/shared/ui";
import { VehicleResults } from "@/components/vehicles/vehicle-results";
import type { Region } from "@/domain/region";
import { FAMILY_SLUG, getOffer, type Vehicle } from "@/domain/vehicle";
import { attempt } from "@/lib/attempt";
import { regionFromParams } from "@/lib/region";
import { firstParam } from "@/lib/search";
import { listCategories, listVehicles } from "@/services/wegest";

export const metadata: Metadata = {
  title: "Frota Rent a Car",
  description: "Todos os modelos de Rent a Car, com o preço por dia e a partir de quando há uma viatura livre.",
};

type SP = Record<string, string | string[] | undefined>;

/**
 * Frota: o catálogo (GET /modelos). É a única página que o mostra; a reserva começa sempre
 * pela pesquisa com local e datas, e cada cartão abre essa pesquisa com a data já escolhida.
 */
export default async function FleetPage({ params, searchParams }: PageProps<"/[region]/rent-a-car/frota">) {
  const region = await regionFromParams(params);
  return (
    <>
      <PageHeader
        title="Frota Rent a Car"
        description="Preços por dia com IVA incluído. O total aparece ao pesquisar com as suas datas."
        crumbs={[{ href: "/rent-a-car", label: "Rent a Car" }, { label: "Frota" }]}
      />
      <Section><Container>
        <Suspense fallback={<FleetSkeleton />}>
          <Fleet region={region} searchParams={searchParams} />
        </Suspense>
      </Container></Section>
    </>
  );
}

async function Fleet({ region, searchParams }: { region: Region; searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const [res, categories] = await Promise.all([attempt(() => listVehicles(region, "rentacar")), listCategories()]);
  if (!res.ok) return <ErrorState timeout={res.timeout} retryHref="/rent-a-car/frota" />;
  const category = categories.find((c) => c.slug === firstParam(sp.categoria));

  return (
    <>
      <Notice className="mb-6" title="A disponibilidade confirma-se na pesquisa">
        A data em cada modelo é o primeiro dia com uma viatura livre. Ao pesquisar, vê só as viaturas livres no seu período e o preço total.
      </Notice>
      <VehicleResults
        product="rentacar"
        items={res.data.map((v) => ({ vehicle: v, offer: getOffer(v, "rentacar")!, href: searchHref(v), fleet: true }))}
        initialCategory={category?.name}
        initialFamily={category?.family}
      />
    </>
  );
}

/** Pesquisa com a data em que o modelo fica livre (sem data, só com a categoria e o tipo). */
function searchHref(v: Vehicle): string {
  const q = new URLSearchParams();
  if (v.availableFrom) q.set("data", v.availableFrom);
  if (v.category) {
    q.set("categoria", v.category.slug);
    q.set("tipo", FAMILY_SLUG[v.category.family]);
  }
  return `/rent-a-car/viaturas?${q.toString()}`;
}

function FleetSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-96" />)}
    </div>
  );
}
