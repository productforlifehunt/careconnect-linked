import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import { ChevronRight, Database, FileText, MoreHorizontal, Star, Image as ImageIcon, X, Share2, Copy, Link as LinkIcon, Trash2, Bell, UserPlus, Lock, Unlock, Maximize2, Minimize2, History } from "lucide-react";
import { createReminder, createNotification } from "@/notch/lib/nn-notifications";
import { nnPrompt, nnConfirm, nnAlert } from "@/notch/lib/nn-dialog";

import { NotionEditor } from "@/notch/components/NotionEditor";
import { NotchDatabase } from "@/notch/components/NotchDatabase";
import { NotchComments } from "@/notch/components/NotchComments";
import { NotchShareModal } from "@/notch/components/NotchShareModal";
import { EmojiPicker } from "@/notch/components/NotchEmojiPicker";
import { useFavorites } from "@/notch/lib/nn-favorites";
import { cctGet, cctList, cctUpdate, cctCreate, NN } from "@/notch/lib/nn-client";
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

// (emoji picker moved to NotchEmojiPicker component with search + categories)

export default function NotchPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const nav = useNavigate();
  const path = useNotchPath();
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
  const [locked, setLocked] = useState(false);
  const [fullWidth, setFullWidth] = useState(false);
  const [snapshots, setSnapshots] = useState<Array<{ ts: number; content: any; title: string }>>([]);
  const [showHistory, setShowHistory] = useState(false);
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
        setLocked(!!props.locked);
        setFullWidth(!!props.full_width);
        setSnapshots(Array.isArray(props.history) ? props.history : []);
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
      // Expose trail (excluding current page) for the <Breadcrumb> editor node.
      (window as any).__NN_BREADCRUMB__ = chain.slice(0, -1).map((p) => ({ id: p.id, title: p.title || "Untitled" }));
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

  const saveProps = useCallback((extra: Record<string, any>) => {
    scheduleSave({
      properties: JSON.stringify({
        editor_content: content,
        locked: extra.locked ?? locked,
        full_width: extra.full_width ?? fullWidth,
        history: extra.history ?? snapshots,
      }),
    });
  }, [content, locked, fullWidth, snapshots, scheduleSave]);

  const onTitleChange = (v: string) => { if (locked) return; setTitle(v); scheduleSave({ title: v }); };
  const onIconChange = (v: string) => { setIcon(v); setShowEmoji(false); scheduleSave({ icon: v }); };
  const onContentChange = (json: any) => {
    if (locked) return;
    setContent(json);
    scheduleSave({ properties: JSON.stringify({ editor_content: json, locked, full_width: fullWidth, history: snapshots }) });
  };
  const toggleLock = () => {
    const nv = !locked;
    setLocked(nv);
    setShowMenu(false);
    saveProps({ locked: nv });
  };
  const toggleFullWidth = () => {
    const nv = !fullWidth;
    setFullWidth(nv);
    setShowMenu(false);
    saveProps({ full_width: nv });
  };
  const takeSnapshot = () => {
    const snap = { ts: Date.now(), content, title };
    const next = [snap, ...snapshots].slice(0, 30);
    setSnapshots(next);
    setShowMenu(false);
    saveProps({ history: next });
    nnAlert("Version snapshot saved.", "History");
  };
  const restoreSnapshot = (idx: number) => {
    const s = snapshots[idx];
    if (!s) return;
    setContent(s.content);
    setTitle(s.title);
    setShowHistory(false);
    scheduleSave({ title: s.title, properties: JSON.stringify({ editor_content: s.content, locked, full_width: fullWidth, history: snapshots }) });
  };
  const [showCoverGallery, setShowCoverGallery] = useState(false);
  const setCoverImage = () => { setShowCoverGallery(true); setShowMenu(false); };
  const applyCover = (url: string) => { setCover(url); scheduleSave({ cover: url }); setShowCoverGallery(false); };
  const removeCover = () => { setCover(""); scheduleSave({ cover: "" }); };

  const convertType = async (newType: "page" | "database") => {
    if (!pageId || !block) return;
    await cctUpdate(NN.block, pageId, { type: newType });
    setBlock({ ...block, type: newType });
    setShowMenu(false);
  };

  const duplicatePage = async () => {
    if (!block) return;
    setShowMenu(false);
    const { id } = await cctCreate(NN.block, {
      workspace_id: block.workspace_id || "",
      parent_id: block.parent_id || block.workspace_id || "",
      type: block.type || "page",
      title: (block.title || "Untitled") + " (copy)",
      icon: block.icon || "",
      cover: block.cover || "",
      properties: block.properties || JSON.stringify({}),
      content_order: JSON.stringify([]),
      archived: 0,
      in_trash: 0,
      created_by: user?.user_id || 0,
      last_edited_by: user?.user_id || 0,
    });
    nav(path(`/p/${id}`));
  };

  const copyLink = async () => {
    setShowMenu(false);
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch { /* ignore */ }
  };

  const trashPage = async () => {
    if (!pageId) return;
    if (!(await nnConfirm("You can restore it from Trash later.", "Move to trash?"))) return;
    await cctUpdate(NN.block, pageId, { archived: 1, in_trash: 1 });
    nav(path("/"));
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
          title="Set reminder"
          onClick={async () => {
            if (!user || !pageId) return;
            const defVal = new Date(Date.now() + 3600_000).toISOString().slice(0, 16);
            const val = await nnPrompt("Pick a time to be reminded about this page.", { title: "Set reminder", type: "datetime-local", defaultValue: defVal });
            if (!val) return;
            const d = new Date(val);
            if (isNaN(d.getTime())) { nnAlert("That date could not be parsed."); return; }
            await createReminder(String(user.user_id), pageId, d);
            nnAlert(`Reminder set for ${d.toLocaleString()}`, "Reminder");
          }}
        >
          <Bell size={14} />
        </button>

        <button
          className="nn-topbar-btn"
          title="Assign this page to a teammate"
          onClick={async () => {
            if (!user || !pageId) return;
            const uid = await nnPrompt("Enter the teammate's numeric user ID.", { title: "Assign page", placeholder: "e.g. 42" });
            if (!uid || !/^\d+$/.test(uid.trim())) return;
            try {
              await createNotification({
                user_id: uid.trim(),
                type: "assignment",
                block_id: pageId,
                actor_user_id: String(user.user_id),
                payload: JSON.stringify({ message: `Assigned: ${title || "Untitled"}` }),
              });
              nnAlert(`Assigned to user ${uid}`, "Assignment sent");
            } catch (e: any) {
              nnAlert(`Failed: ${e.message || e}`);
            }
          }}
        >
          <UserPlus size={14} />
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
              <div onClick={toggleFullWidth} className="nn-sidebar-item">
                <span className="nn-icon">{fullWidth ? <Minimize2 size={14} /> : <Maximize2 size={14} />}</span>
                <span className="nn-title">{fullWidth ? "Compact width" : "Full width"}</span>
              </div>
              <div onClick={toggleLock} className="nn-sidebar-item">
                <span className="nn-icon">{locked ? <Unlock size={14} /> : <Lock size={14} />}</span>
                <span className="nn-title">{locked ? "Unlock page" : "Lock page"}</span>
              </div>
              <div onClick={takeSnapshot} className="nn-sidebar-item">
                <span className="nn-icon"><History size={14} /></span>
                <span className="nn-title">Save version</span>
              </div>
              {snapshots.length > 0 && (
                <div onClick={() => { setShowHistory(true); setShowMenu(false); }} className="nn-sidebar-item">
                  <span className="nn-icon"><History size={14} /></span>
                  <span className="nn-title">Page history ({snapshots.length})</span>
                </div>
              )}
              <div onClick={duplicatePage} className="nn-sidebar-item">
                <span className="nn-icon"><Copy size={14} /></span>
                <span className="nn-title">Duplicate</span>
              </div>
              <div onClick={copyLink} className="nn-sidebar-item">
                <span className="nn-icon"><LinkIcon size={14} /></span>
                <span className="nn-title">Copy link</span>
              </div>
              <div onClick={trashPage} className="nn-sidebar-item" style={{ color: "#e03e3e" }}>
                <span className="nn-icon"><Trash2 size={14} /></span>
                <span className="nn-title">Move to trash</span>
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
        <div className={`nn-page ${fullWidth ? "nn-page-full" : ""} ${locked ? "nn-page-locked" : ""}`} style={cover ? { paddingTop: 24 } : undefined}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <div className="nn-page-icon" onClick={() => setShowEmoji((s) => !s)}>
              {icon || <span style={{ fontSize: 24, opacity: 0.3 }}>Add icon</span>}
            </div>
            {showEmoji && (
              <EmojiPicker
                onPick={onIconChange}
                onClear={() => onIconChange("")}
              />
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
            <NotionEditor
              content={content}
              onChange={onContentChange}
              onCreateSubpage={async () => {
                if (!block) return null;
                const { id } = await cctCreate(NN.block, {
                  workspace_id: block.workspace_id || "",
                  parent_id: pageId,
                  type: "page",
                  title: "Untitled",
                  icon: "",
                  cover: "",
                  properties: JSON.stringify({}),
                  content_order: JSON.stringify([]),
                  archived: 0,
                  in_trash: 0,
                  created_by: user?.user_id || 0,
                  last_edited_by: user?.user_id || 0,
                });
                return { id, title: "Untitled", href: path(`/p/${id}`) };
              }}
            />
          )}
          <NotchComments blockId={pageId} />
        </div>
      </div>
      {showShare && <NotchShareModal blockId={pageId} onClose={() => setShowShare(false)} />}
      {showCoverGallery && (
        <CoverGallery
          current={cover}
          onPick={applyCover}
          onClose={() => setShowCoverGallery(false)}
        />
      )}
      {showHistory && (
        <div className="nn-history-backdrop" onClick={() => setShowHistory(false)}>
          <aside className="nn-history-panel" onClick={(e) => e.stopPropagation()}>
            <div className="nn-history-head">
              <History size={14} />
              <span style={{ flex: 1, fontWeight: 600 }}>Page history</span>
              <button className="nn-topbar-btn" onClick={() => setShowHistory(false)}><X size={14} /></button>
            </div>
            <div className="nn-history-body">
              {snapshots.length === 0 ? (
                <div style={{ opacity: 0.6, fontSize: 13, padding: 12 }}>No snapshots yet.</div>
              ) : snapshots.map((s, i) => (
                <div key={s.ts} className="nn-history-item">
                  <div className="nn-history-meta">
                    <div className="nn-history-title">{s.title || "Untitled"}</div>
                    <div className="nn-history-ts">{new Date(s.ts).toLocaleString()}</div>
                  </div>
                  <div className="nn-history-actions">
                    <button className="nn-topbar-btn" onClick={() => restoreSnapshot(i)} title="Restore">Restore</button>
                    <button
                      className="nn-topbar-btn"
                      title="Delete snapshot"
                      onClick={async () => {
                        if (!(await nnConfirm("Delete this snapshot?", "Delete"))) return;
                        const next = snapshots.filter((_, j) => j !== i);
                        setSnapshots(next);
                        saveProps({ history: next });
                      }}
                    ><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

const COVER_PRESETS = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1600",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1600",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1600",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1600",
];

function CoverGallery({ current, onPick, onClose }: { current: string; onPick: (u: string) => void; onClose: () => void }) {
  const [url, setUrl] = useState(current || "");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "var(--nn-bg)", borderRadius: 8, width: "100%", maxWidth: 720, padding: 20, maxHeight: "80vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Choose a cover</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8, marginBottom: 16 }}>
          {COVER_PRESETS.map((u) => (
            <img key={u} src={u} alt="cover" onClick={() => onPick(u)}
              style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 6, cursor: "pointer", border: current === u ? "2px solid var(--nn-blue)" : "2px solid transparent" }} />
          ))}
        </div>
        <div style={{ fontSize: 12, color: "var(--nn-text-tertiary)", marginBottom: 6 }}>Or paste an image URL</div>
        <div style={{ display: "flex", gap: 6 }}>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="nn-auth-input" style={{ marginBottom: 0, flex: 1 }} />
          <button className="nn-btn-primary" onClick={() => url && onPick(url)}>Use</button>
        </div>
      </div>
    </div>
  );
}

