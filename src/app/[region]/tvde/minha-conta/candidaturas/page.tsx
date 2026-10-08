import type { Metadata } from "next";
import { Suspense } from "react";

import { EmptyState, ErrorState } from "@/components/shared/states";
import { ButtonLink, Skeleton } from "@/components/shared/ui";
import { ApplicationCard } from "@/components/tvde/application-card";
import { attempt } from "@/lib/attempt";
import { requireCustomer } from "@/lib/guard";
import { listCustomerApplications } from "@/services/wegest";

export const metadata: Metadata = { title: "Candidaturas" };

export default function ApplicationsPage() {
  return (
    <>
      <h2 className="text-h3 font-bold">Candidaturas</h2>
      <Suspense fallback={<Skeleton className="mt-6 h-64" />}>
        <List />
      </Suspense>
    </>
  );
}

async function List() {
  const { customerId } = await requireCustomer("tvde", "/tvde/minha-conta/candidaturas");
  const res = customerId ? await attempt(() => listCustomerApplications(customerId)) : ({ ok: true, data: [] } as const);
  if (!res.ok) return <ErrorState className="mt-6" timeout={res.timeout} retryHref="/tvde/minha-conta/candidaturas" />;
  if (!res.data.length) return <EmptyState className="mt-6" title="Sem candidaturas" action={<ButtonLink href="/tvde/viaturas" size="sm">Ver viaturas TVDE</ButtonLink>} />;
  return <div className="mt-6 space-y-3">{res.data.map((a) => <ApplicationCard key={a.id} app={a} />)}</div>;
}
