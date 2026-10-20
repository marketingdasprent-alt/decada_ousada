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
import { withCatalogNames, withPayment } from "@/services/tvde";
import { regionFromParams } from "@/lib/region";
import { getSession } from "@/services/auth";
import { getApplication } from "@/services/wegest";
import { attempt } from "@/lib/attempt";
import { onlinePaymentsEnabled } from "@/services/payments";

export const metadata: Metadata = { title: "Candidatura recebida", robots: { index: false } };

export default function TvdeConfirmacaoPage({ params, searchParams }: PageProps<"/[region]/tvde/candidatura/confirmacao">) {
  return (
    <Section><Container variant="narrow">
      <Suspense fallback={<Skeleton className="h-120" />}>
        <Confirmation params={params} searchParams={searchParams} />
      </Suspense>
    </Container></Section>
  );
}

async function Confirmation({ params, searchParams }: { params: Promise<{ region: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const region = await regionFromParams(params);
  const id = firstParam((await searchParams).id);
  const own = id ? await getOwnApplication(id) : null;
  // Sem base de dados, o site pode já não saber que a candidatura é desta conta (outra
  // instância). O WeGest devolve só o estado e as datas, sem dados pessoais: chega para
  // confirmar o envio. A área do motorista continua a exigir a ligação à conta.
  const fallback = !own && id && (await getSession()) ? await attempt(() => getApplication(id)) : null;
  const found = own?.application ?? (fallback?.ok ? fallback.data : null);
  if (!found) return <EmptyState title="Candidatura não encontrada" action={<ButtonLink href="/minha-conta">A minha conta</ButtonLink>} />;
  const app = await withCatalogNames(await withPayment(found), region);
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
            ? "Estamos a analisar a sua candidatura. Pode acompanhar o estado na sua área de motorista."
            : "Recebemos a sua candidatura. A equipa pede-lhe depois os documentos, que também pode carregar no portal do motorista."}
        </p>
      </div>
      <div className="border-b border-line p-6">
        <ApplicationTimeline status={app.status} paymentStatus={app.payment?.status} withVehicle={withVehicle} showPayment={!!app.payment || onlinePaymentsEnabled()} />
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
        ].filter(([, v]) => v).map(([k, v]) => (
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
