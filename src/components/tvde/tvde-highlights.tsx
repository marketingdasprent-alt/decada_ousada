import { BadgeEuro, ClipboardList, IdCard, MonitorSmartphone } from "lucide-react";
import Link from "next/link";

import { formatMoney, TVDE_RESERVATION_FEE } from "@/domain/pricing";
import type { Region } from "@/domain/region";

/**
 * "O que precisa de saber" sobre o TVDE, para a faixa da página inicial. Só informação
 * confirmada (docs/conteudo/mapa-informacao.md): o sinal (regra da empresa), o que cada
 * viatura mostra (vem do sistema), o certificado (IMT; regime regional nos Açores) e a
 * candidatura online (funcionalidade do site).
 */
export function TvdeHighlights({ region }: { region: Region }) {
  const items = [
    {
      icon: BadgeEuro,
      title: `Sinal de ${formatMoney(TVDE_RESERVATION_FEE)}`,
      text: "Confirma a reserva da viatura e é descontado na caução quando a levanta.",
      link: { href: "/perguntas-frequentes", label: "Perguntas sobre valores" },
    },
    {
      icon: ClipboardList,
      title: "Tudo à vista antes de se candidatar",
      text: "Cada viatura mostra o preço semanal, a caução, os km incluídos, o período mínimo e o que o preço inclui.",
      link: { href: "/tvde/viaturas", label: "Ver viaturas TVDE" },
    },
    {
      icon: IdCard,
      title: "Certificado de motorista TVDE",
      text:
        region === "azores"
          ? "Nos Açores aplica-se o regime regional TVDE, com certificado e formação próprios da região."
          : "É emitido pelo IMT: carta B há mais de 3 anos, curso com avaliação final e registo criminal.",
      link: { href: "/tvde#requisitos", label: "Ver requisitos" },
    },
    {
      icon: MonitorSmartphone,
      title: "Candidatura online",
      text: "Cadastro, envio de documentos e pagamento do sinal no site; acompanha o estado na sua área de cliente.",
      link: { href: "/tvde/minha-conta", label: "A minha candidatura" },
    },
  ];

  return (
    <div className="mt-12 border-t border-on-dark/20 pt-10">
      <h3 className="display text-h3">O que precisa de saber</h3>
      {/* Quatro cartões: duas linhas de dois, ou uma linha de quatro (sem espaço vazio) */}
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text, link }) => (
          <li key={title} className="flex flex-col rounded-panel border border-on-dark/15 bg-on-dark/5 p-5">
            <Icon className="size-6 text-on-dark" aria-hidden />
            <p className="mt-4 font-semibold">{title}</p>
            <p className="mt-1 text-body-small text-on-dark/75">{text}</p>
            {/* Cada cartão termina numa ação, alinhada ao fundo (sem espaço vazio) */}
            <div className="mt-4 flex flex-1 items-end">
              <Link href={link.href} className="text-body-small font-medium text-on-dark underline underline-offset-4 hover:text-on-dark/80 max-md:tap-target">
                {link.label}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
