import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bell, Inbox as InboxIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import Messages from "./Messages";
import Notifications from "./Notifications";
import { useNotifications } from "@/hooks/use-care-data";

/**
 * Unified Inbox — 3 tabs:
 *  - 全部 (All): default, aggregates notifications + messages
 *  - 通知 (Notifications): notifications only
 *  - 消息 (Messages): messages only
 * Most users will stay on 全部; the dedicated tabs are an accessibility
 * affordance for older users who want one stream at a time.
 */
export default function Inbox() {
  const { i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const [params, setParams] = useSearchParams();
  const initial = (() => {
    const p = params.get("tab");
    if (p === "messages") return "messages";
    if (p === "notifications") return "notifications";
    return "all";
  })();
  const [tab, setTab] = useState(initial);

  const { data: notifications } = useNotifications();
  const unreadNotif = (notifications || []).filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 pt-5 pb-2">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
          {isChinese ? "收件箱" : "Inbox"}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isChinese ? "消息与通知" : "Messages & notifications"}
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v);
          const next = new URLSearchParams(params);
          next.set("tab", v);
          setParams(next, { replace: true });
        }}
        className="w-full"
      >
        <div className="max-w-3xl mx-auto px-4">
          <TabsList className="grid grid-cols-3 w-full h-11 bg-muted/50 rounded-xl p-1">
            <TabsTrigger
              value="all"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
            >
              <InboxIcon className="h-4 w-4" />
              {isChinese ? "全部" : "All"}
              {unreadNotif > 0 && (
                <Badge className="h-5 min-w-5 px-1.5 bg-coral text-coral-foreground text-[10px]">
                  {unreadNotif}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
            >
              <Bell className="h-4 w-4" />
              {isChinese ? "通知" : "Notifications"}
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              {isChinese ? "消息" : "Messages"}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0 focus-visible:outline-none">
          <div className="max-w-3xl mx-auto">
            <Notifications />
            <div className="border-t border-border/60 mt-2" />
            <Messages />
          </div>
        </TabsContent>
        <TabsContent value="notifications" className="mt-0 focus-visible:outline-none">
          <Notifications />
        </TabsContent>
        <TabsContent value="messages" className="mt-0 focus-visible:outline-none">
          <Messages />
        </TabsContent>
      </Tabs>
    </div>
  );
}
