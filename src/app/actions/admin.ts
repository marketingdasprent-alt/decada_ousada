"use server";

import { revalidatePath } from "next/cache";

import type { WgApplication, WgBooking } from "@/services/wegest/types";
import { getSession } from "@/services/auth";
import { sendEmail } from "@/services/email";
import { mockBackoffice } from "@/services/wegest/mock/transport";

/** Administradores: ADMIN_EMAILS (separados por vírgula). Em modo mock, a conta demo também. */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (admins.includes(session.user.email.toLowerCase())) return true;
  return process.env.WEGEST_MODE !== "http" && session.user.email === "demo@decadaousada.pt";
}

async function guardMock() {
  if (process.env.WEGEST_MODE === "http") throw new Error("Simulador disponível apenas em modo demonstração.");
  if (!(await isAdmin())) throw new Error("Sem permissão.");
}

const EMAIL_FOR: Partial<Record<WgApplication["state"], Parameters<typeof sendEmail>[1]>> = {
  IN_REVIEW: "tvde.application_under_review",
  PENDING_DOCS: "tvde.documents_required",
  APPROVED: "tvde.application_approved",
  REJECTED: "tvde.application_rejected",
};

/** Simula a decisão da equipa no WeGest (aprovar, recusar, pedir documentos). */
export async function simulateApplicationState(form: FormData) {
  await guardMock();
  const id = String(form.get("id"));
  const state = String(form.get("state")) as WgApplication["state"];
  const message = String(form.get("message") ?? "") || undefined;
  const requestDoc =
    state === "PENDING_DOCS"
      ? { doc_type: "address_proof", doc_label: "Comprovativo de morada atualizado", message: message ?? "O comprovativo enviado tem mais de 3 meses." }
      : undefined;
  mockBackoffice.setApplicationState(id, state, { message: state === "REJECTED" ? (message ?? "Não cumpre os requisitos de experiência mínima.") : message, requestDoc });
  const template = EMAIL_FOR[state];
  if (template) await sendEmail("motorista@demo", template, { id });
  revalidatePath("/", "layout");
}

export async function simulateBookingState(form: FormData) {
  await guardMock();
  const id = String(form.get("id"));
  const state = String(form.get("state")) as WgBooking["state"];
  mockBackoffice.setBookingState(id, state);
  if (state === "CONFIRMED") await sendEmail("cliente@demo", "rac.booking_confirmed", { id });
  revalidatePath("/", "layout");
}
