import { fail, fromError, fromZod, ok } from "@/lib/api";
import { driverLeadSchema } from "@/lib/validation";
import { verifyCaptcha } from "@/services/captcha";
import { submitDriverLead } from "@/services/leads";

/** POST /api/motoristas/lead: pedido de contacto dos formulários de /motoristas (Aluguer ou Slot). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = driverLeadSchema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);
  const input = parsed.data;

  // Campo-armadilha preenchido: robô. Responde como sucesso para não ensinar o robô.
  if (input.website) return ok({ received: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
  if (!(await verifyCaptcha(input.captcha, ip))) {
    return fail("validation", "Confirme que não é um robô e tente novamente.", 422, { fieldErrors: { captcha: "Confirme que não é um robô." } });
  }

  try {
    await submitDriverLead(input);
    return ok({ received: true });
  } catch (err) {
    return fromError(err);
  }
}
