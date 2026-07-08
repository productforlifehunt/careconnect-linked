import { useEffect, useState, useCallback, useMemo } from "react";
import { nnConfirm } from "@/notch/lib/nn-dialog";
import { Send, Trash2, Check, RotateCcw, MessageSquare, Filter } from "lucide-react";
import { cctList, cctCreate, cctUpdate, cctDelete, NN } from "@/notch/lib/nn-client";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";
import { createNotification } from "@/notch/lib/nn-notifications";

interface Comment {
  id: string;
  block_id?: string;
  parent_id?: string | null;
  author_id?: string | null;
  author_display?: string;
  body?: string;
  created_at?: string;
  resolved?: number | string;
}

type FilterMode = "open" | "resolved" | "all";

function relTime(iso?: string): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!t) return "";
  const diff = Math.max(0, Date.now() - t);
  const s = Math.floor(diff / 1000);
  if (s < 45) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function NotchComments({ blockId }: { blockId: string }) {
  const { user } = useNotchAuth();
  const [items, setItems] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("open");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    const all = await cctList<Comment>(NN.comment);
    setItems(
      all
        .filter((c: any) => String(c.block_id) === String(blockId))
        .sort((a: any, b: any) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
    );
  }, [blockId]);

  useEffect(() => { load(); }, [load]);

  // Listen for Cmd+Shift+/ shortcut from the editor to focus the add-comment input.
  useEffect(() => {
    const focus = () => {
      const el = document.querySelector<HTMLInputElement>('[data-nn-comment-input="1"]');
      el?.focus();
    };
    window.addEventListener("nn:add-comment", focus);
    return () => window.removeEventListener("nn:add-comment", focus);
  }, []);

  const submit = async (body: string, parent_id: string | null = null) => {
    body = body.trim();
    if (!body) return;
    setBusy(true);
    try {
      await cctCreate(NN.comment, {
        block_id: String(blockId),
        parent_id: parent_id ? String(parent_id) : "",
        body,
        resolved: 0,
        author_id: user ? String(user.user_id) : "",
        author_display: user?.user_display_name || user?.user_email || "Anonymous",
      });
      const mentions = Array.from(new Set((body.match(/@(\d+)/g) || []).map((m) => m.slice(1))));
      for (const uid of mentions) {
        if (uid && String(uid) !== String(user?.user_id)) {
          try {
            await createNotification({
              user_id: uid,
              type: "mention",
              block_id: String(blockId),
              actor_user_id: user ? String(user.user_id) : "",
              payload: JSON.stringify({ message: body.slice(0, 140) }),
            });
          } catch { /* noop */ }
        }
      }
      await load();
    } catch (e) { console.error("comment", e); }
    setBusy(false);
  };

  const remove = async (id: string) => {
    if (!(await nnConfirm("This comment and its replies will be removed.", "Delete comment?"))) return;
    // Cascade delete replies too.
    const replies = items.filter((c) => String(c.parent_id) === String(id));
    for (const r of replies) await cctDelete(NN.comment, r.id);
    await cctDelete(NN.comment, id);
    await load();
  };

  const setResolved = async (id: string, resolved: 0 | 1) => {
    await cctUpdate(NN.comment, id, { resolved });
    await load();
  };

  const saveEdit = async (id: string) => {
    const body = editText.trim();
    if (!body) return;
    await cctUpdate(NN.comment, id, { body });
    setEditId(null);
    setEditText("");
    await load();
  };

  // Build threaded tree: top-level (no parent_id) → children by parent_id.
  const { topLevel, childrenOf, openCount, resolvedCount } = useMemo(() => {
    const kids: Record<string, Comment[]> = {};
    const roots: Comment[] = [];
    for (const c of items) {
      if (c.parent_id && String(c.parent_id).trim()) {
        (kids[String(c.parent_id)] ||= []).push(c);
      } else {
        roots.push(c);
      }
    }
    const shown = roots.filter((c) => {
      if (filter === "all") return true;
      if (filter === "resolved") return Number(c.resolved) === 1;
      return Number(c.resolved) !== 1;
    });
    let openN = 0, resN = 0;
    for (const c of roots) (Number(c.resolved) === 1 ? resN++ : openN++);
    return { topLevel: shown, childrenOf: kids, openCount: openN, resolvedCount: resN };
  }, [items, filter]);

  const renderComment = (c: Comment, depth = 0) => {
    const isResolved = Number(c.resolved) === 1;
    const kids = childrenOf[String(c.id)] || [];
    const isMine = String(c.author_id) === String(user?.user_id);
    const isEditing = editId === String(c.id);
    const isCollapsed = !!collapsed[String(c.id)];
    return (
      <div key={c.id} style={{ padding: "10px 0", borderBottom: depth === 0 ? "1px solid var(--nn-border)" : "none", display: "flex", gap: 10, marginLeft: depth * 28, opacity: isResolved ? 0.65 : 1 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--nn-blue-bg)", color: "var(--nn-blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
          {(c.author_display || "?").charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, color: "var(--nn-text-secondary)", marginBottom: 2, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <strong style={{ color: "var(--nn-text)" }}>{c.author_display || "Anonymous"}</strong>
            {c.created_at && <span style={{ fontSize: 11 }} title={new Date(c.created_at).toLocaleString()}>{relTime(c.created_at)}</span>}
            {isResolved && <span style={{ fontSize: 10, background: "rgba(68,131,97,0.14)", color: "#448361", padding: "1px 6px", borderRadius: 3 }}>Resolved</span>}
          </div>
          {isEditing ? (
            <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
              <input
                className="nn-auth-input"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(String(c.id)); }
                  if (e.key === "Escape") { setEditId(null); setEditText(""); }
                }}
                autoFocus
                style={{ marginBottom: 0, flex: 1 }}
              />
              <button className="nn-btn-primary" onClick={() => saveEdit(String(c.id))} disabled={!editText.trim()} style={{ fontSize: 12 }}>Save</button>
              <button className="nn-topbar-btn" onClick={() => { setEditId(null); setEditText(""); }} style={{ fontSize: 12 }}>Cancel</button>
            </div>
          ) : (
            <div style={{ fontSize: 14, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{c.body}</div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 12, color: "var(--nn-text-secondary)" }}>
            {depth === 0 && (
              <button onClick={() => { setReplyTo(String(c.id)); setReplyText(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0 }}>Reply</button>
            )}
            {isMine && !isEditing && (
              <button onClick={() => { setEditId(String(c.id)); setEditText(c.body || ""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0 }}>Edit</button>
            )}
            {depth === 0 && kids.length > 0 && (
              <button onClick={() => setCollapsed((s) => ({ ...s, [String(c.id)]: !isCollapsed }))} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0 }}>
                {isCollapsed ? `Show ${kids.length} ${kids.length === 1 ? "reply" : "replies"}` : "Hide replies"}
              </button>
            )}
          </div>
          {replyTo === String(c.id) && (
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <input
                className="nn-auth-input"
                placeholder="Write a reply…"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(replyText, String(c.id)).then(() => { setReplyTo(null); setReplyText(""); }); }
                  if (e.key === "Escape") { setReplyTo(null); setReplyText(""); }
                }}
                autoFocus
                style={{ marginBottom: 0, flex: 1 }}
              />
              <button className="nn-btn-primary" onClick={() => submit(replyText, String(c.id)).then(() => { setReplyTo(null); setReplyText(""); })} disabled={busy || !replyText.trim()} style={{ fontSize: 12 }}>Reply</button>
            </div>
          )}
          {!isCollapsed && kids.map((k) => renderComment(k, depth + 1))}
        </div>
        {depth === 0 && (
          isResolved ? (
            <button onClick={() => setResolved(c.id, 0)} title="Unresolve" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-tertiary)" }}><RotateCcw size={13} /></button>
          ) : (
            <button onClick={() => setResolved(c.id, 1)} title="Resolve" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-tertiary)" }}><Check size={13} /></button>
          )
        )}
        {isMine && (
          <button onClick={() => remove(c.id)} title="Delete" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--nn-text-tertiary)" }}><Trash2 size={13} /></button>
        )}
      </div>
    );
  };

  return (
    <div style={{ marginTop: 48, borderTop: "1px solid var(--nn-border)", paddingTop: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <MessageSquare size={13} style={{ color: "var(--nn-text-tertiary)" }} />
        <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "var(--nn-text-tertiary)" }}>Comments</div>
        <div style={{ flex: 1 }} />
        <Filter size={12} style={{ color: "var(--nn-text-tertiary)" }} />
        <select value={filter} onChange={(e) => setFilter(e.target.value as FilterMode)} className="nn-topbar-btn" style={{ padding: "2px 6px", fontSize: 11 }}>
          <option value="open">Open ({openCount})</option>
          <option value="resolved">Resolved ({resolvedCount})</option>
          <option value="all">All ({openCount + resolvedCount})</option>
        </select>
      </div>
      <div>
        {topLevel.map((c) => renderComment(c))}
        {!topLevel.length && <div style={{ color: "var(--nn-text-tertiary)", fontSize: 13, padding: "8px 0" }}>No {filter === "resolved" ? "resolved" : filter === "all" ? "" : "open"} comments.</div>}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          data-nn-comment-input="1"
          className="nn-auth-input"
          placeholder="Add a comment… (use @123 to mention user ID 123)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(text).then(() => setText("")); } }}
          style={{ marginBottom: 0, flex: 1 }}
        />
        <button className="nn-btn-primary" onClick={() => submit(text).then(() => setText(""))} disabled={busy || !text.trim()} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Send size={13} /> Send
        </button>
      </div>
    </div>
  );
}
