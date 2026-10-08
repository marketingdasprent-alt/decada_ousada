import { UserRound } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import type { Region } from "@/domain/region";
import { regionSwitchHref } from "@/lib/region";
import { getSession } from "@/services/auth";

import { Container } from "../shared/ui";
import { Logo } from "../shared/logo";
import { MobileMenu } from "./mobile-menu";
import { RegionSwitch } from "./region-switch";

export const NAV = [
  { href: "/rent-a-car", label: "Rent a Car" },
  { href: "/tvde", label: "TVDE" },
  { href: "/perguntas-frequentes", label: "Perguntas frequentes" },
  { href: "/contactos", label: "Contactos" },
];

async function AccountLink() {
  const session = await getSession();
  const hasTvde = session?.integrations.some((i) => i.customerType === "tvde");
  const hasRac = session?.integrations.some((i) => i.customerType === "rentacar");
  const href = session ? (hasTvde && !hasRac ? "/tvde/minha-conta" : "/minha-conta") : "/entrar";
  return (
    <Link href={href} className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-control border border-on-dark/15 px-3 text-body-small font-medium text-on-dark transition-colors hover:border-on-dark/40">
      <UserRound className="size-4" aria-hidden />
      <span className="hidden sm:inline">{session ? (session.user.name?.split(" ")[0] ?? "A minha conta") : "Entrar"}</span>
    </Link>
  );
}

export function SiteHeader({ region }: { region: Region }) {
  const regionHrefs: Record<Region, string> = { mainland: regionSwitchHref("mainland"), azores: regionSwitchHref("azores") };
  return (
    <header className="sticky top-0 z-header bg-panel-dark text-on-dark">
      <Container className="flex h-header items-center gap-6">
        {/* O PNG do cliente tem margem à volta: em desktop precisa de 64 px de altura para o lettering ler */}
        <Logo region={region} variant="dark" className="h-12 sm:h-14 lg:h-16" priority />
        <nav aria-label="Principal" className="hidden flex-1 items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-control px-3 py-2 text-body font-medium text-on-dark/80 transition-colors hover:bg-on-dark/5 hover:text-on-dark">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {/* Em mobile o seletor está no menu e na hero da página inicial */}
          <RegionSwitch current={region} hrefs={regionHrefs} className="hidden sm:flex" />
          <Suspense fallback={<div className="h-11 w-11 rounded-control border border-on-dark/15 sm:w-24" />}>
            <AccountLink />
          </Suspense>
          <MobileMenu nav={NAV} region={region} regionHrefs={regionHrefs} />
        </div>
      </Container>
    </header>
  );
}
