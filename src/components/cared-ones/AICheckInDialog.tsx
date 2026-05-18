import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2, Send, Check, SkipForward } from "lucide-react";

import { invokeAI, parseAIJson, type AIChatMessage } from "@/lib/ai-service";
import { useLogCheckin } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  checkin: any;
  caredOneName?: string;
}

const SYSTEM_PROMPT = (checkinName: string, instructions: string, caredOneName: string) => `
You are a warm, caring wellness companion conducting a daily check-in for "${caredOneName}".
Check-in: "${checkinName}". ${instructions ? `Instructions: ${instructions}.` : ""}

Your job:
1. Greet warmly (1 sentence) and ask 3-5 short, friendly wellness questions, ONE at a time.
2. Cover: mood, sleep, appetite, pain/discomfort, anything notable today.
3. Keep each message under 2 sentences. Be empathetic, never clinical.
4. After enough info (usually 4-5 exchanges), respond with EXACTLY this JSON (no prose, no fences):
{"done": true, "summary": "<2-3 sentence summary of how they're doing today>", "status": "checked"}
If the person clearly wants to skip, return: {"done": true, "summary": "User chose to skip.", "status": "skipped"}

Never give medical advice. If they mention emergencies, urge them to contact help and still complete the check-in.
`.trim();

export function AICheckInDialog({ open, onOpenChange, checkin, caredOneName = "your loved one" }: Props) {
  const { toast } = useToast();
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
    const sys = SYSTEM_PROMPT(checkin?.name || "Check-In", checkin?.instructions || "", caredOneName);
    setSending(true);
    invokeAI("general_chat", "Please start the check-in now.", {
      messages: [
        { role: "system", content: sys },
        { role: "user", content: "Please start the check-in now." },
      ],
    })
      .then((reply) => setMessages([{ role: "assistant", content: reply }]))
      .catch((e) => toast({ title: "AI unavailable", description: String(e?.message || e), variant: "destructive" }))
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
          toast({ title: `AI check-in saved (${status}) ✓` });
          setCompleted(true);
          setTimeout(() => onOpenChange(false), 800);
        },
        onError: (e: any) => toast({ title: "Save failed", description: String(e?.message || e), variant: "destructive" }),
      }
    );
  };

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    const sys = SYSTEM_PROMPT(checkin?.name || "Check-In", checkin?.instructions || "", caredOneName);
    const next: AIChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setSending(true);
    try {
      const reply = await invokeAI("general_chat", text, {
        messages: [{ role: "system", content: sys }, ...next],
      });

      // Try to parse completion JSON
      const parsed = parseAIJson<{ done?: boolean; summary?: string; status?: "checked" | "skipped" }>(reply);
      if (parsed?.done && parsed.summary) {
        setMessages((m) => [...m, { role: "assistant", content: `✅ ${parsed.summary}` }]);
        finalize(parsed.status === "skipped" ? "skipped" : "checked", parsed.summary);
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e: any) {
      toast({ title: "AI error", description: String(e?.message || e), variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const finishNow = () => {
    // Manual completion: ask AI to summarize from history
    const transcript = messages.map((m) => `${m.role === "user" ? "Caregiver" : "AI"}: ${m.content}`).join("\n");
    finalize("checked", transcript.slice(0, 1500) || "AI-assisted check-in completed.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" /> AI Check-In
            <Badge variant="outline" className="ml-2">{checkin?.name}</Badge>
          </DialogTitle>
          <DialogDescription>Chat naturally — the AI will save the result when done.</DialogDescription>
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
            placeholder="Type your reply…"
            disabled={sending || completed}
          />
          <Button onClick={send} disabled={sending || !input.trim() || completed}>
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => finalize("skipped", "Skipped via AI check-in.")} disabled={logCheckin.isPending || completed}>
            <SkipForward className="h-4 w-4 mr-1" /> Skip
          </Button>
          <Button size="sm" onClick={finishNow} disabled={logCheckin.isPending || completed || messages.length < 2}>
            <Check className="h-4 w-4 mr-1" /> Finish & Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
