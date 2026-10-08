"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/cn";

export function AccountNav({ items }: { items: Array<{ href: string; label: string }> }) {
  const pathname = usePathname();
  // O proxy reescreve /x para /<região>/x: comparar só o sufixo público
  const current = pathname.replace(/^\/(mainland|azores)/, "") || "/";
  return (
    <nav aria-label="Área de cliente" className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:px-0">
      {items.map((item) => {
        const active = item.href === current || (item.href !== items[0].href && current.startsWith(item.href));
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
      })}
      <form action={logoutAction} className="shrink-0 lg:mt-4 lg:border-t lg:border-line lg:pt-4">
        <button type="submit" className="tap-target gap-2 rounded-control px-3.5 py-2.5 text-body-small font-medium text-copy-secondary hover:bg-panel-sunken">
          <LogOut className="size-4" aria-hidden /> Terminar sessão
        </button>
      </form>
    </nav>
  );
}
