import { ButtonLink, Container, Section } from "@/components/shared/ui";

export default function NotFound() {
  return (
    <Section variant="spacious"><Container className="flex flex-col items-center text-center">
      <p className="display text-display text-brand">404</p>
      <h1 className="mt-4 text-h3 font-bold">Página não encontrada</h1>
      <p className="mt-2 text-copy-secondary">A página que procura não existe ou foi movida.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Voltar ao início</ButtonLink>
        <ButtonLink href="/rent-a-car/viaturas" variant="outline">Ver viaturas</ButtonLink>
      </div>
    </Container></Section>
  );
}
