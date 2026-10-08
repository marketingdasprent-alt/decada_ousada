import { formatMoney, unitLabel, type PricingUnit } from "@/domain/pricing";
import { cn } from "@/lib/cn";

/** Apresenta um valor devolvido pela API. Nunca recalcula (doc §76). */
export function PriceDisplay({
  amount,
  unit,
  prefix,
  size = "md",
  className,
}: {
  amount: number;
  unit?: PricingUnit;
  prefix?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = { sm: "text-body-large", md: "text-h3", lg: "text-h2", xl: "text-h1" };
  return (
    <div className={cn("leading-none", className)}>
      {prefix && <span className="mb-1 block text-caption font-medium text-copy-muted">{prefix}</span>}
      <span className={cn("font-bold tabular", sizes[size])}>{formatMoney(amount)}</span>
      {unit && <span className="ml-1 text-body-small font-medium text-copy-muted">/{unitLabel(unit)}</span>}
    </div>
  );
}
