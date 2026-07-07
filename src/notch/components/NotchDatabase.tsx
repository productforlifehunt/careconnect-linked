import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Table, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cctList, cctCreate, cctUpdate, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";

interface Props { databaseId: string; workspaceId: string; }
type ViewMode = "table" | "board";

interface Row { id: string; title?: string; icon?: string; properties?: string; }

/** Minimal Notion-style database: table + board views over child pages, with a Status property. */
export function NotchDatabase({ databaseId, workspaceId }: Props) {
  const { user } = useNotchAuth();
  const nav = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [view, setView] = useState<ViewMode>("table");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const all = await cctList<any>(NN.block, { workspace_id: workspaceId });
    setRows(all.filter((b: any) => String(b.parent_id) === String(databaseId) && Number(b.archived) !== 1));
    setLoading(false);
  }, [databaseId, workspaceId]);
  useEffect(() => { load(); }, [load]);

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

  const addRow = async (status = "To do") => {
    const props = { status };
    const { id } = await cctCreate(NN.block, {
      workspace_id: workspaceId,
      parent_id: databaseId,
      type: "page",
      title: "",
      icon: "",
      properties: JSON.stringify(props),
      content_order: JSON.stringify([]),
      archived: 0, in_trash: 0,
      created_by: user?.user_id || 0,
      last_edited_by: user?.user_id || 0,
    });
    await load();
    nav(`/notch/p/${id}`);
  };

  const archiveRow = async (id: string) => {
    await cctUpdate(NN.block, id, { archived: 1, in_trash: 1 });
    await load();
  };

  const STATUS = ["To do", "In progress", "Done"];
  const STATUS_COLORS: Record<string, string> = {
    "To do": "rgba(120,119,116,0.16)",
    "In progress": "rgba(245,159,0,0.2)",
    "Done": "rgba(68,131,97,0.25)",
  };

  if (loading) return <div style={{ opacity: 0.5, padding: 12 }}>Loading…</div>;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--nn-border)", marginBottom: 12 }}>
        <button onClick={() => setView("table")} className="nn-topbar-btn" style={{ borderBottom: view === "table" ? "2px solid var(--nn-text)" : "none", borderRadius: 0 }}>
          <Table size={13} style={{ marginRight: 4 }} /> Table
        </button>
        <button onClick={() => setView("board")} className="nn-topbar-btn" style={{ borderBottom: view === "board" ? "2px solid var(--nn-text)" : "none", borderRadius: 0 }}>
          <LayoutGrid size={13} style={{ marginRight: 4 }} /> Board
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={() => addRow()} className="nn-topbar-btn"><Plus size={13} /> New</button>
      </div>

      {view === "table" ? (
        <div style={{ border: "1px solid var(--nn-border)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 40px", background: "var(--nn-bg-secondary)", fontSize: 12, color: "var(--nn-text-secondary)", padding: "8px 12px", borderBottom: "1px solid var(--nn-border)", fontWeight: 500 }}>
            <div>Name</div><div>Status</div><div />
          </div>
          {rows.map((r) => (
            <div key={r.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 40px", padding: "8px 12px", borderBottom: "1px solid var(--nn-border)", alignItems: "center", fontSize: 14 }}>
              <div onClick={() => nav(`/notch/p/${r.id}`)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <span>{r.icon || "📄"}</span>
                <span>{r.title || "Untitled"}</span>
              </div>
              <div>
                <select value={getProp(r, "status") || ""} onChange={(e) => setProp(r, "status", e.target.value)} style={{ background: STATUS_COLORS[getProp(r, "status")] || "transparent", border: "none", borderRadius: 3, padding: "2px 8px", fontSize: 12, cursor: "pointer", color: "var(--nn-text)" }}>
                  <option value="">—</option>
                  {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={() => archiveRow(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-tertiary)" }}><Trash2 size={13} /></button>
            </div>
          ))}
          <div onClick={() => addRow()} style={{ padding: "8px 12px", color: "var(--nn-text-tertiary)", cursor: "pointer", fontSize: 13 }}>+ New page</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${STATUS.length}, 1fr)`, gap: 12 }}>
          {STATUS.map((s) => {
            const col = rows.filter((r) => (getProp(r, "status") || "To do") === s);
            return (
              <div key={s} style={{ background: "var(--nn-bg-secondary)", borderRadius: 4, padding: 8, minHeight: 200 }}>
                <div style={{ fontSize: 12, fontWeight: 500, padding: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ background: STATUS_COLORS[s], padding: "2px 8px", borderRadius: 3 }}>{s}</span>
                  <span style={{ color: "var(--nn-text-tertiary)" }}>{col.length}</span>
                </div>
                {col.map((r) => (
                  <div key={r.id} onClick={() => nav(`/notch/p/${r.id}`)} style={{ background: "var(--nn-bg)", padding: 10, marginTop: 6, borderRadius: 4, cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", fontSize: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span>{r.icon || "📄"}</span>
                      <span>{r.title || "Untitled"}</span>
                    </div>
                  </div>
                ))}
                <div onClick={() => addRow(s)} style={{ padding: 6, marginTop: 4, color: "var(--nn-text-tertiary)", cursor: "pointer", fontSize: 12 }}>+ New</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
