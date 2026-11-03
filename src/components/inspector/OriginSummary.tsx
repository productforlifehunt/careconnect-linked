/**
 * Plain-language summary of where a shown value really comes from:
 * the field it was read from, the CCT/REL reads (with their filters and row counts),
 * the calculation and the conditions the decision logic applies. Built only from
 * what was recorded and the live code trace — nothing is guessed from field codes.
 */
import type { RecordedRequest } from "@/features/inspector/recorder";
import { decodeEndpoint, fieldName, optionName } from "@/features/inspector/decode";
import type { FieldMatch } from "@/features/inspector/inspect-dom";
import type { LogicStep } from "@/features/inspector/logic-trace";
import { traceRow } from "@/features/inspector/provenance";

type Def = { f?: Record<string, string>; opt?: Record<string, Record<string, string>> };

const COND = /\.filter\(|\.find\(|\.some\(|\.every\(|===|!==|>=|<=|\s[<>]\s|\bif\s*\(|\?\s*[^:]+:/;

function annotate(code: string, defs: Def[]): string {
  return code.replace(/(["'`.])([a-z]{1,2}\d{1,3})\b/g, (all, pre: string, c: string) => {
    for (const d of defs) { const n = fieldName(d, c); if (n) return `${pre}${c}（${n}）`; }
    return all;
  });
}

function filterText(r: RecordedRequest, def: Def | undefined): string {
  const p = r.params as Record<string, unknown> | undefined;
  if (!p || !Object.keys(p).length) return "";
  return Object.entries(p).map(([k, v]) => {
    const code = k.replace(/^.*\[|\]$/g, "");
    const n = fieldName(def, code); const o = optionName(def, code, v);
    return `${k}${n ? `（${n}）` : ""} = ${String(v)}${o ? `（即 ${o}）` : ""}`;
  }).join("，");
}

/** Follow how each name in the shown expression is defined in the traced code, step by step. */
function derivation(expr: string, logic: LogicStep[], defs: Def[]): string[] {
  const out: string[] = []; const done = new Set<string>();
  const queue = [...new Set(expr.match(/[A-Za-z_$][\w$]*/g) || [])];
  while (queue.length && out.length < 12) {
    const name = queue.shift()!; if (done.has(name) || /^(isCN|isZh|length|true|false|null|undefined|String|Number|Math)$/.test(name)) continue; done.add(name);
    const re = new RegExp(`(?:const|let|var)\\s+(?:\\{[^}]*\\b${name}\\b[^}]*\\}|\\[[^\\]]*\\b${name}\\b[^\\]]*\\]|${name})\\s*(?::[^=]+)?=\\s*(.*)$|^\\s*${name}\\s*:\\s*(.+)$`);
    for (const st of logic) {
      const j = st.code.findIndex((l) => re.test(l)); if (j < 0) continue;
      // Take the whole statement (until brackets balance) so filters/conditions are included.
      let depth = 0; const body: string[] = [];
      for (let k = j; k < st.code.length && body.length < 14; k++) { const l = st.code[k]!; body.push(l.trim()); for (const c of l) { if ("({[".includes(c)) depth++; else if (")}]".includes(c)) depth--; } if (depth <= 0 && /[;,)}]\s*$|[^=]$/.test(l) && !/[=(,{[]\s*$/.test(l)) break; }
      const text = body.join(" ").replace(/\s+/g, " ");
      out.push(`${name}：${annotate(text, defs).slice(0, 400)}  （${st.file}:${st.line + j}）`);
      const rhs = text.replace(/^.*?=/, "");
      for (const id of rhs.match(/[A-Za-z_$][\w$]*/g) || []) if (!done.has(id) && id.length > 2) queue.push(id);
      break;
    }
  }
  return out;
}

export function OriginSummary({ text, matches, reads, pageRequests, path, logic, expr, account }: {
  text: string; matches: FieldMatch[]; reads: RecordedRequest[]; pageRequests: RecordedRequest[]; path: string;
  logic: LogicStep[] | null; expr: string | null; account: string[];
}) {
  const lines: string[] = [];
  const shown = `「${text.slice(0, 40)}」`;
  for (const m of matches.slice(0, 6)) {
    const chain = traceRow(m.row, m.request, pageRequests, path).map((s) => s.text).join(" → ");
    lines.push(`显示的${shown}直接读自 ${m.target.label} 第 #${m.row} 行的 ${m.field} 列${m.fieldName ? `（${m.fieldName}）` : ""}，存的值是 “${m.value}”${m.option ? `，按字典即「${m.option}」` : ""}。${chain ? `这一行是这样找到的：${chain}。` : ""}`);
  }
  if (!matches.length && account.length) lines.push(`显示的${shown}来自登录时 WordPress 返回的账号信息：${account.join("，")}。`);
  if (!matches.length && expr) lines.push(`显示的${shown}不是存出来的，而是代码算出来的：${shown} = ${expr}${/\.length\b/.test(expr) ? "，也就是下面这些读取结果经过条件筛选后剩下的条数" : ""}。`);

  // Reads, in order, de-duplicated.
  const seen = new Map<string, { r: RecordedRequest; n: number; rows: number }>();
  for (const r of reads) {
    const t = decodeEndpoint(r.method, r.endpoint); const k = t.key + t.action + JSON.stringify(r.params || {});
    const rows = Array.isArray(r.rows) ? r.rows.length : r.rows ? 1 : 0;
    const e = seen.get(k); if (e) { e.n++; e.rows += rows; } else seen.set(k, { r, n: 1, rows });
  }
  const defs: Def[] = [];
  const readLines = [...seen.values()].map(({ r, n, rows }, i) => {
    const t = decodeEndpoint(r.method, r.endpoint); const def = (t.cct || t.rel) as Def | undefined; if (def) defs.push(def);
    const f = filterText(r, def);
    const times = n > 1 ? `（读了 ${n} 次）` : "";
    if (t.kind === "rel") return `${i + 1}. 经 JetEngine 关联 ${t.label} 查关联对象${f ? `，条件 ${f}` : ""}，得到 ${rows} 条${times}`;
    if (t.kind === "cct") return `${i + 1}. 读取 ${t.label}${f ? `，条件 ${f}` : "，不带筛选条件"}，返回 ${rows} 行${times}`;
    return `${i + 1}. ${t.action} ${t.label}${f ? `，条件 ${f}` : ""}，返回 ${rows} 条${times}`;
  });

  const steps = !matches.length && expr && logic ? derivation(expr, logic, defs) : [];
  // Conditions the decision logic applies (real code lines, field codes named from the dictionary).
  const conds: string[] = []; const falls: string[] = [];
  for (const st of logic || []) st.code.forEach((l, j) => {
    const s = l.trim(); if (!s || s.startsWith("//") || s.startsWith("*")) return;
    const a = `${annotate(s, defs).slice(0, 160)}  （${st.file}:${st.line + j}）`;
    if (st.fallbacks.includes(j)) { if (!falls.includes(a)) falls.push(a); } else if (COND.test(s) && !/className|class=|\b(isCN|isZh)\s*\?|label\s*:/.test(s) && !conds.includes(a)) conds.push(a);
  });

  if (!lines.length && !readLines.length && !conds.length) {
    return <p className="text-xs text-muted-foreground">{logic ? "这段是界面固定文字（双语文案或配置），没有读取任何数据，也没有计算。" : "正在现场读取代码… / Reading live code…"}</p>;
  }
  return (
    <div className="space-y-2 rounded border border-primary/40 bg-primary/5 p-2 text-xs leading-relaxed">
      {lines.map((l, i) => <p key={i}>{l}</p>)}
      {readLines.length > 0 && <div><div className="font-medium">数据从哪读（当前登录用户起，按顺序）：</div>{readLines.map((l) => <div key={l}>{l}</div>)}</div>}
      {!readLines.length && (matches.length || expr) ? <div className="text-muted-foreground">本页没有记录到这个元素代码的读取（可能数据在别页已读好或还没加载）。</div> : null}
      {steps.length > 0 && <div><div className="font-medium">计算过程（逐个变量往上追，现场代码原文）：</div>{steps.map((c, i) => <div key={c} className="break-all font-mono text-[10px]">{i + 1}. {c}</div>)}</div>}
      {conds.length > 0 && <div><div className="font-medium">判定/筛选条件（现场代码原文，列名按数据字典标注）：</div>{conds.slice(0, 14).map((c) => <div key={c} className="break-all font-mono text-[10px]">• {c}</div>)}</div>}
      {falls.length > 0 && <div><div className="font-medium text-destructive">兜底/默认值（读不到或为空时改用的值）：</div>{falls.slice(0, 8).map((c) => <div key={c} className="break-all font-mono text-[10px]">• {c}</div>)}</div>}
    </div>
  );
}
