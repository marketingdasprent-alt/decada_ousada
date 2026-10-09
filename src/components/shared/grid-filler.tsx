import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

// Classes literais (o Tailwind só gera as que encontra escritas no código)
const SHOW = {
  sm: ["sm:hidden", "sm:flex sm:col-span-1"],
  lg: ["lg:hidden", "lg:flex lg:col-span-1", "lg:flex lg:col-span-2", "lg:flex lg:col-span-3"],
  xl: ["xl:hidden", "xl:flex xl:col-span-1", "xl:flex xl:col-span-2", "xl:flex xl:col-span-3"],
} as const;

/**
 * Fecha a última linha de uma grelha de cartões: ocupa as colunas que sobram depois de
 * `count` cartões, em cada largura (`sm` 2 colunas; `lg` ou `xl` 3 ou 4), e não aparece
 * quando a linha já está cheia. Em mobile (uma coluna) nunca aparece. O conteúdo deve
 * ser útil (ex.: ver todas, ajuda a escolher), nunca enchimento.
 */
export function GridFiller({
  count,
  lg,
  xl,
  tone = "light",
  children,
  className,
}: {
  count: number;
  lg?: 3 | 4;
  xl?: 3 | 4;
  tone?: "light" | "dark";
  children: ReactNode;
  className?: string;
}) {
  if (count === 0) return null;
  const holes = (cols: number) => (cols - (count % cols)) % cols;
  return (
    <div
      data-grid-filler
      className={cn(
        "hidden flex-col items-start justify-center gap-3 rounded-panel border border-dashed p-6",
        tone === "dark" ? "border-on-dark/30 text-on-dark" : "border-line-control bg-panel-alt text-copy",
        SHOW.sm[holes(2)],
        lg && SHOW.lg[holes(lg)],
        xl && SHOW.xl[holes(xl)],
        className,
      )}
    >
      {children}
    </div>
  );
}
