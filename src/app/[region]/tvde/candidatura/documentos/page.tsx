import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { EmptyState } from "@/components/shared/states";
import { ButtonLink, Container, Section, Skeleton } from "@/components/shared/ui";
import { ApplicationLayout } from "@/components/tvde/application-layout";
import { DocumentsStep } from "@/components/tvde/application-steps";
import { TvdeSummary, tvdeSummaryLabel } from "@/components/tvde/tvde-summary";
import type { Region } from "@/domain/region";
import { requireSession } from "@/lib/guard";
import { getOwnApplication } from "@/lib/ownership";
import { regionFromParams } from "@/lib/region";
import { firstParam } from "@/lib/search";
import { getApplicationForm, getVehicleById } from "@/services/wegest";

export const metadata: Metadata = { title: "Documentos | Candidatura TVDE", robots: { index: false } };

export default async function DocumentosPage({ params, searchParams }: PageProps<"/[region]/tvde/candidatura/documentos">) {
  const region = await regionFromParams(params);
  return (
    <Suspense fallback={<Section variant="compact"><Container><Skeleton className="h-150" /></Container></Section>}>
      <Documents region={region} searchParams={searchParams} />
    </Suspense>
  );
}

async function Documents({ region, searchParams }: { region: Region; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const id = firstParam((await searchParams).id) ?? "";
  await requireSession(`/tvde/candidatura/documentos?id=${encodeURIComponent(id)}`);
  const own = id ? await getOwnApplication(id) : null;
  if (!own) return <Section><Container><EmptyState title="Candidatura não encontrada" action={<ButtonLink href="/tvde/minha-conta">Área TVDE</ButtonLink>} /></Container></Section>;
  const app = own.application;
  if (app.status !== "payment_pending" && app.status !== "draft") redirect(`/tvde/minha-conta/candidaturas/${app.id}`);
  const [form, vehicle] = await Promise.all([getApplicationForm(region), getVehicleById(region, app.vehicleId)]);

  return (
    <ApplicationLayout
      step={2}
      title="Documentação"
      description="Envie os documentos em PDF, JPG ou PNG. São enviados de forma segura e nunca ficam públicos."
      asideLabel={tvdeSummaryLabel({ vehicleName: vehicle?.name, weeklyPrice: app.weeklyPrice, deposit: app.deposit, reservationAmount: app.reservationAmount })}
      aside={<TvdeSummary vehicle={vehicle} weeklyPrice={app.weeklyPrice} deposit={app.deposit} reservationAmount={app.reservationAmount} pickupAt={app.pickupAt} locationName={app.pickupLocation.name} reference={app.reference} />}
    >
      <DocumentsStep applicationId={app.id} requirements={form.documents} documents={app.documents} />
    </ApplicationLayout>
  );
}
