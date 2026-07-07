/**
 * Custom TipTap nodes for Notch Note: Math (KaTeX) + Columns layout.
 */
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

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
  content: "column{2,4}",
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
