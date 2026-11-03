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
const KEYWORDS = new Set(["if", "for", "while", "switch", "return", "typeof", "new", "await", "function", "catch", "map", "filter", "forEach", "find", "some", "every", "reduce", "push", "includes", "slice", "split", "join", "replace", "String", "Number", "Boolean", "parseInt", "parseFloat", "JSON", "Object", "Array", "Math", "Date", "Promise", "useMemo", "useState", "useEffect", "useCallback", "t", "cn"]);

function block(lines: string[], start: number, max = 30): { from: number; code: string[] } {
  // From `start`, take lines until brackets balance (a full statement / function), capped.
  let depth = 0; const code: string[] = [];
  for (let i = start; i < lines.length && code.length < max; i++) {
    const l = lines[i]!; code.push(l);
    for (const ch of l) { if (ch === "{" || ch === "(" || ch === "[") depth++; else if (ch === "}" || ch === ")" || ch === "]") depth--; }
    if (depth <= 0 && i > start && /[;,)}]\s*$/.test(l)) break;
    if (depth <= 0 && i === start && /;\s*$/.test(l)) break;
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
  const re = new RegExp(`(?:function\\s+${name}\\b|(?:const|let|var)\\s+${name}\\s*=|^\\s*${name}\\s*\\([^)]*\\)\\s*\\{)`);
  return lines.findIndex((l) => re.test(l));
}

export async function traceLogic(source: string, maxSteps = 24, parents: string[] = [], shownText = ""): Promise<LogicStep[]> {
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
    for (const id of m[1]!.matchAll(/(?:\.|\b)([A-Za-z_$][\w$]*)\b(?!\s*\()/g)) if (!KEYWORDS.has(id[1]!) && id[1]!.length > 1) props.add(id[1]!);
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
    const words = shownText.split(/\s+/).filter((w) => w.length > 2);
    const focused = words.length ? hits.filter((i) => words.some((w) => lines[i]!.includes(w))) : [];
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
      if (focused.length) for (const kv of l.matchAll(/\b\w+\s*:\s*([A-Za-z_$][\w$]*)\s*[,}]/g)) if (!KEYWORDS.has(kv[1]!) && !done.has(kv[1]!) && !/^[A-Z]/.test(kv[1]!)) queue.push(kv[1]!);
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
      const name = pending.shift()!; if (pdone.has(name)) continue; pdone.add(name);
      const re = new RegExp(`\\b${name}=\\{([^}]*)\\}|(?:const|let)\\s+(?:\\{[^}]*\\b)?${name}\\b[^=]*=`);
      pl.forEach((l, i) => {
        const m = l.match(re); if (!m || steps.length >= maxSteps) return;
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
  for (let hop = 0; hop < 2 && frontier.length && steps.length < maxSteps; hop++) {
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
