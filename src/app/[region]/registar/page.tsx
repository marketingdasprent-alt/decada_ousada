import type { Metadata } from "next";
import { Suspense } from "react";

import { RegisterForm } from "@/components/account/auth-forms";
import { AuthShell } from "@/components/account/auth-shell";
import { DriverRegisterForm } from "@/components/account/driver-auth-forms";
import { Notice } from "@/components/shared/states";
import { Skeleton } from "@/components/shared/ui";
import type { Region } from "@/domain/region";
import { driverAuthEnabled } from "@/lib/driver-account";
import { regionFromParams } from "@/lib/region";
import { firstParam } from "@/lib/search";

export const metadata: Metadata = { title: "Criar conta", robots: { index: false } };

export default async function RegisterPage({ params, searchParams }: PageProps<"/[region]/registar">) {
  const region = await regionFromParams(params);
  return (
    <Suspense
      fallback={
        <AuthShell region={region} title="Criar conta">
          <Skeleton className="h-80" />
        </AuthShell>
      }
    >
      <Register region={region} searchParams={searchParams} />
    </Suspense>
  );
}

async function Register({ region, searchParams }: { region: Region; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const next = firstParam(query.next);
  const fromApplication = next?.startsWith("/tvde/candidatura");
  const viewingChoice = fromApplication && (
    <Notice className="mb-6" title="A sua escolha de viatura fica guardada">
      Depois de criar a conta, continua a candidatura na viatura e data que escolheu.
    </Notice>
  );

  // Conta de motorista: conta WeGest, a mesma do portal e da app do motorista
  if (driverAuthEnabled() && (firstParam(query.tipo) === "motorista" || fromApplication)) {
    return (
      <AuthShell region={region} title="Criar conta de motorista" description="Com esta conta candidata-se no site e entra no portal e na app do motorista do WeGest.">
        {viewingChoice}
        <DriverRegisterForm next={next} />
      </AuthShell>
    );
  }

  return (
    <AuthShell region={region} title="Criar conta" description="A conta serve para entrar no site. Os seus dados de cliente ficam no nosso sistema de gestão.">
      {viewingChoice}
      <RegisterForm next={next} />
    </AuthShell>
  );
}
