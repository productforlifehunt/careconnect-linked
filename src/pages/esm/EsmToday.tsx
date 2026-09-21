import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Clock, Mic } from "lucide-react";
import { dailyLogDone, getProfile, startProfile, todaySlots } from "@/features/esm/store";
import { cn } from "@/lib/utils";

/** Home screen: consent-free study status, the hourly reminder list, and entry points. */
export default function EsmToday() {
  const navigate = useNavigate();
  const profile = getProfile();
  const slots = todaySlots();
  const eveningDone = dailyLogDone();
  const dueSlot = slots.find((s) => s.due && !s.done);

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <h1 className="text-2xl font-semibold text-foreground">
          A Week in the Life of Dementia Caregivers
        </h1>
        <p className="text-muted-foreground">
          For one week you will get a short prompt every hour from 8 AM to 10 PM to record what care
          you were doing, plus one look back at the whole day at 10 PM.
        </p>
        <p className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
          <Mic className="h-4 w-4 shrink-0" />
          Every question can be answered by speaking — nothing has to be typed.
        </p>
        <h2 className="pt-2 text-lg font-medium text-foreground">Which describes you?</h2>
        <div className="grid gap-3">
          <Button
            size="lg"
            onClick={() => {
              startProfile("primary");
              navigate("/screening");
            }}
          >
            I am the main caregiver
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              startProfile("other");
              navigate("/screening");
            }}
          >
            I help with care alongside someone else
          </Button>
        </div>
      </div>
    );
  }

  if (!profile.screeningDone) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <h1 className="text-2xl font-semibold text-foreground">One survey first</h1>
        <p className="text-muted-foreground">
          Before the week starts, please finish the entry survey. You can stop part way and come
          back — your answers are kept on this device.
        </p>
        <Button size="lg" onClick={() => navigate("/screening")}>Continue the entry survey</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-semibold text-foreground">Today</h1>

      {dueSlot && (
        <Card className="border-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">It is {dueSlot.label} — what care were you doing?</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate(`/log?slot=${dueSlot.id}`)}>
              Record this hour
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Hourly prompts, 8 AM to 10 PM</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => navigate(`/log?slot=${slot.id}`)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md border p-2 text-xs",
                slot.done
                  ? "border-primary bg-primary/10 text-primary"
                  : slot.future
                    ? "border-border text-muted-foreground"
                    : "border-destructive/40 text-foreground",
              )}
            >
              {slot.done ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
              {slot.label}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">End of day, 10 PM</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {eveningDone
              ? "Done for today — thank you."
              : "Add anything you missed, then rate the day as a whole."}
          </p>
          <Button variant={eveningDone ? "outline" : "default"} className="w-full" onClick={() => navigate("/evening")}>
            {eveningDone ? "Review today's end-of-day log" : "Start the end-of-day log"}
          </Button>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full" onClick={() => navigate("/log")}>
        Add an entry for another time
      </Button>
    </div>
  );
}
