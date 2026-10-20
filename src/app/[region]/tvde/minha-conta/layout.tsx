import type { Metadata } from "next";

import { AccountShell } from "@/components/account/account-shell";

export const metadata: Metadata = { title: { default: "A minha conta", template: "%s | A minha conta" }, robots: { index: false } };

/** As páginas TVDE vivem no mesmo painel da conta; cada uma exige acesso TVDE (requireTvde). */
export default function TvdeAccountLayout({ children }: LayoutProps<"/[region]/tvde/minha-conta">) {
  return <AccountShell>{children}</AccountShell>;
}
