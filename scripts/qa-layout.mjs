#!/usr/bin/env node
// Layout QA num browser real (Chrome headless pelo DevTools Protocol, sem
// dependências). Para cada página, largura e região verifica:
//   1. sem scroll horizontal da página;
//   2. nada sai do Container (.layout-container), exceto o que está dentro de
//      um contentor com scroll horizontal próprio, faixas com scroll que
//      sangram até à borda (margem negativa) e elementos fixos;
//   3. caixas lado a lado na mesma linha têm a mesma altura e o conteúdo
//      começa à mesma altura;
//   4. numa grelha que quebra em várias linhas, cada caixa da última linha
//      fica alinhada a uma coluna da primeira (sem órfão desalinhado);
//   5. grid-main-aside: em mobile a coluna lateral fica abaixo do conteúdo;
//      um elemento sticky nunca é mais alto do que o ecrã;
//   6. nenhum texto cortado na horizontal;
//   7. alvos interativos com pelo menos 44 x 44 px abaixo de 768 px (links
//      dentro de uma frase estão isentos, WCAG 2.5.8);
//   8. elementos fixos não tapam conteúdo: o cabeçalho fixo tem
//      scroll-padding-top que o compensa e uma barra fixa em baixo não tapa o
//      fim da página.
// Formulários, diálogos e scrollers horizontais estão isentos de 3 e 4.
//
// Uso: npm run dev (noutro terminal) e depois
//   npm run qa:layout [-- --url=http://localhost:3000] [--shots=pasta]
//     [--widths=375,1280] [--regions=continente,acores] [--json=ficheiro]
// Precisa de Chrome ou Edge; CHROME_PATH se não estiver num sítio comum.
// Entra com a conta de demonstração (WEGEST_MODE=mock) e cria uma
// candidatura TVDE de teste no estado em memória do servidor.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")).map(([k, v]) => [k, v ?? true]),
);
const BASE = (args.url || "http://localhost:3000").replace(/\/$/, "");
const SHOTS = typeof args.shots === "string" ? path.resolve(args.shots) : null;
const JSON_OUT = typeof args.json === "string" ? path.resolve(args.json) : null;
const WIDTHS = typeof args.widths === "string" ? args.widths.split(",").map(Number) : [375, 560, 768, 880, 1024, 1200, 1280, 1440, 1920];
const REGIONS = typeof args.regions === "string" ? args.regions.split(",") : ["continente", "acores"];
const DEMO = { email: "demo@decadaousada.pt", password: "demo1234" };

const CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const CHROME = CANDIDATES.find((c) => existsSync(c));
if (!CHROME) {
  console.error("Chrome/Edge não encontrado. Defina CHROME_PATH.");
  process.exit(2);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const port = 9400 + Math.floor(Math.random() * 400);
const profile = path.join(tmpdir(), `qa-layout-${port}`);
const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "about:blank"]);

let target;
for (let i = 0; i < 120 && !target; i++) {
  await wait(250);
  try {
    target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === "page");
  } catch {
    /* Chrome ainda a arrancar */
  }
}
if (!target) {
  console.error("Não foi possível ligar ao Chrome.");
  chrome.kill();
  process.exit(2);
}

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let seq = 0;
const pending = new Map();
const loadWaiters = [];
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  }
  if (m.method === "Page.loadEventFired") loadWaiters.splice(0).forEach((r) => r());
});
const send = (method, params = {}) =>
  new Promise((r) => {
    const id = ++seq;
    pending.set(id, r);
    ws.send(JSON.stringify({ id, method, params }));
  });
const js = async (code) =>
  (await send("Runtime.evaluate", { expression: `(async () => { ${code} })()`, returnByValue: true, awaitPromise: true })).result?.result?.value;

async function go(url, settle = 700) {
  const loaded = new Promise((r) => loadWaiters.push(r));
  await send("Page.navigate", { url: url.startsWith("http") ? url : BASE + url });
  await Promise.race([loaded, wait(15000)]);
  await wait(settle);
}
const setField = (sel, val) =>
  `{ const el=document.querySelector(${JSON.stringify(sel)}); if (el) { const proto=el.tagName==='SELECT'?HTMLSelectElement.prototype:el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto,'value').set.call(el,${JSON.stringify(val)}); el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true})); } }`;

