"use client";

import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { type CSSProperties, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";

import { Container, Section, SectionHeading } from "./ui";

type TestimonialService = "rentacar" | "tvde";

interface Testimonial {
  /** Serviço de que o depoimento fala: cada painel mostra só um. */
  service: TestimonialService;
  text: string;
  author: string;
  initials: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

/**
 * Depoimentos de clientes da DÉCADA OUSADA (painel de avaliações fornecido pela equipa,
 * 2026-10-12). Textos como os clientes os escreveram, sem edição. Sem datas relativas
 * ("há 1 ano"): numa página estática ficariam erradas com o tempo. Nunca juntar aqui
 * avaliações de outra empresa (DECISIONS.md, 2026-10-12). TVDE: as três que falam
 * explicitamente de motoristas/TVDE (indicação da equipa); as restantes são de clientes.
 */
const TESTIMONIALS: Testimonial[] = [
  { service: "tvde", author: "Patricia Silva", initials: "PS", rating: 5, text: "Ótima! Me fez pensar de uma forma diferente e ter mais ânimo para continuar como motorista" },
  { service: "tvde", author: "Samuel Guimarães", initials: "SG", rating: 5, text: "Muito esclarecedor. A primeira impressão, é de que estão dispostos a realmente dar valor ao mercado de TVDE." },
  { service: "tvde", author: "Daiane Goulart", initials: "DG", rating: 5, text: "Muito boa convenção hoje pela manhã, para mais convencimento e tirar todas suas dúvidas." },
  { service: "rentacar", author: "Sandra Maya", initials: "SM", rating: 5, text: "Do ponto de vista administrativo, perfeito! Quando entregar a viatura, volta a fazer uma avaliação! 2 de Agosto. Do princípio ao fim do processo 5 estrelas! Muito profissionais e atenciosos! Na escala de 1 a 10? Sem dúvida 10!" },
  { service: "rentacar", author: "Ruben Roda", initials: "RR", rating: 5, text: "Atendimento focado em nós, muito bom" },
  { service: "rentacar", author: "Jonatas Guimaraes", initials: "JG", rating: 5, text: "Indico e assino em baixo!" },
  { service: "rentacar", author: "Zulmiro Gregório Ferreira Rocha", initials: "ZR", rating: 5, text: "Muito satisfeito com a experiência que estou a ter com eles, todos eles, até agora sempre corretos e atenciosos, o meu muito obrigada" },
  { service: "rentacar", author: "Natiele Schaeffer", initials: "NS", rating: 5, text: "Excelente, gostei bastante! Recomendo!" },
  { service: "rentacar", author: "António Dias", initials: "AD", rating: 5, text: "Empresa séria, eficiente e dinâmica." },
  { service: "rentacar", author: "Lucas", initials: "L", rating: 5, text: "Gostei muito! Super recomendo!" },
  { service: "rentacar", author: "Tiago Sieiro", initials: "TS", rating: 5, text: "Serviço impecável. Atendimento rápido e simpático. Voltarei alugar com toda a certeza" },
  { service: "rentacar", author: "Klewer Duarte", initials: "KD", rating: 5, text: "Queria dar 10 estrelas 👌, pessoal simplesmente espetacular atendimento excepcional com toda atenção que nos oferece." },
  { service: "rentacar", author: "Ricardo Santos", initials: "RS", rating: 5, text: "Bom atendimento, sempre disponíveis para ajudar, viaturas boas e muito higienizadas. Recomendo 5*" },
  { service: "rentacar", author: "Imortal Cruz Comandos", initials: "IC", rating: 5, text: "Empresa 5 Estrelas. Desde os Funcionários às Viaturas. Atendimento Vip. Recomenda se!" },
  { service: "rentacar", author: "Sebastiao Cruz", initials: "SC", rating: 5, text: "Muito bom, tudo bem organizado, e sem complicações, atendimento 5 estrelas" },
  { service: "rentacar", author: "RJM Machado", initials: "RM", rating: 5, text: "Empresa competente, colaboradores prestável, 5*" },
  { service: "rentacar", author: "mukesh duhra", initials: "MD", rating: 5, text: "The best car services. I am happy to continuing with this company" },
];

/** Título e descrição do painel por serviço. */
const COPY: Record<TestimonialService, { title: string; description: string; list: string }> = {
  rentacar: {
    title: "O que dizem os nossos clientes",
    description: "Experiências partilhadas por clientes da DÉCADA OUSADA.",
    list: "Depoimentos de clientes",
  },
  tvde: {
    title: "O que dizem os nossos motoristas",
    description: "Experiências partilhadas por motoristas TVDE da DÉCADA OUSADA.",
    list: "Depoimentos de motoristas TVDE",
  },
};

/** Cascata de entrada: só os primeiros cartões contam; os de fora do ecrã entram juntos. */
const REVEAL_MAX = 3;

const REDUCED = "(prefers-reduced-motion: reduce)";

/** Cópias da lista no carrossel infinito: antes (-1), a original (0) e depois (1). */
const LOOP_COPIES = [-1, 0, 1] as const;
const SINGLE = [0] as const;

const noopSubscribe = () => () => {};

/** Largura de uma lista inteira dentro da fila (0 enquanto não há cópias). */
function listWidth(rail: HTMLElement, loop: boolean, total: number) {
  if (!loop) return 0;
  const items = rail.children;
  return (items[total] as HTMLElement).offsetLeft - (items[0] as HTMLElement).offsetLeft;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5 text-caution" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => <Star key={i} className={cn("size-4", i < rating && "fill-current")} />)}
    </span>
  );
}

/**
 * Um depoimento. O texto fica limitado a cinco linhas para os cartões lado a lado não
 * ficarem desproporcionados; se não couber, "Ler tudo" mostra-o completo (nunca é cortado
 * sem forma de o ler). O estado aberto/fechado vem de fora, para as cópias do carrossel
 * infinito mostrarem o mesmo.
 */
function TestimonialCard({ t, expanded, onToggle }: { t: Testimonial; expanded: boolean; onToggle: () => void }) {
  const quote = useRef<HTMLQuoteElement>(null);
  const [overflows, setOverflows] = useState(false);
  const id = useId();

  useEffect(() => {
    const el = quote.current;
    if (!el || expanded) return;
    const measure = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [expanded]);

  return (
    // relative: prende o sr-only dentro do cartão (senão sai do scroll e alarga a página)
    <article className="relative flex w-full flex-col rounded-panel border border-line bg-panel p-6 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        {/* Aspas como marca gráfica, na cor da região */}
        <span className="display -mt-1 h-8 text-h1 text-brand" aria-hidden>“</span>
        <Stars rating={t.rating} />
      </div>
      <span className="sr-only">{t.rating} em 5 estrelas</span>
      <blockquote ref={quote} id={id} className={cn("mt-3 text-body-large text-copy", !expanded && "line-clamp-5")}>
        {t.text}
      </blockquote>
      {(overflows || expanded) && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={id}
          className="mt-2 self-start text-body-small font-semibold text-brand underline underline-offset-4 hover:text-brand-hover max-md:tap-target"
        >
          {expanded ? "Mostrar menos" : "Ler tudo"}
        </button>
      )}
      <div className="mt-auto flex items-center gap-3 border-t border-line pt-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-pill bg-panel-sunken text-body-small font-bold text-copy-secondary" aria-hidden>
          {t.initials}
        </span>
        <p className="min-w-0 truncate font-semibold">{t.author}</p>
      </div>
    </article>
  );
}

const ARROW = "flex size-11 items-center justify-center rounded-pill border border-line-control bg-panel text-copy transition-colors hover:border-copy/40";

interface RailState {
  /** Cartão à esquerda da vista (1-based, na lista original). */
  first: number;
  /** Fração visível da lista e deslocamento do indicador, em % da sua própria largura. */
  ratio: number;
  offset: number;
}

/**
 * Painel de depoimentos de um serviço (`service`): na página inicial, depois do TVDE, só
 * os de clientes ("rentacar"); os de TVDE ficam para outro sítio do site. Carrossel
 * infinito com scroll lateral, setas, contador e barra de posição; os cartões entram em
 * cascata quando a secção aparece no ecrã.
 *
 * Infinito: depois da hidratação a lista é rodeada por uma cópia de cada lado (inert e
 * aria-hidden: o teclado e os leitores de ecrã só veem a original). Quando o scroll pára
 * numa cópia, a fila salta, sem animação, a largura de uma lista inteira de volta para a
 * original; como o conteúdo é igual, o salto não se vê. No HTML do servidor (e sem JS)
 * só existe a lista original.
 */
export function Testimonials({ service }: { service: TestimonialService }) {
  const items = TESTIMONIALS.filter((t) => t.service === service);
  const total = items.length;
  const copy = COPY[service];
  const titleId = `depoimentos-${service}-titulo`;
  const listId = `depoimentos-${service}-lista`;
  const section = useRef<HTMLElement>(null);
  const rail = useRef<HTMLUListElement>(null);
  const [state, setState] = useState<RailState | null>(null);
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(() => new Set());
  // true só no browser, depois da hidratação: as cópias nunca vão no HTML do servidor
  const loop = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const copies = loop ? LOOP_COPIES : SINGLE;

  // Começa na lista original (a do meio), antes de pintar
  useLayoutEffect(() => {
    const el = rail.current;
    if (el && loop) el.scrollLeft = listWidth(el, loop, total);
  }, [loop, total]);

  // Posição (contador e barra); quando o scroll pára numa cópia, volta à original
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    let frame = 0;
    let idle = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const item = el.firstElementChild as HTMLElement | null;
        const w = item?.offsetWidth || el.clientWidth;
        const full = w * total;
        const pos = (((el.scrollLeft - listWidth(el, loop, total)) % full) + full) % full;
        setState({
          first: (Math.round(pos / w) % total) + 1,
          ratio: Math.min(1, el.clientWidth / full),
          offset: (pos / el.clientWidth) * 100,
        });
      });
    };
    const recenter = () => {
      const width = listWidth(el, loop, total);
      if (!width) return;
      if (el.scrollLeft < width - 1) el.scrollLeft += width;
      else if (el.scrollLeft >= 2 * width - 1) el.scrollLeft -= width;
    };
    // scrollend espera pelo fim do gesto e da inércia; sem ele, 150 ms sem scroll
    const hasScrollEnd = "onscrollend" in window;
    const onScroll = () => {
      update();
      if (!hasScrollEnd) {
        clearTimeout(idle);
        idle = window.setTimeout(recenter, 150);
      }
    };
    update();
    el.addEventListener("scroll", onScroll, { passive: true });
    if (hasScrollEnd) el.addEventListener("scrollend", recenter);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(idle);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", recenter);
      window.removeEventListener("resize", update);
    };
  }, [loop, total]);

  // Entrada em cascata: só se a secção ainda não estiver no ecrã e sem movimento reduzido
  useEffect(() => {
    const el = section.current;
    if (!el || window.matchMedia(REDUCED).matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.dataset.reveal = "pending";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.reveal = "shown";
        io.disconnect();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      delete el.dataset.reveal;
    };
  }, []);

  // Avança uma "página" de cartões; o snap acerta o alinhamento e há sempre cartões dos dois lados
  const move = (direction: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth, behavior: window.matchMedia(REDUCED).matches ? "auto" : "smooth" });
  };

  const toggle = (i: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(i)) next.add(i);
      return next;
    });

  const counter = state ? `${state.first} de ${total}` : `${total} depoimentos`;

  return (
    <Section ref={section} surface aria-labelledby={titleId}>
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <SectionHeading
            className="reveal-item"
            title={<span id={titleId}>{copy.title}</span>}
            description={copy.description}
          />
          <div className="reveal-item flex items-center gap-4">
            <p className="text-body-small text-copy-secondary tabular" aria-live="polite">{counter}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => move(-1)} aria-label="Ver depoimentos anteriores" aria-controls={listId} className={ARROW}>
                <ArrowLeft className="size-5" aria-hidden />
              </button>
              <button type="button" onClick={() => move(1)} aria-label="Ver mais depoimentos" aria-controls={listId} className={ARROW}>
                <ArrowRight className="size-5" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {/* Cada cartão ocupa 5/6, 1/2 ou 1/3 da largura: o espaço entre eles é padding, para a conta fechar */}
        <ul
          ref={rail}
          id={listId}
          tabIndex={0}
          aria-label={copy.list}
          className="scrollbar-none -mx-2 mt-8 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain py-1"
        >
          {copies.map((c) =>
            items.map((t, i) => (
              <li
                key={`${c}-${i}`}
                aria-hidden={c !== 0 || undefined}
                inert={c !== 0}
                className="reveal-item flex shrink-0 basis-5/6 snap-start px-2 sm:basis-1/2 lg:basis-1/3"
                style={{ "--reveal-index": c === 0 ? Math.min(i, REVEAL_MAX) + 1 : REVEAL_MAX + 1 } as CSSProperties}
              >
                <TestimonialCard t={t} expanded={expanded.has(i)} onToggle={() => toggle(i)} />
              </li>
            )),
          )}
        </ul>

        {/* Barra de posição (substitui a barra de scroll nativa); só aparece com JavaScript */}
        {state && state.ratio < 1 && (
          <div className="reveal-item mt-5 h-1 overflow-hidden rounded-pill bg-line" style={{ "--reveal-index": REVEAL_MAX + 2 } as CSSProperties} aria-hidden>
            <div className="h-full rounded-pill bg-brand" style={{ width: `${state.ratio * 100}%`, transform: `translateX(${state.offset}%)` }} />
          </div>
        )}
      </Container>
    </Section>
  );
}
