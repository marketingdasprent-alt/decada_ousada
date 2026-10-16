import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthShell } from "@/components/account/auth-shell";
import { LoginForm } from "@/components/account/auth-forms";
import { DriverConfirmation, DriverLoginForm, DriverSignOutButton } from "@/components/account/driver-auth-forms";
import { LoginTypeSwitch } from "@/components/account/login-type-switch";
import { ButtonLink, buttonClass, Skeleton } from "@/components/shared/ui";
import { DRIVER_AREA_URL } from "@/domain/drivers";
import type { Region } from "@/domain/region";
import { driverAuthEnabled } from "@/lib/driver-account";
import { regionFromParams } from "@/lib/region";
import { firstParam } from "@/lib/search";
import { getSession, isDriverSession } from "@/services/auth";

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
  const query = await searchParams;
  const next = firstParam(query.next);
  const driverAccounts = driverAuthEnabled();
  const isDriverLogin = firstParam(query.tipo) === "motorista";
  const session = await getSession();

  // Motorista com sessão: a página da conta é esta (o painel completo fica no WeGest)
  if (session && isDriverSession(session) && isDriverLogin && !next) {
    return (
      <AuthShell region={region} title="A sua conta de motorista" description={`Sessão iniciada como ${session.user.email}.`}>
        <p className="text-copy-secondary">
          Esta é a sua conta WeGest: entra com o mesmo email e a mesma password no portal e na app do motorista.
        </p>
        <div className="mt-6 space-y-3">
          <ButtonLink href="/tvde/candidatura" size="lg" className="w-full">Preencher o cadastro de motorista</ButtonLink>
          <ButtonLink href="/tvde/viaturas" variant="outline" size="lg" className="w-full">Ver viaturas TVDE</ButtonLink>
          <a href={DRIVER_AREA_URL} className={buttonClass("outline", "lg", "w-full")}>
            Abrir o painel do motorista
            <ExternalLink className="size-4" aria-hidden />
          </a>
        </div>
        <div className="mt-8 border-t border-line pt-5">
          <DriverSignOutButton />
        </div>
      </AuthShell>
    );
  }
  // Cliente Rent a Car a candidatar-se: a candidatura pede a conta de motorista, por isso fica aqui
  const needsDriverAccount = driverAccounts && next?.startsWith("/tvde/candidatura") && !isDriverSession(session);
  if (session && !needsDriverAccount) redirect(next?.startsWith("/") && !next.startsWith("//") ? next : isDriverSession(session) ? "/entrar?tipo=motorista" : "/minha-conta");

  // Link do email de confirmação da conta de motorista (chega com a sessão no URL)
  if (driverAccounts && firstParam(query.confirmado) === "1") {
    return (
      <AuthShell region={region} title="Confirmar conta">
        <DriverConfirmation />
      </AuthShell>
    );
  }

  // Vindo de "Candidatar-me" com contas WeGest: a conta de motorista, criar conta primeiro
  if (driverAccounts && next?.startsWith("/tvde/candidatura")) {
    return (
      <AuthShell
        region={region}
        title="Crie a sua conta de motorista"
        description={`A conta é a mesma do portal e da app do motorista.${next.includes("viatura=") ? " A sua escolha de viatura fica guardada." : ""}`}
      >
        <ButtonLink href={`/registar?tipo=motorista&next=${encodeURIComponent(next)}`} size="lg" className="w-full">Criar conta</ButtonLink>
        <h2 className="mb-4 mt-8 border-t border-line pt-8 font-semibold">Já tem conta? Entre para continuar</h2>
        <DriverLoginForm next={next} secondary />
      </AuthShell>
    );
  }

  // Vindo de "Candidatar-me": quase sempre um motorista novo, por isso criar conta vem primeiro
  if (next?.startsWith("/tvde/candidatura")) {
    return (
      <AuthShell
        region={region}
        title="Crie a sua conta para se candidatar"
        description={`A conta serve para preencher a candidatura, enviar documentos e acompanhar a resposta.${next.includes("viatura=") ? " A sua escolha de viatura fica guardada." : ""}`}
      >
        <ButtonLink href={`/registar?next=${encodeURIComponent(next)}`} size="lg" className="w-full">Criar conta</ButtonLink>
        <h2 className="mb-4 mt-8 border-t border-line pt-8 font-semibold">Já tem conta? Entre para continuar</h2>
        <LoginForm next={next} secondary />
      </AuthShell>
    );
  }

  // Motorista TVDE com contas WeGest: entra aqui, com a mesma conta do portal e da app
  if (driverAccounts && isDriverLogin) {
    return (
      <AuthShell region={region} title="Entrar" description="Entre com a conta de motorista, a mesma do portal e da app do WeGest.">
        <LoginTypeSwitch current="motorista" next={next} />
        <DriverLoginForm next={next} />
      </AuthShell>
    );
  }

  // Motorista TVDE sem contas WeGest configuradas: o login é o do painel do motorista de lá
  if (isDriverLogin) {
    return (
      <AuthShell region={region} title="Entrar" description="Aceda ao painel do motorista TVDE.">
        <LoginTypeSwitch current="motorista" next={next} />
        <p className="text-copy-secondary">
          O painel do motorista abre no WeGest. Entre com o email e a password da sua conta de motorista.
        </p>
        <a href={DRIVER_AREA_URL} className={buttonClass("primary", "lg", "mt-6 w-full")}>
          Ir para o painel do motorista
          <ExternalLink className="size-4" aria-hidden />
        </a>
        <div className="mt-8 border-t border-line pt-5 text-center">
          <p className="text-body-small text-copy-secondary">Ainda não trabalha connosco?</p>
          <ButtonLink href="/motoristas" variant="outline" size="lg" className="mt-3 w-full">Candidatar-me como motorista</ButtonLink>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell region={region} title="Entrar" description="Aceda à sua área de cliente Rent a Car.">
      <LoginTypeSwitch current="rentacar" next={next} />
      <LoginForm next={next} />
    </AuthShell>
  );
}
