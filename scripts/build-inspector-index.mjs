#!/usr/bin/env node
// Builds src/features/inspector/code-index.json: for every source file, the
// files it imports and every WordPress data reference written in it (CCT/REL
// endpoints, R.* relation constants, T.* CCT constants, Woo endpoints) with
// the HTTP method used nearby. The read/write inspector shows these as the
// "what this code can read/write" view, without executing any write.
// Run: node scripts/build-inspector-index.mjs
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative, resolve } from "node:path";

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), "..");
const SRC = join(ROOT, "src");
const OUT = join(SRC, "features/inspector/code-index.json");
const SKIP = [/routeTree\.gen\.ts$/, /integrations\/wp-schema\.ts$/, /features\/inspector\//, /\/test\//, /\.test\.tsx?$/, /integrations\/supabase\//];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name) && !SKIP.some((re) => re.test(p))) out.push(p);
  }
  return out;
}

function resolveImport(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = join(SRC, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(from), spec);
  else return null;
  for (const c of [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")]) {
    if (existsSync(c) && statSync(c).isFile()) return relative(SRC, c);
  }
  return null;
}

const METHOD_RE = /method\s*:\s*["'`](POST|PUT|PATCH|DELETE|GET)["'`]|\b(POST|PUT|PATCH|DELETE)\b/;
function methodNear(lines, i) {
  for (let k = i; k < Math.min(lines.length, i + 6); k++) {
    const m = lines[k].match(METHOD_RE);
    if (m) return m[1] || m[2];
    if (k > i && /;\s*$/.test(lines[k])) break;
  }
  return "GET";
}

const files = walk(SRC);
const index = {};
for (const file of files) {
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  const rel = relative(SRC, file);
  const imports = new Set();
  for (const m of text.matchAll(/(?:import|export)[^"'`]*?from\s*["'`]([^"'`]+)["'`]|import\(\s*["'`]([^"'`]+)["'`]\s*\)/g)) {
    const r = resolveImport(file, m[1] || m[2]);
    if (r && r !== rel) imports.add(r);
  }
  const refs = [];
  lines.forEach((line, i) => {
    const add = (kind, key, method) => refs.push({ kind, key, method, line: i + 1 });
    for (const m of line.matchAll(/jet-rel\/(\d+)/g)) add("rel", m[1], methodNear(lines, i));
    for (const m of line.matchAll(/jet-rel\/\$\{\s*(?:R\.)?([A-Za-z_]\w*)\s*\}/g)) add("relConst", m[1], methodNear(lines, i));
    for (const m of line.matchAll(/jet-cct\/([a-z0-9_]+)/g)) add("cct", m[1], methodNear(lines, i));
    for (const m of line.matchAll(/\bR\.([A-Za-z_]\w*)/g)) add("relConst", m[1], "");
    for (const m of line.matchAll(/\bT\.([A-Za-z_]\w*)/g)) add("cctConst", m[1], "");
    for (const m of line.matchAll(/WP\.cct\[\s*["'](\d+)["']\s*\]/g)) add("cctId", m[1], "");
    for (const m of line.matchAll(/WP\.rel\[\s*["'](\d+)["']\s*\]/g)) add("rel", m[1], "");
    const w = line.match(/method\s*:\s*["'`](POST|PUT|PATCH|DELETE)["'`]|\b(linkRel|unlinkRel|linkOwnRow|createWordPressFeature|updateWordPressFeature|deleteWordPressFeature)\s*\(/);
    if (w) {
      const start = Math.max(0, i - 2);
      const snippet = lines.slice(start, i + 1).map((l) => l.trim()).join(" ").replace(/\s+/g, " ").slice(-220);
      add("write", snippet, w[1] || w[2]);
    }
    for (const m of line.matchAll(/(wc\/v3\/[a-z_/-]+|dokan\/v\d\/[a-z_/-]+|wp\/v2\/[a-z_-]+)/g)) add("woo", m[1], methodNear(lines, i));
  });
  // De-duplicate identical kind/key/method, keep first line.
  const seen = new Set();
  const uniq = refs.filter((r) => { const k = `${r.kind}|${r.key}|${r.method}`; if (seen.has(k)) return false; seen.add(k); return true; });
  if (imports.size || uniq.length) index[rel] = { i: [...imports], r: uniq.map((r) => [r.kind, r.key, r.method, r.line]) };
}
writeFileSync(OUT, JSON.stringify(index));
console.log(`inspector index: ${Object.keys(index).length} files -> ${relative(ROOT, OUT)}`);
