"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/cn";
import { driverAuthEnabled } from "@/lib/driver-account";

import { Button } from "../shared/ui";

/** Conta de motorista: termina também a sessão WeGest guardada no browser. */
function signOutDriverAccount() {
  if (driverAuthEnabled()) void import("@/lib/driver-auth-client").then((m) => m.driverAuth().auth.signOut({ scope: "local" }));
}

/** Botão com contorno e estado de espera: o clique tem resposta visível até a sessão terminar. */
function SignOutButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" loading={pending} className="tap-target w-full hover:bg-panel-sunken active:translate-y-px">
      {!pending && <LogOut className="size-4" aria-hidden />}
      {pending ? "A terminar sessão" : "Terminar sessão"}
    </Button>
  );
}

export type NavSection = { label?: string; items: Array<{ href: string; label: string }> };

export function AccountNav({ sections }: { sections: NavSection[] }) {
  const pathname = usePathname();
  // O proxy reescreve /x para /<região>/x: comparar só o sufixo público
  const current = pathname.replace(/^\/(mainland|azores)/, "") || "/";
  const home = sections[0]?.items[0]?.href;
  // Em telemóvel a barra rola na horizontal: traz o item ativo para dentro do ecrã, sem mexer na página
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>("[aria-current=page]");
    if (nav && active && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = active.offsetLeft - nav.offsetLeft - 16;
  }, [current]);
  return (
    <nav ref={navRef} aria-label="A minha conta" className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:px-0">
      {sections.map((section) => [
        // Em telemóvel a barra é uma linha só: o título do grupo fica para o desktop
        section.label && (
          <p key={section.label} className="hidden px-3.5 pb-1 pt-4 text-caption font-semibold uppercase text-copy-muted lg:block">{section.label}</p>
        ),
        ...section.items.map((item) => {
          const active = item.href === current || (item.href !== home && current.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "tap-target shrink-0 rounded-control px-3.5 py-2.5 text-body-small font-medium transition-colors",
                active ? "bg-panel-dark text-on-dark" : "text-copy-secondary hover:bg-panel-sunken",
              )}
            >
              {item.label}
            </Link>
          );
        }),
      ])}
      <form action={logoutAction} onSubmit={signOutDriverAccount} className="shrink-0 lg:mt-4 lg:border-t lg:border-line lg:pt-4">
        <SignOutButton />
      </form>
    </nav>
  );
}
