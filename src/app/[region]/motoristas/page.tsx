import type { Metadata } from "next";
import { Suspense } from "react";

import { CountUp } from "@/components/drivers/count-up";
import { applyLink, opensNewTab } from "@/components/drivers/apply-link";
import { DriverApplyDialog } from "@/components/drivers/driver-apply-dialog";
import { DriverFormEmbed } from "@/components/drivers/driver-form-embed";
import { DriverLeadForm } from "@/components/drivers/driver-lead-form";
import { DriversHero } from "@/components/drivers/drivers-hero";
import { HostedForms } from "@/components/drivers/hosted-forms";
import { Marquee } from "@/components/drivers/marquee";
import { CoverPhoto } from "@/components/shared/cover-photo";
import { InstagramFeed } from "@/components/shared/instagram";
import { PageSkeleton } from "@/components/shared/page-header";
import { Testimonials } from "@/components/shared/testimonials";
import { ButtonLink, buttonClass, Container, Section, SectionHeading } from "@/components/shared/ui";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { DRIVER_CONTACT, DRIVER_FORM_KIND, DRIVER_FORM_OPEN, type DriverMode } from "@/domain/drivers";
import { getOffer } from "@/domain/vehicle";
import { cn } from "@/lib/cn";
import { regionFromParams } from "@/lib/region";
import { driverLeadsReady } from "@/services/leads";
import { listVehicles } from "@/services/wegest";

