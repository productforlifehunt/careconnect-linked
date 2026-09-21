import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { SurveyRunner } from "@/components/esm/SurveyRunner";
import { hourlyLog } from "@/features/esm/questionnaires";
import { addRecord, getProfile, slotId } from "@/features/esm/store";

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
      onSubmit={(answers) => {
        addRecord("hourly_log", answers, slot);
        toast.success("Entry saved.");
        navigate("/", { replace: true });
      }}
    />
  );
}
