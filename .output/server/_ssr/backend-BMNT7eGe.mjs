import "../_runtime.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { n as getCurrentUserIdNumber } from "./current-user-CV-pp6xq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/backend-BMNT7eGe.js
var KEY = {
	profile: "esm:profile",
	settings: "esm:settings",
	draft: (id) => `esm:draft:${id}`,
	records: "esm:records"
};
var DEFAULT_SETTINGS = {
	hourlyReminders: true,
	reminderStart: "08:00",
	reminderEnd: "22:00",
	quietPeriods: [],
	reducedMotion: false
};
function read(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
}
function write(key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {}
}
var getProfile = () => read(KEY.profile, null);
var getSettings = () => {
	const saved = read(KEY.settings, {});
	return {
		...DEFAULT_SETTINGS,
		...saved,
		quietPeriods: Array.isArray(saved.quietPeriods) ? saved.quietPeriods : []
	};
};
function saveSettings(settings) {
	write(KEY.settings, settings);
}
function saveProfile(profile) {
	write(KEY.profile, profile);
	window.dispatchEvent(new CustomEvent("esm-profile-changed", { detail: profile }));
}
function startProfile(role) {
	const existing = getProfile();
	const profile = existing ? {
		...existing,
		role
	} : {
		role,
		network: [],
		screeningDone: false,
		startedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	saveProfile(profile);
	return profile;
}
var currentAnswerKeys = (answers) => {
	const migrated = {};
	for (const [key, value] of Object.entries(answers)) {
		const currentKey = key.replace(/^c302_/, "c318_").replace(/^c303_/, "c319_").replace(/^c304_/, "c317_");
		migrated[currentKey] = value;
	}
	return migrated;
};
var getDraft = (id) => currentAnswerKeys(read(KEY.draft(id), {}));
var saveDraft = (id, answers) => write(KEY.draft(id), answers);
var clearDraft = (id) => {
	try {
		localStorage.removeItem(KEY.draft(id));
	} catch {}
};
var getRecords = () => read(KEY.records, []).map((record) => ({
	...record,
	answers: currentAnswerKeys(record.answers)
}));
function addRecord(kind, answers, slot, voice) {
	const record = {
		id: `${kind}_${Date.now()}`,
		kind,
		submittedAt: (/* @__PURE__ */ new Date()).toISOString(),
		slot,
		answers,
		voice,
		synced: false
	};
	write(KEY.records, [record, ...getRecords()]);
	return record;
}
/** Marks a record as accepted by the study backend. */
function markSynced(id, remoteId) {
	write(KEY.records, getRecords().map((r) => r.id === id ? {
		...r,
		synced: true,
		remoteId
	} : r));
}
function deleteRecord(id) {
	write(KEY.records, getRecords().filter((r) => r.id !== id));
}
var slotId = (date, hour) => `${localDay(date)}T${String(hour).padStart(2, "0")}`;
function todaySlots(now = /* @__PURE__ */ new Date()) {
	const counts = getRecords().filter((r) => r.kind === "hourly_log" && r.slot).reduce((all, record) => {
		const key = String(record.slot);
		all[key] = (all[key] ?? 0) + 1;
		return all;
	}, {});
	const slots = [];
	for (let hour = 0; hour <= 23; hour++) {
		const id = slotId(now, hour);
		const label = `${(hour + 11) % 12 + 1}:00 ${hour < 12 ? "AM" : "PM"}`;
		slots.push({
			hour,
			id,
			label,
			done: (counts[id] ?? 0) > 0,
			count: counts[id] ?? 0,
			due: hour === now.getHours(),
			future: hour > now.getHours()
		});
	}
	return slots;
}
function dailyLogDone(now = /* @__PURE__ */ new Date()) {
	const day = localDay(now);
	return getRecords().some((r) => r.kind === "daily_log" && localDay(new Date(r.submittedAt)) === day);
}
/** Calendar day in the participant's own time zone (not UTC). */
function localDay(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function yesterdayDailyLogDone(now = /* @__PURE__ */ new Date()) {
	const yesterday = new Date(now);
	yesterday.setDate(yesterday.getDate() - 1);
	return dailyLogDone(yesterday);
}
var minutesOf = (value) => {
	const [hour = 0, minute = 0] = value.split(":").map(Number);
	return hour * 60 + minute;
};
/** Device-only reminder eligibility. The 24-hour timeline itself remains available. */
function hourlyReminderActive(now = /* @__PURE__ */ new Date(), settings = getSettings()) {
	if (!settings.hourlyReminders) return false;
	const minute = now.getHours() * 60 + now.getMinutes();
	if (minute < minutesOf(settings.reminderStart) || minute > minutesOf(settings.reminderEnd)) return false;
	return !settings.quietPeriods.some((period) => {
		const start = minutesOf(period.start);
		const end = minutesOf(period.end);
		return start <= end ? minute >= start && minute <= end : minute >= start || minute <= end;
	});
}
/** Missed hourly slots earlier today, for the end-of-day supplement. */
function missedSlots(now = /* @__PURE__ */ new Date()) {
	return todaySlots(now).filter((s) => !s.done && !s.future);
}
/** Export every record as JSON for the research team. */
function exportJson() {
	return JSON.stringify({
		profile: getProfile(),
		records: getRecords()
	}, null, 2);
}
var isChineseLanguage = (language) => Boolean(language?.startsWith("zh"));
var uiText = (isChinese, english, chinese) => isChinese ? chinese : english;
var ZH = {
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
	"ACTIVITIES OF DAILY LIVING (ADL) ASSESSMENT": "日常生活活动能力评估",
	"INSTRUMENTAL ACTIVITIES OF DAILY LIVING (IADL) ASSESSMENT": "工具性日常生活活动能力评估",
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
	"Full Name": "姓名",
	"Age": "年龄",
	"Gender": "性别",
	"Education Level": "教育程度",
	"Employment Status": "就业状况",
	"Marital Status": "婚姻状况",
	"Self-Rated Health": "自评健康状况",
	"Relationship to Care Recipient": "与被护理者的关系",
	"Other detail": "其他情况说明",
	"Duration of Caregiving": "已照护多长时间",
	"Hours of Care Per Week": "每周照护时长",
	"If you provide round-the-clock or almost round-the-clock care, enter 24 × 7 = 168. If you only care during the day, or for a certain number of hours a day, enter an approximate daily number × 7.": "如果您是全天候看护，或基本全天看护，可以填写 24 小时 × 7 = 168。如果您只是白天照顾，或每天平均照顾若干小时，可以填写每天大概的小时数 × 7。",
	"Distance from Care Recipient": "与被护理者的居住距离",
	"Care Recipient Age": "被护理者年龄",
	"Care Recipient Gender": "被护理者性别",
	"Type of Dementia": "失智症类型",
	"Years Since Diagnosis": "确诊至今的年数",
	"Dementia Stage (Clinical Dementia Rating)": "失智症阶段",
	"Care Recipient Education Level": "被护理者教育程度",
	"Eating": "进食",
	"Bathing": "洗澡",
	"Dressing": "穿衣",
	"Toileting": "如厕",
	"Moving around": "行走和移动",
	"Managing medications": "管理用药",
	"Handling finances": "处理财务",
	"Shopping": "购物",
	"Preparing meals": "准备餐食",
	"Housework": "家务",
	"Relationship to Primary Caregiver": "与主要护理者的关系",
	"Contact Frequency": "联系频率",
	"When did it happen?": "这件事什么时候发生？",
	"Time of the event": "发生时间",
	"Other time": "其他时间",
	"Activity Category": "照护活动类型",
	"Other": "其他",
	"Event Stress Rating": "这件事带来的感受",
	"Activity Description": "请描述这次照护活动",
	"Caregiver MBP-Related Distress": "这些表现给您带来的困扰程度",
	"Unfulfilled Care Needs (Optional)": "尚未满足的照护需要",
	"Ideas or Suggestions (Optional)": "您的想法或建议",
	"Time Spent (minutes)": "花费时间（分钟）",
	"Cheerful": "愉快",
	"Relaxed": "放松",
	"Enthusiastic": "有活力",
	"Satisfied": "满意",
	"Insecure": "不安",
	"Lonely": "孤独",
	"Anxious": "焦虑",
	"Irritated": "烦躁",
	"Down": "低落",
	"Desperate": "绝望",
	"Tensed": "紧张",
	"People involved (from your care network)": "有哪些人参与？",
	"Who was involved?": "有哪些人参与？",
	"Add the people who took part. Each person is saved once and can be picked again in later entries.": "请选择参与的人。每个人只需添加一次，以后的记录中可以再次选择。",
	"Who Else Do You Wish Could Help": "您还希望谁能来帮忙？",
	"Challenges in Reaching People You Wish Could Help": "联系这些人时遇到了什么困难？",
	"Challenges in Undertaking This Task": "完成这项照护任务有多困难？",
	"Challenge Types": "遇到的困难类型",
	"Challenges Faced (Description)": "请描述遇到的困难",
	"Resources Currently Using & Challenges": "目前使用的资源及其问题",
	"Resources You Wish Existed or Improved": "您希望增加或改进哪些资源？",
	"What else happened today that you did not log?": "今天还有哪些事情没有记录？",
	"Looking back at today as a whole, how would you rate your overall caregiving burden today?": "回顾今天，您觉得整体照护负担有多重？",
	"Male": "男",
	"Female": "女",
	"Elementary": "小学",
	"Middle School": "初中",
	"High School": "高中",
	"Associate": "大专",
	"Bachelor": "本科",
	"Master": "硕士",
	"Doctorate": "博士",
	"Employed full-time": "全职工作",
	"Employed part-time": "兼职工作",
	"Self-employed": "个体经营",
	"Unemployed": "未就业",
	"Retired": "退休",
	"Student": "学生",
	"Single": "未婚",
	"Married": "已婚",
	"Divorced": "离异",
	"Widowed": "丧偶",
	"Spouse/Partner": "配偶或伴侣",
	"Parent": "父母",
	"Child": "子女",
	"Sibling": "兄弟姐妹",
	"Other Relative": "其他亲属",
	"Friend/Neighbor": "朋友或邻居",
	"Professional Caregiver": "专业护理者",
	"Less than 6 months": "不足6个月",
	"6 months - 1 year": "6个月至1年",
	"1-2 years": "1至2年",
	"2-5 years": "2至5年",
	"More than 5 years": "5年以上",
	"Same home": "住在同一住所",
	"Same building": "住在同一栋楼",
	"Same neighborhood": "住在同一社区",
	"Same city": "住在同一城市",
	"Different city": "住在不同城市",
	"Different province/country": "住在不同省份或国家",
	"Alzheimer's Disease": "阿尔茨海默病",
	"Vascular Dementia": "血管性失智症",
	"Lewy Body Dementia": "路易体失智症",
	"Frontotemporal Dementia": "额颞叶失智症",
	"Mixed Dementia": "混合型失智症",
	"Unknown/Not Diagnosed": "未知或尚未确诊",
	"CDR 0 - Normal": "正常",
	"CDR 0.5 - Very Mild Dementia": "极轻度失智症",
	"CDR 1 - Mild Dementia": "轻度失智症",
	"CDR 2 - Moderate Dementia": "中度失智症",
	"CDR 3 - Severe Dementia": "重度失智症",
	"Independent": "可独立完成",
	"Needs help": "需要帮助",
	"Cannot do": "无法完成",
	"Yes": "是",
	"No": "否",
	"True": "正确",
	"False": "错误",
	"Less than 1 week": "不足1周",
	"More than 1 week but less than 1 month": "1周以上但不足1个月",
	"More than 1 month but less than 6 months": "1个月以上但不足6个月",
	"More than 6 months but less than 1 year": "6个月以上但不足1年",
	"More than 1 year but less than 2 years": "1年以上但不足2年",
	"More than 2 years": "2年以上",
	"Daily": "每天",
	"Several times a week": "每周数次",
	"Weekly": "每周一次",
	"Several times a month": "每月数次",
	"Monthly": "每月一次",
	"Less than monthly": "不足每月一次",
	"NOW: Record care activities happening now or just occurred": "现在：记录正在发生或刚刚发生的照护活动",
	"OTHER TIME: Supplement activities not recorded during the day": "其他时间：补充今天尚未记录的照护活动",
	"NOT TIED TO SPECIFIC TIME: Record challenges, needs, or ideas not tied to specific events": "不对应具体时间：记录与某件事无关的困难、需要或想法",
	"Clinical: medication, medical tasks": "医疗照护：用药和医疗相关任务",
	"Functional: feeding, bathing, dressing, grooming, toileting, ambulation": "日常生活照护：进食、洗澡、穿衣、梳洗、如厕和移动",
	"Cognitive: orientation, conversation, answering questions": "认知支持：辨认方向、交谈和回答问题",
	"Decision: medical decisions, financial decisions, non-medical decisions": "协助决策：医疗、财务及其他决定",
	"Housekeeping: preparing meals, cleaning, shopping": "家务：做饭、清洁和购物",
	"Info Management: coordinating care, communicating with care team, managing finances": "信息管理：协调照护、沟通和管理财务",
	"Logistics: scheduling appointments, reminding, ensuring delivery of necessities": "事务安排：预约、提醒和确保生活用品送达",
	"Transport: driving, arranging rides, accompanying to appointments": "出行：开车、安排接送或陪同就诊",
	"Companionship: social interaction, conversation, games, music, walks, outings": "陪伴：社交、交谈、游戏、音乐、散步或外出",
	"Caregiver Support: emotional support for other caregivers, respite": "护理者支持：情绪支持或临时替班",
	"Vigilance: supervision, safety monitoring, preventing wandering": "看护：监督安全和防止走失",
	"Pet Care: walking pets, feeding, vet visits": "宠物照料：遛宠、喂食或就医",
	"Skill Development: attending classes, reading, learning about dementia": "学习提升：上课、阅读或学习失智症知识",
	"Other (please describe)": "其他（请说明）",
	"Just Me": "只有我",
	"Handle symptoms": "应对症状",
	"Condition": "身体状况",
	"Updates": "信息更新",
	"Coordination": "协调",
	"Time": "时间",
	"Emotional": "情绪",
	"Physical": "体力",
	"Communication": "沟通",
	"Safety": "安全",
	"Privacy": "隐私",
	"1=Poor, 5=Excellent": "较差至极好",
	"1=Mild, 2=Moderate, 3=Severe": "轻度至重度",
	"Strongly disagree": "非常不同意",
	"Strongly agree": "非常同意",
	"Very Unpleasant": "非常不愉快",
	"Very Pleasant": "非常愉快",
	"Not at all": "完全没有",
	"Extremely": "非常严重",
	"No challenges": "没有困难",
	"Extreme challenges": "困难极大",
	"Very Light": "非常轻",
	"Very Heavy": "非常重",
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
	"How much longer do you think you can continue providing care for your care recipient given the current situation?": "按照目前的情况，您认为自己还能继续照护被护理者多久？",
	"0=Not distressing at all, 5=Extreme": "完全没有困扰至极度困扰"
};
var SYMPTOMS = {
	"Delusions": "妄想",
	"Hallucinations": "幻觉",
	"Agitation / Aggression": "激越或攻击行为",
	"Depression / Dysphoria": "抑郁或心境不佳",
	"Anxiety": "焦虑",
	"Elation / Euphoria": "情绪高涨",
	"Apathy / Indifference": "淡漠",
	"Disinhibition": "行为失控",
	"Irritability / Lability": "易怒或情绪不稳",
	"Motor disturbance": "异常运动行为",
	"Nighttime behaviours": "夜间行为",
	"Appetite / Eating": "食欲或进食变化"
};
var KNOWLEDGE_ZH = [
	"阿尔茨海默病患者特别容易出现抑郁。",
	"科学研究已经证明，脑力锻炼可以预防阿尔茨海默病。",
	"阿尔茨海默病症状出现后，平均预期寿命为6至12年。",
	"当阿尔茨海默病患者出现激越时，医学检查可能发现引起激越的其他健康问题。",
	"简单的书面提醒对阿尔茨海默病患者最有帮助。",
	"病情尚未严重的阿尔茨海默病患者可以从针对抑郁和焦虑的心理治疗中受益。",
	"如果阿尔茨海默病患者在下午晚些时候或傍晚变得警觉和激越，可能正在经历日落综合征。",
	"当阿尔茨海默病患者开始难以照顾自己时，护理者应立即完全接手。",
	"如果记忆困难和思维混乱突然出现，很可能是阿尔茨海默病引起的。",
	"大多数阿尔茨海默病患者住在护理机构。",
	"营养不良会使阿尔茨海默病症状加重。",
	"早期阿尔茨海默病患者通常适合接受行为治疗。",
	"患上阿尔茨海默病后，人就不再有能力对自己的照护作出知情决定。",
	"阿尔茨海默病患者最终需要全天候看护。",
	"高胆固醇可能增加患阿尔茨海默病的风险。",
	"手或手臂震颤是阿尔茨海默病患者的常见症状。",
	"重度抑郁症状可能被误认为阿尔茨海默病症状。",
	"阿尔茨海默病是失智症的一种。",
	"难以管理钱财或支付账单是常见的早期症状。",
	"阿尔茨海默病可能使人相信别人偷了自己的东西。",
	"阿尔茨海默病患者使用提醒便签是一种依赖，可能导致能力下降。",
	"目前已有可预防阿尔茨海默病的处方药。",
	"高血压可能增加患阿尔茨海默病的风险。",
	"遗传因素只能解释阿尔茨海默病发生的部分原因。",
	"只要一直有同伴陪同，阿尔茨海默病患者开车就是安全的。",
	"阿尔茨海默病目前无法治愈。",
	"多数阿尔茨海默病患者对近期事情的记忆比过去发生的事情更好。",
	"少数情况下，阿尔茨海默病患者能够康复。",
	"阿尔茨海默病患者特别容易跌倒或发生其他意外。",
	"行走困难在阿尔茨海默病晚期患者中很常见。"
];
var ATTITUDE_ZH = [
	"与失智症患者一起工作很有意义。",
	"我害怕失智症患者。",
	"失智症患者可以富有创造力。",
	"与失智症患者相处时我有信心。",
	"因为失智症患者可能出现的行为，我会害怕他们。",
	"每位失智症患者都有不同的需要。",
	"我不太了解失智症。",
	"与失智症患者相处时我感到放松。",
	"失智症患者喜欢身边有熟悉的物品。",
	"与失智症患者相处让我感到不自在。",
	"了解失智症患者过去的经历很重要。",
	"与失智症患者互动也可以令人愉快。",
	"因为不知道如何帮助失智症患者，我感到沮丧。",
	"我无法想象自己照护失智症患者。",
	"我钦佩失智症患者应对生活的能力。",
	"我们现在可以做很多事情来改善失智症患者的生活。",
	"困难行为可能是失智症患者表达需要的一种方式。",
	"我可以自在地与失智症患者进行身体接触。",
	"我会避开情绪激动的失智症患者。",
	"我愿意进一步了解失智症患者。"
];
var KNOWLEDGE_EN = [
	"People with Alzheimer's disease are particularly prone to depression.",
	"It has been scientifically proven that mental exercise can prevent a person from getting Alzheimer's disease.",
	"After symptoms of Alzheimer's disease appear, the average life expectancy is six to twelve years.",
	"When a person with Alzheimer's disease becomes agitated, a medical examination may reveal other health problems that caused the agitation.",
	"People with Alzheimer's disease do best with simple written reminders.",
	"People whose Alzheimer's disease is not yet severe can benefit from psychotherapy for depression and anxiety.",
	"If a person with Alzheimer's disease becomes alert and agitated in the late afternoon and early evening, that person may be experiencing 'sundowning'.",
	"When people with Alzheimer's disease begin to have difficulty taking care of themselves, caregivers should take over right away.",
	"If trouble with memory and confused thinking appears suddenly, it is likely due to Alzheimer's disease.",
	"Most people with Alzheimer's disease live in nursing homes.",
	"Poor nutrition can make the symptoms of Alzheimer's disease worse.",
	"People in the early stages of Alzheimer's disease are usually good candidates for behavioural therapies.",
	"Once people have Alzheimer's disease, they are no longer capable of making informed decisions about their own care.",
	"Eventually, a person with Alzheimer's disease will need 24-hour supervision.",
	"Having high cholesterol may increase a person's risk of developing Alzheimer's disease.",
	"Tremor or shaking of the hands or arms is a common symptom in people with Alzheimer's disease.",
	"Symptoms of severe depression can be mistaken for symptoms of Alzheimer's disease.",
	"Alzheimer's disease is one type of dementia.",
	"Trouble handling money or paying bills is a common early symptom of Alzheimer's disease.",
	"One symptom that can occur with Alzheimer's disease is believing that other people are stealing one's things.",
	"When a person has Alzheimer's disease, using reminder notes is a crutch that can contribute to decline.",
	"Prescription drugs that prevent Alzheimer's disease are available.",
	"Having high blood pressure may increase a person's risk of developing Alzheimer's disease.",
	"Genes can only partially account for the development of Alzheimer's disease.",
	"It is safe for people with Alzheimer's disease to drive, as long as they have a companion in the car at all times.",
	"Alzheimer's disease cannot be cured.",
	"Most people with Alzheimer's disease remember recent events better than things that happened in the past.",
	"In rare cases, people have recovered from Alzheimer's disease.",
	"People with Alzheimer's disease are especially prone to falls and other accidents.",
	"Difficulty with the ability to walk is common in people who are in the later stages of Alzheimer's disease."
];
var ATTITUDE_EN = [
	"It is rewarding to work with people who have dementia.",
	"I am afraid of people with dementia.",
	"People with dementia can be creative.",
	"I feel confident around people with dementia.",
	"I am afraid of people with dementia because of the way they might behave.",
	"Every person with dementia has different needs.",
	"I am not very familiar with dementia.",
	"I feel relaxed around people with dementia.",
	"People with dementia like having familiar things nearby.",
	"I feel uncomfortable being around people with dementia.",
	"It is important to know the past history of people with dementia.",
	"It is possible to enjoy interacting with people with dementia.",
	"I feel frustrated because I do not know how to help people with dementia.",
	"I cannot imagine taking care of someone with dementia.",
	"I admire the coping skills of people with dementia.",
	"We can do a lot now to improve the lives of people with dementia.",
	"Difficult behaviours may be a form of communication for people with dementia.",
	"I am comfortable touching people with dementia.",
	"I would avoid an agitated person with dementia.",
	"I would like to get to know people with dementia better."
];
KNOWLEDGE_EN.forEach((text, index) => {
	ZH[text] = KNOWLEDGE_ZH[index];
});
ATTITUDE_EN.forEach((text, index) => {
	ZH[text] = ATTITUDE_ZH[index];
});
function translateSurveyText(text, isChinese) {
	if (!text || !isChinese) return text;
	if (ZH[text.trim()]) return ZH[text.trim()];
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
function localizeQuestionnaire(questionnaire, isChinese) {
	if (!isChinese) return {
		...questionnaire,
		groups: questionnaire.groups.map((group) => ({
			...group,
			code: void 0,
			questions: group.questions.map((question) => ({
				...question,
				code: void 0
			}))
		}))
	};
	return {
		...questionnaire,
		title: translateSurveyText(questionnaire.title, true) ?? questionnaire.title,
		intro: translateSurveyText(questionnaire.intro, true),
		groups: questionnaire.groups.map((group) => ({
			...group,
			code: void 0,
			title: translateSurveyText(group.title, true) ?? "问卷",
			description: translateSurveyText(group.description, true),
			questions: group.questions.map((question) => ({
				...question,
				code: void 0,
				text: translateSurveyText(question.text, true) ?? "请作答",
				help: translateSurveyText(question.help, true),
				options: question.options?.map((option) => ({
					...option,
					label: translateSurveyText(option.label, true) ?? option.label
				})),
				scale: question.scale ? {
					...question.scale,
					minLabel: translateSurveyText(question.scale.minLabel, true) ?? question.scale.minLabel,
					maxLabel: translateSurveyText(question.scale.maxLabel, true) ?? question.scale.maxLabel,
					pointLabels: question.scale.pointLabels ? Object.fromEntries(Object.entries(question.scale.pointLabels).map(([key, value]) => [key, translateSurveyText(value, true) ?? value])) : void 0
				} : void 0
			}))
		}))
	};
}
var ESM_SPEC = [
	{
		"id": "c318_a01",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a01",
		"code": "1.1.1",
		"group": "1.1 CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Full Name",
		"type": "text"
	},
	{
		"id": "c318_a02",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a02",
		"code": "1.1.2",
		"group": "1.1 CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Age",
		"type": "number"
	},
	{
		"id": "c318_a03",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a03",
		"code": "1.1.3",
		"group": "1.1 CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Gender",
		"type": "single",
		"help": "Options: Male, Female",
		"options": [{
			"value": "b01",
			"label": "Male"
		}, {
			"value": "b02",
			"label": "Female"
		}]
	},
	{
		"id": "c318_a04",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a04",
		"code": "1.1.4",
		"group": "1.1 CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Education Level",
		"type": "single",
		"help": "Options: Elementary, Middle School, High School, Associate, Bachelor, Master, Doctorate",
		"options": [
			{
				"value": "b01",
				"label": "Elementary"
			},
			{
				"value": "b02",
				"label": "Middle School"
			},
			{
				"value": "b03",
				"label": "High School"
			},
			{
				"value": "b04",
				"label": "Associate"
			},
			{
				"value": "b05",
				"label": "Bachelor"
			},
			{
				"value": "b06",
				"label": "Master"
			},
			{
				"value": "b07",
				"label": "Doctorate"
			}
		]
	},
	{
		"id": "c318_a05",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a05",
		"code": "1.1.5",
		"group": "1.1 CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Employment Status",
		"type": "single",
		"help": "Options: Employed full-time, Employed part-time, Self-employed, Unemployed, Retired, Student",
		"options": [
			{
				"value": "b01",
				"label": "Employed full-time"
			},
			{
				"value": "b02",
				"label": "Employed part-time"
			},
			{
				"value": "b03",
				"label": "Self-employed"
			},
			{
				"value": "b04",
				"label": "Unemployed"
			},
			{
				"value": "b05",
				"label": "Retired"
			},
			{
				"value": "b06",
				"label": "Student"
			}
		]
	},
	{
		"id": "c318_a06",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a06",
		"code": "1.1.6",
		"group": "1.1 CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Marital Status",
		"type": "single",
		"help": "Options: Single, Married, Divorced, Widowed",
		"options": [
			{
				"value": "b01",
				"label": "Single"
			},
			{
				"value": "b02",
				"label": "Married"
			},
			{
				"value": "b03",
				"label": "Divorced"
			},
			{
				"value": "b04",
				"label": "Widowed"
			}
		]
	},
	{
		"id": "c318_a07",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a07",
		"code": "1.1.7",
		"group": "1.1 CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Self-Rated Health",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 5,
			"labels": "1=Poor, 5=Excellent"
		}
	},
	{
		"id": "c318_a08",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a08",
		"code": "1.1.8",
		"group": "1.1 CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Relationship to Care Recipient",
		"type": "single",
		"help": "Options: Spouse/Partner, Parent, Child, Sibling, Other Relative, Friend/Neighbor, Professional Caregiver, Other",
		"options": [
			{
				"value": "b01",
				"label": "Spouse/Partner"
			},
			{
				"value": "b02",
				"label": "Parent"
			},
			{
				"value": "b03",
				"label": "Child"
			},
			{
				"value": "b04",
				"label": "Sibling"
			},
			{
				"value": "b05",
				"label": "Other Relative"
			},
			{
				"value": "b06",
				"label": "Friend/Neighbor"
			},
			{
				"value": "b07",
				"label": "Professional Caregiver"
			},
			{
				"value": "b08",
				"label": "Other"
			}
		]
	},
	{
		"id": "c318_a081",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a081",
		"code": "1.1.8",
		"group": "1.1 CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Other detail",
		"type": "text",
		"otherFor": "c318_a08"
	},
	{
		"id": "c318_a09",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a09",
		"code": "1.1.9",
		"group": "1.1 CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Duration of Caregiving",
		"type": "single",
		"help": "Options: Less than 6 months, 6 months - 1 year, 1-2 years, 2-5 years",
		"options": [
			{
				"value": "b01",
				"label": "Less than 6 months"
			},
			{
				"value": "b02",
				"label": "6 months - 1 year"
			},
			{
				"value": "b03",
				"label": "1-2 years"
			},
			{
				"value": "b04",
				"label": "2-5 years"
			},
			{
				"value": "b05",
				"label": "More than 5 years"
			}
		]
	},
	{
		"id": "c318_a10",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a10",
		"code": "1.1.10",
		"group": "1.1 CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Hours of Care Per Week",
		"type": "number"
	},
	{
		"id": "c318_a11",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a11",
		"code": "1.1.11",
		"group": "1.1 CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Distance from Care Recipient",
		"type": "single",
		"help": "Options: Same home, Same building, Same neighborhood, Same city, Different city, Different province/country",
		"options": [
			{
				"value": "b01",
				"label": "Same home"
			},
			{
				"value": "b02",
				"label": "Same building"
			},
			{
				"value": "b03",
				"label": "Same neighborhood"
			},
			{
				"value": "b04",
				"label": "Same city"
			},
			{
				"value": "b05",
				"label": "Different city"
			},
			{
				"value": "b06",
				"label": "Different province/country"
			}
		]
	},
	{
		"id": "c318_a12",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a12",
		"code": "1.2.1",
		"group": "1.2 CARE RECIPIENT INFORMATION",
		"block": "",
		"label": "Care Recipient Age",
		"type": "number",
		"help": "Format: Numeric input"
	},
	{
		"id": "c318_a13",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a13",
		"code": "1.2.2",
		"group": "1.2 CARE RECIPIENT INFORMATION",
		"block": "",
		"label": "Care Recipient Gender",
		"type": "single",
		"help": "Options: Male, Female",
		"options": [{
			"value": "b01",
			"label": "Male"
		}, {
			"value": "b02",
			"label": "Female"
		}]
	},
	{
		"id": "c318_a14",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a14",
		"code": "1.2.3",
		"group": "1.2 CARE RECIPIENT INFORMATION",
		"block": "",
		"label": "Type of Dementia",
		"type": "single",
		"help": "Options: Alzheimer's Disease, Vascular Dementia, Lewy Body Dementia, Frontotemporal Dementia, Mixed Dementia, Unknown/Not Diagnosed, Other",
		"options": [
			{
				"value": "b01",
				"label": "Alzheimer's Disease"
			},
			{
				"value": "b02",
				"label": "Vascular Dementia"
			},
			{
				"value": "b03",
				"label": "Lewy Body Dementia"
			},
			{
				"value": "b04",
				"label": "Frontotemporal Dementia"
			},
			{
				"value": "b05",
				"label": "Mixed Dementia"
			},
			{
				"value": "b06",
				"label": "Unknown/Not Diagnosed"
			},
			{
				"value": "b07",
				"label": "Other"
			}
		]
	},
	{
		"id": "c318_a141",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a141",
		"code": "1.2.3",
		"group": "1.2 CARE RECIPIENT INFORMATION",
		"block": "",
		"label": "Other detail",
		"type": "text",
		"otherFor": "c318_a14"
	},
	{
		"id": "c318_a15",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a15",
		"code": "1.2.4",
		"group": "1.2 CARE RECIPIENT INFORMATION",
		"block": "",
		"label": "Years Since Diagnosis",
		"type": "number",
		"help": "Options: Numeric input"
	},
	{
		"id": "c318_a16",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a16",
		"code": "1.2.5",
		"group": "1.2 CARE RECIPIENT INFORMATION",
		"block": "",
		"label": "Dementia Stage (Clinical Dementia Rating)",
		"type": "single",
		"help": "Options: CDR 0 - Normal, CDR 0.5 - Very Mild Dementia, CDR 1 - Mild Dementia",
		"options": [
			{
				"value": "b01",
				"label": "CDR 0 - Normal"
			},
			{
				"value": "b02",
				"label": "CDR 0.5 - Very Mild Dementia"
			},
			{
				"value": "b03",
				"label": "CDR 1 - Mild Dementia"
			},
			{
				"value": "b04",
				"label": "CDR 2 - Moderate Dementia"
			},
			{
				"value": "b05",
				"label": "CDR 3 - Severe Dementia"
			}
		]
	},
	{
		"id": "c318_a17",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a17",
		"code": "1.2.6",
		"group": "1.2 CARE RECIPIENT INFORMATION",
		"block": "",
		"label": "Care Recipient Education Level",
		"type": "single",
		"help": "Options: Elementary, Middle School, High School, Associate, Bachelor, Master, Doctorate",
		"options": [
			{
				"value": "b01",
				"label": "Elementary"
			},
			{
				"value": "b02",
				"label": "Middle School"
			},
			{
				"value": "b03",
				"label": "High School"
			},
			{
				"value": "b04",
				"label": "Associate"
			},
			{
				"value": "b05",
				"label": "Bachelor"
			},
			{
				"value": "b06",
				"label": "Master"
			},
			{
				"value": "b07",
				"label": "Doctorate"
			}
		]
	},
	{
		"id": "c318_a18",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a18",
		"code": "1.2.6",
		"group": "1.2 CARE RECIPIENT INFORMATION",
		"block": "1.2.7 ACTIVITIES OF DAILY LIVING (ADL) ASSESSMENT",
		"label": "Eating",
		"type": "single",
		"options": [
			{
				"value": "b01",
				"label": "Independent"
			},
			{
				"value": "b02",
				"label": "Needs help"
			},
			{
				"value": "b03",
				"label": "Cannot do"
			}
		]
	},
	{
		"id": "c318_a19",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a19",
		"code": "1.2.6",
		"group": "1.2 CARE RECIPIENT INFORMATION",
		"block": "1.2.7 ACTIVITIES OF DAILY LIVING (ADL) ASSESSMENT",
		"label": "Bathing",
		"type": "single",
		"options": [
			{
				"value": "b01",
				"label": "Independent"
			},
			{
				"value": "b02",
				"label": "Needs help"
			},
			{
				"value": "b03",
				"label": "Cannot do"
			}
		]
	},
	{
		"id": "c318_a20",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a20",
		"code": "1.2.6",
		"group": "1.2 CARE RECIPIENT INFORMATION",
		"block": "1.2.7 ACTIVITIES OF DAILY LIVING (ADL) ASSESSMENT",
		"label": "Dressing",
		"type": "single",
		"options": [
			{
				"value": "b01",
				"label": "Independent"
			},
			{
				"value": "b02",
				"label": "Needs help"
			},
			{
				"value": "b03",
				"label": "Cannot do"
			}
		]
	},
	{
		"id": "c318_a21",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a21",
		"code": "1.2.6",
		"group": "1.2 CARE RECIPIENT INFORMATION",
		"block": "1.2.7 ACTIVITIES OF DAILY LIVING (ADL) ASSESSMENT",
		"label": "Toileting",
		"type": "single",
		"options": [
			{
				"value": "b01",
				"label": "Independent"
			},
			{
				"value": "b02",
				"label": "Needs help"
			},
			{
				"value": "b03",
				"label": "Cannot do"
			}
		]
	},
	{
		"id": "c318_a22",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a22",
		"code": "1.2.6",
		"group": "1.2 CARE RECIPIENT INFORMATION",
		"block": "1.2.7 ACTIVITIES OF DAILY LIVING (ADL) ASSESSMENT",
		"label": "Moving around",
		"type": "single",
		"options": [
			{
				"value": "b01",
				"label": "Independent"
			},
			{
				"value": "b02",
				"label": "Needs help"
			},
			{
				"value": "b03",
				"label": "Cannot do"
			}
		]
	},
	{
		"id": "c318_a23",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a23",
		"code": "1.2.6",
		"group": "1.2 CARE RECIPIENT INFORMATION",
		"block": "1.2.8 INSTRUMENTAL ACTIVITIES OF DAILY LIVING (IADL) ASSESSMENT",
		"label": "Managing medications",
		"type": "single",
		"options": [
			{
				"value": "b01",
				"label": "Independent"
			},
			{
				"value": "b02",
				"label": "Needs help"
			},
			{
				"value": "b03",
				"label": "Cannot do"
			}
		]
	},
	{
		"id": "c318_a24",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a24",
		"code": "1.2.6",
		"group": "1.2 CARE RECIPIENT INFORMATION",
		"block": "1.2.8 INSTRUMENTAL ACTIVITIES OF DAILY LIVING (IADL) ASSESSMENT",
		"label": "Handling finances",
		"type": "single",
		"options": [
			{
				"value": "b01",
				"label": "Independent"
			},
			{
				"value": "b02",
				"label": "Needs help"
			},
			{
				"value": "b03",
				"label": "Cannot do"
			}
		]
	},
	{
		"id": "c318_a25",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a25",
		"code": "1.2.6",
		"group": "1.2 CARE RECIPIENT INFORMATION",
		"block": "1.2.8 INSTRUMENTAL ACTIVITIES OF DAILY LIVING (IADL) ASSESSMENT",
		"label": "Shopping",
		"type": "single",
		"options": [
			{
				"value": "b01",
				"label": "Independent"
			},
			{
				"value": "b02",
				"label": "Needs help"
			},
			{
				"value": "b03",
				"label": "Cannot do"
			}
		]
	},
	{
		"id": "c318_a26",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a26",
		"code": "1.2.6",
		"group": "1.2 CARE RECIPIENT INFORMATION",
		"block": "1.2.8 INSTRUMENTAL ACTIVITIES OF DAILY LIVING (IADL) ASSESSMENT",
		"label": "Preparing meals",
		"type": "single",
		"options": [
			{
				"value": "b01",
				"label": "Independent"
			},
			{
				"value": "b02",
				"label": "Needs help"
			},
			{
				"value": "b03",
				"label": "Cannot do"
			}
		]
	},
	{
		"id": "c318_a27",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a27",
		"code": "1.2.6",
		"group": "1.2 CARE RECIPIENT INFORMATION",
		"block": "1.2.8 INSTRUMENTAL ACTIVITIES OF DAILY LIVING (IADL) ASSESSMENT",
		"label": "Housework",
		"type": "single",
		"options": [
			{
				"value": "b01",
				"label": "Independent"
			},
			{
				"value": "b02",
				"label": "Needs help"
			},
			{
				"value": "b03",
				"label": "Cannot do"
			}
		]
	},
	{
		"id": "c318_a28",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a28",
		"code": "1.3.1",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Delusions present: Does the patient believe that others are stealing from him or her, or planning to harm him or her in some way?",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "Yes"
		}, {
			"value": "b02",
			"label": "No"
		}]
	},
	{
		"id": "c318_a29",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a29",
		"code": "1.3.1",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Delusions severity",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 3,
			"labels": "1=Mild, 2=Moderate, 3=Severe"
		}
	},
	{
		"id": "c318_a30",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a30",
		"code": "1.3.1",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Delusions caregiver distress",
		"type": "scale",
		"scale": {
			"min": 0,
			"max": 5,
			"labels": "0=Not distressing at all, 5=Extreme"
		}
	},
	{
		"id": "c318_a31",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a31",
		"code": "1.3.2",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Hallucinations present: Does the patient act as if he or she hears voices, or talk to people who are not there?",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "Yes"
		}, {
			"value": "b02",
			"label": "No"
		}]
	},
	{
		"id": "c318_a32",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a32",
		"code": "1.3.2",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Hallucinations severity",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 3,
			"labels": "1=Mild, 2=Moderate, 3=Severe"
		}
	},
	{
		"id": "c318_a33",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a33",
		"code": "1.3.2",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Hallucinations caregiver distress",
		"type": "scale",
		"scale": {
			"min": 0,
			"max": 5,
			"labels": "0=Not distressing at all, 5=Extreme"
		}
	},
	{
		"id": "c318_a34",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a34",
		"code": "1.3.3",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Agitation / Aggression present: Is the patient resistant to help from others, or hard to handle?",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "Yes"
		}, {
			"value": "b02",
			"label": "No"
		}]
	},
	{
		"id": "c318_a35",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a35",
		"code": "1.3.3",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Agitation / Aggression severity",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 3,
			"labels": "1=Mild, 2=Moderate, 3=Severe"
		}
	},
	{
		"id": "c318_a36",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a36",
		"code": "1.3.3",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Agitation / Aggression caregiver distress",
		"type": "scale",
		"scale": {
			"min": 0,
			"max": 5,
			"labels": "0=Not distressing at all, 5=Extreme"
		}
	},
	{
		"id": "c318_a37",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a37",
		"code": "1.3.4",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Depression / Dysphoria present: Does the patient act as if he or she is sad or in low spirits, or cry?",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "Yes"
		}, {
			"value": "b02",
			"label": "No"
		}]
	},
	{
		"id": "c318_a38",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a38",
		"code": "1.3.4",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Depression / Dysphoria severity",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 3,
			"labels": "1=Mild, 2=Moderate, 3=Severe"
		}
	},
	{
		"id": "c318_a39",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a39",
		"code": "1.3.4",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Depression / Dysphoria caregiver distress",
		"type": "scale",
		"scale": {
			"min": 0,
			"max": 5,
			"labels": "0=Not distressing at all, 5=Extreme"
		}
	},
	{
		"id": "c318_a40",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a40",
		"code": "1.3.5",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Anxiety present: Does the patient become upset when separated from you, or show signs of nervousness such as shortness of breath, sighing or feeling unable to relax?",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "Yes"
		}, {
			"value": "b02",
			"label": "No"
		}]
	},
	{
		"id": "c318_a41",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a41",
		"code": "1.3.5",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Anxiety severity",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 3,
			"labels": "1=Mild, 2=Moderate, 3=Severe"
		}
	},
	{
		"id": "c318_a42",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a42",
		"code": "1.3.5",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Anxiety caregiver distress",
		"type": "scale",
		"scale": {
			"min": 0,
			"max": 5,
			"labels": "0=Not distressing at all, 5=Extreme"
		}
	},
	{
		"id": "c318_a43",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a43",
		"code": "1.3.6",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Elation / Euphoria present: Does the patient appear to feel too good or act excessively happy?",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "Yes"
		}, {
			"value": "b02",
			"label": "No"
		}]
	},
	{
		"id": "c318_a44",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a44",
		"code": "1.3.6",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Elation / Euphoria severity",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 3,
			"labels": "1=Mild, 2=Moderate, 3=Severe"
		}
	},
	{
		"id": "c318_a45",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a45",
		"code": "1.3.6",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Elation / Euphoria caregiver distress",
		"type": "scale",
		"scale": {
			"min": 0,
			"max": 5,
			"labels": "0=Not distressing at all, 5=Extreme"
		}
	},
	{
		"id": "c318_a46",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a46",
		"code": "1.3.7",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Apathy / Indifference present: Does the patient seem less interested in his or her usual activities, or in the activities and plans of others?",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "Yes"
		}, {
			"value": "b02",
			"label": "No"
		}]
	},
	{
		"id": "c318_a47",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a47",
		"code": "1.3.7",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Apathy / Indifference severity",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 3,
			"labels": "1=Mild, 2=Moderate, 3=Severe"
		}
	},
	{
		"id": "c318_a48",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a48",
		"code": "1.3.7",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Apathy / Indifference caregiver distress",
		"type": "scale",
		"scale": {
			"min": 0,
			"max": 5,
			"labels": "0=Not distressing at all, 5=Extreme"
		}
	},
	{
		"id": "c318_a49",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a49",
		"code": "1.3.8",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Disinhibition present: Does the patient act impulsively, for example talking to strangers as if he or she knows them, or saying things that may hurt people's feelings?",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "Yes"
		}, {
			"value": "b02",
			"label": "No"
		}]
	},
	{
		"id": "c318_a50",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a50",
		"code": "1.3.8",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Disinhibition severity",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 3,
			"labels": "1=Mild, 2=Moderate, 3=Severe"
		}
	},
	{
		"id": "c318_a51",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a51",
		"code": "1.3.8",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Disinhibition caregiver distress",
		"type": "scale",
		"scale": {
			"min": 0,
			"max": 5,
			"labels": "0=Not distressing at all, 5=Extreme"
		}
	},
	{
		"id": "c318_a52",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a52",
		"code": "1.3.9",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Irritability / Lability present: Is the patient impatient and cranky, or does he or she have difficulty coping with delays or waiting for planned activities?",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "Yes"
		}, {
			"value": "b02",
			"label": "No"
		}]
	},
	{
		"id": "c318_a53",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a53",
		"code": "1.3.9",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Irritability / Lability severity",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 3,
			"labels": "1=Mild, 2=Moderate, 3=Severe"
		}
	},
	{
		"id": "c318_a54",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a54",
		"code": "1.3.9",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Irritability / Lability caregiver distress",
		"type": "scale",
		"scale": {
			"min": 0,
			"max": 5,
			"labels": "0=Not distressing at all, 5=Extreme"
		}
	},
	{
		"id": "c318_a55",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a55",
		"code": "1.3.10",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Motor disturbance present: Does the patient engage in repetitive activities such as pacing around the house, handling buttons, wrapping string or doing other things repeatedly?",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "Yes"
		}, {
			"value": "b02",
			"label": "No"
		}]
	},
	{
		"id": "c318_a56",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a56",
		"code": "1.3.10",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Motor disturbance severity",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 3,
			"labels": "1=Mild, 2=Moderate, 3=Severe"
		}
	},
	{
		"id": "c318_a57",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a57",
		"code": "1.3.10",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Motor disturbance caregiver distress",
		"type": "scale",
		"scale": {
			"min": 0,
			"max": 5,
			"labels": "0=Not distressing at all, 5=Extreme"
		}
	},
	{
		"id": "c318_a58",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a58",
		"code": "1.3.11",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Nighttime behaviours present: Does the patient wake you up at night, rise too early in the morning, or take excessive naps during the day?",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "Yes"
		}, {
			"value": "b02",
			"label": "No"
		}]
	},
	{
		"id": "c318_a59",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a59",
		"code": "1.3.11",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Nighttime behaviours severity",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 3,
			"labels": "1=Mild, 2=Moderate, 3=Severe"
		}
	},
	{
		"id": "c318_a60",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a60",
		"code": "1.3.11",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Nighttime behaviours caregiver distress",
		"type": "scale",
		"scale": {
			"min": 0,
			"max": 5,
			"labels": "0=Not distressing at all, 5=Extreme"
		}
	},
	{
		"id": "c318_a61",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a61",
		"code": "1.3.12",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Appetite / Eating present: Has the patient lost or gained weight, or had a change in the food he or she likes?",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "Yes"
		}, {
			"value": "b02",
			"label": "No"
		}]
	},
	{
		"id": "c318_a62",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a62",
		"code": "1.3.12",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Appetite / Eating severity",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 3,
			"labels": "1=Mild, 2=Moderate, 3=Severe"
		}
	},
	{
		"id": "c318_a63",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a63",
		"code": "1.3.12",
		"group": "1.3 NEUROPSYCHIATRIC INVENTORY QUESTIONNAIRE (NPI-Q)",
		"block": "",
		"label": "Appetite / Eating caregiver distress",
		"type": "scale",
		"scale": {
			"min": 0,
			"max": 5,
			"labels": "0=Not distressing at all, 5=Extreme"
		}
	},
	{
		"id": "c318_a64",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a64",
		"code": "1.4.1",
		"group": "1.4 SHORT SENSE OF COMPETENCE QUESTIONNAIRE (SSCQ)",
		"block": "",
		"label": "\"I feel my care recipient asks for more help than he or she needs.\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 5,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a65",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a65",
		"code": "1.4.2",
		"group": "1.4 SHORT SENSE OF COMPETENCE QUESTIONNAIRE (SSCQ)",
		"block": "",
		"label": "\"I feel I do not have enough time for myself because of the time I spend with my care recipient.\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 5,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a66",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a66",
		"code": "1.4.3",
		"group": "1.4 SHORT SENSE OF COMPETENCE QUESTIONNAIRE (SSCQ)",
		"block": "",
		"label": "\"I feel stressed between caring for my care recipient and meeting other responsibilities.\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 5,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a67",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a67",
		"code": "1.4.4",
		"group": "1.4 SHORT SENSE OF COMPETENCE QUESTIONNAIRE (SSCQ)",
		"block": "",
		"label": "\"I feel embarrassed by my care recipient's behaviour.\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 5,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a68",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a68",
		"code": "1.4.5",
		"group": "1.4 SHORT SENSE OF COMPETENCE QUESTIONNAIRE (SSCQ)",
		"block": "",
		"label": "\"I feel angry when I am with my care recipient.\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 5,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a69",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a69",
		"code": "1.4.6",
		"group": "1.4 SHORT SENSE OF COMPETENCE QUESTIONNAIRE (SSCQ)",
		"block": "",
		"label": "\"I feel my care recipient's present situation does not allow me as much privacy as I would like.\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 5,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a70",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a70",
		"code": "1.4.7",
		"group": "1.4 SHORT SENSE OF COMPETENCE QUESTIONNAIRE (SSCQ)",
		"block": "",
		"label": "\"I feel strained in the interactions with my care recipient.\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 5,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a71",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a71",
		"code": "1.5.1",
		"group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
		"block": "",
		"label": "Significant Other: \"There is a special person who is around when I am in need.\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a72",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a72",
		"code": "1.5.2",
		"group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
		"block": "",
		"label": "Significant Other: \"There is a special person with whom I can share my joys and sorrows.\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a73",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a73",
		"code": "1.5.3",
		"group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
		"block": "",
		"label": "Family: \"My family really tries to help me.\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a74",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a74",
		"code": "1.5.4",
		"group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
		"block": "",
		"label": "Family: \"I get the emotional help and support I need from my family.\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a75",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a75",
		"code": "1.5.5",
		"group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
		"block": "",
		"label": "Significant Other: \"I have a special person who is a real source of comfort to me.\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a76",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a76",
		"code": "1.5.6",
		"group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
		"block": "",
		"label": "Friends: \"My friends really try to help me.\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a77",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a77",
		"code": "1.5.7",
		"group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
		"block": "",
		"label": "Friends: \"I can count on my friends when things go wrong.\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a78",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a78",
		"code": "1.5.8",
		"group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
		"block": "",
		"label": "Family: \"I can talk about my problems with my family.\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a79",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a79",
		"code": "1.5.9",
		"group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
		"block": "",
		"label": "Friends: \"I have friends with whom I can share my joys and sorrows.\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a80",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a80",
		"code": "1.5.10",
		"group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
		"block": "",
		"label": "Significant Other: \"There is a special person in my life who cares about my feelings.\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a81",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a81",
		"code": "1.5.11",
		"group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
		"block": "",
		"label": "Family: \"My family is willing to help me make decisions.\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a82",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a82",
		"code": "1.5.12",
		"group": "1.5 MULTIDIMENSIONAL SCALE OF PERCEIVED SOCIAL SUPPORT (MSPSS)",
		"block": "",
		"label": "Friends: \"I can talk about my problems with my friends.\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a83",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a83",
		"code": "1.6",
		"group": "1.6 PERSEVERANCE TIME",
		"block": "",
		"label": "How much longer do you think you can continue providing care for your care recipient given the current situation?",
		"type": "single",
		"options": [
			{
				"value": "b01",
				"label": "Less than 1 week"
			},
			{
				"value": "b02",
				"label": "More than 1 week but less than 1 month"
			},
			{
				"value": "b03",
				"label": "More than 1 month but less than 6 months"
			},
			{
				"value": "b04",
				"label": "More than 6 months but less than 1 year"
			},
			{
				"value": "b05",
				"label": "More than 1 year but less than 2 years"
			},
			{
				"value": "b06",
				"label": "More than 2 years"
			}
		]
	},
	{
		"id": "c318_a84",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a84",
		"code": "1.7.1.1",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "People with Alzheimer's disease are particularly prone to depression.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a85",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a85",
		"code": "1.7.1.2",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "It has been scientifically proven that mental exercise can prevent a person from getting Alzheimer's disease.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a86",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a86",
		"code": "1.7.1.3",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "After symptoms of Alzheimer's disease appear, the average life expectancy is six to twelve years.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a87",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a87",
		"code": "1.7.1.4",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "When a person with Alzheimer's disease becomes agitated, a medical examination may reveal other health problems that caused the agitation.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a88",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a88",
		"code": "1.7.1.5",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "People with Alzheimer's disease do best with simple written reminders.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a89",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a89",
		"code": "1.7.1.6",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "People whose Alzheimer's disease is not yet severe can benefit from psychotherapy for depression and anxiety.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a90",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a90",
		"code": "1.7.1.7",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "If a person with Alzheimer's disease becomes alert and agitated in the late afternoon and early evening, that person may be experiencing 'sundowning'.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a91",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a91",
		"code": "1.7.1.8",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "When people with Alzheimer's disease begin to have difficulty taking care of themselves, caregivers should take over right away.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a92",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a92",
		"code": "1.7.1.9",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "If trouble with memory and confused thinking appears suddenly, it is likely due to Alzheimer's disease.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a93",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a93",
		"code": "1.7.1.10",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "Most people with Alzheimer's disease live in nursing homes.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a94",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a94",
		"code": "1.7.1.11",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "Poor nutrition can make the symptoms of Alzheimer's disease worse.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a95",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a95",
		"code": "1.7.1.12",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "People in the early stages of Alzheimer's disease are usually good candidates for behavioural therapies.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a96",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a96",
		"code": "1.7.1.13",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "Once people have Alzheimer's disease, they are no longer capable of making informed decisions about their own care.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a97",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a97",
		"code": "1.7.1.14",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "Eventually, a person with Alzheimer's disease will need 24-hour supervision.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a98",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a98",
		"code": "1.7.1.15",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "Having high cholesterol may increase a person's risk of developing Alzheimer's disease.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a99",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a99",
		"code": "1.7.1.16",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "Tremor or shaking of the hands or arms is a common symptom in people with Alzheimer's disease.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a100",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a100",
		"code": "1.7.1.17",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "Symptoms of severe depression can be mistaken for symptoms of Alzheimer's disease.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a101",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a101",
		"code": "1.7.1.18",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "Alzheimer's disease is one type of dementia.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a102",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a102",
		"code": "1.7.1.19",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "Trouble handling money or paying bills is a common early symptom of Alzheimer's disease.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a103",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a103",
		"code": "1.7.1.20",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "One symptom that can occur with Alzheimer's disease is believing that other people are stealing one's things.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a104",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a104",
		"code": "1.7.1.21",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "When a person has Alzheimer's disease, using reminder notes is a crutch that can contribute to decline.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a105",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a105",
		"code": "1.7.1.22",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "Prescription drugs that prevent Alzheimer's disease are available.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a106",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a106",
		"code": "1.7.1.23",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "Having high blood pressure may increase a person's risk of developing Alzheimer's disease.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a107",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a107",
		"code": "1.7.1.24",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "Genes can only partially account for the development of Alzheimer's disease.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a108",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a108",
		"code": "1.7.1.25",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "It is safe for people with Alzheimer's disease to drive, as long as they have a companion in the car at all times.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a109",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a109",
		"code": "1.7.1.26",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "Alzheimer's disease cannot be cured.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a110",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a110",
		"code": "1.7.1.27",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "Most people with Alzheimer's disease remember recent events better than things that happened in the past.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a111",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a111",
		"code": "1.7.1.28",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "In rare cases, people have recovered from Alzheimer's disease.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a112",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a112",
		"code": "1.7.1.29",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "People with Alzheimer's disease are especially prone to falls and other accidents.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a113",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a113",
		"code": "1.7.1.30",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.1 Alzheimer's Disease Knowledge Scale (ADKS)",
		"label": "Difficulty with the ability to walk is common in people who are in the later stages of Alzheimer's disease.",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "True"
		}, {
			"value": "b02",
			"label": "False"
		}]
	},
	{
		"id": "c318_a114",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a114",
		"code": "1.7.2.1",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "It is rewarding to work with people who have dementia.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a115",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a115",
		"code": "1.7.2.2",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "I am afraid of people with dementia.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a116",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a116",
		"code": "1.7.2.3",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "People with dementia can be creative.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a117",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a117",
		"code": "1.7.2.4",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "I feel confident around people with dementia.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a118",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a118",
		"code": "1.7.2.5",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "I am afraid of people with dementia because of the way they might behave.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a119",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a119",
		"code": "1.7.2.6",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "Every person with dementia has different needs.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a120",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a120",
		"code": "1.7.2.7",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "I am not very familiar with dementia.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a121",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a121",
		"code": "1.7.2.8",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "I feel relaxed around people with dementia.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a122",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a122",
		"code": "1.7.2.9",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "People with dementia like having familiar things nearby.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a123",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a123",
		"code": "1.7.2.10",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "I feel uncomfortable being around people with dementia.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a124",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a124",
		"code": "1.7.2.11",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "It is important to know the past history of people with dementia.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a125",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a125",
		"code": "1.7.2.12",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "It is possible to enjoy interacting with people with dementia.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a126",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a126",
		"code": "1.7.2.13",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "I feel frustrated because I do not know how to help people with dementia.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a127",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a127",
		"code": "1.7.2.14",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "I cannot imagine taking care of someone with dementia.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a128",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a128",
		"code": "1.7.2.15",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "I admire the coping skills of people with dementia.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a129",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a129",
		"code": "1.7.2.16",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "We can do a lot now to improve the lives of people with dementia.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a130",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a130",
		"code": "1.7.2.17",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "Difficult behaviours may be a form of communication for people with dementia.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a131",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a131",
		"code": "1.7.2.18",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "I am comfortable touching people with dementia.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a132",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a132",
		"code": "1.7.2.19",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "I would avoid an agitated person with dementia.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a133",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a133",
		"code": "1.7.2.20",
		"group": "1.7 DEMENTIA KNOWLEDGE AND ATTITUDES QUESTIONNAIRES",
		"block": "1.7.2 Dementia Attitudes Scale (DAS)",
		"label": "I would like to get to know people with dementia better.",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c318_a134",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a134",
		"code": "2.1.1",
		"group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Age",
		"type": "number",
		"help": "Format: Numeric input"
	},
	{
		"id": "c318_a135",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a135",
		"code": "2.1.2",
		"group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Gender",
		"type": "single",
		"help": "Options: Male, Female",
		"options": [{
			"value": "b01",
			"label": "Male"
		}, {
			"value": "b02",
			"label": "Female"
		}]
	},
	{
		"id": "c318_a136",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a136",
		"code": "2.1.2",
		"group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Education Level",
		"type": "single",
		"help": "Options: Elementary, Middle School, High School, Associate, Bachelor, Master, Doctorate",
		"options": [
			{
				"value": "b01",
				"label": "Elementary"
			},
			{
				"value": "b02",
				"label": "Middle School"
			},
			{
				"value": "b03",
				"label": "High School"
			},
			{
				"value": "b04",
				"label": "Associate"
			},
			{
				"value": "b05",
				"label": "Bachelor"
			},
			{
				"value": "b06",
				"label": "Master"
			},
			{
				"value": "b07",
				"label": "Doctorate"
			}
		]
	},
	{
		"id": "c318_a137",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a137",
		"code": "2.1.3",
		"group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Relationship to Primary Caregiver",
		"type": "single",
		"help": "Options: Spouse/Partner, Child, Sibling, Other Relative, Friend/Neighbor, Professional Caregiver, Other",
		"options": [
			{
				"value": "b01",
				"label": "Spouse/Partner"
			},
			{
				"value": "b02",
				"label": "Child"
			},
			{
				"value": "b03",
				"label": "Sibling"
			},
			{
				"value": "b04",
				"label": "Other Relative"
			},
			{
				"value": "b05",
				"label": "Friend/Neighbor"
			},
			{
				"value": "b06",
				"label": "Professional Caregiver"
			},
			{
				"value": "b07",
				"label": "Other"
			}
		]
	},
	{
		"id": "c318_a1371",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a1371",
		"code": "2.1.3",
		"group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Other detail",
		"type": "text",
		"otherFor": "c318_a137"
	},
	{
		"id": "c318_a138",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a138",
		"code": "2.1.4",
		"group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Relationship to Care Recipient",
		"type": "single",
		"help": "Options: Spouse/Partner, Parent, Child, Sibling, Other Relative, Friend/Neighbor, Professional Caregiver, Other",
		"options": [
			{
				"value": "b01",
				"label": "Spouse/Partner"
			},
			{
				"value": "b02",
				"label": "Parent"
			},
			{
				"value": "b03",
				"label": "Child"
			},
			{
				"value": "b04",
				"label": "Sibling"
			},
			{
				"value": "b05",
				"label": "Other Relative"
			},
			{
				"value": "b06",
				"label": "Friend/Neighbor"
			},
			{
				"value": "b07",
				"label": "Professional Caregiver"
			},
			{
				"value": "b08",
				"label": "Other"
			}
		]
	},
	{
		"id": "c318_a1381",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a1381",
		"code": "2.1.4",
		"group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Other detail",
		"type": "text",
		"otherFor": "c318_a138"
	},
	{
		"id": "c318_a139",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a139",
		"code": "2.1.5",
		"group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Duration of Caregiving",
		"type": "single",
		"help": "Options: Less than 6 months, 6 months - 1 year, 1-2 years, 2-5 years, More than 5 years",
		"options": [
			{
				"value": "b01",
				"label": "Less than 6 months"
			},
			{
				"value": "b02",
				"label": "6 months - 1 year"
			},
			{
				"value": "b03",
				"label": "1-2 years"
			},
			{
				"value": "b04",
				"label": "2-5 years"
			},
			{
				"value": "b05",
				"label": "More than 5 years"
			}
		]
	},
	{
		"id": "c318_a140",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a140",
		"code": "2.1.6",
		"group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Hours of Care Per Week",
		"type": "number",
		"help": "Format: Numeric input"
	},
	{
		"id": "c318_a142",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a142",
		"code": "2.1.7",
		"group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Distance from Care Recipient",
		"type": "single",
		"help": "Options: Same home, Same building, Same neighborhood, Same city, Different city, Different province/country",
		"options": [
			{
				"value": "b01",
				"label": "Same home"
			},
			{
				"value": "b02",
				"label": "Same building"
			},
			{
				"value": "b03",
				"label": "Same neighborhood"
			},
			{
				"value": "b04",
				"label": "Same city"
			},
			{
				"value": "b05",
				"label": "Different city"
			},
			{
				"value": "b06",
				"label": "Different province/country"
			}
		]
	},
	{
		"id": "c318_a143",
		"cct": "318",
		"slug": "esm_screening",
		"column": "a143",
		"code": "2.1.8",
		"group": "2.1 OTHER CAREGIVER PERSONAL INFORMATION",
		"block": "",
		"label": "Contact Frequency",
		"type": "single",
		"help": "Options: Daily, Several times a week, Weekly, Several times a month, Monthly, Less than monthly",
		"options": [
			{
				"value": "b01",
				"label": "Daily"
			},
			{
				"value": "b02",
				"label": "Several times a week"
			},
			{
				"value": "b03",
				"label": "Weekly"
			},
			{
				"value": "b04",
				"label": "Several times a month"
			},
			{
				"value": "b05",
				"label": "Monthly"
			},
			{
				"value": "b06",
				"label": "Less than monthly"
			}
		]
	},
	{
		"id": "c319_a01",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a01",
		"code": "3.1.1",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "When did it happen?",
		"type": "single",
		"options": [
			{
				"value": "b01",
				"label": "NOW: Record care activities happening now or just occurred"
			},
			{
				"value": "b02",
				"label": "OTHER TIME: Supplement activities not recorded during the day"
			},
			{
				"value": "b03",
				"label": "NOT TIED TO SPECIFIC TIME: Record challenges, needs, or ideas not tied to specific events"
			}
		]
	},
	{
		"id": "c319_a02",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a02",
		"code": "3.1.1",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Time of the event",
		"type": "datetime"
	},
	{
		"id": "c319_a03",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a03",
		"code": "3.1.1",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Other time",
		"type": "datetime",
		"otherFor": "c319_a02"
	},
	{
		"id": "c319_a04",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a04",
		"code": "3.1.2",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Activity Category",
		"type": "multi",
		"options": [
			{
				"value": "b01",
				"label": "Clinical: medication, medical tasks"
			},
			{
				"value": "b02",
				"label": "Functional: feeding, bathing, dressing, grooming, toileting, ambulation"
			},
			{
				"value": "b03",
				"label": "Cognitive: orientation, conversation, answering questions"
			},
			{
				"value": "b04",
				"label": "Decision: medical decisions, financial decisions, non-medical decisions"
			},
			{
				"value": "b05",
				"label": "Housekeeping: preparing meals, cleaning, shopping"
			},
			{
				"value": "b06",
				"label": "Info Management: coordinating care, communicating with care team, managing finances"
			},
			{
				"value": "b07",
				"label": "Logistics: scheduling appointments, reminding, ensuring delivery of necessities"
			},
			{
				"value": "b08",
				"label": "Transport: driving, arranging rides, accompanying to appointments"
			},
			{
				"value": "b09",
				"label": "Companionship: social interaction, conversation, games, music, walks, outings"
			},
			{
				"value": "b10",
				"label": "Caregiver Support: emotional support for other caregivers, respite"
			},
			{
				"value": "b11",
				"label": "Vigilance: supervision, safety monitoring, preventing wandering"
			},
			{
				"value": "b12",
				"label": "Pet Care: walking pets, feeding, vet visits"
			},
			{
				"value": "b13",
				"label": "Skill Development: attending classes, reading, learning about dementia"
			},
			{
				"value": "b14",
				"label": "Other (please describe)"
			}
		]
	},
	{
		"id": "c319_a05",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a05",
		"code": "3.1.2",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Other",
		"type": "text",
		"help": "The prefix \"ADL\" and \"IADL\" which not appear on the actual survey question handled to participants",
		"otherFor": "c319_a04"
	},
	{
		"id": "c319_a06",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a06",
		"code": "3.1.3",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Event Stress Rating",
		"type": "scale",
		"scale": {
			"min": -3,
			"max": 3,
			"labels": "Very Unpleasant to Very Pleasant"
		}
	},
	{
		"id": "c319_a07",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a07",
		"code": "3.1.4",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Activity Description",
		"type": "longtext",
		"help": "Format: Free text with Voice Input and AI Support AI support is on the frontend to offer voice transcription, AI enhance support, etc, but the AI can’t click on form submission, it will only help to fill the form on the frontend, the user can then adjust, let the AI offer a better draft/enhance, which AI will show in the dropdown support chatbot with a copy to form button, only clicking on it will the enhanced answer be copied to the form"
	},
	{
		"id": "c319_a08",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a08",
		"code": "3.1.4",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Memory problems (e.g., repeating things, losing things, not completing a task, not remembering events or persons, concentration difficulties) (Yes/No",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "Yes"
		}, {
			"value": "b02",
			"label": "No"
		}]
	},
	{
		"id": "c319_a09",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a09",
		"code": "3.1.4",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Behavior problems (e.g., breaking things on purpose, verbal aggression, threats to harm others, night wandering, opposition or provocation) (Yes/No",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "Yes"
		}, {
			"value": "b02",
			"label": "No"
		}]
	},
	{
		"id": "c319_a10",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a10",
		"code": "3.1.4",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Depressive symptoms (e.g., sadness, hopelessness, threats of self-harm, speaking of dying, suffering from loneliness, uselessness or worthlessness) (Yes/No",
		"type": "single",
		"options": [{
			"value": "b01",
			"label": "Yes"
		}, {
			"value": "b02",
			"label": "No"
		}]
	},
	{
		"id": "c319_a11",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a11",
		"code": "3.1.6",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Caregiver MBP-Related Distress",
		"type": "scale",
		"help": "During this event, how much did their memory/behavioral problems disturb or upset you?",
		"scale": {
			"min": 0,
			"max": 4,
			"labels": "Not at all to Extremely"
		}
	},
	{
		"id": "c319_a12",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a12",
		"code": "3.1.7",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Unfulfilled Care Needs (Optional)",
		"type": "longtext",
		"help": "Format: Free text with Voice Input and AI Support"
	},
	{
		"id": "c319_a13",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a13",
		"code": "3.1.8",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Ideas or Suggestions (Optional)",
		"type": "longtext",
		"help": "Format: Free text with Voice Input and AI Support"
	},
	{
		"id": "c319_a14",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a14",
		"code": "3.1.9",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Time Spent (minutes)",
		"type": "number",
		"help": "Format: Numeric input"
	},
	{
		"id": "c319_a15",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a15",
		"code": "3.1.9",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Cheerful",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": ""
		}
	},
	{
		"id": "c319_a16",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a16",
		"code": "3.1.9",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Relaxed",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": ""
		}
	},
	{
		"id": "c319_a17",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a17",
		"code": "3.1.9",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Enthusiastic",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": ""
		}
	},
	{
		"id": "c319_a18",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a18",
		"code": "3.1.9",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Satisfied",
		"type": "scale",
		"help": "Items: Insecure, Lonely, Anxious, Irritated, Down, Desperate, Tensed",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": ""
		}
	},
	{
		"id": "c319_a19",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a19",
		"code": "3.1.9",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Insecure",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": ""
		}
	},
	{
		"id": "c319_a20",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a20",
		"code": "3.1.9",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Lonely",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": ""
		}
	},
	{
		"id": "c319_a21",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a21",
		"code": "3.1.9",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Anxious",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": ""
		}
	},
	{
		"id": "c319_a22",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a22",
		"code": "3.1.9",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Irritated",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": ""
		}
	},
	{
		"id": "c319_a23",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a23",
		"code": "3.1.9",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Down",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": ""
		}
	},
	{
		"id": "c319_a24",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a24",
		"code": "3.1.9",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Desperate",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": ""
		}
	},
	{
		"id": "c319_a25",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a25",
		"code": "3.1.9",
		"group": "3.1 ACTIVITY TAB",
		"block": "",
		"label": "Tensed",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": ""
		}
	},
	{
		"id": "c319_a26",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a26",
		"code": "3.2.1",
		"group": "3.2 PEOPLE TAB",
		"block": "",
		"label": "People involved (from your care network)",
		"type": "text",
		"help": "Options: Pre-populated network members or \"Just Me\"",
		"options": [{
			"value": "b01",
			"label": "Just Me"
		}]
	},
	{
		"id": "c319_a28",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a28",
		"code": "3.2.3",
		"group": "3.2 PEOPLE TAB",
		"block": "",
		"label": "Who Else Do You Wish Could Help",
		"type": "longtext",
		"help": "Format: Free text with Voice Input and AI Support"
	},
	{
		"id": "c319_a29",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a29",
		"code": "3.2.4",
		"group": "3.2 PEOPLE TAB",
		"block": "",
		"label": "Challenges in Reaching People You Wish Could Help",
		"type": "longtext",
		"help": "Format: Free text with Voice Input and AI Support"
	},
	{
		"id": "c319_a30",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a30",
		"code": "3.3.1",
		"group": "3.3 CHALLENGES & RESOURCES TAB",
		"block": "",
		"label": "Challenges in Undertaking This Task",
		"type": "scale",
		"scale": {
			"min": -3,
			"max": 3,
			"labels": "No challenges to Extreme challenges"
		}
	},
	{
		"id": "c319_a31",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a31",
		"code": "3.3.2",
		"group": "3.3 CHALLENGES & RESOURCES TAB",
		"block": "",
		"label": "Challenge Types",
		"type": "multi",
		"help": "Options: Handle symptoms, Condition, Updates, Coordination, Time, Emotional, Physical, Communication, Safety, Privacy, Other （multiple select）",
		"options": [
			{
				"value": "b01",
				"label": "Handle symptoms"
			},
			{
				"value": "b02",
				"label": "Condition"
			},
			{
				"value": "b03",
				"label": "Updates"
			},
			{
				"value": "b04",
				"label": "Coordination"
			},
			{
				"value": "b05",
				"label": "Time"
			},
			{
				"value": "b06",
				"label": "Emotional"
			},
			{
				"value": "b07",
				"label": "Physical"
			},
			{
				"value": "b08",
				"label": "Communication"
			},
			{
				"value": "b09",
				"label": "Safety"
			},
			{
				"value": "b10",
				"label": "Privacy"
			},
			{
				"value": "b11",
				"label": "Other"
			}
		]
	},
	{
		"id": "c319_a311",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a311",
		"code": "3.3.2",
		"group": "3.3 CHALLENGES & RESOURCES TAB",
		"block": "",
		"label": "Other detail",
		"type": "text",
		"otherFor": "c319_a31"
	},
	{
		"id": "c319_a32",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a32",
		"code": "3.3.3",
		"group": "3.3 CHALLENGES & RESOURCES TAB",
		"block": "",
		"label": "Challenges Faced (Description)",
		"type": "longtext",
		"help": "Format: Free text with Voice Input and AI Support"
	},
	{
		"id": "c319_a33",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a33",
		"code": "3.3.4",
		"group": "3.3 CHALLENGES & RESOURCES TAB",
		"block": "",
		"label": "Resources Currently Using & Challenges",
		"type": "longtext",
		"help": "Format: Free text with Voice Input and AI Support"
	},
	{
		"id": "c319_a34",
		"cct": "319",
		"slug": "esm_hourly_log",
		"column": "a34",
		"code": "3.3.5",
		"group": "3.3 CHALLENGES & RESOURCES TAB",
		"block": "",
		"label": "Resources You Wish Existed or Improved",
		"type": "longtext",
		"help": "Format: Free text with Voice Input and AI Support"
	},
	{
		"id": "c317_a01",
		"cct": "317",
		"slug": "esm_daily_log",
		"column": "a01",
		"code": "4.1.1",
		"group": "4.1 SUPPLEMENT HOURLY LOGS NOT RECORDED",
		"block": "",
		"label": "What else happened today that you did not log?",
		"type": "longtext",
		"help": "Format: Free text with Voice Input and AI Support"
	},
	{
		"id": "c317_a02",
		"cct": "317",
		"slug": "esm_daily_log",
		"column": "a02",
		"code": "4.2.1",
		"group": "4.1 SUPPLEMENT HOURLY LOGS NOT RECORDED",
		"block": "",
		"label": "\"Today I felt stressed due to my care responsibilities\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c317_a03",
		"cct": "317",
		"slug": "esm_daily_log",
		"column": "a03",
		"code": "4.2.2",
		"group": "4.1 SUPPLEMENT HOURLY LOGS NOT RECORDED",
		"block": "",
		"label": "\"Today I felt that the situation with my care recipient did not allow me as much privacy as I would have liked\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c317_a04",
		"cct": "317",
		"slug": "esm_daily_log",
		"column": "a04",
		"code": "4.2.3",
		"group": "4.1 SUPPLEMENT HOURLY LOGS NOT RECORDED",
		"block": "",
		"label": "\"Today I felt strained in the interactions with my care recipient\"",
		"type": "scale",
		"scale": {
			"min": 1,
			"max": 7,
			"labels": "Strongly disagree to Strongly agree"
		}
	},
	{
		"id": "c317_a05",
		"cct": "317",
		"slug": "esm_daily_log",
		"column": "a05",
		"code": "4.2.3",
		"group": "4.1 SUPPLEMENT HOURLY LOGS NOT RECORDED",
		"block": "",
		"label": "Looking back at today as a whole, how would you rate your overall caregiving burden today?",
		"type": "scale",
		"help": "people, and what does each person do?",
		"scale": {
			"min": -3,
			"max": 3,
			"labels": "Very Light to Very Heavy"
		}
	}
];
/**
* The other caregivers a participant names in their hourly logs.
*
* CCT320 (slug esm_log_person_v2) has one column in use: a01 person name.
* Optional extra details (questions 2.1, CCT318 a134–a143) go into a new CCT318
* row for that person, linked by REL321 (CCT320 → CCT318, one-to-one).
*
* Links are JetEngine relations only:
*   REL316  user → CCT320 (people this participant has added)
*   REL308  CCT319 hourly log → CCT320 (people involved in that entry)
*   REL321  CCT320 person → CCT318 (that person's optional details)
*/
var PERSON_CCT = "esm_log_person_v2";
var SCREENING_CCT = "esm_screening_v2";
var PERSON_REL = {
	user: 316,
	hourlyLog: 308,
	details: 321
};
var CACHE_KEY = "esm:people";
var readCache = () => {
	try {
		return JSON.parse(localStorage.getItem(CACHE_KEY) || "[]").map((p) => ({
			id: p.id,
			name: p.name
		}));
	} catch {
		return [];
	}
};
var writeCache = (people) => {
	try {
		localStorage.setItem(CACHE_KEY, JSON.stringify(people));
	} catch {}
};
var cachedPeople = () => readCache();
var link = (rel, parent, child) => wordpressFetch(`jet-rel/${rel}`, {
	method: "POST",
	body: {
		parent_id: parent,
		child_id: child,
		context: "child_object",
		store_items_type: "append"
	}
});
var rowIdOf = (created) => created?.item_id ?? created?.id ?? created?._ID;
/** Loads this participant's people (REL316) and refreshes the cache. */
async function fetchMyPeople() {
	const userId = getCurrentUserIdNumber();
	if (!userId) return readCache();
	try {
		const links = await wordpressFetch(`jet-rel/${PERSON_REL.user}/children/${userId}`);
		const ids = Array.isArray(links) ? links.map((l) => String(l.child_object_id)) : [];
		if (ids.length === 0) {
			writeCache([]);
			return [];
		}
		const rows = await wordpressCCTFetch(PERSON_CCT);
		const people = (Array.isArray(rows) ? rows : []).filter((r) => ids.includes(String(r["_ID"] ?? r["id"]))).map((r) => ({
			id: String(r["_ID"] ?? r["id"] ?? ""),
			name: String(r["a01"] ?? "")
		})).reverse();
		writeCache(people);
		return people;
	} catch {
		return readCache();
	}
}
/** Adds one person (CCT320 a01 only) and links them to the participant via REL316. */
async function createPerson(name) {
	const userId = getCurrentUserIdNumber();
	if (!userId) throw new Error("Sign in first so the people you name are saved to the study.");
	const rowId = rowIdOf(await wordpressCCTFetch(PERSON_CCT, {
		method: "POST",
		body: { a01: name }
	}));
	if (!rowId) throw new Error("The study people table did not return a row id.");
	await link(PERSON_REL.user, String(userId), String(rowId));
	const person = {
		id: String(rowId),
		name
	};
	writeCache([person, ...readCache()]);
	return person;
}
/**
* Saves the optional 2.1 details for one person: a new CCT318 row holding only
* a134–a143, linked to the person through REL321. The name stays in CCT320 a01.
*/
async function savePersonDetails(personId, answers) {
	const body = {};
	for (const item of ESM_SPEC) {
		if (item.cct !== "318" || !item.code.startsWith("2.1")) continue;
		const value = answers[item.id];
		if (value === void 0 || value === null || value === "") continue;
		body[item.column] = Array.isArray(value) ? value.join(",") : String(value);
	}
	const rowId = rowIdOf(await wordpressCCTFetch(SCREENING_CCT, {
		method: "POST",
		body
	}));
	if (!rowId) throw new Error("The screening table did not return a row id.");
	await link(PERSON_REL.details, String(personId), String(rowId));
	return String(rowId);
}
/** Links the people chosen on an hourly log to that log row (REL308). */
async function linkPeopleToLog(logRowId, personIds) {
	for (const personId of personIds.filter((id) => id !== "just_me")) await link(PERSON_REL.hourlyLog, String(logRowId), String(personId));
}
/**
* ESM study storage on the headless WordPress backend.
*
* The fixed JetEngine tables use one column per
* question, exactly as the study document specifies:
*   CCT 318 esm_screening   — 146 fields (Sections 1 and 2)
*   CCT 319 esm_hourly_log  — 34 fields (Section 3)
*   CCT 317 esm_daily_log   — 5 fields (Section 4)
*   CCT 320 esm_log_person  — 4 fields (people named in an hourly log)
*
* Every row belongs to its participant through a JetEngine relation only —
* never a hand-made id column:
*   REL 305 user → screening entries
*   REL 306 user → hourly log entries
*   REL 307 user → daily log entries
*   REL 308 hourly log → people, REL 316 user → people (see people.ts)
*/
/** REST slugs currently registered by JetEngine for the fixed tables. */
var ESM_CCT = {
	screening: "esm_screening_v2",
	hourly: "esm_hourly_log_v2",
	daily: "esm_daily_log_v2"
};
var ESM_REL = {
	screening: 305,
	hourly: 306,
	daily: 307
};
var asWPString = (value) => {
	if (value === void 0 || value === null) return "";
	if (Array.isArray(value)) return value.join(",");
	return String(value);
};
function targetFor(kind) {
	if (kind === "hourly_log") return {
		cct: "319",
		slug: ESM_CCT.hourly,
		rel: ESM_REL.hourly
	};
	if (kind === "daily_log") return {
		cct: "317",
		slug: ESM_CCT.daily,
		rel: ESM_REL.daily
	};
	return {
		cct: "318",
		slug: ESM_CCT.screening,
		rel: ESM_REL.screening
	};
}
/** Which people the participant picked on an hourly log. */
var pickedPeople = (record) => {
	const value = record.answers?.["c319_a26"];
	return Array.isArray(value) ? value.map(String) : [];
};
/** One column per answer: the answer key already names its column. */
function buildBody(record) {
	const { cct } = targetFor(record.kind);
	const body = {};
	for (const item of ESM_SPEC) {
		if (item.cct !== cct) continue;
		const value = record.answers?.[item.id];
		if (item.id === "c319_a26") {
			body[item.column] = pickedPeople(record).includes("just_me") ? "b01" : "";
			continue;
		}
		body[item.column] = asWPString(value);
	}
	if (record.kind === "hourly_log") body["a02"] = record.answers?.["c319_a01"] === "b01" ? record.submittedAt : "";
	return body;
}
/** Writes one record to its CCT and links it to the signed-in participant. */
async function pushRecord(record) {
	const userId = getCurrentUserIdNumber();
	if (!userId) throw new Error("Sign in first so your entries are saved to the study.");
	const { slug, rel } = targetFor(record.kind);
	const created = await wordpressCCTFetch(slug, {
		method: "POST",
		body: buildBody(record)
	});
	const rowId = created?.item_id ?? created?.id ?? created?._ID;
	if (!rowId) throw new Error(`The study table ${slug} did not return a row id`);
	await wordpressFetch(`jet-rel/${rel}`, {
		method: "POST",
		body: {
			parent_id: String(userId),
			child_id: String(rowId),
			context: "child_object",
			store_items_type: "update"
		}
	});
	if (record.kind === "hourly_log") await linkPeopleToLog(String(rowId), pickedPeople(record));
	markSynced(record.id, String(rowId));
	return String(rowId);
}
/**
* Saves an entry on the device, then uploads it.
* The device copy is kept either way, so nothing a participant typed is lost.
*/
async function submitRecord(kind, answers, options = {}) {
	const record = addRecord(kind, answers, options.slot, options.voice);
	try {
		await pushRecord(record);
		return {
			record,
			uploaded: true
		};
	} catch (err) {
		return {
			record,
			uploaded: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
/** Uploads every entry that is still only on the device. */
async function pushPendingRecords(records) {
	let sent = 0;
	let failed = 0;
	for (const record of records.filter((r) => !r.synced)) try {
		await pushRecord(record);
		sent += 1;
	} catch {
		failed += 1;
	}
	return {
		sent,
		failed
	};
}
//#endregion
export { uiText as A, saveProfile as C, submitRecord as D, startProfile as E, todaySlots as O, savePersonDetails as S, slotId as T, localDay as _, clearDraft as a, pushPendingRecords as b, deleteRecord as c, getDraft as d, getProfile as f, isChineseLanguage as g, hourlyReminderActive as h, cachedPeople as i, yesterdayDailyLogDone as j, translateSurveyText as k, exportJson as l, getSettings as m, ESM_REL as n, createPerson as o, getRecords as p, ESM_SPEC as r, dailyLogDone as s, ESM_CCT as t, fetchMyPeople as u, localizeQuestionnaire as v, saveSettings as w, saveDraft as x, missedSlots as y };
