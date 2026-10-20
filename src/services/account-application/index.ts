import "server-only";

import { z } from "zod";

import {
  APPLICATION_FILE_MAX,
  APPLICATION_FILE_TYPES,
  ID_DOCUMENT_TYPES,
  LICENSE_CATEGORIES,
  type AccountApplication,
  type AccountApplicationDraft,
  type ApplicationDocType,
  type ApplicationUploadTicket,
} from "@/domain/customer/account";
import { fail, fromError, fromZod, ok } from "@/lib/api";
import { validateApplicationDraft } from "@/lib/application-rules";
import { driverAuthEnabled } from "@/lib/driver-account";
import { getSession, isWeGestSession } from "@/services/auth";
import { bearerToken } from "@/services/auth/driver";
import {
  confirmApplicationUpload,
  deleteApplicationDocument,
  getAccountApplication,
  requestApplicationUpload,
  saveAccountApplication,
  submitAccountApplication,
} from "@/services/wegest/account";
import { CODE_MESSAGE } from "@/services/wegest/client";
import { WeGestError } from "@/services/wegest/types";

import { mockApplicationBackend } from "./mock";

/**
 * Candidatura TVDE pela conta WeGest (rotas /conta/candidatura). Com WEGEST_MODE=mock as rotas
 * internas usam um armazenamento em memória com o mesmo contrato, para o ecrã ser testável sem
 * conta no WeGest; a pessoa é então a da sessão do site.
 */
export const accountApplicationMock = () => process.env.WEGEST_MODE === "mock";

/** O ecrã novo aparece com as contas WeGest ligadas, ou em demonstração (mock). */
export const accountApplicationEnabled = () => driverAuthEnabled() || accountApplicationMock();

export interface ApplicationBackend {
  /** null: a conta ainda não tem candidatura (404 NAO_ENCONTRADO). */
  get(): Promise<AccountApplication | null>;
  save(draft: AccountApplicationDraft): Promise<AccountApplication>;
  submit(): Promise<AccountApplication>;
  requestUpload(tipo: ApplicationDocType, file: { content_type: string; tamanho: number }): Promise<ApplicationUploadTicket>;
  confirmUpload(tipo: ApplicationDocType, caminho: string): Promise<AccountApplication>;
  remove(tipo: ApplicationDocType): Promise<AccountApplication>;
}

function wegestBackend(token: string): ApplicationBackend {
  return {
    async get() {
      try {
        return (await getAccountApplication(token)).candidatura;
      } catch (error) {
        if (error instanceof WeGestError && error.status === 404) return null;
        throw error;
      }
    },
    save: async (draft) => (await saveAccountApplication(token, draft)).candidatura,
    submit: async () => (await submitAccountApplication(token)).candidatura,
    requestUpload: (tipo, file) => requestApplicationUpload(token, tipo, file),
    confirmUpload: async (tipo, caminho) => (await confirmApplicationUpload(token, tipo, caminho)).candidatura,
    remove: async (tipo) => (await deleteApplicationDocument(token, tipo)).candidatura,
  };
}

/**
 * Quem pede. Na API real, o token da conta (Authorization: Bearer) vai ao WeGest em X-Conta-Token e
 * é largado no fim do pedido; nunca é guardado nem escrito em logs. No mock, a sessão do site.
 */
export async function applicationBackend(request: Request): Promise<ApplicationBackend | null> {
  if (accountApplicationMock()) {
    const session = await getSession();
    if (!session) return null;
    // Conta de demonstração (local) ou conta WeGest, de motorista ou de cliente: pode preencher a ficha.
    const driver = isWeGestSession(session) || session.user.authProviderId.startsWith("local:");
    return mockApplicationBackend({ id: session.user.id, email: session.user.email, driver });
  }
  const token = bearerToken(request);
  if (!token || token.length > 4096) return null;
  return wegestBackend(token);
}

const date = z.iso.date("Use uma data válida.");
const text = (max: number) => z.string().trim().max(max, `No máximo ${max} caracteres.`);

/** CandidaturaContaPedido: campo desconhecido é recusado aqui, antes de ir ao WeGest. */
export const draftSchema = z
  .strictObject({
    nome: text(200),
    email: z.email("Indique um email válido.").max(254),
    telefone: text(20),
    nif: z.string().regex(/^\d{9}$/, "O NIF tem 9 dígitos."),
    morada: text(200),
    codigo_postal: z.string().regex(/^\d{4}-\d{3}$/, "Use o formato 0000-000."),
    cidade: text(100),
    documento: z.strictObject({ tipo: z.enum(ID_DOCUMENT_TYPES), numero: text(40), validade: date }).partial(),
    carta_conducao: z.strictObject({ numero: text(40), categorias: z.array(z.enum(LICENSE_CATEGORIES)).min(1).max(16), validade: date }).partial(),
    licenca_tvde: z.strictObject({ numero: text(40), validade: date }).partial().nullable(),
    em_formacao_tvde: z.boolean(),
    iban: z.string().max(42),
    modelo_pretendido_id: z.uuid().nullable(),
    data_inicio_pretendida: date.nullable(),
    observacoes: text(1000).nullable(),
    consentimento: z.strictObject({ versao: text(50), aceite_em: z.iso.datetime({ offset: true }) }),
  })
  .partial()
  .refine((draft) => Object.keys(draft).length > 0, "Não há nada para guardar.")
  // As mesmas regras do browser: nenhum valor sem formato ou controlo válido segue para o WeGest
  .superRefine((draft, ctx) => {
    for (const [key, message] of Object.entries(validateApplicationDraft(draft))) ctx.addIssue({ code: "custom", path: key.split("."), message });
  });

