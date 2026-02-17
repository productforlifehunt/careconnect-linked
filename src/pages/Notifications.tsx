import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCircle, CalendarDays, Users, MapPin, MessageSquare, AlertTriangle, Settings } from "lucide-react";

interface Notification {
  id: string;
  type: "booking" | "care-circle" | "message" | "safety" | "system";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: "n1", type: "booking", title: "Booking Confirmed", description: "Sarah Johnson confirmed your booking for Feb 20 at 9:00 AM", time: "10 min ago", read: false },
  { id: "n2", type: "message", title: "New Message", description: "Dr. Rachel Green sent you a message about medication update", time: "1 hour ago", read: false },
  { id: "n3", type: "care-circle", title: "Task Completed", description: "David Smith completed: Pick up prescription from CVS", time: "2 hours ago", read: false },
  { id: "n4", type: "safety", title: "Geofence Alert", description: "Mom (Helen) left the home area at 2:30 PM", time: "3 hours ago", read: true },
  { id: "n5", type: "booking", title: "Booking Request", description: "You have a new booking request from Aisha Williams for Feb 22", time: "5 hours ago", read: true },
  { id: "n6", type: "care-circle", title: "Journal Entry", description: "Sarah Johnson posted a care update about today's visit", time: "6 hours ago", read: true },
  { id: "n7", type: "system", title: "Profile Reminder", description: "Complete your profile to get better caregiver matches", time: "1 day ago", read: true },
  { id: "n8", type: "booking", title: "Booking Completed", description: "Your session with Emily Park has been marked as completed", time: "2 days ago", read: true },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const unreadCount = notifications.filter(n => !n.read).length;

  const typeIcons: Record<string, React.ReactNode> = {
    booking: <CalendarDays className="h-5 w-5 text-primary" />,
    "care-circle": <Users className="h-5 w-5 text-success" />,
    message: <MessageSquare className="h-5 w-5 text-coral" />,
    safety: <AlertTriangle className="h-5 w-5 text-warning" />,
    system: <Settings className="h-5 w-5 text-muted-foreground" />,
  };

  const filterNotifs = (type?: string) => {
    if (!type || type === "all") return notifications;
    return notifications.filter(n => n.type === type);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>Mark all as read</Button>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="booking">Bookings</TabsTrigger>
          <TabsTrigger value="care-circle">Care Circle</TabsTrigger>
          <TabsTrigger value="message">Messages</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
        </TabsList>

        {["all", "booking", "care-circle", "message", "safety"].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-2">
            {filterNotifs(tab).length > 0 ? filterNotifs(tab).map(n => (
              <Card
                key={n.id}
                className={`cursor-pointer transition-colors border-transparent ${n.read ? "opacity-70" : "card-elevated"}`}
                onClick={() => markRead(n.id)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{typeIcons[n.type]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm ${n.read ? "font-normal text-muted-foreground" : "font-semibold text-foreground"}`}>{n.title}</h3>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-coral shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
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
