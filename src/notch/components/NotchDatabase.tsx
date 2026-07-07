import { useEffect, useState, useCallback, useMemo } from "react";
import { Plus, Trash2, Table, LayoutGrid, Calendar as CalIcon, Settings2, X, ChevronLeft, ChevronRight, Image as ImageIcon, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import { cctList, cctCreate, cctUpdate, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";

interface Props { databaseId: string; workspaceId: string; }
type ViewMode = "table" | "board" | "calendar" | "gallery" | "list";
type PropType = "text" | "number" | "select" | "multiselect" | "date" | "checkbox" | "url" | "email" | "phone" | "person" | "formula" | "rollup";
interface PropDef { key: string; name: string; type: PropType; options?: string[]; formula?: string; rollup?: { source: string; agg: "sum" | "avg" | "min" | "max" | "count" }; }
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
  const [schema, setSchema] = useState<PropDef[]>(DEFAULT_SCHEMA);
  const [view, setView] = useState<ViewMode>("table");
  const [loading, setLoading] = useState(true);
  const [showSchema, setShowSchema] = useState(false);
  const [dbBlock, setDbBlock] = useState<any>(null);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [filterKey, setFilterKey] = useState<string>("");
  const [filterVal, setFilterVal] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const load = useCallback(async () => {
    setLoading(true);
    const all = await cctList<any>(NN.block, { workspace_id: workspaceId });
    const parent = all.find((b: any) => String(b.id) === String(databaseId));
    setDbBlock(parent);
    try {
      const p = parent?.properties ? JSON.parse(parent.properties) : {};
      if (Array.isArray(p.schema) && p.schema.length) setSchema(p.schema);
      else setSchema(DEFAULT_SCHEMA);
    } catch { setSchema(DEFAULT_SCHEMA); }
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

  const getProp = (r: Row, key: string) => {
    try { return (r.properties ? JSON.parse(r.properties) : {})[key]; } catch { return undefined; }
  };
  const setProp = async (r: Row, key: string, value: any) => {
    let props: any = {};
    try { props = r.properties ? JSON.parse(r.properties) : {}; } catch {}
    props[key] = value;
    await cctUpdate(NN.block, r.id, { properties: JSON.stringify(props) });
    setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, properties: JSON.stringify(props) } : x));
  };

  // Evaluate a formula expression in a sandbox with numeric props exposed as vars.
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
    try {
      const fn = new Function(...Object.keys(ctx), `"use strict"; try { return (${expr}); } catch(e){ return "#ERR"; }`);
      const out = fn(...Object.values(ctx));
      return out === undefined || out === null ? "" : String(out);
    } catch { return "#ERR"; }
  };

  // Aggregate a numeric prop across every row (rollup shows same total per row).
  const rollupValue = (p: PropDef): string => {
    if (!p.rollup?.source) return "";
    const src = p.rollup.source;
    const nums = rows.map((r) => {
      const v = (() => { try { return JSON.parse(r.properties || "{}")[src]; } catch { return undefined; } })();
      const n = Number(v);
      return isNaN(n) ? null : n;
    }).filter((n): n is number => n !== null);
    if (p.rollup.agg === "count") return String(rows.length);
    if (nums.length === 0) return "";
    switch (p.rollup.agg) {
      case "sum": return String(nums.reduce((a, b) => a + b, 0));
      case "avg": return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
      case "min": return String(Math.min(...nums));
      case "max": return String(Math.max(...nums));
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
    nav(path(`/p/${id}`));
  };
  const archiveRow = async (id: string) => {
    await cctUpdate(NN.block, id, { archived: 1, in_trash: 1 });
    await load();
  };

  const statusProp = useMemo(() => schema.find((p) => p.type === "select") || null, [schema]);
  const dateProp = useMemo(() => schema.find((p) => p.type === "date") || null, [schema]);

  // Apply filters and sorts before rendering (all views use `visibleRows`)
  const visibleRows = useMemo(() => {
    let r = rows;
    if (filterKey) {
      if (filterKey === "__title__") {
        const q = filterVal.toLowerCase();
        r = r.filter((row) => (row.title || "").toLowerCase().includes(q));
      } else if (filterVal) {
        r = r.filter((row) => String(getProp(row, filterKey) ?? "").toLowerCase().includes(filterVal.toLowerCase()));
      }
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
  }, [rows, filterKey, filterVal, sortKey, sortDir]);

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
    if (p.type === "number") return (
      <input type="number" value={v} onChange={(e) => setProp(r, p.key, e.target.value)} style={{ background: "transparent", border: "none", color: "var(--nn-text)", fontSize: 13, width: "100%" }} />
    );
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
    if (p.type === "person") return (
      <input value={v} onChange={(e) => setProp(r, p.key, e.target.value)} placeholder="User ID" style={{ background: "transparent", border: "none", color: "var(--nn-text)", fontSize: 13, width: "100%" }} />
    );
    if (p.type === "formula") return (
      <span style={{ fontSize: 13, color: "var(--nn-text-secondary)", fontFamily: "monospace" }}>{evalFormula(p.formula || "", r)}</span>
    );
    if (p.type === "rollup") return (
      <span style={{ fontSize: 13, color: "var(--nn-text-secondary)" }}>{rollupValue(p)}</span>
    );
    return (
      <input value={v} onChange={(e) => setProp(r, p.key, e.target.value)} placeholder="—" style={{ background: "transparent", border: "none", color: "var(--nn-text)", fontSize: 13, width: "100%" }} />
    );
  };

  if (loading) return <div style={{ opacity: 0.5, padding: 12 }}>Loading…</div>;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--nn-border)", marginBottom: 12 }}>
        {(["table", "board", "calendar", "gallery", "list"] as ViewMode[]).map((v) => {
          const Icon = v === "table" ? Table : v === "board" ? LayoutGrid : v === "calendar" ? CalIcon : v === "gallery" ? ImageIcon : List;
          return (
            <button key={v} onClick={() => setView(v)} className="nn-topbar-btn" style={{ borderBottom: view === v ? "2px solid var(--nn-text)" : "none", borderRadius: 0, textTransform: "capitalize" }}>
              <Icon size={13} style={{ marginRight: 4 }} /> {v}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <select value={filterKey} onChange={(e) => { setFilterKey(e.target.value); if (!e.target.value) setFilterVal(""); }} className="nn-topbar-btn" style={{ padding: "4px 6px", fontSize: 12 }} title="Filter by property">
          <option value="">Filter…</option>
          <option value="__title__">Name</option>
          {schema.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
        </select>
        {filterKey && (
          <input value={filterVal} onChange={(e) => setFilterVal(e.target.value)} placeholder="value" className="nn-topbar-btn" style={{ padding: "4px 8px", fontSize: 12, width: 120 }} />
        )}
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} className="nn-topbar-btn" style={{ padding: "4px 6px", fontSize: 12 }} title="Sort by property">
          <option value="">Sort…</option>
          <option value="__title__">Name</option>
          {schema.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
        </select>
        {sortKey && (
          <button onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")} className="nn-topbar-btn" title="Toggle sort direction">{sortDir === "asc" ? "↑" : "↓"}</button>
        )}
        <button onClick={() => setShowSchema(true)} className="nn-topbar-btn"><Settings2 size={13} /> Properties</button>
        <button onClick={() => addRow()} className="nn-topbar-btn"><Plus size={13} /> New</button>
      </div>

      {view === "table" && (
        <div style={{ border: "1px solid var(--nn-border)", borderRadius: 4, overflow: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: `2fr ${schema.map(() => "1fr").join(" ")} 40px`, background: "var(--nn-bg-secondary)", fontSize: 12, color: "var(--nn-text-secondary)", padding: "8px 12px", borderBottom: "1px solid var(--nn-border)", fontWeight: 500 }}>
            <div>Name</div>
            {schema.map((p) => <div key={p.key}>{p.name}</div>)}
            <div />
          </div>
          {visibleRows.map((r) => (
            <div key={r.id} style={{ display: "grid", gridTemplateColumns: `2fr ${schema.map(() => "1fr").join(" ")} 40px`, padding: "8px 12px", borderBottom: "1px solid var(--nn-border)", alignItems: "center", fontSize: 14 }}>
              <div onClick={() => nav(path(`/p/${r.id}`))} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <span>{r.icon || "📄"}</span>
                <span>{r.title || "Untitled"}</span>
              </div>
              {schema.map((p) => <div key={p.key}>{renderCell(r, p)}</div>)}
              <button onClick={() => archiveRow(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-tertiary)" }}><Trash2 size={13} /></button>
            </div>
          ))}
          <div onClick={() => addRow()} style={{ padding: "8px 12px", color: "var(--nn-text-tertiary)", cursor: "pointer", fontSize: 13 }}>+ New page</div>
        </div>
      )}

      {view === "board" && (
        statusProp ? (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${(statusProp.options || []).length}, 1fr)`, gap: 12 }}>
            {(statusProp.options || []).map((s) => {
              const col = visibleRows.filter((r) => (getProp(r, statusProp.key) || (statusProp.options || [])[0]) === s);
              return (
                <div key={s} style={{ background: "var(--nn-bg-secondary)", borderRadius: 4, padding: 8, minHeight: 200 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, padding: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ background: STATUS_COLORS[s] || "rgba(0,0,0,0.06)", padding: "2px 8px", borderRadius: 3 }}>{s}</span>
                    <span style={{ color: "var(--nn-text-tertiary)" }}>{col.length}</span>
                  </div>
                  {col.map((r) => (
                    <div key={r.id} onClick={() => nav(path(`/p/${r.id}`))} style={{ background: "var(--nn-bg)", padding: 10, marginTop: 6, borderRadius: 4, cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", fontSize: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{r.icon || "📄"}</span>
                        <span>{r.title || "Untitled"}</span>
                      </div>
                    </div>
                  ))}
                  <div onClick={() => addRow({ [statusProp.key]: s })} style={{ padding: 6, marginTop: 4, color: "var(--nn-text-tertiary)", cursor: "pointer", fontSize: 12 }}>+ New</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ color: "var(--nn-text-tertiary)", fontSize: 13 }}>Add a select property (e.g. Status) to enable the board view.</div>
        )
      )}

      {view === "calendar" && (
        <CalendarView month={calMonth} onPrev={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))} onNext={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))} rows={rows} dateProp={dateProp} onOpen={(id) => nav(path(`/p/${id}`))} onAddOnDate={(iso) => dateProp && addRow({ [dateProp.key]: iso })} />
      )}

      {view === "gallery" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {visibleRows.map((r) => (
            <div key={r.id} onClick={() => nav(path(`/p/${r.id}`))} style={{ border: "1px solid var(--nn-border)", borderRadius: 6, overflow: "hidden", cursor: "pointer", background: "var(--nn-bg)" }}>
              <div style={{ height: 120, background: r.cover ? `center/cover no-repeat url("${r.cover}")` : "var(--nn-bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: "var(--nn-text-tertiary)" }}>
                {!r.cover && (r.icon || "📄")}
              </div>
              <div style={{ padding: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 500, display: "flex", gap: 6, alignItems: "center" }}>
                  {r.cover && <span>{r.icon || "📄"}</span>}
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title || "Untitled"}</span>
                </div>
              </div>
            </div>
          ))}
          <div onClick={() => addRow()} style={{ border: "1px dashed var(--nn-border-strong)", borderRadius: 6, minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--nn-text-tertiary)", cursor: "pointer" }}>
            <Plus size={16} style={{ marginRight: 4 }} /> New
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

      {showSchema && (
        <SchemaEditor schema={schema} onClose={() => setShowSchema(false)} onSave={(s) => { saveSchema(s); setShowSchema(false); }} />
      )}
    </div>
  );
}

function CalendarView({ month, onPrev, onNext, rows, dateProp, onOpen, onAddOnDate }: {
  month: Date; onPrev: () => void; onNext: () => void; rows: Row[]; dateProp: PropDef | null; onOpen: (id: string) => void; onAddOnDate: (iso: string) => void;
}) {
  if (!dateProp) return <div style={{ color: "var(--nn-text-tertiary)", fontSize: 13 }}>Add a date property to enable the calendar view.</div>;
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: Array<{ date: Date | null; iso: string; items: Row[] }> = [];
  for (let i = 0; i < startDow; i++) cells.push({ date: null, iso: "", items: [] });
  const getD = (r: Row): string | undefined => {
    try { return (r.properties ? JSON.parse(r.properties) : {})[dateProp.key]; } catch { return undefined; }
  };
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(month.getFullYear(), month.getMonth(), d);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ date, iso, items: rows.filter((r) => getD(r) === iso) });
  }
  const label = month.toLocaleString(undefined, { month: "long", year: "numeric" });
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <button onClick={onPrev} className="nn-topbar-btn"><ChevronLeft size={14} /></button>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <button onClick={onNext} className="nn-topbar-btn"><ChevronRight size={14} /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderTop: "1px solid var(--nn-border)", borderLeft: "1px solid var(--nn-border)" }}>
        {dow.map((d) => <div key={d} style={{ padding: 6, fontSize: 12, color: "var(--nn-text-secondary)", background: "var(--nn-bg-secondary)", borderRight: "1px solid var(--nn-border)", borderBottom: "1px solid var(--nn-border)" }}>{d}</div>)}
        {cells.map((c, i) => (
          <div key={i} style={{ minHeight: 90, padding: 4, borderRight: "1px solid var(--nn-border)", borderBottom: "1px solid var(--nn-border)", background: c.date ? "var(--nn-bg)" : "var(--nn-bg-secondary)" }}>
            {c.date && (
              <>
                <div style={{ fontSize: 12, color: "var(--nn-text-secondary)", display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span>{c.date.getDate()}</span>
                  <button onClick={() => onAddOnDate(c.iso)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-tertiary)", padding: 0 }}><Plus size={11} /></button>
                </div>
                {c.items.map((r) => (
                  <div key={r.id} onClick={() => onOpen(r.id)} style={{ background: "var(--nn-blue-bg)", color: "var(--nn-blue)", padding: "2px 6px", borderRadius: 3, fontSize: 12, marginTop: 2, cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.icon || "📄"} {r.title || "Untitled"}
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SchemaEditor({ schema, onClose, onSave }: { schema: PropDef[]; onClose: () => void; onSave: (s: PropDef[]) => void }) {
  const [draft, setDraft] = useState<PropDef[]>(JSON.parse(JSON.stringify(schema)));
  const TYPES: PropType[] = ["text", "number", "select", "multiselect", "date", "checkbox", "url", "email", "phone", "person"];
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
      <div style={{ background: "var(--nn-bg)", borderRadius: 8, width: "100%", maxWidth: 560, padding: 20, maxHeight: "80vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Properties</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-secondary)" }}><X size={16} /></button>
        </div>
        {draft.map((p, i) => (
          <div key={p.key} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8 }}>
            <input value={p.name} onChange={(e) => update(i, { name: e.target.value })} className="nn-auth-input" style={{ marginBottom: 0, flex: 1 }} />
            <select value={p.type} onChange={(e) => update(i, { type: e.target.value as PropType })} className="nn-auth-input" style={{ marginBottom: 0, width: 110 }}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {p.type === "select" && (
              <input value={(p.options || []).join(", ")} onChange={(e) => update(i, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="Option A, Option B" className="nn-auth-input" style={{ marginBottom: 0, width: 180 }} />
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
