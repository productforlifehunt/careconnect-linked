import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Database, FileText, MoreHorizontal, Star, Image as ImageIcon, X, Share2 } from "lucide-react";
import { NotionEditor } from "@/notch/components/NotionEditor";
import { NotchDatabase } from "@/notch/components/NotchDatabase";
import { NotchComments } from "@/notch/components/NotchComments";
import { NotchShareModal } from "@/notch/components/NotchShareModal";
import { useFavorites } from "@/notch/lib/nn-favorites";
import { cctGet, cctList, cctUpdate, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";

interface Block {
  id: string;
  parent_id?: string | null;
  workspace_id?: string | null;
  type?: string;
  title?: string;
  icon?: string;
  cover?: string;
  properties?: string;
  content_order?: string;
}

const EMOJIS = ["📝","📓","📘","📗","📕","📙","📚","🗂","🗓","✅","💡","🎯","🚀","⭐","🔥","🌟","🌸","🍎","🎨","🧠","💼","🏠","🧭","📌"];

export default function NotchPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const nav = useNavigate();
  const { user } = useNotchAuth();
  const { isFav, toggle: toggleFav } = useFavorites();
  const [block, setBlock] = useState<Block | null>(null);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");
  const [cover, setCover] = useState("");
  const [content, setContent] = useState<any>(null);
  const [crumbs, setCrumbs] = useState<Block[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const saveTimer = useRef<any>(null);

  useEffect(() => {
    if (!pageId) return;
    let alive = true;
    (async () => {
      const b = await cctGet<Block>(NN.block, pageId);
      if (!alive || !b) return;
      setBlock(b);
      setTitle(b.title || "");
      setIcon(b.icon || "");
      setCover(b.cover || "");
      try {
        const props = b.properties ? JSON.parse(b.properties) : {};
        setContent(props.editor_content || null);
      } catch { setContent(null); }
      // build breadcrumbs
      const chain: Block[] = [b];
      let cursor = b;
      const seen = new Set([b.id]);
      const all = await cctList<Block>(NN.block, { workspace_id: b.workspace_id || undefined });
      while (cursor.parent_id && !seen.has(String(cursor.parent_id))) {
        const parent = all.find((x) => String(x.id) === String(cursor.parent_id));
        if (!parent || parent.type !== "page" && parent.type !== "database") break;
        chain.unshift(parent);
        seen.add(parent.id);
        cursor = parent;
      }
      setCrumbs(chain);
    })();
    return () => { alive = false; };
  }, [pageId]);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = titleRef.current.scrollHeight + "px";
    }
  }, [title]);

  const scheduleSave = useCallback((patch: Record<string, any>) => {
    if (!pageId) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await cctUpdate(NN.block, pageId, { ...patch, last_edited_by: user?.user_id || 0 });
      } catch (e) { console.error("Save failed", e); }
    }, 400);
  }, [pageId, user]);

  const onTitleChange = (v: string) => { setTitle(v); scheduleSave({ title: v }); };
  const onIconChange = (v: string) => { setIcon(v); setShowEmoji(false); scheduleSave({ icon: v }); };
  const onContentChange = (json: any) => {
    setContent(json);
    scheduleSave({ properties: JSON.stringify({ editor_content: json }) });
  };
  const setCoverImage = () => {
    const url = window.prompt("Cover image URL", cover || "");
    if (url === null) return;
    setCover(url);
    scheduleSave({ cover: url });
  };
  const removeCover = () => { setCover(""); scheduleSave({ cover: "" }); };

  const convertType = async (newType: "page" | "database") => {
    if (!pageId || !block) return;
    await cctUpdate(NN.block, pageId, { type: newType });
    setBlock({ ...block, type: newType });
    setShowMenu(false);
  };

  if (!pageId) return null;
  if (!block) return <div className="nn-page"><div style={{ opacity: 0.5 }}>Loading…</div></div>;

  const isDatabase = block.type === "database";

  return (
    <>
      <div className="nn-topbar">
        <div className="nn-breadcrumb" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {crumbs.map((c, i) => (
            <span key={c.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {i > 0 && <ChevronRight size={12} style={{ opacity: 0.5 }} />}
              <span
                onClick={() => c.id !== pageId && nav(path(`/p/${c.id}`))}
                style={{ cursor: c.id === pageId ? "default" : "pointer", padding: "2px 6px", borderRadius: 3, color: c.id === pageId ? "var(--nn-text)" : "var(--nn-text-secondary)" }}
              >
                {c.icon && <span style={{ marginRight: 4 }}>{c.icon}</span>}
                {c.title || "Untitled"}
              </span>
            </span>
          ))}
        </div>
        <button className="nn-topbar-btn" onClick={() => setShowShare(true)} title="Share">
          <Share2 size={14} style={{ marginRight: 4 }} /> Share
        </button>
        <button
          className="nn-topbar-btn"
          onClick={() => toggleFav(pageId)}
          title={isFav(pageId) ? "Remove from favorites" : "Add to favorites"}
        >
          <Star size={15} fill={isFav(pageId) ? "#f5a623" : "none"} color={isFav(pageId) ? "#f5a623" : "currentColor"} />
        </button>
        <div style={{ position: "relative" }}>
          <button className="nn-topbar-btn" onClick={() => setShowMenu((s) => !s)} title="More"><MoreHorizontal size={16} /></button>
          {showMenu && (
            <div style={{ position: "absolute", right: 0, top: "100%", background: "var(--nn-bg)", border: "1px solid var(--nn-border-strong)", borderRadius: 6, boxShadow: "0 6px 20px rgba(0,0,0,0.12)", zIndex: 50, minWidth: 200, padding: 4 }}>
              <div onClick={() => { setCoverImage(); setShowMenu(false); }} className="nn-sidebar-item">
                <span className="nn-icon"><ImageIcon size={14} /></span>
                <span className="nn-title">{cover ? "Change cover" : "Add cover"}</span>
              </div>
              {cover && (
                <div onClick={() => { removeCover(); setShowMenu(false); }} className="nn-sidebar-item">
                  <span className="nn-icon"><X size={14} /></span>
                  <span className="nn-title">Remove cover</span>
                </div>
              )}
              <div onClick={() => convertType(isDatabase ? "page" : "database")} className="nn-sidebar-item">
                <span className="nn-icon">{isDatabase ? <FileText size={14} /> : <Database size={14} />}</span>
                <span className="nn-title">Turn into {isDatabase ? "page" : "database"}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="nn-page-scroll">
        {cover && (
          <div style={{ height: 220, background: `center/cover no-repeat url("${cover}")`, position: "relative" }}>
            <button onClick={removeCover} className="nn-topbar-btn" style={{ position: "absolute", right: 12, bottom: 12, background: "rgba(255,255,255,0.85)" }}>
              <X size={13} style={{ marginRight: 4 }} /> Remove
            </button>
          </div>
        )}
        <div className="nn-page" style={cover ? { paddingTop: 24 } : undefined}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <div className="nn-page-icon" onClick={() => setShowEmoji((s) => !s)}>
              {icon || <span style={{ fontSize: 24, opacity: 0.3 }}>Add icon</span>}
            </div>
            {showEmoji && (
              <div style={{ position: "absolute", top: "100%", left: 0, background: "var(--nn-bg)", border: "1px solid var(--nn-border-strong)", borderRadius: 6, padding: 8, display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4, zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
                {EMOJIS.map((e) => (
                  <button key={e} onClick={() => onIconChange(e)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: 4, borderRadius: 4 }}>{e}</button>
                ))}
                <button onClick={() => onIconChange("")} style={{ gridColumn: "span 8", background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-secondary)", fontSize: 12, padding: 4 }}>Remove</button>
              </div>
            )}
          </div>
          <textarea
            ref={titleRef}
            className="nn-page-title"
            placeholder={isDatabase ? "Untitled database" : "Untitled"}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            rows={1}
          />
          {isDatabase ? (
            <NotchDatabase databaseId={pageId} workspaceId={String(block.workspace_id || "")} />
          ) : (
            <NotionEditor content={content} onChange={onContentChange} />
          )}
          <NotchComments blockId={pageId} />
        </div>
      </div>
      {showShare && <NotchShareModal blockId={pageId} onClose={() => setShowShare(false)} />}
    </>
  );
}
