import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import { cctList, cctUpdate, cctDelete, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";
import { RotateCcw, Trash2 } from "lucide-react";
import { nnConfirm } from "@/notch/lib/nn-dialog";

export default function NotchTrash() {
  const nav = useNavigate();
  const path = useNotchPath();
  const { user } = useNotchAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    // Scope to current user's own blocks so trash never leaks across users.
    const all = await cctList<any>(NN.block);
    setItems(
      all
        .filter((b: any) => Number(b.in_trash) === 1 || Number(b.archived) === 1)
        .filter((b: any) => !user || String(b.author_id) === String(user.user_id) || String(b.created_by) === String(user.user_id))
    );
    setLoading(false);
  };
  useEffect(() => { load(); }, [user]);

  const restore = async (id: string) => {
    await cctUpdate(NN.block, id, { archived: 0, in_trash: 0 });
    await load();
  };
  const purge = async (id: string) => {
    if (!(await nnConfirm("This cannot be undone.", "Delete forever?"))) return;
    await cctDelete(NN.block, id);
    await load();
  };

  return (
    <div className="nn-page-scroll">
      <div className="nn-page">
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Trash</div>
        <div style={{ color: "var(--nn-text-secondary)", marginBottom: 24 }}>
          Pages in trash can be restored or permanently deleted.
        </div>
        {loading ? (
          <div style={{ opacity: 0.5 }}>Loading…</div>
        ) : !items.length ? (
          <div style={{ color: "var(--nn-text-tertiary)" }}>Trash is empty.</div>
        ) : (
          <div style={{ border: "1px solid var(--nn-border)", borderRadius: 6 }}>
            {items.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid var(--nn-border)", gap: 10 }}>
                <span style={{ fontSize: 18 }}>{p.icon || "📄"}</span>
                <div style={{ flex: 1, cursor: "pointer" }} onClick={() => nav(path(`/p/${p.id}`))}>
                  <div style={{ fontWeight: 500 }}>{p.title || "Untitled"}</div>
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
