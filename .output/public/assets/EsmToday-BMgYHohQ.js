var e=`import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "@/lib/router-compat";
import { Check, Clock3, Mic, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dailyLogDone, getProfile, getSettings, hourlyReminderActive, todaySlots, yesterdayDailyLogDone } from "@/features/esm/store";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { isChineseLanguage, uiText } from "@/features/esm/i18n";

export default function EsmToday() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const zh = isChineseLanguage(i18n.language);
  const currentRef = useRef<HTMLButtonElement>(null);
  const profile = getProfile();
  const settings = getSettings();
  const slots = todaySlots();
  const currentHour = new Date().getHours();
  const eveningDone = dailyLogDone();
  const yesterdayDone = yesterdayDailyLogDone();
  const reminderActive = hourlyReminderActive(new Date(), settings);
  const currentSlot = useMemo(() => slots.find((slot) => slot.hour === currentHour), [slots, currentHour]);
  const slotLabel = (slot: (typeof slots)[number]) => zh ? \`\${String(slot.hour).padStart(2, "0")}:00\` : slot.label;

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: settings.reducedMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
  }, [settings.reducedMotion]);

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
         <h1 className="text-2xl font-semibold text-foreground">{uiText(zh, "A Week in the Life of Dementia Caregivers Study", "失智症护理者的一周")}</h1>
         <p className="mt-3 text-muted-foreground">{uiText(zh, "Choose your caregiver role first. Your questions and daily timeline will then appear here.", "请先选择您的护理者身份，随后这里会显示相应问卷和每日时间线。")}</p>
         <p className="mt-4 flex items-center gap-2 border-y border-border py-3 text-sm text-muted-foreground"><Mic className="h-4 w-4 shrink-0" />{uiText(zh, "Every question can be answered by voice.", "每道题都可以使用语音回答。")}</p>
         <Button className="mt-5 w-full" size="lg" onClick={() => navigate("/me?tab=screening")}>{uiText(zh, "Set up my profile", "设置我的资料")}</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-end justify-between gap-3">
        <div>
           <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(zh ? "zh-CN" : "en", { weekday: "long", month: "long", day: "numeric" })}</p>
           <h1 className="text-2xl font-semibold text-foreground">{uiText(zh, "Today", "今天")}</h1>
        </div>
         <Button variant="outline" size="sm" onClick={() => navigate("/me?tab=screening")}>{profile.screeningDone ? uiText(zh, "Screening", "初始问卷") : uiText(zh, "Finish screening", "完成初始问卷")}</Button>
      </div>

      {!profile.screeningDone && (
        <button className="mt-5 flex w-full items-center justify-between gap-3 border-y border-primary py-4 text-left" onClick={() => navigate("/screening?section=introduction")}> 
          <span>
             <span className="block font-semibold text-foreground">{uiText(zh, "Finish your self-introduction questions", "完成个人基本信息")}</span>
             <span className="mt-1 block text-sm text-muted-foreground">{uiText(zh, "Your answers are saved as you go.", "填写过程中，答案会自动保存。")}</span>
          </span>
          <Plus className="h-5 w-5 shrink-0 text-primary" />
        </button>
      )}

      {!yesterdayDone && (
        <div className="mt-5 border-l-4 border-amber-500 bg-amber-500/5 px-4 py-3">
          <p className="font-semibold text-foreground">{uiText(zh, "Yesterday’s daily care summary is incomplete", "昨天的每日照护总结尚未完成")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{uiText(zh, "Please complete it now. If it remains incomplete, we will remind you again at noon and 10:00 PM.", "请现在补填；若仍未完成，我们将在中午12点和晚上10点再次提醒。")}</p>
          <Button className="mt-3" size="sm" onClick={() => navigate("/log/daily?day=yesterday")}>{uiText(zh, "Complete yesterday’s summary", "补填昨天的总结")}</Button>
        </div>
      )}

      {reminderActive && currentSlot && (
        <div className="mt-5 border-l-4 border-primary bg-primary/5 px-4 py-3">
            <p className="font-semibold text-foreground">{uiText(zh, "Now", "现在")} · {slotLabel(currentSlot)}</p>
           <p className="mt-1 text-sm text-muted-foreground">{currentSlot.count ? uiText(zh, \`\${currentSlot.count} recorded. Add another event if needed.\`, \`已记录 \${currentSlot.count} 条；如有需要可继续添加。\`) : uiText(zh, "No care event recorded yet.", "尚未记录照护事件。")}</p>
           <Button className="mt-3" size="sm" onClick={() => navigate(\`/log/hourly?slot=\${currentSlot.id}\`)}>{uiText(zh, "Log this hour", "记录这个小时")}</Button>
        </div>
      )}

      <section className="mt-7">
        <div className="flex items-center justify-between gap-3">
          <div>
             <h2 className="text-lg font-semibold text-foreground">{uiText(zh, "24-hour timeline", "全天时间线")}</h2>
             <p className="text-sm text-muted-foreground">{uiText(zh, "Tap any hour to add an event. Multiple entries are allowed.", "点击任意小时添加照护事件；同一小时可以记录多条。")}</p>
          </div>
        </div>
        <div className="-mx-4 mt-4 overflow-x-auto px-4 pb-3 scrollbar-none">
          <div className="flex w-max gap-2">
            {slots.map((slot) => {
              const current = slot.hour === currentHour;
              return (
                <Button
                  key={slot.id}
                  ref={current ? currentRef : undefined}
                  variant="outline"
                  onClick={() => navigate(\`/log/hourly?slot=\${slot.id}\`)}
                  className={cn(
                    "h-24 w-24 shrink-0 flex-col gap-1 border-2",
                    current && "border-primary bg-primary/10 text-foreground",
                    slot.done && !current && "border-success/60 bg-success/5",
                  )}
                >
                   <span className="text-sm font-semibold">{slotLabel(slot)}</span>
                  {slot.done ? <Check className="h-4 w-4 text-success" /> : <Clock3 className="h-4 w-4 text-muted-foreground" />}
                   <span className="text-xs font-normal text-muted-foreground">{slot.count ? uiText(zh, \`\${slot.count} recorded\`, \`已记录 \${slot.count} 条\`) : uiText(zh, "Not recorded", "未记录")}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-6 border-y border-border py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
             <h2 className="font-semibold text-foreground">{uiText(zh, "Daily care summary", "每日照护总结")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {eveningDone
                ? uiText(zh, "Today’s summary is recorded.", "今天的总结已记录。")
                : currentHour >= 22
                  ? uiText(zh, "Please complete today’s daily care summary now.", "请现在完成今天的每日照护总结。")
                  : uiText(zh, "Complete this at 10:00 PM after the day’s care events.", "请于晚上10点在当天照护活动结束后填写。")}
            </p>
          </div>
           <Button variant="outline" size="sm" onClick={() => navigate("/log/daily")}>{eveningDone ? uiText(zh, "View", "查看") : uiText(zh, "Log", "记录")}</Button>
        </div>
      </section>
    </div>
  );
}`;export{e as default};