import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, Loader2, X, Volume2, VolumeX, Languages, Mic, MicOff } from "lucide-react";
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
import { streamChatWithVoice } from "@/lib/ai-stream";
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

// ─── Audio playback (MP3 from SiliconFlow CosyVoice2) ───
let currentAudioEl: HTMLAudioElement | null = null;
let currentAudioUrl: string | null = null;

async function playMP3Audio(base64Data: string, format: string = "mp3", onEnd?: () => void) {
  try {
    stopAIVoice();
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const mime =
      format === "wav" ? "audio/wav" :
      format === "opus" ? "audio/ogg; codecs=opus" :
      format === "pcm" ? "audio/wav" :
      "audio/mpeg";
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);
    currentAudioUrl = url;

    const audio = new Audio(url);
    currentAudioEl = audio;
    audio.onended = () => {
      if (currentAudioUrl === url) {
        URL.revokeObjectURL(url);
        currentAudioUrl = null;
      }
      currentAudioEl = null;
      onEnd?.();
    };
    audio.onerror = () => {
      console.error("Audio playback error");
      if (currentAudioUrl === url) {
        URL.revokeObjectURL(url);
        currentAudioUrl = null;
      }
      currentAudioEl = null;
      onEnd?.();
    };
    await audio.play();
  } catch (err) {
    console.error("Audio playback error:", err);
    onEnd?.();
  }
}

function stopAIVoice() {
  if (currentAudioEl) {
    try { currentAudioEl.pause(); currentAudioEl.src = ""; } catch {}
    currentAudioEl = null;
  }
  if (currentAudioUrl) {
    try { URL.revokeObjectURL(currentAudioUrl); } catch {}
    currentAudioUrl = null;
  }
}

