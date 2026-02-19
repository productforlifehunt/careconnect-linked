import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Search, Phone, Video, MoreVertical, Loader2, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useConversations, useDirectMessages, useSendMessage, useSearchProfiles, useStartConversation, useMarkMessagesRead } from "@/hooks/use-care-data";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const { data: conversations, isLoading: convosLoading } = useConversations();
  const sendMessage = useSendMessage();
  const startConversation = useStartConversation();
  const markRead = useMarkMessagesRead();

  const [selectedConvoId, setSelectedConvoId] = useState<string | null>(null);
  const [selectedOtherUser, setSelectedOtherUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newConvoOpen, setNewConvoOpen] = useState(false);
  const [newConvoSearch, setNewConvoSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: newConvoResults } = useSearchProfiles(newConvoSearch);
  // Track if we've handled the incoming navigation state
  const [handledNavState, setHandledNavState] = useState(false);

  // Derive the other user from the conversation
  const getOtherUser = (convo: any) => {
    if (!user) return null;
    return convo.participant_1?.id === user.id ? convo.participant_2 : convo.participant_1;
  };

  // If navigated from caregiver profile, auto-open/start that conversation
  useEffect(() => {
    const navState = location.state as any;
    if (navState?.targetUserId && !handledNavState) {
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
        },
      });
    }
  }, [location.state, handledNavState]);

  // Auto-select first conversation (only if no conversation is selected and not handling nav state)
  useEffect(() => {
    const navState = location.state as any;
    if (conversations && conversations.length > 0 && !selectedConvoId && !navState?.targetUserId) {
      const first = conversations[0];
      setSelectedConvoId(first.id);
      setSelectedOtherUser(getOtherUser(first));
    }
  }, [conversations, selectedConvoId]);

  const otherUserId = selectedOtherUser?.id || null;
  const { data: messages, isLoading: msgsLoading } = useDirectMessages(otherUserId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !otherUserId) return;
    sendMessage.mutate({ receiverId: otherUserId, content: newMessage });
    setNewMessage("");
  };

  const handleStartConversation = (person: any) => {
    startConversation.mutate(person.id, {
      onSuccess: (convoId: string) => {
        setSelectedOtherUser(person);
        setSelectedConvoId(convoId);
        setNewConvoOpen(false);
        setNewConvoSearch("");
      },
      onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
    });
  };

  const filteredConvos = (conversations || []).filter((c: any) => {
    const other = getOtherUser(c);
    return other?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Conversation List */}
      <div className={`w-full md:w-80 border-r flex flex-col bg-card ${selectedConvoId ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">Messages</h2>
            <Button variant="ghost" size="icon" onClick={() => setNewConvoOpen(true)} title="New Conversation">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {convosLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
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
                      <span className={`font-medium text-sm ${c.unread_count > 0 ? "text-foreground font-semibold" : "text-foreground"}`}>{other?.full_name || "Unknown"}</span>
                      <span className="text-xs text-muted-foreground">
                        {c.last_message_at ? new Date(c.last_message_at).toLocaleDateString("en", { month: "short", day: "numeric" }) : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground truncate">
                        {c.last_message ? (c.last_message.sender_id === user?.id ? "You: " : "") + (c.last_message.message_content || "").substring(0, 50) : "No messages yet"}
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
              <p className="text-sm text-muted-foreground mb-3">No conversations yet</p>
              <Button size="sm" variant="coral" onClick={() => setNewConvoOpen(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Start a Conversation
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
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (messages || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-muted-foreground text-sm">No messages yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Send a message below to start the conversation!</p>
              </div>
            ) : (messages || []).map((m: any) => {
              const isMe = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? "hero-gradient text-primary-foreground rounded-br-md" : "bg-card border rounded-bl-md text-foreground"}`}>
                    <p className="text-sm">{m.message_content}</p>
                    <p className={`text-xs mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {new Date(m.created_at).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t bg-card">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                className="flex-1"
              />
              <Button variant="coral" size="icon" onClick={handleSend} disabled={!newMessage.trim() || sendMessage.isPending}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center text-muted-foreground gap-3">
          <p>Select a conversation or start a new one</p>
          <Button size="sm" variant="coral" onClick={() => setNewConvoOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> New Message
          </Button>
        </div>
      )}

      {/* New Conversation Dialog */}
      <Dialog open={newConvoOpen} onOpenChange={(o) => { setNewConvoOpen(o); if (!o) setNewConvoSearch(""); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Message</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={newConvoSearch} onChange={e => setNewConvoSearch(e.target.value)} placeholder="Search by name or email..." className="pl-9" autoFocus />
            </div>
            {newConvoSearch.length >= 2 && (
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                {(newConvoResults || []).length > 0 ? (newConvoResults || []).filter((p: any) => p.id !== user?.id).map((p: any) => (
                  <button key={p.id} className="w-full flex items-center gap-3 p-3 hover:bg-accent text-left border-b last:border-b-0 transition-colors"
                    onClick={() => handleStartConversation(p)} disabled={startConversation.isPending}>
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" /> : <span className="text-primary text-xs font-medium">{(p.full_name || "?")[0]}</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{p.full_name || "No name"}</p>
                      <p className="text-xs text-muted-foreground">{p.email || p.user_name || ""}</p>
                    </div>
                    {startConversation.isPending && <Loader2 className="h-4 w-4 animate-spin ml-auto" />}
                  </button>
                )) : (
                  <p className="p-3 text-sm text-muted-foreground text-center">No users found</p>
                )}
              </div>
            )}
            {newConvoSearch.length < 2 && (
              <p className="text-xs text-muted-foreground text-center py-4">Type at least 2 characters to search</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
