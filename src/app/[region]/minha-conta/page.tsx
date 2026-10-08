import { CarFront, FileText, UserRound } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { BookingListItem } from "@/components/account/booking-list-item";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { ButtonLink, Skeleton } from "@/components/shared/ui";
import { attempt } from "@/lib/attempt";
import { requireCustomer } from "@/lib/guard";
import { getCustomer, listCustomerBookings } from "@/services/wegest";

export default function AccountHome() {
  return (
    <Suspense fallback={<Skeleton className="h-80" />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const { session, customerId } = await requireCustomer("rentacar", "/minha-conta");
  const hasTvde = session.integrations.some((i) => i.customerType === "tvde");

  if (!customerId) {
    return (
      <>
        <h2 className="text-h3 font-bold">Olá{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}.</h2>
        <EmptyState
          className="mt-6"
          title="Ainda não tem reservas Rent a Car"
          description="Quando fizer a primeira reserva, ela aparece aqui."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink href="/rent-a-car">Pesquisar viaturas</ButtonLink>
              {hasTvde && <ButtonLink href="/tvde/minha-conta" variant="outline">Área TVDE</ButtonLink>}
            </div>
          }
        />
      </>
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
      <h2 className="text-h2 font-bold">Olá{name ? `, ${name}` : ""}.</h2>

      <section aria-labelledby="proxima">
        <h3 id="proxima" className="mb-4 text-body-large font-bold">Próxima reserva</h3>
        {upcoming[0] ? (
          <BookingListItem booking={upcoming[0]} />
        ) : (
          <EmptyState title="Sem reservas futuras" action={<ButtonLink href="/rent-a-car" size="sm">Nova reserva</ButtonLink>} />
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { href: "/minha-conta/reservas", icon: CarFront, label: "As minhas reservas", text: `${bookings.data.length} no total` },
          { href: "/minha-conta/perfil", icon: UserRound, label: "Dados pessoais", text: "Carta, morada e NIF" },
          { href: "/minha-conta/faturas", icon: FileText, label: "Faturas", text: "Descarregar documentos" },
        ].map(({ href, icon: Icon, label, text }) => (
          <Link key={href} href={href} className="rounded-panel border border-line bg-panel p-5 transition-colors hover:border-copy/25">
            <Icon className="size-6 text-brand" aria-hidden />
            <p className="mt-3 font-semibold">{label}</p>
            <p className="text-body-small text-copy-muted">{text}</p>
          </Link>
        ))}
      </section>

      {hasTvde && (
        <Link href="/tvde/minha-conta" className="block rounded-panel bg-panel-dark p-5 text-on-dark">
          <p className="font-semibold">Área TVDE</p>
          <p className="text-body-small text-on-dark/70">Consulte o estado da sua candidatura.</p>
        </Link>
      )}
    </div>
  );
}
