import { Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { ContactValue } from "@/components/shared/pending";
import { Card, Skeleton } from "@/components/shared/ui";
import { REGION_CONFIG, type Region } from "@/domain/region";
import { requireTvde } from "@/lib/guard";
import { regionFromParams } from "@/lib/region";

export const metadata: Metadata = { title: "Suporte" };

export default async function SupportPage({ params }: PageProps<"/[region]/tvde/minha-conta/suporte">) {
  const region = await regionFromParams(params);
  return (
    <>
      <h2 className="text-h3 font-bold">Suporte TVDE</h2>
      <Suspense fallback={<Skeleton className="mt-6 h-32" />}>
        <Contacts region={region} />
      </Suspense>
    </>
  );
}

async function Contacts({ region }: { region: Region }) {
  await requireTvde("/tvde/minha-conta/suporte");
  const c = REGION_CONFIG[region].contact;
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <Card className="p-5"><Phone className="size-6 text-brand" aria-hidden /><p className="mt-3 font-semibold">Telefone</p><ContactValue kind="phone" value={c.phone} className="text-body-small text-copy-secondary" /></Card>
      <Card className="p-5"><Mail className="size-6 text-brand" aria-hidden /><p className="mt-3 font-semibold">Email</p><ContactValue kind="email" value={c.email} className="text-body-small text-copy-secondary" /></Card>
    </div>
  );
}
