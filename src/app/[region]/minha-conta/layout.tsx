import type { Metadata } from "next";

import { AccountShell, RAC_NAV } from "@/components/account/account-shell";

export const metadata: Metadata = { title: { default: "A minha conta", template: "%s | A minha conta" }, robots: { index: false } };

export default function AccountLayout({ children }: LayoutProps<"/[region]/minha-conta">) {
  return (
    <AccountShell title="A minha conta" nav={RAC_NAV}>
      {children}
    </AccountShell>
  );
}