export const metadata: Metadata = {
  title: "Trabalhe como motorista TVDE",
  description:
    "Trabalhe como motorista TVDE com a DÉCADA OUSADA. Compare Aluguer e Slot, conheça as condições e candidate-se com a sua viatura ou uma da nossa frota.",
};

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=70`;

/** Números confirmados pela equipa (src/domain/drivers, DECISIONS.md 2026-10-12). */
const PROOF = [
  { value: "500+", label: "motoristas ativos na nossa estrutura" },
  { value: "7 dias", label: "de suporte por semana, fins de semana incluídos" },
  { value: "24 h", label: "úteis para lhe ligarmos após a candidatura" },
];

/** Faixa de fotos (Continente): lugares e momentos ao volante. Fotos do Unsplash, legenda só com o que mostram. */
const STRIP = [
  { id: "photo-1658750424913-ee539cd2119a", caption: "Porto" },
  { id: "photo-1612709060421-596380268eaf", caption: "Ao volante" },
  { id: "photo-1562002647-2615618762c5", caption: "Coimbra", wide: true },
  { id: "photo-1707758283052-f1e3a2d42333", caption: "Categoria Green" },
  { id: "photo-1747345255403-0143c2d5ecd5", caption: "Lisboa" },
  { id: "photo-1762452494414-6b0b23f78ce0", caption: "Porto ao fim do dia", wide: true },
  { id: "photo-1527593167147-e9c94a5883e6", caption: "Turno da manhã" },
  { id: "photo-1635893312205-6abda7db17a0", caption: "Coimbra" },
  { id: "photo-1626455613245-066bf428283c", caption: "Lisboa ao pôr do sol", wide: true },
];

const TAPE_PROMISE = ["Conduza", "Fature", "Receba à semana", "Uber", "Bolt", "Suporte 7 dias"];
const TAPE_FLEET = ["Aluguer", "Slot", "X Saver", "Comfort", "Black", "Green"];

const BENEFITS = [
  { title: "Conheça os custos de aluguer", text: "Consulte o preço por semana, a caução e os quilómetros incluídos antes de escolher a viatura." },
  { title: "Pagamento semanal", text: "Receba os ganhos da sua atividade na sua conta bancária, todas as semanas." },
  { title: "Suporte 7 dias", text: "Uma equipa disponível todos os dias, fins de semana incluídos." },
  { title: "Apoio com os documentos", text: "A equipa acompanha a documentação e dá apoio administrativo à sua atividade TVDE." },
  { title: "Escolha o seu horário", text: "Trabalhe quando e quanto quiser, sem horários mínimos nem penalizações por folgas." },
  { title: "Trabalhe como independente", text: "Com licença TVDE e a documentação necessária, pode trabalhar connosco sem criar uma empresa." },
];

const MODES: Array<{ id: DriverMode; tag: string; title: string; image: string; points: string[]; cta: string }> = [
  {
    id: "aluguer",
    tag: "Não tenho carro",
    title: "Aluguer",
    image: photo("photo-1533558701576-23c65e0272fb"),
    points: [
      "Viatura pronta a trabalhar em Uber e Bolt",
      "Valor de aluguer por semana indicado na viatura",
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
      "Conduza a sua própria viatura como nosso parceiro",
      "Usa a nossa estrutura de operador TVDE certificado",
      "Pagamento semanal na sua conta",
      "Apoio administrativo 7 dias por semana",
    ],
    cta: "Candidatar-me como Slot",
  },
];

const STEPS = [
  { title: "Preencha o formulário", text: "Escolha Aluguer ou Slot e indique os seus dados. O formulário demora cerca de 2 minutos.", image: photo("photo-1764347923709-fc48487f2486") },
  { title: "Nós ligamos-lhe", text: "Em menos de 24 horas úteis, falamos consigo sobre a modalidade e os documentos necessários.", image: photo("photo-1520088096110-20308c23a3cd") },
  { title: "Após a aprovação, comece a conduzir", text: "A candidatura e os documentos são analisados. A aprovação demora normalmente 24 a 48 horas úteis.", image: photo("photo-1751498273591-1b93d0dd490a") },
];

const DOCUMENTS = ["Licença TVDE válida", "Carta de condução", "Cartão de cidadão ou passaporte", "Registo criminal", "Comprovativo de morada", "IBAN para receber os pagamentos"];

const FAQ = [
  { q: "Preciso de ter empresa para trabalhar convosco?", a: "Não. Trabalha como trabalhador independente com a sua licença TVDE e emite semanalmente um recibo verde para receber os seus ganhos. Damos apoio na parte administrativa." },
  { q: "Como funciona o pagamento?", a: "Os ganhos da sua atividade são pagos semanalmente, por transferência bancária. Na modalidade Aluguer, o valor semanal indicado refere-se ao custo da viatura. As comissões da Uber e da Bolt aplicam-se normalmente. Consulte as condições da modalidade escolhida com a equipa." },
  { q: "Que documentos preciso para me candidatar?", a: "Licença TVDE válida, carta de condução, documento de identificação (cartão de cidadão ou passaporte), registo criminal, comprovativo de morada e IBAN para receber os pagamentos." },
  { q: "Posso trabalhar quando quiser?", a: "Sim. Não há horários mínimos obrigatórios nem penalizações por dias de folga." },
  { q: "E se não tiver licença TVDE?", a: "A licença TVDE é obrigatória por lei para exercer a atividade. Para a obter, procure um centro de formação certificado na sua zona." },
  { q: "Quanto tempo demora a aprovação?", a: "Depois de submeter a candidatura e os documentos, a aprovação demora normalmente 24 a 48 horas úteis." },
  { q: "Que viaturas têm disponíveis?", a: "Viaturas para as categorias X Saver, Comfort, Black, Green (elétricos), X Priority e outras." },
  { q: "Qual é a diferença entre Aluguer e Slot?", a: "No Aluguer, trabalha com uma viatura da nossa frota e paga o respetivo aluguer. No Slot, trabalha com a sua própria viatura através da nossa estrutura de operador TVDE. A equipa explica-lhe as condições de cada modalidade." },
];

// Suspense: se o WeGest falhar no build, o conteúdo é gerado no pedido (ver catalog() em services/wegest)
export default function DriversPage({ params }: PageProps<"/[region]/motoristas">) {
  return (
    <Suspense fallback={<PageSkeleton tone="dark" />}>
      <DriversContent params={params} />
    </Suspense>
  );
}

async function DriversContent({ params }: { params: PageProps<"/[region]/motoristas">["params"] }) {
  const region = await regionFromParams(params);
  const vehicles = (await listVehicles(region, "tvde")).slice(0, 3);

  return (
    <>
      <DriversHero region={region} />

      {/* Números sobre uma foto da estrada, não sobre fundo liso */}
      <section aria-label="A DÉCADA OUSADA em números" className="relative isolate overflow-hidden bg-panel-dark text-on-dark">
        <CoverPhoto src={photo("photo-1531259267539-a45cfb4fe070")} sizes="100vw" className="-z-10 opacity-40" />
        <Container className="py-14">
          <ul className="grid gap-8 sm:grid-cols-3">
            {PROOF.map((p) => (
              <li key={p.value} className="border-t border-on-dark/30 pt-4">
                <p className="display text-h1 tabular"><CountUp value={p.value} /></p>
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

      {region === "mainland" && (
        <Marquee pauseOnHover className="py-12" trackClassName="gap-6 pr-6">
          {STRIP.map((p, i) => (
            <figure key={`${p.id}-${i}`} className={cn("shrink-0", p.wide ? "w-72 sm:w-96" : "w-48 sm:w-64", i % 2 === 0 ? "-rotate-2" : "rotate-2")}>
              <div className={cn("relative overflow-hidden rounded-panel bg-panel-sunken shadow-floating", p.wide ? "aspect-4/3" : "aspect-4/5")}>
                <CoverPhoto src={photo(p.id)} sizes="(min-width: 640px) 24rem, 18rem" />
              </div>
              <figcaption className="mt-2 pl-1 text-caption font-semibold tracking-wider text-copy-muted uppercase">{p.caption}</figcaption>
            </figure>
          ))}
        </Marquee>
      )}

      {/* Benefícios: texto à esquerda, foto a ocupar a coluna da direita */}
      <Section>
        <Container className="grid gap-10 lg:grid-cols-5 lg:gap-14">
          <div className="lg:col-span-3">
            <SectionHeading title="Conduza com apoio no dia a dia" description="Da escolha da viatura à documentação, conheça o apoio disponível para a sua atividade TVDE." />
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

      {/* Fitas cruzadas: a promessa e as modalidades, a correr em sentidos opostos */}
      <div className="overflow-hidden py-12" aria-hidden>
        <Marquee speed={0.7} className="relative z-10 -mx-8 -rotate-2 bg-brand py-3 text-on-brand shadow-floating">
          {TAPE_PROMISE.map((t) => (
            <span key={t} className="display flex items-center gap-6 px-6 text-h2">
              {t}
              <span className="size-3 rounded-pill bg-on-brand/60" />
            </span>
          ))}
        </Marquee>
        <Marquee direction={1} speed={0.7} className="-mx-8 -mt-4 rotate-1 bg-panel-dark py-3 text-on-dark">
          {TAPE_FLEET.map((t) => (
            <span key={t} className="display flex items-center gap-6 px-6 text-h2">
              {t}
              <span className="size-3 rounded-pill bg-on-dark/60" />
            </span>
          ))}
        </Marquee>
      </div>

      {/* Aluguer ou Slot: as duas portas de entrada, cada uma com o seu formulário */}
      <Section surface aria-labelledby="modalidades-titulo">
        <Container>
          <SectionHeading
            title={<span id="modalidades-titulo">Aluguer ou Slot?</span>}
            description="Precisa de uma viatura ou já tem a sua? Compare as duas modalidades e escolha a candidatura que corresponde à sua situação."
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
                  <a {...applyLink(m.id)} className={buttonClass(m.id === "aluguer" ? "primary" : "outline", "lg", "mt-6 w-full sm:w-auto")}>
                    {m.cta}
                    {opensNewTab && <span className="sr-only">(abre noutro separador)</span>}
                  </a>
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
              <SectionHeading title="Escolha a viatura para o seu trabalho" description="Compare o preço de aluguer por semana, a caução e os quilómetros incluídos em cada viatura disponível." />
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
          <p className="mt-3 max-w-2xl text-on-dark/75">Saiba o que acontece depois de enviar os seus dados e quais os documentos a preparar.</p>
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

      {/* Candidatura: os dois formulários (Aluguer e Slot) no site, com os documentos à mão ao lado */}
      <Section id="candidatura" surface aria-labelledby="candidatura-titulo" className="scroll-mt-16">
        {/* Âncoras dos botões "Candidatar-me": escolhem o formulário certo */}
        <span id="candidatura-aluguer" className="block scroll-mt-16" aria-hidden />
        <span id="candidatura-slot" className="block scroll-mt-16" aria-hidden />
        <Container className="grid gap-10 lg:grid-cols-5 lg:items-start">
          <div className="lg:col-span-2">
            <h2 id="candidatura-titulo" className="display text-h2">Candidate-se para conduzir connosco</h2>
            <p className="mt-3 text-copy-secondary">
              Escolha Aluguer ou Slot e preencha o formulário em cerca de 2 minutos, sem compromisso. Ligamos-lhe em menos de 24 horas úteis para explicar as condições e os próximos passos.
            </p>
            <div className="mt-8 rounded-panel border border-line bg-panel p-6">
              <h3 className="font-bold">Prepare os documentos para a candidatura</h3>
              <ul className="mt-4 grid gap-y-2 text-copy-secondary">
                {DOCUMENTS.map((d) => (
                  <li key={d} className="border-l-2 border-brand pl-3">{d}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lg:col-span-3">
            {/* Botões diretos, formulários do WeGest incorporados ou os do site (DRIVER_FORM_KIND, docs/motoristas-formularios.md) */}
            {DRIVER_FORM_KIND === "embed" ? (
              <DriverFormEmbed />
            ) : DRIVER_FORM_KIND === "site" && driverLeadsReady() ? (
              <DriverLeadForm siteKey={process.env.TURNSTILE_SITE_KEY || undefined} />
            ) : (
              <HostedForms />
            )}
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

      {/* Popup da candidatura: só com DRIVER_FORM_OPEN = "popup" (senão os botões abrem o WeGest) */}
      {DRIVER_FORM_OPEN === "popup" && <DriverApplyDialog />}
    </>
  );
}
