import { AlertTriangle, Clock, SearchX } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { ButtonLink } from "./ui";

/** Estados vazio / erro / timeout: nunca deixar a UI em loading indefinido (doc §92–93). */
export function EmptyState({ title, description, action, className }: { title: string; description?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center rounded-panel border border-dashed border-line bg-panel px-6 py-14 text-center", className)}>
      <SearchX className="mb-4 size-10 text-copy-muted" aria-hidden />
      <h3 className="text-body-large font-semibold">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-body text-copy-secondary">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Não foi possível carregar esta informação.",
  description = "O sistema de gestão não respondeu. Tente novamente dentro de instantes.",
  timeout,
  retryHref,
  className,
}: {
  title?: string;
  description?: ReactNode;
  timeout?: boolean;
  retryHref?: string;
  className?: string;
}) {
  const Icon = timeout ? Clock : AlertTriangle;
  return (
    <div role="alert" className={cn("flex flex-col items-center rounded-panel border border-negative/20 bg-negative-surface/50 px-6 py-12 text-center", className)}>
      <Icon className="mb-4 size-10 text-negative" aria-hidden />
      <h3 className="text-body-large font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-md text-body text-copy-secondary">{description}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {retryHref && (
          <ButtonLink href={retryHref} variant="dark" size="sm">
            Tentar novamente
          </ButtonLink>
        )}
        <ButtonLink href="/contactos" variant="outline" size="sm">
          Contactar-nos
        </ButtonLink>
      </div>
    </div>
  );
}

export function Notice({ tone = "info", title, children, className }: { tone?: "info" | "warn" | "ok" | "danger"; title?: string; children: ReactNode; className?: string }) {
  const tones = {
    info: "border-info/20 bg-info-surface text-info",
    warn: "border-caution/25 bg-caution-surface text-caution",
    ok: "border-positive/20 bg-positive-surface text-positive",
    danger: "border-negative/20 bg-negative-surface text-negative",
  };
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("rounded-card border px-4 py-3 text-body", tones[tone], className)}>
      {title && <p className="mb-0.5 font-semibold">{title}</p>}
      <div className="text-copy-secondary">{children}</div>
    </div>
  );
}
