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
        summary: "Understanding dementia is crucial for carers. This lesson addresses common myths and provides foundational knowledge about what dementia is, its causes, and how it affects a person. Knowing the basics will help you better understand the person you are caring for, recognize the stages of the disease, and know when and how to seek professional medical advice and support for both the person with dementia and yourself.",
        summaryZh: "了解失智症对护理者至关重要。本课程旨在消除关于失智症的常见误解，并提供有关其定义、成因及影响的基础知识。掌握这些基本信息将有助于您更好地理解您所护理的人，识别疾病的各个阶段，并知道何时以及如何为您所护理的人和您自己寻求专业的医疗建议和支持。",
        sections: [
          { heading: "What is dementia?", headingZh: "什么是失智症？", body: "Dementia results from a disease process that progressively damages the brain. It is a disease and not a part of normal ageing. Dementia affects people from all societal groups, and while it is more common in older people, younger individuals can also be affected.", bodyZh: "失智症是因一种疾病发展过程而导致的，它会逐渐损害大脑。这是一种疾病，并非正常衰老的一部分。失智症会影响所有社会群体，虽然在老年人中更为常见，但年轻人也可能受到影响。" },
          { heading: "What causes dementia?", headingZh: "失智症的成因是什么？", body: "Dementia is caused by diseases that destroy nerve cells and damage the brain. The most common cause is Alzheimer’s disease. Other causes include Vascular Dementia, caused by damaged blood vessels; Dementia with Lewy bodies, which involves abnormal protein deposits; and Fronto-temporal dementia, with damage concentrated in the front of the brain.", bodyZh: "失智症是由破坏神经细胞和损害大脑的疾病引起的。最常见的成因是阿尔茨海默病。其他原因包括因血管受损引起的血管性失智症，涉及异常蛋白质沉积的路易体失智症，以及损伤集中在大脑前部的额颞叶失智症。" },
          { heading: "What happens to people with dementia as the disease progresses?", headingZh: "随着病情发展，失智症人士会怎样？", body: "Each person's experience with dementia is unique, but it generally progresses through stages. In the early stage, individuals may experience memory problems and disorientation. As it advances to the middle stage, they may need help with daily activities, and by the late stage, they might not recognize loved ones and may show significant behavioral changes.", bodyZh: "每个人的失智症经历都是独特的，但病情通常会分阶段发展。在早期阶段，患者可能会出现记忆问题和迷失方向感。进入中期阶段，他们可能在日常活动中需要帮助。到了晚期，他们可能不再认识亲友，并可能表现出显著的行为变化。" },
          { heading: "What to do if you think that the person you care for has dementia?", headingZh: "如果怀疑你所护理的人患有失智症，该怎么办？", body: "If you suspect a person may have dementia, the essential first step is to arrange for them to see a medical doctor. A doctor can perform a thorough examination to determine the cause of the symptoms. It is crucial to rule out other treatable conditions that can mimic dementia, such as depression, infections, or medication side effects.", bodyZh: "如果你怀疑某人可能患有失智症，关键的第一步是安排他们去看医生。医生可以进行全面检查，以确定症状的起因。排除其他可能模仿失智症的可治疗性疾病（如抑郁症、感染或药物副作用）至关重要。" },
          { heading: "How to reach out for help?", headingZh: "如何寻求帮助？", body: "As a carer, you cannot provide all the necessary care alone, especially as the disease progresses. It is vital to reach out to family members, friends, and professional organizations. Contacting your local Alzheimer's Association can provide information, support, and resources available in your area for both you and the person you care for.", bodyZh: "作为一名护理者，你无法独自提供所有必要的护理，尤其是在病情发展后。向家人、朋友和专业组织求助至关重要。联系你当地的失智症协会，可以获取你所在地区为你和你所护理的人提供的信息、支持和可用资源。" },
          { heading: "What is the focus of this manual?", headingZh: "本手册的重点是什么？", body: "This manual focuses on you, the carer. It provides support to help you cope with the daily challenges of caregiving. A key message is the importance of taking care of yourself, not just the person with dementia, and iSupport will guide you on how to do this.", bodyZh: "本手册的重点是您，即护理者。它为您提供支持，以帮助您应对日常护理的挑战。一个关键信息是，照顾好自己和照顾失智症人士同样重要，iSupport将指导您如何做到这一点。" }
        ],
        keyActions: ["If you suspect dementia, ensure the person sees a doctor to get a diagnosis and rule out other conditions.", "Remember that dementia is a disease, not a normal part of ageing.", "Reach out for help from family, friends, and local support organizations like the Alzheimer's Association.", "Prioritize your own well-being; you must also take care of yourself while you are caring for someone else."],
        keyActionsZh: ["如果你怀疑对方患有失智症，请确保其就医以获得诊断并排除其他疾病。", "请记住，失智症是一种疾病，不是正常衰老的一部分。", "向家人、朋友和当地的支持组织（如失智症协会）寻求帮助。", "优先考虑自己的福祉；在照顾他人的同时，您也必须照顾好自己。"],
        reflectQuestion: "Reflect on the common symptoms of dementia mentioned, such as memory loss, difficulty with daily tasks, or changes in personality. Have you noticed any of these signs in the person you care for?",
        reflectQuestionZh: "反思一下课程中提到的失智症常见症状，例如记忆力减退、难以完成日常任务或性格改变。您是否在您护理的人身上注意到任何这些迹象？",
        quiz: {
          question: "What is the first step if you think that a family member or friend has dementia? Please tick the answers you think are correct. (Select all that apply.)",
          questionZh: "如果你认为家人或朋友可能患有失智症，第一步该做什么？请选出你认为正确的答案。（多选）",
          options: [
            "Call a friend or relative.",
            "Use iSupport alone for help.",
            "Call a medical doctor's office and make an appointment.",
            "The person has been to a medical doctor already and has been diagnosed with dementia."
          ],
          optionsZh: [
            "给朋友或亲戚打电话。",
            "只靠 iSupport 来寻求帮助。",
            "打电话给医生诊所并预约。",
            "对方已经看过医生，并已被诊断为失智症。"
          ],
          correctIndices: [2, 3],
          explanation: "Only a medical doctor can confirm whether memory problems are dementia or another treatable condition (such as depression, infection or medication side effects). If a diagnosis already exists, you can move on to support and planning.",
          explanationZh: "只有医生才能确认记忆问题是失智症，还是其它可以治疗的状况（如抑郁、感染或药物副作用）。如果已经有诊断，则可以进入支持和规划阶段。",
          optionFeedback: [
            "Not the first step. A friend or relative cannot diagnose dementia; only a medical doctor can.",
            "Not the first step. iSupport is a support manual, not a diagnostic tool.",
            "Correct. Booking a medical appointment is the proper first step so the doctor can examine the body and brain functioning and rule out other causes.",
            "Correct. If the person has already been seen and diagnosed by a doctor, the diagnostic step is done; you can now focus on care and support."
          ],
          optionFeedbackZh: [
            "不是第一步。朋友或亲戚无法诊断失智症，只有医生才可以。",
            "不是第一步。iSupport 是一份支持手册，不是诊断工具。",
            "正确。预约就医是恰当的第一步，医生会检查身体和大脑功能，排除其它可能原因。",
            "正确。如果已经看过医生并被诊断，诊断这一步就完成了；接下来可以专注于护理与支持。"
          ],
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
        summary: "Caring for a person with dementia is a journey that changes daily life for you both. As dementia progresses, your role as a carer will evolve, requiring you to take on more responsibilities, including personal care. This lesson provides skills to help you on this journey: staying connected through open communication, involving friends and family for support, taking care of your own well-being by planning relaxation, and planning for future care needs together.",
        summaryZh: "照顾失智症患者是一段会改变您们双方日常生活的旅程。随着失智症的进展，您作为护理者的角色也会演变，需要承担更多责任，包括个人护理。本课程为您提供踏上这段旅程所需的技能：通过开放的沟通保持联系，邀请朋友和家人提供支持，通过计划放松来照顾好自己的身心健康，以及共同为未来的护理需求做计划。",
        sections: [
          { heading: "How may your roles change over time?", headingZh: "您的角色会如何随着时间推移而改变？", body: "In the early stages of dementia, you may still be able to enjoy many different activities together. As dementia progresses, the person will need more help with daily tasks like managing medications. In the later stages, your caring role might expand to include personal care such as bathing and dressing, which can be challenging.", bodyZh: "在失智症的早期阶段，您们可能仍能一起享受许多活动。随着病情发展，患者将需要更多帮助来处理日常事务，例如服药。到了晚期，您的护理角色可能会扩展到个人护理，如洗澡和穿衣，这可能会带来挑战。" },
          { heading: "How to stay connected with the person you care for?", headingZh: "如何与您所照顾的人保持联系？", body: "It is important to keep talking about the changes dementia brings. Communicate using simple sentences, try to manage your own feelings, and create quality time for each other. Openly discussing what is happening now and what might happen in the future will help you stay connected.", bodyZh: "持续沟通失智症带来的变化至关重要。请使用简单的句子进行交流，尽力控制好自己的情绪，并为彼此创造优质的相处时间。坦诚地讨论现状和未来可能发生的事，将帮助您们保持紧密的联系。" },
          { heading: "How to plan pleasant activities and relaxation?", headingZh: "如何计划愉快的活动和放松？", body: "As caregiving becomes more time-consuming, it is crucial to take time for yourself to prevent burnout from stress. Make sure to include pleasant activities and relaxation in your routine. Tending to your own well-being is a vital part of the journey together.", bodyZh: "随着护理工作越来越耗时，为了防止因压力而身心俱疲，您必须为自己留出时间。请务必在您的日常安排中加入愉快的活动和放松。照顾好自己的身心健康，是您们共同旅程中至关重要的一环。" },
          { heading: "How to involve others?", headingZh: "如何让其他人参与进来？", body: "Caring for someone with dementia does not have to be a lonely experience, and is sometimes too big a job for one person. Let friends and family members know when you could use a break. Talking about your thoughts and feelings with others might help you feel better.", bodyZh: "照顾失智症患者不必是一段孤独的经历，而且有时候对一个人来说任务过于艰巨。当您需要休息时，请告诉朋友和家人。与他人倾诉您的想法和感受，也许能让您感觉好一些。" },
          { heading: "How to plan well for the future?", headingZh: "如何为未来做好规划？", body: "It is best to discuss future plans early, while the person with dementia can still clearly express their wishes. You can discuss preferences for future care, financial planning, and end-of-life decisions. Planning ahead provides clarity for everyone and ensures the person's wishes are known.", bodyZh: "最好及早讨论未来的计划，趁着失智症患者仍能清晰表达自己的意愿时。您可以讨论对未来护理的偏好、财务规划以及临终决定。提前规划能为每个人带来明确性，并确保患者的意愿能被了解。" }
        ],
        keyActions: ["Ask friends and family for help when you need a break.", "Plan pleasant activities and relaxation time for yourself to avoid burnout.", "Plan for future care needs early to ensure the person's wishes are respected.", "Use touch, hold hands, or play music to communicate warmth and stay connected."],
        keyActionsZh: ["当您需要休息时，请向朋友和家人求助。", "为自己计划愉快的活动和放松时间，以避免身心俱疲。", "及早为未来的护理需求做计划，以确保患者的意愿得到尊重。", "通过触摸、牵手或播放音乐来传递温暖并保持联系。"],
        reflectQuestion: "What are some ways that you and the person you care for can maintain intimacy and connection as dementia progresses?",
        reflectQuestionZh: "随着失智症病情的发展，您和您照顾的人可以通过哪些方式来维持亲密感和联系？",
        quiz: {
          question: "Olivia has dementia and is frustrated that she keeps forgetting items at the store. How should her husband Jacob best handle this?",
          questionZh: "奥利维亚（Olivia）患有失智症，她对自己总是在商店忘记买东西感到很沮丧。她的丈夫雅各布（Jacob）应该如何最好地处理这种情况？",
          options: ["Do not blame Olivia, but make a shopping list together with her before she goes.", "Ask Olivia how she feels about her memory loss.", "Forbid Olivia from shopping anymore.", "Tell Olivia to try harder to remember things."],
          optionsZh: ["不要责备奥利维亚，而是在她去购物前一起列好购物清单。", "询问奥利维亚对自己记性变差的感受。", "禁止奥利维亚再去购物。", "告诉奥利维亚要更努力地去记事情。"],
          correctIndices: [0, 1],
          explanation: "This is a very good response because this practical solution helps Olivia to continue shopping and maintain her independence for as long as possible.",
          explanationZh: "这是一个非常好的回应，因为这个务实的解决方案能帮助奥利维亚继续购物，并尽可能长时间地保持她的独立性。",
          optionFeedback: ["Good idea. Practical support like a shared list helps Olivia stay independent.", "Good idea. Asking how she feels acknowledges her emotions and keeps you connected.", "Not helpful. Forbidding her removes her independence and dignity.", "Not helpful. She is not failing on purpose; trying harder will not help and adds shame."],
          optionFeedbackZh: ["很好的做法。实用的支持（如共同列清单）能帮助奥利维亚保持独立。", "很好的做法。询问她的感受体现了对她情绪的关注，能保持彼此联系。", "无益。禁止她购物剥夺了她的独立和尊严。", "无益。她不是故意忘记的，更努力没有用，反而增加羞愧感。"],
        },
      },
      {
        key: "improving-communication",
        title: "Improving communication",
        titleZh: "改善沟通",
        readMinutes: 8,
        summary: "Dementia can make communication difficult, leading to frustration for you and the person you care for. This lesson provides tools and tips for good communication. You will learn how to talk in a simple and direct way, show compassion in everyday situations, and ensure you both understand each other. Key skills include checking their hearing and sight, getting their attention respectfully, keeping language simple, and paying attention to their reactions and feelings.",
        summaryZh: "失智症通常会使沟通变得困难，导致您和您所护理的人都感到沮丧。本课为您提供良好沟通的工具和技巧。您将学习如何以简单直接的方式交谈，在日常情境中表达同情心，并确保彼此理解。关键技能包括检查他们的听力和视力，以尊重的方式吸引他们的注意力，保持语言简单，以及关注他们的反应和感受。",
        sections: [
          { heading: "How to improve communication?", headingZh: "如何改善沟通？", body: "Dementia can make communication challenging, which may strain your relationship with the person you care for and cause frustration. Effective communication involves ensuring they understand you and that you understand them. Showing compassion through listening, showing interest, or giving a hug is vital for their well-being.", bodyZh: "失智症会使沟通变得充满挑战，这可能会让您与被护理者之间的关系变得紧张并导致挫败感。有效的沟通包括确保他们理解您，并且您也理解他们。通过倾听、表示兴趣或给予拥抱来表达同情心，对他们的福祉至关重要。" },
          { heading: "How to check the person’s ability to hear and see?", headingZh: "如何检查患者的听力和视力？", body: "Basic sensory abilities are crucial for all communication. It's important to check if their hearing and sight can be improved. Ensure there is enough light and color contrast in their environment, check if their glasses are clean and correctly prescribed, and minimize background noise. Also, make sure any hearing aids are worn correctly and are functioning.", bodyZh: "基本的感官能力对所有沟通都至关重要。检查他们的听力和视力是否可以改善非常重要。确保环境中​​有足够的光线和颜色对比，检查他们的眼镜是否干净且度数准确，并尽量减少背景噪音。另外，还要确保助听器佩戴正确且功能正常。" },
          { heading: "How to get attention in a respectful way?", headingZh: "如何以尊重的方式获得关注？", body: "Always remember the person with dementia has feelings. Approach them respectfully by calling a name they recognize, speaking clearly face-to-face at their eye level, and gently tapping their hand or arm. Avoid shouting, approaching from behind, or startling them, as this can cause distress.", bodyZh: "永远记住失智症患者是有感情的。要尊重地接近他们，可以称呼他们认可的名字，在平视他们的前提下清晰地面对面交谈，并轻轻地拍拍他们的手或胳膊。避免大喊大叫、从背后接近或惊吓他们，因为这可能会导致他们感到痛苦。" },
          { heading: "How to keep it simple?", headingZh: "如何保持简单？", body: "Complex language can be confusing for a person with dementia. Communicate more effectively by keeping your sentences short, asking one question at a time, and reducing background noise from TVs or radios. If needed, switch from open-ended questions to simple 'Yes' or 'No' questions.", bodyZh: "复杂的语言可能会让失智症患者感到困惑。为了更有效地沟通，请保持句子简短，一次只问一个问题，并减少电视或收音机等背景噪音。如果需要，可以将开放式问题转换为简单的“是”或“否”问题。" },
          { heading: "How to take the person seriously?", headingZh: "如何认真对待患者？", body: "Even if their language seems strange, the person with dementia is trying to communicate something important. Treat them with respect and dignity by being patient and giving them time to find their words. Never talk about them as if they aren't there, and try asking simple 'Yes' or 'No' questions to help understand their meaning.", bodyZh: "即使他们的语言看似奇怪，失智症患者也在努力传达一些重要的信息。请尊重和有尊严地对待他们，耐心等待，给他们时间寻找合适的词语。切勿当着他们的面议论他们，可以尝试问一些简单的“是”或“否”问题来帮助理解他们的意思。" },
          { heading: "How to pay attention to reactions?", headingZh: "如何注意反应？", body: "A person's feelings are often revealed through non-verbal cues. Pay close attention to facial expressions and body language, such as smiling, fidgeting, or crossing their arms. These reactions can tell you if they are happy, nervous, anxious, or upset, helping you to better understand and communicate with them.", bodyZh: "一个人的感受通常会通过非语言的线索显露出来。请密切关注面部表情和肢体语言，例如微笑、坐立不安或双臂交叉。这些反应可以告诉你他们是开心、紧张、焦虑还是难过，从而帮助你更好地理解他们并与之沟通。" },
          { heading: "How to give compliments?", headingZh: "如何给予赞美？", body: "Giving genuine compliments is more effective than pointing out mistakes. Saying something positive makes the person feel good and valued. You can compliment them on something they did well, how they look, or simply tell them you enjoy their company; for example, 'You have a great smile' or 'Thank you for being so helpful.'", bodyZh: "给予真诚的赞美比指出错误更有效。说一些积极的话能让患者感觉良好并受到重视。你可以赞美他们做得好的某件事、他们的外表，或者只是告诉他们你喜欢和他们在一起；例如，“你的笑容很美”或“谢谢你，你帮了大忙”。" },
          { heading: "How to show compassion?", headingZh: "如何表达同理心？", body: "It's important to show compassion, even when communication is difficult or repetitive. Remember that dementia is a disease that affects memory and communication, so be patient. Acknowledging their feelings and showing you understand helps build a supportive and caring relationship.", bodyZh: "表达同情心非常重要，即使在沟通困难或重复时也是如此。请记住，失智症是一种会影响记忆和沟通的疾病，所以请保持耐心。认可他们的感受并表示理解，有助于建立支持性和充满关怀的关系。" }
        ],
        keyActions: ["Speak clearly and slowly, face-to-face and at eye level.", "Keep language simple and ask only one question at a time.", "Pay attention to facial expressions and body language to understand their feelings.", "Don't talk about them in their presence; be patient and give them time to find words.", "Give genuine compliments and show affection with a smile or a hug."],
        keyActionsZh: ["清晰、缓慢地说话，与对方平视、面对面交流。", "保持语言简单，一次只问一个问题。", "注意面部表情和肢体语言，以了解他们的感受。", "不要当着他们的面议论他们；要有耐心，给他们时间来组织语言。", "给予真诚的赞美，用微笑或拥抱表达喜爱之情。"],
        reflectQuestion: "Think about all the things that you like about the person you care for. Now try to write down something you would say to give them a compliment.",
        reflectQuestionZh: "想想所有你欣赏被护理者的方面。现在，试着写下一句你会用来赞美他们的话。",
        quiz: {
          question: "Below are some suggested ways to get the attention of a person living with dementia. Which are respectful, appropriate ways? (Select all that apply.)",
          questionZh: "以下是一些建议的吸引失智症患者注意的方法。哪些是尊重且恰当的方式？（多选）",
          options: [
            "Raise your voice or shout.",
            "Stop and hold the person to make them listen.",
            "Speak clearly and slowly, at a comfortable volume, face to face and at eye level.",
            "Approach from the back and touch the person's shoulder.",
            "Tap a hand, arm or front of the shoulder gently.",
            "Call the person living with dementia by a name that he or she recognizes."
          ],
          optionsZh: [
            "提高声音或大喊。",
            "拦住对方并抓住他们以让他们听。",
            "清晰、缓慢地说话，用舒服的音量，面对面、平视交流。",
            "从背后接近并拍对方肩膀。",
            "轻轻拍手、胳膊或肩膀正面。",
            "用对方认得的名字称呼失智症患者。"
          ],
          correctIndices: [2, 4, 5],
          explanation: "Approach the person respectfully, calmly and where they can see you. Avoid shouting, restraining, or surprising them from behind, as these can cause sadness, fear or anger.",
          explanationZh: "应当以尊重、平静、并让对方能看到你的方式接近。避免大喊、强行拉住，或从背后惊到对方，否则会让人感到悲伤、害怕或愤怒。",
          optionFeedback: [
            "Not respectful. Raising your voice is not a respectful way to gain attention. It may even make the person living with dementia feel sad, frustrated or angry.",
            "Not respectful. This is not a respectful way to get attention. It may even make the person feel distressed or angry.",
            "Appropriate. This is an appropriate way to make contact. It shows that you are seeking contact in a respectful manner.",
            "Not ideal. This may startle someone who is not expecting you or perhaps did not hear you coming.",
            "Good. This is a good way to attract the attention of a person living with dementia.",
            "Good. This is a good way to attract attention. You might use their first name or a nickname that was used in the past."
          ],
          optionFeedbackZh: [
            "不尊重。提高嗓门并不是尊重的吸引注意方式，可能让失智症患者感到悲伤、沮丧或愤怒。",
            "不尊重。这不是尊重的吸引注意方式，反而可能让对方感到痛苦或愤怒。",
            "恰当。这是恰当的接触方式，体现出你以尊重的态度在寻求交流。",
            "不太好。这可能会惊到没料到你来、或没听到你脚步的人。",
            "很好。这是吸引失智症患者注意的好办法。",
            "很好。这是吸引注意的好办法。你可以叫他们的名字，或过去常用的昵称。"
          ],
        },
      },
      {
        key: "supported-decision-making",
        title: "Supported decision-making",
        titleZh: "支持性决策",
        readMinutes: 5,
        summary: "People with dementia have the right to make decisions about their lives, but this ability can decline over time. This lesson teaches you how to support the person you care for in making their own decisions for as long as possible. You will learn how to assist with everything from everyday choices to complex ones, and how to make decisions in their best interest when they can no longer decide for themselves. This support helps maintain their independence and self-esteem.",
        summaryZh: "失智症患者有权对自己的生活做出决定，但这种能力会随着时间的推移而下降。本课程教您如何支持您所护理的人，让他们尽可能长时间地自己做决定。您将学习如何协助他们处理从日常选择到复杂决定的所有事情，以及在他们无法自己做决定时，如何以他们的最佳利益为出发点来做决定。这种支持有助于维持他们的独立性和自尊。",
        sections: [
          { heading: "Why is support in decision-making needed?", headingZh: "为什么在决策中需要支持？", body: "Making decisions can become difficult for a person with dementia due to memory loss, problems with thinking, or صعوبة in expressing themselves. Complex decisions can be especially challenging, so your support is important to help them participate in choices that affect their lives.", bodyZh: "由于记忆力减退、思维问题或表达困难，失智症患者可能难以做出决定。复杂的决定尤其具有挑战性，因此您的支持对于帮助他们参与影响其生活的选择非常重要。" },
          { heading: "How to make decisions in someone's best interest?", headingZh: "如何做出最符合他人利益的决定？", body: "When a person can no longer make decisions, you must act in their best interest. This involves considering their past and present wishes, their beliefs and values, and the views of anyone they've named to be consulted. This ensures decisions align with what they would have wanted, promoting their dignity.", bodyZh: "当一个人无法再做决定时，您必须以他们的最大利益行事。这包括考虑他们过去和现在的愿望、他们的信仰和价值观，以及他们指定要咨询的任何人的意见。这能确保所做的决定符合他们可能有的愿望，从而维护他们的尊严。" },
          { heading: "How to support someone with dementia to make everyday decisions?", headingZh: "如何支持失智症患者做出日常决定？", body: "It is important to encourage the person you care for to do whatever they are still able to do. Supporting them in making simple, everyday decisions, like what to wear or eat, helps them remain independent and can improve their self-esteem.", bodyZh: "鼓励您护理的人继续做他们仍有能力做的事情非常重要。支持他们做出简单的日常决定，比如穿什么或吃什么，可以帮助他们保持独立，并能提高他们的自尊。" },
          { heading: "How to support someone with dementia to make everyday decisions as the dementia progresses?", headingZh: "随着失智症病情发展，如何支持患者做出日常决定？", body: "As dementia progresses, making choices can become stressful. To help, you can simplify decisions by limiting the number of options, such as asking if they want to wear their blue or black trousers. It may also help to discuss things at a time of day when they are less worried or tired.", bodyZh: "随着失智症的进展，做选择可能会带来压力。为了提供帮助，您可以通过限制选项数量来简化决定，例如询问他们想穿蓝色裤子还是黑色裤子。在一天中他们不那么担心或疲倦的时候讨论事情也可能会有所帮助。" },
          { heading: "How to support someone with dementia in making complex decisions?", headingZh: "如何支持失智症患者做出复杂决定？", body: "Even with complex decisions, such as those about medical treatment, a person with dementia can be involved with the right support. This means providing clear, simple information to help them understand the consequences of the decision. Preparing in advance by discussing their wishes early on is also very helpful.", bodyZh: "即使是面对复杂的决定（如关于医疗的决定），失智症患者也可以在适当的支持下参与其中。这意味着要提供清晰、简单的信息，帮助他们理解该决定的后果。尽早讨论他们的愿望，提前做好准备，也会非常有帮助。" }
        ],
        keyActions: ["Limit choices to make decisions easier (e.g., offer two outfit options).", "For complex decisions, clearly explain the pros and cons in simple terms.", "Discuss future decisions about care, finances, and medical treatments early on.", "To prepare for the future, write down the person’s wishes to ensure they are respected.", "Always act in the person's best interests, not your own or others'."],
        keyActionsZh: ["限制选择以使决策更容易（例如，提供两种着装选择）。", "对于复杂的决定，用简单的语言清楚地解释利弊。", "尽早讨论有关护理、财务和医疗的未来决定。", "为未来做准备，写下患者的愿望，以确保他们的意愿得到尊重。", "始终以患者的最佳利益行事，而不是您自己或他人的利益。"],
        reflectQuestion: "Think about the ways you currently support the person you care for to make decisions. Are there small, everyday choices where you could offer more support to help them decide for themselves?",
        reflectQuestionZh: "想一想您目前是如何支持您所护理的人做决定的。在日常的一些小选择上，您能否提供更多支持来帮助他们自己做决定？",
        quiz: {
          question: "Mary has dementia and her doctor wants her to start a new medication. Mary's daughter Chrissy is with her at the appointment. What should the doctor and Chrissy do to support Mary's decision? (Select all that apply.)",
          questionZh: "玛丽患有失智症，医生希望她开始服用一种新药。她的女儿克莉茜陪她来就诊。医生和克莉茜应该如何支持玛丽做决定？（多选）",
          options: [
            "Mary says what she wants, so she does not need support in deciding whether to start the medication.",
            "The doctor simply tells her she should take the medication because it is good for her health.",
            "The doctor explains that taking the medication is good for her health because it will slow down damage to her brain from dementia.",
            "Her daughter says: \"Mom, you know you are forgetting things and have difficulty finding the right words. Taking the medication may slow these problems down a bit.\""
          ],
          optionsZh: [
            "玛丽说出了自己的想法，所以她不需要别人协助决定是否开始服药。",
            "医生只是直接告诉她应该吃药，因为对她健康有好处。",
            "医生解释说服药对她的健康有好处，因为可以减缓失智症对大脑的损害。",
            "她的女儿说：\"妈，你知道你最近忘事、说话也想不起词。吃这个药可能让这些问题减缓一点。\""
          ],
          correctIndices: [2, 3],
          explanation: "Multiple answers are correct. Mary needs information explained in ways she can understand so she can make an informed decision. The doctor should explain the medical reasons clearly, and family can rephrase in everyday words she relates to.",
          explanationZh: "多个答案都正确。玛丽需要别人用她能理解的方式解释信息，才能做出知情的决定。医生应清楚解释医学原因，家人可以用她熟悉的日常话再说一遍。",
          optionFeedback: [
            "Not correct. Since Mary has dementia, we are not sure she understands why she needs the medication or the consequences of taking or not taking it.",
            "Incorrect. Although the medication may help, the doctor is telling Mary what to do rather than supporting her decision.",
            "Right. The doctor's explanation allows Mary to understand the importance of the medication and enables her to make an informed decision.",
            "Correct. Using different words to explain the reasons for taking the medication may help Mary understand why it would benefit her."
          ],
          optionFeedbackZh: [
            "不正确。因为玛丽有失智症，我们无法确定她是否理解自己为什么需要这种药，以及服或不服的后果。",
            "不正确。虽然药物对健康有益，但医生是在告诉玛丽该怎么做，而不是支持她自己决定。",
            "正确。医生的解释让玛丽理解了服药的重要性，使她能做出知情的决定。",
            "正确。换一种措辞来解释服药的原因，可能帮助玛丽理解服药对她的好处。"
          ],
        },
      },
      {
        key: "involving-others",
        title: "Involving others",
        titleZh: "让其他人参与进来",
        readMinutes: 6,
        summary: "Sharing caregiving responsibilities helps you provide care in the long term. It can be difficult to ask for help, but as the needs of the person with dementia increase, it becomes essential to involve others so tasks can be shared. This lesson will teach you the skill of asking for help effectively. You will learn how to identify the types of help you need, make a wish list of achievable requests, and communicate your needs clearly and directly. Getting help early on allows you to take a break and build a sustainable support system.",
        summaryZh: "与他人分担护理责任，能帮助您长期坚持。虽然开口求助可能很难，但随着护理需求的日益增加，让他人参与至关重要。本课程将教您有效求助的技巧，涵盖识别您需要的帮助类型、列出具体愿望清单，以及如何直接、清晰地沟通您的需求。及早求助，能让您获得喘息的机会，并建立起一个可持续的互助网络。",
        sections: [
          { heading: "The importance of involving family and friends", headingZh: "让家人和朋友参与进来的重要性", body: "As dementia progresses, the person you care for will require more help. Involving others in care tasks is vital so you don't get overwhelmed and can continue providing care long-term. It's also helpful to have someone to talk to who understands your situation. Don't wait until you're exhausted to ask for help; building a support network early on is key.", bodyZh: "随着失智症病情的发展，您所护理的人将需要更多帮助。让他人参与护理任务至关重要，这样您才不会被压垮，并能长期坚持下去。同时，有个能理解您处境的人倾诉也很有帮助。不要等到筋疲力尽时才求助，及早建立支持网络是关键。" },
          { heading: "Types of help and support that you might need", headingZh: "您可能需要的帮助和支持类型", body: "The help you receive can come in many forms. These include practical help like shopping or cleaning, help with pleasant activities like taking the person for a walk, emotional support from a listening friend, and informational support like finding resources. Take stock of your current support network to see where you might need more help.", bodyZh: "您所获得的帮助可以有多种形式。其中包括实际帮助（如购物或打扫卫生）、协助愉快活动（如带失智症人士散步）、来自朋友倾听的情感支持，以及信息支持（如寻找相关资源）。审视您目前的支持网络，看看在哪些方面可能需要更多帮助。" },
          { heading: "Effectively asking for help from others", headingZh: "如何有效地向他人求助", body: "To ask for help effectively, be honest, direct, and clear about your thoughts, feelings, and needs. Also, keep the other person’s feelings in mind and be flexible with the outcome. Breaking your request into smaller, specific tasks can make it easier for others to say yes. If a conversation becomes difficult, agree to take a break and talk again later.", bodyZh: "为了有效地求助，您需要诚实、直接、清晰地表达自己的想法、感受和需求。同时，也要考虑到对方的感受，并对结果抱持灵活的态度。将您的请求分解成更小、更具体的任务，可以让对方更容易答应。如果对话变得困难，可以同意先暂停一下，稍后再谈。" }
        ],
        keyActions: ["Make a ‘wish list’ of specific, achievable tasks you need help with.", "Be honest and direct about your needs, but also consider the other person’s feelings.", "Break your request down into smaller parts, as people are more likely to agree to a small request.", "If the person you ask says no, don’t give up. Think about who else you could ask."],
        keyActionsZh: ["列出您需要帮助的、具体的、可实现的“愿望清单”。", "诚实、直接地表达您的需求，但也要考虑对方的感受。", "将您的请求分解成更小的部分，因为人们更容易答应小请求。", "如果您求助的人拒绝了，不要放弃。想一想您还可以向谁求助。"],
        reflectQuestion: "Think of one thing you need help with. Who could you ask, and what exactly would you say to them?",
        reflectQuestionZh: "想一件您需要帮助的事情。您可以向谁求助，您具体会对他们说些什么？",
        quiz: {
          question: "Li is feeling overwhelmed caring for their mother and wants to ask her sister for help. Which of the following are effective ways to ask? (Select all that apply.)",
          questionZh: "李在照顾妈妈中感到不堪重负，想向姐姐求助。下面哪些是有效的求助方式？（多选）",
          options: [
            "Li tells her sister honestly that she needs a regular break, says what she is thinking, and keeps her sister's interests in mind too.",
            "Li hints that things are hard but does not actually say she needs help, hoping her sister will figure it out.",
            "Li becomes angry and shouts: \"I'm sick and tired of you not doing anything! You never help with mom!\"",
            "Li enrolls in a class without first discussing her need for a break, then cancels when her sister says she is busy."
          ],
          optionsZh: [
            "李诚实地告诉姐姐自己需要定期休息，说出自己的想法，同时也考虑姐姐的情况。",
            "李暗示日子很难，但没有真正说出自己需要帮助，希望姐姐自己看出来。",
            "李生气大喊：\"我真是受够了你什么都不做！你从来都不帮忙照顾妈妈！\"",
            "李没有先和姐姐沟通就报名上课，结果姐姐说没空，她只好取消课程。"
          ],
          correctIndices: [0],
          explanation: "Only the first is an effective (assertive) way to ask. Li stands up for herself, is honest about her need, and respects her sister's interests too.",
          explanationZh: "只有第一种是有效（坚定）的求助方式。李为自己发声，诚实表达需求，也尊重姐姐的处境。",
          optionFeedback: [
            "Effective. This is an effective way of asking for help. Li stands up for herself, is honest about her need for a regular break, and keeps her sister's interests in mind.",
            "Passive. This is not effective. Her sister may not realise Li is overwhelmed; Li is not honest about her feelings and is trying to avoid conflict.",
            "Aggressive. This is not effective. Li becomes angry but did not clearly state she is overwhelmed, and she does not approach her sister respectfully.",
            "Passive / avoidant. By not discussing her need first, Li never opens the conversation, gives up the break, and her sister is unaware of how she feels."
          ],
          optionFeedbackZh: [
            "有效（坚定）。这是有效的求助方式。李为自己发声，诚实表达需要定期休息，也照顾到姐姐的感受。",
            "被动型。无效。姐姐可能没意识到李已经不堪重负；李没有诚实表达自己的感受，只是在回避冲突。",
            "攻击型。无效。李生气了，但并没有清楚说出自己已经不堪重负，也没有尊重姐姐。",
            "被动 / 回避型。事先不沟通，李从未真正开口求助，最终放弃了喘息机会，姐姐也不知道她的感受。"
          ],
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
        summary: "Taking care of yourself is crucial for providing long-term care. This lesson introduces quick, effective ways to reduce stress and renew your energy, even when you feel you have no time. You will learn the importance of relaxation and seven different exercises, ranging from simple breathing techniques that take under five minutes to longer muscle relaxation and stretching routines. These methods can be used anywhere, anytime to help you feel less tense, improve your mood, and continue supporting the person with dementia.",
        summaryZh: "照顾好自己对于能够长期提供护理至关重要。本课程介绍了即使在您感觉没有时间的情况下，也能快速有效地减轻压力、恢复精力的方法。您将学习到放松的重要性以及七种不同的练习，从不到五分钟的简单呼吸技巧到较长时间的肌肉放松和伸展运动。这些方法可以随时随地用来帮助您缓解紧张，改善情绪，并继续支持失智症患者。",
        sections: [
          { heading: "The importance of relaxing.", headingZh: "放松的重要性。", body: "Relaxation is vital for carers as it can lessen tension and provide a boost of renewed energy, which makes daily tasks more manageable. Even if you feel you lack time or energy, a short exercise can make a significant difference. Taking just a few moments for a simple breathing exercise when stressed can effectively reduce feelings of being overwhelmed.", bodyZh: "放松对护理者至关重要，因为它可以减轻紧张感并提供新的精力，使日常任务更容易管理。即使你觉得没有时间或精力，一个简短的练习也能带来显著的改变。在感到压力时，花几分钟做一个简单的呼吸练习，可以有效地减少不知所措的感觉。" },
          { heading: "Different ways to relax:\nz basic breathing;\nz mindful breathing;\nz neck movements;\nz number counting;\nz imagery;\nz total stretching;\nz muscle relaxation.", headingZh: "不同的放松方式：\nz 基础呼吸；\nz 正念呼吸；\nz 颈部运动；\nz 数字数数；\nz 意象；\nz 全身伸展；\nz 肌肉放松。", body: "The lesson presents seven different relaxation techniques you can try. To find what works best, you can rate your tension level before and after each exercise. Options range from very quick exercises (under 5 minutes) like basic breathing, mindful breathing, and neck movements, to slightly longer ones (10-15 minutes) such as number counting, imagery, progressive muscle relaxation, and total body stretching.", bodyZh: "本课程介绍了七种您可以尝试的不同放松技巧。为了找到最适合您的方法，您可以在每次练习前后评估自己的紧张程度。选项包括非常快速的练习（5分钟以内），如基础呼吸、正念呼吸和颈部运动，以及稍长一些的练习（10-15分钟），如数字数数、意象、渐进式肌肉放松和全身伸展。" },
          { heading: "Relaxing at any time and any place.", headingZh: "随时随地放松。", body: "You can practice relaxation techniques whenever and wherever you need them, even during everyday activities like waiting in line at a store. To build a consistent habit, consider setting a goal to relax once a day or scheduling it at a specific time. Even a brief exercise can boost your energy and mood, helping you sustain your ability to provide care long-term.", bodyZh: "您可以在任何需要的时候、任何地方练习放松技巧，即使是在商店排队等日常活动中也可以。为了养成一个持续的习惯，可以考虑设定每天放松一次的目标，或在特定时间安排放松。即使是短暂的练习也能提升您的精力和情绪，帮助您保持长期的护理能力。" }
        ],
        keyActions: ["Try different relaxation exercises, like breathing or stretching, to see which one works best for you.", "Rate your tension on a scale of 1-10 before and after an exercise to measure its effect.", "Set a goal to do a relaxation exercise at least once a day.", "Use quick relaxation techniques anytime and anywhere you feel tense, even for just a few minutes."],
        keyActionsZh: ["尝试不同的放松练习，如呼吸或伸展，看看哪种最适合您。", "在练习前后，用1-10分制评估您的紧张程度，以衡量其效果。", "设定每天至少做一次放松练习的目标。", "在任何时间、任何地点，当您感到紧张时，使用快速放松技巧，哪怕只有几分钟。"],
        reflectQuestion: "If you try a relaxation exercise and it doesn't seem to help, what could be the reason? Consider if the exercise wasn't a good fit, if you need more practice, or if the timing or environment was not right.",
        reflectQuestionZh: "如果您尝试了一种放松练习但似乎没有帮助，可能的原因是什么？想一想是否是这个练习不适合您，您是否需要更多练习，或者时间或环境不合适。",
        quiz: {
          question: "Diana cares for her husband Dan, who has dementia, and feels she has no time or energy to relax. Her friend tells her about relaxation. Which statements about relaxation are correct? (Select all that apply.)",
          questionZh: "戴安娜照顾患失智症的丈夫丹，觉得没有时间和精力去放松。她的朋友告诉她关于放松的事。下列关于放松的说法哪些正确？（多选）",
          options: [
            "Relaxation makes you feel less tense.",
            "Relaxation might give you renewed energy.",
            "Relaxation may make it easier to get tasks done.",
            "Relaxation always requires a long time and special equipment to be effective."
          ],
          optionsZh: [
            "放松能让人不那么紧张。",
            "放松可能让你重新获得精力。",
            "放松可能让完成任务变得更容易。",
            "放松必须花很长时间、用特殊器材才有效果。"
          ],
          correctIndices: [0, 1, 2],
          explanation: "Relaxation makes you feel less tense, may give renewed energy, and can help you get tasks done — and it does not have to take much time. Diana tries a short breathing exercise her friend showed her and feels less tense afterwards.",
          explanationZh: "放松可以减轻紧张、补充精力，也能帮你更轻松完成任务——而且不一定要花很长时间。戴安娜尝试朋友教的简短呼吸练习，之后就感觉没那么紧张了。",
          optionFeedback: [
            "Correct. Relaxation makes you feel less tense.",
            "Correct. Relaxation might give you renewed energy.",
            "Correct. Relaxation may make it easier to get tasks done.",
            "Not correct. Relaxation does not have to take much time — short exercises like simple breathing can already help."
          ],
          optionFeedbackZh: [
            "正确。放松能让人不那么紧张。",
            "正确。放松可能让你重新获得精力。",
            "正确。放松可能让你更轻松地完成任务。",
            "不正确。放松不一定要花很多时间——像简单呼吸这样的小练习就已经能起作用。"
          ],
        },
      },
      {
        key: "pleasant-activities",
        title: "Making time for pleasant activities",
        titleZh: "为愉快的活动安排时间",
        readMinutes: 5,
        summary: "Caring for someone with dementia is a long-term role. This lesson explains why making time for pleasant activities is crucial for your own well-being, helping you relax and continue providing care. You'll learn to identify and overcome barriers like having no time, energy, or money, and feeling guilty. The lesson provides strategies for making activities achievable, including starting small and asking for help, and suggests ways to enjoy activities together with the person you care for.",
        summaryZh: "照护失智症患者是一项长期的任务。本节课程解释了为什么为愉快的活动安排时间对您自身的福祉至关重要，这能帮助您放松并持续提供照护。您将学习如何识别并克服没有时间、精力、金钱或感到内疚等障碍。课程提供了使活动变得可行的方法，包括从小处着手、寻求帮助，并建议了与您所照护的人一起享受活动的方式。",
        sections: [
          { heading: "The importance of pleasant activities", headingZh: "愉快活动的重要性", body: "Caregiving is a long-term commitment, and taking breaks to relax is essential to prevent burnout. Making time for even small pleasant activities helps you recharge so you can continue providing care. To make this possible, you can ask family or friends for help, or consider hiring a professional carer if it's affordable.", bodyZh: "护理是一项长期任务，必须通过休息来放松，以防止劳累过度。为愉快的活动安排时间，即便是小事，也能帮助您充电以便继续提供照护。为了实现这一点，您可以请求家人或朋友帮忙，或者在经济条件允许的情况下考虑聘请专业护理者。" },
          { heading: "Barriers to doing pleasant activities", headingZh: "进行愉快活动的障碍", body: "Carers often face barriers to taking breaks, such as lack of time, energy, or money, feeling guilty, or having physical limitations. Remember that caring for yourself enables you to be a better carer. You can overcome these barriers by asking for help, realizing some tasks can wait, or choosing simple, low-cost activities.", bodyZh: "护理者在休息时常常面临各种障碍，例如缺乏时间、精力或金钱、感到内疚或身体有局限。请记住，照顾好自己才能成为更好的护理者。您可以通过寻求帮助、意识到某些任务可以推迟或选择简单、低成本的活动来克服这些障碍。" },
          { heading: "Making pleasant activities achievable", headingZh: "让愉快的活动变得可行", body: "To successfully incorporate pleasant activities into your routine, start with small, achievable goals you can do today or tomorrow. Building on small successes is more effective than feeling pressured to do everything at once. Rethink your activities to make them manageable and realistic for your current situation.", bodyZh: "要成功地将愉快的活动融入您的日常，请从今天或明天就能做到的小而可行的目标开始。在小成功的基础上再接再厉，比强迫自己一次完成所有事情更有效。重新思考您的活动，使其更易于管理并切合您当前的情况。" },
          { heading: "Doing pleasant activities together", headingZh: "一起进行愉快的活动", body: "Engaging in pleasant activities with the person you care for can be very rewarding for both of you. Consider activities you can enjoy together, such as listening to music, looking at old photos, taking a walk, or preparing a snack. These shared moments can strengthen your bond and bring joy into your lives.", bodyZh: "与您所照护的人一起进行愉快的活动，对你们双方都非常有益。可以考虑一起享受的活动，例如听音乐、看旧照片、散步或准备小吃。这些共同的时刻可以加强你们之间的联系，并为你们的生活带来欢乐。" }
        ],
        keyActions: ["Ask family, friends, or a professional carer for help so you can make time for yourself.", "Identify barriers preventing you from taking breaks (e.g., guilt, no time) and remember that self-care is necessary.", "Start with small, achievable pleasant activities and incorporate them into your routine.", "Find activities you can enjoy together with the person you care for, like listening to music or looking at photos."],
        keyActionsZh: ["向家人、朋友或专业护理者寻求帮助，以便为自己创造时间。", "识别阻碍您休息的障碍（如内疚感、没时间），并记住自我关怀是必要的。", "从小的、可实现的愉快活动开始，并将其纳入您的日常安排。", "寻找可以与您所照护的人一同享乐的活动，例如听音乐或看照片。"],
        reflectQuestion: "What are two pleasant activities you would like to do more often? Think of one you can do by yourself, and one you could do with the person you care for.",
        reflectQuestionZh: "您希望更频繁地进行哪两项愉快的活动？想一个您可以自己做的，再想一个可以和您所照护的人一起做的。",
        quiz: {
          question: "Siya, who has dementia, has moved in with her son's family. She has lost her husband, her own home, and her previous roles as cook and housekeeper. She is becoming withdrawn at mealtimes. Which is a helpful response from Siya's family? (Select all that apply.)",
          questionZh: "Siya 患有失智症，搬来和儿子一家同住。她失去了丈夫、自己的家以及以前作为厨师和管家的角色，最近吃饭时越来越退缩。她的家人哪些回应是有帮助的？（多选）",
          options: [
            "Bring Siya dinner in her room so she does not have to come out.",
            "Demand that Siya joins them for dinner.",
            "Let Siya help with the meal preparation and cleaning activities."
          ],
          optionsZh: [
            "把晚餐送到 Siya 的房间，这样她就不必出来。",
            "命令 Siya 和大家一起吃晚饭。",
            "让 Siya 参与做饭和饭后清理。"
          ],
          correctIndices: [2],
          explanation: "Siya's family knows she still enjoys cooking, so they should support her to continue engaging in activities she likes and is still able to do. This helps her feel welcomed and valued.",
          explanationZh: "Siya 的家人知道她仍然喜欢做饭，因此应该支持她继续参与她喜欢且仍然能做的活动。这能让她感到被欢迎、被重视。",
          optionFeedback: [
            "Not helpful. This might further isolate Siya from her family. She may not feel welcome in the new home, having already lost her husband, her own home and her previous roles as cook and housekeeper.",
            "Not such a good response. This may make Siya angry or cause her to further withdraw.",
            "Good response. Siya's family knows she still enjoys cooking and should support her to continue engaging in activities she likes and is still able to do."
          ],
          optionFeedbackZh: [
            "无益。这可能让 Siya 与家人更加疏离。她在失去丈夫、家、以及过去作为厨师和管家的角色后，可能本就不觉得在新家受欢迎。",
            "不太好的回应。这可能让 Siya 生气，或让她更加退缩。",
            "好的回应。家人知道她仍然喜欢做饭，应该支持她继续参与喜欢、且仍然能做的活动。"
          ],
        },
      },
      {
        key: "thinking-differently",
        title: "Thinking differently",
        titleZh: "换个想法",
        readMinutes: 6,
        summary: "This lesson explains that it's not events themselves, but our thoughts about them, that determine our feelings. Unhelpful thoughts can lead to negative emotions like anger or sadness, making it harder to cope. This lesson will teach you how to identify your unhelpful thoughts and consciously change them into more helpful ones. By learning to think differently, you can improve your emotional well-being and become a more resilient and compassionate carer for the person with dementia.",
        summaryZh: "本课程阐释了决定我们感受的并非事件本身，而是我们对事件的看法。无益的想法会导致愤怒或悲伤等负面情绪，使人难以应对。本课程将教您如何识别并有意识地将无益的想法转变为更有益的想法。通过学习换个角度思考，您可以改善情绪状态，成为一个更有韧性、更有同情心的失智症护理者。",
        sections: [
          { heading: "Thoughts determine how we feel", headingZh: "想法决定感受", body: "It is not external events that determine your feelings, but rather how you interpret them. While you often cannot change what happens—such as the person with dementia becoming upset—you can change your thoughts about it. Recognizing that your thoughts, not the situation, create your feelings is the first step to feeling better.", bodyZh: "决定您感受的不是外部事件，而是您如何解读它们。虽然您通常无法改变发生的事情——比如失智症患者变得心烦意乱——但您可以改变对这件事的想法。认识到是您的想法而非处境创造了您的感受，这是迈向感觉更好的第一步。" },
          { heading: "Learn to think differently by changing unhelpful thoughts into helpful ones", headingZh: "通过改变无益的想法为有益的想法来学习换个角度思考", body: "You can actively learn to reframe your thinking. First, identify the unhelpful thoughts that make you feel bad, such as assuming the worst or blaming yourself. Then, consciously replace them with more helpful, compassionate thoughts, like recognizing that dementia causes certain behaviours. This shift in perspective can help you stay calm and respond more effectively.", bodyZh: "您可以积极学习重塑您的思维方式。首先，识别那些让您感觉糟糕的无益想法，例如作最坏的打算或责备自己。然后，有意识地用更有益、更有同情心的想法来取代它们，比如认识到某些行为是失智症引起的。这种视角的转变可以帮助您保持冷静并更有效地做出反应。" },
          { heading: "Thinking differently makes you feel better", headingZh: "换个想法让你感觉更好", body: "Changing unhelpful thoughts directly improves your emotional state. This process involves four steps: identify the upsetting event, name your unhelpful thought, create a more helpful thought, and recognize how this new thought makes you feel better. Regularly practicing this technique can shift your general feelings from negative to positive.", bodyZh: "改变无益的想法能直接改善您的情绪状态。这个过程包括四个步骤：识别令人心烦的事件，说出您的无益想法，构建一个更有益的想法，并认识到这个新想法如何让您感觉更好。经常练习这项技巧可以将您的整体情绪从消极转向积极。" }
        ],
        keyActions: ["When you feel upset, pause and identify the specific thought that is causing the feeling.", "Challenge unhelpful thoughts by asking if there's a more positive or realistic way to see the situation.", "Remind yourself that behaviors caused by dementia are part of the disease, not a reflection on your care.", "Practice changing one unhelpful thought to a helpful one each day, even for small events."],
        keyActionsZh: ["当您感到心烦时，暂停一下，找出导致这种感觉的具体想法。", "挑战无益的想法，问自己是否有更积极或更现实的方式来看待情况。", "提醒自己，由失智症引起的行为是疾病的一部分，并不代表您的护理质量。", "每天练习一次将无益的想法转变为有益的想法，即使是对于小事。"],
        reflectQuestion: "Think of a recent event that made you feel upset. What were your unhelpful thoughts? What would be a more helpful way to think about it? How would that helpful thought make you feel?",
        reflectQuestionZh: "想一个最近让您感到心烦的事件。您当时的无益想法是什么？更有益的想法会是什么？那个有益的想法会让您感觉如何？",
        quiz: {
          question: "Aryan cares for a family member with dementia and feels overwhelmed. Which of Aryan's thoughts may help her feel better? (Select all that apply.)",
          questionZh: "Aryan 在照顾患失智症的家人，感到不堪重负。Aryan 的下列想法中，哪些可能帮助她感觉好一些？（多选）",
          options: [
            "Making time for myself helps me to provide better care.",
            "I am a bad carer if my family member is not always happy.",
            "Maybe the person living with dementia will get better.",
            "Dementia is a disease, it is not my or anyone else's fault.",
            "No one understands how hard it is to care.",
            "No one can provide the care the way I do.",
            "Asking others for help can help me to share care duties."
          ],
          optionsZh: [
            "为自己留出时间，能让我提供更好的照护。",
            "如果我的家人不是每天都开心，那就是我这个护理者不合格。",
            "也许患失智症的人会好起来。",
            "失智症是一种疾病，不是我或任何人的错。",
            "没有人理解照护有多难。",
            "没人能像我这样把照护做好。",
            "请别人帮忙，可以让我分担一些照护任务。"
          ],
          correctIndices: [0, 3, 6],
          explanation: "Helpful thoughts reduce guilt, prevent isolation, and let you keep caring long-term. Recognising that you need breaks, that dementia is a disease, and that sharing care helps you cope are all helpful reframes.",
          explanationZh: "有益的想法可以减少内疚、防止孤立，让你能长期坚持照护。认识到自己需要休息、失智症是一种疾病、分担照护对自己有帮助，都是有益的换位思考。",
          optionFeedback: [
            "Helpful. No one should feel guilty when taking time for themselves. It might help the carer to continue providing care in the long term.",
            "Unhelpful. This thought will make Aryan feel unhappy and sad. The mood of the person living with dementia does not depend solely on the carer; it can also be related to dementia, depression, functional ability or personality.",
            "Unhelpful. This thought may make Aryan feel disappointed as people with dementia continue to decline. Many diseases cause dementia, and unfortunately there is no cure for them yet.",
            "Helpful. This thought is helpful and might prevent feelings of guilt.",
            "Unhelpful. This thought may make Aryan feel upset, isolated and lonely. There may be people who don't understand, but talking to others may help them understand and take pressure off you.",
            "Unhelpful. This thought could make Aryan feel lonely, isolated and under a lot of pressure. Others may provide care differently, but that doesn't mean it's lower quality. Involving others avoids getting overwhelmed.",
            "Helpful. This is a helpful thought that may make Aryan feel more in control. Involving others has many benefits — the carer can take regular breaks and provide care for longer."
          ],
          optionFeedbackZh: [
            "有益。为自己留出时间不应感到内疚，这能帮护理者长期坚持下去。",
            "无益。这种想法会让 Aryan 不快乐、悲伤。失智症患者的情绪不只取决于护理者，也可能与疾病、抑郁、功能状态或性格有关。",
            "无益。这种想法可能让 Aryan 失望，因为失智症患者会持续退化。很多疾病都会导致失智症，目前尚无治愈方法。",
            "有益。这种想法是有益的，可以防止内疚感。",
            "无益。这种想法可能让 Aryan 感到难过、孤立、孤独。也许有人不理解，但与他人沟通可以帮他们理解，并让你减压。",
            "无益。这种想法可能让 Aryan 感到孤独、孤立、压力很大。别人照护方式不同，并不代表质量更低。让他人参与可以避免你被压垮。",
            "有益。这种想法可能让 Aryan 感到更有掌控感。让他人参与照护好处很多——护理者可以定期休息，更长时间地坚持下去。"
          ],
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
        summary: "Dementia can affect eating and drinking, but creating a positive mealtime experience can help. This lesson explains how to make mealtimes more pleasant by engaging the person with dementia in simple tasks like preparing food or setting the table, which promotes their self-worth. You will learn how to create a good atmosphere, recognize how various health conditions can impact appetite, and take steps to prevent dehydration by encouraging and monitoring fluid intake. The goal is a safer, healthier, and more enjoyable mealtime for everyone.",
        summaryZh: "失智症会影响饮食，但创造积极的用餐体验可以提供帮助。本课程解释了如何让用餐时间更愉快，通过让失智症人士参与准备食物或布置餐桌等简单任务，可以提升他们的自我价值感。您将学习如何营造良好氛围，识别各种健康状况对食欲的影响，并采取措施鼓励和监测液体摄入以预防水合不足。目标是为每个人创造一个更安全、更健康、更愉快的用餐时间。",
        sections: [
          { heading: "Making mealtimes more pleasant.", headingZh: "让用餐时间更愉快。", body: "Involve the person with dementia in simple meal-related activities they might enjoy, such as shopping for ingredients, setting the table, or washing dishes. Engaging them in these tasks helps utilize their remaining skills, promotes feelings of self-worth, and makes the mealtime experience more positive.", bodyZh: "让失智症人士参与他们可能喜欢的简单用餐相关活动，例如购买食材、布置餐桌或洗碗。让他们参与这些任务有助于利用他们尚存的技能，促进自我价值感，并使整个用餐体验更加积极。" },
          { heading: "Promoting a good mealtime atmosphere.", headingZh: "营造良好的用餐氛围。", body: "A pleasant mealtime atmosphere can encourage a person with dementia to eat and drink. If issues like spilling food arise, respond constructively by providing adaptive eating aids. It is better to discuss solutions with family members than to isolate the person, which can make them feel sad or angry.", bodyZh: "愉快的用餐氛围可以鼓励失智症人士进食和饮水。如果出现食物溢出等问题，应通过提供适应性餐具等方式建设性地做出回应。与家人讨论解决方案，比孤立失智症人士要好，因为孤立会让他们感到悲伤或愤怒。" },
          { heading: "Health conditions that affect eating and drinking.", headingZh: "影响饮食的健康状况。", body: "Be aware of common health issues that can interfere with eating, like toothaches, poorly fitting dentures, body pain, constipation, or medication side effects. Other factors like depression or memory loss can also lead to poor appetite or forgetting to eat. Observe for any signs of discomfort or changes in eating habits and seek help from a doctor when needed.", bodyZh: "注意可能影响饮食的常见健康问题，如牙痛、假牙不合、身体疼痛、便秘或药物副作用。抑郁或记忆力减退等其他因素也可能导致食欲不振或忘记吃饭。观察任何不适迹象或饮食习惯的变化，并在需要时寻求医生帮助。" },
          { heading: "Preventing dehydration.", headingZh: "预防水合不足。", body: "People with dementia are at a high risk of dehydration due to decreased thirst sensation or inability to communicate their needs. Encourage them to drink 8-10 glasses (1.5-2 liters) of fluids daily and monitor their intake. Unless a doctor has restricted fluids for a heart condition, maintaining this routine is crucial for their health.", bodyZh: "由于口渴感减弱或无法交流需求，失智症人士有很高的水合不足风险。鼓励他们每天喝8-10杯（1.5-2升）液体，并监测他们的摄入量。除非医生因心脏病限制了液体摄入，否则保持这一日常习惯对他们的健康至关重要。" }
        ],
        keyActions: ["Involve the person you care for in simple mealtime tasks like setting the table.", "If they often spill food, consider buying adaptive utensils instead of isolating them.", "Encourage drinking 8-10 glasses of fluid daily and keep a record of their intake.", "Seek help from a doctor for sudden weight changes, poor appetite, or pain."],
        keyActionsZh: ["让您护理的人参与简单的用餐任务，例如布置餐桌。", "如果他们经常洒出食物，考虑购买适应性餐具，而不是将他们隔离。", "鼓励每天饮用8-10杯液体，并记录其摄入量。", "如果出现体重突然变化、食欲不振或疼痛，请寻求医生帮助。"],
        reflectQuestion: "Think about involving the person that you care for around mealtimes. Which activities do you think they can still engage in and would enjoy?",
        reflectQuestionZh: "想一想如何让您护理的人参与到用餐的各个环节中。您认为他们仍然可以参与并会喜欢哪些活动？",
        quiz: {
          question: "Shang has dementia and increasingly spills food at the family table, frustrating everyone. How could Shang's son deal with the situation? (Select all that apply.)",
          questionZh: "Shang 患有失智症，在家庭餐桌上越来越常打翻食物，让大家都很烦躁。Shang 的儿子可以怎样处理？（多选）",
          options: [
            "Buy adaptive eating and drinking aids from the shop for Shang.",
            "Set up a separate table for his father to eat in his own bedroom, because spilling and dropping food may make the family irritated.",
            "Organise a family meeting to ask all family members to think of more positive and constructive ways to respond to the situation at mealtimes."
          ],
          optionsZh: [
            "去商店给 Shang 买适应性的餐饮辅助用具。",
            "在卧室里为父亲单独摆一张桌子，因为洒食物会让家人烦躁。",
            "召开家庭会议，让所有家人一起想出更积极、更有建设性的应对方法。"
          ],
          correctIndices: [0, 2],
          explanation: "Adaptive utensils help Shang continue eating with the family, and a family meeting builds a positive mealtime atmosphere for everyone. Separating him isolates him and worsens his mood.",
          explanationZh: "适应性餐具能帮 Shang 继续与家人一起用餐，家庭会议能为大家营造积极的用餐氛围。把他分开吃只会让他更孤立、情绪更差。",
          optionFeedback: [
            "Good response. Shang's son recognises that his father is no longer able to manage eating using the usual utensils. Providing adapted utensils helps solve this problem.",
            "Not helpful. Separation will make Shang feel sad or angry, which might prevent him from eating and drinking properly.",
            "Good response. Shang's son is trying to provide a positive mealtime atmosphere for everyone."
          ],
          optionFeedbackZh: [
            "好的回应。Shang 的儿子意识到父亲已无法用普通餐具进食，提供适应性餐具有助于解决问题。",
            "无益。把他分开会让 Shang 感到悲伤或愤怒，反而可能让他无法好好吃饭喝水。",
            "好的回应。Shang 的儿子在为大家营造一个积极的用餐氛围。"
          ],
        },
      },
      {
        key: "preventing-health-problems",
        title: "Eating, drinking and preventing health problems",
        titleZh: "饮食与预防健康问题",
        readMinutes: 6,
        summary: "Dementia can significantly impact eating and drinking, potentially leading to weight loss, malnutrition, and other health issues like aspiration pneumonia. This lesson provides carers with strategies to improve nutrition and ensure safety during meals. You will learn how to adapt mealtimes for persons in the late stages of dementia, handle challenges like difficulty chewing or swallowing, and prevent the ingestion of harmful substances. The goal is to help you maintain the health and well-being of the person you care for through proper dietary management and safe eating practices.",
        summaryZh: "失智症会显著影响饮食,可能导致体重减轻、营养不良和吸入性肺炎等其他健康问题。本课为护理者提供改善营养和确保用餐安全的策略。您将学习如何为晚期失智症患者调整用餐时间,处理咀嚼或吞咽困难等挑战,并防止摄入有害物质。本课旨在通过适当的饮食管理和安全的饮食习惯,帮助您维持所护理的人的健康。",
        sections: [
          { heading: "Improve eating and prevent weight loss", headingZh: "改善饮食,预防体重减轻", body: "In late-stage dementia, problems with chewing, swallowing, taste, and smell can lead to poor nutrition and weight loss. To counter this, be flexible with mealtimes, offering food when the person is awake and alert. Provide foods they enjoy and keep a diary of their food intake to monitor their nutritional status and ensure they are eating enough.", bodyZh: "在失智症晚期,咀嚼、吞咽、味觉和嗅觉方面的问题可能导致营养不良和体重减轻。为了应对这种情况,应灵活安排用餐时间,在患者清醒时提供食物。提供他们喜欢的食物,并记录他们的食物摄入量,以监测他们的营养状况,确保他们吃得足够。" },
          { heading: "Help the person you care for to eat safely and prevent aspiration pneumonia", headingZh: "帮助您所护理的人安全进食,预防吸入性肺炎", body: "A person with dementia may eat inedible items or have trouble swallowing, which can cause a serious lung infection called aspiration pneumonia. To ensure safety, lock away all non-food items and chemicals. If they have swallowing difficulties, provide soft foods and thickened drinks, and always help them to sit upright during meals to prevent choking.", bodyZh: "失智症患者可能会吃不可食用的物品或吞咽困难,这可能导致严重的肺部感染,即吸入性肺炎。为确保安全,请将所有非食品和化学品锁好。如果他们吞咽困难,请提供软食和稠化液体,并在用餐时始终帮助他们坐直,以防止呛噎。" }
        ],
        keyActions: ["Be flexible with mealtimes, serving food when the person is most alert.", "Keep a food diary to track nutrition and weight.", "Lock away all inedible materials and household chemicals.", "For swallowing issues, provide soft foods and thickened drinks.", "Ensure the person sits fully upright during all meals to prevent choking."],
        keyActionsZh: ["灵活安排用餐时间,在患者最清醒的时候提供食物。", "记录饮食日记以跟踪营养和体重状况。", "将所有非食品和家用化学品锁起来。", "针对吞咽问题,提供软食和稠化饮品。", "确保用餐期间患者完全坐直,以防呛噎。"],
        reflectQuestion: "Ling has noticed that her mother, Chiu, has lost a significant amount of weight and is often too sleepy to eat at normal mealtimes. What are three different strategies Ling could try this week to improve her mother's food intake?",
        reflectQuestionZh: "凌注意到她的母亲近来体重显著下降,而且在正常用餐时间常常因为太困而无法进食。凌本周可以尝试哪三种不同的策略来改善母亲的食物摄入量？",
        quiz: {
          question: "Ling's mother Chiu has late-stage dementia, sleeps through normal mealtimes and is losing weight. What would you advise Ling to do to improve Chiu's eating? (Select all that apply.)",
          questionZh: "Ling 的母亲 Chiu 处于失智症晚期，常在正常用餐时间昏睡，体重也在下降。你会建议 Ling 怎么做来改善 Chiu 的进食？（多选）",
          options: [
            "Be flexible to have meals when her mother is awake.",
            "Ensure Chiu has access to foods that she enjoys eating.",
            "Keep a record of what and how often her mother eats in a diary."
          ],
          optionsZh: [
            "灵活安排，在母亲清醒时再让她进餐。",
            "确保 Chiu 能吃到她喜欢的食物。",
            "用日记记录母亲吃什么、吃多少次。"
          ],
          correctIndices: [0, 1, 2],
          explanation: "All three are good responses. People in late-stage dementia need rest, enjoy familiar foods, and benefit from carers tracking intake to ensure they get enough nutrition.",
          explanationZh: "三个都是好的回应。晚期失智症患者需要休息，喜欢熟悉的食物，照护者记录摄入有助于确保营养足够。",
          optionFeedback: [
            "Good response. People in late stages of dementia need rest, so flexibility in planning meals will be very helpful when they are sleeping during normal mealtimes.",
            "Good response. What foods did she enjoy eating before her diagnosis of dementia? What foods does she seem to enjoy now?",
            "Good response. Recording what people with dementia eat is important. This way, carers will better understand when and what kind of food is needed for sufficient food intake."
          ],
          optionFeedbackZh: [
            "好的回应。晚期失智症患者需要休息，灵活安排用餐时间，能让他们在正常用餐时段熟睡时也照顾得到。",
            "好的回应。她在被诊断之前喜欢吃什么？现在似乎又喜欢吃什么？",
            "好的回应。记录失智症患者的饮食很重要，照护者能更清楚什么时候、需要什么样的食物，以保证摄入足够。"
          ],
        },
      },
      {
        key: "toileting-continence",
        title: "Toileting and continence care",
        titleZh: "如厕和失禁护理",
        readMinutes: 6,
        summary: "Poor toileting and incontinence can lead to health problems and low self-esteem for a person with dementia. This lesson helps you assist them with using the toilet and managing continence. You will learn solutions for issues like urinating in inappropriate places by modifying the environment, creating routines, and providing clear directions. The lesson also covers how to properly use incontinence aids and equipment to ensure comfort and prevent skin problems or infections, emphasizing that you should not blame the person for accidents.",
        summaryZh: "如厕和失禁问题可能导致失智症患者出现健康问题、自尊心低落和社交退缩。本节课将帮助您协助他们解决如厕和失禁问题。您将学到如何通过改善环境、建立规律和提供清晰指引，来解决随地小便等问题。课程还将涵盖如何正确使用失禁辅助用品和设备，以确保舒适并预防皮肤问题或感染，同时强调不应因意外而责备患者。",
        sections: [
          { heading: "Possible solutions for problems such as urinating on the floor or losing bladder control", headingZh: "解决随地小便或失禁等问题的可能方案", body: "Dementia can affect a person's ability to locate or use the toilet. Instead of assigning blame, make simple environmental changes: add a toilet image to the door, use a contrasting toilet seat color, and ensure good lighting. Help by giving step-by-step instructions, providing easy-to-remove clothing, and establishing a regular toilet schedule based on their past habits. A toilet diary can help identify patterns and prevent accidents.", bodyZh: "失智症会影响患者定位或使用卫生间的能力。与其责备，不如对环境做些简单的改变：在门上贴上马桶图片，使用颜色对比鲜明的马桶圈，并确保充足的照明。通过提供分步指导、易于穿脱的衣物，并根据他们过去的习惯建立固定的如厕时间表来提供帮助。如厕日记有助于识别规律并预防意外发生。" },
          { heading: "Using incontinence aids and equipment", headingZh: "使用失禁辅助用品和设备", body: "Before using incontinence aids, consult a health professional to rule out treatable causes. If aids are needed, choose products based on cost, effectiveness, and comfort. To prevent skin irritation, ensure the pad is the correct size, change it promptly when soiled, and apply protective creams. If the person resists wearing aids, check if they are uncomfortable or if the pad is wet.", bodyZh: "在使用失禁辅助用品前，请咨询专业医疗人员，以排除可治疗的病因。如果需要使用辅助用品，请根据费用、效果和舒适度来选择产品。为防止皮肤过敏，确保护垫尺寸合适，及时更换脏污的护垫，并涂抹防护霜。如果患者抗拒使用，请检查他们是否感到不适或护垫是否已湿。" }
        ],
        keyActions: ["Put an image of a toilet on the bathroom door and use a contrasting colour for the toilet seat.", "Create a regular toileting schedule, gently guiding the person to the bathroom at set times.", "If using incontinence pads, change them as soon as they are soiled and apply protective cream to prevent skin irritation.", "Unless they are on a fluid restriction, encourage the person to drink 6-8 glasses of water a day to help prevent urinary tract infections."],
        keyActionsZh: ["在卫生间门上贴上马桶图样，并为马桶圈选用对比鲜明的颜色。", "制定规律的如厕时间表，在固定时间温和地引导患者去卫生间。", "如果使用失禁护垫，一旦弄脏就应立即更换，并涂抹防护霜以防止皮肤过敏。", "除非有液体摄入限制，否则应鼓励患者每天喝6-8杯水，以帮助预防尿路感染。"],
        reflectQuestion: "Think about the home environment and daily routine. What is one change you could make to either the physical space (like lighting or signage) or the daily schedule to make toileting easier and more dignified for the person you care for?",
        reflectQuestionZh: "思考一下居家环境和日常作息。您可以对物理空间（如照明或标志）或日常时间表做出哪一项改变，以便让您护理的人更轻松、更有尊严地如厕？",
        quiz: {
          question: "Fu has dementia and has started urinating on the floor near the toilet. His wife, Zhen, is his carer. What is the best way for Zhen to respond?",
          questionZh: "阿福患有失智症，并开始在厕所附近的地板上小便。他的妻子阿珍是他的护理者。阿珍最好的应对方式是什么？",
          options: ["Make simple changes like putting an image of a toilet on the door and using a toilet seat with a contrasting colour.", "Punish Fu by not taking him for his daily walk so he understands he did something wrong."],
          optionsZh: ["做一些简单的改变，比如在门上贴上马桶的图片，使用颜色对比鲜明的马桶圈。", "惩罚阿福，不带他每日散步，让他知道自己做错了事。"],
          correctIndices: [0],
          explanation: "People with dementia may have difficulties finding and using the toilet. Making small changes to the environment can help prevent accidents without causing stress or shame.",
          explanationZh: "失智症患者在寻找和使用卫生间方面可能会有困难。对环境做些小改变有助于防止意外发生，而不会给他们带来压力或羞耻感。",
          optionFeedback: ["Good idea. Visual cues and contrasting colours help him locate and use the toilet without shame.", "Not helpful. Punishment causes distress and does not address his cognitive difficulty."],
          optionFeedbackZh: ["很好的做法。视觉提示和对比色帮助他找到并使用卫生间，且不会感到羞愧。", "无益。惩罚带来痛苦，也无法解决他的认知困难。"],
        },
      },
      {
        key: "personal-care",
        title: "Personal care",
        titleZh: "个人护理",
        readMinutes: 6,
        summary: "Assisting a person with dementia in personal care is crucial for their health, self-esteem, and social engagement. Poor hygiene can lead to infections and other health issues. This lesson will help you support their needs while respecting their independence. You will learn to modify the environment to make personal care easier, such as by labeling items or using color-coding. It also provides practical tips for helping with daily dressing, oral care, and bathing in a way that uses the person’s remaining skills and minimizes distress.",
        summaryZh: "协助失智症患者进行个人护理，对他们的健康和自尊至关重要。不良的个人护理可能导致感染和其他健康问题、打击失智症患者的自尊并使他们不愿参与社交活动。本课程將帮助您支持他们的卫生需求，同时尊重他们的独立性。您将学习如何改造环境以方便个人护理，例如给物品贴上标签。课程也提供了一些技巧，以帮助他们利用其尚存的技能来进行日常穿衣、口腔护理和洗澡，并最大限度地减少其不适感。",
        sections: [
          { heading: "Modifying the environment to make personal care easier", headingZh: "改造环境，让个人护理更容易", body: "People with dementia may struggle with personal care because they can't find necessary items due to memory loss. To help them maintain independence, you can modify the environment. Make it easier for them to locate things by putting a picture on the bathroom door, placing items in the order of use, and labeling them with large print or contrasting colors. You can also use color indicators to show how to turn taps on and off.", bodyZh: "失智症患者可能会因为记忆力减退而找不到必需品，从而在个人护理方面遇到困难。为了帮助他们保持独立，您可以改造环境。例如，在浴室门上贴上图片、按使用顺序列出并标记物品、或使用颜色标记来指示水龙头的开关方向，让他们更容易找到东西。" },
          { heading: "Tips for daily dressing, oral care and assisting in bathing", headingZh: "日常穿衣、口腔护理和协助洗浴的技巧", body: "Dementia can affect a person's ability to choose clothes, brush their teeth, or bathe. Support their remaining skills by simplifying choices, like providing clothes without belts or laces, and breaking down tasks like oral care into step-by-step instructions. A person may resist bathing as a threat to their privacy, so be reassuring, identify their preferred bathing time, and use safety aids like non-slip mats and shower chairs.", bodyZh: "失智症会影响患者选择衣物、刷牙或洗澡的能力。通过简化选择（如提供无需腰带或鞋带的衣物）以及将口腔护理等任务分解为循序渐进的指导，来支持他们利用尚存的技能。患者可能会认为洗澡是对其隐私的威胁而产生抗拒，因此请让他们安心，确认他们偏好的洗澡时间，并使用防滑垫和淋浴椅等安全辅助设备。" }
        ],
        keyActions: ["Break down personal care tasks into simple, step-by-step instructions.", "Make items easy to find by labeling them with large print or pictures and using contrasting colors.", "Simplify dressing by choosing clothes without complex buttons or laces.", "Respect their privacy and choices to reduce resistance, especially during bathing.", "Use safety aids like non-slip mats and grab bars in the bathroom to prevent falls."],
        keyActionsZh: ["将个人护理任务分解为简单的、循序渐进的步骤。", "使用大号字体或图片为物品贴上标签，并使用对比鲜明的颜色，让物品易于寻找。", "选择没有复杂纽扣或鞋带的衣服，以简化穿衣过程。", "尊重他们的隐私和选择以减少抗拒，尤其是在洗澡时。", "在浴室使用防滑垫和扶手等安全辅助设备以防摔倒。"],
        reflectQuestion: "Think about the person you care for. Which personal care activities (like dressing, bathing, or oral care) do they need the most help with? What is one small change you can make to the environment or your approach to make it easier for them?",
        reflectQuestionZh: "想一想您所护理的人。他们最需要在哪项个人护理活动（如穿衣、洗澡或口腔护理）上获得帮助？您可以对环境或您的方法做出哪项微调，让他们能更轻松地完成这些活动？",
        quiz: {
          question: "Mariam has Alzheimer’s disease and usually takes care of herself. Recently, her husband, Mohammed, notices that she sits at the table for breakfast in a nightgown without having washed her face, brushed her hair, or done her make-up as she usually does. What is the right response for Mohammed?",
          questionZh: "玛利亚姆患有阿尔茨海默病，通常自己能够自理。最近，她的丈夫穆罕默德注意到，她穿着睡袍坐在餐桌旁吃早餐，没有像往常一样洗脸、梳头或化妆。穆罕默德的正确做法是什么？",
          options: ["Put personal care items in the order of use and label them with large print words and different colours for Mariam to read.", "Ask their daughter-in-law to take Mariam from the table to the bathing room and assist her with washing and changing clothes.", "Tell her she needs to go get ready before breakfast."],
          optionsZh: ["将个人护理用品按使用顺序列出，并用大号字体和不同颜色进行标记，方便玛利亚姆阅读。", "让儿媳把玛利亚姆从餐桌旁带到浴室，帮助她洗漱和换衣服。", "告诉她早餐前必须先梳洗打扮好。"],
          correctIndices: [0],
          explanation: "This is a good response. People with dementia may lose the ability to find items that are not obvious. Creating an 'easy to find' environment for them is very important.",
          explanationZh: "这是一个很好的回应。失智症患者可能会丧失寻找不显眼物品的能力。为他们创造一个“易于寻找”的环境非常重要。",
          optionFeedback: ["Good idea. Labelled items in order of use let Mariam continue self-care with dignity.", "Less helpful. Asking another family member to bathe her removes her independence.", "Not helpful. Telling her to 'go get ready' assumes she remembers how, which she may not."],
          optionFeedbackZh: ["很好的做法。按使用顺序贴标签的物品让玛利亚姆能继续自理，保持尊严。", "不太理想。让别的家人帮她洗漱削弱了她的独立性。", "无益。让她“先去梳洗”假设她还记得怎么做，但她可能已记不清。"],
        },
      },
      {
        key: "enjoyable-day",
        title: "An enjoyable day",
        titleZh: "愉快的一天",
        readMinutes: 6,
        summary: "Creating a supportive environment is crucial for a person with dementia. This lesson emphasizes the importance of maintaining familiar routines and activities to reduce stress and provide reassurance. You will learn how to establish and adapt daily routines for morning, daytime, and bedtime as the abilities of the person you care for change over time. This flexibility helps honor their dignity and allows them to continue enjoying activities they like, ensuring a more enjoyable day for both of you.",
        summaryZh: "为失智症者创造一个支持性环境至关重要。本课强调了保持熟悉日常活动和惯例的重要性，这有助于减轻压力并让他们感到安心。您将学习如何根据您所护理的人不断变化的能力，来制定和调整他们早上、日间和睡前的日常安排。这种灵活性有助于维护他们的尊严，让他们能继续享受自己喜欢的活动，确保你们双方都能度过更愉快的一天。",
        sections: [
          { heading: "Establishing routines for the person with dementia during the day.", headingZh: "为失智症者建立白天的日常惯例", body: "A routine is something a person does almost every day, and continuing it is reassuring and can reduce stress. It is helpful to establish or maintain simple routines for mornings, mealtimes, and evenings. Incorporating enjoyable activities based on their prior interests and current abilities is also important to their well-being.", bodyZh: "惯例是人们几乎每天都会做的事情，坚持惯例能让失智症者安心并可以减轻压力。为早晨、用餐时间和晚上建立或保持简单的惯例很有帮助。根据他们过去的兴趣和当前的能力，将愉快的活动纳入其中，对他们的身心健康也很重要。" },
          { heading: "Adapting routines to the changing abilities of the person you care for.", headingZh: "根据您所护理的人不断变化的能力来调整惯例", body: "As dementia progresses, you must adapt routines to the person's changing abilities. For daily tasks like personal care, you can start by laying out items as a prompt, later progressing to providing direct help. For hobbies they enjoy, find ways to simplify the activity, such as using an easy-to-prepare mix for baking or doing the activity together.", bodyZh: "随着失智症的进展，您必须根据患者不断变化的能力来调整惯例。对于个人护理等日常任务，您可以先将物品摆放出来作为提示，之后再逐步提供直接帮助。对于他们喜欢的爱好，寻找简化活动的方法，例如使用易于准备的预拌粉进行烘焙，或与他们一起进行活动。" }
        ],
        keyActions: ["Establish and maintain simple daily routines for morning, daytime, and bedtime.", "Adapt activities to the person’s changing abilities, such as using easy-to-prepare mixes for baking or reading aloud to them.", "If the person becomes more agitated in the late afternoon (sundowning), try to offer a meaningful and calming activity.", "Ask family, friends, or neighbours for help to maintain important routines, like visiting a community centre."],
        keyActionsZh: ["为早上、日间和睡前建立并保持简单的每日惯例。", "根据患者不断变化的能力来调整活动，例如使用易于准备的预拌粉进行烘焙，或为他们朗读。", "如果患者在傍晚时分变得更加焦躁（黄昏综合征），尝试提供有意义且能让他们平静下来的活动。", "请家人、朋友或邻居帮忙，以维持重要的日常活动，例如去社区中心。"],
        reflectQuestion: "Do you know any of the routines of the person with dementia that you care for? Please write down any ideas that you have about routines for the person you care for and how they can be adapted.",
        reflectQuestionZh: "您了解您所护理的失智症者的任何日常惯例吗？请写下您对于他们的惯例以及如何调整这些惯例的任何想法。",
        quiz: {
          question: "Martha has dementia and is used to drinking tea right after getting ready in the morning. Her daughter Penny tries to get her to go for a walk right after breakfast, but Martha refuses. What is the best suggestion for Penny?",
          questionZh: "玛莎患有失智症，习惯在早上准备好后立即喝茶。她的女儿佩妮想让她在早餐后马上就去散步，但玛莎拒绝了。对佩妮最好的建议是什么？",
          options: ["Suggest keeping to the routine by drinking tea first, after which Martha will be more likely to go for a walk.", "Ask Martha what activities she is used to and in what order she would like to do them.", "Force Martha to go for a walk because it was advised by the doctor."],
          optionsZh: ["建议先喝茶以维持惯例，之后玛莎会更有可能去散步。", "问玛莎她习惯了哪些活动，以及她喜欢按什么顺序进行。", "强迫玛莎去散步，因为这是医生的建议。"],
          correctIndices: [0, 1],
          explanation: "Respecting the person's established routine first can reduce stress and make them more willing to cooperate with another activity afterwards.",
          explanationZh: "首先尊重患者已建立的惯例可以减轻压力，使他们之后更愿意配合进行另一项活动。",
          optionFeedback: ["Good idea. Honouring Martha's tea routine first makes her more willing to walk afterward.", "Good idea. Asking Martha about her preferred order respects her established routines.", "Not helpful. Forcing causes resistance and removes her dignity."],
          optionFeedbackZh: ["很好的做法。先尊重玛莎喝茶的惯例，她之后会更愿意去散步。", "很好的做法。询问她偏好的顺序，体现了对她日常惯例的尊重。", "无益。强迫会引发抗拒，也剥夺了她的尊严。"],
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
        summary: "Dementia causes changes in behavior, thinking, and actions that can be upsetting for both the person with dementia and their carer. This lesson will help you prevent and cope with these changes. You will learn to identify stressful behaviors, understand what triggers them by looking at what happens before the behavior, and explore different ways to respond. By understanding this cycle, you can reduce or prevent difficult situations and improve your relationship with the person you care for.",
        summaryZh: "失智症会导致行为、思维和行动的改变，这可能让失智者和护理者都感到不安。本课程将帮助您预防和应对这些变化。您将学习如何识别有压力的行为，通过观察行为发生前的情况来了解其触发因素，并探索不同的应对方法。通过了解这个周期，您可以减少或预防困境，并改善您与被护理者的关系。",
        sections: [
          { heading: "Behaviour changes that may be particularly stressful.", headingZh: "可能带来特别压力的行为改变。", body: "Common stressful behaviors in dementia include memory loss, aggression, depression, sleep difficulties, delusions, repetitive actions, wandering, and changes in judgment. These changes can negatively affect your relationship with the person you care for. They may cause you to feel sad, angry, confused, or anxious.", bodyZh: "失智症中常见的压力行为包括记忆力减退、攻击性、抑郁、睡眠困难、妄想、重复行为、徘徊和判断力改变。这些变化可能会对您与被护理者的关系产生负面影响。它们可能导致您感到悲伤、愤怒、困惑或焦虑。" },
          { heading: "Understanding the cycle of behaviour change.", headingZh: "了解行为改变的周期。", body: "To manage a behavior, it's very important to understand what happens before and after it. By identifying and changing the \"trigger\"—the event that happens just before the behavior—you can often reduce or prevent it. For instance, asking a person with dementia questions they can't answer can trigger agitation.", bodyZh: "要管理一种行为，了解其发生前后至关重要。通过识别并改变“触发因素”（即行为发生前的事件），您常常可以减少或预防该行为。例如，向失智者提出他们无法回答的问题可能会引发其激动情绪。" },
          { heading: "Different approaches to respond to behaviour changes.", headingZh: "应对行为改变的不同方法。", body: "Your response after a behavior is also critical. Instead of showing frustration, try taking a deep breath and reminding yourself the person isn't forgetting on purpose. If one approach doesn't work, don't give up; try another, ask a healthcare provider for advice, or seek information from a local dementia association.", bodyZh: "行为发生后您的反应也至关重要。与其表现出沮丧，不如深呼吸并提醒自己，对方不是故意忘记的。如果一种方法不起作用，不要放弃；尝试另一种方法，向医疗服务提供者寻求建议，或从当地的失智症协会获取信息。" }
        ],
        keyActions: ["Identify what happens before a stressful behaviour to understand what might be causing it.", "Observe your own feelings and actions when responding to a behaviour change.", "When a difficult behaviour occurs, take a deep breath before responding to avoid making the situation more stressful.", "If one approach doesn't work, try another, or seek advice from a healthcare provider or support organization."],
        keyActionsZh: ["识别有压力的行为发生前的情况，以了解其可能的原因。", "在应对行为改变时，观察您自己的感受和行动。", "当困难行为发生时，在回应前深呼吸，以避免使情况更紧张。", "如果一种方法无效，请尝试另一种方法，或向医疗服务提供者或支持组织寻求建议。"],
        reflectQuestion: "Think about the past month. What was the most distressing or upsetting behaviour from the person you care for? What could you change about what happened *before* the behaviour to reduce or prevent it, and how could you respond differently?",
        reflectQuestionZh: "回想一下过去一个月。被护理者最让您痛苦或不安的行为是什么？您可以改变该行为发生*前*的哪些情况来减少或预防它？您又可以如何以不同的方式回应？",
        quiz: {
          question: "Howard's wife, Kayla, has dementia. He often asks her about recent events, which she can't remember, causing her to become agitated and him to become frustrated. Which of the following is a good way for Howard to respond?",
          questionZh: "霍华德的妻子凯拉患有失智症。他经常问她最近发生的事情，但她记不起来，这让她变得激动，也让他感到沮丧。以下哪项是霍华德应对的好方法？",
          options: ["Show his frustration to let Kayla know her forgetfulness is a problem.", "Remind himself that Kayla has dementia and is not forgetting on purpose.", "Continue asking the questions until she remembers.", "Tell her to stop bothering him with her forgetfulness."],
          optionsZh: ["表现出他的沮丧，让凯拉知道她的健忘是个问题。", "提醒自己凯拉患有失智症，她不是故意忘记的。", "继续问问题，直到她想起来为止。", "告诉她不要再因为健忘而烦扰他。"],
          correctIndices: [1],
          explanation: "This is a good response because Howard recognises that Kayla's memory loss is a symptom of her dementia and not intentional. This understanding can help prevent further frustration for both of them.",
          explanationZh: "这是一个很好的回应，因为霍华德认识到凯拉的记忆力减退是她失智症的一个症状，而不是故意的。这种理解有助于防止双方进一步的沮丧。",
          optionFeedback: ["Not helpful. Showing frustration adds stress and makes the agitation worse.", "Good idea. Reminding himself it's not intentional helps him stay calm and respond kindly.", "Not helpful. Pressing the question increases her distress and won't restore the memory.", "Not helpful. Telling her to stop blames her for a symptom she cannot control."],
          optionFeedbackZh: ["无益。表现出沮丧会加重压力，让激动情绪更严重。", "很好的做法。提醒自己她不是故意的，能帮助他保持冷静、温和回应。", "无益。继续追问会加重她的痛苦，也无法恢复记忆。", "无益。让她“别烦你”是把症状归咎于她，但她无法控制。"],
        },
      },
      {
        key: "memory-loss",
        title: "Memory loss",
        titleZh: "记忆力减退",
        readMinutes: 5,
        summary: "Memory loss in people with dementia can be frustrating for everyone. This lesson explains how memory is affected, from recent events to long-term memories. You will learn practical ways to respond to forgetfulness, such as when the person forgets groceries, daily activities, or medications. By understanding that memory loss is part of the disease, you can find strategies that are less distressing for both you and the person you care for, using tools like memory aids and consistent routines.",
        summaryZh: "失智症患者的记忆力减退对每个人来说都可能令人沮丧。本课程解释了记忆力是如何受到影响的，从最近发生的事情到长期记忆。您将学习应对健忘的实用方法，例如当患者忘记购买食品、日常活动或药物时。通过理解记忆力减退是疾病的一部分，您可以找到对您和您所护理的人都减少困扰的策略，例如使用记忆辅助工具和保持一致的日常生活规律。",
        sections: [
          { heading: "What is memory loss?", headingZh: "什么是记忆力减退？", body: "People with dementia will increasingly lose their memory over time. In the beginning, they may forget recent events, where they put things, or appointments. However, past memories, such as childhood memories, are often preserved for a longer period.", bodyZh: "失智症患者的记忆力会随着时间的推移而逐渐减退。初期，他们可能会忘记最近发生的事情、物品放在哪里或忘记约会。然而，过去的记忆，如童年记忆，通常会保留更长的时间。" },
          { heading: "How to respond to memory loss?", headingZh: "如何应对记忆力减退？", body: "When a person forgets things like groceries, activities, or medication, try to respond calmly and practically. Use memory aids like lists, pill boxes, or written-out daily plans. Involving the person in creating these aids can be helpful. Remember that the person cannot help forgetting, so avoid blame and focus on supportive solutions.", bodyZh: "当患者忘记购买食品、日常活动或服药时，请尝试冷静并实际地应对。使用记忆辅助工具，如清单、药盒或写下的日常计划。让患者参与创建这些辅助工具会很有帮助。请记住，患者无法控制自己的遗忘，所以要避免责备，专注于提供支持性的解决方案。" }
        ],
        keyActions: ["Remind yourself that memory loss is part of the disease, not the person's fault.", "Use memory aids like notes, pill-boxes, or alarms to help.", "When one approach doesn’t work, take a breath and try another one.", "Involve the person you care for in finding the best ways to support them."],
        keyActionsZh: ["提醒自己，记忆力减退是疾病的一部分，而不是患者的错。", "使用便条、药盒或闹钟等记忆辅助工具来提供帮助。", "当一种方法无效时，深呼吸，然后尝试另一种方法。", "让您护理的人参与进来，共同寻找支持他们的最佳方式。"],
        reflectQuestion: "Think about the person you care for. What are some specific ways you could use memory aids or adjust your response to help them deal with their memory loss?",
        reflectQuestionZh: "想一想您护理的人。有哪些具体的方法，您可以使用记忆辅助工具或调整您的应对方式，来帮助他们处理记忆力减退的问题？",
        quiz: {
          question: "Anne has dementia and often forgets what she usually buys from the market, leaving her fridge empty. Her daughter Maya wants to help. How would you advise Maya to deal with her mother’s memory loss?",
          questionZh: "安妮患有失智症，经常忘记她通常在市场买什么，导致冰箱空空如也。她的女儿玛雅想帮忙。你会建议玛雅如何应对她母亲的记忆力减退？",
          options: ["Ask a neighbour to go with Anne once a week to the market to buy groceries.", "Create a memory aid together with Anne, e.g. a list of groceries that Anne needs to buy, and put the list in a place where it can be seen, so that it is easy to access.", "Go out and buy groceries immediately.", "Ask: “Mom, what’s wrong with you, there is no food in the house”"],
          optionsZh: ["请邻居每周陪安妮去一次市场买菜。", "和安妮一起制作一个记忆辅助工具，例如一张安妮需要购买的食品清单，并把清单放在显眼的地方，方便取用。", "立即出门购买食品。", "质问：“妈妈，你怎么了，家里一点食物都没有了”。"],
          correctIndices: [0, 1],
          explanation: "Creating a memory aid like a list empowers Anne and involves her in the solution. This collaborative approach addresses the memory loss directly and can become a positive shared activity.",
          explanationZh: "制作清单这样的记忆辅助工具能够增强安妮的能力，并让她参与到解决问题中来。这种合作的方式直接解决了记忆力减退的问题，还可能成为一项积极的共同活动。",
          optionFeedback: ["Good idea. Having a neighbour go with Anne keeps her social and ensures groceries get bought.", "Good idea. A shared shopping list is a memory aid Anne can use independently.", "Less helpful. Buying for her replaces her role rather than supporting it.", "Not helpful. Blaming language causes shame and damages your relationship."],
          optionFeedbackZh: ["很好的做法。请邻居陪安妮去市场，既维持社交也确保买到食品。", "很好的做法。共同制作的购物清单是安妮可以独立使用的记忆辅助工具。", "不太理想。直接替她购物取代了她的角色，而不是支持她。", "无益。质问的语气带来羞愧，也损害你们的关系。"],
        },
      },
      {
        key: "aggression",
        title: "Aggression",
        titleZh: "攻击行为",
        readMinutes: 5,
        summary: "Aggressive behaviors in people with dementia, like shouting or pushing, can be distressing for carers. These actions often stem from unmet needs, illness, medication side effects, or confusion, rather than malice. This lesson will help you understand the potential causes behind aggression and equip you with practical skills to prevent or de-escalate these difficult situations, ensuring a calmer and safer environment for both you and the person you care for.",
        summaryZh: "失智症患者的攻击行为（如喊叫或推搡）可能会让护理者感到痛苦。这些行为通常源于未被满足的需求、疾病、药物副作用或困惑，而非恶意。本节课将帮助您了解攻击行为背后的潜在原因，并教您实用的技巧来预防或缓和这些困难情况，从而为您和您所护理的人确保一个更平静、更安全的环境。",
        sections: [
          { heading: "Why does aggression happen?", headingZh: "为什么会发生攻击行为？", body: "Aggression in people with dementia can be triggered by various factors, including unmet needs, physical illness like a urinary tract infection, or as a side effect of medication. Psychological changes from dementia can also play a part, as they may have difficulty understanding situations, controlling emotions, or expressing themselves clearly. The behavior is often a symptom of the disease's impact on the brain, not a personal attack.", bodyZh: "失智症患者的攻击行为可能由多种因素引发，包括未满足的需求、尿路感染等身体疾病或药物副作用。失智症引起的心理变化也可能是一个因素，因为他们可能难以理解情况、控制情绪或清晰地表达自己。这种行为通常是大脑受疾病影响的症状，而不是针对个人的攻击。" },
          { heading: "How to respond to aggressive behaviour?", headingZh: "如何应对攻击行为？", body: "When faced with aggression, it's crucial to respond calmly and avoid escalating the situation. Instead of arguing or using force, try to create a soothing environment with methods like playing gentle music. It is also important to respect the person's dignity and privacy. If you feel overwhelmed, it's okay to walk away for a moment to de-stress before trying a different approach.", bodyZh: "面对攻击行为时，关键是要冷静应对，避免使情况升级。不要争论或使用武力，而是尝试用播放轻柔音乐等方法营造一个舒缓的环境。尊重患者的尊严和隐私也很重要。如果您感到不知所措，可以暂时走开，缓解一下压力，然后再尝试不同的方法。" },
          { heading: "How to deal with ongoing aggression?", headingZh: "如何处理持续的攻击行为？", body: "If your initial attempts to manage aggression don't work, do not get discouraged as different responses may work at different times. Be prepared to try several different approaches and consider seeking suggestions from other carers or online resources. Remind yourself that the aggression is part of the dementia, and taking a deep breath can help you respond in a positive way that is less distressing for everyone.", bodyZh: "如果您最初处理攻击行为的尝试不起作用，请不要灰心，因为不同的应对方法可能在不同时间奏效。准备好尝试几种不同的方法，并考虑向其他护理者或通过网络资源寻求建议。提醒自己，攻击行为是失智症的一部分，深呼吸可以帮助您以积极的方式应对，减轻每个人的痛苦。" }
        ],
        keyActions: ["If aggression appears suddenly, consult a doctor to check for underlying medical causes like infections.", "Never use force. Instead, try to create a calm environment and maintain the person's dignity.", "If a strategy isn't working, take a break and try a different approach later or on another day.", "Remind yourself that aggression is a symptom of dementia, not a personal attack."],
        keyActionsZh: ["如果攻击行为突然出现，请咨询医生，检查是否有感染等潜在的医疗原因。", "切勿使用武力。相反，应努力营造一个平静的环境，并维护患者的尊严。", "如果一个策略无效，可以先暂停一下，稍后或改天再尝试不同的方法。", "提醒自己，攻击行为是失智症的一个症状，而不是针对您个人的攻击。"],
        reflectQuestion: "Think about the last time the person you care for was aggressive. What was happening right before? What could you change about your response, or the environment, to make it more calming next time?",
        reflectQuestionZh: "回想一下您护理的人最近一次表现出攻击性是什么时候。在此之前发生了什么？下一次，您可以如何改变自己的应对方式或环境，使情况更平缓？",
        quiz: {
          question: "Neil's father-in-law, Amit, has dementia. Amit angrily refuses to take a bath. Neil tugs Amit's arm and says angrily: \"you must take a bath because you are going to the doctor and need to be clean\". Amit gets very upset and shouts and even tries to shove Neil. How could Neil react differently? (Multiple answers are correct.)",
          questionZh: "尼尔的岳父阿米特患有失智症。阿米特愤怒地拒绝洗澡。尼尔拉着他的胳膊，生气地说：\"你必须洗澡，因为你要去看医生，需要干净。\"阿米特非常不安，大喊大叫，甚至试图推开尼尔。尼尔可以如何不同地回应？（多选）",
          options: [
            "Force his father-in-law to take a bath.",
            "Walk away and try at a different time, or on a different day.",
            "Use distraction, e.g. by playing music that his father-in-law likes.",
            "Maintain his father-in-law's dignity and privacy.",
            "Ask his wife or another family member to give it a try.",
            "Look online or talk to other carers for new suggestions."
          ],
          optionsZh: [
            "强迫岳父去洗澡。",
            "走开，换个时间或换一天再试。",
            "使用分散注意力的方法，比如播放岳父喜欢的音乐。",
            "维护岳父的尊严和隐私。",
            "请妻子或其他家人来试一试。",
            "上网查找或与其他护理者交流，寻求新建议。"
          ],
          correctIndices: [1, 2, 3, 4, 5],
          explanation: "WHO recommends: never force the person; walk away and try later, distract with something they enjoy, maintain dignity, ask others to help, and seek new ideas from carers or online resources.",
          explanationZh: "WHO 建议：绝不强迫；走开稍后再试，用他们喜欢的事物分散注意力，维护尊严，请他人帮忙，并向其他护理者或网络资源寻求新方法。",
          optionFeedback: [
            "Not correct. Forcing will escalate the aggression and may injure both of you.",
            "Correct. Walking away gives both of you time to calm down before trying again.",
            "Correct. Distraction with something pleasant, like music he likes, can defuse the situation.",
            "Correct. Always preserve the person's dignity and privacy, even in difficult moments.",
            "Correct. A different family member may have more success at that moment.",
            "Correct. Other carers and online resources can offer fresh ideas to try."
          ],
          optionFeedbackZh: [
            "不正确。强迫会升级攻击行为，可能伤到双方。",
            "正确。走开让双方都冷静下来，再尝试一次。",
            "正确。用愉快的事物（如他喜欢的音乐）分散注意力可以化解局面。",
            "正确。无论何时都要维护对方的尊严和隐私。",
            "正确。换一位家人此刻可能更顺利。",
            "正确。其他护理者和网络资源能提供新的尝试思路。"
          ],
        },
      },
      {
        key: "depression-anxiety-apathy",
        title: "Depression, anxiety and apathy",
        titleZh: "抑郁、焦虑和冷漠",
        readMinutes: 6,
        summary: "Depression, anxiety, and apathy are common among people with dementia, stemming from brain changes or their emotional reaction to their condition. This can manifest as sadness, worry, restlessness, or withdrawal. This lesson helps you understand the potential causes of these mood and interest changes. It will equip you with skills to prevent or reduce these mood problems, offering ways to comfort the person and get them interested in activities they enjoy.",
        summaryZh: "失智症患者普遍存在抑郁、焦虑和冷漠的情况，这可能源于大脑变化或他们对自己状况的情绪反应。这可能表现为悲伤、担忧、不安或退缩。本课程将帮助您了解这些情绪和兴趣变化的潜在原因，并教您一些技巧来预防或减少这些情绪问题，提供安慰他们并让他们对喜欢的活动重新产生兴趣的方法。",
        sections: [
          { heading: "What are depression, anxiety and apathy?", headingZh: "什么是抑郁、焦虑和冷漠？", body: "Dementia can significantly affect a person's mood and interests, often due to brain changes or emotional reactions to their condition. They might seem sad, worried, unusually emotional, or withdrawn. Anxiety can present with similar behaviors, such as worrying about being left alone, while apathy involves a loss of interest or trouble initiating activities.", bodyZh: "失智症会显著影响一个人的情绪和兴趣，这通常是由于大脑变化或他们对自己状况的情绪反应。他们可能看起来悲伤、担忧、情绪异常或孤僻。焦虑可能伴有类似的行为，例如担心被单独留下，而冷漠则表现为对活动失去兴趣或难以开始行动。" },
          { heading: "How to respond when a person living with dementia is feeling depressed or anxious?", headingZh: "当失智症患者感到抑郁或焦虑时该如何应对？", body: "When a person is depressed or anxious, respond with calm, reassuring support. Acknowledge their feelings with empathy and offer physical comfort like a touch on the arm. Avoid dismissive or scolding language, as they cannot control these feelings. Instead, try to distract them with a pleasant activity you can do together.", bodyZh: "当患者感到抑郁或焦虑时，应给予冷静、令人安心的支持。用同理心承认他们的感受，并提供身体上的安慰，如轻抚手臂。避免使用不屑一顾或责备的语言，因为他们无法控制这些情绪。相反，尝试通过你们可以一起做的愉快活动来分散他们的注意力。" },
          { heading: "How to respond when a person living with dementia loses interest in daily activities?", headingZh: "当失智症患者对日常活动失去兴趣时该如何应对？", body: "Apathy, or a loss of interest, is common in dementia. Respond with affection and reassurance rather than frustration or demands. Don't take it personally or give up on engagement. Instead, gently encourage them by suggesting an activity you know they used to enjoy, adapting it to their current abilities.", bodyZh: "冷漠，即对事物失去兴趣，在失智症中很常见。应对方式应是表达关爱和安抚，而不是沮丧或强求。不要把这看作是针对你个人的，也不要放弃与他们互动。相反，可以温和地鼓励他们，建议一项你知道他们过去喜欢的活动，并根据他们目前的能力进行调整。" }
        ],
        keyActions: ["Offer extra love, support, and understanding when they show mood changes.", "Comfort the person and suggest a pleasant, familiar activity to do together.", "Remind yourself that mood changes are part of the illness and not something they can control.", "If one approach doesn’t work, take a deep breath and try another.", "Seek medical advice immediately for serious, constant mood changes or if you think they might harm themselves."],
        keyActionsZh: ["当他们表现出情绪变化时，给予额外的关爱、支持和理解。", "安慰患者，并建议一起进行一项愉快而又熟悉的活动。", "提醒自己，情绪变化是疾病的一部分，他们无法控制。", "如果一种方法无效，深呼吸，然后尝试另一种。", "如果出现严重、持续的情绪变化，或者您认为他们可能伤害自己，请立即就医。"],
        reflectQuestion: "Think about the person you care for. Do they ever show signs of depression, anxiety, or apathy? Describe what these changes look like and consider what you could do to prevent them or respond differently next time.",
        reflectQuestionZh: "想一想您所护理的人。他们是否曾表现出抑郁、焦虑或冷漠的迹象？描述一下这些变化是什么样子的，并思考您可以做些什么来预防这些情况，或者在下一次以不同的方式应对。",
        quiz: {
          question: "Juan has dementia and sometimes sits looking very sad, hunched over, and crying. His sister Isabel sees him like this. Below are some things Isabel may do or say. Please select all responses that you think might work. (Multiple answers are correct.)",
          questionZh: "胡安患有失智症，有时会弓着背坐着，看起来很伤心、哭泣。他的姐姐伊莎贝尔看到他这样。下面是伊莎贝尔可能采取的做法或说的话。请选出所有您认为可能有用的回应。（多选）",
          options: [
            "Walk over to Juan and say in a calm, reassuring tone: \"I have some ideas for how you can feel better, let's talk.\"",
            "Say: \"Juan, what's the matter with you? I'm tired of seeing you like this. Just get up and do something.\"",
            "Say: \"Men don't cry and get sad, we used to have so much fun together.\"",
            "Go over and touch Juan on the arm or shoulder: \"I know that you feel bad, I do too. What we're going through is really hard.\"",
            "Sit with Juan and suggest that they do a pleasant activity together.",
            "Sigh and walk away, thinking that there is nothing that she can do."
          ],
          optionsZh: [
            "走到胡安身边，用平静、安抚的语气说：\"我有一些可以让你感觉好些的想法，我们聊聊吧。\"",
            "说：\"胡安，你怎么了？我看你这样真累。快起来做点什么吧。\"",
            "说：\"男人不哭、不悲伤，我们以前在一起多开心啊。\"",
            "走过去摸他的手臂或肩膀，说：\"我知道你感觉不好，我也是。我们经历的一切真的很难。\"",
            "陪胡安坐着，并建议一起做一项愉快的活动。",
            "叹口气走开，心想自己什么也做不了。"
          ],
          correctIndices: [0, 3, 4],
          explanation: "WHO marks three responses as good: calmly offering support, acknowledging his feelings with touch, and suggesting a pleasant activity together. Scolding, shaming, or walking away are not helpful.",
          explanationZh: "WHO 标记的好回应有三种：冷静地提供支持、用身体接触认可他的感受、建议一起做愉快的活动。责备、羞辱或走开都没有帮助。",
          optionFeedback: [
            "Correct. Juan needs more support due to the changes in his mood.",
            "Not correct. This response is not helpful because Juan cannot help that he is feeling sad.",
            "Not correct. This might embarrass Juan and may make him feel even more sad.",
            "Correct. People who are feeling sad need extra love, support and understanding.",
            "Correct. It may distract Juan and make him feel better.",
            "Not correct. This is not helpful because Isabel is further isolating Juan."
          ],
          optionFeedbackZh: [
            "正确。胡安因情绪变化需要更多支持。",
            "不正确。胡安无法控制自己的悲伤，这种话没有帮助。",
            "不正确。这可能让胡安难堪，反而让他更伤心。",
            "正确。感到悲伤的人需要额外的关爱、支持和理解。",
            "正确。这可能转移胡安的注意力，让他感觉好一些。",
            "不正确。走开会让伊莎贝尔进一步孤立胡安。"
          ],
        },
      },
      {
        key: "difficulty-sleeping",
        title: "Difficulty sleeping",
        titleZh: "睡眠困难",
        readMinutes: 6,
        summary: "Difficulty sleeping is common for people with dementia and can disrupt the carer's sleep too. Carers may find it hard to provide care when sleep-deprived. This lesson will help you promote good sleep for the person with dementia by explaining how to manage challenges like difficulty falling asleep and waking up in the middle of the night. You will learn practical strategies to create a better sleep environment and routine, improving wellbeing for both you and the person you care for.",
        summaryZh: "失智症患者普遍存在睡眠困难，这也可能影响护理者的睡眠。睡眠不足会使护理工作变得更加困难。本课程将帮助您促进失智症患者的良好睡眠，解释如何管理入睡困难和夜间醒来等挑战。您将学到改善睡眠环境和作息的实用策略，从而为您和您所护理的人增进福祉。",
        sections: [
          { heading: "How to deal with sleeping problems in a person", headingZh: "如何应对患者的睡眠问题", body: "To help someone with dementia fall asleep, establish a comforting bedtime routine such as lowering the lights or playing soothing music. Encourage physical activity during the day but limit daytime naps, and make lunch the main meal of the day. Avoid stimulants like coffee or too much fluid in the evening. Remember that older adults may naturally require less sleep, so adjust bedtimes accordingly.", bodyZh: "为帮助失智症患者入睡，应建立一个舒适的睡前程序，例如调暗灯光或播放舒缓的音乐。鼓励日间体育锻炼，但限制白天的小睡时间，并将午餐作为一天的主餐。晚上避免摄入咖啡或过多液体等刺激物。请记住，老年人可能自然需要较少的睡眠，因此请相应地调整就寝时间。" },
          { heading: "How to deal with a person with dementia who wakes up in the middle of the night?", headingZh: "如何应对失智症患者半夜醒来？", body: "If the person wakes up at night, stay calm and gently remind them it’s time to sleep. Find out what helps them feel secure, whether it's a dark, quiet room or a night light and soft music. Check for basic needs like hunger, thirst, or needing the bathroom, and address them promptly. If night waking persists, consider seeking a doctor's advice to rule out underlying medical issues and ask for help from others to ensure you get enough rest.", bodyZh: "如果患者在夜间醒来，请保持冷静，并温和地提醒他们现在是睡觉时间。了解什么能让他们感到安全，无论是黑暗安静的房间，还是夜灯和轻柔的音乐。检查他们是否有饥饿、口渴或需要上厕所等基本需求，并及时处理。如果夜醒问题持续存在，应考虑咨询医生以排除潜在的医疗问题，并向他人求助以确保您获得足够的休息。" }
        ],
        keyActions: ["Create a consistent bedtime routine, like washing up and lowering the lights.", "Encourage daytime physical activity, but limit naps to 15-30 minutes.", "Avoid stimulants like coffee or lots of fluid a few hours before bed.", "If they wake at night, stay calm and check if they need the bathroom or a drink.", "Ask for help from family or friends so you can get enough sleep to provide care."],
        keyActionsZh: ["建立一个固定的睡前程序，例如洗漱和调暗灯光。", "鼓励日间的体育锻炼，但将午睡时间限制在15-30分钟。", "睡前几小时避免摄入咖啡或大量液体等刺激物。", "如果他们夜间醒来，保持冷静，检查是否需要上厕所或喝水。", "向家人或朋友求助，以确保您有足够的睡眠来继续提供护理。"],
        reflectQuestion: "What could you do to help tackle the sleeping problems? What could you do to improve your reaction to sleeping problems?",
        reflectQuestionZh: "您可以做些什么来帮助解决睡眠问题？您可以做些什么来改善您对睡眠问题的反应？",
        quiz: {
          question: "Rosie is an older woman with dementia who lives with her family. They try to put her to bed at 8pm, but she has trouble falling asleep and makes noise. Which of these is NOT a good way for her granddaughter Grace to respond?",
          questionZh: "Rosie是一位患有失智症的老年妇女，与家人同住。家人试图让她晚上8点上床睡觉，但她难以入睡并发出噪音。以下哪项不是她的孙女Grace的正确应对方式？",
          options: ["Create a bedtime routine, like lowering the lights and washing up.", "Give her a pill to sleep.", "Go for a walk with Rosie and add more physical activity during the day.", "Play soothing music before bedtime to help Rosie sleep."],
          optionsZh: ["建立一个睡前程序，例如调暗灯光和洗漱。", "给她一片安眠药。", "白天带Rosie散步，增加体育锻炼。", "睡前播放舒缓的音乐，帮助Rosie入睡。"],
          correctIndices: [1],
          explanation: "Sleeping pills are not a good idea. They can make a person with dementia more confused or agitated and can become addictive.",
          explanationZh: "安眠药不是一个好主意。它可能使失智症患者更加困惑或激动，并且可能会上瘾。",
          optionFeedback: ["Good practice — a calming routine helps her fall asleep naturally.", "Not recommended. Sleeping pills can worsen confusion and become addictive.", "Good practice — daytime activity helps tire her in a healthy way.", "Good practice — soothing music supports a calm bedtime."],
          optionFeedbackZh: ["好做法 — 平静的睡前程序帮助她自然入睡。", "不推荐。安眠药可能加重困惑并导致依赖。", "好做法 — 白天活动以健康的方式让她适度疲倦。", "好做法 — 舒缓音乐有助于平静的就寝。"],
        },
      },
      {
        key: "delusions-hallucinations",
        title: "Delusions and hallucinations",
        titleZh: "错觉和幻觉",
        readMinutes: 6,
        summary: "Delusions (unreal thoughts) and hallucinations (seeing or hearing things that are not there) can be distressing for people with dementia and their carers, but they are a common part of the disease caused by changes in the brain. This lesson explains why these experiences happen and how to respond effectively. You will learn to identify and reduce them not by arguing, but by offering comfort, reassurance, and distraction. It is important to remember these thoughts are real to the person and to respond with understanding and support.",
        summaryZh: "错觉（不真实的想法）和幻觉（看到或听到不存在的东西）可能让失智症患者及其护理者感到痛苦，但它们是因大脑变化而引起的常见症状。本课将解释这些经历发生的原因以及如何有效应对。您将学会如何识别和减少这些情况——不是通过争论，而是通过提供安慰、 reassurance 和转移注意力。重要的是要记住，这些想法对患者来说是真实的，应用理解和支持来回应。",
        sections: [
          { heading: "Why do people with dementia have unreal thoughts and see or hear things that aren’t there?", headingZh: "为什么失智症患者会有不真实的思想，并看到或听到不存在的东西？", body: "Changes in the brain can make it difficult for a person with dementia to understand the world around them. This can lead to delusions, which are fixed false beliefs, such as thinking they are under threat. It can also cause hallucinations, where they see or hear things that are not there. To the person with dementia, these experiences feel very real and can cause fear, so they need a great deal of understanding and support.", bodyZh: "大脑的变化会使失智症患者难以理解周围的世界。这可能导致错觉，即固定的错误信念，例如认为自己受到威胁。这也可能引起幻觉，即看到或听到不存在的东西。对失智症患者来说，这些体验感觉非常真实，并可能导致恐惧，因此他们需要大量的理解和支持。" },
          { heading: "How to stop or reduce delusions and hallucinations?", headingZh: "如何停止或减少错觉和幻觉？", body: "Instead of arguing about what is real, soothe the person with a calm voice and physical touch. Acknowledge their feelings, reassure them that they are safe, and gently distract them by moving to another room or starting a new activity. Check for environmental triggers like shadows or noises that could be misinterpreted, and consider asking a doctor if medication side effects could be a factor. If a hallucination is pleasant and not causing distress, you can try to enjoy the moment with them.", bodyZh: "不要争论什么是真实的，而是用冷静的声音和身体接触来安抚患者。认可他们的感受，让他们安心，然后温和地将他们带到另一个房间或开始新的活动来转移他们的注意力。检查环境中是否有像阴影或噪音这样可能被误解的触发因素，并考虑咨询医生药物的副作用是否可能是一个原因。如果幻觉是愉快的并且没有引起困扰，您可以尝试与他们一起享受那一刻。" }
        ],
        keyActions: ["Do not argue or try to convince the person; their experience is real to them.", "Soothe the person with a calm voice and reassure them that they are safe.", "Gently distract them by moving to a different room or starting a pleasant activity.", "Check the environment for things that might cause confusion, like shadows or reflections.", "Ask a doctor to review medications, as they can sometimes cause hallucinations."],
        keyActionsZh: ["不要与患者争论或试图说服他们；他们的经历对他们来说是真实的。", "用冷静的声音安抚患者，让他们相信自己是安全的。", "温和地将他们带到不同的房间或开始一项愉快的活动来转移他们的注意力。", "检查环境中是否有像阴影或反射这样可能引起困惑的事物。", "请医生检查药物，因为药物有时会引起幻觉。"],
        reflectQuestion: "Think about a time the person you care for had an unreal thought or saw something that was not there. How did you react, and what could you do differently next time based on what you have learned?",
        reflectQuestionZh: "回想一下您照顾的人曾有过不真实的想法或看到不存在的东西的一次经历。您当时是如何反应的？根据本课所学，下次您会采取什么不同的做法？",
        quiz: {
          question: "Martin's wife Betty is living with dementia. One day, Martin and Betty are walking in the park. Suddenly, Betty stops in front of a young woman whom she does not know and says: \"Oh Susan, where have you been? I missed you so much.\" In reality, Susan was Betty's sister who passed away 30 years ago. The young woman ignores Betty and Betty becomes very upset. What would you recommend Martin do? Please choose all correct responses. (Multiple answers are correct.)",
          questionZh: "马丁的妻子贝蒂患有失智症。一天，马丁和贝蒂在公园散步。贝蒂突然在一位不认识的年轻女子面前停下，说：\"哦苏珊，你去哪儿了？我好想你。\" 事实上，苏珊是贝蒂30年前去世的妹妹。年轻女子没有理睬，贝蒂变得非常难过。您建议马丁怎么做？请选出所有正确的回应。（多选）",
          options: [
            "Soothe her in a calm voice.",
            "Lead her away from the woman in the park.",
            "Say: \"Yes you are right, it is Susan.\"",
            "Directly tell the truth, harshly, to set the record straight.",
            "Say: \"When we get home, you can look at pictures of Susan and remember her.\"",
            "Argue with Betty that the young woman is not her sister.",
            "Say that the young woman in the park is someone who looks like her, but it is not her.",
            "Involve the woman in the park in any way.",
            "Try to 'convince' Betty of the truth."
          ],
          optionsZh: [
            "用平静的声音安抚她。",
            "把她带离公园里的那位女子。",
            "说：\"是的你说得对，她就是苏珊。\"",
            "严厉地直说真相，把事情说清楚。",
            "说：\"我们回到家后，你可以看苏珊的照片，回忆她。\"",
            "和贝蒂争论说那位年轻女子不是她妹妹。",
            "说公园里的年轻女子只是长得像她妹妹，但不是她。",
            "以任何方式把公园里的那位女子卷入其中。",
            "试图\"说服\"贝蒂接受事实。"
          ],
          correctIndices: [0, 1, 4, 6],
          explanation: "WHO marks four responses as good: soothing in a calm voice, leading her away, suggesting they look at photos at home, and gently saying the woman just looks like her sister. Lying, arguing, harsh truth, and involving the stranger are not helpful.",
          explanationZh: "WHO 标记四种回应为好：用平静的声音安抚、把她带离、建议回家看照片、温和地说那位女子只是长得像她妹妹。撒谎、争论、生硬地说真相或牵涉到陌生人都不合适。",
          optionFeedback: [
            "Correct. People with delusions and hallucinations may feel frightened and insecure.",
            "Correct. This will distract her from the young woman in the park.",
            "Not correct. This is not the truth.",
            "Not correct. This may make Betty even more upset.",
            "Correct. This addresses the importance of her sister, without arguing that the young woman was not her sister.",
            "Not correct. This may make Betty even more upset.",
            "Correct. This maintains a positive social environment.",
            "Not correct. This may make the situation more complicated.",
            "Not correct. Betty may not understand."
          ],
          optionFeedbackZh: [
            "正确。患有错觉和幻觉的人可能感到害怕和不安。",
            "正确。这能让她从公园里那位年轻女子身上移开注意力。",
            "不正确。这并非事实。",
            "不正确。这可能让贝蒂更加难过。",
            "正确。既肯定了她妹妹的重要性，又不去争论那位年轻女子是否是她妹妹。",
            "不正确。这可能让贝蒂更加难过。",
            "正确。这维持了积极的社交氛围。",
            "不正确。这可能让情况更复杂。",
            "不正确。贝蒂可能无法理解。"
          ],
        },
      },
      {
        key: "repetitive-behaviour",
        title: "Repetitive behaviour",
        titleZh: "重复性行为",
        readMinutes: 4,
        summary: "People with dementia may repeat questions or actions due to memory loss, which can be stressful for both them and the carer. This lesson explains why repetitive behaviors happen and how you can respond effectively to reduce them. Understanding the cause, such as anxiety or insecurity, is key. Learning how to comfort the person, distract them, or simply accept harmless repetitions can prevent them from becoming anxious or aggressive, while also reducing your own stress. Inappropriate responses like yelling often make the situation worse.",
        summaryZh: "失智症人士可能会因为记忆力衰退而重复提问或做出相同的行动，这会给他们自己和护理者都带来压力。本课程将解释重复性行为发生的原因，以及如何有效应对以减少此类行为。理解其根源（如焦虑或不安全感）是关键。学习如何安抚、转移其注意力，或在无害的情况下接纳这些重复行为，可以防止他们变得焦虑或有攻击性，同时也能减轻您自己的压力。大喊大叫等不当回应往往会使情况变得更糟。",
        sections: [
          { heading: "What is repetitive behaviour?", headingZh: "什么是重复性行为？", body: "A person with dementia may forget what they have said or done, leading them to repeat questions and actions. This repetitive behavior is often not harmful, but it can become stressful for everyone. If a carer reacts poorly, for example by screaming, the person with dementia can become anxious or depressed, which may worsen the situation.", bodyZh: "失智症人士可能会忘记自己说过的话或做过的事，导致他们重复提问和行为。这种重复性行为通常是无害的，但会给每个人带来压力。如果护理者反应不当（例如大声喊叫），失智症人士可能会变得焦虑或抑郁，这可能会使情况恶化。" },
          { heading: "How to comfort a person living with dementia in case of repetitive behaviours?", headingZh: "发生重复性行为时，如何安抚失智症人士？", body: "Focus on comforting the person, not correcting them. It is crucial to stay calm and provide reassurance, as the behavior may stem from insecurity. You can also try to distract them with a pleasant activity, offer a snack, or write down answers to their questions. If the behavior is not harmful, it can also be effective to simply accept it, adapt, and let it be.", bodyZh: "专注于安抚对方，而不是纠正他们。保持冷静并给予安抚至关重要，因为该行为可能源于不安全感。您也可以尝试通过愉快的活动、提供零食或写下问题的答案来分散他们的注意力。如果该行为无害，坦然接受、适应并顺其自然也是有效的方法。" }
        ],
        keyActions: ["Remember that repetitive behaviours are part of the disease.", "Comfort the person and reassure them, rather than getting annoyed.", "Try to distract the person with an activity they enjoy, or offer a snack or drink.", "If a question is asked repeatedly, try writing the answer down on a piece of paper for the person to read.", "Take a deep breath and think about the least distressing way to respond for both of you."],
        keyActionsZh: ["请记住，重复性行为是失智症的一种症状。", "安抚并宽慰对方，而不是感到恼火。", "尝试通过他们喜欢的活动来分散其注意力，或为他们提供一些点心或饮料。", "如果对方反复问同一个问题，试着把答案写在纸上给他们看。", "深呼吸，想出一种对您们双方压力最小的应对方式。"],
        reflectQuestion: "Does the person you care for ever do or say things over and over again? What behaviour(s) do they repeat?",
        reflectQuestionZh: "您所护理的人是否曾反复做某事或说某些话？他们会重复哪些行为？",
        quiz: {
          question: "John is taking care of his father, Joe, who has dementia. Joe has just had lunch with John, but already he is asking John when lunch will be. He repeats this question many times. Joe seems to feel insecure because his wife went out. What would you recommend to John? Please select all correct responses. (Multiple answers are correct.)",
          questionZh: "约翰在照顾患有失智症的父亲乔。乔刚和约翰一起吃过午饭，却又一遍又一遍地问约翰什么时候吃午饭。乔似乎因为妻子外出而感到不安。您建议约翰怎么做？请选出所有正确的回应。（多选）",
          options: [
            "Say: \"What's wrong with you? Can't you remember? We just had lunch!\"",
            "Stay calm and reassure his father that his wife will be home soon.",
            "Engage his father in an activity.",
            "Offer his father a snack or a drink.",
            "Write down the answers to his questions, for example where his wife is and when she is expected to return.",
            "Walk away.",
            "Accept the repetitive questions. If it isn't harmful, let it be. Find ways to adapt."
          ],
          optionsZh: [
            "说：\"你怎么了？记不住吗？我们刚吃过午饭！\"",
            "保持冷静，安抚父亲，告诉他妻子很快就回家。",
            "让父亲参与一项活动。",
            "给父亲一些零食或饮料。",
            "把问题的答案写下来，例如妻子在哪里、什么时候回来。",
            "走开。",
            "接受重复的提问。如果无害，就顺其自然。寻找适应的方法。"
          ],
          correctIndices: [1, 2, 3, 4, 6],
          explanation: "WHO marks five responses as good: stay calm and reassure, engage him in an activity, offer a snack or drink, write down the answer, and accept the behaviour if it isn't harmful. Blaming or walking away are not helpful.",
          explanationZh: "WHO 标记五种回应为好：保持冷静并安抚、让他参与一项活动、给些零食饮料、把答案写下来、若行为无害就接纳。责备或走开都没有帮助。",
          optionFeedback: [
            "Not correct. John is blaming his father for something he can't help.",
            "Correct. The repetition may worsen due to Joe's feelings of insecurity. Reassuring him may lessen or stop the repetition.",
            "Correct. An activity may distract his father and offer something else to see, hear or do.",
            "Correct. Perhaps Joe is still hungry or thirsty. It may help to calm him and meet his need.",
            "Correct. This might work well, may reassure Joe and stop him from asking again.",
            "Not correct. This will only upset his father more.",
            "Correct. If it is just repetitive questioning, by remaining calm the behaviour may decrease."
          ],
          optionFeedbackZh: [
            "不正确。约翰是在为父亲无法控制的事情责备他。",
            "正确。重复可能源于乔的不安全感。安抚他可能会让重复行为减少或停止。",
            "正确。活动可以转移父亲的注意力，提供新的视听感受。",
            "正确。也许乔还饿或渴；这能安抚他并满足他的需求。",
            "正确。这可能很有效，能让乔安心并不再反复发问。",
            "不正确。这只会让父亲更加难过。",
            "正确。如果只是反复提问，保持冷静可能会让该行为减少。"
          ],
        },
      },
      {
        key: "walking-getting-lost",
        title: "Walking and getting lost",
        titleZh: "行走与走失",
        readMinutes: 6,
        summary: "People with dementia often walk about or leave the house, which can be distressing for carers worried about them getting lost. This behavior, also called wandering, can happen for many reasons, from exercise and habit to boredom, pain, or confusion. This lesson will help you understand the causes behind walking. You'll learn practical strategies to manage it safely, such as planning walks together, ensuring the person carries ID, securing your home, and how to calmly reassure them if they feel lost or disoriented.",
        summaryZh: "失智症患者经常四处走动或离开家，这可能会让担心他们走失的护理者感到痛苦。这种行为，也称为“徘徊”，可能有很多原因，从锻炼、习惯到无聊、疼痛或困惑。本课程将帮助您理解行走背后的原因。您将学到安全管理这一行为的实用策略，例如一起计划散步，确保患者携带身份证明，保障您的住所安全，以及在他们感到迷失或方向感错乱时如何冷静地安抚他们。",
        sections: [
          { heading: "Why is walking a concern?", headingZh: "为什么行走是一个令人担忧的问题？", body: "People with dementia often walk around the home or neighbourhood, a common behaviour called wandering. While walking can be a healthy habit, it creates a serious safety concern as they may get lost. The distress for both the person and the carer makes it important to find ways to prevent wandering and unsafe situations.", bodyZh: "失智症患者经常在家中或社区里四处走动，这种常见行为被称为“徘徊”。虽然行走可能是一种健康的习惯，但它也带来了严重的安全问题，因为他们可能会走失。这给患者和护理者都带来了困扰，因此寻找防止徘徊和不安全情况发生的方法非常重要。" },
          { heading: "Why a person with dementia might want to walk around?", headingZh: "失智症患者为什么可能想四处走动？", body: "A person with dementia may walk around for many reasons, including a desire for exercise, continuing a lifelong habit, or relieving boredom and pain. It can also be a response to stress, confusion about their surroundings or the time, or a search for someone or something from their past. Sometimes they are trying to fulfill a purpose, like going to work, or have simply forgotten where they were going.", bodyZh: "失智症患者四处行走可能有很多原因，包括想锻炼身体、延续终身的习惯，或缓解无聊和疼痛。这也可能是对压力、对周围环境或时间的困惑的反应，或是在寻找过去的人或事。有时他们是为了实现某个目的，比如去上班，或者只是忘记了自己要去哪里。" },
          { heading: "How can I manage habits and reduce the chances that the person I care for gets lost?", headingZh: "我该如何管理其行走习惯，并减少他们走失的机会？", body: "To manage walking and prevent getting lost, try to maintain routines and plan activities like walks during times they're most likely to wander. Reassure them calmly if they feel lost, and ensure basic needs like hunger or thirst are met. Make sure they always carry identification, keep an up-to-date photo, and secure your home with measures like door alarms. If they are found after getting lost, always speak with love and acceptance.", bodyZh: "为管理行走行为并防止走失，请尽量保持日常作息，并在他们最可能徘徊的时间段安排散步等活动。如果他们感到迷失，请冷静地安抚他们，并确保他们的基本需求（如饥饿或口渴）得到满足。确保他们始终携带身份证明，保留一张近照，并通过门铃等措施确保家居安全。如果他们在走失后被找到，请始终用爱和接纳的态度与他们沟通。" }
        ],
        keyActions: ["Plan safe walks together, especially during times the person is most likely to want to walk.", "Ensure the person with dementia always carries some form of identification and that you have a recent photo of them.", "Secure your home with door alarms or other alerts so you know if they are trying to leave.", "If the person feels lost and wants to \"go home,\" offer calm reassurance rather than correcting them."],
        keyActionsZh: ["计划安全的共同散步，尤其是在患者最想外出的时段。", "确保失智症患者始终携带某种形式的身份证明，并且您备有他们最近的照片。", "使用门铃或其他警报器来确保您的住所安全，以便在他们试图离开时您能知晓。", "如果患者感到迷茫并想“回家”，请平静地安抚他们，而不是纠正他们。"],
        reflectQuestion: "What are the possible reasons why the person you care for may have the desire to walk? Based on the reasons you identify, how might you react or respond the next time they want to go outside?",
        reflectQuestionZh: "您所护理的人可能想行走的原因有哪些？根据您确定的原因，下次他们想外出时，您可以如何应对？",
        quiz: {
          question: "Amit has dementia and is supported by his wife, Samia. Samia is cooking dinner when she hears Amit heading for the door. She knows that he likes to go for afternoon walks, but now is not a good time. What is the BEST immediate response for Samia?",
          questionZh: "阿米特患有失智症，由他的妻子萨米亚照料。萨米亚正在做晚饭时，听到阿米特走向门口。她知道他喜欢下午散步，但现在时机不合适。对萨米亚来说，最好立即作出的反应是什么？",
          options: ["Go to Amit and calmly say: “Let’s eat dinner first and we’ll go for a walk later.”", "Yell from the kitchen, “Please stop! I can’t come with you now.”", "Forbid Amit to leave and pull him back into the house.", "Lock the door so that Amit cannot leave."],
          optionsZh: ["走到阿米特身边，平静地说：“我们先吃晚饭，稍后我们再去散步。”", "从厨房里大喊：“请停下！我现在不能和你一起去。”", "禁止阿米特离开，并把他拉回屋内。", "锁上门，让阿米特无法离开。"],
          correctIndices: [0],
          explanation: "This is a good response because Samia stays calm, does not yell, and honors Amit's wishes by telling him that they will go together after dinner.",
          explanationZh: "这是一个很好的回应，因为萨米亚保持冷静，没有大喊大叫，并且通过告诉阿米特晚饭后他们会一起去，来尊重他的愿望。",
          optionFeedback: ["Good idea. Calmly redirecting honours his wish to walk while keeping him safe for now.", "Not helpful. Yelling from another room may startle him and not stop him.", "Not helpful. Forcing him back removes his autonomy and may trigger aggression.", "Not ideal as a default. Locking him in can frighten him; better to redirect with empathy first."],
          optionFeedbackZh: ["很好的做法。冷静地引导既尊重他散步的愿望，也确保他当下安全。", "无益。从另一个房间大喊可能吓到他，也无法阻止他。", "无益。强行拉回剥夺了他的自主，可能引发攻击行为。", "不宜作为默认做法。锁门会让他害怕；先用同理心引导更好。"],
        },
      },
      {
        key: "changes-in-judgement",
        title: "Changes in judgement",
        titleZh: "判断力改变",
        readMinutes: 7,
        summary: "People with dementia may show changes in judgment, like saying or doing inappropriate things, or not understanding their own limits. This can be stressful for both the person and the carer, but the actions are usually not harmful. This lesson helps you understand the reasons for these changes and teaches you practical skills to manage them. You will learn how to respond to minor changes in judgment and what to do when they become more serious, such as with finances or driving.",
        summaryZh: "失智症患者可能会表现出判断力的改变，例如说不恰当的话、做不恰当的事，或者不了解自己的局限性。这可能会给患者和护理者都带来压力，但这些行为通常是无害的。本节课将帮助您理解这些变化背后的原因，并教您应对这些变化的实用技巧。您将学习如何应对轻微的判断力变化，以及当问题变得更严重时（例如涉及财务或驾驶时）该怎么做。",
        sections: [
          { heading: "What are changes in judgement?", headingZh: "什么是判断力改变？", body: "Changes in judgment can involve saying the wrong thing, acting inappropriately, or misjudging one's own abilities. These actions, often a result of the dementia progressing, are typically not harmful but can be embarrassing or stressful. The person with dementia is frequently looking for guidance or reassurance in these moments, not intending to cause distress.", bodyZh: "判断力改变可能包括说错话、行为不当或错误判断自身能力。这些行为通常随着失智症的进展而增加，虽然通常无害，但可能会令人尴尬或感到压力。失智症患者在这些时候常常是在寻求指导或安慰，并非有意造成困扰。" },
          { heading: "How can you manage changes in judgement?", headingZh: "如何应对判断力的改变？", body: "When a person with dementia shows poor judgment, like unexpectedly scolding someone, it's crucial to stay calm and reassure them. You can also accept the behavior if it's harmless and unnoticed by others, letting the moment pass. For recurring situations in public, carrying a small card that discreetly explains \"My companion has dementia, please be patient\" can be very helpful to show to others.", bodyZh: "当失智症患者表现出不佳的判断力时（例如出人意料地责骂他人），保持冷静并安抚他们至关重要。如果行为无害且未被他人注意到，您也可以接纳该行为，让那一刻过去。对于在公共场合反复出现的情况，随身携带一张小卡片会很有帮助，可以悄悄地出示给他人看，上面可以写着“我的同伴患有失智症，请您耐心对待”。" },
          { heading: "What to do if the changes in judgement are more serious?", headingZh: "如果判断力的改变更严重怎么办？", body: "For serious issues like mishandling money, offer to help open mail or find out if someone is already appointed to manage their finances. If they insist on driving despite safety concerns, express your concern honestly, offer them rides, and suggest a doctor's visit to discuss it. If inappropriate sexual advances occur, calmly state that the behavior is unacceptable, redefine boundaries, and modify the situation to increase privacy and reduce misunderstanding.", bodyZh: "对于像处理金钱不当这样的严重问题，可以主动提出帮助拆阅邮件，或了解是否已有人负责管理他们的财务。如果他们不顾安全问题坚持开车，应坦诚地表达您的担忧，为他们提供搭车服务，并建议去看医生讨论此事。如果出现不当的性挑逗行为，应冷静地说明该行为是不可接受的，重新设定界限，并调整环境以增加私密性，减少误解。" }
        ],
        keyActions: ["Remind yourself that this is part of the disease. Take a deep breath and respond calmly.", "If a behavior isn't harming anyone, consider accepting it and finding ways to adapt.", "For serious issues like unsafe driving or finances, offer help, suggest alternatives, and involve family or doctors.", "Carry a card to discreetly explain to others, 'My companion has dementia, please be patient with us.'"],
        keyActionsZh: ["提醒自己这是疾病的一部分。深呼吸，冷静应对。", "如果某种行为没有对任何人造成伤害，可以考虑接纳它，并找到适应的方法。", "对于不安全驾驶或财务等严重问题，提供帮助，建议替代方案，并让家人或医生参与。", "随身携带一张卡片，以便悄悄地向他人解释：“我的同伴患有失智症，请您对我们保持耐心。”"],
        reflectQuestion: "Think about a time the person you care for showed a change in their judgement. What did you observe, and how did it affect you? Based on what you've learned, what is one way you could respond differently in the future?",
        reflectQuestionZh: "回想一下您所护理的人在什么时候表现出判断力的改变。您观察到了什么？它对您有何影响？根据您学到的知识，未来您可以采取哪种不同的应对方式？",
        quiz: {
          question: "Ivan is visiting his aunt Isabel, who has dementia. When a taxi pulls up suddenly, it startles her, and she begins scolding the driver. What is the BEST way for Ivan to respond in this moment?",
          questionZh: "伊凡正在探望患有失智症的姑姑伊莎贝尔。当一辆出租车突然停到旁边时，伊莎贝尔受惊并开始责骂司机。在这一刻，伊凡最好的应对方式是什么？",
          options: ["Put his hand on Isabel’s mouth to stop her.", "Walk Isabel back home and leave.", "Stay calm and reassure Isabel everything is alright.", "Accept the behaviour if the taxi driver doesn’t notice."],
          optionsZh: ["用手捂住伊莎贝尔的嘴阻止她。", "带伊莎贝尔回家然后离开。", "保持冷静，并安抚伊莎贝尔说一切都很好。", "如果出租车司机没有注意到，就接受这个行为。"],
          correctIndices: [2],
          explanation: "Staying calm and offering reassurance shows you care about the person's feelings, which can de-escalate the situation and help them feel more relaxed.",
          explanationZh: "保持冷静并提供安抚，表明您关心对方的感受，这有助于缓和局势，让他们感到更放松。",
          optionFeedback: ["Not helpful. Covering her mouth is undignified and frightening.", "Avoidant. Leaving doesn't address the moment or her feelings.", "Good idea. Calm reassurance de-escalates the situation and respects her dignity.", "Possible if no one is harmed, but reassurance is the better default."],
          optionFeedbackZh: ["无益。捂住她的嘴既不尊重，也会让她害怕。", "回避型。离开既未化解当下，也未关注她的感受。", "很好的做法。冷静安抚既能缓和局势，也尊重她的尊严。", "若无人受影响，可以接纳；但安抚仍是更好的默认做法。"],
        },
      },
      {
        key: "putting-it-all-together",
        title: "Putting it all together",
        titleZh: "融会贯通",
        readMinutes: 5,
        summary: "This lesson summarizes key strategies for managing behavior changes in people with dementia, which can be stressful for everyone. It emphasizes understanding that these changes are common and offers ways to prevent or reduce them. You will learn how to make the person feel more comfortable, use distraction techniques, check for medical or environmental causes, and the importance of not blaming yourself. The lesson also highlights the need for self-care, sharing your feelings, and making time for yourself.",
        summaryZh: "本节课总结了管理失智症者行为改变的关键策略，这些行为改变会给每个人带来压力。课程强调，这些改变是普遍现象，并提供了预防或减少这些改变的方法。您将学习如何让患者感觉更舒适，使用分散注意力的技巧，检查医疗或环境原因，以及不自责的重要性。本节课还强调了自我护理、分享您的感受和为自己安排时间的重要性。",
        sections: [
          { heading: "The most important things to keep in mind when dealing with challenging behaviours.", headingZh: "处理挑战性行为时要记住的最重要的事情。", body: "Acknowledge that behavior changes are a common source of stress. Prioritize making the person with dementia comfortable and look for ways to prevent or reduce stressful behaviors, such as by using memory aids. If a challenging behavior occurs, try to distract them instead of arguing. Remember to consult a doctor to rule out illness or medication side effects, and consider if the environment or your approach could be a trigger.", bodyZh: "要认识到行为改变是压力的普遍来源。应优先考虑让失智症者感到舒适，并寻找预防或减少压力行为的方法，例如使用记忆辅助工具。如果出现挑战性行为，试着分散他们的注意力，而不是争吵。记得咨询医生，排除疾病或药物副作用，并考虑环境或您自己的方法是否可能是诱因。" },
          { heading: "Practical tips on not blaming yourself, sharing your feelings with others and making time for yourself.", headingZh: "关于不责备自己、与他人分享感受和为自己留出时间的实用技巧。", body: "It's crucial not to blame yourself or the person with dementia for challenges that arise. Sharing your feelings and experiences with others can make it easier to provide care. Equally essential is making time for yourself to pursue hobbies and activities you enjoy, which is vital for your own well-being and ability to continue as a carer.", bodyZh: "关键是不要因为遇到的挑战而责备自己或失智症者。与他人分享您的感受和经历可以使护理工作变得更容易。同样重要的是，要为自己安排时间来追求自己喜欢的爱好和活动，这对您自己的福祉和作为护理者持续提供支持的能力至关重要。" }
        ],
        keyActions: ["When a challenging behavior occurs, try to distract the person instead of arguing.", "Consult a doctor to check if behavior changes are caused by an illness or medication.", "Don't blame yourself for the challenges you encounter; they are part of the disease.", "Share your feelings and experiences as a carer with friends, family, or a support group.", "Make time for yourself to do activities you value and enjoy."],
        keyActionsZh: ["当挑战性行为发生时，试着分散患者的注意力，而不是与之争论。", "咨询医生，检查行为改变是否由疾病或药物引起。", "不要为你遇到的挑战而自责；这些是疾病的一部分。", "与朋友、家人或支持小组分享你作为护理者的感受和经历。", "为自己安排时间，做一些你认为有价值和喜欢的事情。"],
        reflectQuestion: "Think about a recent challenging behavior you encountered. Which strategy from this lesson—like using distraction, checking the environment, or consulting a doctor—could you apply if it happens again?",
        reflectQuestionZh: "回想一下你最近遇到的一个挑战性行为。如果再次发生，你可以应用本课中的哪一个策略——例如使用分散注意力、检查环境或咨询医生？",
        quiz: {
          question: "If the person you care for becomes agitated, which of the following is recommended by the lesson?",
          questionZh: "如果您护理的人变得焦躁不安，本课程建议下列哪项做法？",
          options: ["Argue with them to show them they are wrong.", "Assume the behavior is just part of the dementia and cannot be changed.", "Try to distract them or make them feel more comfortable.", "Keep your feelings to yourself to appear strong."],
          optionsZh: ["与他们争论，向他们证明他们是错的。", "认为这种行为只是失智症的一部分，无法改变。", "试着分散他们的注意力或让他们感觉更舒服。", "将自己的感受藏在心里以显得坚强。"],
          correctIndices: [2],
          explanation: "The lesson advises against arguing and suggests using distraction. It also recommends investigating other causes for behaviors before assuming it's only the disease.",
          explanationZh: "本课程建议不要争论，并建议使用分散注意力的方法。它还建议在认定行为仅由疾病引起之前，调查其他可能的原因。",
          optionFeedback: ["Not helpful. Arguing escalates agitation.", "Not helpful. Assuming nothing can change misses opportunities to identify triggers.", "Good idea. Distraction and comfort are the recommended first responses.", "Not helpful. Bottling up your feelings leads to burnout."],
          optionFeedbackZh: ["无益。争论会加剧激动。", "无益。认为“无法改变”就错失了识别诱因的机会。", "很好的做法。转移注意力和安抚是推荐的首要应对方式。", "无益。把感受憋在心里会导致身心俱疲。"],
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
