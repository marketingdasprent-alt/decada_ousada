#!/usr/bin/env node
// Web Blueprint QA audit, adapted for Next.js (see DECISIONS.md: SEO checks
// read src/app, <h1> check reads src/app/**/page.tsx, side-effect imports count).
// Static QA audit: automates the parts of docs/qa.md, docs/content-style.md,
// docs/anti-ai.md and docs/accessibility.md that can be checked without a
// browser. It complements, not replaces, the manual checklist in docs/qa.md.
// Usage: npm run qa

import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "src");
const DOCS_DIR = path.join(ROOT, "docs");
const PACKAGE_JSON = path.join(ROOT, "package.json");
const TOKENS_CSS = path.join(SRC_DIR, "styles", "tokens.css");

const IGNORE_DIRS = new Set(["node_modules", "dist", ".git", ".vite", ".next"]);
// Material de origem escrito pelo cliente: guardado tal como foi entregue, não é texto nosso
const IGNORE_FILES = new Set(["briefing-cliente.md"]);
const APP_DIR = path.join(SRC_DIR, "app");

/** @typedef {{ level: "FAIL" | "WARN", section: string, message: string, location?: string }} Finding */

/** @type {Finding[]} */
const findings = [];

function fail(section, message, location) {
  findings.push({ level: "FAIL", section, message, location });
}

function warn(section, message, location) {
  findings.push({ level: "WARN", section, message, location });
}

