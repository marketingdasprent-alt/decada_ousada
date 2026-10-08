import type { CSSProperties } from "react";

import type { VehicleBody } from "@/domain/vehicle";
import { cn } from "@/lib/cn";

/**
 * Ilustração usada quando o WeGest não fornece fotografia (imagem_url = null).
 * Silhueta pela carroçaria, pintura por nome (--color-paint-*) e a linha do
 * logótipo como chão. Todas as cores vêm de tokens.css.
 */
const PAINTS = ["white", "pearl", "silver", "grey", "graphite", "black", "onyx", "red", "wine", "blue", "green", "olive", "orange", "yellow", "sand"] as const;
const DARK_PAINTS = new Set(["graphite", "black", "onyx", "wine", "blue"]);

const t = (name: string) => `var(--color-illustration-${name})`;

const BODIES: Record<VehicleBody, { body: string; glass: string; wheels: [number, number]; y: number; r: number }> = {
  sedan: {
    body: "M28 158c0-15 7-24 24-28l58-12c22-20 52-34 92-35h56c30 0 52 15 72 33l34 7c14 3 20 13 20 26v9c0 4-3 6-7 6H35c-4 0-7-2-7-6z",
    glass: "M126 118c18-17 42-25 72-26v26z M210 92h48c22 1 40 11 56 26H210z",
    wheels: [100, 300],
    y: 172,
    r: 27,
  },
  suv: {
    body: "M30 160c0-14 6-22 20-26l46-10c16-28 40-50 80-52h100c28 0 46 14 62 40l30 8c12 3 18 12 18 24v18c0 4-3 6-7 6H37c-4 0-7-2-7-6z",
    glass: "M110 122c14-24 34-38 66-40h20v40z M208 82h66c20 0 34 10 46 40H208z",
    wheels: [100, 300],
    y: 174,
    r: 29,
  },
  van: {
    body: "M40 172V84c0-10 8-18 18-18h196c12 0 22 5 30 14l46 52 18 6c8 3 12 10 12 18v16c0 4-3 6-7 6H46c-4 0-6-2-6-6z",
    glass: "M262 84h18l40 48h-58z",
    wheels: [100, 300],
    y: 180,
    r: 26,
  },
};

export function CarIllustration({
  paint = "default",
  body = "sedan",
  surface = "light",
  className,
  label,
}: {
  paint?: string;
  body?: VehicleBody;
  surface?: "light" | "dark";
  className?: string;
  label?: string;
}) {
  const safePaint = (PAINTS as readonly string[]).includes(paint) ? paint : "default";
  const shape = BODIES[body];
  const id = `car-${safePaint}-${body}-${surface}`;
  const color = `var(--color-paint-${safePaint})`;
  const glass = DARK_PAINTS.has(safePaint) ? t("glass-light") : t("glass");
  const stop = (c: string): CSSProperties => ({ stopColor: c });
  const bg = surface === "dark" ? ["bg-dark-top", "bg-dark-bottom"] : ["bg-top", "bg-bottom"];

  return (
    <svg viewBox="0 0 400 240" className={cn("h-full w-full", className)} role="img" aria-label={label ?? "Ilustração da viatura"}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={stop(t(bg[0]))} />
          <stop offset="1" style={stop(t(bg[1]))} />
        </linearGradient>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={stop(`color-mix(in srgb, ${color} 72%, white)`)} />
          <stop offset="0.55" style={stop(color)} />
          <stop offset="1" style={stop(`color-mix(in srgb, ${color} 72%, black)`)} />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill={`url(#${id}-bg)`} />
      {/* Chão: a linha do logótipo */}
      <path d={`M28 ${shape.y + shape.r - 2}c96-7 248-7 344 0`} style={{ stroke: "var(--color-primary)" }} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Em fundo escuro, um contorno claro mantém visíveis as pinturas escuras */}
      <path d={shape.body} fill={`url(#${id}-body)`} style={surface === "dark" ? { stroke: t("outline"), strokeWidth: 2 } : undefined} />
      <path d={shape.glass} style={{ fill: glass }} />
      {shape.wheels.map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={shape.y} r={shape.r} style={{ fill: t("tyre") }} />
          <circle cx={cx} cy={shape.y} r={shape.r * 0.55} style={{ fill: t("rim") }} />
          <circle cx={cx} cy={shape.y} r={shape.r * 0.18} style={{ fill: t("hub") }} />
        </g>
      ))}
    </svg>
  );
}
