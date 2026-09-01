import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/lib/locale";

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

  const toKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const getDateKey = (t: any): string | null => {
    const raw = t.task_date || t.start_time || t.due_date;
    if (!raw) return null;
    return String(raw).split("T")[0].split(" ")[0];
  };

  const fmtTime = (raw?: string | null) => {
    if (!raw) return "";
    const m = String(raw).match(/(\d{2}):(\d{2})/);
    return m ? `${m[1]}:${m[2]}` : "";
  };

  const tasksByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    (tasks || []).forEach((t: any) => {
      const d = getDateKey(t);
      if (!d) return;
      (map[d] ||= []).push(t);
    });
    Object.values(map).forEach((list) =>
      list.sort((a, b) => fmtTime(a.start_time).localeCompare(fmtTime(b.start_time)))
    );
    return map;
  }, [tasks]);

  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string>(toKey(today));

  const weekLabels = isCN
    ? ["日", "一", "二", "三", "四", "五", "六"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Grid always renders 6 weeks so the layout never jumps between months.
  const gridDays = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const selectedTasks = tasksByDate[selected] || [];
  const monthLabel = formatDate(
    `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-01T00:00`,
    isCN ? "zh-CN" : "en",
    { year: "numeric", month: "long" }
  );

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-transparent card-elevated p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label={Z("上一月", "Previous month")}
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm font-semibold text-foreground">{monthLabel}</p>
          <Button
            variant="ghost"
            size="icon"
            aria-label={Z("下一月", "Next month")}
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekLabels.map((w) => (
            <div key={w} className="text-center text-[11px] text-muted-foreground py-1">{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {gridDays.map((d) => {
            const key = toKey(d);
            const inMonth = d.getMonth() === cursor.getMonth();
            const count = (tasksByDate[key] || []).length;
            const isToday = key === toKey(today);
            const isSelected = key === selected;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors
                  ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                  ${inMonth ? "text-foreground" : "text-muted-foreground/50"}
                  ${isToday && !isSelected ? "ring-1 ring-primary" : ""}`}
              >
                <span className={isSelected ? "" : inMonth ? "" : "opacity-60"}>{d.getDate()}</span>
                {count > 0 && (
                  <span className={`mt-0.5 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-primary-foreground" : "bg-primary"}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">
          {formatDate(selected + "T00:00", isCN ? "zh-CN" : "en", { weekday: "long", month: "long", day: "numeric" })}
        </h3>
        {selectedTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            {Z("这一天没有安排的任务。", "No tasks scheduled for this day.")}
          </p>
        ) : (
          <div className="space-y-2">
            {selectedTasks.map((t: any) => {
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
        )}
      </div>
    </div>
  );
}
