import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Bot, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import type { InfoSheetPromptContext, WriteSkillName, WriteTarget } from "@/lib/ai-dynamic-knowledge";
import type { KnowledgeTopic } from "@/lib/ai-static-knowledge";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/config";
import { lazyRetry } from "@/lib/lazy-retry";
import { useAuth } from "@/contexts/AuthContext";
import { useSite } from "@/contexts/SiteContext";
import { aiBrand } from "../../supabase/functions/_shared/ai-prompts";
import { AIChatWarmup } from "@/components/ai/AIChatWarmup";

const loadAssistantDialog = () =>
  import("@/components/ai/AICompanionChatDialog").then((module) => ({
    default: module.AICompanionChatDialog,
  }));
const AICompanionChatDialog = lazyRetry(
  loadAssistantDialog,
  "AICompanionChatDialog",
);

function warmAssistant() {
  // Prepare the full chat after the initial page is idle, so opening the
  // dialog does not wait on its code bundle before the composer is usable.
  void loadAssistantDialog()
    .then(() => import("@/components/ai/AICompanionChat"))
    .catch(() => undefined);
}

export type AssistantResult = { status?: string | undefined; summary?: string | undefined };
/**
 * `contextScope` turns on on-demand retrieval: for every message the chat asks
 * src/lib/ai-dynamic-knowledge.ts for the matching static snippets and the
 * permitted dynamic facts, instead of shipping a whole knowledge base.
 */
export type AssistantContextScope = {
  caredOneId?: string | undefined;
  groupId?: string | undefined;
  groupName?: string | undefined;
  topics?: KnowledgeTopic[] | undefined;
  staticSkillNames?: string[] | undefined;
  sheetContext?: InfoSheetPromptContext | undefined;
  writeSkills?: WriteSkillName[] | undefined;
  sharedCard?: boolean | undefined;
};
export type AssistantRequest = {
  id?: string | undefined;
  title?: string | undefined;
  contextPrompt?: string | undefined;
  contextScope?: AssistantContextScope | undefined;
  starterPrompt?: string | undefined;
  starterFallback?: string | undefined;
  completionStatuses?: string[] | undefined;
  onComplete?: ((result: AssistantResult) => void | Promise<void>) | undefined;
  /** Show the built-in, instant app guide (common questions answered offline). */
  appGuide?: boolean | undefined;
  /** Called when the user chooses to hide the app guide shortcut. */
  onHideGuide?: (() => void | Promise<void>) | undefined;
};


/**
 * A write conversation: the caller names WHAT record is being filled in and the
 * registry in src/lib/ai-dynamic-knowledge.ts supplies everything else — the
 * wording, the allowed outcomes, the real database write and the lists to
 * refresh. No page holds write logic of its own.
 */
export type WriteRequest = {
  /** Write skill name declared in src/lib/ai-dynamic-knowledge.ts. */
  skill: WriteSkillName;
  target: WriteTarget;
  /** Optional de-duplication id, e.g. one per day per record. */
  id?: string | undefined;
  contextScope?: AssistantContextScope | undefined;
  /** Runs after the record was written. */
  onWritten?: ((result: AssistantResult) => void) | undefined;
};

type AIAssistantValue = {
  openAssistant: (request?: AssistantRequest | undefined) => void;
  openWriteAssistant: (request: WriteRequest) => void;
  closeAssistant: () => void;
} | null;

