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
  return a === b || (routePattern(a) ?? a) === (routePattern(b) ?? b);
}

/** Narrow the read to a route family for pages, or the exact anchor for elements. */
export function bindingSearchNeedle(key: string): string {
  const pattern = routePattern(key);
  if (!pattern) return key;
  if (key.startsWith("page|")) return pattern.split(":id")[0] ?? key;
  return key.split("|").slice(2).join("|");
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
