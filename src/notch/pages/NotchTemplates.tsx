import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Trash2, Copy } from "lucide-react";
import { cctList, cctCreate, cctUpdate, cctDelete, cctGet, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";

interface Template { id: string; name?: string; icon?: string; source_block_id?: string; workspace_id?: string; }

export default function NotchTemplates() {
  const { user } = useNotchAuth();
  const nav = useNavigate();
  const [items, setItems] = useState<Template[]>([]);
  const [wsId, setWsId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const ws = await cctList<any>(NN.workspace);
    const w = ws[0]?.id;
    setWsId(w || null);
    const all = await cctList<any>(NN.template);
    setItems(all);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const createFromScratch = async () => {
    if (!wsId) return;
    const { id: blockId } = await cctCreate(NN.block, {
      workspace_id: wsId, parent_id: wsId, type: "page",
      title: "Template page", icon: "🧩",
      properties: JSON.stringify({}), content_order: JSON.stringify([]),
      archived: 1, in_trash: 0,
      created_by: user?.user_id || 0, last_edited_by: user?.user_id || 0,
    });
    await cctCreate(NN.template, {
      name: "Untitled template", icon: "🧩",
      source_block_id: String(blockId), workspace_id: String(wsId),
    });
    nav(`/notch/p/${blockId}`);
  };

  const useTemplate = async (t: Template) => {
    if (!wsId || !t.source_block_id) return;
    const src = await cctGet<any>(NN.block, t.source_block_id);
    if (!src) return;
    const { id } = await cctCreate(NN.block, {
      workspace_id: wsId, parent_id: wsId, type: src.type || "page",
      title: t.name || "Untitled", icon: t.icon || src.icon || "",
      properties: src.properties || JSON.stringify({}),
      content_order: JSON.stringify([]),
      archived: 0, in_trash: 0,
      created_by: user?.user_id || 0, last_edited_by: user?.user_id || 0,
    });
    nav(`/notch/p/${id}`);
  };

  const remove = async (t: Template) => {
    if (!confirm("Delete this template?")) return;
    await cctDelete(NN.template, t.id);
    await load();
  };

  const rename = async (t: Template) => {
    const name = window.prompt("Template name", t.name || "");
    if (name === null) return;
    await cctUpdate(NN.template, t.id, { name });
    await load();
  };

  return (
    <div className="nn-page-scroll">
      <div className="nn-page">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>Templates</div>
          <button onClick={createFromScratch} className="nn-btn-primary"><Plus size={13} style={{ marginRight: 4 }} /> New template</button>
        </div>
        <div style={{ color: "var(--nn-text-secondary)", marginBottom: 24 }}>
          Save reusable page layouts. Instantiate them anywhere.
        </div>
        {loading ? <div style={{ opacity: 0.5 }}>Loading…</div> : !items.length ? (
          <div style={{ color: "var(--nn-text-tertiary)" }}>No templates yet.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {items.map((t) => (
              <div key={t.id} style={{ border: "1px solid var(--nn-border)", borderRadius: 6, padding: 14, background: "var(--nn-bg)" }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{t.icon || <FileText size={20} />}</div>
                <div style={{ fontWeight: 500, marginBottom: 8 }}>{t.name || "Untitled"}</div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="nn-topbar-btn" onClick={() => useTemplate(t)}><Copy size={12} style={{ marginRight: 4 }} />Use</button>
                  <button className="nn-topbar-btn" onClick={() => rename(t)}>Rename</button>
                  <button className="nn-topbar-btn" onClick={() => remove(t)} style={{ color: "#eb5757" }}><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