function AssistantOpeningPanel({
  open,
  request,
  draft,
  queuedPrompt,
  onOpenChange,
  onDraftChange,
  onSubmit,
}: {
  open: boolean;
  request: AssistantRequest;
  draft: string;
  queuedPrompt: string | null;
  onOpenChange: (open: boolean) => void;
  onDraftChange: (value: string) => void;
  onSubmit: (value: string) => void;
}) {
  const { i18n: translation } = useTranslation();
  const site = useSite();
  const isChinese = translation.language?.startsWith("zh");

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <DialogPrimitive.Content
          data-inspector-scope="ai-chat-dialog"
          className="fixed inset-x-3 top-16 bottom-[4.5rem] z-50 flex flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:h-[640px] md:w-[440px] md:-translate-x-1/2 md:-translate-y-1/2"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <DialogPrimitive.Title className="truncate text-sm font-semibold">
                {request.title || aiBrand(isChinese ? "zh" : "en", site.id)}
              </DialogPrimitive.Title>
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
                aria-label={isChinese ? "关闭" : "Close"}
              >
                <X className="h-4 w-4" />
              </button>
            </DialogPrimitive.Close>
          </div>
          <AIChatWarmup
            isChinese={!!isChinese}
            autoFocus={open}
            value={draft}
            queuedPrompt={queuedPrompt}
            onChange={onDraftChange}
            onSubmit={onSubmit}
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// Reuse one context object across hot reloads; a re-evaluated module would otherwise
// create a second context that the already-mounted provider does not supply.
const ctxStore = globalThis as typeof globalThis & { __aiAssistantContext?: React.Context<AIAssistantValue> };
const AIAssistantContext = (ctxStore.__aiAssistantContext ??= createContext<AIAssistantValue>(null));

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const site = useSite();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [assistantActivated, setAssistantActivated] = useState(false);
  const [request, setRequest] = useState<AssistantRequest>({});
  const [draft, setDraft] = useState("");
  const [queuedPrompt, setQueuedPrompt] = useState<string | null>(null);

  // Warm the dialog and chat controls after idle. Heavy Markdown plugins load
  // only when a saved or new assistant response actually needs rendering.
  useEffect(() => {
    // Standalone researcher/legal/sick pages do not expose the app chatbot.
    // Keep its sizeable code off those pages; ESM still uses the assistant.
    const siteSupportsAssistant = !["researcher", "consent", "sick"].includes(
      site.id,
    );
    if (
      !siteSupportsAssistant ||
      (site.id !== "esm_survey" && !isAuthenticated)
    )
      return;
    let timeoutId: number | undefined;
    let idleId: number | undefined;
    const browser = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (browser.requestIdleCallback) {
      idleId = browser.requestIdleCallback(warmAssistant, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(warmAssistant, 1200);
    }
    return () => {
      if (idleId !== undefined) browser.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [site.id, isAuthenticated]);

  const openAssistant = useCallback((next: AssistantRequest = {}) => {
    setRequest({ ...next, id: next.id || `general-${Date.now()}` });
    setDraft("");
    setQueuedPrompt(null);
    setAssistantActivated(true);
    setOpen(true);
  }, []);
  const closeAssistant = useCallback(() => setOpen(false), []);
  const qc = useQueryClient();
  const { toast } = useToast();

  const openWriteAssistant = useCallback(
    ({ skill, target, id, contextScope, onWritten }: WriteRequest) => {
      void import("@/lib/ai-dynamic-knowledge")
        .then(({ resolveWriteSkill, runWriteSkill }) => {
          const isChinese = (i18n.language || "").startsWith("zh");
          const spec = resolveWriteSkill(skill, target, { isChinese });
          const scope = {
            ...(contextScope || (target.caredOneId ? { caredOneId: target.caredOneId } : {})),
            writeSkills: contextScope?.writeSkills || [skill],
          };
          openAssistant({
            id: id || `${skill}-${target.recordId || target.caredOneId || "new"}`,
            title: spec.title,
            contextPrompt: spec.contextPrompt,
            contextScope: scope,
            starterPrompt: spec.starterPrompt,
            starterFallback: spec.starterFallback,
            completionStatuses: spec.statuses,
            onComplete: async (result) => {
              try {
                const written = await runWriteSkill(skill, target, result, { isChinese });
                written.invalidateKeys.forEach((queryKey) => qc.invalidateQueries({ queryKey }));
                toast({ title: written.message });
                onWritten?.({ status: written.status, summary: written.summary });
              } catch (error) {
                toast({
                  title: isChinese ? "没能保存，请稍后再试。" : "Couldn't save this record. Please try again.",
                  variant: "destructive",
                });
                throw error;
              }
            },
          });
        })
        .catch(() => {
          toast({
            title: (i18n.language || "").startsWith("zh")
              ? "助手暂时无法打开，请重试。"
              : "Could not open the assistant. Please try again.",
            variant: "destructive",
          });
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
      {assistantActivated && (
        <Suspense
          fallback={
            <AssistantOpeningPanel
              open={open}
              request={request}
              draft={draft}
              queuedPrompt={queuedPrompt}
              onOpenChange={setOpen}
              onDraftChange={setDraft}
              onSubmit={(message) => {
                setDraft("");
                setQueuedPrompt(message);
              }}
            />
          }
        >
          <AICompanionChatDialog
            open={open}
            onOpenChange={setOpen}
            request={request}
            draft={draft}
            queuedPrompt={queuedPrompt}
            onDraftChange={setDraft}
            onQueuePrompt={(message) => {
              setDraft("");
              setQueuedPrompt(message);
            }}
            onPromptConsumed={() => setQueuedPrompt(null)}
          />
        </Suspense>
      )}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const value = useContext(AIAssistantContext);
  if (!value) throw new Error("useAIAssistant must be used within AIAssistantProvider");
  return value;
}
