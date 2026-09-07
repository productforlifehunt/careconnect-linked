import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AICompanionChatDialog } from "@/components/ai/AICompanionChatDialog";

export type AssistantResult = { status?: string; summary?: string };
export type AssistantRequest = {
  id?: string;
  title?: string;
  contextPrompt?: string;
  starterPrompt?: string;
  starterFallback?: string;
  completionStatuses?: string[];
  onComplete?: (result: AssistantResult) => void | Promise<void>;
};

const AIAssistantContext = createContext<{
  openAssistant: (request?: AssistantRequest) => void;
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
  const value = useMemo(() => ({ openAssistant, closeAssistant }), [openAssistant, closeAssistant]);

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