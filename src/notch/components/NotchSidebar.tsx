import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import { ChevronRight, Plus, MoreHorizontal, Search, Trash2, FileText, Settings, LogOut, Trash, Star, Bell } from "lucide-react";
import { cctList, cctCreate, cctUpdate, cctDelete, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";
import { useFavorites } from "@/notch/lib/nn-favorites";
import { unreadCount, tickReminderQueue } from "@/notch/lib/nn-notifications";

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
  const { favs } = useFavorites();
  const { pageId } = useParams<{ pageId: string }>();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWs, setActiveWs] = useState<string | null>(null);
  const [pages, setPages] = useState<Block[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

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
    } catch (e) {
      console.error("Sidebar load failed", e);
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
    if (!confirm("Delete this page? It will be moved to trash.")) return;
    await cctUpdate(NN.block, id, { archived: 1, in_trash: 1 });
    if (pageId === id) nav(path("/"));
    await loadAll();
  };

  const renderTree = (parentId: string, depth = 0, seen: Set<string> = new Set()) => {
    if (depth > 20 || seen.has(parentId)) return null; // cycle / depth guard
    const nextSeen = new Set(seen); nextSeen.add(parentId);
    const children = pages.filter((p) => String(p.parent_id) === String(parentId));
    if (!children.length) {
      if (depth === 0) return null;
      return (
        <div className="nn-sidebar-item" style={{ paddingLeft: 14 + depth * 16, opacity: 0.5 }}>
          <span className="nn-icon" />
          <span className="nn-title">No pages inside</span>
        </div>
      );
    }
    return children.map((p) => {
      const isOpen = !!expanded[p.id];
      const isActive = pageId === p.id;
      const hasChildren = pages.some((c) => String(c.parent_id) === String(p.id));
      return (
        <div key={p.id}>
          <div
            className={`nn-sidebar-item ${isActive ? "active" : ""}`}
            style={{ paddingLeft: 14 + depth * 12 }}
            draggable
            onDragStart={(e) => { e.dataTransfer.setData("text/nn-page", p.id); e.dataTransfer.effectAllowed = "move"; }}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
            onDrop={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const src = e.dataTransfer.getData("text/nn-page");
              if (!src || src === p.id) return;
              // prevent dropping onto own descendant
              let cur: any = pages.find((x) => x.id === p.id);
              while (cur) {
                if (String(cur.id) === String(src)) return;
                cur = pages.find((x) => String(x.id) === String(cur.parent_id));
              }
              await cctUpdate(NN.block, src, { parent_id: p.id });
              setExpanded((s) => ({ ...s, [p.id]: true }));
              await loadAll();
            }}
            onClick={() => nav(path(`/p/${p.id}`))}
          >
            <span
              className={`nn-caret ${isOpen ? "open" : ""}`}
              onClick={(e) => { e.stopPropagation(); setExpanded((s) => ({ ...s, [p.id]: !s[p.id] })); }}
              style={{ opacity: hasChildren ? 1 : undefined }}
            >
              <ChevronRight size={12} />
            </span>
            <span className="nn-icon">{p.icon || <FileText size={15} strokeWidth={1.5} />}</span>
            <span className="nn-title">{p.title || "Untitled"}</span>
            <span className="nn-actions">
              <button onClick={(e) => { e.stopPropagation(); deletePage(p.id); }} title="Delete"><Trash2 size={14} /></button>
              <button onClick={(e) => { e.stopPropagation(); createPage(p.id); }} title="Add subpage"><Plus size={14} /></button>
            </span>
          </div>
          {isOpen && renderTree(p.id, depth + 1, nextSeen)}
        </div>
      );
    });
  };

  const activeWorkspace = workspaces.find((w) => w.id === activeWs);

  return (
    <aside className="nn-sidebar">
      <div className="nn-sidebar-header">
        <div className="nn-icon" style={{ fontSize: 18 }}>{activeWorkspace?.icon || "📓"}</div>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {activeWorkspace?.name || "Notch Note"}
        </div>
      </div>

      <div className="nn-sidebar-section">
        <div className="nn-sidebar-item" onClick={() => nav(path("/search"))}>
          <span className="nn-icon"><Search size={15} /></span>
          <span className="nn-title">Search</span>
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
              <span style={{ position: "absolute", top: -4, right: -6, background: "#e03e3e", color: "#fff", borderRadius: 8, fontSize: 9, padding: "1px 4px", lineHeight: 1 }}>
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

      {favs.length > 0 && (
        <div className="nn-sidebar-section">
          <div className="nn-sidebar-section-label">Favorites</div>
          {favs.map((f) => {
            const p = pages.find((x) => String(x.id) === String(f.block_id));
            if (!p) return null;
            return (
              <div
                key={f.id}
                className={`nn-sidebar-item ${pageId === p.id ? "active" : ""}`}
                onClick={() => nav(path(`/p/${p.id}`))}
              >
                <span className="nn-caret" style={{ opacity: 0 }} />
                <span className="nn-icon">{p.icon || <Star size={14} />}</span>
                <span className="nn-title">{p.title || "Untitled"}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="nn-sidebar-section" style={{ flex: 1 }}>
        <div className="nn-sidebar-section-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Private</span>
          <button
            onClick={() => activeWs && createPage(activeWs)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 2, display: "flex" }}
            title="New page"
          ><Plus size={14} /></button>
        </div>
        {loading ? (
          <div className="nn-sidebar-item" style={{ opacity: 0.5 }}>Loading…</div>
        ) : activeWs ? (
          renderTree(activeWs)
        ) : null}
        {activeWs && pages.filter((p) => String(p.parent_id) === String(activeWs)).length === 0 && !loading && (
          <div className="nn-sidebar-item" onClick={() => createPage(activeWs)}>
            <span className="nn-icon"><Plus size={15} /></span>
            <span className="nn-title">Add a page</span>
          </div>
        )}
      </div>

      <div style={{ padding: 8, borderTop: "1px solid var(--nn-border)", fontSize: 12, color: "var(--nn-text-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.user_email}</span>
        <button
          onClick={logout}
          style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", display: "flex", padding: 4 }}
          title="Log out"
        ><LogOut size={14} /></button>
      </div>
    </aside>
  );
}
