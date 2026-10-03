import { useCallback, useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Bot, History, Plus, X, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { aiBrand } from "../../../supabase/functions/_shared/ai-prompts";
import { useSite } from "@/contexts/SiteContext";
import type { AssistantRequest } from "@/contexts/AIAssistantContext";
import { AICompanionChat } from "@/components/ai/AICompanionChat";
import { createAiThread, listAiThreads, type AiThread } from "@/lib/ai-threads";

const ACTIVE_THREAD_KEY = "ai-active-thread";

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
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  request?: AssistantRequest;
}) {
  const { i18n } = useTranslation();
  const site = useSite();
  const isZh = i18n.language?.startsWith("zh");

  // Only the general floating chat gets saved threads; task chats don't.
  const threaded = !request.onComplete && !request.starterPrompt && !request.appGuide;
  const [threads, setThreads] = useState<AiThread[]>([]);
  const [activeThread, setActiveThread] = useState<string | undefined>();
  const [listOpen, setListOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  // True once the thread bootstrap finished, so the chat never mounts with a
  // temporary key and gets remounted (wiping an in-flight message) afterwards.
  const [booted, setBooted] = useState(false);

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
    setActiveThread(id);
    setListOpen(false);
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

  // On open: restore the last thread, or the latest one, or create the first.
  useEffect(() => {
    if (!open || !threaded) return;
    let alive = true;
    void (async () => {
      const list = await refresh();
      if (!alive) return;
      if (list) {
        let saved: string | null = null;
        try { saved = localStorage.getItem(ACTIVE_THREAD_KEY); } catch { /* ignore */ }
        if (saved && list.some((t) => t.id === saved)) setActiveThread(saved);
        else if (list[0]) pick(list[0].id);
        else {
          try {
            const id = await createAiThread();
            if (!alive) return;
            await refresh();
            pick(id);
          } catch { /* unsaved chat still works */ }
        }
      }
      if (alive) setBooted(true);
    })();
    return () => { alive = false; };
  }, [open, threaded, refresh, pick]);

  const untitled = isZh ? "新对话" : "New conversation";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="fixed inset-x-3 top-16 bottom-[4.5rem] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[440px] md:h-[640px] rounded-2xl z-50 bg-background flex flex-col shadow-2xl overflow-hidden border"
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
                    className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
                    aria-label={isZh ? "历史对话" : "Past conversations"}
                    aria-expanded={listOpen}
                  >
                    <History className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void newThread()}
                    disabled={busy}
                    className="p-1.5 rounded-md hover:bg-accent text-muted-foreground disabled:opacity-50"
                    aria-label={isZh ? "新建对话" : "New chat"}
                  >
                    <Plus className="h-4 w-4" />
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
                <button
                  key={t.id}
                  type="button"
                  onClick={() => pick(t.id)}
                  className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${t.id === activeThread ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{t.title || untitled}</span>
                </button>
              ))}
            </div>
          )}

          {(!threaded || booted) && (
            <AICompanionChat
              key={threaded ? activeThread ?? "unsaved" : request.id}
              active={open}
              request={request}
              threadId={threaded ? activeThread : undefined}
              onThreadUpdated={() => void refresh()}
            />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
