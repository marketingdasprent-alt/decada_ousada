"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Availability } from "@/domain/availability";
import type { VehicleOffer } from "@/domain/offer";
import { formatMoney } from "@/domain/pricing";
import { FAMILY_LABEL, FUEL_LABEL, TRANSMISSION_LABEL, type FuelType, type Transmission, type Vehicle, type VehicleFamily } from "@/domain/vehicle";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { useFocusTrap } from "@/lib/use-focus-trap";

import { Checkbox, Label, Select } from "../shared/form";
import { EmptyState } from "../shared/states";
import { Button } from "../shared/ui";
import { VehicleCard } from "./vehicle-card";

export interface ResultItem {
  vehicle: Vehicle;
  offer: VehicleOffer;
  href: string;
  availability?: Availability;
  total?: number;
  days?: number;
}

interface Filters {
  family: VehicleFamily | "all";
  categories: string[];
  transmissions: Transmission[];
  fuels: FuelType[];
  brands: string[];
  minSeats: number;
  maxPrice: number | null;
  onlyAvailable: boolean;
}

const EMPTY: Filters = { family: "all", categories: [], transmissions: [], fuels: [], brands: [], minSeats: 0, maxPrice: null, onlyAvailable: false };

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
const uniq = <T,>(list: (T | undefined)[]) => [...new Set(list.filter((x): x is T => x !== undefined))];

/**
 * Listagem com filtros (doc §13, §41).
 * Só mostra filtros para valores que existem realmente nos resultados.
 */
