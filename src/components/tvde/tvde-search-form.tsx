"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import type { Location } from "@/domain/location";
import { addDays, TIME_SLOTS } from "@/lib/dates";
import { cn } from "@/lib/cn";
import { useToday } from "@/lib/use-today";

import { Input, Label, Select } from "../shared/form";
import { Button } from "../shared/ui";

/**
 * Pesquisa TVDE: local e data de início. Leva às viaturas TVDE desse local; a
 * disponibilidade exata confirma-se na viatura (o levantamento já vem escolhido).
 */
export function TvdeSearchForm({ locations, className, layout = "row" }: { locations: Location[]; className?: string; /** `stack`: coluna estreita (cartão da hero). */ layout?: "row" | "stack" }) {
  const stack = layout === "stack";
  const router = useRouter();
  const id = useId();
  const pickupLocations = locations.filter((l) => l.pickupAvailable);
  const today = useToday();
  const [locationId, setLocationId] = useState(pickupLocations[0]?.id ?? "");
  const [picked, setDate] = useState("");
  const date = picked || (today ? addDays(today, 2) : "");
  const [time, setTime] = useState("10:00");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!locationId) return setError("Escolha o local de levantamento.");
    if (!date || (today && date <= today)) return setError("A data de início tem de ser a partir de amanhã.");
    setError(null);
    router.push(`/tvde/viaturas?${new URLSearchParams({ local: locationId, inicio: `${date}T${time}` })}`);
  }

  return (
    <form onSubmit={submit} noValidate aria-label="Pesquisar viaturas TVDE" className={className}>
      <div className={cn("grid gap-4", stack ? "grid-cols-2" : "sm:grid-cols-2 lg:grid-tvde-search")}>
        <div className={stack ? "col-span-2" : "sm:col-span-2 lg:col-span-1"}>
          <Label htmlFor={`${id}-loc`}>Local de levantamento</Label>
          <Select id={`${id}-loc`} value={locationId} onChange={(e) => setLocationId(e.target.value)}>
            {pickupLocations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor={`${id}-date`}>Data de início</Label>
          <Input id={`${id}-date`} type="date" min={today ? addDays(today, 1) : undefined} value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor={`${id}-time`}>Hora</Label>
          <Select id={`${id}-time`} value={time} onChange={(e) => setTime(e.target.value)}>
            {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </div>
      </div>
      <div className={cn("mt-4 flex flex-col gap-3", !stack && "sm:flex-row sm:items-center sm:justify-between")}>
        {!stack && <p className="text-body-small text-copy-secondary">Preço por semana. Candidatura online, com análise antes do levantamento.</p>}
        <Button type="submit" size="lg" variant="dark" className={cn("w-full", !stack && "sm:w-auto")}>
          <Search className="size-4" aria-hidden /> Ver viaturas TVDE
        </Button>
      </div>
      {error && <p role="alert" className="mt-3 text-body-small font-medium text-negative">{error}</p>}
    </form>
  );
}
