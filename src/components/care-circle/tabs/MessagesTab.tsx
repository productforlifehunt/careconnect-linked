import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDate, formatTime, formatDateTime } from "@/lib/locale";

interface MessagesTabProps {
  groupMessages: any[];
  userId: string | undefined;
  activeGroupId: string | null;
  sendMessage: any;
}

export function MessagesTab({ groupMessages, userId, activeGroupId, sendMessage }: MessagesTabProps) {
  const [chatMessage, setChatMessage] = useState("");
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);

  const handleSend = () => {
    if (!chatMessage.trim() || !activeGroupId) return;
    sendMessage.mutate({ content: chatMessage, groupId: activeGroupId }, {
      onSuccess: () => setChatMessage(""),
    });
  };

  return (
    <Card className="border-transparent card-elevated">
      <CardContent className="p-0">
        <div className="h-[400px] flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {(groupMessages || []).map((msg: any) => {
                const isMine = (msg.sender_user_id || msg.sender_id) === userId;
                return (
                  <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-xl px-3 py-2 ${isMine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {!isMine && <p className="text-xs font-medium mb-0.5">{msg.sender?.full_name || Z("未填姓名", "No name")}</p>}
                      <p className="text-sm">{msg.content || msg.message_content}</p>
                      <p className={`text-[10px] mt-0.5 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{formatTime(msg.created_at, isCN ? "zh-CN" : "en", { hour: "numeric", minute: "2-digit" })}</p>
                    </div>
                  </div>
                );
              })}
              {(groupMessages || []).length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">{Z("还没有消息，开始聊天吧！", "No messages yet. Start the conversation!")}</p>}
            </div>
          </ScrollArea>
          <div className="flex gap-2 p-3 border-t">
            <Input value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder={Z("输入消息……", "Type a message...")} onKeyDown={e => e.key === "Enter" && handleSend()} />
            <Button size="icon" onClick={handleSend} disabled={!chatMessage.trim() || sendMessage.isPending}><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
