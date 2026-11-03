/**
 * Decision-logic trace for one rendered element, read live from current source:
 *  1. the JSX expression that prints the element (its data-tsd-source line),
 *  2. where each value it prints is assigned in that file (e.g. `status:`),
 *  3. the definitions of functions those lines call, following imports,
 * with every fallback (`||`, `??`, `catch`, default branches) flagged so
 * redundant or wrong fallbacks are visible.
 */
import { readSource, resolveImport } from "./live-index";

export interface LogicStep {
  file: string;
  line: number;           // first line shown
  title: string;
  code: string[];
  fallbacks: number[];    // indexes into code[] that contain a fallback
  via?: string[];         // files the definition was re-exported through (their call frames name the same code)
}

const FALLBACK = /\|\||\?\?|\bcatch\b|\bdefault\s*:|\?[^:?]+:\s*(?:null|undefined|""|''|\[\]|\{\}|0|false|["'`][^"'`]*["'`])\s*[,;)}]?\s*$/;
const GENERIC = new Set(["data", "isLoading", "error", "props", "value", "item", "items", "result", "res", "row", "rows"]);
const KEYWORDS = new Set(["if", "for", "while", "switch", "return", "typeof", "new", "await", "function", "catch", "map", "filter", "forEach", "find", "some", "every", "reduce", "push", "includes", "slice", "split", "join", "replace", "String", "Number", "Boolean", "parseInt", "parseFloat", "JSON", "Object", "Array", "Math", "Date", "Promise", "useMemo", "useState", "useEffect", "useCallback", "t", "cn"]);

function block(lines: string[], start: number, max = 30): { from: number; code: string[] } {
  // From `start`, take lines until brackets balance (a full statement / function), capped.
  let depth = 0; const code: string[] = [];
  for (let i = start; i < lines.length && code.length < max; i++) {
    const l = lines[i]!; code.push(l);
    for (const ch of l) { if (ch === "{" || ch === "(" || ch === "[") depth++; else if (ch === "}" || ch === ")" || ch === "]") depth--; }
    if (depth <= 0 && i > start && /[;,)}]\s*$/.test(l)) break;
    if (depth <= 0 && i === start && /[;,]\s*$/.test(l)) break;
  }
  return { from: start, code };
}

function step(file: string, from: number, title: string, code: string[]): LogicStep {
  return { file, line: from + 1, title, code, fallbacks: code.map((l, i) => (FALLBACK.test(l) ? i : -1)).filter((i) => i >= 0) };
}

function importsOf(file: string, text: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const m of text.matchAll(/import\s*\{([^}]+)\}\s*from\s*["'`]([^"'`]+)["'`]/g)) {
    const target = resolveImport(file, m[2]!);
    if (!target) continue;
    for (const part of m[1]!.split(",")) { const name = part.trim().split(/\s+as\s+/).pop()!.replace(/^type\s+/, ""); if (name) map.set(name, target); }
  }
  // Lazily loaded code: (await import("@/x")).fn(…) and const { fn } = await import("@/x").
  for (const m of text.matchAll(/import\(\s*["'`]([^"'`]+)["'`]\s*\)\s*\)?\s*\.\s*([A-Za-z_$][\w$]*)/g)) {
    const target = resolveImport(file, m[1]!); if (target && !map.has(m[2]!)) map.set(m[2]!, target);
  }
  for (const m of text.matchAll(/(?:const|let)\s*\{([^}]+)\}\s*=\s*await\s+import\(\s*["'`]([^"'`]+)["'`]\s*\)/g)) {
    const target = resolveImport(file, m[2]!); if (!target) continue;
    for (const part of m[1]!.split(",")) { const name = part.trim().split(/\s*:\s*/).pop()!; if (name && !map.has(name)) map.set(name, target); }
  }
  return map;
}

function findDefinition(lines: string[], name: string): number {
  const re = new RegExp(`(?:function\\s+${name}\\b|(?:const|let|var)\\s+(?:\\{[^}=]*[\\s{,:]|\\[[^\\]=]*[\\s\\[,])?${name}\\b[^=]*=(?!=)|^\\s*${name}\\s*\\([^)]*\\)\\s*\\{)`);
  return lines.findIndex((l) => re.test(l));
}

const squash = (x: string) => x.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, "");

/** In an item list (`[{ label: t("dashboard.pendingTasks"), value: … }]`) pick the item whose label is the text beside the clicked value. */
function focusLines(hits: number[], lines: string[], shown: string, card: string): number[] {
  const rest = card.replace(shown, " ").replace(/\s+/g, " ").trim();
  const phrases = [rest, ...rest.split(/[\s·|/]+/)].map(squash).filter((w) => w.length > 2 && !/^\d+$/.test(w));
  const words = shown.split(/\s+/).map(squash).filter((w) => w.length > 2 && !/^\d+$/.test(w));
  const whole = [squash(shown)].filter((w) => w.length > 2 && !/^\d+$/.test(w));
  for (const [n, set] of [whole, phrases.slice(0, 1), phrases.slice(1), words].entries()) {
    if (!set.length) continue;
    const f = hits.filter((i) => { const t = squash(expandLine(lines, i)); return set.some((w) => t.includes(w)); });
    // Single loose words ("care") only count when they pick out exactly one line.
    if (f.length && (n < 2 || f.length === 1)) return f;
  }
  return [];
}

/** `n` is defined in the clicked component before the shown line, or at file top level (not inside some other function). */
function inScopeDef(lines: string[], n: string, from: number, at: number, self: number): boolean {
  const re = new RegExp(`(?:const|let|var)\\s+(?:\\{[^}=]*[\\s{,:]|\\[[^\\]=]*[\\s\\[,])?${n}\\b[^=]*=(?!=)|function\\s+${n}\\b`);
  return lines.some((l, i) => i !== self && re.test(l) && ((i >= from && i < at) || /^(export\s+)?(const|let|function|async)/.test(l)));
}

/** A line plus the definitions of the local labels it uses (label: careGroupsLabel → const careGroupsLabel = … "Care Teams"). */
function expandLine(lines: string[], i: number): string {
  let out = lines[i]!;
  for (const id of lines[i]!.matchAll(/(?<![.\w$])([a-z_$][\w$]*(?:Label|Text|Title|Name))\b/g)) { const d = findDefinition(lines, id[1]!); if (d >= 0 && d !== i) out += " " + lines.slice(d, d + 3).join(" "); }
  return out;
}

/** Identifiers in the expression given to `key:` on one line (`value: loading ? "—" : myPendingTasks.length`). */
function exprIds(line: string, key: string): string[] {
  const m = line.match(new RegExp(`\\b${key}\\s*:\\s*(.+?)(?:,\\s*\\w+\\s*:|\\s*\\}\\s*[,\\]]?|$)`));
  if (!m) return [];
  return [...m[1]!.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, "").matchAll(/(?<![.\w$])([a-z_$][\w$]*)\b/g)].map((x) => x[1]!).filter((n) => !KEYWORDS.has(n) && n.length > 2);
}

/** `isDone ? "line-through opacity-60" : "text-foreground"`: a style choice, not shown data. */
function isCssOnly(e: string): boolean {
  // Comparison operands (t.key === "alerts") are conditions, not shown text.
  e = e.replace(/[!=]==?\s*(["'`])(?:\\.|(?!\1).)*\1/g, "");
  const strs = [...e.matchAll(/(["'`])((?:\\.|(?!\1).)*)\1/g)].map((x) => x[2]!);
  return strs.length > 0 && strs.every((x) => /^[a-z0-9:/\-[\]. ]*$/.test(x) && /-/.test(x));
}

/** Fixed bilingual wording (Z("签到", "Check-In"), isCN ? "讨论" : "Discussion", site.navLabels.x): not data. */
function isStaticLabel(e: string): boolean {
  const rest = e.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, "").replace(/\b(?:Z|t)\s*\(/g, "(").replace(/\bas any\b/g, "");
  return [...rest.matchAll(/[A-Za-z_$][\w$.]*/g)].every((m) => /^(isCN|isZh|isChinese|zh|i18n(\.language)?|site(\.[\w$]+)*|defaultValue|startsWith)$/.test(m[0]));
}

/** The expression that decides a computed value, for showing "this number is X.length". */
export function decidingExpression(steps: LogicStep[], shownText = ""): string | null {
  for (const st of steps) {
    const m = st.code.join(" ").match(/\bvalue\s*:\s*(.+?)(?:,\s*\w+\s*:|\s*\}\s*[,\]]|$)/);
    if (m && /“value”/.test(st.title)) return m[1]!.trim();
  }
  // Otherwise the JSX expressions on the rendering line itself ({caredOneTasks.length} {t("…")}).
  // Children expressions only: attribute values (aria-pressed={isActive}, onClick={…}) are not what is shown.
  // Template interpolations (${…}) only occur inside attribute strings (multi-line className={`…`}).
  const strip = (l: string) => (l.includes("{`") ? l : l.replace(/\$\{[^{}]*\}/g, "")).replace(/[\w-]+=\{`[^`]*`\}/g, "").replace(/[\w-]+=\{[^{}]*\}/g, "");
  const render = strip((steps[0]?.code || []).map(strip).find((l) => /\{[^{}]*[A-Za-z_$][^{}]*\}/.test(l)) || "");
  // A wording/name element nested next to a count badge on one line ({card.title}{x && <Badge>{count}</Badge>}):
  // when the shown text has no number, the nested element's expressions are not what is shown.
  let shownLine = render;
  if (shownText && !/\d|—/.test(shownText)) {
    shownLine = shownLine.replace(/^[^<]*<[\w.]+(?:[^>]|=>)*>/, "");
    // Only nested count badges are dropped; a nested name/label element may be exactly what is shown.
    for (let k = 0; k < 4; k++) shownLine = shownLine.replace(/<([A-Za-z][\w.]*)\b[^<>]*>([^<>]*)<\/\1>/g, (all, _tag, inner: string) => (/length|count|Count|total|badge|"—"/.test(inner) ? "" : inner));
    shownLine = shownLine.replace(/\{[^{}]*&&\s*\}/g, "");
  }
  const exprs = [...shownLine.matchAll(/\{([^{}]+)\}/g)].map((x) => x[1]!.trim()).filter((e) => !/^`|className|^\s*$|=>|^defaultValue/.test(e) && !isCssOnly(e) && !isStaticLabel(e) && /[A-Za-z_$][\w$]*/.test(e.replace(/\bt\([^()]*\)/g, "").replace(/(["'`])(?:\\.|(?!\1).)*\1/g, "")));
  return exprs.length ? exprs.join("  ·  ").slice(0, 400) : null;
}

export async function traceLogic(source: string, maxSteps = 30, parents: string[] = [], shownText = "", childName = "", cardText = "", itemIndex = -1): Promise<LogicStep[]> {
  const [file, lineStr] = source.split(":");
  const text = file ? await readSource(file) : null;
  if (!file || !text) return [];
  const lines = text.split("\n");
  const at = Math.max(0, Number(lineStr || 1) - 1);
  const steps: LogicStep[] = [];
  const seen = new Set<string>();

  // 1. The rendering expression (a few lines from the tag).
  const render = lines.slice(at, at + 4);
  steps.push(step(file, at, "显示这段内容的代码 / Code that renders it", render));
  // Style-only expressions (className={`… ${isDone ? "line-through" : ""}`}) do not decide what is shown.
  const renderText = render.join(" ").replace(/className=\{`[^`]*`\}/g, "").replace(/className=\{[^{}]*\}/g, "");

  // 2. Values printed: `{a.b.c}` → property `c`, plain `{x}` → variable `x`.
  const props = new Set<string>();
  for (const m of renderText.matchAll(/\{([^{}]+)\}/g)) {
    for (const id of m[1]!.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, "").replace(/(^|[{,])\s*[A-Za-z_$][\w$]*\s*:(?!:)/g, "$1").matchAll(/(?:\.|\b)([A-Za-z_$][\w$]*)\b(?!\s*\()/g)) if (!KEYWORDS.has(id[1]!) && id[1]!.length > 1) props.add(id[1]!);
  }
  // `{p.title}` inside `list.map((p) => …)`: the value comes from `list`, so trace the list, not every `title:`.
  const above = lines.slice(Math.max(0, at - 40), at + 1).join("\n");
  for (const m of above.matchAll(/([A-Za-z_$][\w$]*)\s*(?:\|\|\s*\[\]\s*)?\)?(?:\.\w+\([^()]*\))*\.map\(\s*\(?\s*([A-Za-z_$][\w$]*)/g)) {
    const [, list, param] = m;
    if (new RegExp(`\\b${param}\\.`).test(renderText)) {
      for (const id of renderText.matchAll(new RegExp(`\\b${param}\\??\\.([A-Za-z_$][\\w$]*)`, "g"))) props.delete(id[1]!);
      props.delete(param!); props.add(list!);
    }
  }
  for (const x of ["className", "variant", "size", "style", "key", "type"]) props.delete(x);
  const calls = new Set<string>();
  const queue = [...props];
  const done = new Set<string>();
  // The component that renders the clicked line, and the props it receives (function MedRow({ med, slot })).
  let comp: { name: string; params: string[] } | null = null; let compStart = 0;
  for (let i = at; i >= Math.max(0, at - 400); i--) {
    const m = lines[i]!.match(/(?:function\s+([A-Z]\w*)\s*\(|const\s+([A-Z]\w*)\s*=\s*(?:\w+\()?\()\s*\{([^}]*)\}?/);
    if (m) { compStart = i; comp = { name: (m[1] || m[2])!, params: (m[3] || "").split(",").map((x) => x.trim().split(/[:=\s]/)[0]!).filter(Boolean) }; break; }
  }
  // `{med.name}` where `med` is this component's prop: the row comes in through `med`, so `name:` elsewhere is unrelated.
  if (comp) for (const m of renderText.matchAll(/\b([A-Za-z_$][\w$]*)\??\.([A-Za-z_$][\w$]*)/g)) if (comp.params.includes(m[1]!) && m[2] !== m[1]) { const i = queue.indexOf(m[2]!); if (i >= 0) queue.splice(i, 1); }
  // Leave room for the called data functions (hooks → sources), which say where rows are read.
  const localBudget = Math.max(8, maxSteps - 20);
  while (queue.length && steps.length < localBudget) {
    const p = queue.shift()!;
    if (done.has(p)) continue; done.add(p);
    // A prop of a component defined in this same file: follow it to the line that hands it over (<MedRow med={med} />), then to that list.
    if (comp && comp.params.includes(p)) {
      const uses = lines.map((_, i) => i).filter((i) => i !== at && lines[i]!.includes(`<${comp!.name}`) && new RegExp(`\\b${p}=\\{`).test(lines.slice(i, i + 8).join(" "))).slice(0, 3);
      for (const use of uses) {
        const key = `${file}:${use}`;
        if (!seen.has(key)) { seen.add(key); steps.push(step(file, use, `本文件里把“${p}”传给 ${comp.name} / “${p}” handed to ${comp.name}`, lines.slice(Math.max(0, use - 1), use + 3))); }
        const handed = lines.slice(use, use + 8).join(" ").match(new RegExp(`\\b${p}=\\{\\s*([A-Za-z_$][\\w$]*)`));
        const near = lines.slice(Math.max(0, use - 12), use + 1).join("\n");
        const loop = handed && [...near.matchAll(/([A-Za-z_$][\w$]*)\s*(?:\|\|\s*\[\]\s*)?\)?(?:\.\w+\([^()]*\))*\??\.map\(\s*\(?\s*(\{[^}]*\}|[A-Za-z_$][\w$]*)/g)].reverse().find((x) => new RegExp(`\\b${handed[1]}\\b`).test(x[2]!));
        if (loop && !done.has(loop[1]!)) queue.unshift(loop[1]!);
        else if (handed && handed[1] !== p && !done.has(handed[1]!)) queue.unshift(handed[1]!);
      }
      if (uses.length) continue;
    }
    const re = new RegExp(`(?:(?<![-\\w.])${p}\\s*:(?!:)|(?:const|let|var)\\s+(?:\\{[^}]*\\b)?${p}\\b[^=]*=|(?<![-\\w.])${p}\\s*=[^=>])`);
    let hits = lines.map((l, i) => i).filter((i) => i !== at && re.test(lines[i]!));
    // A variable: use its own definition in this component (nearest above the shown line), not every `name:` key in the file.
    const defRe = new RegExp(`(?:const|let|var)\\s+(?:\\{[^}=]*[\\s{,:]|\\[[^\\]=]*[\\s\\[,])?${p}\\b[^=]*=(?!=)|function\\s+${p}\\b`);
    const defs = hits.filter((i) => defRe.test(lines[i]!));
    if (defs.length) { const inScope = defs.filter((i) => i >= compStart && i < at); const top = defs.filter((i) => /^(export\s+)?(const|let|function|async)/.test(lines[i]!)); hits = inScope.length ? [inScope[inScope.length - 1]!] : top.length ? [top[0]!] : [defs[0]!]; }
    // A list of items (`[{ label: … }, …].map`): keep only the item that shows the clicked text.
    // Items of one array literal ([{ label, value }, …].map) sit on consecutive lines: the clicked item's position picks its line.
    const run = hits.filter((i) => i > at - 40 && i < at && /^\s*(?:\.\.\.\(.*\[)?\{\s*\w+\s*:/.test(lines[i]!));
    const byIndex = itemIndex >= 0 && run.length > itemIndex && run.every((i, k) => k === 0 || i - run[k - 1]! <= 2) ? [run[itemIndex]!] : [];
    const focused = byIndex.length ? byIndex : focusLines(hits, lines, shownText, cardText);
    const use = new Set(focused.length ? focused : hits);
    lines.forEach((l, i) => {
      if (steps.length >= maxSteps || !use.has(i)) return;
      const key = `${file}:${i}`; if (seen.has(key)) return; seen.add(key);
      // A list built in a useMemo / function body is read whole: every source that pushes into it matters.
      const b = block(lines, i, /useMemo\(|useCallback\(|=>\s*\{\s*$|function\b/.test(lines[i]!) ? 90 : 12);
      steps.push(step(file, b.from, `“${p}” 在这里被赋值 / “${p}” is decided here`, b.code));
      const joined = b.code.join(" ");
      for (const c of joined.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) if (!KEYWORDS.has(c[1]!)) calls.add(c[1]!);
      // A value assigned from another local variable (status: medStatus) is traced too.
      const rhs = joined.match(new RegExp(`\\b${p}\\s*[:=]\\s*([A-Za-z_$][\\w$]*)\\s*[,;]`));
      if (rhs && !KEYWORDS.has(rhs[1]!) && !done.has(rhs[1]!)) queue.push(rhs[1]!);
      // Item rows: every `key: variable` on the chosen item line is traced (value: pendingTasksCount).
      if (focused.length) for (const id of exprIds(l, p)) if (!done.has(id)) queue.push(id);
      // Local values the decision uses (const tasks = …, myPendingTasks = tasks.filter(…)) are traced to where they are made.
      for (const id of joined.matchAll(/(?<![.\w$])([a-z_$][\w$]*)\b/g)) { const n = id[1]!; if (n !== p && !KEYWORDS.has(n) && !GENERIC.has(n) && !done.has(n) && n.length > 2 && inScopeDef(lines, n, compStart, at, i)) queue.push(n); }
    });
  }

  let frontier: Array<{ name: string; file: string; text: string }> = [...calls].map((name) => ({ name, file, text }));

  // 2b. Values handed in as props: follow them into the parent component that passes them (`name={expr}`).
  const parentFiles = [...new Set(parents.map((x) => x.split(":")[0]!).filter((f) => f && f !== file && !/^(components\/layout\/|routes\/__root|components\/ui\/)/.test(f)))];
  for (const pf of parentFiles.slice(0, 3)) {
    const pt = await readSource(pf); if (!pt) continue;
    const pl = pt.split("\n");
    const pending = [...done]; const pdone = new Set<string>();
    while (pending.length && steps.length < maxSteps) {
      const name = pending.shift()!; if (pdone.has(name) || GENERIC.has(name)) continue;
      const first = pdone.size === 0 || done.has(name); pdone.add(name);
      // Props are matched only where the parent hands them to the clicked component; later names only by their definition.
      const re = first ? new RegExp(`\\b${name}=\\{([^}]*)\\}|(?:const|let)\\s+(?:\\{[^}]*\\b)?${name}\\b[^=]*=`) : new RegExp(`(?:const|let)\\s+(?:\\{[^}]*\\b)?${name}\\b[^=]*=`);
      let handed = false;
      pl.forEach((l, i) => {
        const m = l.match(re); if (!m || steps.length >= maxSteps) return;
        if (m[1] != null && (handed || (childName && !l.includes(`<${childName}`)))) return;
        if (m[1] != null) handed = true;
        const key = `${pf}:${i}`; if (seen.has(key)) return; seen.add(key);
        const code = m[1] != null ? [l.trim().slice(Math.max(0, l.trim().indexOf(`${name}=`) - 10), l.trim().indexOf(`${name}=`) + name.length + m[1].length + 40)] : block(pl, i, 12).code;
        steps.push(step(pf, i, m[1] != null ? `父组件传入“${name}” / parent passes “${name}”` : `“${name}” 在父组件这里被算出 / computed in parent`, code));
        const expr = m[1] ?? code.join(" ");
        for (const id of expr.matchAll(/\b([A-Za-z_$][\w$]*)\b/g)) if (!KEYWORDS.has(id[1]!) && id[1]!.length > 2 && !pdone.has(id[1]!)) pending.push(id[1]!);
        for (const c of expr.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) if (!KEYWORDS.has(c[1]!)) frontier.push({ name: c[1]!, file: pf, text: pt });
      });
    }
  }

  // 3. Functions those decisions call — same file first, then imported files (one hop each, twice).
  for (let hop = 0; hop < 3 && frontier.length && steps.length < maxSteps; hop++) {
    const next: typeof frontier = [];
    for (const { name, file: f, text: t } of frontier) {
      if (steps.length >= maxSteps) break;
      let defFile = f; let defText: string | null = t; const via: string[] = [];
      let ls = defText.split("\n"); let idx = findDefinition(ls, name);
      if (idx < 0) {
        let target = importsOf(f, t).get(name);
        // Follow re-exports (export { name } from "…" / export * from "…") up to three files deep.
        for (let hopRe = 0; target && hopRe < 4; hopRe++) {
          if (hopRe > 0) via.push(defFile);
          defFile = target; defText = await readSource(target);
          if (!defText) break;
          ls = defText.split("\n"); idx = findDefinition(ls, name);
          if (idx >= 0) break;
          const re = [...defText.matchAll(/export\s*\{([^}]+)\}\s*from\s*["'`]([^"'`]+)["'`]/g)].find((m) => m[1]!.split(",").some((x) => x.trim().split(/\s+as\s+/).pop() === name));
          const star = [...defText.matchAll(/export\s*\*\s*from\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1]!);
          target = re ? resolveImport(defFile, re[2]!) ?? undefined : star.length ? resolveImport(defFile, star[0]!) ?? undefined : undefined;
        }
        if (!defText || idx < 0) continue;
      }
      const key = `${defFile}:${idx}`; if (seen.has(key)) continue; seen.add(key);
      const b = block(ls, idx, 30);
      steps.push({ ...step(defFile, b.from, `调用的判定函数 ${name}() / Called logic ${name}()`, b.code), via });
      for (const c of b.code.join(" ").matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) if (!KEYWORDS.has(c[1]!) && c[1] !== name) next.push({ name: c[1]!, file: defFile, text: defText });
      // Functions handed over without being called here (queryFn: withLastGood("bookings", fetchBookingsWordPress)).
      const imported = importsOf(defFile, defText);
      for (const c of b.code.join(" ").matchAll(/(?<![.\w$])([a-z_$][\w$]*)\b(?!\s*\()/g)) if (imported.has(c[1]!) && c[1] !== name && /^(fetch|load|get|list|read|use)/.test(c[1]!)) next.push({ name: c[1]!, file: defFile, text: defText });
    }
    frontier = next;
  }
  return steps;
}
