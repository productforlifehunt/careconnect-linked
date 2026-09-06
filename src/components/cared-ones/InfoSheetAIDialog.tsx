import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Loader2, Send } from "lucide-react";
import { invokeAI, type AIChatMessage } from "@/lib/ai";
import { trimMessagesToCharLimit } from "@/lib/ai";
import { useTranslation } from "react-i18next";
import { buildInfoSheetContext, type InfoSheetPromptContext } from "../../../supabase/functions/_shared/ai-prompts";

export type InfoSheetAIContext = InfoSheetPromptContext;

export function InfoSheetAIDialog({
  open, onOpenChange, context,
}: { open: boolean; onOpenChange: (o: boolean) => void; context: InfoSheetAIContext }) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setMessages([]);
    setInput("");
    setError(null);
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  const suggestions = isCN
    ? ["今天需要注意什么？", "该怎么和他/她说话？", "如果他/她不肯吃饭怎么办？"]
    : ["What should I watch out for today?", "How should I talk with them?", "What if they refuse to eat?"];

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || sending) return;
    setInput("");
    setError(null);
    const next: AIChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setSending(true);
    try {
      const reply = await invokeAI("care_info_sheet", question, {
        messages: trimMessagesToCharLimit(next),
        contextPrompt: buildInfoSheetContext(context, !!isCN),
        persist: false,
        language: isCN ? "zh" : "en",
      });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setError(Z("现在问不通，请稍后再试，或直接打电话给下面的联系人。", "Can't get an answer right now. Please try again later, or call one of the contacts below."));
      void e;
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            {Z("有问题？直接问", "Ask a question")}
          </DialogTitle>
          <DialogDescription>
            {Z("根据这份照护须知上的内容回答，不是医疗建议。", "Answers come from what's written on this care sheet. Not medical advice.")}
          </DialogDescription>
        </DialogHeader>

        <div ref={scrollRef} className="space-y-3 max-h-[45vh] overflow-y-auto py-1">
          {messages.length === 0 && !sending && (
            <div className="space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="w-full text-left text-sm rounded-md border p-2.5 hover:bg-accent transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : ""}>
              <div className={`inline-block text-sm rounded-lg px-3 py-2 max-w-[90%] whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "text-foreground"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> {Z("正在思考…", "Thinking…")}
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <form
          className="flex gap-2 pt-1"
          onSubmit={(e) => { e.preventDefault(); send(input); }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={Z("输入你的问题…", "Type your question…")}
            aria-label={Z("你的问题", "Your question")}
          />
          <Button type="submit" size="icon" disabled={sending || !input.trim()} aria-label={Z("发送", "Send")}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
