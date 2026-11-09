import { useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bot } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AICompanionChat } from "@/components/ai/AICompanionChat";
import type { AssistantRequest } from "@/contexts/AIAssistantContext";
import type { InfoSheetPromptContext } from "@/lib/ai-dynamic-knowledge";
import { buildInfoSheetIntroduction } from "@/lib/ai-dynamic-knowledge";

function localizedText(isChinese: boolean | undefined, zh: string, en: string) {
  return isChinese ? zh : en;
}

export type InfoSheetAIContext = InfoSheetPromptContext & {
  caredOneId?: string | undefined;
  sharedCard?: boolean | undefined;
};

export function InfoSheetAIDialog({
  open,
  onOpenChange,
  context,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: InfoSheetAIContext;
}) {
  const { i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const task = context.situationDetails?.trim();
  const request = useMemo<AssistantRequest>(() => ({
    id: `information-card-${context.caredOneName || "shared"}`,
    title: localizedText(isChinese, "信息卡助手", "Information card assistant"),
    contextScope: {
      caredOneId: context.caredOneId,
      topics: ["care-tips"],
      sheetContext: context,
      sharedCard: context.sharedCard,
    },
    starterPrompt: task
      ? buildInfoSheetIntroduction(task, context.caredOneName, !!isChinese)
      : localizedText(isChinese, "你想聊些什么？", "What would you like to talk about?"),
  }), [context, isChinese, task]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(84dvh,760px)] max-w-3xl flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            {localizedText(isChinese, "有问题？直接问", "Ask a question")}
          </DialogTitle>
          <DialogDescription>
            {localizedText(isChinese, "可以问照护安排，也可以聊任何话题。", "Ask about care details or chat about anything.")}
          </DialogDescription>
        </DialogHeader>
        <AICompanionChat active={open} request={request} className="min-h-0 flex-1" />
      </DialogContent>
    </Dialog>
  );
}
