#!/usr/bin/env node
/**
 * Validação dos endpoints da API WeGest contra o openapi.json oficial.
 *
 *   node scripts/validate-wegest.mjs            → só leitura (seguro)
 *   node scripts/validate-wegest.mjs --write    → também cria e cancela UMA reserva real
 *                                                 (avisar a equipa antes; não há sandbox)
 *
 * Lê WEGEST_API_KEY / WEGEST_API_URL de .env.local. Gera docs/wegest/validacao.md.
 * A chave nunca é impressa.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");

function loadEnv() {
  const file = path.join(root, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnv();

const BASE = (process.env.WEGEST_API_URL || "https://api.wegest.pt/v1").replace(/\/$/, "");
const KEY = process.env.WEGEST_API_KEY;
const WRITE = process.argv.includes("--write");
const spec = JSON.parse(fs.readFileSync(path.join(root, "docs/wegest/openapi.json"), "utf8"));

if (!KEY) {
  console.error("✗ WEGEST_API_KEY em falta. Coloque-a em .env.local (ver .env.example).");
  process.exit(1);
}

// ── validação de esquema (subconjunto do JSON Schema usado no openapi) ──
function resolve(s) {
  if (!s) return s;
  if (s.$ref) return resolve(s.$ref.split("/").slice(1).reduce((o, k) => o[k], spec));
  if (s.allOf) {
    const merged = { type: "object", properties: {}, required: [] };
    for (const part of s.allOf.map(resolve)) {
      Object.assign(merged.properties, part.properties ?? {});
      merged.required.push(...(part.required ?? []));
    }
    return merged;
  }
  return s;
}

function validate(value, schema, at = "$", errors = []) {
  const s = resolve(schema);
  if (!s) return errors;
  const types = Array.isArray(s.type) ? s.type : s.type ? [s.type] : [];
  const actual = value === null ? "null" : Array.isArray(value) ? "array" : Number.isInteger(value) ? "integer" : typeof value;
  if (types.length && !types.includes(actual) && !(actual === "integer" && types.includes("number"))) {
    errors.push(`${at}: esperado ${types.join("|")}, veio ${actual}`);
    return errors;
  }
  if (s.enum && !s.enum.includes(value)) errors.push(`${at}: valor "${value}" fora do enum (${s.enum.join("|")})`);
  if (actual === "object" && s.properties) {
    // A API garante "um campo sem valor vem a null; nunca é omitido", excepto onde o
    // esquema declara `required` (ex.: erro.detalhes é opcional).
    const mustHave = s.required?.length ? s.required : Object.keys(s.properties);
    for (const key of Object.keys(s.properties)) {
      if (!(key in value)) {
        if (mustHave.includes(key)) errors.push(`${at}.${key}: campo em falta`);
      } else validate(value[key], s.properties[key], `${at}.${key}`, errors);
    }
  }
  if (actual === "array" && s.items) value.slice(0, 5).forEach((v, i) => validate(v, s.items, `${at}[${i}]`, errors));
  return errors;
}

function responseSchema(method, route, status) {
  const op = spec.paths[route]?.[method.toLowerCase()];
  const r = resolve(op?.responses?.[String(status)]);
  return r?.content?.["application/json"]?.schema;
}

// ── execução ──
const results = [];
async function call(name, method, route, { path: p = route, query, body, expect = [200], schemaRoute = route } = {}) {
  const url = new URL(BASE + p);
  for (const [k, v] of Object.entries(query ?? {})) url.searchParams.set(k, v);
  const t = performance.now();
  let status = 0, json = null, err = null, headers = {};
  try {
    const res = await fetch(url, {
      method,
      headers: { "X-API-Key": KEY, Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
    status = res.status;
    headers = { cache: res.headers.get("cache-control"), retryAfter: res.headers.get("retry-after") };
    json = await res.json().catch(() => null);
  } catch (e) {
    err = e.name === "TimeoutError" ? "timeout (15s)" : e.message;
  }
  const ms = Math.round(performance.now() - t);
  const schemaErrors = json && status < 300 ? validate(json, responseSchema(method, schemaRoute, status)) : [];
  if (json?.erro && status >= 400) schemaErrors.push(...validate(json, spec.components.schemas.Erro));
  const ok = !err && expect.includes(status) && schemaErrors.length === 0;
  results.push({ name, method, path: url.pathname + url.search, status, ms, ok, err, code: json?.erro?.codigo, schemaErrors, cache: headers.cache, count: Array.isArray(json) ? json.length : json?.modelos?.length });
  console.log(`${ok ? "✓" : "✗"} ${method.padEnd(6)} ${name.padEnd(46)} ${String(status).padEnd(4)} ${String(ms).padStart(5)}ms ${json?.erro?.codigo ?? ""}${schemaErrors.length ? `  (${schemaErrors.length} divergências)` : ""}`);
  return json;
}

// Datas: lisboa com fuso explícito (exigido pela API)
const day = (offset, hour = 10) => {
  const d = new Date(Date.now() + offset * 86400000);
  return `${d.toISOString().slice(0, 10)}T${String(hour).padStart(2, "0")}:00:00+01:00`;
};

console.log(`\nWeGest API · ${BASE} · ${WRITE ? "LEITURA + ESCRITA" : "só leitura"}\n`);

run: {
const health = await call("health", "GET", "/health");
if (!health || health.erro) {
  console.error(`
✗ A chave não autentica (${health?.erro?.codigo ?? "sem resposta"}). Confirme WEGEST_API_KEY em .env.local.
`);
  process.exitCode = 1;
  break run;
}
const locais = (await call("localizacoes", "GET", "/localizacoes")) ?? [];
const categorias = (await call("categorias", "GET", "/categorias")) ?? [];
const modelos = (await call("modelos", "GET", "/modelos")) ?? [];
await call("modelos?tipo=passageiros", "GET", "/modelos", { query: { tipo: "passageiros" } });
await call("modelos?tipo=comercial", "GET", "/modelos", { query: { tipo: "comercial" } });
if (categorias[0]) await call("modelos?categoria=<1ª categoria>", "GET", "/modelos", { query: { categoria: categorias[0].id } });
if (modelos[0]) await call("modelos/{id}", "GET", "/modelos/{id}", { path: `/modelos/${modelos[0].id}` });
await call("modelos/{id} inexistente → 404", "GET", "/modelos/{id}", { path: "/modelos/00000000-0000-4000-8000-000000000000", expect: [404] });
const extras = (await call("extras", "GET", "/extras")) ?? [];
const coberturas = (await call("coberturas", "GET", "/coberturas")) ?? [];

let disp = null;
if (locais[0]) {
  const q = { inicio: day(7), fim: day(10), entrega: locais[0].id, recolha: locais[0].id };
  disp = await call("disponibilidade (+7d, 3 dias)", "GET", "/disponibilidade", { query: q, expect: [200, 409] });
  await call("disponibilidade sem fuso → 400", "GET", "/disponibilidade", { query: { ...q, inicio: q.inicio.slice(0, 19) }, expect: [400] });
  await call("disponibilidade no passado → 400", "GET", "/disponibilidade", { query: { ...q, inicio: day(-2), fim: day(-1) }, expect: [400] });
  await call("disponibilidade 31 dias → 400", "GET", "/disponibilidade", { query: { ...q, fim: day(38) }, expect: [400] });
  if (locais[1]) await call("disponibilidade entrega≠recolha", "GET", "/disponibilidade", { query: { ...q, recolha: locais[1].id }, expect: [200, 409] });
}

let cot = null;
const modeloLivre = disp?.modelos?.[0];
if (modeloLivre && locais[0]) {
  const body = {
    modelo_id: modeloLivre.id, inicio: day(7), fim: day(10), entrega: locais[0].id, recolha: locais[0].id,
    extras: extras[0] ? [{ extra_id: extras[0].id, quantidade: 1 }] : [],
    cobertura_id: coberturas[0]?.id ?? null,
  };
  cot = await call("cotacoes (com extra + cobertura)", "POST", "/cotacoes", { body, expect: [200] });
  if (extras[0]) await call("cotacoes extra repetido → 400", "POST", "/cotacoes", { body: { ...body, extras: [body.extras[0], body.extras[0]] }, expect: [400] });
}

await call("reservas/{codigo} inexistente → 404", "GET", "/reservas/{codigo}", { path: "/reservas/999999999", expect: [404] });

const tvde = (await call("tvde/modelos", "GET", "/tvde/modelos", { expect: [200, 403] })) ?? [];
if (Array.isArray(tvde) && tvde[0]) await call("tvde/modelos/{id}", "GET", "/tvde/modelos/{id}", { path: `/tvde/modelos/${tvde[0].id}` });
await call("tvde/disponibilidade (+7d)", "GET", "/tvde/disponibilidade", { query: { inicio: day(7) }, expect: [200, 403, 409, 503] });
await call("tvde/disponibilidade +200d → 400", "GET", "/tvde/disponibilidade", { query: { inicio: day(200) }, expect: [400, 403] });

if (WRITE && cot && modeloLivre) {
  const ref = `validacao-${Date.now()}`;
  const reserva = await call("reservas POST (REAL)", "POST", "/reservas", {
    expect: [201, 200],
    body: {
      modelo_id: modeloLivre.id, inicio: day(7), fim: day(10), entrega: locais[0].id, recolha: locais[0].id,
      extras: [], cobertura_id: null,
      cliente: { nome: "Teste Validação Site", email: "teste-site@decadaousada.pt", telefone: "+351 900 000 000", nif: null, data_nascimento: "1990-01-01", morada: null, codigo_postal: null, localidade: null, pais: "Portugal" },
      carta_conducao: { numero: "TESTE-000", validade: "2030-01-01", pais: "Portugal" },
      total_esperado: modeloLivre.cotacao?.aluguer?.com_iva ?? 0,
      referencia_externa: ref,
      mensagem: "TESTE AUTOMÁTICO DO SITE. Cancelar.",
    },
  });
  if (reserva?.codigo) {
    await call("reservas GET", "GET", "/reservas/{codigo}", { path: `/reservas/${reserva.codigo}` });
    await call("reservas DELETE (cancela o teste)", "DELETE", "/reservas/{codigo}", { path: `/reservas/${reserva.codigo}` });
  }
}

// ── relatório ──
const passed = results.filter((r) => r.ok).length;
const lines = [
  `# Validação da API WeGest`,
  ``,
  `- Data: ${new Date().toISOString()}`,
  `- Base: \`${BASE}\``,
  `- Modo: ${WRITE ? "leitura + escrita" : "só leitura"}`,
  `- Organização: \`${health?.organizacao ?? "?"}\``,
  `- Permissões da chave: ${health?.permissoes?.map((p) => `\`${p}\``).join(", ") ?? "?"}`,
  `- tarifa_site: **${health?.tarifa_site}** · tarifa_site_tvde: **${health?.tarifa_site_tvde}**`,
  `- Resultado: **${passed}/${results.length}** verificações OK`,
  ``,
  `| | Endpoint | Status | Tempo | Itens | Erro | Divergências |`,
  `|---|---|---|---|---|---|---|`,
  ...results.map((r) => `| ${r.ok ? "✅" : "❌"} | \`${r.method} ${r.name}\` | ${r.status || r.err} | ${r.ms} ms | ${r.count ?? ""} | ${r.code ?? ""} | ${r.schemaErrors.slice(0, 3).join("<br>")} |`),
  ``,
  `## Contagens`,
  ``,
  `- Localizações: ${locais.length}: ${locais.map((l) => l.nome).join(", ")}`,
  `- Categorias: ${categorias.length}: ${categorias.map((c) => c.nome).join(", ")}`,
  `- Modelos RAC: ${modelos.length} (com foto: ${modelos.filter((m) => m.imagem_url).length})`,
  `- Extras: ${extras.length} · Coberturas: ${coberturas.length}`,
  `- Modelos TVDE: ${Array.isArray(tvde) ? tvde.length : "sem permissão"}`,
];
const out = path.join(root, "docs/wegest/validacao.md");
fs.writeFileSync(out, lines.join("\n") + "\n");
console.log(`\n${passed}/${results.length} OK · relatório em docs/wegest/validacao.md\n`);
process.exitCode = passed === results.length ? 0 : 1;
}
