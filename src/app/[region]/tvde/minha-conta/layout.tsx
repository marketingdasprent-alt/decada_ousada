import type { Metadata } from "next";

import { AccountShell, TVDE_NAV } from "@/components/account/account-shell";

export const metadata: Metadata = { title: { default: "Área TVDE", template: "%s | Área TVDE" }, robots: { index: false } };

export default function TvdeAccountLayout({ children }: LayoutProps<"/[region]/tvde/minha-conta">) {
  return (
    <AccountShell title="Área TVDE" nav={TVDE_NAV}>
      {children}
    </AccountShell>
  );
}
