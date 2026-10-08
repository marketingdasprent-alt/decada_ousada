import type { Region } from "@/domain/region";
import { cn } from "@/lib/cn";

/**
 * Linhas decorativas que distinguem as regiões sem mudar a família visual:
 * Continente com traços diagonais (o banner inclinado do logótipo) e Açores com
 * linhas onduladas (o relevo das ilhas). Na cor da marca, só decorativas.
 */
export function RegionLines({ region, className }: { region: Region; className?: string }) {
  return (
    <svg viewBox="0 0 400 200" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden className={cn("pointer-events-none text-brand", className)}>
      {region === "azores" ? (
        <>
          <path d="M0 150 C 60 110, 120 190, 200 140 S 340 100, 400 140" strokeWidth="3" />
          <path d="M0 172 C 70 132, 130 210, 210 162 S 350 124, 400 162" strokeWidth="2" opacity="0.7" />
          <path d="M0 194 C 80 156, 140 230, 220 184 S 360 148, 400 184" strokeWidth="1.5" opacity="0.45" />
        </>
      ) : (
        <>
          <path d="M150 200 L 250 20" strokeWidth="10" />
          <path d="M200 200 L 300 20" strokeWidth="6" opacity="0.7" />
          <path d="M245 200 L 345 20" strokeWidth="3" opacity="0.45" />
        </>
      )}
    </svg>
  );
}
