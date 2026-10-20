import { WeGestError } from "@/services/wegest/types";

/**
 * Com Cache Components, generateStaticParams tem de devolver pelo menos um resultado.
 * Quando o WeGest ainda não tem dados (ex.: Rent a Car sem modelos), devolve um parâmetro
 * que não existe: a página responde 404 e as páginas reais continuam a ser geradas a pedido.
 */
export function atLeastOne<K extends string>(params: Array<Record<K, string>>, key: K): Array<Record<K, string>> {
  return params.length ? params : [{ [key]: "sem-resultados" } as Record<K, string>];
}

/**
 * generateStaticParams a partir do WeGest sem fazer o build depender da API: se o WeGest
 * não responder, o build segue com o parâmetro de reserva e as páginas reais são geradas
 * na primeira visita.
 */
export async function wegestStaticParams<K extends string>(load: () => Promise<Array<Record<K, string>>>, key: K): Promise<Array<Record<K, string>>> {
  try {
    return atLeastOne(await load(), key);
  } catch (err) {
    if (!(err instanceof WeGestError)) throw err;
    console.warn(`[wegest] generateStaticParams sem resposta (${err.code}): páginas geradas a pedido.`);
    return atLeastOne([], key);
  }
}
