import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Plus, Trash2, Table, LayoutGrid, Calendar as CalIcon, Settings2, X, ChevronLeft, ChevronRight, Image as ImageIcon, List, GanttChart, Link as LinkIcon, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import { cctList, cctCreate, cctUpdate, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";
import { toast } from "@/hooks/use-toast";

interface Props { databaseId: string; workspaceId: string; }
type ViewMode = "table" | "board" | "calendar" | "timeline" | "gallery" | "list" | "chart";
type PropType = "text" | "number" | "select" | "multiselect" | "date" | "checkbox" | "url" | "email" | "phone" | "person" | "formula" | "rollup" | "button" | "ai" | "relation";
type RollupAgg =
  | "count" | "count_values" | "count_unique" | "count_empty" | "count_not_empty"
  | "percent_empty" | "percent_not_empty"
  | "sum" | "avg" | "median" | "min" | "max" | "range"
  | "earliest_date" | "latest_date" | "date_range"
  | "show_original" | "show_unique";
type ButtonAction =
  | { kind: "set"; prop: string; value: string }
  | { kind: "increment"; prop: string; by: number }
  | { kind: "open"; url: string };
type CondRule = { prop: string; op: "eq" | "neq" | "contains" | "gt" | "lt" | "empty" | "notempty"; value: string; color: string };
type AutoAction =
  | { kind: "set"; prop: string; value: string }
  | { kind: "increment"; prop: string; by: number }
  | { kind: "notify"; message: string }
  | { kind: "webhook"; url: string };
type AutoRule = {
  id: string;
  name: string;
  trigger: "created" | "propChanged";
  prop?: string;      // for propChanged
  to?: string;        // optional match value
  actions: AutoAction[];
  enabled: boolean;
};
interface PropDef {
  key: string; name: string; type: PropType;
  options?: string[];
  formula?: string;
  rollup?: { source: string; agg: RollupAgg };
  numberFormat?: "plain" | "number" | "commas" | "percent" | "usd" | "eur" | "gbp" | "yuan" | "yen";
  button?: { label: string; actions: ButtonAction[] };
  ai?: { mode: "summary" | "translate" | "keywords"; lang?: string };
  relation?: { databaseId: string };
}
interface Row { id: string; title?: string; icon?: string; cover?: string; properties?: string; }


const DEFAULT_SCHEMA: PropDef[] = [
  { key: "status", name: "Status", type: "select", options: ["To do", "In progress", "Done"] },
];
const STATUS_COLORS: Record<string, string> = {
  "To do": "rgba(120,119,116,0.16)",
  "In progress": "rgba(245,159,0,0.2)",
  "Done": "rgba(68,131,97,0.25)",
};

export function NotchDatabase({ databaseId, workspaceId }: Props) {
  const { user } = useNotchAuth();
  const nav = useNavigate();
  const path = useNotchPath();
  const [rows, setRows] = useState<Row[]>([]);
  const [allBlocks, setAllBlocks] = useState<any[]>([]);
  const [schema, setSchema] = useState<PropDef[]>(DEFAULT_SCHEMA);
  const [condRules, setCondRules] = useState<CondRule[]>([]);
  const [view, setView] = useState<ViewMode>("table");
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [showSchema, setShowSchema] = useState(false);
  const [showCondEditor, setShowCondEditor] = useState(false);
  const [dbBlock, setDbBlock] = useState<any>(null);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  type FilterCond = { key: string; op: string; val: string };
  const [filterConds, setFilterConds] = useState<FilterCond[]>([]);
  const [filterJoin, setFilterJoin] = useState<"and" | "or">("and");
  const [showFilterPop, setShowFilterPop] = useState(false);
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [dragCol, setDragCol] = useState<string | null>(null);
  const [automations, setAutomations] = useState<AutoRule[]>([]);
  const [showAuto, setShowAuto] = useState(false);
  const [memberOpts, setMemberOpts] = useState<{ id: string; user_id: string; label: string }[]>([]);
  useEffect(() => {
    cctList<any>(NN.member, { workspace_id: workspaceId }).then((rows) => {
      setMemberOpts(rows.map((r: any) => ({ id: String(r.id), user_id: String(r.user_id || ""), label: r.display_name || r.email || `User ${r.user_id}` })));
    }).catch(() => setMemberOpts([]));
  }, [workspaceId]);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await cctList<any>(NN.block, { workspace_id: workspaceId });
    setAllBlocks(all);
    const parent = all.find((b: any) => String(b.id) === String(databaseId));
    setDbBlock(parent);
    try {
      const p = parent?.properties ? JSON.parse(parent.properties) : {};
      if (Array.isArray(p.schema) && p.schema.length) setSchema(p.schema);
      else setSchema(DEFAULT_SCHEMA);
      setCondRules(Array.isArray(p.condRules) ? p.condRules : []);
      setAutomations(Array.isArray(p.automations) ? p.automations : []);
    } catch { setSchema(DEFAULT_SCHEMA); setCondRules([]); setAutomations([]); }
    setRows(all.filter((b: any) => String(b.parent_id) === String(databaseId) && Number(b.archived) !== 1));
    setLoading(false);
  }, [databaseId, workspaceId]);
  useEffect(() => { load(); }, [load]);

  const saveSchema = async (next: PropDef[]) => {
    setSchema(next);
    let props: any = {};
    try { props = dbBlock?.properties ? JSON.parse(dbBlock.properties) : {}; } catch {}
    props.schema = next;
    await cctUpdate(NN.block, databaseId, { properties: JSON.stringify(props) });
  };
  const saveCondRules = async (next: CondRule[]) => {
    setCondRules(next);
    let props: any = {};
    try { props = dbBlock?.properties ? JSON.parse(dbBlock.properties) : {}; } catch {}
    props.condRules = next;
    await cctUpdate(NN.block, databaseId, { properties: JSON.stringify(props) });
  };
  const saveAutomations = async (next: AutoRule[]) => {
    setAutomations(next);
    let props: any = {};
    try { props = dbBlock?.properties ? JSON.parse(dbBlock.properties) : {}; } catch {}
    props.automations = next;
    await cctUpdate(NN.block, databaseId, { properties: JSON.stringify(props) });
  };

  const runAutomationActions = async (r: Row, actions: AutoAction[]) => {
    let props: any = {};
    try { props = r.properties ? JSON.parse(r.properties) : {}; } catch {}
    let touched = false;
    for (const a of actions) {
      if (a.kind === "set") { props[a.prop] = a.value; touched = true; }
      else if (a.kind === "increment") { props[a.prop] = (Number(props[a.prop]) || 0) + (a.by || 1); touched = true; }
      else if (a.kind === "notify") {
        try { toast({ title: a.message || "Automation ran" }); } catch {}
      } else if (a.kind === "webhook" && a.url) {
        try { fetch(a.url, { method: "POST", mode: "no-cors", headers: { "content-type": "application/json" }, body: JSON.stringify({ row: { id: r.id, title: r.title, properties: props } }) }); } catch {}
      }
    }
    if (touched) {
      await cctUpdate(NN.block, r.id, { properties: JSON.stringify(props) });
      setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, properties: JSON.stringify(props) } : x));
    }
  };
  const fireAutomations = async (r: Row, trigger: "created" | "propChanged", changedProp?: string, newValue?: any) => {
    for (const rule of automations) {
      if (!rule.enabled) continue;
      if (rule.trigger !== trigger) continue;
      if (trigger === "propChanged") {
        if (rule.prop && rule.prop !== changedProp) continue;
        if (rule.to !== undefined && rule.to !== "" && String(newValue ?? "") !== rule.to) continue;
      }
      await runAutomationActions(r, rule.actions);
    }
  };

  // Compute background color for a row/cell given the conditional-formatting rules.
  const rowColor = (r: Row): string => {
    for (const rule of condRules) {
      const v = (rule.prop === "__title__") ? (r.title || "") : (() => {
        try { return (r.properties ? JSON.parse(r.properties) : {})[rule.prop]; } catch { return ""; }
      })();
      const s = String(v ?? "");
      const rv = String(rule.value ?? "");
      let match = false;
      if (rule.op === "eq") match = s === rv;
      else if (rule.op === "neq") match = s !== rv;
      else if (rule.op === "contains") match = s.toLowerCase().includes(rv.toLowerCase());
      else if (rule.op === "gt") match = Number(s) > Number(rv);
      else if (rule.op === "lt") match = Number(s) < Number(rv);
      else if (rule.op === "empty") match = s === "" || s == null;
      else if (rule.op === "notempty") match = s !== "" && s != null;
      if (match) return rule.color;
    }
    return "";
  };

  // Reorder a schema column by drag (persists to properties).
  const reorderColumn = async (srcKey: string, tgtKey: string) => {
    if (srcKey === tgtKey) return;
    const srcIdx = schema.findIndex((p) => p.key === srcKey);
    const tgtIdx = schema.findIndex((p) => p.key === tgtKey);
    if (srcIdx < 0 || tgtIdx < 0) return;
    const next = [...schema];
    const [moved] = next.splice(srcIdx, 1);
    next.splice(tgtIdx, 0, moved);
    await saveSchema(next);
  };


  const getProp = (r: Row, key: string) => {
    try { return (r.properties ? JSON.parse(r.properties) : {})[key]; } catch { return undefined; }
  };
  const setProp = async (r: Row, key: string, value: any) => {
    let props: any = {};
    try { props = r.properties ? JSON.parse(r.properties) : {}; } catch {}
    props[key] = value;
    await cctUpdate(NN.block, r.id, { properties: JSON.stringify(props) });
    setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, properties: JSON.stringify(props) } : x));
    fireAutomations({ ...r, properties: JSON.stringify(props) }, "propChanged", key, value);
  };

  // Evaluate a formula expression in a sandbox with numeric props and Notion-style helpers.
  const evalFormula = (expr: string, r: Row): string => {
    if (!expr) return "";
    let props: any = {};
    try { props = r.properties ? JSON.parse(r.properties) : {}; } catch {}
    const ctx: Record<string, any> = { title: r.title || "" };
    for (const p of schema) {
      const v = props[p.key];
      const n = Number(v);
      ctx[p.key] = !isNaN(n) && v !== "" && v !== undefined && v !== null ? n : (v ?? "");
    }
    // Notion-style helpers
    const helpers = {
      prop: (k: string) => ctx[k] ?? "",
      if: (c: any, a: any, b: any) => (c ? a : b),
      empty: (v: any) => v === "" || v === null || v === undefined,
      length: (v: any) => (v == null ? 0 : String(v).length),
      contains: (a: any, b: any) => String(a ?? "").includes(String(b ?? "")),
      concat: (...args: any[]) => args.map((x) => String(x ?? "")).join(""),
      slice: (s: any, a: number, b?: number) => String(s ?? "").slice(a, b),
      lower: (s: any) => String(s ?? "").toLowerCase(),
      upper: (s: any) => String(s ?? "").toUpperCase(),
      format: (n: any) => (typeof n === "number" ? n.toLocaleString() : String(n ?? "")),
      toNumber: (v: any) => Number(v) || 0,
      round: (n: any) => Math.round(Number(n) || 0),
      abs: (n: any) => Math.abs(Number(n) || 0),
      max: (...a: number[]) => Math.max(...a.map((n) => Number(n) || 0)),
      min: (...a: number[]) => Math.min(...a.map((n) => Number(n) || 0)),
      now: () => new Date(),
      today: () => new Date(new Date().toDateString()),
      dateAdd: (d: any, n: number, unit: "days" | "months" | "years" = "days") => {
        const dt = new Date(d || Date.now());
        if (unit === "days") dt.setDate(dt.getDate() + n);
        else if (unit === "months") dt.setMonth(dt.getMonth() + n);
        else if (unit === "years") dt.setFullYear(dt.getFullYear() + n);
        return dt.toISOString().slice(0, 10);
      },
      dateBetween: (a: any, b: any, unit: "days" | "hours" = "days") => {
        const ma = new Date(a).getTime(), mb = new Date(b).getTime();
        if (isNaN(ma) || isNaN(mb)) return 0;
        const diff = ma - mb;
        return unit === "hours" ? Math.round(diff / 3.6e6) : Math.round(diff / 8.64e7);
      },
      formatDate: (d: any, opts?: Intl.DateTimeFormatOptions) => {
        const dt = new Date(d); return isNaN(dt.getTime()) ? "" : dt.toLocaleDateString(undefined, opts);
      },
      // Notion V2 formula helpers — string manipulation
      split: (s: any, sep: string) => String(s ?? "").split(sep),
      join: (arr: any, sep: string) => (Array.isArray(arr) ? arr : [arr]).map((x) => String(x ?? "")).join(sep),
      replace: (s: any, find: string, rep: string) => String(s ?? "").split(find).join(rep),
      replaceAll: (s: any, find: string, rep: string) => String(s ?? "").split(find).join(rep),
      startsWith: (s: any, p: string) => String(s ?? "").startsWith(p),
      endsWith: (s: any, p: string) => String(s ?? "").endsWith(p),
      test: (s: any, re: string) => new RegExp(re).test(String(s ?? "")),
      match: (s: any, re: string) => { const m = String(s ?? "").match(new RegExp(re)); return m ? m[0] : ""; },
      trim: (s: any) => String(s ?? "").trim(),
      // Lambda-style array helpers (accept fn arguments)
      map: (arr: any, fn: (v: any) => any) => (Array.isArray(arr) ? arr : []).map(fn),
      filter: (arr: any, fn: (v: any) => any) => (Array.isArray(arr) ? arr : []).filter(fn),
      reduce: (arr: any, fn: (a: any, v: any) => any, init: any) => (Array.isArray(arr) ? arr : []).reduce(fn, init),
      some: (arr: any, fn: (v: any) => any) => (Array.isArray(arr) ? arr : []).some(fn),
      every: (arr: any, fn: (v: any) => any) => (Array.isArray(arr) ? arr : []).every(fn),
      sum: (arr: any) => (Array.isArray(arr) ? arr : []).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
      count: (arr: any) => (Array.isArray(arr) ? arr : []).length,
      // Date V2
      year: (d: any) => new Date(d).getFullYear(),
      month: (d: any) => new Date(d).getMonth() + 1,
      day: (d: any) => new Date(d).getDate(),
      hour: (d: any) => new Date(d).getHours(),
      minute: (d: any) => new Date(d).getMinutes(),
      weekday: (d: any) => new Date(d).getDay(),
      timestamp: (d: any) => new Date(d).getTime(),
      fromTimestamp: (t: any) => new Date(Number(t) || 0),
    };
    try {
      const names = [...Object.keys(ctx), ...Object.keys(helpers)];
      const values = [...Object.values(ctx), ...Object.values(helpers)];
      const fn = new Function(...names, `"use strict"; try { return (${expr}); } catch(e){ return "#ERR"; }`);
      const out = fn(...values);
      if (out instanceof Date) return out.toLocaleDateString();
      return out === undefined || out === null ? "" : String(out);
    } catch { return "#ERR"; }
  };

  // Format numbers per Notion-style number formats.
  const formatNumber = (v: any, fmt?: PropDef["numberFormat"]): string => {
    const n = Number(v);
    if (v === "" || v === null || v === undefined || isNaN(n)) return v == null ? "" : String(v);
    switch (fmt) {
      case "commas": return n.toLocaleString();
      case "percent": return (n * 100).toFixed(2).replace(/\.?0+$/, "") + "%";
      case "usd": return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      case "eur": return "€" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      case "gbp": return "£" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      case "yuan": return "¥" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      case "yen": return "¥" + Math.round(n).toLocaleString();
      case "number": return String(n);
      default: return String(v);
    }
  };

  // Aggregate a prop across every row (rollup shows same value per row).
  const rollupValue = (p: PropDef): string => {
    if (!p.rollup?.source) return "";
    const src = p.rollup.source;
    const raw = rows.map((r) => { try { return JSON.parse(r.properties || "{}")[src]; } catch { return undefined; } });
    const nonEmpty = raw.filter((v) => v !== "" && v !== null && v !== undefined);
    const nums = raw.map((v) => { const n = Number(v); return isNaN(n) ? null : n; }).filter((n): n is number => n !== null);
    const dates = raw.map((v) => { const t = new Date(v as any).getTime(); return isNaN(t) ? null : t; }).filter((t): t is number => t !== null);
    const total = rows.length || 1;
    switch (p.rollup.agg) {
      case "count": return String(rows.length);
      case "count_values": return String(nonEmpty.length);
      case "count_unique": return String(new Set(nonEmpty.map((v) => JSON.stringify(v))).size);
      case "count_empty": return String(rows.length - nonEmpty.length);
      case "count_not_empty": return String(nonEmpty.length);
      case "percent_empty": return ((rows.length - nonEmpty.length) / total * 100).toFixed(0) + "%";
      case "percent_not_empty": return (nonEmpty.length / total * 100).toFixed(0) + "%";
      case "sum": return nums.length ? String(nums.reduce((a, b) => a + b, 0)) : "";
      case "avg": return nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : "";
      case "median": {
        if (!nums.length) return "";
        const s = [...nums].sort((a, b) => a - b); const m = Math.floor(s.length / 2);
        return String(s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2);
      }
      case "min": return nums.length ? String(Math.min(...nums)) : "";
      case "max": return nums.length ? String(Math.max(...nums)) : "";
      case "range": return nums.length ? String(Math.max(...nums) - Math.min(...nums)) : "";
      case "earliest_date": return dates.length ? new Date(Math.min(...dates)).toLocaleDateString() : "";
      case "latest_date": return dates.length ? new Date(Math.max(...dates)).toLocaleDateString() : "";
      case "date_range": {
        if (!dates.length) return "";
        const d = Math.max(...dates) - Math.min(...dates);
        return Math.round(d / 8.64e7) + " days";
      }
      case "show_original": return nonEmpty.slice(0, 8).map((v) => String(v)).join(", ");
      case "show_unique": return [...new Set(nonEmpty.map((v) => String(v)))].slice(0, 8).join(", ");
      default: return "";
    }
  };


  const addRow = async (preset: Record<string, any> = {}) => {
    const { id } = await cctCreate(NN.block, {
      workspace_id: workspaceId, parent_id: databaseId, type: "page",
      title: "", icon: "",
      properties: JSON.stringify(preset),
      content_order: JSON.stringify([]),
      archived: 0, in_trash: 0,
      created_by: user?.user_id || 0, last_edited_by: user?.user_id || 0,
    });
    await load();
    fireAutomations({ id, title: "", properties: JSON.stringify(preset) } as Row, "created");
    nav(path(`/p/${id}`));
  };
  const archiveRow = async (id: string) => {
    await cctUpdate(NN.block, id, { archived: 1, in_trash: 1 });
    await load();
  };

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const toggleRowSelect = (id: string) => setSelectedRows((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const clearSelection = () => setSelectedRows(new Set());

  const bulkArchive = async () => {
    for (const id of selectedRows) await cctUpdate(NN.block, id, { archived: 1, in_trash: 1 });
    clearSelection();
    await load();
  };
  const bulkDuplicate = async () => {
    for (const id of selectedRows) {
      const src = rows.find((r) => r.id === id); if (!src) continue;
      await cctCreate(NN.block, {
        workspace_id: workspaceId, parent_id: databaseId, type: "page",
        title: src.title ? `${src.title} (copy)` : "Untitled (copy)",
        icon: src.icon || "", properties: src.properties || JSON.stringify({}),
        content_order: JSON.stringify([]), archived: 0, in_trash: 0,
        created_by: user?.user_id || 0, last_edited_by: user?.user_id || 0,
      });
    }
    clearSelection();
    await load();
  };

  // ── CSV import / export ─────────────────────────────────────────────
  const escapeCsv = (s: string) => /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  const parseCsv = (text: string): string[][] => {
    const rowsOut: string[][] = []; let cur: string[] = []; let val = ""; let inQ = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQ) {
        if (c === '"') { if (text[i + 1] === '"') { val += '"'; i++; } else { inQ = false; } }
        else val += c;
      } else {
        if (c === '"') inQ = true;
        else if (c === ",") { cur.push(val); val = ""; }
        else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; cur.push(val); rowsOut.push(cur); cur = []; val = ""; }
        else val += c;
      }
    }
    if (val || cur.length) { cur.push(val); rowsOut.push(cur); }
    return rowsOut.filter((r) => r.some((c) => c.trim() !== ""));
  };
  const exportCsv = () => {
    const cols = ["Name", ...schema.map((p) => p.name)];
    const lines = [cols.map(escapeCsv).join(",")];
    for (const r of visibleRows) {
      const vals = [r.title || "", ...schema.map((p) => {
        const v = getProp(r, p.key); return Array.isArray(v) ? v.join("|") : String(v ?? "");
      })];
      lines.push(vals.map(escapeCsv).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${dbBlock?.title || "database"}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const csvInputRef = useRef<HTMLInputElement>(null);
  const importCsv = async (file: File) => {
    const text = await file.text();
    const parsed = parseCsv(text);
    if (!parsed.length) return;
    const [header, ...body] = parsed;
    const nameIdx = header.findIndex((h) => h.trim().toLowerCase() === "name");
    const colMap = header.map((h) => schema.find((p) => p.name.toLowerCase() === h.trim().toLowerCase()));
    for (const row of body) {
      const props: Record<string, any> = {};
      header.forEach((_h, i) => {
        const p = colMap[i]; if (!p || i === nameIdx) return;
        const raw = row[i] ?? "";
        if (p.type === "multiselect") props[p.key] = raw.split("|").map((s) => s.trim()).filter(Boolean);
        else if (p.type === "checkbox") props[p.key] = /^(1|true|yes)$/i.test(raw);
        else if (p.type === "number") props[p.key] = raw === "" ? "" : Number(raw);
        else props[p.key] = raw;
      });
      await cctCreate(NN.block, {
        workspace_id: workspaceId, parent_id: databaseId, type: "page",
        title: nameIdx >= 0 ? (row[nameIdx] || "") : "",
        icon: "", properties: JSON.stringify(props), content_order: JSON.stringify([]),
        archived: 0, in_trash: 0,
        created_by: user?.user_id || 0, last_edited_by: user?.user_id || 0,
      });
    }
    toast({ title: `Imported ${body.length} rows` });
    await load();
  };

  const statusProp = useMemo(() => schema.find((p) => p.type === "select") || null, [schema]);
  const dateProps = useMemo(() => schema.filter((p) => p.type === "date"), [schema]);
  const dateProp = dateProps[0] || null;
  const endDateProp = dateProps[1] || null;
  const checkboxProp = useMemo(() => schema.find((p) => p.type === "checkbox") || null, [schema]);
  const [calView, setCalView] = useState<"month" | "week">("month");
  // View-specific settings (persisted per-view in state; simple local UX toggles).
  const [swimlaneKey, setSwimlaneKey] = useState<string>(""); // board: secondary group (select/multiselect prop key)
  const [galleryCoverKey, setGalleryCoverKey] = useState<string>("__cover__"); // gallery: property (url) for card image
  const [galleryFit, setGalleryFit] = useState<"cover" | "contain">("cover");
  const [depKey, setDepKey] = useState<string>(""); // timeline: relation prop key used for dependencies
  const selectishProps = useMemo(() => schema.filter((p) => p.type === "select" || p.type === "multiselect"), [schema]);
  const urlProps = useMemo(() => schema.filter((p) => p.type === "url"), [schema]);
  const relationProps = useMemo(() => schema.filter((p) => p.type === "relation"), [schema]);
  const swimlaneProp = useMemo(() => schema.find((p) => p.key === swimlaneKey) || null, [schema, swimlaneKey]);
  const depProp = useMemo(() => schema.find((p) => p.key === depKey && p.type === "relation") || null, [schema, depKey]);

  // Apply filters and sorts before rendering (all views use `visibleRows`)
  const evalCond = (row: Row, c: FilterCond): boolean => {
    const raw = c.key === "__title__" ? (row.title || "") : getProp(row, c.key);
    const s = String(raw ?? "").toLowerCase();
    const q = c.val.toLowerCase();
    switch (c.op) {
      case "eq": return s === q;
      case "ne": return s !== q;
      case "contains": return s.includes(q);
      case "not_contains": return !s.includes(q);
      case "starts": return s.startsWith(q);
      case "ends": return s.endsWith(q);
      case "empty": return s === "";
      case "not_empty": return s !== "";
      case "gt": return Number(raw) > Number(c.val);
      case "lt": return Number(raw) < Number(c.val);
      case "gte": return Number(raw) >= Number(c.val);
      case "lte": return Number(raw) <= Number(c.val);
      default: return true;
    }
  };
  const visibleRows = useMemo(() => {
    let r = rows;
    if (filterConds.length) {
      r = r.filter((row) => filterJoin === "and" ? filterConds.every((c) => evalCond(row, c)) : filterConds.some((c) => evalCond(row, c)));
    }
    if (sortKey) {
      const cmp = (a: Row, b: Row) => {
        const av = sortKey === "__title__" ? (a.title || "") : String(getProp(a, sortKey) ?? "");
        const bv = sortKey === "__title__" ? (b.title || "") : String(getProp(b, sortKey) ?? "");
        const na = Number(av), nb = Number(bv);
        const both = !isNaN(na) && !isNaN(nb) && av !== "" && bv !== "";
        const res = both ? (na - nb) : av.localeCompare(bv);
        return sortDir === "asc" ? res : -res;
      };
      r = [...r].sort(cmp);
    }
    return r;
  }, [rows, filterConds, filterJoin, sortKey, sortDir]);

  const renderCell = (r: Row, p: PropDef) => {
    const v = getProp(r, p.key) ?? "";
    if (p.type === "checkbox") return (
      <input type="checkbox" checked={!!v} onChange={(e) => setProp(r, p.key, e.target.checked)} />
    );
    if (p.type === "select") return (
      <select value={v} onChange={(e) => setProp(r, p.key, e.target.value)} style={{ background: STATUS_COLORS[v] || "transparent", border: "none", borderRadius: 3, padding: "2px 8px", fontSize: 12, cursor: "pointer", color: "var(--nn-text)" }}>
        <option value="">—</option>
        {(p.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
    if (p.type === "date") return (
      <input type="date" value={v} onChange={(e) => setProp(r, p.key, e.target.value)} style={{ background: "transparent", border: "none", color: "var(--nn-text)", fontSize: 13 }} />
    );
    if (p.type === "number") {
      const fmt = p.numberFormat || "plain";
      const [editing, display] = [fmt === "plain" || v === "" || v === null || v === undefined, formatNumber(v, fmt)];
      return editing
        ? <input type="number" value={v} onChange={(e) => setProp(r, p.key, e.target.value)} style={{ background: "transparent", border: "none", color: "var(--nn-text)", fontSize: 13, width: "100%" }} />
        : <input value={display} onFocus={(e) => { e.currentTarget.type = "number"; e.currentTarget.value = String(v ?? ""); }} onBlur={(e) => { e.currentTarget.type = "text"; e.currentTarget.value = display; }} onChange={(e) => setProp(r, p.key, e.currentTarget.value)} style={{ background: "transparent", border: "none", color: "var(--nn-text)", fontSize: 13, width: "100%" }} />;
    }
    if (p.type === "multiselect") {
      const arr: string[] = Array.isArray(v) ? v : (v ? String(v).split(",").map((s) => s.trim()).filter(Boolean) : []);
      const toggle = (opt: string) => {
        const next = arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt];
        setProp(r, p.key, next);
      };
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {(p.options || []).map((o) => (
            <span key={o} onClick={() => toggle(o)} style={{ background: arr.includes(o) ? "var(--nn-blue-bg)" : "rgba(0,0,0,0.05)", color: arr.includes(o) ? "var(--nn-blue)" : "var(--nn-text-secondary)", padding: "2px 6px", borderRadius: 3, fontSize: 11, cursor: "pointer" }}>{o}</span>
          ))}
        </div>
      );
    }
    if (p.type === "url") return v ? (
      <a href={v} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: "var(--nn-blue)", fontSize: 13 }}>{v}</a>
    ) : (
      <input value={v} onChange={(e) => setProp(r, p.key, e.target.value)} placeholder="—" style={{ background: "transparent", border: "none", color: "var(--nn-text)", fontSize: 13, width: "100%" }} />
    );
    if (p.type === "email") return v ? (
      <a href={`mailto:${v}`} onClick={(e) => e.stopPropagation()} style={{ color: "var(--nn-blue)", fontSize: 13 }}>{v}</a>
    ) : (
      <input type="email" value={v} onChange={(e) => setProp(r, p.key, e.target.value)} placeholder="—" style={{ background: "transparent", border: "none", color: "var(--nn-text)", fontSize: 13, width: "100%" }} />
    );
    if (p.type === "phone") return v ? (
      <a href={`tel:${v}`} onClick={(e) => e.stopPropagation()} style={{ color: "var(--nn-blue)", fontSize: 13 }}>{v}</a>
    ) : (
      <input type="tel" value={v} onChange={(e) => setProp(r, p.key, e.target.value)} placeholder="—" style={{ background: "transparent", border: "none", color: "var(--nn-text)", fontSize: 13, width: "100%" }} />
    );
    if (p.type === "person") {
      const ids: string[] = Array.isArray(v) ? v : (v ? String(v).split(",").map((s) => s.trim()).filter(Boolean) : []);
      const labelOf = (id: string) => memberOpts.find((m) => String(m.user_id) === String(id))?.label || id;
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
          {ids.map((id) => (
            <span key={id} style={{ background: "var(--nn-blue-bg)", color: "var(--nn-blue)", padding: "1px 6px", borderRadius: 3, fontSize: 11, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--nn-blue)", color: "#fff", fontSize: 9, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{labelOf(id).charAt(0).toUpperCase()}</span>
              {labelOf(id)}
              <span onClick={(e) => { e.stopPropagation(); setProp(r, p.key, ids.filter((x) => x !== id)); }} style={{ opacity: 0.6, cursor: "pointer" }}>×</span>
            </span>
          ))}
          <select value="" onChange={(e) => { const v2 = e.target.value; if (v2 && !ids.includes(v2)) setProp(r, p.key, [...ids, v2]); }} onClick={(e) => e.stopPropagation()} style={{ background: "transparent", border: "1px dashed var(--nn-border)", borderRadius: 3, fontSize: 11, padding: "1px 2px", color: "var(--nn-text-secondary)" }}>
            <option value="">+ person</option>
            {memberOpts.filter((m) => !ids.includes(m.user_id)).map((m) => <option key={m.id} value={m.user_id}>{m.label}</option>)}
          </select>
        </div>
      );
    }
    if (p.type === "formula") return (
      <span style={{ fontSize: 13, color: "var(--nn-text-secondary)", fontFamily: "monospace" }}>{evalFormula(p.formula || "", r)}</span>
    );
    if (p.type === "rollup") return (
      <span style={{ fontSize: 13, color: "var(--nn-text-secondary)" }}>{rollupValue(p)}</span>
    );
    if (p.type === "button") return (
      <button
        onClick={async (e) => {
          e.stopPropagation();
          const actions = p.button?.actions || [];
          let props: any = {}; try { props = r.properties ? JSON.parse(r.properties) : {}; } catch {}
          for (const a of actions) {
            if (a.kind === "set") props[a.prop] = a.value;
            else if (a.kind === "increment") props[a.prop] = (Number(props[a.prop]) || 0) + (a.by || 1);
            else if (a.kind === "open") window.open(a.url, "_blank", "noopener");
          }
          await cctUpdate(NN.block, r.id, { properties: JSON.stringify(props) });
          setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, properties: JSON.stringify(props) } : x));
        }}
        style={{ background: "var(--nn-blue-bg)", color: "var(--nn-blue)", border: "none", borderRadius: 4, padding: "3px 10px", fontSize: 12, cursor: "pointer", fontWeight: 500 }}
      >
        {p.button?.label || "Run"}
      </button>
    );
    if (p.type === "ai") {
      const cacheKey = `__ai_${p.key}`;
      const cached = v || (getProp(r, cacheKey) ?? "");
      const run = async () => {
        const src = r.title || "";
        let out = "";
        if (p.ai?.mode === "keywords") out = src.split(/\s+/).filter((w) => w.length > 4).slice(0, 5).join(", ");
        else if (p.ai?.mode === "summary") out = src.slice(0, 120) + (src.length > 120 ? "…" : "");
        else out = `[${p.ai?.lang || "en"}] ${src}`;
        await setProp(r, p.key, out);
      };
      return (
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--nn-text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cached || <em style={{ opacity: 0.5 }}>—</em>}</span>
          <button onClick={(e) => { e.stopPropagation(); run(); }} title="Run AI" style={{ background: "none", border: "1px solid var(--nn-border)", borderRadius: 3, fontSize: 10, padding: "1px 5px", cursor: "pointer", color: "var(--nn-text-secondary)" }}>AI</button>
        </div>
      );
    }
    if (p.type === "relation") {
      // Value stored as a comma-separated list of block IDs. Show titles resolved from allBlocks.
      const ids: string[] = Array.isArray(v) ? v : (v ? String(v).split(",").map((s) => s.trim()).filter(Boolean) : []);
      const targetDbId = p.relation?.databaseId || "";
      const candidates = allBlocks.filter((b) => targetDbId ? String(b.parent_id) === String(targetDbId) : b.type === "page");
      const titleOf = (id: string) => allBlocks.find((b) => String(b.id) === String(id))?.title || id;
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
          {ids.map((id) => (
            <span key={id} onClick={(e) => { e.stopPropagation(); nav(path(`/p/${id}`)); }}
              style={{ background: "var(--nn-blue-bg)", color: "var(--nn-blue)", padding: "1px 6px", borderRadius: 3, fontSize: 11, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 3 }}>
              <LinkIcon size={10} /> {titleOf(id)}
              <span onClick={(e) => { e.stopPropagation(); setProp(r, p.key, ids.filter((x) => x !== id)); }} style={{ opacity: 0.6, cursor: "pointer" }}>×</span>
            </span>
          ))}
          <select
            value=""
            onChange={(e) => { const v2 = e.target.value; if (v2 && !ids.includes(v2)) setProp(r, p.key, [...ids, v2]); }}
            style={{ background: "transparent", border: "1px dashed var(--nn-border)", borderRadius: 3, fontSize: 11, padding: "1px 2px", color: "var(--nn-text-secondary)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="">+ link</option>
            {candidates.filter((c) => !ids.includes(String(c.id)) && String(c.id) !== String(r.id)).slice(0, 200).map((c) => (
              <option key={c.id} value={c.id}>{c.title || "Untitled"}</option>
            ))}
          </select>
        </div>
      );
    }
    return (
      <input value={v} onChange={(e) => setProp(r, p.key, e.target.value)} placeholder="—" style={{ background: "transparent", border: "none", color: "var(--nn-text)", fontSize: 13, width: "100%" }} />
    );
  };

  if (loading) return <div style={{ opacity: 0.5, padding: 12 }}>Loading…</div>;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--nn-border)", marginBottom: 12 }}>
        {(["table", "board", "calendar", "timeline", "gallery", "list", "chart"] as ViewMode[]).map((v) => {
          const Icon = v === "table" ? Table : v === "board" ? LayoutGrid : v === "calendar" ? CalIcon : v === "timeline" ? GanttChart : v === "gallery" ? ImageIcon : v === "chart" ? BarChart3 : List;
          return (
            <button key={v} data-testid={`nn-view-${v}`} onClick={() => setView(v)} className="nn-topbar-btn" style={{ borderBottom: view === v ? "2px solid var(--nn-text)" : "none", borderRadius: 0, textTransform: "capitalize" }}>
              <Icon size={13} style={{ marginRight: 4 }} /> {v}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <div style={{ position: "relative" }}>
          <button onClick={() => setShowFilterPop((v) => !v)} className="nn-topbar-btn" title="Filter" style={{ padding: "4px 8px", fontSize: 12 }}>
            Filter{filterConds.length > 0 ? ` (${filterConds.length})` : ""}
          </button>
          {showFilterPop && (
            <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: "var(--nn-bg)", border: "1px solid var(--nn-border)", borderRadius: 6, boxShadow: "var(--nn-shadow-md)", padding: 10, zIndex: 1000, minWidth: 380 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => setFilterJoin("and")} className="nn-topbar-btn" style={{ fontSize: 11, background: filterJoin === "and" ? "var(--nn-bg-tertiary)" : "transparent" }}>AND</button>
                  <button onClick={() => setFilterJoin("or")} className="nn-topbar-btn" style={{ fontSize: 11, background: filterJoin === "or" ? "var(--nn-bg-tertiary)" : "transparent" }}>OR</button>
                </div>
                <button onClick={() => setFilterConds([])} className="nn-topbar-btn" style={{ fontSize: 11 }}>Clear</button>
              </div>
              {filterConds.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                  <select value={c.key} onChange={(e) => setFilterConds((L) => L.map((x, j) => j === i ? { ...x, key: e.target.value } : x))} className="nn-topbar-btn" style={{ fontSize: 11, flex: 1 }}>
                    <option value="__title__">Name</option>
                    {schema.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
                  </select>
                  <select value={c.op} onChange={(e) => setFilterConds((L) => L.map((x, j) => j === i ? { ...x, op: e.target.value } : x))} className="nn-topbar-btn" style={{ fontSize: 11 }}>
                    <option value="contains">contains</option>
                    <option value="not_contains">not contains</option>
                    <option value="eq">equals</option>
                    <option value="ne">not equals</option>
                    <option value="starts">starts with</option>
                    <option value="ends">ends with</option>
                    <option value="empty">is empty</option>
                    <option value="not_empty">not empty</option>
                    <option value="gt">&gt;</option>
                    <option value="lt">&lt;</option>
                    <option value="gte">≥</option>
                    <option value="lte">≤</option>
                  </select>
                  {!["empty", "not_empty"].includes(c.op) && (
                    <input value={c.val} onChange={(e) => setFilterConds((L) => L.map((x, j) => j === i ? { ...x, val: e.target.value } : x))} placeholder="value" className="nn-topbar-btn" style={{ fontSize: 11, width: 100 }} />
                  )}
                  <button onClick={() => setFilterConds((L) => L.filter((_, j) => j !== i))} className="nn-topbar-btn" style={{ fontSize: 11 }}>×</button>
                </div>
              ))}
              <button onClick={() => setFilterConds((L) => [...L, { key: "__title__", op: "contains", val: "" }])} className="nn-topbar-btn" style={{ fontSize: 11, width: "100%", marginTop: 4 }}>+ Add filter</button>
            </div>
          )}
        </div>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="nn-topbar-btn" style={{ padding: "4px 6px", fontSize: 12 }} title="Sort by property">
          <option value="">Sort…</option>
          <option value="__title__">Name</option>
          {schema.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
        </select>
        {sortKey && (
          <button onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")} className="nn-topbar-btn" title="Toggle sort direction">{sortDir === "asc" ? "↑" : "↓"}</button>
        )}
        <button onClick={() => setShowCondEditor(true)} className="nn-topbar-btn" title="Conditional formatting">🎨</button>
        <button onClick={() => setShowAuto(true)} className="nn-topbar-btn" title="Automations">⚡</button>
        <button onClick={() => setShowSchema(true)} className="nn-topbar-btn"><Settings2 size={13} /> Properties</button>
        <button onClick={exportCsv} className="nn-topbar-btn" title="Export CSV">⬇ CSV</button>
        <button onClick={() => csvInputRef.current?.click()} className="nn-topbar-btn" title="Import CSV">⬆ CSV</button>
        <input ref={csvInputRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) importCsv(f); e.currentTarget.value = ""; }} />
        <button onClick={() => addRow()} className="nn-topbar-btn"><Plus size={13} /> New</button>
      </div>
      {selectedRows.size > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "var(--nn-blue-bg)", border: "1px solid var(--nn-blue)", borderRadius: 4, marginBottom: 8, fontSize: 12 }}>
          <span style={{ color: "var(--nn-blue)", fontWeight: 500 }}>{selectedRows.size} selected</span>
          <div style={{ flex: 1 }} />
          <button onClick={bulkDuplicate} className="nn-topbar-btn">Duplicate</button>
          <button onClick={bulkArchive} className="nn-topbar-btn" style={{ color: "var(--nn-danger, #e03e3e)" }}>Delete</button>
          <button onClick={clearSelection} className="nn-topbar-btn">Cancel</button>
        </div>
      )}

      {view === "table" && (
        <div style={{ border: "1px solid var(--nn-border)", borderRadius: 4, overflow: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: `28px 2fr ${schema.map(() => "1fr").join(" ")} 40px`, background: "var(--nn-bg-secondary)", fontSize: 12, color: "var(--nn-text-secondary)", padding: "8px 12px", borderBottom: "1px solid var(--nn-border)", fontWeight: 500 }}>
            <div><input type="checkbox" checked={visibleRows.length > 0 && visibleRows.every((r) => selectedRows.has(r.id))} onChange={(e) => setSelectedRows(e.target.checked ? new Set(visibleRows.map((r) => r.id)) : new Set())} /></div>
            <div>Name</div>
            {schema.map((p) => (
              <div
                key={p.key}
                draggable
                onDragStart={(e) => { setDragCol(p.key); e.dataTransfer.effectAllowed = "move"; }}
                onDragOver={(e) => { if (dragCol && dragCol !== p.key) e.preventDefault(); }}
                onDrop={(e) => { e.preventDefault(); if (dragCol) reorderColumn(dragCol, p.key); setDragCol(null); }}
                onDragEnd={() => setDragCol(null)}
                title="Drag to reorder column"
                style={{ cursor: "grab", opacity: dragCol === p.key ? 0.5 : 1, userSelect: "none" }}
              >{p.name}</div>
            ))}
            <div />
          </div>
          {visibleRows.map((r) => {
            const bg = rowColor(r);
            const isSel = selectedRows.has(r.id);
            return (
              <div key={r.id} style={{ display: "grid", gridTemplateColumns: `28px 2fr ${schema.map(() => "1fr").join(" ")} 40px`, padding: "8px 12px", borderBottom: "1px solid var(--nn-border)", alignItems: "center", fontSize: 14, background: isSel ? "var(--nn-blue-bg)" : (bg || undefined) }}>
                <div><input type="checkbox" checked={isSel} onChange={() => toggleRowSelect(r.id)} onClick={(e) => e.stopPropagation()} /></div>
                <div onClick={() => nav(path(`/p/${r.id}`))} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{r.icon || "📄"}</span>
                  <span>{r.title || "Untitled"}</span>
                </div>
                {schema.map((p) => <div key={p.key}>{renderCell(r, p)}</div>)}
                <button onClick={() => archiveRow(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-tertiary)" }}><Trash2 size={13} /></button>
              </div>
            );
          })}
          <div onClick={() => addRow()} style={{ padding: "8px 12px", color: "var(--nn-text-tertiary)", cursor: "pointer", fontSize: 13 }}>+ New page</div>
        </div>
      )}

      {view === "board" && (
        statusProp ? (() => {
          const cols = statusProp.options || [];
          const swim = swimlaneProp;
          // Compute swimlane buckets: array of { key, label, rows }
          const lanes: { key: string; label: string; rows: Row[] }[] = swim
            ? (() => {
                const opts = swim.options || [];
                const acc: Record<string, Row[]> = {};
                for (const o of opts) acc[o] = [];
                acc["(empty)"] = [];
                for (const r of visibleRows) {
                  const raw = getProp(r, swim.key);
                  const keys: string[] = Array.isArray(raw) && raw.length ? raw.map(String) : [String(raw ?? "") || "(empty)"];
                  for (const k of keys) { (acc[k] ||= []).push(r); }
                }
                return Object.entries(acc).filter(([, v]) => v.length > 0 || opts.includes(v as any)).map(([k, rs]) => ({ key: k, label: k, rows: rs }));
              })()
            : [{ key: "__all__", label: "", rows: visibleRows }];
          const renderLaneCols = (laneRows: Row[], laneKey: string) => (
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap: 12 }}>
              {cols.map((s) => {
                const col = laneRows.filter((r) => (getProp(r, statusProp.key) || cols[0]) === s);
                return (
                  <div key={s} style={{ background: "var(--nn-bg-secondary)", borderRadius: 4, padding: 8, minHeight: 120 }}
                    onDragOver={(ev) => ev.preventDefault()}
                    onDrop={(ev) => {
                      ev.preventDefault();
                      const id = ev.dataTransfer.getData("text/nn-card");
                      const row = rows.find((x) => x.id === id);
                      if (!row) return;
                      setProp(row, statusProp.key, s);
                      if (swim && laneKey !== "__all__" && laneKey !== "(empty)") setProp(row, swim.key, swim.type === "multiselect" ? [laneKey] : laneKey);
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 500, padding: 4, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ background: STATUS_COLORS[s] || "rgba(0,0,0,0.06)", padding: "2px 8px", borderRadius: 3 }}>{s}</span>
                      <span style={{ color: "var(--nn-text-tertiary)" }}>{col.length}</span>
                    </div>
                    {col.map((r) => (
                      <div key={r.id}
                        draggable
                        onDragStart={(ev) => ev.dataTransfer.setData("text/nn-card", r.id)}
                        onClick={() => nav(path(`/p/${r.id}`))}
                        style={{ background: "var(--nn-bg)", padding: 10, marginTop: 6, borderRadius: 4, cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", fontSize: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span>{r.icon || "📄"}</span>
                          <span>{r.title || "Untitled"}</span>
                        </div>
                      </div>
                    ))}
                    <div onClick={() => {
                      const seed: any = { [statusProp.key]: s };
                      if (swim && laneKey !== "__all__" && laneKey !== "(empty)") seed[swim.key] = swim.type === "multiselect" ? [laneKey] : laneKey;
                      addRow(seed);
                    }} style={{ padding: 6, marginTop: 4, color: "var(--nn-text-tertiary)", cursor: "pointer", fontSize: 12 }}>+ New</div>
                  </div>
                );
              })}
            </div>
          );
          return (
            <div>
              {selectishProps.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 12, color: "var(--nn-text-secondary)" }}>
                  <span>Swimlanes:</span>
                  <select value={swimlaneKey} onChange={(e) => setSwimlaneKey(e.target.value)} className="nn-topbar-btn" style={{ fontSize: 12, padding: "3px 6px" }}>
                    <option value="">None</option>
                    {selectishProps.filter((p) => p.key !== statusProp.key).map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
                  </select>
                </div>
              )}
              {swim ? (
                lanes.map((lane) => (
                  <div key={lane.key} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, padding: "4px 8px", background: "var(--nn-bg-secondary)", borderRadius: 4, fontSize: 12, fontWeight: 600, color: "var(--nn-text-secondary)" }}>
                      <span>{lane.label || "(empty)"}</span>
                      <span style={{ color: "var(--nn-text-tertiary)", fontWeight: 400 }}>{lane.rows.length}</span>
                    </div>
                    {renderLaneCols(lane.rows, lane.key)}
                  </div>
                ))
              ) : renderLaneCols(visibleRows, "__all__")}
            </div>
          );
        })() : (
          <div style={{ color: "var(--nn-text-tertiary)", fontSize: 13 }}>Add a select property (e.g. Status) to enable the board view.</div>
        )
      )}

      {view === "calendar" && (
        <CalendarView
          month={calMonth}
          calView={calView}
          setCalView={setCalView}
          onPrev={() => setCalMonth(calView === "week" ? new Date(calMonth.getFullYear(), calMonth.getMonth(), calMonth.getDate() - 7) : new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}
          onNext={() => setCalMonth(calView === "week" ? new Date(calMonth.getFullYear(), calMonth.getMonth(), calMonth.getDate() + 7) : new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}
          onToday={() => { const d = new Date(); setCalMonth(calView === "week" ? d : new Date(d.getFullYear(), d.getMonth(), 1)); }}
          rows={visibleRows}
          dateProp={dateProp}
          endDateProp={endDateProp}
          checkboxProp={checkboxProp}
          onOpen={(id) => nav(path(`/p/${id}`))}
          onAddOnDate={(iso) => dateProp && addRow({ [dateProp.key]: iso })}
          onReschedule={(row, iso) => dateProp && setProp(row, dateProp.key, iso)}
          onToggleCheckbox={(row) => checkboxProp && setProp(row, checkboxProp.key, !getProp(row, checkboxProp.key))}
        />
      )}

      {view === "timeline" && (
        <div>
          {relationProps.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 12, color: "var(--nn-text-secondary)" }}>
              <span>Dependencies:</span>
              <select value={depKey} onChange={(e) => setDepKey(e.target.value)} className="nn-topbar-btn" style={{ fontSize: 12, padding: "3px 6px" }}>
                <option value="">None</option>
                {relationProps.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
              </select>
            </div>
          )}
          <TimelineView
            rows={visibleRows}
            dateProp={dateProp}
            endDateProp={endDateProp}
            depProp={depProp}
            rowColor={rowColor}
            onOpen={(id) => nav(path(`/p/${id}`))}
            onReschedule={(row, iso, isEnd) => {
              const target = isEnd && endDateProp ? endDateProp : dateProp;
              if (target) setProp(row, target.key, iso);
            }}
            getProp={getProp}
          />
        </div>
      )}

      {view === "gallery" && (
        <div>
          {(urlProps.length > 0) && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 12, color: "var(--nn-text-secondary)" }}>
              <span>Card cover:</span>
              <select value={galleryCoverKey} onChange={(e) => setGalleryCoverKey(e.target.value)} className="nn-topbar-btn" style={{ fontSize: 12, padding: "3px 6px" }}>
                <option value="__cover__">Page cover</option>
                {urlProps.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
              </select>
              <span style={{ marginLeft: 8 }}>Fit:</span>
              <button onClick={() => setGalleryFit(galleryFit === "cover" ? "contain" : "cover")} className="nn-topbar-btn" style={{ fontSize: 12 }}>{galleryFit}</button>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {visibleRows.map((r) => {
              const coverUrl = galleryCoverKey === "__cover__" ? r.cover : String(getProp(r, galleryCoverKey) || "");
              return (
                <div key={r.id} onClick={() => nav(path(`/p/${r.id}`))} style={{ border: "1px solid var(--nn-border)", borderRadius: 6, overflow: "hidden", cursor: "pointer", background: "var(--nn-bg)" }}>
                  <div style={{ height: 120, background: coverUrl ? `center/${galleryFit} no-repeat url("${coverUrl}")` : "var(--nn-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: "var(--nn-text-tertiary)" }}>
                    {!coverUrl && (r.icon || "📄")}
                  </div>
                  <div style={{ padding: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, display: "flex", gap: 6, alignItems: "center" }}>
                      {coverUrl && <span>{r.icon || "📄"}</span>}
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title || "Untitled"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div onClick={() => addRow()} style={{ border: "1px dashed var(--nn-border-strong)", borderRadius: 6, minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--nn-text-tertiary)", cursor: "pointer" }}>
              <Plus size={16} style={{ marginRight: 4 }} /> New
            </div>
          </div>
        </div>
      )}

      {view === "list" && (
        <div>
          {visibleRows.map((r) => (
            <div key={r.id} onClick={() => nav(path(`/p/${r.id}`))} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 4px", borderBottom: "1px solid var(--nn-border)", cursor: "pointer", fontSize: 14 }}>
              <span>{r.icon || "📄"}</span>
              <span style={{ flex: 1 }}>{r.title || "Untitled"}</span>
              {statusProp && <span style={{ fontSize: 12, color: "var(--nn-text-secondary)" }}>{getProp(r, statusProp.key) || ""}</span>}
            </div>
          ))}
          <div onClick={() => addRow()} style={{ padding: 8, color: "var(--nn-text-tertiary)", cursor: "pointer", fontSize: 13 }}>+ New page</div>
        </div>
      )}

      {view === "chart" && (
        <ChartView rows={visibleRows} schema={schema} />
      )}

      {showSchema && (
        <SchemaEditor schema={schema} allBlocks={allBlocks} onClose={() => setShowSchema(false)} onSave={(s) => { saveSchema(s); setShowSchema(false); }} />
      )}
      {showCondEditor && (
        <CondEditor rules={condRules} schema={schema} onClose={() => setShowCondEditor(false)} onSave={(r) => { saveCondRules(r); setShowCondEditor(false); }} />
      )}
      {showAuto && (
        <AutomationEditor rules={automations} schema={schema} onClose={() => setShowAuto(false)} onSave={(r) => { saveAutomations(r); setShowAuto(false); }} />
      )}
    </div>
  );
}

function ChartView({ rows, schema }: { rows: Row[]; schema: PropDef[] }) {
  const groupProps = schema.filter((p) => p.type === "select" || p.type === "multiselect" || p.type === "checkbox");
  const numericProps = schema.filter((p) => p.type === "number" || p.type === "formula" || p.type === "rollup");
  const [groupKey, setGroupKey] = useState<string>(groupProps[0]?.key || "__title__");
  const [metricKey, setMetricKey] = useState<string>("__count__");
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  const getProp = (r: Row, key: string): any => { try { return (r.properties ? JSON.parse(r.properties) : {})[key]; } catch { return undefined; } };

  const buckets = useMemo(() => {
    const map = new Map<string, { label: string; count: number; sum: number }>();
    for (const r of rows) {
      let raw: any = groupKey === "__title__" ? (r.title || "Untitled") : getProp(r, groupKey);
      const keys: string[] = Array.isArray(raw) ? (raw.length ? raw.map(String) : ["(empty)"]) : [String(raw ?? "") || "(empty)"];
      const metric = metricKey === "__count__" ? 1 : (Number(getProp(r, metricKey)) || 0);
      for (const k of keys) {
        const cur = map.get(k) || { label: k, count: 0, sum: 0 };
        cur.count += 1;
        cur.sum += metric;
        map.set(k, cur);
      }
    }
    return [...map.values()].sort((a, b) => b.sum - a.sum);
  }, [rows, groupKey, metricKey]);

  const total = buckets.reduce((a, b) => a + b.sum, 0) || 1;
  const max = Math.max(...buckets.map((b) => b.sum), 1);
  const palette = ["#2383e2", "#eb5757", "#d9730d", "#0f7b6c", "#6940a5", "#ad1a72", "#dfab01", "#0b6e99"];

  if (rows.length === 0) return <div style={{ color: "var(--nn-text-tertiary)", fontSize: 13 }}>No rows to chart.</div>;

  return (
    <div className="nn-chart">
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ fontSize: 12, color: "var(--nn-text-secondary)" }}>Group by</label>
        <select value={groupKey} onChange={(e) => setGroupKey(e.target.value)} className="nn-topbar-btn" style={{ padding: "4px 6px", fontSize: 12 }}>
          <option value="__title__">Name</option>
          {groupProps.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
        </select>
        <label style={{ fontSize: 12, color: "var(--nn-text-secondary)" }}>Metric</label>
        <select value={metricKey} onChange={(e) => setMetricKey(e.target.value)} className="nn-topbar-btn" style={{ padding: "4px 6px", fontSize: 12 }}>
          <option value="__count__">Count</option>
          {numericProps.map((p) => <option key={p.key} value={p.key}>Sum of {p.name}</option>)}
        </select>
        <button onClick={() => setChartType(chartType === "bar" ? "pie" : "bar")} className="nn-topbar-btn" style={{ fontSize: 12 }}>{chartType === "bar" ? "→ Pie" : "→ Bar"}</button>
      </div>
      {chartType === "bar" ? (
        <div>
          {buckets.map((b, i) => (
            <div key={b.label} className="nn-chart-bar-row">
              <div className="nn-chart-bar-label" title={b.label}>{b.label}</div>
              <div className="nn-chart-bar-track">
                <div className="nn-chart-bar-fill" style={{ width: `${(b.sum / max) * 100}%`, background: palette[i % palette.length] }} />
              </div>
              <div className="nn-chart-bar-value">{b.sum.toLocaleString()}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
          <svg width="200" height="200" viewBox="0 0 100 100">
            {(() => {
              let acc = 0;
              return buckets.map((b, i) => {
                const frac = b.sum / total;
                const start = acc * 2 * Math.PI - Math.PI / 2;
                acc += frac;
                const end = acc * 2 * Math.PI - Math.PI / 2;
                const x1 = 50 + 50 * Math.cos(start), y1 = 50 + 50 * Math.sin(start);
                const x2 = 50 + 50 * Math.cos(end), y2 = 50 + 50 * Math.sin(end);
                const large = frac > 0.5 ? 1 : 0;
                const d = `M50,50 L${x1},${y1} A50,50 0 ${large} 1 ${x2},${y2} Z`;
                return <path key={b.label} d={d} fill={palette[i % palette.length]} />;
              });
            })()}
          </svg>
          <div style={{ fontSize: 13 }}>
            {buckets.map((b, i) => (
              <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 6, margin: "4px 0" }}>
                <span style={{ width: 10, height: 10, background: palette[i % palette.length], borderRadius: 2 }} />
                <span>{b.label}</span>
                <span style={{ color: "var(--nn-text-tertiary)" }}>{b.sum} ({Math.round((b.sum / total) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarView({ month, calView, setCalView, onPrev, onNext, onToday, rows, dateProp, endDateProp, checkboxProp, onOpen, onAddOnDate, onReschedule, onToggleCheckbox }: {
  month: Date; calView: "month" | "week"; setCalView: (v: "month" | "week") => void;
  onPrev: () => void; onNext: () => void; onToday: () => void;
  rows: Row[]; dateProp: PropDef | null; endDateProp: PropDef | null; checkboxProp: PropDef | null;
  onOpen: (id: string) => void; onAddOnDate: (iso: string) => void;
  onReschedule: (row: Row, iso: string) => void; onToggleCheckbox: (row: Row) => void;
}) {
  if (!dateProp) return <div style={{ color: "var(--nn-text-tertiary)", fontSize: 13 }}>Add a date property to enable the calendar view.</div>;
  const todayIso = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; })();
  const getVal = (r: Row, key: string): any => { try { return (r.properties ? JSON.parse(r.properties) : {})[key]; } catch { return undefined; } };
  const isoOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const rowMatchesDate = (r: Row, iso: string) => {
    const s = String(getVal(r, dateProp.key) || "").slice(0, 10);
    if (!s) return false;
    const e = endDateProp ? String(getVal(r, endDateProp.key) || "").slice(0, 10) : "";
    if (!e) return s === iso;
    return iso >= s && iso <= e;
  };

  let cells: Array<{ date: Date | null; iso: string; items: Row[] }> = [];
  let label = "";
  if (calView === "week") {
    const base = new Date(month);
    const start = new Date(base); start.setDate(base.getDate() - base.getDay());
    for (let i = 0; i < 7; i++) {
      const date = new Date(start); date.setDate(start.getDate() + i);
      const iso = isoOf(date);
      cells.push({ date, iso, items: rows.filter((r) => rowMatchesDate(r, iso)) });
    }
    const end = new Date(start); end.setDate(start.getDate() + 6);
    label = `${start.toLocaleString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
  } else {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    for (let i = 0; i < startDow; i++) cells.push({ date: null, iso: "", items: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(month.getFullYear(), month.getMonth(), d);
      const iso = isoOf(date);
      cells.push({ date, iso, items: rows.filter((r) => rowMatchesDate(r, iso)) });
    }
    label = month.toLocaleString(undefined, { month: "long", year: "numeric" });
  }
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <button onClick={onPrev} className="nn-topbar-btn"><ChevronLeft size={14} /></button>
        <div style={{ fontWeight: 600, minWidth: 180 }}>{label}</div>
        <button onClick={onNext} className="nn-topbar-btn"><ChevronRight size={14} /></button>
        <button onClick={onToday} className="nn-topbar-btn">Today</button>
        <div style={{ flex: 1 }} />
        <button onClick={() => setCalView("month")} className="nn-topbar-btn" style={{ borderBottom: calView === "month" ? "2px solid var(--nn-text)" : "none", borderRadius: 0 }}>Month</button>
        <button onClick={() => setCalView("week")} className="nn-topbar-btn" style={{ borderBottom: calView === "week" ? "2px solid var(--nn-text)" : "none", borderRadius: 0 }}>Week</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderTop: "1px solid var(--nn-border)", borderLeft: "1px solid var(--nn-border)" }}>
        {dow.map((d) => <div key={d} style={{ padding: 6, fontSize: 12, color: "var(--nn-text-secondary)", background: "var(--nn-bg-secondary)", borderRight: "1px solid var(--nn-border)", borderBottom: "1px solid var(--nn-border)" }}>{d}</div>)}
        {cells.map((c, i) => {
          const isToday = c.iso === todayIso;
          return (
            <div
              key={i}
              onDragOver={(e) => { if (c.date) e.preventDefault(); }}
              onDrop={(e) => {
                if (!c.date) return;
                const id = e.dataTransfer.getData("text/nn-row-id");
                const row = rows.find((r) => String(r.id) === id);
                if (row) onReschedule(row, c.iso);
              }}
              style={{ minHeight: calView === "week" ? 300 : 90, padding: 4, borderRight: "1px solid var(--nn-border)", borderBottom: "1px solid var(--nn-border)", background: c.date ? "var(--nn-bg)" : "var(--nn-bg-secondary)" }}
            >
              {c.date && (
                <>
                  <div style={{ fontSize: 12, color: "var(--nn-text-secondary)", display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={isToday ? { background: "var(--nn-blue)", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 600 } : undefined}>{c.date.getDate()}</span>
                    <button onClick={() => onAddOnDate(c.iso)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-tertiary)", padding: 0 }}><Plus size={11} /></button>
                  </div>
                  {c.items.map((r) => {
                    const done = checkboxProp ? !!getVal(r, checkboxProp.key) : false;
                    return (
                      <div
                        key={r.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/nn-row-id", String(r.id))}
                        onClick={() => onOpen(r.id)}
                        style={{ background: "var(--nn-blue-bg)", color: "var(--nn-blue)", padding: "2px 6px", borderRadius: 3, fontSize: 12, marginTop: 2, cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4, opacity: done ? 0.55 : 1 }}
                      >
                        {checkboxProp && (
                          <input
                            type="checkbox"
                            checked={done}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => onToggleCheckbox(r)}
                            style={{ margin: 0, cursor: "pointer" }}
                          />
                        )}
                        <span style={{ textDecoration: done ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {r.icon || "📄"} {r.title || "Untitled"}
                        </span>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SchemaEditor({ schema, allBlocks, onClose, onSave }: { schema: PropDef[]; allBlocks: any[]; onClose: () => void; onSave: (s: PropDef[]) => void }) {
  const [draft, setDraft] = useState<PropDef[]>(JSON.parse(JSON.stringify(schema)));
  const TYPES: PropType[] = ["text", "number", "select", "multiselect", "date", "checkbox", "url", "email", "phone", "person", "formula", "rollup", "button", "ai", "relation"];
  const databases = allBlocks.filter((b) => b.type === "database");
  const numericSources = draft.filter((p) => p.type === "number");
  const add = () => {
    const key = `prop_${Date.now().toString(36)}`;
    setDraft([...draft, { key, name: "New property", type: "text" }]);
  };
  const update = (i: number, patch: Partial<PropDef>) => {
    const next = [...draft];
    next[i] = { ...next[i], ...patch };
    setDraft(next);
  };
  const del = (i: number) => setDraft(draft.filter((_, j) => j !== i));
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "var(--nn-bg)", borderRadius: 8, width: "100%", maxWidth: 600, padding: 20, maxHeight: "80vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Properties</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-secondary)" }}><X size={16} /></button>
        </div>
        {draft.map((p, i) => (
          <div key={p.key} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
            <input value={p.name} onChange={(e) => update(i, { name: e.target.value })} className="nn-auth-input" style={{ marginBottom: 0, flex: 1, minWidth: 120 }} />
            <select value={p.type} onChange={(e) => update(i, { type: e.target.value as PropType })} className="nn-auth-input" style={{ marginBottom: 0, width: 110 }}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {(p.type === "select" || p.type === "multiselect") && (
              <input value={(p.options || []).join(", ")} onChange={(e) => update(i, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="Option A, Option B" className="nn-auth-input" style={{ marginBottom: 0, width: 200 }} />
            )}
            {p.type === "formula" && (
              <FormulaInput value={p.formula || ""} onChange={(v) => update(i, { formula: v })} propKeys={schema.map((sp) => sp.name)} />
            )}
            {p.type === "rollup" && (
              <>
                <select value={p.rollup?.source || ""} onChange={(e) => update(i, { rollup: { source: e.target.value, agg: p.rollup?.agg || "sum" } })} className="nn-auth-input" style={{ marginBottom: 0, width: 130 }}>
                  <option value="">Source…</option>
                  {schema.filter(sp => sp.key !== p.key).map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}
                </select>
                <select value={p.rollup?.agg || "sum"} onChange={(e) => update(i, { rollup: { source: p.rollup?.source || "", agg: e.target.value as any } })} className="nn-auth-input" style={{ marginBottom: 0, width: 140 }}>
                  <optgroup label="Count">
                    <option value="count">Count all</option>
                    <option value="count_values">Count values</option>
                    <option value="count_unique">Count unique</option>
                    <option value="count_empty">Count empty</option>
                    <option value="count_not_empty">Count not empty</option>
                    <option value="percent_empty">% empty</option>
                    <option value="percent_not_empty">% not empty</option>
                  </optgroup>
                  <optgroup label="Number">
                    <option value="sum">Sum</option>
                    <option value="avg">Average</option>
                    <option value="median">Median</option>
                    <option value="min">Min</option>
                    <option value="max">Max</option>
                    <option value="range">Range</option>
                  </optgroup>
                  <optgroup label="Date">
                    <option value="earliest_date">Earliest date</option>
                    <option value="latest_date">Latest date</option>
                    <option value="date_range">Date range</option>
                  </optgroup>
                  <optgroup label="Show">
                    <option value="show_original">Show original</option>
                    <option value="show_unique">Show unique</option>
                  </optgroup>
                </select>
              </>
            )}
            {p.type === "number" && (
              <select value={p.numberFormat || "plain"} onChange={(e) => update(i, { numberFormat: e.target.value as any })} className="nn-auth-input" style={{ marginBottom: 0, width: 110 }}>
                <option value="plain">Plain</option>
                <option value="number">Number</option>
                <option value="commas">1,000</option>
                <option value="percent">Percent</option>
                <option value="usd">USD $</option>
                <option value="eur">EUR €</option>
                <option value="gbp">GBP £</option>
                <option value="yuan">Yuan ¥</option>
                <option value="yen">Yen ¥</option>
              </select>
            )}
            {p.type === "button" && (
              <input
                value={p.button?.label || ""}
                onChange={(e) => update(i, { button: { label: e.target.value, actions: p.button?.actions || [] } })}
                placeholder="Button label (actions via JSON below)"
                className="nn-auth-input"
                style={{ marginBottom: 0, width: 220 }}
              />
            )}
            {p.type === "button" && (
              <input
                value={JSON.stringify(p.button?.actions || [])}
                onChange={(e) => { try { const a = JSON.parse(e.target.value); update(i, { button: { label: p.button?.label || "Run", actions: a } }); } catch {} }}
                placeholder='[{"kind":"set","prop":"status","value":"Done"}]'
                className="nn-auth-input"
                style={{ marginBottom: 0, width: 260, fontFamily: "monospace", fontSize: 11 }}
              />
            )}
            {p.type === "ai" && (
              <>
                <select value={p.ai?.mode || "summary"} onChange={(e) => update(i, { ai: { mode: e.target.value as any, lang: p.ai?.lang } })} className="nn-auth-input" style={{ marginBottom: 0, width: 120 }}>
                  <option value="summary">summary</option>
                  <option value="keywords">keywords</option>
                  <option value="translate">translate</option>
                </select>
                {p.ai?.mode === "translate" && (
                  <input value={p.ai?.lang || ""} onChange={(e) => update(i, { ai: { mode: "translate", lang: e.target.value } })} placeholder="lang (e.g. es)" className="nn-auth-input" style={{ marginBottom: 0, width: 90 }} />
                )}
              </>
            )}
            {p.type === "relation" && (
              <select
                value={p.relation?.databaseId || ""}
                onChange={(e) => update(i, { relation: { databaseId: e.target.value } })}
                className="nn-auth-input"
                style={{ marginBottom: 0, width: 220 }}
              >
                <option value="">Target database…</option>
                {databases.map((d) => <option key={d.id} value={d.id}>{d.title || "Untitled"}</option>)}
              </select>
            )}
            <button onClick={() => del(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-tertiary)" }}><Trash2 size={14} /></button>
          </div>
        ))}
        <button onClick={add} className="nn-topbar-btn" style={{ marginTop: 8 }}><Plus size={13} /> Add property</button>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <button onClick={onClose} className="nn-topbar-btn">Cancel</button>
          <button onClick={() => onSave(draft)} className="nn-btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Timeline / Gantt view ─────────────────────────────────── */
function TimelineView({ rows, dateProp, endDateProp, depProp, rowColor, onOpen, onReschedule, getProp: outerGetProp }: {
  rows: Row[]; dateProp: PropDef | null; endDateProp: PropDef | null;
  depProp?: PropDef | null;
  rowColor: (r: Row) => string;
  onOpen: (id: string) => void;
  onReschedule: (row: Row, iso: string, isEnd: boolean) => void;
  getProp?: (r: Row, key: string) => any;
}) {
  if (!dateProp) return <div style={{ color: "var(--nn-text-tertiary)", fontSize: 13 }}>Add a date property to enable the timeline view.</div>;
  const getVal = (r: Row, key: string): string => { try { return String((r.properties ? JSON.parse(r.properties) : {})[key] || "").slice(0, 10); } catch { return ""; } };
  const dates = rows.flatMap((r) => [getVal(r, dateProp.key), endDateProp ? getVal(r, endDateProp.key) : ""].filter(Boolean));
  const today = new Date();
  const minD = dates.length ? new Date(Math.min(...dates.map((d) => new Date(d).getTime()))) : new Date(today.getFullYear(), today.getMonth(), 1);
  const maxD = dates.length ? new Date(Math.max(...dates.map((d) => new Date(d).getTime()))) : new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const start = new Date(minD); start.setDate(start.getDate() - 3);
  const end = new Date(maxD); end.setDate(end.getDate() + 7);
  const dayMs = 86400000;
  const totalDays = Math.max(14, Math.ceil((end.getTime() - start.getTime()) / dayMs));
  const cellW = 32;
  const rowH = 32;
  const labelW = 200;
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const days: Date[] = [];
  for (let i = 0; i < totalDays; i++) { const d = new Date(start); d.setDate(start.getDate() + i); days.push(d); }
  const todayIso = iso(today);
  // Pre-compute bar geometry per row for dependency arrows.
  const geom = new Map<string, { off: number; span: number; index: number }>();
  const visible: Row[] = [];
  rows.forEach((r) => {
    const s = getVal(r, dateProp.key);
    if (!s) return;
    const e = endDateProp ? getVal(r, endDateProp.key) : "";
    const sD = new Date(s), eD = e ? new Date(e) : sD;
    const off = Math.max(0, Math.round((sD.getTime() - start.getTime()) / dayMs));
    const span = Math.max(1, Math.round((eD.getTime() - sD.getTime()) / dayMs) + 1);
    geom.set(r.id, { off, span, index: visible.length });
    visible.push(r);
  });
  const totalW = labelW + totalDays * cellW;
  const totalH = visible.length * rowH;
  const depsResolve = (r: Row): string[] => {
    if (!depProp) return [];
    const raw = outerGetProp ? outerGetProp(r, depProp.key) : undefined;
    if (Array.isArray(raw)) return raw.map(String);
    if (typeof raw === "string" && raw) return raw.split(",").map((s) => s.trim()).filter(Boolean);
    return [];
  };
  return (
    <div style={{ border: "1px solid var(--nn-border)", borderRadius: 4, overflow: "auto", position: "relative" }}>
      <div style={{ display: "grid", gridTemplateColumns: `${labelW}px repeat(${totalDays}, ${cellW}px)`, position: "sticky", top: 0, background: "var(--nn-bg-secondary)", borderBottom: "1px solid var(--nn-border)", fontSize: 11, color: "var(--nn-text-secondary)", zIndex: 2 }}>
        <div style={{ padding: "6px 8px", fontWeight: 500 }}>Task</div>
        {days.map((d) => {
          const isFirst = d.getDate() === 1;
          const isTd = iso(d) === todayIso;
          return (
            <div key={d.toISOString()} style={{ textAlign: "center", padding: "6px 2px", borderLeft: "1px solid var(--nn-border)", background: isTd ? "var(--nn-blue-bg)" : undefined, color: isTd ? "var(--nn-blue)" : undefined, fontWeight: isFirst ? 600 : 400 }}>
              <div>{d.getDate()}</div>
              {isFirst && <div style={{ fontSize: 9, opacity: 0.7 }}>{d.toLocaleString(undefined, { month: "short" })}</div>}
            </div>
          );
        })}
      </div>
      <div style={{ position: "relative", minWidth: totalW }}>
        {visible.map((r) => {
          const g = geom.get(r.id)!;
          const s = getVal(r, dateProp.key);
          const e = endDateProp ? getVal(r, endDateProp.key) : "";
          const bg = rowColor(r) || "var(--nn-blue-bg)";
          return (
            <div key={r.id} style={{ display: "grid", gridTemplateColumns: `${labelW}px repeat(${totalDays}, ${cellW}px)`, borderBottom: "1px solid var(--nn-border)", alignItems: "center", minHeight: rowH }}>
              <div onClick={() => onOpen(r.id)} style={{ padding: "6px 8px", cursor: "pointer", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <span>{r.icon || "📄"}</span> {r.title || "Untitled"}
              </div>
              <div style={{ gridColumn: `${2 + g.off} / span ${g.span}`, position: "relative", padding: "0 2px" }}>
                <div
                  onClick={() => onOpen(r.id)}
                  draggable
                  onDragStart={(ev) => ev.dataTransfer.setData("text/nn-tl", r.id)}
                  title={`${s}${e ? " → " + e : ""}`}
                  style={{ background: bg, color: "var(--nn-blue)", height: 20, borderRadius: 4, cursor: "pointer", fontSize: 11, padding: "2px 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", border: "1px solid var(--nn-blue)" }}
                >
                  {r.title || "Untitled"}
                </div>
              </div>
              {days.map((d, i) => (
                <div
                  key={i}
                  onDragOver={(ev) => { ev.preventDefault(); }}
                  onDrop={(ev) => { ev.preventDefault(); const id = ev.dataTransfer.getData("text/nn-tl"); if (id === r.id) onReschedule(r, iso(d), false); }}
                  style={{ position: "absolute", pointerEvents: "none" }}
                />
              ))}
            </div>
          );
        })}
        {depProp && visible.length > 0 && (
          <svg width={totalW} height={totalH} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
            <defs>
              <marker id="nn-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="#eb5757" />
              </marker>
            </defs>
            {visible.flatMap((r) => {
              const g = geom.get(r.id)!;
              const yTo = g.index * rowH + rowH / 2;
              const xTo = labelW + g.off * cellW;
              return depsResolve(r).map((depId) => {
                const gd = geom.get(depId); if (!gd) return null;
                const xFrom = labelW + (gd.off + gd.span) * cellW;
                const yFrom = gd.index * rowH + rowH / 2;
                const mx = (xFrom + xTo) / 2;
                const d = `M ${xFrom} ${yFrom} C ${mx} ${yFrom}, ${mx} ${yTo}, ${xTo} ${yTo}`;
                return <path key={r.id + "->" + depId} d={d} stroke="#eb5757" strokeWidth={1.5} fill="none" markerEnd="url(#nn-arrow)" opacity={0.75} />;
              }).filter(Boolean);
            })}
          </svg>
        )}
      </div>
      {!rows.length && <div style={{ padding: 12, color: "var(--nn-text-tertiary)", fontSize: 13 }}>No rows with a date to show.</div>}
    </div>
  );
}


/* ─── Conditional formatting editor ─────────────────────────── */
function CondEditor({ rules, schema, onClose, onSave }: {
  rules: CondRule[]; schema: PropDef[];
  onClose: () => void; onSave: (r: CondRule[]) => void;
}) {
  const [draft, setDraft] = useState<CondRule[]>(JSON.parse(JSON.stringify(rules)));
  const OPS: CondRule["op"][] = ["eq", "neq", "contains", "gt", "lt", "empty", "notempty"];
  const OP_LABEL: Record<CondRule["op"], string> = { eq: "equals", neq: "not equals", contains: "contains", gt: ">", lt: "<", empty: "is empty", notempty: "is not empty" };
  const COLORS = [
    ["rgba(241,241,239,0.6)", "Gray"],
    ["rgba(253,235,220,0.7)", "Orange"],
    ["rgba(251,236,213,0.7)", "Yellow"],
    ["rgba(219,237,219,0.7)", "Green"],
    ["rgba(211,229,239,0.7)", "Blue"],
    ["rgba(232,222,238,0.7)", "Purple"],
    ["rgba(255,224,224,0.7)", "Red"],
  ];
  const add = () => setDraft([...draft, { prop: schema[0]?.key || "__title__", op: "eq", value: "", color: COLORS[0][0] }]);
  const upd = (i: number, patch: Partial<CondRule>) => { const n = [...draft]; n[i] = { ...n[i], ...patch }; setDraft(n); };
  const del = (i: number) => setDraft(draft.filter((_, j) => j !== i));
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "var(--nn-bg)", borderRadius: 8, width: "100%", maxWidth: 680, padding: 20, maxHeight: "80vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Conditional formatting</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-secondary)" }}><X size={16} /></button>
        </div>
        <div style={{ fontSize: 12, color: "var(--nn-text-secondary)", marginBottom: 12 }}>Rules apply in order — the first match wins.</div>
        {draft.map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select value={r.prop} onChange={(e) => upd(i, { prop: e.target.value })} className="nn-auth-input" style={{ marginBottom: 0, width: 130 }}>
              <option value="__title__">Name</option>
              {schema.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
            </select>
            <select value={r.op} onChange={(e) => upd(i, { op: e.target.value as CondRule["op"] })} className="nn-auth-input" style={{ marginBottom: 0, width: 120 }}>
              {OPS.map((o) => <option key={o} value={o}>{OP_LABEL[o]}</option>)}
            </select>
            {r.op !== "empty" && r.op !== "notempty" && (
              <input value={r.value} onChange={(e) => upd(i, { value: e.target.value })} placeholder="value" className="nn-auth-input" style={{ marginBottom: 0, width: 140 }} />
            )}
            <div style={{ display: "flex", gap: 4 }}>
              {COLORS.map(([c, name]) => (
                <button key={c} onClick={() => upd(i, { color: c })} title={name} style={{ width: 20, height: 20, borderRadius: 3, background: c, border: r.color === c ? "2px solid var(--nn-blue)" : "1px solid var(--nn-border)", cursor: "pointer" }} />
              ))}
            </div>
            <button onClick={() => del(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-tertiary)" }}><Trash2 size={14} /></button>
          </div>
        ))}
        <button onClick={add} className="nn-topbar-btn" style={{ marginTop: 8 }}><Plus size={13} /> Add rule</button>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <button onClick={onClose} className="nn-topbar-btn">Cancel</button>
          <button onClick={() => onSave(draft)} className="nn-btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
}

function AutomationEditor({ rules, schema, onClose, onSave }: {
  rules: AutoRule[]; schema: PropDef[];
  onClose: () => void; onSave: (r: AutoRule[]) => void;
}) {
  const [list, setList] = useState<AutoRule[]>(rules);
  const upd = (i: number, patch: Partial<AutoRule>) => setList((L) => L.map((r, j) => j === i ? { ...r, ...patch } : r));
  const updAction = (i: number, ai: number, patch: any) => setList((L) => L.map((r, j) => j === i ? { ...r, actions: r.actions.map((a, k) => k === ai ? { ...a, ...patch } : a) } : r));
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "var(--nn-bg)", borderRadius: 6, width: 620, maxHeight: "85vh", overflow: "auto", padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>⚡ Automations</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-tertiary)", fontSize: 18 }}>×</button>
        </div>
        <div style={{ fontSize: 12, color: "var(--nn-text-tertiary)", marginBottom: 12 }}>Run actions when a row is created or a property changes.</div>
        {list.map((r, i) => (
          <div key={r.id} style={{ border: "1px solid var(--nn-border)", borderRadius: 4, padding: 10, marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
              <input value={r.name} onChange={(e) => upd(i, { name: e.target.value })} placeholder="Name" style={{ flex: 1, background: "transparent", border: "1px solid var(--nn-border)", borderRadius: 3, padding: "3px 6px", fontSize: 13, color: "var(--nn-text)" }} />
              <label style={{ fontSize: 12, display: "flex", gap: 4, alignItems: "center" }}>
                <input type="checkbox" checked={r.enabled} onChange={(e) => upd(i, { enabled: e.target.checked })} /> On
              </label>
              <button onClick={() => setList((L) => L.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-red)", fontSize: 16 }}>×</button>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 6, fontSize: 12, alignItems: "center" }}>
              <span>When</span>
              <select value={r.trigger} onChange={(e) => upd(i, { trigger: e.target.value as any })} style={{ padding: 3, fontSize: 12 }}>
                <option value="created">Row created</option>
                <option value="propChanged">Property changes</option>
              </select>
              {r.trigger === "propChanged" && (
                <>
                  <select value={r.prop || ""} onChange={(e) => upd(i, { prop: e.target.value })} style={{ padding: 3, fontSize: 12 }}>
                    <option value="">any property</option>
                    {schema.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
                  </select>
                  <span>equals</span>
                  <input value={r.to || ""} onChange={(e) => upd(i, { to: e.target.value })} placeholder="(any)" style={{ background: "transparent", border: "1px solid var(--nn-border)", borderRadius: 3, padding: "2px 5px", fontSize: 12, width: 80, color: "var(--nn-text)" }} />
                </>
              )}
            </div>
            <div style={{ fontSize: 12, marginBottom: 4 }}>Then:</div>
            {r.actions.map((a, ai) => (
              <div key={ai} style={{ display: "flex", gap: 4, marginBottom: 4, fontSize: 12, alignItems: "center", paddingLeft: 12 }}>
                <select value={a.kind} onChange={(e) => {
                  const k = e.target.value;
                  const next: any = k === "set" ? { kind: "set", prop: schema[0]?.key || "", value: "" }
                    : k === "increment" ? { kind: "increment", prop: schema.find(p => p.type === "number")?.key || "", by: 1 }
                    : k === "notify" ? { kind: "notify", message: "" }
                    : { kind: "webhook", url: "" };
                  updAction(i, ai, next);
                }} style={{ padding: 3, fontSize: 12 }}>
                  <option value="set">Set property</option>
                  <option value="increment">Increment number</option>
                  <option value="notify">Show toast</option>
                  <option value="webhook">POST webhook</option>
                </select>
                {(a.kind === "set" || a.kind === "increment") && (
                  <select value={(a as any).prop} onChange={(e) => updAction(i, ai, { prop: e.target.value })} style={{ padding: 3, fontSize: 12 }}>
                    {schema.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
                  </select>
                )}
                {a.kind === "set" && (
                  <input value={(a as any).value} onChange={(e) => updAction(i, ai, { value: e.target.value })} placeholder="value" style={{ background: "transparent", border: "1px solid var(--nn-border)", borderRadius: 3, padding: "2px 5px", fontSize: 12, flex: 1, color: "var(--nn-text)" }} />
                )}
                {a.kind === "increment" && (
                  <input type="number" value={(a as any).by} onChange={(e) => updAction(i, ai, { by: Number(e.target.value) || 1 })} style={{ background: "transparent", border: "1px solid var(--nn-border)", borderRadius: 3, padding: "2px 5px", fontSize: 12, width: 60, color: "var(--nn-text)" }} />
                )}
                {a.kind === "notify" && (
                  <input value={(a as any).message} onChange={(e) => updAction(i, ai, { message: e.target.value })} placeholder="Toast message" style={{ background: "transparent", border: "1px solid var(--nn-border)", borderRadius: 3, padding: "2px 5px", fontSize: 12, flex: 1, color: "var(--nn-text)" }} />
                )}
                {a.kind === "webhook" && (
                  <input value={(a as any).url} onChange={(e) => updAction(i, ai, { url: e.target.value })} placeholder="https://…" style={{ background: "transparent", border: "1px solid var(--nn-border)", borderRadius: 3, padding: "2px 5px", fontSize: 12, flex: 1, color: "var(--nn-text)" }} />
                )}
                <button onClick={() => upd(i, { actions: r.actions.filter((_, k) => k !== ai) })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-tertiary)" }}>×</button>
              </div>
            ))}
            <button onClick={() => upd(i, { actions: [...r.actions, { kind: "set", prop: schema[0]?.key || "", value: "" }] })} className="nn-topbar-btn" style={{ fontSize: 11, marginLeft: 12 }}>+ Action</button>
          </div>
        ))}
        <button onClick={() => setList([...list, { id: `a_${Date.now()}`, name: "New automation", trigger: "propChanged", actions: [{ kind: "set", prop: schema[0]?.key || "", value: "" }], enabled: true }])} className="nn-topbar-btn" style={{ fontSize: 12 }}>+ Add automation</button>
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginTop: 12 }}>
          <button onClick={onClose} className="nn-topbar-btn" style={{ fontSize: 12 }}>Cancel</button>
          <button onClick={() => onSave(list)} className="nn-btn-primary" style={{ fontSize: 12 }}>Save</button>
        </div>
      </div>
    </div>
  );
}

const FORMULA_HELPERS = [
  "prop", "if", "empty", "length", "contains", "concat", "slice", "lower", "upper", "format",
  "toNumber", "round", "abs", "max", "min", "now", "today", "dateAdd", "dateBetween", "formatDate",
  "split", "join", "replace", "replaceAll", "startsWith", "endsWith", "test", "match", "trim",
  "map", "filter", "reduce", "some", "every", "sum", "count",
  "year", "month", "day", "hour", "minute", "weekday", "timestamp", "fromTimestamp",
];

function FormulaInput({ value, onChange, propKeys }: { value: string; onChange: (v: string) => void; propKeys: string[] }) {
  const [open, setOpen] = useState(false);
  const [caret, setCaret] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentToken = (() => {
    const before = value.slice(0, caret);
    const m = before.match(/([a-zA-Z_]\w*)$/);
    return m ? m[1] : "";
  })();
  const suggestions = currentToken
    ? [...FORMULA_HELPERS, ...propKeys].filter((s) => s.toLowerCase().startsWith(currentToken.toLowerCase()) && s !== currentToken).slice(0, 8)
    : [];

  const accept = (name: string) => {
    const before = value.slice(0, caret).replace(/[a-zA-Z_]\w*$/, "");
    const after = value.slice(caret);
    const insert = FORMULA_HELPERS.includes(name) ? `${name}(` : name;
    const next = before + insert + after;
    onChange(next);
    setOpen(false);
    setTimeout(() => {
      const pos = (before + insert).length;
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(pos, pos);
    }, 0);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => { onChange(e.target.value); setCaret(e.target.selectionStart || 0); setOpen(true); }}
        onKeyUp={(e) => setCaret((e.target as HTMLInputElement).selectionStart || 0)}
        onClick={(e) => setCaret((e.target as HTMLInputElement).selectionStart || 0)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (open && suggestions.length > 0 && (e.key === "Tab" || e.key === "Enter")) {
            e.preventDefault();
            accept(suggestions[0]);
          } else if (e.key === "Escape") setOpen(false);
        }}
        placeholder="e.g. prop('price') * prop('qty')"
        className="nn-auth-input"
        style={{ marginBottom: 0, width: 220, fontFamily: "monospace" }}
      />
      {open && suggestions.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 2, background: "var(--nn-bg)", border: "1px solid var(--nn-border-strong)", borderRadius: 4, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 200, minWidth: 220, maxHeight: 200, overflow: "auto" }}>
          {suggestions.map((s, i) => (
            <div key={s} onMouseDown={(e) => { e.preventDefault(); accept(s); }}
              style={{ padding: "4px 8px", fontSize: 12, fontFamily: "monospace", cursor: "pointer", background: i === 0 ? "var(--nn-bg-secondary)" : "transparent", color: "var(--nn-text)" }}>
              {s}{FORMULA_HELPERS.includes(s) && <span style={{ color: "var(--nn-text-tertiary)" }}>(…)</span>}
            </div>
          ))}
          <div style={{ padding: "3px 8px", fontSize: 10, color: "var(--nn-text-tertiary)", borderTop: "1px solid var(--nn-border)" }}>Tab or Enter to insert</div>
        </div>
      )}
    </div>
  );
}
