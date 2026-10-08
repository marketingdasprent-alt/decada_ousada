import "server-only";

import type { LocalUser, UserIntegration, CustomerType } from "@/domain/customer";
import type { Payment } from "@/domain/payment";
import type { Refund } from "@/domain/refund";

/**
 * Base de dados local: APENAS o que não pertence ao WeGest (doc §87):
 * users, user_integrations, payment_transactions, refunds.
 *
 * Implementação em memória para a demo. A interface está pronta para trocar por
 * PostgreSQL/Supabase sem alterar quem a usa. Ver db/schema.sql.
 */
interface StoredUser extends LocalUser {
  passwordHash: string;
  name?: string;
}

interface Db {
  users: Map<string, StoredUser>;
  integrations: UserIntegration[];
  payments: Map<string, Payment>;
  refunds: Map<string, Refund>;
}

const g = globalThis as unknown as { __localDb?: Db };
const db = (): Db => (g.__localDb ??= { users: new Map(), integrations: [], payments: new Map(), refunds: new Map() });

export const usersRepo = {
  async findByEmail(email: string) {
    return [...db().users.values()].find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  },
  async findById(id: string) {
    return db().users.get(id) ?? null;
  },
  async create(user: StoredUser) {
    db().users.set(user.id, user);
    return user;
  },
  async updatePassword(id: string, passwordHash: string) {
    const u = db().users.get(id);
    if (u) u.passwordHash = passwordHash;
  },
};

export const integrationsRepo = {
  async get(userId: string, type: CustomerType) {
    return db().integrations.find((i) => i.userId === userId && i.customerType === type) ?? null;
  },
  async listForUser(userId: string) {
    return db().integrations.filter((i) => i.userId === userId);
  },
  async upsert(link: UserIntegration) {
    const list = db().integrations;
    const idx = list.findIndex((i) => i.userId === link.userId && i.customerType === link.customerType);
    if (idx >= 0) list[idx] = { ...list[idx], ...link };
    else list.push(link);
    return link;
  },
};

export const paymentsRepo = {
  async save(p: Payment) {
    db().payments.set(p.id, p);
    return p;
  },
  async get(id: string) {
    return db().payments.get(id) ?? null;
  },
  async findByReference(reference: string) {
    return [...db().payments.values()].filter((p) => p.reference === reference);
  },
  async list() {
    return [...db().payments.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};

export const refundsRepo = {
  async save(r: Refund) {
    db().refunds.set(r.id, r);
    return r;
  },
  async findByPayment(paymentId: string) {
    return [...db().refunds.values()].find((r) => r.paymentId === paymentId) ?? null;
  },
  async list() {
    return [...db().refunds.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};

export type { StoredUser };
