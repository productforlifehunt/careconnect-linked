import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Clock3, Mic, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dailyLogDone, getProfile, getSettings, todaySlots } from "@/features/esm/store";
import { cn } from "@/lib/utils";

export default function EsmToday() {
  const navigate = useNavigate();
  const currentRef = useRef<HTMLButtonElement>(null);
  const profile = getProfile();
  const settings = getSettings();
  const slots = todaySlots();
  const currentHour = new Date().getHours();
  const eveningDone = dailyLogDone();
  const currentSlot = useMemo(() => slots.find((slot) => slot.hour === currentHour), [slots, currentHour]);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: settings.reducedMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
  }, [settings.reducedMotion]);

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-foreground">A Week in the Life of Dementia Caregivers</h1>
        <p className="mt-3 text-muted-foreground">Set your caregiver role first. Then the matching screening questions and daily study timeline will appear here.</p>
        <p className="mt-4 flex items-center gap-2 border-y border-border py-3 text-sm text-muted-foreground"><Mic className="h-4 w-4 shrink-0" />Every question can be answered by voice.</p>
        <Button className="mt-5 w-full" size="lg" onClick={() => navigate("/me?tab=screening")}>Set up my study profile</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="text-2xl font-semibold text-foreground">Today</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/me?tab=screening")}>{profile.screeningDone ? "Screening" : "Finish screening"}</Button>
      </div>

      {!profile.screeningDone && (
        <button className="mt-5 flex w-full items-center justify-between gap-3 border-y border-primary py-4 text-left" onClick={() => navigate("/screening?section=introduction")}> 
          <span>
            <span className="block font-semibold text-foreground">Finish your self-introduction questions</span>
            <span className="mt-1 block text-sm text-muted-foreground">Your answers are saved as you go.</span>
          </span>
          <Plus className="h-5 w-5 shrink-0 text-primary" />
        </button>
      )}

      {settings.hourlyReminders && currentSlot && (
        <div className="mt-5 border-l-4 border-primary bg-primary/5 px-4 py-3">
          <p className="font-semibold text-foreground">Now · {currentSlot.label}</p>
          <p className="mt-1 text-sm text-muted-foreground">{currentSlot.count ? `${currentSlot.count} recorded. Add another event if needed.` : "No care event recorded yet."}</p>
          <Button className="mt-3" size="sm" onClick={() => navigate(`/log/hourly?slot=${currentSlot.id}`)}>Log this hour</Button>
        </div>
      )}

      <section className="mt-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">24-hour timeline</h2>
            <p className="text-sm text-muted-foreground">Tap any hour to add an event. Multiple entries are allowed.</p>
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
                  onClick={() => navigate(`/log/hourly?slot=${slot.id}`)}
                  className={cn(
                    "h-24 w-24 shrink-0 flex-col gap-1 border-2",
                    current && "border-primary bg-primary/10 text-foreground",
                    slot.done && !current && "border-success/60 bg-success/5",
                  )}
                >
                  <span className="text-sm font-semibold">{slot.label}</span>
                  {slot.done ? <Check className="h-4 w-4 text-success" /> : <Clock3 className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-xs font-normal text-muted-foreground">{slot.count ? `${slot.count} recorded` : "Not recorded"}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-6 border-y border-border py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-foreground">Daily care summary</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {currentHour >= 22
                ? "Please complete the daily questionnaire tomorrow morning."
                : eveningDone ? "Today’s summary is recorded." : "Complete this after the day’s care events."}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/log/daily")}>{eveningDone ? "View" : "Log"}</Button>
        </div>
      </section>
    </div>
  );
}