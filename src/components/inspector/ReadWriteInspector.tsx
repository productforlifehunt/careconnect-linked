import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useServerFn } from "@tanstack/react-start";
import { X, ScanSearch, MousePointerClick, Navigation, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRecorded, subscribeRecorder, clearRecorded, inspectModeOn, setInspectMode, type RecordedRequest } from "@/features/inspector/recorder";
import { decodeEndpoint, codeRefs, fieldName, optionName, type CodeRef } from "@/features/inspector/decode";
import { inspectElement, pageSourceFiles, type ElementInfo } from "@/features/inspector/inspect-dom";
import { explainReadWrite } from "@/lib/inspector-ai.functions";

type Tab = "element" | "page" | "log";

function useRecorded(): RecordedRequest[] {
  return useSyncExternalStore(subscribeRecorder, getRecorded, getRecorded);
}

function currentPath() { return window.location.pathname + window.location.search; }

function describeBody(req: RecordedRequest): string[] {
  const body = req.body;
  if (!body || typeof body !== "object") return [];
  const t = decodeEndpoint(req.method, req.endpoint);
  const def = t.cct || t.rel;
  const lines: string[] = [];
  const walk = (obj: Record<string, unknown>, prefix: string, d: any) => {
    for (const [k, v] of Object.entries(obj)) {
      if (v && typeof v === "object" && !Array.isArray(v)) { walk(v as Record<string, unknown>, `${prefix}${k}.`, k === "meta" ? t.rel : d); continue; }
      const name = fieldName(d, k); const opt = optionName(d, k, v);
      lines.push(`${prefix}${k}${name ? ` (${name})` : ""} = ${JSON.stringify(v).slice(0, 80)}${opt ? ` → ${opt}` : ""}`);
    }
  };
  walk(body as Record<string, unknown>, "", def);
  return lines;
}

function returnedFields(req: RecordedRequest): string {
  const rows = Array.isArray(req.rows) ? req.rows : req.rows ? [req.rows] : [];
  const first = rows[0] as Record<string, unknown> | undefined;
  if (!first || typeof first !== "object") return "";
  const t = decodeEndpoint(req.method, req.endpoint);
  const keys = Object.keys(first).filter((k) => !k.startsWith("cct_")).slice(0, 30);
  const meta = first["meta"] && typeof first["meta"] === "object" ? Object.keys(first["meta"] as object).map((k) => `meta.${k}${fieldName(t.rel, k) ? ` (${fieldName(t.rel, k)})` : ""}`) : [];
  return [...keys.filter((k) => k !== "meta").map((k) => `${k}${fieldName(t.cct, k) ? ` (${fieldName(t.cct, k)})` : ""}`), ...meta].join(" · ");
}

