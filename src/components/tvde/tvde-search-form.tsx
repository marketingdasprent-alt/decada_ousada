"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import type { Location } from "@/domain/location";
import { cn } from "@/lib/cn";

import { Label, Select } from "../shared/form";
import { Button } from "../shared/ui";

/**
 * Pesquisa TVDE: só o local de levantamento (decisão da equipa, 2026-10-15). Leva às
 * viaturas TVDE desse local; a data e a hora escolhem-se na viatura, ao reservar.
 */
export function TvdeSearchForm({ locations, className, layout = "row" }: { locations: Location[]; className?: string; /** `stack`: coluna estreita (cartão da hero). */ layout?: "row" | "stack" }) {
  const stack = layout === "stack";
  const router = useRouter();
  const id = useId();
  const pickupLocations = locations.filter((l) => l.pickupAvailable);
  const [locationId, setLocationId] = useState(pickupLocations[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!locationId) return setError("Escolha o local de levantamento.");
    setError(null);
    router.push(`/tvde/viaturas?${new URLSearchParams({ local: locationId })}`);
  }

  return (
    <form onSubmit={submit} noValidate aria-label="Pesquisar viaturas TVDE" className={className}>
      <div>
        <Label htmlFor={`${id}-loc`}>Local de levantamento</Label>
        <Select id={`${id}-loc`} value={locationId} onChange={(e) => setLocationId(e.target.value)} aria-describedby={`${id}-hint`}>
          {pickupLocations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </Select>
        {/* Sem campo de data, diz-se onde ela se escolhe: o motorista não fica à procura */}
        <p id={`${id}-hint`} className="mt-1.5 text-caption text-copy-muted">A data de levantamento escolhe-se na viatura.</p>
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
