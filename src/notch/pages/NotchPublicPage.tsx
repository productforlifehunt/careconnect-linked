import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import LinkExt from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Table, TableHeader } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import Youtube from "@tiptap/extension-youtube";
import { Details, DetailsSummary, DetailsContent } from "@tiptap/extension-details";
import { MathBlock, Columns, Column } from "@/notch/components/notch-extensions";
import { cctGet, cctList, NN } from "@/notch/lib/nn-client";

interface Block {
  id: string;
  title?: string;
  icon?: string;
  cover?: string;
  properties?: string;
  type?: string;
}

export default function NotchPublicPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const [block, setBlock] = useState<Block | null>(null);
  const [content, setContent] = useState<any>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "not-public" | "not-found">("loading");

  useEffect(() => {
    if (!pageId) return;
    let alive = true;
    (async () => {
      try {
        const perms = await cctList<any>(NN.permission);
        const publicRow = perms.find(
          (p: any) => String(p.block_id) === String(pageId) && Number(p.is_public) === 1
        );
        if (!publicRow) {
          if (alive) setStatus("not-public");
          return;
        }
        const b = await cctGet<Block>(NN.block, pageId);
        if (!alive) return;
        if (!b) { setStatus("not-found"); return; }
        setBlock(b);
        try {
          const props = b.properties ? JSON.parse(b.properties) : {};
          setContent(props.editor_content || null);
        } catch { setContent(null); }
        setStatus("ok");
      } catch {
        if (alive) setStatus("not-found");
      }
    })();
    return () => { alive = false; };
  }, [pageId]);

  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      LinkExt.configure({ openOnClick: true, autolink: true }),
      Image,
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({ controls: true, nocookie: true }),
      Details.configure({ persist: true, HTMLAttributes: { class: "nn-toggle" } }),
      DetailsSummary,
      DetailsContent,
      MathBlock,
      Columns,
      Column,
    ],
    content: content || "",
  }, [content]);

  if (status === "loading") {
    return <div className="notch-app"><div style={{ padding: 60, textAlign: "center", opacity: 0.6 }}>Loading…</div></div>;
  }
  if (status === "not-public" || status === "not-found") {
    return (
      <div className="notch-app">
        <div style={{ padding: 60, textAlign: "center", maxWidth: 500, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
          <h1 style={{ fontSize: 22, marginBottom: 8 }}>
            {status === "not-public" ? "This page is private" : "Page not found"}
          </h1>
          <p style={{ color: "var(--nn-text-secondary)", marginBottom: 20 }}>
            {status === "not-public"
              ? "The owner has not enabled web publishing for this page."
              : "This page does not exist or has been deleted."}
          </p>
          <Link to="/" style={{ color: "var(--nn-blue)" }}>Go home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="notch-app">
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--nn-bg)", borderBottom: "1px solid var(--nn-border)", padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 13, color: "var(--nn-text-secondary)" }}>
          Published on <strong>Notch Note</strong>
        </div>
        <Link to="/" style={{ fontSize: 13, color: "var(--nn-blue)", textDecoration: "none" }}>
          Get Notch Note →
        </Link>
      </div>
      <div className="nn-page-scroll">
        {block?.cover && (
          <div style={{ height: 220, background: `center/cover no-repeat url("${block.cover}")` }} />
        )}
        <div className="nn-page" style={block?.cover ? { paddingTop: 24 } : undefined}>
          {block?.icon && <div className="nn-page-icon" style={{ cursor: "default" }}>{block.icon}</div>}
          <h1 className="nn-page-title" style={{ pointerEvents: "none" }}>{block?.title || "Untitled"}</h1>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
