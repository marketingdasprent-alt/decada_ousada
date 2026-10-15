import type { Metadata } from "next";

import { GridFiller } from "@/components/shared/grid-filler";
import { Hero } from "@/components/shared/hero";
import { HeroSearch } from "@/components/shared/hero-search";
import { ButtonLink, Container, Section, SectionHeading } from "@/components/shared/ui";
import { TvdeProcess } from "@/components/tvde/tvde-process";
import { TvdeRequirements } from "@/components/tvde/tvde-requirements";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { formatMoney } from "@/domain/pricing";
import { getOffer } from "@/domain/vehicle";
import { withPickupLocations } from "@/lib/pickup-locations";
import { regionFromParams } from "@/lib/region";
import { REGION_IMAGERY } from "@/lib/region-imagery";
import { getStartingPrice, listLocations, listVehicles } from "@/services/wegest";

export const metadata: Metadata = {
  title: "Viaturas TVDE para motoristas",
  description: "Alugue uma viatura TVDE à semana. Veja preço, caução e condições e candidate-se online.",
};

export default async function TvdePage({ params }: PageProps<"/[region]/tvde">) {
  const region = await regionFromParams(params);
  const [vehicles, from, locations] = await Promise.all([listVehicles(region, "tvde"), getStartingPrice(region, "tvde"), listLocations(region, "tvde")]);

  return (
    <>
      {/* Topo TVDE: foto da região e a pesquisa por local ("Alterar" da listagem volta a #pesquisa) */}
      <Hero
        region={region}
        size="medium"
        images={[REGION_IMAGERY[region].tvde]}
        title="TVDE: comece a conduzir esta semana"
        description="Viaturas preparadas para motoristas profissionais, à semana. Preço, caução, limite de quilómetros e condições de cada viatura antes de se candidatar."
        crumbs={[{ label: "TVDE" }]}
        side={<div id="pesquisa" className="scroll-mt-24"><HeroSearch racLocations={[]} tvdeLocations={locations} only="tvde" /></div>}
      >
        {from !== null && (
          <p className="mt-6 text-on-dark/85">
            Desde <span className="display text-h3 text-on-dark tabular">{formatMoney(from)}</span> por semana
          </p>
        )}
      </Hero>

      <TvdeProcess />

      <TvdeRequirements region={region} />

      <Section>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading title="Viaturas em destaque" />
            <ButtonLink href="/tvde/viaturas" variant="outline">Ver todas</ButtonLink>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {withPickupLocations(vehicles.slice(0, 6), locations).map((v) => (
              <VehicleCard key={v.id} vehicle={v} offer={getOffer(v, "tvde")!} href={`/tvde/viatura/${v.slug}`} />
            ))}
            <GridFiller count={Math.min(vehicles.length, 6)} lg={3}>
              <p className="font-bold">Dúvidas sobre a candidatura?</p>
              <p className="text-body-small text-copy-secondary">Veja as respostas sobre requisitos, sinal, caução e aprovação.</p>
              <ButtonLink href="/perguntas-frequentes" variant="outline" size="sm">Perguntas frequentes</ButtonLink>
            </GridFiller>
          </div>
        </Container>
      </Section>
    </>
  );
}
