import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowUp, FileText } from "lucide-react";
import { cctList, NN } from "@/notch/lib/nn-client";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import { supabase } from "@/integrations/supabase/client";

interface Block {
  id: string; title?: string; icon?: string; type?: string;
  archived?: number | string; properties?: string;
}
interface Props { onClose: () => void; }

/** Flatten a TipTap JSON doc into plain text (best-effort). */
function docToText(doc: any): string {
  if (!doc) return "";
  if (typeof doc === "string") return doc;
  if (Array.isArray(doc)) return doc.map(docToText).join(" ");
  let s = "";
  if (typeof doc.text === "string") s += doc.text;
  if (doc.content) s += " " + docToText(doc.content);
  return s;
}

interface Msg { role: "user" | "assistant"; content: string; sources?: Array<{ id: string; title: string }>; }

export function NotchAskAI({ onClose }: Props) {
  const nav = useNavigate();
  const path = useNotchPath();
  const [q, setQ] = useState("");
  const [pages, setPages] = useState<Array<Block & { text: string }>>([]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const all = await cctList<Block>(NN.block);
      if (!alive) return;
      const pgs = all.filter((b) => (b.type === "page" || b.type === "database") && Number(b.archived) !== 1)
        .map((b) => {
          let text = "";
          try { const p = b.properties ? JSON.parse(b.properties) : {}; text = docToText(p.editor_content); } catch {}
          return { ...b, text };
        });
      setPages(pgs);
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, busy]);

  const rank = (query: string, topK = 5) => {
    const tokens = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    if (tokens.length === 0) return [];
    return pages
      .map((p) => {
        const hay = ((p.title || "") + " " + p.text).toLowerCase();
        let score = 0;
        for (const t of tokens) {
          const idx = hay.indexOf(t);
          if (idx >= 0) score += 1 + (hay.split(t).length - 1) * 0.3;
        }
        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((x) => x.p);
  };

  const ask = async () => {
    const question = q.trim();
    if (!question || busy) return;
    setQ("");
    setErr("");
    setMsgs((m) => [...m, { role: "user", content: question }]);
    setBusy(true);
    try {
      const ctxPages = rank(question, 5);
      const ctxText = ctxPages.map((p, i) =>
        `[${i + 1}] ${p.title || "Untitled"}\n${(p.text || "").slice(0, 1200)}`
      ).join("\n\n---\n\n");
      const prompt = `You are answering a question using only the workspace notes below. Cite sources as [1], [2] where relevant. If the notes don't contain the answer, say so.\n\nNotes:\n${ctxText || "(no matching notes found)"}\n\nQuestion: ${question}\n\nAnswer:`;
      const { data, error } = await supabase.functions.invoke("notch-ai-assist", { body: { prompt } });
      if (error) throw error;
      const text = (data as any)?.text || "(no answer)";
      setMsgs((m) => [...m, {
        role: "assistant",
        content: text,
        sources: ctxPages.map((p) => ({ id: p.id, title: p.title || "Untitled" })),
      }]);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="nn-qf-backdrop" onClick={onClose}>
      <div className="nn-qf-modal" onClick={(e) => e.stopPropagation()} style={{ width: 640, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid var(--nn-border)" }}>
          <Sparkles size={16} color="var(--nn-blue)" />
          <div style={{ fontWeight: 600, fontSize: 14 }}>Ask AI</div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--nn-text-tertiary)" }}>Searches all your pages</div>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: "10px 14px", minHeight: 200 }}>
          {msgs.length === 0 && (
            <div style={{ color: "var(--nn-text-tertiary)", fontSize: 13, padding: "20px 0" }}>
              Ask anything about your workspace — summaries, action items, decisions, or open questions.
              <div style={{ marginTop: 12, fontSize: 12 }}>
                {["Summarize my recent notes", "What are the open tasks?", "Find pages about design"].map((s) => (
                  <div key={s} onClick={() => setQ(s)} style={{ padding: "6px 8px", margin: "4px 0", border: "1px solid var(--nn-border)", borderRadius: 4, cursor: "pointer" }}>💬 {s}</div>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} style={{ margin: "10px 0" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--nn-text-tertiary)", marginBottom: 4 }}>{m.role === "user" ? "You" : "AI"}</div>
              <div style={{ fontSize: 14, whiteSpace: "pre-wrap", color: "var(--nn-text)" }}>{m.content}</div>
              {m.sources && m.sources.length > 0 && (
                <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {m.sources.map((s, j) => (
                    <span key={s.id} onClick={() => { nav(path(`/p/${s.id}`)); onClose(); }}
                      style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, background: "var(--nn-bg-secondary)", border: "1px solid var(--nn-border)", borderRadius: 3, padding: "2px 6px", cursor: "pointer", color: "var(--nn-text-secondary)" }}>
                      <FileText size={10} /> [{j + 1}] {s.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {busy && <div style={{ fontSize: 13, color: "var(--nn-text-tertiary)", padding: "8px 0" }}>Thinking…</div>}
          {err && <div style={{ fontSize: 12, color: "var(--nn-red, #e03e3e)" }}>{err}</div>}
        </div>

        <div style={{ display: "flex", gap: 6, padding: 10, borderTop: "1px solid var(--nn-border)" }}>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }}
            placeholder="Ask a question about your workspace…"
            style={{ flex: 1, background: "var(--nn-bg-secondary)", border: "1px solid var(--nn-border)", borderRadius: 4, padding: "8px 10px", fontSize: 14, color: "var(--nn-text)", outline: "none" }}
          />
          <button onClick={ask} disabled={!q.trim() || busy} className="nn-btn-primary" style={{ padding: "0 12px", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <ArrowUp size={14} /> Ask
          </button>
        </div>
      </div>
    </div>
  );
}
