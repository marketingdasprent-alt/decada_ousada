import { ClipboardCheck, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { EmptyState } from "@/components/shared/states";
import { TrackEvent } from "@/components/shared/track-event";
import { ButtonLink, buttonClass, Card, Container, Section, Skeleton } from "@/components/shared/ui";
import { ApplicationStatusBadge, ApplicationTimeline } from "@/components/tvde/application-status";
import { DRIVER_AREA_URL } from "@/domain/drivers";
import { PAYMENT_STATUS_LABEL } from "@/domain/payment";
import { formatMoney } from "@/domain/pricing";
import { formatDateTime } from "@/lib/dates";
import { getOwnApplication } from "@/lib/ownership";
import { firstParam } from "@/lib/search";
import { withPayment } from "@/services/tvde";

export const metadata: Metadata = { title: "Candidatura recebida", robots: { index: false } };

export default function TvdeConfirmacaoPage({ searchParams }: PageProps<"/[region]/tvde/candidatura/confirmacao">) {
  return (
    <Section><Container variant="narrow">
      <Suspense fallback={<Skeleton className="h-120" />}>
        <Confirmation searchParams={searchParams} />
      </Suspense>
    </Container></Section>
  );
}

async function Confirmation({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const id = firstParam((await searchParams).id);
  const own = id ? await getOwnApplication(id) : null;
  if (!own) return <EmptyState title="Candidatura não encontrada" action={<ButtonLink href="/tvde/minha-conta">Área TVDE</ButtonLink>} />;
  const app = await withPayment(own.application);
  // Só o cadastro (sem viatura escolhida): sem levantamento nem pagamento
  const withVehicle = Boolean(app.vehicleId);

  return (
    <Card className="overflow-hidden">
      <TrackEvent name="tvde_application_submitted" data={{ applicationId: app.id }} once={`application:${app.id}`} />
      <div className="bg-panel-dark p-8 text-center text-on-dark">
        <ClipboardCheck className="mx-auto size-14 text-brand" aria-hidden />
        <h1 className="display mt-4 text-h1">Candidatura recebida</h1>
        <p className="mt-2 text-on-dark/70">
          {withVehicle
            ? "Estamos a analisar os seus dados e documentação. Recebe um email com a decisão."
            : "Recebemos a sua candidatura. A equipa pede-lhe depois os documentos, que também pode carregar no portal do motorista."}
        </p>
      </div>
      <div className="border-b border-line p-6">
        <ApplicationTimeline status={app.status} paymentStatus={app.payment?.status} withVehicle={withVehicle} />
      </div>
      <dl className="divide-y divide-line text-body-small">
        {[
          ["Candidatura", app.reference],
          ...(withVehicle
            ? [
                ["Viatura", app.vehicleName],
                ["Levantamento pretendido", formatDateTime(app.pickupAt)],
                ["Local", app.pickupLocation.name],
              ]
            : []),
        ].map(([k, v]) => (
          <div key={k} className="grid grid-label-value gap-4 px-6 py-3.5">
            <dt className="text-copy-muted">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
        <div className="grid grid-label-value gap-4 px-6 py-3.5">
          <dt className="text-copy-muted">Estado</dt>
          <dd><ApplicationStatusBadge status={app.status} /></dd>
        </div>
        {app.payment && (
          <div className="grid grid-label-value gap-4 px-6 py-3.5">
            <dt className="text-copy-muted">Pagamento</dt>
            <dd>{formatMoney(app.payment.amount)}, {PAYMENT_STATUS_LABEL[app.payment.status]}</dd>
          </div>
        )}
      </dl>
      <div className="space-y-3 p-6">
        <ButtonLink href={`/tvde/minha-conta/candidaturas/${app.id}`} className="w-full">Acompanhar candidatura</ButtonLink>
        {!withVehicle && (
          <a href={DRIVER_AREA_URL} className={buttonClass("outline", "md", "w-full")}>
            Abrir o portal do motorista
            <ExternalLink className="size-4" aria-hidden />
          </a>
        )}
      </div>
    </Card>
  );
}
