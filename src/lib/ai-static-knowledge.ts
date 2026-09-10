/**
 * ---
 * name: care-static-knowledge
 * description: >-
 *   Static skill library for ChallengeD / CareCNC / NotchSafety. Use when the
 *   user asks how the app works, how to use a care group, or for general care,
 *   companionship, or dementia know-how that does not depend on their own data.
 *   Retrieval is per entry: only the best-matching snippets are attached.
 * keywords: [app basics, how to, care group, 群组, 使用方法, care tips, 护理常识, dementia, 失智症]
 * entrypoint: retrieveStaticKnowledge()
 * ---
 *
 * Anthropic Agent Skills layout, expressed as an executable TypeScript module so
 * non-AI code (UI help pages) can import the same entries directly.
 *
 * Every entry is a small, self-contained snippet with keywords. At request time
 * we score the user's question against the keywords and attach ONLY the few
 * best-matching snippets, never the whole library, so token cost stays flat as
 * the library grows from 20 entries to 2,000.
 *
 * Rules:
 *  - No live care data here (that belongs in ai-dynamic-knowledge.ts).
 *  - No persona or tone rules here (those live in _shared/ai-prompts.ts).
 *  - Adding knowledge = adding an entry to KNOWLEDGE below. Nothing else changes.
 */

export type KnowledgeTopic = "app-basics" | "care-group" | "care-tips";

export interface KnowledgeEntry {
  id: string;
  topic: KnowledgeTopic;
  /** Lowercase match terms, both languages. */
  keywords: string[];
  title: { zh: string; en: string };
  body: { zh: string; en: string };
}

