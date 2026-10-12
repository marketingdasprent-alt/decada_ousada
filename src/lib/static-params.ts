/**
 * Com Cache Components, generateStaticParams tem de devolver pelo menos um resultado.
 * Quando o WeGest ainda não tem dados (ex.: Rent a Car sem modelos), devolve um parâmetro
 * que não existe: a página responde 404 e as páginas reais continuam a ser geradas a pedido.
 */
export function atLeastOne<K extends string>(params: Array<Record<K, string>>, key: K): Array<Record<K, string>> {
  return params.length ? params : [{ [key]: "sem-resultados" } as Record<K, string>];
}
