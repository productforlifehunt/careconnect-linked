import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SurveyRunner } from "@/components/esm/SurveyRunner";
import { otherScreening, primaryScreening } from "@/features/esm/questionnaires";
import { getProfile, saveProfile } from "@/features/esm/store";
import { submitRecord } from "@/features/esm/backend";

/** The one-time entry survey, chosen by the participant's role. */
export default function EsmScreening() {
  const navigate = useNavigate();
  const profile = getProfile();

  if (!profile) {
    navigate("/", { replace: true });
    return null;
  }

  const isPrimary = profile.role === "primary";
  const questionnaire = isPrimary ? primaryScreening : otherScreening;

  return (
    <SurveyRunner
      questionnaire={questionnaire}
      draftId={questionnaire.id}
      submitLabel="Finish the entry survey"
      onCancel={() => navigate("/")}
      onSubmit={async (answers) => {
        const result = await submitRecord(isPrimary ? "primary_screening" : "other_screening", answers);
        saveProfile({
          ...profile,
          screeningDone: true,
          name: typeof answers.c302_a01 === "string" ? answers.c302_a01 : profile.name,
        });
        if (result.uploaded) toast.success("Entry survey saved. The weekly logging starts now.");
        else toast.warning(`Saved on this device only — ${result.error}`);
        navigate("/", { replace: true });
      }}
    />
  );
}
