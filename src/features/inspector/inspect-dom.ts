/**
 * Reads what the browser already knows about a clicked element: its source
 * locations (dev builds tag JSX with data-tsd-source), React component names,
 * click/submit handler code, link target, and which recorded WordPress row
 * fields hold the exact text it shows.
 */
import {
  decodeEndpoint,
  fieldName,
  optionName,
  normalizeFile,
  type Target,
} from "./decode";
import type { RecordedRequest } from "./recorder";

export interface ElementInfo {
  tag: string;
  text: string;
  sources: string[]; // nearest first: "components/x.tsx:12"
  components: string[]; // nearest first
  handlers: Array<{ prop: string; code: string; owner: string }>;
  link?: string | undefined;
  props: Array<{ component: string; prop: string; value: string }>;
  matches: FieldMatch[];
  card: string; // text of the surrounding card/row
  itemIndex: number; // position among siblings rendered by the same JSX line (list items), -1 if none
  itemSlot?: string | undefined; // React key of that list item when it names a fixed item ("Pending Tasks"), not a data row id
  callSite?: string | undefined; // where the shared component was used, only when the same JSX line is used from several places on this page
  anchor: { names: string[]; path: string }; // build-independent identity: same in editor preview and published site
  sourceFingerprint?: string | undefined; // exact rendered host, generated at build time
}

function componentName(f: any): string {
  const type = f?.type;
  if (!(
    typeof type === "function" ||
    (type && typeof type === "object" && (type.render || type.type))
  ))
    return "";
  const name =
    type.displayName || type.name || type.render?.name || type.type?.name || "";
  return name && !SKIP_COMPONENTS.test(name) ? name : "";
}

/**
 * One identity for an element in every build: the app's own component names around it plus its position
 * in the rendered markup of the nearest two components (tag + n-th of that tag; list items by fixed slot
 * key, data rows as "*" so one list's rows share a note). No source file, no line number, no build marker.
 */
export function stableAnchor(el: Element): { names: string[]; path: string } {
  // Named visible UI scopes survive portals, wrapper changes outside the scope and minified
  // component names. Descendants retain their complete DOM position, never their text/value.
  const scope = el.closest("[data-inspector-scope]");
  const scopeName = scope?.getAttribute("data-inspector-scope");
  if (scope && scopeName) {
    const steps: string[] = [];
    for (let node: Element | null = el; node; node = node.parentElement) {
      const tag = node.tagName.toLowerCase();
      if (node === scope) {
        steps.push(tag);
        break;
      }
      const siblings = node.parentElement
        ? [...node.parentElement.children].filter(
            (c) =>
              c.tagName === node.tagName && !c.closest("[data-rw-inspector]"),
          )
        : [node];
      steps.push(`${tag}${siblings.indexOf(node)}`);
    }
    return { names: [`scope:${scopeName}`], path: steps.reverse().join(">") };
  }
  const names: string[] = [];
  const hosts: Array<{ node: Element; key: unknown }> = [];
  let f = fiberOf(el);
  // Markup is collected until two components are passed and at least four tags are known, so wrapper
  // components that draw no tag of their own (Button inside a menu trigger) cannot merge two buttons.
  const collecting = () =>
    (names.length < 2 || hosts.length < 4) && hosts.length < 20;
  let open = true;
  for (
    let depth = 0;
    f && depth < 160 && (names.length < 4 || open);
    depth++, f = f.return
  ) {
    if (typeof f.type === "string") {
      open = collecting();
      if (open && f.stateNode instanceof Element)
        hosts.push({ node: f.stateNode, key: f.key });
      continue;
    }
    const last = hosts[hosts.length - 1];
    if (open && last && last.key == null && f.key != null) last.key = f.key;
    const n = componentName(f);
    if (n && !names.includes(n) && names.length < 4) names.push(n);
  }
  const steps = hosts.map(({ node, key }) => {
    const tag = node.tagName.toLowerCase();
    if (key != null) return `${tag}[${staticSlotKey(key) ?? "*"}]`;
    const sibs = node.parentElement
      ? [...node.parentElement.children].filter(
          (c) =>
            c.tagName === node.tagName && !c.closest("[data-rw-inspector]"),
        )
      : [node];
    return `${tag}${Math.max(0, sibs.indexOf(node))}`;
  });
  return { names, path: steps.reverse().slice(-20).join(">") };
}

/** The element note key used by both builds; record ids in the page path are folded to :id. */
export function stableElementKey(
  pathname: string,
  anchor: { names: string[]; path: string },
): string {
  // Named scopes (AI chat dialog, settings form) are the same element on every page: never page-bound.
  if (anchor.names[0]?.startsWith("scope:"))
    return ["el", "*", anchor.names.join("<"), `@${anchor.path}`].join("|");
  return [
    "el",
    pathname.replace(/\/\d+(?=\/|$)/g, "/:id"),
    anchor.names.join("<"),
    `@${anchor.path}`,
  ].join("|");
}

