/**
 * WHO iSupport for Dementia — Module Structure
 * Source: WHO iSupport for Dementia training and support manual for carers
 *         (WHO, 2019, ISBN 978-92-4-151586-3)
 *
 * 5 official modules · 23 lessons. Content faithfully adapted for in-app
 * reading; quiz scenarios match the manual's "Check your understanding"
 * sections. Used under the WHO open-access policy for non-commercial,
 * educational dementia-care purposes.
 */

import { BookOpen, Heart, HandHeart, Utensils, Activity, type LucideIcon } from "lucide-react";

export interface ISupportSection {
  heading: string;
  headingZh: string;
  body: string;
  bodyZh: string;
}

export interface ISupportQuiz {
  question: string;
  questionZh: string;
  options: string[];
  optionsZh: string[];
  /** 0-based indices of ALL correct answers (multi-select checklist, WHO format) */
  correctIndices: number[];
  /** Overall feedback shown after submitting */
  explanation: string;
  explanationZh: string;
  /** Optional per-option feedback (✓/✗ rationale, WHO "Check your understanding" style) */
  optionFeedback?: string[] | undefined;
  optionFeedbackZh?: string[] | undefined;
}

type WHOQuiz = Omit<ISupportQuiz, "explanation" | "explanationZh"> &
  Partial<Pick<ISupportQuiz, "explanation" | "explanationZh">>;
type WHOContent = Partial<Omit<ISupportLesson, "quiz" | "quizzes">> & {
  quizzes?: WHOQuiz[] | undefined;
};

export interface ISupportLessonSummary {
  key: string;
  title: string;
  titleZh: string;
  summary: string;
  summaryZh: string;
  readMinutes?: number | undefined;
  /** Optional: link to challenged_content category for related deep-dive articles */
  contentCategory?: string | undefined;
  contentSubcategory?: string | undefined;
  /** Optional: CTA into an in-app tool */
  toolPath?: string | undefined;
  toolLabel?: string | undefined;
  toolLabelZh?: string | undefined;
}

export interface ISupportLesson extends ISupportLessonSummary {
  sections: ISupportSection[];
  keyActions: string[];
  keyActionsZh: string[];
  reflectQuestion: string;
  reflectQuestionZh: string;
  quiz?: ISupportQuiz | undefined;
  /** All WHO \"Check your understanding\" items, in order */
  quizzes?: ISupportQuiz[] | undefined;
}

export interface ISupportModule {
  key: string;
  number: number;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  icon: LucideIcon;
  accent: string;
  lessons: ISupportLessonSummary[];
}

export function getModule(key: string): ISupportModule | undefined {
  return ISUPPORT_MODULES.find((m) => m.key === key);
}

/**
 * Returns the next uncompleted lesson based on a Set of completed "moduleKey/lessonKey" entries.
 * Falls back to the very first lesson if nothing is completed.
 */
export function getNextLesson(
  completed: Set<string>
): { module: ISupportModule; lesson: ISupportLessonSummary } | null {
  for (const mod of ISUPPORT_MODULES) {
    for (const lesson of mod.lessons) {
      const id = `${mod.key}/${lesson.key}`;
      if (!completed.has(id)) {
        return { module: mod, lesson };
      }
    }
  }
  return null;
}

export const TOTAL_LESSONS = 23;

