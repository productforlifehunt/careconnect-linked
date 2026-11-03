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

/** The expression that decides a computed value, for showing "this number is X.length". */
export function decidingExpression(steps: LogicStep[]): string | null {
  for (const st of steps) {
    const m = st.code.join(" ").match(/\bvalue\s*:\s*(.+?)(?:,\s*\w+\s*:|\s*\}\s*[,\]]|$)/);
    if (m && /“value”/.test(st.title)) return m[1]!.trim();
  }
  // Otherwise the JSX expressions on the rendering line itself ({caredOneTasks.length} {t("…")}).
  const render = (steps[0]?.code || []).find((l) => /\{[^{}]*[A-Za-z_$][^{}]*\}/.test(l.replace(/className=\{[^}]*\}/g, ""))) || "";
  const exprs = [...render.matchAll(/\{([^{}]+)\}/g)].map((x) => x[1]!.trim()).filter((e) => !/^`|className|^\s*$|=>|^defaultValue/.test(e) && /[A-Za-z_$][\w$]*/.test(e.replace(/\bt\([^()]*\)/g, "").replace(/(["'`])(?:\\.|(?!\1).)*\1/g, "")));
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
  const renderText = render.join(" ");

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
  const calls = new Set<string>();
  const queue = [...props];
  const done = new Set<string>();
  while (queue.length && steps.length < maxSteps) {
    const p = queue.shift()!;
    if (done.has(p)) continue; done.add(p);
    const re = new RegExp(`(?:(?<![-\\w.])${p}\\s*:(?!:)|(?:const|let|var)\\s+(?:\\{[^}]*\\b)?${p}\\b[^=]*=|(?<![-\\w.])${p}\\s*=[^=>])`);
    const hits = lines.map((l, i) => i).filter((i) => i !== at && re.test(lines[i]!));
    // A list of items (`[{ label: … }, …].map`): keep only the item that shows the clicked text.
    // Items of one array literal ([{ label, value }, …].map) sit on consecutive lines: the clicked item's position picks its line.
    const run = hits.filter((i) => i > at - 40 && i < at && /^\s*(?:\.\.\.\(.*\[)?\{\s*\w+\s*:/.test(lines[i]!));
    const byIndex = itemIndex >= 0 && run.length > itemIndex && run.every((i, k) => k === 0 || i - run[k - 1]! <= 2) ? [run[itemIndex]!] : [];
    const focused = byIndex.length ? byIndex : focusLines(hits, lines, shownText, cardText);
    const use = new Set(focused.length ? focused : hits);
    lines.forEach((l, i) => {
      if (steps.length >= maxSteps || !use.has(i)) return;
      const key = `${file}:${i}`; if (seen.has(key)) return; seen.add(key);
      const b = block(lines, i, 12);
      steps.push(step(file, b.from, `“${p}” 在这里被赋值 / “${p}” is decided here`, b.code));
      const joined = b.code.join(" ");
      for (const c of joined.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) if (!KEYWORDS.has(c[1]!)) calls.add(c[1]!);
      // A value assigned from another local variable (status: medStatus) is traced too.
      const rhs = joined.match(new RegExp(`\\b${p}\\s*[:=]\\s*([A-Za-z_$][\\w$]*)\\s*[,;]`));
      if (rhs && !KEYWORDS.has(rhs[1]!) && !done.has(rhs[1]!)) queue.push(rhs[1]!);
      // Item rows: every `key: variable` on the chosen item line is traced (value: pendingTasksCount).
      if (focused.length) for (const id of exprIds(l, p)) if (!done.has(id)) queue.push(id);
      // Local values the decision uses (const tasks = …, myPendingTasks = tasks.filter(…)) are traced to where they are made.
      for (const id of joined.matchAll(/(?<![.\w$])([a-z_$][\w$]*)\b/g)) { const n = id[1]!; if (n !== p && !KEYWORDS.has(n) && !GENERIC.has(n) && !done.has(n) && n.length > 2 && findDefinition(lines, n) >= 0 && findDefinition(lines, n) !== i) queue.push(n); }
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
      let defFile = f; let defText: string | null = t;
      let ls = defText.split("\n"); let idx = findDefinition(ls, name);
      if (idx < 0) {
        const target = importsOf(f, t).get(name);
        if (!target) continue;
        defFile = target; defText = await readSource(target);
        if (!defText) continue;
        ls = defText.split("\n"); idx = findDefinition(ls, name);
        if (idx < 0) continue;
      }
      const key = `${defFile}:${idx}`; if (seen.has(key)) continue; seen.add(key);
      const b = block(ls, idx, 30);
      steps.push(step(defFile, b.from, `调用的判定函数 ${name}() / Called logic ${name}()`, b.code));
      for (const c of b.code.join(" ").matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) if (!KEYWORDS.has(c[1]!) && c[1] !== name) next.push({ name: c[1]!, file: defFile, text: defText });
    }
    frontier = next;
  }
  return steps;
}
