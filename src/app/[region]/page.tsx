import { BadgeCheck, CalendarCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { RentACarSearchForm } from "@/components/rentacar/search-form";
import { buttonClass, ButtonLink, Container, Section, SectionHeading } from "@/components/shared/ui";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { formatMoney } from "@/domain/pricing";
import { getOffer } from "@/domain/vehicle";
import { regionFromParams } from "@/lib/region";
import { getStartingPrice, listLocations, listVehicles } from "@/services/wegest";

export default async function HomePage({ params }: PageProps<"/[region]">) {
  const region = await regionFromParams(params);
  const [locations, tvdeFrom, racFrom, vehicles] = await Promise.all([
    listLocations(region, "rentacar"),
    getStartingPrice(region, "tvde"),
    getStartingPrice(region, "rentacar"),
    listVehicles(region),
  ]);
  const featured = vehicles.filter((v) => getOffer(v, "rentacar")).slice(0, 3);
  const featuredTvde = vehicles.filter((v) => getOffer(v, "tvde")).slice(0, 3);

  return (
    <>
      {/* Hero: os dois serviços com o mesmo peso (doc §7). Fundo claro; o escuro é do TVDE. */}
      <Section className="border-b border-line bg-panel">
        <Container>
          <h1 className="display max-w-3xl text-display">Encontre a viatura certa para si.</h1>
          <p className="mt-5 max-w-xl text-body-large text-copy-secondary">
            Aluguer ao dia para turismo e empresas, ou viaturas à semana preparadas para motoristas TVDE.
          </p>

          {/* Mobile: a pesquisa sobe para logo a seguir ao título; a ordem no DOM (e no Tab) é a do desktop */}
          <div className="mt-8 flex flex-col gap-10 md:mt-10">
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/rent-a-car" className="flex flex-col rounded-panel border border-line bg-panel-alt p-6 transition-colors hover:border-copy sm:p-8">
              <h2 className="display text-h2">Rent a Car</h2>
              <p className="mt-3 max-w-sm text-copy-secondary">Aluguer de viaturas para turismo, empresas e utilização profissional.</p>
              {racFrom !== null && (
                <p className="mt-6 text-body-small text-copy-secondary">
                  Desde <span className="display text-h3 text-copy tabular">{formatMoney(racFrom)}</span> por dia
                </p>
              )}
              <span className={buttonClass("primary", "md", "mt-6 self-start")}>Pesquisar viaturas</span>
            </Link>
            <Link href="/tvde" className="flex flex-col rounded-panel bg-panel-dark p-6 text-on-dark transition-shadow hover:ring-2 hover:ring-brand sm:p-8">
              <h2 className="display text-h2">TVDE</h2>
              <p className="mt-3 max-w-sm text-on-dark/75">Viaturas preparadas para motoristas profissionais, com preço semanal, caução e condições visíveis antes de se candidatar.</p>
              {tvdeFrom !== null && (
                <p className="mt-6 text-body-small text-on-dark/75">
                  Desde <span className="display text-h3 text-on-dark tabular">{formatMoney(tvdeFrom)}</span> por semana
                </p>
              )}
              <span className={buttonClass("light", "md", "mt-6 self-start")}>Ver viaturas TVDE</span>
            </Link>
          </div>

          {/* Pesquisa Rent a Car */}
          <div className="max-md:order-first">
            <h2 className="mb-4 text-h4 font-bold">Pesquisar disponibilidade</h2>
            <RentACarSearchForm locations={locations} />
          </div>
          </div>
        </Container>
      </Section>

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
