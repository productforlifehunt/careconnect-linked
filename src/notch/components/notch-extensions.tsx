/**
 * Custom TipTap nodes for Notch Note: Math, Columns, Sync, Callout, Audio, PDF, TOC, Breadcrumb, TemplateButton, InlineMath.
 */
import { Node, Mark, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { useEffect, useState, useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { cctGet, NN } from "@/notch/lib/nn-client";
import { Link2, RefreshCw, Info, FileText, Music, ChevronRight, Play } from "lucide-react";


/* ─── Math Block ─────────────────────────────────────────────── */
function MathView({ node, updateAttributes, editor }: any) {
  const [editing, setEditing] = useState(!node.attrs.latex);
  const [val, setVal] = useState(node.attrs.latex || "");
  const html = (() => {
    try {
      return katex.renderToString(node.attrs.latex || "", { throwOnError: false, displayMode: true });
    } catch {
      return `<span style="color:#e03e3e">Invalid LaTeX</span>`;
    }
  })();
  return (
    <NodeViewWrapper as="div" className="nn-math" contentEditable={false}>
      {editing ? (
        <div style={{ display: "flex", gap: 6 }}>
          <input
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { updateAttributes({ latex: val }); setEditing(false); editor.commands.focus(); }
              if (e.key === "Escape") { setEditing(false); }
            }}
            placeholder="\\int_0^1 x^2 dx"
            style={{ flex: 1, background: "var(--nn-bg-secondary)", border: "1px solid var(--nn-border-strong)", borderRadius: 4, padding: "6px 8px", fontFamily: "monospace", fontSize: 13, color: "var(--nn-text)" }}
          />
          <button onClick={() => { updateAttributes({ latex: val }); setEditing(false); }} className="nn-btn-primary" style={{ fontSize: 12 }}>OK</button>
        </div>
      ) : (
        <div onClick={() => { setVal(node.attrs.latex || ""); setEditing(true); }} style={{ cursor: "pointer", padding: 8, borderRadius: 4 }} dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </NodeViewWrapper>
  );
}

export const MathBlock = Node.create({
  name: "mathBlock",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() { return { latex: { default: "" } }; },
  parseHTML() { return [{ tag: "div[data-math]", getAttrs: (el) => ({ latex: (el as HTMLElement).getAttribute("data-math") || "" }) }]; },
  renderHTML({ HTMLAttributes, node }) {
    return ["div", mergeAttributes({ "data-math": node.attrs.latex, class: "nn-math" }, HTMLAttributes)];
  },
  addNodeView() { return ReactNodeViewRenderer(MathView); },
});

/* ─── Columns Layout ─────────────────────────────────────────── */
export const Columns = Node.create({
  name: "columns",
  group: "block",
  content: "column{2,5}",
  isolating: true,
  parseHTML() { return [{ tag: "div.nn-columns" }]; },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes({ class: "nn-columns" }, HTMLAttributes), 0];
  },
});


function ColumnView() {
  return (
    <NodeViewWrapper as="div" className="nn-col">
      <NodeViewContent />
    </NodeViewWrapper>
  );
}

export const Column = Node.create({
  name: "column",
  group: "column",
  content: "block+",
  isolating: true,
  parseHTML() { return [{ tag: "div.nn-col" }]; },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes({ class: "nn-col" }, HTMLAttributes), 0];
  },
  addNodeView() { return ReactNodeViewRenderer(ColumnView); },
});

/** Build a fresh columns JSON with N empty columns. */
export function buildColumns(count: number) {
  return {
    type: "columns",
    content: Array.from({ length: count }, () => ({
      type: "column",
      content: [{ type: "paragraph" }],
    })),
  };
}

/* ─── Sync Block ─────────────────────────────────────────────── */
/** Renders a read-only mirror of another page's editor_content. */
function SyncView({ node, updateAttributes }: any) {
  const sourceId: string = node.attrs.sourceId || "";
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [err, setErr] = useState<string>("");

  const load = async () => {
    if (!sourceId) return;
    setLoading(true); setErr("");
    try {
      const src: any = await cctGet(NN.block, sourceId);
      if (!src) { setErr("Source not found"); return; }
      setTitle(src.title || "Untitled");
      const props = src.properties ? JSON.parse(src.properties) : {};
      const c = props.editor_content;
      // Very light JSON→HTML: rely on browser to render text nodes recursively.
      const toHtml = (n: any): string => {
        if (!n) return "";
        if (typeof n === "string") return n;
        if (Array.isArray(n)) return n.map(toHtml).join("");
        const kids = (n.content || []).map(toHtml).join("");
        if (n.type === "text") return n.text || "";
        if (n.type === "paragraph") return `<p>${kids}</p>`;
        if (n.type === "heading") return `<h${n.attrs?.level || 2}>${kids}</h${n.attrs?.level || 2}>`;
        if (n.type === "bulletList") return `<ul>${kids}</ul>`;
        if (n.type === "orderedList") return `<ol>${kids}</ol>`;
        if (n.type === "listItem") return `<li>${kids}</li>`;
        if (n.type === "blockquote") return `<blockquote>${kids}</blockquote>`;
        if (n.type === "codeBlock") return `<pre><code>${kids}</code></pre>`;
        if (n.type === "hardBreak") return "<br/>";
        return kids ? `<div>${kids}</div>` : "";
      };
      setHtml(toHtml(c));
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [sourceId]);

  if (!sourceId) {
    return (
      <NodeViewWrapper as="div" className="nn-sync-empty" contentEditable={false}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Link2 size={14} />
          <input
            placeholder="Paste source page ID"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const v = (e.target as HTMLInputElement).value.trim();
                if (v) updateAttributes({ sourceId: v });
              }
            }}
            style={{ flex: 1, background: "var(--nn-bg-secondary)", border: "1px solid var(--nn-border-strong)", borderRadius: 4, padding: "4px 8px", color: "var(--nn-text)", fontSize: 13 }}
          />
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as="div" className="nn-sync" contentEditable={false}>
      <div className="nn-sync-header">
        <Link2 size={12} />
        <span className="nn-sync-title">{title || "Synced block"}</span>
        <button onClick={load} title="Refresh" className="nn-sync-refresh"><RefreshCw size={12} /></button>
      </div>
      {loading ? (
        <div style={{ padding: 8, opacity: 0.5, fontSize: 13 }}>Loading…</div>
      ) : err ? (
        <div style={{ padding: 8, color: "var(--nn-danger)", fontSize: 13 }}>{err}</div>
      ) : (
        <div className="nn-sync-body" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </NodeViewWrapper>
  );
}

export const SyncBlock = Node.create({
  name: "syncBlock",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() { return { sourceId: { default: "" } }; },
  parseHTML() { return [{ tag: "div[data-sync-source]", getAttrs: (el) => ({ sourceId: (el as HTMLElement).getAttribute("data-sync-source") || "" }) }]; },
  renderHTML({ HTMLAttributes, node }) {
    return ["div", mergeAttributes({ "data-sync-source": node.attrs.sourceId, class: "nn-sync" }, HTMLAttributes)];
  },
  addNodeView() { return ReactNodeViewRenderer(SyncView); },
});
