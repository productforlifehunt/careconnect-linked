import type { Question, Questionnaire } from "./types";

export const isChineseLanguage = (language?: string) => Boolean(language?.startsWith("zh"));

export const uiText = (isChinese: boolean, english: string, chinese: string) =>
  isChinese ? chinese : english;

const ZH: Record<string, string> = {
  "Primary caregiver entry survey": "主要护理者初始问卷",
  "Secondary caregiver entry survey": "协助护理者初始问卷",
  "Hourly log": "每小时照护事件",
  "End-of-day log": "每日照护总结",
  "This one-time survey sets the baseline for your week. Every question can be answered by voice — tap the microphone.": "这份一次性问卷用于了解您开始本周记录时的情况。每道题都可以点击麦克风，用语音回答。",
  "This one-time survey is for secondary caregivers who help alongside the primary caregiver. Every question can be answered by voice.": "这份一次性问卷面向协助主要护理者提供照护的人。每道题都可以使用语音回答。",
  "Tell us about this hour: what happened, who was involved, what was hard.": "请告诉我们这个小时发生了什么、有哪些人参与，以及遇到了什么困难。",
  "Close the day: anything you did not log, and how today felt overall.": "回顾今天：补充尚未记录的事情，并记录您今天的整体感受。",
  "CAREGIVER PERSONAL INFORMATION": "护理者个人信息",
  "CARE RECIPIENT INFORMATION": "被护理者信息",
  "NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)": "神经精神症状问卷",
  "SHORT SENSE OF COMPETENCE QUESTIONNAIRE (SSCQ)": "照护胜任感简表",
  "MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)": "领悟社会支持量表",
  "PERSEVERANCE TIME": "可继续照护的时间",
  "DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES": "失智症知识与态度问卷",
  "OTHER CAREGIVER PERSONAL INFORMATION": "协助护理者个人信息",
  "ACTIVITY TAB": "照护活动",
  "PEOPLE TAB": "参与人员",
  "CHALLENGES & RESOURCES TAB": "困难与资源",
  "SUPPLEMENT HOURLY LOGS NOT RECORDED": "补充今天遗漏的照护事件",
  "Alzheimer's Disease Knowledge Scale (ADKS)": "阿尔茨海默病知识量表",
  "Dementia Attitudes Scale (DAS)": "失智症态度量表",
  "Full Name": "姓名", "Age": "年龄", "Gender": "性别", "Education Level": "教育程度",
  "Employment Status": "就业状况", "Marital Status": "婚姻状况", "Self-Rated Health": "自评健康状况",
  "Relationship to Care Recipient": "与被护理者的关系", "Other detail": "其他情况说明",
  "Duration of Caregiving": "已照护多长时间", "Hours of Care Per Week": "每周照护时长",
  "Distance from Care Recipient": "与被护理者的居住距离", "Care Recipient Age": "被护理者年龄",
  "Care Recipient Gender": "被护理者性别", "Type of Dementia": "失智症类型",
  "Years Since Diagnosis": "确诊至今的年数", "Dementia Stage (Clinical Dementia Rating)": "失智症阶段",
  "Care Recipient Education Level": "被护理者教育程度", "Eating": "进食", "Bathing": "洗澡",
  "Dressing": "穿衣", "Toileting": "如厕", "Moving around": "行走和移动", "Managing medications": "管理用药",
  "Handling finances": "处理财务", "Shopping": "购物", "Preparing meals": "准备餐食", "Housework": "家务",
  "Relationship to Primary Caregiver": "与主要护理者的关系", "Contact Frequency": "联系频率",
  "When did it happen?": "这件事什么时候发生？", "Time of the event": "发生时间", "Other time": "其他时间",
  "Activity Category": "照护活动类型", "Other": "其他", "Event Stress Rating": "这件事带来的感受",
  "Activity Description": "请描述这次照护活动", "Caregiver MBP-Related Distress": "这些表现给您带来的困扰程度",
  "Unfulfilled Care Needs (Optional)": "尚未满足的照护需要", "Ideas or Suggestions (Optional)": "您的想法或建议",
  "Time Spent (minutes)": "花费时间（分钟）", "Cheerful": "愉快", "Relaxed": "放松", "Enthusiastic": "有活力",
  "Satisfied": "满意", "Insecure": "不安", "Lonely": "孤独", "Anxious": "焦虑", "Irritated": "烦躁",
  "Down": "低落", "Desperate": "绝望", "Tensed": "紧张", "People involved (from your care network)": "有哪些人参与？",
  "Who was involved?": "有哪些人参与？",
  "Add the people who took part. Each person is saved once and can be picked again in later entries.": "请选择参与的人。每个人只需添加一次，以后的记录中可以再次选择。",
  "Who Else Do You Wish Could Help": "您还希望谁能来帮忙？", "Challenges in Reaching People You Wish Could Help": "联系这些人时遇到了什么困难？",
  "Challenges in Undertaking This Task": "完成这项照护任务有多困难？", "Challenge Types": "遇到的困难类型",
  "Challenges Faced (Description)": "请描述遇到的困难", "Resources Currently Using & Challenges": "目前使用的资源及其问题",
  "Resources You Wish Existed or Improved": "您希望增加或改进哪些资源？", "What else happened today that you did not log?": "今天还有哪些事情没有记录？",
  "Looking back at today as a whole, how would you rate your overall caregiving burden today?": "回顾今天，您觉得整体照护负担有多重？",
  "Male": "男", "Female": "女", "Elementary": "小学", "Middle School": "初中", "High School": "高中",
  "Associate": "大专", "Bachelor": "本科", "Master": "硕士", "Doctorate": "博士", "Employed full-time": "全职工作",
  "Employed part-time": "兼职工作", "Self-employed": "个体经营", "Unemployed": "未就业", "Retired": "退休", "Student": "学生",
  "Single": "未婚", "Married": "已婚", "Divorced": "离异", "Widowed": "丧偶", "Spouse/Partner": "配偶或伴侣",
  "Parent": "父母", "Child": "子女", "Sibling": "兄弟姐妹", "Other Relative": "其他亲属", "Friend/Neighbor": "朋友或邻居",
  "Professional Caregiver": "专业护理者", "Less than 6 months": "不足6个月", "6 months - 1 year": "6个月至1年",
  "1-2 years": "1至2年", "2-5 years": "2至5年", "More than 5 years": "5年以上", "Same home": "住在同一住所",
  "Same building": "住在同一栋楼", "Same neighborhood": "住在同一社区", "Same city": "住在同一城市",
  "Different city": "住在不同城市", "Different province/country": "住在不同省份或国家", "Alzheimer's Disease": "阿尔茨海默病",
  "Vascular Dementia": "血管性失智症", "Lewy Body Dementia": "路易体失智症", "Frontotemporal Dementia": "额颞叶失智症",
  "Mixed Dementia": "混合型失智症", "Unknown/Not Diagnosed": "未知或尚未确诊", "CDR 0 - Normal": "正常",
  "CDR 0.5 - Very Mild Dementia": "极轻度失智症", "CDR 1 - Mild Dementia": "轻度失智症",
  "CDR 2 - Moderate Dementia": "中度失智症", "CDR 3 - Severe Dementia": "重度失智症", "Independent": "可独立完成",
  "Needs help": "需要帮助", "Cannot do": "无法完成", "Yes": "是", "No": "否", "True": "正确", "False": "错误",
  "Less than 1 week": "不足1周", "More than 1 week but less than 1 month": "1周以上但不足1个月",
  "More than 1 month but less than 6 months": "1个月以上但不足6个月", "More than 6 months but less than 1 year": "6个月以上但不足1年",
  "More than 1 year but less than 2 years": "1年以上但不足2年", "More than 2 years": "2年以上", "Daily": "每天",
  "Several times a week": "每周数次", "Weekly": "每周一次", "Several times a month": "每月数次", "Monthly": "每月一次",
  "Less than monthly": "不足每月一次", "NOW: Record care activities happening now or just occurred": "现在：记录正在发生或刚刚发生的照护活动",
  "OTHER TIME: Supplement activities not recorded during the day": "其他时间：补充今天尚未记录的照护活动",
  "NOT TIED TO SPECIFIC TIME: Record challenges, needs, or ideas not tied to specific events": "不对应具体时间：记录与某件事无关的困难、需要或想法",
  "Clinical: medication, medical tasks": "医疗照护：用药和医疗相关任务", "Functional: feeding, bathing, dressing, grooming, toileting, ambulation": "日常生活照护：进食、洗澡、穿衣、梳洗、如厕和移动",
  "Cognitive: orientation, conversation, answering questions": "认知支持：辨认方向、交谈和回答问题", "Decision: medical decisions, financial decisions, non-medical decisions": "协助决策：医疗、财务及其他决定",
  "Housekeeping: preparing meals, cleaning, shopping": "家务：做饭、清洁和购物", "Info Management: coordinating care, communicating with care team, managing finances": "信息管理：协调照护、沟通和管理财务",
  "Logistics: scheduling appointments, reminding, ensuring delivery of necessities": "事务安排：预约、提醒和确保生活用品送达", "Transport: driving, arranging rides, accompanying to appointments": "出行：开车、安排接送或陪同就诊",
  "Companionship: social interaction, conversation, games, music, walks, outings": "陪伴：社交、交谈、游戏、音乐、散步或外出", "Caregiver Support: emotional support for other caregivers, respite": "护理者支持：情绪支持或临时替班",
  "Vigilance: supervision, safety monitoring, preventing wandering": "看护：监督安全和防止走失", "Pet Care: walking pets, feeding, vet visits": "宠物照料：遛宠、喂食或就医",
  "Skill Development: attending classes, reading, learning about dementia": "学习提升：上课、阅读或学习失智症知识", "Other (please describe)": "其他（请说明）",
  "Just Me": "只有我", "Handle symptoms": "应对症状", "Condition": "身体状况", "Updates": "信息更新", "Coordination": "协调",
  "Time": "时间", "Emotional": "情绪", "Physical": "体力", "Communication": "沟通", "Safety": "安全", "Privacy": "隐私",
  "1=Poor, 5=Excellent": "较差至极好", "1=Mild, 2=Moderate, 3=Severe": "轻度至重度",
  "Strongly disagree": "非常不同意", "Strongly agree": "非常同意", "Very Unpleasant": "非常不愉快", "Very Pleasant": "非常愉快",
  "Not at all": "完全没有", "Extremely": "非常严重", "No challenges": "没有困难", "Extreme challenges": "困难极大",
  "Very Light": "非常轻", "Very Heavy": "非常重",
  "Memory problems (e.g., repeating things, losing things, not completing a task, not remembering events or persons, concentration difficulties) (Yes/No": "是否出现记忆问题，例如重复说话、丢东西、无法完成任务、忘记事情或人物、难以集中注意？",
  "Behavior problems (e.g., breaking things on purpose, verbal aggression, threats to harm others, night wandering, opposition or provocation) (Yes/No": "是否出现行为问题，例如故意破坏物品、言语攻击、威胁伤害他人、夜间游走、反抗或挑衅？",
  "Depressive symptoms (e.g., sadness, hopelessness, threats of self-harm, speaking of dying, suffering from loneliness, uselessness or worthlessness) (Yes/No": "是否出现抑郁表现，例如悲伤、绝望、威胁自伤、谈及死亡、感到孤独、无用或没有价值？",
  "\"Today I felt stressed due to my care responsibilities\"": "今天我因照护责任而感到压力。",
  "\"Today I felt that the situation with my care recipient did not allow me as much privacy as I would have liked\"": "今天，被护理者的情况使我没有获得希望拥有的私人空间。",
  "\"Today I felt strained in the interactions with my care recipient\"": "今天，我在与被护理者互动时感到紧张和吃力。",
  "Delusions present: Does the patient believe that others are stealing from him or her, or planning to harm him or her in some way?": "被护理者是否认为有人偷自己的东西，或正在设法伤害自己？",
  "Hallucinations present: Does the patient act as if he or she hears voices, or talk to people who are not there?": "被护理者是否表现得像听到了声音，或与并不存在的人交谈？",
  "Agitation / Aggression present: Is the patient resistant to help from others, or hard to handle?": "被护理者是否抗拒他人帮助，或让人难以应对？",
  "Depression / Dysphoria present: Does the patient act as if he or she is sad or in low spirits, or cry?": "被护理者是否表现得悲伤、情绪低落或哭泣？",
  "Anxiety present: Does the patient become upset when separated from you, or show signs of nervousness such as shortness of breath, sighing or feeling unable to relax?": "与您分开时，被护理者是否会不安，或出现气短、叹气、无法放松等紧张表现？",
  "Elation / Euphoria present: Does the patient appear to feel too good or act excessively happy?": "被护理者是否显得情绪过于高涨或异常开心？",
  "Apathy / Indifference present: Does the patient seem less interested in his or her usual activities, or in the activities and plans of others?": "被护理者是否对平时的活动，或他人的活动和计划变得不感兴趣？",
  "Disinhibition present: Does the patient act impulsively, for example talking to strangers as if he or she knows them, or saying things that may hurt people's feelings?": "被护理者是否表现冲动，例如把陌生人当作熟人交谈，或说出可能伤害他人感受的话？",
  "Irritability / Lability present: Is the patient impatient and cranky, or does he or she have difficulty coping with delays or waiting for planned activities?": "被护理者是否缺乏耐心、脾气急躁，或难以忍受延迟和等待？",
  "Motor disturbance present: Does the patient engage in repetitive activities such as pacing around the house, handling buttons, wrapping string or doing other things repeatedly?": "被护理者是否反复做某些动作，例如在屋内来回走动、摆弄纽扣、缠绕绳线或重复其他行为？",
  "Nighttime behaviours present: Does the patient wake you up at night, rise too early in the morning, or take excessive naps during the day?": "被护理者是否会在夜间叫醒您、清晨过早起床，或白天睡得过多？",
  "Appetite / Eating present: Has the patient lost or gained weight, or had a change in the food he or she likes?": "被护理者的体重是否下降或增加，或对食物的喜好发生变化？",
  "\"I feel my care recipient asks for more help than he or she needs.\"": "我觉得被护理者要求的帮助超过了实际需要。",
  "\"I feel I do not have enough time for myself because of the time I spend with my care recipient.\"": "因为照护被护理者，我觉得没有足够的时间留给自己。",
  "\"I feel stressed between caring for my care recipient and meeting other responsibilities.\"": "在照护被护理者和承担其他责任之间，我感到压力。",
  "\"I feel embarrassed by my care recipient's behaviour.\"": "被护理者的行为有时让我感到尴尬。",
  "\"I feel angry when I am with my care recipient.\"": "与被护理者相处时，我有时会生气。",
  "\"I feel my care recipient's present situation does not allow me as much privacy as I would like.\"": "我觉得被护理者目前的情况使我没有足够的私人空间。",
  "\"I feel strained in the interactions with my care recipient.\"": "与被护理者互动时，我感到紧张和吃力。",
  "Significant Other: \"There is a special person who is around when I am in need.\"": "当我需要帮助时，有一位重要的人会陪在我身边。",
  "Significant Other: \"There is a special person with whom I can share my joys and sorrows.\"": "我有一位重要的人，可以与其分享快乐和忧愁。",
  "Family: \"My family really tries to help me.\"": "我的家人确实尽力帮助我。",
  "Family: \"I get the emotional help and support I need from my family.\"": "我能从家人那里得到所需的情感帮助和支持。",
  "Significant Other: \"I have a special person who is a real source of comfort to me.\"": "我有一位重要的人，能真正带给我安慰。",
  "Friends: \"My friends really try to help me.\"": "我的朋友确实尽力帮助我。",
  "Friends: \"I can count on my friends when things go wrong.\"": "遇到困难时，我可以依靠朋友。",
  "Family: \"I can talk about my problems with my family.\"": "我可以和家人谈论自己的问题。",
  "Friends: \"I have friends with whom I can share my joys and sorrows.\"": "我有可以分享快乐和忧愁的朋友。",
  "Significant Other: \"There is a special person in my life who cares about my feelings.\"": "我的生活中有一位重要的人关心我的感受。",
  "Family: \"My family is willing to help me make decisions.\"": "我的家人愿意帮助我作决定。",
  "Friends: \"I can talk about my problems with my friends.\"": "我可以和朋友谈论自己的问题。",
  "for your care recipient given the current situation?\"": "按照目前的情况，您认为自己还能继续照护被护理者多久？",
};

