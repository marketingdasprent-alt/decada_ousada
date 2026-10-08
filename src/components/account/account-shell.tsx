import { Suspense, type ReactNode } from "react";

import { Container, Section } from "../shared/ui";
import { AccountNav } from "./account-nav";

export function AccountShell({ title, nav, children }: { title: string; nav: Array<{ href: string; label: string }>; children: ReactNode }) {
  return (
    <div>
      {/* Espaço de trabalho: banda compacta e clara, sem elementos de marketing */}
      <div className="border-b border-line bg-panel py-5">
        <Container>
          <h1 className="text-h3 font-bold">{title}</h1>
        </Container>
      </div>
      <Section variant="compact"><Container className="grid grid-cols-1 gap-8 lg:grid-nav-main">
        <aside>
          <div className="lg:sticky-panel">
            <Suspense fallback={<div className="h-11 lg:h-64" />}>
              <AccountNav items={nav} />
            </Suspense>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </Container></Section>
    </div>
  );
}

export const RAC_NAV = [
  { href: "/minha-conta", label: "Visão geral" },
  { href: "/minha-conta/reservas", label: "As minhas reservas" },
  { href: "/minha-conta/perfil", label: "Dados pessoais" },
  { href: "/minha-conta/faturas", label: "Faturas" },
  { href: "/minha-conta/seguranca", label: "Segurança" },
];

export const TVDE_NAV = [
  { href: "/tvde/minha-conta", label: "Dashboard" },
  { href: "/tvde/minha-conta/candidaturas", label: "Candidaturas" },
  { href: "/tvde/minha-conta/perfil", label: "Perfil" },
  { href: "/tvde/minha-conta/suporte", label: "Suporte" },
];
