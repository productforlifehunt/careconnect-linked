import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import { ChevronRight, Database, FileText, MoreHorizontal, Star, Image as ImageIcon, X, Share2, Copy, Link as LinkIcon, Trash2, Bell, UserPlus, Lock, Unlock, Maximize2, Minimize2, History, BadgeCheck, Printer, FolderInput, Search as SearchIcon, Code as CodeIcon } from "lucide-react";
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
import { joinPresence, type Peer } from "@/notch/lib/nn-presence";
import { useNotchTitle } from "@/notch/lib/nn-title";

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
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loadTick, setLoadTick] = useState(0);
  const [title, setTitle] = useState("");
  useNotchTitle(title || "Untitled");
  const [icon, setIcon] = useState("");
  const [cover, setCover] = useState("");
  const [content, setContent] = useState<any>(null);
  const [crumbs, setCrumbs] = useState<Block[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [locked, setLocked] = useState(false);
  const [fullWidth, setFullWidth] = useState(false);
  const [smallText, setSmallText] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifiedMeta, setVerifiedMeta] = useState<{ by?: string; at?: number; expires?: number } | null>(null);

  const [snapshots, setSnapshots] = useState<Array<{ ts: number; content: any; title: string }>>([]);
  const [diffIdx, setDiffIdx] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const saveTimer = useRef<any>(null);
  const autoSnapTimer = useRef<any>(null);
  const lastSnapAt = useRef<number>(0);
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [saving, setSaving] = useState<"idle" | "pending" | "saved">("idle");
  useEffect(() => {
    const on = () => setOnline(true); const off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  useEffect(() => {
    if (!pageId) return;
    let alive = true;
    setLoadErr(null);
    (async () => {
      try {
        const b = await cctGet<Block>(NN.block, pageId);
        if (!alive) return;
        if (!b) { setLoadErr("This page couldn't be found. It may have been deleted."); return; }
        setBlock(b);
        setTitle(b.title || "");
        setIcon(b.icon || "");
        setCover(b.cover || "");
        try {
          const props = b.properties ? JSON.parse(b.properties) : {};
          setContent(props.editor_content || null);
          setLocked(!!props.locked);
          setFullWidth(!!props.full_width);
          setSmallText(!!props.small_text);
          setVerified(!!props.verified);
          setVerifiedMeta(props.verified_meta || null);

          setSnapshots(Array.isArray(props.history) ? props.history : []);
        } catch { setContent(null); }
        // build breadcrumbs
        const chain: Block[] = [b];
        let cursor = b;
        const seen = new Set([b.id]);
        try {
          const all = await cctList<Block>(NN.block, { workspace_id: b.workspace_id || undefined });
          while (cursor.parent_id && !seen.has(String(cursor.parent_id))) {
            const parent = all.find((x) => String(x.id) === String(cursor.parent_id));
            if (!parent || parent.type !== "page" && parent.type !== "database") break;
            chain.unshift(parent);
            seen.add(parent.id);
            cursor = parent;
          }
        } catch { /* breadcrumbs are best-effort */ }
        setCrumbs(chain);
        // Expose trail (excluding current page) for the <Breadcrumb> editor node.
        (window as any).__NN_BREADCRUMB__ = chain.slice(0, -1).map((p) => ({ id: p.id, title: p.title || "Untitled" }));
        (window as any).__NN_ACTIVE_WORKSPACE__ = b.workspace_id || "";
        (window as any).__NN_ACTIVE_PARENT__ = b.id;
      } catch (e: any) {
        if (alive) setLoadErr(e?.message || "Failed to load this page. Check your connection and retry.");
      }
    })();
    return () => { alive = false; };
  }, [pageId, loadTick]);


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
        editor_content: extra.editor_content ?? content,
        locked: extra.locked ?? locked,
        full_width: extra.full_width ?? fullWidth,
        small_text: extra.small_text ?? smallText,
        verified: extra.verified ?? verified,
        history: extra.history ?? snapshots,
      }),
    });
  }, [content, locked, fullWidth, smallText, verified, snapshots, scheduleSave]);

  const onTitleChange = (v: string) => { if (locked) return; setTitle(v); scheduleSave({ title: v }); };
  const onIconChange = (v: string) => { setIcon(v); setShowEmoji(false); scheduleSave({ icon: v }); };
  const onContentChange = (json: any) => {
    if (locked) return;
    setContent(json);
    saveProps({ editor_content: json });
    // Auto-snapshot: at most once every 5 minutes of active editing, debounced by 30s of inactivity.
    clearTimeout(autoSnapTimer.current);
    autoSnapTimer.current = setTimeout(() => {
      const now = Date.now();
      if (now - lastSnapAt.current < 5 * 60_000) return;
      lastSnapAt.current = now;
      setSnapshots((prev) => {
        const next = [{ ts: now, content: json, title }, ...prev].slice(0, 30);
        saveProps({ history: next, editor_content: json });
        return next;
      });
    }, 30_000);
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
  const toggleSmallText = () => {
    const nv = !smallText;
    setSmallText(nv);
    setShowMenu(false);
    saveProps({ small_text: nv });
  };
  const toggleVerified = () => {
    const nv = !verified;
    setVerified(nv);
    setShowMenu(false);
    saveProps({ verified: nv });
  };
  const takeSnapshot = () => {
    const snap = { ts: Date.now(), content, title };
    const next = [snap, ...snapshots].slice(0, 30);
    setSnapshots(next);
    lastSnapAt.current = snap.ts;
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

  // Word / char count over the page's TipTap JSON content.
  const countWords = (): { words: number; chars: number } => {
    const collect = (n: any, acc: string[]): void => {
      if (!n) return;
      if (typeof n.text === "string") acc.push(n.text);
      if (Array.isArray(n.content)) n.content.forEach((c: any) => collect(c, acc));
    };
    const parts: string[] = [];
    collect(content, parts);
    const text = (title + " " + parts.join(" ")).trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    return { words, chars: text.length };
  };

  const showWordCount = async () => {
    setShowMenu(false);
    const { words, chars } = countWords();
    await nnAlert(`${words.toLocaleString()} words · ${chars.toLocaleString()} characters`, "Word count");
  };

  // Export the current page as Markdown and trigger a browser download.
  const exportMarkdown = () => {
    setShowMenu(false);
    const inline = (nodes: any[] | undefined): string => {
      if (!Array.isArray(nodes)) return "";
      return nodes.map((n: any) => {
        if (n.type !== "text") return n.type === "hardBreak" ? "  \n" : "";
        let t = n.text || "";
        const marks = (n.marks || []) as any[];
        for (const m of marks) {
          if (m.type === "bold") t = `**${t}**`;
          else if (m.type === "italic") t = `*${t}*`;
          else if (m.type === "code") t = `\`${t}\``;
          else if (m.type === "strike") t = `~~${t}~~`;
          else if (m.type === "link" && m.attrs?.href) t = `[${t}](${m.attrs.href})`;
        }
        return t;
      }).join("");
    };
    const blockToMd = (node: any, depth = 0): string => {
      if (!node) return "";
      const pad = "  ".repeat(depth);
      const kids = Array.isArray(node.content) ? node.content : [];
      switch (node.type) {
        case "doc": return kids.map((k: any) => blockToMd(k, 0)).join("\n\n");
        case "heading": return `${"#".repeat(node.attrs?.level || 1)} ${inline(kids)}`;
        case "paragraph": return `${pad}${inline(kids)}`;
        case "bulletList": return kids.map((li: any) => blockToMd(li, depth)).join("\n");
        case "orderedList": return kids.map((li: any, i: number) => `${pad}${i + 1}. ${inline(li.content?.[0]?.content)}`).join("\n");
        case "listItem": return `${pad}- ${inline(kids?.[0]?.content)}`;
        case "taskList": return kids.map((li: any) => blockToMd(li, depth)).join("\n");
        case "taskItem": return `${pad}- [${node.attrs?.checked ? "x" : " "}] ${inline(kids?.[0]?.content)}`;
        case "blockquote": return kids.map((k: any) => `> ${blockToMd(k, 0)}`).join("\n");
        case "codeBlock": return "```" + (node.attrs?.language || "") + "\n" + inline(kids) + "\n```";
        case "horizontalRule": return "---";
        case "callout": return kids.map((k: any) => `> ${blockToMd(k, 0)}`).join("\n");
        case "image": return `![${node.attrs?.alt || ""}](${node.attrs?.src || ""})`;
        default: return kids.map((k: any) => blockToMd(k, depth)).join("\n");
      }
    };
    const md = `# ${title || "Untitled"}\n\n${blockToMd(content)}`;
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "Untitled").replace(/[^\w\-]+/g, "_")}.md`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Export current page as a standalone HTML file with basic Notion-like styling.
  const exportHtml = () => {
    setShowMenu(false);
    const inlineHtml = (nodes: any[] | undefined): string => {
      if (!Array.isArray(nodes)) return "";
      const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as any)[c]);
      return nodes.map((n: any) => {
        if (n.type === "hardBreak") return "<br/>";
        if (n.type !== "text") return "";
        let t = esc(n.text || "");
        for (const m of (n.marks || []) as any[]) {
          if (m.type === "bold") t = `<strong>${t}</strong>`;
          else if (m.type === "italic") t = `<em>${t}</em>`;
          else if (m.type === "code") t = `<code>${t}</code>`;
          else if (m.type === "strike") t = `<s>${t}</s>`;
          else if (m.type === "underline") t = `<u>${t}</u>`;
          else if (m.type === "link" && m.attrs?.href) t = `<a href="${esc(m.attrs.href)}">${t}</a>`;
        }
        return t;
      }).join("");
    };
    const toHtml = (node: any): string => {
      if (!node) return "";
      const kids = Array.isArray(node.content) ? node.content : [];
      switch (node.type) {
        case "doc": return kids.map(toHtml).join("\n");
        case "heading": { const l = node.attrs?.level || 1; return `<h${l}>${inlineHtml(kids)}</h${l}>`; }
        case "paragraph": return `<p>${inlineHtml(kids)}</p>`;
        case "bulletList": return `<ul>${kids.map(toHtml).join("")}</ul>`;
        case "orderedList": return `<ol>${kids.map(toHtml).join("")}</ol>`;
        case "listItem": return `<li>${kids.map(toHtml).join("")}</li>`;
        case "taskList": return `<ul class="task">${kids.map(toHtml).join("")}</ul>`;
        case "taskItem": return `<li><input type="checkbox" ${node.attrs?.checked ? "checked" : ""} disabled/> ${inlineHtml(kids?.[0]?.content)}</li>`;
        case "blockquote": return `<blockquote>${kids.map(toHtml).join("")}</blockquote>`;
        case "codeBlock": return `<pre><code>${inlineHtml(kids)}</code></pre>`;
        case "horizontalRule": return "<hr/>";
        case "callout": return `<div class="callout">${kids.map(toHtml).join("")}</div>`;
        case "image": return `<img src="${node.attrs?.src || ""}" alt="${node.attrs?.alt || ""}"/>`;
        default: return kids.map(toHtml).join("");
      }
    };
    const body = toHtml(content);
    const safeTitle = (title || "Untitled");
    const html = `<!doctype html><html><head><meta charset="utf-8"/><title>${safeTitle.replace(/</g, "&lt;")}</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;max-width:720px;margin:40px auto;padding:0 24px;color:#37352f;line-height:1.6}h1,h2,h3,h4{font-weight:600;margin:1.4em 0 .4em}code{background:rgba(135,131,120,.15);padding:2px 4px;border-radius:3px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9em}pre{background:#f7f6f3;padding:14px;border-radius:6px;overflow:auto}blockquote{border-left:3px solid #37352f;padding-left:14px;margin:1em 0;color:#37352f}.callout{background:#f1f1ef;padding:12px 14px;border-radius:4px;margin:.6em 0}img{max-width:100%;border-radius:4px}hr{border:none;border-top:1px solid #e9e9e7;margin:1.4em 0}ul.task{list-style:none;padding-left:1em}</style></head><body><h1>${safeTitle.replace(/</g, "&lt;")}</h1>${body}</body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${safeTitle.replace(/[^\w\-]+/g, "_")}.html`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Trigger the browser's print dialog for save-as-PDF.
  const exportPdf = () => {
    setShowMenu(false);
    window.print();
  };

  const [showMovePicker, setShowMovePicker] = useState(false);
  const movePage = () => { setShowMovePicker(true); setShowMenu(false); };
  const applyMove = async (newParentId: string) => {
    if (!pageId) return;
    await cctUpdate(NN.block, pageId, { parent_id: newParentId });
    setShowMovePicker(false);
    // Refresh crumbs by reloading the page block.
    setLoadTick((t) => t + 1);
  };

  const trashPage = async () => {
    if (!pageId) return;
    if (!(await nnConfirm("You can restore it from Trash later.", "Move to trash?"))) return;
    await cctUpdate(NN.block, pageId, { archived: 1, in_trash: 1 });
    nav(path("/"));
  };


  if (!pageId) return null;
  if (loadErr) return (
    <div className="nn-page" style={{ paddingTop: 60 }}>
      <div style={{ maxWidth: 420, margin: "0 auto", textAlign: "center", color: "var(--nn-text-secondary)" }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--nn-text)", marginBottom: 4 }}>Couldn't load this page</div>
        <div style={{ fontSize: 13, marginBottom: 16 }}>{loadErr}</div>
        <button className="nn-btn-primary" onClick={() => setLoadTick((t) => t + 1)}>Retry</button>
      </div>
    </div>
  );
  if (!block) return <div className="nn-page"><div style={{ opacity: 0.5 }}>Loading…</div></div>;


  const isDatabase = block.type === "database";

  return (
    <>
      {!online && <div className="nn-offline-pill">Offline — changes will sync when back online</div>}
      <PresenceLayer pageId={pageId} me={{ id: String(user?.user_id || "anon"), name: user?.user_display_name || user?.user_email || "Guest" }} />
      <div className="nn-topbar">
        <BreadcrumbTrail crumbs={crumbs} pageId={pageId} onNav={(id) => nav(path(`/p/${id}`))} />
        <PresenceAvatars pageId={pageId} me={{ id: String(user?.user_id || "anon"), name: user?.user_display_name || user?.user_email || "Guest" }} />
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
              <div onClick={toggleSmallText} className="nn-sidebar-item">
                <span className="nn-icon" style={{ fontSize: 12, fontWeight: 600 }}>{smallText ? "A" : "a"}</span>
                <span className="nn-title">{smallText ? "Default text size" : "Small text"}</span>
              </div>
              <div onClick={toggleLock} className="nn-sidebar-item">
                <span className="nn-icon">{locked ? <Unlock size={14} /> : <Lock size={14} />}</span>
                <span className="nn-title">{locked ? "Unlock page" : "Lock page"}</span>
              </div>
              <div onClick={toggleVerified} className="nn-sidebar-item">
                <span className="nn-icon"><BadgeCheck size={14} color={verified ? "#448361" : undefined} /></span>
                <span className="nn-title">{verified ? "Remove verified" : "Mark as verified (wiki)"}</span>
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
              <div onClick={exportMarkdown} className="nn-sidebar-item">
                <span className="nn-icon" style={{ fontSize: 11, fontWeight: 700, letterSpacing: -0.5 }}>MD</span>
                <span className="nn-title">Export as Markdown</span>
              </div>
              <div onClick={exportHtml} className="nn-sidebar-item">
                <span className="nn-icon"><CodeIcon size={14} /></span>
                <span className="nn-title">Export as HTML</span>
              </div>
              <div onClick={exportPdf} className="nn-sidebar-item">
                <span className="nn-icon"><Printer size={14} /></span>
                <span className="nn-title">Export as PDF (print)</span>
              </div>
              <div onClick={showWordCount} className="nn-sidebar-item">
                <span className="nn-icon" style={{ fontSize: 11, fontWeight: 700 }}>Σ</span>
                <span className="nn-title">Word count</span>
              </div>
              <div onClick={movePage} className="nn-sidebar-item">
                <span className="nn-icon"><FolderInput size={14} /></span>
                <span className="nn-title">Move to…</span>
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
        <div className={`nn-page ${fullWidth ? "nn-page-full" : ""} ${locked ? "nn-page-locked" : ""} ${smallText ? "nn-page-small" : ""}`} style={cover ? { paddingTop: 24 } : undefined}>
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
          <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <textarea
              ref={titleRef}
              className="nn-page-title"
              placeholder={isDatabase ? "Untitled database" : "Untitled"}
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              rows={1}
              style={{ flex: 1 }}
            />
            {verified && (
              <span
                title="Verified page — content has been reviewed by a workspace owner"
                style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 14, padding: "2px 8px", background: "rgba(68,131,97,0.14)", color: "#448361", borderRadius: 12, fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" }}
              >
                <BadgeCheck size={13} /> Verified
              </span>
            )}
          </div>
          {isDatabase ? (
            <NotchDatabase databaseId={pageId} workspaceId={String(block.workspace_id || "")} />
          ) : (
            <NotionEditor
              pageId={pageId}
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
          {!isDatabase && (() => {
            // Live word/char count from the JSON content.
            const walk = (n: any): string => {
              if (!n) return "";
              if (Array.isArray(n)) return n.map(walk).join(" ");
              if (n.type === "text") return n.text || "";
              return (n.content || []).map(walk).join(" ");
            };
            const txt = walk(content).trim();
            const words = txt ? txt.split(/\s+/).length : 0;
            const chars = txt.length;
            return (
              <div style={{ marginTop: 24, fontSize: 11, color: "var(--nn-text-tertiary)", textAlign: "right" }}>
                {words.toLocaleString()} words · {chars.toLocaleString()} characters
              </div>
            );
          })()}
          <Backlinks pageId={pageId} />
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
      {showMovePicker && block && (
        <MovePagePicker
          workspaceId={block.workspace_id || ""}
          currentId={pageId}
          currentParentId={block.parent_id || ""}
          onPick={applyMove}
          onClose={() => setShowMovePicker(false)}
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
                    <button className="nn-topbar-btn" onClick={() => setDiffIdx(i)} title="Diff against current">Diff</button>
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
              {diffIdx != null && snapshots[diffIdx] && (
                <div style={{ borderTop: "1px solid var(--nn-border)", padding: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Diff vs {new Date(snapshots[diffIdx].ts).toLocaleString()}</span>
                    <button className="nn-topbar-btn" style={{ marginLeft: "auto" }} onClick={() => setDiffIdx(null)}><X size={12} /></button>
                  </div>
                  <DiffView oldText={extractText(snapshots[diffIdx].content)} newText={extractText(content)} />
                </div>
              )}
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
  const [uploading, setUploading] = useState(false);
  const { user } = useNotchAuth();
  const handleUpload = async () => {
    try {
      const { pickFile, nnUploadFile } = await import("@/notch/lib/nn-files");
      const f = await pickFile("image/*");
      if (!f) return;
      setUploading(true);
      const up = await nnUploadFile(f, user?.user_id || "anon");
      onPick(up.url);
    } catch (e: any) {
      nnAlert(`Upload failed: ${e?.message || e}`, "Cover");
    } finally { setUploading(false); }
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "var(--nn-bg)", borderRadius: 8, width: "100%", maxWidth: 720, padding: 20, maxHeight: "80vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Choose a cover</div>
          <button className="nn-btn-secondary" onClick={handleUpload} disabled={uploading}>{uploading ? "Uploading…" : "Upload image"}</button>
        </div>
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

function MovePagePicker({ workspaceId, currentId, currentParentId, onPick, onClose }:
  { workspaceId: string; currentId: string; currentParentId: string; onPick: (id: string) => void; onClose: () => void }) {
  const [pages, setPages] = useState<Block[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await cctList<Block>(NN.block, { per_page: 200 });
        if (!alive) return;
        setPages((list || []).filter((b) => b.id !== currentId && (b.type === "page" || b.type === "database" || !b.type)));
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [currentId]);
  const filtered = pages.filter((p) => !q || (p.title || "Untitled").toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 200, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 80 }} onClick={onClose}>
      <div style={{ background: "var(--nn-bg)", borderRadius: 8, width: "100%", maxWidth: 480, maxHeight: "70vh", display: "flex", flexDirection: "column", boxShadow: "0 12px 40px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--nn-border)", display: "flex", alignItems: "center", gap: 8 }}>
          <SearchIcon size={14} style={{ opacity: 0.6 }} />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Move page to…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: "var(--nn-text)" }} />
          <button className="nn-topbar-btn" onClick={onClose}><X size={14} /></button>
        </div>
        <div style={{ overflow: "auto", padding: 4 }}>
          {workspaceId && (
            <div className="nn-sidebar-item" onClick={() => onPick(workspaceId)} style={{ opacity: currentParentId === workspaceId ? 0.5 : 1 }}>
              <span className="nn-icon"><FolderInput size={14} /></span>
              <span className="nn-title">Workspace root</span>
            </div>
          )}
          {loading && <div style={{ padding: 12, fontSize: 12, color: "var(--nn-text-tertiary)" }}>Loading…</div>}
          {!loading && filtered.length === 0 && <div style={{ padding: 12, fontSize: 12, color: "var(--nn-text-tertiary)" }}>No pages found.</div>}
          {filtered.slice(0, 100).map((p) => (
            <div key={p.id} className="nn-sidebar-item" onClick={() => onPick(p.id)} style={{ opacity: currentParentId === p.id ? 0.5 : 1 }}>
              <span className="nn-icon">{p.icon || (p.type === "database" ? <Database size={14} /> : <FileText size={14} />)}</span>
              <span className="nn-title" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title || "Untitled"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function BreadcrumbTrail({ crumbs, pageId, onNav }: { crumbs: Block[]; pageId: string; onNav: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const MAX = 4;
  const overflow = crumbs.length > MAX;
  const visible = overflow ? [crumbs[0], ...crumbs.slice(-2)] : crumbs;
  const hidden = overflow ? crumbs.slice(1, -2) : [];
  return (
    <div className="nn-breadcrumb" style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0, flex: 1, overflow: "hidden" }}>
      {visible.map((c, i) => {
        const showOverflowAfter = overflow && i === 0;
        return (
          <span key={c.id} style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
            {i > 0 && <ChevronRight size={12} style={{ opacity: 0.5, flexShrink: 0 }} />}
            <span
              onClick={() => c.id !== pageId && onNav(c.id)}
              title={c.title || "Untitled"}
              style={{ cursor: c.id === pageId ? "default" : "pointer", padding: "2px 6px", borderRadius: 3, color: c.id === pageId ? "var(--nn-text)" : "var(--nn-text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}
            >
              {c.icon && <span style={{ marginRight: 4 }}>{c.icon}</span>}
              {c.title || "Untitled"}
            </span>
            {showOverflowAfter && (
              <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 4 }}>
                <ChevronRight size={12} style={{ opacity: 0.5, flexShrink: 0 }} />
                <span onClick={() => setOpen((v) => !v)} style={{ cursor: "pointer", padding: "2px 6px", borderRadius: 3, color: "var(--nn-text-secondary)" }} title={`${hidden.length} more`}>…</span>
                {open && (
                  <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: "var(--nn-bg)", border: "1px solid var(--nn-border)", borderRadius: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", zIndex: 100, minWidth: 180, padding: 4 }} onMouseLeave={() => setOpen(false)}>
                    {hidden.map((h) => (
                      <div key={h.id} onClick={() => { setOpen(false); onNav(h.id); }} style={{ padding: "6px 10px", cursor: "pointer", borderRadius: 4, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} className="nn-hover-row">
                        {h.icon && <span style={{ marginRight: 6 }}>{h.icon}</span>}
                        {h.title || "Untitled"}
                      </div>
                    ))}
                  </div>
                )}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}



function PresenceAvatars({ pageId, me }: { pageId: string; me: { id: string; name: string } }) {
  const [peers, setPeers] = useState<Peer[]>([]);
  useEffect(() => {
    if (!pageId) return;
    const p = joinPresence(pageId, me.id, me.name);
    const off = p.onChange(() => setPeers(Array.from(p.peers.values())));
    setPeers(Array.from(p.peers.values()));
    return () => { off(); };
  }, [pageId, me.id, me.name]);
  if (!peers.length) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: -6, marginRight: 6 }} title={`${peers.length} other viewer${peers.length > 1 ? "s" : ""}`}>
      {peers.slice(0, 4).map((p) => (
        <div key={p.id} style={{ width: 22, height: 22, borderRadius: "50%", background: p.color, color: "white", fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--nn-bg)", marginLeft: -6 }} title={p.name}>
          {p.name.slice(0, 1).toUpperCase()}
        </div>
      ))}
      {peers.length > 4 && (
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--nn-bg-secondary)", color: "var(--nn-text)", fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--nn-bg)", marginLeft: -6 }}>+{peers.length - 4}</div>
      )}
    </div>
  );
}

function PresenceLayer({ pageId, me }: { pageId: string; me: { id: string; name: string } }) {
  const [peers, setPeers] = useState<Peer[]>([]);
  useEffect(() => {
    if (!pageId) return;
    const p = joinPresence(pageId, me.id, me.name);
    const off = p.onChange(() => setPeers(Array.from(p.peers.values())));
    const onMove = (e: MouseEvent) => p.cursor(e.clientX, e.clientY);
    let raf = 0;
    const throttled = (e: MouseEvent) => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; onMove(e); }); };
    window.addEventListener("mousemove", throttled);
    return () => { off(); window.removeEventListener("mousemove", throttled); };
  }, [pageId, me.id, me.name]);
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 200 }}>
      {peers.map((p) => (
        typeof p.x === "number" && typeof p.y === "number" ? (
          <div key={p.id} style={{ position: "absolute", left: p.x, top: p.y, transform: "translate(-2px, -2px)", transition: "left 120ms linear, top 120ms linear" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ display: "block" }}>
              <path d="M2 2 L2 18 L7 14 L10 22 L13 21 L10 13 L18 13 Z" fill={p.color} stroke="white" strokeWidth="1" />
            </svg>
            <div style={{ marginLeft: 12, marginTop: -4, background: p.color, color: "white", fontSize: 10, padding: "2px 6px", borderRadius: 3, whiteSpace: "nowrap" }}>{p.name}</div>
          </div>
        ) : null
      ))}
    </div>
  );
}

function Backlinks({ pageId }: { pageId: string }) {
  const path = useNotchPath();
  const [refs, setRefs] = useState<Array<{ id: string; title: string; icon?: string }>>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const all = await cctList<any>(NN.block, { per_page: 300 });
        const hits: Array<{ id: string; title: string; icon?: string }> = [];
        const needle1 = `page:${pageId}`;
        const needle2 = `/p/${pageId}`;
        for (const b of all || []) {
          if (b.id === pageId || b.in_trash) continue;
          const props = typeof b.properties === "string" ? b.properties : JSON.stringify(b.properties || {});
          if (props && (props.includes(needle1) || props.includes(needle2))) {
            hits.push({ id: b.id, title: b.title || "Untitled", icon: b.icon });
          }
        }
        if (alive) setRefs(hits);
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [pageId]);
  if (loading || refs.length === 0) return null;
  return (
    <div style={{ marginTop: 32, borderTop: "1px solid var(--nn-border)", paddingTop: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--nn-text-tertiary)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
        {refs.length} {refs.length === 1 ? "backlink" : "backlinks"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {refs.map((r) => (
          <a key={r.id} href={path(`/p/${r.id}`)} className="nn-sidebar-item" style={{ textDecoration: "none" }}>
            <span className="nn-icon">{r.icon || "📄"}</span>
            <span className="nn-title">{r.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function extractText(doc: any): string {
  if (!doc) return "";
  const out: string[] = [];
  const walk = (n: any) => {
    if (!n) return;
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (n.type === "text" && typeof n.text === "string") out.push(n.text);
    else if (n.type === "heading" || n.type === "paragraph") { (n.content || []).forEach(walk); out.push("\n"); }
    else (n.content || []).forEach(walk);
  };
  walk(doc);
  return out.join("").split("\n").map((l) => l.trim()).filter(Boolean).join("\n");
}

function DiffView({ oldText, newText }: { oldText: string; newText: string }) {
  const a = oldText.split("\n");
  const b = newText.split("\n");
  const n = a.length, m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) {
    dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  }
  const rows: Array<{ t: " " | "-" | "+"; line: string }> = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { rows.push({ t: " ", line: a[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { rows.push({ t: "-", line: a[i] }); i++; }
    else { rows.push({ t: "+", line: b[j] }); j++; }
  }
  while (i < n) { rows.push({ t: "-", line: a[i++] }); }
  while (j < m) { rows.push({ t: "+", line: b[j++] }); }
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, lineHeight: 1.5, maxHeight: 320, overflow: "auto", border: "1px solid var(--nn-border)", borderRadius: 4 }}>
      {rows.map((r, k) => (
        <div key={k} style={{
          padding: "1px 8px",
          background: r.t === "+" ? "rgba(80,200,120,0.15)" : r.t === "-" ? "rgba(224,62,62,0.13)" : "transparent",
          color: r.t === "+" ? "#2f8f5a" : r.t === "-" ? "#c53030" : "var(--nn-text)",
          whiteSpace: "pre-wrap",
        }}>
          <span style={{ opacity: 0.6, marginRight: 6 }}>{r.t}</span>{r.line || " "}
        </div>
      ))}
      {rows.length === 0 && <div style={{ padding: 12, color: "var(--nn-text-tertiary)" }}>No differences.</div>}
    </div>
  );
}


