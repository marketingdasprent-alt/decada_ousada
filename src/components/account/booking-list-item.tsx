import { ChevronRight } from "lucide-react";
import Link from "next/link";

import type { Booking } from "@/domain/booking";
import { formatMoney } from "@/domain/pricing";
import { formatDateShort, formatTime } from "@/lib/dates";

import { ReservationStatus } from "../booking/booking-status";

/** O que a linha mostra: uma Booking completa ou uma reserva da conta WeGest (sem devolução ou total em aberto). */
export type BookingListEntry = Pick<Booking, "id" | "reference" | "status" | "vehicleName" | "pickupAt"> & {
  returnAt: string | null;
  pickupLocation: { name: string };
  quote: { total: number | null };
};

export function BookingListItem({ booking }: { booking: BookingListEntry }) {
  return (
    <Link href={`/minha-conta/reservas/${booking.id}`} className="flex items-center gap-4 rounded-panel border border-line bg-panel p-4 transition-colors hover:border-copy/25 sm:p-5">
      <div className="hidden w-16 shrink-0 rounded-card bg-panel-alt py-2 text-center sm:block">
        <p className="display text-h3 leading-none">{booking.pickupAt.slice(8, 10)}</p>
        <p className="mt-1 text-caption uppercase text-copy-muted">{formatDateShort(booking.pickupAt).split(" ")[1]}</p>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold">{booking.vehicleName}</p>
          <ReservationStatus status={booking.status} />
        </div>
        <p className="mt-1 text-body-small text-copy-secondary">
          {formatDateShort(booking.pickupAt)} {formatTime(booking.pickupAt)} → {booking.returnAt ? `${formatDateShort(booking.returnAt)} ${formatTime(booking.returnAt)}` : "devolução por marcar"}{booking.pickupLocation.name ? `, ${booking.pickupLocation.name}` : ""}
        </p>
        <p className="mt-0.5 text-caption text-copy-muted">Reserva {booking.reference}</p>
      </div>
      {booking.quote.total !== null && <p className="hidden font-bold tabular sm:block">{formatMoney(booking.quote.total, "EUR", { decimals: true })}</p>}
      <ChevronRight className="size-5 shrink-0 text-copy-muted" aria-hidden />
    </Link>
  );
}
