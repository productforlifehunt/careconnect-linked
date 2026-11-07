var e=`/**
 * Pieces shared by the in-app information card popup and the public shared page.
 *
 * - SheetLocationTag: a tag next to the status. Collapsed by default; click to
 *   reveal the person's last known location (current_location CCT).
 * - SheetAIPanel: collapsed by default. Once opened it greets the reader with
 *   what is needed this time and answers questions about the person, using the
 *   care plan / tips / medicines / notes already stored for them.
 *   Nothing is written to the chat tables — whoever reads a shared card is
 *   usually not an app user.
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, MapPin, Bot } from "lucide-react";
import { fetchCareTipsWordPress, fetchCarePlansWordPress, fetchCareNotesWordPress } from "@/features/cared-ones/source.wordpress-extended";
import { fetchMedicinesWordPress } from "@/features/medicine/source.medicine";
import type { InfoSheetAIContext } from "@/components/cared-ones/InfoSheetAIDialog";
import { buildInfoSheetContext, buildInfoSheetIntroduction } from "@/lib/ai-dynamic-knowledge";
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
          <ChevronDown className={\`h-3 w-3 ml-1 \${open ? "rotate-180" : ""}\`} />
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

/* ─────────────── Knowledge about the person ─────────────── */

export function useInfoSheetKnowledge(caredOneId?: string | null | undefined, enabled = true) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");

  const { data } = useQuery({
    queryKey: ["infoSheetKnowledge", caredOneId],
    enabled: enabled && !!caredOneId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const id = String(caredOneId);
      const [tips, plans, notes, medicines] = await Promise.all([
        fetchCareTipsWordPress(id).catch(() => []),
        fetchCarePlansWordPress(id).catch(() => []),
        fetchCareNotesWordPress(id).catch(() => []),
        fetchMedicinesWordPress(id).catch(() => []),
      ]);
      return { tips, plans, notes, medicines };
    },
  });

  return useMemo(() => {
    if (!data) return "";
    const L = (cn: string, en: string) => (isCN ? cn : en);
    const list = (rows: any[], keys: string[]) =>
      (rows || []).slice(0, 12)
        .map((r: any) => keys.map((k) => r?.[k]).filter(Boolean).join(" — "))
        .filter(Boolean)
        .join("\\n");

    const blocks = [
      list(data.plans, ["title", "name", "content", "description"]) && \`\${L("护理计划", "Care plan")}:\\n\${list(data.plans, ["title", "name", "content", "description"])}\`,
      list(data.tips, ["title", "name", "content", "description"]) && \`\${L("照护要点与喜好", "Care tips and preferences")}:\\n\${list(data.tips, ["title", "name", "content", "description"])}\`,
      list(data.medicines, ["name", "medicine_name", "dosage", "frequency", "note"]) && \`\${L("用药", "Medicines")}:\\n\${list(data.medicines, ["name", "medicine_name", "dosage", "frequency", "note"])}\`,
      list(data.notes, ["title", "content"]) && \`\${L("护理笔记", "Care notes")}:\\n\${list(data.notes, ["title", "content"])}\`,
    ].filter(Boolean);

    return blocks.join("\\n\\n");
  }, [data, isCN]);
}

/* ─────────────── Inline AI panel ─────────────── */

export function SheetAIPanel({ context }: { context: InfoSheetAIContext }) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const [open, setOpen] = useState(false);

  const task = context.situationDetails?.trim();
  const request = useMemo(
    () => ({
      id: \`information-card-\${context.caredOneName || "shared"}\`,
      title: Z("信息卡助手", "Information card assistant"),
      contextPrompt: buildInfoSheetContext(context, !!isCN),
      starterPrompt: task
        ? buildInfoSheetIntroduction(task, context.caredOneName, !!isCN)
        : Z("请先简单介绍你能根据这张信息卡回答什么。", "Briefly explain what you can answer from this information card."),
      starterFallback: Z("我只根据这张信息卡上的内容回答。有什么想问的？", "I answer only from this information card. What would you like to know?"),
    }),
    [context, isCN, task],
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
        <ChevronDown className={\`h-4 w-4 text-muted-foreground transition-transform \${open ? "" : "-rotate-90"}\`} />
      </button>
      {open && (
        <div className="border-t">
          <AICompanionChat active={open} request={request} className="flex h-[380px] flex-col" />
        </div>
      )}
    </div>
  );
}

`;export{e as default};