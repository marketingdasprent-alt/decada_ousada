import { z } from "zod";

import type { CustomerInput } from "@/domain/customer";
import { getOffer } from "@/domain/vehicle";
import { fail, fromError, fromZod, ok } from "@/lib/api";
import { KNOWN_FIELD_MAP, validateDynamicForm } from "@/lib/dynamic-form";
import { regionFromRequest } from "@/lib/region";
import { getCustomerId, getSession, linkCustomer } from "@/services/auth";
import { sendEmail } from "@/services/email";
import { checkVehicleAvailability, createApplication, getApplicationForm, getVehicleById, upsertCustomer } from "@/services/wegest";

const schema = z.object({
  vehicleId: z.string().min(1),
  pickupAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
  pickupLocationId: z.string().min(1),
  formData: z.record(z.string(), z.string().max(2000)),
});

/**
 * POST /api/tvde/applications: cadastro do motorista + candidatura (doc §49–50).
 * O motorista é criado/atualizado no WeGest; a candidatura fica a aguardar documentos e pagamento.
 */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fromZod(parsed.error);
  const { vehicleId, pickupAt, pickupLocationId, formData } = parsed.data;
  const region = regionFromRequest(req);

  try {
    const session = await getSession();
    if (!session) return fail("unauthorized", "Inicie sessão para se candidatar.", 401);

    // Validação com a definição da ficha vinda da API
    const form = await getApplicationForm(region);
    const errors = validateDynamicForm(form.fields, formData);
    if (Object.keys(errors).length) return fail("validation", "Verifique os campos assinalados.", 422, { fieldErrors: errors });

    const vehicle = await getVehicleById(region, vehicleId);
    const offer = vehicle && getOffer(vehicle, "tvde");
    if (!vehicle || !offer) return fail("not_found", "Viatura não encontrada.", 404);

    const availability = await checkVehicleAvailability({ region, product: "tvde", vehicleId, pickupLocationId, pickupAt });
    if (availability.status === "unavailable") return fail("conflict", "A viatura deixou de estar disponível nesta data.", 409);

    // Motorista no WeGest (source of truth do candidato, doc §54)
    const input = Object.fromEntries(
      Object.entries(KNOWN_FIELD_MAP).map(([wg, local]) => [local, formData[wg] ?? ""]),
    ) as unknown as CustomerInput;
    input.country = "Portugal";
    input.licenseCountry = "Portugal";
    const existingId = await getCustomerId(session, "tvde");
    const driver = await upsertCustomer("tvde", input, existingId ?? undefined);
    if (!existingId) await linkCustomer(session.user.id, { wegestCustomerId: driver.id, customerType: "tvde", region });

    const application = await createApplication({ region, customerId: driver.id, vehicleId, offerId: offer.id, pickupAt, pickupLocationId, formData });
    await sendEmail(input.email || session.user.email, "tvde.registration_received", { reference: application.reference });
    return ok({ applicationId: application.id });
  } catch (err) {
    return fromError(err);
  }
}
