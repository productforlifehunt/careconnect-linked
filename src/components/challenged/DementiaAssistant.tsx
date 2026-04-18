import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot, Send, Loader2, X, Volume2, VolumeX, Languages, Mic, MicOff,
  Play, Pause, Square, MessageSquare, Headphones, Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  streamChatWithVoice, streamChatTextOnly, speakTextStreaming, type StreamControls,
} from "@/lib/ai-stream";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type ChatMode = "text" | "voice";
type PlayState = "idle" | "playing" | "paused";
type TTSEngine = "siliconflow" | "openai" | "openai-full";

const TTS_ENGINES: { value: TTSEngine; label: string; sub: string }[] = [
  { value: "siliconflow", label: "CosyVoice2", sub: "SiliconFlow · 中文最佳" },
  { value: "openai", label: "GPT-Audio-Mini", sub: "OpenRouter · 便宜 6×" },
  { value: "openai-full", label: "GPT-Audio", sub: "OpenRouter · 旗舰音质" },
];

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const STT_SUPPORTED = !!SpeechRecognition;

// OpenAI 原生 11 种音色(gpt-audio / gpt-audio-mini 通用)
const AI_VOICE_PERSONAS = [
  { value: "alloy", label: "Alloy (中性)" },
  { value: "ash", label: "Ash (沉稳男声)" },
  { value: "ballad", label: "Ballad (叙事男声)" },
  { value: "coral", label: "Coral (温柔女声)" },
  { value: "echo", label: "Echo (清亮男声)" },
  { value: "fable", label: "Fable (故事风)" },
  { value: "nova", label: "Nova (温暖女声)" },
  { value: "onyx", label: "Onyx (低沉男声)" },
  { value: "sage", label: "Sage (智者女声)" },
  { value: "shimmer", label: "Shimmer (柔和女声)" },
  { value: "verse", label: "Verse (诗意男声)" },
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
  const [mode, setMode] = useState<ChatMode>("text");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: t("dementiaAssistant.greeting") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceLang, setVoiceLang] = useState("auto");
  const [voicePersona, setVoicePersona] = useState("nova");
  const [ttsEngine, setTtsEngine] = useState<TTSEngine>("siliconflow");
  // (No CCT history loading — chat is in-memory per session for max speed.)
  const [isListening, setIsListening] = useState(false);

  // Per-message playback state: which message is currently bound to a stream
  // controller, and what state it's in.
  const [activeMsgIdx, setActiveMsgIdx] = useState<number | null>(null);
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [voiceLoading, setVoiceLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const controlsRef = useRef<StreamControls | null>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Stop everything on unmount or close
  useEffect(() => {
    if (!open) {
      controlsRef.current?.stop();
      controlsRef.current = null;
      setPlayState("idle");
      setActiveMsgIdx(null);
    }
  }, [open]);

  useEffect(() => () => controlsRef.current?.stop(), []);

  // (Chat history is per-session only — no remote load to keep responses snappy.)

  // ─── Stop any active playback (industry-standard hard stop) ───
  const hardStop = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setPlayState("idle");
    setActiveMsgIdx(null);
    setVoiceLoading(false);
  }, []);

  // ─── Play / Pause / Resume / Stop for a given assistant message ───
  const handlePlayMessage = useCallback(async (idx: number, text: string) => {
    // Same message currently playing → pause
    if (activeMsgIdx === idx && playState === "playing") {
      controlsRef.current?.pause();
      return;
    }
    // Same message paused → resume
    if (activeMsgIdx === idx && playState === "paused") {
      controlsRef.current?.resume();
      return;
    }
    // Different message → stop previous, start new
    hardStop();
    setActiveMsgIdx(idx);
    setVoiceLoading(true);
    const startedAt = performance.now();
    const controls = speakTextStreaming(text, voicePersona, {
      engine: ttsEngine,
      onAudioStart: () => {
        setVoiceLoading(false);
        const elapsed = Math.round(performance.now() - startedAt);
        toast.success(
          isChinese
            ? `${ttsEngine === "openai" ? "GPT-4o" : "CosyVoice2"} 首字 ${elapsed}ms`
            : `${ttsEngine === "openai" ? "GPT-4o" : "CosyVoice2"} TTFB ${elapsed}ms`,
          { duration: 2500 },
        );
      },
      onPlayStateChange: (s) => {
        if (s === "playing") setPlayState("playing");
        else if (s === "paused") setPlayState("paused");
        else {
          setPlayState("idle");
          setActiveMsgIdx((cur) => (cur === idx ? null : cur));
          controlsRef.current = null;
        }
      },
      onAllAudioEnd: () => {
        setVoiceLoading(false);
      },
      onError: () => {
        setVoiceLoading(false);
        toast.error(isChinese ? "语音生成失败" : "Voice generation failed");
        setPlayState("idle");
        setActiveMsgIdx(null);
        controlsRef.current = null;
      },
    });
    controlsRef.current = controls;
  }, [activeMsgIdx, playState, voicePersona, ttsEngine, hardStop, isChinese]);

  // ─── Speech-to-text ───
  const toggleListening = useCallback(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    if (!STT_SUPPORTED) {
      toast.error(isChinese ? "您的浏览器不支持语音输入" : "Speech input not supported");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    const sttLang = voiceLang === "auto"
      ? (isChinese ? "zh-CN" : "en-US")
      : (voiceLang === "en" ? "en-US" : voiceLang);
    recognition.lang = sttLang;

    let finalTranscript = "";
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript;
        else interim += transcript;
      }
      setInput(finalTranscript + interim);
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      if (finalTranscript.trim()) {
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

    // Any existing playback gets cancelled when a new turn starts.
    hardStop();

    const userMsg: Message = { role: "user", content: text.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    const assistantIdx = nextMessages.length;

    try {
      const history = nextMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      // Resolve language for the AI: explicit override > UI language.
      const resolvedLang =
        voiceLang && voiceLang !== "auto"
          ? voiceLang
          : (i18n.language || "auto");

      if (mode === "voice") {
        // Voice mode: streaming text + parallel TTS.
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
        setActiveMsgIdx(assistantIdx);

        const { controls, result } = streamChatWithVoice(history, voicePersona, {
          language: resolvedLang,
          engine: ttsEngine,
          onTextDelta: (_d, fullText) => {
            setMessages((prev) => {
              const copy = [...prev];
              if (copy[assistantIdx]) {
                copy[assistantIdx] = { role: "assistant", content: fullText };
              }
              return copy;
            });
          },
          onAudioStart: () => setPlayState("playing"),
          onPlayStateChange: (s) => {
            if (s === "playing") setPlayState("playing");
            else if (s === "paused") setPlayState("paused");
            else if (s === "idle" || s === "stopped") {
              setPlayState("idle");
              setActiveMsgIdx((cur) => (cur === assistantIdx ? null : cur));
              controlsRef.current = null;
            }
          },
          onError: (err) => {
            console.error("Stream error:", err);
            setPlayState("idle");
            controlsRef.current = null;
          },
        });
        controlsRef.current = controls;
        try {
          await result;
        } catch (err) {
          console.error("Voice stream failed:", err);
          toast.error(isChinese ? "语音对话失败" : "Voice failed");
        }
      } else {
        // Text mode: pure SSE streaming, NO TTS. Tokens shown as they arrive.
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
        const { result } = streamChatTextOnly(history, {
          language: resolvedLang,
          onTextDelta: (_d, fullText) => {
            setMessages((prev) => {
              const copy = [...prev];
              if (copy[assistantIdx]) {
                copy[assistantIdx] = { role: "assistant", content: fullText };
              }
              return copy;
            });
          },
          onError: (err) => console.error("Text stream error:", err),
        });
        try {
          await result;
        } catch (err) {
          console.error("Text stream failed:", err);
          setMessages((prev) => {
            const copy = [...prev];
            copy[assistantIdx] = { role: "assistant", content: t("common.tryAgain") };
            return copy;
          });
        }
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
        <Button
          variant="ghost" size="icon"
          className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20"
          onClick={() => { hardStop(); setOpen(false); }}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mode toggle: Text vs Voice */}
        <div className="px-3 pt-2 pb-1 border-b">
          <Tabs value={mode} onValueChange={(v) => { hardStop(); setMode(v as ChatMode); }}>
            <TabsList className="grid grid-cols-2 h-8 w-full">
              <TabsTrigger value="text" className="text-xs gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                {isChinese ? "文字" : "Text"}
              </TabsTrigger>
              <TabsTrigger value="voice" className="text-xs gap-1.5">
                <Headphones className="h-3.5 w-3.5" />
                {isChinese ? "语音" : "Voice"}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Settings bar (compact) */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/30 text-xs">
          <Languages className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Select value={voiceLang} onValueChange={setVoiceLang}>
            <SelectTrigger className="h-6 text-[11px] w-[80px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANG_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Volume2 className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1" />
          <Select value={voicePersona} onValueChange={setVoicePersona}>
            <SelectTrigger className="h-6 text-[11px] w-[110px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AI_VOICE_PERSONAS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* TTS Engine A/B switcher */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/30 text-xs">
          <Sparkles className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-[11px] text-muted-foreground shrink-0">
            {isChinese ? "引擎" : "Engine"}
          </span>
          <Tabs
            value={ttsEngine}
            onValueChange={(v) => { hardStop(); setTtsEngine(v as TTSEngine); }}
            className="flex-1"
          >
            <TabsList className="grid grid-cols-2 h-7 w-full">
              {TTS_ENGINES.map((e) => (
                <TabsTrigger
                  key={e.value}
                  value={e.value}
                  className="text-[11px] px-1"
                  title={e.sub}
                >
                  {e.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="h-[320px] overflow-y-auto p-3 space-y-3">
          {messages.map((msg, i) => {
            const isActive = activeMsgIdx === i;
            const isPlaying = isActive && playState === "playing";
            const isPaused = isActive && playState === "paused";
            return (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.role === "assistant" && msg.content.trim().length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1">
                      {/* Play / Pause toggle */}
                      <button
                        onClick={() => handlePlayMessage(i, msg.content)}
                        disabled={voiceLoading && !isActive}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors disabled:opacity-40"
                        title={
                          isPlaying ? (isChinese ? "暂停" : "Pause")
                          : isPaused ? (isChinese ? "继续" : "Resume")
                          : (isChinese ? "朗读" : "Listen")
                        }
                      >
                        {voiceLoading && isActive ? (
                          <><Loader2 className="h-3 w-3 animate-spin" />{isChinese ? "加载中" : "Loading"}</>
                        ) : isPlaying ? (
                          <><Pause className="h-3 w-3" />{isChinese ? "暂停" : "Pause"}</>
                        ) : isPaused ? (
                          <><Play className="h-3 w-3" />{isChinese ? "继续" : "Resume"}</>
                        ) : (
                          <><Volume2 className="h-3 w-3" />{isChinese ? "朗读" : "Listen"}</>
                        )}
                      </button>

                      {/* Stop button — only visible while this message is active */}
                      {isActive && (
                        <button
                          onClick={hardStop}
                          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                          title={isChinese ? "停止" : "Stop"}
                        >
                          <Square className="h-3 w-3 fill-current" />
                          {isChinese ? "停止" : "Stop"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
        <div className="border-t p-2 flex gap-1.5">
          {STT_SUPPORTED && (
            <Button
              size="icon"
              variant={isListening ? "destructive" : "outline"}
              className={`h-9 w-9 shrink-0 ${isListening ? "animate-pulse" : ""}`}
              onClick={toggleListening}
              disabled={loading}
              title={isListening
                ? (isChinese ? "停止录音" : "Stop recording")
                : (isChinese ? "语音输入" : "Voice input")}
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
