import type { ReactNode } from "react";

import { Swoosh } from "../shared/swoosh";
import { Container, Section } from "../shared/ui";

export function AuthShell({ title, description, children, aside }: { title: string; description?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <Section><Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div className="relative hidden overflow-hidden rounded-feature bg-panel-dark p-10 text-on-dark lg:block lg:min-h-130">
        <Swoosh className="absolute -bottom-10 -right-24 w-155 text-brand opacity-40" />
        <p className="display relative text-h1">A sua conta DÉCADA OUSADA</p>
        <p className="relative mt-4 max-w-sm text-on-dark/70">Acompanhe reservas, candidaturas TVDE, pagamentos e documentos num só lugar.</p>
      </div>
      <div className="mx-auto w-full max-w-md">
        <h1 className="display text-h1">{title}</h1>
        {description && <p className="mt-2 text-copy-secondary">{description}</p>}
        <div className="mt-8 rounded-panel border border-line bg-panel p-6 sm:p-8">{children}</div>
        {aside}
      </div>
    </Container></Section>
  );
}
