/**
 * WHO iSupport for Dementia — Module Structure
 * Source: https://www.who.int/publications/i/item/9789240005402
 *
 * 5 official modules → 23 lessons. Each lesson maps to:
 *   - A short summary (in-app reading)
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
        summary:
          "Dementia is a syndrome — not one disease — caused by changes in the brain that affect memory, thinking, behaviour and the ability to perform everyday activities.",
        summaryZh:
          "失智症是一种综合症（不是单一疾病），由大脑变化引起，影响记忆、思维、行为以及日常活动能力。",
        contentCategory: "aware",
        contentSubcategory: "understanding",
      },
      {
        key: "types-and-causes",
        title: "Types & causes",
        titleZh: "类型与病因",
        summary:
          "Alzheimer's disease, vascular dementia, Lewy body dementia, frontotemporal dementia and mixed dementia each progress differently.",
        summaryZh:
          "阿尔茨海默病、血管性失智症、路易体失智症、额颞叶失智症和混合型失智症，发展方式各不相同。",
        contentCategory: "aware",
        contentSubcategory: "types",
      },
      {
        key: "signs-and-symptoms",
        title: "Signs & symptoms",
        titleZh: "征兆与症状",
        summary:
          "Memory loss, language problems, disorientation, mood changes and difficulty with familiar tasks are common early signs.",
        summaryZh:
          "记忆力减退、语言障碍、定向力丧失、情绪变化和无法完成熟悉的任务是常见的早期征兆。",
        contentCategory: "aware",
        contentSubcategory: "signs",
      },
      {
        key: "stages",
        title: "Stages of dementia",
        titleZh: "失智症的发展阶段",
        summary:
          "Early, middle and late stages each bring different needs. Knowing the stage helps you plan care and adjust expectations.",
        summaryZh:
          "早期、中期和晚期各有不同需求。了解所处阶段有助于规划护理并调整预期。",
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
        summary:
          "Early diagnosis means earlier access to treatments, support, and time to plan. A GP referral is usually the first step.",
        summaryZh:
          "早期诊断意味着更早获得治疗、支持，以及规划时间。通常第一步是请家庭医生转诊。",
        contentCategory: "aware",
        contentSubcategory: "diagnosis",
      },
    ],
  },
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
        summary:
          "Caring is rewarding but demanding. Recognising what is — and isn't — your responsibility protects you from burnout.",
        summaryZh:
          "护理工作充满意义但也十分艰辛。认清哪些是、哪些不是您的责任，能避免身心疲惫。",
        contentCategory: "care",
        contentSubcategory: "carer-role",
      },
      {
        key: "communication",
        title: "Communicating with the person",
        titleZh: "与失智者沟通",
        summary:
          "Use short sentences, gentle tone, eye contact. Don't argue or correct — redirect and reassure.",
        summaryZh:
          "使用短句、温和的语气、保持眼神接触。不要争辩或纠正——转移话题并给予安慰。",
        contentCategory: "care",
        contentSubcategory: "communication",
      },
      {
        key: "building-team",
        title: "Building your care team",
        titleZh: "建立您的护理团队",
        summary:
          "You don't have to do this alone. Family, friends, professionals and community resources can share the load.",
        summaryZh: "您无需独自承担。家人、朋友、专业人士和社区资源都能分担压力。",
        toolPath: "/care-circle",
        toolLabel: "Open Care Team",
        toolLabelZh: "打开护理团队",
      },
      {
        key: "legal-financial",
        title: "Legal & financial planning",
        titleZh: "法律与财务规划",
        summary:
          "Discuss power of attorney, advance directives and finances early — while the person can still participate.",
        summaryZh:
          "趁失智者仍能参与决策时，尽早讨论委托书、预立医疗指示和财务安排。",
        contentCategory: "care",
        contentSubcategory: "legal",
      },
    ],
  },
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
        summary:
          "Predictable routines reduce confusion and anxiety. Anchor the day around meals, rest and one meaningful activity.",
        summaryZh:
          "规律的日常能减少困惑和焦虑。以三餐、休息和一项有意义的活动为一天的支柱。",
        toolPath: "/calendar",
        toolLabel: "Plan in Calendar",
        toolLabelZh: "在日历中规划",
      },
      {
        key: "personal-care",
        title: "Bathing, dressing & hygiene",
        titleZh: "沐浴、穿衣与卫生",
        summary:
          "Offer choice, preserve dignity, simplify steps. Lay out clothes in order; warm the bathroom first.",
        summaryZh:
          "提供选择、维护尊严、简化步骤。按顺序摆放衣物；先把浴室预热好。",
        contentCategory: "care",
        contentSubcategory: "personal-care",
      },
      {
        key: "eating-nutrition",
        title: "Eating & nutrition",
        titleZh: "饮食与营养",
        summary:
          "Small frequent meals, finger foods, contrasting plate colours. Watch for swallowing changes in later stages.",
        summaryZh:
          "少量多餐、手指食物、餐盘颜色对比鲜明。晚期需留意吞咽功能变化。",
        contentCategory: "care",
        contentSubcategory: "nutrition",
      },
      {
        key: "medication",
        title: "Managing medication",
        titleZh: "药物管理",
        summary:
          "Use a pill organiser, set alarms, keep one master list. Review meds with the doctor every 6 months.",
        summaryZh:
          "使用分药盒、设定提醒、保留一份主用药清单。每 6 个月与医生检视一次药物。",
        toolPath: "/cared-ones",
        toolLabel: "Open Medications",
        toolLabelZh: "打开用药管理",
      },
      {
        key: "meaningful-activities",
        title: "Meaningful activities",
        titleZh: "有意义的活动",
        summary:
          "Music, photo albums, simple gardening or folding laundry — activities tied to past identity bring calm and joy.",
        summaryZh:
          "音乐、相册、简单园艺或叠衣物——与过往身份相关的活动能带来平静与喜悦。",
        contentCategory: "care",
        contentSubcategory: "activities",
      },
    ],
  },
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
        summary:
          "Most 'difficult' behaviour is communication: pain, hunger, fear, boredom or environment. Look for the unmet need first.",
        summaryZh:
          "大多数「难处理」的行为其实是在表达：疼痛、饥饿、恐惧、无聊或环境因素。先找出未被满足的需求。",
        contentCategory: "coping",
        contentSubcategory: "understanding-behaviour",
      },
      {
        key: "agitation",
        title: "Agitation & restlessness",
        titleZh: "躁动与不安",
        summary:
          "Lower noise, dim harsh lights, offer a familiar object, take a short walk. Avoid arguing — redirect attention.",
        summaryZh:
          "降低噪音、调暗刺眼的灯光、递上熟悉的物品、一同散个步。不要争辩——转移注意力。",
        contentCategory: "coping",
        contentSubcategory: "agitation",
      },
      {
        key: "sundowning",
        title: "Sundowning",
        titleZh: "黄昏症候群",
        summary:
          "Late-afternoon confusion is common. Keep evenings calm, well-lit and predictable. Limit caffeine after lunch.",
        summaryZh:
          "下午到傍晚的混乱很常见。让傍晚保持平静、光线充足、规律可预期。午餐后限制咖啡因。",
        contentCategory: "coping",
        contentSubcategory: "sundowning",
      },
      {
        key: "wandering",
        title: "Wandering & getting lost",
        titleZh: "走失与迷路",
        summary:
          "Reduce triggers (boredom, full bladder), secure exits, use ID bracelets and GPS. Plan a search routine.",
        summaryZh:
          "减少诱因（无聊、尿意）、加固门窗、使用 ID 手环和 GPS 装置。预先规划搜寻流程。",
        toolPath: "/gps-tracking",
        toolLabel: "Set up GPS & Safe Zones",
        toolLabelZh: "设定 GPS 与安全区域",
      },
      {
        key: "refusal",
        title: "Refusing care",
        titleZh: "抗拒护理",
        summary:
          "Pause, try again later, change who's helping, break the task into smaller steps. Never force.",
        summaryZh:
          "暂停、稍后再试、换人协助、把任务拆成更小的步骤。绝不强迫。",
        contentCategory: "coping",
        contentSubcategory: "refusal",
      },
      {
        key: "hallucinations",
        title: "Hallucinations & delusions",
        titleZh: "幻觉与妄想",
        summary:
          "Don't argue with what they see — acknowledge their feeling, then gently redirect. Tell the doctor.",
        summaryZh:
          "不要与他们所见之物争辩——先认可他们的感受，再温和地转移注意。并告知医生。",
        contentCategory: "coping",
        contentSubcategory: "hallucinations",
      },
    ],
  },
  {
    key: "looking-after-yourself",
    number: 5,
    title: "Looking After Yourself",
    titleZh: "照顾好自己",
    description:
      "Carer burnout is real. Rest, connection and small daily wellbeing matter.",
    descriptionZh: "护理者倦怠是真实存在的。休息、连结和日常的小确幸都很重要。",
    icon: Sparkles,
    accent: "from-sky-500 to-cyan-600",
    lessons: [
      {
        key: "recognise-stress",
        title: "Recognising carer stress",
        titleZh: "辨识护理者压力",
        summary:
          "Trouble sleeping, irritability, withdrawal and persistent fatigue are warning signs — not weakness.",
        summaryZh:
          "睡眠困难、易怒、退缩、持续疲倦都是警讯——不是软弱。",
        contentCategory: "coping",
        contentSubcategory: "carer-stress",
      },
      {
        key: "respite",
        title: "Taking respite",
        titleZh: "争取喘息时间",
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
        summary:
          "Isolation makes everything harder. Keep one friendship alive, join an online group, share what's happening.",
        summaryZh:
          "孤立会让一切更艰难。保持一段友谊、加入线上互助群、分享您的经历。",
        toolPath: "/community",
        toolLabel: "Visit Community",
        toolLabelZh: "前往社群",
      },
      {
        key: "physical-mental",
        title: "Physical & mental wellbeing",
        titleZh: "身心健康",
        summary:
          "Sleep, movement, sunlight and your own check-ups are not optional. Your body keeps the score.",
        summaryZh:
          "睡眠、运动、阳光和您自己的健康检查都不是可有可无的。身体会记得一切。",
        contentCategory: "coping",
        contentSubcategory: "wellbeing",
      },
    ],
  },
];

export function getModule(key: string): ISupportModule | undefined {
  return ISUPPORT_MODULES.find((m) => m.key === key);
}
