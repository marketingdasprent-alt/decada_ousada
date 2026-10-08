import { Download } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { EmptyState, ErrorState } from "@/components/shared/states";
import { Skeleton } from "@/components/shared/ui";
import { formatMoney } from "@/domain/pricing";
import { attempt } from "@/lib/attempt";
import { formatDate } from "@/lib/dates";
import { requireCustomer } from "@/lib/guard";
import { listCustomerInvoices } from "@/services/wegest";

export const metadata: Metadata = { title: "Faturas" };

export default function InvoicesPage() {
  return (
    <>
      <h2 className="text-h3 font-bold">Faturas e documentos</h2>
      <div className="mt-6">
        <Suspense fallback={<Skeleton className="h-64" />}>
          <Invoices />
        </Suspense>
      </div>
    </>
  );
}

async function Invoices() {
  const { customerId } = await requireCustomer("rentacar", "/minha-conta/faturas");
  const res = customerId ? await attempt(() => listCustomerInvoices(customerId)) : ({ ok: true, data: [] } as const);
  if (!res.ok) return <ErrorState timeout={res.timeout} retryHref="/minha-conta/faturas" />;
  if (!res.data.length) return <EmptyState title="Ainda não tem faturas" description="As faturas aparecem aqui depois de emitidas." />;
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-panel border border-line bg-panel">
      {res.data.map((i) => (
        <li key={i.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{i.number}</p>
            <p className="text-body-small text-copy-muted">{formatDate(i.issuedAt.slice(0, 10))}{i.bookingReference ? `, Reserva ${i.bookingReference}` : ""}</p>
          </div>
          <p className="font-bold tabular">{formatMoney(i.total, "EUR", { decimals: true })}</p>
          {i.downloadPath && (
            <a href={i.downloadPath} target="_blank" rel="noopener" className="flex min-h-11 items-center gap-1.5 rounded-control border border-line px-3 py-2 text-body-small font-medium hover:border-copy/30">
              <Download className="size-4" aria-hidden /> Descarregar
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
