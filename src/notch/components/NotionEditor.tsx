import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useRef, useState } from "react";

interface Props {
  content: any;
  onChange: (json: any) => void;
  placeholder?: string;
}

const SLASH_ITEMS = [
  { group: "Basic", key: "text", icon: "T", name: "Text", desc: "Just start writing with plain text.", cmd: (e: any) => e.chain().focus().setParagraph().run() },
  { group: "Basic", key: "h1", icon: "H₁", name: "Heading 1", desc: "Big section heading.", cmd: (e: any) => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { group: "Basic", key: "h2", icon: "H₂", name: "Heading 2", desc: "Medium section heading.", cmd: (e: any) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { group: "Basic", key: "h3", icon: "H₃", name: "Heading 3", desc: "Small section heading.", cmd: (e: any) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { group: "Basic", key: "ul", icon: "•", name: "Bulleted list", desc: "Create a simple bulleted list.", cmd: (e: any) => e.chain().focus().toggleBulletList().run() },
  { group: "Basic", key: "ol", icon: "1.", name: "Numbered list", desc: "Create a list with numbering.", cmd: (e: any) => e.chain().focus().toggleOrderedList().run() },
  { group: "Basic", key: "todo", icon: "☐", name: "To-do list", desc: "Track tasks with a to-do list.", cmd: (e: any) => e.chain().focus().toggleTaskList().run() },
  { group: "Basic", key: "quote", icon: "❝", name: "Quote", desc: "Capture a quote.", cmd: (e: any) => e.chain().focus().toggleBlockquote().run() },
  { group: "Basic", key: "code", icon: "</>", name: "Code", desc: "Capture a code snippet.", cmd: (e: any) => e.chain().focus().toggleCodeBlock().run() },
  { group: "Basic", key: "divider", icon: "—", name: "Divider", desc: "Visually divide blocks.", cmd: (e: any) => e.chain().focus().setHorizontalRule().run() },
  { group: "Media", key: "image", icon: "🖼", name: "Image", desc: "Upload or embed with a link.", cmd: (e: any) => {
      const url = window.prompt("Image URL");
      if (url) e.chain().focus().setImage({ src: url }).run();
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
      // read the text right before the caret to update the query
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
    // remove the "/" and query text
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

  return (
    <div className="nn-editor" style={{ position: "relative" }} ref={wrapperRef}>
      <EditorContent editor={editor} />
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
