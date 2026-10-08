import type { ReactNode } from "react";

import type { Region } from "@/domain/region";
import { cn } from "@/lib/cn";
import type { HeroImage } from "@/lib/region-imagery";

import { HeroBackground } from "./hero-background";
import { Breadcrumbs } from "./page-header";
import { RegionLines } from "./region-lines";
import { Container, Section } from "./ui";

/**
 * Hero com fotos da região (a trocar sozinhas quando há mais de uma, como no site da BV),
 * texto à esquerda e a pesquisa à direita (`side`). As linhas decorativas mudam com a
 * região (diagonais no Continente, onduladas nos Açores). O véu garante contraste AA do
 * texto branco sobre qualquer foto.
 */
export function Hero({
  region,
  images,
  title,
  description,
  crumbs,
  above,
  side,
  children,
  size = "large",
}: {
  region: Region;
  images: HeroImage[];
  title: ReactNode;
  description?: ReactNode;
  crumbs?: Array<{ href?: string; label: string }>;
  /** Linha acima do título (ex.: seletor de região). */
  above?: ReactNode;
  /** Coluna da direita: o cartão de pesquisa. */
  side?: ReactNode;
  /** Por baixo do texto, na coluna da esquerda. */
  children?: ReactNode;
  size?: "large" | "medium";
}) {
  return (
    <Section variant={size === "large" ? "spacious" : "normal"} className="relative isolate overflow-hidden bg-panel-dark text-on-dark">
      <HeroBackground images={images} />
      <div className="hero-veil absolute inset-0 -z-10" aria-hidden />
      <RegionLines region={region} className="absolute -bottom-6 -left-10 -z-10 hidden w-130 opacity-70 lg:block" />
      <Container className={cn("grid grid-cols-1 gap-8 lg:items-center lg:gap-12", !!side && "lg:grid-hero")}>
        <div className="min-w-0">
          {crumbs && <Breadcrumbs crumbs={crumbs} dark className="mb-5" />}
          {above && <div className="mb-5">{above}</div>}
          <h1 className={size === "large" ? "display text-display" : "display text-h1"}>{title}</h1>
          {description && <p className="mt-4 max-w-xl text-body-large text-on-dark/85">{description}</p>}
          {children && <div className="mt-8">{children}</div>}
        </div>
        {side && <div className="min-w-0">{side}</div>}
      </Container>
    </Section>
  );
}
