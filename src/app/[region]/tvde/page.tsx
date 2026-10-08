import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ButtonLink, Container, Section, SectionHeading } from "@/components/shared/ui";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { formatMoney } from "@/domain/pricing";
import { getOffer } from "@/domain/vehicle";
import { regionFromParams } from "@/lib/region";
import { getStartingPrice, listVehicles } from "@/services/wegest";

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
  const [vehicles, from] = await Promise.all([listVehicles(region, "tvde"), getStartingPrice(region, "tvde")]);

  return (
    <>
      {/* Topo TVDE: o processo é o protagonista; linhas do logótipo inteiras */}
      <PageHeader
        tone="dark"
        lines
        title="Comece a conduzir esta semana"
        description="Viaturas preparadas para motoristas profissionais, à semana. Preço, caução, limite de quilómetros e condições de cada viatura antes de se candidatar."
        crumbs={[{ label: "TVDE" }]}
      >
        <div className="flex flex-wrap items-center gap-6">
          <ButtonLink href="/tvde/viaturas" size="lg">Ver viaturas disponíveis</ButtonLink>
          {from !== null && (
            <p className="text-on-dark/75">
              Desde <span className="display text-h3 text-on-dark tabular">{formatMoney(from)}</span> por semana
            </p>
          )}
        </div>
        <ol className="mt-12 grid gap-x-6 gap-y-5 border-t border-on-dark/20 pt-6 sm:grid-cols-2 lg:grid-cols-5" aria-label="Como funciona">
          {STEPS.map(({ title, text }, i) => (
            <li key={title}>
              <span className="display text-h3 text-on-dark" aria-hidden>{i + 1}</span>
              <p className="mt-1 font-semibold">{title}</p>
              <p className="mt-0.5 text-body-small text-on-dark/75">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-body-small text-on-dark/75">O pagamento do sinal não significa aprovação automática. Se a candidatura não for aprovada, o valor é devolvido.</p>
      </PageHeader>

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
          </div>
        </Container>
      </Section>
    </>
  );
}
