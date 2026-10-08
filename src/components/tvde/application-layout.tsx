import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

import { Stepper } from "../shared/stepper";
import { Container, Section } from "../shared/ui";

export const TVDE_STEPS = ["Levantamento", "Cadastro", "Documentos", "Pagamento"];

/**
 * `asideLabel`: em mobile o resumo (`aside`) aparece antes do formulário, fechado
 * numa linha com este texto; em desktop fica na coluna lateral.
 */
export function ApplicationLayout({ step, title, description, aside, asideLabel, children }: { step: number; title: string; description?: string; aside?: ReactNode; asideLabel?: string; children: ReactNode }) {
  return (
    <Section variant="compact"><Container>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-body-small font-semibold text-copy-secondary">Candidatura TVDE</p>
        <Stepper steps={TVDE_STEPS} current={step} />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-main-aside">
        <div className="min-w-0">
          <h1 className="text-h2 font-bold">{title}</h1>
          {description && <p className="mt-1 text-copy-secondary">{description}</p>}
          {aside && asideLabel && (
            <details className="group mt-6 lg:hidden">
              <summary className="flex min-h-(--layout-tap) cursor-pointer list-none items-center justify-between gap-3 rounded-panel border border-line bg-panel px-4 py-3 text-body-small font-semibold marker:hidden">
                <span>{asideLabel}</span>
                <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <div className="mt-2">{aside}</div>
            </details>
          )}
          <div className="mt-6">{children}</div>
        </div>
        {aside && <aside className={asideLabel ? "hidden lg:block" : undefined}><div className="lg:sticky-panel">{aside}</div></aside>}
      </div>
    </Container></Section>
  );
}
