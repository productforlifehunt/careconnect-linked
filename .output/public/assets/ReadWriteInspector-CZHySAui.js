var e=`import type React from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import {
  X,
  ScanSearch,
  MousePointerClick,
  Navigation,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getRecorded,
  subscribeRecorder,
  clearRecorded,
  inspectModeOn,
  setInspectMode,
  type RecordedRequest,
} from "@/features/inspector/recorder";
import {
  decodeEndpoint,
  codeRefs,
  fieldName,
  fieldType,
  optionName,
  relById,
  cctBySlug,
  type CodeRef,
} from "@/features/inspector/decode";
import { ReadWriteNarrative } from "./ReadWriteNarrative";
import { ManualNotes } from "./ManualNotes";
import { elementAlias } from "@/features/inspector/route-key";
import {
  inspectElement,
  inspectorTarget,
  markupAnchor,
  pageSourceFiles,
  stableElementKey,
  type ElementInfo,
  type FieldMatch,
} from "@/features/inspector/inspect-dom";
import {
  traceLogic,
  decidingExpression,
  type LogicStep,
} from "@/features/inspector/logic-trace";
import { importClosure } from "@/features/inspector/live-index";
import { traceRow, ownerFile, INFRA } from "@/features/inspector/provenance";
import { OriginSummary } from "./OriginSummary";
import { explainReadWrite } from "@/lib/inspector-ai.functions";
import { getStoredWPUser } from "@/services/wp-auth";
import { ConflictReportView } from "./ConflictReportView";
import type { ConflictReport } from "@/features/inspector/conflict-report";
import { SiteAnalysis } from "./SiteAnalysis";

/** Text that comes from the signed-in account saved at login (no request on this page). */
function accountMatches(text: string): string[] {
  const me = getStoredWPUser() as Record<string, unknown> | null;
  if (!me || !text) return [];
  const low = text.toLowerCase();
  return Object.entries(me)
    .filter(
      ([k, v]) =>
        typeof v === "string" &&
        v.length >= 2 &&
        !/token/i.test(k) &&
        low.includes(v.toLowerCase()),
    )
    .map(([k, v]) => \`\${k} = “\${String(v).slice(0, 60)}”\`);
}

type Tab = "element" | "page" | "site";
type Sub = "rw" | "ai" | "notes";

function useRecorded(): RecordedRequest[] {
  return useSyncExternalStore(subscribeRecorder, getRecorded, getRecorded);
}

function currentPath() {
  return window.location.pathname + window.location.search;
}

function describeBody(req: RecordedRequest): string[] {
  const body = req.body;
  if (!body || typeof body !== "object") return [];
  const t = decodeEndpoint(req.method, req.endpoint);
  const def = t.cct || t.rel;
  const lines: string[] = [];
  const walk = (obj: Record<string, unknown>, prefix: string, d: any) => {
    for (const [k, v] of Object.entries(obj)) {
      if (v && typeof v === "object" && !Array.isArray(v)) {
        walk(
          v as Record<string, unknown>,
          \`\${prefix}\${k}.\`,
          k === "meta" ? t.rel : d,
        );
        continue;
      }
      const name = fieldName(d, k);
      const opt = optionName(d, k, v);
      lines.push(
        \`\${prefix}\${k}\${name ? \` (\${name})\` : ""} = \${JSON.stringify(v).slice(0, 80)}\${opt ? \` → \${opt}\` : ""}\`,
      );
    }
  };
  walk(body as Record<string, unknown>, "", def);
  return lines;
}

function rowCount(req: RecordedRequest): number {
  return Array.isArray(req.rows) ? req.rows.length : req.rows ? 1 : 0;
}

function returnedFields(req: RecordedRequest): string {
  const rows = Array.isArray(req.rows) ? req.rows : req.rows ? [req.rows] : [];
  const first = rows[0] as Record<string, unknown> | undefined;
  if (!first || typeof first !== "object") return "";
  const t = decodeEndpoint(req.method, req.endpoint);
  const keys = Object.keys(first)
    .filter((k) => !k.startsWith("cct_"))
    .slice(0, 30);
  const meta =
    first["meta"] && typeof first["meta"] === "object"
      ? Object.keys(first["meta"] as object).map(
          (k) =>
            \`meta.\${k}\${fieldName(t.rel, k) ? \` (\${fieldName(t.rel, k)})\` : ""}\`,
        )
      : [];
  return [
    ...keys
      .filter((k) => k !== "meta")
      .map(
        (k) => \`\${k}\${fieldName(t.cct, k) ? \` (\${fieldName(t.cct, k)})\` : ""}\`,
      ),
    ...meta,
  ].join(" · ");
}

function DataChain({ requests }: { requests: RecordedRequest[] }) {
  if (!requests.length)
    return (
      <p className="text-xs text-muted-foreground">
        这个元素用到的代码在本页没有读取数据（可能是固定文字或数据还没加载）。 /
        No reads by this element's code on this page.
      </p>
    );
  const seen = new Set<string>();
  const steps: {
    t: ReturnType<typeof decodeEndpoint>;
    r: RecordedRequest;
    n: number;
  }[] = [];
  for (const r of requests) {
    const t = decodeEndpoint(r.method, r.endpoint);
    const k = t.key + t.action;
    const e = steps.find((x) => x.t.key + x.t.action === k);
    if (e) e.n++;
    else if (!seen.has(k)) {
      seen.add(k);
      steps.push({ t, r, n: 1 });
    }
  }
  return (
    <ol className="space-y-1 text-xs">
      <li className="rounded border border-border p-1">
        ① 当前登录用户 / Signed-in WordPress user
      </li>
      {steps.map(({ t, r, n }, i) => (
        <li key={r.id} className="rounded border border-border p-1">
          <span className="font-medium">
            {["②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"][i] || "·"}{" "}
          </span>
          {t.kind === "rel" ? (
            <>
              经关联 / via <b>{t.label}</b>
            </>
          ) : (
            <>
              {t.action} <b>{t.label}</b>
            </>
          )}
          {n > 1 && \` ×\${n}\`}{" "}
          <span className="text-muted-foreground">
            → 返回 {rowCount(r)} 行 / {rowCount(r)} rows
          </span>
          {r.params && Object.keys(r.params).length > 0 && (
            <div className="font-mono text-[10px] text-muted-foreground">
              条件 / filter:{" "}
              {new URLSearchParams(
                r.params as Record<string, string>,
              ).toString()}
            </div>
          )}
          {t.kind !== "rel" && returnedFields(r) && (
            <div className="text-[10px]">
              字段 / fields: {returnedFields(r)}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

function RequestList({ requests }: { requests: RecordedRequest[] }) {
  if (!requests.length)
    return (
      <p className="text-xs text-muted-foreground">
        没有记录到请求 / No requests recorded.
      </p>
    );
  const groups = new Map<string, RecordedRequest[]>();
  for (const r of requests) {
    const t = decodeEndpoint(r.method, r.endpoint);
    const k = \`\${r.method}|\${t.key}|\${t.action}\`;
    groups.set(k, [...(groups.get(k) || []), r]);
  }
  return (
    <ul className="space-y-2">
      {[...groups.values()].map((list) => {
        const r = list[0]!;
        const t = decodeEndpoint(r.method, r.endpoint);
        const write = r.method !== "GET";
        return (
          <li
            key={r.id}
            className={\`rounded-md border p-2 text-xs \${write ? "border-destructive/40 bg-destructive/5" : "border-border bg-muted/30"}\`}
          >
            <div className="flex flex-wrap items-center gap-1 font-medium">
              <span
                className={\`rounded px-1 \${write ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}\`}
              >
                {t.action}
              </span>
              <span>{t.label}</span>
              {list.length > 1 && (
                <span className="text-muted-foreground">×{list.length}</span>
              )}
              {r.blocked && (
                <span className="rounded bg-secondary px-1 text-secondary-foreground">
                  已拦截未写入 / held back
                </span>
              )}
            </div>
            <div className="mt-1 break-all font-mono text-[10px] text-muted-foreground">
              {r.method} {r.endpoint}
              {r.params && Object.keys(r.params).length
                ? \` ?\${new URLSearchParams(r.params as Record<string, string>).toString()}\`
                : ""}
            </div>
            {write && describeBody(r).length > 0 && (
              <ul className="mt-1 font-mono text-[10px]">
                {describeBody(r).map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            )}
            {!write && returnedFields(r) && (
              <div className="mt-1 text-[10px]">
                返回字段 / fields: {returnedFields(r)}
              </div>
            )}
            {r.callers.length > 0 && (
              <div className="mt-1 text-[10px] text-muted-foreground">
                调用代码 / called from: {r.callers.slice(0, 4).join(" ← ")}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function RefList({ refs }: { refs: CodeRef[] }) {
  const writes = refs.filter((r) => r.kind === "write");
  const reads = refs.filter((r) => r.kind !== "write");
  const uniqReads = [...new Map(reads.map((r) => [r.label, r])).values()];
  return (
    <div className="space-y-2 text-xs">
      <div>
        <div className="font-medium">
          代码里会写入的地方 / Writes in code ({writes.length})
        </div>
        {writes.length === 0 ? (
          <p className="text-muted-foreground">无 / none</p>
        ) : (
          <ul className="space-y-1">
            {writes.slice(0, 40).map((r, i) => (
              <li key={i} className="rounded border border-destructive/30 p-1">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {r.file}:{r.line}
                  {r.depth ? \` (引用深度 \${r.depth})\` : ""}
                </span>
                <div className="break-all font-mono text-[10px]">
                  {r.snippet}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <div className="font-medium">
          代码里引用的表和关系 / Data referenced in code ({uniqReads.length})
        </div>
        <ul className="space-y-0.5">
          {uniqReads.slice(0, 60).map((r, i) => (
            <li key={i}>
              <span>{r.label}</span>{" "}
              <span className="font-mono text-[10px] text-muted-foreground">
                {r.file}:{r.line}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AiExplain({
  build,
  mode = "full",
  label,
  ready = true,
  noteKeys,
}: {
  build: () => string;
  mode?: "full" | "origin";
  label?: string;
  ready?: boolean;
  noteKeys?: string[];
}) {
  const explain = useServerFn(explainReadWrite);
  const [state, setState] = useState<{
    loading?: boolean;
    report?: ConflictReport;
    error?: string;
  }>({});
  const run = async () => {
    setState({ loading: true });
    try {
      const context = build();
      const res = await explain({
        data: { context, mode, ...(noteKeys ? { noteKeys } : {}) },
      });
      setState(
        res.report
          ? { report: res.report }
          : { error: res.error || "失败 / failed" },
      );
    } catch (e) {
      setState({ error: e instanceof Error ? e.message : String(e) });
    }
  };
  return (
    <div className="space-y-2 rounded-md border border-primary/40 p-2">
      <Button
        size="sm"
        variant="outline"
        onClick={run}
        disabled={state.loading || !ready}
      >
        <Sparkles className="mr-1 h-4 w-4" />
        {!ready
          ? "等这页数据和代码读完… / Loading evidence…"
          : state.loading
            ? "AI 解读中… / Explaining…"
            : label || "AI 解读 / Explain with AI"}
      </Button>
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}
      {state.report && <ConflictReportView report={state.report} />}
    </div>
  );
}

export default function ReadWriteInspector() {
  const [on, setOn] = useState(inspectModeOn());
  const [interact, setInteract] = useState(false);
  const [tab, setTab] = useState<Tab>("element");
  const [sub, setSub] = useState<Sub>("rw");
  const [notes, setNotes] = useState<{ element: string; page: string }>({
    element: "",
    page: "",
  });
  const [selected, setSelected] = useState<Element | null>(null);
  const [hoverBox, setHoverBox] = useState<DOMRect | null>(null);
  const [selBox, setSelBox] = useState<DOMRect | null>(null);
  const [path, setPath] = useState(currentPath());
  const requests = useRecorded();
  const panelRef = useRef<HTMLDivElement>(null);
  // Movable, resizable panel (drag the header, pull the bottom-right corner, A−/A+ scales text).
  const [box, setBox] = useState(() => {
    const w = Math.min(440, window.innerWidth - 16);
    return {
      x: window.innerWidth - w - 8,
      y: 64,
      w,
      h: Math.min(window.innerHeight - 80, 640),
    };
  });
  const [scale, setScale] = useState(1);
  // Grab any edge or corner to resize from that side.
  const startResize = (e: React.PointerEvent, d: string) => {
    e.preventDefault();
    e.stopPropagation();
    const sx = e.clientX,
      sy = e.clientY;
    const b0 = { ...box };
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - sx,
        dy = ev.clientY - sy;
      const b = { ...b0 };
      if (d.includes("e")) b.w = Math.max(280, b0.w + dx);
      if (d.includes("s")) b.h = Math.max(200, b0.h + dy);
      if (d.includes("w")) {
        b.w = Math.max(280, b0.w - dx);
        b.x = b0.x + (b0.w - b.w);
      }
      if (d.includes("n")) {
        b.h = Math.max(200, b0.h - dy);
        b.y = b0.y + (b0.h - b.h);
      }
      setBox(b);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  // Drag from anywhere on the panel except controls and scrollbars; a 4px threshold keeps plain clicks as clicks.
  const startDrag = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (
      t.closest(
        'button,input,textarea,select,a,label,[role=button],[role=option],[role=switch],[role=tab],[role=combobox],[role=checkbox],[contenteditable=""],[contenteditable=true],[data-no-drag]',
      )
    )
      return;
    if (e.nativeEvent.offsetX > t.clientWidth && t.clientWidth > 0) return;
    const el = panelRef.current;
    if (!el) return;
    const sx = e.clientX,
      sy = e.clientY;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - r.left,
      dy = e.clientY - r.top;
    let dragging = false;
    const move = (ev: PointerEvent) => {
      if (!dragging) {
        if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 4) return;
        dragging = true;
        window.getSelection()?.removeAllRanges();
        document.body.style.userSelect = "none";
      }
      setBox((b) => ({
        x: Math.max(0, Math.min(window.innerWidth - 80, ev.clientX - dx)),
        y: Math.max(0, Math.min(window.innerHeight - 40, ev.clientY - dy)),
        w: el.offsetWidth,
        h: el.offsetHeight || b.h,
      }));
    };
    const up = () => {
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // Clicks, focus and scrolling inside the inspector must not reach the page's open dialogs/popups:
  // Radix registers its outside-click, focus-trap and scroll-lock listeners on document when a popup opens,
  // i.e. after this one, so stopping them here keeps the popup open while React handlers still run.
  useEffect(() => {
    const inside = (n: EventTarget | null) =>
      n instanceof Element && !!n.closest("[data-rw-inspector]");
    const guard = (e: Event) => {
      if (!inspectModeOn()) return;
      const rel = (e as FocusEvent).relatedTarget ?? null;
      if (inside(e.target) || (e.type === "focusout" && inside(rel)))
        e.stopImmediatePropagation();
    };
    const evs = [
      "pointerdown",
      "mousedown",
      "touchstart",
      "focusin",
      "focusout",
      "wheel",
      "touchmove",
      "keydown",
    ] as const;
    evs.forEach((ev) => document.addEventListener(ev, guard));
    return () => evs.forEach((ev) => document.removeEventListener(ev, guard));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setPath(currentPath()), 700);
    return () => clearInterval(t);
  }, []);

  const toggle = () => {
    const next = !on;
    setInspectMode(next);
    setOn(next);
    if (!next) {
      setSelected(null);
      setHoverBox(null);
    }
  };

  // Select mode: clicks pick an element and never reach the app.
  useEffect(() => {
    if (!on || interact) return;
    const inPanel = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest("[data-rw-inspector]");
    const stop = (e: Event) => {
      if (inPanel(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
    };
    const click = (e: MouseEvent) => {
      if (inPanel(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      const el = inspectorTarget(e.target as Element);
      setSelected(el);
      setClickNo((n) => n + 1);
      setSelBox(el.getBoundingClientRect());
      setTab("element");
    };
    const move = (e: MouseEvent) => {
      if (inPanel(e.target)) {
        setHoverBox(null);
        return;
      }
      setHoverBox(inspectorTarget(e.target as Element).getBoundingClientRect());
    };
    const evs = [
      "pointerdown",
      "mousedown",
      "pointerup",
      "mouseup",
      "submit",
      "keydown",
    ] as const;
    evs.forEach((ev) => document.addEventListener(ev, stop, true));
    document.addEventListener("click", click, true);
    document.addEventListener("mousemove", move, true);
    return () => {
      evs.forEach((ev) => document.removeEventListener(ev, stop, true));
      document.removeEventListener("click", click, true);
      document.removeEventListener("mousemove", move, true);
      setHoverBox(null);
    };
  }, [on, interact]);

  useEffect(() => {
    if (!selected) return;
    const update = () =>
      setSelBox(selected.isConnected ? selected.getBoundingClientRect() : null);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [selected]);

  // Reads made just before a redirect into this page (/care-circle → /care-circle/28) belong to it too.
  const pageRequests = useMemo(
    () =>
      requests.filter(
        (r) =>
          r.path === path ||
          (path.startsWith(r.path.split("?")[0]! + "/") &&
            r.path.split("?")[0]!.length > 1),
      ),
    [requests, path],
  );
  const info: ElementInfo | null = useMemo(
    () => (selected ? inspectElement(selected, requests) : null),
    [selected, requests],
  );
  const [elementRefs, setElementRefs] = useState<CodeRef[]>([]);
  const [clickNo, setClickNo] = useState(0);
  const [logic, setLogic] = useState<LogicStep[] | null>(null);
  useEffect(() => {
    let live = true;
    setLogic(null);
    if (info?.sources[0])
      void traceLogic(
        info.sources[0],
        60,
        info.sources.slice(1),
        info.text,
        info.components.find(
          (c) => !/^(Card|CardContent|Button|div|p|span)$/.test(c),
        ) || "",
        info.card,
        info.itemIndex,
      ).then((r) => {
        if (live) setLogic(r);
      });
    return () => {
      live = false;
    };
  }, [selected, clickNo]);
  useEffect(() => {
    let live = true;
    setElementRefs([]);
    if (info)
      void codeRefs(
        [...new Set(info.sources.map((s) => s.split(":")[0]!))].slice(0, 2),
        1,
      ).then((r) => {
        if (live) setElementRefs(r);
      });
    return () => {
      live = false;
    };
  }, [selected, clickNo]);
  const pageFiles = useMemo(
    () => (on && tab === "page" ? pageSourceFiles() : []),
    [on, tab, path, requests.length],
  );
  const [pageRefs, setPageRefs] = useState<CodeRef[]>([]);
  const [pageRefsDone, setPageRefsDone] = useState(false);
  useEffect(() => {
    let live = true;
    setPageRefs([]);
    setPageRefsDone(false);
    // Published builds have no source markers; finish immediately so AI analysis is not locked forever.
    if (!pageFiles.length) {
      setPageRefsDone(true);
      return () => {
        live = false;
      };
    }
    void codeRefs(pageFiles, 1)
      .then((r) => {
        if (live) setPageRefs(r);
      })
      .finally(() => {
        if (live) setPageRefsDone(true);
      });
    return () => {
      live = false;
    };
  }, [pageFiles]);
  // Only code this element really uses: the innermost source file plus what it imports (read live).
  const [closure, setClosure] = useState<Set<string> | null>(null);
  useEffect(() => {
    let live = true;
    setClosure(null);
    const own = info?.sources[0]?.split(":")[0];
    if (own && logic)
      void (() => {
        // Seeds: the helper/hook files the decision logic really calls (not the whole page and everything it imports).
        const pageFiles = new Set(info!.sources.map((x) => x.split(":")[0]!));
        // Context providers (e.g. the signed-in profile) count when the logic really calls into them.
        const helpers = [
          ...new Set(logic.flatMap((st) => [st.file, ...(st.via || [])])),
        ].filter(
          (f) =>
            !pageFiles.has(f) &&
            !/^(lib\\/|integrations\\/|features\\/shared\\/|components\\/ui\\/|components\\/layout\\/|routes\\/__root)/.test(
              f,
            ),
        );
        return helpers.length
          ? Promise.resolve(new Set(helpers))
          : importClosure([own], 1).then(
              (c) => new Set([...c].filter((f) => !INFRA.test(f))),
            );
      })().then((c) => {
        if (live) setClosure(c);
      });
    return () => {
      live = false;
    };
  }, [selected, clickNo, logic]);
  const relatedRequests = useMemo(() => {
    if (!info || !closure) return [];
    // Session data (signed-in profile) is read once by a context provider, often on an earlier page.
    const session = requests.filter(
      (r) =>
        r.path !== path &&
        r.method === "GET" &&
        /^contexts\\//.test(ownerFile(r) || "") &&
        closure.has(ownerFile(r)!),
    );
    // A read belongs to this element when one of its two nearest app callers is code the element's logic runs
    // (calendar-schedule ← source.medicine counts for the medicine list). Shared hook hubs only count as the nearest caller.
    const logicText = (logic || []).map((st) => st.code.join("\\n")).join("\\n");
    // Server functions run their WordPress reads on the server; they belong to the element when its logic calls them by name.
    const own = pageRequests.filter((r) => {
      if (r.via === "server-fn") {
        const fn = r.endpoint.split("/")[1] || "";
        return !!fn && new RegExp(\`\\\\b\${fn}\\\\s*\\\\(\`).test(logicText);
      }
      const app = r.callers.filter(
        (c) =>
          !/^(features\\/shared\\/|lib\\/|integrations\\/|services\\/wp-|features\\/inspector\\/)/.test(
            c,
          ),
      );
      const ownFile = info.sources[0]?.split(":")[0];
      return app
        .slice(0, 2)
        .some(
          (c, i) =>
            (closure.has(c) && (i === 0 || !/^hooks\\//.test(c))) ||
            (i === 0 && c === ownFile),
        );
    });
    const base = [...session, ...own];
    // Row reads count when a related relation read returned that row id (proof by id, whatever code fetched it).
    const proven = new Map<string, Set<string>>();
    for (const r of base) {
      const m = r.endpoint.match(/^jet-rel\\/(\\d+)/);
      const def = m ? relById(m[1]!) : undefined;
      if (!def || !r.rows) continue;
      const ids = new Set<string>();
      const walk = (v: unknown) => {
        if (Array.isArray(v)) v.forEach(walk);
        else if (v && typeof v === "object") {
          const o = v as Record<string, unknown>;
          for (const k of ["child_object_id", "parent_object_id"])
            if (o[k] != null) ids.add(String(o[k]));
          Object.values(o).forEach((x) => typeof x === "object" && walk(x));
        } else if (v != null) ids.add(String(v));
      };
      walk(r.rows);
      for (const side of [def.parent, def.child]) {
        const n = side.match(/^(\\d+)\\./)?.[1];
        if (n) {
          const set = proven.get(n) || new Set();
          ids.forEach((x) => set.add(x));
          proven.set(n, set);
        }
      }
    }
    const orphans = [
      ...new Map(
        requests
          .filter((r) => {
            if (
              r.method !== "GET" ||
              !pageRequests.includes(r) ||
              base.includes(r)
            )
              return false;
            const m = r.endpoint.match(/^jet-cct\\/([a-z0-9_]+)\\/(\\d+)/);
            const def = m ? cctBySlug(m[1]!) : undefined;
            return !!def && !!proven.get(String(def.id))?.has(m![2]!);
          })
          .map((r) => [r.endpoint, r]),
      ).values(),
    ];
    return [...base, ...orphans];
  }, [info, pageRequests, closure, requests, path, logic]);
  const relatedIds = useMemo(
    () =>
      new Set(
        relatedRequests.map(
          (r) => \`\${r.method} \${r.endpoint} \${JSON.stringify(r.params || {})}\`,
        ),
      ),
    [relatedRequests],
  );
  // A bare small number or dash is almost always counted, not stored: a field that merely equals "0" is not its source.
  const tinyText = !!info && /^(\\d{1,3}|—|-)$/.test(info.text.trim());
  const keep = useCallback(
    (m: FieldMatch) =>
      relatedIds.has(
        \`\${m.request.method} \${m.request.endpoint} \${JSON.stringify(m.request.params || {})}\`,
      ) &&
      (!tinyText || !!m.sameCard),
    [relatedIds, tinyText],
  );
  const realMatches = useMemo(
    () => (info ? info.matches.filter(keep) : []),
    [info, keep],
  );
  const strayMatches = useMemo(
    () => (info ? info.matches.filter((m) => !keep(m)) : []),
    [info, keep],
  );

  const summaryRef = useRef<HTMLElement | null>(null);
  const narrRef = useRef<HTMLDivElement | null>(null);
  const pageNarrRef = useRef<HTMLDivElement | null>(null);
  const pathname = path.split("?")[0]!;
  // Fixed list slots (stat cards drawn by one JSX line) get their own note; data rows of one list share theirs.
  // One identity in the editor preview and the published site: component names + markup position, never source lines.
  const elementKey = info ? stableElementKey(pathname, info.anchor) : "";
  const priorKey = selected && info && selected.hasAttribute("data-inspector-id")
    ? stableElementKey(pathname, markupAnchor(selected)) : undefined;
  const uniquePriorKey = priorKey && selected &&
    [...document.querySelectorAll(selected.tagName.toLowerCase())].filter(el =>
      !el.closest("[data-rw-inspector]") && stableElementKey(pathname, markupAnchor(el)) === priorKey,
    ).length === 1 ? priorKey : undefined;
  // Old line-based key, read only to carry earlier bindings over to the new identity.
  // Old line-based key only when it really names a source line; without one it is just component names + tag,
  // shared by every element of that card.
  const legacyKey = info?.anchor.names[0]?.startsWith("scope:")
    ? [
        "el",
        pathname.replace(/\\/\\d+(?=\\/|$)/g, "/:id"),
        info.anchor.names.join("<"),
        \`@\${info.anchor.path}\`,
      ].join("|")
    : info?.sources[0]
      ? \`el|\${pathname}|\${info.sources[0] || info.components.join("<")}|\${info.tag}\${info.callSite ? \`@\${info.callSite}\` : ""}\${info.itemSlot ? \`|\${info.itemSlot}\` : ""}\`
      : "";
  const legacySourceKey =
    info &&
    !info.anchor.names[0]?.startsWith("scope:") &&
    info.sources[0]
      ? \`el|\${pathname}|\${info.sources[0]}|\${info.tag}\${info.callSite ? \`@\${info.callSite}\` : ""}\`
      : "";
  const legacyKeys = [legacyKey, legacySourceKey].filter(
    (key): key is string => !!key && key !== elementKey,
  );
  const elementAliasKey = info
    ? elementAlias(pathname, info.components, info.tag, info.itemSlot)
    : "";
  // Only a unique rendered use can inherit a source-only legacy note. Shared components and
  // repeated rows need their own explicit position binding instead of a guessed match.
  const fingerprint =
    info?.sourceFingerprint &&
    !info.itemSlot &&
    !info.callSite &&
    [...document.querySelectorAll("[data-inspector-source]")].filter(
      (el) =>
        el.getAttribute("data-inspector-source") === info.sourceFingerprint &&
        !el.closest("[data-rw-inspector]"),
    ).length === 1
      ? info.sourceFingerprint
      : undefined;
  const elementLabel = info
    ? \`<\${info.tag}> \${info.text.slice(0, 60)} · \${info.components[0] || ""}\`
    : "";
  const queryClient = useQueryClient();
  const fitContext = (value: unknown): string => JSON.stringify(value);
  // The app's own cached query results for the hooks this element's logic calls (queryKey: ["inboxCounts"] …):
  // the exact values the screen computed from, so counts like "5" can be re-added from real data.
  const cachedResults = useCallback(() => {
    const text =
      (logic || []).map((st) => st.code.join("\\n")).join("\\n") +
      "\\n" +
      (summaryRef.current?.innerText || "");
    return queryClient
      .getQueryCache()
      .findAll()
      .filter((q) => {
        const k = q.queryKey[0];
        return (
          typeof k === "string" &&
          k.length > 2 &&
          /^[\\w$]+$/.test(k) &&
          new RegExp(\`(?<![\\\\w$])\${k}(?![\\\\w$])\`).test(text)
        );
      })
      .slice(0, 15)
      .map((q) => {
        const d = q.state.data as unknown;
        return {
          queryKey: q.queryKey,
          status: q.state.status,
          length: Array.isArray(d) ? d.length : undefined,
          value: JSON.stringify(d ?? null, (_k, v) =>
            v instanceof Map
              ? Object.fromEntries(v)
              : v instanceof Set
                ? [...v]
                : v,
          ).slice(0, 1500),
          size: d instanceof Map || d instanceof Set ? d.size : undefined,
        };
      });
  }, [queryClient, logic]);
  // Server re-reads full actual source for this page in preview and published builds; no evidence cap.
  const elementContext = useCallback(
    () =>
      fitContext({
        manualNotes: {
          element: notes.element || null,
          page: notes.page || null,
        },
        deterministicSummary:
          (
            (narrRef.current?.innerText || "") +
            "\\n" +
            (summaryRef.current?.innerText || "")
          ).slice(0, 7000) || null,
        cachedQueryResults: cachedResults(),
        otherCachedQueries: queryClient
          .getQueryCache()
          .findAll()
          .map((q) => String(q.queryKey[0]))
          .filter((k, i, a) => a.indexOf(k) === i)
          .slice(0, 60),
        // Dictionary column names and option meanings for every table this element really read (b55 → "accepted").
        dictionary: Object.fromEntries(
          [
            ...new Map(
              pageRequests
                .map((r) => {
                  const t = decodeEndpoint(r.method, r.endpoint);
                  const d = (t.cct || t.rel) as
                    | {
                        f?: Record<string, string>;
                        opt?: Record<string, Record<string, string>>;
                      }
                    | undefined;
                  return [
                    t.label
                      .replace(/\\s*#\\d+$/, "")
                      .replace(/ (?:parents|children) of \\d+$/, ""),
                    d
                      ? {
                          columns: d.f,
                          fieldTypes: t.cct
                            ? Object.fromEntries(
                                Object.values(t.cct.f || {}).map((c) => [
                                  c,
                                  fieldType(t.cct, c) || "?",
                                ]),
                              )
                            : undefined,
                          options: d.opt,
                        }
                      : null,
                  ] as const;
                })
                .filter(([, d]) => d),
            ).entries(),
          ].slice(0, 30),
        ),
        page: path,
        uiLanguage: document.documentElement.lang || navigator.language,
        element: info && {
          tag: info.tag,
          text: info.text,
          sources: info.sources,
          components: info.components,
          link: info.link,
          handlers: info.handlers,
          shownValueExpression: logic
            ? decidingExpression(logic, info.text)
            : null,
          anchor: info.anchor,
          decisionLogic: (logic || []).map((st) => ({
            title: st.title,
            at: \`\${st.file}:\${st.line}\`,
            code: st.code.join("\\n"),
            fallbackLines: st.fallbacks.map((j) => st.line + j),
          })),
          props: info.props,
          unrelatedSameText: strayMatches.map(
            (m) => m.target.label + " #" + m.row,
          ),
          pageValueMatches: (info?.matches || []).slice(0, 12).map((m) => ({
            related: realMatches.includes(m),
            sameCard: !!m.sameCard,
            target: m.target.label,
            row: m.row,
            field: m.field,
            fieldName: m.fieldName,
            value: m.value,
            chain: traceRow(m.row, m.request, pageRequests, path).map(
              (x) => x.text,
            ),
          })),
          fieldMatches: realMatches.map((m) => ({
            chain: traceRow(m.row, m.request, pageRequests, path).map(
              (x) => x.text,
            ),
            target: m.target.label,
            row: m.row,
            field: m.field,
            fieldName: m.fieldName,
            option: m.option,
            value: m.value,
          })),
        },
        // Reads elsewhere on the page, not yet proven to feed this element; usable only when the element's code calls that fetch.
        otherPageReads: pageRequests
          .filter((r) => !relatedRequests.includes(r))
          .slice(0, 100)
          .map((r) => ({
            target: decodeEndpoint(r.method, r.endpoint).label,
            endpoint: r.endpoint,
            returnedRows:
              r.rows === undefined
                ? "not loaded"
                : Array.isArray(r.rows)
                  ? r.rows.length
                  : 1,
            rowSample:
              r.rows === undefined
                ? undefined
                : JSON.stringify(r.rows).slice(0, 300),
            callers: (r.callers || []).slice(0, 2),
          })),
        liveRequests: relatedRequests.map((r) => ({
          method: r.method,
          endpoint: r.endpoint,
          target: decodeEndpoint(r.method, r.endpoint).label,
          blocked: r.blocked,
          body: describeBody(r),
          fields: returnedFields(r),
          returnedRows:
            r.rows === undefined
              ? "not loaded"
              : Array.isArray(r.rows)
                ? r.rows.length
                : 1,
          rowSample:
            r.rows === undefined
              ? undefined
              : JSON.stringify(r.rows).slice(0, 800),
          callers: r.callers,
        })),
        codeRefs: elementRefs.slice(0, 80).map((r) => ({
          kind: r.kind,
          label: r.label,
          file: \`\${r.file}:\${r.line}\`,
          snippet: r.snippet,
        })),
      }),
    [
      path,
      info,
      relatedRequests,
      elementRefs,
      logic,
      realMatches,
      strayMatches,
      pageRequests,
      cachedResults,
      notes,
    ],
  );

  const pageContext = useCallback(
    () =>
      fitContext({
        page: path,
        files: pageFiles,
        manualNotes: { page: notes.page || null },
        descriptiveSummary:
          pageNarrRef.current?.innerText.slice(0, 8000) || null,
        dictionary: Object.fromEntries(
          [
            ...new Map(
              pageRequests
                .map((r) => {
                  const t = decodeEndpoint(r.method, r.endpoint);
                  const d = (t.cct || t.rel) as
                    | {
                        f?: Record<string, string>;
                        opt?: Record<string, Record<string, string>>;
                      }
                    | undefined;
                  return [
                    t.label
                      .replace(/\\s*#\\d+$/, "")
                      .replace(/ (?:parents|children) of \\d+$/, ""),
                    d
                      ? {
                          columns: d.f,
                          fieldTypes: t.cct
                            ? Object.fromEntries(
                                Object.values(t.cct.f || {}).map((c) => [
                                  c,
                                  fieldType(t.cct, c) || "?",
                                ]),
                              )
                            : undefined,
                          options: d.opt,
                        }
                      : null,
                  ] as const;
                })
                .filter(([, d]) => d),
            ).entries(),
          ].slice(0, 30),
        ),
        liveRequests: pageRequests.map((r) => ({
          method: r.method,
          endpoint: r.endpoint,
          target: decodeEndpoint(r.method, r.endpoint).label,
          blocked: r.blocked,
          body: describeBody(r),
          fields: returnedFields(r),
          callers: r.callers,
        })),
        codeRefs: pageRefs.slice(0, 150).map((r) => ({
          kind: r.kind,
          label: r.label,
          file: \`\${r.file}:\${r.line}\`,
          snippet: r.snippet,
        })),
      }),
    [path, pageFiles, pageRequests, pageRefs, notes],
  );

  return (
    <div data-rw-inspector style={{ pointerEvents: "auto" }}>
      {!on && (
        <button
          type="button"
          onClick={toggle}
          data-rw-inspector
          style={{ pointerEvents: "auto" }}
          className={\`fixed right-3 top-16 z-[10000] flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium shadow-md \${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"}\`}
        >
          <ScanSearch className="h-4 w-4" />
          读写核对 / Inspect
        </button>
      )}
      {on && !interact && hoverBox && (
        <div
          className="pointer-events-none fixed z-[9998] border-2 border-dashed border-primary/70"
          style={{
            left: hoverBox.left,
            top: hoverBox.top,
            width: hoverBox.width,
            height: hoverBox.height,
          }}
        />
      )}
      {on && selBox && (
        <div
          className="pointer-events-none fixed z-[9998] border-2 border-primary bg-primary/10"
          style={{
            left: selBox.left,
            top: selBox.top,
            width: selBox.width,
            height: selBox.height,
          }}
        />
      )}
      {on && (
        <div
          ref={panelRef}
          className="fixed z-[9999] flex flex-col overflow-hidden rounded-lg border border-border bg-background text-foreground shadow-2xl"
          style={{
            left: box.x,
            top: box.y,
            width: box.w,
            height: box.h,
            pointerEvents: "auto",
          }}
          onPointerDown={startDrag}
        >
          {(["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const).map((d) => (
            <div
              key={d}
              onPointerDown={(e) => startResize(e, d)}
              className="absolute z-10"
              style={{
                ...(d.includes("n")
                  ? { top: 0 }
                  : d.includes("s")
                    ? { bottom: 0 }
                    : { top: 8, bottom: 8 }),
                ...(d.includes("w")
                  ? { left: 0 }
                  : d.includes("e")
                    ? { right: 0 }
                    : { left: 8, right: 8 }),
                width: d.length === 2 || d === "e" || d === "w" ? 8 : undefined,
                height:
                  d.length === 2 || d === "n" || d === "s" ? 8 : undefined,
                cursor: \`\${d}-resize\`,
                touchAction: "none",
              }}
            />
          ))}
          <div
            className="flex cursor-move touch-none select-none items-center gap-2 border-b border-border p-3"
            title="面板任意空白处都可拖动 / Drag anywhere to move"
          >
            <Button
              size="sm"
              variant="ghost"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() =>
                setScale((z) => Math.max(0.6, +(z - 0.1).toFixed(1)))
              }
              aria-label="缩小 / Smaller"
            >
              A−
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() =>
                setScale((z) => Math.min(1.4, +(z + 0.1).toFixed(1)))
              }
              aria-label="放大 / Larger"
            >
              A+
            </Button>
            <div className="flex-1">
              <div className="text-sm font-semibold">
                读写核对器 / Read-write inspector
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={toggle}
              aria-label="关闭 / Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-1 border-b border-border p-2">
            <Button
              size="sm"
              variant={interact ? "outline" : "default"}
              onClick={() => setInteract(false)}
            >
              <MousePointerClick className="mr-1 h-4 w-4" />
              选择 / Select
            </Button>
            <Button
              size="sm"
              variant={interact ? "default" : "outline"}
              onClick={() => setInteract(true)}
            >
              <Navigation className="mr-1 h-4 w-4" />
              浏览 / Browse
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={clearRecorded}
              aria-label="清空记录 / Clear"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-1 border-b border-border p-2 text-xs">
            {(["element", "page", "site"] as Tab[]).map((t) => (
              <Button
                key={t}
                size="sm"
                variant={tab === t ? "secondary" : "ghost"}
                onClick={() => setTab(t)}
              >
                {t === "element"
                  ? "元素 / Element"
                  : t === "page"
                    ? "整页 / Page"
                    : "全站 / Site"}
              </Button>
            ))}
          </div>
          <div
            className={
              tab === "site"
                ? "hidden"
                : "flex gap-1 border-b border-border p-2 text-xs"
            }
          >
            {(["rw", "ai", "notes"] as Sub[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSub(t)}
                className={\`rounded-md border px-2 py-1 \${sub === t ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}\`}
              >
                {t === "rw"
                  ? "读写分析"
                  : t === "ai"
                    ? "AI 分析"
                    : \`手动注释\${(tab === "element" ? notes.element : notes.page) ? " ●" : ""}\`}
              </button>
            ))}
          </div>
          <div
            className="flex-1 space-y-4 overflow-y-auto p-3 text-sm"
            style={{ zoom: scale }}
          >
            <div className={tab === "site" ? "" : "hidden"}>
              <SiteAnalysis />
            </div>
            {interact && (
              <p className="rounded-md bg-muted p-2 text-xs">
                浏览模式：可以正常点击和跳转。要查看某个元素，切回「选择」。 /
                Browse mode: navigate freely.
              </p>
            )}
            {tab === "element" && !info && (
              <p className="text-xs text-muted-foreground">
                在「选择」模式下点页面上任意元素。 / In Select mode, click any
                element on the page.
              </p>
            )}
            {tab === "element" && info && (
              <>
                <section className="space-y-1 text-xs">
                  <div className="font-medium">
                    元素 / Element: &lt;{info.tag}&gt;{" "}
                    {info.text && (
                      <span className="text-muted-foreground">
                        “{info.text.slice(0, 80)}”
                      </span>
                    )}
                  </div>
                  <div>
                    组件 / Components:{" "}
                    {info.components.join(" ← ") || "未识别 / unknown"}
                  </div>
                  <div className="break-all font-mono text-[10px]">
                    源文件 / Source:{" "}
                    {info.sources.join(" ← ") ||
                      "分析时从当前页面代码读取 / Resolved from deployment source during analysis"}
                  </div>
                  {info.link && (
                    <div>
                      跳转 / Goes to:{" "}
                      <span className="font-mono">{info.link}</span>
                    </div>
                  )}
                </section>
                <div className={sub === "ai" ? "" : "hidden"}>
                  <AiExplain
                    key={\`o-\${elementKey}-\${info.text}\`}
                    build={elementContext}
                    mode="origin"
                    ready={!!info}
                    label="生成 AI 分析 / Generate AI analysis"
                    noteKeys={[elementKey, legacyKey, \`page|\${pathname}\`]}
                  />
                </div>
                <div
                  className={sub === "notes" ? "" : "hidden"}
                  data-note-key={elementKey}
                  data-note-label={elementLabel}
                >
                  <ManualNotes
                    key={elementKey}
                    noteKey={elementKey}
                    priorKey={uniquePriorKey}
                    legacyKey={legacyKey || undefined}
                    legacySourceKey={legacySourceKey || undefined}
                    legacyKeys={legacyKeys}
                    fingerprint={fingerprint}
                    alias={elementAliasKey}
                    scope="element"
                    page={pathname}
                    label={elementLabel}
                    source={
                      info.itemSlot || info.callSite
                        ? undefined
                        : info.sources[0]
                    }
                    tag={info.tag}
                    buildEvidence={elementContext}
                    evidenceReady={!!info}
                    onChange={(t) => setNotes((n) => ({ ...n, element: t }))}
                  />
                </div>
                <div className={sub === "rw" ? "space-y-4" : "hidden"}>
                  <div ref={narrRef}>
                    <ReadWriteNarrative
                      scope="element"
                      text={info.text}
                      matches={realMatches}
                      requests={relatedRequests}
                      refs={elementRefs}
                      handlers={info.handlers}
                    />
                  </div>
                  <section className="space-y-1" ref={summaryRef}>
                    <div className="text-xs font-medium">
                      显示的值来自 / Shown value comes from
                    </div>
                    <OriginSummary
                      text={info.text}
                      matches={realMatches}
                      reads={
                        closure
                          ? relatedRequests.filter((r) => r.method === "GET")
                          : []
                      }
                      pageRequests={pageRequests}
                      path={path}
                      logic={logic}
                      expr={logic ? decidingExpression(logic, info.text) : null}
                      account={
                        realMatches.length ? [] : accountMatches(info.text)
                      }
                      files={[
                        ...new Set(info.sources.map((x) => x.split(":")[0]!)),
                      ]}
                    />
                  </section>
                  {strayMatches.length > 0 && (
                    <p className="text-[10px] text-muted-foreground">
                      另有 {strayMatches.length} 条同文字数据来自别的功能（如{" "}
                      {strayMatches[0]!.target.label}
                      ），与这个元素无关，已排除。 / Same text found in
                      unrelated data, excluded.
                    </p>
                  )}
                  <section className="space-y-1">
                    <div className="text-xs font-medium">
                      数据链 / Data chain{" "}
                      {closure
                        ? \`(\${relatedRequests.filter((r) => r.method === "GET").length})\`
                        : "…"}
                    </div>
                    <DataChain
                      requests={relatedRequests.filter(
                        (r) => r.method === "GET",
                      )}
                    />
                  </section>
                  <section className="space-y-1">
                    <div className="text-xs font-medium">
                      判定逻辑 / Decision logic{" "}
                      {logic ? \`(\${logic.length})\` : "…"}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      现场读取当前代码：显示这段内容的代码、它的值在哪里被决定、调用了哪些判定函数。红色行是兜底/默认值（||
                      ?? catch 默认分支）。 / Read live from current code; red
                      lines are fallbacks.
                    </p>
                    {logic?.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        没找到 / none found
                      </p>
                    )}
                    {logic?.map((st, i) => (
                      <div key={i} className="rounded border border-border">
                        <div className="border-b border-border bg-muted/50 px-2 py-0.5 text-[10px]">
                          {st.title} ·{" "}
                          <span className="font-mono">
                            {st.file}:{st.line}
                          </span>
                          {st.fallbacks.length > 0 && (
                            <span className="ml-1 rounded bg-destructive px-1 text-destructive-foreground">
                              兜底 fallback ×{st.fallbacks.length}
                            </span>
                          )}
                        </div>
                        <pre className="max-h-56 overflow-auto p-1 font-mono text-[10px] leading-snug">
                          {st.code.map((l, j) => (
                            <div
                              key={j}
                              className={
                                st.fallbacks.includes(j)
                                  ? "bg-destructive/15"
                                  : ""
                              }
                            >
                              <span className="mr-2 select-none text-muted-foreground">
                                {st.line + j}
                              </span>
                              {l}
                            </div>
                          ))}
                        </pre>
                      </div>
                    ))}
                  </section>
                  {info.props.length > 0 && (
                    <section className="space-y-1">
                      <div className="text-xs font-medium">
                        组件拿到的数据 / Data passed to the component
                      </div>
                      <ul className="space-y-1">
                        {info.props.map((p, i) => (
                          <li
                            key={i}
                            className="break-all rounded bg-muted p-1 font-mono text-[10px]"
                          >
                            {p.component}.{p.prop} = {p.value}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  {info.handlers.length > 0 && (
                    <section className="space-y-1">
                      <div className="text-xs font-medium">
                        点击时会执行 / On click runs (未执行 / not run)
                      </div>
                      {info.handlers.map((h, i) => (
                        <pre
                          key={i}
                          className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 font-mono text-[10px]"
                        >
                          {h.prop} @ {h.owner}
                          {"\\n"}
                          {h.code}
                        </pre>
                      ))}
                    </section>
                  )}
                  <section className="space-y-1">
                    <div className="text-xs font-medium">
                      这个组件实际发出的请求 / Live requests from this component
                    </div>
                    <RequestList requests={relatedRequests} />
                  </section>
                  <section>
                    <RefList refs={elementRefs} />
                  </section>
                </div>
              </>
            )}
            {tab === "page" && (
              <>
                <div className="text-xs">
                  页面 / Page: <span className="font-mono">{path}</span>
                </div>
                <div className={sub === "ai" ? "" : "hidden"}>
                  <AiExplain
                    key={\`p-\${pathname}\`}
                    build={pageContext}
                    ready={pageRefsDone}
                    label="生成整页 AI 分析 / Generate page AI analysis"
                    noteKeys={[\`page|\${pathname}\`]}
                  />
                </div>
                <div className={sub === "rw" ? "space-y-4" : "hidden"}>
                  <div ref={pageNarrRef}>
                    <ReadWriteNarrative
                      scope="page"
                      matches={[]}
                      requests={pageRequests}
                      refs={pageRefs}
                    />
                  </div>
                  <section className="space-y-1">
                    <div className="text-xs font-medium">
                      本页实际读写 / Live reads and writes on this page (
                      {pageRequests.length})
                    </div>
                    <RequestList requests={pageRequests} />
                  </section>
                  <section className="space-y-1 text-xs">
                    <div className="font-medium">
                      本页用到的源文件 / Source files on this page (
                      {pageFiles.length})
                    </div>
                    <div className="break-all font-mono text-[10px] text-muted-foreground">
                      {pageFiles.join(" · ") ||
                        "分析时从当前页面代码读取 / Resolved from deployment source during analysis"}
                    </div>
                  </section>
                  <section>
                    <RefList refs={pageRefs} />
                  </section>
                </div>
              </>
            )}
            {on && (
              <div
                className={tab === "page" && sub === "notes" ? "" : "hidden"}
              >
                <ManualNotes
                  key={\`page|\${pathname}\`}
                  noteKey={\`page|\${pathname}\`}
                  scope="page"
                  page={pathname}
                  label={pathname}
                  buildEvidence={pageContext}
                  evidenceReady={pageRefsDone}
                  onChange={(t) => setNotes((n) => ({ ...n, page: t }))}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
`;export{e as default};