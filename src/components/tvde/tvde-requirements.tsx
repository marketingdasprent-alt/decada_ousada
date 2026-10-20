import { ExternalLink } from "lucide-react";

import type { Region } from "@/domain/region";

import { ButtonLink, Container, Section, SectionHeading } from "../shared/ui";

/** Fontes oficiais (ver docs/conteudo/pesquisa-tvde.md, consulta de 2026-10-09). */
export const IMT_TVDE_URL = "https://www.imt-ip.pt/rodoviario/infraestruturas-rodoviarias/tvde/certificacao-de-motoristas-tvde/";
export const AZORES_TVDE_URL = "https://diariodarepublica.pt/dr/detalhe/decreto-legislativo-regional/10-2022-183875248";

/** Requisitos do IMT para o certificado de motorista TVDE (regime nacional). */
const IMT_REQUIREMENTS = [
  "Carta de condução de categoria B há mais de 3 anos.",
  "Curso de formação inicial numa entidade reconhecida pelo IMT, com aprovação na avaliação final.",
  "Certificado de registo criminal, pedido com a finalidade indicada pelo IMT.",
  "Pedido no IMT Online. O certificado é válido por 5 anos.",
];

function SourceLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-body-small font-medium text-brand underline underline-offset-4 max-md:tap-target">
      {children}
      <ExternalLink className="size-4" aria-hidden />
      <span className="sr-only">(abre noutro separador)</span>
    </a>
  );
}

/**
 * Requisitos TVDE em duas partes: o que a lei pede ao motorista (facto geral, com a fonte
 * oficial) e onde ver o que a DÉCADA OUSADA pede para alugar (documentos de cada viatura).
 * Nos Açores aplica-se o regime regional, por isso não se mostram os requisitos do IMT.
 */
export function TvdeRequirements({ region }: { region: Region }) {
  return (
    <Section id="requisitos">
      <Container>
        <SectionHeading title="Requisitos" description="O certificado de motorista TVDE é seu. A DÉCADA OUSADA aluga a viatura." />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="flex flex-col rounded-panel border border-line bg-panel p-6">
            <h3 className="text-h4 font-bold">Para conduzir em TVDE</h3>
            {region === "azores" ? (
              <>
                <p className="mt-3 text-copy-secondary">
                  Nos Açores aplica-se o regime regional TVDE (Decreto Legislativo Regional n.º 10/2022/A), com certificado de motorista e formação próprios da região.
                </p>
                <div className="mt-4 flex flex-1 items-end"><SourceLink href={AZORES_TVDE_URL}>Ver o diploma regional</SourceLink></div>
              </>
            ) : (
              <>
                <p className="mt-3 text-copy-secondary">Precisa do certificado de motorista TVDE, emitido pelo IMT. Para o obter:</p>
                <ul className="mt-3 space-y-2 text-copy-secondary">
                  {IMT_REQUIREMENTS.map((r) => (
                    <li key={r} className="flex gap-3">
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-pill bg-brand" aria-hidden />
                      {r}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-1 items-end"><SourceLink href={IMT_TVDE_URL}>Ver os requisitos no site do IMT</SourceLink></div>
              </>
            )}
          </div>
          <div className="flex flex-col rounded-panel border border-line bg-panel p-6">
            <h3 className="text-h4 font-bold">Para alugar na DÉCADA OUSADA</h3>
            <p className="mt-3 text-copy-secondary">Os documentos pedidos aparecem na página de cada viatura, antes de se candidatar.</p>
            {/* Ao fundo do cartão: os dois cartões têm a mesma altura e este não fica com espaço vazio */}
            <div className="mt-6 flex flex-1 items-end">
              <ButtonLink href="/tvde/viaturas" variant="dark">Ver viaturas TVDE</ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
