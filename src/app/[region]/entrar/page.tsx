import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthShell } from "@/components/account/auth-shell";
import { LoginForm } from "@/components/account/auth-forms";
import { ButtonLink, Skeleton } from "@/components/shared/ui";
import type { Region } from "@/domain/region";
import { regionFromParams } from "@/lib/region";
import { firstParam } from "@/lib/search";
import { getSession } from "@/services/auth";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function LoginPage({ params, searchParams }: PageProps<"/[region]/entrar">) {
  const region = await regionFromParams(params);
  return (
    <Suspense
      fallback={
        <AuthShell region={region} title="Entrar">
          <Skeleton className="h-72" />
        </AuthShell>
      }
    >
      <Login region={region} searchParams={searchParams} />
    </Suspense>
  );
}

async function Login({ region, searchParams }: { region: Region; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const next = firstParam((await searchParams).next);
  if (await getSession()) redirect(next?.startsWith("/") ? next : "/minha-conta");

  // Vindo de "Candidatar-me": quase sempre um motorista novo, por isso criar conta vem primeiro
  if (next?.startsWith("/tvde/candidatura")) {
    return (
      <AuthShell
        region={region}
        title="Crie a sua conta para se candidatar"
        description="A conta serve para preencher a candidatura, enviar documentos e acompanhar a resposta. A sua escolha de viatura fica guardada."
      >
        <ButtonLink href={`/registar?next=${encodeURIComponent(next)}`} size="lg" className="w-full">Criar conta</ButtonLink>
        <h2 className="mb-4 mt-8 border-t border-line pt-8 font-semibold">Já tem conta? Entre para continuar</h2>
        <LoginForm next={next} secondary />
      </AuthShell>
    );
  }

  return (
    <AuthShell region={region} title="Entrar" description="Aceda à sua área de cliente.">
      <LoginForm next={next} />
    </AuthShell>
  );
}
