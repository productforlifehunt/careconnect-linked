import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { SurveyRunner } from "@/components/esm/SurveyRunner";
import { hourlyLog } from "@/features/esm/questionnaires";
import { slotId } from "@/features/esm/store";
import { submitRecord } from "@/features/esm/backend";

/** One hourly entry: Activity, People, Challenges & resources. */
export default function EsmHourlyLog() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const slot = params.get("slot") || slotId(new Date(), new Date().getHours());

  return (
    <SurveyRunner
      questionnaire={hourlyLog}
      draftId={`hourly:${slot}`}
      submitLabel="Save this entry"
      onCancel={() => navigate("/log")}
      onSubmit={async (answers) => {
        const result = await submitRecord("hourly_log", answers, { slot });
        if (result.uploaded) toast.success("Entry saved.");
        else toast.warning(`Saved on this device only — ${result.error}`);
        navigate("/", { replace: true });
      }}
    />
  );
}
