import { MapPin } from "lucide-react";
import Link from "next/link";

import type { Location } from "@/domain/location";

import { Container, Section, SectionHeading } from "./ui";

/**
 * Pontos de levantamento devolvidos pela API (página inicial, Rent a Car, Contactos).
 * Lista e não cartões: a API pode devolver só o nome, e morada, horário e mapa entram
 * quando existirem. Sem pontos, a secção não aparece.
 */
export function PickupPoints({
  title,
  description = "Escolha o ponto para ver a frota e pesquisar com as suas datas.",
  locations,
  showMap = false,
}: {
  title: string;
  description?: string;
  locations: Location[];
  /** "Ver no mapa" quando a API devolve coordenadas (página de contactos). */
  showMap?: boolean;
}) {
  if (locations.length === 0) return null;
  return (
    <Section><Container className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <SectionHeading className="lg:col-span-5" title={title} description={description} />
      <ul className="divide-y divide-line border-y border-line lg:col-span-7">
        {locations.map((l) => (
          <li key={l.id} className="py-5">
            <Link href={`/rent-a-car/${l.slug}`} className="group flex items-start gap-4">
              <MapPin className="mt-0.5 size-6 shrink-0 text-brand" aria-hidden />
              <span>
                <span className="display block text-h3 transition-colors group-hover:text-brand">{l.name}</span>
                {l.address && <span className="mt-1 block text-body-small text-copy-secondary">{l.address}</span>}
                {l.openingHours && <span className="mt-1 block text-caption text-copy-muted">{l.openingHours}</span>}
                {!l.returnAvailable && <span className="mt-1 block text-caption text-caution">Apenas levantamento</span>}
              </span>
            </Link>
            {/* Link próprio, fora do link do ponto, alinhado com o texto (ícone de 24 px + espaço de 16 px) */}
            {showMap && l.latitude && l.longitude && (
              <a
                className="mt-2 ml-10 inline-block text-body-small font-medium text-brand underline underline-offset-4 max-md:tap-target"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.google.com/maps/search/?api=1&query=${l.latitude},${l.longitude}`}
              >
                Ver no mapa<span className="sr-only">: {l.name}</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </Container></Section>
  );
}
