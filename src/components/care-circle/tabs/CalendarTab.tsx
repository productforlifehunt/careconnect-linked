import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, MapPin, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDate, formatTime, formatDateTime } from "@/lib/locale";

interface CalendarTabProps {
  tasks: any[];
}

export function CalendarTab({ tasks }: CalendarTabProps) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);

  const helpStatusColors: Record<string, string> = {
    b55: "bg-muted text-muted-foreground",
    b56: "bg-warning/10 text-warning",
    b57: "bg-success/10 text-success",
  };
  const helpStatusLabels: Record<string, string> = {
    b55: Z("无需帮助", "No help needed"),
    b56: Z("需要帮助", "Needs help"),
    b57: Z("已找到帮助", "Help found"),
  };

  const getDateKey = (t: any): string | null => {
    const raw = t.task_date || t.start_time || t.due_date;
    if (!raw) return null;
    return String(raw).split("T")[0].split(" ")[0];
  };

  const fmtTime = (raw?: string | null) => {
    if (!raw) return "";
    const s = String(raw);
    const m = s.match(/(\d{2}):(\d{2})/);
    return m ? `${m[1]}:${m[2]}` : "";
  };

  const tasksByDate: Record<string, any[]> = {};
  (tasks || []).forEach((t: any) => {
    const d = getDateKey(t);
    if (!d) return;
    if (!tasksByDate[d]) tasksByDate[d] = [];
    tasksByDate[d].push(t);
  });
  const sortedDates = Object.keys(tasksByDate).sort();

  return sortedDates.length > 0 ? (
    <div>
      {sortedDates.map(date => (
        <div key={date} className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            {formatDate(date + "T00:00", isCN ? "zh-CN" : "en", { weekday: "long", month: "long", day: "numeric" })}
          </h3>
          <div className="space-y-2">
            {tasksByDate[date]
              .sort((a, b) => fmtTime(a.start_time).localeCompare(fmtTime(b.start_time)))
              .map((t: any) => {
               const isDone = String(t.finish_status) === "b56";
              const start = fmtTime(t.start_time);
              const end = fmtTime(t.end_time);
              return (
                <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg bg-card border">
                  {isDone
                    ? <CheckCircle className="h-4 w-4 text-success mt-0.5" />
                    : <Circle className="h-4 w-4 text-muted-foreground mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-foreground ${isDone ? "line-through opacity-60" : ""}`}>{t.title}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs text-muted-foreground">
                      {(start || end) && (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />{start}{end ? `–${end}` : ""}
                        </span>
                      )}
                      {t.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{t.location}
                        </span>
                      )}
                      {Array.isArray(t.assignees) && t.assignees.length > 0 && (
                        <span>{Z(`已分配 ${t.assignees.length} 人`, `${t.assignees.length} assigned`)}</span>
                      )}
                    </div>
                  </div>
                   <Badge variant="outline" className={helpStatusColors[String(t.help_status)]}>
                     {helpStatusLabels[String(t.help_status)]}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-center py-12 text-muted-foreground">{Z("暂无安排的任务。为任务添加日期后会显示在这里。", "No scheduled tasks. Add a date to a task to see it here.")}</p>
  );
}
