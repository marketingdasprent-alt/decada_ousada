import "server-only";

import {
  APPLICATION_DOC_TYPES,
  APPLICATION_FILE_MAX,
  type AccountApplication,
  type AccountApplicationDraft,
  type ApplicationDocType,
} from "@/domain/customer/account";
import { validIban, validNif } from "@/lib/dynamic-form";
import { WeGestError } from "@/services/wegest/types";

import type { ApplicationBackend } from "./index";

/**
 * Candidatura em memória (WEGEST_MODE=mock), com o contrato das rotas /conta do WeGest: os mesmos
 * erros (códigos e estados HTTP), os três passos do envio e a verificação do ficheiro pelo
 * conteúdo. O upload_url aponta para uma rota local que só existe em mock.
 */
interface PendingUpload {
  accountId: string;
  tipo: ApplicationDocType;
  tamanho: number;
  expires: number;
  /** Depois do PUT ao upload_url: o tamanho recebido e os primeiros bytes. */
  received?: { size: number; head: Uint8Array };
}

interface Store {
  applications: Map<string, AccountApplication>;
  uploads: Map<string, PendingUpload>;
  /** Pedidos de envio por conta e dia (limite de 60). */
  daily: Map<string, number>;
}

const store = ((globalThis as unknown as { __mockAccountApplications?: Store }).__mockAccountApplications ??= {
  applications: new Map(),
  uploads: new Map(),
  daily: new Map(),
});

const DAILY_LIMIT = 60;
const UPLOAD_TTL_MS = 2 * 60 * 60_000;
const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" }).format(new Date());

const apiError = (status: number, codigo: string, detalhes?: unknown) =>
  new WeGestError(status === 404 ? "not_found" : status === 409 ? "conflict" : "validation", codigo, status, undefined, undefined, codigo, detalhes);

/** Campos que o POST pede; a licença TVDE é dispensada a quem está em formação. */
function missingFields(d: AccountApplicationDraft): string[] {
  const missing: string[] = [];
  for (const key of ["nome", "email", "telefone", "nif", "morada", "codigo_postal", "cidade", "iban"] as const) if (!d[key]) missing.push(key);
  for (const key of ["tipo", "numero", "validade"] as const) if (!d.documento?.[key]) missing.push("documento." + key);
  if (!d.carta_conducao?.numero) missing.push("carta_conducao.numero");
  if (!d.carta_conducao?.categorias?.length) missing.push("carta_conducao.categorias");
  if (!d.carta_conducao?.validade) missing.push("carta_conducao.validade");
  if (!d.em_formacao_tvde) {
    if (!d.licenca_tvde?.numero) missing.push("licenca_tvde.numero");
    if (!d.licenca_tvde?.validade) missing.push("licenca_tvde.validade");
  }
  if (!d.consentimento) missing.push("consentimento");
  return missing;
}

function refresh(app: AccountApplication): AccountApplication {
  app.campos_em_falta = missingFields(app.dados);
  app.em_falta = APPLICATION_DOC_TYPES.filter((tipo) => !app.documentos[tipo]?.recebido && !(tipo === "licenca_tvde" && app.dados.em_formacao_tvde));
  app.pode_submeter = app.estado === "rascunho" && !app.campos_em_falta.length && !app.em_falta.length;
  return structuredClone(app);
}

/** PDF, JPEG ou PNG pelos primeiros bytes, como o WeGest faz (não pelo content_type). */
function realFileType(bytes: Uint8Array): boolean {
  const starts = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  return starts(0x25, 0x50, 0x44, 0x46) || starts(0xff, 0xd8, 0xff) || starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
}

function validDates(draft: AccountApplicationDraft): string | null {
  const dates: Array<[string, string | undefined]> = [
    ["documento.validade", draft.documento?.validade],
    ["carta_conducao.validade", draft.carta_conducao?.validade],
    ["licenca_tvde.validade", draft.licenca_tvde?.validade ?? undefined],
  ];
  return dates.find(([, value]) => value && value <= today())?.[0] ?? null;
}

