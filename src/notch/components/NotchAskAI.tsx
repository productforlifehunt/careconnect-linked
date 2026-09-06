import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowUp, FileText } from "lucide-react";
import { cctList, NN } from "@/notch/lib/nn-client";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import { supabase } from "@/integrations/supabase/client";
import { buildWorkspaceNotesRequest } from "../../../supabase/functions/_shared/ai-prompts";

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

  // Chunk-level retrieval: split each page's text into ~600-char passages,
  // score each passage independently, and return the top matches.
  // This dramatically improves recall for long pages vs. the previous
  // whole-page ranking.
  const rank = (query: string, topK = 6) => {
    const tokens = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    if (tokens.length === 0) return [] as Array<{ p: Block & { text: string }; passage: string; score: number }>;
    const CHUNK = 600, OVERLAP = 100;
    const scored: Array<{ p: Block & { text: string }; passage: string; score: number }> = [];
    for (const p of pages) {
      const hay0 = ((p.title || "") + "\n" + p.text).replace(/\s+/g, " ");
      if (!hay0.trim()) continue;
      for (let i = 0; i < hay0.length; i += CHUNK - OVERLAP) {
        const passage = hay0.slice(i, i + CHUNK);
        const hay = passage.toLowerCase();
        let score = 0, matched = 0;
        for (const t of tokens) {
          const c = hay.split(t).length - 1;
          if (c > 0) { score += 1 + c * 0.3; matched++; }
        }
        // Title bonus for the first chunk.
        if (i === 0 && p.title) {
          const titleLower = p.title.toLowerCase();
          for (const t of tokens) if (titleLower.includes(t)) score += 1.5;
        }
        // Require at least half the query tokens to hit — reduces noise.
        if (matched >= Math.max(1, Math.ceil(tokens.length * 0.5))) scored.push({ p, passage, score });
      }
    }
    scored.sort((a, b) => b.score - a.score);
    // Dedupe by page id — keep the best passage per page.
    const seen = new Set<string>();
    const out: typeof scored = [];
    for (const s of scored) {
      if (seen.has(s.p.id)) continue;
      seen.add(s.p.id);
      out.push(s);
      if (out.length >= topK) break;
    }
    return out;
  };

  const ask = async () => {
    const question = q.trim();
    if (!question || busy) return;
    setQ("");
    setErr("");
    setMsgs((m) => [...m, { role: "user", content: question }]);
    setBusy(true);
    try {
      const hits = rank(question, 6);
      const ctxText = hits.map((h, i) =>
        `[${i + 1}] ${h.p.title || "Untitled"}\n${h.passage.slice(0, 1200)}`
      ).join("\n\n---\n\n");
      const prompt = buildWorkspaceNotesRequest(question, ctxText);
      const { data, error } = await supabase.functions.invoke("notch-ai-assist", { body: { prompt } });
      if (error) throw error;
      const text = (data as any)?.text || "(no answer)";
      setMsgs((m) => [...m, {
        role: "assistant",
        content: text,
        sources: hits.map((h) => ({ id: h.p.id, title: h.p.title || "Untitled" })),
      }]);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  };

  // Render assistant text with [N] tokens turned into clickable superscript
  // links that navigate to the cited page.
  const renderAnswer = (m: Msg) => {
    if (!m.sources || m.sources.length === 0) return m.content;
    const parts = m.content.split(/(\[\d+\])/g);
    return parts.map((part, i) => {
      const mMatch = /^\[(\d+)\]$/.exec(part);
      if (!mMatch) return <span key={i}>{part}</span>;
      const n = Number(mMatch[1]);
      const src = m.sources?.[n - 1];
      if (!src) return <span key={i}>{part}</span>;
      return (
        <sup key={i} onClick={() => { nav(path(`/p/${src.id}`)); onClose(); }}
          style={{ color: "var(--nn-blue)", cursor: "pointer", fontWeight: 600, fontSize: 10, margin: "0 2px", padding: "1px 4px", border: "1px solid var(--nn-blue)", borderRadius: 3, verticalAlign: "super", lineHeight: 1 }}
          title={src.title}>
          {n}
        </sup>
      );
    });
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
              <div style={{ fontSize: 14, whiteSpace: "pre-wrap", color: "var(--nn-text)" }}>
                {m.role === "assistant" ? renderAnswer(m) : m.content}
              </div>
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
