import "server-only";

import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import { cookies } from "next/headers";
import { connection } from "next/server";

import type { CustomerType, LocalUser, UserIntegration } from "@/domain/customer";
import { integrationsRepo, usersRepo } from "@/services/store";

import { ensureSeed } from "./seed";

/**
 * Autenticação própria do site (doc §23, §96): login, sessão e password.
 * Os dados do cliente NÃO ficam aqui: ficam no WeGest, ligados por wegestCustomerId.
 *
 * Implementação simples (scrypt + cookie assinado) para a v1.
 * Pode ser trocada por Supabase Auth / Auth.js mantendo esta interface.
 */
const scrypt = promisify(scryptCb) as (pwd: string, salt: Buffer, len: number) => Promise<Buffer>;
const COOKIE = "do_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 dias

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET em falta");
  return s ?? "dev-only-secret-change-me";
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [, saltB64, hashB64] = stored.split("$");
  if (!saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64"), expected.length);
  return timingSafeEqual(actual, expected);
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function encodeSession(userId: string): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${userId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

function decodeSession(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  const expected = sign(`${userId}.${exp}`);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  if (Number(exp) < Date.now() / 1000) return null;
  return userId;
}

export interface Session {
  user: LocalUser & { name?: string };
  integrations: UserIntegration[];
}

async function startSession(userId: string) {
  (await cookies()).set(COOKIE, encodeSession(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<Session | null> {
  await connection();
  await ensureSeed();
  const userId = decodeSession((await cookies()).get(COOKIE)?.value);
  if (!userId) return null;
  const user = await usersRepo.findById(userId);
  if (!user) return null;
  const { passwordHash: _omit, ...publicUser } = user;
  void _omit;
  return { user: publicUser, integrations: await integrationsRepo.listForUser(userId) };
}

export async function getCustomerId(session: Session | null, type: CustomerType): Promise<string | null> {
  return session?.integrations.find((i) => i.customerType === type)?.wegestCustomerId ?? null;
}

export type AuthResult = { ok: true; userId: string } | { ok: false; error: string };

export async function register(email: string, password: string, name?: string): Promise<AuthResult> {
  await ensureSeed();
  const normalized = email.trim().toLowerCase();
  if (await usersRepo.findByEmail(normalized)) return { ok: false, error: "Já existe uma conta com este email." };
  if (password.length < 8) return { ok: false, error: "A password deve ter pelo menos 8 caracteres." };
  const id = crypto.randomUUID();
  await usersRepo.create({
    id,
    authProviderId: `local:${id}`,
    email: normalized,
    name,
    createdAt: new Date().toISOString(),
    passwordHash: await hashPassword(password),
  });
  await startSession(id);
  return { ok: true, userId: id };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  await ensureSeed();
  const user = await usersRepo.findByEmail(email.trim());
  // Mesma mensagem para email inexistente ou password errada
  if (!user || !(await verifyPassword(password, user.passwordHash))) return { ok: false, error: "Email ou password incorretos." };
  await startSession(user.id);
  return { ok: true, userId: user.id };
}

export async function logout() {
  (await cookies()).delete(COOKIE);
}

export async function changePassword(userId: string, current: string, next: string): Promise<AuthResult> {
  const user = await usersRepo.findById(userId);
  if (!user || !(await verifyPassword(current, user.passwordHash))) return { ok: false, error: "A password atual está incorreta." };
  if (next.length < 8) return { ok: false, error: "A nova password deve ter pelo menos 8 caracteres." };
  await usersRepo.updatePassword(userId, await hashPassword(next));
  return { ok: true, userId };
}

export async function linkCustomer(userId: string, link: Omit<UserIntegration, "userId">) {
  return integrationsRepo.upsert({ ...link, userId, lastSyncAt: new Date().toISOString() });
}
