import type { Metadata } from "next";
import { Suspense } from "react";

import { Hero } from "@/components/shared/hero";
import { HeroSearch } from "@/components/shared/hero-search";
import { PageSkeleton } from "@/components/shared/page-header";
import { PickupPoints } from "@/components/shared/pickup-points";
import { ButtonLink, Container, Section } from "@/components/shared/ui";
import { regionFromParams } from "@/lib/region";
import { REGION_IMAGERY } from "@/lib/region-imagery";
import { listLocations } from "@/services/wegest";

export const metadata: Metadata = {
  title: "Rent a Car",
  description: "Escolha o local e as datas de levantamento e devolução e veja só as viaturas livres, com o preço total do período.",
};

/**
 * Entrada do Rent a Car: a pesquisa (local, datas e horas) é o primeiro passo, como nas
 * rent-a-car de referência. O catálogo de modelos fica na página Frota.
 */
// Suspense: se o WeGest falhar no build, o conteúdo é gerado no pedido (ver catalog() em services/wegest)
export default function RentACarPage({ params }: PageProps<"/[region]/rent-a-car">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <RentACarContent params={params} />
    </Suspense>
  );
}

async function RentACarContent({ params }: { params: PageProps<"/[region]/rent-a-car">["params"] }) {
  const region = await regionFromParams(params);
  const locations = await listLocations(region, "rentacar");

  return (
    <>
      <Hero
        region={region}
        size="medium"
        images={[REGION_IMAGERY[region].rentacar]}
        title="Rent a Car"
        description="Aluguer ao dia para férias, viagens e empresas. Indique o local e as datas para ver as viaturas livres e o preço total."
        crumbs={[{ label: "Rent a Car" }]}
        side={<HeroSearch racLocations={locations} tvdeLocations={[]} only="rentacar" />}
      />

      <Section variant="compact"><Container className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-body text-copy-secondary">Quer ver primeiro os modelos e o preço por dia? A frota mostra também a partir de quando há uma viatura livre.</p>
        <ButtonLink href="/rent-a-car/frota" variant="outline">Ver a frota</ButtonLink>
      </Container></Section>

      <PickupPoints title="Os nossos balcões" locations={locations} />
    </>
  );
}
