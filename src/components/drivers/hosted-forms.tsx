import { ApplyChoice } from "./apply-choice";
import { opensNewTab } from "./apply-link";

/**
 * Secção de candidatura com os botões diretos para os formulários do WeGest (os mesmos do
 * topo). Usada com DRIVER_FORM_KIND = "links", e com "site" enquanto a ligação dos leads ao
 * WeGest não está configurada.
 */
export function HostedForms() {
  return (
    <div className="rounded-panel border border-line bg-panel p-6 sm:p-8">
      <ApplyChoice labelId="candidatura-modalidade" className="max-w-none" />
      {opensNewTab && <p className="mt-4 text-body-small text-copy-muted">O formulário abre noutro separador, no sistema de gestão da DÉCADA OUSADA. São cerca de 2 minutos.</p>}
    </div>
  );
}
