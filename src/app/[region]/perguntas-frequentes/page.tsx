import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Pending } from "@/components/shared/pending";
import { Container, Section } from "@/components/shared/ui";
import { AZORES_TVDE_URL, IMT_TVDE_URL } from "@/components/tvde/tvde-requirements";
import { formatMoney, TVDE_RESERVATION_FEE } from "@/domain/pricing";
import type { Region } from "@/domain/region";
import { regionFromParams } from "@/lib/region";

export const metadata: Metadata = { title: "Perguntas frequentes" };

/** `a: null` = resposta a fornecer pela DÉCADA OUSADA (mostra o marcador de pendente). */
type Faq = { q: string; a: ReactNode | null };

const FEE = formatMoney(TVDE_RESERVATION_FEE);

function OfficialLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-brand underline underline-offset-4">
      {children}
      <span className="sr-only"> (abre noutro separador)</span>
    </a>
  );
}

/**
 * Conteúdo de docs/conteudo/mapa-informacao.md (fase 2 do prompt mestre). Entram só as
 * respostas gerais com fonte oficial (IMT, diploma) e as regras confirmadas pela DÉCADA
 * OUSADA ou vindas do sistema de gestão; o resto fica marcado como pendente. O que
 * depende do texto da Lei n.º 59/2026 só entra depois de confirmado no diploma.
 */
function faqFor(region: Region): Array<{ group: string; items: Faq[] }> {
  const certificate: Faq[] =
    region === "azores"
      ? [
          {
            q: "Preciso de certificado para conduzir em TVDE?",
            a: (
              <>
                Sim. Nos Açores aplica-se o regime regional TVDE (Decreto Legislativo Regional n.º 10/2022/A), com certificado de motorista e formação próprios da região. A DÉCADA OUSADA aluga a viatura; o certificado é pedido por si. Veja o <OfficialLink href={AZORES_TVDE_URL}>diploma regional</OfficialLink>.
              </>
            ),
          },
          { q: "Como obtenho o certificado de motorista TVDE nos Açores?", a: null },
        ]
      : [
          { q: "Preciso de certificado para conduzir em TVDE?", a: "Sim. Precisa do certificado de motorista TVDE, emitido pelo IMT. A DÉCADA OUSADA aluga a viatura; o certificado é pedido por si ao IMT." },
          {
            q: "Como obtenho o certificado de motorista TVDE?",
            a: (
              <>
                Faz o curso de formação inicial numa entidade reconhecida pelo IMT e a avaliação final, pede o registo criminal com a finalidade indicada pelo IMT e submete o pedido no IMT Online. Tem de ter carta de condução de categoria B há mais de 3 anos. Detalhes no <OfficialLink href={IMT_TVDE_URL}>site do IMT</OfficialLink>.
              </>
            ),
          },
          { q: "Quanto tempo é válido o certificado?", a: "5 anos. Renova-se com um curso de formação contínua de 8 horas, antes de caducar." },
        ];

  return [
    {
      group: "TVDE: começar",
      items: [
        ...certificate,
        { q: "Posso alugar enquanto aguardo o certificado?", a: null },
        { q: "Quais são os requisitos para me candidatar?", a: null },
        { q: "Que documentos tenho de enviar?", a: "Os documentos pedidos aparecem na página de cada viatura, antes de se candidatar, e no passo \"Documentos\" da candidatura." },
      ],
    },
    {
      group: "TVDE: valores",
      items: [
        { q: "Quanto pago para reservar uma viatura TVDE?", a: `${FEE} de sinal. Confirmam a reserva da viatura e são descontados na caução quando a levanta. A candidatura continua sujeita a análise.` },
        { q: "O pagamento do sinal garante a aprovação?", a: "Não. O sinal confirma a reserva da viatura, mas a candidatura é analisada pela DÉCADA OUSADA. Se não for aprovada, o valor pago é devolvido de acordo com o procedimento aplicável." },
        { q: "Quanto é a caução?", a: `Depende da viatura e aparece na página de cada uma, antes de se candidatar. O sinal de ${FEE} já pago é descontado na caução.` },
        { q: "Quando me devolvem a caução?", a: null },
        { q: "E se eu desistir depois de pagar o sinal?", a: null },
        { q: "O que está incluído no preço semanal?", a: "Cada viatura mostra o que inclui na sua página (seguro, manutenção, assistência), antes de se candidatar." },
        { q: "Qual é a franquia do seguro?", a: null },
        { q: "Existe limite de quilómetros?", a: "Sim. Cada viatura indica os quilómetros incluídos e o custo de cada quilómetro adicional." },
      ],
    },
    {
      group: "TVDE: contrato e viatura",
      items: [
        { q: "Qual é o período mínimo de aluguer?", a: "Cada viatura indica o período mínimo na sua página." },
        { q: "Posso devolver a viatura antes do fim?", a: null },
        { q: "Quanto tempo demora a análise da candidatura?", a: null },
        { q: "Quem paga combustível, carregamentos e portagens?", a: null },
      ],
    },
    {
      group: "Rent a Car",
      items: [
        { q: "A reserva fica logo confirmada?", a: "O pedido entra no nosso sistema de gestão e é confirmado pela equipa DÉCADA OUSADA. Recebe um email em cada passo e pode acompanhar o estado na sua área de cliente." },
        { q: "Posso devolver a viatura noutro local?", a: "Sim, quando o local de devolução o permitir. Escolha-o na pesquisa: qualquer taxa aplicável aparece no resumo antes de pagar." },
        { q: "O que é a franquia?", a: "É o valor máximo a seu cargo em caso de dano. Cada cobertura de seguro indica a franquia correspondente, e pode escolhê-la durante a reserva." },
        { q: "Posso cancelar a reserva?", a: "Enquanto a reserva aguarda confirmação, pode cancelá-la na área de cliente. Depois de confirmada, o cancelamento é tratado com a nossa equipa." },
        { q: "Que documentos tenho de apresentar no levantamento?", a: null },
        { q: "Qual é a idade mínima para alugar?", a: null },
        { q: "Como funciona a caução?", a: null },
        { q: "Posso levar a viatura para Espanha?", a: null },
      ],
    },
  ];
}

