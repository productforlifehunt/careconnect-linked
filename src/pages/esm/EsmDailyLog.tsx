import { useNavigate } from "@/lib/router-compat";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SurveyRunner } from "@/components/esm/SurveyRunner";
import { dailyLog } from "@/features/esm/questionnaires";
import { localDay, missedSlots } from "@/features/esm/store";
import { submitRecord } from "@/features/esm/backend";
import { useTranslation } from "react-i18next";
import { isChineseLanguage, uiText } from "@/features/esm/i18n";

/** The 10 PM end-of-day log, with a shortcut to fill in missed hourly slots. */
export default function EsmDailyLog() {
  const navigate = useNavigate();
  const missed = missedSlots();
  const { i18n } = useTranslation();
  const zh = isChineseLanguage(i18n.language);

  return (
    <div>
      {missed.length > 0 && (
        <div className="mx-auto max-w-2xl px-4 pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                 {uiText(zh, `${missed.length} hour${missed.length > 1 ? "s" : ""} not recorded today`, `今天有 ${missed.length} 个小时尚未记录`)}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {missed.map((slot) => (
                <Button key={slot.id} size="sm" variant="outline" onClick={() => navigate(`/log/hourly?slot=${slot.id}`)}>
                  {slot.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <SurveyRunner
        questionnaire={dailyLog}
        draftId={`daily:${localDay(new Date())}`}
         submitLabel={uiText(zh, "Finish today", "完成今日记录")}
        onCancel={() => navigate("/log")}
        onSubmit={async (answers) => {
          const result = await submitRecord("daily_log", answers);
           if (result.uploaded) toast.success(uiText(zh, "Thank you — today is complete.", "谢谢，今天的记录已完成。"));
           else toast.warning(uiText(zh, `Saved on this device only — ${result.error}`, "已保存在本设备，暂未上传。"));
          navigate("/", { replace: true });
        }}
      />
    </div>
  );
}
