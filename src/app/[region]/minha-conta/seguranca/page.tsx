import type { Metadata } from "next";
import { Suspense } from "react";

import { ChangePasswordForm } from "@/components/account/auth-forms";
import { Card, Skeleton } from "@/components/shared/ui";
import { requireSession } from "@/lib/guard";

export const metadata: Metadata = { title: "Segurança" };

export default function SecurityPage() {
  return (
    <>
      <h2 className="text-h3 font-bold">Segurança</h2>
      <Suspense fallback={<Skeleton className="mt-6 h-72" />}>
        <Security />
      </Suspense>
    </>
  );
}

async function Security() {
  const session = await requireSession("/minha-conta/seguranca");
  return (
    <Card className="mt-6 p-5 sm:p-6">
      <p className="mb-6 text-body-small text-copy-secondary">Conta: <strong className="text-copy">{session.user.email}</strong></p>
      <ChangePasswordForm />
    </Card>
  );
}
