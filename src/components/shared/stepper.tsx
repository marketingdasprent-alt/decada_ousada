import { Check } from "lucide-react";

import { cn } from "@/lib/cn";

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <nav aria-label="Progresso" className="min-w-0 max-w-full">
      <ol className="flex items-center gap-2 overflow-x-auto pb-1">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className="flex shrink-0 items-center gap-2" aria-current={active ? "step" : undefined}>
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-pill text-caption font-bold tabular",
                  done && "bg-panel-dark text-on-dark",
                  active && "bg-brand text-on-brand",
                  !done && !active && "bg-panel-sunken text-copy-muted",
                )}
              >
                {done ? <Check className="size-3.5" aria-hidden /> : i + 1}
              </span>
              <span className={cn("text-body-small", active ? "font-semibold text-copy" : "text-copy-muted", !active && "sr-only sm:not-sr-only")}>{label}</span>
              {i < steps.length - 1 && <span className="h-px w-4 bg-line sm:mx-1 sm:w-10" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