const SYMPTOMS: Record<string, string> = {
  "Delusions": "妄想", "Hallucinations": "幻觉", "Agitation / Aggression": "激越或攻击行为",
  "Depression / Dysphoria": "抑郁或心境不佳", "Anxiety": "焦虑", "Elation / Euphoria": "情绪高涨",
  "Apathy / Indifference": "淡漠", "Disinhibition": "行为失控", "Irritability / Lability": "易怒或情绪不稳",
  "Motor disturbance": "异常运动行为", "Nighttime behaviours": "夜间行为", "Appetite / Eating": "食欲或进食变化",
};

const KNOWLEDGE_ZH = [
  "阿尔茨海默病患者特别容易出现抑郁。", "科学研究已经证明，脑力锻炼可以预防阿尔茨海默病。",
  "阿尔茨海默病症状出现后，平均预期寿命为6至12年。", "当阿尔茨海默病患者出现激越时，医学检查可能发现引起激越的其他健康问题。",
  "简单的书面提醒对阿尔茨海默病患者最有帮助。", "病情尚未严重的阿尔茨海默病患者可以从针对抑郁和焦虑的心理治疗中受益。",
  "如果阿尔茨海默病患者在下午晚些时候或傍晚变得警觉和激越，可能正在经历日落综合征。", "当阿尔茨海默病患者开始难以照顾自己时，护理者应立即完全接手。",
  "如果记忆困难和思维混乱突然出现，很可能是阿尔茨海默病引起的。", "大多数阿尔茨海默病患者住在护理机构。",
  "营养不良会使阿尔茨海默病症状加重。", "早期阿尔茨海默病患者通常适合接受行为治疗。",
  "患上阿尔茨海默病后，人就不再有能力对自己的照护作出知情决定。", "阿尔茨海默病患者最终需要全天候看护。",
  "高胆固醇可能增加患阿尔茨海默病的风险。", "手或手臂震颤是阿尔茨海默病患者的常见症状。",
  "重度抑郁症状可能被误认为阿尔茨海默病症状。", "阿尔茨海默病是失智症的一种。",
  "难以管理钱财或支付账单是常见的早期症状。", "阿尔茨海默病可能使人相信别人偷了自己的东西。",
  "阿尔茨海默病患者使用提醒便签是一种依赖，可能导致能力下降。", "目前已有可预防阿尔茨海默病的处方药。",
  "高血压可能增加患阿尔茨海默病的风险。", "遗传因素只能解释阿尔茨海默病发生的部分原因。",
  "只要一直有同伴陪同，阿尔茨海默病患者开车就是安全的。", "阿尔茨海默病目前无法治愈。",
  "多数阿尔茨海默病患者对近期事情的记忆比过去发生的事情更好。", "少数情况下，阿尔茨海默病患者能够康复。",
  "阿尔茨海默病患者特别容易跌倒或发生其他意外。", "行走困难在阿尔茨海默病晚期患者中很常见。",
];

