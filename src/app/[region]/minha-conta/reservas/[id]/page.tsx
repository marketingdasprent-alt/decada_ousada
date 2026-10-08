import { ArrowLeft, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CancelBooking } from "@/components/account/cancel-booking";
import { ReservationStatus } from "@/components/booking/booking-status";
import { PendingPayment } from "@/components/payment/pending-payment";
import { ContactValue } from "@/components/shared/pending";
import { Notice } from "@/components/shared/states";
import { Card, Skeleton } from "@/components/shared/ui";
import { PAYMENT_STATUS_LABEL } from "@/domain/payment";
import { formatMoney } from "@/domain/pricing";
import { REGION_CONFIG } from "@/domain/region";
import { formatDateTime } from "@/lib/dates";
import { requireSession } from "@/lib/guard";
import { getOwnBooking } from "@/lib/ownership";
import { pendingPaymentFor } from "@/services/payments";

export const metadata: Metadata = { title: "Detalhe da reserva" };

export default function BookingDetailPage({ params }: PageProps<"/[region]/minha-conta/reservas/[id]">) {
  return (
    <Suspense fallback={<Skeleton className="h-130" />}>
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireSession(`/minha-conta/reservas/${id}`);
  const own = await getOwnBooking(id);
  if (!own) notFound();
  const b = own.booking;
  const contact = REGION_CONFIG[b.region].contact;
  // O estado do pagamento vem do fornecedor de pagamentos, não do WeGest
  const pending = await pendingPaymentFor(b.id);

  return (
    <div className="space-y-6">
      <Link href="/minha-conta/reservas" className="inline-flex items-center gap-1.5 text-body-small font-medium text-copy-secondary hover:text-copy max-md:min-h-(--layout-tap)">
        <ArrowLeft className="size-4" aria-hidden /> As minhas reservas
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-h3 font-bold">Reserva {b.reference}</h2>
        <ReservationStatus status={b.status} />
      </div>
      {b.status === "pending" && (
        <Notice title="A aguardar confirmação">A equipa DÉCADA OUSADA está a confirmar a disponibilidade da viatura. Recebe um email quando estiver confirmada.</Notice>
      )}

      {pending && <PendingPayment payment={pending} />}

      <Card>
        <dl className="divide-y divide-line">
          {[
            ["Viatura", `${b.vehicleName} ou similar`],
            ["Levantamento", `${b.pickupLocation.name}, ${formatDateTime(b.pickupAt)}`],
            ["Devolução", `${b.returnLocation.name}, ${formatDateTime(b.returnAt)}`],
            ["Proteção", b.coverageName],
            ["Extras", b.extras.length ? b.extras.map((e) => `${e.name}${e.quantity > 1 ? ` × ${e.quantity}` : ""}`).join(", ") : "Nenhum"],
            ["Condutores", b.drivers?.join(", ")],
            ["Pagamento", pending ? PAYMENT_STATUS_LABEL.pending : b.paymentStatus ? PAYMENT_STATUS_LABEL[b.paymentStatus] : undefined],
            ["Mensagem", b.message],
          ]
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="grid gap-1 px-5 py-3.5 text-body-small sm:grid-label-value">
                <dt className="text-copy-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
        </dl>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold">Preço</h3>
        <ul className="mt-3 space-y-2 text-body-small">
          {b.quote.lines.map((l) => (
            <li key={l.id} className="flex justify-between gap-4"><span className="text-copy-secondary">{l.label}</span><span className="tabular">{formatMoney(l.amount, "EUR", { decimals: true })}</span></li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-line pt-4">
          <span className="font-semibold">Total</span>
          <span className="text-h4 font-bold tabular">{formatMoney(b.quote.total, "EUR", { decimals: true })}</span>
        </div>
      </Card>

      <div className="flex flex-wrap items-start justify-between gap-6">
        {b.canCancel ? <CancelBooking bookingId={b.id} /> : (
          b.status !== "cancelled" && <p className="text-body text-copy-secondary">Para alterar ou cancelar esta reserva, contacte a nossa equipa.</p>
        )}
        <p className="flex items-center gap-2 text-body-small font-medium text-copy-secondary">
          <Phone className="size-4" aria-hidden /> <ContactValue kind="phone" value={contact.phone} className="hover:text-copy" />
        </p>
      </div>
    </div>
  );
}
