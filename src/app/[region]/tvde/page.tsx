import type { Metadata } from "next";

import { GridFiller } from "@/components/shared/grid-filler";
import { Hero } from "@/components/shared/hero";
import { HeroSearch } from "@/components/shared/hero-search";
import { ButtonLink, Container, Section, SectionHeading } from "@/components/shared/ui";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { formatMoney } from "@/domain/pricing";
import { getOffer } from "@/domain/vehicle";
import { regionFromParams } from "@/lib/region";
import { REGION_IMAGERY } from "@/lib/region-imagery";
import { getStartingPrice, listLocations, listVehicles } from "@/services/wegest";

export const metadata: Metadata = {
  title: "Viaturas TVDE para motoristas",
  description: "Alugue uma viatura TVDE à semana. Veja preço, caução e condições e candidate-se online.",
};

/** Sequência real do processo (doc §49): a numeração tem função. */
const STEPS = [
  { title: "Escolha a viatura", text: "Preço semanal, caução, limite de km e condições." },
  { title: "Faça o cadastro", text: "A ficha de motorista, em poucos minutos." },
  { title: "Envie os documentos", text: "Identificação, carta, certificado TVDE e morada." },
  { title: "Pague o sinal", text: "Reserva a viatura enquanto analisamos a candidatura." },
  { title: "Levante após aprovação", text: "Assina o contrato e começa a conduzir." },
];

export default async function TvdePage({ params }: PageProps<"/[region]/tvde">) {
  const region = await regionFromParams(params);
  const [vehicles, from, locations] = await Promise.all([listVehicles(region, "tvde"), getStartingPrice(region, "tvde"), listLocations(region, "tvde")]);

  return (
    <>
      {/* Topo TVDE: foto da região e a pesquisa por local e data de início */}
      <Hero
        region={region}
        size="medium"
        images={[REGION_IMAGERY[region].tvde]}
        title="TVDE: comece a conduzir esta semana"
        description="Viaturas preparadas para motoristas profissionais, à semana. Preço, caução, limite de quilómetros e condições de cada viatura antes de se candidatar."
        crumbs={[{ label: "TVDE" }]}
        side={<HeroSearch racLocations={[]} tvdeLocations={locations} only="tvde" />}
      >
        {from !== null && (
          <p className="mt-6 text-on-dark/85">
            Desde <span className="display text-h3 text-on-dark tabular">{formatMoney(from)}</span> por semana
          </p>
        )}
      </Hero>

      {/* O processo: a numeração tem função (doc §49) */}
      <Section className="bg-panel-dark text-on-dark">
        <Container>
          <h2 className="display text-h2">Como funciona</h2>
          <ol className="mt-8 grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map(({ title, text }, i) => (
              <li key={title} className="border-t border-on-dark/20 pt-4">
                <span className="display text-h3 text-on-dark" aria-hidden>{i + 1}</span>
                <p className="mt-1 font-semibold">{title}</p>
                <p className="mt-0.5 text-body-small text-on-dark/75">{text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-body-small text-on-dark/75">O pagamento do sinal não significa aprovação automática. Se a candidatura não for aprovada, o valor é devolvido.</p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading title="Viaturas em destaque" />
            <ButtonLink href="/tvde/viaturas" variant="outline">Ver todas</ButtonLink>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.slice(0, 6).map((v) => (
              <VehicleCard key={v.id} vehicle={v} offer={getOffer(v, "tvde")!} href={`/tvde/viatura/${v.slug}`} />
            ))}
            <GridFiller count={Math.min(vehicles.length, 6)} lg={3}>
              <p className="font-bold">Dúvidas sobre a candidatura?</p>
              <p className="text-body-small text-copy-secondary">Veja as respostas sobre o sinal e a aprovação da candidatura.</p>
              <ButtonLink href="/perguntas-frequentes" variant="outline" size="sm">Perguntas frequentes</ButtonLink>
            </GridFiller>
          </div>
        </Container>
      </Section>
    </>
  );
}
