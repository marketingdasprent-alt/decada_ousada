import { MapPin } from "lucide-react";

import { REGION_CONFIG, REGIONS, type Region } from "@/domain/region";
import { cn } from "@/lib/cn";

/** Bolinha com a cor de cada região (vermelho Continente, verde Açores): a associação lê-se antes do nome. */
const DOT: Record<Region, string> = { mainland: "bg-region-mainland", azores: "bg-region-azores" };

/**
 * Troca de região como controlo segmentado "Continente | Açores": a região atual fica
 * marcada e a outra é um link. `hrefs` vêm do servidor (domínio real em produção,
 * ?regiao= fora dele), por isso funciona também dentro de componentes de cliente.
 */
export function RegionSwitch({ current, hrefs, className }: { current: Region; hrefs: Record<Region, string>; className?: string }) {
  return (
    <nav aria-label="Região" className={cn("flex items-center gap-0.5 rounded-pill border border-on-dark/20 p-0.5 text-body-small", className)}>
      <MapPin className="ml-2 mr-0.5 size-4 shrink-0 text-on-dark/70" aria-hidden />
      {REGIONS.map((r) =>
        r === current ? (
          <span key={r} aria-current="true" className="flex min-h-9 items-center gap-1.5 rounded-pill bg-on-dark px-3 font-semibold text-copy max-md:min-h-11">
            <span className={cn("size-2 rounded-pill", DOT[r])} aria-hidden />
            {REGION_CONFIG[r].shortLabel}
          </span>
        ) : (
          <a key={r} href={hrefs[r]} className="flex min-h-9 items-center gap-1.5 rounded-pill px-3 text-on-dark/80 transition-colors hover:bg-on-dark/10 hover:text-on-dark max-md:min-h-11">
            <span className={cn("size-2 rounded-pill", DOT[r])} aria-hidden />
            <span className="sr-only">Mudar para </span>
            {REGION_CONFIG[r].shortLabel}
          </a>
        ),
      )}
    </nav>
  );
}
