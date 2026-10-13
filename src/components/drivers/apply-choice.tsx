import { cn } from "@/lib/cn";

import { applyLink, opensNewTab } from "./apply-link";

/**
 * A escolha que leva ao formulário certo: "Preciso de carro" (Aluguer, TVDE GERAL) ou
 * "Tenho carro" (Slot). Usada no topo e na secção de candidatura de /motoristas; cada cartão
 * abre o formulário do WeGest (applyLink).
 */
export function ApplyChoice({ labelId, className }: { labelId: string; className?: string }) {
  return (
    <>
      <p className="font-semibold" id={labelId}>Como quer trabalhar?</p>
      <div className={cn("mt-3 grid max-w-xl grid-cols-2 gap-3", className)} role="group" aria-labelledby={labelId}>
        <a
          {...applyLink("aluguer")}
          className="rounded-panel bg-brand px-5 py-4 text-on-brand transition hover:-translate-y-1 hover:bg-brand-hover hover:shadow-floating motion-reduce:hover:translate-y-0"
        >
          <span className="display block text-h3">Preciso de carro</span>
          <span className="text-body-small">Alugo uma viatura vossa</span>
          {opensNewTab && <span className="sr-only">(abre noutro separador)</span>}
        </a>
        <a
          {...applyLink("slot")}
          className="rounded-panel border-2 border-copy bg-panel px-5 py-4 transition hover:-translate-y-1 hover:bg-panel-dark hover:text-on-dark hover:shadow-floating motion-reduce:hover:translate-y-0"
        >
          <span className="display block text-h3">Tenho carro</span>
          <span className="text-body-small">Trabalho como Slot</span>
          {opensNewTab && <span className="sr-only">(abre noutro separador)</span>}
        </a>
      </div>
    </>
  );
}
