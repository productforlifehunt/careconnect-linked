/**
 * WHO iSupport for Dementia — Module Structure (Comprehensive Edition)
 * Source: WHO iSupport for Dementia manual + companion materials
 *         (Alzheimer's Association iSupport US adaptation)
 *
 * 5 official modules → 30 lessons covering the full handbook plus end-of-life
 * care guidance recommended by leading dementia-care apps (Caring Village,
 * Alzheimer's Daily Companion, MindMate).
 *
 * Each lesson maps to:
 *   - A short summary (in-app reading, ~50–80 words, plain language)
 *   - Practical "key actions" the carer can take today
 *   - Optional links to challenged_content articles (deep dives)
 *   - Optional links to interactive tools we already ship
 *
 * This is the SINGLE SOURCE OF TRUTH for the Resources hub.
 * Articles in the challenged_content CCT are tagged via `subcategory`
 * matching `lesson.contentSubcategory` so they auto-surface here.
 */

import {
  BookOpen,
  Heart,
  HandHeart,
  Brain,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface ISupportLesson {
  key: string;
  title: string;
  titleZh: string;
  summary: string;
  summaryZh: string;
  /** 3–5 short, actionable bullets the carer can do today */
  keyActions?: string[];
  keyActionsZh?: string[];
  /** Estimated read time, minutes */
  readMinutes?: number;
  /** Maps to challenged_content.subcategory for deep-dive articles */
  contentCategory?: string;
  contentSubcategory?: string;
  /** Optional CTA into an in-app tool */
  toolPath?: string;
  toolLabel?: string;
  toolLabelZh?: string;
}

export interface ISupportModule {
  key: string;
  number: number;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  icon: LucideIcon;
  /** Tailwind gradient classes */
  accent: string;
  lessons: ISupportLesson[];
}

export const ISUPPORT_MODULES: ISupportModule[] = [
  // ─── MODULE 1 ───────────────────────────────────────────────
  {
    key: "introduction",
    number: 1,
    title: "Introduction to Dementia",
    titleZh: "认识失智症",
    description:
      "What dementia is, common types, how it progresses, and what to expect.",
    descriptionZh: "什么是失智症、常见类型、病程发展，以及您将面对的情况。",
    icon: BookOpen,
    accent: "from-amber-500 to-orange-600",
    lessons: [
      {
        key: "what-is-dementia",
        title: "What is dementia?",
        titleZh: "什么是失智症？",
        readMinutes: 4,
        summary:
          "Dementia is a syndrome — not one disease — caused by changes in the brain that affect memory, thinking, behaviour and the ability to perform everyday activities.",
        summaryZh:
          "失智症是一种综合症（不是单一疾病），由大脑变化引起，影响记忆、思维、行为以及日常活动能力。",
        keyActions: [
          "Learn the difference between normal ageing and dementia.",
          "Write down changes you notice — date them.",
          "Share notes with the doctor at the next visit.",
        ],
        keyActionsZh: [
          "了解正常老化与失智症的区别。",
          "把您观察到的变化写下来，记上日期。",
          "下次就诊时与医生分享笔记。",
        ],
        contentCategory: "aware",
        contentSubcategory: "understanding",
      },
      {
        key: "types-and-causes",
        title: "Types & causes",
        titleZh: "类型与病因",
        readMinutes: 4,
        summary:
          "Alzheimer's disease, vascular dementia, Lewy body dementia, frontotemporal dementia and mixed dementia each progress differently. Knowing the type guides care decisions.",
        summaryZh:
          "阿尔茨海默病、血管性失智症、路易体失智症、额颞叶失智症和混合型失智症，发展方式各不相同。了解类型有助于护理决策。",
        contentCategory: "aware",
        contentSubcategory: "types",
      },
      {
        key: "signs-and-symptoms",
        title: "Signs & symptoms",
        titleZh: "征兆与症状",
        readMinutes: 3,
        summary:
          "Memory loss, language problems, disorientation, mood changes and difficulty with familiar tasks are common early signs. Acting early gives you more options.",
        summaryZh:
          "记忆力减退、语言障碍、定向力丧失、情绪变化和无法完成熟悉的任务是常见的早期征兆。及早行动能让您有更多选择。",
        contentCategory: "aware",
        contentSubcategory: "signs",
      },
      {
        key: "stages",
        title: "Stages of dementia",
        titleZh: "失智症的发展阶段",
        readMinutes: 5,
        summary:
          "Early, middle and late stages each bring different needs. Knowing the stage helps you plan care, adjust expectations and prepare the home.",
        summaryZh:
          "早期、中期和晚期各有不同需求。了解所处阶段有助于规划护理、调整预期并准备居家环境。",
        keyActions: [
          "Open your loved one's profile and set the current stage.",
          "Re-check the stage every 3 months.",
          "Adjust home, routines and tasks to match.",
        ],
        keyActionsZh: [
          "打开亲人档案并设定当前阶段。",
          "每 3 个月重新评估阶段。",
          "调整居家、规律和任务来匹配。",
        ],
        contentCategory: "aware",
        contentSubcategory: "stages",
        toolPath: "/cared-ones",
        toolLabel: "Set stage in profile",
        toolLabelZh: "在档案中设定阶段",
      },
      {
        key: "diagnosis",
        title: "Getting a diagnosis",
        titleZh: "获得诊断",
        readMinutes: 4,
        summary:
          "Early diagnosis means earlier access to treatments, support, and time to plan. A GP referral is usually the first step, followed by a memory clinic or neurologist.",
        summaryZh:
          "早期诊断意味着更早获得治疗、支持，以及规划时间。通常第一步是请家庭医生转诊，再到记忆门诊或神经科就诊。",
        contentCategory: "aware",
        contentSubcategory: "diagnosis",
      },
    ],
  },

  // ─── MODULE 2 ───────────────────────────────────────────────
  {
    key: "being-a-carer",
    number: 2,
    title: "Being a Carer",
    titleZh: "成为护理者",
    description:
      "Adjusting to your role, building the relationship, and finding support.",
    descriptionZh: "适应您的角色、建立关系，以及寻找支持。",
    icon: HandHeart,
    accent: "from-rose-500 to-pink-600",
    lessons: [
      {
        key: "your-role",
        title: "Understanding your role",
        titleZh: "了解您的角色",
        readMinutes: 4,
        summary:
          "Caring is rewarding but demanding. Recognising what is — and isn't — your responsibility protects you from burnout and helps your loved one keep their independence.",
        summaryZh:
          "护理工作充满意义但也十分艰辛。认清哪些是、哪些不是您的责任，能避免身心疲惫，也让亲人保有独立。",
        contentCategory: "care",
        contentSubcategory: "carer-role",
      },
      {
        key: "communication",
        title: "Communicating with the person",
        titleZh: "与失智者沟通",
        readMinutes: 5,
        summary:
          "Use short sentences, gentle tone, eye contact. Don't argue or correct — redirect and reassure. Their feelings are real even if the facts aren't.",
        summaryZh:
          "使用短句、温和的语气、保持眼神接触。不要争辩或纠正——转移话题并给予安慰。即使事实不符，他们的感受是真实的。",
        keyActions: [
          "Speak slowly. Pause. Wait 10 seconds for a reply.",
          "Use the person's name. Avoid 'remember when…'.",
          "Match their mood with your face and voice.",
        ],
        keyActionsZh: [
          "慢慢说，停顿，等候 10 秒让对方回应。",
          "称呼他们的名字。避免「还记得……吗」。",
          "用表情和语气配合他们的情绪。",
        ],
        contentCategory: "care",
        contentSubcategory: "communication",
      },
      {
        key: "strengthening-relationship",
        title: "Strengthening your relationship",
        titleZh: "深化你们的关系",
        readMinutes: 4,
        summary:
          "Dementia changes how you connect, but love stays. Look at old photos together, hold hands, share music. Small moments of presence matter more than long conversations.",
        summaryZh:
          "失智症改变沟通方式，但爱依然存在。一起看老照片、握手、共享音乐。短暂的陪伴比长篇对话更珍贵。",
        contentCategory: "care",
        contentSubcategory: "relationship",
      },
      {
        key: "building-team",
        title: "Building your care team",
        titleZh: "建立您的护理团队",
        readMinutes: 3,
        summary:
          "You don't have to do this alone. Family, friends, professionals and community resources can share the load. Assign clear roles to avoid overlap.",
        summaryZh:
          "您无需独自承担。家人、朋友、专业人士和社区资源都能分担压力。明确分工，避免重复。",
        toolPath: "/care-circle",
        toolLabel: "Open Care Team",
        toolLabelZh: "打开护理团队",
      },
      {
        key: "legal-financial",
        title: "Legal & financial planning",
        titleZh: "法律与财务规划",
        readMinutes: 5,
        summary:
          "Discuss power of attorney, advance directives and finances early — while the person can still participate. Decisions made together hold more meaning.",
        summaryZh:
          "趁失智者仍能参与决策时，尽早讨论委托书、预立医疗指示和财务安排。共同做出的决定更有意义。",
        contentCategory: "care",
        contentSubcategory: "legal",
      },
    ],
  },

  // ─── MODULE 3 ───────────────────────────────────────────────
  {
    key: "everyday-care",
    number: 3,
    title: "Providing Everyday Care",
    titleZh: "日常照护",
    description:
      "Practical help with daily tasks, routines, eating, hygiene and medication.",
    descriptionZh: "日常任务、生活规律、进食、卫生和用药的实用照护方法。",
    icon: Heart,
    accent: "from-emerald-500 to-teal-600",
    lessons: [
      {
        key: "daily-routine",
        title: "Building a daily routine",
        titleZh: "建立每日规律",
        readMinutes: 4,
        summary:
          "Predictable routines reduce confusion and anxiety. Anchor the day around meals, rest and one meaningful activity. Mornings are usually best for harder tasks.",
        summaryZh:
          "规律的日常能减少困惑和焦虑。以三餐、休息和一项有意义的活动为一天的支柱。较难的任务通常上午最适合。",
        toolPath: "/calendar",
        toolLabel: "Plan in Calendar",
        toolLabelZh: "在日历中规划",
      },
      {
        key: "personal-care",
        title: "Bathing, dressing & hygiene",
        titleZh: "沐浴、穿衣与卫生",
        readMinutes: 5,
        summary:
          "Offer choice, preserve dignity, simplify steps. Lay out clothes in order; warm the bathroom first; use a hand-held shower. Sing or play familiar music.",
        summaryZh:
          "提供选择、维护尊严、简化步骤。按顺序摆放衣物；先把浴室预热好；使用手持花洒。哼唱或播放熟悉的音乐。",
        contentCategory: "care",
        contentSubcategory: "personal-care",
      },
      {
        key: "eating-nutrition",
        title: "Eating & nutrition",
        titleZh: "饮食与营养",
        readMinutes: 4,
        summary:
          "Small frequent meals, finger foods, contrasting plate colours. Watch for swallowing changes in later stages. Keep a water bottle within reach all day.",
        summaryZh:
          "少量多餐、手指食物、餐盘颜色对比鲜明。晚期需留意吞咽功能变化。一整天都让水瓶就近可拿。",
        contentCategory: "care",
        contentSubcategory: "nutrition",
      },
      {
        key: "medication",
        title: "Managing medication",
        titleZh: "药物管理",
        readMinutes: 4,
        summary:
          "Use a pill organiser, set alarms, keep one master list. Review meds with the doctor every 6 months — many people take more than they need.",
        summaryZh:
          "使用分药盒、设定提醒、保留一份主用药清单。每 6 个月与医生检视一次药物——许多人服用的药比真正需要的多。",
        toolPath: "/cared-ones",
        toolLabel: "Open Medications",
        toolLabelZh: "打开用药管理",
      },
      {
        key: "continence",
        title: "Toileting & continence",
        titleZh: "如厕与失禁照护",
        readMinutes: 4,
        summary:
          "Mark the bathroom door clearly, leave the light on at night, schedule regular toilet visits every 2 hours. Treat accidents as normal — never shame.",
        summaryZh:
          "在厕所门上做明显标记，夜间留盏灯，每 2 小时安排定时如厕。意外发生时视为正常——绝不羞辱。",
        contentCategory: "care",
        contentSubcategory: "continence",
      },
      {
        key: "meaningful-activities",
        title: "Meaningful activities",
        titleZh: "有意义的活动",
        readMinutes: 4,
        summary:
          "Music, photo albums, simple gardening or folding laundry — activities tied to past identity bring calm and joy. Match difficulty to today's ability, not yesterday's.",
        summaryZh:
          "音乐、相册、简单园艺或叠衣物——与过往身份相关的活动能带来平静与喜悦。难度按今日能力调整，而非昨日。",
        contentCategory: "care",
        contentSubcategory: "activities",
      },
      {
        key: "home-safety",
        title: "Home safety",
        titleZh: "居家安全",
        readMinutes: 4,
        summary:
          "Remove rugs, lock away medications and chemicals, install grab rails. Lower water heater to 49°C. Put a sign on the front door and use door alarms.",
        summaryZh:
          "移除地毯、锁好药物与化学品、安装扶手。热水器调至 49°C 以下。在大门贴标志并使用门铃警报。",
        contentCategory: "safe",
        contentSubcategory: "home-safety",
      },
    ],
  },

  // ─── MODULE 4 ───────────────────────────────────────────────
  {
    key: "behaviour-changes",
    number: 4,
    title: "Dealing with Behaviour Changes",
    titleZh: "应对行为变化",
    description:
      "Wandering, agitation, sundowning, refusal — what's behind them and how to respond.",
    descriptionZh:
      "走失、躁动、黄昏症候群、抗拒——背后的原因以及应对方法。",
    icon: Brain,
    accent: "from-violet-500 to-purple-600",
    lessons: [
      {
        key: "why-behaviours",
        title: "Why behaviours change",
        titleZh: "行为为何改变",
        readMinutes: 4,
        summary:
          "Most 'difficult' behaviour is communication: pain, hunger, fear, boredom or environment. Look for the unmet need first. Behaviour is the message, not the problem.",
        summaryZh:
          "大多数「难处理」的行为其实是在表达：疼痛、饥饿、恐惧、无聊或环境因素。先找出未被满足的需求。行为是讯息，不是问题。",
        contentCategory: "coping",
        contentSubcategory: "understanding-behaviour",
      },
      {
        key: "agitation",
        title: "Agitation & restlessness",
        titleZh: "躁动与不安",
        readMinutes: 4,
        summary:
          "Lower noise, dim harsh lights, offer a familiar object, take a short walk. Avoid arguing — redirect attention. Check for pain, thirst or full bladder.",
        summaryZh:
          "降低噪音、调暗刺眼的灯光、递上熟悉的物品、一同散个步。不要争辩——转移注意力。检查疼痛、口渴或尿意。",
        contentCategory: "coping",
        contentSubcategory: "agitation",
      },
      {
        key: "sundowning",
        title: "Sundowning",
        titleZh: "黄昏症候群",
        readMinutes: 4,
        summary:
          "Late-afternoon confusion is common. Keep evenings calm, well-lit and predictable. Limit caffeine after lunch and close the curtains before dusk.",
        summaryZh:
          "下午到傍晚的混乱很常见。让傍晚保持平静、光线充足、规律可预期。午餐后限制咖啡因，黄昏前拉上窗帘。",
        contentCategory: "coping",
        contentSubcategory: "sundowning",
      },
      {
        key: "wandering",
        title: "Wandering & getting lost",
        titleZh: "走失与迷路",
        readMinutes: 5,
        summary:
          "Reduce triggers (boredom, full bladder), secure exits, use ID bracelets and GPS. Plan a search routine. Call for help in the first 30 minutes.",
        summaryZh:
          "减少诱因（无聊、尿意）、加固门窗、使用 ID 手环和 GPS 装置。预先规划搜寻流程。前 30 分钟就要寻求协助。",
        toolPath: "/gps-tracking",
        toolLabel: "Set up GPS & Safe Zones",
        toolLabelZh: "设定 GPS 与安全区域",
      },
      {
        key: "refusal",
        title: "Refusing care",
        titleZh: "抗拒护理",
        readMinutes: 3,
        summary:
          "Pause, try again later, change who's helping, break the task into smaller steps. Never force. Refusal usually means fear, not stubbornness.",
        summaryZh:
          "暂停、稍后再试、换人协助、把任务拆成更小的步骤。绝不强迫。抗拒通常源于恐惧，不是固执。",
        contentCategory: "coping",
        contentSubcategory: "refusal",
      },
      {
        key: "hallucinations",
        title: "Hallucinations & delusions",
        titleZh: "幻觉与妄想",
        readMinutes: 4,
        summary:
          "Don't argue with what they see — acknowledge their feeling, then gently redirect. Tell the doctor; some medications can trigger hallucinations.",
        summaryZh:
          "不要与他们所见之物争辩——先认可他们的感受，再温和地转移注意。并告知医生；某些药物可能引起幻觉。",
        contentCategory: "coping",
        contentSubcategory: "hallucinations",
      },
      {
        key: "depression-apathy",
        title: "Depression & apathy",
        titleZh: "忧郁与冷漠",
        readMinutes: 4,
        summary:
          "Withdrawal, low mood and loss of interest are common but treatable. Encourage gentle daily activity, sunlight and social contact. Talk to the doctor — depression is not 'just dementia'.",
        summaryZh:
          "退缩、情绪低落、失去兴趣很常见但可治疗。鼓励每日温和活动、晒太阳、与人接触。与医生讨论——忧郁并非「失智本来如此」。",
        contentCategory: "coping",
        contentSubcategory: "depression",
      },
      {
        key: "sleep-problems",
        title: "Sleep problems",
        titleZh: "睡眠问题",
        readMinutes: 4,
        summary:
          "Daytime light, regular bedtime, no naps after 3 pm, calm evening routine. Avoid heavy meals, alcohol and screens before bed. Treat pain that wakes them.",
        summaryZh:
          "白天接触阳光、规律入睡时间、下午 3 点后不午睡、平静的睡前流程。睡前避免大餐、酒精与萤幕。治疗会让他们醒来的疼痛。",
        contentCategory: "coping",
        contentSubcategory: "sleep",
      },
      {
        key: "repetitive-behaviour",
        title: "Repeated questions & behaviour",
        titleZh: "重复的问题与行为",
        readMinutes: 3,
        summary:
          "Repetition often means anxiety. Answer calmly each time, give a written reminder, redirect to an activity. Try not to say 'I just told you'.",
        summaryZh:
          "重复通常代表焦虑。每次都平静作答、提供书面提示、转移到一项活动。尽量不说「我刚才说过了」。",
        contentCategory: "coping",
        contentSubcategory: "repetition",
      },
    ],
  },

  // ─── MODULE 5 ───────────────────────────────────────────────
  {
    key: "looking-after-yourself",
    number: 5,
    title: "Looking After Yourself",
    titleZh: "照顾好自己",
    description:
      "Carer burnout is real. Rest, connection, grief and small daily wellbeing matter.",
    descriptionZh:
      "护理者倦怠是真实存在的。休息、连结、悲伤、日常的小确幸都很重要。",
    icon: Sparkles,
    accent: "from-sky-500 to-cyan-600",
    lessons: [
      {
        key: "recognise-stress",
        title: "Recognising carer stress",
        titleZh: "辨识护理者压力",
        readMinutes: 3,
        summary:
          "Trouble sleeping, irritability, withdrawal and persistent fatigue are warning signs — not weakness. Catching it early is the kindest thing you can do for both of you.",
        summaryZh:
          "睡眠困难、易怒、退缩、持续疲倦都是警讯——不是软弱。及早发现是您能为彼此做的最温柔的事。",
        contentCategory: "coping",
        contentSubcategory: "carer-stress",
      },
      {
        key: "respite",
        title: "Taking respite",
        titleZh: "争取喘息时间",
        readMinutes: 3,
        summary:
          "Even one hour helps. Ask family, hire a sitter, use day programs. You can't pour from an empty cup.",
        summaryZh:
          "哪怕只是一小时也有帮助。请家人协助、雇请帮手、利用日间照护。空杯倒不出水。",
        toolPath: "/search",
        toolLabel: "Find a Sitter",
        toolLabelZh: "寻找临时照护",
      },
      {
        key: "staying-connected",
        title: "Staying connected",
        titleZh: "保持人际连结",
        readMinutes: 3,
        summary:
          "Isolation makes everything harder. Keep one friendship alive, join an online group, share what's happening. Other carers understand fastest.",
        summaryZh:
          "孤立会让一切更艰难。保持一段友谊、加入线上互助群、分享您的经历。其他护理者最能理解。",
        toolPath: "/community",
        toolLabel: "Visit Community",
        toolLabelZh: "前往社群",
      },
      {
        key: "physical-mental",
        title: "Physical & mental wellbeing",
        titleZh: "身心健康",
        readMinutes: 4,
        summary:
          "Sleep, movement, sunlight and your own check-ups are not optional. Your body keeps the score. Book your own GP visit this month.",
        summaryZh:
          "睡眠、运动、阳光和您自己的健康检查都不是可有可无的。身体会记得一切。本月就预约自己的家庭医生。",
        contentCategory: "coping",
        contentSubcategory: "wellbeing",
      },
      {
        key: "relaxation",
        title: "Relaxation & breathing",
        titleZh: "放松与呼吸练习",
        readMinutes: 3,
        summary:
          "Two minutes of slow breathing — in for 4, out for 6 — lowers your heart rate and calms the room. Try it before answering a hard moment.",
        summaryZh:
          "两分钟的缓慢呼吸——吸气 4 秒、呼气 6 秒——能降低心率、让整个空间安静下来。在艰难时刻回应前先试一次。",
        contentCategory: "coping",
        contentSubcategory: "relaxation",
      },
      {
        key: "grief-loss",
        title: "Grief & ambiguous loss",
        titleZh: "悲伤与模糊的失去",
        readMinutes: 4,
        summary:
          "Carers grieve while their loved one is still here — for who they were, for the future you'd planned. This 'ambiguous loss' is real. Name it, share it, let yourself feel it.",
        summaryZh:
          "亲人尚在身边时您已开始悲伤——为他们曾经的样子、为原本规划的未来。这种「模糊的失去」是真实的。说出来、分享、允许自己感受。",
        contentCategory: "coping",
        contentSubcategory: "grief",
      },
      {
        key: "end-of-life",
        title: "Late stage & end-of-life care",
        titleZh: "晚期与临终关怀",
        readMinutes: 5,
        summary:
          "Comfort over cure. Focus on pain relief, gentle touch, familiar voices, music. Talk with the medical team about palliative care early. Saying goodbye well matters.",
        summaryZh:
          "以舒适为优先，而非治愈。聚焦于止痛、温柔的触碰、熟悉的声音、音乐。尽早与医疗团队讨论安宁照护。好好告别，意义深远。",
        contentCategory: "care",
        contentSubcategory: "end-of-life",
      },
    ],
  },
];

export function getModule(key: string): ISupportModule | undefined {
  return ISUPPORT_MODULES.find((m) => m.key === key);
}

/** Get the next uncompleted lesson, for "Continue learning" CTAs. */
export function getNextLesson(
  completedKeys: Set<string>
): { module: ISupportModule; lesson: ISupportLesson } | null {
  for (const m of ISUPPORT_MODULES) {
    for (const l of m.lessons) {
      if (!completedKeys.has(l.key)) return { module: m, lesson: l };
    }
  }
  return null;
}

export const TOTAL_LESSONS = ISUPPORT_MODULES.reduce(
  (sum, m) => sum + m.lessons.length,
  0
);
