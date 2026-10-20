import type { Metadata } from "next";

import { AccountShell } from "@/components/account/account-shell";

export const metadata: Metadata = { title: { default: "A minha conta", template: "%s | A minha conta" }, robots: { index: false } };

export default function AccountLayout({ children }: LayoutProps<"/[region]/minha-conta">) {
  return <AccountShell>{children}</AccountShell>;
}
