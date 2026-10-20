import type { Metadata } from "next";
import { Suspense } from "react";

import { EmptyState, ErrorState } from "@/components/shared/states";
import { AccountApplicationForm } from "@/components/tvde/account-application";
import { ButtonLink, Skeleton } from "@/components/shared/ui";
import { ApplicationCard } from "@/components/tvde/application-card";
import { attempt } from "@/lib/attempt";
import { requireCustomer, requireSession } from "@/lib/guard";
import { accountApplicationEnabled, accountApplicationMock } from "@/services/account-application";
import { listCustomerApplications } from "@/services/wegest";

export const metadata: Metadata = { title: "Candidaturas" };

export default function ApplicationsPage() {
  return (
    <>
      <h2 className="text-h3 font-bold">{accountApplicationEnabled() ? "Candidatura TVDE" : "Candidaturas"}</h2>
      <Suspense fallback={<Skeleton className="mt-6 h-64" />}>
        <List />
      </Suspense>
    </>
  );
}

async function List() {
  // Conta WeGest: a candidatura é a da conta (/conta/candidatura), lida e gravada no browser
  if (accountApplicationEnabled()) {
    const session = await requireSession("/tvde/minha-conta/candidaturas");
    return <div className="mt-6"><AccountApplicationForm mock={accountApplicationMock()} email={session.user.email} /></div>;
  }
  const { customerId } = await requireCustomer("tvde", "/tvde/minha-conta/candidaturas");
  const res = customerId ? await attempt(() => listCustomerApplications(customerId)) : ({ ok: true, data: [] } as const);
  if (!res.ok) return <ErrorState className="mt-6" timeout={res.timeout} retryHref="/tvde/minha-conta/candidaturas" />;
  if (!res.data.length) return <EmptyState className="mt-6" title="Sem candidaturas" action={<ButtonLink href="/tvde/viaturas" size="sm">Ver viaturas TVDE</ButtonLink>} />;
  return <div className="mt-6 space-y-3">{res.data.map((a) => <ApplicationCard key={a.id} app={a} />)}</div>;
}
