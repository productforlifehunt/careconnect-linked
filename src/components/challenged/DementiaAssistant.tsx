import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Loader2, X, Volume2, VolumeX, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { invokeAI, loadAIConversation, type AIChatMessage } from "@/lib/ai-service";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

/** Simple heuristic to detect if text is primarily Chinese */
function detectLanguage(text: string): string {
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const japaneseChars = (text.match(/[\u3040-\u309f\u30a0-\u30ff]/g) || []).length;
  const koreanChars = (text.match(/[\uac00-\ud7af]/g) || []).length;
  const total = text.replace(/\s/g, "").length;
  if (total === 0) return "en";
  if (japaneseChars / total > 0.1) return "ja";
  if (koreanChars / total > 0.1) return "ko";
  if (chineseChars / total > 0.15) return "zh-CN";
  return "en";
}

// Audio context for PCM16 playback
let currentAudioSource: AudioBufferSourceNode | null = null;
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

/** Play base64 PCM16 audio (24kHz mono) */
async function playPCM16Audio(base64Data: string, onEnd?: () => void) {
  try {
    stopAIVoice();
    const ctx = getAudioContext();
    if (ctx.state === "suspended") await ctx.resume();

    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    // PCM16 = 16-bit signed integers, little-endian, 24kHz mono
    const sampleRate = 24000;
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }

    const audioBuffer = ctx.createBuffer(1, float32.length, sampleRate);
    audioBuffer.getChannelData(0).set(float32);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.onended = () => {
      currentAudioSource = null;
      onEnd?.();
    };
    currentAudioSource = source;
    source.start(0);
  } catch (err) {
    console.error("PCM16 playback error:", err);
    onEnd?.();
  }
}

function stopAIVoice() {
  if (currentAudioSource) {
    try { currentAudioSource.stop(); } catch {}
    currentAudioSource = null;
  }
}

/** Call the ai-voice edge function to get AI-generated speech */
async function fetchAIVoice(text: string, voice: string = "alloy"): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke("ai-voice", {
      body: { text, voice, format: "pcm16" },
    });
    if (error) {
      console.error("AI voice error:", error);
      toast.error("Voice generation failed");
      return null;
    }
    if (data?.error) {
      console.error("AI voice error:", data.error);
      toast.error(data.error);
      return null;
    }
    return data?.audio || null;
  } catch (err) {
    console.error("AI voice fetch error:", err);
    return null;
  }
}

/** Fallback: browser Web Speech API */
function speakTextBrowser(rawText: string, lang: string, onEnd?: () => void) {
  if (!("speechSynthesis" in window)) { onEnd?.(); return; }
  window.speechSynthesis.cancel();
  const text = rawText
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/#{1,6}\s*/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[-•]\s+/g, "，")
    .replace(/\n{2,}/g, "。")
    .replace(/\n/g, "，")
    .replace(/[*_~>#|]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.92;
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang.split("-")[0];
  const langVoices = voices.filter(v => v.lang === lang || v.lang.startsWith(prefix));
  if (langVoices.length > 0) {
    const premium = langVoices.find(v => /enhanced|premium|natural|neural|tingting|sinji|meijia|yuna|google/i.test(v.name));
    const localVoice = langVoices.find(v => v.localService && !v.name.toLowerCase().includes("compact"));
    utterance.voice = premium || localVoice || langVoices[0];
  }
  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  stopAIVoice();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

const VOICE_OPTIONS = [
  { value: "auto", label: "自动 / Auto" },
  { value: "zh-CN", label: "中文" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
];

export function DementiaAssistant() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t("dementiaAssistant.greeting") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [voiceLang, setVoiceLang] = useState("auto");
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [conversationLoaded, setConversationLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Preload voices
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    return () => stopSpeaking();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!open || conversationLoaded) return;
    let mounted = true;
    loadAIConversation("general_chat")
      .then((history) => {
        if (!mounted || !history.length) return;
        const normalized = history
          .filter((item) => item.role !== "system")
          .map((item) => ({ role: item.role === "assistant" ? "assistant" : "user", content: item.content } as Message));
        if (normalized.length > 0) {
          setMessages(normalized);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setConversationLoaded(true);
      });
    return () => {
      mounted = false;
    };
  }, [open, conversationLoaded]);

  const resolveLang = useCallback((text: string) => {
    if (voiceLang !== "auto") return voiceLang;
    return detectLanguage(text);
  }, [voiceLang]);

  const toggleSpeak = useCallback((idx: number, text: string) => {
    if (speakingIdx === idx) {
      stopSpeaking();
      setSpeakingIdx(null);
    } else {
      setSpeakingIdx(idx);
      speakText(text, resolveLang(text), () => setSpeakingIdx(null));
    }
  }, [speakingIdx, resolveLang]);

  const QUICK_PROMPTS = [
    t("dementiaAssistant.quickPrompts.stages"),
    t("dementiaAssistant.quickPrompts.sundowning"),
    t("dementiaAssistant.quickPrompts.agitation"),
    t("dementiaAssistant.quickPrompts.memoryCare"),
    t("dementiaAssistant.quickPrompts.communication"),
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const history: AIChatMessage[] = nextMessages.map((message) => ({
        role: message.role,
        content: message.content,
      }));
      const reply = await invokeAI("general_chat", text.trim(), {
        title: "Dementia Assistant",
        messages: history,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      // Auto-speak the new reply
      if (autoSpeak) {
        setTimeout(() => {
          setSpeakingIdx(nextMessages.length); // index of the new message
          speakText(reply, resolveLang(reply), () => setSpeakingIdx(null));
        }, 100);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("common.tryAgain") },
      ]);
      console.error("AI error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 z-50 h-14 w-14 rounded-full shadow-lg hero-gradient hover:opacity-90"
        size="icon"
      >
        <Bot className="h-6 w-6 text-primary-foreground" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-20 md:bottom-6 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] shadow-2xl border-primary/20">
      <CardHeader className="flex-row items-center justify-between py-3 px-4 hero-gradient rounded-t-lg">
        <CardTitle className="text-sm text-primary-foreground flex items-center gap-2">
          <Bot className="h-4 w-4" /> {t("dementiaAssistant.title")}
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {/* Voice settings bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30 text-xs">
          <Languages className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Select value={voiceLang} onValueChange={setVoiceLang}>
            <SelectTrigger className="h-7 text-xs w-[100px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VOICE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1.5 ml-auto">
            <Volume2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground whitespace-nowrap">
              {i18n.language?.startsWith("zh") ? "语音回答" : "Auto-speak"}
            </span>
            <Switch
              checked={autoSpeak}
              onCheckedChange={setAutoSpeak}
              className="scale-75"
            />
          </div>
        </div>

        <div ref={scrollRef} className="h-[320px] overflow-y-auto p-3 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.role === "assistant" && (
                  <button
                    onClick={() => toggleSpeak(i, msg.content)}
                    className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                    title={speakingIdx === i ? t("common.stop") : t("common.listen")}
                  >
                    {speakingIdx === i ? (
                      <><VolumeX className="h-3 w-3" /> {t("common.stop")}</>
                    ) : (
                      <><Volume2 className="h-3 w-3" /> {t("common.listen")}</>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-xl px-3 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        {/* Quick prompts */}
        {messages.length <= 2 && (
          <div className="px-3 pb-2 flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-[11px] px-2 py-1 rounded-full bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t p-2 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder={t("dementiaAssistant.askPlaceholder")}
            className="text-sm h-9"
            disabled={loading}
          />
          <Button size="icon" className="h-9 w-9 shrink-0" onClick={() => sendMessage(input)} disabled={!input.trim() || loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
