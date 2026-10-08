import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { EmptyState, Notice } from "@/components/shared/states";
import { ButtonLink, Container, Section, Skeleton } from "@/components/shared/ui";
import { ApplicationLayout } from "@/components/tvde/application-layout";
import { TvdePaymentStep } from "@/components/tvde/application-steps";
import { TvdeSummary, tvdeSummaryLabel } from "@/components/tvde/tvde-summary";
import type { Region } from "@/domain/region";
import { requireSession } from "@/lib/guard";
import { getOwnApplication } from "@/lib/ownership";
import { regionFromParams } from "@/lib/region";
import { firstParam } from "@/lib/search";
import { getApplicationForm, getVehicleById } from "@/services/wegest";

export const metadata: Metadata = { title: "Pagamento | Candidatura TVDE", robots: { index: false } };

export default async function PagamentoPage({ params, searchParams }: PageProps<"/[region]/tvde/candidatura/pagamento">) {
  const region = await regionFromParams(params);
  return (
    <Suspense fallback={<Section variant="compact"><Container><Skeleton className="h-150" /></Container></Section>}>
      <Payment region={region} searchParams={searchParams} />
    </Suspense>
  );
}

async function Payment({ region, searchParams }: { region: Region; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const id = firstParam((await searchParams).id) ?? "";
  await requireSession(`/tvde/candidatura/pagamento?id=${encodeURIComponent(id)}`);
  const own = id ? await getOwnApplication(id) : null;
  if (!own) return <Section><Container><EmptyState title="Candidatura não encontrada" action={<ButtonLink href="/tvde/minha-conta">Área TVDE</ButtonLink>} /></Container></Section>;
  const app = own.application;
  if (app.status !== "payment_pending" && app.status !== "draft") redirect(`/tvde/minha-conta/candidaturas/${app.id}`);

  const [form, vehicle] = await Promise.all([getApplicationForm(region), getVehicleById(region, app.vehicleId)]);
  const missing = form.documents.filter((d) => d.required && !app.documents.some((x) => x.type === d.type));
  if (missing.length) redirect(`/tvde/candidatura/documentos?id=${encodeURIComponent(app.id)}`);

  const amount = app.reservationAmount || app.deposit;
  // Hora do hold apresentada no fuso de Portugal
  const holdTime = app.holdExpiresAt
    ? new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit", timeZone: region === "azores" ? "Atlantic/Azores" : "Europe/Lisbon" }).format(new Date(app.holdExpiresAt))
    : null;

  return (
    <ApplicationLayout
      step={3}
      title="Pagar o sinal"
      description="Garanta a viatura enquanto analisamos a sua candidatura."
      asideLabel={tvdeSummaryLabel({ vehicleName: vehicle?.name, weeklyPrice: app.weeklyPrice, deposit: app.deposit, reservationAmount: app.reservationAmount })}
      aside={<TvdeSummary vehicle={vehicle} weeklyPrice={app.weeklyPrice} deposit={app.deposit} reservationAmount={app.reservationAmount} pickupAt={app.pickupAt} locationName={app.pickupLocation.name} reference={app.reference} />}
    >
      {holdTime && (
        <Notice className="mb-6" title="Viatura reservada temporariamente">
          Mantemos esta viatura reservada para si até às {holdTime}. Pague o sinal para enviar a candidatura.
        </Notice>
      )}
      <TvdePaymentStep applicationId={app.id} amount={amount} />
    </ApplicationLayout>
  );
}
