import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import { ChevronRight, Plus, MoreHorizontal, Search, Trash2, FileText, Settings, LogOut, Trash, Star, Bell } from "lucide-react";
import { cctList, cctCreate, cctUpdate, cctDelete, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";
import { useFavorites } from "@/notch/lib/nn-favorites";
import { unreadCount, tickReminderQueue } from "@/notch/lib/nn-notifications";
import { useUnreadCount } from "@/notch/lib/nn-use-unread";
import { nnPrompt, nnConfirm } from "@/notch/lib/nn-dialog";
import { NotchContextMenu, CtxIcons } from "@/notch/components/NotchContextMenu";
import { toast } from "@/hooks/use-toast";
import { pushUndo } from "@/notch/lib/nn-workspace-undo";

interface Block {
  id: string;
  parent_id?: string | null;
  workspace_id?: string | null;
  type?: string;
  title?: string;
  icon?: string;
  archived?: string | number;
  created_by?: string | null;
}

interface Workspace {
  id: string;
  name: string;
  icon?: string;
}

export function NotchSidebar() {
  const nav = useNavigate();
  const path = useNotchPath();
  const location = useLocation();
  const { user, logout } = useNotchAuth();
  const { favs, isFav, toggle: toggleFav } = useFavorites();
  const { pageId } = useParams<{ pageId: string }>();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWs, setActiveWs] = useState<string | null>(null);
  const [pages, setPages] = useState<Block[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const unread = useUnreadCount(user?.user_id);
  const [ctx, setCtx] = useState<{ x: number; y: number; page: Block } | null>(null);
  const [sectionsOpen, setSectionsOpen] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem("nn:sidebar:sections") || "{}"); } catch { return {}; }
  });
  const toggleSection = (k: string) => setSectionsOpen((s) => {
    const next = { ...s, [k]: s[k] === false ? true : false };
    try { localStorage.setItem("nn:sidebar:sections", JSON.stringify(next)); } catch {}
    return next;
  });
  const isSectionOpen = (k: string) => sectionsOpen[k] !== false;

  // Persisted section order (drag to reorder). Default: favorites → teamspaces → private.
  const DEFAULT_ORDER = ["favorites", "teamspaces", "private"];
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("nn:sidebar:order") || "null");
      if (Array.isArray(raw) && raw.length) {
        const filtered = raw.filter((k: string) => DEFAULT_ORDER.includes(k));
        for (const k of DEFAULT_ORDER) if (!filtered.includes(k)) filtered.push(k);
        return filtered;
      }
    } catch {}
    return DEFAULT_ORDER;
  });
  const persistOrder = (next: string[]) => {
    setSectionOrder(next);
    try { localStorage.setItem("nn:sidebar:order", JSON.stringify(next)); } catch {}
  };
  const [dragSection, setDragSection] = useState<string | null>(null);
  const onSectionDrop = (target: string) => {
    if (!dragSection || dragSection === target) return;
    const next = sectionOrder.filter((k) => k !== dragSection);
    const idx = next.indexOf(target);
    next.splice(idx, 0, dragSection);
    persistOrder(next);
    setDragSection(null);
  };

  // Bulk selection: cmd/ctrl-click to toggle; drag any selected item to move all.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const clearSelection = () => setSelected(new Set());
  const toggleSelected = (id: string) => setSelected((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });
  const bulkDelete = async () => {
    if (!selected.size) return;
    if (!(await nnConfirm(`Move ${selected.size} page${selected.size > 1 ? "s" : ""} to trash?`))) return;
    const ids = Array.from(selected);
    for (const id of ids) {
      try { await cctUpdate(NN.block, id, { archived: 1 }); } catch (e) { console.error(e); }
    }
    pushUndo(`Trashed ${ids.length} page${ids.length > 1 ? "s" : ""}`, async () => {
      for (const id of ids) { try { await cctUpdate(NN.block, id, { archived: 0, in_trash: 0 }); } catch {} }
      await loadAll();
    });
    clearSelection();
    await loadAll();
  };
  const bulkMove = async (destParentId: string) => {
    if (!selected.size) return;
    const isDescendant = (root: string, cand: string): boolean => {
      let cur: any = pages.find((x) => String(x.id) === String(cand));
      while (cur) {
        if (String(cur.id) === String(root)) return true;
        cur = pages.find((x) => String(x.id) === String(cur.parent_id));
      }
      return false;
    };
    const originalParents = new Map<string, string>();
    for (const id of selected) {
      if (isDescendant(id, destParentId)) continue;
      const orig = pages.find((x) => String(x.id) === String(id))?.parent_id || activeWs || "";
      originalParents.set(String(id), String(orig));
      try { await cctUpdate(NN.block, id, { parent_id: destParentId }); } catch (e) { console.error(e); }
    }
    pushUndo(`Moved ${originalParents.size} page${originalParents.size > 1 ? "s" : ""}`, async () => {
      for (const [id, parent] of originalParents) { try { await cctUpdate(NN.block, id, { parent_id: parent }); } catch {} }
      await loadAll();
    });
    clearSelection();
    setExpanded((s) => ({ ...s, [destParentId]: true }));
    await loadAll();
  };



  useEffect(() => {
    if (!user) return;
    let alive = true;
    const poll = async () => {
      try {
        await tickReminderQueue(String(user.user_id));
        const n = await unreadCount(String(user.user_id));
        if (alive) setUnread(n);
      } catch { /* noop */ }
    };
    poll();
    const t = setInterval(poll, 60_000);
    return () => { alive = false; clearInterval(t); };
  }, [user]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const ws = await cctList<Workspace>(NN.workspace);
      const mine = ws.filter((w: any) => !user || String(w.author_id) === String(user.user_id));
      let list = mine.length ? mine : ws;
      if (!list.length && user) {
        const created = await cctCreate(NN.workspace, { name: `${user.user_display_name}'s Workspace`, icon: "📓", plan_type: "free" });
        list = [{ id: created.id, name: `${user.user_display_name}'s Workspace`, icon: "📓" }];
      }
      setWorkspaces(list);
      const active = activeWs && list.some((w) => w.id === activeWs) ? activeWs : list[0]?.id || null;
      setActiveWs(active);
      if (active) {
        const blocks = await cctList<Block>(NN.block, { workspace_id: active });
        const pageBlocks = blocks.filter((b: any) => (b.type === "page" || b.type === "database") && Number(b.archived) !== 1);
        setPages(pageBlocks);
      }
    } catch (e: any) {
      console.error("Sidebar load failed", e);
      const raw = String(e?.message || "");
      let friendly = "Couldn't load your pages.";
      if (/fetch|network|Failed to fetch/i.test(raw)) friendly = "Can't reach the server.";
      else if (/401|403|token|jwt|unauth/i.test(raw)) friendly = "Session expired. Please sign in again.";
      setLoadErr(friendly);
    } finally {
      setLoading(false);
    }
  }, [user, activeWs]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const createPage = async (parentId?: string) => {
    if (!activeWs) return;
    const { id } = await cctCreate(NN.block, {
      workspace_id: activeWs,
      parent_id: parentId || activeWs,
      type: "page",
      title: "",
      icon: "",
      properties: JSON.stringify({}),
      content_order: JSON.stringify([]),
      archived: 0,
      in_trash: 0,
      created_by: user?.user_id || 0,
      last_edited_by: user?.user_id || 0,
    });
    if (parentId) setExpanded((e) => ({ ...e, [parentId]: true }));
    await loadAll();
    nav(path(`/p/${id}`));
  };

  const deletePage = async (id: string) => {
    if (!(await nnConfirm("This page will be moved to Trash. You can restore it later.", "Delete page?"))) return;
    await cctUpdate(NN.block, id, { archived: 1, in_trash: 1 });
    pushUndo("Deleted page", async () => { await cctUpdate(NN.block, id, { archived: 0, in_trash: 0 }); await loadAll(); });
    if (pageId === id) nav(path("/"));
    await loadAll();
  };

  const renamePage = async (id: string, current: string) => {
    const name = await nnPrompt("", { title: "Rename page", defaultValue: current, placeholder: "Page name" });
    if (name === null) return;
    await cctUpdate(NN.block, id, { title: name });
    pushUndo(`Renamed to "${name || "Untitled"}"`, async () => { await cctUpdate(NN.block, id, { title: current }); await loadAll(); });
    await loadAll();
  };

  const changeIcon = async (id: string, current: string) => {
    const icon = await nnPrompt("Emoji or 1-2 characters (empty to clear)", { title: "Page icon", defaultValue: current || "", placeholder: "📄" });
    if (icon === null) return;
    await cctUpdate(NN.block, id, { icon: icon.slice(0, 4) });
    await loadAll();
  };


  const duplicatePage = async (src: Block) => {
    if (!activeWs) return;
    const { id } = await cctCreate(NN.block, {
      workspace_id: activeWs,
      parent_id: src.parent_id || activeWs,
      type: src.type || "page",
      title: src.title ? `${src.title} (copy)` : "Untitled (copy)",
      icon: src.icon || "",
      properties: JSON.stringify({}),
      content_order: JSON.stringify([]),
      archived: 0,
      in_trash: 0,
      created_by: user?.user_id || 0,
      last_edited_by: user?.user_id || 0,
    });
    await loadAll();
    nav(path(`/p/${id}`));
  };

  const copyPageLink = async (id: string) => {
    const url = `${window.location.origin}${path(`/p/${id}`)}`;
    try { await navigator.clipboard.writeText(url); toast({ title: "Link copied" }); }
    catch { toast({ title: "Copy failed", description: url }); }
  };

  const toggleTeamspace = async (p: Block) => {
    let props: any = {};
    try { props = (p as any).properties ? JSON.parse((p as any).properties) : {}; } catch {}
    const meta = props._meta || {};
    const nextTS = !meta.teamspace;
    props._meta = { ...meta, teamspace: nextTS };
    await cctUpdate(NN.block, p.id, { properties: JSON.stringify(props) });
    toast({ title: nextTS ? "Converted to Teamspace" : "Reverted to page" });
    await loadAll();
  };

  const buildCtxItems = (p: Block) => {
    const fav = isFav(p.id);
    const isTopLevel = String(p.parent_id) === String(activeWs);
    let isTeamspace = false;
    try { const j = JSON.parse((p as any).properties || "{}"); isTeamspace = !!j?._meta?.teamspace; } catch {}
    const items: any[] = [
      { label: "Rename", icon: <CtxIcons.Pencil size={14} />, onClick: () => renamePage(p.id, p.title || "") },
      { label: "Duplicate", icon: <CtxIcons.Copy size={14} />, onClick: () => duplicatePage(p) },
      { label: "Add subpage", icon: <CtxIcons.Plus size={14} />, onClick: () => createPage(p.id) },
      { label: fav ? "Remove from Favorites" : "Add to Favorites", icon: fav ? <CtxIcons.StarOff size={14} /> : <CtxIcons.Star size={14} />, onClick: () => toggleFav(p.id) },
      { label: "Copy link", icon: <CtxIcons.Link2 size={14} />, onClick: () => copyPageLink(p.id) },
    ];
    if (isTopLevel) {
      items.push({ label: isTeamspace ? "Revert to page" : "Convert to Teamspace", icon: <CtxIcons.Users size={14} />, onClick: () => toggleTeamspace(p) });
    }
    items.push({ label: "Move to Trash", icon: <CtxIcons.Trash2 size={14} />, danger: true, divider: true, onClick: () => deletePage(p.id) });
    return items;
  };

  const getSort = (p: Block): number => {
    try { const j = JSON.parse((p as any).properties || "{}"); const s = j?._meta?.sort; return typeof s === "number" ? s : Number.MAX_SAFE_INTEGER; } catch { return Number.MAX_SAFE_INTEGER; }
  };

  const reorderSibling = async (parentId: string, sourceId: string, targetId: string, before: boolean) => {
    const sibs = pages
      .filter((p) => String(p.parent_id) === String(parentId) && String(p.id) !== String(sourceId))
      .sort((a, b) => getSort(a) - getSort(b) || String(a.id).localeCompare(String(b.id)));
    const idx = sibs.findIndex((p) => String(p.id) === String(targetId));
    if (idx < 0) return;
    const insertAt = before ? idx : idx + 1;
    sibs.splice(insertAt, 0, pages.find((p) => String(p.id) === String(sourceId))!);
    // Re-normalize sort keys as index * 1000 and persist for changed ones.
    for (let i = 0; i < sibs.length; i++) {
      const cur = sibs[i];
      const targetSort = (i + 1) * 1000;
      if (getSort(cur) === targetSort) continue;
      let props: any = {};
      try { props = (cur as any).properties ? JSON.parse((cur as any).properties) : {}; } catch {}
      props._meta = { ...(props._meta || {}), sort: targetSort };
      try { await cctUpdate(NN.block, cur.id, { properties: JSON.stringify(props), parent_id: parentId }); } catch (e) { console.error(e); }
    }
    await loadAll();
  };

  const renderTree = (parentId: string, depth = 0, seen: Set<string> = new Set()) => {
    if (depth > 20 || seen.has(parentId)) return null; // cycle / depth guard
    const nextSeen = new Set(seen); nextSeen.add(parentId);
    const children = pages
      .filter((p) => String(p.parent_id) === String(parentId))
      .sort((a, b) => getSort(a) - getSort(b) || String(a.id).localeCompare(String(b.id)));
    if (!children.length) {
      if (depth === 0) return null;
      return (
        <div className="nn-sidebar-item" style={{ paddingLeft: 14 + depth * 16, opacity: 0.5 }}>
          <span className="nn-icon" />
          <span className="nn-title">No pages inside</span>
        </div>
      );
    }
    return children.map((p, idx) => {
      const isOpen = !!expanded[p.id];
      const isActive = pageId === p.id;
      const hasChildren = pages.some((c) => String(c.parent_id) === String(p.id));
      const dropLine = (before: boolean) => (
        <div
          className="nn-drop-line"
          style={{ marginLeft: 14 + depth * 12 }}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); (e.currentTarget as HTMLElement).classList.add("active"); }}
          onDragLeave={(e) => (e.currentTarget as HTMLElement).classList.remove("active")}
          onDrop={async (e) => {
            e.preventDefault(); e.stopPropagation();
            (e.currentTarget as HTMLElement).classList.remove("active");
            const src = e.dataTransfer.getData("text/nn-page");
            if (!src || src === p.id) return;
            await reorderSibling(parentId, src, p.id, before);
          }}
        />
      );
      const isSelected = selected.has(String(p.id));
      return (
        <div key={p.id}>
          {idx === 0 && dropLine(true)}
          <div
            className={`nn-sidebar-item ${isActive ? "active" : ""} ${isSelected ? "nn-selected" : ""}`}
            style={{ paddingLeft: 14 + depth * 12, ...(isSelected ? { background: "var(--nn-blue-bg, rgba(35,131,226,0.15))" } : {}) }}
            draggable
            onDragStart={(e) => {
              // If dragging a selected item, carry all selected IDs; else drag single.
              const ids = isSelected && selected.size > 1 ? Array.from(selected) : [String(p.id)];
              e.dataTransfer.setData("text/nn-page", String(p.id));
              e.dataTransfer.setData("text/nn-pages", JSON.stringify(ids));
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
            onDrop={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const many = e.dataTransfer.getData("text/nn-pages");
              const ids: string[] = many ? JSON.parse(many) : [e.dataTransfer.getData("text/nn-page")].filter(Boolean);
              if (!ids.length) return;
              const isDescendant = (root: string, cand: string): boolean => {
                let cur: any = pages.find((x) => String(x.id) === String(cand));
                while (cur) {
                  if (String(cur.id) === String(root)) return true;
                  cur = pages.find((x) => String(x.id) === String(cur.parent_id));
                }
                return false;
              };
              for (const src of ids) {
                if (String(src) === String(p.id)) continue;
                if (isDescendant(src, p.id)) continue;
                await cctUpdate(NN.block, src, { parent_id: p.id });
              }
              setExpanded((s) => ({ ...s, [p.id]: true }));
              if (ids.length > 1) clearSelection();
              await loadAll();
            }}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey) { e.preventDefault(); toggleSelected(String(p.id)); return; }
              if (selected.size) clearSelection();
              nav(path(`/p/${p.id}`));
            }}
            onContextMenu={(e) => { e.preventDefault(); setCtx({ x: e.clientX, y: e.clientY, page: p }); }}
          >
            <span
              className={`nn-caret ${isOpen ? "open" : ""} ${hasChildren ? "has-children" : ""}`}
              onClick={(e) => { e.stopPropagation(); setExpanded((s) => ({ ...s, [p.id]: !s[p.id] })); }}
            >
              <ChevronRight size={12} />
            </span>
            <span className="nn-icon" onClick={(e) => { e.stopPropagation(); changeIcon(p.id, p.icon || ""); }} title="Change icon" style={{ cursor: "pointer" }}>{p.icon || <FileText size={15} strokeWidth={1.5} />}</span>
            <span className="nn-title">{p.title || "Untitled"}</span>
            <span className="nn-actions">
              <button onClick={(e) => { e.stopPropagation(); renamePage(p.id, p.title || ""); }} title="Rename">✎</button>
              <button onClick={(e) => { e.stopPropagation(); deletePage(p.id); }} title="Delete"><Trash2 size={14} /></button>
              <button onClick={(e) => { e.stopPropagation(); createPage(p.id); }} title="Add subpage"><Plus size={14} /></button>
            </span>
          </div>
          {isOpen && renderTree(p.id, depth + 1, nextSeen)}
          {dropLine(false)}
        </div>
      );
    });
  };

  const activeWorkspace = workspaces.find((w) => w.id === activeWs);

  return (
    <aside className="nn-sidebar">
      <div className="nn-sidebar-header" style={{ position: "relative" }}>
        <div className="nn-icon" style={{ fontSize: 18 }}>{activeWorkspace?.icon || "📓"}</div>
        <select
          value={activeWs || ""}
          onChange={async (e) => {
            const val = e.target.value;
            if (val === "__new__") {
              const name = await nnPrompt("", { title: "New workspace", placeholder: "Workspace name" });
              if (!name) return;
              const created = await cctCreate(NN.workspace, { name, icon: "📓", plan_type: "free" });
              setActiveWs(created.id);
              await loadAll();
              return;
            }
            setActiveWs(val);
          }}
          style={{ flex: 1, fontSize: 14, fontWeight: 600, background: "transparent", border: "none", color: "inherit", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", appearance: "none", padding: 0 }}
          title="Switch workspace"
        >
          {workspaces.length === 0 && (
            <option value="" disabled>{loading ? "Loading…" : loadErr ? "Workspace unavailable" : "No workspace"}</option>
          )}
          {workspaces.map((w) => (
            <option key={w.id} value={w.id}>{w.icon || "📓"} {w.name}</option>
          ))}
          <option value="__new__">＋ New workspace…</option>
        </select>
      </div>

      <div className="nn-sidebar-section">
        <div className="nn-sidebar-item" onClick={() => nav(path("/search"))}>
          <span className="nn-icon"><Search size={15} /></span>
          <span className="nn-title">Search</span>
          <span style={{ marginLeft: "auto", fontSize: 10, opacity: 0.5 }}>⌘K</span>
        </div>
        <div className="nn-sidebar-item" onClick={() => { const e = new KeyboardEvent("keydown", { key: "j", ctrlKey: true, metaKey: true }); window.dispatchEvent(e); }}>
          <span className="nn-icon">✨</span>
          <span className="nn-title">Ask AI</span>
          <span style={{ marginLeft: "auto", fontSize: 10, opacity: 0.5 }}>⌘J</span>
        </div>
        <div className="nn-sidebar-item" onClick={() => nav(path("/"))}>
          <span className="nn-icon">🏠</span>
          <span className="nn-title">Home</span>
        </div>
        <div className="nn-sidebar-item" onClick={() => nav(path("/settings"))}>
          <span className="nn-icon"><Settings size={15} /></span>
          <span className="nn-title">Settings</span>
        </div>
        <div className="nn-sidebar-item" onClick={() => nav(path("/templates"))}>
          <span className="nn-icon">🧩</span>
          <span className="nn-title">Templates</span>
        </div>
        <div className="nn-sidebar-item" onClick={() => nav(path("/notifications"))}>
          <span className="nn-icon" style={{ position: "relative" }}>
            <Bell size={15} />
            {unread > 0 && (
              <span style={{ position: "absolute", top: -4, right: -6, background: "var(--nn-danger)", color: "#fff", borderRadius: 8, fontSize: 9, padding: "1px 4px", lineHeight: 1 }}>
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </span>
          <span className="nn-title">Inbox</span>
        </div>
        <div className="nn-sidebar-item" onClick={() => nav(path("/trash"))}>
          <span className="nn-icon"><Trash size={15} /></span>
          <span className="nn-title">Trash</span>
        </div>
      </div>

      {(() => {
        const teamspaces = pages.filter((p) => String(p.parent_id) === String(activeWs) && (p as any).properties && (() => {
          try { const j = JSON.parse((p as any).properties); return j?._meta?.teamspace === true; } catch { return false; }
        })());
        const dragProps = (key: string) => ({
          draggable: true,
          onDragStart: (e: React.DragEvent) => { setDragSection(key); e.dataTransfer.effectAllowed = "move"; },
          onDragOver: (e: React.DragEvent) => { if (dragSection && dragSection !== key) e.preventDefault(); },
          onDrop: (e: React.DragEvent) => { e.preventDefault(); onSectionDrop(key); },
          onDragEnd: () => setDragSection(null),
          style: { cursor: "grab", opacity: dragSection === key ? 0.5 : 1 } as React.CSSProperties,
          title: "Drag to reorder section",
        });
        const sections: Record<string, React.ReactNode> = {
          favorites: favs.length > 0 ? (
            <div key="favorites" className="nn-sidebar-section">
              <div className="nn-sidebar-section-header" {...dragProps("favorites")} onClick={() => toggleSection("favorites")}>
                <span className={`nn-section-caret ${isSectionOpen("favorites") ? "open" : ""}`}><ChevronRight size={12} /></span>
                <span className="nn-section-label">Favorites</span>
              </div>
              {isSectionOpen("favorites") && favs.map((f) => {
                const p = pages.find((x) => String(x.id) === String(f.block_id));
                if (!p) return null;
                return (
                  <div
                    key={f.id}
                    className={`nn-sidebar-item ${pageId === p.id ? "active" : ""}`}
                    onClick={() => nav(path(`/p/${p.id}`))}
                    onContextMenu={(e) => { e.preventDefault(); setCtx({ x: e.clientX, y: e.clientY, page: p }); }}
                  >
                    <span className="nn-caret" style={{ opacity: 0 }} />
                    <span className="nn-icon">{p.icon || <Star size={14} />}</span>
                    <span className="nn-title">{p.title || "Untitled"}</span>
                  </div>
                );
              })}
            </div>
          ) : null,
          teamspaces: teamspaces.length > 0 ? (
            <div key="teamspaces" className="nn-sidebar-section">
              <div className="nn-sidebar-section-header" {...dragProps("teamspaces")} onClick={() => toggleSection("teamspaces")}>
                <span className={`nn-section-caret ${isSectionOpen("teamspaces") ? "open" : ""}`}><ChevronRight size={12} /></span>
                <span className="nn-section-label">Teamspaces</span>
              </div>
              {isSectionOpen("teamspaces") && teamspaces.map((p) => (
                <div key={p.id} className={`nn-sidebar-item ${pageId === p.id ? "active" : ""}`}
                  onClick={() => nav(path(`/p/${p.id}`))}
                  onContextMenu={(e) => { e.preventDefault(); setCtx({ x: e.clientX, y: e.clientY, page: p }); }}
                >
                  <span className="nn-caret" style={{ opacity: 0 }} />
                  <span className="nn-icon">{p.icon || "👥"}</span>
                  <span className="nn-title">{p.title || "Untitled"}</span>
                </div>
              ))}
            </div>
          ) : null,
          private: (
            <div key="private" className="nn-sidebar-section" style={{ flex: 1 }}>
              <div className="nn-sidebar-section-header" {...dragProps("private")}>
                <span
                  className={`nn-section-caret ${isSectionOpen("private") ? "open" : ""}`}
                  onClick={(e) => { e.stopPropagation(); toggleSection("private"); }}
                ><ChevronRight size={12} /></span>
                <span className="nn-section-label" onClick={() => toggleSection("private")}>Private</span>
                <button
                  className="nn-section-add"
                  onClick={(e) => { e.stopPropagation(); activeWs && createPage(activeWs); }}
                  title="New page"
                ><Plus size={14} /></button>
              </div>
              {isSectionOpen("private") && (loading ? (
                <div className="nn-sidebar-item" style={{ opacity: 0.5 }}>Loading…</div>
              ) : loadErr ? (
                <div className="nn-sidebar-item" style={{ display: "block", opacity: 0.75 }}>
                  <div style={{ fontSize: 12, color: "var(--nn-red, #e03e3e)" }}>{loadErr}</div>
                  <button onClick={() => loadAll()} className="nn-topbar-btn" style={{ marginTop: 4, fontSize: 11 }}>Retry</button>
                </div>
              ) : activeWs ? (
                renderTree(activeWs)
              ) : null)}
              {isSectionOpen("private") && activeWs && !loadErr && pages.filter((p) => String(p.parent_id) === String(activeWs)).length === 0 && !loading && (
                <div className="nn-sidebar-item" onClick={() => createPage(activeWs)}>
                  <span className="nn-icon"><Plus size={15} /></span>
                  <span className="nn-title">Add a page</span>
                </div>
              )}
            </div>
          ),
        };
        return <>{sectionOrder.map((k) => sections[k])}</>;
      })()}

      {selected.size > 0 && (
        <div style={{ margin: "8px", padding: "8px 10px", background: "var(--nn-bg-secondary)", border: "1px solid var(--nn-border-strong)", borderRadius: 6, display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
          <span style={{ flex: 1, color: "var(--nn-text)" }}>{selected.size} selected</span>
          <button
            onClick={async () => {
              const name = await nnPrompt("Move selected pages under which parent? Enter page ID (or leave blank for workspace root).", { title: "Bulk move", placeholder: "page id or blank" });
              if (name === null) return;
              const dest = name.trim() || activeWs;
              if (dest) await bulkMove(dest);
            }}
            style={{ background: "transparent", border: "1px solid var(--nn-border)", color: "var(--nn-text)", borderRadius: 3, padding: "2px 8px", cursor: "pointer", fontSize: 11 }}
            title="Move all selected under a parent page"
          >Move…</button>
          <button
            onClick={bulkDelete}
            style={{ background: "transparent", border: "1px solid var(--nn-border)", color: "var(--nn-danger)", borderRadius: 3, padding: "2px 8px", cursor: "pointer", fontSize: 11 }}
          >Trash</button>
          <button
            onClick={clearSelection}
            style={{ background: "transparent", border: "none", color: "var(--nn-text-secondary)", cursor: "pointer", fontSize: 14 }}
            title="Clear selection"
          >×</button>
        </div>
      )}



      <div style={{ padding: 8, borderTop: "1px solid var(--nn-border)", fontSize: 12, color: "var(--nn-text-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.user_email}</span>
        <button
          onClick={logout}
          style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex", padding: 4 }}
          title="Log out"
        ><LogOut size={14} /></button>
      </div>
      {ctx && (
        <NotchContextMenu
          x={ctx.x}
          y={ctx.y}
          items={buildCtxItems(ctx.page)}
          onClose={() => setCtx(null)}
        />
      )}
    </aside>
  );
}
