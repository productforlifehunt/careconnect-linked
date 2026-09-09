import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Bot } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAIAssistant } from "@/contexts/AIAssistantContext";
import { buildCareGroupHelpRequest } from "@/lib/ai-dynamic-knowledge";
import { KNOWLEDGE } from "@/lib/ai-static-knowledge";

interface GroupHelpTabProps {
  groupName?: string;
  groupId?: string;
}

export function GroupHelpTab({ groupName, groupId }: GroupHelpTabProps) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const { openAssistant } = useAIAssistant();

  // The visible guide and the AI's group know-how come from ONE source:
  // the care-group entries in src/lib/ai-static-knowledge.ts.
  const guide = KNOWLEDGE.filter((k) => k.topic === "care-group").map((k) => ({
    title: isCN ? k.title.zh : k.title.en,
    body: isCN ? k.body.zh : k.body.en,
  }));

  const openHelp = () => openAssistant({
    id: `group-help-${groupName || "current"}`,
    title: Z("护理群组帮助", "Care group help"),
    contextPrompt: buildCareGroupHelpRequest("", groupName, !!isCN),
    // Static group know-how + live group facts are retrieved per question.
    contextScope: { groupId, groupName, topics: ["care-group", "app-basics"] },
    starterPrompt: Z("请问我需要怎样使用这个护理群组？", "Ask me how to use this care group."),
  });

  return (
    <div className="space-y-4 max-w-3xl">
      <Card className="border-transparent card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><HelpCircle className="h-4 w-4" /> {Z("护理群组使用指南", "How to use this care group")}</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <dl className="divide-y">
            {guide.map((g) => (
              <div key={g.title} className="py-2.5">
                <dt className="text-sm font-medium text-foreground">{g.title}</dt>
                <dd className="text-xs text-muted-foreground mt-0.5">{g.body}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <Card className="border-transparent card-elevated">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Bot className="h-4 w-4" /> {Z("问一句，AI 帮你解答", "Ask a question, AI will help")}</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 space-y-3">
          <p className="text-sm text-muted-foreground">{Z("使用同一个通用助手询问本群组的操作方法。", "Use the same assistant available throughout the app to ask how this group works.")}</p>
          <Button variant="coral" onClick={openHelp}><Bot className="h-4 w-4 mr-2" />{Z("打开助手", "Open assistant")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
