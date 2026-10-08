import { CheckCircle2, Clock } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { ReservationStatus } from "@/components/booking/booking-status";
import { PendingPayment } from "@/components/payment/pending-payment";
import { EmptyState } from "@/components/shared/states";
import { TrackEvent } from "@/components/shared/track-event";
import { ButtonLink, Card, Container, Section, Skeleton } from "@/components/shared/ui";
import { formatMoney } from "@/domain/pricing";
import { formatDateTime } from "@/lib/dates";
import { getOwnBooking } from "@/lib/ownership";
import { firstParam } from "@/lib/search";
import { pendingPaymentFor } from "@/services/payments";

export const metadata: Metadata = { title: "Reserva recebida", robots: { index: false } };

export default function ConfirmacaoPage({ searchParams }: PageProps<"/[region]/rent-a-car/confirmacao">) {
  return (
    <Section><Container variant="narrow">
      <Suspense fallback={<Skeleton className="h-120" />}>
        <Confirmation searchParams={searchParams} />
      </Suspense>
    </Container></Section>
  );
}

async function Confirmation({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const id = firstParam((await searchParams).reserva);
  const own = id ? await getOwnBooking(id) : null;
  if (!own) return <EmptyState title="Reserva não encontrada" description="Inicie sessão com a conta usada na reserva." action={<ButtonLink href="/minha-conta/reservas">As minhas reservas</ButtonLink>} />;
  const { booking } = own;
  const pending = await pendingPaymentFor(booking.id);

  // Só se mostra "confirmada" quando o WeGest confirmou (doc §92)
  const confirmed = booking.status === "confirmed";
  const Icon = confirmed ? CheckCircle2 : Clock;

  return (
    <Card className="overflow-hidden">
      <TrackEvent name="rentacar_booking_completed" data={{ bookingId: booking.id, status: booking.status, total: booking.quote.total }} once={`booking:${booking.id}`} />
      <div className="bg-panel-dark p-8 text-center text-on-dark">
        <Icon className="mx-auto size-14 text-brand" aria-hidden />
        <h1 className="display mt-4 text-h1">{confirmed ? "Reserva confirmada" : "Pedido de reserva recebido"}</h1>
        <p className="mt-2 text-on-dark/70">
          {confirmed
            ? "Está tudo pronto. Até breve!"
            : pending
              ? "Falta concluir o pagamento. Depois, a equipa DÉCADA OUSADA confirma a sua reserva e recebe um email."
              : "A equipa DÉCADA OUSADA vai confirmar a sua reserva. Recebe um email assim que estiver confirmada."}
        </p>
      </div>
      {pending && <PendingPayment payment={pending} className="px-6 pt-6" />}
      <dl className="divide-y divide-line">
        <Row label="Reserva"><span className="font-bold tabular">{booking.reference}</span></Row>
        <Row label="Estado"><ReservationStatus status={booking.status} /></Row>
        <Row label="Viatura">{booking.vehicleName} <span className="text-copy-muted">ou similar</span></Row>
        <Row label="Levantamento">{booking.pickupLocation.name}, {formatDateTime(booking.pickupAt)}</Row>
        <Row label="Devolução">{booking.returnLocation.name}, {formatDateTime(booking.returnAt)}</Row>
        {booking.extras.length > 0 && <Row label="Extras">{booking.extras.map((e) => e.name).join(", ")}</Row>}
        {booking.coverageName && <Row label="Proteção">{booking.coverageName}</Row>}
        <Row label="Total"><span className="text-h4 font-bold tabular">{formatMoney(booking.quote.total, "EUR", { decimals: true })}</span></Row>
      </dl>
      <div className="flex flex-col gap-3 p-6 sm:flex-row">
        <ButtonLink href={`/minha-conta/reservas/${booking.id}`} className="sm:flex-1">Ver a minha reserva</ButtonLink>
        <ButtonLink href="/" variant="outline" className="sm:flex-1">Voltar ao início</ButtonLink>
      </div>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-label-value gap-4 px-6 py-3.5 text-body-small">
      <dt className="text-copy-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
