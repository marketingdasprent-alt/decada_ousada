import "server-only";

/**
 * Emails transacionais (doc §101). Fornecedor por decidir (doc §124):
 * a implementação de consola regista apenas o tipo e o destinatário mascarado.
 */
export type EmailTemplate =
  // Rent a Car
  | "rac.registration_received"
  | "rac.booking_received"
  | "rac.payment_confirmed"
  | "rac.booking_confirmed"
  | "rac.booking_changed"
  | "rac.booking_cancelled"
  | "rac.refund"
  | "rac.pickup_reminder"
  // TVDE
  | "tvde.registration_received"
  | "tvde.application_received"
  | "tvde.payment_received"
  | "tvde.application_under_review"
  | "tvde.documents_required"
  | "tvde.application_approved"
  | "tvde.application_rejected"
  | "tvde.refund_started"
  | "tvde.refund_completed"
  | "tvde.pickup_reminder";

export interface EmailProvider {
  send(to: string, template: EmailTemplate, data: Record<string, unknown>): Promise<void>;
}

const mask = (email: string) => email.replace(/^(.).*(@.*)$/, "$1***$2");

const consoleProvider: EmailProvider = {
  async send(to, template) {
    console.info(`[email] ${template} → ${mask(to)}`);
  },
};

export function emailProvider(): EmailProvider {
  return consoleProvider;
}

export async function sendEmail(to: string, template: EmailTemplate, data: Record<string, unknown> = {}) {
  try {
    await emailProvider().send(to, template, data);
  } catch (err) {
    // Falha de email nunca deve partir o fluxo de reserva/candidatura
    console.error(`[email] falhou ${template}`, err instanceof Error ? err.message : err);
  }
}
