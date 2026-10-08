import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import { REGION_CONFIG, type Region } from "@/domain/region";
import { regionSwitchHref } from "@/lib/region";

import { ContactValue } from "../shared/pending";
import { Container } from "../shared/ui";
import { Logo } from "../shared/logo";

export function SiteFooter({ region }: { region: Region }) {
  const cfg = REGION_CONFIG[region];
  const other: Region = region === "azores" ? "mainland" : "azores";
  return (
    <footer className="mt-24 bg-panel-dark text-on-dark/70">
      <div className="h-1 bg-brand" aria-hidden />
      <Container className="grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo region={region} variant="dark" className="h-16" />
          <p className="mt-4 text-body-small">Rent a Car e viaturas TVDE {region === "azores" ? "nos Açores" : "em Portugal Continental"}.</p>
        </div>
        <div>
          <h2 className="mb-3 text-body-small font-semibold uppercase tracking-wider text-on-dark">Rent a Car</h2>
          <ul className="space-y-2 text-body-small max-md:space-y-0">
            <li><Link className="hover:text-on-dark max-md:tap-target" href="/rent-a-car">Pesquisar viaturas</Link></li>
            <li><Link className="hover:text-on-dark max-md:tap-target" href="/rent-a-car/viaturas">Ver frota</Link></li>
            <li><Link className="hover:text-on-dark max-md:tap-target" href="/minha-conta/reservas">As minhas reservas</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-body-small font-semibold uppercase tracking-wider text-on-dark">TVDE</h2>
          <ul className="space-y-2 text-body-small max-md:space-y-0">
            <li><Link className="hover:text-on-dark max-md:tap-target" href="/tvde">Como funciona</Link></li>
            <li><Link className="hover:text-on-dark max-md:tap-target" href="/tvde/viaturas">Viaturas TVDE</Link></li>
            <li><Link className="hover:text-on-dark max-md:tap-target" href="/tvde/minha-conta">A minha candidatura</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-body-small font-semibold uppercase tracking-wider text-on-dark">Contactos</h2>
          <ul className="space-y-2 text-body-small max-md:space-y-0">
            <li className="flex items-center gap-2"><Phone className="size-4" aria-hidden /><ContactValue kind="phone" value={cfg.contact.phone} className="hover:text-on-dark max-md:tap-target" /></li>
            <li className="flex items-center gap-2"><Mail className="size-4" aria-hidden /><ContactValue kind="email" value={cfg.contact.email} className="hover:text-on-dark max-md:tap-target" /></li>
            <li className="flex items-center gap-2"><MapPin className="size-4" aria-hidden /><ContactValue kind="address" value={cfg.contact.address} /></li>
          </ul>
        </div>
      </Container>
      <Container className="flex flex-col gap-3 border-t border-on-dark/10 py-6 text-caption sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 DÉCADA OUSADA. Todos os direitos reservados.</p>
        <div className="flex gap-4">
          <Link className="hover:text-on-dark max-md:tap-target" href="/perguntas-frequentes">Perguntas frequentes</Link>
          <a className="hover:text-on-dark max-md:tap-target" href={regionSwitchHref(other)}>{REGION_CONFIG[other].label}</a>
        </div>
      </Container>
    </footer>
  );
}
