"use client";

import { ArrowLeft, CheckCircle2, Clock, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { BookingStatus } from "@/domain/booking";
import type { AccountBooking } from "@/domain/customer/account";
import { formatMoney } from "@/domain/pricing";
import { REGION_CONFIG, type Region } from "@/domain/region";
import { accountFetch } from "@/lib/account-fetch";
import { cn } from "@/lib/cn";
import { formatDateTime, fromApiDateTime } from "@/lib/dates";
import { signOutDriver } from "@/lib/driver-auth-client";

import { ReservationStatus } from "../booking/booking-status";
import { ContactValue } from "../shared/pending";
import { EmptyState, Notice } from "../shared/states";
import { TrackEvent } from "../shared/track-event";
import { Button, ButtonLink, Card, Skeleton } from "../shared/ui";
import { AccountApplicationSummary } from "../tvde/account-application";
import { AccountShortcuts } from "./account-shortcuts";
import { BookingListItem, type BookingListEntry } from "./booking-list-item";

/**
 * Reservas Rent a Car das contas WeGest, lidas no browser em GET /api/account/bookings (GET /conta/reservas).
 * O WeGest devolve só as da ficha ligada à conta: é ele que decide quem é dono de cada reserva.
 */
const STATUS: Record<AccountBooking["estado"], BookingStatus> = {
  pendente: "pending",
  confirmada: "confirmed",
  em_curso: "in_progress",
  concluida: "completed",
  cancelada: "cancelled",
  expirada: "expired",
};

const vehicleName = (r: AccountBooking) => (r.modelo ? `${r.modelo.marca} ${r.modelo.modelo}` : "Viatura a atribuir");

function toEntry(r: AccountBooking, region: Region): BookingListEntry {
  return {
    id: String(r.codigo),
    reference: String(r.codigo),
    status: STATUS[r.estado],
    vehicleName: vehicleName(r),
    pickupAt: fromApiDateTime(r.inicio, region),
    returnAt: r.fim ? fromApiDateTime(r.fim, region) : null,
    pickupLocation: { name: r.estacoes.entrega ?? "" },
    quote: { total: r.total?.com_iva ?? null },
  };
}

type State = { bookings: AccountBooking[] | null; error: boolean; expired: boolean; reload: () => void };

function useAccountBookings(): State {
  const [bookings, setBookings] = useState<AccountBooking[] | null>(null);
  const [error, setError] = useState(false);
  const [expired, setExpired] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    accountFetch("/api/account/bookings").then(async (response) => {
      const body = await response.json().catch(() => null);
      if (!active) return;
      if (response.status === 401) { await signOutDriver(); setExpired(true); return; }
      if (!response.ok || !Array.isArray(body?.data)) { setError(true); return; }
      setBookings(body.data);
    }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [retry]);
  return { bookings, error, expired, reload: () => { setError(false); setBookings(null); setRetry((value) => value + 1); } };
}

/** Sessão expirada, erro ou a carregar. null quando as reservas já chegaram. */
function Status({ state, next, loading }: { state: State; next: string; loading: React.ReactNode }) {
  if (state.expired) return <Notice tone="warn">A sessão terminou. <ButtonLink href={`/entrar?next=${encodeURIComponent(next)}`} size="sm" className="mt-3">Entrar novamente</ButtonLink></Notice>;
  if (state.error) return <Notice tone="danger">Não foi possível carregar as reservas. Tente novamente.<Button variant="outline" size="sm" className="mt-3" onClick={state.reload}>Tentar novamente</Button></Notice>;
  if (!state.bookings) return <div role="status" aria-label="A carregar reservas">{loading}</div>;
  return null;
}

const CLOSED: BookingStatus[] = ["cancelled", "expired", "completed", "no_show"];

function groups(entries: BookingListEntry[], region: Region) {
  const now = fromApiDateTime(new Date().toISOString(), region);
  // Sem devolução marcada, a reserva conta como próxima enquanto não for fechada pela equipa
  const ahead = (b: BookingListEntry) => (b.returnAt ?? b.pickupAt) >= now || !b.returnAt;
  return {
    proximas: entries.filter((b) => !CLOSED.includes(b.status) && ahead(b)).sort((a, b) => a.pickupAt.localeCompare(b.pickupAt)),
    anteriores: entries.filter((b) => b.status === "completed" || b.status === "no_show" || (b.status !== "cancelled" && b.status !== "expired" && !ahead(b))),
    canceladas: entries.filter((b) => b.status === "cancelled" || b.status === "expired"),
  };
}

const TABS = [
  { id: "proximas", label: "Próximas" },
  { id: "anteriores", label: "Anteriores" },
  { id: "canceladas", label: "Canceladas" },
] as const;
export type BookingsTab = (typeof TABS)[number]["id"];

export function WeGestBookings({ region, tab }: { region: Region; tab: BookingsTab }) {
  const state = useAccountBookings();
  const status = <Status state={state} next="/minha-conta/reservas" loading={<Skeleton className="h-64" />} />;
  if (!state.bookings) return <div className="mt-6">{status}</div>;
  const all = groups(state.bookings.map((r) => toEntry(r, region)), region);
  const list = all[tab] ?? all.proximas;
  return (
    <>
      <div role="tablist" className="mt-6 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <Link
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            href={`/minha-conta/reservas?tab=${t.id}`}
            className={cn("-mb-px border-b-2 px-4 py-2.5 text-body-small font-medium", tab === t.id ? "border-selected text-copy" : "border-transparent text-copy-muted hover:text-copy")}
          >
            {t.label} <span className="tabular text-copy-muted">({all[t.id].length})</span>
          </Link>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {list.length ? list.map((b) => <BookingListItem key={b.id} booking={b} />) : (
          <EmptyState title="Sem reservas nesta lista" action={tab === "proximas" ? <ButtonLink href="/rent-a-car">Nova reserva</ButtonLink> : undefined} />
        )}
      </div>
    </>
  );
}

/** Visão geral do painel único. `tvde`: só para quem tem acesso TVDE (hasTvdeAccess). */
export function WeGestAccountHome({ region, name, tvde }: { region: Region; name?: string; tvde: { mock: boolean } | null }) {
  const state = useAccountBookings();
  // Conta só de motorista: sem ficha de cliente não há nome na sessão, vem da candidatura
  const [applicationName, setApplicationName] = useState<string>();
  const first = name ?? applicationName?.split(" ")[0];
  const next = state.bookings ? groups(state.bookings.map((r) => toEntry(r, region)), region).proximas[0] : undefined;
  const count = state.bookings?.length;
  return (
    <div className="space-y-10">
      <h2 className="text-h2 font-bold">{first ? `Olá, ${first}.` : "Visão geral"}</h2>
      {tvde && <AccountApplicationSummary mock={tvde.mock} onName={setApplicationName} />}
      <section aria-labelledby="proxima">
        <h3 id="proxima" className="mb-4 text-body-large font-bold">Próxima reserva</h3>
        <Status state={state} next="/minha-conta" loading={<Skeleton className="h-24" />} />
        {state.bookings && (next ? <BookingListItem booking={next} /> : (
          <EmptyState title={count ? "Sem reservas futuras" : "Ainda não tem reservas Rent a Car"} description={count ? undefined : "Quando fizer a primeira reserva, ela aparece aqui."} action={<ButtonLink href="/rent-a-car">{count ? "Nova reserva" : "Pesquisar viaturas"}</ButtonLink>} />
        ))}
      </section>
      <AccountShortcuts bookingsText={count === undefined ? "Ver reservas" : `${count} no total`} />
    </div>
  );
}

function Rows({ rows }: { rows: Array<[string, string | null | undefined]> }) {
  return (
    <dl className="divide-y divide-line">
      {rows.filter(([, value]) => value).map(([label, value]) => (
        <div key={label} className="grid gap-1 px-5 py-3.5 text-body-small sm:grid-label-value">
          <dt className="text-copy-muted">{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function bookingRows(r: AccountBooking, region: Region): Array<[string, string | null | undefined]> {
  return [
    ["Viatura", r.modelo ? `${vehicleName(r)} ou similar` : vehicleName(r)],
    ["Matrícula", r.matricula],
    ["Levantamento", [r.estacoes.entrega, formatDateTime(fromApiDateTime(r.inicio, region))].filter(Boolean).join(", ")],
    ["Devolução", r.fim ? [r.estacoes.recolha ?? r.estacoes.entrega, formatDateTime(fromApiDateTime(r.fim, region))].filter(Boolean).join(", ") : "Por marcar"],
    ["Duração", r.dias ? `${r.dias} ${r.dias === 1 ? "dia" : "dias"}` : null],
  ];
}

const useBooking = (state: State, codigo: string) => state.bookings?.find((r) => String(r.codigo) === codigo);

export function WeGestBookingDetail({ region, codigo }: { region: Region; codigo: string }) {
  const state = useAccountBookings();
  const booking = useBooking(state, codigo);
  const contact = REGION_CONFIG[region].contact;
  const back = (
    <Link href="/minha-conta/reservas" className="inline-flex items-center gap-1.5 text-body-small font-medium text-copy-secondary hover:text-copy max-md:min-h-(--layout-tap)">
      <ArrowLeft className="size-4" aria-hidden /> As minhas reservas
    </Link>
  );
  if (!state.bookings) return <div className="space-y-6">{back}<Status state={state} next={`/minha-conta/reservas/${codigo}`} loading={<Skeleton className="h-130" />} /></div>;
  if (!booking) return <div className="space-y-6">{back}<EmptyState title="Reserva não encontrada" description="Esta reserva não está ligada à conta com que entrou." /></div>;
  const status = STATUS[booking.estado];

  return (
    <div className="space-y-6">
      {back}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-h3 font-bold">Reserva {booking.codigo}</h2>
        <ReservationStatus status={status} />
      </div>
      {status === "pending" && (
        <Notice title="A aguardar confirmação">A equipa DÉCADA OUSADA está a confirmar a disponibilidade da viatura. O estado atualiza-se nesta página.</Notice>
      )}
      <Card><Rows rows={bookingRows(booking, region)} /></Card>
      {booking.total && (
        <Card className="p-5">
          <h3 className="font-semibold">Preço</h3>
          <ul className="mt-3 space-y-2 text-body-small">
            <li className="flex justify-between gap-4"><span className="text-copy-secondary">Sem IVA</span><span className="tabular">{formatMoney(booking.total.sem_iva, "EUR", { decimals: true })}</span></li>
            <li className="flex justify-between gap-4"><span className="text-copy-secondary">IVA ({booking.total.iva}%)</span><span className="tabular">{formatMoney(booking.total.com_iva - booking.total.sem_iva, "EUR", { decimals: true })}</span></li>
          </ul>
          <div className="mt-4 flex justify-between border-t border-line pt-4">
            <span className="font-semibold">Total</span>
            <span className="text-h4 font-bold tabular">{formatMoney(booking.total.com_iva, "EUR", { decimals: true })}</span>
          </div>
        </Card>
      )}
      <div className="flex flex-wrap items-start justify-between gap-6">
        {booking.pode_cancelar ? <CancelAccountBooking codigo={booking.codigo} onCancelled={state.reload} /> : (
          status !== "cancelled" && status !== "expired" && <p className="text-body text-copy-secondary">Para alterar ou cancelar esta reserva, contacte a nossa equipa.</p>
        )}
        <p className="flex items-center gap-2 text-body-small font-medium text-copy-secondary">
          <Phone className="size-4" aria-hidden /> <ContactValue kind="phone" value={contact.phone} className="inline-flex items-center hover:text-copy max-md:min-h-(--layout-tap)" />
        </p>
      </div>
    </div>
  );
}

function CancelAccountBooking({ codigo, onCancelled }: { codigo: number; onCancelled: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setLoading(true);
    setError(null);
    try {
      const response = await accountFetch(`/api/account/bookings/${codigo}`, 20_000, "DELETE");
      const body = await response.json().catch(() => null);
      // Só atualiza depois da confirmação do WeGest (doc §33)
      if (response.ok) { onCancelled(); return; }
      setError(response.status === 401 ? "A sessão terminou. Entre de novo para cancelar." : body?.error?.message ?? "Não foi possível cancelar a reserva. Tente novamente.");
    } catch { setError("Sem ligação. Tente novamente."); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-3">
      {error && <Notice tone="danger">{error}</Notice>}
      {confirming ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-body">Cancelar esta reserva?</p>
          <Button variant="outline" onClick={() => void cancel()} loading={loading}>Confirmar cancelamento</Button>
          <Button variant="ghost" onClick={() => setConfirming(false)} disabled={loading}>Manter reserva</Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setConfirming(true)}>Cancelar reserva</Button>
      )}
    </div>
  );
}

export function WeGestBookingConfirmation({ region, codigo }: { region: Region; codigo: string }) {
  const state = useAccountBookings();
  const booking = useBooking(state, codigo);
  if (!state.bookings) return <Status state={state} next={`/rent-a-car/confirmacao?reserva=${encodeURIComponent(codigo)}`} loading={<Skeleton className="h-120" />} />;
  if (!booking) return <EmptyState title="Reserva não encontrada" description="Inicie sessão com a conta usada na reserva." action={<ButtonLink href="/minha-conta/reservas">As minhas reservas</ButtonLink>} />;
  // Só se mostra "confirmada" quando o WeGest confirmou (doc §92)
  const confirmed = booking.estado === "confirmada";
  const Icon = confirmed ? CheckCircle2 : Clock;

  return (
    <Card className="overflow-hidden">
      <TrackEvent name="rentacar_booking_completed" data={{ bookingId: String(booking.codigo), status: STATUS[booking.estado], total: booking.total?.com_iva ?? 0 }} once={`booking:${booking.codigo}`} />
      <div className="bg-panel-dark p-8 text-center text-on-dark">
        <Icon className="mx-auto size-14 text-brand" aria-hidden />
        <h1 className="display mt-4 text-h1">{confirmed ? "Reserva confirmada" : "Pedido de reserva recebido"}</h1>
        <p className="mt-2 text-on-dark/70">
          {confirmed ? "Está tudo pronto. Até breve!" : "A equipa DÉCADA OUSADA vai confirmar a sua reserva. Pode acompanhar o estado em As minhas reservas."}
        </p>
      </div>
      <Rows rows={[["Reserva", String(booking.codigo)], ...bookingRows(booking, region), ["Total", booking.total ? formatMoney(booking.total.com_iva, "EUR", { decimals: true }) : null]]} />
      <div className="flex flex-col gap-3 p-6 sm:flex-row">
        <ButtonLink href={`/minha-conta/reservas/${booking.codigo}`} className="sm:flex-1">Ver a minha reserva</ButtonLink>
        <ButtonLink href="/" variant="outline" className="sm:flex-1">Voltar ao início</ButtonLink>
      </div>
    </Card>
  );
}
