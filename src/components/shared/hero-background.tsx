"use client";

import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";
import { heroImageUrl, type HeroImage } from "@/lib/region-imagery";
import { unsplashLoader } from "@/lib/unsplash";

const INTERVAL_MS = 6000;

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * Fotos de fundo da hero (decorativas). Com mais de uma, trocam sozinhas com fade,
 * como no site da BV: só monta a atual e a seguinte, tem pausa (WCAG 2.2.2) e fica
 * parada para quem pediu menos movimento. A legenda diz onde é a foto.
 */
export function HeroBackground({ images }: { images: HeroImage[] }) {
  const total = images.length;
  const [state, setState] = useState(() => ({ current: 0, mounted: new Set([0, 1 % Math.max(total, 1)]) }));
  // Parado por omissão para quem pediu menos movimento; a escolha manual sobrepõe-se
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED).matches, () => false);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? reduced;
  const { current, mounted } = state;

  const goTo = (i: number) => setState((s) => ({ current: i, mounted: new Set(s.mounted).add(i).add((i + 1) % total) }));

  useEffect(() => {
    if (paused || total < 2) return;
    const t = window.setTimeout(() => {
      setState((s) => {
        const i = (s.current + 1) % total;
        return { current: i, mounted: new Set(s.mounted).add(i).add((i + 1) % total) };
      });
    }, INTERVAL_MS);
    return () => window.clearTimeout(t);
  }, [current, paused, total]);

  return (
    <>
      <div className="absolute inset-0 -z-20" aria-hidden>
        {images.map((img, i) =>
          mounted.has(i) ? (
            <Image
              key={img.id}
              src={heroImageUrl(img)}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              loader={unsplashLoader}
              className={cn("object-cover transition-opacity", i === current ? "opacity-100" : "opacity-0")}
              style={{ objectPosition: `${img.x}% ${img.y}%`, transitionDuration: "var(--duration-slow)" }}
            />
          ) : null,
        )}
      </div>
      {total > 1 && (
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 text-on-dark sm:bottom-5 sm:right-5">
          <p className="hidden text-caption text-on-dark/80 sm:block">{images[current].subject}</p>
          <div className="flex items-center" role="group" aria-label="Fotografias">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Fotografia ${i + 1}: ${img.subject}`}
                aria-current={i === current ? "true" : undefined}
                className="group flex size-6 items-center justify-center max-md:size-11"
              >
                <span className={cn("block size-2 rounded-pill transition-transform", i === current ? "scale-125 bg-on-dark" : "bg-on-dark/45 group-hover:bg-on-dark/80")} />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setUserPaused(!paused)}
            aria-label={paused ? "Retomar fotografias" : "Pausar fotografias"}
            className="flex size-8 items-center justify-center rounded-pill border border-on-dark/40 hover:bg-on-dark/10 max-md:size-11"
          >
            {paused ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden />}
          </button>
        </div>
      )}
    </>
  );
}
