import { z } from "zod";

const LOCAL_DT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const rentalSearchSchema = z.object({
  pickupLocationId: z.string().min(1),
  returnLocationId: z.string().min(1),
  pickupAt: z.string().regex(LOCAL_DT),
  returnAt: z.string().regex(LOCAL_DT),
});

export const selectedExtrasSchema = z.array(z.object({ extraId: z.string().min(1), quantity: z.number().int().min(1).max(10) })).max(20);

export const quoteRequestSchema = z.object({
  vehicleId: z.string().min(1),
  offerId: z.string().min(1),
  search: rentalSearchSchema,
  extras: selectedExtrasSchema,
  coverageId: z.string().nullable().optional(),
});

function age(birth: string): number {
  const b = new Date(birth);
  const now = new Date();
  let a = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) a--;
  return a;
}

/** Dados do cliente Rent a Car (doc §20). Os campos definitivos seguem a API WeGest. */
export const customerSchema = z.object({
  fullName: z.string().trim().min(5, "Indique o nome completo."),
  email: z.string().trim().min(1, "Indique o email.").pipe(z.email("Indique um email válido, por exemplo nome@exemplo.pt.")),
  phone: z.string().trim().min(1, "Indique o telefone.").regex(/^\+?[0-9 ]{9,16}$/, "Indique um telefone com 9 dígitos, ou com o indicativo do país (+351)."),
  birthDate: z.string().min(1, "Indique a data de nascimento.").regex(DATE, "Indique uma data válida.").refine((d) => !DATE.test(d) || age(d) >= 21, "Tem de ter pelo menos 21 anos."),
  taxId: z.string().trim().regex(/^([0-9]{9})?$/, "O NIF tem 9 dígitos.").default(""),
  addressLine1: z.string().trim().default(""),
  postalCode: z.string().trim().default(""),
  city: z.string().trim().default(""),
  country: z.string().trim().min(2, "Indique o país."),
  licenseNumber: z.string().trim().min(3, "Indique o número da carta."),
  licenseCountry: z.string().trim().min(2, "Indique o país emissor."),
  licenseExpiresAt: z.string().min(1, "Indique a validade da carta.").regex(DATE, "Indique uma data válida."),
});

export const paymentInputSchema = z.object({
  method: z.enum(["card", "mbway", "multibanco"]),
  /** Token dos hosted fields do fornecedor: nunca o número do cartão. */
  token: z.string().min(1),
  phone: z.string().optional(),
});

export const bookingRequestSchema = quoteRequestSchema.extend({
  expectedTotal: z.number().nonnegative(),
  customer: customerSchema,
  account: z.object({ password: z.string().min(8, "Mínimo 8 caracteres.") }).optional(),
  message: z.string().max(500).optional(),
  acceptTerms: z.literal(true, { error: "Tem de aceitar os termos e condições." }),
  payment: paymentInputSchema,
  idempotencyKey: z.string().min(8),
});

export type CustomerFormValues = z.input<typeof customerSchema>;
