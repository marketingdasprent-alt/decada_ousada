import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuthShell } from "@/components/account/auth-shell";
import { NewPasswordForm } from "@/components/account/driver-auth-forms";
import { driverAuthEnabled } from "@/lib/driver-account";
import { regionFromParams } from "@/lib/region";

export const metadata: Metadata = { title: "Nova password", robots: { index: false } };

/** Destino do link de recuperação da conta de motorista (autorizado no WeGest). */
export default async function NewPasswordPage({ params }: PageProps<"/[region]/nova-password">) {
  const region = await regionFromParams(params);
  if (!driverAuthEnabled()) notFound();
  return (
    <AuthShell region={region} title="Nova password" description="Escolha a nova password da sua conta.">
      <NewPasswordForm />
    </AuthShell>
  );
}
