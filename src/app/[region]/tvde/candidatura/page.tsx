import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { EmptyState, ErrorState, Notice } from "@/components/shared/states";
import { ButtonLink, Container, Section, Skeleton } from "@/components/shared/ui";
import { ApplicationChecklist } from "@/components/tvde/application-checklist";
import { ApplicationLayout, SIGNUP_STEPS } from "@/components/tvde/application-layout";
import { RegistrationStep } from "@/components/tvde/application-steps";
import { TvdeSummary, tvdeSummaryLabel } from "@/components/tvde/tvde-summary";
import type { Region } from "@/domain/region";
import { getOffer } from "@/domain/vehicle";
import { attempt } from "@/lib/attempt";
import { driverAuthEnabled } from "@/lib/driver-account";
import { requireSession } from "@/lib/guard";
import { regionFromParams } from "@/lib/region";
import { accountApplicationEnabled } from "@/services/account-application";
import { firstParam } from "@/lib/search";
import { getCustomerId, isDriverSession } from "@/services/auth";
import { checkVehicleAvailability, getApplicationForm, getCustomer, getVehicleById, listLocations, onlineRequestsEnabled } from "@/services/wegest";
import { onlinePaymentsEnabled } from "@/services/payments";

export const metadata: Metadata = { title: "Candidatura TVDE", robots: { index: false } };

type SP = Record<string, string | string[] | undefined>;

const ACCOUNT_APPLICATION = "/tvde/minha-conta/candidaturas";

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
  // O cadastro não depende da viatura: sem os três, é só o cadastro do motorista
  const withVehicle = Boolean(vehicleId && pickupAt && locationId);
  const here = withVehicle ? `/tvde/candidatura?${new URLSearchParams({ viatura: vehicleId!, inicio: pickupAt!, local: locationId! })}` : "/tvde/candidatura";
  // Com a candidatura da conta (contas WeGest ou demonstração), o envio é o fluxo novo: PUT, documentos e
  // POST /conta/candidatura. A viatura e o dia seguem para o rascunho (modelo_pretendido_id, data_inicio_pretendida).
  if (accountApplicationEnabled()) {
    redirect(withVehicle ? `${ACCOUNT_APPLICATION}?${new URLSearchParams({ viatura: vehicleId!, inicio: pickupAt!.slice(0, 10) })}` : ACCOUNT_APPLICATION);
  }
  // Com os pedidos desligados o envio falharia no fim: avisa antes de pedir login e dados
  if (!onlineRequestsEnabled()) return <RequestsOffline />;
  const session = await requireSession(here);
  // Com contas de motorista, a candidatura é feita com a conta WeGest (fica ligada a ela)
  const driverAccount = driverAuthEnabled();
  if (driverAccount && !isDriverSession(session)) redirect(`/entrar?next=${encodeURIComponent(here)}`);
  if (!withVehicle) return <SignupOnly region={region} session={session} driverAccount={driverAccount} loginHref={`/entrar?next=${encodeURIComponent(here)}`} />;

  const vehicle = await getVehicleById(region, vehicleId!);
  const offer = vehicle && getOffer(vehicle, "tvde");
  if (!vehicle || !offer) return <Section><Container><EmptyState title="Viatura não encontrada" action={<ButtonLink href="/tvde/viaturas">Ver viaturas TVDE</ButtonLink>} /></Container></Section>;

  // Pré-validação de disponibilidade (doc §49) + ficha vinda da API (doc §51)
  const [avail, form, locations] = await Promise.all([
    attempt(() => checkVehicleAvailability({ region, product: "tvde", vehicleId: vehicleId!, pickupLocationId: locationId!, pickupAt: pickupAt! })),
    attempt(() => getApplicationForm(region)),
    listLocations(region, "tvde"),
  ]);
  if (!avail.ok || !form.ok) return <Section><Container><ErrorState timeout={(!avail.ok && avail.timeout) || (!form.ok && form.timeout)} retryHref={`/tvde/viatura/${vehicle.slug}`} /></Container></Section>;
  if (avail.data.status === "unavailable") {
    return <Section><Container><EmptyState title="A viatura deixou de estar disponível nesta data" action={<ButtonLink href={`/tvde/viatura/${vehicle.slug}`}>Escolher outra data</ButtonLink>} /></Container></Section>;
  }

  const initial = await prefill(session, driverAccount);
  // Depois do envio: só os passos que existem (a API real não recebe documentos e, sem
  // cobrança online, não há sinal a pagar no site)
  const payments = onlinePaymentsEnabled();
  const after = form.data.documents.length > 0 ? "documents" : payments ? "payment" : "confirmation";

  return (
    <ApplicationLayout
      step={1}
      // Só os passos que existem: com a API real não há documentos nem sinal no site
      steps={after === "confirmation" ? ["Levantamento", "Cadastro", "Enviado"] : undefined}
      title="Cadastro de motorista"
      description="Os dados são enviados para a sua ficha no nosso sistema de gestão."
      asideLabel={tvdeSummaryLabel({ vehicleName: vehicle.name, weeklyPrice: offer.pricing.amount, deposit: offer.deposit, reservationAmount: offer.pricing.reservationAmount })}
      aside={
        <TvdeSummary
          vehicle={vehicle}
          weeklyPrice={offer.pricing.amount}
          deposit={offer.deposit}
          reservationAmount={offer.pricing.reservationAmount}
          pickupAt={pickupAt!}
          locationName={locations.find((l) => l.id === locationId)?.name}
          payments={payments}
        />
      }
    >
      <ApplicationChecklist
        form={form.data}
        reservationAmount={payments ? (offer.pricing.reservationAmount ?? offer.deposit) : undefined}
        filled={form.data.fields.filter((f) => initial[f.field]).length}
        className="mb-6"
      />
      <RegistrationStep
        fields={form.data.fields}
        initial={initial}
        vehicleId={vehicleId!}
        pickupAt={pickupAt!}
        pickupLocationId={locationId!}
        after={after}
        captchaSiteKey={process.env.TURNSTILE_SITE_KEY || undefined}
        driverAccount={driverAccount}
        loginHref={`/entrar?next=${encodeURIComponent(here)}`}
      />
    </ApplicationLayout>
  );
}

