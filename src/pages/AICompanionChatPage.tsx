import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bot, Plus, MessageSquare } from "lucide-react";
import { AICompanionChat } from "@/components/ai/AICompanionChat";
import { Button } from "@/components/ui/button";
import { useSite } from "@/contexts/SiteContext";
import { aiBrand } from "../../supabase/functions/_shared/ai-prompts";
import { createAiThread, listAiThreads, ownsAiThread, type AiThread } from "@/lib/ai-threads";

/**
 * Full-page AI assistant with saved, separate conversations.
 * /ai-companion/chat            → opens the latest thread (or creates one)
 * /ai-companion/chat/:threadId  → that thread; each has its own context.
 */
export default function AICompanionChatPage() {
  const { i18n } = useTranslation();
  const site = useSite();
  const isZh = i18n.language?.startsWith("zh");
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<AiThread[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [allowed, setAllowed] = useState<string | null>(null);
  const booting = useRef(false);
  const search = typeof window !== "undefined" ? window.location.search : "";
  const to = (id: string) => `/ai-companion/chat/${id}${search}`;

  const refresh = useCallback(async () => {
    try { const list = await listAiThreads(); setThreads(list); return list; }
    catch { setError(isZh ? "无法读取对话列表。" : "Couldn't load your conversations."); return null; }
  }, [isZh]);

  const newThread = async () => {
    if (creating) return;
    setCreating(true);
    try { const id = await createAiThread(); await refresh(); navigate(to(id)); }
    catch { setError(isZh ? "无法新建对话。" : "Couldn't start a new conversation."); }
    finally { setCreating(false); }
  };

  useEffect(() => {
    void (async () => {
      const list = await refresh();
      if (threadId || !list || booting.current) return;
      booting.current = true;
      if (list[0]) navigate(to(list[0].id), { replace: true });
      else {
        try { const id = await createAiThread(); await refresh(); navigate(to(id), { replace: true }); }
        catch { setError(isZh ? "无法新建对话。" : "Couldn't start a new conversation."); }
      }
    })();
  }, [threadId]);

  useEffect(() => {
    if (!threadId) return;
    setAllowed(null);
    ownsAiThread(threadId)
      .then((ok) => setAllowed(ok ? threadId : "denied"))
      .catch(() => setAllowed("denied"));
  }, [threadId]);

  const untitled = isZh ? "新对话" : "New conversation";

  return (
    <div className="max-w-6xl mx-auto px-4 py-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Bot className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
            {aiBrand(isZh ? "zh" : "en", site.id)}
          </h1>
          <p className="text-sm text-muted-foreground">{isZh ? "每段对话单独保存，互不影响" : "Each conversation is saved on its own"}</p>
        </div>
        <Button onClick={newThread} disabled={creating} size="sm">
          <Plus className="h-4 w-4 mr-1" />{isZh ? "新建对话" : "New chat"}
        </Button>
      </div>
      {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <nav aria-label={isZh ? "对话列表" : "Conversations"} className="rounded-2xl border bg-card p-2 md:h-[calc(100dvh-15rem)] overflow-y-auto max-h-48 md:max-h-none">
          {threads.length === 0 && <p className="p-2 text-sm text-muted-foreground">{isZh ? "还没有对话" : "No conversations yet"}</p>}
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => navigate(to(t.id))}
              className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${t.id === threadId ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"}`}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="truncate">{t.title || untitled}</span>
            </button>
          ))}
        </nav>
        <div className="rounded-2xl border bg-card h-[calc(100dvh-15rem)] min-h-[420px] flex flex-col overflow-hidden">
          {allowed === "denied" ? (
            <p className="p-6 text-sm text-muted-foreground">{isZh ? "找不到这段对话。" : "This conversation isn't available."}</p>
          ) : threadId && allowed === threadId ? (
            <AICompanionChat key={threadId} active threadId={threadId} onThreadUpdated={refresh} className="flex-1 min-h-0" />
          ) : (
            <p className="p-6 text-sm text-muted-foreground">{isZh ? "正在打开…" : "Opening…"}</p>
          )}
        </div>
      </div>
    </div>
  );
}
