import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { BookingListItem } from "@/components/account/booking-list-item";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { ButtonLink, Skeleton } from "@/components/shared/ui";
import { attempt } from "@/lib/attempt";
import { cn } from "@/lib/cn";
import { requireCustomer } from "@/lib/guard";
import { firstParam } from "@/lib/search";
import { listCustomerBookings } from "@/services/wegest";

export const metadata: Metadata = { title: "As minhas reservas" };

const TABS = [
  { id: "proximas", label: "Próximas" },
  { id: "anteriores", label: "Anteriores" },
  { id: "canceladas", label: "Canceladas" },
] as const;

export default function BookingsPage({ searchParams }: PageProps<"/[region]/minha-conta/reservas">) {
  return (
    <>
      <h2 className="text-h3 font-bold">As minhas reservas</h2>
      <Suspense fallback={<Skeleton className="mt-6 h-64" />}>
        <List searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function List({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const tab = (firstParam((await searchParams).tab) ?? "proximas") as (typeof TABS)[number]["id"];
  const { customerId } = await requireCustomer("rentacar", "/minha-conta/reservas");
  const res = customerId ? await attempt(() => listCustomerBookings(customerId)) : ({ ok: true, data: [] } as const);
  if (!res.ok) return <ErrorState className="mt-6" timeout={res.timeout} retryHref="/minha-conta/reservas" />;

  const now = new Date().toISOString().slice(0, 16);
  const groups = {
    proximas: res.data.filter((b) => !["cancelled", "expired", "completed", "no_show"].includes(b.status) && b.returnAt.slice(0, 16) >= now).sort((a, b) => a.pickupAt.localeCompare(b.pickupAt)),
    anteriores: res.data.filter((b) => b.status === "completed" || b.status === "no_show" || (b.status !== "cancelled" && b.status !== "expired" && b.returnAt.slice(0, 16) < now)),
    canceladas: res.data.filter((b) => b.status === "cancelled" || b.status === "expired"),
  };
  const list = groups[tab] ?? groups.proximas;

  return (
    <>
      <div role="tablist" className="mt-6 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <Link
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            href={`/minha-conta/reservas?tab=${t.id}`}
            className={cn("-mb-px border-b-2 px-4 py-2.5 text-body-small font-medium", tab === t.id ? "border-selected text-copy" : "border-transparent text-copy-muted hover:text-copy")}
          >
            {t.label} <span className="tabular text-copy-muted">({groups[t.id].length})</span>
          </Link>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {list.length ? list.map((b) => <BookingListItem key={b.id} booking={b} />) : (
          <EmptyState title="Sem reservas nesta lista" action={tab === "proximas" ? <ButtonLink href="/rent-a-car" size="sm">Nova reserva</ButtonLink> : undefined} />
        )}
      </div>
    </>
  );
}
