import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
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
import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline as UIcon, Strikethrough, Code, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight } from "lucide-react";

interface Props {
  content: any;
  onChange: (json: any) => void;
  placeholder?: string;
  onCreateSubpage?: () => Promise<{ id: string; title: string; href: string } | null>;
}

const HL_COLORS = ["#fff2b8", "#ffd6d6", "#d6ffd6", "#d6e4ff", "#f0d6ff", "#ffe0c2"];
const TEXT_COLORS = ["#37352f", "#e03e3e", "#d9730d", "#dfab01", "#0f7b6c", "#0b6e99", "#6940a5", "#ad1a72"];

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
  { group: "Blocks", key: "callout", icon: "💡", name: "Callout", desc: "Highlighted note block.", cmd: (e: any) => e.chain().focus().insertContent({ type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: "💡 " }] }] }).run() },
  { group: "Blocks", key: "toggle", icon: "▸", name: "Toggle", desc: "Collapsible details block.", cmd: (e: any) => e.chain().focus().insertContent("<details><summary>Toggle</summary><p>Hidden content…</p></details>").run() },
  { group: "Media", key: "image", icon: "🖼", name: "Image", desc: "Embed image.", cmd: (e: any) => {
      const url = window.prompt("Image URL");
      if (url) e.chain().focus().setImage({ src: url }).run();
    } },
  { group: "Media", key: "link", icon: "🔗", name: "Link", desc: "Insert link.", cmd: (e: any) => {
      const url = window.prompt("URL");
      if (url) e.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    } },
];

export function NotionEditor({ content, onChange, placeholder = "Type '/' for commands" }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
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
    ],
    content: content || "",
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  const [slash, setSlash] = useState<{ x: number; y: number; query: string } | null>(null);
  const [selected, setSelected] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !slash) {
        setTimeout(() => {
          const rect = (window.getSelection()?.getRangeAt(0).getBoundingClientRect()) as DOMRect | undefined;
          if (rect) {
            const wrapperRect = wrapperRef.current?.getBoundingClientRect();
            setSlash({
              x: rect.left - (wrapperRect?.left || 0),
              y: rect.bottom - (wrapperRect?.top || 0) + 4,
              query: "",
            });
            setSelected(0);
          }
        }, 0);
      } else if (slash) {
        if (e.key === "Escape") { setSlash(null); return; }
        if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => (s + 1) % filteredItems().length); return; }
        if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => (s - 1 + filteredItems().length) % filteredItems().length); return; }
        if (e.key === "Enter") { e.preventDefault(); runItem(filteredItems()[selected]); return; }
      }
    };
    const inputHandler = () => {
      if (!slash) return;
      const text = editor.state.doc.textBetween(Math.max(0, editor.state.selection.from - 30), editor.state.selection.from, "\n");
      const m = text.match(/\/([^/\s]*)$/);
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

  const filteredItems = () => {
    if (!slash) return SLASH_ITEMS;
    const q = slash.query.toLowerCase();
    if (!q) return SLASH_ITEMS;
    return SLASH_ITEMS.filter((i) => i.name.toLowerCase().includes(q) || i.key.includes(q));
  };

  const runItem = (item: (typeof SLASH_ITEMS)[number] | undefined) => {
    if (!item || !editor) return;
    const { from } = editor.state.selection;
    const before = editor.state.doc.textBetween(Math.max(0, from - 30), from, "\n");
    const m = before.match(/\/([^/\s]*)$/);
    if (m) {
      const start = from - m[0].length;
      editor.chain().focus().deleteRange({ from: start, to: from }).run();
    }
    item.cmd(editor);
    setSlash(null);
  };

  const items = filteredItems();
  const groups: Record<string, typeof SLASH_ITEMS> = {};
  items.forEach((i) => { (groups[i.group] ||= []).push(i); });

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href || "";
    const url = window.prompt("URL", prev);
    if (url === null) return;
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="nn-editor" style={{ position: "relative" }} ref={wrapperRef}>
      <EditorContent editor={editor} />
      {editor && (
        <BubbleMenu editor={editor}>
          <div className="nn-bubble">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "active" : ""} title="Bold"><Bold size={13} /></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? "active" : ""} title="Italic"><Italic size={13} /></button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive("underline") ? "active" : ""} title="Underline"><UIcon size={13} /></button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive("strike") ? "active" : ""} title="Strike"><Strikethrough size={13} /></button>
            <button onClick={() => editor.chain().focus().toggleCode().run()} className={editor.isActive("code") ? "active" : ""} title="Code"><Code size={13} /></button>
            <button onClick={setLink} className={editor.isActive("link") ? "active" : ""} title="Link"><LinkIcon size={13} /></button>
            <span className="nn-bubble-sep" />
            <button onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align left"><AlignLeft size={13} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align center"><AlignCenter size={13} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align right"><AlignRight size={13} /></button>
            <span className="nn-bubble-sep" />
            <div className="nn-bubble-swatches" title="Text color">
              {TEXT_COLORS.map((c) => (
                <button key={"t" + c} onClick={() => editor.chain().focus().setColor(c).run()} style={{ background: c }} />
              ))}
              <button onClick={() => editor.chain().focus().unsetColor().run()} style={{ background: "transparent", border: "1px dashed #999" }} title="Reset" />
            </div>
            <div className="nn-bubble-swatches" title="Highlight">
              {HL_COLORS.map((c) => (
                <button key={"h" + c} onClick={() => editor.chain().focus().toggleHighlight({ color: c }).run()} style={{ background: c }} />
              ))}
              <button onClick={() => editor.chain().focus().unsetHighlight().run()} style={{ background: "transparent", border: "1px dashed #999" }} title="Clear" />
            </div>
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
    </div>
  );
}
