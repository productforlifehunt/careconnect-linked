import { useEffect, useRef, useState } from "react";
import { Check, SkipForward, Volume2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { parseAIJson, speakTextStreaming, streamChatTextOnly, trimMessagesToCharLimit, type StreamControls } from "@/lib/ai";
import { aiGreeting } from "../../../supabase/functions/_shared/ai-prompts";
import type { AssistantRequest } from "@/contexts/AIAssistantContext";
import { resolveAssistantContext } from "@/lib/ai-dynamic-knowledge";
import { useSite } from "@/contexts/SiteContext";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";

type Msg = { role: "user" | "assistant"; content: string };

/** Read-aloud preference: one switch, remembered between visits. */
const READ_ALOUD_KEY = "ai-read-aloud";
const READ_ALOUD_VOICE = "nova";
/** gpt-audio-mini (via OpenRouter); falls back to the built-in voice server-side. */
const READ_ALOUD_ENGINE = "openai" as const;

/**
 * The one and only chat body. Every AI surface in the app (floating assistant,
 * information-card dropdown, check-in, medicine reminder) renders this and calls
 * the same edge function through streamChatTextOnly.
 */
export function AICompanionChat({
  active,
  request = {},
  className,
}: {
  active: boolean;
  request?: AssistantRequest;
  className?: string;
}) {
  const { i18n } = useTranslation();
  const site = useSite();
  const isZh = i18n.language?.startsWith("zh");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<{ abort: () => void } | null>(null);
  const activeRequestId = useRef<string | undefined>();

  /**
   * On-demand context: the static snippets that match this question plus only
   * the permitted dynamic facts it needs. See src/lib/ai-dynamic-knowledge.ts.
   */
  const buildContext = async (question: string): Promise<string | undefined> => {
    // The general floating assistant has no scope of its own: give it the app
    // how-to and care-tip libraries, still retrieved per question.
    const scope = request.contextScope
      ?? (request.contextPrompt ? undefined : { topics: ["app-basics", "care-tips"] as const });
    if (!scope) return request.contextPrompt;
    let resolved = "";
    try {
      resolved = await resolveAssistantContext({
        question,
        isChinese: !!isZh,
        caredOneId: scope.caredOneId,
        groupId: scope.groupId,
        groupName: scope.groupName,
        topics: scope.topics as any,
        sharedCard: scope.sharedCard,
      });
    } catch (e) {
      console.warn("AI context resolution failed, continuing without facts:", e);
    }
    return [request.contextPrompt, resolved].filter(Boolean).join("\n\n") || undefined;
  };

  useEffect(() => {
    if (!active || activeRequestId.current === request.id) return;
    activeRequestId.current = request.id;
    setInput("");
    const starter = request.starterPrompt?.trim();
    if (!starter) {
      setMessages([{ role: "assistant", content: aiGreeting(!!isZh, site.id) }]);
      return;
    }
    setMessages([{ role: "assistant", content: "" }]);
    setLoading(true);
    void buildContext(starter).then((contextPrompt) => {
    const { abort, result } = streamChatTextOnly([{ role: "user", content: starter }], {
      language: isZh ? "zh" : "en",
      contextPrompt,
      onTextDelta: (_delta, full) => setMessages([{ role: "assistant", content: full }]),
      onError: () => setMessages([{ role: "assistant", content: request.starterFallback || aiGreeting(!!isZh, site.id) }]),
    });
    abortRef.current = { abort };
    void result.catch(() => undefined).finally(() => { setLoading(false); abortRef.current = null; });
    });
  }, [active, request, isZh]);

  useEffect(() => {
    if (!active && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setLoading(false);
    }
  }, [active]);

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
      const contextPrompt = await buildContext(text);
      const { abort, result } = streamChatTextOnly(history, {
        language: isZh ? "zh" : "en",
        contextPrompt,
        onTextDelta: (_d, full) => {
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: full };
            return copy;
          });
        },
        onError: (e) => console.error("AI chat error:", e),
      });
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
    <div className={className ?? "flex min-h-0 flex-1 flex-col"}>
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
            {(request.completionStatuses || []).includes("skipped") && (
              <Button size="sm" variant="outline" onClick={() => request.onComplete?.({ status: "skipped", summary: isZh ? "用户选择跳过。" : "User chose to skip." })}>
                <SkipForward className="h-3.5 w-3.5 mr-1" />{isZh ? "跳过" : "Skip"}
              </Button>
            )}
            <Button size="sm" onClick={() => request.onComplete?.({ status: request.completionStatuses?.[0], summary: messages.map((m) => `${m.role}: ${m.content}`).join("\n").slice(0, 1500) })}>
              <Check className="h-3.5 w-3.5 mr-1" />{isZh ? "完成并保存" : "Finish & save"}
            </Button>
          </div>
        )}
        <PromptInput onSubmit={({ text }) => send(text)}>
          <PromptInputBody>
            <PromptInputTextarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={isZh ? "说点什么…" : "Type a message…"} />
          </PromptInputBody>
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={loading ? "streaming" : "ready"} disabled={loading || !input.trim()} onStop={() => abortRef.current?.abort()} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