function RequestList({ requests }: { requests: RecordedRequest[] }) {
  if (!requests.length) return <p className="text-xs text-muted-foreground">没有记录到请求 / No requests recorded.</p>;
  const groups = new Map<string, RecordedRequest[]>();
  for (const r of requests) {
    const t = decodeEndpoint(r.method, r.endpoint);
    const k = `${r.method}|${t.key}|${t.action}`;
    groups.set(k, [...(groups.get(k) || []), r]);
  }
  return (
    <ul className="space-y-2">
      {[...groups.values()].map((list) => {
        const r = list[0]!; const t = decodeEndpoint(r.method, r.endpoint);
        const write = r.method !== "GET";
        return (
          <li key={r.id} className={`rounded-md border p-2 text-xs ${write ? "border-destructive/40 bg-destructive/5" : "border-border bg-muted/30"}`}>
            <div className="flex flex-wrap items-center gap-1 font-medium">
              <span className={`rounded px-1 ${write ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}>{t.action}</span>
              <span>{t.label}</span>
              {list.length > 1 && <span className="text-muted-foreground">×{list.length}</span>}
              {r.blocked && <span className="rounded bg-secondary px-1 text-secondary-foreground">已拦截未写入 / held back</span>}
            </div>
            <div className="mt-1 break-all font-mono text-[10px] text-muted-foreground">{r.method} {r.endpoint}{r.params && Object.keys(r.params).length ? ` ?${new URLSearchParams(r.params as Record<string, string>).toString()}` : ""}</div>
            {write && describeBody(r).length > 0 && <ul className="mt-1 font-mono text-[10px]">{describeBody(r).map((l) => <li key={l}>{l}</li>)}</ul>}
            {!write && returnedFields(r) && <div className="mt-1 text-[10px]">返回字段 / fields: {returnedFields(r)}</div>}
            {r.callers.length > 0 && <div className="mt-1 text-[10px] text-muted-foreground">调用代码 / called from: {r.callers.slice(0, 4).join(" ← ")}</div>}
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
        <div className="font-medium">代码里会写入的地方 / Writes in code ({writes.length})</div>
        {writes.length === 0 ? <p className="text-muted-foreground">无 / none</p> : (
          <ul className="space-y-1">{writes.slice(0, 40).map((r, i) => (
            <li key={i} className="rounded border border-destructive/30 p-1"><span className="font-mono text-[10px] text-muted-foreground">{r.file}:{r.line}{r.depth ? ` (引用深度 ${r.depth})` : ""}</span><div className="break-all font-mono text-[10px]">{r.snippet}</div></li>
          ))}</ul>
        )}
      </div>
      <div>
        <div className="font-medium">代码里引用的表和关系 / Data referenced in code ({uniqReads.length})</div>
        <ul className="space-y-0.5">{uniqReads.slice(0, 60).map((r, i) => <li key={i}><span>{r.label}</span> <span className="font-mono text-[10px] text-muted-foreground">{r.file}:{r.line}</span></li>)}</ul>
      </div>
    </div>
  );
}

function AiExplain({ build }: { build: () => string }) {
  const explain = useServerFn(explainReadWrite);
  const [state, setState] = useState<{ loading?: boolean; text?: string; error?: string }>({});
  const run = async () => {
    setState({ loading: true });
    try {
      const res = await explain({ data: { context: build().slice(0, 60_000) } });
      setState(res.text ? { text: res.text } : { error: res.error || "失败 / failed" });
    } catch (e) { setState({ error: e instanceof Error ? e.message : String(e) }); }
  };
  return (
    <div className="space-y-2">
      <Button size="sm" variant="outline" onClick={run} disabled={state.loading}><Sparkles className="mr-1 h-4 w-4" />{state.loading ? "AI 解读中… / Explaining…" : "AI 解读 / Explain with AI"}</Button>
      {state.error && <p className="text-xs text-destructive">{state.error}</p>}
      {state.text && <div className="whitespace-pre-wrap rounded-md bg-muted/40 p-2 text-xs">{state.text}</div>}
    </div>
  );
}

export default function ReadWriteInspector() {
  const [on, setOn] = useState(inspectModeOn());
  const [interact, setInteract] = useState(false);
  const [tab, setTab] = useState<Tab>("element");
  const [selected, setSelected] = useState<Element | null>(null);
  const [hoverBox, setHoverBox] = useState<DOMRect | null>(null);
  const [selBox, setSelBox] = useState<DOMRect | null>(null);
  const [path, setPath] = useState(currentPath());
  const requests = useRecorded();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { const t = setInterval(() => setPath(currentPath()), 700); return () => clearInterval(t); }, []);

  const toggle = () => { const next = !on; setInspectMode(next); setOn(next); if (!next) { setSelected(null); setHoverBox(null); } };

  // Select mode: clicks pick an element and never reach the app.
  useEffect(() => {
    if (!on || interact) return;
    const inPanel = (t: EventTarget | null) => t instanceof Element && !!t.closest("[data-rw-inspector]");
    const stop = (e: Event) => { if (inPanel(e.target)) return; e.preventDefault(); e.stopPropagation(); };
    const click = (e: MouseEvent) => {
      if (inPanel(e.target)) return;
      e.preventDefault(); e.stopPropagation();
      const el = e.target as Element; setSelected(el); setClickNo((n) => n + 1); setSelBox(el.getBoundingClientRect()); setTab("element");
    };
    const move = (e: MouseEvent) => { if (inPanel(e.target)) { setHoverBox(null); return; } setHoverBox((e.target as Element).getBoundingClientRect()); };
    const evs = ["pointerdown", "mousedown", "pointerup", "mouseup", "submit", "keydown"] as const;
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
    const update = () => setSelBox(selected.isConnected ? selected.getBoundingClientRect() : null);
    window.addEventListener("scroll", update, true); window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [selected]);

  const pageRequests = useMemo(() => requests.filter((r) => r.path === path), [requests, path]);
  const info: ElementInfo | null = useMemo(() => (selected ? inspectElement(selected, requests) : null), [selected, requests]);
  const [elementRefs, setElementRefs] = useState<CodeRef[]>([]);
  const [clickNo, setClickNo] = useState(0);
  useEffect(() => {
    let live = true; setElementRefs([]);
    if (info) void codeRefs(info.sources.slice(0, 3).map((s) => s.split(":")[0]!), 0).then((r) => { if (live) setElementRefs(r); });
    return () => { live = false; };
  }, [selected, clickNo]);
  const pageFiles = useMemo(() => (on && tab === "page" ? pageSourceFiles() : []), [on, tab, path, requests.length]);
  const [pageRefs, setPageRefs] = useState<CodeRef[]>([]);
  useEffect(() => {
    let live = true; setPageRefs([]);
    if (pageFiles.length) void codeRefs(pageFiles, 1).then((r) => { if (live) setPageRefs(r); });
    return () => { live = false; };
  }, [pageFiles]);
  const relatedRequests = useMemo(() => {
    if (!info) return [];
    const files = info.sources.map((s) => s.split(":")[0]!);
    return pageRequests.filter((r) => r.callers.some((c) => files.includes(c)) || info.matches.some((m) => m.request.id === r.id));
  }, [info, pageRequests]);

  const elementContext = useCallback(() => JSON.stringify({
    page: path, element: info && { tag: info.tag, text: info.text, sources: info.sources, components: info.components, link: info.link, handlers: info.handlers,
      fieldMatches: info.matches.map((m) => ({ target: m.target.label, row: m.row, field: m.field, fieldName: m.fieldName, option: m.option, value: m.value })) },
    liveRequests: relatedRequests.map((r) => ({ method: r.method, endpoint: r.endpoint, target: decodeEndpoint(r.method, r.endpoint).label, blocked: r.blocked, body: describeBody(r), fields: returnedFields(r), callers: r.callers })),
    codeRefs: elementRefs.slice(0, 80).map((r) => ({ kind: r.kind, label: r.label, file: `${r.file}:${r.line}`, snippet: r.snippet })),
  }), [path, info, relatedRequests, elementRefs]);

  const pageContext = useCallback(() => JSON.stringify({
    page: path, files: pageFiles,
    liveRequests: pageRequests.map((r) => ({ method: r.method, endpoint: r.endpoint, target: decodeEndpoint(r.method, r.endpoint).label, blocked: r.blocked, body: describeBody(r), fields: returnedFields(r), callers: r.callers })),
    codeRefs: pageRefs.slice(0, 150).map((r) => ({ kind: r.kind, label: r.label, file: `${r.file}:${r.line}`, snippet: r.snippet })),
  }), [path, pageFiles, pageRequests, pageRefs]);

  return (
    <div data-rw-inspector>
      {!on && <button type="button" onClick={toggle}
        className={`fixed right-3 top-16 z-[10000] flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium shadow-md ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"}`}>
        <ScanSearch className="h-4 w-4" />读写核对 / Inspect
      </button>}
      {on && !interact && hoverBox && (
        <div className="pointer-events-none fixed z-[9998] border-2 border-dashed border-primary/70" style={{ left: hoverBox.left, top: hoverBox.top, width: hoverBox.width, height: hoverBox.height }} />
      )}
      {on && selBox && (
        <div className="pointer-events-none fixed z-[9998] border-2 border-primary bg-primary/10" style={{ left: selBox.left, top: selBox.top, width: selBox.width, height: selBox.height }} />
      )}
      {on && (
        <div ref={panelRef} className="fixed bottom-0 right-0 top-0 z-[9999] flex w-full max-w-[440px] flex-col border-l border-border bg-background text-foreground shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border p-3 pt-28 sm:pt-3">
            <div className="flex-1">
              <div className="text-sm font-semibold">读写核对模式 / Read-write inspector</div>
              <div className="text-[11px] text-muted-foreground">只看不写：所有写入都会被拦截 / View only: every write is held back</div>
            </div>
            <Button size="icon" variant="ghost" onClick={toggle} aria-label="关闭 / Close"><X className="h-4 w-4" /></Button>
          </div>
          <div className="flex gap-1 border-b border-border p-2">
            <Button size="sm" variant={interact ? "outline" : "default"} onClick={() => setInteract(false)}><MousePointerClick className="mr-1 h-4 w-4" />选择 / Select</Button>
            <Button size="sm" variant={interact ? "default" : "outline"} onClick={() => setInteract(true)}><Navigation className="mr-1 h-4 w-4" />浏览 / Browse</Button>
            <Button size="sm" variant="ghost" onClick={clearRecorded} aria-label="清空记录 / Clear"><Trash2 className="h-4 w-4" /></Button>
          </div>
          <div className="flex gap-1 border-b border-border p-2 text-xs">
            {(["element", "page", "log"] as Tab[]).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-md px-2 py-1 ${tab === t ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"}`}>
                {t === "element" ? "元素 / Element" : t === "page" ? "整页 / Page" : `全部记录 / Log (${requests.length})`}
              </button>
            ))}
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-3 text-sm">
            {interact && <p className="rounded-md bg-muted p-2 text-xs">浏览模式：可以正常点击和跳转，写入仍会被拦截。要查看某个元素，切回「选择」。 / Browse mode: navigate freely; writes are still held back.</p>}
            {tab === "element" && !info && <p className="text-xs text-muted-foreground">在「选择」模式下点页面上任意元素。 / In Select mode, click any element on the page.</p>}
            {tab === "element" && info && (
              <>
                <section className="space-y-1 text-xs">
                  <div className="font-medium">元素 / Element: &lt;{info.tag}&gt; {info.text && <span className="text-muted-foreground">“{info.text.slice(0, 80)}”</span>}</div>
                  <div>组件 / Components: {info.components.join(" ← ") || "未识别 / unknown"}</div>
                  <div className="break-all font-mono text-[10px]">源文件 / Source: {info.sources.join(" ← ") || "仅预览版可见 / only in the preview build"}</div>
                  {info.link && <div>跳转 / Goes to: <span className="font-mono">{info.link}</span></div>}
                </section>
                <section className="space-y-1">
                  <div className="text-xs font-medium">显示的值来自 / Shown value comes from ({info.matches.length})</div>
                  {info.matches.length === 0 ? <p className="text-xs text-muted-foreground">没在本次读取的数据里找到这段文字（可能是固定文字或经过换算） / Not found in recorded data (static text or computed).</p> : (
                    <ul className="space-y-1 text-xs">{info.matches.slice(0, 12).map((m, i) => (
                      <li key={i} className="rounded border border-border p-1">{m.target.label} · 行 row #{m.row} · <span className="font-mono">{m.field}</span>{m.fieldName && ` (${m.fieldName})`}{m.option && ` → ${m.option}`} = “{m.value}”</li>
                    ))}</ul>
                  )}
                </section>
                {info.handlers.length > 0 && (
                  <section className="space-y-1">
                    <div className="text-xs font-medium">点击时会执行 / On click runs (未执行 / not run)</div>
                    {info.handlers.map((h, i) => <pre key={i} className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-muted p-2 font-mono text-[10px]">{h.prop} @ {h.owner}{"\n"}{h.code}</pre>)}
                  </section>
                )}
                <section className="space-y-1"><div className="text-xs font-medium">这个组件实际发出的请求 / Live requests from this component</div><RequestList requests={relatedRequests} /></section>
                <section><RefList refs={elementRefs} /></section>
                <AiExplain build={elementContext} />
              </>
            )}
            {tab === "page" && (
              <>
                <div className="text-xs">页面 / Page: <span className="font-mono">{path}</span></div>
                <section className="space-y-1"><div className="text-xs font-medium">本页实际读写 / Live reads and writes on this page ({pageRequests.length})</div><RequestList requests={pageRequests} /></section>
                <section className="space-y-1 text-xs"><div className="font-medium">本页用到的源文件 / Source files on this page ({pageFiles.length})</div><div className="break-all font-mono text-[10px] text-muted-foreground">{pageFiles.join(" · ") || "仅预览版可见 / only in the preview build"}</div></section>
                <section><RefList refs={pageRefs} /></section>
                <AiExplain build={pageContext} />
              </>
            )}
            {tab === "log" && <RequestList requests={[...requests].reverse()} />}
          </div>
        </div>
      )}
    </div>
  );
}
