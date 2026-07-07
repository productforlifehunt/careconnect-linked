import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cctList, NN } from "@/notch/lib/nn-client";

export default function NotchSearch() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const nav = useNavigate();

  useEffect(() => {
    cctList<any>(NN.block).then((b) => setItems(b.filter((x: any) => (x.type === "page" || x.type === "database") && Number(x.archived) !== 1)));
  }, []);

  const results = useMemo(() => {
    if (!q.trim()) return items.slice(0, 30);
    const ql = q.toLowerCase();
    return items.filter((x) => (x.title || "").toLowerCase().includes(ql)).slice(0, 50);
  }, [q, items]);

  return (
    <div className="nn-page-scroll">
      <div className="nn-page">
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Search</div>
        <input
          autoFocus
          className="nn-auth-input"
          placeholder="Search pages…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ marginBottom: 20 }}
        />
        <div>
          {results.map((r) => (
            <div key={r.id} onClick={() => nav(`/notch/p/${r.id}`)} style={{ padding: 10, borderRadius: 4, cursor: "pointer", display: "flex", gap: 8 }} className="nn-sidebar-item">
              <span>{r.icon || "📄"}</span>
              <span>{r.title || "Untitled"}</span>
            </div>
          ))}
          {!results.length && <div style={{ color: "var(--nn-text-tertiary)" }}>No results</div>}
        </div>
      </div>
    </div>
  );
}