// Corre na página. Devolve problemas como texto.
const AUDIT = `(() => {
  const problems = [];
  const W = innerWidth, H = innerHeight;
  const vis = (el) => { const s = getComputedStyle(el); return s.display !== "none" && s.visibility !== "hidden" && el.getClientRects().length > 0; };
  const srOnly = (el) => { const r = el.getBoundingClientRect(); return r.width <= 1 || r.height <= 1 || getComputedStyle(el).clip !== "auto"; };
  const describe = (el) => {
    const id = el.id ? "#" + el.id : "";
    const cls = typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\\s+/).slice(0, 3).join(".") : "";
    const text = (el.innerText || el.getAttribute("aria-label") || "").trim().replace(/\\s+/g, " ").slice(0, 30);
    return el.tagName.toLowerCase() + id + cls + (text ? ' "' + text + '"' : "");
  };
  const inFixed = (el) => { for (let p = el; p && p !== document.body; p = p.parentElement) if (getComputedStyle(p).position === "fixed") return true; return false; };
  const scrollerOf = (el) => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === "auto" || o === "scroll" || o === "hidden" || o === "clip") return p; } return null; };

  // 1. Scroll horizontal
  const overflow = document.documentElement.scrollWidth - W;
  if (overflow > 1) problems.push("1 scroll horizontal: " + overflow + "px");

  // 2. Fora do Container
  const outside = new Set();
  for (const c of document.querySelectorAll(".layout-container")) {
    if (!vis(c)) continue;
    const cs = getComputedStyle(c), cr = c.getBoundingClientRect();
    const left = cr.left + parseFloat(cs.paddingLeft), right = cr.right - parseFloat(cs.paddingRight);
    for (const el of c.querySelectorAll("*")) {
      if (!vis(el) || srOnly(el) || el.closest("[aria-hidden='true'], svg")) continue;
      const pos = getComputedStyle(el).position;
      if (pos === "fixed" || pos === "absolute" || inFixed(el)) continue;
      const sc = scrollerOf(el);
      if (sc && c.contains(sc)) continue;
      // Faixa com scroll horizontal que sangra até à borda (margem negativa = padding do Container): composição
      const es = getComputedStyle(el);
      if ((es.overflowX === "auto" || es.overflowX === "scroll") && parseFloat(es.marginLeft) < 0) continue;
      const r = el.getBoundingClientRect();
      if (r.left < left - 1 || r.right > right + 1) outside.add(describe(el) + " (" + Math.round(Math.min(r.left - left, 0) || r.right - right) + "px)");
    }
  }
  [...outside].slice(0, 4).forEach((d) => problems.push("2 fora do Container: " + d));

  // 3 e 4. Caixas lado a lado
  const isBox = (el) => {
    const s = getComputedStyle(el);
    if (!vis(el) || el.offsetWidth === 0) return false;
    const rounded = parseFloat(s.borderTopLeftRadius) > 0;
    const bordered = ["Top", "Right", "Bottom", "Left"].some((k) => parseFloat(s["border" + k + "Width"]) > 0);
    const filled = s.backgroundColor !== "rgba(0, 0, 0, 0)" && s.backgroundColor !== getComputedStyle(el.parentElement).backgroundColor;
    return rounded && (bordered || s.boxShadow !== "none" || filled);
  };
  for (const parent of document.querySelectorAll("main *")) {
    if (parent.closest("form, dialog, [role=dialog], [aria-hidden='true'], fieldset")) continue;
    const ps = getComputedStyle(parent);
    if (ps.display !== "grid" && ps.display !== "flex") continue;
    if (ps.display === "flex" && ps.flexDirection.startsWith("column")) continue;
    if (scrollerOf(parent) && parent.scrollWidth > parent.clientWidth + 1) continue;
    const kids = [...parent.children].filter((k) => vis(k) && getComputedStyle(k).position !== "absolute");
    if (kids.length < 2) continue;
    const boxOf = (k) => (isBox(k) ? k : k.children.length === 1 && isBox(k.children[0]) ? k.children[0] : null);
    if (!kids.every(boxOf)) continue;
    const rows = [];
    for (const k of kids) {
      const box = boxOf(k), b = box.getBoundingClientRect();
      const first = [...box.querySelectorAll("*")].find((c) => vis(c) && c.offsetWidth > 0 && !srOnly(c) && getComputedStyle(c).position !== "absolute");
      const r = { left: b.left, right: b.right, top: b.top, height: b.height, firstTop: first ? first.getBoundingClientRect().top : b.top };
      const row = rows.find((x) => Math.abs(x.top - r.top) < 4);
      if (row) row.items.push(r); else rows.push({ top: r.top, items: [r] });
    }
    for (const row of rows) {
      if (row.items.length < 2) continue;
      const h = row.items.map((r) => r.height);
      if (Math.max(...h) - Math.min(...h) > 2) { problems.push("3 alturas diferentes na mesma linha (" + h.map(Math.round).join("/") + "px) em " + describe(parent)); break; }
      const st = row.items.map((r) => r.firstTop - r.top);
      if (Math.max(...st) - Math.min(...st) > 2) { problems.push("3 conteúdo começa a alturas diferentes (" + st.map(Math.round).join("/") + "px) em " + describe(parent)); break; }
    }
    if (rows.length > 1 && ps.display === "grid") {
      const cols = rows[0].items.map((r) => r.left);
      const last = rows[rows.length - 1];
      if (last.items.some((r) => !cols.some((c) => Math.abs(c - r.left) < 3))) problems.push("4 última linha fora das colunas (" + rows.map((r) => r.items.length).join("+") + ") em " + describe(parent));
    }
  }

  // 5. grid-main-aside e sticky
  if (W < 1024) for (const g of document.querySelectorAll(".grid-main-aside, [class*='lg:grid-main-aside']")) {
    const kids = [...g.children].filter(vis);
    if (kids.length >= 2 && kids[1].getBoundingClientRect().top < kids[0].getBoundingClientRect().bottom - 1) problems.push("5 coluna lateral ao lado do conteúdo em mobile: " + describe(g));
  }
  for (const el of document.querySelectorAll("main *")) {
    const s = getComputedStyle(el);
    if (s.position !== "sticky" || !vis(el)) continue;
    const top = parseFloat(s.top) || 0;
    if (el.getBoundingClientRect().height > H - top) problems.push("5 sticky mais alto do que o ecrã (" + Math.round(el.getBoundingClientRect().height) + "px > " + Math.round(H - top) + "px): " + describe(el));
  }

  // 6. Texto cortado
  const clipped = new Set();
  for (const el of document.querySelectorAll("body *")) {
    if (!vis(el) || srOnly(el) || !el.childNodes.length) continue;
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const ox = getComputedStyle(el).overflowX;
    if (ox === "visible" || el.tagName === "INPUT" || el.tagName === "SELECT" || el.tagName === "TEXTAREA") continue;
    if (el.scrollWidth > el.clientWidth + 1) clipped.add(describe(el));
  }
  [...clipped].slice(0, 4).forEach((d) => problems.push("6 texto cortado: " + d));

  // 7. Alvos de 44 px em mobile
  if (W < 768) {
    const small = [];
    for (const el of document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea, [role=button], summary")) {
      if (!vis(el) || el.closest("[aria-hidden='true']")) continue;
      const er = el.getBoundingClientRect();
      if (er.right <= 0 || er.bottom <= 0 || er.left >= W) continue;
      let target = el;
      if ((el.type === "checkbox" || el.type === "radio" || srOnly(el)) && el.closest("label")) target = el.closest("label");
      else if (srOnly(el)) continue;
      // Link esticado sobre um cartão (::after absoluto): o alvo é o cartão
      if (getComputedStyle(el, "::after").position === "absolute") continue;
      // Link dentro de uma frase (texto à volta no mesmo bloco): isento
      if (el.tagName === "A" && getComputedStyle(el).display === "inline" && el.parentElement && el.parentElement.innerText.trim().length > el.innerText.trim().length + 3) continue;
      const r = target.getBoundingClientRect();
      if (r.width < 44 || r.height < 44) small.push(describe(el) + " " + Math.round(r.width) + "x" + Math.round(r.height));
    }
    if (small.length) problems.push("7 " + small.length + " alvo(s) abaixo de 44px, ex.: " + [...new Set(small)].slice(0, 3).join("; "));
  }

  // 8. Elementos fixos
  const fixed = [...document.querySelectorAll("body *")].filter((el) => { const p = getComputedStyle(el).position; return (p === "fixed" || p === "sticky") && vis(el) && !el.closest("main [class*='sticky'] *"); });
  const header = fixed.find((el) => el.getBoundingClientRect().top <= 0 && el.getBoundingClientRect().height < H / 3 && el.getBoundingClientRect().width >= document.documentElement.clientWidth - 1);
  if (header) {
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    if (pad < header.getBoundingClientRect().height - 1) problems.push("8 cabeçalho fixo (" + Math.round(header.getBoundingClientRect().height) + "px) sem scroll-padding-top equivalente (" + pad + "px): o foco pode ficar escondido");
  }
  return problems;
})()`;