export const KNOWLEDGE: KnowledgeEntry[] = [
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
    keywords: ["assistant", "ai", "chat", "助手", "对话", "悬浮球", "聊天"],
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
    keywords: ["refuse", "eat", "food", "appetite", "不吃", "拒食", "吃饭", "食欲"],
    title: { zh: "不肯吃饭", en: "Refusing food" },
    body: {
      zh: "先排除疼痛、假牙不适或便秘等身体原因；把餐食分成小份、少量多次；固定用餐时间和位置，减少环境干扰；可以用手拿的食物往往更容易接受。持续拒食或体重下降要联系医生。",
      en: "First rule out pain, ill-fitting dentures, or constipation. Offer small portions more often, keep meal times and seating consistent, reduce noise and clutter, and try finger foods. Contact a clinician if refusal persists or weight drops.",
    },
  },
  {
    id: "tips.agitation",
    topic: "care-tips",
    keywords: ["agitation", "angry", "aggressive", "sundown", "激动", "生气", "攻击", "黄昏"],
    title: { zh: "情绪激动或黄昏躁动", en: "Agitation and sundowning" },
    body: {
      zh: "不要争辩或纠正事实，先安抚情绪；降低光线和噪音；转移到熟悉、安静的环境；用简短句子和缓慢语速说话；找出触发因素（饥饿、口渴、如厕、疲劳、疼痛）。有伤人风险时先保证安全并求助。",
      en: "Do not argue or correct facts — settle the emotion first. Lower light and noise, move to a familiar quiet space, speak in short slow sentences, and look for triggers (hunger, thirst, toileting, fatigue, pain). If anyone is at risk of harm, secure safety and get help.",
    },
  },
  {
    id: "tips.communication",
    topic: "care-tips",
    keywords: ["talk", "communicate", "说话", "沟通", "怎么说"],
    title: { zh: "怎样说话更顺畅", en: "Communicating well" },
    body: {
      zh: "一次说一件事，用短句和是/否问题；先叫名字并保持眼神接触；给出充足反应时间；用手势和示范代替解释；避免测试记忆（不要问「你还记得我是谁吗」）。",
      en: "One idea at a time, short sentences, yes/no questions. Use their name, keep eye contact, allow long pauses, show rather than explain, and avoid testing memory (never ask “do you remember who I am?”).",
    },
  },
  {
    id: "tips.wandering",
    topic: "care-tips",
    keywords: ["wander", "lost", "走失", "走丢", "乱走", "外出"],
    title: { zh: "走失风险", en: "Wandering" },
    body: {
      zh: "在门口贴提示、加装门铃或传感器；随身放写有联系人的卡片；白天安排规律的散步和活动以减少徘徊；设置安全区提醒。走失时立即联系当地警方并提供近照。",
      en: "Add door chimes or sensors, keep an ID card with contact details on them, plan regular daytime walks to reduce restlessness, and set up safe-zone alerts. If someone goes missing, contact local police immediately with a recent photo.",
    },
  },
  {
    id: "tips.night",
    topic: "care-tips",
    keywords: ["sleep", "night", "insomnia", "睡眠", "夜间", "失眠", "起夜"],
    title: { zh: "夜间睡不好", en: "Poor sleep at night" },
    body: {
      zh: "白天多接触自然光并适度活动；限制午睡时长；傍晚后避免咖啡、浓茶和大量液体；睡前流程固定；夜灯照亮到卫生间的路线。突然明显变差要排查疼痛、感染或用药影响。",
      en: "Get daylight and activity during the day, cap naps, avoid caffeine and large drinks in the evening, keep a fixed bedtime routine, and light the path to the toilet. A sudden change warrants checking for pain, infection, or medication effects.",
    },
  },
  {
    id: "tips.theft-belief",
    topic: "care-tips",
    keywords: ["steal", "stolen", "theft", "accuse", "missing money", "偷", "被偷", "拿走", "怀疑", "丢了", "钱不见"],
    title: { zh: "怀疑东西被偷", en: "Believing something was stolen" },
    body: {
      zh: "不要否认或讲道理，先认同感受：“找不到确实很着急，我陪你一起找。”常见的是自己收起来忘了，先看熟悉的藏东西的位置；找到后不要强调是他记错了；可以准备备用的钱包、钥匙。若要转移话题，接着聊他喜欢的事或一起做点小事。反复而强烈时告诉家属，必要时看医生。",
      en: "Do not deny or argue — validate the feeling first (\"that's upsetting, let's look together\"). Items are usually put away and forgotten, so check their usual hiding places, and don't point out that they misremembered. Keep spare wallets or keys. To move on, shift to a topic or small activity they enjoy. Tell the family if it is frequent or intense.",
    },
  },
  {
    id: "tips.wants-to-go-home",
    topic: "care-tips",
    keywords: ["go home", "want to leave", "won't go home", "回家", "想出门", "不肯回家", "要走", "出去"],
    title: { zh: "想出门或不肯回家", en: "Wanting to leave, or refusing to go home" },
    body: {
      zh: "“想回家”往往表达的是不安或想找熟悉的人，不是地址。先接住情绪：“想家了是吧，跟我说说家里什么样。”再给一件当下的事做过渡（喝水、吃点东西、一起走一段、看老照片）；不要说“这里就是你家”或直接拦住。天黑前后更常见，提前安排活动会减少。反复要出门有走失风险时告知家属并开启安全区提醒。",
      en: "\"I want to go home\" usually means unease or missing a familiar person, not an address. Meet the feeling first (\"tell me about home\"), then bridge into something concrete — a drink, a snack, a short walk together, old photos. Don't say \"this is your home\" or physically block them. It peaks around dusk, so plan activity earlier. If they repeatedly try to leave, tell the family and turn on safe-zone alerts.",
    },
  },
  {
    id: "tips.companionship",
    topic: "care-tips",
    keywords: ["chat", "story", "lonely", "reminisce", "accompany", "陪", "聊天", "讲故事", "孤单", "回忆", "无聊"],
    title: { zh: "陪聊、讲故事与回忆往事", en: "Chatting, stories, and reminiscing" },
    body: {
      zh: "从久远、愉快的记忆入手（老家、年轻时的工作、孩子小时候、爱吃的菜、老歌）；用开放但简单的问题，允许长时间停顿，不纠正细节、不测试记忆。可以讲短小、温和、结局明确的故事，一次两三分钟；配合老照片、老歌效果更好。对方情绪低落时先陪着，不急于转移。",
      en: "Start from old, happy memories — hometown, early work, the children as babies, favourite food, old songs. Ask simple open questions, allow long pauses, never correct details or test memory. Short, gentle stories with a clear ending work well, two or three minutes at a time, and old photos or music help. If they are low, stay with the feeling before changing the subject.",
    },
  },
  {
    id: "tips.restlessness",
    topic: "care-tips",
    keywords: ["restless", "won't sit", "pacing", "keeps getting up", "坐不住", "走动", "来回", "起来", "不听劝"],
    title: { zh: "坐不住、反复起身走动", en: "Restlessness and pacing" },
    body: {
      zh: "先排除需要：如厕、口渴、饿、疼、太热或太吵。不要反复命令“坐下”，改成邀请：“陪我一起叠这些毛巾好吗”“我们走到窗边看看”。给手上有事做（折毛巾、择菜、摸熟悉的物件），并把走动路线上的障碍和地毯清掉，防止跌倒。突然明显加重要考虑疼痛、感染或用药影响。",
      en: "Rule out needs first: toilet, thirst, hunger, pain, heat, noise. Instead of repeating \"sit down\", invite them — \"help me fold these towels\", \"let's look out the window\". Give their hands something to do and clear obstacles and loose rugs along their walking route to prevent falls. A sudden increase warrants checking pain, infection, or medication.",
    },
  },
  {
    id: "tips.caregiver-burnout",
    topic: "care-tips",
    keywords: ["burnout", "stress", "tired", "累", "压力", "崩溃", "喘息"],
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
  topics?: KnowledgeTopic[];
  isChinese?: boolean;
  /** How many snippets to attach. */
  limit?: number;
  /** Hard cap on attached characters. */
  maxChars?: number;
  /** When nothing matches, attach a titles-only index so the AI can offer choices. */
  fallbackToIndex?: boolean;
}

