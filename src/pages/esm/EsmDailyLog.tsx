import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SurveyRunner } from "@/components/esm/SurveyRunner";
import { dailyLog } from "@/features/esm/questionnaires";
import { addRecord, missedSlots } from "@/features/esm/store";

/** The 10 PM end-of-day log, with a shortcut to fill in missed hourly slots. */
export default function EsmDailyLog() {
  const navigate = useNavigate();
  const missed = missedSlots();

  return (
    <div>
      {missed.length > 0 && (
        <div className="mx-auto max-w-2xl px-4 pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {missed.length} hour{missed.length > 1 ? "s" : ""} not recorded today
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {missed.map((slot) => (
                <Button key={slot.id} size="sm" variant="outline" onClick={() => navigate(`/log?slot=${slot.id}`)}>
                  {slot.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <SurveyRunner
        questionnaire={dailyLog}
        draftId={`daily:${new Date().toISOString().slice(0, 10)}`}
        submitLabel="Finish today"
        onCancel={() => navigate("/")}
        onSubmit={async (answers) => {
          const result = await submitRecord("daily_log", answers);
          if (result.uploaded) toast.success("Thank you — today is complete.");
          else toast.warning(`Saved on this device only — ${result.error}`);
          navigate("/", { replace: true });
        }}
      />
    </div>
  );
}
