import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CalendarDays, Users, MessageSquare, AlertTriangle, Settings, Loader2, Check, X, UserPlus } from "lucide-react";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useMyPendingInvitations, useAcceptInvitation, useDeclineInvitation } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useSite } from "@/contexts/SiteContext";

import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const site = useSite();
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const { data: pendingInvitations } = useMyPendingInvitations();
  const acceptInvitation = useAcceptInvitation();
  const declineInvitation = useDeclineInvitation();

  const allNotifs = notifications || [];
  const unreadCount = allNotifs.filter(n => !n.is_read).length;
  const invitationCount = (pendingInvitations || []).length;

  const typeIcons: Record<string, React.ReactNode> = {
    booking: <CalendarDays className="h-5 w-5 text-primary" />,
    booking_confirmed: <Check className="h-5 w-5 text-success" />,
    booking_approved: <Check className="h-5 w-5 text-success" />,
    booking_request: <CalendarDays className="h-5 w-5 text-primary" />,
    appointment: <CalendarDays className="h-5 w-5 text-primary" />,
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

  const handleAccept = (inv: any) => {
    acceptInvitation.mutate({ id: inv.id, care_group_id: inv.care_group_id, source: inv.source }, {
      onSuccess: () => toast({ title: "Joined group!", description: `You've joined ${inv.group?.name || "the care group"}` }),
      onError: (err: any) => toast({ title: "Failed to join", description: err.message, variant: "destructive" }),
    });
  };

  const handleDecline = (inv: any) => {
    declineInvitation.mutate({ id: inv.id, source: inv.source }, {
      onSuccess: () => toast({ title: "Invitation declined" }),
    });
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">{unreadCount} unread{invitationCount > 0 ? ` · ${invitationCount} pending invitation${invitationCount > 1 ? "s" : ""}` : ""}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>Mark all as read</Button>
        )}
      </div>

      {/* Pending Group Invitations */}
      {invitationCount > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" /> Group Invitations ({invitationCount})
          </h2>
          <div className="space-y-2">
            {(pendingInvitations || []).map((inv: any) => (
              <Card key={inv.id} className="border-transparent card-elevated border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{inv.group?.name || site.careGroupSingular}</p>
                        <p className="text-xs text-muted-foreground">
                          {inv.group?.description ? inv.group.description.substring(0, 60) + (inv.group.description.length > 60 ? "…" : "") : `You've been invited to join this ${site.careGroupSingular.toLowerCase()}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Received {new Date(inv.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="coral" onClick={() => handleAccept(inv)} disabled={acceptInvitation.isPending}>
                        <Check className="h-3.5 w-3.5 mr-1" /> Accept
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDecline(inv)} disabled={declineInvitation.isPending}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="booking">Bookings</TabsTrigger>
          <TabsTrigger value="care">{site.navLabels.careGroups}</TabsTrigger>
          <TabsTrigger value="message">Messages</TabsTrigger>
        </TabsList>

        {["all", "booking", "care", "message"].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-2">
            {filterNotifs(tab).length > 0 ? filterNotifs(tab).map(n => (
              <Card
                key={n.id}
                className={`cursor-pointer transition-colors border-transparent ${n.is_read ? "opacity-70" : "card-elevated"}`}
                onClick={() => {
                  if (!n.is_read) markRead.mutate(n.id);
                  // Fix legacy paths
                  let url = n.link_url;
                  if (url?.includes("/dashboard/appointments")) url = "/bookings";
                  if (url?.includes("/dashboard/booking-history")) url = "/bookings";
                  if (url) navigate(url);
                }}
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
