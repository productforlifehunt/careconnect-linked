import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Search, Phone, Video, MoreVertical, Loader2, Plus, X, Tag } from "lucide-react";
import { MessageAttachment } from "@/components/messages/MessageAttachment";
import { MessageBubble } from "@/components/messages/MessageBubble";
import { QuoteDialog } from "@/components/messages/QuoteDialog";
import { encodeQuote, type QuoteData } from "@/lib/quote-protocol";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useConversations, useDirectMessages, useSendMessage, useSearchProfiles, useStartConversation, useMarkMessagesRead, useMyProfile } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function Messages() {
  const { t, i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const { toast } = useToast();
  const { data: profile } = useMyProfile();
  const location = useLocation();
  const qc = useQueryClient();
  const { data: conversations, isLoading: convosLoading } = useConversations();
  const sendMessage = useSendMessage();
  const startConversation = useStartConversation();
  const markRead = useMarkMessagesRead();

  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [selectedOtherUser, setSelectedOtherUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<{ url: string; type: "image" | "file" } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newConvoOpen, setNewConvoOpen] = useState(false);
  const [newConvoSearch, setNewConvoSearch] = useState("");
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navHandledRef = useRef(false);
  const { data: newConvoResults } = useSearchProfiles(newConvoSearch);
  const [handledNavState, setHandledNavState] = useState(false);

  // Conversation rows from the WP adapter are flat: participant_1_id / participant_2_id / other_user_id (already prefixed wp-).
  // We surface the "other" side as a minimal user stub; full name/avatar can be fetched lazily later.
  const getOtherUser = (convo: any) => {
    if (!convo) return null;
    const otherId =
      convo.other_user_id ||
      (profile?.id && String(convo.participant_1_id) === String(profile.id).replace(/^wp-/, "")
        ? `wp-${convo.participant_2_id}`
        : `wp-${convo.participant_1_id}`);
    return {
      id: otherId,
      full_name: convo.other_user_name || `User ${String(otherId).replace(/^wp-/, "")}`,
      avatar_url: convo.other_user_avatar || null,
    };
  };

  // Poll conversations every 30s, only while the Messages page tab is visible.
  // WordPress CCT has no WebSocket, so AJAX polling is the only realtime option here.
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    };
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, [qc]);

  const [quotePrefill, setQuotePrefill] = useState<{ serviceType?: string; jobId?: string | number } | null>(null);

  useEffect(() => {
    const navState = location.state as any;
    if (navState?.targetUserId && !navHandledRef.current) {
      navHandledRef.current = true;
      setHandledNavState(true);
      const targetUser = {
        id: navState.targetUserId,
        full_name: navState.targetUserName,
        avatar_url: navState.targetUserAvatar,
      };
      startConversation.mutate(navState.targetUserId, {
        onSuccess: (convoId: string) => {
          setSelectedConvoId(convoId);
          setSelectedOtherUser(targetUser);
          qc.invalidateQueries({ queryKey: ["conversations"] });
          if (navState.openQuote) {
            if (navState.quotePrefill) setQuotePrefill(navState.quotePrefill);
            setQuoteDialogOpen(true);
          }
        },
      });
    }
  }, [location.state]);

  useEffect(() => {
    const navState = location.state as any;
    if (conversations && conversations.length > 0 && !selectedConvoId && !navState?.targetUserId) {
      const first = conversations[0];
      setSelectedConvoId(first.id);
      setSelectedOtherUser(getOtherUser(first));
    }
  }, [conversations, selectedConvoId, profile?.id]);

  const otherUserId = selectedOtherUser?.id || null;
  // Messages are fetched by conversationId, not by otherUserId.
  const { data: messages, isLoading: msgsLoading } = useDirectMessages(selectedConvoId);

  // Backwards-compat: keep a no-op reference to silence linter on unused.
  void otherUserId;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if ((!newMessage.trim() && !pendingAttachment) || !selectedConvoId || !selectedOtherUser?.id) return;
    sendMessage.mutate({
      conversationId: selectedConvoId,
      content: newMessage || (pendingAttachment ? (pendingAttachment.type === "image" ? "📷 Image" : "📎 File") : ""),
      receiverUserId: selectedOtherUser.id,
    });
    setNewMessage("");
    setPendingAttachment(null);
  };

  const handleSendQuote = async (quote: QuoteData) => {
    if (!selectedConvoId || !selectedOtherUser?.id) return;
    const encoded = encodeQuote(quote);
    await sendMessage.mutateAsync({
      conversationId: selectedConvoId,
      content: encoded,
      receiverUserId: selectedOtherUser.id,
    });
    qc.invalidateQueries({ queryKey: ["messages"] });
    qc.invalidateQueries({ queryKey: ["conversations"] });
    setQuoteDialogOpen(false);
    toast({ title: Z("报价已发送", "Quote sent"), description: `$${quote.amount} ${quote.mode === "hourly" ? Z("（按小时）", "(hourly)") : Z("（一口价）", "(flat)")} ${Z("已发送", "sent")}.` });
  };

  const handleStartConversation = (person: any) => {
    startConversation.mutate(person.id, {
      onSuccess: (convoId: string) => {
        setSelectedOtherUser(person);
        setSelectedConvoId(convoId);
        setNewConvoOpen(false);
        setNewConvoSearch("");
      },
      onError: (err: any) => toast({ title: Z("操作失败", "Failed"), description: err.message, variant: "destructive" }),
    });
  };

  const filteredConvos = (conversations || []).filter((c: any) => {
    if (!searchQuery.trim()) return true;
    const other = getOtherUser(c);
    return (other?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  const ConvoSkeleton = () => (
    <div className="space-y-0">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="p-4 border-b flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Conversation List */}
      <div className={`w-full md:w-80 border-r flex flex-col bg-card ${selectedConvoId ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">{t("messages.messages")}</h2>
            <Button variant="ghost" size="icon" onClick={() => setNewConvoOpen(true)} title={t("messages.newConversation")}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("messages.searchConversations")} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {convosLoading ? (
            <ConvoSkeleton />
          ) : filteredConvos.length > 0 ? filteredConvos.map((c: any) => {
            const other = getOtherUser(c);
            const isSelected = selectedConvoId === c.id;
            return (
              <div
                key={c.id}
                className={`p-4 cursor-pointer border-b transition-colors ${isSelected ? "bg-accent" : "hover:bg-muted/50"}`}
                onClick={() => { setSelectedConvoId(c.id); setSelectedOtherUser(other); if (other?.id && c.unread_count > 0) markRead.mutate(other.id); }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {other?.avatar_url ? (
                      <img src={other.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-sm font-medium">{(other?.full_name || "?").charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium text-sm ${c.unread_count > 0 ? "text-foreground font-semibold" : "text-foreground"}`}>{other?.full_name || t("common.unknown")}</span>
                      <span className="text-xs text-muted-foreground">
                        {c.last_message_at ? new Date(c.last_message_at).toLocaleDateString("en", { month: "short", day: "numeric" }) : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground truncate">
                        {c.last_message ? (c.last_message.sender_id === profile?.id ? `${t("common.you")}: ` : "") + (c.last_message.message_content || "").substring(0, 50) : t("messages.noMessages")}
                      </p>
                      {c.unread_count > 0 && (
                        <span className="shrink-0 w-5 h-5 rounded-full bg-coral text-coral-foreground text-xs flex items-center justify-center font-semibold">{c.unread_count > 9 ? "9+" : c.unread_count}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-muted-foreground mb-3">{t("messages.noConversations")}</p>
              <Button size="sm" variant="coral" onClick={() => setNewConvoOpen(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> {t("messages.startConversation")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedOtherUser ? (
        <div className={`flex-1 flex flex-col ${selectedConvoId ? "flex" : "hidden md:flex"}`}>
          <div className="p-4 border-b flex items-center justify-between bg-card">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => { setSelectedConvoId(null); setSelectedOtherUser(null); }}>←</Button>
              <div className="relative">
                {selectedOtherUser.avatar_url ? (
                  <img src={selectedOtherUser.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm font-medium">{(selectedOtherUser.full_name || "?").charAt(0)}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{selectedOtherUser.full_name}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><Video className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-3 bg-muted/20">
            {msgsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                    <Skeleton className={`h-12 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-56"}`} />
                  </div>
                ))}
              </div>
            ) : (messages || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-muted-foreground text-sm">{t("messages.noMessages")}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("messages.startConversationBelow")}</p>
              </div>
            ) : (messages || []).map((m: any) => (
              <MessageBubble
                key={m.id}
                message={m}
                isMe={m.sender_id === profile?.id}
                conversationId={selectedConvoId || undefined}
                otherUserId={selectedOtherUser?.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t bg-card">
            {pendingAttachment && (
              <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-muted/50 text-sm">
                <span className="text-muted-foreground truncate flex-1">
                  {pendingAttachment.type === "image" ? "📷" : "📎"} {pendingAttachment.url.split("/").pop()}
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setPendingAttachment(null)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <MessageAttachment onAttach={(url, type) => setPendingAttachment({ url, type })} disabled={sendMessage.isPending} />
              <Button
                variant="ghost"
                size="icon"
                title="Send a price quote"
                onClick={() => setQuoteDialogOpen(true)}
                disabled={!selectedConvoId}
              >
                <Tag className="h-4 w-4" />
              </Button>
              <Input
                placeholder={t("messages.typeMessage")}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                className="flex-1"
              />
              <Button variant="coral" size="icon" onClick={handleSend} disabled={(!newMessage.trim() && !pendingAttachment) || sendMessage.isPending}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center text-muted-foreground gap-3">
          <p>{t("messages.selectConversation")}</p>
          <Button size="sm" variant="coral" onClick={() => setNewConvoOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> {t("messages.newMessage")}
          </Button>
        </div>
      )}

      {/* New Conversation Dialog */}
      <Dialog open={newConvoOpen} onOpenChange={(o) => { setNewConvoOpen(o); if (!o) setNewConvoSearch(""); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("messages.newMessage")}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={newConvoSearch} onChange={e => setNewConvoSearch(e.target.value)} placeholder={t("messages.searchByNameEmail")} className="pl-9" autoFocus />
            </div>
            {newConvoSearch.length >= 2 && (
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                {(newConvoResults || []).length > 0 ? (newConvoResults || []).filter((p: any) => p.id !== profile?.id).map((p: any) => (
                  <button key={p.id} className="w-full flex items-center gap-3 p-3 hover:bg-accent text-left border-b last:border-b-0 transition-colors"
                    onClick={() => handleStartConversation(p)} disabled={startConversation.isPending}>
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" /> : <span className="text-primary text-xs font-medium">{(p.full_name || "?")[0]}</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{p.full_name || t("common.noName")}</p>
                      <p className="text-xs text-muted-foreground">{p.email || p.user_name || ""}</p>
                    </div>
                    {startConversation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-auto" />}
                  </button>
                )) : (
                  <p className="p-3 text-sm text-muted-foreground text-center">{t("common.noResults")}</p>
                )}
              </div>
            )}
            {newConvoSearch.length < 2 && (
              <p className="text-xs text-muted-foreground text-center py-4">{t("common.minCharsToSearch")}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Quote dialog: send a price quote in the active conversation */}
      <QuoteDialog
        open={quoteDialogOpen}
        onOpenChange={(o) => { setQuoteDialogOpen(o); if (!o) setQuotePrefill(null); }}
        vendorUserId={profile?.id || ""}
        defaultServiceType={quotePrefill?.serviceType}
        jobId={quotePrefill?.jobId}
        onSend={handleSendQuote}
        submitting={sendMessage.isPending}
      />
    </div>
  );
}
