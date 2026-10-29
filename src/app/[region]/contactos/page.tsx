import { Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHeader, PageSkeleton } from "@/components/shared/page-header";
import { ContactValue } from "@/components/shared/pending";
import { PickupPoints } from "@/components/shared/pickup-points";
import { Card, Container, Section } from "@/components/shared/ui";
import { REGION_CONFIG } from "@/domain/region";
import { RENTACAR_CONTACT } from "@/domain/rentacar/contact";
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
        {[{ label: "Rent a Car", contact: RENTACAR_CONTACT }, { label: "TVDE", contact: cfg.contact }].map(({ label, contact }) => (
          <Card key={label} className="p-6">
            <h2 className="text-h3 font-bold">{label}</h2>
            <div className="mt-3 flex items-center gap-2"><Phone className="size-5 shrink-0 text-brand" aria-hidden /><ContactValue kind="phone" value={contact.phone} className="text-copy-secondary hover:text-copy max-md:tap-target" /></div>
            <div className="flex items-center gap-2"><Mail className="size-5 shrink-0 text-brand" aria-hidden /><ContactValue kind="email" value={contact.email} className="wrap-anywhere text-body-small text-copy-secondary hover:text-copy max-md:tap-target" /></div>
          </Card>
        ))}
      </Container></Section>
      <PickupPoints title="Balcões" locations={locations} showMap />
    </>
  );
}
