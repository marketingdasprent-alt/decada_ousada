import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthShell } from "@/components/account/auth-shell";
import { LoginForm } from "@/components/account/auth-forms";
import { Notice } from "@/components/shared/states";
import { ButtonLink, Skeleton } from "@/components/shared/ui";
import { firstParam } from "@/lib/search";
import { getSession } from "@/services/auth";
import { DEMO_ACCOUNT } from "@/services/auth/seed";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default function LoginPage({ searchParams }: PageProps<"/[region]/entrar">) {
  return (
    <Suspense
      fallback={
        <AuthShell title="Entrar">
          <Skeleton className="h-72" />
        </AuthShell>
      }
    >
      <Login searchParams={searchParams} />
    </Suspense>
  );
}

async function Login({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const next = firstParam((await searchParams).next);
  if (await getSession()) redirect(next?.startsWith("/") ? next : "/minha-conta");
  const demo = process.env.WEGEST_MODE !== "http";
  const demoNotice = demo && (
    <Notice className="mb-6" title="Conta de demonstração">
      {DEMO_ACCOUNT.email}, {DEMO_ACCOUNT.password}
    </Notice>
  );

  // Vindo de "Candidatar-me": quase sempre um motorista novo, por isso criar conta vem primeiro
  if (next?.startsWith("/tvde/candidatura")) {
    return (
      <AuthShell
        title="Crie a sua conta para se candidatar"
        description="A conta serve para preencher a candidatura, enviar documentos e acompanhar a resposta. A sua escolha de viatura fica guardada."
      >
        <ButtonLink href={`/registar?next=${encodeURIComponent(next)}`} size="lg" className="w-full">Criar conta</ButtonLink>
        <h2 className="mb-4 mt-8 border-t border-line pt-8 font-semibold">Já tem conta? Entre para continuar</h2>
        {demoNotice}
        <LoginForm next={next} secondary />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Entrar" description="Aceda à sua área de cliente.">
      {demoNotice}
      <LoginForm next={next} />
    </AuthShell>
  );
}
