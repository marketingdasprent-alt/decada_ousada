"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { DriverMode } from "@/domain/drivers";
import { useFocusTrap } from "@/lib/use-focus-trap";

import { DriverFormEmbed } from "./driver-form-embed";

const isMode = (v: string | undefined): v is DriverMode => v === "aluguer" || v === "slot";

/**
 * Popup da candidatura (pedido da equipa, 2026-10-13): os botões da página com
 * `data-candidatura="aluguer|slot"` abrem aqui o formulário do WeGest, em vez de levarem a
 * outra secção. Sem JavaScript, o link do botão continua a levar à secção do formulário.
 * Esc ou o fundo fecham; o foco fica no popup e volta ao botão que o abriu.
 */
export function DriverApplyDialog() {
  const [mode, setMode] = useState<DriverMode | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const open = mode !== null;

  useFocusTrap({ open, onClose: () => setMode(null), container: panel, trigger });

  // Um só ouvinte para todos os botões da página (ficam em componentes do servidor)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-candidatura]");
      const m = el?.dataset.candidatura;
      if (!el || !isMode(m)) return;
      e.preventDefault();
      trigger.current = el;
      setMode(m);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // A página por trás não faz scroll enquanto o popup está aberto
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  if (!mode) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="candidatura-popup-titulo">
      <button type="button" tabIndex={-1} aria-label="Fechar candidatura" className="absolute inset-0 cursor-default bg-overlay" onClick={() => setMode(null)} />
      <div ref={panel} className="relative flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-t-panel bg-panel shadow-overlay sm:rounded-panel">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 sm:px-6">
          <h2 id="candidatura-popup-titulo" className="display text-h3">{mode === "aluguer" ? "Preciso de carro" : "Tenho carro"}</h2>
          <button
            type="button"
            onClick={() => setMode(null)}
            aria-label="Fechar candidatura"
            className="flex size-11 items-center justify-center rounded-control hover:bg-panel-sunken"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto">
          <DriverFormEmbed key={mode} initialMode={mode} inDialog />
        </div>
      </div>
    </div>
  );
}