export const ISUPPORT_MODULES: ISupportModule[] = [
  {
    key: "introduction",
    number: 1,
    title: "Introduction to dementia",
    titleZh: "认识失智症",
    description: "What dementia is, what happens to people with dementia, and what to do if you suspect it.",
    descriptionZh: "什么是失智症，失智症患者会经历什么，以及当您怀疑被护理者有失智症时该怎么做。",
    icon: BookOpen,
    accent: "from-amber-500 to-orange-600",
    lessons: [
      {
        key: "intro-to-dementia",
        title: "Introduction to dementia",
        titleZh: "失智症简介",
        readMinutes: 7,
        summary: "Dementia can be overwhelming for both the person with the condition and their carer. This lesson explains the basics of dementia to help clear up common misunderstandings.",
        summaryZh: "失智症不仅可能让失智者本人不知所措，也可能给作为护理者的您带来巨大压力。本课程将阐释关于失智症的基本知识，帮助澄清一些常见的误解。",
      }
    ],
  },
  {
    key: "being-a-carer",
    number: 2,
    title: "Being a carer",
    titleZh: "作为护理者",
    description: "The carer journey: communication, supported decision-making, and involving others.",
    descriptionZh: "护理者的旅程：沟通、协助决策，以及让他人参与。",
    icon: HandHeart,
    accent: "from-rose-500 to-pink-600",
    lessons: [
      {
        key: "the-journey-together",
        title: "The journey together",
        titleZh: "共同的旅程",
        readMinutes: 5,
        summary: "Dealing with dementia is a journey you will take together, because it changes the daily life of both the person living with dementia and the carer. This lesson teaches you skills for your journey together: to stay connected, involve others, take care of yourself, and plan for the future.",
        summaryZh: "应对失智症是您与失智者共同的旅程，因为它改变了失智者和失智者的日常生活。本课将教您一些技巧，以便在共同的旅程中保持联结、让他人参与、照顾好自己，并为未来做好规划。",
      },
      {
        key: "improving-communication",
        title: "Improving communication",
        titleZh: "改善沟通",
        readMinutes: 8,
        summary: "Dementia can often make communication difficult, so this lesson helps you learn to talk in a simple, direct, and compassionate way in everyday situations.",
        summaryZh: "失智症常使沟通变得困难，因此本节课将帮助您学会在日常情境中以简单、直接和富有同情心的方式进行交谈。",
      },
      {
        key: "supported-decision-making",
        title: "Supported decision-making",
        titleZh: "支持性决策",
        readMinutes: 5,
        summary: "This lesson explains that decision-making can become more difficult for a person with dementia over time and teaches carers how to support them in making their own decisions for as long as possible.",
        summaryZh: "本课程解释了随着时间的推移，失智症人士的决策能力可能会变得越来越困难，并教导护理者如何支持他们尽可能长时间地自己做决定。",
      },
      {
        key: "involving-others",
        title: "Involving others",
        titleZh: "让其他人参与进来",
        readMinutes: 6,
        summary: "Sharing caregiving responsibilities with other people will help you to continue providing care in the long term.",
        summaryZh: "与他人分担护理责任将有助于您长期持续地提供护理。",
      }
    ],
  },
  {
    key: "caring-for-me",
    number: 3,
    title: "Caring for me",
    titleZh: "照顾自己",
    description: "Reduce stress, make time for pleasant activities, and learn to think differently.",
    descriptionZh: "减轻压力、为愉快的活动留出时间，并学会换一种方式思考。",
    icon: Heart,
    accent: "from-primary to-primary",
    lessons: [
      {
        key: "reducing-stress",
        title: "Reducing stress in everyday life",
        titleZh: "减轻日常生活中的压力",
        readMinutes: 8,
        summary: "Taking care of yourself is important for continuing to care for someone with dementia. This lesson provides quick exercises to help you reduce stress and renew your energy.",
        summaryZh: "照顾好自己对于持续护理失智症者很重要。本节课提供了一些快速的练习，帮助您减轻压力、恢复精力。",
      },
      {
        key: "pleasant-activities",
        title: "Making time for pleasant activities",
        titleZh: "为愉快的活动安排时间",
        readMinutes: 5,
        summary: "It is important to take care of yourself while caring for another person. This lesson will help you take time for yourself and do pleasant activities to relax and continue providing care.",
        summaryZh: "在护理他人的同时，照顾好自己也很重要。本课将帮助您为自己留出时间，进行愉快的活动来放松身心，从而能够继续提供护理。",
      },
      {
        key: "thinking-differently",
        title: "Thinking differently",
        titleZh: "换个想法",
        readMinutes: 6,
        summary: "Your thoughts, not events, determine how you feel. This lesson will help you identify and change unhelpful thoughts into helpful ones, which can make you feel better and cope more effectively.",
        summaryZh: "你的想法，而非事件本身，决定了你的感受。本课将帮助你识别并改变无益的想法，将其转变为有益的想法，这能让你感觉更好，更有效地应对问题。",
      }
    ],
  },
  {
    key: "everyday-care",
    number: 4,
    title: "Providing everyday care",
    titleZh: "提供日常护理",
    description: "Mealtimes, nutrition, toileting, personal care, and creating an enjoyable day.",
    descriptionZh: "用餐、营养、如厕、个人护理，以及让一天过得愉快。",
    icon: Utensils,
    accent: "from-sky-500 to-blue-600",
    lessons: [
      {
        key: "pleasant-mealtimes",
        title: "Eating and drinking - more pleasant mealtimes",
        titleZh: "饮食——让用餐时间更愉快",
        readMinutes: 6,
        summary: "",
        summaryZh: "",
      },
      {
        key: "preventing-health-problems",
        title: "Eating, drinking and preventing health problems",
        titleZh: "饮食与预防健康问题",
        readMinutes: 6,
        summary: "Dementia can affect eating and drinking in various ways depending on the stage of dementia and other health conditions.",
        summaryZh: "失智症会以多种方式影响饮食，具体取决于失智症的阶段和其他健康状况。",
      },
      {
        key: "toileting-continence",
        title: "Toileting and continence care",
        titleZh: "如厕和失禁护理",
        readMinutes: 6,
        summary: "This lesson explains how poor toileting and incontinence can lead to health problems and social withdrawal for a person with dementia, and offers solutions to help you assist them.",
        summaryZh: "本课解释了如厕和失禁问题如何导致失智症人士出现健康问题和社交退缩，并提供了帮助您协助他们的解决方案。",
      },
      {
        key: "personal-care",
        title: "Personal care",
        titleZh: "个人护理",
        readMinutes: 6,
        summary: "This lesson explains why assisting with personal care is important for people with dementia and will help you think about their health concerns and how to assist them.",
        summaryZh: "本课解释了为什么协助失智症人士进行个人护理非常重要，并将帮助您思考他们的健康问题以及如何为他们提供协助。",
      },
      {
        key: "enjoyable-day",
        title: "An enjoyable day",
        titleZh: "愉快的一天",
        readMinutes: 6,
        summary: "It is important to maintain routines and activities that are familiar to a person living with dementia to help create an enjoyable day and to adapt them as their abilities change.",
        summaryZh: "维持失智症人士熟悉的日常惯例和活动，并根据他们能力的变化进行调整，对于帮助他们度过愉快的一天至关重要。",
      }
    ],
  },
  {
    key: "behaviour-changes",
    number: 5,
    title: "Dealing with behaviour changes",
    titleZh: "应对行为变化",
    description: "Memory loss, aggression, depression, sleep issues, hallucinations, walking, and more.",
    descriptionZh: "记忆衰退、攻击行为、抑郁、睡眠问题、幻觉、走失等等。",
    icon: Activity,
    accent: "from-violet-500 to-purple-600",
    lessons: [
      {
        key: "intro-behaviour-changes",
        title: "Introduction to behaviour changes",
        titleZh: "行为改变简介",
        readMinutes: 5,
        summary: "Dementia changes the way people behave, think or act. This can be distressing not only for the person with dementia, but also for their families and carers.",
        summaryZh: "失智症会改变人们的行为、思维或处事方式。这不仅可能让失智者本人感到痛苦，也可能让其家人和护理者感到痛苦和不安。",
      },
      {
        key: "memory-loss",
        title: "Memory loss",
        titleZh: "记忆力减退",
        readMinutes: 5,
        summary: "Memory loss can be frustrating for the person living with dementia and the carer. In this lesson you will practice several ways to respond to memory loss, and find out what may help you deal with the person’s increasing forgetfulness.",
        summaryZh: "记忆力减退对失智症者和护理者来说都可能令人沮丧。在本课程中，您将练习几种应对记忆力减退的方法，并了解哪些方法可能有助于您应对失智症者日益严重的健忘问题。",
      },
      {
        key: "aggression",
        title: "Aggression",
        titleZh: "攻击行为",
        readMinutes: 5,
        summary: "This lesson helps you understand the possible causes of aggression in people with dementia and improves your skills to prevent or deal with it, which is often one of the most difficult things for carers to cope with.",
        summaryZh: "本节课帮助您了解失智症患者出现攻击性行为的可能原因，并提高您预防或处理攻击性行为的技能，这通常是护理者最难应对的事情之一。",
      },
      {
        key: "depression-anxiety-apathy",
        title: "Depression, anxiety and apathy",
        titleZh: "抑郁、焦虑和冷漠",
        readMinutes: 6,
        summary: "This lesson helps you understand the possible causes of depression and anxiety in people with dementia, while improving your skills to prevent or reduce mood problems.",
        summaryZh: "本课程帮助您了解失智症患者出现抑郁和焦虑的可能原因，同时提高您预防或减少情绪问题的技能。",
      },
      {
        key: "difficulty-sleeping",
        title: "Difficulty sleeping",
        titleZh: "睡眠困难",
        readMinutes: 6,
        summary: "People with dementia may have difficulty sleeping, which can impact the carer’s sleep as well. This lesson will provide examples and practice to promote good sleep.",
        summaryZh: "失智症患者可能会有睡眠困难，这也会影响护理者的睡眠。本节课将提供促进良好睡眠的例子和练习。",
      },
      {
        key: "delusions-hallucinations",
        title: "Delusions and hallucinations",
        titleZh: "错觉和幻觉",
        readMinutes: 6,
        summary: "This lesson explains why people with dementia experience unreal thoughts (delusions) or see things that aren't there (hallucinations), and helps you identify ways to stop, reduce, or respond to them.",
        summaryZh: "本节课程解释了为什么失智症患者会出现不真实的想法（妄想）或看到不存在的东西（幻觉），并帮助您找到阻止、减少或应对这些情况的方法。",
      },
      {
        key: "repetitive-behaviour",
        title: "Repetitive behaviour",
        titleZh: "重复性行为",
        readMinutes: 4,
        summary: "This lesson explains why repetitive behaviours occur in people with dementia and how carers can respond to and reduce them, as this behaviour can be stressful for both the person and the carer.",
        summaryZh: "本课解释了为什么失智症者会出现重复行为，以及护理者如何应对和减少这些行为，因为这种行为可能给失智症者和护理者都带来压力。",
      },
      {
        key: "walking-getting-lost",
        title: "Walking and getting lost",
        titleZh: "行走与走失",
        readMinutes: 6,
        summary: "Concerns about a person with dementia walking around and getting lost can cause distress. This lesson helps you understand the reasons for this behaviour and what you can do to reduce the chances of them getting lost.",
        summaryZh: "对失智症者四处行走和走失的担忧可能会导致困扰。本节课将帮助您了解他们行走的原因，以及您可以做些什么来减少他们走失的机会。",
      },
      {
        key: "changes-in-judgement",
        title: "Changes in judgement",
        titleZh: "判断力改变",
        readMinutes: 7,
        summary: "Changes in judgement can be upsetting for both the person with dementia and their carer. This lesson will help you understand and manage these changes.",
        summaryZh: "判断力的改变可能会让失智症人士和其护理者感到不安。本课程将帮助您理解和管理这些改变。",
      },
      {
        key: "putting-it-all-together",
        title: "Putting it all together",
        titleZh: "融会贯通",
        readMinutes: 5,
        summary: "Certain changes in behaviour can be particularly stressful for the person living with dementia and the carer.",
        summaryZh: "某些行为变化可能会给失智症患者和护理者带来特别大的压力。",
      }
    ],
  }
];

