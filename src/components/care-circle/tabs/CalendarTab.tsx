import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle } from "lucide-react";

interface CalendarTabProps {
  tasks: any[];
}

export function CalendarTab({ tasks }: CalendarTabProps) {
  const priorityColors: Record<string, string> = {
    high: "bg-destructive/10 text-destructive", urgent: "bg-destructive/10 text-destructive",
    medium: "bg-warning/10 text-warning", low: "bg-muted text-muted-foreground",
  };

  const tasksByDate: Record<string, any[]> = {};
  (tasks || []).filter((t: any) => t.due_date).forEach((t: any) => {
    const d = t.due_date.split("T")[0];
    if (!tasksByDate[d]) tasksByDate[d] = [];
    tasksByDate[d].push(t);
  });
  const sortedDates = Object.keys(tasksByDate).sort();

  return sortedDates.length > 0 ? (
    <div>
      {sortedDates.map(date => (
        <div key={date} className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">{new Date(date + "T00:00").toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}</h3>
          <div className="space-y-2">
            {tasksByDate[date].map((t: any) => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border">
                {t.status === "completed" ? <CheckCircle className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.assignee_profile?.full_name || "Unassigned"}</p>
                </div>
                <Badge variant="outline" className={priorityColors[t.priority] || ""}>{t.priority}</Badge>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-center py-12 text-muted-foreground">No scheduled tasks. Add due dates to tasks to see them here.</p>
  );
}
