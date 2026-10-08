import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";
import { Pending } from "@/components/shared/pending";
import { Notice } from "@/components/shared/states";
import { Container, Section } from "@/components/shared/ui";

export const metadata: Metadata = { title: "Perguntas frequentes" };

/**
 * Só respostas que decorrem do documento do projeto ou da API WeGest.
 * Regras comerciais ainda não fornecidas pelo cliente ficam marcadas como pendentes.
 */
const FAQ: Array<{ group: string; items: Array<{ q: string; a: string | null }> }> = [
  {
    group: "Rent a Car",
    items: [
      { q: "A reserva fica logo confirmada?", a: "O pedido entra no nosso sistema de gestão e é confirmado pela equipa DÉCADA OUSADA. Recebe um email em cada passo e pode acompanhar o estado na sua área de cliente." },
      { q: "Posso devolver a viatura noutro local?", a: "Sim, quando o local de devolução o permitir. Escolha-o na pesquisa: qualquer taxa aplicável aparece no resumo antes de pagar." },
      { q: "O que é a franquia?", a: "É o valor máximo a seu cargo em caso de dano. Cada cobertura de seguro indica a franquia correspondente, e pode escolhê-la durante a reserva." },
      { q: "Posso cancelar a reserva?", a: "Enquanto a reserva aguarda confirmação, pode cancelá-la na área de cliente. Depois de confirmada, o cancelamento é tratado com a nossa equipa." },
      { q: "Que documentos tenho de apresentar no levantamento?", a: null },
    ],
  },
  {
    group: "TVDE",
    items: [
      { q: "O pagamento do sinal garante a aprovação?", a: "Não. O pagamento do sinal ou da caução não representa aprovação automática. A candidatura é analisada pela DÉCADA OUSADA e, se não for aprovada, o valor pago é devolvido de acordo com o procedimento aplicável." },
      { q: "Existe limite de quilómetros?", a: "Sim. Cada viatura indica os quilómetros incluídos e o custo de cada quilómetro adicional." },
      { q: "O que está incluído no preço semanal?", a: "As condições de cada viatura (seguro, manutenção, assistência) são apresentadas na sua página, antes de se candidatar." },
      { q: "Quais são os requisitos para me candidatar?", a: null },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHeader title="Perguntas frequentes" crumbs={[{ label: "Perguntas frequentes" }]} />
      <Section>
        <Container className="max-w-3xl space-y-12">
          <Notice title="Conteúdo em validação">As respostas marcadas como pendentes aguardam informação da DÉCADA OUSADA.</Notice>
          {FAQ.map((g) => (
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
        </Container>
      </Section>
    </>
  );
}
