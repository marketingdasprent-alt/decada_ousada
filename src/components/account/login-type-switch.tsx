import Link from "next/link";

import { cn } from "@/lib/cn";

export type LoginType = "rentacar" | "motorista";

const TYPES: Array<{ id: LoginType; title: string; text: string }> = [
  { id: "rentacar", title: "Rent a Car", text: "Reservas e faturas" },
  { id: "motorista", title: "Motorista TVDE", text: "Cadastro e painel" },
];

/**
 * Os dois tipos de conta em /entrar (pedido da equipa, 2026-10-14) e em /registar. São links
 * (?tipo=…) e não botões: a página escolhe o formulário no servidor e funciona sem JavaScript.
 */
export function LoginTypeSwitch({ current, next, path = "/entrar" }: { current: LoginType; next?: string; path?: "/entrar" | "/registar" }) {
  const href = (type: LoginType) => {
    const query = new URLSearchParams();
    if (type === "motorista") query.set("tipo", "motorista");
    if (next) query.set("next", next);
    const qs = query.toString();
    return `${path}${qs ? `?${qs}` : ""}`;
  };
  return (
    <nav aria-label="Tipo de conta" className="mb-8 grid grid-cols-2 gap-3">
      {TYPES.map((t) => (
        <Link
          key={t.id}
          href={href(t.id)}
          replace
          scroll={false}
          aria-current={current === t.id ? "page" : undefined}
          className={cn(
            "rounded-panel border-2 px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
            current === t.id ? "border-brand bg-brand text-on-brand" : "border-line-strong bg-panel hover:border-copy",
          )}
        >
          <span className="display block text-h4">{t.title}</span>
          <span className="text-body-small">{t.text}</span>
        </Link>
      ))}
    </nav>
  );
}
