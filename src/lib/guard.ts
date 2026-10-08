import "server-only";

import { redirect } from "next/navigation";

import type { CustomerType } from "@/domain/customer";
import { getCustomerId, getSession } from "@/services/auth";

/** Exige sessão; redireciona para /entrar?next=… se não existir. */
export async function requireSession(next: string) {
  const session = await getSession();
  if (!session) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  return session;
}

export async function requireCustomer(type: CustomerType, next: string) {
  const session = await requireSession(next);
  const customerId = await getCustomerId(session, type);
  return { session, customerId };
}
