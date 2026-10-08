import { cn } from "@/lib/cn";

/**
 * Marcador visível de conteúdo ainda não fornecido pelo cliente
 * (Blueprint: content integrity, nunca disfarçar um placeholder de facto).
 */
export function Pending({ children = "A confirmar", className }: { children?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-control border border-dashed border-caution/60 bg-caution-surface px-2 py-0.5 text-caption font-semibold text-caution", className)}>
      {children}
    </span>
  );
}

/** Telefone, email ou morada da região; mostra "A confirmar" enquanto o cliente não os fornecer. */
export function ContactValue({ kind, value, className }: { kind: "phone" | "email" | "address"; value: string | null; className?: string }) {
  if (!value) return <Pending>{kind === "phone" ? "Telefone a confirmar" : kind === "email" ? "Email a confirmar" : "Morada a confirmar"}</Pending>;
  if (kind === "address") return <span className={className}>{value}</span>;
  const href = kind === "phone" ? `tel:${value.replace(/\s/g, "")}` : `mailto:${value}`;
  return <a href={href} className={className}>{value}</a>;
}
