import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Search, Phone, Video, MoreVertical } from "lucide-react";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  online: boolean;
}

interface Message {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
}

const conversations: Conversation[] = [
  { id: "c1", name: "Sarah Johnson", lastMessage: "I'll be there at 9am tomorrow!", time: "2 min ago", unread: 2, avatar: "SJ", online: true },
  { id: "c2", name: "Dr. Rachel Green", lastMessage: "The new medication is working well", time: "1 hr ago", unread: 1, avatar: "RG", online: false },
  { id: "c3", name: "David Smith", lastMessage: "I can pick up the prescription", time: "3 hrs ago", unread: 0, avatar: "DS", online: true },
  { id: "c4", name: "Aisha Williams", lastMessage: "The kids had a great time today!", time: "Yesterday", unread: 0, avatar: "AW", online: false },
];

const messageHistory: Record<string, Message[]> = {
  c1: [
    { id: "m1", sender: "them", text: "Hi! Just wanted to confirm tomorrow's schedule.", time: "10:30 AM" },
    { id: "m2", sender: "me", text: "Yes, can you come at 9am? Mom has a doctor's appointment at 11.", time: "10:32 AM" },
    { id: "m3", sender: "them", text: "Of course! I'll help her get ready and drive her there.", time: "10:33 AM" },
    { id: "m4", sender: "me", text: "Perfect, thank you so much Sarah!", time: "10:35 AM" },
    { id: "m5", sender: "them", text: "I'll be there at 9am tomorrow!", time: "10:36 AM" },
  ],
  c2: [
    { id: "m6", sender: "them", text: "I've reviewed the latest blood work results.", time: "9:00 AM" },
    { id: "m7", sender: "me", text: "How does everything look?", time: "9:15 AM" },
    { id: "m8", sender: "them", text: "The new medication is working well. Let's keep the current dosage.", time: "9:20 AM" },
  ],
};

export default function Messages() {
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(conversations[0]);
  const [newMessage, setNewMessage] = useState("");
  const [msgs, setMsgs] = useState(messageHistory);
  const [searchQuery, setSearchQuery] = useState("");

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConvo) return;
    const msg: Message = { id: "m-" + Date.now(), sender: "me", text: newMessage, time: new Date().toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" }) };
    setMsgs(prev => ({
      ...prev,
      [selectedConvo.id]: [...(prev[selectedConvo.id] || []), msg],
    }));
    setNewMessage("");
  };

  const filteredConvos = conversations.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Conversation List */}
      <div className={`w-full md:w-80 border-r flex flex-col bg-card ${selectedConvo ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-foreground mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {filteredConvos.map(c => (
            <div
              key={c.id}
              className={`p-4 cursor-pointer border-b transition-colors ${selectedConvo?.id === c.id ? "bg-accent" : "hover:bg-muted/50"}`}
              onClick={() => setSelectedConvo(c)}
            >
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary text-sm font-medium">{c.avatar}</span>
                  </div>
                  {c.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card bg-success" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-foreground">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-sm text-muted-foreground truncate">{c.lastMessage}</p>
                    {c.unread > 0 && (
                      <Badge className="bg-coral text-coral-foreground h-5 w-5 flex items-center justify-center p-0 text-xs shrink-0">{c.unread}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConvo ? (
        <div className={`flex-1 flex flex-col ${selectedConvo ? "flex" : "hidden md:flex"}`}>
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between bg-card">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSelectedConvo(null)}>←</Button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-sm font-medium">{selectedConvo.avatar}</span>
                </div>
                {selectedConvo.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card bg-success" />}
              </div>
              <div>
                <p className="font-medium text-foreground">{selectedConvo.name}</p>
                <p className="text-xs text-muted-foreground">{selectedConvo.online ? "Online" : "Offline"}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><Video className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-3 bg-muted/20">
            {(msgs[selectedConvo.id] || []).map(m => (
              <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${m.sender === "me" ? "hero-gradient text-primary-foreground rounded-br-md" : "bg-card border rounded-bl-md text-foreground"}`}>
                  <p className="text-sm">{m.text}</p>
                  <p className={`text-xs mt-1 ${m.sender === "me" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-card">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                className="flex-1"
              />
              <Button variant="coral" size="icon" onClick={sendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center text-muted-foreground">
          Select a conversation to start messaging
        </div>
      )}
    </div>
  );
}