/** Termos usados no site (glossário do mapa de informação). */
const TERMS: Array<{ term: string; def: string }> = [
  { term: "TVDE", def: "Transporte remunerado de passageiros em viaturas pedidas por aplicação (Uber, Bolt e outras)." },
  { term: "Certificado de motorista TVDE", def: "Documento que habilita a conduzir em TVDE. Válido por 5 anos." },
  { term: "Operador TVDE", def: "Empresa licenciada para prestar o serviço TVDE através das plataformas." },
  { term: "Sinal", def: `Valor pago para confirmar a reserva da viatura TVDE: ${FEE}, descontados na caução no levantamento.` },
  { term: "Caução", def: "Valor de garantia pago no levantamento e devolvido no fim do aluguer, nas condições do contrato." },
  { term: "Franquia", def: "Valor máximo a cargo do condutor em caso de dano coberto pelo seguro." },
  { term: "Km incluídos", def: "Quilómetros que o preço já cobre. Acima disso, cada km tem o custo indicado na viatura." },
  { term: "Período mínimo", def: "Tempo mínimo de aluguer indicado em cada viatura." },
];

export default async function FaqPage({ params }: PageProps<"/[region]/perguntas-frequentes">) {
  const region = await regionFromParams(params);
  return (
    <>
      <PageHeader title="Perguntas frequentes" crumbs={[{ label: "Perguntas frequentes" }]} />
      <Section>
        <Container className="max-w-3xl space-y-12">
          {faqFor(region).map((g) => (
            <section key={g.group}>
              <h2 className="display text-h2">{g.group}</h2>
              <div className="mt-5 divide-y divide-line overflow-hidden rounded-panel border border-line bg-panel">
                {g.items.map(({ q, a }) => (
                  <details key={q} className="group px-5 py-4">
                    <summary className="cursor-pointer list-none font-semibold marker:hidden max-md:tap-target max-md:w-full">
                      <span className="flex items-center justify-between gap-4">
                        {q}
                        <span className="text-brand transition-transform group-open:rotate-45" aria-hidden>+</span>
                      </span>
                    </summary>
                    <div className="mt-3 text-copy-secondary">{a ?? <Pending>Resposta a fornecer pela DÉCADA OUSADA</Pending>}</div>
                  </details>
                ))}
              </div>
            </section>
          ))}
          <section>
            <h2 className="display text-h2">Termos usados</h2>
            <dl className="mt-5 divide-y divide-line overflow-hidden rounded-panel border border-line bg-panel">
              {TERMS.map(({ term, def }) => (
                <div key={term} className="grid gap-1 px-5 py-4 sm:grid-cols-3 sm:gap-6">
                  <dt className="font-semibold">{term}</dt>
                  <dd className="text-copy-secondary sm:col-span-2">{def}</dd>
                </div>
              ))}
            </dl>
          </section>
        </Container>
      </Section>
    </>
  );
}
