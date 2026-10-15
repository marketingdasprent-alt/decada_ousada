/**
 * Formatos da API real do WeGest (https://api.wegest.pt/v1, v1.0.0).
 * Fonte: docs/wegest/openapi.json. O http-transport converte-os para os tipos Wg* de types.ts.
 */

/** Dinheiro: euros com 2 casas; `iva` em percentagem. Mostrar sempre `com_iva`. */
export interface ApiPreco {
  sem_iva: number;
  com_iva: number;
  iva: number;
}

export interface ApiLocalizacao {
  id: string;
  nome: string;
  morada: string | null;
  cidade: string | null;
  horario: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface ApiCategoria {
  id: string;
  codigo?: string;
  nome: string;
  descricao?: string | null;
  preco_dia_desde?: ApiPreco;
  modelos?: number;
}

interface ApiModeloBase {
  id: string;
  marca: string;
  modelo: string;
  categoria: { id: string; nome: string } | null;
  caixa: "manual" | "automatica" | null;
  combustivel: string | null;
  lugares: number | null;
  portas: number | null;
  bagageira: number | null;
  ar_condicionado?: boolean;
  /** Link temporário (24 h): nunca guardar. */
  imagem_url: string | null;
  frota?: number;
}

export interface ApiModelo extends ApiModeloBase {
  tipo: "passageiros" | "comercial";
  preco_dia: ApiPreco;
  /**
   * Primeiro dia (AAAA-MM-DD, hora de Lisboa) com uma viatura do modelo livre 24 h, nos
   * próximos 15 dias. Em /modelos vem sempre preenchido (só lista modelos com um dia livre);
   * em /modelos/{id} é null quando não há nenhum. Opcional aqui para tolerar uma API antiga.
   */
  disponivel_desde?: string | null;
}

export interface ApiModeloDetalhe extends ApiModelo {
  tarifa?: {
    /** Por dia; null = ilimitados. */
    km_incluidos: number | null;
    km_adicional: ApiPreco | null;
    franquia: ApiPreco | null;
    caucao: ApiPreco | null;
  };
}

export interface ApiModeloDisponivel extends ApiModelo {
  quantidade_disponivel: number;
  cotacao?: { dias: number; preco_dia: ApiPreco; aluguer: ApiPreco; franquia: ApiPreco | null; caucao: ApiPreco | null };
}

export interface ApiModeloTvde extends ApiModeloBase {
  preco_semana: ApiPreco;
  caucao: ApiPreco | null;
  franquia: ApiPreco | null;
  /** Por mês (não por semana). */
  km_incluidos: number | null;
  km_adicional: ApiPreco | null;
  quantidade_disponivel?: number;
}

export interface ApiExtra {
  id: string;
  nome: string;
  descricao: string | null;
  preco: ApiPreco;
  tipo_calculo: "fixo" | "dia";
  quantidade_maxima: number | null;
}

export interface ApiCobertura {
  id: string;
  nome: string;
  descricao: string | null;
  preco_dia: ApiPreco;
  franquia: ApiPreco | null;
}

export interface ApiPeriodo {
  inicio: string;
  fim: string;
  dias: number;
}

export interface ApiCotacao {
  periodo?: ApiPeriodo;
  modelo?: { id: string; marca: string; modelo: string };
  linhas: Array<{ tipo: "aluguer" | "cobertura" | "extra"; descricao: string; quantidade?: number; preco_unitario?: ApiPreco; total: ApiPreco }>;
  subtotal: ApiPreco;
  franquia?: ApiPreco | null;
  caucao?: ApiPreco | null;
  km_incluidos?: number | null;
  km_adicional?: ApiPreco | null;
  quantidade_disponivel?: number;
}

export interface ApiReserva {
  id: string;
  codigo: number;
  estado: "pendente" | "confirmada" | "em_curso" | "concluida" | "cancelada" | "expirada";
  referencia_externa: string | null;
  periodo: ApiPeriodo;
  modelo: { id: string; marca: string; modelo: string };
  estacoes?: { entrega?: { id: string; nome: string }; recolha?: { id: string; nome: string } };
  total: ApiPreco;
  criada_em: string;
}

export interface ApiErro {
  erro?: { codigo?: string; mensagem?: string; detalhes?: unknown };
}
