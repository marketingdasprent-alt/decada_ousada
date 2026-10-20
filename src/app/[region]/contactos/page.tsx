import { Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader, PageSkeleton } from "@/components/shared/page-header";
import { ContactValue } from "@/components/shared/pending";
import { PickupPoints } from "@/components/shared/pickup-points";
import { Card, Container, Section } from "@/components/shared/ui";
import { REGION_CONFIG } from "@/domain/region";
import { regionFromParams } from "@/lib/region";
import { listLocations } from "@/services/wegest";

export const metadata: Metadata = { title: "Contactos" };

// Suspense: se o WeGest falhar no build, o conteúdo é gerado no pedido (ver catalog() em services/wegest)
export default function ContactsPage({ params }: PageProps<"/[region]/contactos">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ContactsContent params={params} />
    </Suspense>
  );
}

async function ContactsContent({ params }: { params: PageProps<"/[region]/contactos">["params"] }) {
  const region = await regionFromParams(params);
  const cfg = REGION_CONFIG[region];
  const locations = await listLocations(region);

  return (
    <>
      <PageHeader title="Contactos" description="Fale connosco para reservas, candidaturas TVDE ou apoio durante o aluguer." crumbs={[{ label: "Contactos" }]} />
      <Section><Container className="grid gap-4 md:grid-cols-2">
        <Card className="p-6"><Phone className="size-6 text-brand" aria-hidden /><p className="mt-3 font-semibold">Telefone</p><ContactValue kind="phone" value={cfg.contact.phone} className="text-copy-secondary hover:text-copy" /></Card>
        <Card className="p-6"><Mail className="size-6 text-brand" aria-hidden /><p className="mt-3 font-semibold">Email</p><ContactValue kind="email" value={cfg.contact.email} className="text-copy-secondary hover:text-copy" /></Card>
      </Container></Section>
      <PickupPoints title="Balcões" locations={locations} showMap />
    </>
  );
}
