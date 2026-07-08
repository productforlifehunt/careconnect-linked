import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { supabase } from "@/integrations/supabase/client";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import Youtube from "@tiptap/extension-youtube";
import { Details, DetailsSummary, DetailsContent } from "@tiptap/extension-details";
import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline as UIcon, Strikethrough, Code, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, Sparkles, MessageSquare, Type, ChevronDown, Plus, Minus, Trash2, Rows, Columns as ColumnsIcon } from "lucide-react";
import { MathBlock, Columns, Column, SyncBlock, buildColumns, Callout, InlineMath, AudioBlock, VideoBlock, PdfBlock, Toc, Breadcrumb, TemplateButton, TabsBlock, HtmlEmbed, InlineDatabase, MultiBlockShortcuts, InlineCommentMark, Whiteboard, Bookmark, ButtonBlock } from "./notch-extensions";
import { NotchMention } from "./notch-mention";
import { BlockSync } from "@/notch/lib/nn-block-sync";
import { NotchInputRules } from "./notch-input-rules";
import { nnUploadFile, pickFile } from "@/notch/lib/nn-files";
import { nnPrompt, nnAlert } from "@/notch/lib/nn-dialog";
import { useNotchAuth as _useNotchAuth } from "@/notch/context/NotchAuthContext";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import { cctList, NN } from "@/notch/lib/nn-client";

function buildToggleHeading(level: 1 | 2 | 3) {
  return {
    type: "details",
    attrs: { open: true },
    content: [
      { type: "detailsSummary", content: [{ type: "text", text: level === 1 ? "Heading 1" : level === 2 ? "Heading 2" : "Heading 3" }] },
      { type: "detailsContent", content: [{ type: "paragraph" }] },
    ],
  };
}

interface Props {
  content: any;
  onChange: (json: any) => void;
  placeholder?: string;
  onCreateSubpage?: () => Promise<{ id: string; title: string; href: string } | null>;
  pageId?: string;
}

// Theme-aware colors using rgba() so opacity keeps them readable on dark bg
const HL_COLORS = [
  "rgba(255, 212, 0, 0.35)",   // yellow
  "rgba(255, 90, 90, 0.30)",   // red
  "rgba(80, 200, 120, 0.30)",  // green
  "rgba(80, 140, 240, 0.30)",  // blue
  "rgba(170, 100, 220, 0.30)", // purple
  "rgba(240, 140, 60, 0.30)",  // orange
];
const TEXT_COLORS = [
  "var(--nn-text)",             // default (via unset)
  "#e03e3e", "#d9730d", "#dfab01", "#0f7b6c", "#0b6e99", "#6940a5", "#ad1a72",
];

