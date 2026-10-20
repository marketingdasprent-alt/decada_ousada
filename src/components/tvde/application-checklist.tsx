import { FileText } from "lucide-react";

import type { ApplicationForm } from "@/domain/application";
import { formatMoney } from "@/domain/pricing";
import { cn } from "@/lib/cn";

const FORMAT_LABEL: Record<string, string> = { "application/pdf": "PDF", "image/jpeg": "JPG", "image/png": "PNG" };

/**
 * "Vai precisar de": o que o motorista tem de ter à mão antes de começar.
 * Documentos vêm da ficha da API (getApplicationForm), nunca de uma lista fixa.
 */
export function ApplicationChecklist({
  form,
  reservationAmount,
  className,
}: {
  form: ApplicationForm;
  /** Sinal pago no fim da candidatura, quando existe. */
  reservationAmount?: number;
  className?: string;
}) {
  const docs = form.documents.filter((d) => d.required);
  const formats = [...new Set(docs.flatMap((d) => d.accept.map((a) => FORMAT_LABEL[a] ?? a)))];
  const maxMb = Math.max(0, ...docs.map((d) => d.maxSizeMb));
  // Sem documentos nem sinal, a caixa não teria nada para dizer
  if (docs.length === 0 && !reservationAmount) return null;

  return (
    <section aria-labelledby="vai-precisar" className={cn("rounded-card border border-line bg-panel-alt p-5", className)}>
      <h2 id="vai-precisar" className="font-bold">Vai precisar de</h2>
      {docs.length > 0 && (
        <ul className="mt-3 space-y-2 text-body-small">
          {docs.map((d) => (
            <li key={d.type} className="flex items-start gap-2">
              <FileText className="mt-0.5 size-4 shrink-0 text-copy-muted" aria-hidden />
              <span>{d.label}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-body-small text-copy-secondary">
        {docs.length > 0 && formats.length > 0 && <>Fotografia ou digitalização em {formats.join(", ")}{maxMb ? `, até ${maxMb} MB cada` : ""}. </>}
        {reservationAmount ? `No fim paga o sinal de ${formatMoney(reservationAmount)}, descontado na caução no levantamento.` : ""}
      </p>
    </section>
  );
}
