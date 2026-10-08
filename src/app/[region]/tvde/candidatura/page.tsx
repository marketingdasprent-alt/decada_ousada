import type { Metadata } from "next";
import { Suspense } from "react";

import { EmptyState, ErrorState } from "@/components/shared/states";
import { ButtonLink, Container, Section, Skeleton } from "@/components/shared/ui";
import { ApplicationChecklist } from "@/components/tvde/application-checklist";
import { ApplicationLayout } from "@/components/tvde/application-layout";
import { RegistrationStep } from "@/components/tvde/application-steps";
import { TvdeSummary, tvdeSummaryLabel } from "@/components/tvde/tvde-summary";
import type { Region } from "@/domain/region";
import { getOffer } from "@/domain/vehicle";
import { attempt } from "@/lib/attempt";
import { requireSession } from "@/lib/guard";
import { regionFromParams } from "@/lib/region";
import { firstParam } from "@/lib/search";
import { getCustomerId } from "@/services/auth";
import { checkVehicleAvailability, getApplicationForm, getCustomer, getVehicleById, listLocations } from "@/services/wegest";

export const metadata: Metadata = { title: "Candidatura TVDE", robots: { index: false } };

type SP = Record<string, string | string[] | undefined>;

export default async function CandidaturaPage({ params, searchParams }: PageProps<"/[region]/tvde/candidatura">) {
  const region = await regionFromParams(params);
  return (
    <Suspense fallback={<Section variant="compact"><Container><Skeleton className="h-150" /></Container></Section>}>
      <Registration region={region} searchParams={searchParams} />
    </Suspense>
  );
}

async function Registration({ region, searchParams }: { region: Region; searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const vehicleId = firstParam(sp.viatura);
  const pickupAt = firstParam(sp.inicio);
  const locationId = firstParam(sp.local);
  if (!vehicleId || !pickupAt || !locationId) {
    return <Section><Container><EmptyState title="Escolha primeiro a viatura e o levantamento" action={<ButtonLink href="/tvde/viaturas">Ver viaturas TVDE</ButtonLink>} /></Container></Section>;
  }
  const session = await requireSession(`/tvde/candidatura?${new URLSearchParams({ viatura: vehicleId, inicio: pickupAt, local: locationId })}`);

  const vehicle = await getVehicleById(region, vehicleId);
  const offer = vehicle && getOffer(vehicle, "tvde");
  if (!vehicle || !offer) return <Section><Container><EmptyState title="Viatura não encontrada" action={<ButtonLink href="/tvde/viaturas">Ver viaturas TVDE</ButtonLink>} /></Container></Section>;

  // Pré-validação de disponibilidade (doc §49) + ficha vinda da API (doc §51)
  const [avail, form, locations] = await Promise.all([
    attempt(() => checkVehicleAvailability({ region, product: "tvde", vehicleId, pickupLocationId: locationId, pickupAt })),
    attempt(() => getApplicationForm(region)),
    listLocations(region, "tvde"),
  ]);
  if (!avail.ok || !form.ok) return <Section><Container><ErrorState timeout={(!avail.ok && avail.timeout) || (!form.ok && form.timeout)} retryHref={`/tvde/viatura/${vehicle.slug}`} /></Container></Section>;
  if (avail.data.status === "unavailable") {
    return <Section><Container><EmptyState title="A viatura deixou de estar disponível nesta data" action={<ButtonLink href={`/tvde/viatura/${vehicle.slug}`}>Escolher outra data</ButtonLink>} /></Container></Section>;
  }

  // Pré-preenchimento: ficha TVDE ou, se não existir, a ficha Rent a Car
  const tvdeId = await getCustomerId(session, "tvde");
  const racId = await getCustomerId(session, "rentacar");
  const existing = tvdeId ?? racId;
  const c = existing ? await attempt(() => getCustomer(existing)) : null;
  const cust = c?.ok ? c.data : null;
  const initial: Record<string, string> = Object.fromEntries(
    Object.entries({
      full_name: cust?.fullName ?? session.user.name,
      email: cust?.email ?? session.user.email,
      phone: cust?.phone,
      birth_date: cust?.birthDate,
      nif: cust?.taxId,
      address: cust?.address?.line1,
      zip_code: cust?.address?.postalCode,
      city: cust?.address?.city,
      license_number: cust?.driverLicense?.number,
      license_expiry: cust?.driverLicense?.expiresAt,
      ...(cust?.extra ? Object.fromEntries(Object.entries(cust.extra).map(([k, v]) => [k, v == null ? "" : String(v)])) : {}),
    }).filter((e): e is [string, string] => typeof e[1] === "string" && e[1] !== ""),
  );

  return (
    <ApplicationLayout
      step={1}
      title="Cadastro de motorista"
      description="Os dados são enviados para a sua ficha no nosso sistema de gestão."
      asideLabel={tvdeSummaryLabel({ vehicleName: vehicle.name, weeklyPrice: offer.pricing.amount, deposit: offer.deposit, reservationAmount: offer.pricing.reservationAmount })}
      aside={
        <TvdeSummary
          vehicle={vehicle}
          weeklyPrice={offer.pricing.amount}
          deposit={offer.deposit}
          reservationAmount={offer.pricing.reservationAmount}
          pickupAt={pickupAt}
          locationName={locations.find((l) => l.id === locationId)?.name}
        />
      }
    >
      <ApplicationChecklist
        form={form.data}
        reservationAmount={offer.pricing.reservationAmount ?? offer.deposit}
        filled={form.data.fields.filter((f) => initial[f.field]).length}
        className="mb-6"
      />
      <RegistrationStep fields={form.data.fields} initial={initial} vehicleId={vehicleId} pickupAt={pickupAt} pickupLocationId={locationId} />
    </ApplicationLayout>
  );
}