type AppSession = Awaited<ReturnType<typeof requireSession>>;

/** Pré-preenchimento: ficha TVDE ou, se não existir, a ficha Rent a Car. */
async function prefill(session: AppSession, driverAccount: boolean): Promise<Record<string, string>> {
  const tvdeId = await getCustomerId(session, "tvde");
  const racId = await getCustomerId(session, "rentacar");
  const existing = tvdeId ?? racId;
  const c = existing ? await attempt(() => getCustomer(existing)) : null;
  const cust = c?.ok ? c.data : null;
  return Object.fromEntries(
    Object.entries({
      full_name: cust?.fullName ?? session.user.name,
      email: driverAccount ? session.user.email : (cust?.email ?? session.user.email),
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
}

/** Pedidos online desligados (WEGEST_PEDIDOS_ONLINE): o cadastro faz-se com a equipa. */
function RequestsOffline() {
  return (
    <Section variant="compact">
      <Container variant="narrow">
        <h1 className="text-h2 font-bold">Cadastro de motorista</h1>
        <Notice tone="info" title="O cadastro online ainda não está disponível" className="mt-6">
          Para se candidatar como motorista TVDE, contacte a equipa por telefone ou email.
        </Notice>
        <ButtonLink href="/contactos" size="lg" className="mt-6">Contactar a equipa</ButtonLink>
      </Container>
    </Section>
  );
}

/** Cadastro do motorista sem viatura: Entrar > Criar conta > este formulário. */
async function SignupOnly({ region, session, driverAccount, loginHref }: { region: Region; session: AppSession; driverAccount: boolean; loginHref: string }) {
  const [form, initial] = await Promise.all([attempt(() => getApplicationForm(region)), prefill(session, driverAccount)]);
  if (!form.ok) return <Section><Container><ErrorState timeout={form.timeout} retryHref="/tvde/candidatura" /></Container></Section>;
  return (
    <ApplicationLayout
      step={1}
      steps={SIGNUP_STEPS}
      title="Cadastro de motorista"
      description="Os dados são enviados para a sua ficha no nosso sistema de gestão."
    >
      <RegistrationStep fields={form.data.fields} initial={initial} driverAccount={driverAccount} loginHref={loginHref} captchaSiteKey={process.env.TURNSTILE_SITE_KEY || undefined} />
    </ApplicationLayout>
  );
}
