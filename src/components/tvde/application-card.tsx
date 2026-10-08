import { ChevronRight } from "lucide-react";
import Link from "next/link";

import type { TvdeApplication } from "@/domain/application";
import { formatMoney } from "@/domain/pricing";
import { formatDateTime } from "@/lib/dates";

import { ApplicationStatusBadge } from "./application-status";

export function ApplicationCard({ app }: { app: TvdeApplication }) {
  const href = app.status === "payment_pending" || app.status === "draft" ? `/tvde/candidatura/documentos?id=${app.id}` : `/tvde/minha-conta/candidaturas/${app.id}`;
  return (
    <Link href={href} className="flex items-center gap-4 rounded-panel border border-line bg-panel p-5 transition-colors hover:border-copy/25">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold">{app.vehicleName}</p>
          <ApplicationStatusBadge status={app.status} />
        </div>
        <p className="mt-1 text-body-small text-copy-secondary">Levantamento: {formatDateTime(app.pickupAt)}, {app.pickupLocation.name}</p>
        <p className="mt-0.5 text-caption text-copy-muted">Candidatura {app.reference}, {formatMoney(app.weeklyPrice)}/semana</p>
      </div>
      <ChevronRight className="size-5 text-copy-muted" aria-hidden />
    </Link>
  );
}
