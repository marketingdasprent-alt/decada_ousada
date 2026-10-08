import { BadgeCheck, CalendarCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { RegionSwitch } from "@/components/layout/region-switch";
import { Hero } from "@/components/shared/hero";
import { HeroSearch } from "@/components/shared/hero-search";
import { ButtonLink, Container, Section, SectionHeading } from "@/components/shared/ui";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { formatMoney } from "@/domain/pricing";
import { getOffer } from "@/domain/vehicle";
import type { Region } from "@/domain/region";
import { regionFromParams, regionSwitchHref } from "@/lib/region";
import { REGION_IMAGERY } from "@/lib/region-imagery";
import { getStartingPrice, listLocations, listVehicles } from "@/services/wegest";

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
  const [locations, tvdeLocations, tvdeFrom, racFrom, vehicles] = await Promise.all([
    listLocations(region, "rentacar"),
    listLocations(region, "tvde"),
    getStartingPrice(region, "tvde"),
    getStartingPrice(region, "rentacar"),
    listVehicles(region),
  ]);
  const featured = vehicles.filter((v) => getOffer(v, "rentacar")).slice(0, 3);
  const featuredTvde = vehicles.filter((v) => getOffer(v, "tvde")).slice(0, 3);
  const regionHrefs: Record<Region, string> = { mainland: regionSwitchHref("mainland"), azores: regionSwitchHref("azores") };

  return (
    <>
      {/* Hero: foto da região, a pesquisa com um separador por serviço (doc §7: os dois com o mesmo peso) */}
      <Hero
        region={region}
        images={[REGION_IMAGERY[region].home, REGION_IMAGERY[region].rentacar, REGION_IMAGERY[region].tvde]}
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

      {/* Frota em destaque */}
      {featured.length > 0 && (
        <Section><Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading title="Frota em destaque" description="Preços por dia com IVA incluído. O total do seu período aparece ao pesquisar datas." />
            <ButtonLink href="/rent-a-car/viaturas" variant="outline">Ver toda a frota</ButtonLink>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((v) => (
              <VehicleCard key={v.id} vehicle={v} offer={getOffer(v, "rentacar")!} href={`/rent-a-car/viatura/${v.slug}`} />
            ))}
          </div>
        </Container></Section>
      )}

      {/* Porquê */}
      <Section><Container>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: CalendarCheck, title: "Reserva online", text: "Pesquise, escolha extras e reserve em poucos minutos." },
            { icon: ShieldCheck, title: "Proteção à escolha", text: "Escolha a cobertura de seguro e veja a franquia correspondente." },
            { icon: BadgeCheck, title: "Sem surpresas", text: "Preço final com IVA, extras e taxas antes de pagar." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-panel bg-panel p-6">
              <Icon className="size-7 text-brand" aria-hidden />
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1 text-body text-copy-secondary">{text}</p>
            </div>
          ))}
        </div>
      </Container></Section>

      {/* TVDE: faixa escura, a identidade do produto profissional */}
      {featuredTvde.length > 0 && (
        <Section variant="spacious" className="bg-panel-dark text-on-dark">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="display text-h2">Trabalhe já esta semana.</h2>
                <p className="mt-3 text-on-dark/75">Escolha a viatura, submeta a candidatura com os documentos e reserve com o sinal.</p>
              </div>
              <ButtonLink href="/tvde/viaturas" variant="light" size="lg">
                Ver viaturas TVDE
              </ButtonLink>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredTvde.map((v) => (
                <VehicleCard key={v.id} vehicle={v} offer={getOffer(v, "tvde")!} href={`/tvde/viatura/${v.slug}`} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Localizações (SEO regional, doc §109) */}
      <Section><Container>
        <SectionHeading title={region === "azores" ? "Pontos de levantamento nos Açores" : "Pontos de levantamento"} />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {locations.map((l) => (
            <li key={l.id}>
              <Link href={`/rent-a-car/${l.slug}`} className="block h-full rounded-panel border border-line bg-panel p-5 transition-colors hover:border-brand">
                <p className="font-bold">{l.name}</p>
                {l.address && <p className="mt-1 text-body-small text-copy-secondary">{l.address}</p>}
                {l.openingHours && <p className="mt-3 text-caption text-copy-muted">{l.openingHours}</p>}
              </Link>
            </li>
          ))}
        </ul>
      </Container></Section>
    </>
  );
}
