import type { Metadata } from "next";
import type { ReactNode } from "react";

import { CoverPhoto } from "@/components/shared/cover-photo";
import { Hero } from "@/components/shared/hero";
import { InstagramFeed } from "@/components/shared/instagram";
import { Testimonials } from "@/components/shared/testimonials";
import { ButtonLink, buttonClass, Container, Section, SectionHeading } from "@/components/shared/ui";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { DRIVER_CONTACT, DRIVER_FORMS, type DriverMode } from "@/domain/drivers";
import { getOffer } from "@/domain/vehicle";
import { cn } from "@/lib/cn";
import { regionFromParams } from "@/lib/region";
import { REGION_IMAGERY } from "@/lib/region-imagery";
import { listVehicles } from "@/services/wegest";

export const metadata: Metadata = {
  title: "Trabalhe como motorista TVDE",
  description:
    "Conduza com a DÉCADA OUSADA: renda fixa semanal, pagamento todas as semanas e suporte 7 dias. Alugue uma viatura nossa ou trabalhe como Slot com a sua.",
};

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=70`;

/** Números confirmados pela equipa (src/domain/drivers, DECISIONS.md 2026-10-12). */
const PROOF = [
  { value: "500+", label: "motoristas ativos na nossa estrutura" },
  { value: "100%", label: "das viaturas com seguro contra todos os riscos" },
  { value: "7 dias", label: "de suporte por semana, fins de semana incluídos" },
  { value: "24 h", label: "para lhe ligarmos depois da candidatura" },
];

const BENEFITS = [
  { title: "Custos claros e fixos", text: "Renda fixa semanal. Sabe exatamente quanto paga antes de sair de casa." },
  { title: "Pagamento semanal", text: "O dinheiro cai na sua conta todas as semanas." },
  { title: "Suporte 7 dias", text: "Uma equipa disponível todos os dias, fins de semana incluídos." },
  { title: "Sem burocracia", text: "Tratamos da papelada. Você conduz e fatura." },
  { title: "Horário seu", text: "Trabalhe quando e quanto quiser, sem horários mínimos nem penalizações por folgas." },
  { title: "Só precisa do certificado", text: "Sem empresa própria: com a licença TVDE trabalha como independente e passa recibo verde à semana." },
];

const MODES: Array<{ id: DriverMode; tag: string; title: string; image: string; points: string[]; cta: string }> = [
  {
    id: "aluguer",
    tag: "Não tenho carro",
    title: "Aluguer",
    image: photo("photo-1533558701576-23c65e0272fb"),
    points: [
      "Viatura pronta a trabalhar em Uber e Bolt",
      "Renda fixa semanal, sem custos escondidos",
      "Seguro contra todos os riscos incluído",
      "Categorias X Saver, Comfort, Black ou Green",
    ],
    cta: "Candidatar-me ao Aluguer",
  },
  {
    id: "slot",
    tag: "Já tenho carro",
    title: "Slot",
    image: photo("photo-1578041262130-633307b3bfd6"),
    points: [
      "Trabalha com o seu carro, como nosso parceiro",
      "Usa a nossa estrutura de operador TVDE certificado",
      "Pagamento semanal na sua conta",
      "Apoio administrativo 7 dias por semana",
    ],
    cta: "Candidatar-me como Slot",
  },
];

const STEPS = [
  { title: "Preencha o formulário", text: "Dois minutos. Diga-nos a sua situação e como quer trabalhar.", image: photo("photo-1764347923709-fc48487f2486") },
  { title: "Nós ligamos-lhe", text: "Em menos de 24 horas úteis, para tratar dos documentos.", image: photo("photo-1520088096110-20308c23a3cd") },
  { title: "Comece a faturar", text: "Aprovação em 24 a 48 horas úteis e apoio desde o primeiro dia.", image: photo("photo-1751498273591-1b93d0dd490a") },
];

const DOCUMENTS = ["Licença TVDE válida", "Carta de condução", "Cartão de cidadão ou passaporte", "Registo criminal", "Comprovativo de morada", "IBAN para receber os pagamentos"];

const FAQ = [
  { q: "Preciso de ter empresa para trabalhar convosco?", a: "Não. Trabalha como trabalhador independente com a sua licença TVDE e emite semanalmente um recibo verde para receber os seus ganhos. Damos apoio na parte administrativa." },
  { q: "Como funciona o pagamento?", a: "O pagamento é feito todas as semanas, diretamente na sua conta bancária. Paga apenas um valor fixo de aluguer semanal. As comissões das plataformas (Uber, Bolt) aplicam-se normalmente." },
  { q: "Que documentos preciso para me candidatar?", a: "Licença TVDE válida, carta de condução, documento de identificação (cartão de cidadão ou passaporte), registo criminal, comprovativo de morada e IBAN para receber os pagamentos." },
  { q: "Posso trabalhar quando quiser?", a: "Sim. Não há horários mínimos obrigatórios nem penalizações por dias de folga." },
  { q: "E se não tiver licença TVDE?", a: "A licença TVDE é obrigatória por lei para exercer a atividade. Para a obter, procure um centro de formação certificado na sua zona." },
  { q: "Quanto tempo demora a aprovação?", a: "Depois de submeter a candidatura e os documentos, a aprovação demora normalmente 24 a 48 horas úteis." },
  { q: "Que viaturas têm disponíveis?", a: "Viaturas para as categorias X Saver, Comfort, Black, Green (elétricos), X Priority e outras." },
  { q: "Qual é a diferença entre Aluguer e Slot?", a: "No Aluguer, fornecemos a viatura e você trabalha com ela. No Slot, já tem viatura própria e usa a nossa estrutura e apoio para trabalhar nas plataformas." },
];

/** Link para fora do site: abre noutro separador e di-lo a quem usa leitor de ecrã. */
function ExternalButton({ href, children, variant = "primary", className }: { href: string; children: ReactNode; variant?: "primary" | "light" | "outline" | "onDark"; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClass(variant, "lg", className)}>
      {children}
      <span className="sr-only">(abre noutro separador)</span>
    </a>
  );
}

export default async function DriversPage({ params }: PageProps<"/[region]/motoristas">) {
  const region = await regionFromParams(params);
  const vehicles = (await listVehicles(region, "tvde")).slice(0, 3);

  return (
    <>
      <Hero
        region={region}
        images={[REGION_IMAGERY[region].tvde, { id: "photo-1773063449875-332dff62b6e3", x: 50, y: 40, subject: "Motorista ao volante" }]}
        title={<>Conduza. Fature.<br /><span className="text-brand">Receba à semana.</span></>}
        description="Renda fixa semanal, pagamento todas as semanas e suporte 7 dias. Já somos mais de 500 motoristas."
        crumbs={[{ label: "Motoristas" }]}
      >
        {/* A escolha que muda a candidatura: com ou sem carro */}
        <p className="font-semibold" id="modalidade-titulo">Como quer trabalhar?</p>
        <div className="mt-3 grid max-w-xl gap-3 sm:grid-cols-2" role="group" aria-labelledby="modalidade-titulo">
          <a href="#aluguer" className="rounded-panel bg-brand px-5 py-4 text-on-brand transition-colors hover:bg-brand-hover">
            <span className="block font-bold">Preciso de carro</span>
            <span className="text-body-small">Alugo uma viatura vossa</span>
          </a>
          <a href="#slot" className="rounded-panel border border-on-dark/40 px-5 py-4 text-on-dark transition-colors hover:bg-on-dark/10">
            <span className="block font-bold">Tenho carro</span>
            <span className="text-body-small text-on-dark/80">Trabalho como Slot</span>
          </a>
        </div>
        <p className="mt-5 text-body-small text-on-dark/80">Parceiro oficial Uber e Bolt · Top 5% PME 2024</p>
      </Hero>

      {/* Números sobre uma foto da estrada, não sobre fundo liso */}
      <section aria-label="A DÉCADA OUSADA em números" className="relative isolate overflow-hidden bg-panel-dark text-on-dark">
        <CoverPhoto src={photo("photo-1531259267539-a45cfb4fe070")} sizes="100vw" className="-z-10 opacity-40" />
        <Container className="py-14">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PROOF.map((p) => (
              <li key={p.value} className="border-t border-on-dark/30 pt-4">
                <p className="display text-h1 tabular">{p.value}</p>
                <p className="mt-1 text-on-dark/85">{p.label}</p>
              </li>
            ))}
          </ul>
          <ul className="mt-10 flex flex-wrap gap-x-10 gap-y-3 text-body-small text-on-dark/85">
            <li><span className="font-semibold text-on-dark">Top 5% Melhores PME</span>, Portugal 2024, 2.º ano consecutivo</li>
            <li><span className="font-semibold text-on-dark">1500 Maiores Empresas</span>, distrito de Coimbra 2023</li>
          </ul>
        </Container>
      </section>

      {/* Benefícios: texto à esquerda, foto a ocupar a coluna da direita */}
      <Section>
        <Container className="grid gap-10 lg:grid-cols-5 lg:gap-14">
          <div className="lg:col-span-3">
            <SectionHeading title="O que muda quando conduz connosco" description="Sabe quanto paga, recebe todas as semanas e tem alguém do outro lado da linha sete dias por semana." />
            <dl className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {BENEFITS.map((b) => (
                <div key={b.title} className="border-t border-line pt-4">
                  <dt className="font-bold">{b.title}</dt>
                  <dd className="mt-1 text-copy-secondary">{b.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative min-h-80 overflow-hidden rounded-panel bg-panel-sunken lg:col-span-2">
            <CoverPhoto src={photo("photo-1527593167147-e9c94a5883e6")} sizes="(min-width: 1024px) 40vw, 100vw" />
          </div>
        </Container>
      </Section>

      {/* Aluguer ou Slot: as duas portas de entrada, cada uma com o seu formulário */}
      <Section surface aria-labelledby="modalidades-titulo">
        <Container>
          <SectionHeading
            title={<span id="modalidades-titulo">Aluguer ou Slot?</span>}
            description="No Aluguer, damos-lhe a viatura. No Slot, trabalha com a sua e usa a nossa estrutura de operador para estar nas plataformas."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {MODES.map((m) => (
              <article key={m.id} id={m.id} className="scroll-mt-24 overflow-hidden rounded-panel border border-line bg-panel">
                <div className="relative aspect-video bg-panel-sunken">
                  <CoverPhoto src={m.image} sizes="(min-width: 1024px) 50vw, 100vw" />
                </div>
                <div className="p-6 sm:p-8">
                  <p className="text-body-small font-semibold text-brand">{m.tag}</p>
                  <h3 className="display mt-1 text-h2">{m.title}</h3>
                  <ul className="mt-4 space-y-2 text-copy-secondary">
                    {m.points.map((p) => (
                      <li key={p} className="border-l-2 border-brand pl-3">{p}</li>
                    ))}
                  </ul>
                  <ExternalButton href={DRIVER_FORMS[m.id]} variant={m.id === "aluguer" ? "primary" : "outline"} className="mt-6 w-full sm:w-auto">{m.cta}</ExternalButton>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* Frota real, do WeGest (o mesmo catálogo das páginas TVDE) */}
      {vehicles.length > 0 && (
        <Section>
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading title="A frota" description="Viaturas para as categorias X Saver, Comfort, Black e Green, com preço semanal, caução e km incluídos à vista." />
              <ButtonLink href="/tvde/viaturas" variant="outline">Ver todas as viaturas TVDE</ButtonLink>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} offer={getOffer(v, "tvde")!} href={`/tvde/viatura/${v.slug}`} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Três passos: o número fica sobre a foto do que acontece em cada um */}
      <Section className="bg-panel-dark text-on-dark" aria-labelledby="passos-titulo">
        <Container>
          <h2 id="passos-titulo" className="display text-h2">Da candidatura à estrada</h2>
          <p className="mt-3 max-w-2xl text-on-dark/75">Três passos, com aprovação em 24 a 48 horas úteis.</p>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <div className="relative aspect-4/3 overflow-hidden rounded-panel bg-on-dark/10">
                  <CoverPhoto src={s.image} sizes="(min-width: 768px) 33vw, 100vw" />
                  <span className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-panel-dark/80 to-transparent" aria-hidden />
                  <span className="display absolute bottom-3 left-4 text-h1 text-on-dark" aria-hidden>{i + 1}</span>
                </div>
                <h3 className="mt-4 font-bold">{s.title}</h3>
                <p className="mt-1 text-on-dark/75">{s.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Testimonials service="tvde" />

      {/* Dúvidas antes de se candidatar */}
      <Section aria-labelledby="duvidas-titulo">
        <Container className="grid gap-10 lg:grid-cols-3">
          <div>
            <h2 id="duvidas-titulo" className="display text-h2">Antes de se candidatar</h2>
            <p className="mt-3 text-copy-secondary">
              Não encontra a resposta?{" "}
              <a href={DRIVER_CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline underline-offset-4">
                Escreva-nos no WhatsApp<span className="sr-only"> (abre noutro separador)</span>
              </a>
              , respondemos todos os dias.
            </p>
          </div>
          <div className="divide-y divide-line overflow-hidden rounded-panel border border-line bg-panel lg:col-span-2">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group px-5 py-4">
                <summary className="cursor-pointer list-none font-semibold marker:hidden max-md:tap-target max-md:w-full">
                  <span className="flex items-center justify-between gap-4">
                    {q}
                    <span className="text-brand transition-transform group-open:rotate-45" aria-hidden>+</span>
                  </span>
                </summary>
                <p className="mt-3 text-copy-secondary">{a}</p>
              </details>
            ))}
          </div>
        </Container>
      </Section>

      {/* Candidatura: documentos à mão e os dois formulários do WeGest */}
      <Section id="candidatura" surface aria-labelledby="candidatura-titulo" className="scroll-mt-16">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 id="candidatura-titulo" className="display text-h2">Comece a faturar já</h2>
            <p className="mt-3 text-copy-secondary">
              Escolha a sua situação e preencha o formulário: são cerca de 2 minutos e não tem compromisso. Ligamos-lhe em menos de 24 horas.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ExternalButton href={DRIVER_FORMS.aluguer}>Preciso de carro</ExternalButton>
              <ExternalButton href={DRIVER_FORMS.slot} variant="outline">Tenho carro (Slot)</ExternalButton>
            </div>
            <p className="mt-3 text-body-small text-copy-muted">O formulário abre noutro separador, no sistema de gestão da DÉCADA OUSADA.</p>
          </div>
          <div className="rounded-panel border border-line bg-panel p-6 sm:p-8">
            <h3 className="font-bold">Tenha à mão</h3>
            <ul className="mt-4 grid gap-x-6 gap-y-2 text-copy-secondary sm:grid-cols-2">
              {DOCUMENTS.map((d) => (
                <li key={d} className="border-l-2 border-brand pl-3">{d}</li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <InstagramFeed />

      {/* Contacto direto da equipa de motoristas, sobre foto */}
      <section aria-labelledby="contacto-titulo" className="relative isolate overflow-hidden bg-panel-dark text-on-dark">
        <CoverPhoto src={photo("photo-1612709060421-596380268eaf")} sizes="100vw" position="70% 40%" className="-z-10 opacity-35" />
        <Container className="grid gap-10 py-16 lg:grid-cols-2 lg:items-end">
          <div>
            <h2 id="contacto-titulo" className="display text-h2">Prefere falar com alguém?</h2>
            <p className="mt-3 max-w-lg text-on-dark/85">Tire dúvidas sobre viaturas, valores ou documentos antes de se candidatar. Atendemos 7 dias por semana.</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { label: "WhatsApp", value: DRIVER_CONTACT.phone, href: DRIVER_CONTACT.whatsappHref, external: true },
              { label: "Telefone", value: DRIVER_CONTACT.phone, href: DRIVER_CONTACT.phoneHref },
              { label: "Email", value: DRIVER_CONTACT.email, href: `mailto:${DRIVER_CONTACT.email}` },
            ].map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={cn("block rounded-panel border border-on-dark/25 bg-panel-dark/60 px-5 py-4 transition-colors hover:border-on-dark/60")}
                >
                  <span className="block text-body-small text-on-dark/75">{c.label}</span>
                  <span className="block break-all font-semibold">{c.value}</span>
                  {c.external && <span className="sr-only"> (abre noutro separador)</span>}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
