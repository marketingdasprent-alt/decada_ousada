import type { Metadata } from "next";

import { CategoryGrid, rentACarCategories, type CategoryEntry } from "@/components/rentacar/category-grid";
import { Hero } from "@/components/shared/hero";
import { HeroSearch } from "@/components/shared/hero-search";
import { PickupPoints } from "@/components/shared/pickup-points";
import { ButtonLink, Container, Section, SectionHeading } from "@/components/shared/ui";
import { FAMILY_LABEL, type VehicleFamily } from "@/domain/vehicle";
import { regionFromParams } from "@/lib/region";
import { REGION_IMAGERY } from "@/lib/region-imagery";
import { listCategories, listLocations, listVehicles } from "@/services/wegest";

export const metadata: Metadata = {
  title: "Rent a Car",
  description: "Escolha a categoria e veja as viaturas disponíveis, com preço por dia e total do período ao escolher as datas.",
};

/**
 * Entrada do Rent a Car: as categorias são a porta de entrada (sem passo intermédio
 * de filtros). Cada categoria abre as viaturas dela; a pesquisa com datas fica na hero.
 */
export default async function RentACarPage({ params }: PageProps<"/[region]/rent-a-car">) {
  const region = await regionFromParams(params);
  const [locations, categories, vehicles] = await Promise.all([listLocations(region, "rentacar"), listCategories(), listVehicles(region, "rentacar")]);

  // Categorias com frota real nesta região, agrupadas por família (doc §11)
  const byFamily = new Map<VehicleFamily, CategoryEntry[]>();
  for (const entry of rentACarCategories(categories, vehicles)) {
    byFamily.set(entry.family, [...(byFamily.get(entry.family) ?? []), entry]);
  }

  return (
    <>
      <Hero
        region={region}
        size="medium"
        images={[REGION_IMAGERY[region].rentacar]}
        title="Rent a Car"
        description="Aluguer ao dia para férias, viagens e empresas. Escolha a categoria abaixo ou pesquise já com as suas datas."
        crumbs={[{ label: "Rent a Car" }]}
        side={<HeroSearch racLocations={locations} tvdeLocations={[]} only="rentacar" />}
      />

      {[...byFamily.entries()].map(([family, cats]) => (
        <Section key={family} variant="compact"><Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading title={`Viaturas ${FAMILY_LABEL[family].toLowerCase()}`} description="Preços por dia com IVA incluído. O total aparece ao escolher as datas." />
          </div>
          <CategoryGrid entries={cats} className="mt-6" />
        </Container></Section>
      ))}

      <Section variant="compact"><Container>
        <ButtonLink href="/rent-a-car/viaturas" variant="outline">Ver toda a frota</ButtonLink>
      </Container></Section>

      <PickupPoints title="Os nossos balcões" locations={locations} />
    </>
  );
}
