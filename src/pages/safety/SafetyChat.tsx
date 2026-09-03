import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Loader2, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  getOrCreateGroupConversationWordPress,
  fetchDirectMessagesWordPress,
  sendMessageWordPress,
} from "@/features/conversations/source.wordpress";
import { useSafetyCircle } from "./useSafetyCircle";
import { formatTime } from "@/lib/locale";

/**
 * Family chat — one thread per circle, on the existing chat CCTs and the
 * conversation↔message JetEngine relation. No new backend.
 */
export default function SafetyChat() {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");
  const L = (cn: string, en: string) => (zh ? cn : en);
  const { toast } = useToast();
  const qc = useQueryClient();
  const { circleId, circles, members, selfId } = useSafetyCircle();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const circleName = useMemo(
    () => (circles.find((c: any) => String(c.id) === String(circleId)) as any)?.name || L("我的圈子", "My circle"),
    [circles, circleId, zh],
  );

  const convoQ = useQuery({
    queryKey: ["safety", "chat-convo", circleId],
    queryFn: () => getOrCreateGroupConversationWordPress(String(circleId)),
    enabled: !!circleId,
  });
  const conversationId = convoQ.data || null;

  const msgsQ = useQuery({
    queryKey: ["safety", "chat-msgs", conversationId],
    queryFn: () => fetchDirectMessagesWordPress(String(conversationId)),
    enabled: !!conversationId,
    refetchInterval: 20_000,
  });
  const messages = msgsQ.data || [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const nameOf = (senderId: string | null) => {
    const raw = String(senderId || "").replace(/^wp-/, "");
    const m = members.find((x) => x.userId === raw);
    return m?.name || L("家人", "Family");
  };

  const send = async () => {
    const body = text.trim();
    if (!body || !conversationId || sending) return;
    setSending(true);
    try {
      const others = members.filter((m) => !m.isSelf).map((m) => m.userId);
      await sendMessageWordPress(String(conversationId), body, selfId || "", others[0] || "");
      setText("");
      await qc.invalidateQueries({ queryKey: ["safety", "chat-msgs", conversationId] });
    } catch {
      toast({
        variant: "destructive",
        title: L("没有发出去", "Message not sent"),
        description: L("请检查网络后再试一次。", "Check your connection and try again."),
      });
    } finally {
      setSending(false);
    }
  };

  if (!circleId) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
        <Users className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">{L("先建立一个圈子，就能和家人聊天。", "Create a circle to start chatting with your family.")}</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem-4.5rem)] flex-col md:h-[calc(100dvh-4rem-2rem)] md:py-4">
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-none border-x-0 md:rounded-2xl md:border-x">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Users className="h-4 w-4 text-primary" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{circleName}</p>
            <p className="text-xs text-muted-foreground">
              {members.length} {L("位家人", members.length === 1 ? "member" : "members")}
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {(convoQ.isLoading || msgsQ.isLoading) && (
            <div className="space-y-3">
              <Skeleton className="h-12 w-2/3" />
              <Skeleton className="ml-auto h-12 w-1/2" />
              <Skeleton className="h-12 w-3/5" />
            </div>
          )}
          {!msgsQ.isLoading && messages.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {L("还没有消息，说句“到家了”开始吧。", "No messages yet — try saying \u201cI\u2019m home\u201d.")}
            </p>
          )}
          {messages.map((m: any) => {
            const mine = String(m.sender_user_id || "").replace(/^wp-/, "") === String(selfId || "");
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {!mine && <p className="mb-0.5 text-[11px] font-semibold opacity-70">{nameOf(m.sender_user_id)}</p>}
                  <p className="whitespace-pre-wrap break-words text-sm">{m.content}</p>
                  <p className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {m.created_at ? formatTime(m.created_at) : ""}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <div className="flex items-center gap-2 border-t p-3">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder={L("给家人发消息…", "Message your family…")}
            aria-label={L("消息内容", "Message text")}
          />
          <Button onClick={() => void send()} disabled={!text.trim() || sending} aria-label={L("发送", "Send")}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
