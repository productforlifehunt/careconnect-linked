import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { SurveyRunner } from "@/components/esm/SurveyRunner";
import { hourlyLog } from "@/features/esm/questionnaires";
import { getProfile, slotId } from "@/features/esm/store";
import { submitRecord } from "@/features/esm/backend";

/** One hourly entry: Activity, People, Challenges & resources. */
export default function EsmHourlyLog() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const profile = getProfile();
  const slot = params.get("slot") || slotId(new Date(), new Date().getHours());

  const network = (profile?.network ?? []).map((name) => ({ value: name, label: name }));

  return (
    <SurveyRunner
      questionnaire={hourlyLog}
      draftId={`hourly:${slot}`}
      extraOptionsByQuestion={{ h_network: network }}
      submitLabel="Save this entry"
      onCancel={() => navigate("/")}
      onSubmit={async (answers) => {
        const result = await submitRecord("hourly_log", answers, { slot });
        if (result.uploaded) toast.success("Entry saved.");
        else toast.warning(`Saved on this device only — ${result.error}`);
        navigate("/", { replace: true });
      }}
    />
  );
}
