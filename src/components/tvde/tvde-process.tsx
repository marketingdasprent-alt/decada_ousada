import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Container, Section } from "../shared/ui";

/** Sequência real do processo (doc §49): a numeração tem função. */
export const TVDE_STEPS = [
  { title: "Escolha a viatura", text: "Preço semanal, caução, limite de km e condições." },
  { title: "Faça o cadastro", text: "A ficha de motorista, em poucos minutos." },
  { title: "Envie os documentos", text: "Identificação, carta, certificado TVDE e morada." },
  { title: "Pague o sinal", text: "Reserva a viatura enquanto analisamos a candidatura." },
  { title: "Levante após aprovação", text: "Assina o contrato e começa a conduzir." },
];

/**
 * Faixa escura (a identidade do TVDE) com o processo em cinco passos e a nota de que o
 * sinal não é aprovação. Na página TVDE só com o título; na página inicial com o título,
 * a introdução e as ações (`intro`, `actions`), a explicar o serviço sem listar viaturas.
 */
export function TvdeProcess({ title = "Como funciona", intro, actions, className }: { title?: string; intro?: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <Section className={cn("bg-panel-dark text-on-dark", className)}>
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0 flex-1 basis-96">
            <h2 className="display text-h2">{title}</h2>
            {intro && <div className="mt-3 max-w-2xl text-on-dark/75">{intro}</div>}
          </div>
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
        {/* Cinco passos: em duas colunas, o último ocupa a linha toda (sem espaço vazio) */}
        <ol className="mt-8 grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
          {TVDE_STEPS.map(({ title: step, text }, i) => (
            <li key={step} className="border-t border-on-dark/20 pt-4 sm:last:col-span-2 lg:last:col-span-1">
              <span className="display text-h3 text-on-dark" aria-hidden>{i + 1}</span>
              <p className="mt-1 font-semibold">{step}</p>
              <p className="mt-0.5 text-body-small text-on-dark/75">{text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-body-small text-on-dark/75">O pagamento do sinal não significa aprovação automática. Se a candidatura não for aprovada, o valor é devolvido.</p>
      </Container>
    </Section>
  );
}
