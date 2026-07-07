import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { NotionEditor } from "@/notch/components/NotionEditor";
import { cctGet, cctUpdate, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";

interface Block {
  id: string;
  title?: string;
  icon?: string;
  cover?: string;
  properties?: string;
  content_order?: string;
}

const EMOJIS = ["📝","📓","📘","📗","📕","📙","📚","🗂","🗓","✅","💡","🎯","🚀","⭐","🔥","🌟","🌸","🍎","🎨","🧠","💼","🏠","🧭","📌"];

export default function NotchPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const { user } = useNotchAuth();
  const [block, setBlock] = useState<Block | null>(null);
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");
  const [content, setContent] = useState<any>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const saveTimer = useRef<any>(null);

  useEffect(() => {
    if (!pageId) return;
    let alive = true;
    (async () => {
      const b = await cctGet<Block>(NN.block, pageId);
      if (!alive || !b) return;
      setBlock(b);
      setTitle(b.title || "");
      setIcon(b.icon || "");
      try {
        const props = b.properties ? JSON.parse(b.properties) : {};
        setContent(props.editor_content || null);
      } catch { setContent(null); }
    })();
    return () => { alive = false; };
  }, [pageId]);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = titleRef.current.scrollHeight + "px";
    }
  }, [title]);

  const scheduleSave = useCallback((patch: Record<string, any>) => {
    if (!pageId) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await cctUpdate(NN.block, pageId, { ...patch, last_edited_by: user?.user_id || 0 });
      } catch (e) { console.error("Save failed", e); }
    }, 400);
  }, [pageId, user]);

  const onTitleChange = (v: string) => {
    setTitle(v);
    scheduleSave({ title: v });
  };
  const onIconChange = (v: string) => {
    setIcon(v);
    setShowEmoji(false);
    scheduleSave({ icon: v });
  };
  const onContentChange = (json: any) => {
    setContent(json);
    const props = { editor_content: json };
    scheduleSave({ properties: JSON.stringify(props) });
  };

  if (!pageId) return null;
  if (!block) return <div className="nn-page"><div style={{ opacity: 0.5 }}>Loading…</div></div>;

  return (
    <div className="nn-page-scroll">
      <div className="nn-page">
        <div style={{ position: "relative", display: "inline-block" }}>
          <div className="nn-page-icon" onClick={() => setShowEmoji((s) => !s)}>
            {icon || <span style={{ fontSize: 24, opacity: 0.3 }}>Add icon</span>}
          </div>
          {showEmoji && (
            <div style={{ position: "absolute", top: "100%", left: 0, background: "var(--nn-bg)", border: "1px solid var(--nn-border-strong)", borderRadius: 6, padding: 8, display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4, zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
              {EMOJIS.map((e) => (
                <button key={e} onClick={() => onIconChange(e)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, padding: 4, borderRadius: 4 }}>{e}</button>
              ))}
              <button onClick={() => onIconChange("")} style={{ gridColumn: "span 8", background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-secondary)", fontSize: 12, padding: 4 }}>Remove</button>
            </div>
          )}
        </div>
        <textarea
          ref={titleRef}
          className="nn-page-title"
          placeholder="Untitled"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          rows={1}
        />
        <NotionEditor content={content} onChange={onContentChange} />
      </div>
    </div>
  );
}
