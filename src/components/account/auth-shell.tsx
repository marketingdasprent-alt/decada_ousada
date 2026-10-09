import { CalendarCheck, FileText, IdCard } from "lucide-react";
import type { ReactNode } from "react";

import type { Region } from "@/domain/region";
import { REGION_IMAGERY } from "@/lib/region-imagery";

import { HeroBackground } from "../shared/hero-background";
import { RegionLines } from "../shared/region-lines";
import { Container, Section } from "../shared/ui";

/** O que a conta dá, pela ordem das áreas de cliente (Rent a Car, TVDE, documentos). */
const BENEFITS = [
  { icon: CalendarCheck, text: "Reservas Rent a Car e o estado de cada uma" },
  { icon: IdCard, text: "Candidaturas TVDE, do envio dos documentos à resposta" },
  { icon: FileText, text: "Pagamentos, faturas e documentos num só lugar" },
];

/**
 * Páginas de conta (entrar, criar conta, recuperar password): um só cartão, com a foto da
 * região e o que a conta dá à esquerda (desktop) e o formulário à direita. Em mobile fica
 * só o formulário, com a faixa da cor da marca no topo do cartão.
 */
export function AuthShell({ region, title, description, children }: { region: Region; title: string; description?: string; children: ReactNode }) {
  return (
    <Section>
      <Container>
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-feature border border-line bg-panel shadow-floating lg:grid-cols-2">
          <div className="relative isolate hidden flex-col justify-end gap-8 overflow-hidden bg-panel-dark p-10 text-on-dark lg:flex">
            <HeroBackground images={[REGION_IMAGERY[region].home]} />
            <div className="hero-veil absolute inset-0 -z-10" aria-hidden />
            <RegionLines region={region} className="absolute -right-16 -top-6 -z-10 w-110 opacity-60" />
            <p className="display text-h2">A sua conta DÉCADA OUSADA</p>
            <ul className="space-y-4">
              {BENEFITS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-on-dark/90">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-card bg-on-dark/10 text-on-dark" aria-hidden>
                    <Icon className="size-5" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t-4 border-brand p-6 sm:p-10 lg:border-t-0">
            <h1 className="display text-h1">{title}</h1>
            {description && <p className="mt-2 text-copy-secondary">{description}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