function fileOf(src: string): string {
  return normalizeFile(src.split(":")[0]!);
}

/** First ancestor source in a different file than `own`: the place that used this component. */
function useSiteOf(node: Element, own: string): string | undefined {
  for (let n: Element | null = node.parentElement; n; n = n.parentElement) {
    const s =
      n.getAttribute("data-inspector-source") ||
      n.getAttribute("data-tsd-source");
    if (s && fileOf(s) !== own && !fileOf(s).startsWith("components/ui/"))
      return fileOf(s) + ":" + (s.split(":")[1] || "");
  }
  return undefined;
}

/**
 * A reusable component (stat card, toggle row) rendered from several places shares one JSX line,
 * so the place that used it is added to the note key — but only when this page really uses that line
 * from more than one place, so single-use components keep their existing notes.
 */
export function sharedCallSite(owner: Element | null): string | undefined {
  const attr = owner?.hasAttribute("data-inspector-source")
    ? "data-inspector-source"
    : "data-tsd-source";
  const raw = owner?.getAttribute(attr);
  if (!owner || !raw) return undefined;
  const own = fileOf(raw);
  const mine = useSiteOf(owner, own);
  if (!mine) return undefined;
  const sites = new Set<string>();
  document.querySelectorAll(`[${attr}="${CSS.escape(raw)}"]`).forEach((n) => {
    if (!n.closest("[data-rw-inspector]")) sites.add(useSiteOf(n, own) || "");
  });
  return sites.size > 1 ? mine : undefined;
}

/** A list item's React key names a fixed slot (stat card label) rather than a data row (post id, uuid). */
export function staticSlotKey(key: unknown): string | undefined {
  if (typeof key !== "string") return undefined;
  const k = key.trim();
  if (
    !k ||
    k.length > 60 ||
    !/[A-Za-z\u4e00-\u9fff]/.test(k) ||
    /\d{2,}/.test(k) ||
    /^[A-Za-z]+[-_:#]\d+$/.test(k) ||
    /^[0-9a-f-]{16,}$/i.test(k)
  )
    return undefined;
  return k;
}

export interface FieldMatch {
  sameCard?: boolean;
  target: Target;
  row: string;
  field: string;
  fieldName?: string | undefined;
  option?: string | undefined;
  value: string;
  request: RecordedRequest;
}

const SKIP_COMPONENTS =
  /^(Primitive|Slot|SlotClone|Presence|Portal|Provider|Consumer|Context|Lazy|Match|Outlet|ErrorBoundary|Suspense|Fragment|Popper|FocusScope|DismissableLayer|Collection|RovingFocus|_c\d*|[a-z])/;

function fiberOf(el: Element): any {
  const key = Object.keys(el).find((k) => k.startsWith("__reactFiber"));
  return key ? (el as any)[key] : null;
}

function cleanText(el: Element): string {
  const input = el as HTMLInputElement;
  const raw =
    "value" in input && typeof input.value === "string" && input.value
      ? input.value
      : (el as HTMLElement).innerText || el.textContent || "";
  return raw.replace(/\s+/g, " ").trim().slice(0, 300);
}

function norm(v: unknown): string {
  return String(v ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Times a stored value can appear as on screen: "08:00" → 8:00 / 8:00 AM; epoch seconds → local HH:MM and date. */
function displayForms(raw: string): string[] {
  const forms: string[] = [];
  const hm = (h: number, m: number) => {
    const mm = String(m).padStart(2, "0");
    const h12 = h % 12 || 12;
    const ap = h >= 12 ? "pm" : "am";
    const zh = h >= 12 ? "下午" : "上午";
    forms.push(
      `${h}:${mm}`,
      `${String(h).padStart(2, "0")}:${mm}`,
      `${h12}:${mm} ${ap}`,
      `${zh}${h12}:${mm}`,
    );
    // Hour-axis labels ("8 AM", "上午8时") come from the same stored time when it is on the hour.
    if (m === 0)
      forms.push(`${h12} ${ap}`, `${h12}${ap}`, `${zh}${h12}时`, `${h}时`);
  };
  const t = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (t) hm(+t[1]!, +t[2]!);
  if (/^\d{10}$|^\d{13}$/.test(raw)) {
    const d = new Date(raw.length === 10 ? +raw * 1000 : +raw);
    if (!isNaN(+d)) {
      hm(d.getHours(), d.getMinutes());
      forms.push(d.toISOString().slice(0, 10), d.toLocaleDateString());
    }
  }
  const dt = raw.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})/);
  if (dt) {
    hm(+dt[2]!, +dt[3]!);
    forms.push(dt[1]!);
  }
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
      const rowId = String(
        row["_ID"] ??
          row["id"] ??
          row["child_object_id"] ??
          row["parent_object_id"] ??
          "?",
      );
      const scan = (obj: Record<string, unknown>, prefix: string, def: any) => {
        for (const [k, v] of Object.entries(obj)) {
          if (k === "_ID" || k === "id" || k.startsWith("cct_")) continue;
          if (v && typeof v === "object" && !Array.isArray(v)) {
            if (k === "meta")
              scan(v as Record<string, unknown>, "meta.", target.rel);
            continue;
          }
          const s = norm(Array.isArray(v) ? v.join(", ") : v);
          if (!s) continue;
          const low = s.toLowerCase();
          let how = "";
          if (low === want) how = "完全相同 / exact";
          else if (
            low.length >= 2 &&
            !/^\d{1,3}$/.test(low) &&
            want.includes(low)
          )
            how = "包含在显示文字中 / part of the text";
          else if (
            want.length >= 4 &&
            low.includes(want) &&
            low.length <= want.length * 3
          )
            how = "显示的是其中一部分 / shown in part";
          else {
            const f = displayForms(s).find((x) => want.includes(x));
            if (f) how = `换算显示为 / shown as ${f}`;
          }
          if (!how) continue;
          const key = `${target.key}|${rowId}|${prefix}${k}`;
          if (seen.has(key)) continue;
          seen.add(key);
          out.push({
            target,
            row: rowId,
            field: prefix + k,
            fieldName: fieldName(def, k),
            option: optionName(def, k, v),
            value: `${s.slice(0, 120)}（${how}）`,
            request: req,
          });
        }
      };
      scan(row, "", target.cct);
      if (out.length > 40) return out;
    }
  }
  return out;
}

