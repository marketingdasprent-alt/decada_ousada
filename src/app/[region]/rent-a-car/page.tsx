import { Clock, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { RentACarSearchForm } from "@/components/rentacar/search-form";
import { PageHeader } from "@/components/shared/page-header";
import { Container, Section, SectionHeading } from "@/components/shared/ui";
import { FAMILY_LABEL, getOffer, type VehicleFamily } from "@/domain/vehicle";
import { formatMoney } from "@/domain/pricing";
import { regionFromParams } from "@/lib/region";
import { listCategories, listLocations, listVehicles } from "@/services/wegest";

export const metadata: Metadata = {
  title: "Rent a Car",
  description: "Pesquise viaturas disponíveis para as suas datas, escolha extras e reserve online.",
};

export default async function RentACarPage({ params }: PageProps<"/[region]/rent-a-car">) {
  const region = await regionFromParams(params);
  const [locations, categories, vehicles] = await Promise.all([listLocations(region, "rentacar"), listCategories(), listVehicles(region, "rentacar")]);

  // Categorias com frota real nesta região, agrupadas por família (doc §11)
  const byFamily = new Map<VehicleFamily, Array<{ id: string; name: string; slug: string; from: number; count: number }>>();
  for (const cat of categories) {
    const inCat = vehicles.filter((v) => v.category?.id === cat.id);
    if (!inCat.length) continue;
    const from = Math.min(...inCat.map((v) => getOffer(v, "rentacar")!.pricing.amount));
    const list = byFamily.get(cat.family) ?? [];
    list.push({ id: cat.id, name: cat.name, slug: cat.slug, from, count: inCat.length });
    byFamily.set(cat.family, list);
  }

  return (
    <>
      <PageHeader title="Rent a Car" description="Escolha o local e as datas. Mostramos apenas viaturas disponíveis, com o preço total do período." crumbs={[{ label: "Rent a Car" }]} />
      <Container className="-mt-6 relative">
        <RentACarSearchForm locations={locations} />
      </Container>

      <Section><Container>
        <SectionHeading title="Categorias" description="Preços por dia com IVA incluído." />
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          {[...byFamily.entries()].map(([family, cats]) => (
            <div key={family}>
              <h3 className="mb-4 text-body-large font-bold">{FAMILY_LABEL[family]}</h3>
              <ul className="divide-y divide-line overflow-hidden rounded-panel border border-line bg-panel">
                {cats.map((c) => (
                  <li key={c.id}>
                    <Link href="/rent-a-car/viaturas" className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-panel-alt">
                      <span>
                        <span className="font-semibold">{c.name}</span>
                        <span className="ml-2 text-body-small text-copy-muted">{c.count} {c.count === 1 ? "modelo" : "modelos"}</span>
                      </span>
                      <span className="text-body-small text-copy-secondary">desde <span className="font-bold text-copy tabular">{formatMoney(c.from)}</span>/dia</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
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