// Barra fixa em baixo: no fim da página não pode tapar o último conteúdo
const BOTTOM_BAR = `(async () => {
  scrollTo(0, document.documentElement.scrollHeight); await new Promise((r) => setTimeout(r, 150));
  const H = innerHeight;
  const bars = [...document.querySelectorAll("body *")].filter((el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return s.position === "fixed" && s.display !== "none" && r.height > 0 && Math.abs(r.bottom - H) < 2 && r.height < H / 2; });
  const out = [];
  for (const bar of bars) {
    const top = bar.getBoundingClientRect().top;
    const texts = [...document.querySelectorAll("footer *, main *")].filter((el) => !bar.contains(el) && el.children.length === 0 && el.textContent.trim() && el.getClientRects().length);
    const hidden = texts.filter((el) => el.getBoundingClientRect().bottom > top + 1 && el.getBoundingClientRect().top < H);
    if (hidden.length) out.push("8 barra fixa em baixo tapa " + hidden.length + " elemento(s) no fim da página, ex.: " + hidden.slice(0, 2).map((e) => '"' + e.textContent.trim().slice(0, 30) + '"').join(", "));
  }
  scrollTo(0, 0);
  return out;
})()`;

const addDays = (n) => {
  const d = new Date(Date.now() + n * 86_400_000);
  return d.toISOString().slice(0, 10);
};

