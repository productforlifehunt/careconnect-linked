import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  CalendarEvent, CalendarEventType, EVENT_TYPE_COLORS, getEventTypeLabel,
} from "@/features/calendar/types";
import {
  createCalendarEventWordPress,
  updateCalendarEventWordPress,
} from "@/features/calendar/source.wordpress";

const TYPES: CalendarEventType[] = [
  "personal", "family", "medicine", "task", "appointment",
  "availability", "birthday", "holiday", "booking", "check_in",
];

const PRIORITIES: CalendarEvent["priority"][] = ["low", "normal", "high", "urgent"];

/** ISO → value for <input type="datetime-local"> in local time */
function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nextHourLocal(offsetHours = 1): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + offsetHours);
  return toLocalInput(d.toISOString());
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When present the dialog edits that event instead of creating one. */
  event?: CalendarEvent | null;
  onSaved?: () => void;
}

export default function EventFormDialog({ open, onOpenChange, event, onSaved }: Props) {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const isEdit = !!event?.id;

  const [title, setTitle] = useState("");
  const [type, setType] = useState<CalendarEventType>("personal");
  const [priority, setPriority] = useState<CalendarEvent["priority"]>("normal");
  const [start, setStart] = useState(nextHourLocal(1));
  const [end, setEnd] = useState(nextHourLocal(2));
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(event?.title ?? "");
    setType(event?.event_type ?? "personal");
    setPriority(event?.priority ?? "normal");
    setStart(toLocalInput(event?.start_at) || nextHourLocal(1));
    setEnd(toLocalInput(event?.end_at) || nextHourLocal(2));
    setAllDay(!!event?.all_day);
    setLocation(event?.location ?? "");
    setDescription(event?.description ?? "");
  }, [open, event]);

  const submit = async () => {
    if (!title.trim()) {
      toast.error(isZh ? "请填写标题" : "Please enter a title");
      return;
    }
    const startISO = new Date(start).toISOString();
    const endISO = new Date(end).toISOString();
    if (!allDay && new Date(endISO) <= new Date(startISO)) {
      toast.error(isZh ? "结束时间必须晚于开始时间" : "End time must be after the start time");
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<CalendarEvent> = {
        title: title.trim(),
        event_type: type,
        priority,
        status: "confirmed",
        start_at: startISO,
        end_at: endISO,
        all_day: allDay,
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        color: EVENT_TYPE_COLORS[type],
        is_availability: type === "availability",
        show_as: type === "availability" ? "free" : "busy",
        visibility: "default",
      };
      if (isEdit && event) {
        await updateCalendarEventWordPress(event.id, payload);
      } else {
        const created = await createCalendarEventWordPress(payload);
        if (!created) throw new Error("not-created");
      }
      toast.success(isZh ? (isEdit ? "已更新事件" : "事件已创建") : isEdit ? "Event updated" : "Event created");
      onOpenChange(false);
      onSaved?.();
    } catch {
      toast.error(isZh ? "保存失败，请重试" : "Could not save the event. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? (isZh ? "编辑事件" : "Edit event") : isZh ? "新建事件" : "New event"}
          </DialogTitle>
          <DialogDescription>
            {isZh ? "事件会保存到你的日历，并按类型着色。" : "Saved to your calendar and colour-coded by type."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="event-title">{isZh ? "标题" : "Title"} *</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isZh ? "例如：复诊预约" : "e.g. Follow-up appointment"}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{isZh ? "类型" : "Type"}</Label>
              <Select value={type} onValueChange={(v) => setType(v as CalendarEventType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{getEventTypeLabel(t, i18n.language)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{isZh ? "优先级" : "Priority"}</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as CalendarEvent["priority"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {isZh
                        ? { low: "低", normal: "普通", high: "高", urgent: "紧急" }[p]
                        : p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="event-start">{isZh ? "开始" : "Starts"}</Label>
              <Input id="event-start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-end">{isZh ? "结束" : "Ends"}</Label>
              <Input id="event-end" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="event-allday" checked={allDay} onCheckedChange={(c) => setAllDay(!!c)} />
            <Label htmlFor="event-allday" className="font-normal">{isZh ? "全天" : "All day"}</Label>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-location">{isZh ? "地点" : "Location"}</Label>
            <Input
              id="event-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={isZh ? "选填" : "Optional"}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-desc">{isZh ? "备注" : "Notes"}</Label>
            <Textarea
              id="event-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isZh ? "选填" : "Optional"}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {isZh ? "取消" : "Cancel"}
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? (isZh ? "保存中…" : "Saving…") : isZh ? "保存" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
