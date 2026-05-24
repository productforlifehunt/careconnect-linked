import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill, ClipboardCheck, CheckSquare, Clock } from "lucide-react";
import { useMedicines, useCareTasks, useCheckins, useTodayCheckinLogs, useTodayMedicineLogs } from "@/hooks/use-care-data";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface DailyTimelineProps {
  caredOneId: string;
  caredOneName: string;
}

interface TimelineItem {
  time: string;
  sortTime: number;
  label: string;
  type: "medicine" | "task" | "checkin";
  status: "done" | "pending" | "missed";
  icon: typeof Pill;
}

export function DailyTimeline({ caredOneId, caredOneName }: DailyTimelineProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const { data: medicines } = useMedicines(caredOneId);
  const { data: todayLogs } = useTodayMedicineLogs(caredOneId);
  const { data: tasks } = useCareTasks();
  const { data: checkins } = useCheckins(caredOneId);
  const { data: todayCheckinLogs } = useTodayCheckinLogs(caredOneId);

  const today = new Date().toDateString();

  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];

    // Add medicine time slots
    (medicines || []).forEach((med: any) => {
      const medLog = (todayLogs || []).find((l: any) => l.medicine_id === med.id);
      const medStatus = medLog?.status === "taken" ? "done" : medLog?.status === "skipped" ? "missed" : "pending";
      const slots = med.time_slot || [];
      if (slots.length === 0) {
        items.push({
          time: isZh ? "任意时间" : "Any time",
          sortTime: 1200,
          label: `${med.name} ${med.dosage ? `(${med.dosage})` : ""}`,
          type: "medicine",
          status: medStatus,
          icon: Pill,
        });
      } else {
        slots.forEach((slot: string) => {
          const hour = parseInt(slot.split(":")[0] || "12");
          const minute = parseInt(slot.split(":")[1] || "0");
          const isPM = hour >= 12;
          const display12 = `${hour > 12 ? hour - 12 : hour || 12}:${String(minute).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
          items.push({
            time: display12,
            sortTime: hour * 100 + minute,
            label: `${med.name} ${med.dosage ? `(${med.dosage})` : ""}`,
            type: "medicine",
            status: medStatus,
            icon: Pill,
          });
        });
      }
    });

    // Add today's tasks
    const todaysTasks = (tasks || []).filter((t: any) => {
      if (t.care_recipient_id !== caredOneId) return false;
      if (!t.due_date) return false;
      return new Date(t.due_date).toDateString() === today;
    });
    todaysTasks.forEach((t: any) => {
      items.push({
        time: isZh ? "今天" : "Today",
        sortTime: 900,
        label: t.title,
        type: "task",
        status: t.status === "completed" ? "done" : "pending",
        icon: CheckSquare,
      });
    });

    (checkins || []).forEach((checkin: any) => {
      const checkinLog = (todayCheckinLogs || []).find((l: any) => l.medicine_id === checkin.id);
      const checkinStatus = checkinLog?.status === "taken" ? "done" : checkinLog?.status === "skipped" ? "missed" : "pending";
      const slots = Array.isArray(checkin.time_slot) && checkin.time_slot.length > 0 ? checkin.time_slot : ["08:00"];
      slots.forEach((slot: string) => {
        const hour = parseInt(slot.split(":")[0] || "8");
        const minute = parseInt(slot.split(":")[1] || "0");
        const isPM = hour >= 12;
        const display12 = `${hour > 12 ? hour - 12 : hour || 12}:${String(minute).padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
        items.push({
          time: display12,
          sortTime: hour * 100 + minute,
          label: checkin.name || (isZh ? "每日打卡" : "Daily check-in"),
          type: "checkin",
          status: checkinStatus,
          icon: ClipboardCheck,
        });
      });
    });

    return items.sort((a, b) => a.sortTime - b.sortTime);
  }, [medicines, todayLogs, tasks, checkins, todayCheckinLogs, caredOneId, today]);

  const statusColor = {
    done: "bg-success/10 text-success border-success/30",
    pending: "bg-warning/10 text-warning border-warning/30",
    missed: "bg-destructive/10 text-destructive border-destructive/30",
  };

  const iconColor = {
    medicine: "text-primary",
    task: "text-secondary",
    checkin: "text-success",
  };

  if (timelineItems.length === 0) {
    return null;
  }

  return (
    <Card className="border-transparent card-elevated">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          {isZh ? `今日作息 — ${caredOneName}` : `Today's Routine — ${caredOneName}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-2">
            {timelineItems.map((item, i) => (
              <div key={`${item.type}-${i}`} className="flex items-start gap-3 relative">
                <div className={`z-10 shrink-0 w-9 h-9 rounded-full bg-card border-2 border-border flex items-center justify-center ${iconColor[item.type]}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-muted-foreground">{item.time}</span>
                    <Badge variant="outline" className={`text-[10px] ${statusColor[item.status]}`}>
                      {isZh ? ({ done: "已完成", pending: "待办", missed: "未完成" } as const)[item.status] : item.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground truncate">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
