var e=`import { Bot, Clock3, ListChecks, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIAssistant } from "@/contexts/AIAssistantContext";
import { useTranslation } from "react-i18next";
import { isChineseLanguage, uiText } from "@/features/esm/i18n";

export default function EsmHelp() {
  const { openAssistant } = useAIAssistant();
  const { i18n } = useTranslation();
  const zh = isChineseLanguage(i18n.language);
  const helpItems = [
    { icon: Clock3, title: uiText(zh, "Hourly care events", "每小时照护事件"), text: uiText(zh, "Choose any hour on Today. You can add more than one event to the same hour.", "在“今天”中选择任意小时；同一小时可以记录多件事情。") },
    { icon: ListChecks, title: uiText(zh, "Daily care summary", "每日照护总结"), text: uiText(zh, "Open Log entry, then Daily care summary, to reflect on the day and fill any gaps.", "进入“记录”，再选择“每日照护总结”，回顾一天并补充遗漏。") },
    { icon: Mic, title: uiText(zh, "Answer by voice", "使用语音回答"), text: uiText(zh, "Tap the microphone beside any question. Check the matched answer before moving on.", "点击问题旁的麦克风，说出答案；进入下一题前请确认识别结果。") },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-foreground">{uiText(zh, "Help", "帮助")}</h1>
      <div className="mt-5 divide-y divide-border border-y border-border">
        {helpItems.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-3 py-4">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="font-semibold text-foreground">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </div>
      <Button
        className="mt-6 w-full"
        size="lg"
        onClick={() => openAssistant({
          title: uiText(zh, "Study help", "问卷填写帮助"),
          contextPrompt: uiText(zh, "Help the participant understand how to complete the caregiver study forms. Do not provide medical advice.", "帮助参与者理解如何填写护理者研究问卷。只使用中文，不提供医疗建议。"),
          starterFallback: uiText(zh, "What would you like to know about completing the study?", "您想了解问卷填写的哪一部分？"),
        })}
      >
        <Bot className="mr-2 h-5 w-5" />
        {uiText(zh, "Ask the study assistant", "询问填写助手")}
      </Button>
    </div>
  );
}`;export{e as default};