/** Descobre rotas e prepara dados (sessão, candidatura) para uma região. */
async function prepare(region) {
  await send("Network.clearBrowserCookies");
  await go(`/?regiao=${region}`);
  const loc = await js(`return document.querySelector('form[aria-label] select')?.value`);
  const q = `levantamento=${loc}&devolucao=${loc}&inicio=${addDays(40)}T10:00&fim=${addDays(43)}T10:00`;

  await go("/rent-a-car");
  const city = await js(`return [...document.querySelectorAll('main a[href^="/rent-a-car/"]')].map(a=>a.getAttribute('href')).find(h=>/^\\/rent-a-car\\/[a-z-]+$/.test(h) && !/viaturas|reserva|confirmacao/.test(h))`);
  await go(`/rent-a-car/viaturas?${q}`, 1200);
  const racVehicle = await js(`return [...document.querySelectorAll('main a[href*="/rent-a-car/viatura/"]')].map(a=>a.getAttribute('href'))[0]`);
  await go(racVehicle, 1200);
  const checkout = await js(`return [...document.querySelectorAll('main a[href*="/rent-a-car/reserva"]')].map(a=>a.getAttribute('href'))[0]`);
  await go("/tvde/viaturas", 1000);
  const tvdeVehicles = await js(`return [...new Set([...document.querySelectorAll('main a[href*="/tvde/viatura/"]')].map(a=>a.getAttribute('href')))]`);

  const publicRoutes = [
    "/", "/rent-a-car", city, "/rent-a-car/viaturas", `/rent-a-car/viaturas?${q}`, racVehicle,
    "/tvde", "/tvde/viaturas", tvdeVehicles[0], "/perguntas-frequentes", "/contactos",
    "/entrar", "/registar", "/recuperar-password", "/pagina-que-nao-existe",
  ].filter(Boolean);

  // Sessão da conta de demonstração
  await go("/entrar", 1000);
  await js(setField("input[name=email]", DEMO.email));
  await js(setField("input[name=password]", DEMO.password));
  await js("document.querySelector('main form button[type=submit]').click();");
  await wait(3500);

  // Candidatura TVDE de teste: cadastro, documentos e pagamento
  let cadastro = null, appId = null;
  for (const v of tvdeVehicles) {
    await go(v, 1500);
    cadastro = await js(`return document.querySelector('main a[href*="/tvde/candidatura?"]')?.getAttribute('href') ?? null`);
    if (cadastro) break;
  }
  if (cadastro) {
    await go(cadastro, 1500);
    const vals = { full_name: "Teste Layout", birth_date: "1988-03-03", nif: "123456789", niss: "12345678901", phone: "+351 913 000 333", address: "Rua de Teste, 1", zip_code: "2400-100", city: "Leiria", license_number: "L-555", license_expiry: "2031-01-01", tvde_certificate: "TVDE-1" };
    for (const [k, v] of Object.entries(vals)) await js(`{ const el=document.querySelector('[name=${k}]'); if (el && !el.value) ${setField(`[name=${k}]`, v)} }`);
    await js(setField("select[name=platform]", "uber"));
    await js(`document.querySelector('input[name=experience][value="2"]')?.click();`);
    await js(`[...document.querySelectorAll('main button[type=submit]')].pop()?.click();`);
    await wait(3500);
    appId = await js(`return new URLSearchParams(location.search).get('id')`);
  }
  // A candidatura de teste segura a viatura: o cadastro mede-se com outra viatura disponível
  let cadastroRoute = null;
  for (const v of tvdeVehicles) {
    await go(v, 1500);
    const href = await js(`return document.querySelector('main a[href*="/tvde/candidatura?"]')?.getAttribute('href') ?? null`);
    if (href && href !== cadastro) { cadastroRoute = href; break; }
  }
  const tvdeSteps = [];
  if (cadastroRoute) tvdeSteps.push(cadastroRoute);
  if (appId) {
    tvdeSteps.push(`/tvde/candidatura/documentos?id=${appId}`);
    await go(tvdeSteps[1], 1500);
    await js(`const pdf=new Uint8Array([0x25,0x50,0x44,0x46,0x2d,0x31]); for (const i of document.querySelectorAll('input[type=file][id^="doc-"]')) { const dt=new DataTransfer(); dt.items.add(new File([pdf], 'doc.pdf', {type:'application/pdf'})); i.files=dt.files; i.dispatchEvent(new Event('change',{bubbles:true})); await new Promise(r=>setTimeout(r,1300)); }`);
    tvdeSteps.push(`/tvde/candidatura/pagamento?id=${appId}`);
  }

  const privateRoutes = [
    checkout, "/rent-a-car/confirmacao?reserva=BK-1", ...tvdeSteps, "/tvde/candidatura/confirmacao?id=APP-1",
    "/minha-conta", "/minha-conta/reservas", "/minha-conta/reservas/BK-1", "/minha-conta/perfil", "/minha-conta/faturas", "/minha-conta/seguranca",
    "/tvde/minha-conta", "/tvde/minha-conta/candidaturas", "/tvde/minha-conta/candidaturas/APP-1", "/tvde/minha-conta/perfil", "/tvde/minha-conta/suporte",
  ].filter(Boolean);
  return { publicRoutes, privateRoutes, notes: { cadastro: !!cadastro, appId } };
}

