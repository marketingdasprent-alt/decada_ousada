/**
 * Preços (doc §72–76).
 *
 * Regra: o frontend NÃO cria regras comerciais. Totais, impostos, cauções e sinais
 * vêm sempre da API (WeGest). As funções aqui servem apenas para apresentação.
 */
export type PricingUnit = "day" | "week";

export type Currency = "EUR";

export interface VehiclePricing {
  unit: PricingUnit;
  /** Valor por unidade (€/dia ou €/semana). Nunca derivar semana = dia × 7. */
  amount: number;
  currency: Currency;
  /** Total do período, devolvido pela API. */
  total?: number;
  /** Caução. */
  deposit?: number;
  /** Sinal / valor a pagar agora (TVDE). */
  reservationAmount?: number;
}

export interface PriceLine {
  id: string;
  label: string;
  amount: number;
  kind: "base" | "extra" | "coverage" | "fee" | "tax" | "discount";
}

/** Orçamento devolvido pela API: a fonte oficial dos valores apresentados. */
export interface Quote {
  id: string;
  currency: Currency;
  lines: PriceLine[];
  subtotal: number;
  taxes: number;
  total: number;
  deposit?: number;
  /** Franquia aplicável (da cobertura escolhida ou do modelo). */
  excess?: number | null;
  /** km incluídos por dia; null = ilimitados. */
  kmIncludedPerDay?: number | null;
  /** Validade do orçamento (ISO). */
  expiresAt?: string;
}

const UNIT_LABEL: Record<PricingUnit, string> = { day: "dia", week: "semana" };

export function unitLabel(unit: PricingUnit): string {
  return UNIT_LABEL[unit];
}

const formatterCache = new Map<string, Intl.NumberFormat>();

export function formatMoney(amount: number, currency: Currency = "EUR", opts?: { decimals?: boolean }): string {
  const decimals = opts?.decimals ?? !Number.isInteger(amount);
  const key = `${currency}-${decimals}`;
  let fmt = formatterCache.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency,
      minimumFractionDigits: decimals ? 2 : 0,
      maximumFractionDigits: 2,
    });
    formatterCache.set(key, fmt);
  }
  return fmt.format(amount);
}

export function formatRate(pricing: Pick<VehiclePricing, "amount" | "currency" | "unit">): string {
  return `${formatMoney(pricing.amount, pricing.currency)}/${unitLabel(pricing.unit)}`;
}
