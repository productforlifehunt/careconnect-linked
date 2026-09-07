import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { invokeAI } from "@/lib/ai";
import { trimMessagesToCharLimit } from "@/lib/ai";
import { zoneTypeLabel } from "@/features/location/zone-types";
import { useSafetyCircle } from "./useSafetyCircle";
import { buildSafetyContext } from "../../../supabase/functions/_shared/ai-prompts";

type Msg = { role: "user" | "assistant"; content: string };

/**
 * Safety assistant — answers questions from the circle data already loaded on
 * the map (members, last locations, places). No new backend, no invented data.
 */
export default function SafetyAssistant() {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");
  const L = (cn: string, en: string) => (zh ? cn : en);
  const { members, zones, circles, circleId } = useSafetyCircle(60_000);
  const activeCircle = (circles || []).find((c: any) => String(c.id) === String(circleId));
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const context = useMemo(() => {
    const roster = (members || []).map((m: any) => {
      const loc = m.snapshot;
      return [
        m.name || L("家人", "Family member"),
        loc?.address ? `${L("位置", "at")}: ${loc.address}` : loc ? `${loc.latitude}, ${loc.longitude}` : L("暂无位置", "no location yet"),
        loc?.battery_level != null ? `${L("电量", "battery")}: ${loc.battery_level}%` : "",
        loc?.recorded_at ? `${L("更新时间", "updated")}: ${loc.recorded_at}` : "",
      ].filter(Boolean).join(" · ");
    }).join("\n");
    const places = (zones || [])
      .map((z: any) => zoneTypeLabel(String(z.zone_type), z.zone_name, !!zh))
      .filter(Boolean)
      .join(", ");
    return [
      `${L("圈子", "Circle")}: ${activeCircle?.name || "-"}`,
      `${L("成员与最新位置", "Members and latest locations")}:\n${roster || "-"}`,
      `${L("已设置地点", "Saved places")}: ${places || "-"}`,
    ].join("\n\n");
  }, [members, zones, activeCircle, zh]);

  const suggestions = [
    L("现在大家都在哪里？", "Where is everyone right now?"),
    L("有谁的手机快没电了？", "Whose phone is running low on battery?"),
    L("我该为孩子设置哪些地点提醒？", "Which place alerts should I set up for my kid?"),
  ];

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setBusy(true);
    try {
      const history = trimMessagesToCharLimit([...messages, { role: "user" as const, content: q }]);
      const reply = await invokeAI(q, {
        messages: history,
        contextPrompt: buildSafetyContext(context, !!zh),
        persist: false,
        language: zh ? "zh" : "en",
      });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
    } catch (e: any) {
      toast({ title: L("助手暂时没能回答", "The assistant couldn't answer just now"), description: e?.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  return (
    <div className="flex min-h-[calc(100dvh-9rem)] flex-col p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
          <Sparkles className="h-4 w-4 text-primary" />
        </span>
        <div>
          <h1 className="text-lg font-bold">{L("安全助手", "Safety assistant")}</h1>
          <p className="text-xs text-muted-foreground">{L("基于你圈子里的真实位置数据回答", "Answers from your circle's own location data")}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {messages.length === 0 && (
          <Card className="border-transparent card-elevated">
            <CardContent className="space-y-2 p-4">
              <p className="text-sm text-muted-foreground">{L("试着问：", "Try asking:")}</p>
              {suggestions.map((s) => (
                <Button key={s} variant="outline" size="sm" className="w-full justify-start text-left" onClick={() => ask(s)}>
                  {s}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />{L("正在查看你的圈子…", "Checking your circle…")}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="sticky bottom-0 mt-3 flex items-end gap-2 bg-background pt-2"
        onSubmit={(e) => { e.preventDefault(); ask(input); }}
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
          placeholder={L("问一句…", "Ask something…")}
          rows={1}
          className="min-h-[44px] resize-none"
          aria-label={L("提问", "Ask a question")}
        />
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={busy || !input.trim()} aria-label={L("发送", "Send")}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
