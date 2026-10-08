import type { Metadata } from "next";
import { Suspense } from "react";

import { BookingWizard } from "@/components/booking/booking-wizard";
import { ErrorState, EmptyState } from "@/components/shared/states";
import { ButtonLink, Container, Section, Skeleton } from "@/components/shared/ui";
import type { Region } from "@/domain/region";
import { getOffer } from "@/domain/vehicle";
import { attempt } from "@/lib/attempt";
import { customerToForm } from "@/lib/customer-form";
import { regionFromParams } from "@/lib/region";
import { firstParam, parseCheckoutDraft, parseRentalSearch, rentalSearchQuery } from "@/lib/search";
import { getCustomerId, getSession } from "@/services/auth";
import { checkVehicleAvailability, getCustomer, getVehicleById, listCoverages, listExtras, listLocations, quoteRentACar } from "@/services/wegest";

export const metadata: Metadata = { title: "Reserva", robots: { index: false } };

type SP = Record<string, string | string[] | undefined>;

export default async function ReservaPage({ params, searchParams }: PageProps<"/[region]/rent-a-car/reserva">) {
  const region = await regionFromParams(params);
  return (
    <Section variant="compact"><Container>
      <Suspense fallback={<div className="grid grid-cols-1 gap-8 lg:grid-main-aside"><Skeleton className="h-150" /><Skeleton className="h-96" /></div>}>
        <Checkout region={region} searchParams={searchParams} />
      </Suspense>
    </Container></Section>
  );
}

async function Checkout({ region, searchParams }: { region: Region; searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const search = parseRentalSearch(sp, region);
  const vehicleId = firstParam(sp.viatura);
  if (!search || !vehicleId) {
    return <EmptyState title="Reserva incompleta" description="Escolha primeiro a viatura e as datas." action={<ButtonLink href="/rent-a-car">Pesquisar viaturas</ButtonLink>} />;
  }

  const vehicle = await getVehicleById(region, vehicleId);
  const offer = vehicle && getOffer(vehicle, "rentacar");
  if (!vehicle || !offer) return <EmptyState title="Viatura não encontrada" action={<ButtonLink href="/rent-a-car/viaturas">Ver viaturas</ButtonLink>} />;

  const query = rentalSearchQuery(search);
  const backHref = `/rent-a-car/viatura/${vehicle.slug}?${query}`;

  // Nova consulta ao entrar no checkout: nunca assumir disponibilidade (doc §89)
  const [avail, extras, coverages, locations, session] = await Promise.all([
    attempt(() => checkVehicleAvailability({ region, product: "rentacar", vehicleId, pickupLocationId: search.pickupLocationId, returnLocationId: search.returnLocationId, pickupAt: search.pickupAt, returnAt: search.returnAt })),
    attempt(() => listExtras(region)),
    attempt(() => listCoverages(region)),
    listLocations(region),
    getSession(),
  ]);

  // Escolhas guardadas no URL (ao voltar de "Entrar"), validadas contra as listas da API
  const draft = parseCheckoutDraft(sp);
  const extraList = extras.ok ? extras.data : [];
  const coverageList = coverages.ok ? coverages.data : [];
  const initialExtras = draft.extras.filter((d) => extraList.some((e) => e.id === d.extraId && d.quantity <= e.maxQuantity));
  const initialCoverageId = coverageList.some((c) => c.id === draft.coverageId) ? draft.coverageId : (coverageList.find((c) => c.pricePerDay === 0)?.id ?? null);
  const quote = await attempt(() => quoteRentACar({ vehicleId, offerId: offer.id, search, extras: initialExtras, coverageId: initialCoverageId }));

  if (!avail.ok || !quote.ok) return <ErrorState timeout={(!avail.ok && avail.timeout) || (!quote.ok && quote.timeout)} retryHref={`/rent-a-car/reserva?viatura=${vehicleId}&${query}`} />;
  if (avail.data.status === "unavailable") {
    return <EmptyState title="Esta viatura deixou de estar disponível" description="Entretanto foi reservada. Veja outras viaturas para as mesmas datas." action={<ButtonLink href={`/rent-a-car/viaturas?${query}`}>Ver alternativas</ButtonLink>} />;
  }

  // Pré-preenchimento com a ficha do WeGest, se já for cliente
  const customerId = await getCustomerId(session, "rentacar");
  const customer = customerId ? await attempt(() => getCustomer(customerId)) : null;
  const c = customer?.ok ? customer.data : null;

  return (
    <BookingWizard
      vehicle={vehicle}
      offerId={offer.id}
      search={search}
      extras={extraList}
      coverages={coverageList}
      initialQuote={quote.data}
      initialExtras={initialExtras}
      initialCoverageId={initialCoverageId}
      initialStep={session ? draft.step : Math.min(draft.step, 1)}
      pickupName={locations.find((l) => l.id === search.pickupLocationId)?.name}
      returnName={locations.find((l) => l.id === search.returnLocationId)?.name}
      loggedIn={!!session}
      backHref={backHref}
      checkoutPath={`/rent-a-car/reserva?viatura=${vehicleId}&${query}`}
      alternativesHref={`/rent-a-car/viaturas?${query}`}
      customer={c ? customerToForm(c) : session ? { email: session.user.email, fullName: session.user.name } : null}
    />
  );
}
