import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import Messages from "./Messages";
import Notifications from "./Notifications";
import { useNotifications } from "@/hooks/use-care-data";

/**
 * Unified Inbox page — merges Messages + Notifications into a single
 * mobile-friendly entry point reachable from the bottom navigation bar.
 */
export default function Inbox() {
  const { t, i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const [params, setParams] = useSearchParams();
  const initial = params.get("tab") === "messages" ? "messages" : "notifications";
  const [tab, setTab] = useState(initial);

  const { data: notifications } = useNotifications();
  const unreadNotif = (notifications || []).filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-foreground">
          {isChinese ? "收件箱" : "Inbox"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
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
          <TabsList className="grid grid-cols-2 w-full h-11 bg-muted/50 rounded-xl p-1">
            <TabsTrigger
              value="notifications"
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2"
            >
              <Bell className="h-4 w-4" />
              {isChinese ? "通知" : "Notifications"}
              {unreadNotif > 0 && (
                <Badge className="h-5 min-w-5 px-1.5 bg-coral text-coral-foreground text-[10px]">
                  {unreadNotif}
                </Badge>
              )}
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
