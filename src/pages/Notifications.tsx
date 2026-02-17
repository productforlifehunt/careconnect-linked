import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CalendarDays, Users, MessageSquare, AlertTriangle, Settings, Loader2 } from "lucide-react";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/use-care-data";

export default function Notifications() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const allNotifs = notifications || [];
  const unreadCount = allNotifs.filter(n => !n.is_read).length;

  const typeIcons: Record<string, React.ReactNode> = {
    booking: <CalendarDays className="h-5 w-5 text-primary" />,
    booking_confirmed: <CalendarDays className="h-5 w-5 text-primary" />,
    booking_request: <CalendarDays className="h-5 w-5 text-primary" />,
    "care-circle": <Users className="h-5 w-5 text-success" />,
    care_group: <Users className="h-5 w-5 text-success" />,
    task: <Users className="h-5 w-5 text-success" />,
    message: <MessageSquare className="h-5 w-5 text-coral" />,
    safety: <AlertTriangle className="h-5 w-5 text-warning" />,
    system: <Settings className="h-5 w-5 text-muted-foreground" />,
  };

  const filterNotifs = (type?: string) => {
    if (!type || type === "all") return allNotifs;
    return allNotifs.filter(n => n.type.startsWith(type));
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>Mark all as read</Button>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="booking">Bookings</TabsTrigger>
          <TabsTrigger value="care">Care Circle</TabsTrigger>
          <TabsTrigger value="message">Messages</TabsTrigger>
        </TabsList>

        {["all", "booking", "care", "message"].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-2">
            {filterNotifs(tab).length > 0 ? filterNotifs(tab).map(n => (
              <Card
                key={n.id}
                className={`cursor-pointer transition-colors border-transparent ${n.is_read ? "opacity-70" : "card-elevated"}`}
                onClick={() => !n.is_read && markRead.mutate(n.id)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{typeIcons[n.type] || <Bell className="h-5 w-5 text-muted-foreground" />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm ${n.is_read ? "font-normal text-muted-foreground" : "font-semibold text-foreground"}`}>{n.title}</h3>
                      {!n.is_read && <div className="w-2 h-2 rounded-full bg-coral shrink-0" />}
                    </div>
                    {n.content && <p className="text-sm text-muted-foreground mt-0.5">{n.content}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })} at{" "}
                      {new Date(n.created_at).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="text-center py-12">
                <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No notifications in this category</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
