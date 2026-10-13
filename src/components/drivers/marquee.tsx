"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * Faixa que corre sozinha e acelera com o scroll (a subir, inverte o sentido). O conteúdo
 * vai duas vezes seguidas para o ciclo não ter costura; a cópia é invisível para leitores
 * de ecrã. Com movimento reduzido fica parada e passa a ter scroll horizontal próprio.
 * Só mexe em `transform` e só enquanto está no ecrã.
 */
export function Marquee({
  children,
  direction = -1,
  speed = 0.5,
  pauseOnHover = false,
  className,
  trackClassName,
}: {
  children: ReactNode;
  /** -1 corre para a esquerda, 1 para a direita. */
  direction?: -1 | 1;
  /** Píxeis por frame, sem scroll. */
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
  trackClassName?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    const root = box.current;
    if (!el || !root || window.matchMedia(REDUCED).matches) return;

    let x = 0;
    let width = 0;
    let lastY = window.scrollY;
    let velocity = 0;
    let visible = false;
    let paused = false;
    let frame = 0;

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(root);
    const pause = () => {
      paused = pauseOnHover;
    };
    const resume = () => {
      paused = false;
    };
    const measure = () => {
      width = el.scrollWidth / 2;
    };
    root.addEventListener("pointerenter", pause);
    root.addEventListener("pointerleave", resume);
    window.addEventListener("resize", measure);

    const tick = () => {
      const y = window.scrollY;
      velocity = velocity * 0.88 + (y - lastY) * 0.12;
      lastY = y;
      if (visible && width === 0) measure();
      const boost = Math.min(Math.abs(velocity) * 0.35, 14);
      if (visible && width > 0 && (!paused || boost > 1)) {
        x += direction * (speed + boost) * (velocity < 0 ? -1 : 1);
        // Mantém x em ]-width, 0]: o salto de uma volta inteira é invisível
        x = ((x % width) - width) % width;
        el.style.transform = `translate3d(${x}px, 0, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      root.removeEventListener("pointerenter", pause);
      root.removeEventListener("pointerleave", resume);
      window.removeEventListener("resize", measure);
      el.style.transform = "";
    };
  }, [direction, speed, pauseOnHover]);

  return (
    <div ref={box} className={cn("overflow-hidden motion-reduce:scrollbar-none motion-reduce:overflow-x-auto", className)}>
      <div ref={track} className="flex w-max will-change-transform">
        <div className={cn("flex shrink-0", trackClassName)}>{children}</div>
        <div className={cn("flex shrink-0 motion-reduce:hidden", trackClassName)} aria-hidden inert>
          {children}
        </div>
      </div>
    </div>
  );
}
