import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { SurveyRunner } from "@/components/esm/SurveyRunner";
import { otherScreening, primaryScreening } from "@/features/esm/questionnaires";
import { getProfile, saveProfile } from "@/features/esm/store";
import { submitRecord } from "@/features/esm/backend";
import { useTranslation } from "react-i18next";
import { isChineseLanguage, uiText } from "@/features/esm/i18n";

/** The one-time entry survey, chosen by the participant's role. */
export default function EsmScreening() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const profile = getProfile();
  const { i18n } = useTranslation();
  const zh = isChineseLanguage(i18n.language);

  if (!profile) {
    navigate("/", { replace: true });
    return null;
  }

  const isPrimary = profile.role === "primary";
  const questionnaire = isPrimary ? primaryScreening : otherScreening;
  const requestedStep = Number(params.get("step"));
  const initialStep = Number.isInteger(requestedStep) && requestedStep >= 0
    ? requestedStep
    : params.get("section") === "introduction" ? 0 : undefined;

  return (
    <SurveyRunner
      questionnaire={questionnaire}
      draftId={questionnaire.id}
      initialStep={initialStep}
       submitLabel={uiText(zh, "Finish the entry survey", "完成初始问卷")}
      onCancel={() => navigate("/me?tab=screening")}
      onSubmit={async (answers) => {
        const result = await submitRecord(isPrimary ? "primary_screening" : "other_screening", answers);
        saveProfile({
          ...profile,
          screeningDone: true,
          name: typeof answers.c302_a01 === "string" ? answers.c302_a01 : profile.name,
        });
         if (result.uploaded) toast.success(uiText(zh, "Entry survey saved. The weekly logging starts now.", "初始问卷已保存，现在可以开始本周记录。"));
         else toast.warning(uiText(zh, `Saved on this device only — ${result.error}`, "已保存在本设备，暂未上传。"));
        navigate("/me?tab=screening", { replace: true });
      }}
    />
  );
}
