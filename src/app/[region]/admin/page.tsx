import { Activity, AlertTriangle, CarFront, ClipboardList, CreditCard, Undo2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { isAdmin, simulateApplicationState, simulateBookingState } from "@/app/actions/admin";
import { ReservationStatus } from "@/components/booking/booking-status";
import { EmptyState } from "@/components/shared/states";
import { Badge, ButtonLink, Card, Container, Section, Skeleton } from "@/components/shared/ui";
import { ApplicationStatusBadge } from "@/components/tvde/application-status";
import { PAYMENT_STATUS_LABEL } from "@/domain/payment";
import { formatMoney } from "@/domain/pricing";
import { REFUND_STATUS_LABEL } from "@/domain/refund";
import { formatDateTime } from "@/lib/dates";
import { paymentsRepo, refundsRepo } from "@/services/store";
import { getIntegrationStats } from "@/services/store/integration-log";
import { integrationMode, pingWeGest } from "@/services/wegest";
import { mapApplication, mapBooking } from "@/services/wegest/mappers";
import { mockBackoffice } from "@/services/wegest/mock/transport";

export const metadata: Metadata = { title: "Backoffice", robots: { index: false } };

/**
 * Backoffice próprio: só para o que NÃO é do WeGest (doc §103):
 * estado da integração, pagamentos, reembolsos e logs.
 * Clientes, reservas e candidatos geridos no WeGest.
 */
export default function AdminPage() {
  return (
    <>
      <div className="bg-panel-dark py-8 text-on-dark">
        <Container>
          <h1 className="display text-h1">Backoffice técnico</h1>
          <p className="mt-1 text-on-dark/60">Integração, pagamentos e reembolsos. A gestão operacional é feita no WeGest.</p>
        </Container>
      </div>
      <Section variant="compact"><Container>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <Dashboard />
        </Suspense>
      </Container></Section>
    </>
  );
}

async function Dashboard() {
  if (!(await isAdmin())) {
    return <EmptyState title="Sem acesso" description="Inicie sessão com uma conta de administrador." action={<ButtonLink href="/entrar?next=/admin">Entrar</ButtonLink>} />;
  }
  const mode = integrationMode();
  const [ping, payments, refunds] = await Promise.all([pingWeGest(), paymentsRepo.list(), refundsRepo.list()]);
  const stats = getIntegrationStats();
  const bookings = mode === "mock" ? mockBackoffice.listBookings().map(mapBooking) : [];
  const applications = mode === "mock" ? mockBackoffice.listApplications().map(mapApplication) : [];
  const pendingPayments = payments.filter((p) => p.status === "pending" || p.status === "processing").length;
  const pendingRefunds = refunds.filter((r) => r.status === "pending" || r.status === "processing").length;

  return (
    <div className="space-y-10">
      {/* Dashboard operacional (doc §104) */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat icon={CarFront} label="Reservas Rent a Car" value={mode === "mock" ? bookings.length : "WeGest"} />
        <Stat icon={ClipboardList} label="Candidaturas TVDE" value={mode === "mock" ? applications.length : "WeGest"} />
        <Stat icon={CreditCard} label="Pagamentos pendentes" value={pendingPayments} />
        <Stat icon={Undo2} label="Reembolsos pendentes" value={pendingRefunds} />
        <Card className="p-5">
          <div className="flex items-center gap-2 text-body-small text-copy-muted"><Activity className="size-4" aria-hidden /> WeGest API</div>
          <p className="mt-2 flex items-center gap-2 text-body-large font-bold">
            <span className={`size-2.5 rounded-pill ${ping.ok ? "bg-positive" : "bg-negative"}`} aria-hidden />
            {ping.ok ? "Online" : "Atenção"}
          </p>
          <p className="text-caption text-copy-muted">Modo: {mode === "mock" ? "demonstração" : "API real"}, {ping.latencyMs} ms</p>
        </Card>
      </section>

      {/* Estado da integração (doc §105) */}
      <Card className="p-5">
        <h2 className="font-semibold">Estado da integração</h2>
        <dl className="mt-3 grid gap-4 text-body-small sm:grid-cols-4">
          <div><dt className="text-copy-muted">Pedidos registados</dt><dd className="font-bold tabular">{stats.total}</dd></div>
          <div><dt className="text-copy-muted">Última comunicação</dt><dd className="font-bold">{stats.lastCallAt ? new Date(stats.lastCallAt).toLocaleString("pt-PT") : "Sem registo"}</dd></div>
          <div><dt className="text-copy-muted">Tempo médio</dt><dd className="font-bold tabular">{stats.averageMs !== null ? `${stats.averageMs} ms` : "Sem registo"}</dd></div>
          <div><dt className="text-copy-muted">Último erro</dt><dd className="flex items-center gap-1 font-bold">{stats.lastErrorAt ? <><AlertTriangle className="size-4 text-negative" aria-hidden />{new Date(stats.lastErrorAt).toLocaleString("pt-PT")}</> : "Nenhum"}</dd></div>
        </dl>
        {mode === "mock" && <p className="mt-3 text-caption text-copy-muted">Em modo demonstração não há chamadas HTTP. Defina WEGEST_MODE=http e WEGEST_API_KEY para ligar à API real.</p>}
      </Card>

      {mode === "mock" && (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-h4 font-bold">Simulador WeGest</h2>
            <Badge tone="warn">Só demonstração</Badge>
          </div>
          <p className="mb-6 text-body text-copy-secondary">Simula as ações que a equipa faria no WeGest, para demonstrar os estados no site.</p>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="p-5">
              <h3 className="font-semibold">Candidaturas TVDE</h3>
              <ul className="mt-4 divide-y divide-line">
                {applications.map((a) => (
                  <li key={a.id} className="py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{a.reference}</span>
                      <ApplicationStatusBadge status={a.status} />
                      <span className="text-body-small text-copy-muted">{a.vehicleName}, {formatDateTime(a.pickupAt)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {([
                        ["IN_REVIEW", "Em análise"],
                        ["PENDING_DOCS", "Pedir documento"],
                        ["APPROVED", "Aprovar"],
                        ["REJECTED", "Recusar"],
                      ] as const).map(([state, label]) => (
                        <form key={state} action={simulateApplicationState}>
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="state" value={state} />
                          <button className="rounded-control border border-line px-3 py-1.5 text-caption font-semibold hover:border-copy/30">{label}</button>
                        </form>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold">Reservas Rent a Car</h3>
              <ul className="mt-4 divide-y divide-line">
                {bookings.map((b) => (
                  <li key={b.id} className="py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{b.reference}</span>
                      <ReservationStatus status={b.status} />
                      <span className="text-body-small text-copy-muted">{b.vehicleName}, {formatDateTime(b.pickupAt)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {([
                        ["CONFIRMED", "Confirmar"],
                        ["OPEN", "Em curso"],
                        ["CLOSED", "Concluir"],
                      ] as const).map(([state, label]) => (
                        <form key={state} action={simulateBookingState}>
                          <input type="hidden" name="id" value={b.id} />
                          <input type="hidden" name="state" value={state} />
                          <button className="rounded-control border border-line px-3 py-1.5 text-caption font-semibold hover:border-copy/30">{label}</button>
                        </form>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold">Pagamentos</h2>
          {payments.length ? (
            <ul className="mt-3 divide-y divide-line text-body-small">
              {payments.slice(0, 20).map((p) => (
                <li key={p.id} className="flex flex-wrap justify-between gap-2 py-2.5">
                  <span className="font-code text-caption">{p.id}</span>
                  <span>{p.purpose}</span>
                  <span className="tabular">{formatMoney(p.amount, "EUR", { decimals: true })}</span>
                  <Badge tone={p.status === "paid" ? "ok" : p.status === "failed" ? "danger" : "neutral"}>{PAYMENT_STATUS_LABEL[p.status]}</Badge>
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 text-body-small text-copy-muted">Sem pagamentos.</p>}
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Reembolsos</h2>
          {refunds.length ? (
            <ul className="mt-3 divide-y divide-line text-body-small">
              {refunds.slice(0, 20).map((r) => (
                <li key={r.id} className="flex flex-wrap justify-between gap-2 py-2.5">
                  <span className="font-code text-caption">{r.id}</span>
                  <span className="text-copy-muted">{r.reason}</span>
                  <span className="tabular">{formatMoney(r.amount, "EUR", { decimals: true })}</span>
                  <Badge tone="info">{REFUND_STATUS_LABEL[r.status]}</Badge>
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 text-body-small text-copy-muted">Sem reembolsos.</p>}
        </Card>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: number | string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-body-small text-copy-muted"><Icon className="size-4" aria-hidden /> {label}</div>
      <p className="mt-2 text-h2 font-bold tabular">{value}</p>
    </Card>
  );
}