export function inspectElement(
  el: Element,
  requests: RecordedRequest[],
): ElementInfo {
  const sources: string[] = [];
  let firstTagged: Element | null = null;
  for (
    let n: Element | null = el;
    n && sources.length < 12;
    n = n.parentElement
  ) {
    const s =
      n.getAttribute("data-inspector-source") ||
      n.getAttribute("data-tsd-source");
    if (s && !firstTagged) firstTagged = n;
    if (s) {
      const f = normalizeFile(s.split(":")[0]!) + ":" + (s.split(":")[1] || "");
      if (!sources.includes(f)) sources.push(f);
    }
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
    if (
      typeof type === "function" ||
      (type && typeof type === "object" && (type.render || type.type))
    ) {
      const name =
        type.displayName ||
        type.name ||
        type.render?.name ||
        type.type?.name ||
        "";
      if (name && !SKIP_COMPONENTS.test(name) && !components.includes(name))
        components.push(name);
      if (name && !owner) owner = name;
      // The handler belongs to the first real component above where it was found.
      // Data the component received (plain objects / arrays only).
      const fp = f.memoizedProps;
      if (
        name &&
        !SKIP_COMPONENTS.test(name) &&
        fp &&
        typeof fp === "object" &&
        dataProps.length < 12 &&
        components.length <= 4
      ) {
        for (const [k, v] of Object.entries(fp)) {
          if (
            k === "children" ||
            k === "className" ||
            k === "style" ||
            k.startsWith("data-") ||
            k.startsWith("aria-") ||
            typeof v === "function" ||
            v == null ||
            (v as any).$$typeof
          )
            continue;
          if (
            typeof v === "object" ||
            typeof v === "string" ||
            typeof v === "number" ||
            typeof v === "boolean"
          ) {
            let txt: string;
            try {
              txt = JSON.stringify(v, (_k, x) =>
                typeof x === "function"
                  ? undefined
                  : x && x.$$typeof
                    ? "[element]"
                    : x,
              );
            } catch {
              txt = String(v);
            }
            if (txt && txt.length > 1)
              dataProps.push({
                component: name,
                prop: k,
                value: txt.slice(0, 600),
              });
          }
        }
      }
    }
    const props = f.memoizedProps;
    if (props && typeof props === "object" && depth < 25) {
      for (const prop of [
        "onClick",
        "onSubmit",
        "onSelect",
        "onValueChange",
        "onCheckedChange",
        "onChange",
        "onPointerDown",
      ]) {
        const fn = props[prop];
        if (
          typeof fn === "function" &&
          handlers.length < 4 &&
          !handlers.some((h) => h.code === String(fn))
        ) {
          const code = String(fn);
          if (code.length > 20 && !/\[native code\]/.test(code))
            pending.push({ prop, code: code.slice(0, 1600) });
        }
      }
      if (!link && typeof props.to === "string") link = props.to;
      if (!link && typeof props.href === "string") link = props.href;
    }
  }
  if (!link) {
    const a = el.closest("a");
    if (a?.getAttribute("href")) link = a.getAttribute("href")!;
  }
  const text = cleanText(el);
  // Text of the surrounding card/row, to tell which of several matching rows this element belongs to.
  let box: Element | null = el.closest(
    "button, a, li, tr, [role=button], [role=row], [role=listitem]",
  );
  if (!box) {
    box = el;
    for (
      let i = 0;
      i < 2 && box.parentElement && cleanText(box.parentElement).length < 200;
      i++
    )
      box = box.parentElement;
  }
  const cardText = cleanText(box);
  // Which list item this is: the nearest ancestor whose siblings come from the same JSX line.
  let itemIndex = -1;
  let itemSlot: string | undefined;
  for (
    let n: Element | null = el;
    n && n.parentElement && itemIndex < 0;
    n = n.parentElement
  ) {
    const src = n.getAttribute("data-tsd-source");
    if (!src) continue;
    const sibs = [...n.parentElement.children].filter(
      (c) => c.getAttribute("data-tsd-source") === src,
    );
    if (sibs.length > 1) {
      itemIndex = sibs.indexOf(n);
      // The item's own key (on the element or the component that rendered it, below the shared parent).
      const parentFiber = fiberOf(n.parentElement);
      for (
        let fb = fiberOf(n), i = 0;
        fb && fb !== parentFiber && i < 8;
        fb = fb.return, i++
      )
        if (fb.key != null) {
          itemSlot = staticSlotKey(fb.key);
          break;
        }
    }
  }
  // Preview/published builds carry no data-tsd-source, so list items are found from React keys instead:
  // the nearest ancestor rendered with its own key among same-tag keyed siblings is the list item.
  if (itemIndex < 0) {
    const ownKey = (n: Element): unknown => {
      const parentFiber = n.parentElement ? fiberOf(n.parentElement) : null;
      for (
        let fb = fiberOf(n), i = 0;
        fb && fb !== parentFiber && i < 8;
        fb = fb.return, i++
      )
        if (fb.key != null) return fb.key;
      return null;
    };
    for (
      let n: Element | null = el, depth = 0;
      n && n.parentElement && depth < 8;
      n = n.parentElement, depth++
    ) {
      const key = ownKey(n);
      if (key == null) continue;
      const sibs = [...n.parentElement.children].filter(
        (c) => c.tagName === n!.tagName && ownKey(c) != null,
      );
      if (sibs.length > 1) {
        itemIndex = sibs.indexOf(n);
        itemSlot = staticSlotKey(key);
        break;
      }
    }
  }
  const around = cardText.toLowerCase();
  // A handler is written in the nearest component that also has its own source file on the element chain.
  const files = sources.map((x) =>
    x
      .split(":")[0]!
      .split("/")
      .pop()!
      .replace(/\.tsx?$/, ""),
  );
  const writer = components.find((c) => files.includes(c)) || owner || "?";
  for (const h of pending)
    if (handlers.length < 4 && !handlers.some((x) => x.code === h.code))
      handlers.push({ ...h, owner: writer });
  return {
    tag: el.tagName.toLowerCase(),
    text,
    sources,
    components: components.slice(0, 12),
    handlers,
    link,
    props: dataProps,
    matches: rank(matchValues(text, requests), around, text.toLowerCase()),
    card: cardText,
    itemIndex,
    itemSlot,
    callSite: sharedCallSite(firstTagged),
    anchor: stableAnchor(el),
    sourceFingerprint: el.getAttribute("data-inspector-source") || undefined,
  };
}

function rank(
  matches: FieldMatch[],
  around: string,
  own: string,
): FieldMatch[] {
  for (const m of matches) {
    const rows = Array.isArray(m.request.rows)
      ? m.request.rows
      : [m.request.rows];
    const row = (rows as Array<Record<string, unknown>>).find(
      (r) => r && String(r["_ID"] ?? r["id"] ?? "") === m.row,
    );
    if (!row) continue;
    m.sameCard = Object.entries(row).some(
      ([k, v]) =>
        !k.startsWith("cct_") &&
        k !== m.field.replace(/^meta\./, "") &&
        k !== m.field &&
        !k.startsWith("_") &&
        typeof v === "string" &&
        v.length >= 2 &&
        !/^\d{1,3}$/.test(v) &&
        !own.includes(v.toLowerCase()) &&
        (around.includes(v.toLowerCase()) ||
          displayForms(v).some(
            (f) => f.length >= 4 && !own.includes(f) && around.includes(f),
          )),
    );
  }
  return [...matches].sort(
    (a, b) => Number(!!b.sameCard) - Number(!!a.sameCard),
  );
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
