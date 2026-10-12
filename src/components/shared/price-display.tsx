import type { ReactNode } from "react";

import { formatMoney, unitLabel, type PricingUnit } from "@/domain/pricing";
import { cn } from "@/lib/cn";

/**
 * Apresenta um valor devolvido pela API. Nunca recalcula (doc §76). `note` diz o que o
 * valor inclui ou o passo seguinte ("IVA incluído"); só com informação confirmada.
 * `tone="dark"` para faixas escuras (TVDE). O número usa o tipo display, como os cartões
 * de categoria e de viatura. Para leitores de ecrã lê-se como frase ("Desde 32 € por dia"),
 * em vez de "32 € barra dia".
 */
export function PriceDisplay({
  amount,
  unit,
  prefix,
  note,
  size = "md",
  tone = "light",
  className,
}: {
  amount: number;
  unit?: PricingUnit;
  prefix?: string;
  note?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "light" | "dark";
  className?: string;
}) {
  const sizes = { sm: "text-body-large", md: "text-h3", lg: "text-h2", xl: "text-h1" };
  const muted = tone === "dark" ? "text-on-dark/75" : "text-copy-muted";
  const spoken = [prefix, formatMoney(amount), unit && `por ${unitLabel(unit)}`].filter(Boolean).join(" ");
  return (
    <div className={cn("leading-none", className)}>
      <span className="sr-only">{spoken}</span>
      <span aria-hidden>
        {prefix && <span className={cn("mb-1 block text-caption font-medium", muted)}>{prefix}</span>}
        <span className={cn("display tabular", sizes[size], tone === "dark" ? "text-on-dark" : "text-copy")}>{formatMoney(amount)}</span>
        {unit && <span className={cn("ml-1 text-body-small font-medium", muted)}>/{unitLabel(unit)}</span>}
      </span>
      {note && <span className={cn("mt-2 block text-caption leading-snug", muted)}>{note}</span>}
    </div>
  );
}
