import "server-only";

import { redirect } from "next/navigation";

import type { CustomerType } from "@/domain/customer";
import { getCustomerId, getSession, hasTvdeAccess } from "@/services/auth";

/** Exige sessão; redireciona para /entrar?next=… se não existir. */
export async function requireSession(next: string) {
  const session = await getSession();
  if (!session) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  return session;
}

/** Páginas TVDE do painel: quem é só cliente Rent a Car volta à visão geral da conta. */
export async function requireTvde(next: string) {
  const session = await requireSession(next);
  if (!hasTvdeAccess(session)) redirect("/minha-conta");
  return session;
}

export async function requireCustomer(type: CustomerType, next: string) {
  const session = await requireSession(next);
  const customerId = await getCustomerId(session, type);
  return { session, customerId };
}
