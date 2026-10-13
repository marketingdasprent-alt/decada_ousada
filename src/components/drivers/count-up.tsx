"use client";

import { useEffect, useRef } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";
const DURATION = 1500;

/**
 * Número que conta de 0 até ao valor quando entra no ecrã ("500+", "7 dias"). O HTML do
 * servidor já traz o valor final (sem JavaScript, com movimento reduzido ou se já estiver à
 * vista, fica assim). Leitores de ecrã leem sempre o valor final.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const match = value.match(/^(\d+)(.*)$/);
    if (!el || !match || window.matchMedia(REDUCED).matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    const target = Number(match[1]);
    const suffix = match[2];
    let frame = 0;
    el.textContent = `0${suffix}`;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / DURATION, 1);
          el.textContent = `${Math.round(target * (1 - (1 - p) ** 3))}${suffix}`;
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = value;
    };
  }, [value]);

  return (
    <>
      <span ref={ref} className={className} aria-hidden>
        {value}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}
