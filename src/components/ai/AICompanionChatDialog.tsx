import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Bot, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { streamChatTextOnly } from "@/lib/ai-stream";

type Msg = { role: "user" | "assistant"; content: string };

export function AICompanionChatDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: isZh
        ? "你好，我是小忆。可以陪你聊天，也可以帮你了解失智症照护。今天想聊什么？"
        : "Hi, I'm your AI companion. I can chat with you or help with dementia care questions. What's on your mind?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<{ abort: () => void } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!open && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setLoading(false);
    }
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }, { role: "assistant", content: "" }];
    setMessages(next);
    setLoading(true);

    try {
      const { abort, result } = streamChatTextOnly(
        next.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
        {
          language: isZh ? "zh" : "en",
          onTextDelta: (_d, full) => {
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: "assistant", content: full };
              return copy;
            });
          },
          onError: (e) => console.error("AI chat error:", e),
        }
      );
      abortRef.current = { abort };
      await result;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

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
                {isZh ? "小忆 AI 助手" : "Xiaoyi · AI Assistant"}
              </DialogPrimitive.Title>
            </div>
            <DialogPrimitive.Close asChild>
              <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground" aria-label={isZh ? "关闭" : "Close"}>
                <X className="h-4 w-4" />
              </button>
            </DialogPrimitive.Close>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-foreground"
                  }`}
                >
                  {m.content || (loading && i === messages.length - 1 ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t p-2 flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder={isZh ? "说点什么…" : "Type a message…"}
              className="flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-32"
            />
            <Button onClick={send} disabled={loading || !input.trim()} size="icon" className="h-9 w-9 shrink-0">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
