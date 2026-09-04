import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";

/**
 * Optional "only watch this area between these times" window.
 * Writes CCT 214 a66 (on/off), a67 (start) and a68 (end).
 */
export interface ZoneScheduleValue {
  schedule_enabled: boolean;
  schedule_start_time: string;
  schedule_end_time: string;
}

/** Datetime pickers speak local time; the CCT keeps a full timestamp. */
export function toLocalInput(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

export function ZoneScheduleFields({
  value,
  onChange,
}: {
  value: ZoneScheduleValue;
  onChange: (next: Partial<ZoneScheduleValue>) => void;
}) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm">{Z("只在某段时间内提醒", "Only alert during set times")}</Label>
          <p className="text-xs text-muted-foreground">
            {Z("关闭时全天都会提醒。", "When off, alerts work around the clock.")}
          </p>
        </div>
        <Switch
          checked={value.schedule_enabled}
          onCheckedChange={(v) => onChange({ schedule_enabled: v })}
          aria-label={Z("只在某段时间内提醒", "Only alert during set times")}
        />
      </div>

      {value.schedule_enabled && (
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <Label htmlFor="zone-schedule-start" className="text-sm">{Z("开始", "Starts")}</Label>
            <Input
              id="zone-schedule-start"
              type="datetime-local"
              value={toLocalInput(value.schedule_start_time)}
              onChange={(e) => onChange({ schedule_start_time: fromLocalInput(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="zone-schedule-end" className="text-sm">{Z("结束", "Ends")}</Label>
            <Input
              id="zone-schedule-end"
              type="datetime-local"
              value={toLocalInput(value.schedule_end_time)}
              onChange={(e) => onChange({ schedule_end_time: fromLocalInput(e.target.value) })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
