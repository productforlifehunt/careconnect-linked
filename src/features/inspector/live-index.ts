/**
 * Live source analysis for the read/write inspector. Every call re-reads the
 * current source files (no stored index, no cache), so the "what this code
 * reads/writes" view always matches the code as it is right now.
 */
const LOADERS = import.meta.glob(["/src/**/*.{ts,tsx}", "!/src/routeTree.gen.ts", "!/src/integrations/wp-schema.ts", "!/src/features/inspector/**", "!/src/integrations/supabase/**", "!/src/**/*.test.{ts,tsx}"], { query: "?raw", import: "default" }) as Record<string, () => Promise<string>>;
const FILES = new Set(Object.keys(LOADERS).map((k) => k.replace(/^\/src\//, "")));

export type LiveRef = [kind: string, key: string, method: string, line: number];
export interface LiveEntry { i: string[]; r: LiveRef[] }

export async function readSource(file: string): Promise<string | null> {
  const key = `/src/${file}`;
  if (!LOADERS[key]) return null;
  if (import.meta.env.DEV) {
    // Bypass every cache: ask the dev server for the file as it is on disk now.
    try {
      const res = await fetch(`${key}?raw&t=${Date.now()}`, { cache: "no-store" });
      const js = await res.text();
      const m = js.match(/export default\s*("(?:[^"\\]|\\.)*")/s);
      if (m) return JSON.parse(m[1]!) as string;
    } catch { /* fall through */ }
  }
  return LOADERS[key]!();
}

function dirOf(f: string) { return f.includes("/") ? f.slice(0, f.lastIndexOf("/")) : ""; }
function joinPath(base: string, spec: string) {
  const parts = (base ? base.split("/") : []);
  for (const p of spec.split("/")) { if (p === "..") parts.pop(); else if (p !== ".") parts.push(p); }
  return parts.join("/");
}
export function resolveImport(from: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = spec.slice(2);
  else if (spec.startsWith(".")) base = joinPath(dirOf(from), spec);
  else return null;
  base = base.replace(/\.(ts|tsx)$/, "");
  for (const c of [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) if (FILES.has(c)) return c;
  return null;
}

const METHOD_RE = /method\s*:\s*["'`](POST|PUT|PATCH|DELETE|GET)["'`]|\b(POST|PUT|PATCH|DELETE)\b/;
function methodNear(lines: string[], i: number) {
  for (let k = i; k < Math.min(lines.length, i + 6); k++) {
    const m = lines[k]!.match(METHOD_RE);
    if (m) return m[1] || m[2]!;
    if (k > i && /;\s*$/.test(lines[k]!)) break;
  }
  return "GET";
}

export function analyse(file: string, text: string): LiveEntry {
  const lines = text.split("\n");
  const imports = new Set<string>();
  for (const m of text.matchAll(/(?:import|export)[^"'`]*?from\s*["'`]([^"'`]+)["'`]|import\(\s*["'`]([^"'`]+)["'`]\s*\)/g)) {
    const r = resolveImport(file, (m[1] || m[2])!);
    if (r && r !== file) imports.add(r);
  }
  const refs: LiveRef[] = [];
  const seen = new Set<string>();
  lines.forEach((line, i) => {
    const add = (kind: string, key: string, method: string) => { const k = `${kind}|${key}|${method}`; if (!seen.has(k)) { seen.add(k); refs.push([kind, key, method, i + 1]); } };
    for (const m of line.matchAll(/jet-rel\/(\d+)/g)) add("rel", m[1]!, methodNear(lines, i));
    for (const m of line.matchAll(/jet-rel\/\$\{\s*(?:R\.)?([A-Za-z_]\w*)\s*\}/g)) add("relConst", m[1]!, methodNear(lines, i));
    for (const m of line.matchAll(/jet-cct\/([a-z0-9_]+)/g)) add("cct", m[1]!, methodNear(lines, i));
    for (const m of line.matchAll(/\bR\.([A-Za-z_]\w*)/g)) add("relConst", m[1]!, "");
    for (const m of line.matchAll(/\bT\.([A-Za-z_]\w*)/g)) add("cctConst", m[1]!, "");
    for (const m of line.matchAll(/WP\.cct\[\s*["'](\d+)["']\s*\]/g)) add("cctId", m[1]!, "");
    for (const m of line.matchAll(/WP\.rel\[\s*["'](\d+)["']\s*\]/g)) add("rel", m[1]!, "");
    const w = line.match(/method\s*:\s*["'`](POST|PUT|PATCH|DELETE)["'`]|\b(linkRel|unlinkRel|linkOwnRow|createWordPressFeature|updateWordPressFeature|deleteWordPressFeature)\s*\(/);
    if (w) add("write", lines.slice(Math.max(0, i - 2), i + 1).map((l) => l.trim()).join(" ").replace(/\s+/g, " ").slice(-220), (w[1] || w[2])!);
    for (const m of line.matchAll(/(wc\/v3\/[a-z_/-]+|dokan\/v\d\/[a-z_/-]+|wp\/v2\/[a-z_-]+)/g)) add("woo", m[1]!, methodNear(lines, i));
  });
  return { i: [...imports], r: refs };
}

/** Freshly reads and analyses the given files right now. */
export async function liveEntries(files: string[]): Promise<Record<string, LiveEntry>> {
  const out: Record<string, LiveEntry> = {};
  await Promise.all(files.map(async (f) => { const t = await readSource(f); if (t != null) out[f] = analyse(f, t); }));
  return out;
}
