import type { Metadata } from "next";

import { RecoverForm } from "@/components/account/auth-forms";
import { AuthShell } from "@/components/account/auth-shell";
import { regionFromParams } from "@/lib/region";

export const metadata: Metadata = { title: "Recuperar password", robots: { index: false } };

export default async function RecoverPage({ params }: PageProps<"/[region]/recuperar-password">) {
  const region = await regionFromParams(params);
  return (
    <AuthShell region={region} title="Recuperar password" description="Indique o email da sua conta. Enviamos um link para definir uma nova password.">
      <RecoverForm />
    </AuthShell>
  );
}