/** Load the full WHO lesson only when a reader opens that lesson. */
export async function loadLessonContent(
  moduleKey: string,
  lessonKey: string,
): Promise<ISupportLesson | undefined> {
  const summary = getModule(moduleKey)?.lessons.find((lesson) => lesson.key === lessonKey);
  if (!summary) return undefined;

  const { default: whoContent } = await import("./isupport-who-content.json");
  const content = (whoContent as unknown as Record<string, WHOContent>)[lessonKey];
  if (!content) return undefined;
  const quizzes = (content.quizzes ?? []).map((quiz) => ({
    ...quiz,
    explanation: quiz.explanation ?? "",
    explanationZh: quiz.explanationZh ?? "",
  }));

  return {
    ...summary,
    summary: content.summary ?? summary.summary,
    summaryZh: content.summaryZh ?? summary.summaryZh,
    sections: content.sections ?? [],
    keyActions: content.keyActions ?? [],
    keyActionsZh: content.keyActionsZh ?? [],
    reflectQuestion: content.reflectQuestion ?? "",
    reflectQuestionZh: content.reflectQuestionZh ?? "",
    quizzes,
    quiz: quizzes[0],
    toolPath: undefined,
  };
}

export const ISUPPORT_SOURCE_ATTRIBUTION = {
  en: "Adapted from WHO iSupport for Dementia: Training and support manual for carers of people with dementia (WHO, 2019).",
  zh: "改编自世界卫生组织《iSupport 失智症照护：失智症患者护理者培训与支持手册》（WHO, 2019）。",
  url: "https://www.who.int/publications/i/item/9789241515863",
};

