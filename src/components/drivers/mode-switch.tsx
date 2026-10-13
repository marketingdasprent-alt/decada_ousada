"use client";

import { useEffect } from "react";

import type { DriverMode } from "@/domain/drivers";
import { cn } from "@/lib/cn";

const MODES: Array<{ id: DriverMode; title: string; text: string }> = [
  { id: "aluguer", title: "Preciso de carro", text: "Alugo uma viatura vossa" },
  { id: "slot", title: "Tenho carro", text: "Trabalho como Slot" },
];

/** Âncoras que escolhem o formulário ao chegar (botões "Candidatar-me" da página). */
const HASH_MODE: Record<string, DriverMode> = { "#candidatura-aluguer": "aluguer", "#candidatura-slot": "slot" };

/** Os botões da página levam a #candidatura-aluguer / #candidatura-slot: escolhe o formulário certo. */
export function useModeFromHash(onMode: (mode: DriverMode) => void) {
  useEffect(() => {
    const sync = () => {
      const m = HASH_MODE[window.location.hash];
      if (m) onMode(m);
    };
    const first = window.setTimeout(sync, 0);
    window.addEventListener("hashchange", sync);
    return () => {
      window.clearTimeout(first);
      window.removeEventListener("hashchange", sync);
    };
  }, [onMode]);
}

/** A escolha que muda o formulário: com ou sem carro. */
export function ModeSwitch({ mode, onChange, labelId }: { mode: DriverMode; onChange: (mode: DriverMode) => void; labelId: string }) {
  return (
    <>
      <p className="font-semibold" id={labelId}>Como quer trabalhar?</p>
      <div className="mt-3 grid grid-cols-2 gap-3" role="group" aria-labelledby={labelId}>
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={mode === m.id}
            onClick={() => onChange(m.id)}
            className={cn(
              "rounded-panel border-2 px-4 py-3 text-left transition-colors",
              mode === m.id ? "border-brand bg-brand text-on-brand" : "border-line-strong bg-panel hover:border-copy",
            )}
          >
            <span className="display block text-h4">{m.title}</span>
            <span className="text-body-small">{m.text}</span>
          </button>
        ))}
      </div>
    </>
  );
}
