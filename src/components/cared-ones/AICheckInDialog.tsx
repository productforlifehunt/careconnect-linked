import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2, Send, Check, SkipForward } from "lucide-react";

import { invokeAI, parseAIJson, type AIChatMessage } from "@/lib/ai-service";
import { trimMessagesToCharLimit } from "@/lib/ai-memory";
import { useLogCheckin } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { buildCheckInContext } from "../../../supabase/functions/_shared/ai-prompts";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  checkin: any;
  caredOneName?: string;
}

export function AICheckInDialog({ open, onOpenChange, checkin, caredOneName }: Props) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const defaultCaredOneName = caredOneName || Z("您的被护理者", "your loved one");
  const logCheckin = useLogCheckin();
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [completed, setCompleted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Kick off greeting
  useEffect(() => {
    if (!open || !checkin) return;
    setMessages([]);
    setInput("");
    setCompleted(false);
    const sys = buildCheckInContext(checkin?.name || Z("签到", "Check-In"), checkin?.instructions || "", defaultCaredOneName, !!isCN);
    const starter = Z("现在请开始签到。", "Please start the check-in now.");
    setSending(true);
    invokeAI("general_chat", starter, {
      messages: [
        { role: "system", content: sys },
        { role: "user", content: starter },
      ],
      persist: false,
      language: isCN ? "zh" : "en",
    })
      .then((reply) => setMessages([{ role: "assistant", content: reply }]))
      .catch((e) => toast({ title: Z("AI 不可用", "AI unavailable"), description: String(e?.message || e), variant: "destructive" }))
      .finally(() => setSending(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, checkin?.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const finalize = (status: "checked" | "skipped", summary: string) => {
    logCheckin.mutate(
      { checkin_id: String(checkin.id), status, note: summary, checked_by_ai: true },
      {
        onSuccess: () => {
          toast({ title: Z(`AI 签到已保存(${status === "skipped" ? "跳过" : "已签到"})✓`, `AI check-in saved (${status}) ✓`) });
          setCompleted(true);
          setTimeout(() => onOpenChange(false), 800);
        },
        onError: (e: any) => toast({ title: Z("保存失败", "Save failed"), description: String(e?.message || e), variant: "destructive" }),
      }
    );
  };

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    const sys = buildCheckInContext(checkin?.name || Z("签到", "Check-In"), checkin?.instructions || "", defaultCaredOneName, !!isCN);
    const next: AIChatMessage[] = [...messages, { role: "user", content: text }];
    const capped = trimMessagesToCharLimit([{ role: "system" as const, content: sys }, ...next]);
    setMessages(next);
    setSending(true);
    try {
      const reply = await invokeAI("general_chat", text, {
        messages: capped,
        persist: false,
        language: isCN ? "zh" : "en",
      });

      const parsed = parseAIJson<{ done?: boolean; summary?: string; status?: "checked" | "skipped" }>(reply);
      if (parsed?.done && parsed.summary) {
        setMessages((m) => [...m, { role: "assistant", content: `✅ ${parsed.summary}` }]);
        finalize(parsed.status === "skipped" ? "skipped" : "checked", parsed.summary);
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e: any) {
      toast({ title: Z("AI 出错", "AI error"), description: String(e?.message || e), variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const finishNow = () => {
    const transcript = messages.map((m) => `${m.role === "user" ? Z("护理者", "Caregiver") : "AI"}: ${m.content}`).join("\n");
    finalize("checked", transcript.slice(0, 1500) || Z("AI 协助的签到已完成。", "AI-assisted check-in completed."));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" /> {Z("AI 智能签到", "AI Check-In")}
            <Badge variant="outline" className="ml-2">{checkin?.name}</Badge>
          </DialogTitle>
          <DialogDescription>{Z("自然对话即可——AI 会在完成后自动保存结果。", "Chat naturally — the AI will save the result when done.")}</DialogDescription>
        </DialogHeader>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 py-2 min-h-[260px]">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`rounded-2xl px-3 py-2 max-w-[80%] text-sm whitespace-pre-wrap ${
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-3 py-2 bg-muted">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
            placeholder={Z("输入您的回复…", "Type your reply…")}
            disabled={sending || completed}
          />
          <Button onClick={send} disabled={sending || !input.trim() || completed}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => finalize("skipped", Z("通过 AI 签到跳过。", "Skipped via AI check-in."))} disabled={logCheckin.isPending || completed}>
            <SkipForward className="h-4 w-4 mr-1" /> {Z("跳过", "Skip")}
          </Button>
          <Button size="sm" onClick={finishNow} disabled={logCheckin.isPending || completed || messages.length < 2}>
            <Check className="h-4 w-4 mr-1" /> {Z("完成并保存", "Finish & Save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

