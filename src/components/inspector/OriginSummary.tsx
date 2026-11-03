/**
 * Plain-language summary of where a shown value really comes from:
 * the field it was read from, the CCT/REL reads (with their filters and row counts),
 * the calculation and the conditions the decision logic applies. Built only from
 * what was recorded and the live code trace — nothing is guessed from field codes.
 */
import { useEffect, useState } from "react";
import { readSource } from "@/features/inspector/live-index";
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

type Src = { file: string; line: number; code: string[] };
const SKIP = /^(isCN|isZh|length|true|false|null|undefined|String|Number|Math|data|filter|map|status|const|return|number|string|boolean|any|t)$/;

/** Follow how each name in the shown expression is defined (variables, props passed by the parent, hook results), step by step. */
function derivation(expr: string, srcs: Src[], defs: Def[]): string[] {
  const out: string[] = []; const done = new Set<string>();
  const queue = [...new Set(expr.match(/[A-Za-z_$][\w$]*/g) || [])];
  while (queue.length && out.length < 14) {
    const name = queue.shift()!; if (done.has(name) || SKIP.test(name)) continue; done.add(name);
    const pats = [
      new RegExp(`(?:const|let|var)\\s+${name}\\s*(?::[^=]+)?=\\s*\\S`),
      new RegExp(`(?:const|let|var)\\s+[{[][^=]*\\b${name}\\b[^=]*[}\\]]\\s*=\\s*\\S`),
      new RegExp(`\\b${name}=\\{`),
      new RegExp(`^\\s*${name}\\s*:\\s*(?!number|string|boolean|any\\b|[A-Z]\\w*(?:\\[\\])?\\s*[;,]?$)\\S`),
    ];
    let hit = false;
    for (const pat of pats) {
      for (const st of srcs) {
        const j = st.code.findIndex((l) => pat.test(l) && !/^\s*(\/\/|\*|import\b|interface\b|type\b)/.test(l)); if (j < 0) continue;
        let text: string;
        if (pat.source.includes("=\\{")) { const l = st.code[j]!; const i = l.indexOf(`${name}={`) + name.length + 2; let d = 1, k = i; while (k < l.length && d) { if (l[k] === "{") d++; else if (l[k] === "}") d--; k++; } text = `父组件传进来：${name} = ${l.slice(i, k - 1)}`; }
        else { let depth = 0; const body: string[] = []; for (let k = j; k < st.code.length && body.length < 14; k++) { const l = st.code[k]!; body.push(l.trim()); for (const c of l) { if ("({[".includes(c)) depth++; else if (")}]".includes(c)) depth--; } if (depth <= 0) break; } text = body.join(" ").replace(/\s+/g, " "); }
        out.push(`${name}：${annotate(text, defs).slice(0, 400)}  （${st.file}:${st.line + j}）`);
        const rhs = text.includes("=") ? text.slice(text.indexOf("=") + 1) : text;
        for (const id of rhs.match(/[A-Za-z_$][\w$]*/g) || []) if (!done.has(id) && id.length > 2) queue.push(id);
        hit = true; break;
      }
      if (hit) break;
    }
  }
  return out;
}

