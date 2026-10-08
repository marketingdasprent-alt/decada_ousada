import { Check } from "lucide-react";

import { APPLICATION_STATUS_LABEL, type ApplicationStatus as Status } from "@/domain/application";
import type { PaymentStatus } from "@/domain/payment";
import { cn } from "@/lib/cn";

import { Badge } from "../shared/ui";

const TONE: Record<Status, "neutral" | "warn" | "info" | "ok" | "danger"> = {
  draft: "neutral",
  payment_pending: "warn",
  submitted: "info",
  under_review: "info",
  additional_documents_required: "warn",
  approved: "ok",
  rejected: "danger",
  cancelled: "neutral",
};

export function ApplicationStatusBadge({ status }: { status: Status }) {
  return <Badge tone={TONE[status]}>{APPLICATION_STATUS_LABEL[status]}</Badge>;
}

/** Pagamentos que chegaram a ser cobrados (mesmo que depois devolvidos). */
const CHARGED: PaymentStatus[] = ["paid", "refunded", "partially_refunded"];

/**
 * Linha temporal do processo TVDE (doc §49). O passo "Pagamento" vem do
 * pagamento real quando existe. Em mobile é vertical, para os rótulos não se
 * sobreporem; o estado de cada passo também está em texto.
 */
export function ApplicationTimeline({ status, paymentStatus }: { status: Status; paymentStatus?: PaymentStatus }) {
  const steps: Array<{ key: string; label: string }> = [
    { key: "registered", label: "Cadastro" },
    { key: "paid", label: "Pagamento" },
    { key: "review", label: "Análise" },
    { key: "decision", label: status === "rejected" ? "Não aprovada" : "Aprovação" },
    { key: "pickup", label: "Levantamento" },
  ];
  const reached: Record<Status, number> = {
    draft: 0,
    payment_pending: 1,
    submitted: 2,
    under_review: 2,
    additional_documents_required: 2,
    approved: 4,
    rejected: 3,
    cancelled: -1,
  };
  const idx = reached[status];
  const paid = paymentStatus ? CHARGED.includes(paymentStatus) : idx > 1;
  const decided = status === "approved" || status === "rejected";
  const doneAt = (i: number) => (i === 1 ? paid : i === 3 ? decided : i < idx);
  // Passo atual: o primeiro por fazer (nenhum numa candidatura cancelada ou recusada)
  const currentIdx = status === "cancelled" || status === "rejected" ? -1 : steps.findIndex((_, i) => !doneAt(i));

  return (
    <ol className="flex flex-col gap-3 sm:grid sm:grid-cols-5 sm:gap-2">
      {steps.map((s, i) => {
        const failed = status === "rejected" && i === 3;
        const done = doneAt(i) && !failed;
        const current = i === currentIdx;
        const state = failed ? "não aprovada" : done ? "concluído" : current ? "passo atual" : "por fazer";
        return (
          <li key={s.key} aria-current={current ? "step" : undefined} className="flex items-center gap-3 sm:flex-col sm:gap-0 sm:text-center">
            <span
              aria-hidden
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-pill text-caption font-bold",
                failed ? "bg-negative text-on-dark" : done ? "bg-panel-dark text-on-dark" : current ? "bg-brand text-on-brand ring-4 ring-brand/20" : "bg-panel-sunken text-copy-muted",
              )}
            >
              {done ? <Check className="size-4" /> : i + 1}
            </span>
            <span className={cn("text-body-small sm:mt-2 sm:text-caption", current || done || failed ? "font-semibold text-copy" : "text-copy-muted")}>
              {s.label}
              <span className="sr-only">, {state}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