/** Call the ai-voice edge function — API key stays server-side. Returns { audio, format }. */
async function fetchAIVoice(text: string, voice: string = "alloy"): Promise<{ audio: string; format: string } | null> {
  try {
    const { data, error } = await supabase.functions.invoke("ai-voice", {
      body: { text, voice, format: "mp3" },
    });
    if (error) {
      console.error("AI voice error:", error);
      return null;
    }
    if (data?.error) {
      console.error("AI voice error:", data.error);
      if (data.error.includes("Rate limited")) toast.error("语音服务繁忙，请稍后再试");
      else if (data.error.includes("Credits")) toast.error("语音额度已用尽");
      return null;
    }
    if (!data?.audio) return null;
    return { audio: data.audio, format: data.format || "mp3" };
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
    .replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1")
    .replace(/#{1,6}\s*/g, "").replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1").replace(/[-•]\s+/g, "，")
    .replace(/\n{2,}/g, "。").replace(/\n/g, "，")
    .replace(/[*_~>#|]/g, "").replace(/\s{2,}/g, " ").trim();
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

// ─── Speech-to-text via browser SpeechRecognition ───
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const STT_SUPPORTED = !!SpeechRecognition;

// ─── Constants ───
const AI_VOICE_PERSONAS = [
  { value: "alloy", label: "Alloy (中性)" },
  { value: "nova", label: "Nova (温暖女声)" },
  { value: "shimmer", label: "Shimmer (柔和女声)" },
  { value: "echo", label: "Echo (沉稳男声)" },
  { value: "fable", label: "Fable (故事风)" },
  { value: "onyx", label: "Onyx (低沉男声)" },
];

const LANG_OPTIONS = [
  { value: "auto", label: "自动 / Auto" },
  { value: "zh-CN", label: "中文" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
];

export function DementiaAssistant() {
  const { t, i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t("dementiaAssistant.greeting") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [voiceLang, setVoiceLang] = useState("auto");
  const [voicePersona, setVoicePersona] = useState("nova");
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [conversationLoaded, setConversationLoaded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Preload browser voices
  useEffect(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    return () => stopSpeaking();
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Load conversation history
  useEffect(() => {
    if (!open || conversationLoaded) return;
    let mounted = true;
    loadAIConversation("general_chat")
      .then((history) => {
        if (!mounted || !history.length) return;
        const normalized = history
          .filter((item) => item.role !== "system")
          .map((item) => ({ role: item.role === "assistant" ? "assistant" : "user", content: item.content } as Message));
        if (normalized.length > 0) setMessages(normalized);
      })
      .catch(() => {})
      .finally(() => { if (mounted) setConversationLoaded(true); });
    return () => { mounted = false; };
  }, [open, conversationLoaded]);

  const resolveLang = useCallback((text: string) => {
    if (voiceLang !== "auto") return voiceLang;
    return detectLanguage(text);
  }, [voiceLang]);

  // ─── Speak with AI voice, fallback to browser TTS ───
  const speakWithAI = useCallback(async (text: string, onEnd?: () => void) => {
    setVoiceLoading(true);
    const audio = await fetchAIVoice(text, voicePersona);
    setVoiceLoading(false);
    if (audio) {
      playMP3Audio(audio.audio, audio.format, onEnd);
    } else {
      speakTextBrowser(text, resolveLang(text), onEnd);
    }
  }, [voicePersona, resolveLang]);

  const toggleSpeak = useCallback(async (idx: number, text: string) => {
    if (speakingIdx === idx) {
      stopSpeaking();
      setSpeakingIdx(null);
    } else {
      setSpeakingIdx(idx);
      await speakWithAI(text, () => setSpeakingIdx(null));
    }
  }, [speakingIdx, speakWithAI]);

  // ─── Speech-to-text ───
  const toggleListening = useCallback(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    if (!STT_SUPPORTED) {
      toast.error(isChinese ? "您的浏览器不支持语音输入" : "Speech input not supported in your browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // Set language based on voiceLang or UI language
    const sttLang = voiceLang === "auto"
      ? (isChinese ? "zh-CN" : "en-US")
      : (voiceLang === "en" ? "en-US" : voiceLang);
    recognition.lang = sttLang;

    let finalTranscript = "";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }
      setInput(finalTranscript + interim);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      // Auto-send if we got a final transcript
      if (finalTranscript.trim()) {
        // Small delay to let state update
        setTimeout(() => {
          const el = document.querySelector("[data-stt-send]") as HTMLButtonElement;
          el?.click();
        }, 100);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("STT error:", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        toast.error(isChinese ? "请允许麦克风权限" : "Please allow microphone access");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, voiceLang, isChinese]);

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

    const assistantIdx = nextMessages.length; // index of the upcoming assistant msg

    try {
      const history = nextMessages.map((message) => ({
        role: message.role as "user" | "assistant",
        content: message.content,
      }));

      if (autoSpeak) {
        // ── Sentence-level streaming pipeline: text + parallel TTS ──
        stopSpeaking();
        setSpeakingIdx(assistantIdx);
        // Insert empty assistant bubble; we'll fill it as tokens arrive.
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        let accumulated = "";
        try {
          await streamChatWithVoice(history, voicePersona, {
            onTextDelta: (_delta, fullText) => {
              accumulated = fullText;
              setMessages((prev) => {
                const copy = [...prev];
                if (copy[assistantIdx]) {
                  copy[assistantIdx] = { role: "assistant", content: fullText };
                }
                return copy;
              });
            },
            onAllAudioEnd: () => setSpeakingIdx(null),
            onError: (err) => {
              console.error("Stream error:", err);
              setSpeakingIdx(null);
            },
          });

          // Persist the final reply to WP CCT (non-blocking, fire-and-forget).
          if (accumulated) {
            invokeAI("general_chat", text.trim(), {
              title: "Dementia Assistant",
              messages: [...history, { role: "assistant", content: accumulated }],
            }).catch(() => {});
          }
        } catch (err) {
          console.error("Stream pipeline failed, falling back:", err);
          setSpeakingIdx(null);
          // Fallback: non-streaming single-shot call.
          const reply = await invokeAI("general_chat", text.trim(), {
            title: "Dementia Assistant",
            messages: history as AIChatMessage[],
          });
          setMessages((prev) => {
            const copy = [...prev];
            copy[assistantIdx] = { role: "assistant", content: reply };
            return copy;
          });
          setTimeout(async () => {
            setSpeakingIdx(assistantIdx);
            await speakWithAI(reply, () => setSpeakingIdx(null));
          }, 100);
        }
      } else {
        // ── Non-voice path: keep the simple single-shot call ──
        const reply = await invokeAI("general_chat", text.trim(), {
          title: "Dementia Assistant",
          messages: history as AIChatMessage[],
        });
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
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
        {/* Voice settings bar — row 1: language + voice persona */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/30 text-xs">
          <Languages className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Select value={voiceLang} onValueChange={setVoiceLang}>
            <SelectTrigger className="h-6 text-[11px] w-[80px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANG_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Volume2 className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1" />
          <Select value={voicePersona} onValueChange={setVoicePersona}>
            <SelectTrigger className="h-6 text-[11px] w-[110px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AI_VOICE_PERSONAS.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {isChinese ? "自动朗读" : "Auto"}
            </span>
            <Switch
              checked={autoSpeak}
              onCheckedChange={setAutoSpeak}
              className="scale-[0.65]"
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
                    disabled={voiceLoading && speakingIdx !== i}
                  >
                    {voiceLoading && speakingIdx === null ? (
                      <><Loader2 className="h-3 w-3 animate-spin" /> {isChinese ? "生成语音..." : "Loading..."}</>
                    ) : speakingIdx === i ? (
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

        {/* Input with mic button */}
        <div className="border-t p-2 flex gap-1.5">
          {STT_SUPPORTED && (
            <Button
              size="icon"
              variant={isListening ? "destructive" : "outline"}
              className={`h-9 w-9 shrink-0 ${isListening ? "animate-pulse" : ""}`}
              onClick={toggleListening}
              disabled={loading}
              title={isListening ? (isChinese ? "停止录音" : "Stop recording") : (isChinese ? "语音输入" : "Voice input")}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder={isListening
              ? (isChinese ? "正在听..." : "Listening...")
              : t("dementiaAssistant.askPlaceholder")}
            className="text-sm h-9"
            disabled={loading}
          />
          <Button
            data-stt-send
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