export const uploadSchema = z.strictObject({
  content_type: z.enum(APPLICATION_FILE_TYPES, "O ficheiro tem de ser PDF, JPEG ou PNG."),
  tamanho: z.number().int().min(1).max(APPLICATION_FILE_MAX, "O ficheiro tem mais de 10 MB (máximo 10 MB)."),
});
export const confirmSchema = z.strictObject({ caminho: z.string().min(1).max(512) });

const FIELD_MESSAGE: Record<string, string> = {
  nif: "Este NIF não é válido. Confirme os 9 dígitos.",
  iban: "Este IBAN não é válido. Confirme os caracteres, ex. PT50 0002 0123 1234 5678 9015 4.",
  email: "O email tem de ser o da sua conta.",
};

/** Chaves enviadas no rascunho, em notação "documento.numero". */
function sentKeys(draft: object, prefix = ""): string[] {
  return Object.entries(draft).flatMap(([key, value]) =>
    value && typeof value === "object" && !Array.isArray(value) ? sentKeys(value, prefix + key + ".") : [prefix + key],
  );
}

/**
 * Que campo o WeGest recusou. O formato de erro.detalhes não está documentado para
 * PARAMETRO_INVALIDO: procura-se nele o nome de um campo enviado. Sem pista, e como o formato já é
 * validado aqui, a recusa vem do dígito de controlo do NIF ou do IBAN enviado.
 */
function rejectedFields(error: WeGestError, draft: AccountApplicationDraft | undefined): Record<string, string> | undefined {
  if (!draft) return undefined;
  const sent = sentKeys(draft);
  const details = JSON.stringify(error.details ?? "").toLowerCase();
  let fields = sent.filter((key) => details.includes(key) || details.includes(key.replace(".", "/")));
  if (!fields.length) fields = ["nif", "iban"].filter((key) => sent.includes(key));
  if (!fields.length) return undefined;
  return Object.fromEntries(fields.map((key) => [key, FIELD_MESSAGE[key] ?? "Confirme este campo."]));
}

type Context = "read" | "save" | "submit" | "upload" | "confirm" | "remove";

/** Resposta segura para o browser. A erro.mensagem do WeGest nunca chega ao cliente. */
function applicationError(error: unknown, context: Context, draft?: AccountApplicationDraft): Response {
  if (!(error instanceof WeGestError)) return fromError(error);
  const code = error.apiCode;
  if (code === "SESSAO_INVALIDA" || error.status === 401) return fail("unauthorized", "A sessão terminou. Entre de novo.", 401, { reason: "session_expired" });
  if (code === "CONTA_INVALIDA") return fail("unauthorized", "A candidatura TVDE é feita com uma conta de motorista. Esta conta não é de motorista.", 403);
  if (code === "CANDIDATURA_NAO_EDITAVEL") return fail("conflict", "A candidatura já foi submetida e já não pode ser alterada.", 409);
  if (code === "CANDIDATURA_EXISTENTE") return fail("conflict", CODE_MESSAGE.CANDIDATURA_EXISTENTE, 409, { reason: "application_exists" });
  if (code === "CANDIDATURA_INCOMPLETA") return fail("validation", "Ainda falta preencher ou enviar alguma coisa. Veja a lista do que falta.", 422);
  if (error.status === 404 && context === "upload") return fail("not_found", "Guarde primeiro os dados pessoais para poder enviar documentos.", 404);
  if (error.status === 404 && context === "confirm") return fail("validation", "O ficheiro não chegou ao armazenamento. Tente enviá-lo de novo.", 422);
  if (error.status === 429) {
    const message = context === "upload" ? "Atingiu o limite de envios por hoje. Tente de novo amanhã." : "Demasiados pedidos. Aguarde um minuto e tente de novo.";
    return fail("unavailable", message, 429);
  }
  if (error.status === 400 || error.status === 422) {
    // O mesmo estado HTTP do WeGest, para quem testa comparar no F12 (o código fica no log do servidor)
    const extra = { requestId: error.wegestRequestId };
    if (context === "confirm" || context === "upload") return fail("validation", "O ficheiro tem de ser PDF, JPEG ou PNG, até 10 MB.", error.status, extra);
    const fieldErrors = rejectedFields(error, draft);
    return fail("validation", fieldErrors ? "Verifique os campos assinalados." : "Alguns dados não são válidos. Reveja e tente de novo.", error.status, { ...extra, fieldErrors });
  }
  if (error.status === 403) return fail("unavailable", "A candidatura online está indisponível de momento. Tente mais tarde.", 503);
  return fromError(error);
}

/** Corre o pedido com o backend certo e devolve a resposta sem cache. */
export async function handleApplication<T>(
  request: Request,
  context: Context,
  run: (backend: ApplicationBackend) => Promise<T>,
  draft?: AccountApplicationDraft,
): Promise<Response> {
  let response: Response;
  try {
    const backend = await applicationBackend(request);
    response = backend ? ok(await run(backend)) : fail("unauthorized", "Inicie sessão para continuar.", 401, { reason: "session_expired" });
  } catch (error) {
    response = applicationError(error, context, draft);
  }
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex");
  return response;
}

/** Lê e valida o corpo JSON; devolve a resposta de erro pronta quando não serve. */
export async function readBody<S extends z.ZodType>(request: Request, schema: S): Promise<{ data: z.infer<S> } | { response: Response }> {
  const raw = await request.json().catch(() => undefined);
  const parsed = schema.safeParse(raw);
  if (parsed.success) return { data: parsed.data };
  const response = raw === undefined ? fail("validation", "Pedido inválido.", 400) : fromZod(parsed.error);
  response.headers.set("Cache-Control", "private, no-store");
  return { response };
}
