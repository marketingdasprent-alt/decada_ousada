import { CarFront, FileText, UserRound } from "lucide-react";
import Link from "next/link";

/** Atalhos da visão geral da conta Rent a Car. `bookingsText` resume as reservas (ex.: "3 no total"). */
export function AccountShortcuts({ bookingsText }: { bookingsText: string }) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {[
        { href: "/minha-conta/reservas", icon: CarFront, label: "As minhas reservas", text: bookingsText },
        { href: "/minha-conta/perfil", icon: UserRound, label: "Dados pessoais", text: "Carta, morada e NIF" },
        { href: "/minha-conta/faturas", icon: FileText, label: "Faturas", text: "Descarregar documentos" },
      ].map(({ href, icon: Icon, label, text }) => (
        <Link key={href} href={href} className="rounded-panel border border-line bg-panel p-5 transition-colors hover:border-copy/25">
          <Icon className="size-6 text-brand" aria-hidden />
          <p className="mt-3 font-semibold">{label}</p>
          <p className="text-body-small text-copy-muted">{text}</p>
        </Link>
      ))}
    </section>
  );
}