const ATTITUDE_ZH = [
  "与失智症患者一起工作很有意义。", "我害怕失智症患者。", "失智症患者可以富有创造力。", "与失智症患者相处时我有信心。",
  "因为失智症患者可能出现的行为，我会害怕他们。", "每位失智症患者都有不同的需要。", "我不太了解失智症。", "与失智症患者相处时我感到放松。",
  "失智症患者喜欢身边有熟悉的物品。", "与失智症患者相处让我感到不自在。", "了解失智症患者过去的经历很重要。", "与失智症患者互动也可以令人愉快。",
  "因为不知道如何帮助失智症患者，我感到沮丧。", "我无法想象自己照护失智症患者。", "我钦佩失智症患者应对生活的能力。", "我们现在可以做很多事情来改善失智症患者的生活。",
  "困难行为可能是失智症患者表达需要的一种方式。", "我可以自在地与失智症患者进行身体接触。", "我会避开情绪激动的失智症患者。", "我愿意进一步了解失智症患者。",
];

const KNOWLEDGE_EN = [
  "People with Alzheimer's disease are particularly prone to depression.", "It has been scientifically proven that mental exercise can prevent a person from getting Alzheimer's disease.",
  "After symptoms of Alzheimer's disease appear, the average life expectancy is six to twelve years.", "When a person with Alzheimer's disease becomes agitated, a medical examination may reveal other health problems that caused the agitation.",
  "People with Alzheimer's disease do best with simple written reminders.", "People whose Alzheimer's disease is not yet severe can benefit from psychotherapy for depression and anxiety.",
  "If a person with Alzheimer's disease becomes alert and agitated in the late afternoon and early evening, that person may be experiencing 'sundowning'.", "When people with Alzheimer's disease begin to have difficulty taking care of themselves, caregivers should take over right away.",
  "If trouble with memory and confused thinking appears suddenly, it is likely due to Alzheimer's disease.", "Most people with Alzheimer's disease live in nursing homes.", "Poor nutrition can make the symptoms of Alzheimer's disease worse.",
  "People in the early stages of Alzheimer's disease are usually good candidates for behavioural therapies.", "Once people have Alzheimer's disease, they are no longer capable of making informed decisions about their own care.",
  "Eventually, a person with Alzheimer's disease will need 24-hour supervision.", "Having high cholesterol may increase a person's risk of developing Alzheimer's disease.",
  "Tremor or shaking of the hands or arms is a common symptom in people with Alzheimer's disease.", "Symptoms of severe depression can be mistaken for symptoms of Alzheimer's disease.", "Alzheimer's disease is one type of dementia.",
  "Trouble handling money or paying bills is a common early symptom of Alzheimer's disease.", "One symptom that can occur with Alzheimer's disease is believing that other people are stealing one's things.",
  "When a person has Alzheimer's disease, using reminder notes is a crutch that can contribute to decline.", "Prescription drugs that prevent Alzheimer's disease are available.",
  "Having high blood pressure may increase a person's risk of developing Alzheimer's disease.", "Genes can only partially account for the development of Alzheimer's disease.",
  "It is safe for people with Alzheimer's disease to drive, as long as they have a companion in the car at all times.", "Alzheimer's disease cannot be cured.",
  "Most people with Alzheimer's disease remember recent events better than things that happened in the past.", "In rare cases, people have recovered from Alzheimer's disease.",
  "People with Alzheimer's disease are especially prone to falls and other accidents.", "Difficulty with the ability to walk is common in people who are in the later stages of Alzheimer's disease.",
];

