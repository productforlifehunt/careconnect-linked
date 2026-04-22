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
  optionFeedback?: string[];
  optionFeedbackZh?: string[];
}

export interface ISupportLesson {
  key: string;
  title: string;
  titleZh: string;
  summary: string;
  summaryZh: string;
  sections: ISupportSection[];
  keyActions: string[];
  keyActionsZh: string[];
  reflectQuestion: string;
  reflectQuestionZh: string;
  quiz: ISupportQuiz;
  readMinutes?: number;
  /** Optional: link to challenged_content category for related deep-dive articles */
  contentCategory?: string;
  contentSubcategory?: string;
  /** Optional: CTA into an in-app tool */
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
  accent: string;
  lessons: ISupportLesson[];
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
): { module: ISupportModule; lesson: ISupportLesson } | null {
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
    descriptionZh: "什么是失智症，失智症患者会经历什么，以及当您怀疑亲人有失智症时该怎么做。",
    icon: BookOpen,
    accent: "from-amber-500 to-orange-600",
    lessons: [
      {
        key: "intro-to-dementia",
        title: "Introduction to dementia",
        titleZh: "失智症简介",
        readMinutes: 7,
        summary: "This lesson explains the basics of dementia, including what it is and how it affects a person. It aims to dispel common myths and provide essential information for carers to understand the disease.",
        summaryZh: "本课旨在解释失智症的基础知识，包含其定义、对患者的影响，以消除常见的误解，并为护理者提供了解此疾病的基本信息。",
        sections: [
          { heading: "What is dementia?", headingZh: "1. 什么是失智症？", body: "Dementia is a progressive brain disease, not a part of normal ageing. It affects people from all societal groups, regardless of class, gender, or ethnicity. While it is more common in older people, younger individuals can also be affected.", bodyZh: "失智症是一种随着时间的推移会逐渐损害大脑的疾病，它并非正常衰老的一部分。失智症影响所有社会群体，无论其阶层、性别或种族背景如何。虽然在老年人中更常见，但年轻人也可能受到影响。" },
          { heading: "What causes dementia?", headingZh: "2. 什么原因导致失智症？", body: "Dementia is caused by various diseases that destroy nerve cells and damage the brain. The most common cause is Alzheimer’s disease. Other causes include Vascular dementia, which results from brain damage due to impaired blood flow, and dementia with Lewy bodies, caused by abnormal protein deposits in nerve cells.", bodyZh: "失智症由多种破坏神经细胞并损害大脑的疾病引起。最常见的原因是阿尔茨海默病。其他原因包括因血流受阻导致脑损伤的血管性失智症，以及由神经细胞中异常蛋白质沉积引起的路易体失智症。" },
          { heading: "What happens to people with dementia as the disease progresses?", headingZh: "3. 失智症患者的病情会如何发展？", body: "Dementia affects each person differently, influenced by their personality, health, and environment. The disease generally progresses through stages: early-stage memory problems and disorientation, middle-stage need for help with daily activities, and late-stage potential failure to recognize relatives and significant behavioural changes.", bodyZh: "失智症对每个人的影响都不同，这受到他们性格、健康状况和生活环境的影响。该疾病通常会分阶段发展：早期阶段出现记忆问题和迷失方向，中期阶段在日常活动上需要帮助，晚期阶段则可能无法识别亲人并出现显著的行为变化。" },
          { heading: "What to do if you think that the person you care for has dementia?", headingZh: "4. 如果您认为被护理者患有失智症该怎么办？", body: "If you suspect a person may have dementia, the crucial first step is to arrange for them to see a medical doctor. A doctor can perform examinations to provide a diagnosis and rule out other treatable conditions that may cause similar memory problems, such as depression or medication side effects.", bodyZh: "如果您怀疑某人可能患有失智症，关键的第一步是安排他们去看医生。医生可以进行检查以提供诊断，并排除其他可能导致类似记忆问题的可治疗疾病，如抑郁症或药物副作用。" },
          { heading: "How to reach out for help?", headingZh: "5. 如何寻求帮助？", body: "As a carer, you are not expected to manage everything alone, especially as the disease progresses. It is important to seek support from family, friends, and professional organizations. Contacting your local Alzheimer's Association can provide valuable information and connect you with available support and care services.", bodyZh: "作为一名护理者，您不必独自承担所有事情，尤其是在病情发展的情况下。寻求家人、朋友和专业组织的支持非常重要。联系您当地的阿尔茨海默病协会可以获得宝贵的信息，并帮助您链接到可用的支持和护理服务。" },
          { heading: "What is the focus of this manual?", headingZh: "6. 本手册的重点是什么？", body: "This manual is focused on you, the carer. It provides support to help you cope with daily caregiving challenges and emphasizes the importance of taking care of yourself, not just the person with dementia. It also presents common scenarios to prepare you for potential situations.", bodyZh: "本手册的重点是作为护理者的您。它为您提供支持，以帮助您应对日常护理的挑战，并强调照顾好自己与照顾失智症患者同样重要。手册还提供了一些常见场景，让您为可能发生的情况做好准备。" },
        ],
        keyActions: ["If you suspect dementia, ensure the person sees a medical doctor for an examination.", "Reach out to family members, friends, and professional organizations or services for help.", "Contact your local Alzheimer’s Association for information, support, and care available in your area."],
        keyActionsZh: ["如果您怀疑家人或朋友可能患有失智症，请确保他们去看医生进行检查。", "向家人、朋友和专业组织或服务机构寻求帮助。", "联系您当地的阿尔茨海默病协会，以获取您所在地区可用的信息、支持和护理服务。"],
        reflectQuestion: "Here are some common things that may happen to people with dementia. Do you think that your family member/friend/the person that you care for experiences any of the following?",
        reflectQuestionZh: "这里有一些失智症患者可能发生的常见情况。您认为您所照顾的家人/朋友/被护理者是否经历了以下任何一种情况？",
        quiz: {
          question: "What is the first step if you think that a family member or friend has dementia?",
          questionZh: "如果您认为家人或朋友患有失智症，第一步该怎么做？",
          options: ["Call a friend or relative.", "Use iSupport alone for help.", "Call a medical doctor’s office and make an appointment.", "The person has been to a medical doctor already and has been diagnosed with dementia."],
          optionsZh: ["打电话给朋友或亲戚。", "仅使用iSupport寻求帮助。", "打电话给医生办公室并预约。", "该人员已经看过医生并被诊断出患有失智症。"],
          correctIndices: [2, 3],
          explanation: "If you suspect someone has dementia, it's crucial to see a doctor for a proper diagnosis. Friends and family can provide support, but cannot replace a medical professional. If a diagnosis has already been made, you have completed this important first step.",
          explanationZh: "如果您怀疑某人患有失智症，寻求医生进行正确诊断是至关重要的一步。朋友和家人可以提供支持，但无法取代医疗专业人员。如果已经确诊，那么您已经完成了这重要的第一步。",
          optionFeedback: ["While friends and family can offer support, this cannot replace a medical exam given by a certified medical doctor.", "While this manual provides information and support, it cannot replace a medical exam given by a certified medical doctor.", "This is the best first step if you have not done so already.", "You have already completed the first important step."],
          optionFeedbackZh: ["虽然朋友和家人可以提供支持，但这不能替代由执业医生进行的医学检查。", "虽然本手册提供信息和支持，但它不能替代由执业医生进行的医学检查。", "如果您还没有这样做，这是最好的第一步。", "您已经完成了重要的第一步。"],
        },
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
        summary: "This lesson is about navigating the journey of dementia with a loved one. It emphasizes the importance of talking about the changes dementia brings, planning for the future together, involving others for support, and finding ways to maintain your connection and intimacy. It also highlights the need for carers to plan pleasant activities and relaxation for themselves to avoid burnout.",
        summaryZh: "本课程是关于如何与挚爱的人一起走过失智症的旅程。课程强调了沟通失智症带来的变化、共同规划未来、让其他人参与支持以及寻找保持你们之间联系和亲密感方法的重要性。课程也同样强调了护理者需要为自己计划愉快的活动和放松，以避免过度劳累。",
        sections: [
          { heading: "How to stay connected with the person with dementia?", headingZh: "如何与失智症人士保持联系？", body: "It is important to keep talking together about dementia and its effects. The sooner you start these conversations, the better, as dementia will make this more difficult over time. Discussing the changes happening now and what might occur in the future helps you both stay connected.", bodyZh: "就失智症及其影响持续进行沟通是非常重要的。越早开始这些对话越好，因为随着时间的推移，失智症会使沟通变得更加困难。讨论当前发生的变化和未来可能发生的情况，有助于你们双方保持联系。" },
          { heading: "How to plan pleasant activities and relaxation?", headingZh: "如何规划愉快的活动和放松？", body: "As caregiving becomes more time-consuming, it is crucial for carers to take time for themselves. Many carers can experience stress and burnout. Therefore, your journey together should include planning pleasant activities and relaxation for yourself.", bodyZh: "由于护理工作愈发耗时，护理者为自己花时间至关重要。许多护理者可能会经历压力和倦怠。因此，你们的共同旅程应包括为您自己规划愉快的活动和放松。" },
          { heading: "How to involve others?", headingZh: "如何让他人参与？", body: "Caring for someone with dementia does not have to be a lonely experience. It can be helpful to talk about your thoughts and feelings with others who may not understand what you're going through. Let friends and family know when you need a break, as caregiving can be too big a job for one person.", bodyZh: "照顾失智症人士不一定是一种孤独的经历。与那些可能不完全理解您经历的人谈论您的想法和感受，可能会对您有帮助。当您需要休息时，请告诉朋友和家人，因为护理工作对一个人来说可能任务过于繁重。" },
          { heading: "How to plan well for the future?", headingZh: "如何为未来做好规划？", body: "It's important to discuss and prepare for the future with the person you care for. Planning early allows the person with dementia to better express their wishes regarding future care providers, costs, and end-of-life decisions. Where possible, discuss topics that concern you.", bodyZh: "与您所护理的人一起讨论和准备未来非常重要。及早规划可以让失智症人士更好地表达他们对未来护理提供者、费用和临终决策的愿望。在可能的情况下，讨论您关心的话题。" },
          { heading: "Intimate relationships may change", headingZh: "亲密关系可能会改变", body: "As dementia progresses, the nature of intimate relationships may change. While physical intimacy and sexual relations may become more difficult, it is still possible for partners to maintain a connection and show affection in other ways.", bodyZh: "随着失智症的进展，亲密关系的性质可能会发生改变。虽然身体上的亲密和性关系可能变得更加困难，但伴侣仍然可以通过其他方式保持联系和表达情感。" },
        ],
        keyActions: ["Use touch, hold hands or do a gentle massage to communicate warmth, connection, safety and love.", "Use music – it is truly a universal language. Play music that the person you care for likes and that makes them feel good.", "Try to maintain your sense of humour. This will help reduce frustration and tension.", "Talk with them about what they like and need – it’s an important conversation to have more than once, as things change over time."],
        keyActionsZh: ["通过触摸、牵手或温柔的按摩来传达温暖、联系、安全和爱。", "运用音乐——它是一种真正的通用语言。播放您所护理的人喜欢并能让他们感觉良好的音乐。", "努力保持你的幽默感。这将有助于减少挫败感和紧张感。", "与他们谈论他们喜欢什么和需要什么——这是一个重要的对话，需要随着情况的变化而多次进行。"],
        reflectQuestion: "What are the person’s preferences when they are no longer able to bathe themselves? For example, would they prefer a male or female to help bathe them? How do they feel about having a close family member bathe them or would they prefer a qualified professional who is unrelated?",
        reflectQuestionZh: "当被护理的人不再能自己洗澡时，他们有什么偏好？例如，他们是更喜欢男性还是女性来帮助他们洗澡？他们对于由亲近的家人为他们洗澡感觉如何，还是更愿意一个不相关的合格专业人士来做？",
        quiz: {
          question: "Frustration about memory loss. How should Jacob approach Olivia about what happened?",
          questionZh: "因记忆力下降而感到的挫败感。雅各布应该如何就发生的事情与奥利维亚沟通？",
          options: ["Leave Olivia alone and see what happens.", "Ask Olivia to ‘work harder’ to remember things.", "Do not let Olivia shop anymore.", "Ask Olivia how she feels about her memory loss.", "Do not blame Olivia, but make a shopping list together with her each time prior to shopping."],
          optionsZh: ["让奥利维亚一个人待着，看看会发生什么。", "要求奥利维亚‘更努力’去记住事情。", "不再让奥利维亚购物。", "询问奥利维亚对她记忆力下降的感受。", "不要责备奥利维亚，而是在每次购物前和她一起列一个购物清单。"],
          correctIndices: [3, 4],
          explanation: "It's important to address the issue by discussing its impact and staying connected. Finding practical solutions that help the person maintain their independence and dignity is more helpful than ignoring the problem, blaming them, or taking away activities they care about.",
          explanationZh: "重要的是通过讨论其影响来解决问题并保持联系。寻找能够帮助患者保持独立和尊严的实用解决方案，比忽视问题、责备他们或剥夺他们关心的活动更有帮助。",
          optionFeedback: ["This is not a helpful response, because Olivia and Jacob both feel frustrated. To stay connected it is important to talk about their frustration and worries about the future.", "This is not a good response, because memory loss is part of living with dementia, it is unlikely to change.", "This is not a good response because doing the shopping is important to Olivia. Shopping may give Olivia purpose in life and a feeling of dignity.", "This is a good response because Jacob is addressing the issue by discussing its impact on Olivia and staying ‘connected’. Jacob could also share his own worries about he memory loss.", "This is a very good response, because this will help Olivia to continue shopping and maintain her independence as long as possible."],
          optionFeedbackZh: ["这不是一个有帮助的回应，因为奥利维亚和雅各布都感到沮丧。为了保持联系，重要的是要谈论他们的挫败感和对未来的担忧。", "这不是一个好的回应，因为记忆丧失是失智症的一部分，它不可能改变。", "这不是一个好的回应，因为购物对奥利维亚很重要。购物可以给奥利维亚带来生活的目标和尊严感。", "这是一个很好的回应，因为雅各布通过讨论此事对奥利维亚的影响来解决问题，并保持‘联系’。雅各布也可以分享他自己对记忆力下降的担忧。", "这是一个非常好的回应，因为这将帮助奥利维亚继续购物，并尽可能长时间地保持她的独立性。"],
        },
      },
      {
        key: "improving-communication",
        title: "Improving communication",
        titleZh: "改善沟通",
        readMinutes: 8,
        summary: "This lesson will help you show compassion and explain some important basic communication skills. Effective communication is crucial, as dementia can impair hearing and sight, so it's important to make adjustments to the environment or seek medical check-ups to support the person.",
        summaryZh: "本课程将帮助您展现同理心，并说明一些重要的基本沟通技巧。有效的沟通至关重要，因为失智症可能会损害听力和视力，因此重要的是要对环境进行调整或寻求医疗检查以支持失智症患者。",
        sections: [
          { heading: "How to check the person’s ability to hear and see?", headingZh: "如何检查失智症患者的听力和视力？", body: "Dementia can affect a person's sight and hearing, which are fundamental to communication. It's important to assess and improve their ability to see by ensuring adequate lighting, using contrasting colors, and making sure their glasses are clean and the correct prescription. For hearing, minimize background noise, ensure hearing aids are worn correctly and are functional, and consult a doctor if hearing loss is suspected.", bodyZh: "失智症会影响患者的视力和听力，而这是沟通的基础。重要的是要评估和提高他们的视力，确保充足的光线，使用对比鲜明的颜色，并确保他们的眼镜干净且度数正确。对于听力，应尽量减少背景噪音，确保助听器佩戴正确且功能正常，如果怀疑有听力损失，应咨询医生。" },
          { heading: "How to get attention in a respectful way?", headingZh: "如何以尊重的方式获得关注？", body: "The first step to good communication is getting the person's attention respectfully, as they have feelings regardless of the stage of their dementia. Effective methods include speaking clearly and slowly at eye level, using a gentle touch on the hand or arm, and calling them by a name they recognize. Avoid shouting, approaching from behind, or physically restraining them, as this can cause distress.", bodyZh: "良好沟通的第一步是以尊重的方式获得患者的注意，因为无论失智症发展到哪个阶段，他们都是有感情的。有效的方法包括在平视位置清晰、缓慢地说话，轻触手或胳膊，以及用他们认可的名字称呼他们。避免喊叫、从背后靠近或强行控制他们，因为这可能会引起痛苦。" },
          { heading: "How to keep it simple?", headingZh: "如何保持简单？", body: "Complicated language can be difficult for a person with dementia to understand, so simplifying your communication is key. Use short, simple sentences and discuss one topic at a time, and minimize distracting background noises. When necessary, switch from open-ended questions to closed-ended yes/no questions to make it easier for them to respond.", bodyZh: "复杂的语言可能让失智症患者难以理解，因此简化您的沟通是关键。使用简短、简单的句子，一次只讨论一个主题。尽量减少电视或收音机等分散注意力的背景噪音。必要时，将开放式问题转换为可以用“是”或“否”回答的封闭式问题，使他们更容易回应。" },
          { heading: "How to take the person seriously?", headingZh: "如何认真对待失智症患者？", body: "Even if the language used by a person with dementia seems confusing or strange, it is crucial to take them seriously as they are trying to communicate something important. Be patient and give them time to find their words. Avoid talking about them in their presence as if they are not there, which can be disrespectful and hurtful.", bodyZh: "即使失智症患者使用的语言看似混乱或奇怪，认真对待他们也至关重要，因为他们正努力传达一些重要信息。要有耐心，给他们时间找到合适的词语。避免在他们面前把他们当作不在场一样谈论他们，这可能是不尊重和伤人的。" },
          { heading: "How to pay attention to reactions?", headingZh: "如何注意反应？", body: "A person's facial expressions and body language convey a lot about their feelings. Observing these non-verbal cues, like smiling, fidgeting, or crossed arms, can help you understand their emotional state, such as happiness, nervousness, or anxiety. Paying attention to these reactions is a key part of effective communication.", bodyZh: "一个人的面部表情和肢体语言可以传达很多关于他们感受的信息。观察这些非语言线索，如微笑、坐立不安或双臂交叉，可以帮助您了解他们的情绪状态，例如快乐、紧张或焦虑。注意这些反应是有效沟通的关键部分。" },
          { heading: "How to give compliments?", headingZh: "如何给予赞美？", body: "Complimenting the person you care for is an effective communication tool that makes them feel good. Focusing on what they are doing well is more helpful than pointing out mistakes. Compliments can be about something they've done, how they look, or simply expressing your appreciation for them, which reinforces positive feelings.", bodyZh: "赞美您所护理的人是一种有效的沟通工具，能让他们感觉良好。关注他们做得好的地方比指正错误更有帮助。赞美可以关乎他们做成的事、他们的外表，或仅仅是表达您对他们的欣赏，这能增强积极的情感。" },
          { heading: "How to show compassion?", headingZh: "如何表达同理心？", body: "Showing compassion is vital, even when communication becomes difficult or repetitive due to dementia. Remember that dementia is a disease, and the person may not recall what they just said, so patience and extra effort are required. Responding to the underlying emotion behind their words or questions, rather than just the words themselves, is a powerful way to show you care.", bodyZh: "即使由于失智症导致沟通变得困难或重复，表达同理心也至关重要。请记住，失智症是一种疾病，患者可能不记得他们刚刚说过的话，因此需要额外的努力和耐心。回应他们言语或问题背后的潜在情感，而不仅仅是话语本身，是表达您关心的有力方式。" },
        ],
        keyActions: ["Check the person's ability to hear and see.", "Get attention in a respectful way.", "Keep your communication simple.", "Take the person you care for seriously.", "Pay attention to their reactions and body language.", "Give compliments."],
        keyActionsZh: ["检查患者的听力和视力。", "以尊重的方式获得关注。", "保持沟通简单。", "认真对待您护理的人。", "注意他们的反应和肢体语言。", "给予赞美。"],
        reflectQuestion: "Think about all the things that you like about the person you care for. Now try to write down something you would say to give them a compliment.",
        reflectQuestionZh: "想想所有你喜欢你所护理的人的地方。现在试着写下一些你会用来赞美他们的话。",
        quiz: {
          question: "Below are some suggested ways to get the attention of a person living with dementia. What are the right and wrong answers?",
          questionZh: "以下是吸引失智症患者注意力的一些建议方法。哪些是正确的，哪些是错误的？",
          options: ["Raise your voice or shout.", "Speak clearly and slowly, at a volume that is comfortable for the person, face to face and at eye level.", "Tap a hand, arm or front of the shoulder.", "Stop and hold the person to make him or her listen.", "Approach the person from the back and touch their shoulder.", "Call the person living with dementia by a name that they recognize."],
          optionsZh: ["提高你的声音或大喊。", "面对面，在同一视线水平，以对方感到舒适的音量，清晰而缓慢地说话。", "轻拍手、胳膊或肩膀前方。", "停下来并抓住患者，让他/她听你说话。", "从背后接近并触摸患者的肩膀。", "用失智症患者认可的名字称呼他们。"],
          correctIndices: [1, 2, 5],
          explanation: "",
          explanationZh: "",
          optionFeedback: ["Raising your voice is not a respectful way to gain attention. It may even make the person living with dementia feel sad, frustrated or angry.", "This is an appropriate way to make contact. It shows that you are seeking contact in a respectful manner.", "This is a good way to attract the attention of a person living with dementia.", "This is not a respectful way to get attention. It may even make the person living with dementia feel distressed or angry.", "This may startle someone who is not expecting you or perhaps did not hear you coming.", "This is a good way to attract the attention of a person living with dementia. You might use their first name or a nickname that was used in the past."],
          optionFeedbackZh: ["提高声音不是一种尊重的吸引注意力的方式。这甚至可能让失智症患者感到悲伤、沮丧或愤怒。", "这是一种恰当的建立联系的方式。它表明您正在以尊重的方式寻求接触。", "这是吸引失智症患者注意力的好方法。", "这不是一种尊重的吸引注意力的方式。这甚至可能让失智症患者感到痛苦或愤怒。", "这可能会吓到没有预料到您或可能没听到您走近的人。", "这是吸引失智症患者注意力的好方法。您可以使用他们的名字或过去常用的昵称。"],
        },
      },
      {
        key: "supported-decision-making",
        title: "Supported decision-making",
        titleZh: "支持性决策",
        readMinutes: 5,
        summary: "This lesson explains why decision-making can be difficult for a person with dementia and how you can support them. Making decisions that align with the person's interests and wishes can help them remain independent.",
        summaryZh: "本课程解释了为什么做决定对失智症患者来说可能很困难，以及您可以如何支持他们。做出符合患者兴趣和意愿的决定可以帮助他们保持独立。",
        sections: [
          { heading: "How to make decisions in someone's best interest?", headingZh: "如何做出最符合他人利益的决定？", body: "Everyone needs to make decisions. For a person with dementia, your support is essential to help them clarify what they want. Decisions that align with their interests and needs enhance their independence. However, decision-making can be challenging for them due to memory loss or difficulties in thinking and expressing themselves.", bodyZh: "每个人都需要做决定。对于失智症患者，您的支持对于帮助他们阐明自己的愿望至关重要。符合他们兴趣和需求的决定能增强他们的独立性。然而，由于记忆力减退或思维和表达困难，做决定对他们来说可能具有挑战性。" },
          { heading: "How to support someone with dementia to make everyday decisions?", headingZh: "如何支持失智症患者做出日常决定？", body: "It's important to encourage the person you care for to do whatever they are still able to. Supporting them in making decisions helps them to be more independent and can also improve their self-esteem. For example, instead of choosing their clothes for them, you can ask them what they want to wear.", bodyZh: "鼓励您所护理的人做任何他们仍有能力做的事情是很重要的。支持他们做决定能帮助他们更加独立，也能提高他们的自尊。例如，您可以问他们想穿什么，而不是为他们选择衣服。" },
          { heading: "How to support someone with dementia to make everyday decisions as the dementia progresses?", headingZh: "随着失智症的进展，如何支持患者做出日常决定？", body: "As dementia progresses, making choices can become stressful. It's still possible to support their decision-making, but you may need to simplify things. This could mean limiting the number of choices you offer or discussing the decision at a time when the person is in a better mood and less worried.", bodyZh: "随着失智症的进展，做选择可能会变得有压力。支持他们做决定仍然是可能的，但您可能需要简化事情。这可能意味着限制您提供的选择数量，或者在患者心情较好、不那么担心的时候讨论决定。" },
          { heading: "How to support someone with dementia to make complex decisions?", headingZh: "如何支持失智症患者做出复杂的决定？", body: "There may come a time when a person with dementia can no longer make complex decisions, such as those about medical treatment. With the right support, they can still be involved. This support should focus on providing correct and clear information to help the person understand the consequences of the decision.", bodyZh: "失智症患者可能总有一天无法再做出复杂的决定，例如有关医疗的决定。通过适当的支持，他们仍然可以参与其中。这种支持应侧重于提供正确清晰的信息，以帮助患者了解该决定的后果。" },
          { heading: "Preparing for decisions", headingZh: "为决定做准备", body: "To make decisions in the person's best interest, consider their past and present wishes, their beliefs and values, and the views of anyone they've named to be consulted. Remember that their best interest is what counts, which may not always be the same as your own. It's also vital to be aware that their wishes might change over time.", bodyZh: "为了做出最符合患者利益的决定，请考虑他们过去和现在的愿望、他们的信念和价值观，以及他们指定咨询的任何人的意见。请记住，最重要的是他们的最佳利益，这可能与您自己的利益不总是一致。同样至关重要的是，要意识到他们的愿望可能会随着时间的推移而改变。" },
        ],
        keyActions: ["Gather the information you need to make informed choices for the person as early in the course of the disease as possible.", "Talk about decisions with your family, friends, doctor and any others close to you to help with decisions that are important to you both.", "Prepare instructions that accurately reflect the wishes of the person living with dementia, in accordance with your country’s law (advance directives), and inform each other and your doctor about your preferences and decisions concerning medical treatment."],
        keyActionsZh: ["尽早在疾病进程中收集您需要的信息，以便为患者做出明智的选择。", "与您的家人、朋友、医生和任何其他亲近的人讨论决定，以帮助处理对你们双方都重要的决定。", "根据您所在国家/地区的法律（预立指示），准备能准确反映失智症患者意愿的指示，并相互告知并告知您的医生你们关于医疗的偏好和决定。"],
        reflectQuestion: "Do you support the person you care for to make decisions? You may want to write down the ways that you support their decision-making:",
        reflectQuestionZh: "您是否支持您所护理的人做决定？您可以写下您支持他们做决定的方式：",
        quiz: {
          question: "What do you think is the best way to make sure that Manuel wears clean clothes, without taking over his decisions at the same time?",
          questionZh: "您认为确保曼努埃尔穿上干净衣服，同时又不剥夺他做决定的权利的最佳方式是什么？",
          options: ["Before Maria and Manuel go to bed, Maria asks Manuel what he wants to wear the next day. She then asks Manuel to lay them out.", "Maria chooses clothes for Manuel and she asks him to lay them out.", "Maria chooses clothes for Manuel in the morning and gives them directly to Manuel to wear."],
          optionsZh: ["在玛丽亚和曼努埃尔睡觉前，玛丽亚问曼努埃尔第二天想穿什么。然后她让曼努埃尔把衣服摆出来。", "玛丽亚为曼努埃尔挑选衣服，并让他把衣服摆出来。", "早上，玛丽亚为曼努埃尔挑选衣服，然后直接给他穿上。"],
          correctIndices: [0],
          explanation: "",
          explanationZh: "",
          optionFeedback: ["This is the right answer! This way Manuel is encouraged to do the things he is still able to do.", "This answer is okay. It is good that Manuel is encouraged to lay out his clothes himself; however, it would have been better if Maria supported Manuel in making his own decision about what to wear.", "This is not a good option. Maria is taking control away from Manuel. It would be better if she supported him in making his own decision and encouraged him to do the things which he is still able to do, such as laying out the clothes."],
          optionFeedbackZh: ["这是正确答案！这样可以鼓励曼努埃尔做他仍有能力做的事情。", "这个答案也可以。鼓励曼努埃尔自己摆放衣服是好的；但是，如果玛丽亚支持曼努埃尔自己决定穿什么会更好。", "这不是一个好选择。玛丽亚正在从曼努埃尔手中夺走控制权。如果她能支持他自己做决定，并鼓励他做他仍有能力做的事情，比如摆放衣服，那就更好了。"],
        },
      },
      {
        key: "involving-others",
        title: "Involving others",
        titleZh: "让其他人参与进来",
        readMinutes: 6,
        summary: "This lesson helps carers identify their needs for support from family, friends, and neighbours. It covers different types of help, such as practical, emotional, and social. The lesson provides strategies for how to effectively ask others for help in a way that is clear, direct, and respectful.",
        summaryZh: "本节课帮助护理者确定他们需要从家人、朋友和邻居那里获得支持。它涵盖了不同类型的帮助，如实际帮助、情感支持和社交帮助。本节课提供了如何有效地向他人寻求帮助的策略，要求清晰、直接和尊重他人。",
        sections: [
          { heading: "Types of help and support that you might need", headingZh: "您可能需要的帮助和支持的类型", body: "Carers can benefit from various forms of support. This includes practical help with tasks like cleaning or shopping, and help with pleasant activities, like taking the person with dementia for a walk. It also includes emotional support, such as having someone to listen, and receiving help with finding information about dementia.", bodyZh: "护理者可以从各种形式的支持中受益。这包括在清洁或购物等任务上的实际帮助，以及在愉快活动方面的帮助，比如带失智症人士散步。它还包括情感支持，如有人倾听，以及在寻找有关失智症的信息方面获得帮助。" },
          { heading: "Effectively asking for help from others", headingZh: "有效地向他人寻求帮助", body: "To effectively ask for help, it's important to clearly describe your problem, thoughts, and feelings. Be honest, direct, and considerate of the other person's feelings, while also giving them detailed information about what you need. It may take multiple attempts, but it's important to feel able to ask, even if the result isn't exactly what you hoped for.", bodyZh: "为了有效地寻求帮助，清晰地描述您的问题、想法和感受非常重要。要诚实、直接，并体谅他人的感受，同时向他们提供关于您需求的详细信息。这可能需要多次尝试，但重要的是要能够开口请求，即使结果不完全如您所愿。" },
          { heading: "What would you like to get more help with?", headingZh: "您希望在哪些方面获得更多帮助？", body: "Before asking for help, it’s important to know what you would like to ask by creating a wish list of your needs. When making your list, focus on wishes that are achievable. For example, if you cannot afford weekly help, you might ask a friend or relative for help every two weeks or with specific difficult tasks.", bodyZh: "在寻求帮助之前，重要的是要通过创建一份需求愿望清单来明确您想请求什么。在制定清单时，请专注于可实现的目标。例如，如果您负担不起每周一次的帮助，您可以请求朋友或亲戚每两周帮助一次，或者帮助完成特定的困难任务。" },
          { heading: "Who can I turn to?", headingZh: "我可以向谁求助？", body: "Now it's time to think about who can provide help. Some people are comfortable asking for assistance, while others find it difficult. This lesson provides skills to ask for help effectively, so keep your support wish list in mind as you prepare to approach people in your support network.", bodyZh: "现在是时候考虑谁能提供帮助了。有些人很自然地请求帮助，而另一些人则觉得很难开口。本节课提供了有效请求帮助的技巧，因此在准备接触您支持网络中的人时，请牢记您的支持愿望清单。" },
        ],
        keyActions: ["Think about what you want or need and your feelings about the current situation.", "Describe your problem in one or two sentences.", "Describe your thoughts and feelings clearly, so that the other person can understand your point of view.", "Be honest and direct.", "Keep the feelings of the other person in mind.", "Give detailed information about what kind of help you need."],
        keyActionsZh: ["想一想您想要或需要什么，以及您对当前状况的感受。", "用一两句话描述您的问题。", "清晰地描述您的想法和感受，以便对方能够理解您的观点。", "要诚实和直接。", "要考虑到对方的感受。", "详细说明您需要什么样的帮助。"],
        reflectQuestion: "What kind of help do you receive from your family, friends, neighbours or others? Consider practical help, emotional help, help with pleasant activities, information, or other forms of support.",
        reflectQuestionZh: "您从家人、朋友、邻居或其他人那里得到什么样的帮助？请考虑实际帮助、情感帮助、愉快活动的帮助、信息或其他形式的支持。",
        quiz: {
          question: "Asking for help effectively. Which of the following examples represents an effective way to ask for help?",
          questionZh: "有效地寻求帮助。以下哪个例子是有效寻求帮助的方式？",
          options: ["Li tells her sister that she wants to take care of their mother, but that she just needs a short break from caregiving during the week. She says: “I would like to discuss how you could help in a way that is possible for you.”", "Li approaches her sister by saying, “I’m sick and tired of you not doing anything! You never have time to help me care for our mother!”", "Li decides to attend a weekly one-hour class in the evening to have a break from providing care. However, she does not discuss with her sister the importance of having a break during the week. When she asks her sister to take care of their mother for an hour, her sister said: “Sorry, I have no time.” Li cancels her class."],
          optionsZh: ["李告诉她的姐姐，她想照顾她们的母亲，但她只是需要在周中短暂地从护理工作中解脱出来。她说：“我想和您商量一下，您怎么样才能在您可能的情况下提供帮助。”", "李对她的姐姐说：“我厌倦了你什么都不做！你从来没有时间帮我照顾我们的母亲！”", "李决定晚上去上一个小时的每周课程，以从护理工作中解脱出来。然而，她没有和姐姐商量过在周中休息的重要性。当她让姐姐照顾她们的母亲一个小时的时候，姐姐说：“对不起，我没有时间。”李取消了她的课程。"],
          correctIndices: [0],
          explanation: "The effective approach is honest and direct about your needs, while also considering the other person's perspective. Aggressive approaches can alienate others, while passive approaches fail to communicate the real problem.",
          explanationZh: "有效的方法是诚实、直接地表达自己的需求，同时也要考虑到对方的立场。攻击性的方法会疏远他人，而被动的方法则无法传达真正的问题。",
          optionFeedback: ["Effective. This is an effective way of asking for help. Li stands up for herself, says what she is thinking and is honest about her need for a regular break. She also keeps the interests of her sister in mind.", "Aggressive. This is not an effective way of asking for help. Li becomes angry. However, her sister may not be aware that Li is feeling overwhelmed, because she did not clearly mention this. She does not approach her sister in a respectful way. It is an aggressive way of asking for help.", "Passive. This is not an effective way of asking for help. Her sister may not be aware that Li is feeling overwhelmed. Li is not being honest about her feelings and is trying to avoid a conflict with her sister. She does not stand up for herself. It is a passive way of asking for help."],
          optionFeedbackZh: ["有效。这是一种有效的求助方式。李为自己说话，说出自己的想法，并诚实地表达了她需要定期休息的需求。她也考虑到了姐姐的利益。", "攻击性。这不是一种有效的求助方式。李变得很生气。然而，她的姐姐可能没有意识到李感到不知所措，因为她没有明确提到这一点。她没有以尊重的方式对待她的姐姐。这是一种攻击性的求助方式。", "被动。这不是一种有效的求助方式。她的姐姐可能没有意识到李感到不知所措。李没有坦诚自己的感受，并试图避免与姐姐发生冲突。她没有为自己说话。这是一种被动的求助方式。"],
        },
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
    accent: "from-emerald-500 to-teal-600",
    lessons: [
      {
        key: "reducing-stress",
        title: "Reducing stress in everyday life",
        titleZh: "减轻日常生活中的压力",
        readMinutes: 8,
        summary: "This lesson explains the importance of relaxation for carers to reduce tension and renew energy. It introduces several different relaxation techniques that can be done at any time, from brief breathing exercises to longer muscle relaxation practices, to help carers continue providing care over the long term.",
        summaryZh: "本课程解释了放松对护理者的重要性，以帮助他们减轻紧张感并恢复精力。课程介绍了几种可以随时进行的放松技巧，从简短的呼吸练习到较长时间的肌肉放松练习，旨在帮助护理者能够长期持续地提供护理。",
        sections: [
          { heading: "The importance of relaxing", headingZh: "放松的重要性", body: "Taking time to relax is crucial as it can reduce feelings of tension and provide renewed energy. Even brief moments of relaxation can make tasks easier to accomplish. For carers, incorporating relaxation into their routine can help them feel less tense and better equipped for their responsibilities.", bodyZh: "花时间放松至关重要，因为它可以减轻紧张感并提供新的能量。即使是短暂的放松也能使完成任务变得更加容易。对于护理者来说，将放松融入日常生活有助于他们减轻紧张情绪，更好地履行职责。" },
          { heading: "Different ways to relax", headingZh: "不同的放松方式", body: "There are many different methods for relaxation, and it's important to find the ones that suit you best. The lesson presents seven different exercises, ranging from short 5-minute breathing techniques to longer 15-minute muscle relaxation sessions. It's helpful to assess your tension level before and after an exercise to see how effective it is for you.", bodyZh: "放松的方法有很多种，重要的是找到最适合自己的方法。本课程介绍了七种不同的练习，从短至5分钟的呼吸技巧到长达15分钟的肌肉放松训练。在练习前后评估自己的紧张程度，有助于了解它对您是否有效。" },
          { heading: "Relaxing at any time and any place", headingZh: "随时随地放松", body: "You can practice relaxation techniques anywhere and at any moment, such as while waiting in line at a store. It can be beneficial to set a daily goal or schedule a specific time for relaxation to ensure you make it a consistent habit. Even very brief exercises can make a significant difference in your mood, energy, and ability to provide long-term care.", bodyZh: "您可以在任何地点、任何时刻练习放松技巧，例如在商店排队等候时。为自己设定一个每日目标或安排一个特定的放松时间，以确保其成为一种持续的习惯，这将非常有益。即使是非常短暂的练习也能显著改善您的情绪、精力以及提供长期护理的能力。" },
          { heading: "Was this helpful for you?", headingZh: "这对您有帮助吗？", body: "If relaxation exercises weren't helpful, consider why. You might need more practice, or the chosen exercise may not suit you, so trying a different one could help. If you still find it difficult, you can try doing a pleasant activity instead.", bodyZh: "如果放松练习没有帮助，请想一想原因。您可能需要更多练习，或者所选的练习可能不适合您，因此尝试其他练习可能会有帮助。如果您仍然觉得困难，可以尝试进行一项愉快的活动来代替。" },
        ],
        keyActions: ["You can take some time to relax anywhere and at any time of the day.", "Set a goal: try to do a relaxation exercise at least once a day.", "You can plan a specific time to relax every day (if necessary, use a reminder).", "You will benefit from having renewed energy and a better mood after doing the relaxation exercises.", "Even a brief exercise can make a difference!"],
        keyActionsZh: ["您可以在一天中的任何时间、任何地点花些时间放松。", "设定一个目标：尝试每天至少做一次放松练习。", "您可以计划每天在特定的时间放松（如有必要，请使用提醒）。", "进行放松练习后，您将因精力恢复和心情变好而受益。", "即使是短暂的练习也能带来改变！"],
        reflectQuestion: "Before you try an exercise ask yourself: “How tense am I feeling”?",
        reflectQuestionZh: "在尝试练习之前，问问自己：“我感觉有多紧张？”",
        quiz: {
          question: "",
          questionZh: "",
          options: ["", "", ""],
          optionsZh: ["", "", ""],
          correctIndices: [],
          explanation: "",
          explanationZh: "",
          optionFeedback: ["", "", ""],
          optionFeedbackZh: ["", "", ""],
        },
      },
      {
        key: "pleasant-activities",
        title: "Making time for pleasant activities",
        titleZh: "为愉快的活动安排时间",
        readMinutes: 5,
        summary: "This lesson helps carers recognize the importance of making time for themselves to engage in pleasant activities. It guides carers in identifying activities they enjoy, recognizing common barriers like lack of time or energy, and finding practical ways to overcome these obstacles. The lesson also explores how to incorporate pleasant activities into the daily routine, both alone and together with the person with dementia.",
        summaryZh: "本课程帮助护理者认识到为自己安排时间进行愉快活动的重要性。它指导护理者识别自己喜欢的活动，认识到如缺乏时间或精力等常见障碍，并找到克服这些障碍的实用方法。本课程还探讨了如何将愉快的活动（无论是单独进行还是与失智症人士一起进行）融入日常生活。",
        sections: [
          { heading: "Which pleasant activities would you like to do?", headingZh: "您想进行哪些愉快的活动？", body: "When you have free time, it can be difficult to decide what to do. There are many options, and even a short period is enough for an enjoyable activity. This section encourages you to create a list of pleasant activities you'd like to do.", bodyZh: "当您有空闲时间时，可能很难决定要做什么。有很多选择，即使是很短的时间也足以进行一次愉快的活动。本节鼓励您列出自己想做的愉快活动。" },
          { heading: "Barriers to doing pleasant activities", headingZh: "进行愉快活动的障碍", body: "Carers often feel unable to do pleasant activities due to barriers like not having enough time, as seen in Amy's example. Other common obstacles include a lack of energy, money, or motivation. Carers might also face physical limitations or feelings of guilt about taking time for themselves.", bodyZh: "护理者常常因为一些障碍而无法进行愉快的活动，例如像艾米（Amy）的例子那样没有足够的时间。其他常见的障碍包括缺乏精力、金钱或动力。护理者还可能面临身体上的限制或因花时间给自己而感到内疚。" },
          { heading: "Suggestions for doing pleasant activities", headingZh: "关于进行愉快活动的建议", body: "To make time for pleasant activities, consider asking someone for help with daily tasks or re-evaluating which tasks are truly necessary. Try to focus on one activity at a time, use a calendar to manage your time better, and don't hesitate to talk to someone for new ideas and suggestions. These strategies can help you create more space for yourself.", bodyZh: "要为愉快的活动腾出时间，可以考虑请人帮助您完成一些日常任务，或者重新评估哪些任务是真正必要的。尽量一次只做一项活动，使用日历更好地管理时间，并随时与他人交谈以获取新的想法和建议。这些策略可以帮助您为自己创造更多空间。" },
          { heading: "Doing pleasant activities together", headingZh: "一起进行愉快的活动", body: "It can be very rewarding to share pleasant activities with the person you care for. While it may be challenging at first, finding suitable activities for both of you is possible. For example, you could listen to music together, look at old photos, take a relaxing walk, or prepare snacks.", bodyZh: "与您所护理的人一起分享愉快的活动是非常有益的。虽然一开始可能有些挑战，但找到适合你们俩的活动是完全可能的。例如，你们可以一起听音乐、看旧照片、轻松散步或准备零食。" },
        ],
        keyActions: ["Consider asking someone to help you with some of your day-to-day tasks.", "Consider the impact of not doing certain tasks at that moment.", "Try to do one activity at a time and finish the things you have started as much as possible.", "Think about ways to better manage your time. Consider using an agenda or calendar.", "Talk to someone about how you might be able to better manage your time."],
        keyActionsZh: ["考虑请人帮助您完成一些日常任务。", "思考一下在当下不做某些事情的影响。", "尽量一次只做一项活动，并尽可能完成您已开始的事情。", "思考如何更好地管理您的时间。考虑使用日程表或日历。", "与他人谈谈您如何才能更好地管理您的时间。"],
        reflectQuestion: "Which pleasant activities would you like to do?",
        reflectQuestionZh: "您想进行哪些愉快的活动？",
        quiz: {
          question: "According to the lesson, which of the following is a valid reason to avoid making time for pleasant activities?",
          questionZh: "根据本课程，以下哪项是避免为愉快活动安排时间的正当理由？",
          options: ["I don't have enough time.", "I feel guilty taking time for myself.", "Pleasant activities cost too much.", "None of the above."],
          optionsZh: ["我没有足够的时间。", "为自己花时间让我感到内疚。", "愉快的活动花费太多。", "以上都不是。"],
          correctIndices: [3],
          explanation: "The lesson explains that while lack of time, guilt, or cost are common barriers, they can be overcome. Taking time for yourself is crucial for your well-being so you can continue providing good care. The lesson provides suggestions to overcome these challenges, such as finding free activities or asking for help.",
          explanationZh: "本课程解释说，虽然缺乏时间、内疚感或费用是常见的障碍，但它们是可以克服的。为自己花时间对您的身心健康至关重要，这样您才能继续提供良好的护理。本课程为克服这些挑战提供了建议，例如寻找免费的活动或请求帮助。",
          optionFeedback: ["This is a common barrier, but the lesson suggests asking for help or re-prioritizing tasks to make time.", "The lesson emphasizes that caring for yourself is part of being a good carer; taking a break is necessary, not selfish.", "The lesson points out that many pleasant activities, like taking a walk or visiting a friend, are free.", "Correct. The lesson describes these as common but surmountable barriers to taking needed breaks for yourself."],
          optionFeedbackZh: ["这是一个常见的障碍，但课程建议请求帮助或重新安排任务的优先级以腾出时间。", "课程强调，照顾好自己是成为一名好护理者的一部分；休息是必要的，而不是自私的。", "课程指出，许多愉快的活动，如散步或拜访朋友，都是免费的。", "正确。课程将这些描述为常见的但可以克服的障碍，这些障碍会阻碍您为自己安排必要的休息。"],
        },
      },
      {
        key: "thinking-differently",
        title: "Thinking differently",
        titleZh: "换个想法",
        readMinutes: 6,
        summary: "This lesson teaches that while you cannot always change stressful events, you can change your thoughts about them. By learning to identify unhelpful thoughts and replace them with more helpful ones, you can change the way you feel for the better. This can help you respond to difficult situations in a more useful and calm way.",
        summaryZh: "本节课教导你，虽然你无法总是改变压力事件，但你可以改变你对这些事件的想法。通过学习识别无益的想法，并用更有益的想法取而代之，你可以改善自己的感受。这可以帮助你以更有用和平静的方式来应对困境。",
        sections: [
          { heading: "Lost keys", headingZh: "丢失的钥匙", body: "This story introduces Jo and her husband Max, who has dementia. When Max misplaces his keys just as Jo is about to leave, she has an unhelpful thought, \"I cannot leave him alone anymore,\" which makes her feel miserable. This scenario highlights how a carer's thoughts in a stressful situation can directly influence their feelings.", bodyZh: "这个故事介绍了Jo和她患有失智症的丈夫Max。就在Jo准备离开时，Max放错了钥匙，这时Jo产生了一个无益的想法：“我再也不能把他一个人留下了”，这让她感到痛苦。这个场景凸显了在压力情境下，护理者的想法如何直接影响他们的感受。" },
          { heading: "Jo’s unhelpful and helpful thoughts", headingZh: "Jo的无益和有益想法", body: "It is often not the event itself, but our thoughts about it, that determine our feelings. Jo's unhelpful thought made her miserable, but she could have thought differently. A helpful thought like, “Max has dementia and is worried... I can take some time to help and then go,” would likely make her feel better and allow her to act more calmly and compassionately.", bodyZh: "决定我们感受的，通常不是事件本身，而是我们对事件的看法。Jo的无益想法让她感到痛苦，但她本可以换个方式思考。一个有益的想法，比如“Max患有失智症，他很担心……我可以花点时间帮忙，然后再走”，这可能会让她感觉好一些，并让她能够更冷静、更有同情心地采取行动。" },
          { heading: "Unhelpful thoughts make you feel bad", headingZh: "无益的想法会让你感觉糟糕", body: "Carers often have many thoughts, some of which make them feel worse and some better. Unhelpful thoughts, such as blaming oneself for the happiness of the person with dementia, can make a carer feel unhappy and sad. It is important to identify these unhelpful thoughts in order to start feeling better.", bodyZh: "护理者通常思绪万千，有些想法让他们感觉更糟，有些则让他们感觉更好。无益的想法，例如为失智症人士的情绪而自责，会让护理者感到不快和悲伤。识别这些无益的想法是开始感觉好转的重要一步。" },
          { heading: "Learn to think differently by changing unhelpful thoughts into helpful ones", headingZh: "通过转变无益的想法为有益的想法，学习不同方式的思考", body: "Our thoughts about an event directly influence our feelings. For example, if a friend offers help, thinking \"he must think I am a bad carer\" can lead to feelings of anger and sadness. In contrast, thinking \"he must care about me and my father\" leads to feeling happy and supported. You can't always change events, but you can change your thoughts.", bodyZh: "我们对事件的看法直接影响我们的感受。例如，如果朋友提供帮助，认为“他一定觉得我是个糟糕的护理者”会导致愤怒和悲伤的感觉。相反，认为“他一定很关心我和我父亲”则会让人感到高兴和被支持。你不能总是改变事件，但你可以改变你的想法。" },
          { heading: "Thinking differently makes you feel better", headingZh: "换个角度思考会让你感觉更好", body: "You have the power to change your response to events by changing your thoughts. For example, a carer felt ashamed when his wife with dementia dropped a cup and laughed. By changing his unhelpful thought (\"Our friends are upset\") to a helpful one (\"Our friends understand she has dementia\"), he could have felt happy about the day instead of worried.", bodyZh: "你有能力通过改变你的想法来改变你对事件的反应。例如，一位护理者因为他患有失智症的妻子打碎杯子还笑了而感到羞愧。通过将他的无益想法（“我们的朋友生气了”）转变为一个有益的想法（“我们的朋友理解她患有失智症”），他本可以为那天感到高兴，而不是担忧。" },
        ],
        keyActions: ["Making time for myself helps me to provide better care.", "It is okay to take time to relax as it will help me to provide a good standard of care.", "Sharing my feelings with others helps to take the pressure off.", "Asking for help from others can help me to share the burden of care.", "Dementia is a disease; it is not my or anyone else’s fault.", "I do a good job as a carer."],
        keyActionsZh: ["为自己花时间有助于我提供更好的护理。", "花时间放松是没关系的，这会帮助我提供高标准的护理。", "与他人分享我的感受有助于减轻压力。", "向他人求助可以帮助我分担护理的重担。", "失智症是一种疾病；这不是我或任何其他人的错。", "作为一名护理者，我做得很好。"],
        reflectQuestion: "Which unhelpful thoughts do you have?",
        reflectQuestionZh: "你有过哪些无益的想法？",
        quiz: {
          question: "Can you indicate which of Aryan’s thoughts may help make her feel better? Aryan might think…",
          questionZh: "你能指出Aryan的哪些想法可能有助于让她感觉更好吗？Aryan可能会想…",
          options: ["Making time for myself helps me to provide better care.", "I am a bad carer if my family member is not always happy.", "Maybe the person living with dementia will become better.", "No one understands how hard it is to care.", "No one can provide the care the way I do.", "Asking others for help can help me to share the duties of care."],
          optionsZh: ["为自己花时间有助于我提供更好的护理。", "如果我的家人不总是开心，我就是一个糟糕的护理者。", "也许患有失智症的人会好起来。", "没有人理解护理工作有多辛苦。", "没有人能像我一样提供护理。", "向他人求助可以帮助我分担护理的职责。"],
          correctIndices: [0, 5],
          explanation: "Unhelpful thoughts can make you feel bad. Helpful thoughts are important to feel better and will assist you in dealing with situations in a more useful way. To feel better, it is important to identify unhelpful thoughts.",
          explanationZh: "无益的想法会让你感觉糟糕。有益的想法对于感觉更好很重要，并将帮助你以更有用的方式处理情况。为了感觉更好，识别无益的想法很重要。",
          optionFeedback: ["This is a helpful thought. No one should feel guilty when taking time for themselves. It might help the carer to continue providing care in the long term.", "This thought will make Aryan feel unhappy and sad. The mood of the person living with dementia does not depend solely on the carer. For example, mood can also be related to dementia, depression, functional ability or personality.", "This thought may make Aryan feel disappointed as people with dementia continue to decline. There are many diseases that cause dementia. Unfortunately, there is no cure for any of these diseases yet.", "This thought may make Aryan feel upset, isolated and lonely. There might be people who do not understand how hard it is to care. However, talking to other people may help them better understand what dementia is and help you to take some pressure off.", "This thought could make Aryan feel lonely, isolated and under a lot of pressure. Although others may provide care in a different way, that does not mean that it is always of a lower standard. It is important to involve others in caring for a person living with dementia, to avoid getting overwhelmed.", "This is a helpful thought that may make Aryan feel more in control. Involving other people in caregiving has lots of potential benefits. For instance, the carer will be able to take breaks more regularly and provide care for a longer time."],
          optionFeedbackZh: ["这是一个有益的想法。任何人在为自己花时间时都不应该感到内疚。从长远来看，这可能有助于护理者持续提供护理。", "这个想法会让Aryan感到不快和悲伤。失智症人士的情绪不仅仅取决于护理者。例如，情绪也可能与失智症、抑郁、功能能力或个性有关。", "这个想法可能会让Aryan感到失望，因为失智症人士的状况会持续下降。有许多导致失智症的疾病。不幸的是，目前还没有治愈这些疾病的方法。", "这个想法可能会让Aryan感到沮丧、孤立和孤独。可能有些人不理解护理工作有多辛苦。然而，与他人交谈可能有助于他们更好地了解什么是失智症，并帮助你减轻一些压力。", "这个想法可能会让Aryan感到孤独、孤立和压力重重。虽然其他人可能以不同的方式提供护理，但这并不意味着他们的标准就一定更低。让其他人参与照顾失智症人士非常重要，以避免自己不堪重负。", "这是一个有益的想法，可能会让Aryan感觉更有掌控感。让其他人参与照护有很多潜在的好处。例如，护理者将能够更规律地休息，并能更长时间地提供护理。"],
        },
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
        summary: "This lesson explains how to support and encourage a person with dementia to eat and drink. You will learn how to create a pleasant mealtime by involving them in activities and modifying food or utensils. The lesson also covers how to prevent dehydration by prompting the person and monitoring their fluid intake.",
        summaryZh: "本课程将解释如何支持和鼓励失智症患者进食和饮水。您将学习如何通过让他们参与活动、改良食物或餐具来营造愉快的用餐时间。本课程还包括如何通过提醒患者和监测液体摄入量来预防脱水。",
        sections: [
          { heading: "Involving the person in mealtime activities", headingZh: "让患者参与用餐时间的活动", body: "To improve a person's self-worth and mood, it can be helpful to involve them in mealtime activities they enjoy and are able to do. This could include shopping for food together, helping with meal preparation like chopping or stirring, or setting and cleaning the table. Continuing to engage in familiar household roles can provide a sense of achievement and improve their appetite.", bodyZh: "为了提升患者的自我价值感和改善情绪，让他们参与自己喜欢且力所能及的用餐活动会很有帮助。这可以包括一起购买食物，帮忙准备饭菜（如切菜或搅拌），或者摆放和清理餐桌。继续承担熟悉的家庭角色可以带来成就感并改善他们的食欲。" },
          { heading: "Promoting a good mealtime atmosphere", headingZh: "营造良好的用餐氛围", body: "Mealtime is a good opportunity for carers to show their care and support for the person with dementia. Creating an enjoyable and positive mealtime atmosphere may help encourage them to eat and drink. If issues like spilling food occur, it is better to find constructive solutions together as a family rather than isolating the person, which could make them feel sad or angry.", bodyZh: "用餐时间是护理者向失智症患者表达关爱和支持的好机会。营造愉快、积极的用餐氛围有助于鼓励他们进食和饮水。如果出现食物溢出等问题，最好全家一起寻找建设性的解决方案，而不是孤立患者，因为这可能会让他们感到悲伤或愤怒。" },
          { heading: "Managing health conditions that affect eating", headingZh: "管理影响进食的健康状况", body: "Common health conditions can affect eating and drinking for a person with dementia. These can include poor appetite, toothache, poorly fitting dentures, pain, constipation, or side effects from medication. It is important to observe changes in eating habits and identify the underlying cause, seeking help from a doctor or dentist when needed.", bodyZh: "常见的健康状况会影响失智症患者的饮食。这些状况可能包括食欲不振、牙痛、假牙不合适、疼痛、便秘或药物副作用。观察饮食习惯的变化并确定根本原因非常重要，必要时应向医生或牙医寻求帮助。" },
          { heading: "Preventing dehydration", headingZh: "预防脱水", body: "People with dementia are at a higher risk of dehydration because they may have a decreased sensation of thirst or be unable to communicate their needs. Carers should encourage them to drink 8-10 glasses (1500-2000 ml) of fluid, such as water, soup or juice, each day. It's helpful to monitor and record how much fluid they consume to ensure they are properly hydrated, unless a doctor advises otherwise due to a heart condition.", bodyZh: "失智症患者脱水的风险更高，因为他们的口渴感可能会减弱，或者无法表达自己的需求。护理者应鼓励他们每天喝8-10杯（1500-2000毫升）液体，如水、汤或果汁。监测并记录他们消耗的液体量，以确保他们充分补充水分，这会很有帮助，除非医生因心脏状况另有建议。" },
        ],
        keyActions: ["Shopping together", "Meal preparation", "Preparation of the table", "Cleaning the table", "Washing or drying dishes"],
        keyActionsZh: ["一起购物", "准备饭菜", "准备餐桌", "清理餐桌", "洗碗或擦干碗碟"],
        reflectQuestion: "Now, try to think about involving the person that you care for around mealtimes.",
        reflectQuestionZh: "现在，试着想一想如何让您所护理的人参与到用餐活动中来。",
        quiz: {
          question: "Making mealtimes more pleasant. How would you advise Siya’s family to deal with this situation?",
          questionZh: "让用餐时间更愉快。您会如何建议Siya的家人应对这种情况？",
          options: ["Bring Siya’s dinner to her room.", "Demand that Siya joins them for dinner.", "Let Siya help with meal preparation and cleaning activities."],
          optionsZh: ["把Siya的晚餐送到她的房间。", "要求Siya和他们一起吃晚饭。", "让Siya帮忙准备饭菜和做清洁工作。"],
          correctIndices: [2],
          explanation: "",
          explanationZh: "",
          optionFeedback: ["This is not helpful because it might further isolate Siya from her family. Siya may not feel welcome in the new home. She has lost her husband, her own home and now also her previous roles as cook and housekeeper.", "This is not such a good response because it may make Siya angry or cause her to further withdraw.", "This is a good response because her family knows Siya still enjoys cooking and should therefore support her to continue engaging in the activities that she likes and is still able to do."],
          optionFeedbackZh: ["这没有帮助，因为它可能会让Siya与家人进一步隔离。Siya在新家里可能感觉不受欢迎。她失去了丈夫、自己的家，现在又失去了厨师和管家的角色。", "这不是一个很好的回应，因为它可能会让Siya生气或导致她进一步退缩。", "这是一个很好的回应，因为她的家人知道Siya仍然喜欢烹饪，因此应该支持她继续从事她喜欢并且仍有能力做的活动。"],
        },
      },
      {
        key: "preventing-health-problems",
        title: "Eating, drinking and preventing health problems",
        titleZh: "饮食与预防健康问题",
        readMinutes: 6,
        summary: "This lesson explains how to improve nutrition and safe eating for a person with dementia. You will learn to manage challenges like confusion over inedible items and preventing aspiration pneumonia. The goal is to help you modify eating patterns and food preparation to ensure the person you care for eats and drinks safely.",
        summaryZh: "本节课程将解释如何改善失智症人士的营养和安全饮食。您将学习如何应对各种挑战，例如误食非食品物品和预防吸入性肺炎。本课程旨在帮助您调整饮食模式和食物准备方式，确保您所护理的人能够安全地饮食。",
        sections: [
          { heading: "Help the person you care for to eat safely and prevent aspiration pneumonia", headingZh: "帮助您护理的人安全进食并预防吸入性肺炎", body: "People with dementia may not be able to judge what is safe to eat and might consume inedible materials. It is important to keep such items and chemicals in a secure location. In the late stages of dementia, swallowing difficulties can cause aspiration pneumonia, a life-threatening lung infection that occurs when food enters the lungs. Modifying eating and drinking methods is necessary to prevent this.", bodyZh: "失智症人士可能无法判断哪些东西可以安全食用，可能会误食非食品物品。因此，务必将此类物品和化学品存放在安全的地方。在失智症晚期，吞咽困难可能导致吸入性肺炎，这是一种当食物进入肺部时发生的、危及生命的肺部感染。为了预防这种情况，必须调整饮食方法。" },
          { heading: "Inedible materials", headingZh: "非食品物品", body: "A person with advanced dementia may lose their ability to distinguish between food and other objects. For example, they might try to eat soap or flowers, or drink soy sauce or detergent. To prevent accidental poisoning or injury, it's crucial for carers to secure all household chemicals and other dangerous, inedible items out of reach.", bodyZh: "晚期失智症人士可能会丧失辨别食物与其他物品的能力。例如，他们可能会试图吃肥皂或花，或者喝酱油或洗洁精。为防止意外中毒或受伤，护理者必须将所有家用化学品和其他危险的非食品物品锁好，放在他们拿不到的地方。" },
          { heading: "Helping a person to eat safely", headingZh: "帮助他人安全进食", body: "If a person with dementia has difficulty swallowing or coughs while drinking, they may be at risk for aspiration pneumonia. A doctor might recommend a diet of soft foods and thickened drinks to make swallowing safer. Healthy soft foods and thickened drinks can often be prepared at home, for instance by using corn flour as a thickener, which can help prevent future occurrences of aspiration pneumonia.", bodyZh: "如果失智症人士在吞咽或喝水时出现困难或咳嗽，他们可能面临吸入性肺炎的风险。医生可能会建议他们食用糊状食物和稠化液体，以使吞咽更安全。健康的糊状食物和稠化液体通常可以在家制作，例如，使用玉米淀粉作为增稠剂，这有助于预防未来发生吸入性肺炎。" },
          { heading: "Let’s review what you have learned", headingZh: "让我们回顾一下您所学到的知识", body: "You can adapt eating patterns to improve the person's nutrition. You can ensure their safety by keeping inedible materials and chemicals in a safe place. To prevent aspiration pneumonia, you can modify their food and drinks and ensure they are sitting upright during meals.", bodyZh: "您可以调整饮食模式以改善失智症人士的营养状况。通过将非食品和化学品存放在安全的地方，您可以确保他们的安全。为预防吸入性肺炎，您可以调整他们的食物和饮品，并确保他们在进餐时保持直立坐姿。" },
        ],
        keyActions: ["Modify eating patterns for the person you care for to improve nutrition.", "Help the person living with dementia to eat and drink safely by keeping inedible materials and household chemicals in a safe place.", "Help prevent aspiration pneumonia by modifying the foods and drinks that they eat and positioning the person you care for in an upright position when helping them eat."],
        keyActionsZh: ["为您护理的人调整饮食模式，以改善营养。", "将非食品和家用化学品放在安全的地方，帮助失智症人士安全地饮食。", "通过调整他们食用的食物和饮品，并在帮助他们进食时让他们保持直立坐姿，来帮助预防吸入性肺炎。"],
        reflectQuestion: "What would you advise a carer to do to improve a person with dementia’s eating?",
        reflectQuestionZh: "您会建议护理者做些什么来改善失智症人士的饮食？",
        quiz: {
          question: "What would you advise Ling to do to improve Chiu’s eating? Please select all the responses that you feel are appropriate.",
          questionZh: "您会建议玲怎么做来改善Chiu的饮食？请选择所有您认为合适的回答。",
          options: ["Be flexible to have meals when her mother is awake.", "In a diary, keep a record of what and how often her mother eats.", "Ensure Chiu has access to foods she enjoys eating."],
          optionsZh: ["灵活安排，在母亲清醒时用餐。", "在日记中记录母亲进食的内容和频率。", "确保Chiu能吃到她喜欢吃的食物。"],
          correctIndices: [0, 1, 2],
          explanation: "",
          explanationZh: "",
          optionFeedback: ["This is a good response. People in late stages of dementia need rest, so flexibility in planning meals will be very helpful when they are sleeping during normal mealtimes.", "This is a good response. Recording what people with dementia eat is important. This way, carers will better understand when and what kind of food is needed for sufficient food intake.", "This is a good response. What foods did she enjoy eating before her diagnosis of dementia? What foods does she seem to enjoy now?"],
          optionFeedbackZh: ["这是一个很好的回应。处于失智症晚期的人需要休息，因此在他们正常用餐时间睡觉时，灵活安排用餐会非常有帮助。", "这是一个很好的回应。记录失智症患者的饮食情况非常重要。这样，护理者就能更好地了解何时需要何种食物，以确保充足的食物摄入。", "这是一个很好的回应。在诊断出失智症之前，她喜欢吃什么食物？现在她似乎喜欢吃什么食物？"],
        },
      },
      {
        key: "toileting-continence",
        title: "Toileting and continence care",
        titleZh: "如厕和失禁护理",
        readMinutes: 6,
        summary: "This lesson explains why people with dementia may have difficulty with toileting and incontinence. You will learn how to make environmental changes to help prevent accidents, manage toileting needs in public, and correctly use incontinence aids if they become necessary. The goal is to assist the person with their personal care while maintaining their dignity.",
        summaryZh: "本课程解释了失智症患者可能在如厕方面遇到困难并出现失禁的原因。您将学习如何进行环境改造以帮助预防意外，管理在公共场所的如厕需求，以及在必要时正确使用失禁辅助用品。目标是协助患者进行个人护理，同时维护他们的尊严。",
        sections: [
          { heading: "Preventing urinating on the floor", headingZh: "预防在地板上小便", body: "People with dementia may urinate in inappropriate places because they cannot find the toilet, have trouble with clothing, or have poor vision. To help, you can make simple changes like putting a picture on the toilet door, using a contrasting color for the toilet seat, and providing trousers that are easy to remove. Ensuring there is good lighting in the hallway and toilet, especially at night, is also important.", bodyZh: "失智症患者可能会在不适当的地方小便，因为他们找不到厕所、衣物穿脱困难或视力不佳。为了提供帮助，您可以做一些简单的改变，例如在厕所门上贴上厕所的图片，使用与马桶颜色对比鲜明的马桶圈，以及提供易于穿脱的裤子。确保走廊和厕所内有良好的照明，尤其是在夜间，也同样重要。" },
          { heading: "Urinating in public places", headingZh: "在公共场所小便", body: "A person with dementia may have accidents in public because they can't communicate their need to use the toilet or have lost judgment about appropriate behavior. To prevent this, try to maintain a regular, daily schedule for toilet visits, including before you leave the house. Observing their behavior for signs of needing the toilet, such as restlessness or agitation, is also helpful.", bodyZh: "失智症患者可能会在公共场发生意外，因为他们无法表达自己需要上厕所的需求，或者对合宜行为的判断力下降。为防止这种情况，请尝试为他们保持一个有规律的每日如厕时间表，包括出门前。观察他们的行为，如烦躁不安或激动，以发现他们需要上厕所的迹象，这也很有帮助。" },
          { heading: "Using incontinence aids and equipment", headingZh: "使用失禁辅助用品和设备", body: "In the late stages of dementia, incontinence aids may be necessary, but you should consult a health professional first to rule out treatable causes. When using aids like pads, ensure they are the correct size and changed promptly to prevent skin irritation and infection. If the person resists wearing them, check for discomfort, and if problems like fever or strong-smelling urine occur, see a doctor as it could be a urinary tract infection.", bodyZh: "在失智症晚期，可能需要使用失禁辅助用品，但您应首先咨询健康专业人士，以排除可治疗的原因。在使用护垫等辅助用品时，请确保尺寸正确并及时更换，以防止皮肤刺激和感染。如果患者抗拒穿戴，请检查是否因不适引起。如果出现发烧或尿液异味等问题，请去看医生，因为这可能是尿路感染。" },
          { heading: "Using a toilet diary", headingZh: "使用如厕日记", body: "To improve bladder or bowel control, it may help to fill out a toilet diary. By tracking the number of trips to the toilet and the number of times control was lost, you can identify patterns. This can help you understand possible causes and establish a more effective and regular toileting schedule.", bodyZh: "为了改善膀胱或肠道控制，填写如厕日记可能会有所帮助。通过记录上厕所的次数和失控的次数，您可以识别出其中的规律。这可以帮助您了解可能的原因，并建立一个更有效、更有规律的如厕时间表。" },
        ],
        keyActions: ["Do not blame the person after any accidents, such as urinating on the floor.", "Modify the environment to reduce the chance of bladder and bowel accidents (for example, put a picture of a toilet on the bathroom door).", "Take the person living with dementia to the toilet regularly to reduce accidents.", "If these changes do not help, incontinence aids and equipment may help.", "Maintain good genital care to reduce the risk of a urinary tract infection.", "If the person living with dementia is not under fluid restriction, encourage them to drink 6-8 glasses of water or juice per day to help prevent urinary tract infections."],
        keyActionsZh: ["在发生任何意外（例如在地板上小便）后，不要责备患者。", "改造环境以减少大小便意外的机会（例如，在浴室门上贴上厕所的图片）。", "定期带失智症患者上厕所，以减少意外发生。", "如果这些改变没有帮助，可以尝试使用失禁辅助用品和设备。", "保持良好的生殖器护理，以降低尿路感染的风险。", "如果失智症患者没有液体摄入限制，鼓励他们每天喝6-8杯水或果汁，以帮助预防尿路感染。"],
        reflectQuestion: "What factors in your home or environment might make it difficult for the person you care for to find or use the toilet?",
        reflectQuestionZh: "您家中或周围环境中的哪些因素可能会让您所护理的人难以找到或使用厕所？",
        quiz: {
          question: "Zhen finds her husband, Fu, who has dementia, urinating on the floor outside the toilet. What do you think is the right response for Zhen?",
          questionZh: "甄发现她的丈夫付（患有失智症）在厕所外的地板上小便。您认为甄的正确应对方式是什么？",
          options: ["Make some simple changes to the environment and clothing, such as putting an image of a toilet on the bathroom door, using a contrasting colour for the toilet seat or changing Fu’s trousers to a pair of pants that does not need a belt.", "Tell her husband, Fu, that he is making trouble and punish him by not taking him for his daily walk in their neighbourhood.", "Since this is an embarrassing situation for Joshua, he should stop taking his mother shopping."],
          optionsZh: ["对环境和衣物做一些简单的改变，例如在浴室门上贴上厕所的图片，使用与马桶颜色对比鲜明的马桶圈，或者给付换上一条不需要系皮带的裤子。", "告诉她的丈夫付，他在制造麻烦，并惩罚他，不带他去社区里日常散步。", "由于这对约书亚来说是一个尴尬的情况，他应该停止带他母亲去购物。"],
          correctIndices: [0],
          explanation: "People with dementia may have difficulties finding and using the toilet, so making simple changes to the environment and clothing could help.",
          explanationZh: "失智症患者在寻找和使用厕所方面可能会有困难，因此对环境和衣物做一些简单的改变可能会有所帮助。",
          optionFeedback: ["This is the best answer. People with dementia may have difficulties finding and using the toilet, so these changes could help Fu.", "This is not a good answer. You should never threaten people with dementia in this way. Fu will feel ashamed and embarrassed and this response could cause him to become upset.", "This is not the best response because his mother will miss out on a very important pleasant activity."],
          optionFeedbackZh: ["这是最好的答案。失智症患者在寻找和使用厕所方面可能会有困难，所以这些改变可以帮助付。", "这不是一个好的答案。你绝不应该以这种方式威胁失智症患者。付会感到羞愧和尴尬，这种反应可能会让他变得不高兴。", "这不是最好的回应，因为他的母亲会错过一个非常重要的愉快活动。"],
        },
      },
      {
        key: "personal-care",
        title: "Personal care",
        titleZh: "个人护理",
        readMinutes: 6,
        summary: "This lesson explains why a person with dementia may have difficulties with personal care, such as hygiene, dressing, and bathing. It provides tips for adapting the environment and coaching the person to use their remaining skills. The goal is to engage them in their own care as long as possible while being compassionate if they resist.",
        summaryZh: "本课程解释了失智症患者可能在个人护理（例如卫生、穿衣和洗澡）方面遇到困难的原因。它提供了调整环境和指导患者使用其剩余技能的技巧。目标是让他们尽可能长时间地参与自己的护理，同时对他们的抗拒情绪表示理解和同情。",
        sections: [
          { heading: "Promoting personal hygiene independence", headingZh: "促进个人卫生自理能力", body: "A person with dementia might stop their personal care routine for many reasons, including depression or simply being unable to find things. You can help by making items easier to see and identify, such as by putting a picture on the bathroom door or labeling items with large print. Using color indicators for taps can also help them perform tasks independently.", bodyZh: "失智症患者可能会因为多种原因停止其个人护理程序，包括抑郁症或仅仅是找不到东西。您可以通过让物品更容易看到和识别来提供帮助，例如在浴室门上贴上图片或用大号字体标记物品。为水龙头使用颜色指示也可以帮助他们独立完成任务。" },
          { heading: "Difficulties choosing the right clothes or dressing appropriately", headingZh: "选择合适衣物或得体着装的困难", body: "Dementia can impact a person's ability to choose suitable clothes and dress themselves. It is important to assist them in a way that utilizes their existing abilities, rather than taking over. For example, you can remind them to lay out clothes for the next day or encourage them to wear clothes that are easier to manage, such as pants without a belt.", bodyZh: "失智症会影响一个人选择合适衣物和自行穿衣的能力。重要的是要以一种能利用他们现有能力的方式来协助他们，而不是完全代劳。例如，您可以提醒他们为第二天准备好衣服，或鼓励他们穿更容易处理的衣物，例如没有皮带的裤子。" },
          { heading: "Difficulties brushing one’s teeth", headingZh: "刷牙的困难", body: "The organization and coordination required for mouth care can be challenging for a person with dementia. Poor oral hygiene can lead to appetite loss and infections, so assistance is crucial. The aim is to help the person use their remaining skills by providing step-by-step guidance and praise, maintaining their independence.", bodyZh: "口腔护理所需的组织和协调能力对失智症患者来说可能是一个挑战。口腔卫生状况不佳会导致食欲不振和感染，因此协助至关重要。目标是通过提供分步指导和表扬来帮助患者使用其剩余技能，以维持他们的独立性。" },
          { heading: "Difficulties performing personal care and bathing", headingZh: "进行个人护理和洗澡的困难", body: "A person with dementia might struggle with bathing and view assistance as a threat to their privacy, causing them to resist. Respecting their choices, finding their preferred time for a bath, and providing reassurance is key. If a helper is not recognized, having a familiar family member present can help reduce distress.", bodyZh: "失智症患者可能在洗澡时遇到困难，并将协助视为对其隐私的威胁，从而产生抗拒。尊重他们的选择，找到他们偏好的洗澡时间，并让他们安心是关键。如果他们不认识某个帮助者，让一位熟悉的家人在场可以帮助减轻其痛苦。" },
        ],
        keyActions: ["Put a picture or words on the bathroom door to help the person find it.", "Label personal care items with large print words or pictures.", "Encourage the person to wear pants that do not need a belt and shoes that do not need laces.", "Switch from a shower/bath to a sponge bath if it's easier or safer.", "Use a non-slip bath or shower mat to help prevent falls.", "If the person is afraid of water, try to reduce the water flow from the shower."],
        keyActionsZh: ["在浴室门上贴上图片或文字，以帮助患者找到它。", "用大号字体或图片标记个人护理用品。", "鼓励患者穿不需要皮带的裤子和不需要鞋带的鞋子。", "如果擦浴更简单或更安全，可以从淋浴/盆浴切换到擦浴。", "使用防滑的浴垫或淋浴垫以防止跌倒。", "如果患者怕水，请尝试减小淋浴的水流。"],
        reflectQuestion: "Which steps of mouth care does the person you care for need help with? For example: putting toothpaste on the brush, brushing in order, rinsing, flossing, or checking for mouth infections.",
        reflectQuestionZh: "您护理的失智症患者在哪些口腔护理步骤上需要帮助？例如：在牙刷上挤牙膏、按顺序刷牙、漱口、使用牙线或检查口腔感染。",
        quiz: {
          question: "Mariam has Alzheimer’s disease, but she is able to care for herself without assistance from family members. Recently, her husband, Mohammed, notices that she sits at the table for breakfast in a nightgown without having washed her face, brushed her hair, or doing her make-up as she usually does. What would you think is the right response for Mohammed?",
          questionZh: "玛丽亚姆患有阿尔茨海默病，但她能够自己照顾自己，无需家人协助。最近，她的丈夫穆罕默德注意到，她穿着睡袍坐在早餐桌旁，没有像往常那样洗脸、梳头或化妆。您认为穆罕默德的正确反应应该是什么？",
          options: ["Put personal care items in the order of use and label them with large print words and different colours for Mariam to read.", "Ask their daughter-in-law to take Mariam from the table to the bathing room and assist her with washing and changing clothes.", "Tell Ted that he needs to be less messy, choose clothes for Ted and dress him."],
          optionsZh: ["将个人护理用品按使用顺序列出，并用大号字体和不同颜色进行标记，以便玛丽亚姆阅读。", "让他们的儿媳把玛丽亚姆从餐桌带到浴室，协助她洗漱和更衣。", "告诉特德他需要整洁一些，为特德挑选衣服并帮他穿上。"],
          correctIndices: [0],
          explanation: "",
          explanationZh: "",
          optionFeedback: ["This is a good response. People with dementia may lose the ability to find items that are not obvious. Creating an ‘easy to find’ environment for them is very important.", "This is not the right answer. Mohammed needs to first find out what the reason is for her not doing the personal care before breakfast anymore. Also, instead of assuming, Mohammed needs to ask his wife first if she wants help from their daughter-in-law. Not asking may upset her.", "This answer is not helpful. It is not Ted’s fault that he is finding this task challenging. With some extra help, Ted may still be able to dress himself."],
          optionFeedbackZh: ["这是一个很好的回应。失智症患者可能会失去寻找不显眼物品的能力。为他们创造一个‘容易找到’的环境非常重要。", "这不是正确的答案。穆罕默德首先需要找出她不再在早餐前进行个人护理的原因。此外，穆罕默德不应自作主张，而是应该先问他的妻子是否需要儿媳的帮助。不问可能会让她不高兴。", "这个答案没有帮助。特德觉得这个任务有挑战性不是他的错。在一些额外的帮助下，特德可能仍然能够自己穿衣服。"],
        },
      },
      {
        key: "enjoyable-day",
        title: "An enjoyable day",
        titleZh: "愉快的一天",
        readMinutes: 6,
        summary: "This lesson explains the importance of routines for people with dementia. Continuing or establishing daily routines can provide reassurance and reduce stress. Carers will learn how to identify, maintain, and adapt routines for morning, daytime, and evening activities as the person's abilities change over time.",
        summaryZh: "本课程解释了日常生活规律对失智症人士的重要性。延续或建立日常生活规律可以让他们感到安心，并减少压力。护理者将学习如何识别、维持和调整失智症人士在早上、日间和夜晚的日常活动，以适应他们不断变化的能力。",
        sections: [
          { heading: "What is a routine?", headingZh: "什么是“规律”？", body: "A routine is a sequence of activities that a person does nearly every day. For a person with dementia, continuing their usual routine for as long as possible is reassuring and can reduce stress. If a routine doesn't exist for a certain time of day, like the evening, creating a simple and consistent one can be very helpful.", bodyZh: "“规律”是指一个人每天或几乎每天都会做的一系列活动。对于失智症人士来说，尽可能长时间地延续他们通常的习惯会让他们感到安心，并能减少压力。如果在一天的某个时间（例如晚上）没有固定的习惯，那么建立一个简单且一致的习惯会非常有帮助。" },
          { heading: "Morning time: starting the day", headingZh: "早晨：新一天的开始", body: "Having a set sequence of activities in the morning, such as waking up, bathing, dressing, and eating breakfast, helps start the day on a positive note. As dementia progresses, the person will need more help, but keeping the basic morning routine consistent can lower stress for them.", bodyZh: "在早晨安排一系列固定的活动，例如起床、洗漱、穿衣和吃早餐，有助于积极地开始新的一天。随着失智症的进展，患者会需要更多帮助，但保持基本的早晨流程一致可以为他们减轻压力。" },
          { heading: "During the day", headingZh: "日间活动", body: "It's important to make time for enjoyable activities during the day, based on the person's interests and current abilities. This could include visiting friends, going for a walk, or listening to the radio. Initially, they may only need minimal guidance, but as the dementia progresses, activities will need to be modified so they can still participate and enjoy them.", bodyZh: "白天安排一些失智症人士喜欢的活动很重要，这些活动应基于他们以前的兴趣和现在的能力。这可能包括拜访朋友、散步或听收音机。起初，他们可能只需要很少的指导，但随着失智症的进展，活动需要被调整，以便他们仍然可以参与并享受其中。" },
          { heading: "Adapting routines to the changing abilities of the person you care for", headingZh: "根据护理对象不断变化的能力调整惯例", body: "As the abilities of the person with dementia change, their routines must be adapted. For morning activities like breakfast or grooming, you may need to lay out items to prompt them or provide more direct help over time. The key is to make adjustments as needed while maintaining the familiar structure of their day.", bodyZh: "随着失智症人士能力的改变，他们的日常生活规律必须相应调整。对于像吃早餐或梳洗这样的早晨活动，你可能需要把物品摆出来提示他们，或者随着时间的推移提供更直接的帮助。关键在于在维持他们熟悉日常结构的同时，根据需要做出调整。" },
          { heading: "What is sundowning?", headingZh: "什么是“日落综合症”？", body: "'Sundowning' refers to a state of increased agitation, aggression, or confusion that some people with dementia experience in the late afternoon or early evening. The exact cause is unclear, but a disruption in routine might be a contributing factor. Providing a meaningful activity at this time of day can sometimes help.", bodyZh: "“日落综合症”是指一些失智症人士在傍晚或傍晚时分出现的激动、攻击性或困惑加剧的状态。其确切原因尚不清楚，但日常生活规律的中断可能是一个促成因素。在这段时间提供有意义的活动有时会有所帮助。" },
          { heading: "At bedtime", headingZh: "睡前", body: "A consistent bedtime routine is also important. If an old routine like reading becomes too difficult, it needs to be adapted. The goal is to maintain the calming, familiar ritual before sleep. This might mean switching from reading a book to the carer reading aloud, or looking at picture books together.", bodyZh: "固定的睡前习惯也很重要。如果像阅读这样的旧习惯变得太困难，就需要进行调整。目标是保持睡前平静、熟悉的仪式。这可能意味着从自己看书转变为由护理者朗读，或者一起看图画书。" },
        ],
        keyActions: ["Establishing routines is important for people living with dementia.", "Try to keep routines similar to the ones your family member or friend had before developing dementia.", "Be prepared to adapt routines as necessary as the abilities of the person living with dementia change over time.", "Printing out a list of daily routines can help. Do one for each day and put it up in a prominent place."],
        keyActionsZh: ["为失智症人士建立日常规律很重要。", "尽量保持与您的家人或朋友在患上失智症之前相似的日常规律。", "随着失智症人士的能力随时间变化，准备好根据需要调整日常规律。", "打印出每日的日常活动清单会有帮助。每天制作一份，并把它贴在显眼的地方。"],
        reflectQuestion: "Do you know any of the routines of the person with dementia that you care for?",
        reflectQuestionZh: "您了解您所护理的失智症人士的任何日常习惯吗？",
        quiz: {
          question: "Martha has dementia and is used to drinking tea immediately after getting ready in the morning. Her daughter Penny really wants to encourage her mother to walk every day, as recommended by her doctor. Penny is not aware of her mother’s usual routine, so when she tries to get Martha to go for a walk right after breakfast, Martha refuses.\nWhat suggestions do you have for Penny?",
          questionZh: "玛莎患有失智症，习惯在早上准备好后立即喝茶。她的女儿潘妮非常想鼓励妈妈每天散步，这也是医生的建议。潘妮不了解妈妈平时的习惯，所以当她想让玛莎吃完早饭就去散步时，玛莎拒绝了。你对潘妮有什么建议？",
          options: ["If Penny suggests keeping to the routine by drinking tea first, it is likely that Martha will go for a walk afterwards.", "Penny should ask Martha what activities she is used to and in what order she would like to do them.", "Penny should force Martha to go for a walk because it was advised by the doctor."],
          optionsZh: ["如果潘妮建议先喝茶以维持惯例，玛莎很可能之后会去散步。", "潘妮应该问玛莎她习惯了哪些活动，以及她喜欢按什么顺序进行。", "潘妮应该强迫玛莎去散步，因为这是医生的建议。"],
          correctIndices: [0, 1],
          explanation: "It is important to respect the person's existing routines to help them feel secure and avoid agitation. Trying to understand their usual sequence of activities shows respect and can make them more open to incorporating new, healthy habits. Forcing an activity can cause distress and is unlikely to be successful.",
          explanationZh: "尊重失智症人士现有的生活习惯非常重要，这能帮助他们感到安全、避免焦躁不安。尝试了解他们习惯的活动顺序表示尊重，也能让他们更愿意接纳新的、健康的习惯。强迫进行某项活动可能会引起痛苦，而且不太可能成功。",
          optionFeedback: ["Right! It will help Martha keep her routine.", "Indeed! Penny can learn Martha’s routines. However, this may only work if Martha is in the early or middle stages of dementia. Later on, Martha might not be able to remember her routines.", "This response is not so good because it may make Martha feel agitated and upset."],
          optionFeedbackZh: ["正确！这将帮助玛莎保持她的惯例。", "的确如此！潘妮可以借此了解玛莎的惯例。但是，这可能只在玛莎处于失智症早期或中期时才有效。到了后期，玛莎可能无法记起自己的惯例了。", "这个回答不太好，因为它可能会让玛莎感到烦躁和不安。"],
        },
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
        summary: "Behavioural changes in people with dementia can be upsetting for both the person and the carer, impacting the relationship and causing feelings of sadness, anger, or anxiety. This lesson will help you understand what you can do to reduce or prevent these situations. By understanding the triggers and your own responses, you can better manage these challenging behaviours.",
        summaryZh: "失智症人士的行为改变可能会让他们本人和护理者都感到不安，影响到你们之间的关系，甚至让您感到悲伤、愤怒、困惑或焦虑。本节课将帮助您了解可以做些什么来减少或预防这些情况。通过了解诱因和您自己的反应，您就可以更好地管理这些挑战性的行为。",
        sections: [
          { heading: "Understanding the cycle of behaviour change", headingZh: "了解行为改变的周期", body: "It's important to understand what happens before and after a behaviour change to help reduce or prevent it. Paying attention to the 'triggers' of a behaviour is key. For example, asking a person with dementia questions they can't answer may lead to agitation. The carer's response, such as feeling frustrated, is also part of this cycle.", bodyZh: "了解行为改变之前和之后发生的事情对于帮助减少或预防行为改变非常重要。关注行为的“诱因”是关键。例如，问失智症人士他们无法回答的问题可能会导致他们激动不安。护理者的反应，比如感到沮丧，也是这个周期的一部分。" },
          { heading: "Different approaches work at different times.", headingZh: "不同的方法在不同的时间起作用。", body: "If one approach to managing a behaviour doesn't work, don't give up. It's important to try several different approaches until you find one that is effective for the situation. You can also seek advice from a health care provider, a local Alzheimer's Association, or by searching for information online.", bodyZh: "如果一种管理行为的方法不起作用，不要放弃。重要的是尝试几种不同的方法，直到找到一种对情况有效的方法。你也可以向医疗保健提供者、当地的失智症协会寻求建议，或者在网上搜索信息。" },
          { heading: "Summary", headingZh: "回顾", body: "People with dementia may experience distressing behaviour changes. It is helpful to identify triggers and your own response to them. Remember to breathe and consider the best way to respond, and don't be afraid to try different approaches or seek professional help.", bodyZh: "失智症患者可能会经历令人痛苦的行为改变。识别触发因素和您自己的反应是很有帮助的。记住要深呼吸，考虑最佳的应对方式，并且不要害怕尝试不同的方法或寻求专业帮助。" },
          { heading: "Now think about your own situation", headingZh: "现在思考一下您自己的情况", body: "It is important to apply what you have just learned to your own situation with the person you care for.", bodyZh: "将您刚学到的知识应用到您与被护理人自己的情况中，这一点非常重要。" },
        ],
        keyActions: ["It is helpful to identify what happens before the stressful behaviour to understand what might cause it or make it worse.", "It is also helpful to identify how you usually respond, what you feel or what you do.", "Take a deep breath and think about the best ways to respond that will be the least distressing to you and the person you care for.", "Try different responses and approaches, as the first one does not always work.", "Seek professional help if you cannot manage a situation."],
        keyActionsZh: ["识别有压力的行为发生前的情况，有助于了解可能导致该行为或使其恶化的原因。", "识别你通常的反应、你的感受或你的做法也很有帮助。", "深呼吸，想出对你和你所护理的人来说最不痛苦的最佳应对方法。", "尝试不同的回应和方法，因为第一个不一定总是有效。", "当你无法处理某种情况时，寻求专业帮助。"],
        reflectQuestion: "What is the behaviour that was the most distressing or upsetting to you in the past month?",
        reflectQuestionZh: "在过去一个月里，什么行为最让你感到痛苦或不安？",
        quiz: {
          question: "Howard is caring for his wife Kayla, who has dementia. When he asks her questions she can't answer, she gets agitated. Here are some ways Howard could respond. Which of these are good responses?",
          questionZh: "霍华德正在照顾他患有失智症的妻子凯拉。当他问她无法回答的问题时，她会变得焦躁不安。以下是霍华德可以做出的一些回应。哪些是好的回应？",
          options: ["Show that he is frustrated.", "Take a deep breath.", "Show his irritation by saying: “I already answered that, please stop bothering me”.", "Remind himself that his wife has dementia and cannot help that she forgets things. She is not forgetting on purpose.", "Next time, remember that asking her such questions will only cause frustration, not only for him, but also for his wife.", "Work with Kayla to record significant family and social events in a family diary."],
          optionsZh: ["表现出他的沮丧。", "深呼吸。", "通过说：“我已经回答过了，请不要再烦我了”来表示他的烦躁。", "提醒自己他的妻子患有失智症，她忘记事情并非自己所能控制。她不是故意忘记的。", "下次记住，问她这样的问题只会给他和他的妻子带来挫败感。", "与凯拉一起在家庭日记中记录重要的家庭和社交活动。"],
          correctIndices: [1, 3, 4, 5],
          explanation: "",
          explanationZh: "",
          optionFeedback: ["This is not the best response. Showing that he is frustrated is an inappropriate way to deal with the stressful behaviour, it may even make the person living with dementia irritable.", "This is a good response. It shows that Howard is trying to control his frustration.", "This reaction is not so good, because Howard’s irritability may upset Kayla even more.", "This is a good response, because Howard recognises that Kayla is living with dementia.", "This is a good response, because it may prevent this frustrating situation.", "This is a good response, because they can revisit the events from time to time if Kayla is missing family members and friends."],
          optionFeedbackZh: ["这不是最好的回应。表现出他的沮丧是处理压力行为的不当方式，甚至可能使失智症人士变得烦躁。", "这是一个很好的回应。这表明霍华德正在努力控制自己的沮丧情绪。", "这个反应不太好，因为霍华德的烦躁可能会让凯拉更加不安。", "这是一个很好的回应，因为霍华德认识到凯拉患有失智症。", "这是一个很好的回应，因为它可以防止这种情况带来的挫败感。", "这是一个很好的回应，因为如果凯拉想念家人和朋友，他们可以不时地重温这些事件。"],
        },
      },
      {
        key: "memory-loss",
        title: "Memory loss",
        titleZh: "记忆力减退",
        readMinutes: 5,
        summary: "This lesson helps you understand and practice ways to respond to memory loss in people with dementia. You will learn about using memory aids and how to approach the situation with support and understanding, recognizing that memory loss is a part of the disease.",
        summaryZh: "本课程将帮助您了解失智症人士的记忆力减退情况并练习应对方法。您将学习如何使用记忆辅助工具，并以支持和理解的态度与您所护理的人沟通，认识到记忆力减退是该疾病的一部分。",
        sections: [
          { heading: "1. What is memory loss?", headingZh: "1. 什么是记忆力减退？", body: "People with dementia will increasingly lose their memory over time. In the beginning, they may forget recent events or where they placed items like keys and wallets. However, past memories, such as those from childhood, are often preserved for a longer period.", bodyZh: "失智症人士的记忆力会随着时间的推移而逐渐衰退。初期，他们可能会忘记最近发生的事件或物品（如钥匙和钱包）放在哪里。然而，过去的记忆，如童年时期的记忆，通常会保留更长的时间。" },
          { heading: "2. How to respond to memory loss?", headingZh: "2. 如何应对记忆力减退？", body: "There are several ways to respond to memory loss that can help you deal with it effectively. This lesson provides practice in applying these methods through various examples, such as forgetting groceries, daily activities, or medications.", bodyZh: "有几种方法可以应对记忆力减退，帮助您有效处理这一问题。本课程通过各种示例（例如忘记购买食品、日常活动或药物）提供应用这些方法的练习。" },
          { heading: "Let’s review what you have learned", headingZh: "让我们回顾一下您学到的知识", body: "Memory loss is a common and often stressful part of dementia. It's crucial to remember the person isn't to blame. Using memory aids like notes or pill-boxes, involving the person in finding solutions, and responding with patience are key strategies. If one approach fails, try another, and remember there will be good and bad days.", bodyZh: "记忆力减退是失智症常见且常带来压力的部分。关键是要记住，这不是患者的错。使用记忆辅助工具（如便条或药盒）、让患者参与寻找解决方案以及耐心应对是关键策略。如果一种方法失败了，就尝试另一种，并记住情况会有好有坏。" },
          { heading: "Check your understanding", headingZh: "检查您的理解", body: "The lesson presents several scenarios to check your understanding of how to respond to memory loss. These include a person forgetting to buy groceries, forgetting daily activities, and forgetting to take their medication. For each scenario, you are asked to choose the most appropriate and helpful responses from a list of options.", bodyZh: "本课程提供了几个场景来检验您对如何应对记忆力减退的理解。这些场景包括忘记购买食品、忘记日常活动以及忘记服药。在每个场景中，您需要从一系列选项中选择最恰当和最有帮助的对策。" },
        ],
        keyActions: ["In case of memory loss, try a memory aid like a note, pill-box, reminder/alarm, etc.", "If possible, involve the person you care for to find the best way to support them in case of memory problems.", "It is important to remember that the person living with dementia is not to blame, because he/she can’t help that they forget.", "Remind yourself that memory loss is part of the disease.", "Take a deep breath and think about the best ways to respond that will be the least distressing to you and the person you care for in the case of memory loss.", "When one approach doesn’t work, try another one."],
        keyActionsZh: ["如果出现记忆力减退的情况，尝试使用记忆辅助工具，如字条、药盒、提醒/闹钟等。", "如果可能，让您护理的人参与进来，寻找在记忆问题上支持他们的最佳方式。", "重要的是要记住，失智症患者不应受到责备，因为他们无法控制自己的遗忘。", "提醒自己，记忆力减退是疾病的一部分。", "深呼吸，思考在出现记忆力减退时，对您和您护理的人来说最不痛苦的最佳应对方式。", "当一种方法无效时，尝试另一种。"],
        reflectQuestion: "Does the person you care for sometimes forget things? If so, what kinds of things do they forget?",
        reflectQuestionZh: "您护理的人有时会忘记事情吗？如果会，他们会忘记什么样的事情？",
        quiz: {
          question: "How would you advise Maya to deal with her mother’s memory loss?",
          questionZh: "您会建议玛雅如何应对她母亲的记忆力减退？",
          options: ["Ask a neighbour to go with Anne once a week to the market to buy groceries.", "Create a memory aid together with Anne, e.g. a list of groceries that Anne needs to buy, and put the list in a place where it can be seen, so that it is easy to access.", "Go out and buy groceries immediately.", "Ask: “Mom, what’s wrong with you, there is no food in the house”.", "Sit down with Anne and make a list of groceries. Go shopping together."],
          optionsZh: ["请一位邻居每周陪安妮去一次市场买菜。", "与安妮一起制作一个记忆辅助工具，例如一张需要购买的杂货清单，并把清单放在显眼的地方，以便于取用。", "立即出门购买杂货。", "问：“妈妈，你怎么了，家里一点食物都没有”。", "和安妮坐下来，列一张购物清单，然后一起去购物。"],
          correctIndices: [0, 1, 4],
          explanation: "Helpful responses involve creating memory aids, turning shopping into a shared activity, or arranging for social support. Unhelpful responses include panicking, taking over completely without trying other approaches first, or blaming the person, which can cause embarrassment and doesn't solve the underlying issue.",
          explanationZh: "有益的对策包括制作记忆辅助工具、将购物变成一项共同的活动，或安排社会支持。无益的对策则包括惊慌失措、在未尝试其他方法前就完全代劳，或责备对方，这会使对方感到难堪，且无法解决根本问题。",
          optionFeedback: ["This might be helpful. Anne will have groceries and a nice visit with the neighbour.", "This is a good response. It addresses Anne’s memory loss and may become a weekly shared pleasant activity.", "This answer is not so good because it is a panic reaction and a one-time solution. It does not solve the problem at hand.", "This answer is not so good because Anne cannot help that she forgets to buy food and may feel embarrassed that she has done something wrong. It does not improve the situation.", "This answer may be a good one because Maya is addressing her mother’s needs. However, she might first want to try another approach. For example, with a list of groceries that her mother may still be able to go shopping without help."],
          optionFeedbackZh: ["这可能会有帮助。安妮将会有食品和一个与邻居愉快的探访。", "这是一个很好的回应。它解决了安妮的记忆力减退问题，并可能成为每周一次的愉快共享活动。", "这个答案不太好，因为这是一种恐慌反应和一次性的解决方案。它不能解决当前的问题。", "这个答案不太好，因为安妮无法控制自己忘记买食物，并且可能会因为自己做错了事而感到尴尬。这并不能改善情况。", "这个答案可能是一个好的选择，因为玛雅正在满足她母亲的需求。然而，她可能想先尝试另一种方法。例如，有了购物清单，她母亲可能仍然能够在没有帮助的情况下购物。"],
        },
      },
      {
        key: "aggression",
        title: "Aggression",
        titleZh: "攻击行为",
        readMinutes: 5,
        summary: "Aggressive behaviours like shouting or pushing can be upsetting for both the person with dementia and their carer. This lesson explains how to understand and respond to aggression using the behaviour cycle, de-escalation techniques, and environmental changes. If aggression appears suddenly, it's crucial to consult a doctor as there might be an underlying medical cause.",
        summaryZh: "攻击性行为，如喊叫或推搡，对失智症患者和他们的护理者来说都可能令人不安。本课程解释了如何使用行为周期、降级技巧和环境改变来理解和应对攻击性行为。如果攻击性行为突然出现，咨询医生是至关重要的，因为可能存在潜在的医疗原因。",
        sections: [
          { heading: "The cycle of aggressive behaviour", headingZh: "攻击性行为的循环", body: "To better manage stressful behaviours like aggression, it's helpful to analyze them as a three-part cycle. First, identify the trigger, or \"what happens before\" the behaviour occurs. Second, describe the specific behaviour itself. Third, observe the carer's response, which can influence whether the behaviour continues or stops.", bodyZh: "为了更好地管理攻击性等有压力的行为，将其分析为一个由三部分组成的循环是很有帮助的。首先，识别触发因素，即在行为发生“之前发生了什么”。其次，描述具体的行为本身。第三，观察护理者的反应，这会影响行为是会持续还是会停止。" },
          { heading: "How to respond to aggressive behaviour?", headingZh: "如何应对攻击性行为？", body: "There are many ways to respond when a person with dementia behaves aggressively, some more effective than others. Instead of using force or logic, which can make things worse, try positive approaches. Playing soothing music, ensuring the person's dignity and privacy, or simply walking away to try again later can de-escalate the situation and calm both you and the person you care for.", bodyZh: "当失智症患者表现出攻击性时，有很多方法可以应对，其中一些方法比其他方法更有效。不要使用武力或逻辑，这会使情况变得更糟，而应尝试积极的方法。播放舒缓的音乐，确保患者的尊严和隐私，或者干脆走开，稍后再试，这些都可以缓和局势，使您和您所护理的人都平静下来。" },
          { heading: "How to deal with ongoing aggression?", headingZh: "如何处理持续的攻击性行为？", body: "If your first attempt to manage aggression doesn't work, don't be discouraged. Different approaches may be effective at different times. Take a deep breath, remind yourself that the aggression may be part of the dementia, and consider trying several different strategies or seeking suggestions from others to find what works best.", bodyZh: "如果您第一次处理攻击性行为的尝试没有成功，不要灰心。不同的方法在不同的时间可能会有效。深呼吸，提醒自己攻击性可能是失智症的一部分，并考虑尝试几种不同的策略或向他人寻求建议，以找到最有效的方法。" },
          { heading: "WARNING!", headingZh: "警告！", body: "If the person is suddenly behaving aggressively, there may be an underlying cause (for example a urinary infection) that should be investigated by a doctor.", bodyZh: "如果患者突然表现出攻击性，可能存在潜在的原因（例如尿路感染），应由医生进行检查。" },
        ],
        keyActions: ["Try to change the environment to make it more calming.", "Try to maintain the dignity of the person living with dementia; do not force them to engage in activities that they do not wish to do.", "If one approach does not work, try another one.", "Remind yourself that aggression can be a part of the dementia, or a reaction to the disease.", "If the person is suddenly behaving aggressively, there may be an underlying cause (for example a urinary infection) that should be investigated by a doctor.", "Take a deep breath and think about the most positive ways to respond that will be the least distressing to you and the person you care for."],
        keyActionsZh: ["尝试改变环境，使其更加平静。", "努力维护失智症患者的尊严；不要强迫他们参加他们不想参加的活动。", "如果一种方法不起作用，请尝试另一种方法。", "提醒自己，攻击性可能是失智症的一部分，也可能是对疾病的反应。", "如果患者突然表现出攻击性，可能存在潜在原因（例如尿路感染），应由医生进行检查。", "深呼吸，思考最积极的应对方式，以最大程度地减少您和您所护理的人的痛苦。"],
        reflectQuestion: "What happened before the person you care for became aggressive? What could you do to change your response to this behaviour? What could change in the environment to make it more calming?",
        reflectQuestionZh: "在您护理的人变得有攻击性之前发生了什么？您可以做些什么来改变您对此行为的反应？环境中可以做些什么改变使其更平静？",
        quiz: {
          question: "How could Neil react differently?\nPlease indicate what you think are good responses.",
          questionZh: "尼尔可以如何做出不同的反应？\n请指出您认为好的应对方式。",
          options: ["Force his father-in-law to start bathing anyway.", "Maintain the dignity and privacy of his father-in-law. He could keep him in a robe or towel until he actually takes a bath.", "Play soothing music that Amit likes.", "Walk away and come back later.", "Explain logically why he should bathe.", "Make sure that there is enough time so that it is not so stressful. Rather than trying to bathe Amit right before the doctor’s appointment, when things are rushed, Neil might try to assist with bathing the day before."],
          optionsZh: ["无论如何都要强迫他的岳父开始洗澡。", "维护他岳父的尊严和隐私。他可以让他一直穿着浴袍或裹着毛巾，直到他真正洗澡。", "播放阿米特喜欢的舒缓音乐。", "走开，稍后再回来。", "从逻辑上解释他为什么应该洗澡。", "确保有足够的时间，这样就不会那么紧张。尼尔可以尝试在看医生前一天帮阿米特洗澡，而不是在看医生前匆忙地洗。"],
          correctIndices: [1, 2, 3, 5],
          explanation: "",
          explanationZh: "",
          optionFeedback: ["This is not helpful, because it does not change the situation and may only make it worse.", "Correct. Maintaining dignity and privacy is always a good idea when caring for someone with dementia. By doing this Neil makes sure that the person living with dementia is comfortable.", "Yes. Though it may take extra time to arrange the music, this option may help sooth both Neil and Amit. This may create relaxation and less negative responses from both of them.", "This is a good response. It gives Neil time to calm down, take a deep breath and come up with a new strategy. It also gives Amit time to forget about the negative encounter and he may be in a better mood if approached differently later.", "This answer is not so good. It does not take into account that Amit may not be able to understand because of his dementia.", "Though taking more time may not always be feasible, this option is good. It may reduce tension for Neil and Amit."],
          optionFeedbackZh: ["这没有帮助，因为它不能改变情况，可能只会让情况变得更糟。", "正确。在照顾失智症患者时，维护尊严和隐私总是一个好主意。通过这样做，尼尔确保了失智症患者的舒适。", "是的。虽然安排音乐可能需要额外的时间，但这个选项可能有助于安抚尼尔和阿米特。这可能会创造放松的氛围，并减少他们双方的负面反应。", "这是一个很好的回应。它给尼尔时间冷静下来，深呼吸，并想出一个新的策略。它也给阿米特时间忘记这次不愉快的接触，如果稍后以不同的方式接近他，他的心情可能会更好。", "这个答案不太好。它没有考虑到阿米特可能因为失智症而无法理解。", "虽然花更多的时间可能不总是可行的，但这个选项是好的。它可以减轻尼尔和阿米特的紧张情绪。"],
        },
      },
      {
        key: "depression-anxiety-apathy",
        title: "Depression, anxiety and apathy",
        titleZh: "抑郁、焦虑和冷漠",
        readMinutes: 6,
        summary: "Signs of depression, anxiety, and apathy are common in people with dementia. These mood changes can be upsetting for both the person and the carer, so it's important to provide extra love and support. This lesson teaches you to identify and respond to these changes by comforting the person and engaging them in activities they enjoy.",
        summaryZh: "失智症患者出现抑郁、焦虑和冷漠的迹象很常见。这些情绪变化可能会让失智症患者和护理者都感到不安，因此提供额外的关爱和支持非常重要。本课程教您如何识别和应对这些变化，通过安慰和引导他们参与自己喜欢的活动。",
        sections: [
          { heading: "Responding to a person with dementia who is feeling depressed.", headingZh: "如何应对感到抑郁的失智症患者？", body: "When a person with dementia appears sad, withdrawn or is crying, it's important to respond with calm reassurance and support. Acknowledge their feelings with physical touch and comforting words, as people with mood problems need extra love. Trying to distract them with a pleasant activity can also be helpful, but avoid dismissive or shaming comments which can make things worse.", bodyZh: "当失智症患者表现出悲伤、退缩或哭泣时，重要的是要以冷静的安抚和支持来回应。通过身体接触和安慰的话语来承认他们的感受，因为有情绪问题的人需要额外的关爱。尝试用愉快的活动来分散他们的注意力也可能有帮助，但要避免可能使情况变得更糟的轻视或羞辱性评论。" },
          { heading: "Responding to a person with dementia who is feeling anxious.", headingZh: "如何应对感到焦虑的失智症患者？", body: "Anxiety in a person with dementia can manifest as pacing, wringing hands, or repeating phrases. This behavior is often a reaction to their environment or the illness itself, not something they can control. The best response is to offer smiles and reassurance, and to gently distract them by asking for help with a simple task. It's also helpful to modify the environment, such as by reducing loud noises.", bodyZh: "失智症患者的焦虑可能表现为踱步、搓手或重复话语。这种行为通常是对环境或疾病本身的反应，不是他们能控制的。最好的回应是给予微笑和安抚，并通过请求他们帮忙做一件简单的任务来温和地分散他们的注意力。调整环境也很有帮助，例如减少大声的噪音。" },
          { heading: "How to respond when a person living with dementia loses interest in daily activities?", headingZh: "当失智症患者对日常活动失去兴趣时该如何应对？", body: "Apathy, or a loss of interest in activities, can cause a person with dementia to seem removed and distant. Respond with extra love and support, rather than frustration or direct orders, which can increase withdrawal. Suggest activities you can do together, and think about their past interests to find things they might still enjoy, even in a modified way.", bodyZh: "冷漠，或对活动失去兴趣，可能导致失智症患者显得疏远和冷淡。应对时应给予额外的关爱和支持，而不是沮丧或直接命令，这会加剧他们的退缩。建议你们可以一起做的活动，并思考他们过去的兴趣，以找到他们可能仍然喜欢的事情，即使是以一种调整过的方式。" },
          { heading: "Engaging The Person", headingZh: "Engaging The Person", body: "Even if the person you're caring for seems distant, it's important to keep trying to engage them. Thinking back to activities they used to enjoy can provide clues. You could try reading the newspaper to them, cooking their favourite meal, or even visiting a familiar place like a shop to let them perform a simple, familiar task.", bodyZh: "Even if the person you're caring for seems distant, it's important to keep trying to engage them. Thinking back to activities they used to enjoy can provide clues. You could try reading the newspaper to them, cooking their favourite meal, or even visiting a familiar place like a shop to let them perform a simple, familiar task." },
        ],
        keyActions: ["Identify ways to stop or reduce mood changes, by comforting and getting the person interested in things that they like to do.", "If one approach doesn’t work, try another one.", "In case of mood changes, remind yourself that they may be part of the disease or a reaction to the disease.", "Take a deep breath and think about the best ways to respond that will be the least distressing to you and the person you care for in case they have mood problems or experience a loss of interest."],
        keyActionsZh: ["找到停止或减少情绪变化的方法，通过安慰和引导他们参与自己喜欢的活动。", "如果一种方法不起作用，就试试另一种。", "如果出现情绪变化，提醒自己这可能是疾病的一部分或对疾病的反应。", "深呼吸，思考如何以对您和您所护理的人都最少痛苦的方式来应对他们出现的情绪问题或失去兴趣的情况。"],
        reflectQuestion: "Does the person living with dementia ever show changes in mood or interest, or any signs of depression or anxiety?",
        reflectQuestionZh: "您所护理的失智症患者是否曾表现出情绪或兴趣的变化，或任何抑郁或焦虑的迹象？",
        quiz: {
          question: "Juan has dementia and lives with his sister, Isabel. On several occasions Isabel has found Juan sitting in his favourite chair looking very sad, hunched over, and sometimes crying. Isabel tries to cheer him up. Unfortunately, everything that she tries does not seem to work. How should Isabel handle this situation? Below are some things that Isabel may do or say. Please select all responses that you think might work.",
          questionZh: "胡安患有失智症，和他的妹妹伊莎贝尔住在一起。有好几次，伊莎贝尔发现胡安坐在他最喜欢的椅子上，看起来非常伤心，弓着背，有时还在哭泣。伊莎贝尔试图让他振作起来。不幸的是，她尝试的一切似乎都不起作用。伊莎贝尔应该如何处理这种情况？以下是伊莎贝尔可能做或说的一些事情。请选择所有你认为可能有效的回答。",
          options: ["Walk over to Juan and say in a calm, reassuring tone, “I have some ideas about how you can feel better, let’s talk.", "Say: “Juan, what’s the matter with you? I’m tired of seeing you like this. Just get up and do something.”", "Say: “men don’t cry and get sad, we used to have so much fun together.”", "Go over and touch Juan on the arm or shoulder. “I know that you feel bad, I do too. What we’re going through is really hard.”", "Sit with Juan and suggest that they do a pleasant activity together.", "Sigh and walk away, thinking that there is nothing that she can do."],
          optionsZh: ["走到胡安身边，用冷静、令人安心的语气说：“我有一些能让你感觉好一点的想法，我们谈谈吧。”", "说：“胡安，你怎么了？我不想再看到你这个样子。快起来做点什么。”", "说：“男人不该哭哭啼啼的，我们以前在一起多开心啊。”", "走过去，触摸胡安的手臂或肩膀。“我知道你感觉不好，我也是。我们正在经历的这一切真的很难。”", "和胡安坐在一起，建议他们一起做一个愉快的活动。", "叹口气走开，认为自己无能为力。"],
          correctIndices: [0, 3, 4],
          explanation: "",
          explanationZh: "",
          optionFeedback: ["This is a good response because Juan needs more support due to the changes in his mood.", "This response is not helpful because Juan cannot help that he is feeling sad.", "This response is not good because it might embarrass Juan and may make him feel even more sad.", "This is a good response because people who are feeling sad need extra love, support and understanding.", "This is a good response because it may distract Juan and make him feel better.", "This is not helpful because Isabel is further isolating Juan."],
          optionFeedbackZh: ["这是一个很好的回应，因为胡安由于情绪变化需要更多的支持。", "这个回应没有帮助，因为胡安无法控制自己的悲伤情绪。", "这个回应不好，因为它可能会让胡安感到尴尬，甚至更伤心。", "这是一个很好的回应，因为感到悲伤的人需要额外的关爱、支持和理解。", "这是一个很好的回应，因为它可能会分散胡安的注意力，让他感觉好一些。", "这个回应没有帮助，因为伊莎贝尔这样做会进一步孤立胡安。"],
        },
      },
      {
        key: "difficulty-sleeping",
        title: "Difficulty sleeping",
        titleZh: "睡眠困难",
        readMinutes: 6,
        summary: "Difficulty sleeping is a common issue for people with dementia and can be very stressful for carers. This lesson helps you understand the causes of sleeping problems and identify strategies to manage them, including making the person more comfortable, adapting routines to promote better sleep, and responding calmly and effectively when issues arise.",
        summaryZh: "失智症人士普遍存在睡眠困难，这可能给护理者带来很大压力。本课程将帮助您了解睡眠问题的原因，并确定处理这些问题的方法。您将学习如何让失智症人士更舒适，调整日常作息以促进更好的睡眠，以及在问题出现时如何冷静有效地应对。",
        sections: [
          { heading: "Difficulty falling asleep", headingZh: "入睡困难", body: "Sometimes, a person with dementia has trouble falling asleep because their routine is not suited to them. For example, they may be asked to go to bed too early, before they are tired. They may also dislike evening activities and become restless. Understanding what comes before the sleeping problem can help identify the cause.", bodyZh: "有时，失智症人士入睡困难是因为他们的作息不适合他们。例如，他们可能在还不累的时候就被要求提早上床睡觉。他们也可能不喜欢晚上的活动而变得烦躁不安。了解睡眠问题发生前的情况有助于确定原因。" },
          { heading: "How to deal with a person with dementia who wakes up in the middle of the night?", headingZh: "如何应对失智症人士半夜醒来？", body: "A person with dementia may wake up in the middle of the night feeling confused or disoriented, and may start wandering. It is important to understand the cause, which could be anything from a medical issue like a urinary tract infection to basic needs like hunger or thirst. Establishing a calm environment and ensuring the person is busy and active during the day can help improve their sleep at night.", bodyZh: "失智症人士可能会在半夜醒来，感到困惑或迷失方向，并可能开始四处走动。了解其原因非常重要，这可能包括尿路感染等医疗问题，也可能是饥饿或口渴等基本需求。营造一个安静的环境，并确保失智症人士在白天有事可做并保持活跃，有助于改善他们夜间的睡眠。" },
          { heading: "Additional responses to night waking", headingZh: "应对夜间醒来的其他方法", body: "When a person with dementia wakes at night, a calm response is most effective. You can gently remind them it is nighttime and time to sleep, or try relaxing activities like playing soothing music, reading a calming story, or praying together. Physical comfort, such as a hug or a stuffed animal, can also help them feel secure and fall back asleep.", bodyZh: "当失智症人士在夜间醒来时，冷静的应对是最有效的。您可以温柔地提醒他们现在是晚上，该睡觉了，或者尝试一些放松的活动，比如播放舒缓的音乐、读一个平静的故事或一起祈祷。身体上的安慰，如一个拥抱或一个毛绒玩具，也能帮助他们感到安全并重新入睡。" },
          { heading: "Important considerations", headingZh: "重要注意事项", body: "Remember that difficulty sleeping is a part of the disease, and there will be good and bad days. It is crucial to ask for help from family, friends, or professionals, as providing good care on limited sleep is very difficult. Also, be aware that sleeping problems can sometimes be related to depression, so consulting a doctor for advice is recommended if you are concerned.", bodyZh: "请记住，睡眠困难是疾病的一部分，情况会有好有坏。向家人、朋友或专业人士寻求帮助至关重要，因为在睡眠有限的情况下提供良好的护理非常困难。另外，请注意睡眠问题有时可能与抑郁症有关，因此如果您担心，建议咨询医生。" },
        ],
        keyActions: ["Go for a walk with the person and add more physical activity during the day.", "Limit daytime naps to 15 to 30 minutes.", "Create a bedtime routine, like lowering the lights, washing face and teeth, and changing into pajamas.", "Play soothing music before bedtime to help the person sleep.", "Ask for help from a family member, friend or a paid professional.", "Gently remind the person that it is dark outside and it is time to sleep."],
        keyActionsZh: ["白天和他们一起散步，增加体力活动。", "将白天的午睡时间限制在15到30分钟。", "建立一个睡前程序，比如调暗灯光、洗脸刷牙、换上睡衣。", "睡前播放舒缓的音乐，帮助其入睡。", "向家人、朋友或付费专业人士寻求帮助。", "温柔地提醒他们外面天黑了，该睡觉了。"],
        reflectQuestion: "What could you do to help tackle the sleeping problems that the person you care for has, and how could you improve your own reaction to them?",
        reflectQuestionZh: "您可以做些什么来帮助解决您所护理的人的睡眠问题？您又该如何改善自己对这些问题的反应？",
        quiz: {
          question: "Here are some examples of what a carer could do. Please select all that you think may be appropriate to help a person with dementia fall asleep:",
          questionZh: "以下是护理者可以做的一些示范。请选择所有您认为可以帮助失智症人士入睡的合适方法：",
          options: ["Go for a walk with the person and add more physical activity during the day.", "Give them a pill to sleep.", "Try and ensure that the person does not drink coffee or too much fluid a few hours before going to bed.", "Make lunch the bigger meal of the day.", "Limit daytime naps to 15 to 30 minutes.", "Play soothing music before bedtime to help the person sleep."],
          optionsZh: ["和失智症人士一起散步，增加白天的体育锻炼。", "给他们一片安眠药。", "尽量确保失智症人士在睡前几小时内不喝咖啡或过多的液体。", "把午餐做成一天中最丰盛的一餐。", "将白天的午睡时间限制在15到30分钟。", "睡前播放舒缓的音乐，帮助失智症人士入睡。"],
          correctIndices: [0, 2, 3, 4, 5, 6, 7],
          explanation: "Establishing a healthy sleep hygiene is key. This includes ensuring the person is physically active during the day but not too close to bedtime, avoiding stimulants like caffeine, and creating a calming pre-sleep routine. It is also important to consider that sleep needs change with age and medical conditions, so adjusting bedtime or meal schedules can be very effective.",
          explanationZh: "建立健康的睡眠卫生是关键。这包括确保失智症人士在白天有充分的身体活动，但不要太靠近就寝时间；避免咖啡因等兴奋剂；并创建一个平静的睡前程序。同样重要的是要考虑到睡眠需求会随着年龄和健康状况而变化，因此调整就寝时间或用餐时间可能非常有效。",
          optionFeedback: ["This is a good idea! Physical exercise during the day may help sleep at night.", "This is not a good idea. It can make someone with dementia even more confused or agitated and sleeping pills may become addictive.", "This is a good response. Coffee, tea, or too much liquid can keep people awake, and cause frequent urination.", "This is helpful. A light dinner makes it easier to sleep.", "This might be a good idea. It addresses the need for sleep during the day, but it does not prevent the person from falling asleep later on.", "Good idea. Find relaxing activities before bed such as music, or reading to the person. Too much activity before bed can cause a person to be stimulated and stay awake.", "This is a good response because a routine will relax the person living with dementia.", "This is a good response. Select a normal sleeping time as much as possible."],
          optionFeedbackZh: ["这是个好主意！白天的体育锻炼可能有助于晚上的睡眠。", "这不是一个好主意。它会使失智症人士更加困惑或激动，而且安眠药可能会上瘾。", "这是一个很好的对策。咖啡、茶或过多的液体会使人保持清醒，并导致尿频。", "这很有帮助。清淡的晚餐更容易入睡。", "这可能是个好主意。它解决了白天睡眠的需求，但并不能阻止失智症人士在之后入睡。", "好主意。睡前找些轻松的活动，比如听音乐，或者给失智症人士读书。睡前过多的活动会刺激人，使人保持清醒。", "这是一个很好的对策，因为固定的程序能让失智症人士放松下来。", "这是一个很好的对策。尽可能选择一个正常的睡眠时间。"],
        },
      },
      {
        key: "delusions-hallucinations",
        title: "Delusions and hallucinations",
        titleZh: "错觉和幻觉",
        readMinutes: 6,
        summary: "This lesson explains that unreal thoughts (delusions) or seeing and hearing things that are not there (hallucinations) are common for people with dementia and can be upsetting for them and their carers. It teaches practical, gentle ways to respond, such as offering reassurance and checking the environment for triggers, rather than arguing or trying to correct the person. The goal is to reduce distress and handle these situations calmly and effectively.",
        summaryZh: "本节课将解释，不真实的思想（错觉）或看到和听到不存在的东西（幻觉）对于失智症人士来说很常见，并可能让他们及其护理者感到不安。本节课教授实用、温和的应对方法，例如给予安慰、检查环境中的诱因，而不是与他们争论或试图纠正他们。学习目标是减少痛苦，并冷静有效地处理这些情况。",
        sections: [
          { heading: "Mistaking a person for someone else", headingZh: "把一个人错当成另一个人", body: "Sometimes a person with dementia may mistake a stranger for someone they know, like a deceased relative. This can be very upsetting for them. It is not helpful to argue or try to convince them of the truth. The best approach is to soothe them, gently lead them away from the situation, and validate their feelings without agreeing with the delusion, perhaps by suggesting looking at photos of the person they are missing later.", bodyZh: "有时，失智症人士可能会把陌生人误认为他们认识的人，比如已故的亲属。这可能会让他们非常难过。与他们争论或试图说服他们接受真相是没有帮助的。最好的方法是安抚他们，温柔地引导他们离开现场，并在不认同错觉的情况下肯定他们的感受，比如可以建议稍后再看他们思念的人的照片。" },
          { heading: "Seeing people that are not there", headingZh: "看到不存在的人", body: "A person with dementia might see people or things that are not there, which can be frightening. When this happens, respond by soothing them with a calm voice and gentle touch to make them feel safe. You should also check the environment for possible triggers, like shadows, and make changes if needed. Leading them to another room can also help distract them and end the hallucination.", bodyZh: "失智症人士可能会看到不存在的人或事物，这可能很吓人。当这种情况发生时，要用平静的声音和温柔的触摸来安抚他们，让他们感到安全。你还应该检查环境中是否有潜在的诱因，比如阴影，并根据需要做出改变。带他们去另一个房间也有助于分散他们的注意力，结束幻觉。" },
          { heading: "Pleasant hallucinations", headingZh: "愉快的幻觉", body: "Sometimes, people with dementia have pleasant hallucinations, such as seeing beautiful colors or children who are not there. If these visions are not causing the person any distress, it is not necessary to intervene. Instead, you can try to enjoy these pleasant moments together with them.", bodyZh: "有时，失智症人士会出现愉快的幻觉，例如看到美丽的色彩或不存在的孩子。如果这些幻象没有给他们带来任何痛苦，就没有必要干预。相反，你可以试着和他们一起享受这些愉快的时刻。" },
          { heading: "Medication side effects", headingZh: "药物副作用", body: "It is important to consider that delusions or hallucinations could be related to medication. Be sure to check with the person's doctor regarding potential side effects of any medications they are taking. These may be contributing to the problem, and a doctor can help assess and manage this.", bodyZh: "重要的是要考虑到错觉或幻觉可能与药物有关。请务必向失智症人士的医生咨询他们正在服用的任何药物的潜在副作用。这些副作用可能是问题的原因，医生可以帮助评估和处理。" },
        ],
        keyActions: ["Remind yourself that unreal thoughts or visions are part of the disease.", "Take a deep breath and think about the best ways to respond that will be the least distressing.", "Identify ways to reduce them, not by arguing with the person you care for, but by comforting and distracting them.", "Check the environment to see if there is a cause for the delusion or hallucination.", "If one approach doesn’t work, try another one."],
        keyActionsZh: ["提醒自己，不真实的想法或幻觉是失智症的一部分。", "深吸一口气，思考能将痛苦降到最低的最佳应对方法。", "找到减少这些行为的方法，不是通过与你所护理的人争论，而是通过安慰和分散他们的注意力。", "检查环境，看是否是导致错觉或幻觉的原因。", "如果一种方法不起作用，就尝试另一种。"],
        reflectQuestion: "Has the person you care for ever had any unreal thoughts or seen or heard things that were not there?",
        reflectQuestionZh: "您所护理的人是否曾经有过任何不真实的想法，或者看到或听到过不存在的东西？",
        quiz: {
          question: "Betty, who is living with dementia, mistakes a stranger for her deceased sister and becomes upset. What would you recommend her carer, Martin, do?",
          questionZh: "失智症人士贝蒂（Betty）把一个陌生人错当成她已故的姐姐，并因此变得难过。你会建议她的护理者马丁（Martin）怎么做？",
          options: ["Soothe her in a calm voice.", "Lead her away from the woman in the park.", "Directly tell the truth, harshly, to set the record straight.", "Argue with Betty that the young woman is not her sister.", "Say that the young woman in the park is someone who looks like her, but it is not her.", "Involve the woman in the park in any way."],
          optionsZh: ["用平静的声音安抚她。", "带她离开公园里的那个女人。", "严厉地直接告诉她真相，以正视听。", "和贝蒂争论说那个年轻女人不是她姐姐。", "告诉她公园里的那个年轻女人长得像她姐姐，但并不是她姐姐。", "以任何方式让公园里的那个女人参与进来。"],
          correctIndices: [0, 1, 4],
          explanation: "The best responses involve soothing the person, validating their feelings without confirming the delusion, and gently distracting them. Arguing or trying to force the truth can increase distress.",
          explanationZh: "最好的回应是安抚失智症人士，肯定他们的感受，但不要证实他们的错觉，并温柔地分散他们的注意力。争论或试图强行让他们接受事实会增加他们的痛苦。",
          optionFeedback: ["This is a good response because people with delusions and hallucinations may feel frightened and insecure.", "This is a good response because it will distract her from the young woman in the park.", "This is not a good response as it may make Betty even more upset.", "This is not a good response as it may make Betty even more upset.", "This is a good response because it maintains a positive social environment.", "This is not helpful because it may make the situation more complicated."],
          optionFeedbackZh: ["这是一个很好的回应，因为有错觉和幻觉的人可能会感到害怕和没有安全感。", "这是一个很好的回应，因为这会分散她对公园里那个年轻女人的注意力。", "这不是一个好的回应，因为这可能会让贝蒂更加难过。", "这不是一个好的回应，因为这可能会让贝蒂更加难过。", "这是一个很好的回应，因为它维持了积极的社交环境。", "这样做没有帮助，因为这可能会使情况变得更加复杂。"],
        },
      },
      {
        key: "repetitive-behaviour",
        title: "Repetitive behaviour",
        titleZh: "重复性行为",
        readMinutes: 4,
        summary: "Repetitive behaviours are common in people with dementia and can be stressful for carers. This lesson explains that this is part of the disease, and teaches you to comfort the person, identify triggers, and change your own response to be less distressed.",
        summaryZh: "重复性行为在失智症患者中很常见，并可能给护理者带来压力。本课程解释了这是失智症的一部分，并教您如何安抚患者、识别触发因素以及改变自己的反应以减轻痛苦。",
        sections: [
          { heading: "How to comfort a person living with dementia in case of repetitive behaviours?", headingZh: "如何在失智症患者出现重复性行为时安抚他们？", body: "A person with dementia may repeat questions or actions, especially when feeling tense or their routine is changed. For instance, a man whose wife is out for the day repeatedly asks his son when lunch is and where his mother is, even after they have just eaten. Getting upset or raising your voice in response is not helpful and can increase their distress.", bodyZh: "失智症患者可能会重复问题或行为，尤其是在他们感到紧张或常规被改变时。例如，一位男士的妻子白天外出，他会反复问儿子午餐是什么时候，他母亲在哪里，即使他们刚刚吃过饭。对此感到不安或提高嗓音是没有帮助的，反而会增加他们的痛苦。" },
          { heading: "Let’s review what you have learned", headingZh: "复习您学到的知识", body: "Repetitive behaviour is a common part of dementia and can be very stressful to deal with. It is important to focus on comforting the person, identifying and modifying any triggers, and adjusting your own response. Remembering that the behaviour is part of the disease can help you respond in a way that is least distressing for both of you.", bodyZh: "重复性行为是失智症的常见症状，处理起来可能压力很大。关键在于安抚患者，识别和改变任何触发因素，并调整您自己的反应。请记住，这种行为是疾病的一部分，这能帮助您以对双方都最少痛苦的方式作出回应。" },
          { heading: "Does the person you care for ever do or say things over and over again?", headingZh: "您护理的人是否曾经反复做或说某些事情？", body: "It is important to apply what you have learned to your own situation. Think about the repetitive behaviours you have observed. Which ones are the most stressful for the person you care for, or for yourself? Consider what you could do to help reduce this behaviour, and how you could change your own response.", bodyZh: "将所学应用于您自己的情况非常重要。想一想您观察到的重复性行为。哪些行为对您护理的人或对您自己压力最大？思考您可以做些什么来帮助减少这种行为，以及如何改变您自己的应对方式。" },
          { heading: "What are repetitive behaviours?", headingZh: "什么是重复性行为？", body: "Repetitive behaviours are when a person with dementia does or says things over and over again. This is a common symptom of the disease. For carers, this can be very stressful to deal with. The key is to comfort the person and remember that these actions are part of their condition.", bodyZh: "重复性行为是指失智症患者一遍又一遍地做或说同样的事情。这是失智症的常见症状。对于护理者来说，这可能很难应对。关键是要安抚患者，并记住这些行为是他们病情的一部分。" },
        ],
        keyActions: ["Try to identify what comes before the repetitive behaviour and what may increase it. Then try to change it.", "Remember that repetitive behaviours are part of the disease.", "Realize there may be worse, but also better moments.", "Take a deep breath and think about the best ways to respond that will be the least distressing."],
        keyActionsZh: ["尝试识别重复性行为之前发生的事情，以及可能加剧这种情况的因素，然后尝试改变它。", "请记住，重复性行为是失智症的一部分。", "要认识到情况有时会更糟，但有时也会更好。", "深呼吸，思考能最大程度减轻痛苦的最佳应对方式。"],
        reflectQuestion: "Does the person you care for ever do or say things over and over again? What behaviour(s) do they repeat?",
        reflectQuestionZh: "您所护理的人是否曾经反复做或说某些事情？他们会重复哪些行为？",
        quiz: {
          question: "What would you recommend to John to help with his father's repetitive questions?",
          questionZh: "你会建议约翰如何应对他父亲的重复提问？",
          options: ["Say “What’s wrong with you? Can’t you remember? We just had lunch!”", "Stay calm and reassure his father that his wife will be home soon.", "Engage his father in an activity.", "Write down the answers to his questions, for example where his wife is and when she is expected to return.", "Walk away.", "Accept the repetitive questions. If it isn’t harmful, let it be. Find ways to adapt."],
          optionsZh: ["说：“你怎么了？不记得了吗？我们刚吃过午饭！”", "保持冷静，并向他父亲保证他的妻子很快就会回家。", "让他父亲参与一项活动。", "写下他问题的答案，例如他的妻子在哪里，以及她预计何时回来。", "走开。", "接受重复性的问题。如果无害，就随它去。想办法适应。"],
          correctIndices: [1, 2, 3, 5, 6],
          explanation: "The best responses focus on reassurance, distraction, and meeting potential underlying needs, rather than confrontation.",
          explanationZh: "最好的回应侧重于安抚、分散注意力和满足潜在的根本需求，而不是对抗。",
          optionFeedback: ["This is not a good response because John is blaming his father for something that he can’t help.", "This is a good response as repetition might worsen due to Joe’s feelings of insecurity. By reassuring Joe that his wife will come back soon, the repetition may lessen or stop.", "This can be a good response because it may distract his father and offer something else to see, hear or do.", "This might work well, may reassure Joe and stop him from asking again.", "This response is not so good because it will only upset his father more.", "This can be a good response. Perhaps if it is just repetitive questioning, by remaining calm the behaviour may decrease.", "This might be a good response. Perhaps Joe is still hungry or thirsty. It may help to calm him and meet his need."],
          optionFeedbackZh: ["这不是一个好的回应，因为约翰在指责他父亲无法控制的事情。", "这是一个好的回应，因为重复行为可能会因为乔的不安全感而恶化。通过向乔保证他的妻子很快就会回来，重复行为可能会减轻或停止。", "这可能是一个好的回应，因为它可以分散他父亲的注意力，并提供其他可以看、听或做的事情。", "这可能效果很好，可以安抚乔，让他不再追问。", "这个回应不太好，因为它只会让他父亲更难过。", "这可能是一个好的回应。如果只是重复性提问，保持冷静可能会使行为减少。", "这可能是一个好的回应。也许乔仍然饿或渴。这可能有助于让他平静下来，并满足他的需求。"],
        },
      },
      {
        key: "walking-getting-lost",
        title: "Walking and getting lost",
        titleZh: "行走与走失",
        readMinutes: 6,
        summary: "Walking around is a common behavior for people with dementia and can be a healthy exercise or a continuation of a habit. However, it can also pose a safety risk if the person gets lost, which can be upsetting for both the person and the carer. This lesson explains the possible reasons for this behavior and provides strategies to manage it safely, emphasizing understanding the cause and responding with patience.",
        summaryZh: "四处走动是失智症患者的常见行为，这可能是一种健康的锻炼或习惯的延续。然而，如果患者走失，也可能带来安全风险，这会让患者和护理者都感到不安。本课程解释了该行为可能的原因，并提供了安全管理此行为的策略，强调了理解原因和耐心应对的重要性。",
        sections: [
          { heading: "Why a person with dementia might want to walk around?", headingZh: "为什么失智症患者可能想要四处走动？", body: "A person with dementia may walk or wander for many reasons, such as a desire to exercise, relieve boredom, or continue a lifelong habit. This behavior can also be a response to pain, stress, or confusion about their surroundings or the time of day. Sometimes they may be searching for someone or something, or seeking a sense of purpose like going to work.", bodyZh: "失智症患者走路或四处走动可能有很多原因，例如想要锻炼、缓解无聊或延续终生的习惯。这种行为也可能是对疼痛、压力、或对周围环境或时间感到困惑的反应。有时，他们可能是在寻找某人或某物，或寻求一种目的感，比如去上班。" },
          { heading: "How can I manage habits and reduce the chances that the person I care for gets lost?", headingZh: "我该如何管理习惯并减少我所护理的人走失的机会？", body: "To manage walking habits, try to maintain routines and plan activities like walking together during the times the person is most likely to wander. Reassure them if they feel lost, ensure their basic needs are met, and avoid confusing places. It's also crucial to ensure the person carries identification, to secure your home to prevent them from leaving unnoticed, and to keep a recent photo on hand. If they do get lost and are found, respond with calmness and acceptance.", bodyZh: "要管理其行走习惯，应尽量保持常规，并在患者最可能走动的时间计划一起散步等活动。如果他们感到迷失，请安抚他们，确保他们的基本需求得到满足，并避免去令人困惑的地方。确保患者携带身份证明、确保您的家安全以防止他们在您不知情的情况下离开、并准备一张近照也至关重要。如果他们确实走失后被找到，请以冷静和接纳的态度回应。" },
          { heading: "Let’s look at an example", headingZh: "我们来看一个例子", body: "Amit has dementia and is supported by his wife, Samia. Samia is cooking dinner when she hears Amit heading for the door. She knows that he likes to go for afternoon walks, but now is not a good time since she is cooking.", bodyZh: "阿米特患有失智症，由他的妻子萨米亚照顾。萨米亚正在做晚饭时，听到阿米特走向门口。她知道他喜欢下午散步，但现在不是个好时机，因为她正在做饭。" },
          { heading: "Let’s review what you have learned", headingZh: "让我们回顾一下您所学到的", body: "Walking around is a common but potentially risky behavior. Concerns about getting lost can be upsetting for both the person with dementia and the carer. It is important to identify the reasons for the walking and respond patiently based on those reasons, trying different approaches if one doesn't work.", bodyZh: "到处走动是一种常见但有潜在风险的行为。对走失的担忧对失智症患者和护理者来说都可能是令人不安的。重要的是要找出走动的原因，并根据这些原因耐心应对，如果一种方法不起作用，就尝试另一种。" },
        ],
        keyActions: ["Keep to the routines and activities of the person you care for.", "Reassure the person you care for if they feel lost, abandoned or disoriented.", "Ensure that all basic needs are met.", "Avoid busy places that are confusing and can cause disorientation.", "Make sure that the person carries some form of identification.", "Make sure that your home is secure."],
        keyActionsZh: ["尽量坚持您所护理的人的常规和活动。", "如果您护理的人感到迷失、被遗弃或迷失方向，请安抚他们。", "确保所有基本需求都得到满足。", "避免去那些容易让人混淆并可能导致迷失方向的繁忙场所。", "确保患者携带某种形式的身份证明。", "确保您的家是安全的。"],
        reflectQuestion: "Does the person you care for sometimes walk around or walk away? You can describe what happens in the space below, like in a diary.",
        reflectQuestionZh: "您护理的人有时会到处走动或走开吗？您可以在下面的空白处像写日记一样描述发生的情况。",
        quiz: {
          question: "Amit has dementia and is supported by his wife, Samia. Samia is cooking dinner when she hears Amit heading for the door. She knows that he likes to go for afternoon walks, but now is not a good time since she is cooking. What would you recommend to Samia?",
          questionZh: "阿米特患有失智症，由他的妻子萨米亚照顾。萨米亚正在做晚饭时，听到阿米特走向门口。她知道他喜欢下午散步，但现在不是个好时机，因为她正在做饭。您会向萨米亚推荐什么？",
          options: ["Yell to Amit from the kitchen, “please stop! I can’t come with you now.”", "Turn the cooker off and follow Amit.", "Forbid Amit to leave and pull him back into the house.", "Go to where Amit is standing by the door and calmly say: “let’s eat dinner first and we’ll go for a walk later.”", "Lock the door so that Amit cannot leave.", "Let Amit leave and call a neighbour to keep an eye out for him."],
          optionsZh: ["在厨房里对阿米特大喊：“请停下！我现在不能跟你一起去。”", "关掉炉子，跟着阿米特。", "禁止阿米特离开，并把他拉回屋里。", "走到站在门口的阿米特身边，平静地说：“我们先吃晚饭，稍后我们再去散步。”", "锁上门，这样阿米特就不能离开。", "让阿米特离开，并打电话给邻居，让他帮忙留意。"],
          correctIndices: [1, 3, 4, 5],
          explanation: "",
          explanationZh: "",
          optionFeedback: ["This is not a good response because yelling at Amit from the kitchen may confuse and agitate him. It may also not stop him from going out on his own.", "This is a good response if there are no other alternatives.", "This is not a good response because Amit may get agitated and resist being pulled which could result in Amit or Samia being harmed.", "This is a good response because Samia stays calm, does not yell, and honors Amit’s wishes by telling him that they will go together after dinner.", "This is a good response if no other options exist and Samia is in the house with Amit. For fire safety reasons, a person living with dementia who requires supervision should never be locked inside a house without another person there.", "This is a good option if Samia has prearranged with the neighbours to keep an eye out for him. If Amit is in the very early stages of dementia, he may be okay while going out on his own to places that are familiar to him."],
          optionFeedbackZh: ["这不是一个好的回应，因为在厨房里对阿米特大喊可能会让他感到困惑和激动。这也可能无法阻止他自己出门。", "如果没有其他选择，这是一个好的回应。", "这不是一个好的回应，因为阿米特可能会变得激动并反抗被拉，这可能导致阿米特或萨米亚受伤。", "这是一个很好的回应，因为萨米亚保持冷静，没有大喊大叫，并且通过告诉阿米特他们晚饭后会一起去，尊重了他的意愿。", "如果没有其他选择，并且萨米亚和阿米特都在家里，这是一个好的回应。出于消防安全原因，需要监护的失智症患者绝不应在没有其他人在场的情况下被锁在房子里。", "如果萨米亚已经与邻居预先安排好留意他，这是一个不错的选择。如果阿米特处于失智症的极早期阶段，他自己去他熟悉的地方可能没问题。"],
        },
      },
      {
        key: "changes-in-judgement",
        title: "Changes in judgement",
        titleZh: "判断力改变",
        readMinutes: 7,
        summary: "This lesson explains how to respond to changes in judgement in a person with dementia, which can increase as the condition progresses. You will learn ways to manage different situations, from brief episodes to more serious issues like mishandling finances or unsafe driving. The goal is to respond in ways that are least distressing for both you and the person you care for.",
        summaryZh: "本节课程将解释如何应对失智症人士的判断力变化，这种变化会随着病情的进展而加剧。您将学到管理不同情况的方法，从短暂的发作到更严重的问题，如处理财务不当或不安全驾驶。我们的目标是以对您和您所护理的人都最少困扰的方式做出回应。",
        sections: [
          { heading: "How can you manage changes in judgement?", headingZh: "如何管理判断力的变化？", body: "When a person with dementia shows sudden changes in judgement, like unexpectedly scolding someone, it's important to stay calm. Reassure the person that everything is alright to help them feel relaxed. It can also be helpful to carry a card that discreetly explains the situation to others, avoiding potential embarrassment for the person with dementia. Avoid reacting in a way that could cause further agitation or isolation.", bodyZh: "当失智症人士表现出突然的判断力变化，例如出乎意料地责骂他人时，保持冷静非常重要。安抚他们，让他们放心一切都好，这有助于他们放松下来。携带一张能够悄悄向他人解释情况的卡片也很有帮助，这样可以避免让失智症人士感到尴尬。避免以可能引起进一步激动或孤立感的方式做出反应。" },
          { heading: "Mishandling finances", headingZh: "财务处理不当", body: "If you suspect a person with dementia is having trouble with their finances, such as not paying bills, approach the situation calmly. You can offer to help them with their mail or try to find out if someone else is already designated to handle their finances. It is important to share your concerns with a close family member who can help arrange support, rather than trying to take control of their finances yourself.", bodyZh: "如果您怀疑失智症人士在财务方面有困难，例如没有支付账单，请冷静地处理这种情况。您可以主动提出帮助他们处理邮件，或者尝试了解是否已有指定的人在处理他们的财务。重要的是要与亲近的家人分享您的担忧，以便他们可以帮助安排支持，而不是试图自己控制他们的财务。" },
          { heading: "Insisting on driving", headingZh: "坚持开车", body: "When a person with dementia exhibits unsafe driving, it's crucial not to ignore it. Instead of confrontationally taking their keys, offer them a ride or help them figure out alternative transportation like buses. Express your concern honestly and suggest they discuss it with their doctor. Informing a primary carer or family member is also a responsible step to ensure the safety of the person and others.", bodyZh: "当失智症人士表现出不安全的驾驶行为时，切不可忽视。不要强行拿走他们的车钥匙，而是应主动提出载他们一程，或帮助他们寻找如公交车等替代交通方式。坦诚地表达您的担忧，并建议他们与医生讨论此事。通知主要护理者或家人也是一个负责任的步骤，以确保本人和他人的安全。" },
          { heading: "Inappropriate sexual advances", headingZh: "不当的性挑逗", body: "If a person with dementia makes inappropriate sexual advances, it's important to react calmly but firmly. Tell the person the behavior is not acceptable and gently remind them of the context, such as who the aide is. You can also modify the situation to reduce triggers, like ensuring more privacy during bathing or having them do more for themselves. Shouting or ignoring the behavior is not helpful, as it is a symptom of the disease.", bodyZh: "如果失智症人士做出不当的性挑逗行为，重要的是要冷静而坚定地做出反应。告诉对方这种行为是不可接受的，并温和地提醒他们当前的情境，例如说明护理人员的身份。您也可以调整环境以减少触发因素，比如在洗澡时确保更多的私密性，或者让他们自己做更多的事情。大喊大叫或忽视这种行为是无益的，因为这是疾病的一种症状。" },
        ],
        keyActions: ["Changes in judgement usually increase as dementia progresses.", "Changes in judgement can be very upsetting for the person living with dementia and the carer.", "It is important to reduce or prevent changes in judgement, whenever possible.", "Realize that there may be good and bad days.", "Remind yourself that this is a part of the disease.", "Take a deep breath and think about the best ways to respond that will be the least distressing to you and the person you care for."],
        keyActionsZh: ["判断力的变化通常会随着失智症的进展而加剧。", "判断力的变化对失智症人士和护理者来说都可能非常令人不安。", "尽可能减少或预防判断力的变化非常重要。", "要认识到情况可能会时好时坏。", "提醒自己这是疾病的一部分。", "深呼吸，思考如何以对您和您所护理的人都最少困扰的方式做出回应。"],
        reflectQuestion: "Did you ever notice that the person you care for sometimes has a change in their judgement? If so, what did you observe?",
        reflectQuestionZh: "您是否曾注意到您所护理的人有时会出现判断力上的变化？如果有，您观察到了什么？",
        quiz: {
          question: "Ivan is visiting his aunt Isabel, who has dementia. When a taxi pulls up and startles her, the normally gentle Isabel starts scolding the driver. What would you recommend to Ivan to help him deal with this situation? Please select all correct responses.",
          questionZh: "伊万正在探望患有失智症的姑姑伊莎贝尔。当一辆出租车停在她身边吓到她时，平时很温和的伊莎贝尔开始责骂司机。您会推荐伊万怎么做来处理这种情况？请选择所有正确的回答。",
          options: ["Put his hand on Isabel’s mouth in order to stop her scolding the driver.", "Walk Isabel back to her apartment and leave because what happened is embarrassing.", "Stay calm and reassure Isabel everything is alright.", "Accept the behaviour. If the taxi driver doesn’t seem to notice, let it be. Find ways to adapt.", "Ivan could carry a business card that explains, ‘My companion has dementia, please be patient with us.’ and give this card to the taxi driver."],
          optionsZh: ["用手捂住伊莎贝尔的嘴，让她停止责骂司机。", "因为发生的事情很尴尬，所以陪伊莎贝尔走回她的公寓然后离开。", "保持冷静，并安抚伊莎贝尔一切都好。", "接受这种行为。如果出租车司机似乎没有注意到，就随它去。想办法适应。", "伊万可以携带一张名片，上面写着‘我的同伴患有失智症，请您耐心对待我们’，然后把这张卡片交给司机。"],
          correctIndices: [2, 3, 4],
          explanation: "The best approach is to remain calm, reassure the person, and adapt to the situation. Responding with physical restraint or leaving out of embarrassment can escalate the situation or make the person feel isolated. Using a card to discreetly inform others is a helpful strategy to avoid public awkwardness.",
          explanationZh: "最好的方法是保持冷静，安抚当事人，并适应情况。使用身体约束或因尴尬而离开，可能会使情况升级或让当事人感到被孤立。使用卡片悄悄告知他人是一种避免公开尴尬的有用策略。",
          optionFeedback: ["This response is not good because it may even worsen the situation and cause Isabel further agitation.", "This response is not good because Isabel may feel bad and isolated.", "This is a good response because it shows Ivan cares about Isabel. It may stop her from scolding the taxi driver and make her feel more relaxed.", "This can be an appropriate response if the behaviour is not harming anyone.", "This is a good response because it relieves Ivan from explaining the situation to the taxi driver which may embarrass Isabel."],
          optionFeedbackZh: ["这个回应不好，因为它甚至可能使情况恶化，并导致伊莎贝尔更加激动。", "这个回应不好，因为伊莎贝尔可能会感到难过和被孤立。", "这是一个很好的回应，因为它表明伊万关心伊莎贝尔。这可能会让她停止责骂出租车司机，并让她感到更放松。", "如果该行为没有伤害到任何人，这可能是一个适当的回应。", "这是一个很好的回应，因为它使伊万不必向出租车司机解释情况，从而可能避免使伊莎贝尔感到尴尬。"],
        },
      },
      {
        key: "putting-it-all-together",
        title: "Putting it all together",
        titleZh: "融会贯通",
        readMinutes: 5,
        summary: "This final lesson helps you to put all your learning together and reflect on your experiences as a carer. This lesson will review practical tips from other lessons to help you manage your feelings, involve others, and make time for yourself, reinforcing your ability to cope with the demands of caring for a person with dementia.",
        summaryZh: "本节课将帮助您将所有学到的知识整合起来，并反思您作为护理者的经历。本节课将复习来自其他课程的实用技巧，以帮助您管理自己的情绪、让他人参与进来以及为自己安排时间，从而增强您应对护理失智症患者需求的能力。",
        sections: [
          { heading: "Practical tips on not blaming yourself, sharing your feelings with others and making time for yourself", headingZh: "关于不责备自己、与他人分享感受以及为自己留出时间的实用技巧", body: "This section reviews three key tips for carers from previous lessons. Firstly, do not blame yourself or the person with dementia for challenges you face. Secondly, it is important to share your feelings with others rather than keeping them to yourself. Finally, making time for yourself to enjoy hobbies and other valued activities is essential for your own well-being.", bodyZh: "本节回顾了先前课程中为护理者提供的三个关键技巧。首先，不要因遇到的挑战而责备自己或失智症患者。其次，与他人分享您的感受非常重要，而不是自己承受。最后，为自己安排时间享受爱好和进行其他有价值的活动，这对您自己的身心健康至关重要。" },
          { heading: "The five key messages of iSupport", headingZh: "iSupport的五个关键信息", body: "The iSupport programme is built on five key messages. First, dementia is not your fault, nor the fault of the person with dementia. Second, as a carer, you are not alone. Third, what you do as a carer makes a difference. Fourth, it is important to know about dementia and how to provide care. Finally, it is crucial to also take care of yourself.", bodyZh: "iSupport计划建立在五个关键信息之上。首先，失智症不是你的错，也不是失智症患者的错。其次，作为一名护理者，你并不孤单。第三，你作为护理者所做的一切都会有所作为。第四，了解失智症以及如何提供护理非常重要。最后，照顾好自己也至关重要。" },
          { heading: "", headingZh: "", body: "This manual offers accessible, evidence-based training for carers of people with dementia, aiming to improve knowledge and caregiving skills. It helps carers learn to cope with dementia symptoms and to care for themselves.", bodyZh: "本手册为失智症患者的护理者提供易于理解的、基于证据的培训，旨在提高知识和护理技能。它帮助护理者学习如何应对失智症症状并照顾好自己。" },
          { heading: "", headingZh: "", body: "You have finished this lesson, well done!", bodyZh: "您已完成本课，做得很好！" },
        ],
        keyActions: ["Don’t blame yourself or the person living with dementia for the problems that you encounter.", "Share your feelings about your experiences as a carer with others.", "It is essential that you make time for yourself."],
        keyActionsZh: ["不要因为遇到的问题而责备自己或失智症患者。", "与他人分享您作为护理者的经历和感受。", "为自己安排时间至关重要。"],
        reflectQuestion: "How have your experiences as a carer changed since you began the iSupport programme?",
        reflectQuestionZh: "自开始iSupport计划以来，您作为一名护理者的经历发生了怎样的变化？",
        quiz: {
          question: "Which of the following are part of the five key messages of iSupport?",
          questionZh: "以下哪项是iSupport的五个关键信息的一部分？",
          options: ["Dementia is not your fault.", "What you do makes a difference.", "It's important to know about dementia.", "It's crucial to take care of yourself."],
          optionsZh: ["失智症不是你的错。", "你所做的一切都会有所作为。", "了解失智症很重要。", "照顾好自己至关重要。"],
          correctIndices: [0, 1, 2, 3],
          explanation: "All of these are key messages of the iSupport programme. They are foundational to understanding your role as a carer and maintaining your own well-being.",
          explanationZh: "所有这些都是iSupport计划的关键信息。它们是理解您作为护理者的角色和维持自身福祉的基础。",
          optionFeedback: [],
          optionFeedbackZh: [],
        },
      }
    ],
  }
];

export const ISUPPORT_SOURCE_ATTRIBUTION = {
  en: "Adapted from WHO iSupport for Dementia: Training and support manual for carers of people with dementia (WHO, 2019).",
  zh: "改编自世界卫生组织《iSupport 失智症照护：失智症患者护理者培训与支持手册》（WHO, 2019）。",
  url: "https://www.who.int/publications/i/item/9789241515863",
};
