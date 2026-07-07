import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useNotchAuth } from "@/notch/context/NotchAuthContext";
import { useNotchPath } from "@/notch/context/NotchBaseContext";
import {
  listNotifications, markRead, markAllRead, deleteNotification,
  tickReminderQueue, requestBrowserNotificationPermission,
  type AppNotification,
} from "@/notch/lib/nn-notifications";
import { Bell, Check, Trash2, CheckCheck } from "lucide-react";

function timeAgo(iso?: string) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function NotchNotifications() {
  const { user } = useNotchAuth();
  const path = useNotchPath();
  const nav = useNavigate();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      await tickReminderQueue(String(user.user_id));
      setItems(await listNotifications(String(user.user_id)));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const onRead = async (id: string) => { await markRead(id); load(); };
  const onDelete = async (id: string) => { await deleteNotification(id); load(); };
  const onReadAll = async () => { if (user) { await markAllRead(String(user.user_id)); load(); } };
  const onEnableBrowser = async () => { await requestBrowserNotificationPermission(); };

  const openTarget = async (n: AppNotification) => {
    if (!n.read_at) await markRead(n.id);
    if (n.block_id) nav(path(`/p/${n.block_id}`));
  };

  return (
    <div className="nn-page-scroll">
      <div className="nn-page">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 28, fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
            <Bell size={24} /> Notifications
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="nn-topbar-btn" onClick={onEnableBrowser} title="Enable browser notifications">Enable push</button>
            <button className="nn-topbar-btn" onClick={onReadAll}><CheckCheck size={14} style={{ marginRight: 4 }} /> Mark all read</button>
          </div>
        </div>

        {loading && <div style={{ color: "var(--nn-text-tertiary)" }}>Loading…</div>}
        {!loading && items.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "var(--nn-text-tertiary)" }}>
            <Bell size={40} style={{ opacity: 0.3 }} />
            <div style={{ marginTop: 10 }}>No notifications yet.</div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {items.map((n) => {
            let payload: any = {};
            try { payload = n.payload ? JSON.parse(n.payload as any) : {}; } catch { /* noop */ }
            return (
              <div
                key={n.id}
                onClick={() => openTarget(n)}
                style={{
                  padding: "10px 12px", border: "1px solid var(--nn-border)", borderRadius: 6,
                  display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer",
                  background: n.read_at ? "transparent" : "rgba(35,131,226,0.06)",
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.read_at ? "transparent" : "var(--nn-blue)", marginTop: 6 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {n.type === "reminder" && "⏰ Reminder"}
                    {n.type === "mention" && "💬 You were mentioned"}
                    {n.type === "comment" && "💬 New comment"}
                    {n.type === "invite" && "✉️ Workspace invite"}
                    {n.type === "assignment" && "📌 Task assigned"}
                    {n.type === "share" && "🔗 Page shared with you"}
                    {!["reminder","mention","comment","invite","assignment","share"].includes(String(n.type)) && n.type}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--nn-text-secondary)", marginTop: 2 }}>
                    {payload.message || payload.remind_at || (n.block_id ? `Page ${n.block_id}` : "")}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--nn-text-tertiary)", marginTop: 2 }}>{timeAgo(n.created_at)}</div>
                </div>
                <div style={{ display: "flex", gap: 4 }} onClick={(e) => e.stopPropagation()}>
                  {!n.read_at && <button className="nn-topbar-btn" onClick={() => onRead(n.id)} title="Mark read"><Check size={14} /></button>}
                  <button className="nn-topbar-btn" onClick={() => onDelete(n.id)} title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
