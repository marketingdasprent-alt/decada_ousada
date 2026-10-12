// Teste da chave WeGest — SÓ LEITURA. Não cria reservas nem candidaturas.
// Uso:  node --env-file=.env.local scripts/wegest-teste.mjs

const BASE = (process.env.WEGEST_API_URL || "https://api.wegest.pt/v1").replace(/\/$/, "");
const KEY = (process.env.WEGEST_API_KEY || "").trim();

const PERMISSOES_ESPERADAS = [
  "catalogo:read", "disponibilidade:read", "reservas:read", "reservas:write",
  "tvde:catalogo:read", "tvde:candidaturas:read", "tvde:candidaturas:write",
];

if (!KEY) { console.error("✗ WEGEST_API_KEY vazia em .env.local"); process.exit(1); }
if (!KEY.startsWith("wg_ra_")) console.warn("⚠ A chave não começa por wg_ra_ — confirme se colou a chave certa.");
const mascara = `${KEY.slice(0, 6)}…${KEY.slice(-4)}`;
console.log(`API: ${BASE}\nChave: ${mascara}\n`);

const resultados = [];
async function pedir(nome, caminho, { esperado = 200 } = {}) {
  const t0 = Date.now();
  let res, corpo;
  try {
    res = await fetch(BASE + caminho, { headers: { "X-API-Key": KEY, Accept: "application/json" } });
    const txt = await res.text();
    try { corpo = JSON.parse(txt); } catch { corpo = txt; }
  } catch (e) {
    resultados.push({ nome, ok: false, info: `falha de rede: ${e.message}` });
    return null;
  }
  const ms = Date.now() - t0;
  const ok = Array.isArray(esperado) ? esperado.includes(res.status) : res.status === esperado;
  const erro = corpo && corpo.erro ? ` ${corpo.erro.codigo}: ${corpo.erro.mensagem}` : "";
  resultados.push({ nome, ok, status: res.status, ms, info: erro.trim() });
  if (res.status === 429) console.warn(`⚠ Limite excedido; Retry-After: ${res.headers.get("retry-after")}s`);
  return { status: res.status, corpo };
}

const emDias = (d, h = 10) => { const x = new Date(); x.setUTCDate(x.getUTCDate() + d); x.setUTCHours(h, 0, 0, 0); return x.toISOString().replace(".000Z", "Z"); };
const qtd = r => (r && Array.isArray(r.corpo) ? r.corpo.length : "—");

// 1. Health
const health = await pedir("GET /health", "/health");
if (!health || health.status !== 200) {
  console.table(resultados);
  console.error("\n✗ A chave não autenticou. Verifique se a colou bem e se está activa.");
  process.exit(1);
}
const h = health.corpo;
const faltam = PERMISSOES_ESPERADAS.filter(p => !h.permissoes?.includes(p));
console.log("Organização:", h.organizacao);
console.log("Permissões:", (h.permissoes || []).join(", ") || "(nenhuma)");
console.log(faltam.length ? `✗ Faltam: ${faltam.join(", ")}` : "✓ Tem as 7 permissões");
console.log(`Tarifa do site rent-a-car: ${h.tarifa_site ? "✓" : "✗ não configurada (catálogo vem vazio)"}`);
console.log(`Tarifa do site TVDE:       ${h.tarifa_site_tvde ? "✓" : "✗ não configurada (TVDE vem vazio / 503)"}\n`);

// 2. Catálogo rent-a-car
const locs = await pedir("GET /localizacoes", "/localizacoes");
const cats = await pedir("GET /categorias", "/categorias");
const mods = await pedir("GET /modelos", "/modelos");
const ext  = await pedir("GET /extras", "/extras");
const cob  = await pedir("GET /coberturas", "/coberturas");

// 3. Disponibilidade rent-a-car (daqui a 7 dias, 3 dias, na 1.ª localização)
let disp = null;
const loc0 = Array.isArray(locs?.corpo) ? locs.corpo[0] : null;
if (loc0) {
  const q = new URLSearchParams({ inicio: emDias(7), fim: emDias(10), entrega: loc0.id, recolha: loc0.id });
  disp = await pedir("GET /disponibilidade", `/disponibilidade?${q}`);
} else {
  resultados.push({ nome: "GET /disponibilidade", ok: false, info: "sem localizações para testar" });
}

// 4. TVDE
const tvdeMods = await pedir("GET /tvde/modelos", "/tvde/modelos");
const tvdeDisp = await pedir("GET /tvde/disponibilidade", `/tvde/disponibilidade?inicio=${encodeURIComponent(emDias(7, 9))}`);

// 5. Permissões de consulta: um id inexistente deve dar 404 (tem permissão), não 403
await pedir("reservas:read (sonda 404)", "/reservas/0", { esperado: [404, 400] });
await pedir("tvde:candidaturas:read (sonda 404)", "/tvde/candidaturas/00000000-0000-4000-8000-000000000000", { esperado: 404 });

console.table(resultados.map(r => ({ teste: r.nome, ok: r.ok ? "✓" : "✗", status: r.status ?? "—", ms: r.ms ?? "—", erro: r.info || "" })));

console.log("\nResumo dos dados:");
console.log(`  Localizações: ${qtd(locs)}${Array.isArray(locs?.corpo) ? " → " + locs.corpo.map(l => l.nome).join(", ") : ""}`);
console.log(`  Categorias:   ${qtd(cats)}${Array.isArray(cats?.corpo) ? " → " + cats.corpo.map(c => `${c.nome} (desde ${c.preco_dia_desde?.com_iva ?? "?"} €/dia)`).join(", ") : ""}`);
console.log(`  Modelos:      ${qtd(mods)}   Extras: ${qtd(ext)}   Coberturas: ${qtd(cob)}`);
if (disp?.status === 200) console.log(`  Disponíveis (${loc0.nome}, +7 dias, 3 dias): ${JSON.stringify(disp.corpo).length > 2 ? (disp.corpo.modelos?.length ?? qtd(disp)) : 0}`);
console.log(`  Modelos TVDE: ${qtd(tvdeMods)}${Array.isArray(tvdeMods?.corpo) ? " → " + tvdeMods.corpo.map(m => `${m.marca} ${m.modelo} ${m.preco_semana?.com_iva ?? "?"} €/sem`).join(", ") : ""}`);
if (tvdeDisp?.status === 200) console.log(`  TVDE livres daqui a 7 dias: ${tvdeDisp.corpo.modelos?.length ?? 0}`);

console.log("\nNão testado (escreve dados reais): POST /reservas, DELETE /reservas, POST /tvde/candidaturas.");
process.exit(resultados.every(r => r.ok) && !faltam.length ? 0 : 1);
