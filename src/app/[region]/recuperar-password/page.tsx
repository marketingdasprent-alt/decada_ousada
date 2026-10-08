import type { Metadata } from "next";

import { RecoverForm } from "@/components/account/auth-forms";
import { AuthShell } from "@/components/account/auth-shell";

export const metadata: Metadata = { title: "Recuperar password", robots: { index: false } };

export default function RecoverPage() {
  return (
    <AuthShell title="Recuperar password" description="Indique o email da sua conta. Enviamos um link para definir uma nova password.">
      <RecoverForm />
    </AuthShell>
  );
}
