import { z } from "zod";
import { driverPasswordError } from "./driver-account";

/** cargo_nome da conta de cliente Rent a Car, que no WeGest é uma conta de motorista. */
export const CUSTOMER_ROLE = "cliente";

const optionalText = (max: number) => z.string().trim().max(max, "O texto é demasiado longo.");
export const registrationSchema = z.object({
  tipo_utilizador: z.enum(["cliente", "motorista"]),
  nome: z.string().trim().min(2, "Indique o nome completo.").max(200, "Use até 200 caracteres."),
  telefone: z.string().trim().regex(/^\+[1-9][0-9 ()-]{6,24}$/, "Indique o telefone com indicativo internacional."),
  email: z.email("Indique um email válido.").max(254).transform((value) => value.trim().toLowerCase()),
  password: z.string().refine((value) => !driverPasswordError(value), "A password precisa de 8 caracteres, com letras e números."),
  confirm: z.string(),
  data_nascimento: z.string(),
  pais: optionalText(100),
  nif: optionalText(30),
  morada: optionalText(200),
  codigo_postal: optionalText(30),
  localidade: optionalText(100),
  termos: z.literal(true, { error: "Aceite os termos e a política de privacidade para criar a conta." }),
})
  // `when` corre estas regras mesmo com erros noutros campos: todos os erros aparecem à primeira
  .refine((data) => data.password === data.confirm, { path: ["confirm"], message: "As passwords não coincidem.", when: () => true })
  .refine((data) => data.tipo_utilizador !== "cliente" || validBirthDate(String(data.data_nascimento ?? "")), { path: ["data_nascimento"], message: "Indique uma data de nascimento válida, anterior a hoje.", when: () => true })
  .refine((data) => data.tipo_utilizador !== "cliente" || Boolean(String(data.pais ?? "").trim()), { path: ["pais"], message: "Indique o país.", when: () => true });

function validBirthDate(value: string) {
  const date = new Date(value + "T00:00:00Z");
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && date.getTime() < Date.now();
}