function walk(dir, exts) {
  if (!existsSync(dir)) return [];
  let results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name) || IGNORE_FILES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walk(full, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

function relative(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function forEachLine(file, callback) {
  const content = readFileSync(file, "utf8");
  content.split(/\r?\n/).forEach((line, index) => callback(line, index + 1));
}

// --- Content (docs/content-style.md) ---

// These two docs quote the em-dash as a literal example of what to avoid
// (a table row, a sample grep command): that is the rule's own definition,
// not a violation of it.
const EM_DASH_EXEMPT = new Set([
  path.join(DOCS_DIR, "content-style.md"),
  path.join(DOCS_DIR, "qa.md"),
]);

function checkEmDash() {
  const files = [
    ...walk(SRC_DIR, [".js", ".jsx", ".ts", ".tsx", ".css"]),
    ...walk(DOCS_DIR, [".md"]),
    ...readdirSync(ROOT)
      .filter((name) => name.endsWith(".md"))
      .map((name) => path.join(ROOT, name)),
  ].filter((file) => !EM_DASH_EXEMPT.has(file));
  for (const file of files) {
    forEachLine(file, (line, lineNumber) => {
      if (line.includes("—")) {
        fail(
          "Content",
          "Em-dash used as a clause separator (docs/content-style.md bans this outright).",
          `${relative(file)}:${lineNumber}`,
        );
      }
    });
  }
}

const BANNED_PHRASES = [
  "transforme o seu negocio",
  "transforme o seu negócio",
  "elevate your experience",
  "the future starts here",
  "discover new possibilities",
  "unlock your potential",
  "empower your business",
];

function checkBannedPhrases() {
  const files = walk(SRC_DIR, [".jsx", ".js", ".tsx", ".ts"]);
  for (const file of files) {
    forEachLine(file, (line, lineNumber) => {
      const normalized = line.toLowerCase();
      for (const phrase of BANNED_PHRASES) {
        if (normalized.includes(phrase)) {
          fail(
            "Content",
            `Generic filler copy with no real referent: "${phrase}" (docs/anti-ai.md#copy).`,
            `${relative(file)}:${lineNumber}`,
          );
        }
      }
    });
  }
}

const BUZZWORDS = [
  "seamless",
  "leverage",
  "elevate",
  "unlock",
  "empower",
  "robust",
  "cutting-edge",
  "game-changing",
  "synergy",
  "holistic",
];

function checkBuzzwordDensity() {
  const files = walk(SRC_DIR, [".jsx", ".js", ".tsx", ".ts"]);
  const found = new Set();
  for (const file of files) {
    const content = readFileSync(file, "utf8").toLowerCase();
    for (const word of BUZZWORDS) {
      if (content.includes(word)) found.add(word);
    }
  }
  if (found.size >= 3) {
    warn(
      "Content",
      `${found.size} distinct buzzwords found across copy (${[...found].join(", ")}). One is fine, several together reads as AI-generated (docs/content-style.md).`,
    );
  }
}

// --- Token discipline (BLUEPRINT.md, docs/design-system.md) ---

const HEX_COLOR = /#[0-9a-fA-F]{3,8}\b/g;

function checkArbitraryHexColors() {
  const files = walk(SRC_DIR, [".jsx", ".js", ".tsx", ".ts", ".css"]).filter(
    (file) => file !== TOKENS_CSS,
  );
  for (const file of files) {
    forEachLine(file, (line, lineNumber) => {
      const matches = line.match(HEX_COLOR);
      if (matches) {
        warn(
          "Tokens",
          `Hardcoded color ${matches.join(", ")} outside tokens.css. Components should consume semantic --color-* tokens (docs/design-system.md).`,
          `${relative(file)}:${lineNumber}`,
        );
      }
    });
  }
}

function checkArbitraryZIndex() {
  const files = walk(SRC_DIR, [".css"]);
  for (const file of files) {
    forEachLine(file, (line, lineNumber) => {
      const match = line.match(/z-index\s*:\s*([^;]+);/);
      if (match && !match[1].includes("var(--z-")) {
        warn(
          "Tokens",
          `z-index: ${match[1].trim()} does not come from a --z-* token (BLUEPRINT.md: "--z-* is the only place a z-index value should come from").`,
          `${relative(file)}:${lineNumber}`,
        );
      }
    });
  }
}

// --- Accessibility (docs/accessibility.md) ---

function checkImagesWithoutAlt() {
  const files = walk(SRC_DIR, [".jsx", ".tsx"]);
  for (const file of files) {
    forEachLine(file, (line, lineNumber) => {
      const imgTags = line.match(/<img\b[^>]*>/g);
      if (!imgTags) return;
      for (const tag of imgTags) {
        if (!/\balt\s*=/.test(tag)) {
          fail(
            "Accessibility",
            "<img> without an alt attribute.",
            `${relative(file)}:${lineNumber}`,
          );
        }
      }
    });
  }
}

function checkMultipleH1() {
  const files = walk(APP_DIR, [".tsx"]).filter((file) => path.basename(file) === "page.tsx");
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const count = (content.match(/<h1\b/g) || []).length;
    if (count > 1) {
      fail(
        "Accessibility",
        `${count} <h1> elements in one page component. One <h1> per page (docs/accessibility.md).`,
        relative(file),
      );
    }
  }
}

function checkClickableDivs() {
  const files = walk(SRC_DIR, [".jsx", ".tsx"]);
  for (const file of files) {
    forEachLine(file, (line, lineNumber) => {
      if (/<div\b[^>]*onClick/.test(line) && !/role\s*=/.test(line)) {
        warn(
          "Accessibility",
          "<div onClick> without a role: prefer a real <button>/<a>, or add role + keyboard handling (docs/accessibility.md).",
          `${relative(file)}:${lineNumber}`,
        );
      }
    });
  }
}

function checkDuplicateIds() {
  const files = walk(SRC_DIR, [".jsx", ".tsx"]);
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const ids = content.match(/\bid=["'][^"']+["']/g) || [];
    const seen = new Map();
    for (const raw of ids) {
      seen.set(raw, (seen.get(raw) || 0) + 1);
    }
    for (const [raw, count] of seen) {
      if (count > 1) {
        warn(
          "Accessibility",
          `Duplicate ${raw} appears ${count} times in the same component.`,
          relative(file),
        );
      }
    }
  }
}

// --- SEO / technical baseline (a recurring gap found when auditing projects built on this foundation) ---

