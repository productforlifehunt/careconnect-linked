import { useTranslation } from "react-i18next";
import { Bot } from "lucide-react";
import { AICompanionChat } from "@/components/ai/AICompanionChat";
import { useSite } from "@/contexts/SiteContext";
import { aiBrand } from "../../supabase/functions/_shared/ai-prompts";

/**
 * Full-page AI companion chat.
 *
 * The same chat body the floating assistant uses, given its own route so the
 * marketing page ("Try the companion") and the AI links in the app have a real
 * destination instead of bouncing signed-in people to the sign-up screen.
 */
export default function AICompanionChatPage() {
  const { i18n } = useTranslation();
  const site = useSite();
  const isZh = i18n.language?.startsWith("zh");

  return (
    <div className="max-w-3xl mx-auto px-4 py-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Bot className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
            {aiBrand(isZh ? "zh" : "en", site.id)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isZh ? "随时问，随时答" : "Ask anything, any time"}
          </p>
        </div>
      </div>
      <div className="rounded-2xl border bg-card h-[calc(100dvh-15rem)] min-h-[420px] flex flex-col overflow-hidden">
        <AICompanionChat active className="flex-1 min-h-0" />
      </div>
    </div>
  );
}
