import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Bot, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { aiBrand } from "../../../supabase/functions/_shared/ai-prompts";
import { useSite } from "@/contexts/SiteContext";
import type { AssistantRequest } from "@/contexts/AIAssistantContext";
import { AICompanionChat } from "@/components/ai/AICompanionChat";

export function AICompanionChatDialog({
  open,
  onOpenChange,
  request = {},
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  request?: AssistantRequest;
}) {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="fixed inset-x-3 top-16 bottom-[4.5rem] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[440px] md:h-[640px] rounded-2xl z-50 bg-background flex flex-col shadow-2xl overflow-hidden border"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <DialogPrimitive.Title className="text-sm font-semibold">
                {request.title || aiBrand(isZh ? "zh" : "en")}
              </DialogPrimitive.Title>
            </div>
            <DialogPrimitive.Close asChild>
              <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground" aria-label={isZh ? "关闭" : "Close"}>
                <X className="h-4 w-4" />
              </button>
            </DialogPrimitive.Close>
          </div>

          <AICompanionChat active={open} request={request} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
