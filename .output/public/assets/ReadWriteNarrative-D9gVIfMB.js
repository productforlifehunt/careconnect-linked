var e=`import type React from "react";
/**
 * Non-AI, descriptive paragraphs of what the selected element (or the whole page) really reads,
 * writes and pushes: every table/relation with its number and full dictionary name, every column
 * with code, dictionary name and field type, and every stored option decoded. Built only from
 * recorded requests and dictionary lookups — nothing is guessed.
 */
import type { RecordedRequest } from "@/features/inspector/recorder";
import { decodeEndpoint, fieldFull, optionName, type CodeRef } from "@/features/inspector/decode";
import type { FieldMatch } from "@/features/inspector/inspect-dom";

const PUSH = /notif|通知|push|message|消息|sms|wechat|jpush|notify/i;

function tableName(t: ReturnType<typeof decodeEndpoint>): string {
  if (t.cct) return \`CCT \${t.cct.id}「\${t.cct.name}」\`;
  if (t.rel) return \`REL \${t.rel.id}（\${t.rel.parent} → \${t.rel.child}，\${t.rel.type}）\`;
  return t.label;
}

function paramsText(r: RecordedRequest, t: ReturnType<typeof decodeEndpoint>): string {
  const p = r.params as Record<string, unknown> | undefined;
  if (!p || !Object.keys(p).length) return "没有附加筛选条件";
  const def = t.cct || t.rel;
  return "筛选条件是 " + Object.entries(p).map(([k, v]) => {
    const code = k.replace(/^.*\\[|\\]$/g, ""); const o = optionName(def, code, v);
    return \`\${/^[a-z]{1,2}\\d{1,3}$/.test(code) ? fieldFull(def, code) : k} = \${String(v)}\${o ? \`（即 \${o}）\` : ""}\`;
  }).join("、");
}

function bodyText(r: RecordedRequest, t: ReturnType<typeof decodeEndpoint>): string {
  const b = r.body as Record<string, unknown> | undefined;
  if (!b || typeof b !== "object") return "";
  const parts: string[] = [];
  const walk = (o: Record<string, unknown>, def: any) => {
    for (const [k, v] of Object.entries(o)) {
      if (v && typeof v === "object" && !Array.isArray(v)) { walk(v as Record<string, unknown>, k === "meta" ? t.rel : def); continue; }
      const opt = optionName(def, k, v);
      parts.push(\`\${/^[a-z]{1,2}\\d{1,3}$/.test(k) ? fieldFull(def, k) : k} 写成 \${JSON.stringify(v).slice(0, 60)}\${opt ? \`（即 \${opt}）\` : ""}\`);
    }
  };
  walk(b, t.cct || t.rel);
  return parts.length ? \`，内容是：\${parts.join("；")}\` : "";
}

function rows(r: RecordedRequest): string {
  if (r.rows === undefined) return "结果还没返回";
  const n = Array.isArray(r.rows) ? r.rows.length : r.rows ? 1 : 0;
  return n ? \`返回了 \${n} 行\` : "返回 0 行（没有数据）";
}

function requestSentences(reqs: RecordedRequest[]): { reads: string[]; writes: string[]; pushes: string[] } {
  const reads: string[] = []; const writes: string[] = []; const pushes: string[] = [];
  const seen = new Map<string, number>();
  for (const r of reqs) {
    const t = decodeEndpoint(r.method, r.endpoint);
    const k = \`\${r.method}|\${t.key}|\${JSON.stringify(r.params || {})}|\${JSON.stringify(r.body || {})}\`;
    if (seen.has(k)) { seen.set(k, seen.get(k)! + 1); continue; } seen.set(k, 1);
    const row = r.endpoint.match(/\\/(\\d+)(?:$|\\?)/)?.[1];
    const caller = r.callers?.[0] ? \`，由 \${r.callers[0]} 发起\` : "";
    if (r.method === "GET") reads.push(\`读取 \${tableName(t)}\${row && t.kind === "cct" ? \` 的第 #\${row} 行\` : ""}，\${paramsText(r, t)}，\${rows(r)}\${caller}。\`);
    else {
      const s = \`\${t.action} \${tableName(t)}\${row ? \` 第 #\${row} 行\` : ""}\${bodyText(r, t)}\${r.blocked ? "（核对模式已拦住，没有真的写进去）" : ""}\${caller}。\`;
      (PUSH.test(t.label) ? pushes : writes).push(s);
    }
  }
  return { reads, writes, pushes };
}

export function ReadWriteNarrative({ text, matches, requests, refs, handlers, scope }: {
  text?: string; matches: FieldMatch[]; requests: RecordedRequest[]; refs: CodeRef[];
  handlers?: { prop: string; owner: string }[]; scope: "element" | "page";
}) {
  const { reads, writes, pushes } = requestSentences(requests);
  const staticWrites = [...new Map(refs.filter((r) => r.kind === "write").map((r) => [r.label + r.file, r])).values()];
  const shown = matches.map((m) => {
    const t = decodeEndpoint(m.request.method, m.request.endpoint);
    const def = t.cct || t.rel;
    return \`\${tableName(t)} 第 #\${m.row} 行的 \${fieldFull(def, m.field)} 列，存的值是 “\${String(m.value).slice(0, 80)}”\${m.option ? \`，这个选项代码的意思是「\${m.option}」\` : ""}\`;
  });
  const P = ({ children }: { children: React.ReactNode }) => <p className="text-xs leading-relaxed">{children}</p>;
  return (
    <div className="space-y-2 rounded-md border border-border bg-muted/30 p-2">
      {scope === "element" && (
        <P>{shown.length
          ? <>这里显示的「{(text || "").slice(0, 60)}」来自 {shown.join("；另外也对得上 ")}。</>
          : <>这里显示的「{(text || "").slice(0, 60)}」在本页读到的数据里找不到完全相同的存储值，它可能是界面固定文字、由多行数据算出来的结果（例如计数），或者数据还没加载完。请看下面「显示的值来自」的逐步推导。</>}</P>
      )}
      <P>{reads.length ? <>{scope === "element" ? "这个元素的代码" : "这一页"}一共做了 {reads.length} 种读取：{reads.join(" ")}</> : <>{scope === "element" ? "这个元素的代码" : "这一页"}在本页没有记录到读取。</>}</P>
      <P>{writes.length ? <>实际发生的写入有：{writes.join(" ")}</> : <>本页目前没有记录到真实写入。</>}</P>
      <P>{pushes.length ? <>推送 / 通知相关的请求有：{pushes.join(" ")}</> : <>本页目前没有记录到推送或通知请求。</>}</P>
      {(handlers?.length || 0) > 0 && <P>点击这个元素会执行 {handlers!.map((h) => \`\${h.prop}（在 \${h.owner} 里）\`).join("、")}，核对模式下不会真的执行。</P>}
      {staticWrites.length > 0 && <P>代码里还写着 {staticWrites.length} 处可能的写入（只是代码里有，本次没有实际发生）：{staticWrites.slice(0, 12).map((r) => \`\${r.label}（\${r.file}:\${r.line}）\`).join("、")}{staticWrites.length > 12 ? " 等" : ""}。</P>}
    </div>
  );
}
`;export{e as default};