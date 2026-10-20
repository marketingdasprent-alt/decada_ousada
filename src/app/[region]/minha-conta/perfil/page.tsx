import type { Metadata } from "next";
import { Suspense } from "react";

import { ProfileForm } from "@/components/account/profile-form";
import { WeGestProfile } from "@/components/account/wegest-profile";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { ButtonLink, Skeleton } from "@/components/shared/ui";
import { attempt } from "@/lib/attempt";
import { customerToForm } from "@/lib/customer-form";
import { driverAuthEnabled } from "@/lib/driver-account";
import { requireCustomer } from "@/lib/guard";
import { getCustomerId } from "@/services/auth";
import { getCustomer } from "@/services/wegest";

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
  // Conta WeGest: a ficha nasce do registo e lê-se em GET /conta (só leitura: a API não a altera)
  if (driverAuthEnabled()) return <WeGestProfile />;
  // Sem ficha Rent a Car, mostra a ficha preenchida no cadastro (ficha pessoal), se existir
  const tvdeId = racId ? null : await getCustomerId(session, "tvde");
  const customerId = racId ?? tvdeId;
  if (!customerId) {
    // Contas do próprio site (sem WeGest): a ficha cria-se no checkout, com os dados do condutor, antes da reserva
    return (
      <EmptyState
        title="Ainda não tem ficha pessoal"
        description="A ficha é criada com os dados do condutor, no checkout, antes de a reserva ser confirmada."
        action={<ButtonLink href="/rent-a-car" size="sm">Pesquisar viaturas</ButtonLink>}
      />
    );
  }
  const res = await attempt(() => getCustomer(customerId));
  if (!res.ok || !res.data) return <ErrorState timeout={!res.ok && res.timeout} retryHref="/minha-conta/perfil" />;
  return <ProfileForm initial={customerToForm(res.data)} type={racId ? "rentacar" : "tvde"} />;
}