const SLASH_ITEMS = [
  { group: "Basic", key: "text", icon: "T", name: "Text", desc: "Plain text.", cmd: (e: any) => e.chain().focus().setParagraph().run() },
  { group: "Basic", key: "h1", icon: "H₁", name: "Heading 1", desc: "Big heading.", cmd: (e: any) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { group: "Basic", key: "h2", icon: "H₂", name: "Heading 2", desc: "Medium heading.", cmd: (e: any) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { group: "Basic", key: "h3", icon: "H₃", name: "Heading 3", desc: "Small heading.", cmd: (e: any) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { group: "Lists", key: "ul", icon: "•", name: "Bulleted list", desc: "Simple bulleted list.", cmd: (e: any) => e.chain().focus().toggleBulletList().run() },
  { group: "Lists", key: "ol", icon: "1.", name: "Numbered list", desc: "Numbered list.", cmd: (e: any) => e.chain().focus().toggleOrderedList().run() },
  { group: "Lists", key: "todo", icon: "☐", name: "To-do list", desc: "Task checkboxes.", cmd: (e: any) => e.chain().focus().toggleTaskList().run() },
  { group: "Blocks", key: "quote", icon: "❝", name: "Quote", desc: "Capture a quote.", cmd: (e: any) => e.chain().focus().toggleBlockquote().run() },
  { group: "Blocks", key: "code", icon: "</>", name: "Code", desc: "Code snippet.", cmd: (e: any) => e.chain().focus().toggleCodeBlock().run() },
  { group: "Blocks", key: "divider", icon: "—", name: "Divider", desc: "Divide blocks.", cmd: (e: any) => e.chain().focus().setHorizontalRule().run() },
  { group: "Blocks", key: "callout", icon: "💡", name: "Callout", desc: "Highlighted note with icon.",
    cmd: (e: any) => e.chain().focus().insertContent({ type: "callout", attrs: { icon: "💡", color: "default" }, content: [{ type: "paragraph", content: [{ type: "text", text: "Note" }] }] }).run() },
  { group: "Blocks", key: "toggle", icon: "▸", name: "Toggle", desc: "Collapsible details block.",
    cmd: (e: any) => e.chain().focus().insertContent({
      type: "details",
      attrs: { open: true },
      content: [
        { type: "detailsSummary", content: [{ type: "text", text: "Toggle" }] },
        { type: "detailsContent", content: [{ type: "paragraph" }] },
      ],
    }).run() },
  { group: "Blocks", key: "toggle_h1", icon: "▸H₁", name: "Toggle heading 1", desc: "Collapsible H1 section.",
    cmd: (e: any) => e.chain().focus().insertContent(buildToggleHeading(1)).run() },
  { group: "Blocks", key: "toggle_h2", icon: "▸H₂", name: "Toggle heading 2", desc: "Collapsible H2 section.",
    cmd: (e: any) => e.chain().focus().insertContent(buildToggleHeading(2)).run() },
  { group: "Blocks", key: "toggle_h3", icon: "▸H₃", name: "Toggle heading 3", desc: "Collapsible H3 section.",
    cmd: (e: any) => e.chain().focus().insertContent(buildToggleHeading(3)).run() },
  { group: "Blocks", key: "table", icon: "⊞", name: "Table", desc: "Insert a 3×3 table.",
    cmd: (e: any) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { group: "Media", key: "image", icon: "🖼", name: "Image", desc: "Embed image.", cmd: async (e: any) => {
      const url = await nnPrompt("Paste an image URL", { title: "Image", placeholder: "https://…" });
      if (url) e.chain().focus().setImage({ src: url }).run();
    } },
  { group: "Media", key: "video", icon: "▶", name: "YouTube video", desc: "Embed a YouTube video.",
    cmd: async (e: any) => {
      const url = await nnPrompt("Paste a YouTube URL", { title: "YouTube", placeholder: "https://youtu.be/…" });
      if (url) e.chain().focus().setYoutubeVideo({ src: url, width: 640, height: 360 }).run();
    } },
  { group: "Media", key: "embed", icon: "🔗", name: "Web embed", desc: "Embed any URL via iframe.",
    cmd: async (e: any) => {
      const url = await nnPrompt("Paste a URL to embed", { title: "Web embed", placeholder: "https://…" });
      if (url) e.chain().focus().insertContent(`<div class="nn-embed"><iframe src="${url}" frameborder="0" allowfullscreen></iframe></div>`).run();
    } },
  { group: "Media", key: "bookmark", icon: "🔖", name: "Bookmark", desc: "Insert a link preview card.",
    cmd: async (e: any) => {
      const url = await nnPrompt("Paste a URL", { title: "Bookmark", placeholder: "https://…" });
      if (!url) return;
      const host = (() => { try { return new URL(url).hostname; } catch { return url; } })();
      e.chain().focus().insertContent(`<div class="nn-bookmark"><a href="${url}" target="_blank" rel="noopener">${host}<div class="nn-bookmark-url">${url}</div></a></div>`).run();
    } },
  { group: "Media", key: "link", icon: "↗", name: "Link", desc: "Insert link.", cmd: async (e: any) => {
      const url = await nnPrompt("Paste a URL", { title: "Link", placeholder: "https://…" });
      if (url) e.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    } },
  { group: "Media", key: "file", icon: "📎", name: "File", desc: "Upload any file.", cmd: async (e: any, ctx: any) => {
      const f = await pickFile();
      if (!f) return;
      try {
        const uid = ctx?.userId || 0;
        const up = await nnUploadFile(f, uid);
        const isImg = up.type.startsWith("image/");
        if (isImg) {
          e.chain().focus().setImage({ src: up.url, alt: up.name }).run();
        } else {
          const size = up.size > 1024 * 1024 ? `${(up.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(up.size / 1024))} KB`;
          e.chain().focus().insertContent(`<div class="nn-bookmark"><a href="${up.url}" target="_blank" rel="noopener">📎 ${up.name}<div class="nn-bookmark-url">${size}</div></a></div>`).run();
        }
      } catch (err: any) { nnAlert(`Upload failed: ${err.message || err}`); }
    } },
  { group: "Advanced", key: "math", icon: "∑", name: "Math equation", desc: "Block LaTeX equation.",
    cmd: (e: any) => e.chain().focus().insertContent({ type: "mathBlock", attrs: { latex: "" } }).run() },
  { group: "Advanced", key: "imath", icon: "√", name: "Inline equation", desc: "Inline LaTeX equation.",
    cmd: (e: any) => e.chain().focus().insertContent({ type: "inlineMath", attrs: { latex: "" } }).run() },
  { group: "Advanced", key: "cols2", icon: "▮▮", name: "2 columns", desc: "Two-column layout.",
    cmd: (e: any) => e.chain().focus().insertContent(buildColumns(2)).run() },
  { group: "Advanced", key: "cols3", icon: "▮▮▮", name: "3 columns", desc: "Three-column layout.",
    cmd: (e: any) => e.chain().focus().insertContent(buildColumns(3)).run() },
  { group: "Advanced", key: "cols4", icon: "▮▮▮▮", name: "4 columns", desc: "Four-column layout.",
    cmd: (e: any) => e.chain().focus().insertContent(buildColumns(4)).run() },
  { group: "Advanced", key: "cols5", icon: "▮▮▮▮▮", name: "5 columns", desc: "Five-column layout.",
    cmd: (e: any) => e.chain().focus().insertContent(buildColumns(5)).run() },
  { group: "Advanced", key: "sync", icon: "🔗", name: "Sync block", desc: "Mirror another page's content, live.",
    cmd: (e: any) => e.chain().focus().insertContent({ type: "syncBlock", attrs: { sourceId: "" } }).run() },
  { group: "Advanced", key: "toc", icon: "☰", name: "Table of contents", desc: "Auto-list of headings.",
    cmd: (e: any) => e.chain().focus().insertContent({ type: "toc" }).run() },
  { group: "Advanced", key: "crumb", icon: "›", name: "Breadcrumb", desc: "Show page hierarchy.",
    cmd: (e: any) => e.chain().focus().insertContent({ type: "breadcrumb" }).run() },
  { group: "Advanced", key: "tplbtn", icon: "⚡", name: "Template button", desc: "Click to duplicate template blocks.",
    cmd: (e: any) => e.chain().focus().insertContent({ type: "templateButton", attrs: { label: "Add new", template: [{ type: "paragraph", content: [{ type: "text", text: "New item" }] }] } }).run() },
  { group: "Advanced", key: "tabs", icon: "▤", name: "Tabs", desc: "Tabbed content sections.",
    cmd: (e: any) => e.chain().focus().insertContent({ type: "tabsBlock", attrs: { tabs: [{ label: "Tab 1", content: "" }, { label: "Tab 2", content: "" }] } }).run() },
  { group: "Advanced", key: "html", icon: "</>", name: "HTML embed", desc: "Render custom HTML.",
    cmd: (e: any) => e.chain().focus().insertContent({ type: "htmlEmbed", attrs: { html: "" } }).run() },
  { group: "Advanced", key: "whiteboard", icon: "🎨", name: "Whiteboard", desc: "Freehand drawing canvas.",
    cmd: (e: any) => e.chain().focus().insertContent({ type: "whiteboard", attrs: { strokes: "[]" } }).run() },
  { group: "Media", key: "audio", icon: "🎵", name: "Audio", desc: "Embed audio (mp3, wav).",
    cmd: (e: any) => e.chain().focus().insertContent({ type: "audio", attrs: { src: "" } }).run() },
  { group: "Media", key: "video2", icon: "🎬", name: "Video", desc: "Embed video file (mp4, webm).",
    cmd: (e: any) => e.chain().focus().insertContent({ type: "video", attrs: { src: "" } }).run() },
  { group: "Media", key: "pdf", icon: "📄", name: "PDF", desc: "Inline PDF viewer.",
    cmd: (e: any) => e.chain().focus().insertContent({ type: "pdf", attrs: { src: "" } }).run() },
  { group: "Basic", key: "subpage", icon: "📄", name: "Sub-page", desc: "Embed a new sub-page.", cmd: async (e: any, ctx: any) => {
      if (!ctx?.onCreateSubpage) return;
      const p = await ctx.onCreateSubpage();
      if (!p) return;
      e.chain().focus()
        .insertContent([
          { type: "paragraph", content: [
            { type: "text", marks: [{ type: "link", attrs: { href: p.href } }], text: `📄 ${p.title}` },
          ] },
        ])
        .run();
    } },
  { group: "Basic", key: "linkpage", icon: "🔗", name: "Link to page", desc: "Insert link to another page.", cmd: (_e: any, ctx: any) => { ctx?.onOpenPagePicker?.(); } },
  { group: "Database", key: "db_inline", icon: "🗄", name: "Database — inline", desc: "Full inline database view.",
    cmd: (e: any) => e.chain().focus().insertContent({ type: "inlineDatabase", attrs: { databaseId: "", mode: "inline" } }).run() },
  { group: "Database", key: "db_linked", icon: "🔗", name: "Linked database", desc: "Reference an existing database.",
    cmd: (e: any) => e.chain().focus().insertContent({ type: "inlineDatabase", attrs: { databaseId: "", mode: "linked" } }).run() },
];

export function NotionEditor({ content, onChange, placeholder = "Write, press '/' for commands, or ⌃Space for AI…", onCreateSubpage, pageId }: Props) {
  const { user } = _useNotchAuth();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: false, underline: false } as any),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({ controls: true, nocookie: true }),
      Details.configure({ persist: true, HTMLAttributes: { class: "nn-toggle" } }),
      DetailsSummary,
      DetailsContent,
      MathBlock,
      InlineMath,
      Columns,
      Column,
      SyncBlock,
      Callout,
      AudioBlock,
      VideoBlock,
      PdfBlock,
      Toc,
      Breadcrumb,
      TemplateButton,
      TabsBlock,
      HtmlEmbed,
      NotchMention,
      NotchInputRules,
      InlineDatabase,
      MultiBlockShortcuts,
      InlineCommentMark,
      Whiteboard,
      BlockSync.configure({ pageId: pageId || "" }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  const [slash, setSlash] = useState<{ x: number; y: number; query: string } | null>(null);
  const [selected, setSelected] = useState(0);
  const [hoverBlock, setHoverBlock] = useState<{ top: number; el: HTMLElement } | null>(null);
  const [blockMenu, setBlockMenu] = useState<{ top: number; left: number; el: HTMLElement } | null>(null);
  const [tableCtx, setTableCtx] = useState<{ top: number; left: number } | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const notchPath = useNotchPath();
  // Delegated click handler: opening an inline-comment thread.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-nn-comment-thread]");
      if (!target) return;
      const threadId = target.getAttribute("data-nn-comment-thread") || "";
      if (!threadId) return;
      window.dispatchEvent(new CustomEvent("nn:open-comment-thread", { detail: { threadId } }));
      window.dispatchEvent(new CustomEvent("nn:add-comment"));
    };
    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, []);
  const [pagePicker, setPagePicker] = useState<{ x: number; y: number; query: string; pages: { id: string; title: string }[]; sel: number } | null>(null);
  const openPagePicker = async () => {
    let x = 40, y = 40;
    try {
      const rect = (window.getSelection()?.getRangeAt(0).getBoundingClientRect()) as DOMRect | undefined;
      if (rect && wrapperRef.current) {
        const wr = wrapperRef.current.getBoundingClientRect();
        x = Math.max(0, rect.left - wr.left);
        y = rect.bottom - wr.top + wrapperRef.current.scrollTop + 4;
      }
    } catch {}
    setPagePicker({ x, y, query: "", pages: [], sel: 0 });
    try {
      const rows = await cctList<any>(NN.block);
      const pages = rows
        .filter((b: any) => (b.type === "page" || b.type === "database") && Number(b.archived) !== 1)
        .map((b: any) => ({ id: String(b.id), title: b.title || "Untitled" }));
      setPagePicker((p) => (p ? { ...p, pages } : p));
    } catch {}
  };
  const insertPageLink = (id: string, title: string) => {
    if (!editor) return;
    const href = notchPath(`/p/${id}`);
    editor.chain().focus()
      .insertContent([{ type: "text", marks: [{ type: "link", attrs: { href } }], text: `📄 ${title || "Untitled"}` }])
      .run();
    setPagePicker(null);
  };

  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !slash) {
        setTimeout(() => {
          const rect = (window.getSelection()?.getRangeAt(0).getBoundingClientRect()) as DOMRect | undefined;
          if (rect && wrapperRef.current) {
            const wr = wrapperRef.current.getBoundingClientRect();
            // clamp within editor bounds so scroll doesn't push it out
            const editorWidth = wr.width;
            const menuWidth = 320;
            let x = rect.left - wr.left;
            x = Math.max(0, Math.min(x, editorWidth - menuWidth));
            const y = rect.bottom - wr.top + wrapperRef.current.scrollTop + 4;
            setSlash({ x, y, query: "" });
            setSelected(0);
          }
        }, 0);
      } else if (slash) {
        if (e.key === "Escape") { setSlash(null); return; }
        if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => (s + 1) % filteredItems().length); return; }
        if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => (s - 1 + filteredItems().length) % filteredItems().length); return; }
        if (e.key === "Enter") { e.preventDefault(); runItem(filteredItems()[selected]); return; }
      }
      // Ctrl/Cmd + Space → inline AI continue
      if (e.code === "Space" && (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        runAI("continue");
      }
    };
    const inputHandler = () => {
      if (!slash) return;
      // Notion allows spaces inside the slash query (e.g. "/heading 1", "/to do").
      // Only close on newline, another slash, or a query longer than 40 chars.
      const text = editor.state.doc.textBetween(Math.max(0, editor.state.selection.from - 60), editor.state.selection.from, "\n");
      const m = text.match(/\/([^/\n]{0,40})$/);
      if (m) {
        setSlash((s) => (s ? { ...s, query: m[1] } : s));
        setSelected(0);
      } else {
        setSlash(null);
      }
    };
    dom.addEventListener("keydown", handler);
    editor.on("update", inputHandler);
    return () => {
      dom.removeEventListener("keydown", handler);
      editor.off("update", inputHandler);
    };
  }, [editor, slash, selected]);

  // Hover handles: track hovered top-level block within ProseMirror.
  // Also captures right-click to open the same block menu (Notion parity).
  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom as HTMLElement;
    const onMove = (e: MouseEvent) => {
      let node = e.target as HTMLElement | null;
      while (node && node.parentElement !== dom) node = node.parentElement;
      if (!node) { setHoverBlock(null); return; }
      const wr = wrapperRef.current?.getBoundingClientRect();
      const nr = node.getBoundingClientRect();
      setHoverBlock({ top: nr.top - (wr?.top || 0), el: node });
    };
    const onLeave = () => setHoverBlock(null);
    const onContext = (e: MouseEvent) => {
      // Only intercept when caret / target is inside an editable block; let native
      // menu appear on selected text so users can still access spellcheck if needed.
      let node = e.target as HTMLElement | null;
      while (node && node.parentElement !== dom) node = node.parentElement;
      if (!node) return;
      // Skip when user is right-clicking a link (browser link menu is more useful).
      const tgt = e.target as HTMLElement;
      if (tgt.closest("a[href]")) return;
      e.preventDefault();
      const wr = wrapperRef.current?.getBoundingClientRect();
      // If inside a table cell, open dedicated table context menu instead.
      if (tgt.closest("td, th")) {
        setTableCtx({
          top: (e.clientY - (wr?.top || 0)),
          left: (e.clientX - (wr?.left || 0)),
        });
        return;
      }
      const nr = node.getBoundingClientRect();
      setHoverBlock({ top: nr.top - (wr?.top || 0), el: node });
      setBlockMenu({
        top: (e.clientY - (wr?.top || 0)),
        left: (e.clientX - (wr?.left || 0)),
        el: node,
      });
    };
    dom.addEventListener("mousemove", onMove);
    dom.addEventListener("mouseleave", onLeave);
    dom.addEventListener("contextmenu", onContext);
    return () => {
      dom.removeEventListener("mousemove", onMove);
      dom.removeEventListener("mouseleave", onLeave);
      dom.removeEventListener("contextmenu", onContext);
    };
  }, [editor]);


  // Get the accurate node range for a top-level DOM element via ProseMirror
  const nodeRangeFor = (el: HTMLElement): { from: number; to: number } | null => {
    if (!editor) return null;
    try {
      const from = editor.view.posAtDOM(el, 0);
      const $pos = editor.state.doc.resolve(from);
      // Top-level node is depth 1
      const depth = Math.max(1, $pos.depth);
      const nodeStart = $pos.before(depth);
      const nodeEnd = $pos.after(depth);
      return { from: nodeStart, to: nodeEnd };
    } catch {
      return null;
    }
  };

  const handlePlus = () => {
    if (!editor || !hoverBlock) return;
    const range = nodeRangeFor(hoverBlock.el);
    if (!range) return;
    editor.chain().focus().insertContentAt(range.to, { type: "paragraph" }).run();
    setTimeout(() => { editor.commands.insertContent("/"); }, 10);
  };

  const openBlockMenu = () => {
    if (!hoverBlock || !wrapperRef.current) return;
    const wr = wrapperRef.current.getBoundingClientRect();
    const nr = hoverBlock.el.getBoundingClientRect();
    setBlockMenu({ top: nr.top - wr.top, left: nr.left - wr.left - 10, el: hoverBlock.el });
  };

  const deleteBlock = () => {
    if (!editor || !blockMenu) return;
    const range = nodeRangeFor(blockMenu.el);
    if (!range) { setBlockMenu(null); return; }
    editor.chain().focus().deleteRange(range).run();
    setBlockMenu(null);
  };

  const duplicateBlock = () => {
    if (!editor || !blockMenu) return;
    const range = nodeRangeFor(blockMenu.el);
    if (!range) { setBlockMenu(null); return; }
    const slice = editor.state.doc.slice(range.from, range.to);
    editor.chain().focus().insertContentAt(range.to, slice.content.toJSON()).run();
    setBlockMenu(null);
  };

  // Turn-into: swap the top-level block for a different node type at the same position.
  const turnInto = (kind: "paragraph" | "h1" | "h2" | "h3" | "ul" | "ol" | "todo" | "quote" | "code" | "callout") => {
    if (!editor || !blockMenu) return;
    const range = nodeRangeFor(blockMenu.el);
    if (!range) { setBlockMenu(null); return; }
    // Move selection into that block first, then apply the transform via TipTap chains.
    editor.chain().focus().setTextSelection({ from: range.from + 1, to: range.from + 1 }).run();
    const c = editor.chain().focus();
    if (kind === "paragraph") c.setParagraph().run();
    else if (kind === "h1") c.setHeading({ level: 1 }).run();
    else if (kind === "h2") c.setHeading({ level: 2 }).run();
    else if (kind === "h3") c.setHeading({ level: 3 }).run();
    else if (kind === "ul") c.toggleBulletList().run();
    else if (kind === "ol") c.toggleOrderedList().run();
    else if (kind === "todo") c.toggleTaskList().run();
    else if (kind === "quote") c.toggleBlockquote().run();
    else if (kind === "code") c.toggleCodeBlock().run();
    else if (kind === "callout") {
      const r2 = nodeRangeFor(blockMenu.el);
      if (!r2) return;
      const slice = editor.state.doc.slice(r2.from, r2.to).content.toJSON();
      editor.chain().focus()
        .deleteRange(r2)
        .insertContentAt(r2.from, { type: "callout", attrs: { icon: "💡", color: "default" }, content: Array.isArray(slice) ? slice : [{ type: "paragraph" }] })
        .run();
    }
    setBlockMenu(null);
  };

  // Apply a background color to the hovered top-level block (persisted via a class attribute
  // on the DOM node — falls back to inline style on the editor DOM since PM doesn't have a
  // generic block color mark. Users get instant feedback; not stored in JSON.)
  const colorBlock = (bg: string) => {
    if (!blockMenu) return;
    blockMenu.el.style.background = bg;
    blockMenu.el.style.borderRadius = "4px";
    blockMenu.el.style.padding = bg && bg !== "transparent" ? "4px 8px" : "";
    setBlockMenu(null);
  };

  // Drag-to-reorder: user grabs ⋮⋮ and drops on another block.
  const [dragBlock, setDragBlock] = useState<HTMLElement | null>(null);
  const onHandleDragStart = (e: React.DragEvent) => {
    if (!hoverBlock) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/nn-block", "1");
    setDragBlock(hoverBlock.el);
  };
  useEffect(() => {
    if (!editor || !dragBlock) return;
    const dom = editor.view.dom as HTMLElement;
    const onOver = (e: DragEvent) => {
      if (!dragBlock) return;
      e.preventDefault();
      (e as any).dataTransfer.dropEffect = "move";
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      if (!dragBlock || !editor) return;
      let target = e.target as HTMLElement | null;
      while (target && target.parentElement !== dom) target = target.parentElement;
      if (!target || target === dragBlock) { setDragBlock(null); return; }
      const srcRange = nodeRangeFor(dragBlock);
      const tgtRange = nodeRangeFor(target);
      if (!srcRange || !tgtRange) { setDragBlock(null); return; }
      const slice = editor.state.doc.slice(srcRange.from, srcRange.to).content.toJSON();
      // Insert before target if moving up, after if moving down.
      const insertAt = tgtRange.from < srcRange.from ? tgtRange.from : tgtRange.to;
      editor.chain().focus()
        .deleteRange(srcRange)
        // After deleteRange, indices shift when insertAt was after the removed range.
        .insertContentAt(insertAt > srcRange.from ? insertAt - (srcRange.to - srcRange.from) : insertAt, slice as any)
        .run();
      setDragBlock(null);
    };
    dom.addEventListener("dragover", onOver);
    dom.addEventListener("drop", onDrop);
    return () => {
      dom.removeEventListener("dragover", onOver);
      dom.removeEventListener("drop", onDrop);
    };
  }, [editor, dragBlock]);




  const getRecentSlash = (): string[] => {
    try { return JSON.parse(localStorage.getItem("nn_slash_recent") || "[]"); } catch { return []; }
  };
  const pushRecentSlash = (key: string) => {
    const cur = getRecentSlash().filter((k) => k !== key);
    cur.unshift(key);
    localStorage.setItem("nn_slash_recent", JSON.stringify(cur.slice(0, 6)));
  };

  const filteredItems = () => {
    if (!slash) return SLASH_ITEMS;
    const q = slash.query.toLowerCase();
    if (!q) return SLASH_ITEMS;
    return SLASH_ITEMS.filter((i) => i.name.toLowerCase().includes(q) || i.key.includes(q));
  };

  const runItem = (item: (typeof SLASH_ITEMS)[number] | undefined) => {
    if (!item || !editor) return;
    const { from } = editor.state.selection;
    const before = editor.state.doc.textBetween(Math.max(0, from - 60), from, "\n");
    // Match same shape as the slash input handler above (allow spaces in the query).
    const m = before.match(/\/([^/\n]{0,40})$/);
    if (m) {
      const start = from - m[0].length;
      editor.chain().focus().deleteRange({ from: start, to: from }).run();
    }
    item.cmd(editor, { onCreateSubpage, userId: user?.user_id, onOpenPagePicker: openPagePicker });
    pushRecentSlash(item.key);
    setSlash(null);
  };

  const items = filteredItems();
  const groups: Record<string, typeof SLASH_ITEMS> = {};
  // Recently used group only when no filter
  if (slash && !slash.query) {
    const recentKeys = getRecentSlash();
    const recent = recentKeys.map((k) => SLASH_ITEMS.find((i) => i.key === k)).filter(Boolean) as typeof SLASH_ITEMS;
    if (recent.length) groups["Recently used"] = recent.slice(0, 6);
  }
  items.forEach((i) => { (groups[i.group] ||= []).push(i); });

  const setLink = async () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href || "";
    const url = await nnPrompt("Paste a URL (leave empty to remove link)", { title: "Link", defaultValue: prev, placeholder: "https://…" });
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  // AI writing assist — uses Lovable AI Gateway via edge function
  const runAI = async (mode: "improve" | "summarize" | "translate" | "continue" | "brainstorm") => {
    if (!editor || aiBusy) return;
    const { from, to } = editor.state.selection;
    const selected = from !== to ? editor.state.doc.textBetween(from, to, "\n") : "";
    const context = selected || editor.state.doc.textBetween(Math.max(0, from - 500), from, "\n");
    if (!context.trim() && mode !== "brainstorm") { nnAlert("Select some text or write something first."); return; }
    setAiBusy(true);
    try {
      const prompts: Record<string, string> = {
        improve: `Improve the writing style, grammar and clarity. Return only the improved text:\n\n${context}`,
        summarize: `Summarize concisely in 2-3 sentences. Return only the summary:\n\n${context}`,
        translate: `Translate to English (or Chinese if already English). Return only the translation:\n\n${context}`,
        continue: `Continue writing naturally where this text left off. Return only the continuation:\n\n${context}`,
        brainstorm: `Brainstorm 5 concise ideas about: ${context || "the current page topic"}. Return only the bulleted list.`,
      };
      const { data, error } = await supabase.functions.invoke("notch-ai-assist", { body: { prompt: prompts[mode] } });
      if (error) throw error;
      const text = (data as any)?.text;
      if (!text) throw new Error("empty response");
      if (mode === "improve" || mode === "translate") {
        if (selected) editor.chain().focus().deleteRange({ from, to }).insertContent(text).run();
        else editor.chain().focus().insertContent("\n\n" + text).run();
      } else {
        editor.chain().focus().insertContent("\n\n" + text).run();
      }
    } catch (e: any) {
      nnAlert(`AI failed: ${e.message || e}`);
    } finally {
      setAiBusy(false);
    }
  };


  return (
    <div className="nn-editor" style={{ position: "relative" }} ref={wrapperRef}>
      <EditorContent editor={editor} />
      {editor && (
        <BubbleMenu editor={editor}>
          <div className="nn-bubble">
            <div className="nn-bubble-ai" style={{ position: "relative" }}>
              <button title="Turn into" onClick={(e) => {
                const menu = (e.currentTarget.nextSibling as HTMLElement | null);
                if (menu) menu.style.display = menu.style.display === "block" ? "none" : "block";
              }} style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
                <Type size={13} /><ChevronDown size={10} />
              </button>
              <div className="nn-ai-menu" style={{ display: "none", position: "absolute", top: 28, left: 0, background: "var(--nn-bg)", border: "1px solid var(--nn-border-strong)", borderRadius: 6, padding: 4, minWidth: 160, zIndex: 100, boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}>
                {[
                  ["paragraph", "Text"], ["h1", "Heading 1"], ["h2", "Heading 2"], ["h3", "Heading 3"],
                  ["ul", "Bulleted list"], ["ol", "Numbered list"], ["todo", "To-do"], ["quote", "Quote"],
                  ["code", "Code"], ["callout", "Callout"],
                ].map(([k, l]) => (
                  <div key={k} className="nn-sidebar-item" onMouseDown={(ev) => {
                    ev.preventDefault();
                    const chain = editor.chain().focus();
                    if (k === "paragraph") chain.setParagraph().run();
                    else if (k === "h1") chain.toggleHeading({ level: 1 }).run();
                    else if (k === "h2") chain.toggleHeading({ level: 2 }).run();
                    else if (k === "h3") chain.toggleHeading({ level: 3 }).run();
                    else if (k === "ul") chain.toggleBulletList().run();
                    else if (k === "ol") chain.toggleOrderedList().run();
                    else if (k === "todo") chain.toggleTaskList().run();
                    else if (k === "quote") chain.toggleBlockquote().run();
                    else if (k === "code") chain.toggleCodeBlock().run();
                    else if (k === "callout") editor.chain().focus().insertContent({ type: "callout", content: [{ type: "paragraph" }] }).run();
                  }}>
                    <span className="nn-title" style={{ fontSize: 13 }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <span className="nn-bubble-sep" />
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "active" : ""} title="Bold (⌘B)"><Bold size={13} /></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? "active" : ""} title="Italic (⌘I)"><Italic size={13} /></button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive("underline") ? "active" : ""} title="Underline (⌘U)"><UIcon size={13} /></button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive("strike") ? "active" : ""} title="Strikethrough"><Strikethrough size={13} /></button>
            <button onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive("code") ? "active" : ""} title="Inline code"><Code size={13} /></button>
            <button onClick={setLink} className={editor.isActive("link") ? "active" : ""} title="Link"><LinkIcon size={13} /></button>
            <button onClick={() => {
              const { from, to } = editor.state.selection;
              if (to <= from) return;
              const threadId = `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
              editor.chain().focus().setMark("inlineComment", { threadId }).run();
              window.dispatchEvent(new CustomEvent("nn:open-comment-thread", { detail: { threadId, from, to } }));
              window.dispatchEvent(new CustomEvent("nn:open-comment", { detail: { from, to, threadId } }));
            }} title="Comment"><MessageSquare size={13} /></button>
            <span className="nn-bubble-sep" />
            <button onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align left"><AlignLeft size={13} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align center"><AlignCenter size={13} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align right"><AlignRight size={13} /></button>
            <span className="nn-bubble-sep" />
            <div className="nn-bubble-swatches" title="Text color" aria-label="Text color">
              {TEXT_COLORS.map((c, i) => (
                <button key={"t" + i} aria-label={`Text color ${i}`} title={`Text color ${i}`}
                  onClick={() => i === 0 ? editor.chain().focus().unsetColor().run() : editor.chain().focus().setColor(c).run()}
                  style={{ background: c }} />
              ))}
            </div>
            <div className="nn-bubble-swatches" title="Highlight" aria-label="Highlight">
              {HL_COLORS.map((c, i) => (
                <button key={"h" + i} aria-label={`Highlight ${i}`} title={`Highlight ${i}`}
                  onClick={() => editor.chain().focus().toggleHighlight({ color: c }).run()}
                  style={{ background: c }} />
              ))}
              <button aria-label="Clear highlight" title="Clear highlight"
                onClick={() => editor.chain().focus().unsetHighlight().run()}
                style={{ background: "transparent", border: "1px dashed var(--nn-border-strong)" }} />
            </div>
            <span className="nn-bubble-sep" />
            <div className="nn-bubble-ai" style={{ position: "relative" }}>
              <button title="AI writing" disabled={aiBusy} onClick={(e) => {
                const menu = (e.currentTarget.nextSibling as HTMLElement | null);
                if (menu) menu.style.display = menu.style.display === "block" ? "none" : "block";
              }}>
                <Sparkles size={13} />
              </button>
              <div className="nn-ai-menu" style={{ display: "none", position: "absolute", top: 28, right: 0, background: "var(--nn-bg)", border: "1px solid var(--nn-border-strong)", borderRadius: 6, padding: 4, minWidth: 160, zIndex: 100, boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}>
                {[
                  ["improve", "Improve writing"],
                  ["summarize", "Summarize"],
                  ["translate", "Translate"],
                  ["continue", "Continue writing"],
                  ["brainstorm", "Brainstorm ideas"],
                ].map(([k, l]) => (
                  <div key={k} className="nn-sidebar-item" onMouseDown={(e) => { e.preventDefault(); runAI(k as any); }}>
                    <span className="nn-title">{aiBusy ? "…" : l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </BubbleMenu>
      )}
      {editor && (
        <BubbleMenu
          editor={editor}
          pluginKey="nn-table-menu"
          shouldShow={({ editor: ed }) => ed.isActive("table")}
          options={{ placement: "top" as any }}
        >
          <div className="nn-bubble" role="toolbar" aria-label="Table controls">
            <button title="Toggle header row" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>H↕</button>
            <button title="Toggle header column" onClick={() => editor.chain().focus().toggleHeaderColumn().run()}>H↔</button>
            <span className="nn-bubble-sep" />
            <button title="Insert row above" onClick={() => editor.chain().focus().addRowBefore().run()}><Rows size={13} />↑</button>
            <button title="Insert row below" onClick={() => editor.chain().focus().addRowAfter().run()}><Rows size={13} />↓</button>
            <button title="Delete row" onClick={() => editor.chain().focus().deleteRow().run()}><Rows size={13} /><Minus size={11} /></button>
            <span className="nn-bubble-sep" />
            <button title="Insert column left" onClick={() => editor.chain().focus().addColumnBefore().run()}><ColumnsIcon size={13} />←</button>
            <button title="Insert column right" onClick={() => editor.chain().focus().addColumnAfter().run()}><ColumnsIcon size={13} />→</button>
            <button title="Delete column" onClick={() => editor.chain().focus().deleteColumn().run()}><ColumnsIcon size={13} /><Minus size={11} /></button>
            <span className="nn-bubble-sep" />
            <button title="Merge cells" onClick={() => editor.chain().focus().mergeCells().run()}>⊟</button>
            <button title="Split cell" onClick={() => editor.chain().focus().splitCell().run()}>⊞</button>
            <span className="nn-bubble-sep" />
            <button title="Delete table" onClick={() => editor.chain().focus().deleteTable().run()} style={{ color: "#e03e3e" }}><Trash2 size={13} /></button>
          </div>
        </BubbleMenu>
      )}

      {slash && items.length > 0 && (
        <div className="nn-slash-menu" style={{ left: slash.x, top: slash.y }}>
          {Object.entries(groups).map(([g, gitems]) => (
            <div key={g}>
              <div className="nn-slash-menu-group">{g}</div>
              {gitems.map((item) => {
                const idx = items.indexOf(item);
                return (
                  <div
                    key={item.key}
                    className={`nn-slash-menu-item ${idx === selected ? "selected" : ""}`}
                    onMouseEnter={() => setSelected(idx)}
                    onMouseDown={(e) => { e.preventDefault(); runItem(item); }}
                  >
                    <div className="nn-slash-icon">{item.icon}</div>
                    <div className="nn-slash-body">
                      <div className="nn-slash-name">{item.name}</div>
                      <div className="nn-slash-desc">{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
      {hoverBlock && (
        <div className="nn-block-handles" style={{ top: hoverBlock.top }}>
          <button title="Add block below" onClick={handlePlus}>+</button>
          <button
            title="Drag to move · click for options"
            draggable
            onDragStart={onHandleDragStart}
            onClick={openBlockMenu}
            style={{ cursor: "grab" }}
          >⋮⋮</button>
        </div>
      )}
      {blockMenu && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={() => setBlockMenu(null)} />
          <div className="nn-block-menu" style={{ top: blockMenu.top + 20, left: blockMenu.left, minWidth: 200 }}>
            <div className="nn-sidebar-item" onClick={duplicateBlock}><span className="nn-title">Duplicate</span></div>
            <div className="nn-sidebar-item" onClick={() => {
              if (!blockMenu) return;
              const range = nodeRangeFor(blockMenu.el);
              const anchor = range ? `#b-${range.from}` : "";
              try { navigator.clipboard.writeText(window.location.href.split("#")[0] + anchor); } catch { /* noop */ }
              setBlockMenu(null);
            }}><span className="nn-title">Copy link to block</span></div>
            <div className="nn-sidebar-item" onClick={() => {
              if (!blockMenu || !editor) return;
              const range = nodeRangeFor(blockMenu.el);
              const threadId = `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
              if (range && range.to > range.from) {
                editor.chain().focus().setTextSelection(range).setMark("inlineComment", { threadId }).run();
              }
              window.dispatchEvent(new CustomEvent("nn:open-comment-thread", { detail: { threadId, from: range?.from, to: range?.to } }));
              window.dispatchEvent(new CustomEvent("nn:open-comment", { detail: { from: range?.from, to: range?.to, threadId } }));
              setBlockMenu(null);
            }}><span className="nn-title">Comment</span></div>
            <div className="nn-sidebar-item" onClick={async () => {
              if (!blockMenu || !editor || !onCreateSubpage) { setBlockMenu(null); return; }
              const range = nodeRangeFor(blockMenu.el);
              if (!range) { setBlockMenu(null); return; }
              const text = editor.state.doc.textBetween(range.from, range.to, " ").trim();
              const sub = await onCreateSubpage();
              if (sub) {
                editor.chain().focus()
                  .setTextSelection(range)
                  .deleteSelection()
                  .insertContent({ type: "paragraph", content: [{ type: "text", text: text || sub.title, marks: [{ type: "link", attrs: { href: sub.href } }] }] })
                  .run();
              }
              setBlockMenu(null);
            }}><span className="nn-title">Turn into page</span></div>
            <div className="nn-sidebar-item" onClick={deleteBlock} style={{ color: "var(--nn-danger, #e03e3e)" }}><span className="nn-title">Delete</span></div>

            <div style={{ borderTop: "1px solid var(--nn-border)", margin: "4px 0" }} />
            <div style={{ fontSize: 11, color: "var(--nn-text-tertiary)", padding: "4px 8px", textTransform: "uppercase", letterSpacing: 0.4 }}>Turn into</div>
            {[
              ["paragraph", "Text"], ["h1", "Heading 1"], ["h2", "Heading 2"], ["h3", "Heading 3"],
              ["ul", "Bulleted list"], ["ol", "Numbered list"], ["todo", "To-do"], ["quote", "Quote"],
              ["code", "Code"], ["callout", "Callout"],
            ].map(([k, l]) => (
              <div key={k} className="nn-sidebar-item" onClick={() => turnInto(k as any)}>
                <span className="nn-title" style={{ fontSize: 13 }}>{l}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid var(--nn-border)", margin: "4px 0" }} />
            <div style={{ fontSize: 11, color: "var(--nn-text-tertiary)", padding: "4px 8px", textTransform: "uppercase", letterSpacing: 0.4 }}>Background</div>
            <div style={{ display: "flex", gap: 4, padding: "2px 8px 6px", flexWrap: "wrap" }}>
              {[
                ["transparent", "None"],
                ["rgba(241,241,239,0.6)", "Gray"],
                ["rgba(253,235,220,0.7)", "Orange"],
                ["rgba(251,236,213,0.7)", "Yellow"],
                ["rgba(219,237,219,0.7)", "Green"],
                ["rgba(211,229,239,0.7)", "Blue"],
                ["rgba(232,222,238,0.7)", "Purple"],
                ["rgba(255,224,224,0.7)", "Red"],
              ].map(([bg, name]) => (
                <button
                  key={bg}
                  title={name}
                  onClick={() => colorBlock(bg)}
                  style={{ width: 18, height: 18, borderRadius: 3, background: bg, border: bg === "transparent" ? "1px dashed var(--nn-border-strong)" : "1px solid var(--nn-border)", cursor: "pointer" }}
                />
              ))}
            </div>
          </div>
        </>
      )}
      {tableCtx && editor && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={() => setTableCtx(null)} />
          <div className="nn-block-menu" style={{ top: tableCtx.top, left: tableCtx.left, minWidth: 200 }}>
            <div className="nn-sidebar-item" onClick={() => { editor.chain().focus().addRowBefore().run(); setTableCtx(null); }}><span className="nn-title">Insert row above</span></div>
            <div className="nn-sidebar-item" onClick={() => { editor.chain().focus().addRowAfter().run(); setTableCtx(null); }}><span className="nn-title">Insert row below</span></div>
            <div className="nn-sidebar-item" onClick={() => { editor.chain().focus().addColumnBefore().run(); setTableCtx(null); }}><span className="nn-title">Insert column left</span></div>
            <div className="nn-sidebar-item" onClick={() => { editor.chain().focus().addColumnAfter().run(); setTableCtx(null); }}><span className="nn-title">Insert column right</span></div>
            <div style={{ borderTop: "1px solid var(--nn-border)", margin: "4px 0" }} />
            <div className="nn-sidebar-item" onClick={() => { editor.chain().focus().toggleHeaderRow().run(); setTableCtx(null); }}><span className="nn-title">Toggle header row</span></div>
            <div className="nn-sidebar-item" onClick={() => { editor.chain().focus().toggleHeaderColumn().run(); setTableCtx(null); }}><span className="nn-title">Toggle header column</span></div>
            <div className="nn-sidebar-item" onClick={() => { editor.chain().focus().mergeOrSplit().run(); setTableCtx(null); }}><span className="nn-title">Merge / split cells</span></div>
            <div style={{ borderTop: "1px solid var(--nn-border)", margin: "4px 0" }} />
            <div className="nn-sidebar-item" onClick={() => { editor.chain().focus().deleteRow().run(); setTableCtx(null); }} style={{ color: "var(--nn-danger, #e03e3e)" }}><span className="nn-title">Delete row</span></div>
            <div className="nn-sidebar-item" onClick={() => { editor.chain().focus().deleteColumn().run(); setTableCtx(null); }} style={{ color: "var(--nn-danger, #e03e3e)" }}><span className="nn-title">Delete column</span></div>
            <div className="nn-sidebar-item" onClick={() => { editor.chain().focus().deleteTable().run(); setTableCtx(null); }} style={{ color: "var(--nn-danger, #e03e3e)" }}><span className="nn-title">Delete table</span></div>
          </div>
        </>
      )}
      {pagePicker && (() => {
        const q = pagePicker.query.toLowerCase();
        const filtered = (q ? pagePicker.pages.filter((p) => p.title.toLowerCase().includes(q)) : pagePicker.pages).slice(0, 40);
        return (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={() => setPagePicker(null)} />
            <div className="nn-slash-menu" style={{ left: pagePicker.x, top: pagePicker.y, minWidth: 320, zIndex: 100 }}>
              <div style={{ padding: 6, borderBottom: "1px solid var(--nn-border)" }}>
                <input
                  autoFocus
                  value={pagePicker.query}
                  onChange={(e) => setPagePicker((p) => (p ? { ...p, query: e.target.value, sel: 0 } : p))}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") { e.preventDefault(); setPagePicker(null); }
                    else if (e.key === "ArrowDown") { e.preventDefault(); setPagePicker((p) => (p ? { ...p, sel: Math.min(filtered.length - 1, p.sel + 1) } : p)); }
                    else if (e.key === "ArrowUp") { e.preventDefault(); setPagePicker((p) => (p ? { ...p, sel: Math.max(0, p.sel - 1) } : p)); }
                    else if (e.key === "Enter") { e.preventDefault(); const it = filtered[pagePicker.sel]; if (it) insertPageLink(it.id, it.title); }
                  }}
                  placeholder="Search pages…"
                  style={{ width: "100%", padding: "6px 8px", background: "transparent", border: "1px solid var(--nn-border)", borderRadius: 4, color: "var(--nn-text)", fontSize: 13 }}
                />
              </div>
              <div style={{ maxHeight: 320, overflowY: "auto" }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: 12, color: "var(--nn-text-tertiary)", fontSize: 12 }}>{pagePicker.pages.length === 0 ? "Loading…" : "No pages"}</div>
                ) : filtered.map((it, i) => (
                  <div
                    key={it.id}
                    className={`nn-slash-menu-item ${i === pagePicker.sel ? "selected" : ""}`}
                    onMouseEnter={() => setPagePicker((p) => (p ? { ...p, sel: i } : p))}
                    onMouseDown={(e) => { e.preventDefault(); insertPageLink(it.id, it.title); }}
                  >
                    <div className="nn-slash-icon">📄</div>
                    <div className="nn-slash-body">
                      <div className="nn-slash-name">{it.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}