const ATTITUDE_EN = [
  "It is rewarding to work with people who have dementia.", "I am afraid of people with dementia.", "People with dementia can be creative.", "I feel confident around people with dementia.",
  "I am afraid of people with dementia because of the way they might behave.", "Every person with dementia has different needs.", "I am not very familiar with dementia.", "I feel relaxed around people with dementia.",
  "People with dementia like having familiar things nearby.", "I feel uncomfortable being around people with dementia.", "It is important to know the past history of people with dementia.", "It is possible to enjoy interacting with people with dementia.",
  "I feel frustrated because I do not know how to help people with dementia.", "I cannot imagine taking care of someone with dementia.", "I admire the coping skills of people with dementia.", "We can do a lot now to improve the lives of people with dementia.",
  "Difficult behaviours may be a form of communication for people with dementia.", "I am comfortable touching people with dementia.", "I would avoid an agitated person with dementia.", "I would like to get to know people with dementia better.",
];

KNOWLEDGE_EN.forEach((text, index) => { ZH[text] = KNOWLEDGE_ZH[index]; });
ATTITUDE_EN.forEach((text, index) => { ZH[text] = ATTITUDE_ZH[index]; });

export function translateSurveyText(text: string | undefined, isChinese: boolean): string | undefined {
  if (!text || !isChinese) return text;
  const clean = text.replace(/^\d+(?:\.\d+)*\s+/, "").trim();
  if (ZH[clean]) return ZH[clean];
  const caseInsensitive = Object.entries(ZH).find(([english]) => english.toLocaleLowerCase() === clean.toLocaleLowerCase());
  if (caseInsensitive) return caseInsensitive[1];
  const symptom = Object.entries(SYMPTOMS).find(([english]) => clean.startsWith(english));
  if (symptom) {
    if (clean.includes(" severity")) return `${symptom[1]}的严重程度`;
    if (clean.includes(" caregiver distress")) return `${symptom[1]}给您带来的困扰程度`;
    if (clean.includes(" present:")) return `被护理者是否出现${symptom[1]}？`;
  }
  if (/^Options:/i.test(clean)) return "请选择最符合实际情况的一项。";
  if (/^(Format:|Items:)/i.test(clean)) return "请按题目要求作答。";
  if (clean.includes("Full 30-item scale")) return "请判断下列说法是否正确。";
  if (clean.includes("Full 20-item scale")) return "请选择您对下列说法的同意程度。";
  if (clean.includes("prefix \"ADL\"")) return "请根据被护理者目前完成这些日常活动的能力作答。";
  if (clean.includes("During this event")) return "在这件事中，对方的记忆或行为问题让您多么困扰？";
  if (clean.includes("Free text")) return "您可以输入或使用语音回答。";
  if (clean.includes("Pre-populated network")) return "请选择参与的人，也可以选择“只有我”。";
  if (clean.startsWith("people, and what does each person do?")) return "有哪些人参与？每个人做了什么？";
  return "请根据您的实际情况作答。";
}

