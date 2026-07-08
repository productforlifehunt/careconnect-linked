import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import { cctList, cctUpdate, cctDelete, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";
import { RotateCcw, Trash2, Search, X } from "lucide-react";
import { nnConfirm } from "@/notch/lib/nn-dialog";

export default function NotchTrash() {
  const nav = useNavigate();
  const path = useNotchPath();
  const { user } = useNotchAuth();
  const [items, setItems] = useState<any[]>([]);
  const [allBlocks, setAllBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const collectDescendants = (rootId: string): string[] => {
    const out = new Set<string>();
    const walk = (id: string) => {
      for (const b of allBlocks) {
        if (String(b.parent_id) === String(id) && !out.has(String(b.id))) {
          out.add(String(b.id));
          walk(String(b.id));
        }
      }
    };
    walk(rootId);
    return Array.from(out);
  };

  const load = async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const all = await cctList<any>(NN.block);
      setAllBlocks(all);
      setItems(
        all
          .filter((b: any) => Number(b.in_trash) === 1 || Number(b.archived) === 1)
          .filter((b: any) => !user || String(b.author_id) === String(user.user_id) || String(b.created_by) === String(user.user_id))
      );
      setSelected(new Set());
    } catch (e: any) {
      const raw = String(e?.message || "");
      setLoadErr(/fetch|network/i.test(raw) ? "Can't reach the server." : "Couldn't load trash.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [user]);

  const restore = async (id: string) => {
    const ids = [id, ...collectDescendants(id)];
    for (const x of ids) await cctUpdate(NN.block, x, { archived: 0, in_trash: 0 });
    await load();
  };
  const purge = async (id: string) => {
    const ids = [id, ...collectDescendants(id)];
    if (!(await nnConfirm(`This will permanently delete ${ids.length} block${ids.length === 1 ? "" : "s"}. Cannot be undone.`, "Delete forever?"))) return;
    for (const x of ids) await cctDelete(NN.block, x);
    await load();
  };

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((p) => (p.title || "").toLowerCase().includes(t));
  }, [items, q]);

  const allSelected = filtered.length > 0 && filtered.every((p) => selected.has(String(p.id)));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allSelected) filtered.forEach((p) => next.delete(String(p.id)));
    else filtered.forEach((p) => next.add(String(p.id)));
    setSelected(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const bulkRestore = async () => {
    const ids = new Set<string>();
    for (const id of Array.from(selected)) { ids.add(id); collectDescendants(id).forEach((d) => ids.add(d)); }
    for (const id of Array.from(ids)) await cctUpdate(NN.block, id, { archived: 0, in_trash: 0 });
    await load();
  };
  const bulkPurge = async () => {
    const ids = new Set<string>();
    for (const id of Array.from(selected)) { ids.add(id); collectDescendants(id).forEach((d) => ids.add(d)); }
    if (!(await nnConfirm(`Delete ${ids.size} block${ids.size === 1 ? "" : "s"} forever (including nested pages)? This cannot be undone.`, "Delete forever"))) return;
    for (const id of Array.from(ids)) await cctDelete(NN.block, id);
    await load();
  };

  return (
    <div className="nn-page-scroll">
      <div className="nn-page">
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Trash</div>
        <div style={{ color: "var(--nn-text-secondary)", marginBottom: 24 }}>
          Pages in trash can be restored or permanently deleted.
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--nn-text-tertiary)" }} />
            <input
              className="nn-auth-input"
              placeholder="Search trash…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ marginBottom: 0, paddingLeft: 30, width: "100%" }}
            />
            {q && (
              <button onClick={() => setQ("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-tertiary)" }}><X size={13} /></button>
            )}
          </div>
          {selected.size > 0 && (
            <>
              <span style={{ fontSize: 12, color: "var(--nn-text-secondary)" }}>{selected.size} selected</span>
              <button onClick={bulkRestore} className="nn-topbar-btn" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <RotateCcw size={13} /> Restore all
              </button>
              <button onClick={bulkPurge} className="nn-topbar-btn" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--nn-danger)" }}>
                <Trash2 size={13} /> Delete all
              </button>
            </>
          )}
        </div>
        {loading ? (
          <div style={{ opacity: 0.5 }}>Loading…</div>
        ) : !filtered.length ? (
          <div style={{ color: "var(--nn-text-tertiary)" }}>{q ? "No matches." : "Trash is empty."}</div>
        ) : (
          <div style={{ border: "1px solid var(--nn-border)", borderRadius: 6 }}>
            <div style={{ display: "flex", alignItems: "center", padding: "8px 14px", borderBottom: "1px solid var(--nn-border)", background: "var(--nn-bg-secondary)", gap: 10, fontSize: 12, color: "var(--nn-text-secondary)" }}>
              <input type="checkbox" checked={allSelected} onChange={toggleAll} title="Select all shown" />
              <span>{filtered.length} item{filtered.length === 1 ? "" : "s"}</span>
            </div>
            {filtered.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid var(--nn-border)", gap: 10, background: selected.has(String(p.id)) ? "var(--nn-bg-secondary)" : "transparent" }}>
                <input type="checkbox" checked={selected.has(String(p.id))} onChange={() => toggleOne(String(p.id))} onClick={(e) => e.stopPropagation()} />
                <span style={{ fontSize: 18 }}>{p.icon || "📄"}</span>
                <div style={{ flex: 1, cursor: "pointer", minWidth: 0 }} onClick={() => nav(path(`/p/${p.id}`))}>
                  <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title || "Untitled"}</div>
                  <div style={{ fontSize: 12, color: "var(--nn-text-tertiary)" }}>
                    Deleted {p.updated_at ? new Date(p.updated_at).toLocaleString() : ""}
                  </div>
                </div>
                <button onClick={() => restore(p.id)} title="Restore" style={{ background: "none", border: "1px solid var(--nn-border-strong)", padding: "4px 8px", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "var(--nn-text)" }}>
                  <RotateCcw size={13} /> Restore
                </button>
                <button onClick={() => purge(p.id)} title="Delete forever" style={{ background: "none", border: "1px solid var(--nn-border-strong)", padding: "4px 8px", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "var(--nn-danger)" }}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
