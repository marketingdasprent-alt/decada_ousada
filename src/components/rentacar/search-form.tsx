"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import type { Location } from "@/domain/location";
import { addDays, TIME_SLOTS } from "@/lib/dates";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { useToday } from "@/lib/use-today";

import { Checkbox, Input, Label, Select } from "../shared/form";
import { Button } from "../shared/ui";

export interface SearchValues {
  pickupLocationId: string;
  returnLocationId: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
}

const MAX_DAYS = 30; // limite da API WeGest para Rent a Car

export function searchToQuery(v: SearchValues): string {
  return new URLSearchParams({
    levantamento: v.pickupLocationId,
    devolucao: v.returnLocationId,
    inicio: `${v.pickupDate}T${v.pickupTime}`,
    fim: `${v.returnDate}T${v.returnTime}`,
  }).toString();
}

/** Pesquisa Rent a Car (doc §9–10). */
export function RentACarSearchForm({
  locations,
  initial,
  variant = "card",
  action = "/rent-a-car/viaturas",
  extraParams,
  collapsible,
}: {
  locations: Location[];
  initial?: Partial<SearchValues>;
  /** `card` (página), `bar` (faixa à largura da página) ou `stack` (coluna estreita, ex.: painel lateral). */
  variant?: "card" | "bar" | "stack";
  action?: string;
  extraParams?: Record<string, string>;
  /** Em mobile, mostra só um botão "Alterar pesquisa" até ser aberto. */
  collapsible?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const id = useId();
  const pickupLocations = locations.filter((l) => l.pickupAvailable);
  const returnLocations = locations.filter((l) => l.returnAvailable);

  const today = useToday();
  const [draft, setValues] = useState<SearchValues>({
    pickupLocationId: initial?.pickupLocationId ?? pickupLocations[0]?.id ?? "",
    returnLocationId: initial?.returnLocationId ?? initial?.pickupLocationId ?? pickupLocations[0]?.id ?? "",
    pickupDate: initial?.pickupDate ?? "",
    pickupTime: initial?.pickupTime ?? "10:00",
    returnDate: initial?.returnDate ?? "",
    returnTime: initial?.returnTime ?? "10:00",
  });
  const [sameReturn, setSameReturn] = useState(!initial?.returnLocationId || initial.returnLocationId === initial.pickupLocationId);
  const [error, setError] = useState<string | null>(null);

  // Datas por omissão calculadas no browser (amanhã → +3 dias)
  const values: SearchValues = {
    ...draft,
    pickupDate: draft.pickupDate || (today ? addDays(today, 1) : ""),
    returnDate: draft.returnDate || (today ? addDays(today, 4) : ""),
  };

  const set = (patch: Partial<SearchValues>) => setValues((v) => ({ ...v, pickupDate: values.pickupDate, returnDate: values.returnDate, ...patch }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = { ...values, returnLocationId: sameReturn ? values.pickupLocationId : values.returnLocationId };
    const start = new Date(`${v.pickupDate}T${v.pickupTime}`);
    const end = new Date(`${v.returnDate}T${v.returnTime}`);
    if (!v.pickupLocationId) return setError("Escolha o local de levantamento.");
    if (start.getTime() < Date.now()) return setError("A data de levantamento tem de ser no futuro.");
    if (end <= start) return setError("A devolução tem de ser depois do levantamento.");
    if ((end.getTime() - start.getTime()) / 86_400_000 > MAX_DAYS) {
      return setError(`O aluguer online tem um máximo de ${MAX_DAYS} dias. Para períodos maiores, contacte-nos.`);
    }
    setError(null);
    track("rentacar_search", { pickupLocationId: v.pickupLocationId, returnLocationId: v.returnLocationId, sameReturn });
    const extra = extraParams ? `&${new URLSearchParams(extraParams).toString()}` : "";
    router.push(`${action}?${searchToQuery(v)}${extra}`);
  }

  const bar = variant === "bar";
  const stack = variant === "stack";

  const toggle = collapsible && !expanded && (
    <Button type="button" variant="outline" className="w-full md:hidden" onClick={() => setExpanded(true)}>
      <SlidersHorizontal className="size-4" aria-hidden /> Alterar pesquisa
    </Button>
  );

  return (
    <>
    {toggle}
    <form onSubmit={submit} noValidate className={cn(collapsible && !expanded && "hidden md:block", variant === "card" && "rounded-panel bg-panel p-5 shadow-floating sm:p-6")} aria-label="Pesquisar viaturas Rent a Car">
      <div className={cn("grid gap-4", bar ? "sm:grid-cols-2 lg:grid-search-bar lg:items-end" : stack ? "grid-cols-2" : "sm:grid-cols-2 lg:grid-search")}>
        <div className={cn(stack ? "col-span-2" : "sm:col-span-2 lg:col-span-1")}>
          <Label htmlFor={`${id}-pl`}>Local de levantamento</Label>
          <Select id={`${id}-pl`} value={values.pickupLocationId} onChange={(e) => set({ pickupLocationId: e.target.value })}>
            {pickupLocations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`${id}-pd`}>Levantamento</Label>
          <Input id={`${id}-pd`} type="date" min={today} value={values.pickupDate} onChange={(e) => set({ pickupDate: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor={`${id}-pt`}>Hora</Label>
          <Select id={`${id}-pt`} value={values.pickupTime} onChange={(e) => set({ pickupTime: e.target.value })}>
            {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor={`${id}-rd`}>Devolução</Label>
          <Input id={`${id}-rd`} type="date" min={values.pickupDate || today} value={values.returnDate} onChange={(e) => set({ returnDate: e.target.value })} required />
        </div>
        <div>
          <Label htmlFor={`${id}-rt`}>Hora</Label>
          <Select id={`${id}-rt`} value={values.returnTime} onChange={(e) => set({ returnTime: e.target.value })}>
            {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </div>
        {bar && (
          <Button type="submit" className="w-full sm:col-span-2 lg:col-span-1 lg:w-auto">
            <Search className="size-4" aria-hidden /> Pesquisar
          </Button>
        )}
      </div>

      <div className={cn("mt-4 flex flex-col gap-4", variant === "card" && "sm:flex-row sm:items-end sm:justify-between")}>
        <div className={cn("flex flex-col gap-3", !stack && "sm:flex-row sm:items-center sm:gap-6")}>
          <Checkbox label="Devolver no mesmo local" checked={sameReturn} onChange={(e) => setSameReturn(e.target.checked)} />
          {!sameReturn && (
            <div className="min-w-56">
              <Label htmlFor={`${id}-rl`} className="sr-only">Local de devolução</Label>
              <Select id={`${id}-rl`} value={values.returnLocationId} onChange={(e) => set({ returnLocationId: e.target.value })} aria-label="Local de devolução">
                {returnLocations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </Select>
            </div>
          )}
        </div>
        {!bar && (
          <Button type="submit" size="lg" className={cn("w-full", !stack && "sm:w-auto")}>
            <Search className="size-4" aria-hidden /> Pesquisar
          </Button>
        )}
      </div>
      {error && <p role="alert" className="mt-3 text-body-small font-medium text-negative">{error}</p>}
    </form>
    </>
  );
}
