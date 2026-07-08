/**
 * Custom TipTap nodes for Notch Note: Math, Columns, Sync, Callout, Audio, PDF, TOC, Breadcrumb, TemplateButton, InlineMath.
 */
import { Node, Mark, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { useEffect, useState, useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { cctGet, cctList, cctCreate, NN } from "@/notch/lib/nn-client";
import { Link2, RefreshCw, Info, FileText, Music, ChevronRight, Play, Database as DatabaseIcon, Plus } from "lucide-react";
import { NotchDatabase } from "@/notch/components/NotchDatabase";
import { useNavigate } from "react-router-dom";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";


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
      // Full JSON→HTML converter: mirrors all nodes the NotionEditor produces.
      const esc = (s: string) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
      const applyMarks = (text: string, marks: any[]): string => {
        if (!marks || !marks.length) return esc(text);
        let out = esc(text);
        for (const m of marks) {
          if (m.type === "bold") out = `<strong>${out}</strong>`;
          else if (m.type === "italic") out = `<em>${out}</em>`;
          else if (m.type === "underline") out = `<u>${out}</u>`;
          else if (m.type === "strike") out = `<s>${out}</s>`;
          else if (m.type === "code") out = `<code>${out}</code>`;
          else if (m.type === "highlight") out = `<mark>${out}</mark>`;
          else if (m.type === "link") out = `<a href="${esc(m.attrs?.href || "#")}" target="_blank" rel="noreferrer">${out}</a>`;
          else if (m.type === "textStyle" && m.attrs?.color) out = `<span style="color:${esc(m.attrs.color)}">${out}</span>`;
        }
        return out;
      };
      const toHtml = (n: any): string => {
        if (!n) return "";
        if (Array.isArray(n)) return n.map(toHtml).join("");
        if (n.type === "text") return applyMarks(n.text || "", n.marks || []);
        const kids = (n.content || []).map(toHtml).join("");
        const a = n.attrs || {};
        switch (n.type) {
          case "doc": return kids;
          case "paragraph": return `<p>${kids || "<br/>"}</p>`;
          case "heading": return `<h${a.level || 2}>${kids}</h${a.level || 2}>`;
          case "bulletList": return `<ul>${kids}</ul>`;
          case "orderedList": return `<ol${a.start ? ` start="${a.start}"` : ""}>${kids}</ol>`;
          case "listItem": return `<li>${kids}</li>`;
          case "taskList": return `<ul class="nn-tasks" style="list-style:none;padding-left:0">${kids}</ul>`;
          case "taskItem": return `<li style="display:flex;gap:6px;align-items:flex-start"><input type="checkbox" disabled ${a.checked ? "checked" : ""} style="margin-top:4px"/><div style="flex:1${a.checked ? ";opacity:.55;text-decoration:line-through" : ""}">${kids}</div></li>`;
          case "blockquote": return `<blockquote>${kids}</blockquote>`;
          case "codeBlock": return `<pre><code${a.language ? ` class="language-${esc(a.language)}"` : ""}>${kids}</code></pre>`;
          case "hardBreak": return "<br/>";
          case "horizontalRule": return "<hr/>";
          case "image": return `<img src="${esc(a.src || "")}" alt="${esc(a.alt || "")}" style="max-width:100%;border-radius:4px"/>`;
          case "table": return `<table class="nn-table">${kids}</table>`;
          case "tableRow": return `<tr>${kids}</tr>`;
          case "tableHeader": return `<th${a.colspan ? ` colspan="${a.colspan}"` : ""}${a.rowspan ? ` rowspan="${a.rowspan}"` : ""}>${kids}</th>`;
          case "tableCell": return `<td${a.colspan ? ` colspan="${a.colspan}"` : ""}${a.rowspan ? ` rowspan="${a.rowspan}"` : ""}>${kids}</td>`;
          case "callout": return `<div class="nn-callout" style="display:flex;gap:8px;padding:12px;border-radius:4px;background:${esc(a.color || "rgba(241,241,239,0.6)")};margin:4px 0"><div style="font-size:18px">${esc(a.icon || "💡")}</div><div style="flex:1">${kids}</div></div>`;
          case "columns": return `<div class="nn-columns" style="display:grid;grid-template-columns:repeat(${(n.content || []).length},1fr);gap:16px">${kids}</div>`;
          case "column": return `<div class="nn-col">${kids}</div>`;
          case "mathBlock": {
            try { return `<div class="nn-math">${katex.renderToString(a.latex || "", { throwOnError: false, displayMode: true })}</div>`; }
            catch { return `<div class="nn-math"><code>${esc(a.latex || "")}</code></div>`; }
          }
          case "inlineMath": {
            try { return katex.renderToString(a.latex || "", { throwOnError: false, displayMode: false }); }
            catch { return `<code>${esc(a.latex || "")}</code>`; }
          }
          case "audioBlock": return `<audio controls src="${esc(a.source || "")}" style="width:100%"></audio>`;
          case "pdfBlock": return `<a href="${esc(a.source || "#")}" target="_blank" rel="noreferrer" style="display:inline-flex;gap:6px;padding:8px;border:1px solid var(--nn-border);border-radius:4px">📄 PDF</a>`;
          case "toc": return `<div class="nn-toc" style="opacity:.6;font-size:12px">[Table of contents]</div>`;
          case "breadcrumb": return `<div class="nn-breadcrumb" style="opacity:.6;font-size:12px">[Breadcrumb]</div>`;
          case "templateButton": return `<button disabled style="padding:4px 10px;border-radius:4px;border:1px solid var(--nn-border)">${esc(a.label || "Template")}</button>`;
          case "syncBlock": return `<div style="opacity:.6;font-size:12px">[Nested synced block]</div>`;
          case "mention": return `<span class="nn-mention" style="color:var(--nn-blue)">@${esc(a.label || a.id || "")}</span>`;
          default: return kids ? `<div>${kids}</div>` : "";
        }
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

/* ─── Callout Block ──────────────────────────────────────────── */
const CALLOUT_COLORS = ["default","gray","brown","orange","yellow","green","blue","purple","pink","red"] as const;
function CalloutView({ node, updateAttributes }: any) {
  const icon = node.attrs.icon || "💡";
  const color = node.attrs.color || "default";
  const [pickIcon, setPickIcon] = useState(false);
  const [pickColor, setPickColor] = useState(false);
  return (
    <NodeViewWrapper as="div" className={`nn-callout nn-callout-${color}`}>
      <div className="nn-callout-icon" contentEditable={false} onClick={() => setPickIcon(v => !v)} style={{ cursor: "pointer" }}>
        {icon}
        {pickIcon && (
          <div className="nn-callout-icon-picker" onClick={e => e.stopPropagation()}>
            {["💡","📌","⚠️","✅","❌","ℹ️","🔥","⭐","📝","❓","🎯","🚀"].map(e => (
              <button key={e} onClick={() => { updateAttributes({ icon: e }); setPickIcon(false); }}>{e}</button>
            ))}
            <button className="nn-callout-color-btn" onClick={() => { setPickIcon(false); setPickColor(true); }} title="Color">🎨</button>
          </div>
        )}
        {pickColor && (
          <div className="nn-callout-icon-picker" onClick={e => e.stopPropagation()}>
            {CALLOUT_COLORS.map(c => (
              <button key={c} className={`nn-swatch nn-swatch-${c}`} onClick={() => { updateAttributes({ color: c }); setPickColor(false); }} title={c} />
            ))}
          </div>
        )}
      </div>
      <div className="nn-callout-body"><NodeViewContent /></div>
    </NodeViewWrapper>
  );
}
export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() { return { icon: { default: "💡" }, color: { default: "default" } }; },
  parseHTML() { return [{ tag: "div[data-callout]", getAttrs: (el) => ({ icon: (el as HTMLElement).getAttribute("data-callout-icon") || "💡", color: (el as HTMLElement).getAttribute("data-callout-color") || "default" }) }]; },
  renderHTML({ HTMLAttributes, node }) {
    return ["div", mergeAttributes({ "data-callout": "", "data-callout-icon": node.attrs.icon, "data-callout-color": node.attrs.color, class: `nn-callout nn-callout-${node.attrs.color}` }, HTMLAttributes), 0];
  },
  addNodeView() { return ReactNodeViewRenderer(CalloutView); },
});

/* ─── Inline Math (KaTeX mark-like atom) ─────────────────────── */
function InlineMathView({ node, updateAttributes }: any) {
  const [editing, setEditing] = useState(!node.attrs.latex);
  const [val, setVal] = useState(node.attrs.latex || "");
  const html = useMemo(() => {
    try { return katex.renderToString(node.attrs.latex || "", { throwOnError: false, displayMode: false }); }
    catch { return `<span style="color:#e03e3e">?</span>`; }
  }, [node.attrs.latex]);
  if (editing) {
    return (
      <NodeViewWrapper as="span" className="nn-imath-edit" contentEditable={false}>
        <input autoFocus value={val} onChange={e => setVal(e.target.value)}
          onBlur={() => { updateAttributes({ latex: val }); setEditing(false); }}
          onKeyDown={e => { if (e.key === "Enter") { updateAttributes({ latex: val }); setEditing(false); } if (e.key === "Escape") setEditing(false); }}
          placeholder="\\frac{a}{b}" />
      </NodeViewWrapper>
    );
  }
  return (
    <NodeViewWrapper as="span" className="nn-imath" contentEditable={false} onClick={() => { setVal(node.attrs.latex || ""); setEditing(true); }}>
      <span dangerouslySetInnerHTML={{ __html: html }} />
    </NodeViewWrapper>
  );
}
export const InlineMath = Node.create({
  name: "inlineMath",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() { return { latex: { default: "" } }; },
  parseHTML() { return [{ tag: "span[data-imath]", getAttrs: (el) => ({ latex: (el as HTMLElement).getAttribute("data-imath") || "" }) }]; },
  renderHTML({ HTMLAttributes, node }) { return ["span", mergeAttributes({ "data-imath": node.attrs.latex, class: "nn-imath" }, HTMLAttributes)]; },
  addNodeView() { return ReactNodeViewRenderer(InlineMathView); },
});

/* ─── Audio Block ─────────────────────────────────────────────── */
function AudioView({ node, updateAttributes }: any) {
  const src: string = node.attrs.src || "";
  const caption: string = node.attrs.caption || "";
  return (
    <NodeViewWrapper as="figure" className="nn-audio" contentEditable={false}>
      <div className="nn-audio-head"><Music size={14} /> <span>{node.attrs.name || "Audio"}</span></div>
      {src ? <audio controls src={src} style={{ width: "100%" }} /> : (
        <input placeholder="Paste audio URL (mp3, wav, ogg)…" onKeyDown={e => { if (e.key === "Enter") updateAttributes({ src: (e.target as HTMLInputElement).value.trim() }); }} />
      )}
      <figcaption>
        <input value={caption} placeholder="Add caption…" onChange={e => updateAttributes({ caption: e.target.value })} />
      </figcaption>
    </NodeViewWrapper>
  );
}
export const AudioBlock = Node.create({
  name: "audio",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() { return { src: { default: "" }, name: { default: "" }, caption: { default: "" } }; },
  parseHTML() { return [{ tag: "figure[data-audio]", getAttrs: (el) => ({ src: (el as HTMLElement).getAttribute("data-src") || "", name: (el as HTMLElement).getAttribute("data-name") || "", caption: (el as HTMLElement).getAttribute("data-caption") || "" }) }]; },
  renderHTML({ HTMLAttributes, node }) { return ["figure", mergeAttributes({ "data-audio": "", "data-src": node.attrs.src, "data-name": node.attrs.name, "data-caption": node.attrs.caption, class: "nn-audio" }, HTMLAttributes)]; },
  addNodeView() { return ReactNodeViewRenderer(AudioView); },
});

/* ─── Video (upload / non-YouTube) Block ─────────────────────── */
function VideoView({ node, updateAttributes }: any) {
  const src = node.attrs.src || "";
  return (
    <NodeViewWrapper as="figure" className="nn-video" contentEditable={false}>
      {src ? <video controls src={src} style={{ maxWidth: "100%", borderRadius: 6 }} /> : (
        <input placeholder="Paste video URL (mp4, webm)…" onKeyDown={e => { if (e.key === "Enter") updateAttributes({ src: (e.target as HTMLInputElement).value.trim() }); }} />
      )}
      <figcaption><input value={node.attrs.caption || ""} placeholder="Add caption…" onChange={e => updateAttributes({ caption: e.target.value })} /></figcaption>
    </NodeViewWrapper>
  );
}
export const VideoBlock = Node.create({
  name: "video",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() { return { src: { default: "" }, caption: { default: "" } }; },
  parseHTML() { return [{ tag: "figure[data-video]", getAttrs: (el) => ({ src: (el as HTMLElement).getAttribute("data-src") || "", caption: (el as HTMLElement).getAttribute("data-caption") || "" }) }]; },
  renderHTML({ HTMLAttributes, node }) { return ["figure", mergeAttributes({ "data-video": "", "data-src": node.attrs.src, "data-caption": node.attrs.caption, class: "nn-video" }, HTMLAttributes)]; },
  addNodeView() { return ReactNodeViewRenderer(VideoView); },
});

/* ─── PDF Block ──────────────────────────────────────────────── */
function PdfView({ node, updateAttributes }: any) {
  const src = node.attrs.src || "";
  return (
    <NodeViewWrapper as="figure" className="nn-pdf" contentEditable={false}>
      {src ? (
        <>
          <div className="nn-pdf-head"><FileText size={14} /> <a href={src} target="_blank" rel="noopener">{node.attrs.name || src}</a></div>
          <iframe src={src} title="PDF" style={{ width: "100%", height: 480, border: "1px solid var(--nn-border)", borderRadius: 6 }} />
        </>
      ) : (
        <input placeholder="Paste PDF URL…" onKeyDown={e => { if (e.key === "Enter") updateAttributes({ src: (e.target as HTMLInputElement).value.trim() }); }} />
      )}
    </NodeViewWrapper>
  );
}
export const PdfBlock = Node.create({
  name: "pdf",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() { return { src: { default: "" }, name: { default: "" } }; },
  parseHTML() { return [{ tag: "figure[data-pdf]", getAttrs: (el) => ({ src: (el as HTMLElement).getAttribute("data-src") || "", name: (el as HTMLElement).getAttribute("data-name") || "" }) }]; },
  renderHTML({ HTMLAttributes, node }) { return ["figure", mergeAttributes({ "data-pdf": "", "data-src": node.attrs.src, "data-name": node.attrs.name, class: "nn-pdf" }, HTMLAttributes)]; },
  addNodeView() { return ReactNodeViewRenderer(PdfView); },
});

/* ─── Table of Contents ──────────────────────────────────────── */
function TocView({ editor }: any) {
  const [items, setItems] = useState<{ level: number; text: string; pos: number }[]>([]);
  useEffect(() => {
    if (!editor) return;
    const rebuild = () => {
      const out: any[] = [];
      editor.state.doc.descendants((node: any, pos: number) => {
        if (node.type.name === "heading") out.push({ level: node.attrs.level, text: node.textContent, pos });
      });
      setItems(out);
    };
    rebuild();
    editor.on("update", rebuild);
    return () => editor.off("update", rebuild);
  }, [editor]);
  return (
    <NodeViewWrapper as="nav" className="nn-toc" contentEditable={false}>
      <div className="nn-toc-title">Table of contents</div>
      {items.length === 0 && <div className="nn-toc-empty">Add headings to build a table of contents.</div>}
      {items.map((h, i) => (
        <div key={i} className={`nn-toc-item nn-toc-l${h.level}`}
          onClick={() => { editor.commands.focus(); editor.commands.setTextSelection(h.pos + 1); editor.view.dom.querySelectorAll("h1,h2,h3")[i]?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
          {h.text || <span style={{ opacity: 0.5 }}>Untitled</span>}
        </div>
      ))}
    </NodeViewWrapper>
  );
}
export const Toc = Node.create({
  name: "toc",
  group: "block",
  atom: true,
  selectable: true,
  parseHTML() { return [{ tag: "nav[data-toc]" }]; },
  renderHTML({ HTMLAttributes }) { return ["nav", mergeAttributes({ "data-toc": "", class: "nn-toc" }, HTMLAttributes)]; },
  addNodeView() { return ReactNodeViewRenderer(TocView); },
});

/* ─── Breadcrumb ─────────────────────────────────────────────── */
function BreadcrumbView() {
  // Read page-hierarchy from window global set by NotchPage
  const trail: { id: string; title: string }[] = (typeof window !== "undefined" && (window as any).__NN_BREADCRUMB__) || [];
  return (
    <NodeViewWrapper as="div" className="nn-crumb" contentEditable={false}>
      {trail.length === 0 ? <span style={{ opacity: 0.5 }}>No parent pages</span> : trail.map((p, i) => (
        <span key={p.id}>
          <a href={`/notch/p/${p.id}`} className="nn-crumb-link">{p.title || "Untitled"}</a>
          {i < trail.length - 1 && <ChevronRight size={12} style={{ verticalAlign: "middle", opacity: 0.5 }} />}
        </span>
      ))}
    </NodeViewWrapper>
  );
}
export const Breadcrumb = Node.create({
  name: "breadcrumb",
  group: "block",
  atom: true,
  selectable: true,
  parseHTML() { return [{ tag: "div[data-crumb]" }]; },
  renderHTML({ HTMLAttributes }) { return ["div", mergeAttributes({ "data-crumb": "", class: "nn-crumb" }, HTMLAttributes)]; },
  addNodeView() { return ReactNodeViewRenderer(BreadcrumbView); },
});

/* ─── Template Button ────────────────────────────────────────── */
function TplBtnView({ node, updateAttributes, editor, getPos }: any) {
  const label = node.attrs.label || "Add new";
  const [editing, setEditing] = useState(false);
  const run = () => {
    const template = node.attrs.template;
    if (!template || !Array.isArray(template) || template.length === 0) { setEditing(true); return; }
    // Insert copies of template blocks BEFORE this button
    const pos = getPos();
    if (typeof pos !== "number") return;
    editor.chain().focus().insertContentAt(pos, template).run();
  };
  return (
    <NodeViewWrapper as="div" className="nn-tplbtn" contentEditable={false}>
      <button className="nn-tplbtn-main" onClick={run}>➕ {label}</button>
      <button className="nn-tplbtn-cfg" title="Configure" onClick={() => setEditing(true)}>⚙</button>
      {editing && (
        <div className="nn-tplbtn-cfg-panel">
          <input value={label} onChange={e => updateAttributes({ label: e.target.value })} placeholder="Button label" />
          <textarea
            defaultValue={JSON.stringify(node.attrs.template || [{ type: "paragraph", content: [{ type: "text", text: "New item" }] }], null, 2)}
            onBlur={e => { try { updateAttributes({ template: JSON.parse(e.target.value) }); } catch { /* ignore */ } }}
            placeholder="Template JSON (TipTap block[])" rows={6}
          />
          <button onClick={() => setEditing(false)}>Done</button>
        </div>
      )}
    </NodeViewWrapper>
  );
}
export const TemplateButton = Node.create({
  name: "templateButton",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() { return { label: { default: "Add new" }, template: { default: [{ type: "paragraph", content: [{ type: "text", text: "New item" }] }] } }; },
  parseHTML() { return [{ tag: "div[data-tplbtn]", getAttrs: (el) => { try { return { label: (el as HTMLElement).getAttribute("data-label") || "Add new", template: JSON.parse((el as HTMLElement).getAttribute("data-tpl") || "[]") }; } catch { return { label: "Add new", template: [] }; } } }]; },
  renderHTML({ HTMLAttributes, node }) { return ["div", mergeAttributes({ "data-tplbtn": "", "data-label": node.attrs.label, "data-tpl": JSON.stringify(node.attrs.template || []), class: "nn-tplbtn" }, HTMLAttributes)]; },
  addNodeView() { return ReactNodeViewRenderer(TplBtnView); },
});

/* ─── Tabs Block ──────────────────────────────────────────────── */
function TabsView({ node, updateAttributes }: any) {
  const tabs: { label: string; content: string }[] = Array.isArray(node.attrs.tabs) && node.attrs.tabs.length
    ? node.attrs.tabs
    : [{ label: "Tab 1", content: "" }, { label: "Tab 2", content: "" }];
  const [active, setActive] = useState(0);
  const update = (next: any[]) => updateAttributes({ tabs: next });
  return (
    <NodeViewWrapper as="div" className="nn-tabs" contentEditable={false}>
      <div className="nn-tabs-bar">
        {tabs.map((t, i) => (
          <div key={i} className={`nn-tabs-tab ${i === active ? "active" : ""}`} onClick={() => setActive(i)}>
            <input
              value={t.label}
              onChange={(e) => { const n = [...tabs]; n[i] = { ...n[i], label: e.target.value }; update(n); }}
              style={{ background: "transparent", border: "none", color: "inherit", fontSize: 13, width: `${Math.max(4, t.label.length)}ch` }}
            />
            {tabs.length > 1 && (
              <span className="nn-tabs-x" onClick={(e) => { e.stopPropagation(); const n = tabs.filter((_, j) => j !== i); update(n); setActive(Math.max(0, active - (i <= active ? 1 : 0))); }}>×</span>
            )}
          </div>
        ))}
        <button className="nn-tabs-add" onClick={() => { update([...tabs, { label: `Tab ${tabs.length + 1}`, content: "" }]); setActive(tabs.length); }}>+</button>
      </div>
      <textarea
        className="nn-tabs-body"
        value={tabs[active]?.content || ""}
        onChange={(e) => { const n = [...tabs]; n[active] = { ...n[active], content: e.target.value }; update(n); }}
        placeholder="Tab content…"
        rows={4}
      />
    </NodeViewWrapper>
  );
}
export const TabsBlock = Node.create({
  name: "tabsBlock",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() { return { tabs: { default: [{ label: "Tab 1", content: "" }, { label: "Tab 2", content: "" }] } }; },
  parseHTML() { return [{ tag: "div[data-tabs]", getAttrs: (el) => { try { return { tabs: JSON.parse((el as HTMLElement).getAttribute("data-tabs") || "[]") }; } catch { return { tabs: [] }; } } }]; },
  renderHTML({ HTMLAttributes, node }) { return ["div", mergeAttributes({ "data-tabs": JSON.stringify(node.attrs.tabs || []), class: "nn-tabs" }, HTMLAttributes)]; },
  addNodeView() { return ReactNodeViewRenderer(TabsView); },
});

/* ─── HTML Embed ──────────────────────────────────────────────── */
function HtmlEmbedView({ node, updateAttributes }: any) {
  const [editing, setEditing] = useState(!node.attrs.html);
  const [val, setVal] = useState(node.attrs.html || "");
  return (
    <NodeViewWrapper as="div" className="nn-html-embed" contentEditable={false}>
      {editing ? (
        <div>
          <textarea
            autoFocus value={val} onChange={(e) => setVal(e.target.value)}
            placeholder="<div>Your HTML here…</div>" rows={6}
            style={{ width: "100%", background: "var(--nn-bg-secondary)", border: "1px solid var(--nn-border-strong)", borderRadius: 4, padding: 8, fontFamily: "monospace", fontSize: 12, color: "var(--nn-text)" }}
          />
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            <button onClick={() => { updateAttributes({ html: val }); setEditing(false); }} className="nn-btn-primary" style={{ fontSize: 12 }}>Render</button>
            <button onClick={() => setEditing(false)} className="nn-topbar-btn" style={{ fontSize: 12 }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div onClick={() => { setVal(node.attrs.html || ""); setEditing(true); }} style={{ cursor: "pointer", padding: 8, border: "1px dashed var(--nn-border)", borderRadius: 4 }}
          dangerouslySetInnerHTML={{ __html: node.attrs.html || "<em style='opacity:.5'>Click to edit HTML</em>" }} />
      )}
    </NodeViewWrapper>
  );
}
export const HtmlEmbed = Node.create({
  name: "htmlEmbed",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() { return { html: { default: "" } }; },
  parseHTML() { return [{ tag: "div[data-html-embed]", getAttrs: (el) => ({ html: (el as HTMLElement).getAttribute("data-html") || "" }) }]; },
  renderHTML({ HTMLAttributes, node }) { return ["div", mergeAttributes({ "data-html-embed": "", "data-html": node.attrs.html, class: "nn-html-embed" }, HTMLAttributes)]; },
  addNodeView() { return ReactNodeViewRenderer(HtmlEmbedView); },
});

/* ─── Inline Database Block ──────────────────────────────────── */
function InlineDatabaseView({ node, updateAttributes }: any) {
  const id: string = node.attrs.databaseId || "";
  const mode: "inline" | "linked" = (node.attrs.mode as any) || "inline";
  const [dbInfo, setDbInfo] = useState<{ title: string; workspace_id: string; icon?: string } | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const nav = useNavigate();
  const path = useNotchPath();
  const { user } = useNotchAuth();

  useEffect(() => {
    if (id) {
      cctGet<any>(NN.block, id).then((b) => b && setDbInfo({ title: b.title || "Untitled", workspace_id: String(b.workspace_id || ""), icon: b.icon })).catch(() => setDbInfo(null));
    } else {
      cctList<any>(NN.block).then((rows) => setCandidates(rows.filter((b: any) => b.type === "database" && Number(b.archived) !== 1))).catch(() => setCandidates([]));
    }
  }, [id]);

  const createDatabase = async () => {
    setCreating(true);
    try {
      const wsId = (window as any).__NN_ACTIVE_WORKSPACE__ || "";
      const { id: newId } = await cctCreate(NN.block, {
        workspace_id: String(wsId),
        parent_id: String(wsId),
        type: "database",
        title: "Untitled database",
        icon: "🗄", cover: "",
        properties: JSON.stringify({ schema: [{ key: "status", name: "Status", type: "select", options: ["To do", "In progress", "Done"] }] }),
        content_order: JSON.stringify([]),
        archived: 0, in_trash: 0,
        created_by: user?.user_id || 0, last_edited_by: user?.user_id || 0,
      });
      updateAttributes({ databaseId: newId });
    } catch (e) { console.error(e); }
    setCreating(false);
  };

  if (!id) {
    return (
      <NodeViewWrapper as="div" className="nn-inline-db-picker" contentEditable={false} style={{ border: "1px dashed var(--nn-border-strong)", borderRadius: 6, padding: 12, margin: "8px 0", background: "var(--nn-bg-secondary)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 13, color: "var(--nn-text-secondary)" }}>
          <DatabaseIcon size={14} />
          <span style={{ flex: 1, fontWeight: 500 }}>Inline database</span>
          <select value="" onChange={(e) => e.target.value && updateAttributes({ databaseId: e.target.value })} className="nn-topbar-btn" style={{ fontSize: 12 }}>
            <option value="">Link existing…</option>
            {candidates.map((c: any) => <option key={c.id} value={c.id}>{c.title || "Untitled"}</option>)}
          </select>
          <button onClick={createDatabase} disabled={creating} className="nn-btn-primary" style={{ fontSize: 12 }}>
            <Plus size={12} style={{ marginRight: 4 }} /> {creating ? "Creating…" : "New"}
          </button>
        </div>
      </NodeViewWrapper>
    );
  }

  if (!dbInfo) return <NodeViewWrapper as="div" contentEditable={false} style={{ opacity: 0.5, padding: 8 }}>Loading database…</NodeViewWrapper>;

  return (
    <NodeViewWrapper as="div" className="nn-inline-db" contentEditable={false} style={{ border: "1px solid var(--nn-border)", borderRadius: 6, padding: 10, margin: "8px 0", background: "var(--nn-bg)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 13 }}>
        <span>{dbInfo.icon || "🗄"}</span>
        <span onClick={() => nav(path(`/p/${id}`))} style={{ fontWeight: 600, cursor: "pointer" }} title="Open database">{dbInfo.title}</span>
        <span style={{ flex: 1 }} />
        <button onClick={() => updateAttributes({ mode: mode === "inline" ? "linked" : "inline" })} className="nn-topbar-btn" style={{ fontSize: 11 }} title="Toggle inline/linked">
          {mode === "inline" ? "Inline" : "Linked"}
        </button>
        <button onClick={() => updateAttributes({ databaseId: "" })} className="nn-topbar-btn" style={{ fontSize: 11 }} title="Unlink">Unlink</button>
      </div>
      {mode === "inline" ? (
        <NotchDatabase databaseId={id} workspaceId={dbInfo.workspace_id} />
      ) : (
        <div onClick={() => nav(path(`/p/${id}`))} style={{ padding: 12, background: "var(--nn-bg-secondary)", borderRadius: 4, cursor: "pointer", fontSize: 13, color: "var(--nn-text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
          <DatabaseIcon size={14} /> Open linked database →
        </div>
      )}
    </NodeViewWrapper>
  );
}
export const InlineDatabase = Node.create({
  name: "inlineDatabase",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() { return { databaseId: { default: "" }, mode: { default: "inline" } }; },
  parseHTML() { return [{ tag: "div[data-inline-db]", getAttrs: (el) => ({ databaseId: (el as HTMLElement).getAttribute("data-db-id") || "", mode: (el as HTMLElement).getAttribute("data-db-mode") || "inline" }) }]; },
  renderHTML({ HTMLAttributes, node }) { return ["div", mergeAttributes({ "data-inline-db": "", "data-db-id": node.attrs.databaseId, "data-db-mode": node.attrs.mode, class: "nn-inline-db" }, HTMLAttributes)]; },
  addNodeView() { return ReactNodeViewRenderer(InlineDatabaseView); },
});

