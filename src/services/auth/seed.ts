import "server-only";

import { integrationsRepo, usersRepo } from "@/services/store";

/**
 * Conta de demonstração (só em WEGEST_MODE=mock).
 * Email: demo@decadaousada.pt, Password: demo1234
 * Ligada ao cliente Rent a Car CLI-DEMO e ao motorista TVDE DRV-DEMO do mock.
 */
export const DEMO_ACCOUNT = { email: "demo@decadaousada.pt", password: "demo1234" } as const;

const g = globalThis as unknown as { __seeded?: Promise<void> };

export function ensureSeed(): Promise<void> {
  if (process.env.WEGEST_MODE === "http") return Promise.resolve();
  g.__seeded ??= (async () => {
    if (await usersRepo.findByEmail(DEMO_ACCOUNT.email)) return;
    const { hashPassword } = await import("./index");
    const id = "user-demo";
    await usersRepo.create({
      id,
      authProviderId: `local:${id}`,
      email: DEMO_ACCOUNT.email,
      name: "João Silva",
      createdAt: "2026-09-01T10:00:00.000Z",
      passwordHash: await hashPassword(DEMO_ACCOUNT.password),
    });
    await integrationsRepo.upsert({ userId: id, wegestCustomerId: "CLI-DEMO", customerType: "rentacar", region: "mainland" });
    await integrationsRepo.upsert({ userId: id, wegestCustomerId: "DRV-DEMO", customerType: "tvde", region: "mainland" });
  })();
  return g.__seeded;
}
