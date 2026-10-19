// Teste das rotas /conta da candidatura TVDE (openapi WeGest de 19/10/2026). ESCREVE NO WEGEST:
// grava um rascunho de candidatura e um ficheiro de teste na conta do token. Nunca submete.
// Usar só com uma conta de motorista de TESTE, com o email confirmado.
//
// Uso (PowerShell):
//   $env:WEGEST_CONTA_TOKEN = "<access_token da conta de teste>"
//   node --env-file=.env.local scripts/wegest-conta-teste.mjs            # 3 passos e deixa o ficheiro
//   node --env-file=.env.local scripts/wegest-conta-teste.mjs --limpar   # no fim apaga o ficheiro
//
// O token e o URL de upload nunca são escritos no ecrã.

const BASE = (process.env.WEGEST_API_URL || "https://api.wegest.pt/v1").replace(/\/$/, "");
const KEY = (process.env.WEGEST_API_KEY || "").trim();
const TOKEN = (process.env.WEGEST_CONTA_TOKEN || "").trim();
const LIMPAR = process.argv.includes("--limpar");
const TIPO = "carta_frente";


// PNG de 1x1 píxel: ficheiro válido e mínimo, só para o teste
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64");

const comum = { "X-API-Key": KEY, "X-Conta-Token": TOKEN, Accept: "application/json" };
let falhou = false;

async function pedir(passo, metodo, caminho, corpo) {
  const res = await fetch(BASE + caminho, {
    method: metodo,
    headers: corpo ? { ...comum, "Content-Type": "application/json" } : comum,
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const txt = await res.text();
  let json = null;
  try { json = JSON.parse(txt); } catch { /* corpo vazio ou não JSON */ }
  const erro = json?.erro ? ` ${json.erro.codigo}: ${json.erro.mensagem}` : "";
  const ok = res.ok;
  if (!ok) falhou = true;
  console.log(`${ok ? "✓" : "✗"} ${passo.padEnd(34)} ${metodo} ${caminho} → ${res.status}${erro}`);
  return { ok, status: res.status, json };
}

const resumo = (c) => c && `estado=${c.estado} | ${TIPO}=${c.documentos?.[TIPO]?.recebido ? "recebido" : "não recebido"} | pode_submeter=${c.pode_submeter}`;

async function main() {
  if (!KEY) { console.error("✗ WEGEST_API_KEY vazia em .env.local"); falhou = true; return; }
  if (!TOKEN) { console.error("✗ Falta WEGEST_CONTA_TOKEN (access_token da conta de teste)."); falhou = true; return; }

  console.log(`API: ${BASE}\n`);

  // 0. Quem é a conta (sem mostrar dados pessoais)
  const conta = await pedir("0. Conta do token", "GET", "/conta");
  if (conta.ok) console.log(`   tipo=${conta.json.tipo} | email_confirmado=${conta.json.email_confirmado} | candidatura=${conta.json.motorista?.candidatura?.estado ?? "nenhuma"}`);
  if (!conta.ok) return;

  // 1. Rascunho: só uma observação, sem dados pessoais inventados
  const rascunho = await pedir("1. Guardar rascunho", "PUT", "/conta/candidatura", { observacoes: "Teste técnico do site Década Ousada. Ignorar." });
  if (rascunho.ok) console.log(`   ${resumo(rascunho.json.candidatura)}`);
  if (!rascunho.ok) return;

  // 2. Pedir o URL de envio
  const envio = await pedir("2. Pedir URL de envio", "POST", `/conta/candidatura-documentos/${TIPO}`, { content_type: "image/png", tamanho: PNG.length });
  if (!envio.ok) return;
  const { upload_url, caminho, cabecalhos, metodo, expira_em } = envio.json;
  console.log(`   metodo=${metodo} | expira_em=${expira_em} | cabecalhos=${Object.keys(cabecalhos ?? {}).join(",")}`);

  // 3. Enviar o ficheiro direto ao storage (sem chave nem token)
  const up = await fetch(upload_url, { method: metodo || "PUT", headers: cabecalhos, body: PNG });
  console.log(`${up.ok ? "✓" : "✗"} ${"3. Enviar ficheiro ao storage".padEnd(34)} ${metodo || "PUT"} upload_url → ${up.status}${up.ok ? "" : ` ${(await up.text()).slice(0, 120)}`}`);
  if (!up.ok) { falhou = true; return; }

  // 4. Confirmar o ficheiro na candidatura
  const conf = await pedir("4. Confirmar ficheiro", "PUT", `/conta/candidatura-documentos/${TIPO}`, { caminho });
  if (conf.ok) console.log(`   ${resumo(conf.json.candidatura)}`);

  // 5. Ler outra vez para ver o estado final
  const fim = await pedir("5. Ler candidatura", "GET", "/conta/candidatura");
  if (fim.ok) console.log(`   ${resumo(fim.json.candidatura)} | em_falta=${(fim.json.candidatura.em_falta ?? []).length} doc(s)`);

  if (LIMPAR) {
    const del = await pedir("6. Apagar ficheiro de teste", "DELETE", `/conta/candidatura-documentos/${TIPO}`);
    if (del.ok) console.log(`   ${resumo(del.json.candidatura)}`);
  }

  console.log(falhou ? "\nResultado: houve falhas (ver ✗ acima)." : "\nResultado: os passos passaram.");
}

await main();
// exitCode em vez de process.exit: no Windows, sair logo a seguir a um fetch faz o Node falhar
process.exitCode = falhou ? 1 : 0;
