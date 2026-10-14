import Link from "next/link";

import { RegionSwitch } from "@/components/layout/region-switch";
import { RacIntro } from "@/components/rentacar/rac-intro";
import { Hero } from "@/components/shared/hero";
import { HeroSearch } from "@/components/shared/hero-search";
import { InstagramFeed } from "@/components/shared/instagram";
import { PriceDisplay } from "@/components/shared/price-display";
import { Testimonials } from "@/components/shared/testimonials";
import { ButtonLink, Container, Section, SectionHeading } from "@/components/shared/ui";
import { TvdeHighlights } from "@/components/tvde/tvde-highlights";
import { TvdeProcess } from "@/components/tvde/tvde-process";
import { formatMoney, TVDE_RESERVATION_FEE } from "@/domain/pricing";
import type { Region } from "@/domain/region";
import { fillSpanClasses } from "@/lib/grid";
import { regionFromParams, regionSwitchHref } from "@/lib/region";
import { REGION_IMAGERY } from "@/lib/region-imagery";
import { getStartingPrice, listLocations } from "@/services/wegest";

/** Título da hero por região: a mesma promessa, dita para quem está em cada região. */
const HOME_COPY: Record<Region, { title: string; description: string }> = {
  mainland: {
    title: "Encontre a viatura certa para si.",
    description: "Rent a Car ao dia e viaturas TVDE à semana em Portugal Continental.",
  },
  azores: {
    title: "Explore os Açores ao volante.",
    description: "Rent a Car ao dia e viaturas TVDE à semana nos Açores.",
  },
};

export default async function HomePage({ params }: PageProps<"/[region]">) {
  const region = await regionFromParams(params);
  const [locations, tvdeLocations, tvdeFrom, racFrom] = await Promise.all([
    listLocations(region, "rentacar"),
    listLocations(region, "tvde"),
    getStartingPrice(region, "tvde"),
    getStartingPrice(region, "rentacar"),
  ]);
  const regionHrefs: Record<Region, string> = { mainland: regionSwitchHref("mainland"), azores: regionSwitchHref("azores") };

  const locationSpans = fillSpanClasses(locations.length, { lg: 4 });
  return (
    <>
      {/* Hero: foto da região, a pesquisa com um separador por serviço (doc §7: os dois com o mesmo peso) */}
      <Hero
        region={region}
        // A foto de Rent a Car fica na secção Rent a Car, logo abaixo (sem a repetir aqui)
        images={[REGION_IMAGERY[region].home, REGION_IMAGERY[region].tvde]}
        title={HOME_COPY[region].title}
        description={HOME_COPY[region].description}
        above={<RegionSwitch current={region} hrefs={regionHrefs} className="w-fit sm:hidden" />}
        side={<HeroSearch racLocations={locations} tvdeLocations={tvdeLocations} />}
      >
        {/* Os dois serviços ditos explicitamente, com a cor de cada um */}
        <ul className="flex flex-wrap gap-3 text-body-small">
          <li className="rounded-button bg-brand px-4 py-2 font-semibold text-on-brand">
            Rent a Car{racFrom !== null && <> desde {formatMoney(racFrom)} por dia</>}
          </li>
          <li className="rounded-button border border-on-dark/40 bg-panel-dark px-4 py-2 font-semibold text-on-dark">
            TVDE{tvdeFrom !== null && <> desde {formatMoney(tvdeFrom)} por semana</>}
          </li>
        </ul>
      </Hero>

      {/* Rent a Car apresentado: para quem é, vantagens, preço desde (a frota fica nas páginas de viaturas) */}
      <RacIntro region={region} from={racFrom} />

      {/* Depoimentos de clientes logo a seguir ao Rent a Car, antes do TVDE (pedido da equipa; DECISIONS.md, 2026-10-12) */}
      <Testimonials service="rentacar" />

      {/* TVDE explicado (sem viaturas): a página inicial não pode falar só de Rent a Car */}
      <TvdeProcess
        title="TVDE: viaturas à semana para motoristas"
        intro={
          <>
            <p>Para motoristas TVDE profissionais: alugue uma viatura à semana, com preço, caução, limite de quilómetros e condições à vista antes de se candidatar.</p>
            {/* Preço semanal e o que se paga para reservar, juntos e fora do parágrafo */}
            {tvdeFrom !== null && (
              <PriceDisplay
                amount={tvdeFrom}
                unit="week"
                prefix="Desde"
                size="lg"
                tone="dark"
                note={`Sinal de ${formatMoney(TVDE_RESERVATION_FEE)} para reservar, descontado na caução`}
                className="mt-6"
              />
            )}
          </>
        }
        actions={
          <>
            <ButtonLink href="/tvde/viaturas" variant="light" size="lg">Ver viaturas TVDE</ButtonLink>
            <ButtonLink href="/tvde" variant="onDark" size="lg">Saber mais</ButtonLink>
          </>
        }
      >
        <TvdeHighlights region={region} />
      </TvdeProcess>

      {/* Instagram: últimas publicações de @decada_ousada (pedido da equipa, DECISIONS.md 2026-10-12) */}
      <InstagramFeed />

      {/* Localizações (SEO regional, doc §109): só os pontos que a API devolve; sem nenhum, a secção não aparece */}
      {locations.length > 0 && <Section><Container>
        <SectionHeading title={region === "azores" ? "Pontos de levantamento nos Açores" : "Pontos de levantamento"} />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {locations.map((l, i) => (
            <li key={l.id} className={locationSpans[i]}>
              <Link href={`/rent-a-car/${l.slug}`} className="block h-full rounded-panel border border-line bg-panel p-5 transition-colors hover:border-brand">
                <p className="font-bold">{l.name}</p>
                {l.address && <p className="mt-1 text-body-small text-copy-secondary">{l.address}</p>}
                {l.openingHours && <p className="mt-3 text-caption text-copy-muted">{l.openingHours}</p>}
              </Link>
            </li>
          ))}
        </ul>
      </Container></Section>}
    </>
  );
}
