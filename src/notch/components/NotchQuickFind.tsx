import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Database, Home, Settings, Trash2, Search } from "lucide-react";
import { cctList, NN } from "@/notch/lib/nn-client";
import { useNotchPath } from "@/notch/context/NotchBaseContext";

interface Block { id: string; title?: string; icon?: string; type?: string; archived?: string | number; }
interface Props { onClose: () => void; }

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

  const results = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const pageMatches = pages.filter((p) => !ql || (p.title || "").toLowerCase().includes(ql)).slice(0, 20).map((p) => ({
      key: "p:" + p.id,
      label: p.title || "Untitled",
      icon: p.icon ? <span>{p.icon}</span> : (p.type === "database" ? <Database size={14} /> : <FileText size={14} />),
      go: () => nav(path(`/p/${p.id}`)),
    }));
    const s = ql ? staticItems.filter((i) => i.label.toLowerCase().includes(ql)) : staticItems;
    return [...pageMatches, ...s];
  }, [q, pages, staticItems, nav, path]);

  useEffect(() => { setSel(0); }, [q]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
      else if (e.key === "Enter") {
        const r = results[sel];
        if (r) { r.go(); onClose(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [results, sel, onClose]);

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
          {results.length === 0 && <div className="nn-qf-empty">No results</div>}
          {results.map((r, i) => (
            <div
              key={r.key}
              className={`nn-qf-item ${i === sel ? "selected" : ""}`}
              onMouseEnter={() => setSel(i)}
              onClick={() => { r.go(); onClose(); }}
            >
              <span style={{ width: 18, display: "inline-flex", justifyContent: "center", color: "var(--nn-text-secondary)" }}>{r.icon}</span>
              <span>{r.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
