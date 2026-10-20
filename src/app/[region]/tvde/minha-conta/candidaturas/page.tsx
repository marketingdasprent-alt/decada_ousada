import type { Metadata } from "next";
import { Suspense } from "react";

import { EmptyState, ErrorState } from "@/components/shared/states";
import { AccountApplicationForm } from "@/components/tvde/account-application";
import { ButtonLink, Skeleton } from "@/components/shared/ui";
import { ApplicationCard } from "@/components/tvde/application-card";
import { attempt } from "@/lib/attempt";
import { requireCustomer, requireSession } from "@/lib/guard";
import type { Region } from "@/domain/region";
import { regionFromParams } from "@/lib/region";
import { firstParam } from "@/lib/search";
import { accountApplicationEnabled, accountApplicationMock } from "@/services/account-application";
import { listCustomerApplications, listVehicles } from "@/services/wegest";

type SP = Record<string, string | string[] | undefined>;

export const metadata: Metadata = { title: "Candidaturas" };

export default async function ApplicationsPage({ params, searchParams }: PageProps<"/[region]/tvde/minha-conta/candidaturas">) {
  const region = await regionFromParams(params);
  return (
    <>
      <h2 className="text-h3 font-bold">{accountApplicationEnabled() ? "Candidatura TVDE" : "Candidaturas"}</h2>
      <Suspense fallback={<Skeleton className="mt-6 h-64" />}>
        <List region={region} searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function List({ region, searchParams }: { region: Region; searchParams: Promise<SP> }) {
  // Conta WeGest: a candidatura é a da conta (/conta/candidatura), lida e gravada no browser
  if (accountApplicationEnabled()) {
    const sp = await searchParams;
    const viatura = firstParam(sp.viatura);
    const inicio = firstParam(sp.inicio);
    const here = viatura && inicio ? `/tvde/minha-conta/candidaturas?${new URLSearchParams({ viatura, inicio })}` : "/tvde/minha-conta/candidaturas";
    const session = await requireSession(here);
    // Nomes dos modelos TVDE, para mostrar a viatura pretendida guardada no rascunho
    const vehicles = await attempt(() => listVehicles(region, "tvde"));
    const names = vehicles.ok ? Object.fromEntries(vehicles.data.map((v) => [v.id, v.name])) : {};
    // Viatura vinda de "Reservar esta viatura": só um modelo TVDE que existe e um dia AAAA-MM-DD
    const choice = viatura && names[viatura] && inicio && /^\d{4}-\d{2}-\d{2}$/.test(inicio) ? { id: viatura, name: names[viatura], startDate: inicio } : undefined;
    return <div className="mt-6"><AccountApplicationForm mock={accountApplicationMock()} email={session.user.email} choice={choice} vehicleNames={names} /></div>;
  }
  const { customerId } = await requireCustomer("tvde", "/tvde/minha-conta/candidaturas");
  const res = customerId ? await attempt(() => listCustomerApplications(customerId)) : ({ ok: true, data: [] } as const);
  if (!res.ok) return <ErrorState className="mt-6" timeout={res.timeout} retryHref="/tvde/minha-conta/candidaturas" />;
  if (!res.data.length) return <EmptyState className="mt-6" title="Sem candidaturas" action={<ButtonLink href="/tvde/viaturas" size="sm">Ver viaturas TVDE</ButtonLink>} />;
  return <div className="mt-6 space-y-3">{res.data.map((a) => <ApplicationCard key={a.id} app={a} />)}</div>;
}
