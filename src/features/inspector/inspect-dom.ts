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
  props: Array<{ component: string; prop: string; value: string }>;
  matches: FieldMatch[];
  card: string;            // text of the surrounding card/row
  itemIndex: number;       // position among siblings rendered by the same JSX line (list items), -1 if none
}

export interface FieldMatch { sameCard?: boolean; target: Target; row: string; field: string; fieldName?: string | undefined; option?: string | undefined; value: string; request: RecordedRequest }

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

/** Times a stored value can appear as on screen: "08:00" → 8:00 / 8:00 AM; epoch seconds → local HH:MM and date. */
function displayForms(raw: string): string[] {
  const forms: string[] = [];
  const hm = (h: number, m: number) => {
    const mm = String(m).padStart(2, "0");
    forms.push(`${h}:${mm}`, `${String(h).padStart(2, "0")}:${mm}`, `${h % 12 || 12}:${mm} ${h >= 12 ? "pm" : "am"}`);
  };
  const t = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (t) hm(+t[1]!, +t[2]!);
  if (/^\d{10}$|^\d{13}$/.test(raw)) {
    const d = new Date(raw.length === 10 ? +raw * 1000 : +raw);
    if (!isNaN(+d)) { hm(d.getHours(), d.getMinutes()); forms.push(d.toISOString().slice(0, 10), d.toLocaleDateString()); }
  }
  const dt = raw.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})/);
  if (dt) { hm(+dt[2]!, +dt[3]!); forms.push(dt[1]!); }
  return forms.map((f) => f.toLowerCase());
}

