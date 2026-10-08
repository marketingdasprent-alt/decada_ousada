import type { Metadata } from "next";
import { Suspense } from "react";

import { ProfileForm } from "@/components/account/profile-form";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { ButtonLink, Skeleton } from "@/components/shared/ui";
import { attempt } from "@/lib/attempt";
import { customerToForm } from "@/lib/customer-form";
import { requireCustomer } from "@/lib/guard";
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
  const { customerId } = await requireCustomer("rentacar", "/minha-conta/perfil");
  if (!customerId) {
    return <EmptyState title="Ainda não tem ficha de cliente" description="A ficha é criada automaticamente na primeira reserva." action={<ButtonLink href="/rent-a-car" size="sm">Fazer uma reserva</ButtonLink>} />;
  }
  const res = await attempt(() => getCustomer(customerId));
  if (!res.ok || !res.data) return <ErrorState timeout={!res.ok && res.timeout} retryHref="/minha-conta/perfil" />;
  return <ProfileForm initial={customerToForm(res.data)} type="rentacar" />;
}
