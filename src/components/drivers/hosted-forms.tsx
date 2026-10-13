import { DRIVER_FORMS } from "@/domain/drivers";

import { buttonClass } from "../shared/ui";

/**
 * Alternativa aos formulários do site enquanto a ligação dos leads ao WeGest não está
 * configurada (WEGEST_LEADS_URL / WEGEST_LEADS_KEY): os formulários alojados no WeGest,
 * noutro separador (o WeGest não deixa incorporá-los).
 */
export function HostedForms() {
  return (
    <div className="rounded-panel border border-line bg-panel p-6 sm:p-8">
      <p className="font-semibold">Como quer trabalhar?</p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <a href={DRIVER_FORMS.aluguer} target="_blank" rel="noopener noreferrer" className={buttonClass("primary", "lg")}>
          Preciso de carro
          <span className="sr-only">(abre noutro separador)</span>
        </a>
        <a href={DRIVER_FORMS.slot} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "lg")}>
          Tenho carro (Slot)
          <span className="sr-only">(abre noutro separador)</span>
        </a>
      </div>
      <p className="mt-3 text-body-small text-copy-muted">O formulário abre noutro separador, no sistema de gestão da DÉCADA OUSADA.</p>
    </div>
  );
}
