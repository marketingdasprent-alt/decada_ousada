import { FileText } from "lucide-react";

import type { ApplicationForm } from "@/domain/application";
import { formatMoney } from "@/domain/pricing";
import { cn } from "@/lib/cn";

const FORMAT_LABEL: Record<string, string> = { "application/pdf": "PDF", "image/jpeg": "JPG", "image/png": "PNG" };

/**
 * "Vai precisar de": o que o motorista tem de ter à mão antes de começar.
 * Documentos e campos vêm da ficha da API (getApplicationForm), nunca de uma lista fixa.
 */
export function ApplicationChecklist({
  form,
  reservationAmount,
  filled = 0,
  className,
}: {
  form: ApplicationForm;
  /** Sinal pago no fim da candidatura, quando existe. */
  reservationAmount?: number;
  /** Campos já preenchidos com dados da conta. */
  filled?: number;
  className?: string;
}) {
  const docs = form.documents.filter((d) => d.required);
  const toFill = Math.max(0, form.fields.length - filled);
  const formats = [...new Set(docs.flatMap((d) => d.accept.map((a) => FORMAT_LABEL[a] ?? a)))];
  const maxMb = Math.max(0, ...docs.map((d) => d.maxSizeMb));

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
        {filled > 0
          ? `Faltam ${toFill} ${toFill === 1 ? "campo" : "campos"} no cadastro; os outros já vêm da sua conta.`
          : `O cadastro tem ${form.fields.length} ${form.fields.length === 1 ? "campo" : "campos"}.`}
        {reservationAmount ? ` No fim paga o sinal de ${formatMoney(reservationAmount)}.` : ""}
      </p>
    </section>
  );
}
