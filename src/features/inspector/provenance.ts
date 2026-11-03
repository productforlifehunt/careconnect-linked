/**
 * Traces where a shown row came from using only recorded responses:
 * row → the REL read that returned it → that REL's parent id → … until the
 * chain reaches the signed-in user, the id in the page address, or stops.
 * Nothing is guessed: each step cites the recorded request that proves it.
 */
import type { RecordedRequest } from "./recorder";
import { decodeEndpoint, relById } from "./decode";
import { getStoredWPUser } from "@/services/wp-auth";

export interface ChainStep { text: string; detail?: string | undefined }

function relIds(r: RecordedRequest): string[] {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (Array.isArray(v)) { v.forEach(walk); return; }
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      for (const k of ["child_object_id", "parent_object_id", "child_id", "parent_id", "_ID", "id"]) if (o[k] != null) out.push(String(o[k]));
      for (const val of Object.values(o)) if (typeof val === "object") walk(val);
    } else if (typeof v === "string" || typeof v === "number") out.push(String(v));
  };
  walk(r.rows);
  return out;
}

function relRead(r: RecordedRequest) {
  const m = r.endpoint.match(/^jet-rel\/(\d+)\/(children|parents)\/(\d+)/);
  return m ? { rel: m[1]!, side: m[2]! as "children" | "parents", from: m[3]! } : null;
}

function describeAnchor(id: string, path: string): string | null {
  const me = getStoredWPUser();
  if (me && String(me.user_id) === id) return `当前登录用户 (WordPress 用户 #${id}) / signed-in user`;
  const seg = path.split("/").filter(Boolean);
  if (seg.includes(id)) return `当前页面地址里的编号 #${id}（${path}）/ id in the page address`;
  return null;
}

/** Chain for one matched row (`rowId`) found in request `found`. */
export function traceRow(rowId: string, found: RecordedRequest, all: RecordedRequest[], path: string): ChainStep[] {
  const t = decodeEndpoint(found.method, found.endpoint);
  const steps: ChainStep[] = [{ text: `显示的是 ${t.label.replace(/ #\d+$/, "")} 第 #${rowId} 行 / shown row`, detail: `${found.method} ${found.endpoint}` }];
  let id = rowId; const seen = new Set<string>();
  for (let hop = 0; hop < 5; hop++) {
    const anchor = describeAnchor(id, path);
    if (anchor && hop > 0) { steps.push({ text: `起点 / starts at: ${anchor}` }); return steps; }
    const via = all.find((r) => { const rr = relRead(r); return rr && !seen.has(r.endpoint) && rr.from !== id && relIds(r).includes(id); });
    if (!via) {
      if (anchor) steps.push({ text: `起点 / starts at: ${anchor}` });
      else steps.push({ text: hop === 0 ? "这一行不是通过关联查到的（直接按编号/列表读取）/ read directly, not through a relation" : `#${id} 之前的来源没有被记录 / earlier source not recorded` });
      return steps;
    }
    seen.add(via.endpoint);
    const rr = relRead(via)!; const def = relById(rr.rel);
    const parentSide = rr.side === "children";
    steps.push({
      text: `↑ 通过 REL ${rr.rel}（${def ? `${def.parent} → ${def.child}` : "字典里找不到"}）：${parentSide ? `父项 #${rr.from} 的子项包含 #${id}` : `子项 #${rr.from} 的父项包含 #${id}`}`,
      detail: `GET ${via.endpoint}`,
    });
    id = rr.from;
  }
  return steps;
}

/** Shared infrastructure files: requests whose first app caller is one of these are not "this element's" data. */
export function ownerFile(r: RecordedRequest): string | undefined {
  return r.callers.find((c) => !/^(features\/shared\/|lib\/|integrations\/|services\/wp-|features\/inspector\/)/.test(c));
}
export const INFRA = /^(contexts\/|components\/layout\/|routes\/__root|components\/ui\/|lib\/|integrations\/|features\/shared\/|services\/wp-auth|hooks\/use-mobile)/;