function matchValues(text: string, requests: RecordedRequest[]): FieldMatch[] {
  const out: FieldMatch[] = [];
  if (!text || text.length < 1 || text.length > 160) return out;
  const want = text.toLowerCase();
  const seen = new Set<string>();
  for (const req of requests) {
    if (req.method !== "GET" || !req.rows) continue;
    const target = decodeEndpoint(req.method, req.endpoint);
    const rows = Array.isArray(req.rows) ? req.rows : [req.rows];
    for (const row of rows as Array<Record<string, unknown>>) {
      if (!row || typeof row !== "object") continue;
      const rowId = String(row["_ID"] ?? row["id"] ?? row["child_object_id"] ?? row["parent_object_id"] ?? "?");
      const scan = (obj: Record<string, unknown>, prefix: string, def: any) => {
        for (const [k, v] of Object.entries(obj)) {
          if (k === "_ID" || k === "id" || k.startsWith("cct_")) continue;
          if (v && typeof v === "object" && !Array.isArray(v)) { if (k === "meta") scan(v as Record<string, unknown>, "meta.", target.rel); continue; }
          const s = norm(Array.isArray(v) ? v.join(", ") : v);
          if (!s) continue;
          const low = s.toLowerCase();
          let how = "";
          if (low === want) how = "完全相同 / exact";
          else if (low.length >= 2 && !/^\d{1,3}$/.test(low) && want.includes(low)) how = "包含在显示文字中 / part of the text";
          else if (want.length >= 4 && low.includes(want)) how = "显示的是其中一部分 / shown in part";
          else { const f = displayForms(s).find((x) => want.includes(x)); if (f) how = `换算显示为 / shown as ${f}`; }
          if (!how) continue;
          const key = `${target.key}|${rowId}|${prefix}${k}`;
          if (seen.has(key)) continue; seen.add(key);
          out.push({ target, row: rowId, field: prefix + k, fieldName: fieldName(def, k), option: optionName(def, k, v), value: `${s.slice(0, 120)}（${how}）`, request: req });
        }
      };
      scan(row, "", target.cct);
      if (out.length > 40) return out;
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
  const dataProps: ElementInfo["props"] = [];
  const pending: Array<{ prop: string; code: string }> = [];
  let link: string | undefined;
  let owner = "";
  let f = fiberOf(el);
  for (let depth = 0; f && depth < 60; depth++, f = f.return) {
    const type = f.type;
    if (typeof type === "function" || (type && typeof type === "object" && (type.render || type.type))) {
      const name = type.displayName || type.name || type.render?.name || type.type?.name || "";
      if (name && !SKIP_COMPONENTS.test(name) && !components.includes(name)) components.push(name);
      if (name && !owner) owner = name;
      // The handler belongs to the first real component above where it was found.
      // Data the component received (plain objects / arrays only).
      const fp = f.memoizedProps;
      if (name && !SKIP_COMPONENTS.test(name) && fp && typeof fp === "object" && dataProps.length < 12 && components.length <= 4) {
        for (const [k, v] of Object.entries(fp)) {
          if (k === "children" || k === "className" || k === "style" || k.startsWith("data-") || k.startsWith("aria-") || typeof v === "function" || v == null || (v as any).$$typeof) continue;
          if (typeof v === "object" || typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
            let txt: string; try { txt = JSON.stringify(v, (_k, x) => (typeof x === "function" ? undefined : x && x.$$typeof ? "[element]" : x)); } catch { txt = String(v); }
            if (txt && txt.length > 1) dataProps.push({ component: name, prop: k, value: txt.slice(0, 600) });
          }
        }
      }
    }
    const props = f.memoizedProps;
    if (props && typeof props === "object" && depth < 25) {
      for (const prop of ["onClick", "onSubmit", "onSelect", "onValueChange", "onCheckedChange", "onChange", "onPointerDown"]) {
        const fn = props[prop];
        if (typeof fn === "function" && handlers.length < 4 && !handlers.some((h) => h.code === String(fn))) {
          const code = String(fn);
          if (code.length > 20 && !/\[native code\]/.test(code)) pending.push({ prop, code: code.slice(0, 1600) });
        }
      }
      if (!link && typeof props.to === "string") link = props.to;
      if (!link && typeof props.href === "string") link = props.href;
    }
  }
  if (!link) { const a = el.closest("a"); if (a?.getAttribute("href")) link = a.getAttribute("href")!; }
  const text = cleanText(el);
  // Text of the surrounding card/row, to tell which of several matching rows this element belongs to.
  let box: Element | null = el.closest("button, a, li, tr, [role=button], [role=row], [role=listitem]");
  if (!box) { box = el; for (let i = 0; i < 2 && box.parentElement && cleanText(box.parentElement).length < 200; i++) box = box.parentElement; }
  const cardText = cleanText(box);
  // Which list item this is: the nearest ancestor whose siblings come from the same JSX line.
  let itemIndex = -1;
  for (let n: Element | null = el; n && n.parentElement && itemIndex < 0; n = n.parentElement) {
    const src = n.getAttribute("data-tsd-source"); if (!src) continue;
    const sibs = [...n.parentElement.children].filter((c) => c.getAttribute("data-tsd-source") === src);
    if (sibs.length > 1) itemIndex = sibs.indexOf(n);
  }
  const around = cardText.toLowerCase();
  // A handler is written in the nearest component that also has its own source file on the element chain.
  const files = sources.map((x) => x.split(":")[0]!.split("/").pop()!.replace(/\.tsx?$/, ""));
  const writer = components.find((c) => files.includes(c)) || owner || "?";
  for (const h of pending) if (handlers.length < 4 && !handlers.some((x) => x.code === h.code)) handlers.push({ ...h, owner: writer });
  return { tag: el.tagName.toLowerCase(), text, sources, components: components.slice(0, 12), handlers, link, props: dataProps, matches: rank(matchValues(text, requests), around, text.toLowerCase()), card: cardText, itemIndex };
}

function rank(matches: FieldMatch[], around: string, own: string): FieldMatch[] {
  for (const m of matches) {
    const rows = Array.isArray(m.request.rows) ? m.request.rows : [m.request.rows];
    const row = (rows as Array<Record<string, unknown>>).find((r) => r && String(r["_ID"] ?? r["id"] ?? "") === m.row);
    if (!row) continue;
    m.sameCard = Object.entries(row).some(([k, v]) => !k.startsWith("cct_") && k !== m.field.replace(/^meta\./, "") &&  k !== m.field && !k.startsWith("_") && typeof v === "string" && v.length >= 2 && !/^\d{1,3}$/.test(v) && !own.includes(v.toLowerCase()) && (around.includes(v.toLowerCase()) || displayForms(v).some((f) => f.length >= 4 && !own.includes(f) && around.includes(f))));
  }
  return [...matches].sort((a, b) => Number(!!b.sameCard) - Number(!!a.sameCard));
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
