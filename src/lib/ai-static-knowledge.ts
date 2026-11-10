/**
 * ---
 * name: ai-static-knowledge
 * description: >-
 *   Static skill library for app guides, care groups, conversation behavior,
 *   and general care knowledge. Load small entries by skill name and question;
 *   assistant.conversation is required on every chat turn.
 * keywords: [AI assistant, app basics, how to, care group, 群组, 使用方法, care tips, 护理常识, chat, 陪聊]
 * entrypoints: [retrieveStaticKnowledge(), appGuideEntries()]
 * ---
 *
 * Anthropic Agent Skills front matter and progressive-disclosure layout,
 * expressed as an executable TypeScript module so UI help can reuse the entries.
 *
 * Every entry is a small, self-contained snippet with keywords. At request time
 * we score the user's question against the keywords and attach ONLY the few
 * best-matching snippets, never the whole library, so token cost stays flat as
 * the library grows from 20 entries to 2,000.
 *
 * Rules:
 *  - No live care data here (that belongs in ai-dynamic-knowledge.ts).
 *  - No brand names or brand persona here (those live in _shared/ai-prompts.ts).
 *  - Adding knowledge = adding an entry to KNOWLEDGE below. Nothing else changes.
 */

export type KnowledgeTopic = "app-basics" | "care-group" | "care-tips" | "conversation";

export interface KnowledgeEntry {
  id: string;
  topic: KnowledgeTopic;
  /** Lowercase match terms, both languages. */
  keywords: string[];
  title: { zh: string; en: string };
  body: { zh: string; en: string };
}

export type AppGuideEntry = { q: { zh: string; en: string }; a: { zh: string; en: string }; inspectorId?: string };

const APP_GUIDE_SHARED: AppGuideEntry[] = [
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
    q: { zh: "怎么放大字？", en: "How do I make the text bigger?" },
    a: { zh: "可以在“设置”里调整字的大小，也可以使用手机系统里的“显示与字体大小”设置。", en: "You can adjust text size in Settings or use your phone's display and text-size settings." },
  },
  {
    q: { zh: "我的资料和账号在哪里改？", en: "Where do I edit my profile and account?" },
    a: { zh: "点右上角头像 → 设置。里面可以改姓名、联系方式、所在城市、通知方式和隐私选项，改完记得点保存。", en: "Tap your avatar → Settings. There you can change your name, contact details, city, notification choices and privacy options. Remember to save." },
  },
  {
    q: { zh: "AI 助手能帮我做什么？", en: "What can the AI assistant do?" },
    a: { zh: "点右下角的机器人按钮，可以问照护问题、普通聊天、记录用药或签到，也可以请它总结今天的情况。在对话区选择家人的护理小贴士并发送给 AI 后，可以选择让它在后续对话中使用或加入常用栏；文字、朗读、即时对话和模拟来电共用这些选择。常用和正在使用的选择保存在这台设备的浏览器里。它不能代替医生诊断；遇到紧急情况请拨当地急救电话。", en: "Tap the robot button at the bottom right. You can ask about care, chat about anything, log a medicine dose or check-in, or get a summary of the day. Choose and send a family member's care tips, then decide whether to use them in later replies or add them to favorites. The text, read-aloud, live-talk, and simulated-call modes share those choices. Favorites and active choices stay in this browser. It does not diagnose; call emergency services in an emergency." },
  },
  {
    q: { zh: "回复可以读出来吗？", en: "Can the answers be read aloud?" },
    a: { zh: "可以。打开下面的“自动朗读回复”开关，之后每条回复都会读出来；也可以点某条回复下面的“朗读”单独听。", en: "Yes. Turn on “Read replies aloud” below and every reply is spoken; or tap Listen under any single reply." },
  },
];