export function mockApplicationBackend(account: { id: string; email: string; driver: boolean }): ApplicationBackend {
  const guard = () => {
    if (!account.driver) throw apiError(403, "CONTA_INVALIDA");
  };
  const current = () => store.applications.get(account.id);
  const editable = () => {
    const app = current();
    if (!app) throw apiError(404, "NAO_ENCONTRADO");
    if (app.estado !== "rascunho") throw apiError(409, "CANDIDATURA_NAO_EDITAVEL");
    return app;
  };

  return {
    async get() {
      guard();
      const app = current();      return app ? refresh(app) : null;
    },

    async save(draft) {
      guard();
      const existing = current();
      if (existing && existing.estado !== "rascunho") throw apiError(409, "CANDIDATURA_NAO_EDITAVEL");
      if (draft.email && draft.email.toLowerCase() !== account.email.toLowerCase()) throw apiError(400, "PARAMETRO_INVALIDO", { campo: "email" });
      // 123456789 tem dígito de controlo certo, mas o WeGest recusa-o (roteiro de testes, B3)
      if (draft.nif && (!validNif(draft.nif) || draft.nif === "123456789")) throw apiError(400, "PARAMETRO_INVALIDO", { campo: "nif" });
      if (draft.iban && !validIban(draft.iban)) throw apiError(400, "PARAMETRO_INVALIDO", { campo: "iban" });
      const badDate = validDates(draft);
      if (badDate) throw apiError(400, "PARAMETRO_INVALIDO", { campo: badDate });
      const app: AccountApplication = existing ?? {
        id: crypto.randomUUID(),
        estado: "rascunho",
        motivo_rejeicao: null,
        submetida_em: null,
        dados: {},
        documentos: {},
        em_falta: [],
        campos_em_falta: [],
        pode_submeter: false,
      };
      const { documento, carta_conducao, licenca_tvde, ...flat } = draft;
      app.dados = { ...app.dados, ...flat };
      if (draft.iban) app.dados.iban = draft.iban.replace(/\s+/g, "").toUpperCase();
      if (documento) app.dados.documento = { ...app.dados.documento, ...documento };
      if (carta_conducao) app.dados.carta_conducao = { ...app.dados.carta_conducao, ...carta_conducao };
      if (licenca_tvde !== undefined) app.dados.licenca_tvde = licenca_tvde === null ? null : { ...app.dados.licenca_tvde, ...licenca_tvde };
      store.applications.set(account.id, app);
      return refresh(app);
    },

    async submit() {
      guard();
      const app = current();
      if (!app) throw apiError(404, "NAO_ENCONTRADO");
      if (app.estado !== "rascunho") return refresh(app);
      const state = refresh(app);
      if (!state.pode_submeter) throw apiError(422, "CANDIDATURA_INCOMPLETA", { campos: state.campos_em_falta, documentos: state.em_falta });
      app.estado = "submetido";
      app.submetida_em = new Date().toISOString();
      return refresh(app);
    },

    async requestUpload(tipo, file) {
      guard();
      editable();
      if (file.tamanho > APPLICATION_FILE_MAX) throw apiError(400, "PARAMETRO_INVALIDO");
      const day = account.id + ":" + today();
      const count = (store.daily.get(day) ?? 0) + 1;
      if (count > DAILY_LIMIT) throw new WeGestError("unavailable", "LIMITE_EXCEDIDO", 429, undefined, undefined, "LIMITE_EXCEDIDO");
      store.daily.set(day, count);
      const id = crypto.randomUUID();
      const expires = Date.now() + UPLOAD_TTL_MS;
      store.uploads.set(id, { accountId: account.id, tipo, tamanho: file.tamanho, expires });
      return {
        upload_url: "/api/account/application/mock-upload/" + id,
        caminho: account.id + "/" + tipo + "/" + id,
        expira_em: new Date(expires).toISOString(),
        metodo: "PUT",
        cabecalhos: { "Content-Type": file.content_type },
      };
    },

    async confirmUpload(tipo, caminho) {
      guard();
      const app = editable();
      const [owner, pathTipo, id] = caminho.split("/");
      const upload = store.uploads.get(id ?? "");
      if (owner !== account.id || pathTipo !== tipo || !upload || upload.accountId !== account.id || upload.tipo !== tipo) throw apiError(400, "PARAMETRO_INVALIDO");
      if (!upload.received) throw apiError(404, "NAO_ENCONTRADO");
      store.uploads.delete(id);
      // Ficheiro inválido: é apagado e a resposta é 422
      if (upload.received.size > APPLICATION_FILE_MAX || !realFileType(upload.received.head)) throw apiError(422, "PEDIDO_INVALIDO");
      app.documentos[tipo] = { recebido: true };
      return refresh(app);
    },

    async remove(tipo) {
      guard();
      const app = editable();
      delete app.documentos[tipo];
      return refresh(app);
    },
  };
}

/** PUT ao upload_url do mock: guarda só os primeiros bytes (chegam para saber o formato). */
export function receiveMockUpload(id: string, bytes: Uint8Array): number {
  const upload = store.uploads.get(id);
  if (!upload || upload.expires < Date.now()) return 404;
  if (bytes.length > upload.tamanho) return 413;
  upload.received = { size: bytes.length, head: bytes.slice(0, 16) };
  return 200;
}
