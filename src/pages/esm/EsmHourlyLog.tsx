import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { SurveyRunner } from "@/components/esm/SurveyRunner";
import { hourlyLog } from "@/features/esm/questionnaires";
import { slotId } from "@/features/esm/store";
import { submitRecord } from "@/features/esm/backend";
import { useTranslation } from "react-i18next";
import { isChineseLanguage, uiText } from "@/features/esm/i18n";

/** One hourly entry: Activity, People, Challenges & resources. */
export default function EsmHourlyLog() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { i18n } = useTranslation();
  const zh = isChineseLanguage(i18n.language);
  const slot = params.get("slot") || slotId(new Date(), new Date().getHours());

  return (
    <SurveyRunner
      questionnaire={hourlyLog}
      draftId={`hourly:${slot}`}
       submitLabel={uiText(zh, "Save this entry", "保存这条记录")}
      onCancel={() => navigate("/log")}
      onSubmit={async (answers) => {
        const result = await submitRecord("hourly_log", answers, { slot });
         if (result.uploaded) toast.success(uiText(zh, "Entry saved.", "记录已保存。"));
         else toast.warning(uiText(zh, `Saved on this device only — ${result.error}`, "已保存在本设备，暂未上传。"));
        navigate("/", { replace: true });
      }}
    />
  );
}
