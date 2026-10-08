import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Swoosh } from "./swoosh";
import { Container, Skeleton } from "./ui";

/**
 * Topo de página. `light` para Rent a Car e páginas institucionais; `dark` reservado
 * ao TVDE (produto profissional). `lines` mostra as linhas do logótipo, inteiras e
 * nítidas, só no topo do TVDE (docs/design/direcao-de-design.md).
 */
export function PageHeader({
  title,
  description,
  crumbs,
  children,
  tone = "light",
  lines,
}: {
  title: ReactNode;
  description?: ReactNode;
  crumbs?: Array<{ href?: string; label: string }>;
  children?: ReactNode;
  tone?: "light" | "dark";
  lines?: boolean;
}) {
  const dark = tone === "dark";
  return (
    <section className={cn("relative overflow-hidden pb-10 pt-8 sm:pb-14 sm:pt-10", dark ? "bg-panel-dark text-on-dark" : "border-b border-line bg-panel text-copy")}>
      {lines && <Swoosh className="absolute -right-24 top-6 hidden w-130 text-brand lg:block" />}
      <Container className="relative">
        {crumbs && <Breadcrumbs crumbs={crumbs} dark={dark} className="mb-5" />}
        <h1 className={cn("display text-h1", lines && "lg:max-w-3xl")}>{title}</h1>
        {description && <p className={cn("mt-3 max-w-2xl sm:text-body-large", dark ? "text-on-dark/75" : "text-copy-secondary")}>{description}</p>}
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </section>
  );
}

/** Navegação estrutural ("Início > Rent a Car > ..."), em fundo claro ou escuro. */
export function Breadcrumbs({ crumbs, dark, className }: { crumbs: Array<{ href?: string; label: string }>; dark?: boolean; className?: string }) {
  return (
    <nav aria-label="Navegação estrutural" className={className}>
      <ol className={cn("flex flex-wrap items-center gap-1 text-body-small", dark ? "text-on-dark/70" : "text-copy-muted")}>
        <li><Link href="/" className={cn("max-md:tap-target", dark ? "hover:text-on-dark" : "hover:text-copy")}>Início</Link></li>
        {crumbs.map((c) => (
          <li key={c.label} className="flex items-center gap-1">
            <ChevronRight className="size-3.5" aria-hidden />
            {c.href ? (
              <Link href={c.href} className={cn("max-md:tap-target", dark ? "hover:text-on-dark" : "hover:text-copy")}>{c.label}</Link>
            ) : (
              <span aria-current="page" className={dark ? "text-on-dark" : "text-copy"}>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageSkeleton({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <>
      <div className={cn("h-44", tone === "dark" ? "bg-panel-dark" : "border-b border-line bg-panel")} />
      <Container className="mt-10 grid grid-cols-1 gap-10 lg:grid-main-aside">
        <Skeleton className="aspect-vehicle" />
        <Skeleton className="h-96" />
      </Container>
    </>
  );
}
