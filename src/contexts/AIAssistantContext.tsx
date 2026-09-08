import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AICompanionChatDialog } from "@/components/ai/AICompanionChatDialog";
import { resolveWriteSpec, type WriteIntent, type WriteTarget } from "@/lib/ai-auto-fill-form";
import { useToast } from "@/hooks/use-toast";
import i18n from "@/i18n/config";

export type AssistantResult = { status?: string; summary?: string };
/**
 * `contextScope` turns on on-demand retrieval: for every message the chat asks
 * src/lib/ai-dynamic-knowledge.ts for the matching static snippets and the
 * permitted dynamic facts, instead of shipping a whole knowledge base.
 */
export type AssistantContextScope = {
  caredOneId?: string;
  groupId?: string;
  groupName?: string;
  topics?: Array<"app-basics" | "care-group" | "care-tips">;
  sharedCard?: boolean;
};
export type AssistantRequest = {
  id?: string;
  title?: string;
  contextPrompt?: string;
  contextScope?: AssistantContextScope;
  starterPrompt?: string;
  starterFallback?: string;
  completionStatuses?: string[];
  onComplete?: (result: AssistantResult) => void | Promise<void>;
};


/**
 * A write conversation: the caller names WHAT record is being filled in and the
 * registry in src/lib/ai-dynamic-knowledge.ts supplies everything else — the
 * wording, the allowed outcomes, the real database write and the lists to
 * refresh. No page holds write logic of its own.
 */
export type WriteRequest = {
  intent: WriteIntent;
  target: WriteTarget;
  /** Optional de-duplication id, e.g. one per day per record. */
  id?: string;
  contextScope?: AssistantContextScope;
  /** Runs after the record was written. */
  onWritten?: (result: AssistantResult) => void;
};

const AIAssistantContext = createContext<{
  openAssistant: (request?: AssistantRequest) => void;
  openWriteAssistant: (request: WriteRequest) => void;
  closeAssistant: () => void;
} | null>(null);

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [request, setRequest] = useState<AssistantRequest>({});
  const openAssistant = useCallback((next: AssistantRequest = {}) => {
    setRequest({ ...next, id: next.id || `general-${Date.now()}` });
    setOpen(true);
  }, []);
  const closeAssistant = useCallback(() => setOpen(false), []);
  const qc = useQueryClient();
  const { toast } = useToast();

  const openWriteAssistant = useCallback(
    ({ intent, target, id, contextScope, onWritten }: WriteRequest) => {
      const isChinese = (i18n.language || "").startsWith("zh");
      const spec = resolveWriteSpec(intent, target, { isChinese });
      openAssistant({
        id: id || `${intent}-${target.recordId || target.caredOneId || "new"}`,
        title: spec.title,
        contextPrompt: spec.contextPrompt,
        contextScope: contextScope || (target.caredOneId ? { caredOneId: target.caredOneId } : undefined),
        starterPrompt: spec.starterPrompt,
        starterFallback: spec.starterFallback,
        completionStatuses: spec.statuses,
        onComplete: async (result) => {
          await spec.write(result);
          spec.invalidateKeys.forEach((queryKey) => qc.invalidateQueries({ queryKey }));
          toast({ title: spec.toastFor(result.status) });
          onWritten?.(result);
        },
      });
    },
    [openAssistant, qc, toast]
  );

  const value = useMemo(
    () => ({ openAssistant, openWriteAssistant, closeAssistant }),
    [openAssistant, openWriteAssistant, closeAssistant]
  );

  return (
    <AIAssistantContext.Provider value={value}>
      {children}
      <AICompanionChatDialog open={open} onOpenChange={setOpen} request={request} />
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const value = useContext(AIAssistantContext);
  if (!value) throw new Error("useAIAssistant must be used within AIAssistantProvider");
  return value;
}