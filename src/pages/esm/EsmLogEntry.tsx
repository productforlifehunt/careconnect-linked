import { useNavigate } from "@/lib/router-compat";
import { CalendarCheck, Clock3, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { isChineseLanguage, uiText } from "@/features/esm/i18n";

export default function EsmLogEntry() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const zh = isChineseLanguage(i18n.language);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-foreground">{uiText(zh, "Log entry", "记录")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{uiText(zh, "Choose what you want to record.", "请选择要记录的内容。")}</p>

      <div className="mt-6 divide-y divide-border border-y border-border">
        <Button
          variant="ghost"
          className="h-auto w-full justify-start rounded-none px-0 py-5 text-left"
          onClick={() => navigate("/log/hourly")}
        >
          <Clock3 className="mr-3 h-6 w-6 shrink-0 text-primary" />
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold">{uiText(zh, "Log hourly care event", "记录每小时照护事件")}</span>
            <span className="mt-1 block whitespace-normal text-sm font-normal text-muted-foreground">
              {uiText(zh, "Record an event for this hour or add one for another time.", "记录当前小时的照护事件，或补记其他时间发生的事情。")}
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
            <span className="block text-base font-semibold">{uiText(zh, "Log daily care summary", "记录每日照护总结")}</span>
            <span className="mt-1 block whitespace-normal text-sm font-normal text-muted-foreground">
              {uiText(zh, "Complete the daily questionnaire and add anything you missed.", "完成每日问卷，并补充今天遗漏的内容。")}
            </span>
          </span>
          <ChevronRight className="ml-3 h-5 w-5 shrink-0 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}