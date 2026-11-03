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