/**
 * On-demand retrieval: returns request text containing only the snippets that
 * match the question. Empty string when nothing is relevant.
 */
export function retrieveStaticKnowledge(question: string, options: RetrieveOptions = {}): string {
  const { topics, isChinese = false, limit = 4, maxChars = 1800, fallbackToIndex = true } = options;
  const pool = topics?.length ? KNOWLEDGE.filter((k) => topics.includes(k.topic)) : KNOWLEDGE;

  const ranked = pool
    .map((e) => ({ e, score: scoreEntry(e, question) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const header = isChinese
    ? "以下是本应用的参考资料。回答操作类问题时优先使用这些内容；资料里没有的就直接说明，不要编造功能。这些是一般性护理经验，不是医疗诊断。"
    : "The reference material below comes from this app's own knowledge base. Prefer it for how-to questions, say plainly when something is not covered, and never invent features. These are general care practices, not medical diagnosis.";

  if (ranked.length === 0) {
    if (!fallbackToIndex) return "";
    const titles = pool.map((e) => (isChinese ? e.title.zh : e.title.en)).join("、");
    return `${header}\n\n${isChinese ? "可查询的主题" : "Topics available"}: ${titles}`;
  }

  let body = "";
  for (const { e } of ranked) {
    const chunk = `## ${isChinese ? e.title.zh : e.title.en}\n${isChinese ? e.body.zh : e.body.en}\n`;
    if (body.length + chunk.length > maxChars) break;
    body += chunk;
  }

  return `${header}\n\n${body.trim()}`;
}

/** Titles-only index of a topic, for a page that wants to show what AI can answer. */
export function staticKnowledgeIndex(topics?: KnowledgeTopic[], isChinese = false): string[] {
  const pool = topics?.length ? KNOWLEDGE.filter((k) => topics.includes(k.topic)) : KNOWLEDGE;
  return pool.map((e) => (isChinese ? e.title.zh : e.title.en));
}
