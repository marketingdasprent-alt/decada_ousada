"use client";

import { useId, useRef } from "react";

import type { Location } from "@/domain/location";
import { cn } from "@/lib/cn";

import { RentACarSearchForm } from "../rentacar/search-form";
import { TvdeSearchForm } from "../tvde/tvde-search-form";
import { useServiceSelection, type Product } from "./service-selection";

export type { Product };

/**
 * O que distingue os dois serviços, dito no próprio formulário. Cada um tem a sua cor:
 * Rent a Car a cor da marca (vermelho ou verde, conforme a região), TVDE o asfalto,
 * a identidade do produto profissional.
 */
export const SERVICE: Record<Product, { label: string; unit: string; who: string; how: string; cta: string }> = {
  rentacar: {
    label: "Rent a Car",
    unit: "ao dia",
    who: "Para férias, viagens e empresas.",
    how: "Preço por dia e reserva online, com o total do período antes de pagar.",
    cta: "Ver viaturas Rent a Car",
  },
  tvde: {
    label: "TVDE",
    unit: "à semana",
    who: "Para motoristas TVDE profissionais.",
    how: "Preço por semana e candidatura online, com análise antes do levantamento.",
    cta: "Ver viaturas TVDE",
  },
};

const ACCENT: Record<Product, { on: string; bar: string }> = {
  rentacar: { on: "bg-brand text-on-brand", bar: "bg-brand" },
  tvde: { on: "bg-panel-dark text-on-dark", bar: "bg-panel-dark" },
};

function ServiceIntro({ product }: { product: Product }) {
  return (
    <p className="text-body-small text-copy-secondary">
      <span className="font-semibold text-copy">{SERVICE[product].who}</span> {SERVICE[product].how}
    </p>
  );
}

/** Os passos do TVDE, no espaço que o painel TVDE tem a mais (é mais curto que o Rent a Car). */
const TVDE_STEPS = [
  "Escolha a viatura e a data de início.",
  "Submeta a candidatura com os documentos.",
  "Reserve com o sinal. A equipa analisa a candidatura antes do levantamento.",
];

function TvdeSteps({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col justify-center rounded-card bg-panel-alt p-4", className)}>
      <p className="text-body-small font-semibold">Como funciona</p>
      <ol className="mt-3 space-y-3">
        {TVDE_STEPS.map((step, i) => (
          <li key={step} className="flex gap-3 text-body-small text-copy-secondary">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-pill bg-panel-dark text-caption font-bold text-on-dark" aria-hidden>
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <p className="mt-4 border-t border-line pt-3 text-caption text-copy-muted">O sinal reserva a viatura. A aprovação depende da análise da candidatura.</p>
    </div>
  );
}

function ProductForm({ product, racLocations, tvdeLocations }: { product: Product; racLocations: Location[]; tvdeLocations: Location[] }) {
  return product === "rentacar" ? (
    <RentACarSearchForm locations={racLocations} variant="stack" submitLabel={SERVICE.rentacar.cta} />
  ) : (
    <TvdeSearchForm locations={tvdeLocations} layout="stack" />
  );
}

/**
 * Cartão de pesquisa da hero, à direita. Na página inicial, dois separadores grandes
 * (Rent a Car / TVDE) com a cor de cada serviço; nas páginas de produto, só o serviço
 * da página (`only`). Separadores com o padrão ARIA (setas, Home, End). Os dois painéis
 * ocupam a mesma célula da grelha, e o escondido fica invisível (fora do foco e do leitor
 * de ecrã) em vez de sair do fluxo: o cartão tem sempre a altura do painel maior e não
 * salta ao trocar de serviço.
 */
export function HeroSearch({ racLocations, tvdeLocations, only }: { racLocations: Location[]; tvdeLocations: Location[]; only?: Product }) {
  const [active, setActive] = useServiceSelection(only ?? "rentacar");
  const id = useId();
  const tabRefs = useRef<Record<Product, HTMLButtonElement | null>>({ rentacar: null, tvde: null });
  const products: Product[] = ["rentacar", "tvde"];

  if (only) {
    return (
      <div className="overflow-hidden rounded-panel bg-panel text-copy shadow-overlay">
        <div className={cn("flex items-baseline justify-between gap-3 px-5 py-4", ACCENT[only].on)}>
          <h2 className="display text-h3">{SERVICE[only].label}</h2>
          <span className="text-body-small font-semibold">{SERVICE[only].unit}</span>
        </div>
        <div className="space-y-4 p-5">
          <ServiceIntro product={only} />
          <ProductForm product={only} racLocations={racLocations} tvdeLocations={tvdeLocations} />
        </div>
      </div>
    );
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const i = products.indexOf(active);
    const next =
      e.key === "ArrowRight" ? products[(i + 1) % products.length]
      : e.key === "ArrowLeft" ? products[(i - 1 + products.length) % products.length]
      : e.key === "Home" ? products[0]
      : e.key === "End" ? products[products.length - 1]
      : null;
    if (!next) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="overflow-hidden rounded-panel bg-panel text-copy shadow-overlay">
      <div className="px-5 pt-5">
        <h2 className="font-bold">Pesquisar disponibilidade</h2>
        <p className="text-body-small text-copy-muted">Escolha o serviço:</p>
      </div>
      <div role="tablist" aria-label="Serviço" className="mt-3 grid grid-cols-2 gap-2 px-5" onKeyDown={onKeyDown}>
        {products.map((p) => {
          const selected = active === p;
          return (
            <button
              key={p}
              ref={(el) => { tabRefs.current[p] = el; }}
              type="button"
              role="tab"
              id={`${id}-tab-${p}`}
              aria-selected={selected}
              aria-controls={`${id}-panel-${p}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(p)}
              className={cn(
                "flex min-h-14 flex-col items-start justify-center rounded-card border-2 px-4 py-2 text-left transition-colors",
                selected ? cn(ACCENT[p].on, "border-transparent") : "border-line bg-panel-alt text-copy-secondary hover:border-copy/30 hover:text-copy",
              )}
            >
              <span className="display text-h4 leading-none">{SERVICE[p].label}</span>
              <span className="mt-1 text-caption font-semibold">{SERVICE[p].unit}</span>
            </button>
          );
        })}
      </div>
      <div className="grid">
        {products.map((p) => (
          <div
            key={p}
            role="tabpanel"
            id={`${id}-panel-${p}`}
            aria-labelledby={`${id}-tab-${p}`}
            inert={active !== p}
            className={cn("col-start-1 row-start-1 flex flex-col gap-4 p-5", active !== p && "invisible")}
          >
            <ServiceIntro product={p} />
            {/* O painel TVDE estica até à altura do Rent a Car: o espaço a mais vai para os passos */}
            {p === "tvde" && <TvdeSteps className="flex-1" />}
            <ProductForm product={p} racLocations={racLocations} tvdeLocations={tvdeLocations} />
          </div>
        ))}
      </div>
      <div className={cn("h-1", ACCENT[active].bar)} aria-hidden />
    </div>
  );
}
