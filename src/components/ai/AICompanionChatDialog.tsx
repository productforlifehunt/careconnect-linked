import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Bot, Check, SkipForward, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { parseAIJson, streamChatTextOnly, trimMessagesToCharLimit } from "@/lib/ai";
import { aiBrand, aiGreeting } from "../../../supabase/functions/_shared/ai-prompts";
import type { AssistantRequest } from "@/contexts/AIAssistantContext";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";

type Msg = { role: "user" | "assistant"; content: string };

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
  const isZh = i18n.language?.startsWith("zh");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<{ abort: () => void } | null>(null);
  const activeRequestId = useRef<string | undefined>();

  useEffect(() => {
    if (!open || activeRequestId.current === request.id) return;
    activeRequestId.current = request.id;
    setInput("");
    const starter = request.starterPrompt?.trim();
    if (!starter) {
      setMessages([{ role: "assistant", content: aiGreeting(!!isZh) }]);
      return;
    }
    setMessages([{ role: "assistant", content: "" }]);
    setLoading(true);
    const { abort, result } = streamChatTextOnly([{ role: "user", content: starter }], {
      language: isZh ? "zh" : "en",
      contextPrompt: request.contextPrompt,
      onTextDelta: (_delta, full) => setMessages([{ role: "assistant", content: full }]),
      onError: () => setMessages([{ role: "assistant", content: request.starterFallback || aiGreeting(!!isZh) }]),
    });
    abortRef.current = { abort };
    void result.finally(() => { setLoading(false); abortRef.current = null; });
  }, [open, request, isZh]);

  useEffect(() => {
    if (!open && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setLoading(false);
    }
  }, [open]);

  const send = async (submittedText?: string) => {
    const text = (submittedText ?? input).trim();
    if (!text || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }, { role: "assistant", content: "" }];
    setMessages(next);
    setLoading(true);

    try {
      const history = trimMessagesToCharLimit(
        next.slice(0, -1).map((m) => ({ role: m.role, content: m.content }))
      );
      const { abort, result } = streamChatTextOnly(history, {
          language: isZh ? "zh" : "en",
           contextPrompt: request.contextPrompt,
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
      const reply = await result;
      const parsed = parseAIJson<{ done?: boolean; summary?: string; status?: string }>(reply);
      if (parsed?.done && parsed.summary && request.onComplete) {
        const allowed = request.completionStatuses || [];
        if (!parsed.status || allowed.length === 0 || allowed.includes(parsed.status)) {
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: `✅ ${parsed.summary}` };
            return copy;
          });
          await request.onComplete({ status: parsed.status, summary: parsed.summary });
        }
      }
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
                {request.title || aiBrand(isZh ? "zh" : "en")}
              </DialogPrimitive.Title>
            </div>
            <DialogPrimitive.Close asChild>
              <button className="p-1.5 rounded-md hover:bg-accent text-muted-foreground" aria-label={isZh ? "关闭" : "Close"}>
                <X className="h-4 w-4" />
              </button>
            </DialogPrimitive.Close>
          </div>

          <Conversation className="min-h-0">
            <ConversationContent className="gap-4 px-4 py-4">
              {messages.map((m, i) => (
                <Message from={m.role} key={`${m.role}-${i}`}>
                  <MessageContent>
                    {m.content ? <MessageResponse>{m.content}</MessageResponse> : <Shimmer>{isZh ? "正在思考…" : "Thinking…"}</Shimmer>}
                  </MessageContent>
                </Message>
              ))}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="border-t p-3 space-y-2">
            {request.onComplete && (
              <div className="flex justify-end gap-2">
                {(request.completionStatuses || []).includes("skipped") && <Button size="sm" variant="outline" onClick={() => request.onComplete?.({ status: "skipped", summary: isZh ? "用户选择跳过。" : "User chose to skip." })}><SkipForward className="h-3.5 w-3.5 mr-1" />{isZh ? "跳过" : "Skip"}</Button>}
                <Button size="sm" onClick={() => request.onComplete?.({ status: request.completionStatuses?.[0], summary: messages.map((m) => `${m.role}: ${m.content}`).join("\n").slice(0, 1500) })}><Check className="h-3.5 w-3.5 mr-1" />{isZh ? "完成并保存" : "Finish & save"}</Button>
              </div>
            )}
            <PromptInput onSubmit={({ text }) => send(text)}>
              <PromptInputBody><PromptInputTextarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={isZh ? "说点什么…" : "Type a message…"} /></PromptInputBody>
              <PromptInputFooter className="justify-end"><PromptInputSubmit status={loading ? "streaming" : "ready"} disabled={loading || !input.trim()} onStop={() => abortRef.current?.abort()} /></PromptInputFooter>
            </PromptInput>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
