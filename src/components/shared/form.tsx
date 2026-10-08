import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

const control =
  "w-full rounded-control border border-line-control bg-panel px-3.5 text-body text-copy placeholder:text-copy-muted/70 transition-colors focus:border-focus focus:outline-none focus:ring-2 focus:ring-focus/20 disabled:bg-panel-alt aria-[invalid=true]:border-negative aria-[invalid=true]:ring-negative/15";

export function Label({ htmlFor, children, required, className }: { htmlFor?: string; children: ReactNode; required?: boolean; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn("mb-1.5 block text-body-small font-medium text-copy-secondary", className)}>
      {children}
      {required && <span className="text-brand" aria-hidden> *</span>}
    </label>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, "h-11", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  // pr-9: espaço da seta (o px-3.5 do controlo anulava o padding de .select-control)
  return (
    <select className={cn(control, "select-control h-11 pr-9", className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-24 py-2.5", className)} {...props} />;
}

export function FieldError({ id, children }: { id?: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 text-body-small text-negative">
      {children}
    </p>
  );
}

/**
 * Um único anúncio por envio ("Há 3 campos por corrigir."), em vez de um alerta por campo.
 * O foco vai para o primeiro campo inválido, que lê o seu próprio erro.
 */
export function ErrorSummary({ count, className }: { count: number; className?: string }) {
  return (
    <p role="alert" className={cn("text-body-small font-semibold text-negative", !count && "sr-only", className)}>
      {count === 0 ? "" : count === 1 ? "Há 1 campo por corrigir." : `Há ${count} campos por corrigir.`}
    </p>
  );
}

export function Field({
  label,
  htmlFor,
  required,
  error,
  help,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor: string;
  required?: boolean;
  error?: string;
  help?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {help && !error && <p className="mt-1.5 text-caption text-copy-muted">{help}</p>}
      <FieldError id={`${htmlFor}-error`}>{error}</FieldError>
    </div>
  );
}

export function Checkbox({ label, className, ...props }: ComponentProps<"input"> & { label: ReactNode }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 text-body-small text-copy-secondary max-md:min-h-(--layout-tap) max-md:py-2.5", className)}>
      <input type="checkbox" className="mt-0.5 size-4.5 shrink-0 cursor-pointer accent-selected" {...props} />
      <span>{label}</span>
    </label>
  );
}
