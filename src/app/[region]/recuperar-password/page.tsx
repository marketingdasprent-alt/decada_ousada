import type { Metadata } from "next";
import { Suspense } from "react";

import { RecoverForm } from "@/components/account/auth-forms";
import { AuthShell } from "@/components/account/auth-shell";
import { DriverRecoverForm } from "@/components/account/driver-auth-forms";
import { Skeleton } from "@/components/shared/ui";
import { driverAuthEnabled } from "@/lib/driver-account";
import { regionFromParams } from "@/lib/region";
import { firstParam } from "@/lib/search";

export const metadata: Metadata = { title: "Recuperar password", robots: { index: false } };

export default async function RecoverPage({ params, searchParams }: PageProps<"/[region]/recuperar-password">) {
  const region = await regionFromParams(params);
  return (
    <AuthShell region={region} title="Recuperar password" description="Indique o email da sua conta. Enviamos um link para definir uma nova password.">
      <Suspense fallback={<Skeleton className="h-40" />}>
        <Recover searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function Recover({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // Conta de motorista: o link vem do WeGest e abre /nova-password
  if (driverAuthEnabled() && firstParam((await searchParams).tipo) === "motorista") return <DriverRecoverForm />;
  return <RecoverForm />;
}
