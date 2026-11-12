import type { NoteBinding } from "./cct-notes";
import { routePattern } from "./route-key";

/** a59 can contain pre-existing metadata; only inspectorBindings belongs to this feature. */
export function bindingDocument(raw: unknown): Record<string, unknown> {
  if (raw === undefined || raw === null || raw === "") return {};
  const value: unknown = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("a59 现有内容不是对象，未覆盖，请先核查。");
  return value as Record<string, unknown>;
}

export function positionBindings(raw: unknown, id: string): NoteBinding[] {
  const entries = bindingDocument(raw)["inspectorBindings"];
  if (entries === undefined) return [];
  if (!Array.isArray(entries))
    throw new Error(`注释 #${id} 的位置绑定格式异常。`);
  return entries.map((value: unknown) => {
    if (!value || typeof value !== "object")
      throw new Error(`注释 #${id} 的位置绑定格式异常。`);
    const b = value as NoteBinding;
    if (
      typeof b.key !== "string" ||
      !b.key ||
      b.id !== id ||
      !["page", "element", "site"].includes(b.scope) ||
      typeof b.page !== "string" ||
      typeof b.label !== "string"
    )
      throw new Error(`注释 #${id} 的位置绑定格式异常。`);
    return b;
  });
}

export function samePosition(a: string, b: string): boolean {
  return a === b || (routePattern(a) ?? a) === (routePattern(b) ?? b) || samePage(a, b);
}

function pageParts(key: string): { path: string; site: string | null } | null {
  if (!key.startsWith("page|/")) return null;
  const [path = "/", search = ""] = key.slice(5).split("?");
  return { path: path.replace(/\/\d+(?=\/|$)/g, "/:id").replace(/(.)\/$/, "$1"), site: new URLSearchParams(search).get("__site") };
}

/** Pages match across record ids; explicit sub-apps never cross-match, historic unscoped bindings stay readable. */
function samePage(a: string, b: string): boolean {
  const x = pageParts(a), y = pageParts(b);
  if (!x || !y || x.path !== y.path) return false;
  return !x.site || !y.site || x.site === y.site;
}

/** a59 LIKE text that finds every stored spelling of one page key (record ids, unscoped or scoped). */
export function pageBindingNeedle(key: string): string[] {
  const parts = pageParts(key);
  if (!parts) return [key];
  if (parts.path === "/") return ['page|/"', "page|/?"];
  const segs = parts.path.split("/");
  if (!parts.path.includes(":id")) return [`page|${parts.path}`];
  const last = [...segs].reverse().find((s) => s && s !== ":id");
  return [segs[segs.length - 1] === ":id" ? `page|${segs.slice(0, -1).join("/")}/` : `/${last}`];
}

export function updatePositionBindings(
  raw: unknown,
  bindings: NoteBinding[],
): string {
  return JSON.stringify({
    ...bindingDocument(raw),
    inspectorBindings: bindings,
  });
}

export function findPositionBindings(
  bindings: NoteBinding[],
  key: string,
): NoteBinding[] {
  return bindings.filter((binding) => samePosition(binding.key, key));
}
