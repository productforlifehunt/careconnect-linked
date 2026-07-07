import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronRight, Plus, MoreHorizontal, Search, Trash2, FileText, Settings, LogOut, Trash, Star } from "lucide-react";
import { cctList, cctCreate, cctUpdate, cctDelete, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";
import { useFavorites } from "@/notch/lib/nn-favorites";

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
  const location = useLocation();
  const { user, logout } = useNotchAuth();
  const { favs } = useFavorites();
  const { pageId } = useParams<{ pageId: string }>();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWs, setActiveWs] = useState<string | null>(null);
  const [pages, setPages] = useState<Block[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

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
    nav(`/notch/p/${id}`);
  };

  const deletePage = async (id: string) => {
    if (!confirm("Delete this page? It will be moved to trash.")) return;
    await cctUpdate(NN.block, id, { archived: 1, in_trash: 1 });
    if (pageId === id) nav("/notch");
    await loadAll();
  };

  const renderTree = (parentId: string, depth = 0) => {
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
            onClick={() => nav(`/notch/p/${p.id}`)}
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
          {isOpen && renderTree(p.id, depth + 1)}
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
        <div className="nn-sidebar-item" onClick={() => nav("/notch/search")}>
          <span className="nn-icon"><Search size={15} /></span>
          <span className="nn-title">Search</span>
        </div>
        <div className="nn-sidebar-item" onClick={() => nav("/notch")}>
          <span className="nn-icon">🏠</span>
          <span className="nn-title">Home</span>
        </div>
        <div className="nn-sidebar-item" onClick={() => nav("/notch/settings")}>
          <span className="nn-icon"><Settings size={15} /></span>
          <span className="nn-title">Settings</span>
        </div>
        <div className="nn-sidebar-item" onClick={() => nav("/notch/trash")}>
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
                onClick={() => nav(`/notch/p/${p.id}`)}
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
