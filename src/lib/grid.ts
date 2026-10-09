/**
 * Grelhas sem buracos na última linha. Diz quantas colunas cada item ocupa numa grelha
 * de `cols` colunas: com menos itens que colunas, dividem a linha; senão, os primeiros
 * ocupam duas colunas até a última linha fechar (ex.: 6 itens em 4 colunas → 2 + 2 /
 * 1 + 1 + 1 + 1; 3 itens em 2 colunas → 2 / 1 + 1).
 */
export function fillSpans(n: number, cols: number): number[] {
  if (n === 0) return [];
  if (n < cols) return Array.from({ length: n }, (_, i) => Math.floor(cols / n) + (i < cols % n ? 1 : 0));
  const holes = (cols - (n % cols)) % cols;
  return Array.from({ length: n }, (_, i) => (i < holes ? 2 : 1));
}

// Classes literais: o Tailwind só gera as que encontra escritas no código
const SM_SPAN = ["", "sm:col-span-1", "sm:col-span-2"];
const MD_SPAN = ["", "md:col-span-1", "md:col-span-2", "md:col-span-3"];
const LG_SPAN = ["", "lg:col-span-1", "lg:col-span-2", "lg:col-span-3", "lg:col-span-4"];

/**
 * Classes `col-span` de cada item para uma grelha `sm:grid-cols-2` + `lg:grid-cols-{lg}`
 * (ou `md:grid-cols-{md}`), sem buracos em nenhuma das larguras.
 */
export function fillSpanClasses(n: number, { lg, md }: { lg?: 3 | 4; md?: 2 | 3 }): string[] {
  const sm = fillSpans(n, 2);
  const lgSpans = lg ? fillSpans(n, lg) : [];
  const mdSpans = md ? fillSpans(n, md) : [];
  return Array.from({ length: n }, (_, i) =>
    [md ? "" : SM_SPAN[sm[i]], md ? MD_SPAN[mdSpans[i]] : "", lg ? LG_SPAN[lgSpans[i]] : ""].filter(Boolean).join(" "),
  );
}
