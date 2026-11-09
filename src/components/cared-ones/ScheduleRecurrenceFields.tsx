import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const WEEKDAYS = [["MO", "一", "Mon"], ["TU", "二", "Tue"], ["WE", "三", "Wed"], ["TH", "四", "Thu"], ["FR", "五", "Fri"], ["SA", "六", "Sat"], ["SU", "日", "Sun"]] as const;

export function ScheduleRecurrenceFields({ frequency, interval, weekdays, onIntervalChange, onWeekdaysChange, Z }: {
  frequency: string;
  interval: string | number;
  weekdays: string[];
  onIntervalChange: (value: string) => void;
  onWeekdaysChange: (value: string[]) => void;
  Z: (cn: string, en: string) => string;
}) {
  const isRepeatInterval = ["daily", "weekly", "monthly", "yearly"].includes(frequency);
  return (
    <>
      {isRepeatInterval && (
        <div>
          <Label>{Z("重复间隔", "Repeat every")}</Label>
          <div className="mt-1 flex items-center gap-2">
            <Input type="number" min="1" value={interval} onChange={(event) => onIntervalChange(event.target.value)} className="w-24" />
            <span className="text-sm text-muted-foreground">{frequency === "weekly" ? Z("周", "week(s)") : frequency === "monthly" ? Z("月", "month(s)") : frequency === "yearly" ? Z("年", "year(s)") : Z("天", "day(s)")}</span>
          </div>
        </div>
      )}
      {frequency === "weekly" && (
        <div>
          <Label>{Z("每周星期", "Repeat on")}</Label>
          <div className="mt-1 flex flex-wrap gap-2">
            {WEEKDAYS.map(([value, cn, en]) => (
              <label key={value} className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm">
                <input type="checkbox" checked={weekdays.includes(value)} onChange={(event) => onWeekdaysChange(event.target.checked ? [...weekdays, value] : weekdays.filter((day) => day !== value))} />
                {Z(cn, en)}
              </label>
            ))}
          </div>
          {!weekdays.length && <p className="mt-1 text-xs text-muted-foreground">{Z("默认按开始日期对应的星期重复。", "Repeats on the weekday of the start date.")}</p>}
        </div>
      )}
    </>
  );
}
