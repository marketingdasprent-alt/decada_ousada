import { Mail, Phone } from "lucide-react";
import type { Metadata } from "next";

import { ContactValue } from "@/components/shared/pending";
import { Card } from "@/components/shared/ui";
import { REGION_CONFIG } from "@/domain/region";
import { regionFromParams } from "@/lib/region";

export const metadata: Metadata = { title: "Suporte" };

export default async function SupportPage({ params }: PageProps<"/[region]/tvde/minha-conta/suporte">) {
  const region = await regionFromParams(params);
  const c = REGION_CONFIG[region].contact;
  return (
    <>
      <h2 className="text-h3 font-bold">Suporte TVDE</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-5"><Phone className="size-6 text-brand" aria-hidden /><p className="mt-3 font-semibold">Telefone</p><ContactValue kind="phone" value={c.phone} className="text-body-small text-copy-secondary" /></Card>
        <Card className="p-5"><Mail className="size-6 text-brand" aria-hidden /><p className="mt-3 font-semibold">Email</p><ContactValue kind="email" value={c.email} className="text-body-small text-copy-secondary" /></Card>
      </div>
    </>
  );
}