export function OriginSummary({ text, matches, reads, pageRequests, path, logic, expr, account, files }: {
  text: string; matches: FieldMatch[]; reads: RecordedRequest[]; pageRequests: RecordedRequest[]; path: string;
  logic: LogicStep[] | null; expr: string | null; account: string[]; files?: string[];
}) {
  const [full, setFull] = useState<Src[]>([]);
  const fk = (files || []).join("|");
  useEffect(() => { let live = true; void Promise.all((files || []).slice(0, 5).map(async (f) => ({ file: f, line: 1, code: ((await readSource(f)) || "").split("\n") }))).then((r) => { if (live) setFull(r); }); return () => { live = false; }; }, [fk]);
  const lines: string[] = [];
  const shown = `「${text.slice(0, 40)}」`;
  for (const m of matches.slice(0, 6)) {
    const chain = traceRow(m.row, m.request, pageRequests, path).map((s) => s.text).join(" → ");
    lines.push(`显示的${shown}直接读自 ${m.target.label} 第 #${m.row} 行的 ${m.field} 列${m.fieldName ? `（${m.fieldName}）` : ""}，存的值是 “${m.value}”${m.option ? `，按字典即「${m.option}」` : ""}。${chain ? `这一行是这样找到的：${chain}。` : ""}`);
  }
  if (!matches.length && account.length) lines.push(`显示的${shown}来自登录时 WordPress 返回的账号信息：${account.join("，")}。`);
  if (!matches.length && expr) lines.push(`显示的${shown}不是存出来的，而是代码算出来的：${shown} = ${expr}${/\.length\b/.test(expr) ? "，也就是下面这些读取结果经过条件筛选后剩下的条数" : ""}。`);

  // Reads, in order, de-duplicated.
  const seen = new Map<string, { r: RecordedRequest; n: number; rows: number; ids: string[] }>();
  for (const r of reads) {
    const t = decodeEndpoint(r.method, r.endpoint); const k = t.key + t.action + JSON.stringify(r.params || {});
    const rows = Array.isArray(r.rows) ? r.rows.length : r.rows ? 1 : 0;
    const id = r.endpoint.match(/\/(\d+)(?:\?|$)/)?.[1];
    const e = seen.get(k); if (e) { e.n++; e.rows += rows; if (id) e.ids.push(id); } else seen.set(k, { r, n: 1, rows, ids: id ? [id] : [] });
  }
  const defs: Def[] = [];
  const readLines = [...seen.values()].map(({ r, n, rows, ids }, i) => {
    const t = decodeEndpoint(r.method, r.endpoint); const def = (t.cct || t.rel) as Def | undefined; if (def) defs.push(def);
    const f = filterText(r, def);
    const times = n > 1 ? `（读了 ${n} 次${ids.length > 1 ? `，逐行读取 #${ids.join("、#")}，每次返回 1 行` : ""}）` : "";
    if (t.kind === "cct" && ids.length > 1) return `${i + 1}. 逐行读取 ${t.label.replace(/\s*#\d+$/, "")}，共 ${ids.length} 行：#${ids.join("、#")}，每次 1 行`;
    if (t.kind === "rel") return `${i + 1}. 经 JetEngine 关联 ${t.label} 查关联对象${f ? `，条件 ${f}` : ""}，得到 ${rows} 条${times}`;
    if (t.kind === "cct") return `${i + 1}. 读取 ${t.label}${f ? `，条件 ${f}` : "，不带筛选条件"}，返回 ${rows} 行${times}`;
    return `${i + 1}. ${t.action} ${t.label}${f ? `，条件 ${f}` : ""}，返回 ${rows} 条${times}`;
  });

  const steps = !matches.length && expr && logic ? derivation(expr, [...logic, ...full], defs) : [];
  // A derivation that only reaches wording (bilingual literals, translations t("…"), site brand settings, icons) is interface text, not data.
  const STATIC_ID = /^(isCN|isZh|isChinese|zh|t|i18n|language|startsWith|useSite|useTranslation|site|const|let|var|return|defaultValue|true|false|null|undefined|key|title|subtitle|icon|label|description)$/;
  const staticWords = steps.length > 0 && steps.every((x) => {
    const body = x.replace(/^[^：]+：/, "").replace(/（[^）]*）\s*$/, "").replace(/(["'`])(?:\\.|(?!\1).)*\1/g, "").replace(/\.\s*[A-Za-z_$][\w$]*/g, "").replace(/\b[\w$]+\s*:/g, "");
    return !(body.match(/[A-Za-z_$][\w$]*/g) || []).some((id) => !STATIC_ID.test(id) && !/^[A-Z]/.test(id));
  });
  const clockOnly = !matches.length && !!expr && /new Date\(\s*\)|Date\.now\(\)/.test(expr) && !/\b(row|item|data|event|log|task|med|a\d+)\b/.test(expr);
  const noSource = !matches.length && !expr && !account.length && !!logic;
  if (staticWords) lines.splice(0, lines.length, `显示的${shown}是界面固定文字（双语文案 / 翻译词条 / 站点品牌设置），不读任何数据、不做计算。`);
  if (clockOnly) lines.splice(0, lines.length, `显示的${shown}是这台设备当前的日期/时间（浏览器时钟）：${expr}。不读任何数据。`);
  if (noSource) lines.push(`没有找到${shown}读取的数据或计算式：按当前代码它是界面固定文字或代码生成的标签（如时间刻度），下面只列出它所在位置的判定条件。`);
  if (staticWords || clockOnly || noSource) readLines.length = 0;
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
      {!readLines.length && !staticWords && !clockOnly && (matches.length || expr) ? <div className="text-muted-foreground">本页没有记录到这个元素代码的读取（可能数据在别页已读好或还没加载）。</div> : null}
      {steps.length > 0 && <div><div className="font-medium">计算过程（逐个变量往上追，现场代码原文）：</div>{steps.map((c, i) => <div key={c} className="break-all font-mono text-[10px]">{i + 1}. {c}</div>)}</div>}
      {conds.length > 0 && <div><div className="font-medium">判定/筛选条件（现场代码原文，列名按数据字典标注）：</div>{conds.slice(0, 14).map((c) => <div key={c} className="break-all font-mono text-[10px]">• {c}</div>)}</div>}
      {falls.length > 0 && <div><div className="font-medium text-destructive">兜底/默认值（读不到或为空时改用的值）：</div>{falls.slice(0, 8).map((c) => <div key={c} className="break-all font-mono text-[10px]">• {c}</div>)}</div>}
    </div>
  );
}
