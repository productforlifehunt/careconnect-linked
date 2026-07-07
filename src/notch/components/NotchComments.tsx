import { useEffect, useState, useCallback } from "react";
import { Send, Trash2 } from "lucide-react";
import { cctList, cctCreate, cctDelete, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";
import { createNotification } from "@/notch/lib/nn-notifications";

interface Comment {
  id: string;
  block_id?: string;
  author_id?: string | null;
  body?: string;
  created_at?: string;
  resolved?: number | string;
}

export function NotchComments({ blockId }: { blockId: string }) {
  const { user } = useNotchAuth();
  const [items, setItems] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const all = await cctList<Comment>(NN.comment);
    setItems(
      all
        .filter((c: any) => String(c.block_id) === String(blockId) && Number(c.resolved) !== 1)
        .sort((a: any, b: any) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
    );
  }, [blockId]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    try {
      await cctCreate(NN.comment, {
        block_id: String(blockId),
        body,
        resolved: 0,
        author_display: user?.user_display_name || user?.user_email || "Anonymous",
      });
      setText("");
      await load();
    } catch (e) { console.error("comment", e); }
    setBusy(false);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    await cctDelete(NN.comment, id);
    await load();
  };

  return (
    <div style={{ marginTop: 48, borderTop: "1px solid var(--nn-border)", paddingTop: 20 }}>
      <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "var(--nn-text-tertiary)", marginBottom: 12 }}>
        Comments
      </div>
      <div>
        {items.map((c: any) => (
          <div key={c.id} style={{ padding: "10px 0", borderBottom: "1px solid var(--nn-border)", display: "flex", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--nn-blue-bg)", color: "var(--nn-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
              {(c.author_display || "?").charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "var(--nn-text-secondary)", marginBottom: 2 }}>
                <strong style={{ color: "var(--nn-text)" }}>{c.author_display || "Anonymous"}</strong>
                {c.created_at && <span style={{ marginLeft: 8, fontSize: 11 }}>{new Date(c.created_at).toLocaleString()}</span>}
              </div>
              <div style={{ fontSize: 14, whiteSpace: "pre-wrap" }}>{c.body}</div>
            </div>
            {String(c.author_id) === String(user?.user_id) && (
              <button onClick={() => remove(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-tertiary)" }}><Trash2 size={13} /></button>
            )}
          </div>
        ))}
        {!items.length && <div style={{ color: "var(--nn-text-tertiary)", fontSize: 13, padding: "8px 0" }}>No comments yet.</div>}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          className="nn-auth-input"
          placeholder="Add a comment…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          style={{ marginBottom: 0, flex: 1 }}
        />
        <button className="nn-btn-primary" onClick={submit} disabled={busy || !text.trim()} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Send size={13} /> Send
        </button>
      </div>
    </div>
  );
}
