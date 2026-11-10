import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { loadSavedFamilyVoices, savedVoiceAudio, onFamilyVoicesChanged, playBase64Mp3, type FamilyVoice } from "@/lib/family-voices";
import { FAMILY_VOICE_STATE } from "@/features/family-voices/schema";
import { Check, SkipForward, Volume2, Square, ChevronDown, Mic, Loader2, MessageSquare, Radio, PhoneCall, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { parseAIJson, prepareChatImage, speakTextStreaming, streamChatTextOnly, streamChatWithVoice, trimMessagesToCharLimit, transcribeAudio, VoiceRecorder, type StreamControls } from "@/lib/ai";
import { aiGreeting } from "../../../supabase/functions/_shared/ai-prompts";
import type { AssistantContextScope, AssistantRequest } from "@/contexts/AIAssistantContext";
import {
  ASSISTANT_CONVERSATION_SKILL,
  resolveAssistantContext,
  runAssistantConversationSkill,
  runAssistantWriteSkill,
} from "@/lib/ai-dynamic-knowledge";
import { appGuideEntries, type AppGuideEntry } from "@/lib/ai-static-knowledge";
import { useSite } from "@/contexts/SiteContext";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { CareTipContextPicker } from "@/components/ai/CareTipContextPicker";
import { buildActiveCareTipsPrompt, buildCareTipSelectionPrompt, type ActiveCareTip } from "@/lib/ai-care-tip-context";

type Msg = { role: "user" | "assistant"; content: string; imageDataUrl?: string | undefined };
type PendingChatImage = { dataUrl: string; name: string };
type ChatSend = (submittedText?: string | undefined, selectionTips?: ActiveCareTip[] | undefined) => Promise<boolean>;

/** Reply mode: text only / read aloud / live back-and-forth talk. Remembered. */
const READ_ALOUD_KEY = "ai-read-aloud";
const MODE_KEY = "ai-reply-mode";
export type ReplyMode = "text" | "read" | "live" | "call";
/** Simulated family call setup (who to play + what to say). Saved in this browser. */
const CALL_KEY = "ai-family-call";
type CallConfig = { name: string; prompt: string; voiceId?: string | undefined };
const READ_ALOUD_VOICE = "nova";
/** gpt-audio-mini (via OpenRouter); falls back to the built-in voice server-side. */
const READ_ALOUD_ENGINE = "openai" as const;

/**
 * The one and only chat body. Every AI surface in the app (floating assistant,
 * information-card dropdown, check-in, medicine reminder) renders this and calls
 * the same edge function through streamChatTextOnly.
 */
export function AICompanionChat({
  active,
  request = {},
  className,
  threadId,
  initialDraft,
  initialPrompt,
  onInitialPromptConsumed,
  onChatEngaged,
  onDraftChange,
  onThreadCreated,
  onThreadUpdated,
}: {
  active: boolean;
  request?: AssistantRequest | undefined;
  className?: string | undefined;
  /** Saved assistant thread (CCT121). Omit for one-off, unsaved chats. */
  threadId?: string | undefined;
  initialDraft?: string | undefined;
  initialPrompt?: string | null | undefined;
  onInitialPromptConsumed?: (() => void) | undefined;
  onChatEngaged?: (() => void) | undefined;
  onDraftChange?: ((value: string) => void) | undefined;
  onThreadCreated?: ((threadId: string) => void) | undefined;
  onThreadUpdated?: (() => void) | undefined;
}) {
  const { i18n } = useTranslation();
  const site = useSite();
  const queryClient = useQueryClient();
  const isZh = i18n.language?.startsWith("zh");
  const [messages, setMessages] = useState<Msg[]>(() =>
    !threadId && !request.starterPrompt && !request.appGuide
      ? [{ role: "assistant", content: aiGreeting(!!isZh, site.id) }]
      : [],
  );
  const [input, setInput] = useState(initialDraft || "");
  const [loading, setLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState<PendingChatImage | null>(null);
  const [preparingImage, setPreparingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<{ abort: () => void } | null>(null);
  const activeRequestId = useRef<string | undefined>(undefined);
  const threadIdRef = useRef(threadId);
  const threadCreationRef = useRef<Promise<string | null> | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const handledInitialPromptRef = useRef<string | null>(null);
  const persistentConversation = !request.onComplete && !request.starterPrompt && !request.appGuide;
  const contextScope: AssistantContextScope | undefined = request.contextScope ?? (request.contextPrompt ? undefined : {
    topics: ["app-basics", "care-group", "care-tips"],
    writeSkills: ["save-care-tip"],
  });
  const activeCareTipsRef = useRef<ActiveCareTip[]>([]);
  const sendRef = useRef<ChatSend | null>(null);
  const updateActiveCareTips = useCallback((tips: ActiveCareTip[]) => {
    activeCareTipsRef.current = tips;
  }, []);
  const sendCareTipSelection = useCallback((tips: ActiveCareTip[]) => {
    const status = isZh
      ? `已向 AI 发送 ${tips.length} 条护理小贴士。`
      : `Sent ${tips.length} care ${tips.length === 1 ? "tip" : "tips"} to AI.`;
    return sendRef.current?.(status, tips) ?? Promise.resolve(false);
  }, [isZh]);

  useEffect(() => {
    threadIdRef.current = threadId;
    threadCreationRef.current = threadId ? Promise.resolve(threadId) : null;
  }, [threadId]);

  useEffect(() => {
    if (initialDraft !== undefined && initialDraft !== input) setInput(initialDraft);
  }, [initialDraft, input]);

  // ─── App guide (fixed answers, no AI call) ───
  const guide = appGuideEntries(site.family);
  const [guideOpen, setGuideOpen] = useState(true);
  const [guideShowAll, setGuideShowAll] = useState(false);
  const [hideConfirm, setHideConfirm] = useState(false);
  const visibleGuide = guideShowAll ? guide : guide.slice(0, 4);

  const answerFromGuide = (entry: AppGuideEntry) => {
    const answer = isZh ? entry.a.zh : entry.a.en;
    setMessages((prev) => {
      const next: Msg[] = [
        ...prev,
        { role: "user", content: isZh ? entry.q.zh : entry.q.en },
        { role: "assistant", content: answer },
      ];
      if (readAloudRef.current) speak(answer, next.length - 1);
      return next;
    });
  };

  // ─── Reply mode: text / read aloud / live talk ───
  const [mode, setMode] = useState<ReplyMode>(() => {
    try {
      const saved = localStorage.getItem(MODE_KEY);
      if (saved === "text" || saved === "read" || saved === "live" || saved === "call") return saved;
      return localStorage.getItem(READ_ALOUD_KEY) === "1" ? "read" : "text";
    } catch { return "text"; }
  });
  const readAloud = mode === "read";
  // Family call is live talk with a family-member role on top.
  const liveMode = mode === "live" || mode === "call";
  const liveRef = useRef(liveMode);
  liveRef.current = liveMode;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const [callCfg, setCallCfg] = useState<CallConfig>(() => {
    try { return { name: "", prompt: "", ...JSON.parse(localStorage.getItem(CALL_KEY) || "{}") }; }
    catch { return { name: "", prompt: "" }; }
  });
  const callRef = useRef(callCfg);
  callRef.current = callCfg;
  const saveCall = (next: CallConfig) => {
    setCallCfg(next);
    try { localStorage.setItem(CALL_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };
  /** Extra instruction for spoken modes; the family-call role is added only in call mode. */
  const voiceStyle = () => {
    if (modeRef.current !== "call") return "";
    const { name, prompt } = callRef.current;
    const who = name.trim() || (isZh ? "一位家人" : "a family member");
    return isZh
      ? `现在是模拟家属来电：你扮演“${who}”给对方打电话，用这位家人的口吻和称呼说话，不提自己是 AI 助手。${prompt.trim() ? `家属的设定和要说的话：${prompt.trim()}` : ""}`
      : `This is a simulated family phone call: you play "${who}" calling them, speaking in this family member's voice and terms of address, without mentioning being an AI assistant. ${prompt.trim() ? `The family member's setup and what to say: ${prompt.trim()}` : ""}`;
  };
  const [familyVoices, setFamilyVoices] = useState<FamilyVoice[]>([]);
  useEffect(() => {
    // Family voice records are only needed by the optional simulated family
    // call mode. Keep text chat startup independent of voice storage and its
    // credentials, which may not be configured for this app.
    if (!active || mode !== "call") return;
    let alive = true;
    setFamilyVoices([]);
    const load = () => { void loadSavedFamilyVoices(request.contextScope?.caredOneId?.replace(/^wp-/, "")).then((rows) => { if (alive) setFamilyVoices(rows.filter((v) => v.state === FAMILY_VOICE_STATE.ready)); }).catch(() => { if (alive) setFamilyVoices([]); }); };
    load(); const off = onFamilyVoicesChanged(load); return () => { alive = false; off(); };
  }, [active, mode, request.contextScope?.caredOneId]);
  const clonedAudioRef = useRef<HTMLAudioElement | null>(null);
  /** Speaks a call reply in the chosen cloned family voice. */
  const speakCloned = async (text: string, index: number, voiceId: string) => {
    const clean = text.replace(/^✅\s*/, "").trim().slice(0, 1900);
    if (!clean) return;
    setSpeakingIndex(index);
    try {
      const voice = familyVoices.find((v) => v.voiceId === voiceId);
      if (!voice) throw new Error("Selected family voice is unavailable");
      const { audioBase64 } = await savedVoiceAudio(voice, clean);
      clonedAudioRef.current?.pause();
      const a = playBase64Mp3(audioBase64);
      clonedAudioRef.current = a;
      a.onended = () => setSpeakingIndex(null);
      a.onerror = () => setSpeakingIndex(null);
    } catch (e) {
      console.error("Cloned voice failed:", e);
      setMicError(isZh ? "亲友声音合成失败，请稍后再试。" : "Family voice failed — try again.");
      setSpeakingIndex(null);
    }
  };
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const voiceRef = useRef<StreamControls | null>(null);
  const readAloudRef = useRef(readAloud);
  readAloudRef.current = readAloud;



  const stopSpeaking = () => {
    clonedAudioRef.current?.pause();
    clonedAudioRef.current = null;
    voiceRef.current?.stop();
    voiceRef.current = null;
    setSpeakingIndex(null);
  };

  const speak = (text: string, index: number) => {
    stopSpeaking();
    const clean = text.replace(/^✅\s*/, "").trim();
    if (!clean) return;
    setSpeakingIndex(index);
    voiceRef.current = speakTextStreaming(clean, READ_ALOUD_VOICE, {
      engine: READ_ALOUD_ENGINE,
      onAllAudioEnd: () => setSpeakingIndex(null),
      onError: (e) => { console.error("Read aloud failed:", e); setSpeakingIndex(null); },
    });
  };

  const changeMode = (next: ReplyMode) => {
    setMode(next);
    try {
      localStorage.setItem(MODE_KEY, next);
      localStorage.setItem(READ_ALOUD_KEY, next === "text" ? "0" : "1");
    } catch { /* ignore */ }
    if (next === "text") stopSpeaking();
  };

  // ─── Voice input (speech → text) ───
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const startRecording = async () => {
    if (recording || transcribing || loading) return;
    stopSpeaking();
    setMicError(null);
    const rec = new VoiceRecorder();
    try {
      await rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch {
      setMicError(isZh ? "打不开麦克风，请在系统里允许使用麦克风。" : "Can't reach the microphone — allow microphone access and try again.");
    }
  };

  const chooseImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImageError(null);
    setPreparingImage(true);
    try {
      const dataUrl = await prepareChatImage(file);
      setPendingImage({ dataUrl, name: file.name });
    } catch {
      setImageError(isZh ? "这张图片暂时无法读取，请换一张图片再试。" : "This image couldn't be opened. Please choose another image.");
    } finally {
      setPreparingImage(false);
    }
  };

  const finishRecording = async (send_ = true) => {
    const rec = recorderRef.current;
    recorderRef.current = null;
    setRecording(false);
    if (!rec) return;
    const blob = await rec.stop();
    if (!send_) return;
    if (!blob) {
      setMicError(isZh ? "没有录到声音，请再说一次。" : "Nothing was recorded — please try again.");
      return;
    }
    setTranscribing(true);
    try {
      const text = await transcribeAudio(blob, isZh ? "zh" : "en");
      if (!text) {
        setMicError(isZh ? "没听清，请再说一次。" : "Didn't catch that — please try again.");
        return;
      }
      if (liveRef.current) await send(text);
      else setInput((prev) => (prev ? `${prev} ${text}` : text));
    } catch (e) {
      console.error("Transcription failed:", e);
      setMicError(isZh ? "语音识别暂时不可用，请打字。" : "Voice input isn't available right now — please type.");
    } finally {
      setTranscribing(false);
    }
  };

  // Stop any playback as soon as the assistant is closed.
  useEffect(() => { if (!active) { stopSpeaking(); recorderRef.current?.cancel(); recorderRef.current = null; setRecording(false); } }, [active]);
  useEffect(() => () => { stopSpeaking(); recorderRef.current?.cancel(); }, []);

  /**
   * On-demand context: the static snippets that match this question plus only
   * the permitted dynamic facts it needs. See src/lib/ai-dynamic-knowledge.ts.
   */
  const buildContext = async (question: string, selectionTips: ActiveCareTip[] = []): Promise<string | undefined> => {
    const selectionHandoff = selectionTips.length > 0;
    const activeCareTips = activeCareTipsRef.current;
    const careTipContext = [
      buildActiveCareTipsPrompt(activeCareTips, !!isZh),
      buildCareTipSelectionPrompt(selectionTips, !!isZh),
    ].filter(Boolean).join("\n\n");
    const hasCareTipContext = activeCareTips.length > 0 || selectionTips.length > 0;
    if (!contextScope) {
      const liveOnly = selectionHandoff ? "" : voiceStyle();
      return [request.contextPrompt, liveOnly, careTipContext].filter(Boolean).join("\n\n") || undefined;
    }
    let resolved = "";
    try {
      resolved = await resolveAssistantContext({
        question,
        isChinese: !!isZh,
        caredOneId: contextScope.caredOneId,
        groupId: contextScope.groupId,
        groupName: contextScope.groupName,
        topics: contextScope.topics,
        staticSkillNames: [
          ...(contextScope.staticSkillNames || []),
          ...(!selectionHandoff && (modeRef.current === "live" || modeRef.current === "call") ? ["assistant.live-voice"] : []),
          ...(hasCareTipContext ? ["assistant.care-tip-execution"] : []),
        ],
        appFamily: site.family,
        sheetContext: contextScope.sheetContext,
        history: messages.slice(-4).map((message) => ({ role: message.role, content: message.content })),
        writeSkills: contextScope.writeSkills,
        sharedCard: contextScope.sharedCard,
      });
    } catch (e) {
      console.warn("AI context resolution failed, continuing without facts:", e);
    }
    const live = selectionHandoff ? "" : voiceStyle();
    return [request.contextPrompt, resolved, live, careTipContext].filter(Boolean).join("\n\n") || undefined;
  };
  const buildContextRef = useRef(buildContext);
  buildContextRef.current = buildContext;
  const speakRef = useRef(speak);
  speakRef.current = speak;

  // Saved thread: restore its messages once.
  const [saveError, setSaveError] = useState<string | null>(null);
  useEffect(() => {
    if (!threadId) return;
    let alive = true;
    runAssistantConversationSkill(ASSISTANT_CONVERSATION_SKILL, "load", { id: threadId })
      .then((rows) => {
        if (!alive) return;
        // Never wipe messages the user already sent while the history loaded.
        setMessages((prev) =>
          prev.some((m) => m.role === "user")
            ? prev
            : rows.length ? rows : [{ role: "assistant", content: aiGreeting(!!isZh, site.id) }]
        );
      })
      .catch(() => { if (alive) setSaveError(isZh ? "无法读取这段对话。" : "Couldn't load this conversation."); });
    return () => { alive = false; };
  }, [threadId, isZh, site.id]);

  const persistTurn = (userText: string, reply: string, firstTurn: boolean) => {
    const saving = saveQueueRef.current.then(async () => {
      if (!reply.trim()) return;
      let currentThreadId = threadIdRef.current;
      if (!currentThreadId && persistentConversation) {
        const pendingCreation = threadCreationRef.current ?? runAssistantConversationSkill(
          ASSISTANT_CONVERSATION_SKILL,
          "create",
        ).catch(() => null);
        threadCreationRef.current = pendingCreation;
        const createdThreadId = await pendingCreation;
        if (!createdThreadId) throw new Error("Could not create the saved conversation.");
        currentThreadId = createdThreadId;
        threadIdRef.current = currentThreadId;
        onThreadCreated?.(currentThreadId);
      }
      if (!currentThreadId) return;
      await runAssistantConversationSkill(ASSISTANT_CONVERSATION_SKILL, "append", {
        id: currentThreadId,
        role: "user",
        content: userText,
      });
      await runAssistantConversationSkill(ASSISTANT_CONVERSATION_SKILL, "append", {
        id: currentThreadId,
        role: "assistant",
        content: reply,
      });
      await runAssistantConversationSkill(ASSISTANT_CONVERSATION_SKILL, "touch", {
        id: currentThreadId,
        ...(firstTurn ? { title: userText.slice(0, 40) } : {}),
      });
    });
    saveQueueRef.current = saving.catch(() => undefined);
    void saving.then(() => {
      setSaveError(null);
      onThreadUpdated?.();
    }).catch((error: unknown) => {
      console.error("Saving AI thread failed:", error);
      setSaveError(isZh ? "这条对话没能保存。" : "This message couldn't be saved.");
    });
  };

  useEffect(() => {
    if (threadId) return;
    if (!active || activeRequestId.current === request.id) return;
    activeRequestId.current = request.id;
    setInput("");
    const starter = request.starterPrompt?.trim();
    if (request.appGuide) {
      // The guide itself is the welcome — nothing to generate, nothing to wait for.
      setMessages([]);
      setGuideOpen(true);
      setGuideShowAll(false);
      setHideConfirm(false);
      return;
    }
    if (!starter) {
      setMessages((previous) => previous.length
        ? previous
        : [{ role: "assistant", content: aiGreeting(!!isZh, site.id) }]);
      return;
    }
    setMessages([{ role: "assistant", content: "" }]);
    setLoading(true);
    void buildContextRef.current(starter).then((contextPrompt) => {
    const { abort, result } = streamChatTextOnly([{ role: "user", content: starter }], {
      language: isZh ? "zh" : "en",
      contextPrompt,
      onTextDelta: (_delta, full) => setMessages([{ role: "assistant", content: full }]),
      onError: () => setMessages([{ role: "assistant", content: request.starterFallback || aiGreeting(!!isZh, site.id) }]),
    });
    abortRef.current = { abort };
    void result
      .then((full) => { if (readAloudRef.current && full.trim()) speakRef.current(full, 0); })
      .catch(() => undefined)
      .finally(() => { setLoading(false); abortRef.current = null; });
    });
  }, [active, request, isZh, site.id, threadId]);

  useEffect(() => {
    if (!active && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setLoading(false);
    }
  }, [active]);

  const send = async (submittedText?: string | undefined, selectionTips: ActiveCareTip[] = []): Promise<boolean> => {
    const text = (submittedText ?? input).trim();
    const image = pendingImage;
    if ((!text && !image) || loading || preparingImage) return false;
    const userText = text || (isZh ? "请看看这张图片。" : "Please take a look at this image.");
    const savedUserText = image ? `${userText}\n[${isZh ? "图片附件" : "Image attached"}]` : userText;
    onChatEngaged?.();
    setInput("");
    setPendingImage(null);
    setImageError(null);
    setChatError(null);
    onDraftChange?.("");
    const next: Msg[] = [
      ...messages,
      { role: "user", content: userText, ...(image ? { imageDataUrl: image.dataUrl } : {}) },
      { role: "assistant", content: "" },
    ];
    setMessages(next);
    setLoading(true);

    try {
      const history = trimMessagesToCharLimit(
        next.slice(0, -1).map((m) => ({ role: m.role, content: m.content, ...(m.imageDataUrl ? { imageDataUrl: m.imageDataUrl } : {}) }))
      );
      const contextPrompt = await buildContext(userText, selectionTips);
      const onDelta = (full: string) =>
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: full };
          return copy;
        });

      let reply = "";
      const clonedVoice = modeRef.current === "call" ? callRef.current.voiceId : undefined;
      if (selectionTips.length > 0) {
        // Tip selection is a control handoff to the signed-in user, not a line
        // for the simulated caller to say to the person on the other end.
        stopSpeaking();
        const { abort, result } = streamChatTextOnly(history, {
          language: isZh ? "zh" : "en",
          contextPrompt,
          onTextDelta: (_d, full) => onDelta(full),
          onError: (e) => console.error("AI care-tip selection error:", e),
        });
        abortRef.current = { abort };
        reply = await result;
      } else if (clonedVoice) {
        stopSpeaking();
        const { abort, result } = streamChatTextOnly(history, {
          language: isZh ? "zh" : "en",
          contextPrompt,
          onTextDelta: (_d, full) => onDelta(full),
          onError: (e) => console.error("AI call chat error:", e),
        });
        abortRef.current = { abort };
        reply = await result;
      } else if (liveRef.current) {
        // Live talk: each finished sentence is spoken while the rest still
        // streams, so the answer starts coming back almost immediately.
        stopSpeaking();
        const { controls, result } = streamChatWithVoice(history, READ_ALOUD_VOICE, {
          engine: READ_ALOUD_ENGINE,
          language: isZh ? "zh" : "en",
          contextPrompt,
          onTextDelta: (_d, full) => onDelta(full),
          onAudioStart: () => setSpeakingIndex(next.length - 1),
          onAllAudioEnd: () => setSpeakingIndex(null),
          onError: (e) => console.error("AI live chat error:", e),
        });
        voiceRef.current = controls;
        abortRef.current = { abort: () => controls.stop() };
        reply = await result;
      } else {
        const { abort, result } = streamChatTextOnly(history, {
          language: isZh ? "zh" : "en",
          contextPrompt,
          onTextDelta: (_d, full) => onDelta(full),
          onError: (e) => console.error("AI chat error:", e),
        });
        abortRef.current = { abort };
        reply = await result;
      }
      let persistedReply = reply;
      const parsed = parseAIJson<{
        done?: boolean | undefined;
        skill?: string | undefined;
        summary?: string | undefined;
        status?: string | undefined;
        caredOneName?: string | undefined;
      }>(reply);
      if (parsed?.done && parsed.summary && request.onComplete) {
        const allowed = request.completionStatuses || [];
        if (!parsed.status || allowed.length === 0 || allowed.includes(parsed.status)) {
          try {
            await request.onComplete({ status: parsed.status, summary: parsed.summary });
            persistedReply = `✅ ${parsed.summary}`;
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: "assistant", content: persistedReply };
              return copy;
            });
          } catch {
            persistedReply = isZh ? "没能保存这条记录，请稍后再试。" : "Couldn't save this record. Please try again.";
            setMessages((prev) => {
              const copy = [...prev];
              copy[copy.length - 1] = { role: "assistant", content: persistedReply };
              return copy;
            });
          }
        }
      } else if (parsed?.done && parsed.skill === "save-care-tip") {
        if (contextScope?.writeSkills?.includes("save-care-tip")) {
          try {
            const written = await runAssistantWriteSkill({
              skill: "save-care-tip",
              question: userText,
              caredOneName: parsed.caredOneName,
              caredOneId: contextScope.caredOneId,
              sharedCard: contextScope.sharedCard,
              history: messages.slice(-4).map((message) => ({ role: message.role, content: message.content })),
              result: { status: parsed.status, summary: parsed.summary },
              isChinese: !!isZh,
            });
            written.invalidateKeys.forEach((queryKey) => void queryClient.invalidateQueries({ queryKey }));
            persistedReply = `✅ ${written.message}`;
          } catch {
            persistedReply = isZh
              ? "我没能保存这条护理小贴士。请确认可以查看这位家人的资料后再试。"
              : "I couldn't save this care tip. Please check that this person is available in your care group and try again.";
          }
        } else {
          persistedReply = isZh
            ? "这段对话不能保存护理小贴士，请在通用 AI 助手中继续。"
            : "This chat can't save care tips. Please continue in the general AI assistant.";
        }
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: persistedReply };
          return copy;
        });
      }
      persistTurn(savedUserText, persistedReply, !messages.some((m) => m.role === "user"));
      if (!liveRef.current) {
        if (clonedVoice && persistedReply.trim()) void speakCloned(persistedReply, next.length - 1, clonedVoice);
        else if (readAloudRef.current && persistedReply.trim()) speak(persistedReply, next.length - 1);
      }
      return true;
    } catch (e) {
      console.error(e);
      const message = isZh ? "图片或消息暂时没有发送成功，请稍后再试。" : "Your image or message couldn't be sent. Please try again.";
      setChatError(message);
      if (image) setPendingImage(image);
      setMessages((prev) => {
        const copy = [...prev];
        const userIndex = copy.length - 2;
        const failedUserMessage = copy[userIndex];
        if (image && failedUserMessage?.role === "user") {
          copy[userIndex] = { role: "user", content: failedUserMessage.content };
        }
        const last = copy[copy.length - 1];
        if (last?.role === "assistant" && !last.content)
          copy[copy.length - 1] = { role: "assistant", content: message };
        return copy;
      });
      return false;
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };
  sendRef.current = send;

  useEffect(() => {
    const prompt = initialPrompt?.trim();
    const promptKey = prompt ? `${request.id || "assistant"}:${prompt}` : null;
    if (!active || !prompt || loading || handledInitialPromptRef.current === promptKey) return;
    handledInitialPromptRef.current = promptKey;
    onInitialPromptConsumed?.();
    onChatEngaged?.();
    void sendRef.current?.(prompt);
  }, [active, initialPrompt, loading, request.id, onInitialPromptConsumed, onChatEngaged]);

  return (
    <div className={className ?? "flex min-h-0 flex-1 flex-col"}>
      {request.appGuide && guideOpen && (
        <div className="mx-4 mt-3 rounded-2xl border bg-muted/40 p-3">
          <h3 className="text-sm font-semibold text-foreground">
            {isZh ? "你想了解哪一项？" : "What would you like help with?"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {isZh
              ? "点一个问题，常见答案会马上显示。其他问题也可以直接问，或使用 AI 助手悬浮球继续聊。"
              : "Tap a question for an instant answer. You can ask anything else here or continue with the AI Assistant bubble."}
          </p>
          <div className="mt-3 space-y-2">
            {visibleGuide.map((entry) => (
              <button
                key={entry.inspectorId}
                data-inspector-id={entry.inspectorId}
                type="button"
                onClick={() => answerFromGuide(entry)}
                className="w-full rounded-xl bg-background px-3 py-2.5 text-left text-sm text-foreground shadow-xs transition-colors hover:bg-accent"
              >
                {isZh ? entry.q.zh : entry.q.en}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            {guide.length > 4 ? (
              <button
                type="button"
                onClick={() => setGuideShowAll((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${guideShowAll ? "rotate-180" : ""}`} />
                {guideShowAll ? (isZh ? "收起" : "Show less") : (isZh ? "更多问题" : "Show more")}
              </button>
            ) : <span />}
            <button
              type="button"
              onClick={() => (request.onHideGuide ? setHideConfirm((v) => !v) : setGuideOpen(false))}
              className="inline-flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1.5 text-xs text-foreground"
            >
              {isZh ? "隐藏使用帮助" : "Hide app guide"}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${hideConfirm ? "rotate-180" : ""}`} />
            </button>
          </div>
          {hideConfirm && request.onHideGuide && (
            <div className="mt-2 rounded-xl border bg-background p-3">
              <Button
                className="w-full"
                onClick={async () => {
                  setHideConfirm(false);
                  setGuideOpen(false);
                  await request.onHideGuide?.();
                }}
              >
                {isZh ? "隐藏帮助按钮" : "Hide the help button"}
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                {isZh ? "以后想再看到它，在“设置”里随时可以重新打开。" : "You can turn the app guide back on any time in your settings."}
              </p>
            </div>
          )}
        </div>
      )}
      {saveError && <p role="alert" className="mx-4 mt-2 text-sm text-destructive">{saveError}</p>}

      <Conversation className="min-h-0">
        <ConversationContent className="gap-4 px-4 py-4">
          {messages.map((m, i) => (
            <div key={`${m.role}-${i}`} className="space-y-1">
              {m.role === "user" && m.imageDataUrl && (
                <div className="flex justify-end">
                  <img
                    src={m.imageDataUrl}
                    alt={isZh ? "你发送的图片" : "Image you sent"}
                    className="max-h-56 max-w-[80%] rounded-xl border object-contain"
                  />
                </div>
              )}
              <Message from={m.role}>
                <MessageContent>
                  {m.content ? <MessageResponse>{m.content}</MessageResponse> : <Shimmer>{isZh ? "正在思考…" : "Thinking…"}</Shimmer>}
                </MessageContent>
              </Message>
              {m.role === "assistant" && m.content && (
                <button
                  type="button"
                  onClick={() => (speakingIndex === i ? stopSpeaking() : speak(m.content, i))}
                  className="ml-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  aria-label={speakingIndex === i ? (isZh ? "停止朗读" : "Stop reading") : (isZh ? "朗读这段" : "Read this aloud")}
                >
                  {speakingIndex === i
                    ? <><Square className="h-3 w-3" />{isZh ? "停止" : "Stop"}</>
                    : <><Volume2 className="h-3 w-3" />{isZh ? "朗读" : "Listen"}</>}
                </button>
              )}
            </div>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t p-3 space-y-2">
        <div className="flex items-center gap-1 rounded-xl bg-muted p-1" role="group" aria-label={isZh ? "回复方式" : "Reply mode"}>
          {([
            { id: "text" as const, icon: MessageSquare, zh: "文字", en: "Text" },
            { id: "read" as const, icon: Volume2, zh: "朗读", en: "Read aloud" },
            { id: "live" as const, icon: Radio, zh: "即时对话", en: "Live talk" },
            { id: "call" as const, icon: PhoneCall, zh: "来电", en: "Family call" },
          ]).map((opt) => {
            const Icon = opt.icon;
            const on = mode === opt.id;
            return (
              <button
                key={opt.id}
                data-inspector-id={`components/ai/AICompanionChat/reply-mode-${opt.id}`}
                type="button"
                aria-pressed={on}
                onClick={() => changeMode(opt.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${on ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {isZh ? opt.zh : opt.en}
              </button>
            );
          })}
        </div>
        {contextScope && !request.appGuide && !contextScope.sharedCard && (!contextScope.topics || contextScope.topics.includes("care-tips")) && (
          <CareTipContextPicker
            enabled={active}
            sending={loading}
            initialCaredOneId={contextScope.caredOneId}
            onActiveTipsChange={updateActiveCareTips}
            onSendTips={sendCareTipSelection}
          />
        )}
        {mode === "live" && (
          <p className="text-xs text-muted-foreground">
            {isZh ? "按住麦克风说话，松手就会马上回答，一句一句读出来。" : "Hold the microphone and talk — the reply comes back spoken, sentence by sentence."}
          </p>
        )}
        {mode === "call" && (
          <div className="space-y-1.5 rounded-xl border p-2">
            <p className="text-xs text-muted-foreground">
              {isZh
                ? "模拟家属来电（不是真实来电）。写下扮演谁、怎么说话、要说的话；按住麦克风对话。可以选一个已录制的亲友声音。"
                : "Simulated family call (not a real call). Describe who to play, how they talk and what to say; hold the mic to talk. You can pick a recorded family voice."}
            </p>
            <select
              value={callCfg.voiceId || ""}
              onChange={(e) => saveCall({ ...callCfg, voiceId: e.target.value || undefined })}
              className="w-full rounded-md border bg-background px-2 py-1 text-xs"
              aria-label={isZh ? "用谁的声音" : "Which voice"}
            >
              <option value="">{isZh ? "默认 AI 声音" : "Default AI voice"}</option>
              {familyVoices.map((v) => (
                <option key={v.id} value={v.voiceId}>{v.label} · {v.caredOneName}</option>
              ))}
            </select>
            {familyVoices.length === 0 && (
              <p className="text-[11px] text-muted-foreground">{isZh ? "在“被护理人 → 录制亲友声音”里录一段，就能在这里选。" : "Record one under Cared Ones → Family Voices to pick it here."}</p>
            )}
            <input
              value={callCfg.name}
              onChange={(e) => saveCall({ ...callCfg, name: e.target.value })}
              placeholder={isZh ? "扮演谁，例如：女儿小红" : "Who calls, e.g. daughter Amy"}
              className="w-full rounded-md border bg-background px-2 py-1 text-xs"
            />
            <textarea
              value={callCfg.prompt}
              onChange={(e) => saveCall({ ...callCfg, prompt: e.target.value })}
              rows={3}
              placeholder={isZh ? "例如：叫他爸，语气轻松。告诉他今天来的阿姨是我们请来帮忙的，不要赶她走。" : "e.g. Call him Dad, keep it light. Tell him the helper today is someone we asked to come — please let her stay."}
              className="w-full resize-none rounded-md border bg-background px-2 py-1 text-xs"
            />
          </div>
        )}
        {micError && <p className="text-xs text-destructive">{micError}</p>}
        {imageError && <p role="alert" className="text-xs text-destructive">{imageError}</p>}
        {chatError && <p role="alert" className="text-xs text-destructive">{chatError}</p>}
        {request.onComplete && (
          <div className="flex justify-end gap-2">
            {(request.completionStatuses || []).includes("skipped") && (
              <Button size="sm" variant="outline" onClick={() => request.onComplete?.({ status: "skipped", summary: isZh ? "用户选择跳过。" : "User chose to skip." })}>
                <SkipForward className="h-3.5 w-3.5 mr-1" />{isZh ? "跳过" : "Skip"}
              </Button>
            )}
            <Button size="sm" onClick={() => request.onComplete?.({ status: request.completionStatuses?.[0], summary: messages.map((m) => `${m.role}: ${m.content}`).join("\n").slice(0, 1500) })}>
              <Check className="h-3.5 w-3.5 mr-1" />{isZh ? "完成并保存" : "Finish & save"}
            </Button>
          </div>
        )}
        {pendingImage && (
          <div className="mb-2 flex items-center gap-2 rounded-xl border bg-muted/30 p-2">
            <img src={pendingImage.dataUrl} alt="" className="h-12 w-12 rounded-md object-cover" />
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{pendingImage.name}</span>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label={isZh ? "移除图片" : "Remove image"}
              onClick={() => setPendingImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label={isZh ? "选择要发送的图片" : "Choose an image to send"}
          onChange={(event) => void chooseImage(event)}
        />
        <PromptInput onSubmit={({ text }) => { void send(text); }}>
          <PromptInputBody>
            <PromptInputTextarea
              autoFocus={active}
              aria-label={isZh ? "输入消息" : "Type a message"}
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                onDraftChange?.(event.target.value);
                if (event.target.value) onChatEngaged?.();
              }}
              placeholder={isZh ? "说点什么…" : "Type a message…"}
            />
          </PromptInputBody>
          <PromptInputFooter className="justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={transcribing || loading || preparingImage}
                aria-label={isZh ? "添加图片" : "Add image"}
                data-inspector-id="components/ai/AICompanionChat/attach-image"
                onClick={() => imageInputRef.current?.click()}
              >
                {preparingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={recording ? "destructive" : "outline"}
                disabled={transcribing || loading}
                aria-label={recording ? (isZh ? "停止说话并发送" : "Stop talking and send") : (isZh ? "按住说话" : "Hold to talk")}
                onPointerDown={(e) => { e.preventDefault(); void startRecording(); }}
                onPointerUp={(e) => { e.preventDefault(); void finishRecording(true); }}
                onPointerLeave={() => { if (recording) void finishRecording(true); }}
              >
                {transcribing
                  ? <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />{isZh ? "识别中…" : "Transcribing…"}</>
                  : recording
                    ? <><Square className="mr-1 h-3.5 w-3.5" />{isZh ? "松手发送" : "Release to send"}</>
                    : <><Mic className="mr-1 h-3.5 w-3.5" />{isZh ? "按住说话" : "Hold to talk"}</>}
              </Button>
            </div>
            <PromptInputSubmit status={loading ? "streaming" : "ready"} disabled={loading || preparingImage || (!input.trim() && !pendingImage)} onStop={() => abortRef.current?.abort()} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
