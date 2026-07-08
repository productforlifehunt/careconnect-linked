import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import { cctList, NN } from "@/notch/lib/nn-client";
import { Search as SearchIcon, FileText, Database } from "lucide-react";

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

/** Cheap Levenshtein — cap at ceil(len/3) to bail early. */
function levenshtein(a: string, b: string, cap: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  const m = a.length, n = b.length;
  let prev = new Array(n + 1).fill(0);
  let cur = new Array(n + 1).fill(0);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    cur[0] = i; let minRow = cur[0];
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      if (cur[j] < minRow) minRow = cur[j];
    }
    if (minRow > cap) return cap + 1;
    [prev, cur] = [cur, prev];
  }
  return prev[n];
}

/** Score a haystack against tokens. Combines substring + fuzzy. */
function fuzzyScore(hay: string, tokens: string[]): { score: number; hitIdx: number } {
  if (!tokens.length) return { score: 0, hitIdx: -1 };
  const hayL = hay.toLowerCase();
  let total = 0; let hitIdx = -1;
  for (const t of tokens) {
    const tl = t.toLowerCase();
    if (!tl) continue;
    const idx = hayL.indexOf(tl);
    if (idx >= 0) {
      total += 10 + (idx === 0 ? 5 : 0);
      if (hitIdx < 0) hitIdx = idx;
      continue;
    }
    // Fuzzy: check each word in the haystack (cap distance = ceil(len/3))
    if (tl.length < 3) continue;
    const cap = Math.max(1, Math.floor(tl.length / 3));
    let best = cap + 1;
    for (const w of hayL.split(/[^a-z0-9]+/)) {
      if (!w) continue;
      if (Math.abs(w.length - tl.length) > cap) continue;
      const d = levenshtein(w, tl, cap);
      if (d < best) best = d;
      if (best === 0) break;
    }
    if (best <= cap) total += Math.max(1, 6 - best);
  }
  return { score: total, hitIdx };
}

function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  if (!tokens.length || !text) return <>{text}</>;
  const re = new RegExp(`(${tokens.filter(Boolean).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "ig");
  const parts = text.split(re);
  return <>{parts.map((p, i) => re.test(p) ? <mark key={i} style={{ background: "rgba(35,131,226,0.18)", color: "inherit", padding: 0 }}>{p}</mark> : <span key={i}>{p}</span>)}</>;
}

export default function NotchSearch() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(0);
  const [scope, setScope] = useState<"all" | "page" | "database">("all");
  const nav = useNavigate();
  const path = useNotchPath();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    cctList<any>(NN.block)
      .then((b) => setItems(b.filter((x: any) => (x.type === "page" || x.type === "database") && Number(x.archived) !== 1)))
      .finally(() => setLoading(false));
  }, []);

  const tokens = useMemo(() => q.trim().split(/\s+/).filter(Boolean), [q]);

  const results = useMemo(() => {
    const scoped = scope === "all" ? items : items.filter((x) => x.type === scope);
    if (!tokens.length) {
      return scoped
        .sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())
        .slice(0, 30)
        .map((r) => ({ row: r, snippet: "" }));
    }
    const scored: { row: any; snippet: string; score: number }[] = [];
    for (const x of scoped) {
      const title = x.title || "";
      const body = pageContentText(x);
      const t = fuzzyScore(title, tokens);
      const b = fuzzyScore(body, tokens);
      const score = t.score * 3 + b.score;
      if (score === 0) continue;
      let snippet = "";
      if (b.hitIdx >= 0) {
        const start = Math.max(0, b.hitIdx - 40);
        const end = Math.min(body.length, b.hitIdx + 100);
        snippet = (start > 0 ? "…" : "") + body.slice(start, end).trim() + (end < body.length ? "…" : "");
      }
      scored.push({ row: x, snippet, score });
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, 50);
  }, [tokens, items, scope]);

  useEffect(() => { setSel(0); }, [q, scope]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
      else if (e.key === "Enter") {
        const r = results[sel];
        if (r) nav(path(`/p/${r.row.id}`));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [results, sel, nav, path]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLDivElement>(`[data-idx="${sel}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  return (
    <div className="nn-page-scroll">
      <div className="nn-page">
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Search</div>
        <div style={{ color: "var(--nn-text-tertiary)", fontSize: 13, marginBottom: 16 }}>Search titles and content across your workspace. Fuzzy matching handles small typos.</div>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <SearchIcon size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--nn-text-tertiary)" }} />
          <input
            autoFocus
            className="nn-auth-input"
            placeholder="Search anything…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ marginBottom: 0, paddingLeft: 36 }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14, fontSize: 12 }}>
          {(["all", "page", "database"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setScope(k)}
              className="nn-topbar-btn"
              style={{ padding: "4px 10px", background: scope === k ? "var(--nn-blue-bg)" : "transparent", color: scope === k ? "var(--nn-blue)" : "var(--nn-text-secondary)" }}
            >
              {k === "all" ? "All" : k === "page" ? "Pages" : "Databases"}
            </button>
          ))}
          <div style={{ marginLeft: "auto", color: "var(--nn-text-tertiary)", fontSize: 11, alignSelf: "center" }}>
            {loading ? "Loading…" : `${results.length} result${results.length === 1 ? "" : "s"}`}
          </div>
        </div>
        <div ref={listRef}>
          {results.map(({ row: r, snippet }, i) => (
            <div
              key={r.id}
              data-idx={i}
              onClick={() => nav(path(`/p/${r.id}`))}
              onMouseEnter={() => setSel(i)}
              className="nn-sidebar-item"
              style={{ padding: "12px 14px", borderRadius: 6, cursor: "pointer", display: "flex", gap: 12, flexDirection: "column", background: sel === i ? "var(--nn-bg-hover)" : "transparent", marginBottom: 2 }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>
                  {r.icon || (r.type === "database" ? <Database size={15} /> : <FileText size={15} />)}
                </span>
                <span style={{ fontWeight: 500, flex: 1 }}>
                  <Highlight text={r.title || "Untitled"} tokens={tokens} />
                </span>
                {r.updated_at && <span style={{ fontSize: 11, color: "var(--nn-text-tertiary)" }}>{new Date(r.updated_at).toLocaleDateString()}</span>}
              </div>
              {snippet && (
                <div style={{ fontSize: 12, color: "var(--nn-text-secondary)", marginLeft: 30, lineHeight: 1.5 }}>
                  <Highlight text={snippet} tokens={tokens} />
                </div>
              )}
            </div>
          ))}
          {!loading && !results.length && q.trim() && (
            <div style={{ color: "var(--nn-text-tertiary)", padding: "24px 0", textAlign: "center" }}>
              No results for "{q}". Try a shorter query or different keywords.
            </div>
          )}
          {!loading && !results.length && !q.trim() && (
            <div style={{ color: "var(--nn-text-tertiary)", padding: "24px 0", textAlign: "center" }}>Start typing to search.</div>
          )}
        </div>
      </div>
    </div>
  );
}
