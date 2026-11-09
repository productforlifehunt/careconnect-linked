import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Bot, History, Plus, X, MessageSquare, Pencil, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { aiBrand } from "../../../supabase/functions/_shared/ai-prompts";
import { useSite } from "@/contexts/SiteContext";
import type { AssistantRequest } from "@/contexts/AIAssistantContext";
import { lazyRetry } from "@/lib/lazy-retry";
import { AIChatWarmup } from "@/components/ai/AIChatWarmup";
import { createAiThread, listAiThreads, touchAiThread, type AiThread } from "@/lib/ai-threads";

const ACTIVE_THREAD_KEY = "ai-active-thread";
const AICompanionChat = lazyRetry(
  () => import("@/components/ai/AICompanionChat").then((module) => ({ default: module.AICompanionChat })),
  "AICompanionChat",
);

function readActiveThread(): string | undefined {
  try { return localStorage.getItem(ACTIVE_THREAD_KEY) || undefined; }
  catch { return undefined; }
}

/**
 * The floating assistant — the app's single AI entry point. General chats are
 * saved as separate conversations (CCT121, type AI) and managed right here:
 * a history list and a new-chat button in the panel header. Task chats
 * (check-in, medicine, info cards) stay one-off and unsaved.
 */
export function AICompanionChatDialog({
  open,
  onOpenChange,
  request = {},
  draft = "",
  queuedPrompt = null,
  onDraftChange = () => undefined,
  onQueuePrompt = () => undefined,
  onPromptConsumed = () => undefined,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  request?: AssistantRequest | undefined;
  draft?: string | undefined;
  queuedPrompt?: string | null | undefined;
  onDraftChange?: ((value: string) => void) | undefined;
  onQueuePrompt?: ((value: string) => void) | undefined;
  onPromptConsumed?: (() => void) | undefined;
}) {
  const { i18n } = useTranslation();
  const site = useSite();
  const isZh = i18n.language?.startsWith("zh");

  // Only the general floating chat gets saved threads; task chats don't.
  const threaded = !request.onComplete && !request.starterPrompt && !request.appGuide;
  const [threads, setThreads] = useState<AiThread[]>([]);
  const [activeThread, setActiveThread] = useState<string | undefined>(readActiveThread);
  const [conversationVersion, setConversationVersion] = useState(0);
  const activeThreadRef = useRef(activeThread);
  activeThreadRef.current = activeThread;
  const [listOpen, setListOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const chatEngaged = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const list = await listAiThreads();
      setThreads(list);
      return list;
    } catch {
      return null; // signed out or offline → fall back to an unsaved chat
    }
  }, []);

  const pick = useCallback((id: string) => {
    chatEngaged.current = true;
    setActiveThread(id);
    setConversationVersion((version) => version + 1);
    setListOpen(false);
    try { localStorage.setItem(ACTIVE_THREAD_KEY, id); } catch { /* ignore */ }
  }, []);

  const onThreadCreated = useCallback((id: string) => {
    setActiveThread(id);
    setThreads((current) => current.some((thread) => thread.id === id)
      ? current
      : [{ id, title: "", updatedAt: new Date().toISOString() }, ...current]);
    try { localStorage.setItem(ACTIVE_THREAD_KEY, id); } catch { /* ignore */ }
  }, []);

  const newThread = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      const id = await createAiThread();
      await refresh();
      pick(id);
    } catch { /* stay on the current chat */ }
    finally { setBusy(false); }
  }, [busy, refresh, pick]);

  // Restore history in the background. The chat and composer remain usable
  // while WordPress returns the thread list.
  useEffect(() => {
    if (!open || !threaded) return;
    let alive = true;
    chatEngaged.current = false;
    void refresh().then((list) => {
      if (!alive || !list || chatEngaged.current) return;
      const saved = readActiveThread();
      if (saved && list.some((thread) => thread.id === saved)) {
        if (saved !== activeThreadRef.current) {
          setActiveThread(saved);
          activeThreadRef.current = saved;
          setConversationVersion((version) => version + 1);
        }
      } else if (list[0] && !activeThreadRef.current) {
        pick(list[0].id);
      } else if (saved && !list.some((thread) => thread.id === saved)) {
        try { localStorage.removeItem(ACTIVE_THREAD_KEY); } catch { /* ignore */ }
        if (list[0]) pick(list[0].id);
        else {
          setActiveThread(undefined);
          activeThreadRef.current = undefined;
        }
      }
    });
    return () => { alive = false; };
  }, [open, threaded, refresh, pick]);

  const untitled = isZh ? "新对话" : "New conversation";
  const [editing, setEditing] = useState<string | null>(null);
  const [threadNameDraft, setThreadNameDraft] = useState("");
  const saveName = async (id: string) => {
    const name = threadNameDraft.trim();
    setEditing(null);
    if (!name) return;
    setThreads((list) => list.map((t) => (t.id === id ? { ...t, title: name } : t)));
    try { await touchAiThread(id, name); await refresh(); } catch { /* keep local name */ }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <DialogPrimitive.Content
          data-inspector-scope="ai-chat-dialog"
          className="fixed inset-x-3 top-16 bottom-[4.5rem] rounded-2xl z-50 bg-background flex flex-col shadow-2xl overflow-hidden border"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <DialogPrimitive.Title className="text-sm font-semibold truncate">
                {request.title || aiBrand(isZh ? "zh" : "en", site.id)}
              </DialogPrimitive.Title>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {threaded && (
                <>
                  <button
                    type="button"
                    onClick={() => setListOpen((v) => !v)}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-accent text-xs text-muted-foreground"
                    aria-expanded={listOpen}
                  >
                    <History className="h-4 w-4" />
                    {isZh ? "所有对话" : "All chats"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void newThread()}
                    disabled={busy}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-accent text-xs text-muted-foreground disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    {isZh ? "新建对话" : "New chat"}
                  </button>
                </>
              )}
              <DialogPrimitive.Close asChild>
                <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground" aria-label={isZh ? "关闭" : "Close"}>
                  <X className="h-4 w-4" />
                </button>
              </DialogPrimitive.Close>
            </div>
          </div>

          {threaded && listOpen && (
            <div className="border-b max-h-44 overflow-y-auto p-2 space-y-1">
              {threads.length === 0 && (
                <p className="p-2 text-xs text-muted-foreground">{isZh ? "还没有保存的对话" : "No saved conversations yet"}</p>
              )}
              {threads.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${t.id === activeThread ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  {editing === t.id ? (
                    <input
                      autoFocus
                      value={threadNameDraft}
                      onChange={(e) => setThreadNameDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") void saveName(t.id); if (e.key === "Escape") setEditing(null); }}
                      className="flex-1 min-w-0 rounded-sm border bg-background px-1.5 py-0.5 text-sm text-foreground"
                    />
                  ) : (
                    <button type="button" onClick={() => pick(t.id)} className="flex-1 min-w-0 truncate text-left">
                      {t.title || untitled}
                    </button>
                  )}
                  {editing === t.id ? (
                    <button type="button" onClick={() => void saveName(t.id)} className="p-1 rounded-sm hover:bg-accent" aria-label={isZh ? "保存名字" : "Save name"}>
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button type="button" onClick={() => { setEditing(t.id); setThreadNameDraft(t.title); }} className="p-1 rounded-sm hover:bg-accent text-muted-foreground" aria-label={isZh ? "改名" : "Rename"}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <Suspense
            fallback={
              <AIChatWarmup
                isChinese={!!isZh}
                autoFocus={open}
                value={draft}
                queuedPrompt={queuedPrompt}
                onChange={(value) => {
                  if (value) chatEngaged.current = true;
                  onDraftChange(value);
                }}
                onSubmit={(message) => {
                  chatEngaged.current = true;
                  onQueuePrompt(message);
                }}
              />
            }
          >
            <AICompanionChat
              key={threaded ? conversationVersion : request.id}
              active={open}
              request={request}
              threadId={threaded ? activeThread : undefined}
              initialDraft={draft}
              initialPrompt={queuedPrompt}
              onInitialPromptConsumed={onPromptConsumed}
              onChatEngaged={() => { chatEngaged.current = true; }}
              onDraftChange={onDraftChange}
              onThreadCreated={onThreadCreated}
              onThreadUpdated={() => void refresh()}
            />
          </Suspense>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
