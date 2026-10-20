/** Contratos de /conta confirmados na documentação pública WeGest em 19/10/2026. */
export interface WeGestAccount {
  email: string;
  email_confirmado: boolean;
  tipo: "cliente" | "motorista";
  cliente: { id: string; nome: string; nif: string | null; telefone: string | null } | null;
}

export interface AccountInvoice {
  id: string;
  tipo: "FT" | "FR" | "NC" | "RC";
  serie: string | null;
  numero: string | null;
  data_emissao: string | null;
  total: number | null;
  contrato_codigo: number | null;
  reserva_codigo: number | null;
}

/** Candidatura TVDE da conta (GET/PUT/POST /conta/candidatura, openapi WeGest de 19/10/2026). */
export const APPLICATION_DOC_TYPES = [
  "documento_frente",
  "documento_verso",
  "carta_frente",
  "carta_verso",
  "licenca_tvde",
  "registo_criminal",
  "comprovativo_morada",
  "comprovativo_iban",
] as const;
export type ApplicationDocType = (typeof APPLICATION_DOC_TYPES)[number];
export const isApplicationDocType = (value: string): value is ApplicationDocType => (APPLICATION_DOC_TYPES as readonly string[]).includes(value);

export const ID_DOCUMENT_TYPES = ["cc", "bi", "ar", "tr", "passaporte"] as const;
export const LICENSE_CATEGORIES = ["A", "A1", "A2", "AM", "B", "B1", "BE", "C", "C1", "CE", "D", "D1", "DE"] as const;
/** content_type aceite no pedido de envio; o WeGest confirma-o pelo conteúdo do ficheiro. */
export const APPLICATION_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export const APPLICATION_FILE_MAX = 10 * 1024 * 1024;

/** Campos do rascunho (CandidaturaContaPedido). Todos opcionais: só os enviados são gravados. */
export interface AccountApplicationDraft {
  nome?: string;
  email?: string;
  telefone?: string;
  nif?: string;
  morada?: string;
  codigo_postal?: string;
  cidade?: string;
  documento?: { tipo?: (typeof ID_DOCUMENT_TYPES)[number]; numero?: string; validade?: string };
  carta_conducao?: { numero?: string; categorias?: Array<(typeof LICENSE_CATEGORIES)[number]>; validade?: string };
  licenca_tvde?: { numero?: string; validade?: string } | null;
  em_formacao_tvde?: boolean;
  iban?: string;
  modelo_pretendido_id?: string | null;
  data_inicio_pretendida?: string | null;
  observacoes?: string | null;
  consentimento?: { versao: string; aceite_em: string };
}

export interface AccountApplication {
  id: string;
  estado: "rascunho" | "submetido" | "em_analise" | "aprovado" | "rejeitado";
  motivo_rejeicao: string | null;
  submetida_em: string | null;
  dados: AccountApplicationDraft;
  documentos: Partial<Record<ApplicationDocType, { recebido: boolean }>>;
  em_falta: string[];
  campos_em_falta: string[];
  pode_submeter: boolean;
}

/** Resposta do pedido de envio (EnvioDocumento). O upload_url é assinado: nunca vai para logs. */
export interface ApplicationUploadTicket {
  upload_url: string;
  caminho: string;
  expira_em: string;
  metodo: "PUT";
  cabecalhos: Record<string, string>;
}
