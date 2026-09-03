import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Loader2, Send } from "lucide-react";
import { invokeAI, type AIChatMessage } from "@/lib/ai-service";
import { useTranslation } from "react-i18next";

export interface InfoSheetAIContext {
  sheetName?: string;
  caredOneName?: string;
  description?: string;
  situationDetails?: string;
  contacts?: Array<{ name?: string; phone?: string; relationship?: string; note?: string }>;
  locationText?: string | null;
}

function buildSystemPrompt(ctx: InfoSheetAIContext, isCN: boolean): string {
  const facts = [
    ctx.sheetName ? `${isCN ? "说明标题" : "Sheet"}: ${ctx.sheetName}` : "",
    ctx.caredOneName ? `${isCN ? "被照护者" : "Person"}: ${ctx.caredOneName}` : "",
    ctx.description ? `${isCN ? "基本情况" : "Background"}: ${ctx.description}` : "",
    ctx.situationDetails ? `${isCN ? "本次照护安排" : "This situation"}: ${ctx.situationDetails}` : "",
    ctx.locationText ? `${isCN ? "最近位置" : "Last known location"}: ${ctx.locationText}` : "",
    ctx.contacts?.length
      ? `${isCN ? "紧急联系人" : "Emergency contacts"}: ${ctx.contacts
          .map((c) => [c.name, c.relationship, c.phone, c.note].filter(Boolean).join(" / "))
          .join(" | ")}`
      : "",
  ].filter(Boolean).join("\n");

  return isCN
    ? [
        "你在帮助一位临时照护者或刚刚看到这份照护须知的人。",
        "只能依据下面提供的信息回答。信息里没有的内容，直接说明这里没有写，并建议联系下面的紧急联系人。",
        "语气简短、温暖、口语化，不要使用医学术语，不要提供医疗诊断或用药建议。",
        "如果对方描述紧急情况，先提示立即联系紧急联系人或当地急救电话。",
        "",
        "已知信息：",
        facts || "（暂无更多信息）",
      ].join("\n")
    : [
        "You are helping a temporary helper or someone who just received this care information sheet.",
        "Answer only from the information below. If something is not written here, say so plainly and suggest contacting the emergency contacts listed.",
        "Keep answers short, warm and plain-spoken. No medical jargon, no diagnosis, no medication advice.",
        "If they describe an emergency, tell them to call the emergency contacts or local emergency services first.",
        "",
        "Known information:",
        facts || "(no further details provided)",
      ].join("\n");
}

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
      const reply = await invokeAI("general_chat", question, {
        messages: [
          { role: "system", content: buildSystemPrompt(context, !!isCN) },
          ...next,
        ],
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
