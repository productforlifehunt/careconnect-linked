/**
 * Reads what the browser already knows about a clicked element: its source
 * locations (dev builds tag JSX with data-tsd-source), React component names,
 * click/submit handler code, link target, and which recorded WordPress row
 * fields hold the exact text it shows.
 */
import { decodeEndpoint, fieldName, optionName, normalizeFile, type Target } from "./decode";
import type { RecordedRequest } from "./recorder";

export interface ElementInfo {
  tag: string;
  text: string;
  sources: string[];       // nearest first: "components/x.tsx:12"
  components: string[];    // nearest first
  handlers: Array<{ prop: string; code: string; owner: string }>;
  link?: string | undefined;
  matches: FieldMatch[];
}

export interface FieldMatch { target: Target; row: string; field: string; fieldName?: string | undefined; option?: string | undefined; value: string; request: RecordedRequest }

const SKIP_COMPONENTS = /^(Primitive|Slot|SlotClone|Presence|Portal|Provider|Consumer|Context|Lazy|Match|Outlet|ErrorBoundary|Suspense|Fragment|Popper|FocusScope|DismissableLayer|Collection|RovingFocus|_c\d*|[a-z])/;

function fiberOf(el: Element): any {
  const key = Object.keys(el).find((k) => k.startsWith("__reactFiber"));
  return key ? (el as any)[key] : null;
}

function cleanText(el: Element): string {
  const input = el as HTMLInputElement;
  const raw = ("value" in input && typeof input.value === "string" && input.value) ? input.value : (el as HTMLElement).innerText || el.textContent || "";
  return raw.replace(/\s+/g, " ").trim().slice(0, 300);
}

function norm(v: unknown): string {
  return String(v ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function matchValues(text: string, requests: RecordedRequest[]): FieldMatch[] {
  const out: FieldMatch[] = [];
  if (!text || text.length < 2) return out;
  const want = text.toLowerCase();
  for (const req of requests) {
    if (req.method !== "GET" || !req.rows) continue;
    const target = decodeEndpoint(req.method, req.endpoint);
    const rows = Array.isArray(req.rows) ? req.rows : [req.rows];
    for (const row of rows as Array<Record<string, unknown>>) {
      if (!row || typeof row !== "object") continue;
      const rowId = String(row["_ID"] ?? row["id"] ?? row["child_object_id"] ?? row["parent_object_id"] ?? "?");
      const scan = (obj: Record<string, unknown>, prefix: string, def: any) => {
        for (const [k, v] of Object.entries(obj)) {
          if (v && typeof v === "object" && !Array.isArray(v)) { if (k === "meta") scan(v as Record<string, unknown>, "meta.", target.rel); continue; }
          const s = norm(Array.isArray(v) ? v.join(", ") : v);
          if (s.length < 2) continue;
          const low = s.toLowerCase();
          if (low === want || (want.length >= 4 && low.length >= 4 && (want.includes(low) || low.includes(want)) && Math.min(low.length, want.length) / Math.max(low.length, want.length) > 0.5)) {
            out.push({ target, row: rowId, field: prefix + k, fieldName: fieldName(def, k), option: optionName(def, k, v), value: s.slice(0, 120), request: req });
          }
        }
      };
      scan(row, "", target.cct);
      if (out.length > 30) return out;
    }
  }
  return out;
}

export function inspectElement(el: Element, requests: RecordedRequest[]): ElementInfo {
  const sources: string[] = [];
  for (let n: Element | null = el; n && sources.length < 12; n = n.parentElement) {
    const s = n.getAttribute("data-tsd-source");
    if (s) { const f = normalizeFile(s.split(":")[0]!) + ":" + (s.split(":")[1] || ""); if (!sources.includes(f)) sources.push(f); }
  }
  const components: string[] = [];
  const handlers: ElementInfo["handlers"] = [];
  let link: string | undefined;
  let owner = "";
  let f = fiberOf(el);
  for (let depth = 0; f && depth < 60; depth++, f = f.return) {
    const type = f.type;
    if (typeof type === "function" || (type && typeof type === "object" && (type.render || type.type))) {
      const name = type.displayName || type.name || type.render?.name || type.type?.name || "";
      if (name && !SKIP_COMPONENTS.test(name) && !components.includes(name)) components.push(name);
      if (name && !owner) owner = name;
    }
    const props = f.memoizedProps;
    if (props && typeof props === "object" && depth < 25) {
      for (const prop of ["onClick", "onSubmit", "onSelect", "onValueChange", "onCheckedChange", "onChange", "onPointerDown"]) {
        const fn = props[prop];
        if (typeof fn === "function" && handlers.length < 4 && !handlers.some((h) => h.code === String(fn))) {
          const code = String(fn);
          if (code.length > 20 && !/^function\s*\(\)\s*\{\s*\[native code\]/.test(code)) handlers.push({ prop, code: code.slice(0, 1600), owner: components[0] || owner || "?" });
        }
      }
      if (!link && typeof props.to === "string") link = props.to;
      if (!link && typeof props.href === "string") link = props.href;
    }
  }
  if (!link) { const a = el.closest("a"); if (a?.getAttribute("href")) link = a.getAttribute("href")!; }
  const text = cleanText(el);
  return { tag: el.tagName.toLowerCase(), text, sources, components: components.slice(0, 12), handlers, link, matches: matchValues(text, requests) };
}

/** Every source file that rendered something on the current page. */
export function pageSourceFiles(): string[] {
  const set = new Set<string>();
  document.querySelectorAll("[data-tsd-source]").forEach((n) => {
    if (n.closest("[data-rw-inspector]")) return;
    set.add(normalizeFile(n.getAttribute("data-tsd-source")!.split(":")[0]!));
  });
  return [...set].filter((f) => !f.startsWith("components/ui/"));
}