const APP_GUIDE_BY_APP: Record<"challenged" | "carecnc" | "notchsafety", AppGuideEntry[]> = {
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
      a: { zh: "底部“工具” → 成为护理者。未登录先注册或登录，随后进入护理者设置。填写所在地、保存服务类型和对应价格，再开启公开接单并保存，即可出现在搜索中；不需要另外申请或等待审核。", en: "More → Become Caregiver. Sign up or sign in if needed, then open Caregiver Settings. Complete your location, save service types and corresponding rates, then enable public bookings and save to appear in search. No separate application or approval is required." },
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

export function appGuideEntries(family: string | undefined): AppGuideEntry[] {
  const key = family === "challenged" || family === "carecnc" || family === "notchsafety"
    ? family
    : undefined;
  return [
    ...(key ? APP_GUIDE_BY_APP[key].map((entry, index) => ({
      ...entry,
      inspectorId: `components/ai/AICompanionChat/guide-${key}-${index}`,
    })) : []),
    ...APP_GUIDE_SHARED.map((entry, index) => ({
      ...entry,
      inspectorId: `components/ai/AICompanionChat/guide-shared-${index}`,
    })),
  ];
}


export const KNOWLEDGE: KnowledgeEntry[] = [
  // ── Conversation skill (explicitly loaded on each AI chat turn) ───────────
  {
    id: "assistant.conversation",
    topic: "conversation",
    keywords: [],
    title: { zh: "自然对话与说话对象识别", en: "Natural conversation and speaker awareness" },
    body: {
      zh: "每一轮都根据最新消息默默判断现在是谁在说话；账号身份只作起始线索。区分当前说话者和用户希望你回应的对象。如果照护者说“跟爸爸说”，但无法判断爸爸是否正在听，先用姓名自然问一句；已明确对象或对方直接开口时，就直接称呼并回应，不重复确认。照护者把手机交给被护理者时立即改为直接对他说话，并继续根据每条新消息判断。不要说出身份判断、角色标签或劝导目的。多数时候用户只是想普通聊天、陪伴或开玩笑；任何话题都自然回答，不把闲聊引回护理、安全或定位。对方请你陪聊、讲故事或帮忙劝说时，自然地直接回应；不要测试记忆、强行引导回忆，也不要每句都反问。自然使用已提供的信息，不提小贴士、卡片或资料来源；不编造，缺少可能影响安全的关键信息时请对话者联系家属。模拟来电时沿用已设置的来电者身份，并把电话另一端的人作为对话对象；只在对方确实不明确时才询问。用户直接问技术问题时正常回答，不主动解释应用内部实现。",
      en: "At every turn, silently use the latest message to judge who is speaking; the signed-in role is only an initial clue. Distinguish that speaker from the person they want you to address. If a caregiver says “talk to Dad” but it is unclear whether Dad is listening, ask one natural question using his name; when the listener is already clear or speaks directly, address them without asking again. If a caregiver hands the phone to the person receiving care, switch to speaking directly to them and keep reassessing each new message. Never narrate role labels or announce a persuasion task. Most of the time the user simply wants ordinary conversation, companionship, or playful chat; answer naturally without steering casual chat back to care, safety, or location. When asked to keep someone company, tell a story, or gently persuade someone, do it directly. Do not quiz memory, force reminiscence, or end every turn with a question. Use supplied details without mentioning tips, cards, or data sources. Never invent facts; when a missing detail could affect safety, suggest contacting family. In simulated family-call mode, keep the configured caller persona and address the person on the other end; clarify only if the recipient is genuinely unclear. Answer direct technology questions normally without volunteering app internals.",
    },
  },
  {
    id: "assistant.live-voice",
    topic: "conversation",
    keywords: [],
    title: { zh: "即时语音对话", en: "Live voice conversation" },
    body: {
      zh: "语音回复简短自然，每次一两句，不列清单。跟随对方正在聊的话题；普通闲聊时不要转回护理或安全话题。",
      en: "Keep spoken replies short and natural, one or two sentences at a time, without lists. Follow the topic the person chose; do not steer ordinary chat back to care or safety.",
    },
  },
  {
    id: "assistant.care-tip-execution",
    topic: "conversation",
    keywords: [],
    title: { zh: "护理小贴士的理解与执行", en: "Care-tip understanding and use" },
    body: {
      zh: "先看随附说明：刚发送、等待用户选择的贴士，只确认收到并询问要在后续对话中使用还是加入常用；尚未选择前不要把它们当作持续生效的指令。标记为正在使用的贴士才是当前对话的有效参考。先判断启用内容是资料信息还是行为/说话建议：资料只在相关时用于回答；行为建议、避免事项和对话话术要自然落实到回复里，不要只复述或解释建议。用户明确要求你对某人说话时，先区分当前说话者和目标对象；目标与对方是否在场不清楚时，用已知姓名问一句，明确后直接对他说。若在模拟来电模式，沿用设置好的来电者身份、语气和要说的话，把电话另一端的人作为对话对象执行；不要再问照护者要确认已明确的目标。不要复述小贴士全文，不提小贴士、技能或资料来源。",
      en: "Follow the state stated in the accompanying context: newly sent tips awaiting the user's choice should only be acknowledged, followed by a question asking whether to use them in later replies or add them to favorites; do not treat them as ongoing instructions until enabled. Tips marked as in use are active context for the current chat. Distinguish informational details from behavioral or wording guidance: use facts only when relevant, and carry out enabled advice, avoid items, and suggested wording naturally instead of merely repeating or explaining them. When asked to speak to someone, distinguish the current speaker from the intended listener; if the listener or their presence is unclear, ask one brief question using their known name, then address them directly once clear. In simulated-call mode, keep the configured caller, tone, and script, and treat the person on the other end as the conversation partner; do not ask the caregiver to confirm a target already established by the call setup. Do not repeat the full tip or mention tips, skills, or their source.",
    },
  },

  // ── App basics ────────────────────────────────────────────────────────────
  {
    id: "app.dashboard",
    topic: "app-basics",
    keywords: ["dashboard", "home", "首页", "控制面板", "简报", "briefing"],
    title: { zh: "控制面板", en: "Dashboard" },
    body: {
      zh: "控制面板是登录后的首页，显示今日智能简报、被护理者卡片、待办任务、接下来的预约和未读消息。",
      en: "The dashboard is the home screen after signing in: today's smart briefing, cared-one cards, open tasks, upcoming bookings, and unread messages.",
    },
  },
  {
    id: "app.assistant",
    topic: "app-basics",
    keywords: ["open the assistant", "floating assistant button", "where is the ai assistant", "怎么打开助手", "助手按钮在哪", "悬浮球"],
    title: { zh: "AI 助手", en: "AI assistant" },
    body: {
      zh: "右下角的悬浮球随时可以打开 AI 助手，可以闲聊，也可以询问你有权限查看的护理、用药、签到和位置信息。",
      en: "The floating button in the bottom-right opens the AI assistant anywhere. You can just chat, or ask about care, medicine, check-ins, and location data you are allowed to see.",
    },
  },
  {
    id: "app.medicine",
    topic: "app-basics",
    keywords: ["medicine", "medication", "dose", "pill", "用药", "吃药", "药", "剂量", "提醒"],
    title: { zh: "用药安排", en: "Medicine schedule" },
    body: {
      zh: "在被护理者页面添加药品、剂量、频率和提醒时间；到点后助手会提示确认「已服用」或「跳过」，记录会写入用药日志。",
      en: "Add a medicine, dose, frequency, and reminder times on the cared one's page. At each time the assistant asks you to confirm taken or skipped, and the answer is written to the medicine log.",
    },
  },
  {
    id: "app.checkin",
    topic: "app-basics",
    keywords: ["check-in", "checkin", "visit", "探望", "签到", "问候"],
    title: { zh: "探望签到", en: "Check-ins" },
    body: {
      zh: "探望签到是每日简短问答，助手会问心情、睡眠、食欲、疼痛和今天的特别情况，结束后自动保存一段摘要。",
      en: "A check-in is a short daily conversation. The assistant asks about mood, sleep, appetite, pain, and anything notable, then saves a short summary.",
    },
  },
  {
    id: "app.location",
    topic: "app-basics",
    keywords: ["location", "gps", "zone", "geofence", "位置", "定位", "安全区", "围栏", "在哪"],
    title: { zh: "位置与安全区", en: "Location and safe zones" },
    body: {
      zh: "位置页显示最新位置、历史轨迹和安全区。进出安全区会产生提醒。只有获得位置分享许可的人才能看到。",
      en: "The location page shows the latest position, history, and safe zones. Entering or leaving a zone creates an alert. Only people granted location sharing can see it.",
    },
  },
  {
    id: "app.info-card",
    topic: "app-basics",
    keywords: ["info card", "information card", "care sheet", "信息卡", "照护须知", "卡片", "分享"],
    title: { zh: "信息卡片", en: "Information card" },
    body: {
      zh: "信息卡片是给临时帮忙的邻居、朋友或亲戚看的一页说明：基本情况、这次照护安排、紧急联系人，可生成分享链接。",
      en: "An information card is a one-page brief for a neighbour, friend, or relative helping out: background, this situation, and emergency contacts. It can be shared by link.",
    },
  },
  {
    id: "app.notifications",
    topic: "app-basics",
    keywords: ["notification", "push", "alert", "通知", "推送", "提醒"],
    title: { zh: "通知", en: "Notifications" },
    body: {
      zh: "用药、签到、任务、群组邀请和安全区提醒都会进入通知列表，也可以开启手机推送。",
      en: "Medicine, check-ins, tasks, group invites, and zone alerts all land in the notification list, and you can turn on phone push as well.",
    },
  },

  // ── Care group operations ─────────────────────────────────────────────────
  {
    id: "group.home",
    topic: "care-group",
    keywords: ["group home", "activity", "群组首页", "动态"],
    title: { zh: "群组首页", en: "Group home" },
    body: { zh: "查看群组动态、待办任务数量和最新发布的内容。", en: "See group activity, how many tasks are open, and the newest posts." },
  },
  {
    id: "group.calendar",
    topic: "care-group",
    keywords: ["calendar", "日历", "日程"],
    title: { zh: "日历", en: "Calendar" },
    body: { zh: "按日期查看群组任务的时间安排。", en: "See group tasks laid out by date." },
  },
  {
    id: "group.tasks",
    topic: "care-group",
    keywords: ["task", "assign", "任务", "指派", "待办"],
    title: { zh: "任务", en: "Tasks" },
    body: { zh: "创建任务、指派给成员或子群组、标记完成。", en: "Create tasks, assign them to members or member groups, and mark them done." },
  },
  {
    id: "group.location",
    topic: "care-group",
    keywords: ["group location", "被护理者位置", "群组定位"],
    title: { zh: "被护理者位置", en: "Cared One's Location" },
    body: { zh: "查看群组被护理者的最新位置、区域提醒与位置分享设置。", en: "See the latest location of the group's cared ones, zone alerts, and sharing settings." },
  },
  {
    id: "group.messages",
    topic: "care-group",
    keywords: ["message", "chat", "对话", "聊天"],
    title: { zh: "对话", en: "Messages" },
    body: { zh: "群组内的即时对话，所有成员都能看到。", en: "Real-time group conversation visible to every member." },
  },
  {
    id: "group.announcements",
    topic: "care-group",
    keywords: ["announcement", "pin", "公告", "置顶"],
    title: { zh: "公告", en: "Announcements" },
    body: { zh: "重要通知，可置顶，可限定给特定子群组。", en: "Important notices — can be pinned and limited to specific member groups." },
  },
  {
    id: "group.wishes",
    topic: "care-group",
    keywords: ["well wish", "wishes", "祝福"],
    title: { zh: "祝福", en: "Well Wishes" },
    body: { zh: "给被护理者和家人的鼓励与祝福留言。", en: "Encouraging messages for the cared one and the family." },
  },
  {
    id: "group.gallery",
    topic: "care-group",
    keywords: ["gallery", "photo", "相册", "照片"],
    title: { zh: "相册", en: "Gallery" },
    body: { zh: "群组共享的照片。", en: "Photos shared inside the group." },
  },
  {
    id: "group.cared-ones",
    topic: "care-group",
    keywords: ["group cared one", "群组被护理者", "加入被护理者"],
    title: { zh: "群组被护理者", en: "Group Cared Ones" },
    body: { zh: "把被护理者加入群组，并查看他们的健康资料。", en: "Add cared ones to the group and view their health details." },
  },
  {
    id: "group.members",
    topic: "care-group",
    keywords: ["member", "admin", "owner", "remove", "成员", "管理员", "拥有权", "移除"],
    title: { zh: "成员", en: "Members" },
    body: { zh: "查看成员、设为管理员、标记被护理者、转移拥有权或移除成员。", en: "View members, make admins, mark cared ones, transfer ownership, or remove members." },
  },
  {
    id: "group.invite",
    topic: "care-group",
    keywords: ["invite", "invitation", "code", "link", "邀请", "邀请码", "链接"],
    title: { zh: "邀请成员", en: "Invite Members" },
    body: { zh: "按用户名/邮箱邀请，或创建可分享的邀请链接与邀请码。", en: "Invite by user search or email, or create shareable invite links and codes." },
  },
  {
    id: "group.member-groups",
    topic: "care-group",
    keywords: ["member group", "subgroup", "子群组", "分组"],
    title: { zh: "子群组", en: "Member Groups" },
    body: { zh: "把成员分成「家人」「医疗团队」等子群组，用于限定帖子和任务的可见范围。", en: "Split members into groups like Family or Medical Team to scope posts and tasks." },
  },
  {
    id: "group.settings",
    topic: "care-group",
    keywords: ["setting", "privacy", "rename", "设置", "私密", "改名"],
    title: { zh: "群组设置", en: "Group Setting" },
    body: { zh: "仅拥有者和管理员可见：修改名称、描述、私密性和我的群内显示名。", en: "Owners and admins only: change the name, description, privacy, and your in-group display name." },
  },

  // ── Care tips (non-diagnostic, practical) ─────────────────────────────────
  {
    id: "tips.refuse-food",
    topic: "care-tips",
    keywords: ["refuses to eat", "won't eat", "refusal to eat", "loss of appetite", "拒绝进食", "不肯吃饭", "拒食", "食欲下降"],
    title: { zh: "不肯吃饭", en: "Refusing food" },
    body: {
      zh: "先排除疼痛、假牙不适或便秘等身体原因；把餐食分成小份、少量多次；固定用餐时间和位置，减少环境干扰；可以用手拿的食物往往更容易接受。持续拒食或体重下降要联系医生。",
      en: "First rule out pain, ill-fitting dentures, or constipation. Offer small portions more often, keep meal times and seating consistent, reduce noise and clutter, and try finger foods. Contact a clinician if refusal persists or weight drops.",
    },
  },
  {
    id: "tips.agitation",
    topic: "care-tips",
    keywords: ["agitation", "aggressive behavior", "sundowning", "躁动", "情绪激动", "黄昏躁动", "攻击行为"],
    title: { zh: "情绪激动或黄昏躁动", en: "Agitation and sundowning" },
    body: {
      zh: "不要争辩或纠正事实，先安抚情绪；降低光线和噪音；转移到熟悉、安静的环境；用简短句子和缓慢语速说话；找出触发因素（饥饿、口渴、如厕、疲劳、疼痛）。有伤人风险时先保证安全并求助。",
      en: "Do not argue or correct facts — settle the emotion first. Lower light and noise, move to a familiar quiet space, speak in short slow sentences, and look for triggers (hunger, thirst, toileting, fatigue, pain). If anyone is at risk of harm, secure safety and get help.",
    },
  },
  {
    id: "tips.communication",
    topic: "care-tips",
    keywords: ["how should I talk to her", "how should I talk to him", "communication difficulties", "how to communicate with someone with dementia", "怎么和她说", "怎么和他沟通", "与失智症患者沟通", "沟通技巧"],
    title: { zh: "怎样说话更顺畅", en: "Communicating well" },
    body: {
      zh: "一次说一件事，用短句和是/否问题；先叫名字并保持眼神接触；给出充足反应时间；用手势和示范代替解释；避免测试记忆（不要问「你还记得我是谁吗」）。",
      en: "One idea at a time, short sentences, yes/no questions. Use their name, keep eye contact, allow long pauses, show rather than explain, and avoid testing memory (never ask “do you remember who I am?”).",
    },
  },
  {
    id: "tips.wandering",
    topic: "care-tips",
    keywords: ["wandering off", "went missing", "got lost", "person is missing", "走失", "走丢", "离家走失", "反复走出家门"],
    title: { zh: "走失风险", en: "Wandering" },
    body: {
      zh: "在门口贴提示、加装门铃或传感器；随身放写有联系人的卡片；白天安排规律的散步和活动以减少徘徊；设置安全区提醒。走失时立即联系当地警方并提供近照。",
      en: "Add door chimes or sensors, keep an ID card with contact details on them, plan regular daytime walks to reduce restlessness, and set up safe-zone alerts. If someone goes missing, contact local police immediately with a recent photo.",
    },
  },
  {
    id: "tips.night",
    topic: "care-tips",
    keywords: ["nighttime wandering", "night agitation", "can't sleep at night", "insomnia", "夜里睡不着", "夜间躁动", "夜间反复起床", "失眠"],
    title: { zh: "夜间睡不好", en: "Poor sleep at night" },
    body: {
      zh: "白天多接触自然光并适度活动；限制午睡时长；傍晚后避免咖啡、浓茶和大量液体；睡前流程固定；夜灯照亮到卫生间的路线。突然明显变差要排查疼痛、感染或用药影响。",
      en: "Get daylight and activity during the day, cap naps, avoid caffeine and large drinks in the evening, keep a fixed bedtime routine, and light the path to the toilet. A sudden change warrants checking for pain, infection, or medication effects.",
    },
  },
  {
    id: "tips.theft-belief",
    topic: "care-tips",
    keywords: ["believes someone stole their things", "accuses someone of stealing", "false theft accusation", "被护理者认为有人偷", "总说东西被偷", "怀疑家人偷东西", "钱不见了并认为被偷"],
    title: { zh: "怀疑东西被偷", en: "Believing something was stolen" },
    body: {
      zh: "不要否认或讲道理，先接住感受：“找不到确实很着急，我陪你一起找。”陪对方一起查看平时会放东西的地方，不要断定物品一定是被收起或忘记了；找到后也不必强调是谁记错了。若对方愿意，可以一起做件熟悉的小事。情况反复且令对方困扰时告诉家属。",
      en: "Do not deny or argue — acknowledge the feeling first (\"that's upsetting; let's look together\"). Help check familiar places without assuming the item was put away or forgotten, and avoid arguing about who remembers correctly. If the person is willing, move naturally to a familiar activity. Tell the family if this keeps happening and causes distress.",
    },
  },
  {
    id: "tips.wants-to-go-home",
    topic: "care-tips",
    keywords: ["person keeps saying they want to go home", "cared one wants to leave", "won't go home", "repeatedly asks to go home", "被护理者想回家", "反复说要回家", "不肯回家", "被护理者想出门"],
    title: { zh: "想出门或不肯回家", en: "Wanting to leave, or refusing to go home" },
    body: {
      zh: "“想回家”往往表达的是不安或想找熟悉的人，不是地址。先接住情绪：“想家了是吧，跟我说说家里什么样。”再给一件当下的事做过渡（喝水、吃点东西、一起走一段、看老照片）；不要说“这里就是你家”或直接拦住。天黑前后更常见，提前安排活动会减少。反复要出门有走失风险时告知家属并开启安全区提醒。",
      en: "\"I want to go home\" usually means unease or missing a familiar person, not an address. Meet the feeling first (\"tell me about home\"), then bridge into something concrete — a drink, a snack, a short walk together, old photos. Don't say \"this is your home\" or physically block them. It peaks around dusk, so plan activity earlier. If they repeatedly try to leave, tell the family and turn on safe-zone alerts.",
    },
  },
  {
    id: "tips.companionship",
    topic: "care-tips",
    keywords: ["tell them a story", "tell me a story", "keep her company", "keep him company", "help me keep someone company", "lonely person receiving care", "陪她聊天", "陪他聊天", "陪被护理者聊天", "给她讲个故事", "给他讲个故事", "让你陪陪她", "让你陪陪他"],
    title: { zh: "陪聊、讲故事与回忆往事", en: "Chatting, stories, and reminiscing" },
    body: {
      zh: "对方想聊天时像普通朋友一样自然聊当下的话题；对方请讲故事时直接讲一个短小、温和、完整的故事。不要把谈话变成记忆测验，不强迫回忆往事，也不用每句话都提问。",
      en: "When someone wants to chat, talk naturally like a friend about the topic they chose. If asked for a story, tell a short, gentle story with a clear ending. Do not turn the conversation into a memory test, force reminiscence, or ask a question after every sentence.",
    },
  },
  {
    id: "tips.restlessness",
    topic: "care-tips",
    keywords: ["pacing", "repeatedly gets up", "can't stay seated", "repeatedly walks around", "反复起身走动", "来回踱步", "总是坐不住", "劝不住她走动", "劝不住他走动"],
    title: { zh: "坐不住、反复起身走动", en: "Restlessness and pacing" },
    body: {
      zh: "先排除需要：如厕、口渴、饿、疼、太热或太吵。不要反复命令“坐下”，改成邀请：“陪我一起叠这些毛巾好吗”“我们走到窗边看看”。给手上有事做（折毛巾、择菜、摸熟悉的物件），并把走动路线上的障碍和地毯清掉，防止跌倒。突然明显加重要考虑疼痛、感染或用药影响。",
      en: "Rule out needs first: toilet, thirst, hunger, pain, heat, noise. Instead of repeating \"sit down\", invite them — \"help me fold these towels\", \"let's look out the window\". Give their hands something to do and clear obstacles and loose rugs along their walking route to prevent falls. A sudden increase warrants checking pain, infection, or medication.",
    },
  },
  {
    id: "tips.caregiver-burnout",
    topic: "care-tips",
    keywords: ["caregiver burnout", "caregiver stress", "caregiver feels overwhelmed", "照护者压力", "照护者快撑不住", "照顾者身心疲惫", "照护喘息服务"],
    title: { zh: "照护者自身的压力", en: "Caregiver strain" },
    body: {
      zh: "把任务分给群组成员，安排固定的休息时段；使用喘息服务或日间照护；记录自己的睡眠和情绪变化；持续低落、失眠或易怒时寻求专业支持。",
      en: "Share tasks with your care group and schedule real breaks, use respite or day care, watch your own sleep and mood, and seek professional support if low mood, insomnia, or irritability persists.",
    },
  },
];

function normalize(s: string): string {
  return (s || "").toLowerCase();
}

function scoreEntry(entry: KnowledgeEntry, q: string): number {
  const hay = normalize(q);
  let score = 0;
  for (const kw of entry.keywords) {
    if (!kw) continue;
    if (hay.includes(normalize(kw))) score += kw.length > 3 ? 2 : 1;
  }
  if (hay.includes(normalize(entry.title.zh)) || hay.includes(normalize(entry.title.en))) score += 3;
  return score;
}

export interface RetrieveOptions {
  topics?: KnowledgeTopic[] | undefined;
  /** Exact skill names to load even when their question keywords do not match. */
  skillNames?: string[] | undefined;
  /** Current UI app family for app-specific help answers. */
  appFamily?: string | undefined;
  isChinese?: boolean | undefined;
  /** How many snippets to attach. */
  limit?: number | undefined;
  /** Hard cap on attached characters. */
  maxChars?: number | undefined;
  /** When nothing matches, attach a titles-only index so the AI can offer choices. */
  fallbackToIndex?: boolean | undefined;
}

/**
 * On-demand retrieval: returns request text containing only the snippets that
 * match the question. Empty string when nothing is relevant.
 */
export function retrieveStaticKnowledge(question: string, options: RetrieveOptions = {}): string {
  const { topics, skillNames = [], appFamily, isChinese = false, limit = 4, maxChars = 1800, fallbackToIndex = true } = options;
  const pool = topics?.length ? KNOWLEDGE.filter((k) => topics.includes(k.topic)) : KNOWLEDGE;
  const appGuide = topics?.includes("app-basics")
    ? appGuideEntries(appFamily).map((entry, index): KnowledgeEntry => ({
        id: `app.faq.${index}`,
        topic: "app-basics",
        keywords: [entry.q.zh, entry.q.en],
        title: entry.q,
        body: entry.a,
      }))
    : [];
  const required = KNOWLEDGE.filter((entry) => skillNames.includes(entry.id));
  const searchable = [...pool, ...appGuide].filter((entry) => !skillNames.includes(entry.id));

  const ranked = searchable
    .map((e) => ({ e, score: scoreEntry(e, question) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  const selected = [...required, ...ranked.map(({ e }) => e)];

  const header = isChinese
    ? "以下是按当前问题选取的少量参考内容；只在相关时使用，不要把它当成个人记录，也不要编造应用功能。"
    : "These are a few references selected for this question. Use them only when relevant; they are not personal records, and do not invent app features.";

  if (selected.length === 0) {
    if (!fallbackToIndex) return "";
    const titles = [...pool, ...appGuide].map((e) => (isChinese ? e.title.zh : e.title.en)).join("、");
    return `${header}\n\n${isChinese ? "可查询的主题" : "Topics available"}: ${titles}`;
  }

  let body = "";
  for (const e of selected) {
    const chunk = `## ${isChinese ? e.title.zh : e.title.en}\n${isChinese ? e.body.zh : e.body.en}\n`;
    if (body.length + chunk.length > maxChars) break;
    body += chunk;
  }

  return `${header}\n\n${body.trim()}`;
}

/** Titles-only index of a topic, for a page that wants to show what AI can answer. */
export function staticKnowledgeIndex(topics?: KnowledgeTopic[] | undefined, isChinese = false): string[] {
  const pool = topics?.length ? KNOWLEDGE.filter((k) => topics.includes(k.topic)) : KNOWLEDGE;
  return pool.map((e) => (isChinese ? e.title.zh : e.title.en));
}
