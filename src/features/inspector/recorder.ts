/**
 * Read/write inspector recorder (researcher-only, browser-only).
 *
 * Every WordPress request that goes through wordpressFetchRaw is recorded here
 * while the signed-in account is the researcher. When inspect mode is on, any
 * write (POST/PUT/PATCH/DELETE) is recorded and NOT sent, so checking a page
 * can never change data.
 */
import { getStoredWPUser } from "@/services/wp-auth";

export const RESEARCHER_LOGIN = "researcher";
const MODE_KEY = "cc_rw_inspector";
const MAX_ENTRIES = 600;
const MAX_ROWS = 40;

export interface RecordedRequest {
  id: number;
  at: number;
  path: string;            // page path when the request was made
  method: string;
  endpoint: string;
  params?: Record<string, unknown> | undefined;
  body?: unknown;
  blocked: boolean;        // write held back by inspect mode
  status?: number | undefined;
  rows?: unknown;          // trimmed response sample (reads only)
  callers: string[];       // source files on the call stack (dev builds)
  via?: string | undefined; // backend function that performed it (store operations)
}

let entries: RecordedRequest[] = [];
let seq = 0;
const listeners = new Set<() => void>();

export function isResearcherAccount(): boolean {
  if (typeof window === "undefined") return false;
  try { return getStoredWPUser()?.user_login === RESEARCHER_LOGIN; } catch { return false; }
}

export function inspectModeOn(): boolean {
  if (typeof window === "undefined") return false;
  return isResearcherAccount() && window.localStorage.getItem(MODE_KEY) === "1";
}

export function setInspectMode(on: boolean) {
  if (on) window.localStorage.setItem(MODE_KEY, "1");
  else window.localStorage.removeItem(MODE_KEY);
  emit();
}

function emit() { listeners.forEach((l) => l()); }

export function subscribeRecorder(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function getRecorded(): RecordedRequest[] { return entries; }

export function clearRecorded() { entries = []; emit(); }

function callerFiles(): string[] {
  const stack = new Error().stack || "";
  const out: string[] = [];
  for (const m of stack.matchAll(/\/src\/([^?:)\s]+\.(?:tsx?|jsx?))/g)) {
    const f = m[1]!;
    if (f.includes("features/inspector/") || f.endsWith("wordpress-client.ts")) continue;
    if (!out.includes(f)) out.push(f);
  }
  return out.slice(0, 8);
}

function trim(value: unknown): unknown {
  if (Array.isArray(value)) return value.slice(0, MAX_ROWS);
  return value;
}

/** Called by wordpressFetchRaw before a request. Returns the entry so the caller can attach the response. */
export function recordRequest(method: string, endpoint: string, params: Record<string, unknown> | undefined, body: unknown): RecordedRequest | null {
  if (!isResearcherAccount()) return null;
  const blocked = method !== "GET" && inspectModeOn();
  const entry: RecordedRequest = {
    id: ++seq, at: Date.now(), path: window.location.pathname + window.location.search,
    method, endpoint: endpoint.replace(/^\/+/, ""), params, body, blocked, callers: callerFiles(),
  };
  entries = [...entries.slice(-(MAX_ENTRIES - 1)), entry];
  emit();
  return entry;
}

export function attachResponse(entry: RecordedRequest | null, response: Response) {
  if (!entry) return;
  entry.status = response.status;
  if (entry.method !== "GET") { emit(); return; }
  response.clone().json().then((json) => { entry.rows = trim(json); emit(); }).catch(() => emit());
}

export class InspectorWriteBlocked extends Error {
  constructor(method: string, endpoint: string) {
    super(`读写核对模式：已拦截 ${method} ${endpoint}，未写入 / Inspect mode held back this write`);
    this.name = "InspectorWriteBlocked";
  }
}

/**
 * Requests that bypass wordpressFetchRaw (WooCommerce, bookings, auth, media)
 * are recorded too by observing window.fetch. Recording only: they are never
 * held back here, so sign-in refresh and checkout behave normally.
 */
/** Best-effort plain view of a server-function payload (seroval: t1 string, t0 number, t9 array, t10 object). */
function fromSeroval(node: unknown): unknown {
  if (!node || typeof node !== "object") return node;
  const n = node as { t?: number; s?: unknown; a?: unknown[]; p?: { k?: string[]; v?: unknown[] }; i?: number };
  if ("t" in n && typeof n.t === "number" && !("p" in n) && !("a" in n) && "s" in n) return n.t === 0 ? Number(n.s) : n.s;
  if (n.t === 2) return n.s === 2 ? true : n.s === 3 ? false : null;
  if (Array.isArray(n.a)) return n.a.map(fromSeroval);
  if (n.p && Array.isArray(n.p.k)) return Object.fromEntries(n.p.k.map((k, i) => [k, fromSeroval(n.p!.v?.[i])]));
  if ("t" in n && typeof (n as { t: unknown }).t === "object") return fromSeroval((n as { t: unknown }).t);
  return node;
}

