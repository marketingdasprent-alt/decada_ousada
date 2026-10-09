import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { ContactValue } from "@/components/shared/pending";
import { Card, Container, Section } from "@/components/shared/ui";
import { REGION_CONFIG } from "@/domain/region";
import { cn } from "@/lib/cn";
import { fillSpanClasses } from "@/lib/grid";
import { regionFromParams } from "@/lib/region";
import { listLocations } from "@/services/wegest";

export const metadata: Metadata = { title: "Contactos" };

export default async function ContactsPage({ params }: PageProps<"/[region]/contactos">) {
  const region = await regionFromParams(params);
  const cfg = REGION_CONFIG[region];
  const locations = await listLocations(region);

  const locationSpans = fillSpanClasses(locations.length, { lg: 4 });
  return (
    <>
      <PageHeader title="Contactos" description="Fale connosco para reservas, candidaturas TVDE ou apoio durante o aluguer." crumbs={[{ label: "Contactos" }]} />
      <Section><Container className="grid gap-4 md:grid-cols-3">
        <Card className="p-6"><Phone className="size-6 text-brand" aria-hidden /><p className="mt-3 font-semibold">Telefone</p><ContactValue kind="phone" value={cfg.contact.phone} className="text-copy-secondary hover:text-copy" /></Card>
        <Card className="p-6"><Mail className="size-6 text-brand" aria-hidden /><p className="mt-3 font-semibold">Email</p><ContactValue kind="email" value={cfg.contact.email} className="text-copy-secondary hover:text-copy" /></Card>
        <Card className="p-6"><MapPin className="size-6 text-brand" aria-hidden /><p className="mt-3 font-semibold">Sede</p><p className="text-copy-secondary"><ContactValue kind="address" value={cfg.contact.address} /></p></Card>
      </Container></Section>
      <Section><Container>
        <h2 className="display text-h2">Balcões</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {locations.map((l, i) => (
            <li key={l.id} className={cn(locationSpans[i], "rounded-panel border border-line bg-panel p-5")}>
              <p className="font-bold">{l.name}</p>
              {l.address && <p className="mt-2 flex gap-2 text-body-small text-copy-secondary"><MapPin className="mt-0.5 size-4 shrink-0 text-copy-muted" aria-hidden />{l.address}</p>}
              {l.openingHours && <p className="mt-2 flex gap-2 text-body-small text-copy-secondary"><Clock className="mt-0.5 size-4 shrink-0 text-copy-muted" aria-hidden />{l.openingHours}</p>}
              {l.latitude && l.longitude && (
                <a className="mt-3 inline-block text-body-small font-medium text-brand underline underline-offset-4 max-md:tap-target" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${l.latitude},${l.longitude}`}>
                  Ver no mapa
                </a>
              )}
            </li>
          ))}
        </ul>
      </Container></Section>
    </>
  );
}