export function VehicleResults({ items, product }: { items: ResultItem[]; product: "rentacar" | "tvde" }) {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [sort, setSort] = useState<"price_asc" | "price_desc" | "name">("price_asc");
  const [panelOpen, setPanelOpen] = useState(false);
  useEffect(() => {
    if (product === "rentacar") track("rentacar_results", { count: items.length });
  }, [product, items.length]);
  const panelButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);
  useFocusTrap({ open: panelOpen, onClose: () => setPanelOpen(false), container: drawer, trigger: panelButton });

  const facets = useMemo(() => {
    const prices = items.map((i) => i.offer.pricing.amount);
    return {
      families: uniq(items.map((i) => i.vehicle.category?.family)),
      categories: uniq(items.map((i) => i.vehicle.category?.name)),
      transmissions: uniq(items.map((i) => i.vehicle.transmission)),
      fuels: uniq(items.map((i) => i.vehicle.fuel)),
      brands: uniq(items.map((i) => i.vehicle.brand)).sort(),
      seats: uniq(items.map((i) => i.vehicle.seats)).sort((a, b) => a - b),
      minPrice: prices.length ? Math.floor(Math.min(...prices)) : 0,
      maxPrice: prices.length ? Math.ceil(Math.max(...prices)) : 0,
      hasAvailability: items.some((i) => i.availability),
    };
  }, [items]);

  const filtered = useMemo(() => {
    const out = items.filter(({ vehicle: v, offer, availability }) => {
      if (filters.family !== "all" && v.category?.family !== filters.family) return false;
      if (filters.categories.length && !filters.categories.includes(v.category?.name ?? "")) return false;
      if (filters.transmissions.length && (!v.transmission || !filters.transmissions.includes(v.transmission))) return false;
      if (filters.fuels.length && (!v.fuel || !filters.fuels.includes(v.fuel))) return false;
      if (filters.brands.length && !filters.brands.includes(v.brand)) return false;
      if (filters.minSeats && (v.seats ?? 0) < filters.minSeats) return false;
      if (filters.maxPrice !== null && offer.pricing.amount > filters.maxPrice) return false;
      if (filters.onlyAvailable && availability?.status === "unavailable") return false;
      return true;
    });
    const rank = (i: ResultItem) => (i.availability?.status === "unavailable" ? 1 : 0);
    return out.sort((a, b) => {
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      if (sort === "name") return a.vehicle.name.localeCompare(b.vehicle.name);
      const pa = a.total ?? a.offer.pricing.amount;
      const pb = b.total ?? b.offer.pricing.amount;
      return sort === "price_asc" ? pa - pb : pb - pa;
    });
  }, [items, filters, sort]);

  const activeCount =
    (filters.family !== "all" ? 1 : 0) + filters.categories.length + filters.transmissions.length + filters.fuels.length + filters.brands.length + (filters.minSeats ? 1 : 0) + (filters.maxPrice !== null ? 1 : 0) + (filters.onlyAvailable ? 1 : 0);

  const unit = product === "tvde" ? "semana" : "dia";

  const panel = (
    <div className="space-y-6">
      {facets.families.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-body-small font-semibold">Tipo</legend>
          <div className="flex rounded-control bg-panel-sunken p-1 text-body-small">
            {(["all", ...facets.families] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilters((s) => ({ ...s, family: f, categories: [] }))}
                aria-pressed={filters.family === f}
                className={cn("flex-1 rounded-control px-3 py-1.5 font-medium", filters.family === f ? "bg-panel shadow-low" : "text-copy-secondary")}
              >
                {f === "all" ? "Todos" : FAMILY_LABEL[f]}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      {facets.categories.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-body-small font-semibold">Categoria</legend>
          <div className="space-y-2">
            {facets.categories
              .filter((c) => filters.family === "all" || items.some((i) => i.vehicle.category?.name === c && i.vehicle.category.family === filters.family))
              .map((c) => (
                <Checkbox key={c} label={c} checked={filters.categories.includes(c)} onChange={() => setFilters((s) => ({ ...s, categories: toggle(s.categories, c) }))} />
              ))}
          </div>
        </fieldset>
      )}
      {facets.maxPrice > facets.minPrice && (
        <div>
          <Label htmlFor="f-price">
            Preço máximo: <span className="font-semibold text-copy tabular">{formatMoney(filters.maxPrice ?? facets.maxPrice)}</span>/{unit}
          </Label>
          <input
            id="f-price"
            type="range"
            min={facets.minPrice}
            max={facets.maxPrice}
            step={1}
            value={filters.maxPrice ?? facets.maxPrice}
            onChange={(e) => setFilters((s) => ({ ...s, maxPrice: Number(e.target.value) >= facets.maxPrice ? null : Number(e.target.value) }))}
            className="w-full accent-selected"
          />
        </div>
      )}
      {facets.transmissions.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-body-small font-semibold">Caixa</legend>
          <div className="space-y-2">
            {facets.transmissions.map((t) => (
              <Checkbox key={t} label={TRANSMISSION_LABEL[t]} checked={filters.transmissions.includes(t)} onChange={() => setFilters((s) => ({ ...s, transmissions: toggle(s.transmissions, t) }))} />
            ))}
          </div>
        </fieldset>
      )}
      {facets.fuels.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-body-small font-semibold">Combustível</legend>
          <div className="space-y-2">
            {facets.fuels.map((f) => (
              <Checkbox key={f} label={FUEL_LABEL[f]} checked={filters.fuels.includes(f)} onChange={() => setFilters((s) => ({ ...s, fuels: toggle(s.fuels, f) }))} />
            ))}
          </div>
        </fieldset>
      )}
      {facets.seats.length > 1 && (
        <div>
          <Label htmlFor="f-seats">Lugares</Label>
          <Select id="f-seats" value={filters.minSeats} onChange={(e) => setFilters((s) => ({ ...s, minSeats: Number(e.target.value) }))}>
            <option value={0}>Qualquer</option>
            {facets.seats.map((n) => <option key={n} value={n}>{n}+ lugares</option>)}
          </Select>
        </div>
      )}
      {facets.brands.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-body-small font-semibold">Marca</legend>
          <div className="space-y-2">
            {facets.brands.map((b) => (
              <Checkbox key={b} label={b} checked={filters.brands.includes(b)} onChange={() => setFilters((s) => ({ ...s, brands: toggle(s.brands, b) }))} />
            ))}
          </div>
        </fieldset>
      )}
      {facets.hasAvailability && (
        <Checkbox label="Só disponíveis" checked={filters.onlyAvailable} onChange={(e) => setFilters((s) => ({ ...s, onlyAvailable: e.target.checked }))} />
      )}
      {activeCount > 0 && (
        <button type="button" onClick={() => setFilters(EMPTY)} className="text-body-small font-medium text-brand underline underline-offset-4">
          Limpar filtros ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-filters-main">
      <aside className="hidden lg:block" aria-label="Filtros">
        <div className="sticky-panel">
          {/* Cerca de 25 controlos de filtro antes do primeiro cartão: atalho para quem navega com teclado */}
          <a href="#resultados" className="sr-only focus:not-sr-only focus:mb-4 focus:inline-flex focus:min-h-(--layout-tap) focus:items-center focus:rounded-control focus:bg-panel-dark focus:px-4 focus:text-body-small focus:font-semibold focus:text-on-dark">
            Saltar para os resultados
          </a>
          {panel}
        </div>
      </aside>

      <div id="resultados" tabIndex={-1} className="focus:outline-none">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-body-small text-copy-secondary" aria-live="polite">
            <span className="font-semibold text-copy">{filtered.length}</span> {filtered.length === 1 ? "viatura" : "viaturas"}
          </p>
          <div className="flex items-center gap-2">
            <Button ref={panelButton} type="button" variant="outline" size="sm" className="h-11 lg:hidden" aria-haspopup="dialog" onClick={() => setPanelOpen(true)}>
              <SlidersHorizontal className="size-4" aria-hidden /> Filtros{activeCount ? ` (${activeCount})` : ""}
            </Button>
            <label className="sr-only" htmlFor="sort">Ordenar</label>
            <Select id="sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-11 w-auto text-body-small lg:h-9">
              <option value="price_asc">Preço: mais baixo</option>
              <option value="price_desc">Preço: mais alto</option>
              <option value="name">Nome</option>
            </Select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma viatura corresponde aos filtros."
            description="Experimente remover alguns filtros."
            action={<Button variant="outline" size="sm" onClick={() => setFilters(EMPTY)}>Limpar filtros</Button>}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((i) => (
              <VehicleCard key={i.vehicle.id} vehicle={i.vehicle} offer={i.offer} href={i.href} availability={i.availability} total={i.total} days={i.days} />
            ))}
          </div>
        )}
      </div>

      {panelOpen && (
        <div className="fixed inset-0 z-modal lg:hidden" role="dialog" aria-modal="true" aria-labelledby="filtros-titulo">
          <button type="button" tabIndex={-1} aria-label="Fechar filtros" className="absolute inset-0 cursor-default bg-overlay" onClick={() => setPanelOpen(false)} />
          <div ref={drawer} className="absolute inset-y-0 right-0 flex w-drawer flex-col bg-panel">
            <div className="flex items-center justify-between border-b border-line p-4">
              <h2 id="filtros-titulo" className="font-semibold">Filtros</h2>
              <button type="button" onClick={() => setPanelOpen(false)} aria-label="Fechar filtros" className="flex size-11 items-center justify-center rounded-control hover:bg-panel-sunken">
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{panel}</div>
            <div className="border-t border-line p-4">
              <Button className="w-full" onClick={() => setPanelOpen(false)}>Ver {filtered.length} viaturas</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
