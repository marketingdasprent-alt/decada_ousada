import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "dark" | "outline" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary: "bg-brand text-on-brand hover:bg-brand-hover",
  dark: "bg-panel-dark text-on-dark hover:bg-panel-dark/90",
  outline: "border border-copy/15 bg-panel text-copy hover:border-copy/40",
  ghost: "text-copy hover:bg-panel-sunken",
  light: "bg-panel text-copy hover:bg-panel/90",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-3.5 text-body-small",
  md: "h-11 px-5 text-body",
  lg: "h-13 px-7 text-body",
};

/** Desativado: neutro, para não se confundir com erro (a cor de marca a 50% parecia erro). */
const DISABLED = "border-transparent bg-panel-sunken text-copy-muted shadow-none hover:bg-panel-sunken";

/** Classe de um link com aspeto de botão desativado (ação ainda indisponível). */
export function disabledButtonClass(size: Size = "md", extra?: string) {
  return cn("inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-control font-semibold select-none", DISABLED, SIZE[size], extra);
}

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-colors select-none disabled:cursor-not-allowed",
    // Em carregamento (aria-busy) o botão mantém a cor; desativado de facto fica neutro
    "disabled:not-aria-busy:border-transparent disabled:not-aria-busy:bg-panel-sunken disabled:not-aria-busy:text-copy-muted",
    VARIANT[variant],
    SIZE[size],
    extra,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  loading,
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size; loading?: boolean }) {
  return (
    <button className={buttonClass(variant, size, className)} disabled={loading || props.disabled} aria-busy={loading || undefined} {...props}>
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("size-4 animate-spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const CONTAINER_VARIANT = { standard: "", narrow: "layout-container--narrow", wide: "layout-container--wide" } as const;

/** Container: largura e margens laterais da página (Blueprint). */
export function Container({ variant = "standard", className, ...props }: ComponentProps<"div"> & { variant?: keyof typeof CONTAINER_VARIANT }) {
  return <div className={cn("layout-container", CONTAINER_VARIANT[variant], className)} {...props} />;
}

const SECTION_VARIANT = { normal: "", compact: "layout-section--compact", spacious: "layout-section--spacious" } as const;

/** Section: ritmo vertical entre blocos; o fundo pode ir de ponta a ponta (Blueprint). */
export function Section({
  variant = "normal",
  surface,
  className,
  ...props
}: ComponentProps<"section"> & { variant?: keyof typeof SECTION_VARIANT; surface?: boolean }) {
  return <section className={cn("layout-section", SECTION_VARIANT[variant], surface && "layout-section--surface", className)} {...props} />;
}

type Tone = "neutral" | "brand" | "ok" | "warn" | "danger" | "info" | "dark";
const TONE: Record<Tone, string> = {
  neutral: "bg-panel-sunken text-copy-secondary",
  brand: "bg-brand-surface text-brand-hover",
  ok: "bg-positive-surface text-positive",
  warn: "bg-caution-surface text-caution",
  danger: "bg-negative-surface text-negative",
  info: "bg-info-surface text-info",
  dark: "bg-panel-dark text-on-dark",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-control px-2 py-0.5 text-caption font-semibold", TONE[tone], className)}>{children}</span>
  );
}

/** Etiqueta inclinada, como o banner do logótipo. */
export function SlantTag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("slant display inline-block bg-brand px-4 py-1 text-body-small text-on-brand", className)}>{children}</span>
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-panel border border-line bg-panel", className)} {...props} />;
}

export function SectionHeading({ title, description, className }: { title: ReactNode; description?: ReactNode; className?: string }) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <h2 className="display text-h2">{title}</h2>
      {description && <p className="mt-3 text-copy-secondary">{description}</p>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-control bg-panel-sunken", className)} aria-hidden />;
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-line", className)} />;
}