if (SHOTS) mkdirSync(SHOTS, { recursive: true });
await send("Page.enable");
await send("Network.enable");
let failures = 0;
const report = [];
const routeCount = { n: 0 };

for (const region of REGIONS) {
  await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  const { publicRoutes, privateRoutes, notes } = await prepare(region);
  if (!notes.appId) console.log(`AVISO ${region}: não foi possível criar a candidatura de teste; passos de documentos e pagamento ficam de fora.`);
  // As rotas públicas correm sem sessão; as privadas com a sessão de demonstração
  const groups = [
    { routes: privateRoutes, session: true },
    { routes: publicRoutes, session: false },
  ];
  for (const group of groups) {
    if (!group.session) {
      // Guardar o cookie de região e largar a sessão
      await send("Network.deleteCookies", { name: "do_session", url: BASE });
    }
    routeCount.n += group.routes.length;
    for (const width of WIDTHS) {
      const height = width < 768 ? 812 : 900;
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 768 });
      for (const route of group.routes) {
        await go(route);
        const finalUrl = await js("return location.pathname + location.search");
        const res = await send("Runtime.evaluate", { expression: AUDIT, returnByValue: true });
        const problems = res.result?.result?.value ?? ["script de verificação falhou: " + JSON.stringify(res.result?.exceptionDetails?.exception?.description ?? "").slice(0, 200)];
        const bar = (await send("Runtime.evaluate", { expression: BOTTOM_BAR, returnByValue: true, awaitPromise: true })).result?.result?.value ?? [];
        problems.push(...bar);
        let shot = null;
        if (SHOTS) {
          const metrics = await send("Page.getLayoutMetrics");
          const h = Math.min(Math.ceil(metrics.result.cssContentSize.height), 12000);
          const s = await send("Page.captureScreenshot", { format: "jpeg", quality: 60, captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: h, scale: 1 } });
          shot = `${region}-${width}-${route === "/" ? "home" : route.slice(1).replace(/[/?=&:]+/g, "_").slice(0, 80)}.jpg`;
          writeFileSync(path.join(SHOTS, shot), Buffer.from(s.result.data, "base64"));
        }
        report.push({ region, width, route, finalUrl, problems, shot });
        for (const p of problems) {
          failures++;
          console.log(`FAIL ${region} ${width}px ${route}: ${p}`);
        }
      }
    }
  }
}

if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(report, null, 2));
ws.close();
chrome.kill();
try {
  rmSync(profile, { recursive: true, force: true });
} catch {
  /* perfil ainda preso pelo browser a fechar */
}
const pages = routeCount.n;
console.log(
  failures
    ? `\n${failures} problema(s) de layout em ${pages} páginas x ${WIDTHS.length} larguras.`
    : `Layout QA: ${pages} páginas x ${WIDTHS.length} larguras, sem problemas.`,
);
process.exit(failures ? 1 : 0);
