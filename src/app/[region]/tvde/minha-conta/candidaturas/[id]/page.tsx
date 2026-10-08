import { ArrowLeft, FileCheck2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Notice } from "@/components/shared/states";
import { TrackEvent } from "@/components/shared/track-event";
import { Card, Skeleton } from "@/components/shared/ui";
import { ApplicationStatusBadge, ApplicationTimeline } from "@/components/tvde/application-status";
import { DocumentUploader } from "@/components/tvde/document-uploader";
import { PAYMENT_STATUS_LABEL } from "@/domain/payment";
import { formatMoney } from "@/domain/pricing";
import { REFUND_STATUS_LABEL } from "@/domain/refund";
import { formatDateTime } from "@/lib/dates";
import { requireSession } from "@/lib/guard";
import { getOwnApplication } from "@/lib/ownership";
import { reconcileApplication } from "@/services/tvde";
import { getApplicationForm } from "@/services/wegest";

export const metadata: Metadata = { title: "Candidatura" };

export default function ApplicationDetailPage({ params }: PageProps<"/[region]/tvde/minha-conta/candidaturas/[id]">) {
  return (
    <Suspense fallback={<Skeleton className="h-150" />}>
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }: { params: Promise<{ id: string; region: string }> }) {
  const { id, region } = await params;
  await requireSession(`/tvde/minha-conta/candidaturas/${id}`);
  const own = await getOwnApplication(id);
  if (!own) notFound();
  // Estado do WeGest + pagamento/reembolso do fornecedor (independentes, doc §66)
  const app = await reconcileApplication(own.application, own.session.user.email);
  const form = await getApplicationForm(region === "azores" ? "azores" : "mainland");
  const requestedTypes = app.requestedDocuments?.map((r) => r.type) ?? [];

  return (
    <div className="space-y-6">
      <Link href="/tvde/minha-conta/candidaturas" className="inline-flex items-center gap-1.5 text-body-small font-medium text-copy-secondary hover:text-copy max-md:min-h-(--layout-tap)">
        <ArrowLeft className="size-4" aria-hidden /> Candidaturas
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-h3 font-bold">Candidatura {app.reference}</h2>
        <ApplicationStatusBadge status={app.status} />
      </div>

      {(app.status === "approved" || app.status === "rejected") && (
        <TrackEvent name={app.status === "approved" ? "tvde_application_approved" : "tvde_application_rejected"} data={{ applicationId: app.id }} once={`decision:${app.id}`} />
      )}
      <Card className="p-6"><ApplicationTimeline status={app.status} paymentStatus={app.payment?.status} /></Card>

      {(app.status === "submitted" || app.status === "under_review") && (
        <Notice title="Candidatura em análise">Estamos a analisar os seus dados e documentação. Recebe um email quando houver uma decisão.</Notice>
      )}

      {app.status === "additional_documents_required" && (
        <section className="space-y-4">
          <Notice tone="warn" title="Precisamos de mais informação">
            {app.requestedDocuments?.map((r) => (
              <p key={r.type}><strong>{r.label}</strong>{r.message ? `: ${r.message}` : ""}</p>
            ))}
          </Notice>
          <DocumentUploader applicationId={app.id} requirements={form.documents.filter((d) => requestedTypes.includes(d.type))} documents={app.documents} highlight={requestedTypes} />
        </section>
      )}

      {app.status === "approved" && (
        <Card className="border-positive/40 p-6">
          <p className="display text-h2 text-positive">Candidatura aprovada</p>
          <p className="mt-2 text-copy-secondary">Levantamento: <strong>{formatDateTime(app.pickupAt)}</strong>, {app.pickupLocation.name}</p>
          {app.contract?.available && (
            <p className="mt-4 flex items-center gap-2 text-body-small"><FileCheck2 className="size-4 text-positive" aria-hidden /> Contrato {app.contract.id} disponível: apresentado no levantamento.</p>
          )}
          {app.statusMessage && <p className="mt-3 text-body text-copy-secondary">{app.statusMessage}</p>}
        </Card>
      )}

      {app.status === "rejected" && (
        <Card className="border-negative/30 p-6">
          <p className="text-h4 font-bold">Candidatura não aprovada</p>
          <p className="mt-1 text-copy-secondary">{app.statusMessage ?? "A sua candidatura não foi aprovada."}</p>
          {app.refund && (
            <dl className="mt-4 grid grid-cols-2 gap-3 rounded-card bg-panel-alt p-4 text-body-small">
              <div><dt className="text-copy-muted">Valor a devolver</dt><dd className="font-bold tabular">{formatMoney(app.refund.amount)}</dd></div>
              <div><dt className="text-copy-muted">Estado do reembolso</dt><dd className="font-bold">{REFUND_STATUS_LABEL[app.refund.status]}</dd></div>
            </dl>
          )}
        </Card>
      )}

      <Card>
        <dl className="divide-y divide-line text-body-small">
          {[
            ["Viatura", app.vehicleName],
            ["Levantamento pretendido", formatDateTime(app.pickupAt)],
            ["Local", app.pickupLocation.name],
            ["Preço semanal", `${formatMoney(app.weeklyPrice)}/semana`],
            ["Caução", formatMoney(app.deposit)],
            ["Pagamento", app.payment ? `${formatMoney(app.payment.amount)}, ${PAYMENT_STATUS_LABEL[app.payment.status]}` : "Sem pagamento"],
          ].map(([k, v]) => (
            <div key={k} className="grid gap-1 px-5 py-3.5 sm:grid-label-value"><dt className="text-copy-muted">{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold">Documentos enviados</h3>
        <ul className="mt-3 space-y-2 text-body-small">
          {app.documents.length ? app.documents.map((d) => (
            <li key={d.id} className="flex justify-between gap-4">
              <span>{form.documents.find((r) => r.type === d.type)?.label ?? d.type}</span>
              <span className="text-copy-muted">{d.fileName}</span>
            </li>
          )) : <li className="text-copy-muted">Nenhum documento.</li>}
        </ul>
      </Card>
    </div>
  );
}
