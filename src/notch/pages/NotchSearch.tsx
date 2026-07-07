import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import { cctList, NN } from "@/notch/lib/nn-client";

/** Extract plain text from a TipTap JSON document tree. */
function extractText(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  let out = "";
  if (typeof node.text === "string") out += node.text + " ";
  if (Array.isArray(node.content)) {
    for (const c of node.content) out += extractText(c);
  }
  return out;
}

function pageContentText(b: any): string {
  try {
    const p = b.properties ? JSON.parse(b.properties) : {};
    if (p.editor_content) return extractText(p.editor_content);
  } catch { /* noop */ }
  return "";
}

export default function NotchSearch() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const nav = useNavigate();
  const path = useNotchPath();

  useEffect(() => {
    cctList<any>(NN.block).then((b) => setItems(b.filter((x: any) => (x.type === "page" || x.type === "database") && Number(x.archived) !== 1)));
  }, []);

  const results = useMemo(() => {
    if (!q.trim()) return items.slice(0, 30).map((r) => ({ row: r, snippet: "" }));
    const ql = q.toLowerCase();
    const scored: { row: any; snippet: string; score: number }[] = [];
    for (const x of items) {
      const title = (x.title || "").toLowerCase();
      const body = pageContentText(x);
      const bodyL = body.toLowerCase();
      let score = 0;
      if (title.includes(ql)) score += 10;
      if (bodyL.includes(ql)) score += 3;
      if (score === 0) continue;
      let snippet = "";
      const idx = bodyL.indexOf(ql);
      if (idx >= 0) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(body.length, idx + ql.length + 60);
        snippet = (start > 0 ? "…" : "") + body.slice(start, end).trim() + (end < body.length ? "…" : "");
      }
      scored.push({ row: x, snippet, score });
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, 50);
  }, [q, items]);

  return (
    <div className="nn-page-scroll">
      <div className="nn-page">
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Search</div>
        <input
          autoFocus
          className="nn-auth-input"
          placeholder="Search page titles and content…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ marginBottom: 20 }}
        />
        <div>
          {results.map(({ row: r, snippet }) => (
            <div key={r.id} onClick={() => nav(path(`/p/${r.id}`))} style={{ padding: "10px 12px", borderRadius: 4, cursor: "pointer", display: "flex", gap: 8, flexDirection: "column" }} className="nn-sidebar-item">
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span>{r.icon || "📄"}</span>
                <span style={{ fontWeight: 500 }}>{r.title || "Untitled"}</span>
              </div>
              {snippet && <div style={{ fontSize: 12, color: "var(--nn-text-tertiary)", marginLeft: 22 }}>{snippet}</div>}
            </div>
          ))}
          {!results.length && <div style={{ color: "var(--nn-text-tertiary)" }}>No results</div>}
        </div>
      </div>
    </div>
  );
}