function checkSeoBaseline() {
  // Next.js generates robots.txt, sitemap.xml, icons and meta tags from src/app
  if (!existsSync(path.join(APP_DIR, "robots.ts"))) fail("SEO", "No src/app/robots.ts.");
  if (!existsSync(path.join(APP_DIR, "sitemap.ts"))) warn("SEO", "No src/app/sitemap.ts.");
  const layouts = walk(APP_DIR, [".tsx"]).filter((file) => path.basename(file) === "layout.tsx");
  const rootLayout = layouts.find((file) => readFileSync(file, "utf8").includes("<html"));
  if (!rootLayout) {
    fail("SEO", "No root layout with <html> found in src/app.");
    return;
  }
  const layout = readFileSync(rootLayout, "utf8");
  if (!/description\s*:/.test(layout)) fail("SEO", "Root layout metadata has no description.", relative(rootLayout));
  if (!/icons?\s*:/.test(layout) && !walk(APP_DIR, [".ico", ".png", ".svg"]).some((f) => /\/(icon|favicon)\./.test(f.split(path.sep).join("/")))) {
    fail("SEO", "No favicon: add metadata.icons or src/app/icon.*.", relative(rootLayout));
  }
  if (!/openGraph\s*:/.test(layout)) warn("SEO", "Root layout metadata has no openGraph.", relative(rootLayout));
  if (!/lang=/.test(layout)) fail("SEO", "<html> has no lang attribute.", relative(rootLayout));
}

// --- Dependency hygiene (docs/agent-protocol.md, docs/performance.md) ---

function checkUnusedDependencies() {
  if (!existsSync(PACKAGE_JSON)) return;
  const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf8"));
  // react-dom is a framework peer of next, never imported directly
  const deps = Object.keys(pkg.dependencies || {}).filter((dep) => dep !== "react-dom");
  if (deps.length === 0) return;

  const sourceFiles = walk(SRC_DIR, [".js", ".jsx", ".ts", ".tsx"]);
  const combined = sourceFiles
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");

  for (const dep of deps) {
    const escaped = dep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Allow subpath imports (e.g. "react-dom/client") to count as usage.
    const importPattern = new RegExp(
      `from\\s+["']${escaped}(?:/[^"']*)?["']|import\\s+["']${escaped}(?:/[^"']*)?["']|require\\(["']${escaped}(?:/[^"']*)?["']\\)`,
    );
    if (!importPattern.test(combined)) {
      warn(
        "Dependencies",
        `"${dep}" is declared in package.json but never imported in src/ (docs/performance.md: "dependencies must earn their weight").`,
      );
    }
  }
}

// --- Run ---

checkEmDash();
checkBannedPhrases();
checkBuzzwordDensity();
checkArbitraryHexColors();
checkArbitraryZIndex();
checkImagesWithoutAlt();
checkMultipleH1();
checkClickableDivs();
checkDuplicateIds();
checkSeoBaseline();
checkUnusedDependencies();

const sections = [...new Set(findings.map((f) => f.section))];
const failCount = findings.filter((f) => f.level === "FAIL").length;
const warnCount = findings.filter((f) => f.level === "WARN").length;

if (findings.length === 0) {
  console.log("QA audit: no issues found.\n");
} else {
  for (const section of sections) {
    console.log(`\n${section}`);
    console.log("-".repeat(section.length));
    for (const finding of findings.filter((f) => f.section === section)) {
      const location = finding.location ? ` (${finding.location})` : "";
      console.log(`  [${finding.level}] ${finding.message}${location}`);
    }
  }
  console.log(`\n${failCount} failure(s), ${warnCount} warning(s).\n`);
}

console.log(
  "This covers only what is checkable without a browser. Still run the manual checklist in docs/qa.md (responsive breakpoints, keyboard traversal, cookie consent flow, contrast) before calling a change done.\n",
);

process.exit(failCount > 0 ? 1 : 0);
