import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bell, Inbox as InboxIcon, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDate, formatTime } from "@/lib/locale";
import Messages from "./Messages";
import Notifications from "./Notifications";
import {
  useNotifications,
  useConversations,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useMyProfile,
} from "@/hooks/use-care-data";

/**
 * Unified Inbox — 3 tabs:
 *  - All: one chronological stream where every row carries a
 *    "Notification" or "Message" tag. Not two stacked lists.
 *  - Notifications: notifications only
 *  - Messages: the conversation view only
 * There are no standalone /notifications or /messages pages: those paths
 * redirect here with the matching tab, so this file is the single surface.
 */
export default function Inbox() {
  const { i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isChinese ? cn : en);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const initial = (() => {
    const p = params.get("tab");
    if (p === "messages") return "messages";
    if (p === "notifications") return "notifications";
    return "all";
  })();
  const [tab, setTab] = useState(initial);
  // Read-state filter, shared by all three tabs (macOS Mail style: tabs left,
  // All / Unread / Read segmented control right, same row).
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all");

  const { data: notifications, isLoading: notifsLoading } = useNotifications();
  const { data: conversations, isLoading: convosLoading } = useConversations();
  const { data: profile } = useMyProfile();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadNotif = (notifications || []).filter((n: any) => !n.is_read).length;
  const unreadMsgs = (conversations || []).reduce((sum: number, c: any) => sum + (c.unread_count || 0), 0);
  const unreadAll = unreadNotif + unreadMsgs;

  const switchTab = (v: string, state?: any) => {
    setTab(v);
    const next = new URLSearchParams(params);
    next.set("tab", v);
    setParams(next, { replace: true });
    if (state) navigate(`/inbox?tab=${v}`, { state, replace: true });
  };

  // One merged stream, newest first. Notifications keep their own row; each
  // conversation contributes its latest message as a single row.
  const feed = [
    ...(notifications || []).map((n: any) => ({
      kind: "notification" as const,
      id: `n-${n.id}`,
      at: n.created_at,
      title: n.title,
      body: n.message || n.content || "",
      unread: !n.is_read,
      raw: n,
    })),
    ...(conversations || []).map((c: any) => {
      const numeric = c.other_user_id ? String(c.other_user_id).replace(/^wp-/, "") : "";
      const name =
        c.other_user_name ||
        (c.chat_name && !String(c.chat_name).startsWith("__group:") ? String(c.chat_name) : "") ||
        (numeric ? (isChinese ? `用户 ${numeric}` : `User ${numeric}`) : Z("对话", "Conversation"));
      const last = c.last_message?.message_content || "";
      const mine = c.last_message?.sender_id && profile?.id && c.last_message.sender_id === profile.id;
      return {
        kind: "message" as const,
        id: `c-${c.id}`,
        at: c.last_message_at || c.created_at,
        title: name,
        body: (mine ? `${Z("你", "You")}: ` : "") + last.substring(0, 80),
        unread: (c.unread_count || 0) > 0,
        raw: c,
      };
    }),
  ]
    .filter((r) => (readFilter === "all" ? true : readFilter === "unread" ? r.unread : !r.unread))
    .sort((a, b) => new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime());


  const openRow = (row: (typeof feed)[number]) => {
    if (row.kind === "notification") {
      const n = row.raw;
      if (!n.is_read) markRead.mutate(n.id);
      let url = n.action_url || n.link_url;
      if (url?.includes("/dashboard/appointments")) url = "/bookings";
      if (url?.includes("/dashboard/booking-history")) url = "/bookings";
      if (url?.startsWith("/messages")) {
        switchTab("messages");
        return;
      }
      if (url?.startsWith("/notifications")) {
        switchTab("notifications");
        return;
      }
      if (url) navigate(url);
      return;
    }
    switchTab("messages", row.raw.other_user_id ? { targetUserId: row.raw.other_user_id, targetUserName: row.title } : undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 pt-5 pb-2">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          {Z("收件箱", "Inbox")}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {Z("消息与通知", "Messages & notifications")}
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => switchTab(v)} className="w-full">
        <div className="max-w-3xl mx-auto px-4 flex items-center gap-2">
          <TabsList className="grid grid-cols-3 flex-1 min-w-0 h-11 bg-muted/50 rounded-xl p-1">
            <TabsTrigger
              value="all"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1.5 px-1"
            >
              <InboxIcon className="h-4 w-4 shrink-0" />
              <span className="truncate">{Z("全部", "All")}</span>
              {unreadAll > 0 && (
                <Badge className="h-5 min-w-5 px-1.5 bg-coral text-coral-foreground text-[10px]">
                  {unreadAll}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1.5 px-1"
            >
              <Bell className="h-4 w-4 shrink-0" />
              <span className="truncate">{Z("通知", "Notifications")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm gap-1.5 px-1"
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="truncate">{Z("消息", "Messages")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Read-state filter, macOS Mail style: same row, right-aligned. */}
          <div className="flex h-11 shrink-0 items-center gap-1 rounded-xl bg-muted/50 p-1">
            {([
              ["all", Z("全部", "All")],
              ["unread", Z("未读", "Unread")],
              ["read", Z("已读", "Read")],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setReadFilter(key)}
                aria-pressed={readFilter === key}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  readFilter === key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <TabsContent value="all" className="mt-0 focus-visible:outline-none">
          <div className="max-w-3xl mx-auto px-4 py-4">
            {notifsLoading || convosLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : feed.length === 0 ? (
              <div className="text-center py-16">
                <InboxIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">{Z("暂时没有新内容", "Nothing here yet")}</p>
              </div>
            ) : (
              <>
                {unreadNotif > 0 && (
                  <div className="flex justify-end mb-2">
                    <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>
                      {Z("全部标为已读", "Mark all as read")}
                    </Button>
                  </div>
                )}
                <div className="space-y-2">
                  {feed.map((row) => (
                    <Card
                      key={row.id}
                      className={`cursor-pointer transition-colors border-transparent ${row.unread ? "card-elevated" : "opacity-70"}`}
                      onClick={() => openRow(row)}
                    >
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {row.kind === "notification" ? (
                            <Bell className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <MessageSquare className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {row.kind === "notification" ? Z("通知", "Notification") : Z("消息", "Message")}
                            </Badge>
                            <h3
                              className={`text-sm truncate ${row.unread ? "font-semibold text-foreground" : "font-normal text-muted-foreground"}`}
                            >
                              {row.title}
                            </h3>
                            {row.unread && <div className="w-2 h-2 rounded-full bg-coral shrink-0" />}
                          </div>
                          {row.body && (
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{row.body}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(row.at, i18n.language, { month: "short", day: "numeric" })}{" "}
                            {formatTime(row.at, "en", { hour: "numeric", minute: "2-digit" })}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>
        <TabsContent value="notifications" className="mt-0 focus-visible:outline-none">
          <Notifications embedded readFilter={readFilter} />
        </TabsContent>
        <TabsContent value="messages" className="mt-0 focus-visible:outline-none">
          <Messages embedded readFilter={readFilter} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
