import type { Metadata } from "next";
import { Suspense } from "react";

import { ProfileForm } from "@/components/account/profile-form";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { ButtonLink, Skeleton } from "@/components/shared/ui";
import { attempt } from "@/lib/attempt";
import { customerToForm } from "@/lib/customer-form";
import { requireCustomer } from "@/lib/guard";
import { getCustomer } from "@/services/wegest";

export const metadata: Metadata = { title: "Perfil" };

export default function TvdeProfilePage() {
  return (
    <>
      <h2 className="text-h3 font-bold">Perfil de motorista</h2>
      <p className="mt-1 text-body text-copy-secondary">As alterações são enviadas para a sua ficha no nosso sistema de gestão.</p>
      <div className="mt-6">
        <Suspense fallback={<Skeleton className="h-150" />}>
          <Profile />
        </Suspense>
      </div>
    </>
  );
}

async function Profile() {
  const { customerId } = await requireCustomer("tvde", "/tvde/minha-conta/perfil");
  if (!customerId) {
    return (
      <EmptyState
        title="Ainda não tem ficha pessoal"
        description="Pode preenchê-la já, sem escolher viatura."
        action={<ButtonLink href="/tvde/candidatura" size="sm">Preencher ficha pessoal</ButtonLink>}
      />
    );
  }
  const res = await attempt(() => getCustomer(customerId));
  if (!res.ok || !res.data) return <ErrorState timeout={!res.ok && res.timeout} retryHref="/tvde/minha-conta/perfil" />;
  return <ProfileForm initial={customerToForm(res.data)} type="tvde" />;
}
