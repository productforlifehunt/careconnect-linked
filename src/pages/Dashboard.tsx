import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { sampleBookings, careTasks, journalEntries, careCircleMembers } from "@/data/mockData";
import {
  CalendarDays, Users, MapPin, Clock, ArrowRight, CheckCircle, AlertCircle, MessageSquare
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const upcomingBookings = sampleBookings.filter(b => b.status !== "completed").slice(0, 3);
  const pendingTasks = careTasks.filter(t => t.status !== "completed").slice(0, 4);
  const recentJournal = journalEntries.slice(0, 3);
  const onlineMembers = careCircleMembers.filter(m => m.status === "online");

  const statusColors: Record<string, string> = {
    confirmed: "bg-success text-success-foreground",
    pending: "bg-warning text-warning-foreground",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive text-destructive-foreground",
  };

  const priorityColors: Record<string, string> = {
    high: "bg-destructive/10 text-destructive",
    medium: "bg-warning/10 text-warning",
    low: "bg-muted text-muted-foreground",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(" ")[0]}!</h1>
        <p className="text-muted-foreground">Here's your care overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Upcoming Bookings", value: upcomingBookings.length, icon: CalendarDays, color: "text-primary" },
          { label: "Care Circle", value: `${onlineMembers.length} online`, icon: Users, color: "text-success" },
          { label: "Pending Tasks", value: pendingTasks.length, icon: AlertCircle, color: "text-warning" },
          { label: "Messages", value: 3, icon: MessageSquare, color: "text-coral" },
        ].map(stat => (
          <Card key={stat.label} className="border-transparent card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <Card className="border-transparent card-elevated">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">Upcoming Bookings</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/bookings")}>View all <ArrowRight className="ml-1 h-3 w-3" /></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingBookings.map(b => (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="text-center shrink-0">
                  <p className="text-xs text-muted-foreground">{new Date(b.date).toLocaleDateString("en", { month: "short" })}</p>
                  <p className="text-lg font-bold text-foreground">{new Date(b.date).getDate()}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{b.caregiverName}</p>
                  <p className="text-xs text-muted-foreground">{b.time} · {b.duration}hrs · {b.type}</p>
                </div>
                <Badge className={statusColors[b.status]}>{b.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Care Tasks */}
        <Card className="border-transparent card-elevated">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-lg">Care Tasks</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/care-circle")}>View all <ArrowRight className="ml-1 h-3 w-3" /></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingTasks.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle className={`h-4 w-4 shrink-0 ${t.status === "completed" ? "text-success" : "text-muted-foreground"}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.assignee} · Due {new Date(t.dueDate).toLocaleDateString("en", { month: "short", day: "numeric" })}</p>
                </div>
                <Badge variant="outline" className={priorityColors[t.priority]}>{t.priority}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Care Journal */}
        <Card className="border-transparent card-elevated">
          <CardHeader><CardTitle className="text-lg">Care Journal</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {recentJournal.map(j => (
              <div key={j.id} className="border-b last:border-0 pb-3 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-foreground">{j.author}</span>
                  <span className="text-xs text-muted-foreground">{new Date(j.date).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{j.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-transparent card-elevated">
          <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/search")}>
              <CalendarDays className="h-5 w-5 text-primary" />
              <span className="text-xs">Book Care</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/care-circle")}>
              <Users className="h-5 w-5 text-primary" />
              <span className="text-xs">Care Circle</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/gps-tracking")}>
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-xs">GPS Track</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate("/messages")}>
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="text-xs">Messages</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