export function localizeQuestionnaire(questionnaire: Questionnaire, isChinese: boolean): Questionnaire {
  if (!isChinese) {
    return {
      ...questionnaire,
      groups: questionnaire.groups.map((group) => ({ ...group, code: undefined, questions: group.questions.map((question) => ({ ...question, code: undefined })) })),
    };
  }
  return {
    ...questionnaire,
    title: translateSurveyText(questionnaire.title, true) ?? questionnaire.title,
    intro: translateSurveyText(questionnaire.intro, true),
    groups: questionnaire.groups.map((group) => ({
      ...group,
      code: undefined,
      title: translateSurveyText(group.title, true) ?? "问卷",
      description: translateSurveyText(group.description, true),
      questions: group.questions.map((question): Question => ({
        ...question,
        code: undefined,
        text: translateSurveyText(question.text, true) ?? "请作答",
        help: translateSurveyText(question.help, true),
        options: question.options?.map((option) => ({ ...option, label: translateSurveyText(option.label, true) ?? option.label })),
        scale: question.scale ? {
          ...question.scale,
          minLabel: translateSurveyText(question.scale.minLabel, true) ?? question.scale.minLabel,
          maxLabel: translateSurveyText(question.scale.maxLabel, true) ?? question.scale.maxLabel,
          pointLabels: question.scale.pointLabels
            ? Object.fromEntries(Object.entries(question.scale.pointLabels).map(([key, value]) => [key, translateSurveyText(value, true) ?? value]))
            : undefined,
        } : undefined,
      })),
    })),
  };
}