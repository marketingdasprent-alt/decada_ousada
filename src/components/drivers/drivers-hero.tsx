import type { Region } from "@/domain/region";
import { heroImageUrl, REGION_IMAGERY } from "@/lib/region-imagery";

import { CoverPhoto } from "../shared/cover-photo";
import { Breadcrumbs } from "../shared/page-header";
import { Container, Section, SlantTag } from "../shared/ui";

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=70`;

/** Foto pequena da região na colagem: Lisboa no Continente, estrada açoriana nos Açores. */
const REGION_PHOTO: Record<Region, { src: string; position?: string }> = {
  mainland: { src: photo("photo-1616862890964-fd20e9dd106d") },
  azores: { src: heroImageUrl(REGION_IMAGERY.azores.home), position: "50% 55%" },
};

/**
 * Hero clara da página de motoristas (junta a landing original com o site): texto e escolha
 * Aluguer/Slot à esquerda, colagem de fotos rodadas à direita, com o dístico TVDE, o selo
 * "2 min" a girar e o aviso do pagamento semanal. O vermelho do título fica sobre fundo
 * claro (contraste AA); a foto do motorista nunca fica tapada.
 */
export function DriversHero({ region }: { region: Region }) {
  return (
    <Section variant="spacious" className="overflow-hidden" aria-labelledby="motoristas-titulo">
      <Container className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-12">
        <div className="min-w-0">
          <Breadcrumbs crumbs={[{ label: "Motoristas" }]} className="mb-5" />
          <h1 id="motoristas-titulo" className="display text-display leading-display-loose">
            Conduza. Fature.
            <br />
            <span className="text-brand">Receba à semana.</span>
          </h1>
          <p className="mt-4 max-w-xl text-body-large text-copy-secondary">
            Renda fixa semanal, pagamento todas as semanas e suporte 7 dias. Já somos mais de 500 motoristas.
          </p>

          {/* A escolha que muda a candidatura: com ou sem carro */}
          <p className="mt-8 font-semibold" id="modalidade-titulo">Como quer trabalhar?</p>
          <div className="mt-3 grid max-w-xl grid-cols-2 gap-3" role="group" aria-labelledby="modalidade-titulo">
            <a
              href="#aluguer"
              className="rounded-panel bg-brand px-5 py-4 text-on-brand transition hover:-translate-y-1 hover:bg-brand-hover hover:shadow-floating motion-reduce:hover:translate-y-0"
            >
              <span className="display block text-h3">Preciso de carro</span>
              <span className="text-body-small">Alugo uma viatura vossa</span>
            </a>
            <a
              href="#slot"
              className="rounded-panel border-2 border-copy bg-panel px-5 py-4 transition hover:-translate-y-1 hover:bg-panel-dark hover:text-on-dark hover:shadow-floating motion-reduce:hover:translate-y-0"
            >
              <span className="display block text-h3">Tenho carro</span>
              <span className="text-body-small">Trabalho como Slot</span>
            </a>
          </div>
          <p className="mt-5 text-body-small text-copy-muted">Parceiro oficial Uber e Bolt · Top 5% PME 2024</p>
        </div>

        <DriversCollage region={region} />
      </Container>
    </Section>
  );
}

function DriversCollage({ region }: { region: Region }) {
  const regional = REGION_PHOTO[region];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-xl">
      {/* Motorista com passageira: a foto principal, sem nada por cima do rosto */}
      <div className="absolute top-0 right-0 bottom-16 left-12 overflow-hidden rounded-panel bg-panel-sunken shadow-floating">
        <CoverPhoto src={photo("photo-1773063449875-332dff62b6e3")} sizes="(min-width: 1024px) 40vw, 90vw" position="62% 30%" priority />
      </div>

      {/* Viatura elétrica a carregar, rodada para a esquerda */}
      <div className="absolute bottom-0 left-0 aspect-4/3 w-1/2 -rotate-3 overflow-hidden rounded-panel border-4 border-panel bg-panel-sunken shadow-floating">
        <CoverPhoto src={photo("photo-1707758283052-f1e3a2d42333")} sizes="(min-width: 1024px) 20vw, 45vw" />
      </div>

      {/* Foto da região, no canto de baixo (o rosto do motorista fica no canto de cima) */}
      <div className="absolute -right-2 -bottom-4 aspect-3/4 w-1/3 rotate-2 overflow-hidden rounded-panel border-4 border-panel bg-panel-sunken shadow-floating">
        <CoverPhoto src={regional.src} position={regional.position} sizes="(min-width: 1024px) 14vw, 30vw" />
      </div>

      {/* Dístico: a etiqueta inclinada do logótipo, presa no topo da foto */}
      <SlantTag className="absolute -top-4 right-6 -rotate-3 shadow-raised">Operador TVDE certificado</SlantTag>

      {/* Aviso do pagamento semanal, com um ponto que pulsa (à altura dos ombros: não tapa rostos) */}
      <div className="absolute top-1/2 left-0 flex items-center gap-3 rounded-pill bg-panel py-2 pr-5 pl-3 shadow-floating">
        <span className="relative flex size-3" aria-hidden>
          <span className="absolute inset-0 animate-ping rounded-pill bg-positive opacity-75 motion-reduce:hidden" />
          <span className="relative size-3 rounded-pill bg-positive" />
        </span>
        <span className="text-body-small leading-tight">
          <span className="block font-semibold">Pagamento da semana</span>
          <span className="text-copy-muted">Na sua conta, todas as semanas</span>
        </span>
      </div>

      {/* Selo a girar: leva à candidatura */}
      <a
        href="#candidatura"
        className="absolute -top-8 -left-2 flex size-28 items-center justify-center rounded-pill bg-brand text-on-brand shadow-floating transition-transform hover:scale-105 sm:size-32"
      >
        <svg viewBox="0 0 120 120" className="absolute inset-0 size-full animate-orbit motion-reduce:animate-none" aria-hidden>
          <defs>
            <path id="selo-circulo" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
          </defs>
          <text className="fill-current text-caption font-semibold tracking-widest uppercase">
            <textPath href="#selo-circulo">Candidate-se · em 2 minutos ·</textPath>
          </text>
        </svg>
        <span className="display text-h3" aria-hidden>2 min</span>
        <span className="sr-only">Candidatar-me: são cerca de 2 minutos</span>
      </a>
    </div>
  );
}
