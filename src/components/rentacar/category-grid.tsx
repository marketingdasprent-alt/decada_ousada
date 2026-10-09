import Link from "next/link";

import { formatMoney } from "@/domain/pricing";
import { getOffer, type Vehicle, type VehicleCategory, type VehicleFamily } from "@/domain/vehicle";
import { cn } from "@/lib/cn";
import { fillSpans } from "@/lib/grid";

import { VehicleImage } from "../vehicles/vehicle-image";

export interface CategoryEntry {
  id: string;
  name: string;
  slug: string;
  family: VehicleFamily;
  /** Menor preço por dia da categoria, como vem da API. */
  from: number;
  count: number;
  /** Viatura que representa a categoria: a primeira com fotografia, senão a primeira. */
  cover: Vehicle;
}

/** Categorias com frota Rent a Car na região, pela ordem do WeGest (as vazias ficam de fora). */
export function rentACarCategories(categories: VehicleCategory[], vehicles: Vehicle[]): CategoryEntry[] {
  return categories.flatMap((cat) => {
    const inCat = vehicles.filter((v) => v.category?.id === cat.id && getOffer(v, "rentacar"));
    if (!inCat.length) return [];
    return [{
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      family: cat.family,
      from: Math.min(...inCat.map((v) => getOffer(v, "rentacar")!.pricing.amount)),
      count: inCat.length,
      cover: inCat.find((v) => v.images[0]?.url) ?? inCat[0],
    }];
  });
}

// Classes literais (o Tailwind só gera as que encontra escritas no código), por colunas
// ocupadas. Num cartão horizontal, a foto fica com a parte da largura que lhe dá a altura
// da linha (2/3 de um cartão de duas colunas; uma coluna num cartão sozinho na linha).
const LG_ITEM = ["", "lg:col-span-1", "lg:col-span-2", "lg:col-span-3", "lg:col-span-4"];
const LG_CARD = ["", "", "lg:grid lg:grid-cols-3", "lg:grid lg:grid-cols-3", "lg:grid lg:grid-cols-4"];
const LG_IMAGE = ["", "", "lg:col-span-2 lg:size-full", "lg:col-span-1 lg:size-full", "lg:col-span-1 lg:size-full"];
const LG_TEXT = ["", "", "lg:col-span-1", "lg:col-span-2", "lg:col-span-3"];
const STACKED_SM = "sm:flex-col sm:items-start sm:justify-center";
const STACKED_LG = "lg:flex-col lg:items-start lg:justify-center";

/**
 * Cartões de categoria Rent a Car: foto, nome, quantos modelos e o preço "desde" por dia.
 * O cartão inteiro abre as viaturas da categoria. `dense` põe quatro por linha no desktop
 * (página inicial); por omissão, três (página Rent a Car). Nenhuma linha fica com espaço
 * vazio: os cartões que ocupam mais de uma coluna passam a horizontais (foto à esquerda,
 * inteira, nunca cortada; texto empilhado à direita).
 */
export function CategoryGrid({ entries, dense, className }: { entries: CategoryEntry[]; dense?: boolean; className?: string }) {
  const lgSpans = fillSpans(entries.length, dense ? 4 : 3);
  const smSpans = fillSpans(entries.length, 2);
  return (
    <ul className={cn("grid gap-6 sm:grid-cols-2", dense ? "lg:grid-cols-4" : "lg:grid-cols-3", className)}>
      {entries.map((c, i) => {
        const sm = smSpans[i] > 1;
        const lg = lgSpans[i];
        const lgWide = lg > 1;
        return (
          <li key={c.id} className={cn(sm && "sm:col-span-2", LG_ITEM[lg])}>
            <article
              className={cn(
                "group relative flex h-full flex-col overflow-hidden rounded-panel border border-line bg-panel transition-colors hover:border-copy has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                sm && "sm:grid sm:grid-cols-3",
                lgWide ? LG_CARD[lg] : sm && "lg:flex",
              )}
            >
              <VehicleImage
                image={c.cover.images[0]}
                className={cn("aspect-vehicle", sm && "sm:col-span-2 sm:size-full", lgWide ? LG_IMAGE[lg] : sm && "lg:h-auto")}
                sizes={dense ? "(min-width: 1024px) 23vw, (min-width: 640px) 50vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"}
              />
              <div
                className={cn(
                  "flex flex-1 items-end justify-between gap-4 p-5",
                  sm && STACKED_SM,
                  lgWide ? cn(LG_TEXT[lg], STACKED_LG) : sm && "lg:flex-row lg:items-end lg:justify-between",
                )}
              >
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
                <p className={cn("shrink-0 text-right text-body-small text-copy-secondary", sm && "sm:text-left", lgWide ? "lg:text-left" : sm && "lg:text-right")}>
                  desde
                  <span className="display block text-h3 text-copy tabular">{formatMoney(c.from)}</span>
                  por dia
                </p>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
