import { Landmark, Smartphone } from "lucide-react";

import type { Payment } from "@/domain/payment";
import { formatMoney } from "@/domain/pricing";
import { formatDateTime } from "@/lib/dates";

/** Telemóvel com os últimos 3 dígitos visíveis. */
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 3 ? `••• ••• ${digits.slice(-3)}` : phone;
}

/**
 * "Falta pagar": referência Multibanco ou pedido MB WAY de um pagamento
 * pendente. Os valores vêm do fornecedor de pagamentos, nunca do browser.
 */
export function PendingPayment({ payment, className }: { payment: Payment; className?: string }) {
  const info = payment.instructions;
  if (!info) return null;
  const multibanco = info.kind === "multibanco";
  const Icon = multibanco ? Landmark : Smartphone;

  return (
    <section aria-labelledby="falta-pagar" className={className}>
      <div className="rounded-card border border-caution/25 bg-caution-surface p-5">
        <h2 id="falta-pagar" className="flex items-center gap-2 font-bold">
          <Icon className="size-5 text-caution" aria-hidden /> {multibanco ? "Falta pagar por Multibanco" : "Aprove o pagamento no MB WAY"}
        </h2>
        {info.kind === "multibanco" ? (
          <>
            <p className="mt-1 text-body-small text-copy-secondary">
              Pague no multibanco ou no homebanking até {formatDateTime(info.expiresAt)}. Depois dessa data a referência deixa de ser válida.
            </p>
            <dl className="mt-4 grid grid-cols-3 gap-3">
              {[
                ["Entidade", info.entity],
                ["Referência", info.reference],
                ["Valor", formatMoney(info.amount, payment.currency, { decimals: true })],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-caption text-copy-muted">{label}</dt>
                  <dd className="text-h4 font-bold tabular">{value}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <p className="mt-1 text-body-small text-copy-secondary">
            Enviámos um pedido de {formatMoney(payment.amount, payment.currency, { decimals: true })} para o telemóvel {maskPhone(info.phone)}. Abra a app MB WAY e aprove até {formatDateTime(info.expiresAt)}.
          </p>
        )}
      </div>
    </section>
  );
}
