import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Database, Home, Settings, Trash2, Search, Clock } from "lucide-react";
import { cctList, NN } from "@/notch/lib/nn-client";
import { useNotchPath } from "@/notch/context/NotchBaseContext";

interface Block { id: string; title?: string; icon?: string; type?: string; archived?: string | number; updated_at?: string; }
interface Props { onClose: () => void; }

const RECENT_KEY = "nn_qf_recent";
function getRecentIds(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}
function pushRecent(id: string) {
  const cur = getRecentIds().filter((x) => x !== id);
  cur.unshift(id);
  localStorage.setItem(RECENT_KEY, JSON.stringify(cur.slice(0, 10)));
}

export function NotchQuickFind({ onClose }: Props) {
  const nav = useNavigate();
  const path = useNotchPath();
  const [q, setQ] = useState("");
  const [pages, setPages] = useState<Block[]>([]);
  const [sel, setSel] = useState(0);

  useEffect(() => {
    let alive = true;
    cctList<Block>(NN.block).then((all) => {
      if (!alive) return;
      setPages(all.filter((b) => (b.type === "page" || b.type === "database") && Number(b.archived) !== 1));
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const staticItems = useMemo(() => [
    { key: "home", label: "Home", icon: <Home size={14} />, go: () => nav(path("/")) },
    { key: "search", label: "Search pages", icon: <Search size={14} />, go: () => nav(path("/search")) },
    { key: "templates", label: "Templates", icon: <FileText size={14} />, go: () => nav(path("/templates")) },
    { key: "trash", label: "Trash", icon: <Trash2 size={14} />, go: () => nav(path("/trash")) },
    { key: "settings", label: "Settings", icon: <Settings size={14} />, go: () => nav(path("/settings")) },
  ], [nav, path]);

  const groups = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const iconFor = (p: Block) => p.icon ? <span>{p.icon}</span> : (p.type === "database" ? <Database size={14} /> : <FileText size={14} />);
    const mkPage = (p: Block) => ({
      key: "p:" + p.id, label: p.title || "Untitled", icon: iconFor(p),
      go: () => { pushRecent(p.id); nav(path(`/p/${p.id}`)); },
    });
    if (!ql) {
      const recentIds = getRecentIds();
      const byId = new Map(pages.map((p) => [p.id, p]));
      const recent = recentIds.map((id) => byId.get(id)).filter(Boolean).slice(0, 5).map((p) => mkPage(p as Block));
      return [
        ...(recent.length ? [{ heading: "Recent", items: recent }] : []),
        { heading: "Jump to", items: staticItems },
      ];
    }
    const pageMatches = pages.filter((p) => (p.title || "").toLowerCase().includes(ql)).slice(0, 20).map(mkPage);
    const s = staticItems.filter((i) => i.label.toLowerCase().includes(ql));
    return [
      ...(pageMatches.length ? [{ heading: "Pages", items: pageMatches }] : []),
      ...(s.length ? [{ heading: "Jump to", items: s }] : []),
    ];
  }, [q, pages, staticItems, nav, path]);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, flat.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
      else if (e.key === "Enter") {
        const r = flat[sel];
        if (r) { r.go(); onClose(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flat, sel, onClose]);

  let idx = -1;
  return (
    <div className="nn-qf-backdrop" onClick={onClose}>
      <div className="nn-qf-modal" onClick={(e) => e.stopPropagation()}>
        <input
          className="nn-qf-input"
          placeholder="Search pages, jump to..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
        />
        <div className="nn-qf-results">
          {flat.length === 0 && <div className="nn-qf-empty">No results</div>}
          {groups.map((g) => (
            <div key={g.heading}>
              <div style={{ padding: "6px 12px 2px", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4, color: "var(--nn-text-tertiary)", display: "flex", alignItems: "center", gap: 6 }}>
                {g.heading === "Recent" && <Clock size={11} />} {g.heading}
              </div>
              {g.items.map((r) => {
                idx += 1;
                const i = idx;
                return (
                  <div
                    key={r.key}
                    className={`nn-qf-item ${i === sel ? "selected" : ""}`}
                    onMouseEnter={() => setSel(i)}
                    onClick={() => { r.go(); onClose(); }}
                  >
                    <span style={{ width: 18, display: "inline-flex", justifyContent: "center", color: "var(--nn-text-secondary)" }}>{r.icon}</span>
                    <span>{r.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
