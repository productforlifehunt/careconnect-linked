import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SurveyRunner } from "@/components/esm/SurveyRunner";
import { otherScreening, primaryScreening } from "@/features/esm/questionnaires";
import { addRecord, getProfile, saveProfile } from "@/features/esm/store";

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
      onSubmit={(answers) => {
        addRecord(isPrimary ? "primary_screening" : "other_screening", answers);
        saveProfile({
          ...profile,
          screeningDone: true,
          name: typeof answers.p_full_name === "string" ? answers.p_full_name : profile.name,
        });
        toast.success("Entry survey saved. The weekly logging starts now.");
        navigate("/", { replace: true });
      }}
    />
  );
}
