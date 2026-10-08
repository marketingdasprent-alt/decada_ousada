"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Region } from "@/domain/region";
import { useFocusTrap } from "@/lib/use-focus-trap";

import { RegionSwitch } from "./region-switch";

export function MobileMenu({ nav, region, regionHrefs }: { nav: Array<{ href: string; label: string }>; region: Region; regionHrefs: Record<Region, string> }) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  // O painel fica abaixo do cabeçalho: o botão de fechar continua no ciclo de Tab
  useFocusTrap({ open, onClose: () => setOpen(false), container: panel, trigger: toggle, includeTrigger: true });
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={toggle}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="menu-movel"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        className="flex size-11 items-center justify-center rounded-control text-on-dark hover:bg-on-dark/10"
      >
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>
      {open && (
        <div ref={panel} id="menu-movel" className="fixed inset-x-0 top-16 bottom-0 z-overlay flex flex-col overflow-y-auto bg-panel-dark px-4 pb-10 pt-4 sm:top-18">
          <RegionSwitch current={region} hrefs={regionHrefs} className="mb-4 self-start" />
          <nav aria-label="Menu móvel" className="flex flex-col">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="display border-b border-on-dark/10 py-4 text-h2 text-on-dark">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
