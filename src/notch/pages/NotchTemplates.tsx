import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import { Plus, FileText, Trash2, Copy, Sparkles, Globe, Lock, Download, Search, X } from "lucide-react";
import { cctList, cctCreate, cctUpdate, cctDelete, cctGet, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";
import { STARTER_TEMPLATES, StarterTemplate } from "@/notch/lib/nn-starter-templates";
import { nnPrompt, nnConfirm, nnAlert } from "@/notch/lib/nn-dialog";

interface Template { id: string; name?: string; icon?: string; source_block_id?: string; workspace_id?: string; author_id?: string; is_published?: boolean; description?: string; cover?: string; category?: string; }

export default function NotchTemplates() {
  const { user } = useNotchAuth();
  const nav = useNavigate();
  const path = useNotchPath();
  const [items, setItems] = useState<Template[]>([]);
  const [wsId, setWsId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [preview, setPreview] = useState<{ kind: "starter"; t: StarterTemplate } | { kind: "template"; t: Template } | null>(null);

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
    nav(path(`/p/${blockId}`));
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
    setPreview(null);
    nav(path(`/p/${id}`));
  };

  const useStarter = async (s: StarterTemplate) => {
    if (!wsId || busyKey) return;
    setBusyKey(s.key);
    try {
      const { id } = await s.build({ workspaceId: wsId, userId: user?.user_id || 0 });
      setPreview(null);
      nav(path(`/p/${id}`));
    } catch (e) {
      console.error("Starter template failed", e);
      nnAlert("Could not create template. Check console for details.");
    } finally {
      setBusyKey(null);
    }
  };

  const remove = async (t: Template) => {
    if (!(await nnConfirm("This template will be removed permanently.", "Delete template?"))) return;
    await cctDelete(NN.template, t.id);
    await load();
  };

  const rename = async (t: Template) => {
    const name = await nnPrompt("", { title: "Rename template", defaultValue: t.name || "", placeholder: "Template name" });
    if (name === null) return;
    await cctUpdate(NN.template, t.id, { name, source_block_id: t.source_block_id, is_published: !!t.is_published });
    await load();
  };

  const togglePublish = async (t: Template) => {
    await cctUpdate(NN.template, t.id, {
      name: t.name || "Untitled",
      source_block_id: t.source_block_id,
      is_published: !t.is_published,
    });
    await load();
  };

  const isMine = (t: Template) => !user || String(t.author_id) === String(user.user_id);
  const mine = items.filter(isMine);
  const community = items.filter((t) => !isMine(t) && t.is_published);

  // ─── Filtering ───
  const starterCats = useMemo(() => Array.from(new Set(STARTER_TEMPLATES.map((s) => s.category || "Other"))), []);
  const allCats = ["All", ...starterCats];
  const ql = q.trim().toLowerCase();
  const matches = (name: string, desc?: string) => !ql || name.toLowerCase().includes(ql) || (desc || "").toLowerCase().includes(ql);
  const filteredStarters = STARTER_TEMPLATES.filter((s) => (cat === "All" || (s.category || "Other") === cat) && matches(s.name, s.description));
  const filteredCommunity = community.filter((t) => (cat === "All") && matches(t.name || "", t.description));
  const filteredMine = mine.filter((t) => (cat === "All") && matches(t.name || "", t.description));

  return (
    <div className="nn-page-scroll">
      <div className="nn-page">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>Templates</div>
          <button onClick={createFromScratch} className="nn-btn-primary"><Plus size={13} style={{ marginRight: 4 }} /> New template</button>
        </div>
        <div style={{ color: "var(--nn-text-secondary)", marginBottom: 20 }}>
          Save reusable page layouts. Instantiate them anywhere. Publish yours to the community marketplace.
        </div>

        {/* ─── Search + categories ─── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 260px", maxWidth: 360 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--nn-text-tertiary)" }} />
            <input
              placeholder="Search templates…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{ width: "100%", padding: "8px 10px 8px 32px", background: "var(--nn-bg-secondary)", border: "1px solid var(--nn-border)", borderRadius: 6, fontSize: 13, color: "var(--nn-text)" }}
            />
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {allCats.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className="nn-topbar-btn"
                style={{
                  fontSize: 12,
                  background: cat === c ? "var(--nn-bg-tertiary)" : "transparent",
                  border: cat === c ? "1px solid var(--nn-border-strong)" : "1px solid transparent",
                  fontWeight: cat === c ? 600 : 400,
                }}
              >{c}</button>
            ))}
          </div>
        </div>

        {/* ─── Starter gallery ─── */}
        {filteredStarters.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 13, fontWeight: 600, color: "var(--nn-text-secondary)", textTransform: "uppercase", letterSpacing: 0.4 }}>
              <Sparkles size={14} /> Starter templates
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 32 }}>
              {filteredStarters.map((s) => (
                <div
                  key={s.key}
                  onClick={() => setPreview({ kind: "starter", t: s })}
                  style={{ border: "1px solid var(--nn-border)", borderRadius: 8, background: "var(--nn-bg)", cursor: "pointer", overflow: "hidden", transition: "transform 120ms, box-shadow 120ms", display: "flex", flexDirection: "column" }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--nn-shadow-md)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}
                >
                  <div style={{ height: 110, background: s.cover ? `center/cover no-repeat url("${s.cover}")` : "linear-gradient(135deg, var(--nn-bg-secondary), var(--nn-bg-tertiary))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
                    {!s.cover && s.icon}
                  </div>
                  <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {s.cover && <span style={{ fontSize: 20 }}>{s.icon}</span>}
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{s.name}</div>
                    </div>
                    {s.category && <div style={{ fontSize: 11, color: "var(--nn-text-tertiary)", textTransform: "uppercase", letterSpacing: 0.4 }}>{s.category}</div>}
                    <div style={{ fontSize: 12.5, color: "var(--nn-text-secondary)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ─── Community marketplace ─── */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, fontSize: 13, fontWeight: 600, color: "var(--nn-text-secondary)", textTransform: "uppercase", letterSpacing: 0.4 }}>
          <Globe size={14} /> Community marketplace ({filteredCommunity.length})
        </div>
        {loading ? <div style={{ opacity: 0.5, marginBottom: 32 }}>Loading…</div> : filteredCommunity.length === 0 ? (
          <div style={{ color: "var(--nn-text-tertiary)", marginBottom: 32, fontSize: 13 }}>No community templates{ql ? " match your search" : " yet. Publish one of yours to share"}.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginBottom: 32 }}>
            {filteredCommunity.map((t) => (
              <div key={t.id} onClick={() => setPreview({ kind: "template", t })} style={{ border: "1px solid var(--nn-border)", borderRadius: 6, padding: 14, background: "var(--nn-bg)", cursor: "pointer" }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{t.icon || <FileText size={20} />}</div>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>{t.name || "Untitled"}</div>
                <div style={{ fontSize: 11, color: "var(--nn-text-tertiary)", marginBottom: 8 }}>by user {t.author_id || "?"}</div>
              </div>
            ))}
          </div>
        )}

        {/* ─── User templates ─── */}
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--nn-text-secondary)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 12 }}>
          Your templates
        </div>
        {loading ? <div style={{ opacity: 0.5 }}>Loading…</div> : !filteredMine.length ? (
          <div style={{ color: "var(--nn-text-tertiary)" }}>{ql ? "No matches." : "No saved templates yet."}</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {filteredMine.map((t) => (
              <div key={t.id} style={{ border: "1px solid var(--nn-border)", borderRadius: 6, padding: 14, background: "var(--nn-bg)" }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{t.icon || <FileText size={20} />}</div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{t.name || "Untitled"}</div>
                <div style={{ fontSize: 11, color: t.is_published ? "var(--nn-blue)" : "var(--nn-text-tertiary)", marginBottom: 8, display: "flex", alignItems: "center", gap: 3 }}>
                  {t.is_published ? <><Globe size={11} /> Published</> : <><Lock size={11} /> Private</>}
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <button className="nn-topbar-btn" onClick={() => useTemplate(t)}><Copy size={12} style={{ marginRight: 4 }} />Use</button>
                  <button className="nn-topbar-btn" onClick={() => togglePublish(t)} title={t.is_published ? "Unpublish" : "Publish to marketplace"}>
                    {t.is_published ? <Lock size={12} /> : <Globe size={12} />}
                  </button>
                  <button className="nn-topbar-btn" onClick={() => rename(t)}>Rename</button>
                  <button className="nn-topbar-btn" onClick={() => remove(t)} style={{ color: "var(--nn-danger)" }}><Trash2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Preview modal ─── */}
      {preview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setPreview(null)}>
          <div style={{ background: "var(--nn-bg)", borderRadius: 10, width: "100%", maxWidth: 720, maxHeight: "88vh", overflow: "hidden", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
            {preview.kind === "starter" && preview.t.cover && (
              <div style={{ height: 220, background: `center/cover no-repeat url("${preview.t.cover}")` }} />
            )}
            <div style={{ padding: 24, overflow: "auto" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 48, lineHeight: 1 }}>{preview.kind === "starter" ? preview.t.icon : (preview.t.icon || "🧩")}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{preview.kind === "starter" ? preview.t.name : (preview.t.name || "Untitled")}</div>
                  {preview.kind === "starter" && preview.t.category && (
                    <div style={{ fontSize: 11, color: "var(--nn-text-tertiary)", textTransform: "uppercase", letterSpacing: 0.4, marginTop: 2 }}>{preview.t.category}</div>
                  )}
                </div>
                <button onClick={() => setPreview(null)} className="nn-topbar-btn"><X size={16} /></button>
              </div>
              <div style={{ fontSize: 14, color: "var(--nn-text-secondary)", lineHeight: 1.6, marginBottom: 24 }}>
                {preview.kind === "starter" ? preview.t.description : (preview.t.description || "No description.")}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => setPreview(null)} className="nn-topbar-btn">Cancel</button>
                {preview.kind === "starter" ? (
                  <button
                    className="nn-btn-primary"
                    disabled={busyKey === preview.t.key || !wsId}
                    onClick={() => useStarter(preview.t)}
                    data-starter-key={preview.t.key}
                  >
                    {busyKey === preview.t.key ? "Creating…" : (<><Download size={13} style={{ marginRight: 4 }} /> Use this template</>)}
                  </button>
                ) : (
                  <button className="nn-btn-primary" onClick={() => useTemplate(preview.t)}>
                    <Download size={13} style={{ marginRight: 4 }} /> Install
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
