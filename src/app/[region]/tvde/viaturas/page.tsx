import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { Container, Section } from "@/components/shared/ui";
import { VehicleResults } from "@/components/vehicles/vehicle-results";
import { getOffer } from "@/domain/vehicle";
import { attempt } from "@/lib/attempt";
import { regionFromParams } from "@/lib/region";
import { listVehicles } from "@/services/wegest";

export const metadata: Metadata = { title: "Viaturas TVDE" };

export default async function TvdeVehiclesPage({ params }: PageProps<"/[region]/tvde/viaturas">) {
  const region = await regionFromParams(params);
  const res = await attempt(() => listVehicles(region, "tvde"));
  return (
    <>
      <PageHeader tone="dark"
        title="Viaturas TVDE"
        description="Preço por semana. A disponibilidade é confirmada ao escolher a data e o local de levantamento."
        crumbs={[{ href: "/tvde", label: "TVDE" }, { label: "Viaturas" }]}
      />
      <Section><Container>
        {!res.ok ? (
          <ErrorState timeout={res.timeout} retryHref="/tvde/viaturas" />
        ) : res.data.length === 0 ? (
          <EmptyState title="Sem viaturas TVDE de momento" description="Volte em breve ou contacte-nos." />
        ) : (
          <VehicleResults product="tvde" items={res.data.map((v) => ({ vehicle: v, offer: getOffer(v, "tvde")!, href: `/tvde/viatura/${v.slug}` }))} />
        )}
      </Container></Section>
    </>
  );
}
