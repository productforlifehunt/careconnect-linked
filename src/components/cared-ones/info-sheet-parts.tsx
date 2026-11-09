/**
 * Pieces shared by the in-app information card popup and the public shared page.
 *
 * - SheetLocationTag: a tag next to the status. Collapsed by default; click to
 *   reveal the person's last known location (current_location CCT).
 * - SheetAIPanel: collapsed by default. Once opened it answers from details
 *   already shown on the card and retrieves other permitted facts only as asked.
 *   Nothing is written to the chat tables — whoever reads a shared card is
 *   usually not an app user.
 */
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, MapPin, Bot } from "lucide-react";
import type { InfoSheetPromptContext } from "@/lib/ai-dynamic-knowledge";
import { buildInfoSheetIntroduction } from "@/lib/ai-dynamic-knowledge";
import { AICompanionChat } from "@/components/ai/AICompanionChat";
import LocationCard from "@/components/care/LocationCard";

/* ─────────────── Location tag ─────────────── */

export function SheetLocationTag({ caredOneId, caredOneName }: { caredOneId?: string | null; caredOneName?: string }) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="h-auto p-0 hover:bg-transparent">
        <Badge variant="outline" className="text-xs cursor-pointer hover:bg-accent">
          <MapPin className="h-3 w-3 mr-1" />
          {Z("查看位置", "Cared one's location")}
          <ChevronDown className={`h-3 w-3 ml-1 ${open ? "rotate-180" : ""}`} />
        </Badge>
      </Button>
      {open && (
        <div className="mt-2">
          {caredOneId ? (
            <LocationCard key={caredOneId} caredOneId={caredOneId} caredOneName={caredOneName || Z("被护理者", "Cared one")} readOnly />
          ) : (
            <p className="text-sm text-muted-foreground">{Z("这张信息卡尚未关联被护理者，无法显示位置。", "No person is linked to this card, so their location is unavailable.")}</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────── Inline AI panel ─────────────── */

export function SheetAIPanel({
  context,
  caredOneId,
  sharedCard = false,
}: {
  context: InfoSheetPromptContext;
  caredOneId?: string | undefined;
  sharedCard?: boolean | undefined;
}) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const [open, setOpen] = useState(false);

  const task = context.situationDetails?.trim();
  const request = useMemo(
    () => ({
      id: `information-card-${context.caredOneName || "shared"}`,
      title: Z("信息卡助手", "Information card assistant"),
      contextScope: {
        caredOneId,
        topics: ["care-tips"],
        sheetContext: context,
        sharedCard,
      },
      starterPrompt: task
        ? buildInfoSheetIntroduction(task, context.caredOneName, !!isCN)
        : Z("你想聊些什么？", "What would you like to talk about?"),
      starterFallback: Z("有什么想问的，或想聊的话题吗？", "What would you like to ask or talk about?"),
    }),
    [context, caredOneId, isCN, sharedCard, task],
  );

  return (
    <div className="rounded-md border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 p-3 text-left hover:bg-accent transition"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <Bot className="h-4 w-4 text-primary" />
          {Z("有问题？直接问助手", "Have a question? Ask the assistant")}
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && (
        <div className="border-t">
          <AICompanionChat active={open} request={request} className="flex h-[380px] flex-col" />
        </div>
      )}
    </div>
  );
}

