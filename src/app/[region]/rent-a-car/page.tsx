import { Clock, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Hero } from "@/components/shared/hero";
import { HeroSearch } from "@/components/shared/hero-search";
import { ButtonLink, Container, Section, SectionHeading } from "@/components/shared/ui";
import { VehicleImage } from "@/components/vehicles/vehicle-image";
import { formatMoney } from "@/domain/pricing";
import { FAMILY_LABEL, getOffer, type Vehicle, type VehicleFamily } from "@/domain/vehicle";
import { regionFromParams } from "@/lib/region";
import { REGION_IMAGERY } from "@/lib/region-imagery";
import { listCategories, listLocations, listVehicles } from "@/services/wegest";

export const metadata: Metadata = {
  title: "Rent a Car",
  description: "Escolha a categoria e veja as viaturas disponíveis, com preço por dia e total do período ao escolher as datas.",
};

interface CategoryEntry {
  id: string;
  name: string;
  slug: string;
  from: number;
  count: number;
  /** Viatura que representa a categoria: a primeira com fotografia, senão a primeira. */
  cover: Vehicle;
}

/**
 * Entrada do Rent a Car: as categorias são a porta de entrada (sem passo intermédio
 * de filtros). Cada categoria abre as viaturas dela; a pesquisa com datas fica na hero.
 */
export default async function RentACarPage({ params }: PageProps<"/[region]/rent-a-car">) {
  const region = await regionFromParams(params);
  const [locations, categories, vehicles] = await Promise.all([listLocations(region, "rentacar"), listCategories(), listVehicles(region, "rentacar")]);

  // Categorias com frota real nesta região, agrupadas por família (doc §11)
  const byFamily = new Map<VehicleFamily, CategoryEntry[]>();
  for (const cat of categories) {
    const inCat = vehicles.filter((v) => v.category?.id === cat.id);
    if (!inCat.length) continue;
    const from = Math.min(...inCat.map((v) => getOffer(v, "rentacar")!.pricing.amount));
    const cover = inCat.find((v) => v.images[0]?.url) ?? inCat[0];
    const list = byFamily.get(cat.family) ?? [];
    list.push({ id: cat.id, name: cat.name, slug: cat.slug, from, count: inCat.length, cover });
    byFamily.set(cat.family, list);
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
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cats.map((c) => (
              <li key={c.id}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-panel border border-line bg-panel transition-colors hover:border-copy has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus">
                  <VehicleImage image={c.cover.images[0]} className="aspect-vehicle" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" />
                  <div className="flex flex-1 items-end justify-between gap-4 p-5">
                    <div>
                      <h3 className="text-h4 font-bold">
                        <Link href={`/rent-a-car/viaturas?categoria=${c.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                          {c.name}
                        </Link>
                      </h3>
                      <p className="mt-1 text-body-small text-copy-muted">
                        {c.count} {c.count === 1 ? "modelo" : "modelos"}, ex.: {c.cover.name}
                      </p>
                    </div>
                    <p className="shrink-0 text-right text-body-small text-copy-secondary">
                      desde
                      <span className="display block text-h3 text-copy tabular">{formatMoney(c.from)}</span>
                      por dia
                    </p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </Container></Section>
      ))}

      <Section variant="compact"><Container>
        <ButtonLink href="/rent-a-car/viaturas" variant="outline">Ver toda a frota</ButtonLink>
      </Container></Section>

      <Section><Container>
        <SectionHeading title="Os nossos balcões" />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {locations.map((l) => (
            <li key={l.id}>
              <Link href={`/rent-a-car/${l.slug}`} className="block h-full rounded-panel border border-line bg-panel p-5 transition-colors hover:border-brand">
                <p className="font-bold">Rent a Car {l.name}</p>
                {l.address && <p className="mt-2 flex gap-2 text-body-small text-copy-secondary"><MapPin className="mt-0.5 size-4 shrink-0 text-copy-muted" aria-hidden />{l.address}</p>}
                {l.openingHours && <p className="mt-2 flex gap-2 text-body-small text-copy-secondary"><Clock className="mt-0.5 size-4 shrink-0 text-copy-muted" aria-hidden />{l.openingHours}</p>}
                {!l.returnAvailable && <p className="mt-2 text-caption text-caution">Apenas levantamento</p>}
              </Link>
            </li>
          ))}
        </ul>
      </Container></Section>
    </>
  );
}
