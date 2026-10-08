import type { Metadata } from "next";
import { Suspense } from "react";

import { RegisterForm } from "@/components/account/auth-forms";
import { AuthShell } from "@/components/account/auth-shell";
import { Notice } from "@/components/shared/states";
import { Skeleton } from "@/components/shared/ui";
import { firstParam } from "@/lib/search";

export const metadata: Metadata = { title: "Criar conta", robots: { index: false } };

export default function RegisterPage({ searchParams }: PageProps<"/[region]/registar">) {
  return (
    <AuthShell title="Criar conta" description="A conta serve para entrar no site. Os seus dados de cliente ficam no nosso sistema de gestão.">
      <Suspense fallback={<Skeleton className="h-80" />}>
        <Register searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function Register({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const next = firstParam((await searchParams).next);
  return (
    <>
      {next?.startsWith("/tvde/candidatura") && (
        <Notice className="mb-6" title="A sua escolha de viatura fica guardada">
          Depois de criar a conta, continua a candidatura na viatura e data que escolheu.
        </Notice>
      )}
      <RegisterForm next={next} />
    </>
  );
}
