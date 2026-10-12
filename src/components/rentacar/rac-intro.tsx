import { BadgeCheck, CalendarCheck, ShieldCheck } from "lucide-react";

import { formatMoney } from "@/domain/pricing";
import type { Region } from "@/domain/region";
import { REGION_IMAGERY } from "@/lib/region-imagery";

import { HeroBackground } from "../shared/hero-background";
import { ButtonLink, Container, Section } from "../shared/ui";

const BENEFITS = [
  { icon: CalendarCheck, title: "Reserva online", text: "Pesquise, escolha extras e reserve em poucos minutos." },
  { icon: ShieldCheck, title: "Proteção à escolha", text: "Escolha a cobertura de seguro e veja a franquia correspondente." },
  { icon: BadgeCheck, title: "Sem surpresas", text: "Preço final com IVA, extras e taxas antes de pagar." },
];

/**
 * Apresentação do Rent a Car na página inicial: para quem é, as vantagens e o preço
 * "desde", com uma foto da região. A página inicial apresenta os serviços; a frota e as
 * categorias ficam nas páginas de viaturas (feedback da equipa, 2026-10-09).
 */
export function RacIntro({ region, from }: { region: Region; from: number | null }) {
  return (
    <Section>
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="display text-h2">Rent a Car: alugue ao dia</h2>
          <p className="mt-3 max-w-xl text-body-large text-copy-secondary">
            Para férias, viagens e empresas, {region === "azores" ? "nas ilhas dos Açores" : "em Portugal Continental"}. Escolha a categoria, veja o total do período e reserve online.
            {from !== null && <> Desde <span className="font-semibold text-copy tabular">{formatMoney(from)}</span> por dia.</>}
          </p>
          <ul className="mt-8 space-y-5">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-card bg-brand-surface text-brand" aria-hidden>
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-body-small text-copy-secondary">{text}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/rent-a-car" size="lg">Ver categorias</ButtonLink>
            <ButtonLink href="/rent-a-car/viaturas" variant="outline" size="lg">Ver toda a frota</ButtonLink>
          </div>
        </div>
        <div className="relative isolate aspect-vehicle overflow-hidden rounded-feature bg-panel-dark">
          <HeroBackground images={[REGION_IMAGERY[region].rentacar]} />
        </div>
      </Container>
    </Section>
  );
}
