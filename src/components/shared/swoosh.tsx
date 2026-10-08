import { cn } from "@/lib/cn";

/** Linhas do carro do logótipo, usadas como elemento gráfico. */
export function Swoosh({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1000 460" className={cn("pointer-events-none", className)} fill="none" aria-hidden>
      <path d="M630 4C380 6 150 40 70 150 10 232 30 320 130 380c90 54 190 70 260 80-90-18-210-40-290-100C10 300-4 220 60 150 150 50 390 14 630 4z" fill="currentColor" />
      <path d="M420 128c40-30 120-70 230-78 110-8 180 30 290 54 30 6 50 8 60 8-20 2-60 0-110-10-90-18-160-46-250-40-90 6-150 40-180 64-12 8-24 6-40 2z" fill="currentColor" />
      <path d="M170 182c80-36 190-52 340-56 130-4 210-6 300-10-60 10-160 20-300 26-120 4-160 12-210 26-50 14-90 16-130 14z" fill="currentColor" />
    </svg>
  );
}
