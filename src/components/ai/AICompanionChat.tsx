import { useEffect, useRef, useState } from "react";
import { Check, SkipForward, Volume2, Square, ChevronDown, Mic, Loader2, MessageSquare, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { parseAIJson, speakTextStreaming, streamChatTextOnly, streamChatWithVoice, trimMessagesToCharLimit, transcribeAudio, VoiceRecorder, type StreamControls } from "@/lib/ai";
import { aiGreeting } from "../../../supabase/functions/_shared/ai-prompts";
import type { AssistantRequest } from "@/contexts/AIAssistantContext";
import { resolveAssistantContext } from "@/lib/ai-dynamic-knowledge";
import { useSite } from "@/contexts/SiteContext";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";

type Msg = { role: "user" | "assistant"; content: string };

/**
 * ─── App guide (common questions) ───
 * Written out here on purpose: these answers are fixed app instructions, so
 * tapping one answers instantly with no AI call and no cost. The AI is only
 * used for anything the user types that is not covered below.
 */
type GuideEntry = { q: { zh: string; en: string }; a: { zh: string; en: string } };

const GUIDE_SHARED: GuideEntry[] = [
  {
    q: { zh: "怎么给家人或护理者发消息？", en: "How do I message my family or caregiver?" },
    a: {
      zh: "1. 点底部的“收件箱”。\n2. 上方选“消息”。\n3. 点开一个人的名字，在下面输入框打字，按发送。\n如果还没有人，先在“圈子/护理群组”里把家人加进来，或在“寻找”里联系一位护理者。",
      en: "1. Tap Inbox in the bottom bar.\n2. Choose Messages at the top.\n3. Tap a person's name, type in the box at the bottom and send.\nNo one there yet? Add family in your care circle first, or contact a caregiver from Find.",
    },
  },
  {
    q: { zh: "提醒和通知在哪里看？", en: "Where do I see reminders and alerts?" },
    a: {
      zh: "所有提醒、预约变化和安全提醒都在底部的“收件箱”里。上方选“通知”只看提醒；点一条就会跳到相关的页面。红色数字表示还没读的条数。",
      en: "Every reminder, booking update and safety alert lands in Inbox. Pick Notifications at the top to see only alerts; tap one and it opens the right page. The red number is how many you haven't read.",
    },
  },
  {
    q: { zh: "怎么切换中文或英文？", en: "How do I change the language?" },
    a: { zh: "点右上角的头像 → 设置 → 语言，选“中文”或“English”，马上生效。", en: "Tap your avatar at the top right → Settings → Language, then pick English or 中文. It changes right away." },
  },
  {
    q: { zh: "怎么改成深色模式或放大字？", en: "How do I switch to dark mode?" },
    a: { zh: "点顶部的月亮图标就能在浅色和深色之间切换。字体大小请用手机系统里的“显示与字体大小”设置。", en: "Tap the moon icon in the top bar to switch between light and dark. For bigger text, use your phone's own display/text-size setting." },
  },
  {
    q: { zh: "我的资料和账号在哪里改？", en: "Where do I edit my profile and account?" },
    a: { zh: "点右上角头像 → 设置。里面可以改姓名、联系方式、所在城市、通知方式和隐私选项，改完记得点保存。", en: "Tap your avatar → Settings. There you can change your name, contact details, city, notification choices and privacy options. Remember to save." },
  },
  {
    q: { zh: "AI 助手能帮我做什么？", en: "What can the AI assistant do?" },
    a: { zh: "点右下角的机器人按钮，可以直接问照护上的问题、让它帮你记用药、记签到，或总结今天的情况。它不给医疗和用药诊断建议，紧急情况请打急救电话。", en: "Tap the robot button at the bottom right. You can ask care questions, have it log a medicine dose or a check-in for you, or summarise the day. It never gives medical or financial advice — in an emergency, call emergency services." },
  },
  {
    q: { zh: "回复可以读出来吗？", en: "Can the answers be read aloud?" },
    a: { zh: "可以。打开下面的“自动朗读回复”开关，之后每条回复都会读出来；也可以点某条回复下面的“朗读”单独听。", en: "Yes. Turn on “Read replies aloud” below and every reply is spoken; or tap Listen under any single reply." },
  },
];

const GUIDE_BY_FAMILY: Record<"challenged" | "carecnc" | "notchsafety", GuideEntry[]> = {
  challenged: [
    {
      q: { zh: "怎么建立护理群组，把家人加进来？", en: "How do I set up a care team and add family?" },
      a: {
        zh: "1. 底部点“护理群组”。\n2. 点“新建群组”，写个名字（比如“妈妈的照护”）。\n3. 在成员里点“邀请”，输入对方姓名或邮箱。\n对方在自己的收件箱里点“接受”后就进来了。",
        en: "1. Tap Care Teams in the bottom bar.\n2. Tap New team and give it a name (e.g. “Mum's care”).\n3. In Members, tap Invite and enter their name or email.\nThey accept from their own Inbox and then they're in.",
      },
    },
    {
      q: { zh: "怎么添加我照顾的人？", en: "How do I add the person I care for?" },
      a: { zh: "在“护理群组”里选“我照顾的人”，点“添加”，填姓名、年龄和病情阶段（早期/中期/晚期）。填好后，用药、签到、日常安排和照护须知都会按这个人来记录。", en: "In Care Teams, open the people you care for, tap Add, and fill in their name, age and stage (early / middle / late). After that, medicines, check-ins, routines and the care sheet are all kept under that person." },
    },
    {
      q: { zh: "怎么记录吃药和每天签到？", en: "How do I log medicines and daily check-ins?" },
      a: { zh: "在被照顾者的页面上有“用药”和“签到”两张卡。点“已服用”就记下这一次；点卡上的助手按钮，也可以用说话的方式让 AI 帮你记。", en: "On the cared-for person's page there are Medicines and Check-in cards. Tap Taken to log a dose; or tap the assistant button on the card and just tell the AI, and it records it for you." },
    },
    {
      q: { zh: "怎么找并预约一位护理者？", en: "How do I find and book a caregiver?" },
      a: { zh: "1. 底部点“寻找” → 找护理者。\n2. 用城市、服务类型和价格筛选。\n3. 点开一位护理者看评价，点“预约”。\n4. 选日期、时长，提交。对方确认后，你会在收件箱收到通知。", en: "1. Tap Find → Hire Caregivers.\n2. Filter by city, service type and price.\n3. Open a caregiver, read the reviews, tap Book.\n4. Pick a date and length and submit. When they confirm, you get a notice in Inbox." },
    },
    {
      q: { zh: "怎么知道家人走出安全范围？", en: "How do I know if my family member leaves a safe area?" },
      a: { zh: "底部点“定位”。地图上能看到当前位置；切到“地点”可以画出安全范围（家、小区、医院）。他离开或回到范围时，你会收到提醒。需要对方在自己手机上打开位置共享。", en: "Tap the locator tab. The map shows where they are; switch to Places to draw safe areas (home, the block, the clinic). You get an alert when they leave or come back. They need location sharing switched on their own phone." },
    },
    {
      q: { zh: "任务、日历和预约有什么区别？", en: "What's the difference between tasks, calendar and bookings?" },
      a: { zh: "“任务”是家里人互相分工的事情（买菜、陪诊）；“日历”是所有安排的总览；“预约”是你花钱请护理者上门的服务记录。", en: "Tasks are jobs your family shares between each other (shopping, hospital trips). Calendar shows everything on one timeline. Bookings are the paid visits you arranged with a caregiver." },
    },
    {
      q: { zh: "照护须知是什么，怎么用？", en: "What is the care sheet for?" },
      a: { zh: "照护须知是一页写清楚这个人怎么照顾的说明：习惯、忌口、常用药、紧急联系人。临时请人帮忙时，把这一页给他看就够了；页面上还能直接问 AI 上面的内容。", en: "The care sheet is one page that says how this person should be looked after: habits, foods to avoid, medicines, emergency contacts. Hand it to anyone standing in for you — and you can ask the AI questions about what's on it right there." },
    },
    {
      q: { zh: "在哪里看照护知识文章？", en: "Where can I read care articles?" },
      a: { zh: "底部“工具”里有“资源与帮助”，按主题分成护理篇、安全篇、应对篇、认知篇和陪伴篇；“社区”里可以看别人的经验和提问。", en: "Open More → Resources & Help; articles are grouped by topic (care, safety, coping, understanding, companionship). Community is where other families share and ask." },
    },
  ],
  carecnc: [
    {
      q: { zh: "怎么找到合适的护理者？", en: "How do I find the right caregiver?" },
      a: { zh: "1. 底部点“寻找”。\n2. 输入城市，选服务类型和时间。\n3. 按评分和价格看，点开看资历和评价。\n觉得合适可以先发消息问清楚再预约。", en: "1. Tap Find.\n2. Enter your city and choose service type and timing.\n3. Compare by rating and price, open a profile for experience and reviews.\nYou can message them first, then book." },
    },
    {
      q: { zh: "怎么下单预约上门服务？", en: "How do I book a visit?" },
      a: { zh: "在护理者页面点“预约”，选日期、开始时间和时长，写清楚要做什么，提交。对方确认后你会收到通知，完成后可以给评价。", en: "On a caregiver's page tap Book, pick the date, start time and length, say what's needed and submit. You'll be notified when they confirm, and you can review them once it's done." },
    },
    {
      q: { zh: "可以取消或退款吗？", en: "Can I cancel or get a refund?" },
      a: { zh: "打开“预约”，找到那一条，点“取消”或“申请退款”，写一句原因。护理者和平台处理后，结果会发到你的收件箱。", en: "Open Bookings, find the visit, tap Cancel or Request refund and add a short reason. The outcome arrives in your Inbox once it's handled." },
    },
    {
      q: { zh: "怎么收藏我喜欢的护理者？", en: "How do I save a caregiver I like?" },
      a: { zh: "在护理者卡片或页面上点心形图标，之后从头像菜单里的“收藏的护理者”就能直接找到他。", en: "Tap the heart on a caregiver's card or page. Find them again any time under Saved caregivers in your account menu." },
    },
    {
      q: { zh: "我自己想接单，怎么成为护理者？", en: "How do I sign up as a caregiver?" },
      a: { zh: "底部“工具” → 成为护理者，填服务项目、服务区域、价格和可预约时间，提交等审核。通过后用“护理者设置”管理请求、排班和收入。", en: "More → Become Caregiver: list your services, area, rates and availability, then submit for review. Once approved, use Caregiver Settings to handle requests, your schedule and earnings." },
    },
    {
      q: { zh: "怎么找需要帮手的活？", en: "Where do I find work?" },
      a: { zh: "底部“工具” → “需要帮手的任务”，可以看家庭发布的需求并报名；被选中后会在收件箱通知你。", en: "More → Tasks Needing Help shows what families have posted; apply there and you'll hear back in your Inbox." },
    },
    {
      q: { zh: "怎么提交一家养老机构？", en: "How do I submit a care facility?" },
      a: { zh: "在“寻找”里切到“养老机构”，点“提交机构”，填名称、地址、联系方式和服务。提交后需要我们审核，通过后才会出现在搜索里。", en: "In Find, switch to Facilities and tap Submit a facility. Fill in the name, address, contact and services. We review it first — it appears in search once approved." },
    },
  ],
  notchsafety: [
    {
      q: { zh: "怎么看到家人现在在哪里？", en: "How do I see where my family is right now?" },
      a: { zh: "打开“地图”，头像就是每个人的位置，下面的名单里写着地址和更新时间。看不到某个人，说明他还没在自己手机上打开位置共享。", en: "Open Map — each avatar is a person, and the list below shows their address and when it updated. If someone is missing, they haven't turned on location sharing on their own phone yet." },
    },
    {
      q: { zh: "怎么把家人加进圈子？", en: "How do I add someone to my circle?" },
      a: { zh: "点底部“圈子”，点“邀请”，输入对方姓名或邮箱。对方在自己的收件箱里接受后，就会出现在地图上。", en: "Tap Circle, then Invite, and enter their name or email. Once they accept from their Inbox, they show up on the map." },
    },
    {
      q: { zh: "怎么设置一个地点提醒（到家/离开）？", en: "How do I get alerts when someone arrives or leaves?" },
      a: { zh: "点“地点” → 添加地点，在地图上选位置、拉大小、起个名字（家、学校、公司），打开到达和离开提醒。之后有人进出，你会在收件箱收到提醒。", en: "Tap Places → Add place, drop it on the map, size the circle and name it (Home, School, Work), then switch on arrive and leave alerts. You'll be notified in Inbox each time." },
    },
    {
      q: { zh: "SOS 按钮是做什么的？", en: "What does the SOS button do?" },
      a: { zh: "地图上的红色 SOS 按钮一按，就把你现在的位置和求助信息发给圈子里的所有人。误按了可以马上取消。它不会自动打给警察或救护车，紧急情况请另外打电话。", en: "One press on the red SOS button on the map sends your current location and a help message to everyone in your circle. Pressed by mistake? Cancel right away. It does not call the police or an ambulance — do that separately in a real emergency." },
    },
    {
      q: { zh: "能看到走过的路线和手机电量吗？", en: "Can I see their route and phone battery?" },
      a: { zh: "可以。在“地图”下面点开一个人，就能看到最近的位置记录、电量、是否在充电和移动方式（走路/开车）。这些要他手机允许后台定位才会持续更新。", en: "Yes. Open a person from the list under Map to see recent location points, battery, whether it's charging, and how they're moving (walking/driving). It keeps updating only if their phone allows background location." },
    },
    {
      q: { zh: "为什么某个人的位置一直是旧的？", en: "Why is someone's location out of date?" },
      a: { zh: "常见原因：他关了位置共享、手机没电、没网络，或系统限制了后台定位。请他打开应用、允许“始终”定位，并关掉省电模式。", en: "Usual reasons: they turned sharing off, the phone is dead or offline, or the system blocked background location. Ask them to open the app, allow location “always”, and switch off battery saver." },
    },
    {
      q: { zh: "我不想被看到位置怎么办？", en: "How do I stop sharing my own location?" },
      a: { zh: "去“我的”里关掉位置共享，圈子里的人就看不到你的实时位置了；随时可以再打开。", en: "Open your own tab and switch location sharing off — your circle stops seeing your live position. Turn it back on whenever you like." },
    },
  ],
};

function guideEntries(family: string | undefined): GuideEntry[] {
  const key = (family === "carecnc" || family === "notchsafety" ? family : "challenged") as
    | "challenged"
    | "carecnc"
    | "notchsafety";
  return [...GUIDE_BY_FAMILY[key], ...GUIDE_SHARED];
}

/** Reply mode: text only / read aloud / live back-and-forth talk. Remembered. */
const READ_ALOUD_KEY = "ai-read-aloud";
const MODE_KEY = "ai-reply-mode";
export type ReplyMode = "text" | "read" | "live";
/**
 * Live mode instruction. Kept here (not in the shared persona prompt) so the
 * few extra words are only paid for while the user is actually talking.
 */
const LIVE_STYLE = {
  zh: "现在是即时语音对话：每次只回 1–2 句短话，像面对面聊天一样自然，不要列清单、不要长段落。对方情绪不好、怀疑东西被偷或想出门时，先安抚，再自然地把话题引到轻松的事情上（老照片、以前的工作、爱吃的饭菜、天气），陪着聊下去。",
  en: "This is a live spoken conversation: reply with 1–2 short sentences at a time, like talking face to face — no lists, no long paragraphs. If they are upset, believe something was stolen, or want to leave, reassure them first and then gently move on to something easy (old photos, their old job, favourite food, the weather) and keep the chat going.",
} as const;
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
}: {
  active: boolean;
  request?: AssistantRequest;
  className?: string;
}) {
  const { i18n } = useTranslation();
  const site = useSite();
  const isZh = i18n.language?.startsWith("zh");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<{ abort: () => void } | null>(null);
  const activeRequestId = useRef<string | undefined>();

  // ─── App guide (fixed answers, no AI call) ───
  const guide = guideEntries(site.family);
  const [guideOpen, setGuideOpen] = useState(true);
  const [guideShowAll, setGuideShowAll] = useState(false);
  const [hideConfirm, setHideConfirm] = useState(false);
  const visibleGuide = guideShowAll ? guide : guide.slice(0, 4);

  const answerFromGuide = (entry: GuideEntry) => {
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
      if (saved === "text" || saved === "read" || saved === "live") return saved;
      return localStorage.getItem(READ_ALOUD_KEY) === "1" ? "read" : "text";
    } catch { return "text"; }
  });
  const readAloud = mode === "read";
  const liveMode = mode === "live";
  const liveRef = useRef(liveMode);
  liveRef.current = liveMode;
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const voiceRef = useRef<StreamControls | null>(null);
  const readAloudRef = useRef(readAloud);
  readAloudRef.current = readAloud;


  const stopSpeaking = () => {
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
  const buildContext = async (question: string): Promise<string | undefined> => {
    // The general floating assistant has no scope of its own: give it the app
    // how-to and care-tip libraries, still retrieved per question.
    const scope = request.contextScope
      ?? (request.contextPrompt ? undefined : { topics: ["app-basics", "care-tips"] as const });
    if (!scope) {
      const liveOnly = liveRef.current ? (isZh ? LIVE_STYLE.zh : LIVE_STYLE.en) : "";
      return [request.contextPrompt, liveOnly].filter(Boolean).join("\n\n") || undefined;
    }
    let resolved = "";
    try {
      resolved = await resolveAssistantContext({
        question,
        isChinese: !!isZh,
        caredOneId: scope.caredOneId,
        groupId: scope.groupId,
        groupName: scope.groupName,
        topics: scope.topics as any,
        sharedCard: scope.sharedCard,
      });
    } catch (e) {
      console.warn("AI context resolution failed, continuing without facts:", e);
    }
    const live = liveRef.current ? (isZh ? LIVE_STYLE.zh : LIVE_STYLE.en) : "";
    return [request.contextPrompt, resolved, live].filter(Boolean).join("\n\n") || undefined;
  };

  useEffect(() => {
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
      setMessages([{ role: "assistant", content: aiGreeting(!!isZh, site.id) }]);
      return;
    }
    setMessages([{ role: "assistant", content: "" }]);
    setLoading(true);
    void buildContext(starter).then((contextPrompt) => {
    const { abort, result } = streamChatTextOnly([{ role: "user", content: starter }], {
      language: isZh ? "zh" : "en",
      contextPrompt,
      onTextDelta: (_delta, full) => setMessages([{ role: "assistant", content: full }]),
      onError: () => setMessages([{ role: "assistant", content: request.starterFallback || aiGreeting(!!isZh, site.id) }]),
    });
    abortRef.current = { abort };
    void result
      .then((full) => { if (readAloudRef.current && full.trim()) speak(full, 0); })
      .catch(() => undefined)
      .finally(() => { setLoading(false); abortRef.current = null; });
    });
  }, [active, request, isZh]);

  useEffect(() => {
    if (!active && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setLoading(false);
    }
  }, [active]);

  const send = async (submittedText?: string) => {
    const text = (submittedText ?? input).trim();
    if (!text || loading) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text }, { role: "assistant", content: "" }];
    setMessages(next);
    setLoading(true);

    try {
      const history = trimMessagesToCharLimit(
        next.slice(0, -1).map((m) => ({ role: m.role, content: m.content }))
      );
      const contextPrompt = await buildContext(text);
      const onDelta = (full: string) =>
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: full };
          return copy;
        });

      let reply = "";
      if (liveRef.current) {
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
        if (readAloudRef.current && reply.trim()) speak(reply, next.length - 1);
      }
      const parsed = parseAIJson<{ done?: boolean; summary?: string; status?: string }>(reply);
      if (parsed?.done && parsed.summary && request.onComplete) {
        const allowed = request.completionStatuses || [];
        if (!parsed.status || allowed.length === 0 || allowed.includes(parsed.status)) {
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: `✅ ${parsed.summary}` };
            return copy;
          });
          await request.onComplete({ status: parsed.status, summary: parsed.summary });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  return (
    <div className={className ?? "flex min-h-0 flex-1 flex-col"}>
      {request.appGuide && guideOpen && (
        <div className="mx-4 mt-3 rounded-2xl border bg-muted/40 p-3">
          <h3 className="text-sm font-semibold text-foreground">
            {isZh ? "你想了解哪一项？" : "What would you like help with?"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {isZh
              ? "点一个问题，或者用自己的话问。下面这些答案直接来自应用本身，点了马上就有。"
              : "Choose a question or ask in your own words. Answers to these come straight from the app — no waiting."}
          </p>
          <div className="mt-3 space-y-2">
            {visibleGuide.map((entry) => (
              <button
                key={entry.q.en}
                type="button"
                onClick={() => answerFromGuide(entry)}
                className="w-full rounded-xl bg-background px-3 py-2.5 text-left text-sm text-foreground shadow-sm transition-colors hover:bg-accent"
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

      <Conversation className="min-h-0">
        <ConversationContent className="gap-4 px-4 py-4">
          {messages.map((m, i) => (
            <div key={`${m.role}-${i}`} className="space-y-1">
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
          ]).map((opt) => {
            const Icon = opt.icon;
            const on = mode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={on}
                onClick={() => changeMode(opt.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${on ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {isZh ? opt.zh : opt.en}
              </button>
            );
          })}
        </div>
        {liveMode && (
          <p className="text-xs text-muted-foreground">
            {isZh ? "按住麦克风说话，松手就会马上回答，一句一句读出来。" : "Hold the microphone and talk — the reply comes back spoken, sentence by sentence."}
          </p>
        )}
        {micError && <p className="text-xs text-destructive">{micError}</p>}
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
        <PromptInput onSubmit={({ text }) => send(text)}>
          <PromptInputBody>
            <PromptInputTextarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={isZh ? "说点什么…" : "Type a message…"} />
          </PromptInputBody>
          <PromptInputFooter className="justify-between">
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
            <PromptInputSubmit status={loading ? "streaming" : "ready"} disabled={loading || !input.trim()} onStop={() => abortRef.current?.abort()} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
