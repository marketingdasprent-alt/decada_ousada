import { Suspense, type ReactNode } from "react";

import { getSession, hasTvdeAccess } from "@/services/auth";

import { Container, Section } from "../shared/ui";
import { AccountNav, type NavSection } from "./account-nav";

const ACCOUNT_NAV: NavSection = {
  items: [
    { href: "/minha-conta", label: "Visão geral" },
    { href: "/minha-conta/reservas", label: "As minhas reservas" },
    { href: "/minha-conta/perfil", label: "Dados pessoais" },
    { href: "/minha-conta/faturas", label: "Faturas" },
    { href: "/minha-conta/seguranca", label: "Segurança" },
  ],
};

/** Só para quem tem acesso TVDE (hasTvdeAccess): o motorista vê também a parte Rent a Car. */
const TVDE_NAV: NavSection = {
  label: "TVDE",
  items: [
    { href: "/tvde/minha-conta/candidaturas", label: "Candidatura TVDE" },
    { href: "/tvde/minha-conta/suporte", label: "Suporte TVDE" },
  ],
};

async function Nav() {
  const session = await getSession();
  return <AccountNav sections={hasTvdeAccess(session) ? [ACCOUNT_NAV, TVDE_NAV] : [ACCOUNT_NAV]} />;
}

/** Painel único da conta: Rent a Car para todos, TVDE só para motoristas. */
export function AccountShell({ children }: { children: ReactNode }) {
  return (
    <div>
      {/* Espaço de trabalho: banda compacta e clara, sem elementos de marketing */}
      <div className="border-b border-line bg-panel py-5">
        <Container>
          <h1 className="text-h3 font-bold">A minha conta</h1>
        </Container>
      </div>
      <Section variant="compact"><Container className="grid grid-cols-1 gap-8 lg:grid-nav-main">
        <aside>
          <div className="lg:sticky-panel">
            <Suspense fallback={<div className="h-11 lg:h-64" />}>
              <Nav />
            </Suspense>
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </Container></Section>
    </div>
  );
}