function installFetchObserver() {
  if (typeof window === "undefined") return;
  const w = window as unknown as { __rwFetchObserved?: boolean; fetch: typeof fetch };
  if (w.__rwFetchObserved) return;
  w.__rwFetchObserved = true;
  const original = w.fetch.bind(window);
  w.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    let entry: RecordedRequest | null = null;
    try {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const stack = new Error().stack || "";
      const viaClient = /wordpress-client\.ts/.test(stack);
      const m = url.match(/\/wp-json\/([^?#]+)(?:\?([^#]*))?/) || url.match(/[?&]rest_route=\/?([^&#]+)(?:&([^#]*))?/);
      if (m && !viaClient && isResearcherAccount()) {
        const params = m[2] ? Object.fromEntries(new URLSearchParams(m[2])) : undefined;
        let body: unknown;
        try { body = typeof init?.body === "string" ? JSON.parse(init.body) : undefined; } catch { body = undefined; }
        entry = recordRequest((init?.method || (typeof input === "object" && "method" in input ? input.method : "GET")).toUpperCase(), decodeURIComponent(m[1]!), params, body);
        if (entry) entry.blocked = false;
      }
      // Store operations proxied by the backend function (orders, vendors): recorded under their store action.
      const fn = url.match(/\/functions\/v1\/(wp-admin-ops)\b/);
      if (fn && !entry && isResearcherAccount() && typeof init?.body === "string") {
        let body: Record<string, unknown> = {};
        try { body = JSON.parse(init.body) as Record<string, unknown>; } catch { body = {}; }
        const action = String(body["action"] || "?");
        const { wp_base: _base, action: _a, ...rest } = body;
        entry = recordRequest(/^(list|get|fetch|read|search)/.test(action) ? "GET" : "POST", `wc/server-op/${action}`, rest, undefined);
        if (entry) { entry.blocked = false; entry.via = fn[1]; }
      }
      // App server functions (/_serverFn/<base64 {file, export}>): recorded under their export and action.
      const sf = url.match(/\/_serverFn\/([A-Za-z0-9_=-]+)/);
      if (sf && !entry && isResearcherAccount() && !/inspector-ai/.test(url)) {
        let name = "serverFn"; let serverFile = "";
        try { const id = JSON.parse(atob(sf[1]!.replace(/-/g, "+").replace(/_/g, "/"))) as { export?: string; file?: string }; name = String(id.export || name).replace(/_createServerFn_handler$/, ""); serverFile = String(id.file || "").replace(/^\/?src\//, "").replace(/\?.*$/, ""); if (/inspector-ai/.test(id.file || "")) name = ""; } catch { /* opaque id */ }
        if (name) {
          let data: unknown;
          try { data = typeof init?.body === "string" ? fromSeroval(JSON.parse(init.body)) : undefined; } catch { data = undefined; }
          const payload = (data && typeof data === "object" && "data" in (data as object) ? (data as { data: unknown }).data : data) as Record<string, unknown> | undefined;
          const action = payload && typeof payload === "object" && typeof payload["action"] === "string" ? String(payload["action"]) : "";
          entry = recordRequest(!action || /^(list|get|fetch|read|load|search|original)/.test(action) ? "GET" : "POST", `server-fn/${name}${action ? `/${action}` : ""}`, payload && typeof payload === "object" ? Object.fromEntries(Object.entries(payload).filter(([, v]) => typeof v !== "string" || v.length < 200)) : undefined, undefined);
          if (entry) { entry.blocked = false; entry.via = "server-fn"; if (!entry.callers.length && serverFile) entry.callers = [serverFile]; }
        }
      }
    } catch { entry = null; }
    const res = await original(input as RequestInfo, init);
    if (entry?.via) {
      const e = entry; e.status = res.status;
      res.clone().json().then((raw) => { let j = e.via === "server-fn" ? fromSeroval(raw) : raw; if (e.via === "server-fn" && j && typeof j === "object" && "result" in (j as object)) j = (j as { result: unknown }).result; if (e.via === "server-fn" && j && typeof j === "object" && !Array.isArray(j)) { const arrays = Object.values(j as object).filter(Array.isArray); if (arrays.length === 1) j = arrays[0]; } e.rows = trim((j && typeof j === "object" && "data" in (j as object) && e.via !== "server-fn") ? (j as { data: unknown }).data : j); emit(); }).catch(() => emit());
    } else if (entry) attachResponse(entry, res);
    return res;
  }) as typeof fetch;
}
installFetchObserver();
