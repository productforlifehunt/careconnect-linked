import { useNavigate } from "react-router-dom";
import { CalendarCheck, Clock3, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EsmLogEntry() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-foreground">Log entry</h1>
      <p className="mt-1 text-sm text-muted-foreground">Choose what you want to record.</p>

      <div className="mt-6 divide-y divide-border border-y border-border">
        <Button
          variant="ghost"
          className="h-auto w-full justify-start rounded-none px-0 py-5 text-left"
          onClick={() => navigate("/log/hourly")}
        >
          <Clock3 className="mr-3 h-6 w-6 shrink-0 text-primary" />
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold">Log hourly care event</span>
            <span className="mt-1 block whitespace-normal text-sm font-normal text-muted-foreground">
              Record an event for this hour or add one for another time.
            </span>
          </span>
          <ChevronRight className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          className="h-auto w-full justify-start rounded-none px-0 py-5 text-left"
          onClick={() => navigate("/log/daily")}
        >
          <CalendarCheck className="mr-3 h-6 w-6 shrink-0 text-primary" />
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold">Log daily care summary</span>
            <span className="mt-1 block whitespace-normal text-sm font-normal text-muted-foreground">
              Complete the daily questionnaire and add anything you missed.
            </span>
          </span>
          <ChevronRight className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}