import { z } from "zod";

import type { CustomerInput } from "@/domain/customer";
import { getOffer } from "@/domain/vehicle";
import { fail, fromError, fromZod, ok } from "@/lib/api";
import { driverAuthEnabled } from "@/lib/driver-account";
import { KNOWN_FIELD_MAP, validateDynamicForm } from "@/lib/dynamic-form";
import { regionFromRequest } from "@/lib/region";
import { getCustomerId, getSession, linkCustomer } from "@/services/auth";
import { verifyCaptcha } from "@/services/captcha";
import { sendEmail } from "@/services/email";
import { checkVehicleAvailability, createApplication, getApplicationForm, getVehicleById, onlineRequestsEnabled, upsertCustomer } from "@/services/wegest";
import { WeGestError } from "@/services/wegest/types";

const schema = z
  .object({
    vehicleId: z.string().min(1).optional(),
    pickupAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/).optional(),
    pickupLocationId: z.string().min(1).optional(),
    formData: z.record(z.string(), z.string().max(2000)),
    /** Token do Turnstile (obrigatório com TURNSTILE_SECRET_KEY). */
    captcha: z.string().max(4096).optional(),
  })
  // A viatura é opcional, mas vem completa (viatura, data e local) ou não vem
  .refine((b) => [b.vehicleId, b.pickupAt, b.pickupLocationId].every(Boolean) || ![b.vehicleId, b.pickupAt, b.pickupLocationId].some(Boolean), { path: ["vehicleId"], message: "Viatura, data e local vêm juntos." });

/**
 * POST /api/tvde/applications: cadastro do motorista + candidatura (doc §49–50).
 * Sem viatura é só o cadastro; com viatura, a disponibilidade é confirmada outra vez aqui.
 * O motorista é criado/atualizado no WeGest; a candidatura fica a aguardar documentos e pagamento.
 *
 * Só sem contas WeGest. Com contas, a candidatura vai pelo fluxo da conta (PUT, documentos e
 * POST /conta/candidatura, em /api/account/application): este POST /tvde/candidaturas submete
 * sem documentos e o WeGest pediu que não seja usado com conta (2026-10-20).
 */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZod(parsed.error);
  const { vehicleId, pickupAt, pickupLocationId, formData } = parsed.data;
  if (driverAuthEnabled()) {
    return fail("conflict", "A candidatura TVDE é feita em A minha conta, com a sua conta de motorista.", 409);
  }
  if (!onlineRequestsEnabled()) {
    return fail("unavailable", "O envio de candidaturas online ainda não está disponível. Contacte a equipa para se candidatar.", 503);
  }
  const region = regionFromRequest(req);

  // A API do WeGest exige CAPTCHA (50 candidaturas por dia por chave)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
  if (!(await verifyCaptcha(parsed.data.captcha ?? "", ip))) {
    return fail("validation", "Confirme que não é um robô e tente novamente.", 422, { fieldErrors: { captcha: "Confirme que não é um robô." } });
  }

  try {
    const session = await getSession();
    if (!session) return fail("unauthorized", "Inicie sessão para se candidatar.", 401);

    // Validação com a definição da ficha vinda da API
    const form = await getApplicationForm(region);
    const errors = validateDynamicForm(form.fields, formData);
    if (Object.keys(errors).length) return fail("validation", "Verifique os campos assinalados.", 422, { fieldErrors: errors });

    let offerId: string | undefined;
    if (vehicleId && pickupAt && pickupLocationId) {
      const vehicle = await getVehicleById(region, vehicleId);
      const offer = vehicle && getOffer(vehicle, "tvde");
      if (!vehicle || !offer) return fail("not_found", "Viatura não encontrada.", 404);
      const availability = await checkVehicleAvailability({ region, product: "tvde", vehicleId, pickupLocationId, pickupAt });
      if (availability.status === "unavailable") return fail("conflict", "A viatura deixou de estar disponível nesta data.", 409);
      offerId = offer.id;
    }

    // Motorista no WeGest (source of truth do candidato, doc §54)
    const input = Object.fromEntries(
      Object.entries(KNOWN_FIELD_MAP).map(([wg, local]) => [local, formData[wg] ?? ""]),
    ) as unknown as CustomerInput;
    input.country = "Portugal";
    input.licenseCountry = "Portugal";
    const existingId = await getCustomerId(session, "tvde");
    const driver = await upsertCustomer("tvde", input, existingId ?? undefined);
    if (!existingId) await linkCustomer(session.user.id, { wegestCustomerId: driver.id, customerType: "tvde", region });

    const application = await createApplication({ region, customerId: driver.id, vehicleId, offerId, pickupAt, pickupLocationId, formData });
    await sendEmail(input.email || session.user.email, "tvde.registration_received", { reference: application.reference });
    return ok({ applicationId: application.id });
  } catch (err) {
    // Erros da conta de motorista no WeGest: sessão a renovar ou conta que não se pode candidatar
    if (err instanceof WeGestError && err.apiCode === "SESSAO_INVALIDA") return fail("unauthorized", err.message, 401, { reason: "session_expired" });
    if (err instanceof WeGestError && err.apiCode === "CONTA_INVALIDA") return fail("unauthorized", err.message, 403);
    // Uma candidatura (e uma viatura) por conta. Mensagem genérica: não revela de quem é o NIF ou o email
    if (err instanceof WeGestError && err.apiCode === "CANDIDATURA_EXISTENTE") {
      return fail("conflict", "Já existe uma candidatura em curso com estes dados. Só é possível uma candidatura por conta: para mudar a viatura ou corrigir dados, contacte a equipa.", 409, { reason: "application_exists" });
    }
    return fromError(err);
  }
}
