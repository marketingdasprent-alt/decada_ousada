import type { Metadata } from "next";
import { Suspense } from "react";

import { ProfileForm } from "@/components/account/profile-form";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { ButtonLink, Skeleton } from "@/components/shared/ui";
import { attempt } from "@/lib/attempt";
import { customerToForm } from "@/lib/customer-form";
import { requireCustomer } from "@/lib/guard";
import { getCustomerId } from "@/services/auth";
import { getCustomer, integrationMode } from "@/services/wegest";
import { accountCustomerFileReady } from "@/services/wegest/account";

export const metadata: Metadata = { title: "Dados pessoais" };

export default function ProfilePage() {
  return (
    <>
      <h2 className="text-h3 font-bold">Dados pessoais</h2>
      <p className="mt-1 text-body text-copy-secondary">Estes dados estão na sua ficha de cliente no nosso sistema de gestão e são usados nas reservas.</p>
      <div className="mt-6">
        <Suspense fallback={<Skeleton className="h-150" />}>
          <Profile />
        </Suspense>
      </div>
    </>
  );
}

async function Profile() {
  const { session, customerId: racId } = await requireCustomer("rentacar", "/minha-conta/perfil");
  // Sem ficha Rent a Car, mostra a ficha preenchida no cadastro (ficha pessoal), se existir
  const tvdeId = racId ? null : await getCustomerId(session, "tvde");
  const customerId = racId ?? tvdeId;
  if (!customerId) {
    // O cliente Rent a Car preenche a ficha de cliente aqui (nunca a candidatura TVDE). Com a API
    // real, só quando a rota da conta no WeGest estiver ligada; até lá a ficha nasce na 1.ª reserva.
    if (integrationMode() === "mock" || accountCustomerFileReady()) {
      return <ProfileForm create type="rentacar" initial={{ fullName: session.user.name ?? "", email: session.user.email }} />;
    }
    return (
      <EmptyState
        title="Ainda não tem ficha pessoal"
        description="Os seus dados ficam guardados na ficha de cliente quando fizer a primeira reserva."
        action={<ButtonLink href="/rent-a-car" size="sm">Pesquisar viaturas</ButtonLink>}
      />
    );
  }
  const res = await attempt(() => getCustomer(customerId));
  if (!res.ok || !res.data) return <ErrorState timeout={!res.ok && res.timeout} retryHref="/minha-conta/perfil" />;
  return <ProfileForm initial={customerToForm(res.data)} type={racId ? "rentacar" : "tvde"} />;
}
