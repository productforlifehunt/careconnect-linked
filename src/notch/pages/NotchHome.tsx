import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import { cctList, cctCreate, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";
import { FileText, Plus, Sparkles } from "lucide-react";

export default function NotchHome() {
  const { user } = useNotchAuth();
  const nav = useNavigate();
  const path = useNotchPath();
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const blocks = await cctList<any>(NN.block);
      const mine = blocks
        .filter((b: any) => (b.type === "page" || b.type === "database") && Number(b.archived) !== 1)
        .sort((a: any, b: any) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())
        .slice(0, 12);
      setRecent(mine);
    } catch (e: any) {
      const raw = String(e?.message || "");
      setLoadErr(/fetch|network/i.test(raw) ? "Can't reach the server." : "Couldn't load your pages.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const createNewPage = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const wsList = await cctList<any>(NN.workspace);
      const wsId = wsList[0]?.id;
      if (!wsId) throw new Error("No workspace");
      const { id } = await cctCreate(NN.block, {
        workspace_id: wsId, parent_id: wsId, type: "page",
        title: "", icon: "", properties: JSON.stringify({}),
        content_order: JSON.stringify([]),
        archived: 0, in_trash: 0,
        created_by: user?.user_id || 0, last_edited_by: user?.user_id || 0,
      });
      nav(path(`/p/${id}`));
    } catch (e) {
      console.error("Create page failed", e);
    } finally {
      setCreating(false);
    }
  };

  const greeting = (() => {
    const h = new Date().getHours();
    const g = h < 5 ? "Good night" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    return `${g}, ${user?.user_display_name?.split(" ")[0] || "there"}`;
  })();

  return (
    <div className="nn-page-scroll">
      <div className="nn-page">
        <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>{greeting}</div>
        <div style={{ color: "var(--nn-text-secondary)", marginBottom: 24 }}>
          Pick up where you left off, or start something new.
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          <button
            className="nn-topbar-btn"
            onClick={createNewPage}
            disabled={creating}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", fontWeight: 500 }}
          >
            <Plus size={14} /> New page
          </button>
          <button
            className="nn-topbar-btn"
            onClick={() => nav(path("/templates"))}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px" }}
          >
            <Sparkles size={14} /> Templates
          </button>
        </div>

        <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "var(--nn-text-tertiary)", marginBottom: 12 }}>
          Recently visited
        </div>

        {loading ? (
          <div style={{ color: "var(--nn-text-tertiary)" }}>Loading…</div>
        ) : loadErr ? (
          <div style={{ padding: 16, border: "1px solid var(--nn-border)", borderRadius: 6, color: "var(--nn-text-secondary)" }}>
            <div style={{ marginBottom: 8 }}>{loadErr}</div>
            <button className="nn-topbar-btn" onClick={load}>Retry</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {recent.map((p) => (
              <div
                key={p.id}
                onClick={() => nav(path(`/p/${p.id}`))}
                style={{ border: "1px solid var(--nn-border)", borderRadius: 6, padding: 16, cursor: "pointer", background: "var(--nn-bg)", minHeight: 100 }}
              >
                <div style={{ fontSize: 22, marginBottom: 6 }}>{p.icon || <FileText size={20} />}</div>
                <div style={{ fontWeight: 500, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.title || "Untitled"}
                </div>
                <div style={{ fontSize: 12, color: "var(--nn-text-tertiary)" }}>
                  {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : ""}
                </div>
              </div>
            ))}
            {!recent.length && (
              <div style={{ color: "var(--nn-text-tertiary)", gridColumn: "1 / -1", padding: 32, textAlign: "center", border: "1px dashed var(--nn-border)", borderRadius: 6 }}>
                <FileText size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                <div style={{ marginBottom: 12 }}>No pages yet.</div>
                <button className="nn-btn-primary" onClick={createNewPage} disabled={creating}>
                  <Plus size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Create your first page
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

