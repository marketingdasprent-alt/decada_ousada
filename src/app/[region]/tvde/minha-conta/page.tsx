import { Suspense } from "react";

import { EmptyState, ErrorState, Notice } from "@/components/shared/states";
import { ButtonLink, Skeleton } from "@/components/shared/ui";
import { ApplicationCard } from "@/components/tvde/application-card";
import { attempt } from "@/lib/attempt";
import { requireCustomer } from "@/lib/guard";
import { reconcileApplication } from "@/services/tvde";
import { getCustomer, listCustomerApplications } from "@/services/wegest";

export default function TvdeDashboard() {
  return (
    <Suspense fallback={<Skeleton className="h-80" />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const { session, customerId } = await requireCustomer("tvde", "/tvde/minha-conta");
  if (!customerId) {
    return (
      <>
        <h2 className="text-h2 font-bold">Olá{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}.</h2>
        <EmptyState className="mt-6" title="Ainda não tem candidaturas TVDE" description="Escolha uma viatura e candidate-se em poucos minutos." action={<ButtonLink href="/tvde/viaturas">Ver viaturas TVDE</ButtonLink>} />
      </>
    );
  }

  // Estado atual vem do WeGest (doc §69)
  const [driver, apps] = await Promise.all([attempt(() => getCustomer(customerId)), attempt(() => listCustomerApplications(customerId))]);
  if (!apps.ok) return <ErrorState timeout={apps.timeout} retryHref="/tvde/minha-conta" />;
  const list = await Promise.all(apps.data.map((a) => reconcileApplication(a, session.user.email)));
  const current = list.find((a) => !["rejected", "cancelled"].includes(a.status)) ?? list[0];
  const name = driver.ok && driver.data ? driver.data.firstName : session.user.name?.split(" ")[0];

  return (
    <div className="space-y-8">
      <h2 className="text-h2 font-bold">Olá{name ? `, ${name}` : ""}.</h2>
      {current?.status === "additional_documents_required" && (
        <Notice tone="warn" title="Precisamos de mais informação">
          A equipa pediu documentação adicional. <a href={`/tvde/minha-conta/candidaturas/${current.id}`} className="font-semibold underline">Enviar documento</a>
        </Notice>
      )}
      <section>
        <h3 className="mb-4 text-body-large font-bold">Candidatura atual</h3>
        {current ? <ApplicationCard app={current} /> : <EmptyState title="Sem candidaturas" action={<ButtonLink href="/tvde/viaturas" size="sm">Ver viaturas</ButtonLink>} />}
      </section>
      {list.length > 1 && (
        <section>
          <h3 className="mb-4 text-body-large font-bold">Histórico</h3>
          <div className="space-y-3">{list.filter((a) => a.id !== current?.id).map((a) => <ApplicationCard key={a.id} app={a} />)}</div>
        </section>
      )}
    </div>
  );
}
