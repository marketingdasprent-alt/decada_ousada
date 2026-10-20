import Link from "next/link";
import { Suspense } from "react";

import { AccountShortcuts } from "@/components/account/account-shortcuts";
import { BookingListItem } from "@/components/account/booking-list-item";
import { WeGestAccountHome } from "@/components/account/wegest-bookings";
import { AccountApplicationSummary } from "@/components/tvde/account-application";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { ButtonLink, Skeleton } from "@/components/shared/ui";
import { attempt } from "@/lib/attempt";
import { driverAuthEnabled } from "@/lib/driver-account";
import { requireCustomer } from "@/lib/guard";
import { regionFromParams } from "@/lib/region";
import { accountApplicationEnabled, accountApplicationMock } from "@/services/account-application";
import { hasTvdeAccess } from "@/services/auth";
import { getCustomer, listCustomerBookings } from "@/services/wegest";

export default function AccountHome({ params }: PageProps<"/[region]/minha-conta">) {
  return (
    <Suspense fallback={<Skeleton className="h-80" />}>
      <Dashboard params={params} />
    </Suspense>
  );
}

async function Dashboard({ params }: { params: Promise<{ region: string }> }) {
  const { session, customerId } = await requireCustomer("rentacar", "/minha-conta");
  // Contas WeGest: as reservas vêm de GET /conta/reservas, no browser, com o token da conta
  if (driverAuthEnabled()) {
    const tvde = hasTvdeAccess(session) ? { mock: accountApplicationMock() } : null;
    return <WeGestAccountHome region={await regionFromParams(params)} name={session.user.name?.split(" ")[0]} tvde={tvde} />;
  }
  const hasTvde = hasTvdeAccess(session);
  // Candidatura da conta (demonstração sem contas WeGest): o mesmo resumo da visão geral WeGest
  const tvdeSummary = hasTvde && accountApplicationEnabled() ? <AccountApplicationSummary mock={accountApplicationMock()} /> : null;

  if (!customerId) {
    const first = session.user.name?.split(" ")[0];
    return (
      <div className="space-y-10">
        <h2 className="text-h2 font-bold">{first ? `Olá, ${first}.` : "Visão geral"}</h2>
        {tvdeSummary}
        <EmptyState
          title="Ainda não tem reservas Rent a Car"
          description="Quando fizer a primeira reserva, ela aparece aqui."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink href="/rent-a-car">Pesquisar viaturas</ButtonLink>
              {hasTvde && !tvdeSummary && <ButtonLink href="/tvde/minha-conta/candidaturas" variant="outline">Candidatura TVDE</ButtonLink>}
            </div>
          }
        />
      </div>
    );
  }

  // Dados do portal vêm do WeGest (doc §31)
  const [customer, bookings] = await Promise.all([attempt(() => getCustomer(customerId)), attempt(() => listCustomerBookings(customerId))]);
  const name = customer.ok && customer.data ? customer.data.firstName : session.user.name?.split(" ")[0];

  if (!bookings.ok) return <ErrorState timeout={bookings.timeout} retryHref="/minha-conta" />;

  const now = new Date().toISOString().slice(0, 16);
  const upcoming = bookings.data
    .filter((b) => b.returnAt.slice(0, 16) >= now && b.status !== "cancelled" && b.status !== "expired")
    .sort((a, b) => a.pickupAt.localeCompare(b.pickupAt));

  return (
    <div className="space-y-10">
      <h2 className="text-h2 font-bold">{name ? `Olá, ${name}.` : "Visão geral"}</h2>
      {tvdeSummary}

      <section aria-labelledby="proxima">
        <h3 id="proxima" className="mb-4 text-body-large font-bold">Próxima reserva</h3>
        {upcoming[0] ? (
          <BookingListItem booking={upcoming[0]} />
        ) : (
          <EmptyState title="Sem reservas futuras" action={<ButtonLink href="/rent-a-car">Nova reserva</ButtonLink>} />
        )}
      </section>

      <AccountShortcuts bookingsText={`${bookings.data.length} no total`} />

      {hasTvde && !tvdeSummary && (
        <Link href="/tvde/minha-conta/candidaturas" className="block rounded-panel bg-panel-dark p-5 text-on-dark">
          <p className="font-semibold">Candidatura TVDE</p>
          <p className="text-body-small text-on-dark/70">Consulte o estado da sua candidatura.</p>
        </Link>
      )}
    </div>
  );
}
