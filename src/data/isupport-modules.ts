/**
 * WHO iSupport for Dementia — Module Structure (Comprehensive Edition v2)
 * Source: WHO iSupport for Dementia manual + companion materials
 *         (Alzheimer's Association iSupport US adaptation)
 *
 * 5 official modules → 30 lessons covering the full handbook plus end-of-life
 * care guidance recommended by leading dementia-care apps (Caring Village,
 * Alzheimer's Daily Companion, MindMate).
 *
 * Each lesson maps to:
 *   - A short summary (in-app reading, ~50–80 words, plain language)
 *   - 3 practical "key actions" the carer can take today (EN + ZH)
 *   - 1 reflection prompt — WHO original "Stop & think" pattern (EN + ZH)
 *   - 1 self-check quiz question with 3 options + correct index (EN + ZH)
 *   - Optional links to challenged_content articles (deep dives)
 *   - Optional links to interactive tools we already ship
 *
 * This is the SINGLE SOURCE OF TRUTH for the Resources hub.
 */

import {
  BookOpen,
  Heart,
  HandHeart,
  Brain,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface ISupportQuiz {
  question: string;
  questionZh: string;
  options: string[];
  optionsZh: string[];
  /** 0-based index of the correct answer */
  correct: number;
  explanation: string;
  explanationZh: string;
}

export interface ISupportLesson {
  key: string;
  title: string;
  titleZh: string;
  summary: string;
  summaryZh: string;
  /** 3 short, actionable bullets the carer can do today */
  keyActions: string[];
  keyActionsZh: string[];
  /** WHO "Stop & think" reflection prompt — open-ended */
  reflectQuestion: string;
  reflectQuestionZh: string;
  /** Self-check quiz at end of lesson */
  quiz: ISupportQuiz;
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
        reflectQuestion:
          "Which everyday change in your loved one first made you suspect something more than ageing?",
        reflectQuestionZh:
          "您亲人哪一个日常变化，最先让您怀疑这不只是单纯的老化？",
        quiz: {
          question: "Dementia is best described as:",
          questionZh: "对失智症的最佳描述是：",
          options: [
            "A normal part of ageing",
            "A syndrome caused by brain changes",
            "A mental illness",
          ],
          optionsZh: ["正常老化的一部分", "由大脑变化引起的综合症", "一种精神疾病"],
          correct: 1,
          explanation:
            "Dementia is a syndrome — a group of symptoms — caused by underlying brain disease, not normal ageing.",
          explanationZh:
            "失智症是综合症（一组症状），由大脑疾病引起，并非正常老化。",
        },
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
        keyActions: [
          "Ask the doctor which type of dementia your loved one has.",
          "Read one short article about that specific type.",
          "Note any risk factors (heart, stroke, family history) for the team.",
        ],
        keyActionsZh: [
          "询问医生您亲人患的是哪种类型的失智症。",
          "针对该类型阅读一篇简短文章。",
          "记录任何风险因素（心脏、中风、家族史）以告知团队。",
        ],
        reflectQuestion:
          "How might knowing the specific type change the care choices you make in the next month?",
        reflectQuestionZh:
          "了解具体类型，会如何改变您下个月的护理决定？",
        quiz: {
          question: "The most common type of dementia is:",
          questionZh: "最常见的失智症类型是：",
          options: ["Vascular dementia", "Alzheimer's disease", "Lewy body dementia"],
          optionsZh: ["血管性失智症", "阿尔茨海默病", "路易体失智症"],
          correct: 1,
          explanation:
            "Alzheimer's disease accounts for 60–70% of all dementia cases worldwide.",
          explanationZh:
            "阿尔茨海默病占全球所有失智症病例的 60–70%。",
        },
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
        keyActions: [
          "Use the 10 warning signs checklist to track what you see.",
          "Note when each sign first appeared.",
          "Don't dismiss small changes — they're data, not drama.",
        ],
        keyActionsZh: [
          "使用 10 大警讯清单记录您看到的迹象。",
          "记下每个征兆首次出现的时间。",
          "别忽略小变化——它们是讯息，不是小题大做。",
        ],
        reflectQuestion:
          "Which sign do you notice most often this week — and what was happening just before?",
        reflectQuestionZh:
          "本周您最常注意到哪个征兆？它出现前发生了什么？",
        quiz: {
          question: "Which of the following is NOT typical of normal ageing?",
          questionZh: "下列哪一项不是正常老化的典型表现？",
          options: [
            "Occasionally forgetting a name",
            "Getting lost on a familiar street",
            "Slower recall of words",
          ],
          optionsZh: [
            "偶尔忘记一个名字",
            "在熟悉的街道上迷路",
            "回想词语变慢",
          ],
          correct: 1,
          explanation:
            "Getting lost in familiar places is a warning sign of dementia, not normal ageing.",
          explanationZh:
            "在熟悉的地方迷路是失智症的警讯，不是正常老化。",
        },
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
        reflectQuestion:
          "What is one thing you're still doing 'the early-stage way' that today's stage no longer needs?",
        reflectQuestionZh:
          "有哪件事您仍以「早期方式」在做，但现在的阶段已不再需要？",
        quiz: {
          question: "Why is identifying the current stage useful?",
          questionZh: "辨识当前阶段的用处是？",
          options: [
            "It predicts the exact date of decline",
            "It helps match support to today's needs",
            "It changes the diagnosis",
          ],
          optionsZh: [
            "可以准确预测衰退的日期",
            "有助于让支持配合今天的需求",
            "会改变诊断",
          ],
          correct: 1,
          explanation:
            "Stages are guides — they help you adjust care, not predict an exact timeline.",
          explanationZh:
            "阶段是参考——帮助您调整护理，而非预测确切时间表。",
        },
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
        keyActions: [
          "Book a GP appointment specifically about memory concerns.",
          "Bring your dated list of changes to the visit.",
          "Ask for a referral to a memory clinic or neurologist.",
        ],
        keyActionsZh: [
          "专门为记忆问题预约一次家庭医生看诊。",
          "把记有日期的变化清单带去就诊。",
          "请医生转诊到记忆门诊或神经科。",
        ],
        reflectQuestion:
          "What worries you most about pursuing a diagnosis — and what would change if you didn't?",
        reflectQuestionZh:
          "追求诊断让您最担心什么？如果不去诊断，又会有什么不同？",
        quiz: {
          question: "Early diagnosis primarily helps because:",
          questionZh: "早期诊断主要的帮助是：",
          options: [
            "It cures the disease",
            "It opens up treatments and time to plan",
            "It avoids future doctor visits",
          ],
          optionsZh: [
            "可以治愈疾病",
            "开启治疗选项和规划时间",
            "可以避免未来就诊",
          ],
          correct: 1,
          explanation:
            "There's no cure yet, but early diagnosis means earlier treatment, support and informed planning.",
          explanationZh:
            "目前尚无治愈方法，但早期诊断意味着更早的治疗、支持和明智的规划。",
        },
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
        keyActions: [
          "List 3 things only you can do, and 3 you can delegate.",
          "Ask one family member to take over a recurring task.",
          "Let your loved one do what they still can — even slowly.",
        ],
        keyActionsZh: [
          "列出 3 件只有您能做的事，和 3 件可以交付给他人的事。",
          "请一位家人接手一项每周固定任务。",
          "让亲人做他们仍能做的事——即使做得慢。",
        ],
        reflectQuestion:
          "Which task have you taken over too soon, and could give back?",
        reflectQuestionZh:
          "有哪件事您接手得太早，其实可以还给亲人去做？",
        quiz: {
          question: "Doing everything for your loved one usually:",
          questionZh: "替亲人包办一切通常会：",
          options: [
            "Speeds up the loss of their abilities",
            "Slows down their decline",
            "Makes them happier",
          ],
          optionsZh: [
            "加快他们能力的丧失",
            "减缓他们的衰退",
            "让他们更快乐",
          ],
          correct: 0,
          explanation:
            "Use it or lose it — when carers do everything, remaining abilities fade faster.",
          explanationZh:
            "用进废退——当护理者包办一切时，剩余能力会消失得更快。",
        },
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
        reflectQuestion:
          "When was the last conversation that felt good? What did you both do differently?",
        reflectQuestionZh:
          "最近一次让彼此都感到舒服的对话是什么时候？你们做了什么不同的事？",
        quiz: {
          question: "If your loved one says something that isn't true, you should:",
          questionZh: "如果亲人说了不正确的事，您应该：",
          options: [
            "Correct them firmly",
            "Acknowledge the feeling, gently redirect",
            "Ignore them",
          ],
          optionsZh: [
            "坚决纠正他们",
            "认可情绪，温和转移话题",
            "不理会他们",
          ],
          correct: 1,
          explanation:
            "Arguing creates distress. Validating feelings keeps the bond and lowers anxiety.",
          explanationZh:
            "争辩会引起困扰。认可感受能维系关系并降低焦虑。",
        },
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
        keyActions: [
          "Spend 10 minutes daily on a non-task activity together.",
          "Play their favourite song from age 18–25.",
          "Use touch — a hand on the shoulder says what words can't.",
        ],
        keyActionsZh: [
          "每天花 10 分钟一起做一件不是任务的事。",
          "播放他们 18–25 岁时最喜欢的歌曲。",
          "运用触摸——手放肩上能传达言语难以表达的关怀。",
        ],
        reflectQuestion:
          "What did your loved one love doing before — and how could a tiny version of it fit today?",
        reflectQuestionZh:
          "亲人以前最喜欢做什么？这件事的「小一号版本」今天怎么做？",
        quiz: {
          question: "Music from a person's youth often:",
          questionZh: "亲人年轻时听过的音乐通常会：",
          options: [
            "Causes confusion",
            "Reaches them when words don't",
            "Should be avoided",
          ],
          optionsZh: [
            "造成混乱",
            "在言语失效时仍能触动他们",
            "应该避免",
          ],
          correct: 1,
          explanation:
            "Musical memory is preserved late into dementia. Familiar songs unlock connection and joy.",
          explanationZh:
            "音乐记忆能保留到失智症晚期。熟悉的歌曲能开启连结与喜悦。",
        },
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
        keyActions: [
          "List everyone willing to help — even by phone.",
          "Give each person ONE specific recurring task.",
          "Add them to your Care Team in the app.",
        ],
        keyActionsZh: [
          "列出所有愿意帮忙的人——即使只是电话支援。",
          "给每个人 一项明确的固定任务。",
          "在 app 的护理团队中加入他们。",
        ],
        reflectQuestion:
          "Who has offered to help that you haven't taken up yet — and why not?",
        reflectQuestionZh:
          "有谁主动提议帮忙，您却还没接受？为什么？",
        quiz: {
          question: "The most effective way to ask for help is:",
          questionZh: "最有效的求助方式是：",
          options: [
            "'Let me know if you need anything'",
            "Specific task, specific day",
            "Wait until you are exhausted",
          ],
          optionsZh: [
            "说「需要时告诉我」",
            "具体任务，具体日期",
            "等到您筋疲力尽再开口",
          ],
          correct: 1,
          explanation:
            "Vague offers rarely turn into help. 'Can you sit with Dad Tuesday 2-4pm?' gets a yes.",
          explanationZh:
            "模糊的提议很少变成实际帮助。「您可以星期二下午 2-4 点陪爸爸吗？」更可能得到肯定回答。",
        },
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
        keyActions: [
          "Locate (or set up) a Power of Attorney this month.",
          "List bank accounts, insurance, and key passwords in one secure place.",
          "Talk about wishes for end-of-life care while it's not urgent.",
        ],
        keyActionsZh: [
          "本月找出（或办理）一份委托书。",
          "把银行账户、保险、重要密码集中保存于一处安全地点。",
          "趁还不紧急时，谈谈临终关怀的愿望。",
        ],
        reflectQuestion:
          "Which legal or money decision worries you most if it had to be made tomorrow?",
        reflectQuestionZh:
          "如果明天就必须做决定，哪一项法律或财务安排最让您担心？",
        quiz: {
          question: "The best time to set up Power of Attorney is:",
          questionZh: "办理委托书的最佳时机是：",
          options: [
            "When the person can no longer decide",
            "Early, while they can still take part",
            "Only after a hospital admission",
          ],
          optionsZh: [
            "当事人无法再做决定时",
            "尽早，趁他们仍能参与时",
            "住院之后才办",
          ],
          correct: 1,
          explanation:
            "Capacity to sign legal documents fades. Early planning preserves the person's voice in their own future.",
          explanationZh:
            "签署法律文件的能力会逐渐丧失。及早规划能让当事人对自己的未来仍有发言权。",
        },
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
        keyActions: [
          "Set the same wake, meal and bedtime — every day.",
          "Schedule hard tasks (bathing, appointments) in the morning.",
          "Add one enjoyable activity each afternoon.",
        ],
        keyActionsZh: [
          "每天起床、用餐、就寝时间一致。",
          "把困难的任务（沐浴、就诊）安排在上午。",
          "每天下午加入一项愉快的活动。",
        ],
        reflectQuestion:
          "Which time of day feels hardest right now — and what one anchor could you add to it?",
        reflectQuestionZh:
          "目前一天中哪个时段最难熬？您可以加入什么「定锚活动」？",
        quiz: {
          question: "The best time of day for difficult tasks is usually:",
          questionZh: "困难任务最适合安排在一天的：",
          options: ["Late evening", "Morning", "Right after dinner"],
          optionsZh: ["晚上较晚时间", "上午", "晚餐后"],
          correct: 1,
          explanation:
            "Cognitive energy peaks in the morning and fades through the day, especially with sundowning.",
          explanationZh:
            "认知能量在上午达到顶峰，随着一天进展而下降——尤其在黄昏症候群时段。",
        },
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
        keyActions: [
          "Offer 2 outfit choices, not an open question.",
          "Pre-warm the bathroom and lay towels in reach.",
          "Narrate each step gently: 'Now we wash your arm.'",
        ],
        keyActionsZh: [
          "提供 2 套衣服选择，而不是开放式提问。",
          "事先把浴室预热，毛巾放在伸手可及处。",
          "温柔地说出每个步骤：「现在我们来洗手臂。」",
        ],
        reflectQuestion:
          "What part of bathing causes the most resistance — and what unmet need might be behind it?",
        reflectQuestionZh:
          "沐浴中哪一部分最容易引起抗拒？背后可能藏着哪个未被满足的需求？",
        quiz: {
          question: "Best way to ask about clothing choice:",
          questionZh: "询问穿衣选择的最佳方式是：",
          options: [
            "'What do you want to wear?'",
            "'Blue shirt or red shirt?'",
            "'Just wear this'",
          ],
          optionsZh: [
            "「你想穿什么？」",
            "「蓝衬衫还是红衬衫？」",
            "「就穿这件」",
          ],
          correct: 1,
          explanation:
            "Two clear options preserve dignity without overwhelming decision-making.",
          explanationZh:
            "两个明确选项既维护尊严，又不会让决策超过负荷。",
        },
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
        keyActions: [
          "Use a plain coloured plate that contrasts with the food.",
          "Offer water every hour — set a phone reminder.",
          "Watch for coughing while eating — tell the doctor if it appears.",
        ],
        keyActionsZh: [
          "使用与食物颜色对比强烈的纯色餐盘。",
          "每小时递一次水——用手机定时提醒。",
          "留意进食时的呛咳——出现时告诉医生。",
        ],
        reflectQuestion:
          "Which favourite food no longer gets eaten — could the problem be the plate, not the food?",
        reflectQuestionZh:
          "哪一道亲人最喜欢的菜现在吃不下了？问题会不会是餐盘，而不是食物本身？",
        quiz: {
          question: "Coughing during meals may signal:",
          questionZh: "进食时咳嗽可能提示：",
          options: [
            "A normal cold",
            "Swallowing problems — tell the doctor",
            "Food that's too cold",
          ],
          optionsZh: ["普通感冒", "吞咽问题——告诉医生", "食物太冷"],
          correct: 1,
          explanation:
            "New coughing during meals can be an early sign of dysphagia and aspiration risk.",
          explanationZh:
            "进食时新出现的咳嗽可能是吞咽困难和误吸风险的早期征兆。",
        },
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
        keyActions: [
          "Fill a 7-day pill box every Sunday.",
          "Keep a single up-to-date medication list in your wallet.",
          "Ask the doctor: 'Can any of these be stopped?' every 6 months.",
        ],
        keyActionsZh: [
          "每个周日填好 7 天分药盒。",
          "随身携带一份最新的用药清单。",
          "每 6 个月问医生：「这些药有哪些可以停掉？」",
        ],
        reflectQuestion:
          "When was the last full medication review — and what would change if some were stopped?",
        reflectQuestionZh:
          "最近一次完整的药物检视是什么时候？停掉一些药会带来什么改变？",
        quiz: {
          question: "Reviewing all medications with the doctor should happen:",
          questionZh: "与医生一起检视所有药物应该：",
          options: [
            "Only when problems arise",
            "At least every 6 months",
            "Once a year is enough",
          ],
          optionsZh: ["只在出现问题时", "至少每 6 个月一次", "每年一次就够了"],
          correct: 1,
          explanation:
            "Polypharmacy is common in dementia. Regular reviews prevent harmful interactions and side effects.",
          explanationZh:
            "失智症患者用药过多很常见。定期检视能避免有害的药物相互作用与副作用。",
        },
        contentCategory: "care",
        contentSubcategory: "medication",
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
        keyActions: [
          "Put a large 'TOILET' sign with a picture on the bathroom door.",
          "Prompt a bathroom visit every 2 hours during the day.",
          "Keep a calm, matter-of-fact tone after any accident.",
        ],
        keyActionsZh: [
          "在厕所门上贴大字「厕所」并配一张图。",
          "白天每 2 小时提醒如厕一次。",
          "意外发生后保持平静、就事论事的语气。",
        ],
        reflectQuestion:
          "How does your face change when an accident happens — and what would you want it to say?",
        reflectQuestionZh:
          "意外发生时您的表情会怎么变？您希望它传达什么讯息？",
        quiz: {
          question: "After an incontinence accident, the carer should:",
          questionZh: "失禁意外发生后，护理者应该：",
          options: [
            "Show frustration so it doesn't happen again",
            "Stay calm and matter-of-fact",
            "Avoid mentioning it",
          ],
          optionsZh: [
            "露出不满，避免再发生",
            "保持平静，就事论事",
            "完全不提",
          ],
          correct: 1,
          explanation:
            "Shame increases anxiety, which increases incontinence. Calm response preserves dignity.",
          explanationZh:
            "羞辱会增加焦虑，焦虑又会加重失禁。平静的回应能维护尊严。",
        },
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
        keyActions: [
          "Pick one activity from their old job, hobby or culture.",
          "Break it into a 10-minute version they can succeed at.",
          "Praise effort, not result.",
        ],
        keyActionsZh: [
          "从他们过去的职业、爱好或文化中挑一项活动。",
          "拆成 10 分钟的版本，让他们能成功完成。",
          "称赞过程，而不是结果。",
        ],
        reflectQuestion:
          "What was your loved one's identity 30 years ago — and what tiny piece of that still fits today?",
        reflectQuestionZh:
          "30 年前亲人是怎样的人？那段身份的哪一小部分今天仍然适合？",
        quiz: {
          question: "An activity is 'meaningful' when it:",
          questionZh: "一项活动是「有意义」的，当它：",
          options: [
            "Looks impressive to family",
            "Connects to who the person was",
            "Lasts at least an hour",
          ],
          optionsZh: [
            "在家人眼中很厉害",
            "与他们曾经是谁连结",
            "至少持续一小时",
          ],
          correct: 1,
          explanation:
            "Meaning comes from identity, not duration or impressiveness.",
          explanationZh:
            "意义来自身份，而不是时长或表面成就。",
        },
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
        keyActions: [
          "Walk through your home today — note 3 fall or burn hazards.",
          "Lock medications and cleaning chemicals out of sight.",
          "Lower water heater to 49°C / 120°F to prevent scalds.",
        ],
        keyActionsZh: [
          "今天就走遍家中——找出 3 处跌倒或烫伤风险。",
          "把药物和清洁剂锁起来、藏好。",
          "热水器调至 49°C 以下，预防烫伤。",
        ],
        reflectQuestion:
          "If your loved one wandered tonight, where in the house would they be most at risk?",
        reflectQuestionZh:
          "如果亲人今晚在家里游走，家中哪个位置最危险？",
        quiz: {
          question: "Maximum safe water heater temperature for dementia homes:",
          questionZh: "失智症家庭热水器的最高安全温度是：",
          options: ["60°C", "49°C", "70°C"],
          optionsZh: ["60°C", "49°C", "70°C"],
          correct: 1,
          explanation:
            "49°C / 120°F prevents serious scalds within seconds of contact.",
          explanationZh:
            "49°C 能避免接触几秒内造成的严重烫伤。",
        },
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
        keyActions: [
          "Before reacting, ask: pain? thirst? toilet? noise? boredom?",
          "Keep a 1-week behaviour log — note what came just before.",
          "Treat behaviour as a message, not misbehaviour.",
        ],
        keyActionsZh: [
          "反应之前先问：疼痛？口渴？尿意？噪音？无聊？",
          "记录一周的行为日志——注意行为发生前的情境。",
          "把行为视为讯息，而不是不当行为。",
        ],
        reflectQuestion:
          "Pick the last difficult moment — what need might it have been telling you about?",
        reflectQuestionZh:
          "回想最近一次难处理的时刻——它可能在告诉您什么需求？",
        quiz: {
          question: "Most challenging behaviour is best understood as:",
          questionZh: "大多数挑战性行为最好理解为：",
          options: [
            "Personality changing for the worse",
            "Communication of an unmet need",
            "A symptom that needs medication",
          ],
          optionsZh: [
            "性格变坏",
            "未被满足需求的表达",
            "需要用药的症状",
          ],
          correct: 1,
          explanation:
            "When language fails, behaviour speaks. Find the need first; medication is rarely the right answer.",
          explanationZh:
            "当语言失效，行为就是表达。先找需求；用药通常不是正确答案。",
        },
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
        keyActions: [
          "Turn off TV / radio first — sound overload is invisible.",
          "Offer a familiar comfort item or photo.",
          "Walk together for 5 minutes — movement lowers agitation.",
        ],
        keyActionsZh: [
          "先关掉电视/收音机——声音过载常被忽略。",
          "递上熟悉的安慰物或照片。",
          "一起散步 5 分钟——运动能降低躁动。",
        ],
        reflectQuestion:
          "What environmental factor (noise, light, crowd) most often triggers agitation in your home?",
        reflectQuestionZh:
          "在您家中，哪种环境因素（噪音、光线、人多）最常引发躁动？",
        quiz: {
          question: "First step when someone becomes agitated:",
          questionZh: "亲人变得躁动时，第一步应该是：",
          options: [
            "Reason with them firmly",
            "Reduce noise and check basic needs",
            "Leave the room",
          ],
          optionsZh: [
            "严肃地讲道理",
            "降低噪音并检查基本需求",
            "离开房间",
          ],
          correct: 1,
          explanation:
            "Calm the environment, then check pain/toilet/hunger. Reasoning rarely works mid-agitation.",
          explanationZh:
            "先让环境平静，再检查疼痛/如厕/饥饿。在躁动当下讲道理几乎无效。",
        },
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
        keyActions: [
          "Turn on bright lights BEFORE the sun goes down.",
          "Close curtains before dusk to remove dim shadows.",
          "Plan a quiet familiar activity (music, photos) for 4–6 pm.",
        ],
        keyActionsZh: [
          "太阳下山前就把灯打亮。",
          "黄昏前拉上窗帘，避免昏暗阴影。",
          "在下午 4–6 点安排安静、熟悉的活动（音乐、照片）。",
        ],
        reflectQuestion:
          "What part of your evening routine adds stress for both of you — could one piece be removed?",
        reflectQuestionZh:
          "傍晚作息中哪一部分让你们都感到压力？可不可以拿掉一项？",
        quiz: {
          question: "To prevent sundowning, lights should be brightened:",
          questionZh: "预防黄昏症候群，灯光应该：",
          options: [
            "Only after it's dark",
            "Before the sun starts setting",
            "Never — keep lights low",
          ],
          optionsZh: [
            "天完全黑后才开",
            "太阳开始下山前就打亮",
            "保持昏暗",
          ],
          correct: 1,
          explanation:
            "Pre-empting the dim transition phase prevents the disorientation that triggers sundowning.",
          explanationZh:
            "提前在昏暗转换前打亮灯光，能预防引发黄昏症候群的方向感丧失。",
        },
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
        keyActions: [
          "Put a current photo, ID and contact in their wallet today.",
          "Set up GPS tracking and Safe Zones in the app.",
          "Tell 2 neighbours and have their phone numbers ready.",
        ],
        keyActionsZh: [
          "今天就把近期照片、ID 和紧急联络放入他们的皮夹。",
          "在 app 中设定 GPS 追踪和安全区域。",
          "告知 2 位邻居并准备好他们的电话。",
        ],
        reflectQuestion:
          "If your loved one walked out the front door right now, what is your first 5-minute plan?",
        reflectQuestionZh:
          "如果亲人现在就走出大门，您前 5 分钟的应对计划是什么？",
        quiz: {
          question: "If a person with dementia goes missing, call 911 / police:",
          questionZh: "失智症患者走失时，应该：",
          options: [
            "After 24 hours",
            "Within the first 30 minutes",
            "Only if they don't return by night",
          ],
          optionsZh: [
            "24 小时后",
            "前 30 分钟内",
            "晚上还没回再说",
          ],
          correct: 1,
          explanation:
            "Most missing persons with dementia are found within 1.5 km of home, but injury risk rises sharply after 30 minutes.",
          explanationZh:
            "大多数失智症走失者会在距家 1.5 公里内被找到，但 30 分钟后受伤风险急剧上升。",
        },
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
        keyActions: [
          "Step away for 15 minutes, then approach again.",
          "Try a different carer, voice or time of day.",
          "Break the task: 'Just wash hands first' instead of full bath.",
        ],
        keyActionsZh: [
          "先离开 15 分钟，再回来尝试。",
          "换一位护理者、不同的语气，或换个时段。",
          "拆解任务：先「洗洗手」，而不是整个沐浴。",
        ],
        reflectQuestion:
          "When refusal happens, what fear might be underneath — cold? falling? embarrassment?",
        reflectQuestionZh:
          "抗拒发生时，背后可能藏着什么恐惧？怕冷？怕跌倒？怕尴尬？",
        quiz: {
          question: "When care is refused, the most helpful response is:",
          questionZh: "护理被拒绝时，最有帮助的反应是：",
          options: [
            "Insist for safety reasons",
            "Pause, retry later, change approach",
            "Skip the task entirely",
          ],
          optionsZh: [
            "为安全坚持下去",
            "暂停、稍后再试、改变方式",
            "完全跳过这项任务",
          ],
          correct: 1,
          explanation:
            "Forcing increases fear and future refusal. Patience and flexibility almost always win.",
          explanationZh:
            "强迫会加深恐惧和未来的抗拒。耐心和弹性几乎总是有效。",
        },
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
        keyActions: [
          "Validate the feeling: 'That sounds frightening — I'm here.'",
          "Check lighting and remove confusing reflections / shadows.",
          "List all current medications for the doctor — some trigger hallucinations.",
        ],
        keyActionsZh: [
          "认可感受：「那一定很可怕，我在这里。」",
          "检查光线，移除会造成混淆的反光与阴影。",
          "列出所有用药给医生——某些药会引发幻觉。",
        ],
        reflectQuestion:
          "If they saw a 'stranger' in the room — could it be a mirror, a coat, a shadow?",
        reflectQuestionZh:
          "如果他们看到房间里有「陌生人」——可能是镜子、衣服或阴影吗？",
        quiz: {
          question: "When your loved one sees something that isn't there:",
          questionZh: "亲人看见不存在的东西时：",
          options: [
            "Tell them firmly nothing is there",
            "Acknowledge the feeling and gently redirect",
            "Ignore it and walk away",
          ],
          optionsZh: [
            "坚定地告诉他们什么都没有",
            "认可感受，温和转移注意",
            "不理会，走开",
          ],
          correct: 1,
          explanation:
            "What they see feels real to them. Validating reduces fear; arguing escalates it.",
          explanationZh:
            "他们所见对他们而言是真实的。认可能减轻恐惧；争辩则会让情况升级。",
        },
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
        keyActions: [
          "Get 20 minutes of morning daylight together — every day.",
          "Schedule one small social moment (a call, a visit).",
          "Tell the doctor — depression in dementia is treatable.",
        ],
        keyActionsZh: [
          "每天一起晒 20 分钟晨光。",
          "安排一次小型社交（电话、来访）。",
          "告诉医生——失智症中的忧郁是可治疗的。",
        ],
        reflectQuestion:
          "When did you last see them smile genuinely — what was happening then?",
        reflectQuestionZh:
          "最近一次看到他们真心微笑是什么时候？当时正在做什么？",
        quiz: {
          question: "Depression in someone with dementia is:",
          questionZh: "失智症患者的忧郁症是：",
          options: [
            "An unavoidable part of the disease",
            "A separate, treatable condition",
            "A sign of weakness",
          ],
          optionsZh: [
            "疾病无可避免的一部分",
            "独立、可治疗的疾病",
            "软弱的表现",
          ],
          correct: 1,
          explanation:
            "Depression is common with dementia but a separate condition — treatment improves quality of life significantly.",
          explanationZh:
            "忧郁症在失智症中常见，但是独立疾病——治疗能显著改善生活质量。",
        },
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
        keyActions: [
          "Limit naps to 30 minutes, before 3 pm.",
          "Same bedtime every night, even weekends.",
          "If pain wakes them, treat the pain — not the sleep.",
        ],
        keyActionsZh: [
          "午睡限制在 30 分钟内，且不晚于下午 3 点。",
          "每晚就寝时间一致，周末也一样。",
          "若疼痛把他们吵醒，治疗疼痛——而不是直接处理睡眠。",
        ],
        reflectQuestion:
          "What is the last hour before bed actually like — could it become quieter?",
        reflectQuestionZh:
          "睡前最后一个小时真实的状态是什么？它能不能变得更安静？",
        quiz: {
          question: "Sleeping pills for dementia patients are:",
          questionZh: "失智症患者使用安眠药：",
          options: [
            "Always the first solution",
            "Generally last resort — increase falls and confusion",
            "Completely safe long-term",
          ],
          optionsZh: [
            "总是第一选择",
            "通常是最后选择——增加跌倒和混乱风险",
            "长期使用完全安全",
          ],
          correct: 1,
          explanation:
            "Most sleep aids worsen confusion and fall risk in dementia. Routine and environment fixes come first.",
          explanationZh:
            "大多数安眠药会加重失智症患者的混乱和跌倒风险。优先调整作息和环境。",
        },
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
        keyActions: [
          "Write the answer big on a whiteboard they can see.",
          "Answer calmly each time, as if it's the first.",
          "Redirect: 'Let's go check together' breaks the loop.",
        ],
        keyActionsZh: [
          "在他们看得到的白板上把答案写大。",
          "每次都平静作答，当作是第一次。",
          "转移：「我们一起去看看」可以打破循环。",
        ],
        reflectQuestion:
          "What is the most-repeated question this week — and what worry is hiding behind it?",
        reflectQuestionZh:
          "本周被问最多的问题是什么？背后藏着什么担心？",
        quiz: {
          question: "Repeated questions usually mean:",
          questionZh: "重复发问通常代表：",
          options: [
            "They're testing you",
            "Anxiety — they need reassurance",
            "They want to annoy you",
          ],
          optionsZh: [
            "他们在测试您",
            "焦虑——他们需要安心感",
            "他们想惹您生气",
          ],
          correct: 1,
          explanation:
            "Memory loss + anxiety = repetition. Calm reassurance, not correction, breaks the cycle.",
          explanationZh:
            "记忆丧失加上焦虑就会出现重复。安心感而非纠正，才能打破循环。",
        },
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
        keyActions: [
          "Score yourself 1–10 on energy each Sunday — track the trend.",
          "If 3 nights a week of bad sleep — tell your own doctor.",
          "Name the feeling out loud. Naming is half the relief.",
        ],
        keyActionsZh: [
          "每周日给自己的精力打分 1–10——追踪趋势。",
          "如果一周有 3 个晚上睡不好——告诉您自己的医生。",
          "把感受说出来。说出来就缓解了一半。",
        ],
        reflectQuestion:
          "Which warning sign of stress have you been quietly ignoring?",
        reflectQuestionZh:
          "有哪个压力警讯，您其实一直在悄悄忽视？",
        quiz: {
          question: "Carer burnout is best described as:",
          questionZh: "护理者倦怠最好的描述是：",
          options: [
            "A sign you don't love them enough",
            "A normal response to long-term caring without rest",
            "Only a problem for paid carers",
          ],
          optionsZh: [
            "您爱得不够的征兆",
            "长期无休护理后的正常反应",
            "只有有偿护理者才会有的问题",
          ],
          correct: 1,
          explanation:
            "Burnout is biology, not failure. Every long-term carer needs rest to keep caring well.",
          explanationZh:
            "倦怠是生理反应，不是失败。每位长期护理者都需要休息才能持续好好护理。",
        },
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
        keyActions: [
          "Book ONE respite hour this week — non-negotiable.",
          "Use the time for something restorative, not chores.",
          "Tell yourself: rest IS care.",
        ],
        keyActionsZh: [
          "本周预约 一小时喘息——不可妥协。",
          "用这段时间做一件让自己恢复的事，而不是家务。",
          "告诉自己：休息也是一种护理。",
        ],
        reflectQuestion:
          "What would you do if you had 2 hours alone tomorrow — and what's stopping it?",
        reflectQuestionZh:
          "如果明天有 2 小时独处时间，您会做什么？又是什么挡住了它？",
        quiz: {
          question: "Taking respite breaks is:",
          questionZh: "安排喘息时间是：",
          options: [
            "A luxury for selfish carers",
            "A necessity that prevents burnout",
            "Only needed in late-stage care",
          ],
          optionsZh: [
            "自私护理者的奢侈",
            "防止倦怠的必需品",
            "只有晚期护理才需要",
          ],
          correct: 1,
          explanation:
            "Respite is medical care for the carer. Without it, the whole care system collapses.",
          explanationZh:
            "喘息是护理者的医疗照护。没有它，整个护理体系会崩溃。",
        },
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
        keyActions: [
          "Send one message today to a friend you've gone quiet with.",
          "Join one carer support group (online or in person).",
          "Share one honest update — not just 'fine'.",
        ],
        keyActionsZh: [
          "今天就传一则讯息给一位最近疏远的朋友。",
          "加入一个护理者互助群（线上或面对面）。",
          "诚实分享近况——不只是说「还好」。",
        ],
        reflectQuestion:
          "Who used to know everything about your life — and what would it take to tell them how it really is now?",
        reflectQuestionZh:
          "曾经最了解您生活的人是谁？要把现在的真实情况告诉他们，需要什么？",
        quiz: {
          question: "Other carers are valuable because:",
          questionZh: "其他护理者珍贵的原因是：",
          options: [
            "They have all the answers",
            "They understand without explanation",
            "They take over the caring",
          ],
          optionsZh: [
            "他们有所有答案",
            "他们不用解释就能理解",
            "他们会接手护理",
          ],
          correct: 1,
          explanation:
            "The 'me too' moment with another carer is uniquely healing — it ends the isolation.",
          explanationZh:
            "与另一位护理者「我也是」的瞬间有独特的疗愈力——它终结了孤立。",
        },
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
        keyActions: [
          "Book your OWN annual check-up this month.",
          "Walk 20 minutes a day — even broken into 4×5.",
          "Sleep, water, sunlight: pick the weakest one and fix it first.",
        ],
        keyActionsZh: [
          "本月预约您自己的年度健康检查。",
          "每天走 20 分钟——拆成 4 次 5 分钟也可以。",
          "睡眠、饮水、阳光：挑最弱的那项先改善。",
        ],
        reflectQuestion:
          "When was your last check-up, dental visit, or eye test — and why?",
        reflectQuestionZh:
          "您上一次健康检查、看牙、检查视力是什么时候？为什么？",
        quiz: {
          question: "The carer's own health is:",
          questionZh: "护理者自己的健康是：",
          options: [
            "Less important — focus on the patient",
            "Equally critical — the care depends on it",
            "Only matters after caring ends",
          ],
          optionsZh: [
            "比较不重要——专注于患者",
            "同等重要——护理依赖于它",
            "护理结束后才重要",
          ],
          correct: 1,
          explanation:
            "Carer mortality is significantly higher than non-carers. Self-care is patient-care.",
          explanationZh:
            "护理者死亡率明显高于非护理者。照顾自己就是照顾患者。",
        },
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
        keyActions: [
          "Practice 4-in / 6-out breathing 3 times today.",
          "Use it before responding to any hard moment.",
          "Add a 2-minute reset between care tasks.",
        ],
        keyActionsZh: [
          "今天练习 3 次「吸 4 秒/呼 6 秒」呼吸法。",
          "在回应任何艰难时刻前都先做一次。",
          "在护理任务之间加 2 分钟重置时间。",
        ],
        reflectQuestion:
          "When today did you most need to pause and breathe — could you build that into tomorrow?",
        reflectQuestionZh:
          "今天哪个时刻您最需要停下来呼吸？明天能不能把它排进作息？",
        quiz: {
          question: "The longer-out breathing pattern (4 in / 6 out) works because:",
          questionZh: "「吸 4 秒/呼 6 秒」之所以有效，是因为：",
          options: [
            "It distracts you",
            "Long exhale activates the calming nervous system",
            "It's a religious practice",
          ],
          optionsZh: [
            "可以分散注意力",
            "长吐气会启动让人平静的神经系统",
            "是一种宗教练习",
          ],
          correct: 1,
          explanation:
            "Long exhalation activates the parasympathetic nervous system — measurable heart rate drop within 90 seconds.",
          explanationZh:
            "长吐气能启动副交感神经——90 秒内心率就会可测量地下降。",
        },
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
        keyActions: [
          "Allow 10 minutes to feel — write, cry, walk. No fixing.",
          "Tell one trusted person: 'I'm grieving while they're still here.'",
          "Keep one photo of who they were beside one of who they are now.",
        ],
        keyActionsZh: [
          "允许 10 分钟去感受——写下、哭、散步。不试图解决。",
          "告诉一位信任的人：「亲人还在，但我已经在哀悼。」",
          "把他们「曾经的样子」与「现在的样子」的照片并放。",
        ],
        reflectQuestion:
          "What part of who they used to be do you miss most today — and is there a way to honour it?",
        reflectQuestionZh:
          "今天您最想念他们以前的哪一部分？有没有办法纪念这一部分？",
        quiz: {
          question: "Grieving while your loved one is still alive is:",
          questionZh: "亲人还活着时就感到哀伤是：",
          options: [
            "A sign you've given up on them",
            "A normal, valid form of grief",
            "Only normal in the final stage",
          ],
          optionsZh: [
            "您已经放弃他们的征兆",
            "正常且合理的哀伤形式",
            "只有在最后阶段才正常",
          ],
          correct: 1,
          explanation:
            "Ambiguous loss is recognised in clinical psychology — feeling it is healthy, not disloyal.",
          explanationZh:
            "「模糊的失去」在临床心理学中已被认可——感受它是健康的，不代表不忠。",
        },
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
        keyActions: [
          "Ask the doctor about palliative care BEFORE it feels urgent.",
          "Play their favourite music softly — hearing stays late.",
          "Say what matters out loud — 'I love you. Thank you.'",
        ],
        keyActionsZh: [
          "在还不紧急时，就向医生询问安宁照护。",
          "轻轻播放他们最喜欢的音乐——听觉直到最后都还在。",
          "把重要的话说出来——「我爱你。谢谢你。」",
        ],
        reflectQuestion:
          "If today were the last good day, what would you most want to have said or done?",
        reflectQuestionZh:
          "如果今天是最后一个好日子，您最想说出或做到什么？",
        quiz: {
          question: "Palliative care should be discussed:",
          questionZh: "安宁照护应该在什么时候讨论：",
          options: [
            "Only in the final week of life",
            "Early — to plan comfort, not just crisis",
            "Never — it's giving up",
          ],
          optionsZh: [
            "只在生命最后一周",
            "尽早——规划舒适，而不只是危机",
            "永远不要——那是放弃",
          ],
          correct: 1,
          explanation:
            "Palliative care is comfort-focused alongside other treatment. Early conversations preserve the person's wishes.",
          explanationZh:
            "安宁照护是与其他治疗并行的舒适照护。尽早讨论能让当事人的意愿被保留。",
        },
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
