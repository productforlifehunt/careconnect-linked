import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { n as getCurrentUserIdNumber } from "./current-user-CV-pp6xq.mjs";
import { i as currentAppScope } from "./app-scope-Cq6C10CZ.mjs";
import { a as fetchAppSettingsJson, f as saveAppSettingsJson, o as fetchHelpBubbleVisible, p as saveHelpBubbleVisible } from "./app-profile-DeZHIfiB.mjs";
import { r as Capacitor } from "../_libs/@capacitor/app+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai-dynamic-knowledge-C5tnjGCy.js
var KNOWLEDGE = [
	{
		id: "app.dashboard",
		topic: "app-basics",
		keywords: [
			"dashboard",
			"home",
			"首页",
			"控制面板",
			"简报",
			"briefing"
		],
		title: {
			zh: "控制面板",
			en: "Dashboard"
		},
		body: {
			zh: "控制面板是登录后的首页，显示今日智能简报、被护理者卡片、待办任务、接下来的预约和未读消息。",
			en: "The dashboard is the home screen after signing in: today's smart briefing, cared-one cards, open tasks, upcoming bookings, and unread messages."
		}
	},
	{
		id: "app.assistant",
		topic: "app-basics",
		keywords: [
			"assistant",
			"ai",
			"chat",
			"助手",
			"对话",
			"悬浮球",
			"聊天"
		],
		title: {
			zh: "AI 助手",
			en: "AI assistant"
		},
		body: {
			zh: "右下角的悬浮球随时可以打开 AI 助手，可以闲聊，也可以询问你有权限查看的护理、用药、签到和位置信息。",
			en: "The floating button in the bottom-right opens the AI assistant anywhere. You can just chat, or ask about care, medicine, check-ins, and location data you are allowed to see."
		}
	},
	{
		id: "app.medicine",
		topic: "app-basics",
		keywords: [
			"medicine",
			"medication",
			"dose",
			"pill",
			"用药",
			"吃药",
			"药",
			"剂量",
			"提醒"
		],
		title: {
			zh: "用药安排",
			en: "Medicine schedule"
		},
		body: {
			zh: "在被护理者页面添加药品、剂量、频率和提醒时间；到点后助手会提示确认「已服用」或「跳过」，记录会写入用药日志。",
			en: "Add a medicine, dose, frequency, and reminder times on the cared one's page. At each time the assistant asks you to confirm taken or skipped, and the answer is written to the medicine log."
		}
	},
	{
		id: "app.checkin",
		topic: "app-basics",
		keywords: [
			"check-in",
			"checkin",
			"visit",
			"探望",
			"签到",
			"问候"
		],
		title: {
			zh: "探望签到",
			en: "Check-ins"
		},
		body: {
			zh: "探望签到是每日简短问答，助手会问心情、睡眠、食欲、疼痛和今天的特别情况，结束后自动保存一段摘要。",
			en: "A check-in is a short daily conversation. The assistant asks about mood, sleep, appetite, pain, and anything notable, then saves a short summary."
		}
	},
	{
		id: "app.location",
		topic: "app-basics",
		keywords: [
			"location",
			"gps",
			"zone",
			"geofence",
			"位置",
			"定位",
			"安全区",
			"围栏",
			"在哪"
		],
		title: {
			zh: "位置与安全区",
			en: "Location and safe zones"
		},
		body: {
			zh: "位置页显示最新位置、历史轨迹和安全区。进出安全区会产生提醒。只有获得位置分享许可的人才能看到。",
			en: "The location page shows the latest position, history, and safe zones. Entering or leaving a zone creates an alert. Only people granted location sharing can see it."
		}
	},
	{
		id: "app.info-card",
		topic: "app-basics",
		keywords: [
			"info card",
			"information card",
			"care sheet",
			"信息卡",
			"照护须知",
			"卡片",
			"分享"
		],
		title: {
			zh: "信息卡片",
			en: "Information card"
		},
		body: {
			zh: "信息卡片是给临时帮忙的邻居、朋友或亲戚看的一页说明：基本情况、这次照护安排、紧急联系人，可生成分享链接。",
			en: "An information card is a one-page brief for a neighbour, friend, or relative helping out: background, this situation, and emergency contacts. It can be shared by link."
		}
	},
	{
		id: "app.notifications",
		topic: "app-basics",
		keywords: [
			"notification",
			"push",
			"alert",
			"通知",
			"推送",
			"提醒"
		],
		title: {
			zh: "通知",
			en: "Notifications"
		},
		body: {
			zh: "用药、签到、任务、群组邀请和安全区提醒都会进入通知列表，也可以开启手机推送。",
			en: "Medicine, check-ins, tasks, group invites, and zone alerts all land in the notification list, and you can turn on phone push as well."
		}
	},
	{
		id: "group.home",
		topic: "care-group",
		keywords: [
			"group home",
			"activity",
			"群组首页",
			"动态"
		],
		title: {
			zh: "群组首页",
			en: "Group home"
		},
		body: {
			zh: "查看群组动态、待办任务数量和最新发布的内容。",
			en: "See group activity, how many tasks are open, and the newest posts."
		}
	},
	{
		id: "group.calendar",
		topic: "care-group",
		keywords: [
			"calendar",
			"日历",
			"日程"
		],
		title: {
			zh: "日历",
			en: "Calendar"
		},
		body: {
			zh: "按日期查看群组任务的时间安排。",
			en: "See group tasks laid out by date."
		}
	},
	{
		id: "group.tasks",
		topic: "care-group",
		keywords: [
			"task",
			"assign",
			"任务",
			"指派",
			"待办"
		],
		title: {
			zh: "任务",
			en: "Tasks"
		},
		body: {
			zh: "创建任务、指派给成员或子群组、标记完成。",
			en: "Create tasks, assign them to members or member groups, and mark them done."
		}
	},
	{
		id: "group.location",
		topic: "care-group",
		keywords: [
			"group location",
			"被护理者位置",
			"群组定位"
		],
		title: {
			zh: "被护理者位置",
			en: "Cared One's Location"
		},
		body: {
			zh: "查看群组被护理者的最新位置、区域提醒与位置分享设置。",
			en: "See the latest location of the group's cared ones, zone alerts, and sharing settings."
		}
	},
	{
		id: "group.messages",
		topic: "care-group",
		keywords: [
			"message",
			"chat",
			"对话",
			"聊天"
		],
		title: {
			zh: "对话",
			en: "Messages"
		},
		body: {
			zh: "群组内的即时对话，所有成员都能看到。",
			en: "Real-time group conversation visible to every member."
		}
	},
	{
		id: "group.announcements",
		topic: "care-group",
		keywords: [
			"announcement",
			"pin",
			"公告",
			"置顶"
		],
		title: {
			zh: "公告",
			en: "Announcements"
		},
		body: {
			zh: "重要通知，可置顶，可限定给特定子群组。",
			en: "Important notices — can be pinned and limited to specific member groups."
		}
	},
	{
		id: "group.wishes",
		topic: "care-group",
		keywords: [
			"well wish",
			"wishes",
			"祝福"
		],
		title: {
			zh: "祝福",
			en: "Well Wishes"
		},
		body: {
			zh: "给被护理者和家人的鼓励与祝福留言。",
			en: "Encouraging messages for the cared one and the family."
		}
	},
	{
		id: "group.gallery",
		topic: "care-group",
		keywords: [
			"gallery",
			"photo",
			"相册",
			"照片"
		],
		title: {
			zh: "相册",
			en: "Gallery"
		},
		body: {
			zh: "群组共享的照片。",
			en: "Photos shared inside the group."
		}
	},
	{
		id: "group.cared-ones",
		topic: "care-group",
		keywords: [
			"group cared one",
			"群组被护理者",
			"加入被护理者"
		],
		title: {
			zh: "群组被护理者",
			en: "Group Cared Ones"
		},
		body: {
			zh: "把被护理者加入群组，并查看他们的健康资料。",
			en: "Add cared ones to the group and view their health details."
		}
	},
	{
		id: "group.members",
		topic: "care-group",
		keywords: [
			"member",
			"admin",
			"owner",
			"remove",
			"成员",
			"管理员",
			"拥有权",
			"移除"
		],
		title: {
			zh: "成员",
			en: "Members"
		},
		body: {
			zh: "查看成员、设为管理员、标记被护理者、转移拥有权或移除成员。",
			en: "View members, make admins, mark cared ones, transfer ownership, or remove members."
		}
	},
	{
		id: "group.invite",
		topic: "care-group",
		keywords: [
			"invite",
			"invitation",
			"code",
			"link",
			"邀请",
			"邀请码",
			"链接"
		],
		title: {
			zh: "邀请成员",
			en: "Invite Members"
		},
		body: {
			zh: "按用户名/邮箱邀请，或创建可分享的邀请链接与邀请码。",
			en: "Invite by user search or email, or create shareable invite links and codes."
		}
	},
	{
		id: "group.member-groups",
		topic: "care-group",
		keywords: [
			"member group",
			"subgroup",
			"子群组",
			"分组"
		],
		title: {
			zh: "子群组",
			en: "Member Groups"
		},
		body: {
			zh: "把成员分成「家人」「医疗团队」等子群组，用于限定帖子和任务的可见范围。",
			en: "Split members into groups like Family or Medical Team to scope posts and tasks."
		}
	},
	{
		id: "group.settings",
		topic: "care-group",
		keywords: [
			"setting",
			"privacy",
			"rename",
			"设置",
			"私密",
			"改名"
		],
		title: {
			zh: "群组设置",
			en: "Group Setting"
		},
		body: {
			zh: "仅拥有者和管理员可见：修改名称、描述、私密性和我的群内显示名。",
			en: "Owners and admins only: change the name, description, privacy, and your in-group display name."
		}
	},
	{
		id: "tips.refuse-food",
		topic: "care-tips",
		keywords: [
			"refuse",
			"eat",
			"food",
			"appetite",
			"不吃",
			"拒食",
			"吃饭",
			"食欲"
		],
		title: {
			zh: "不肯吃饭",
			en: "Refusing food"
		},
		body: {
			zh: "先排除疼痛、假牙不适或便秘等身体原因；把餐食分成小份、少量多次；固定用餐时间和位置，减少环境干扰；可以用手拿的食物往往更容易接受。持续拒食或体重下降要联系医生。",
			en: "First rule out pain, ill-fitting dentures, or constipation. Offer small portions more often, keep meal times and seating consistent, reduce noise and clutter, and try finger foods. Contact a clinician if refusal persists or weight drops."
		}
	},
	{
		id: "tips.agitation",
		topic: "care-tips",
		keywords: [
			"agitation",
			"angry",
			"aggressive",
			"sundown",
			"激动",
			"生气",
			"攻击",
			"黄昏"
		],
		title: {
			zh: "情绪激动或黄昏躁动",
			en: "Agitation and sundowning"
		},
		body: {
			zh: "不要争辩或纠正事实，先安抚情绪；降低光线和噪音；转移到熟悉、安静的环境；用简短句子和缓慢语速说话；找出触发因素（饥饿、口渴、如厕、疲劳、疼痛）。有伤人风险时先保证安全并求助。",
			en: "Do not argue or correct facts — settle the emotion first. Lower light and noise, move to a familiar quiet space, speak in short slow sentences, and look for triggers (hunger, thirst, toileting, fatigue, pain). If anyone is at risk of harm, secure safety and get help."
		}
	},
	{
		id: "tips.communication",
		topic: "care-tips",
		keywords: [
			"talk",
			"communicate",
			"说话",
			"沟通",
			"怎么说"
		],
		title: {
			zh: "怎样说话更顺畅",
			en: "Communicating well"
		},
		body: {
			zh: "一次说一件事，用短句和是/否问题；先叫名字并保持眼神接触；给出充足反应时间；用手势和示范代替解释；避免测试记忆（不要问「你还记得我是谁吗」）。",
			en: "One idea at a time, short sentences, yes/no questions. Use their name, keep eye contact, allow long pauses, show rather than explain, and avoid testing memory (never ask “do you remember who I am?”)."
		}
	},
	{
		id: "tips.wandering",
		topic: "care-tips",
		keywords: [
			"wander",
			"lost",
			"走失",
			"走丢",
			"乱走",
			"外出"
		],
		title: {
			zh: "走失风险",
			en: "Wandering"
		},
		body: {
			zh: "在门口贴提示、加装门铃或传感器；随身放写有联系人的卡片；白天安排规律的散步和活动以减少徘徊；设置安全区提醒。走失时立即联系当地警方并提供近照。",
			en: "Add door chimes or sensors, keep an ID card with contact details on them, plan regular daytime walks to reduce restlessness, and set up safe-zone alerts. If someone goes missing, contact local police immediately with a recent photo."
		}
	},
	{
		id: "tips.night",
		topic: "care-tips",
		keywords: [
			"sleep",
			"night",
			"insomnia",
			"睡眠",
			"夜间",
			"失眠",
			"起夜"
		],
		title: {
			zh: "夜间睡不好",
			en: "Poor sleep at night"
		},
		body: {
			zh: "白天多接触自然光并适度活动；限制午睡时长；傍晚后避免咖啡、浓茶和大量液体；睡前流程固定；夜灯照亮到卫生间的路线。突然明显变差要排查疼痛、感染或用药影响。",
			en: "Get daylight and activity during the day, cap naps, avoid caffeine and large drinks in the evening, keep a fixed bedtime routine, and light the path to the toilet. A sudden change warrants checking for pain, infection, or medication effects."
		}
	},
	{
		id: "tips.theft-belief",
		topic: "care-tips",
		keywords: [
			"steal",
			"stolen",
			"theft",
			"accuse",
			"missing money",
			"偷",
			"被偷",
			"拿走",
			"怀疑",
			"丢了",
			"钱不见"
		],
		title: {
			zh: "怀疑东西被偷",
			en: "Believing something was stolen"
		},
		body: {
			zh: "不要否认或讲道理，先认同感受：“找不到确实很着急，我陪你一起找。”常见的是自己收起来忘了，先看熟悉的藏东西的位置；找到后不要强调是他记错了；可以准备备用的钱包、钥匙。若要转移话题，接着聊他喜欢的事或一起做点小事。反复而强烈时告诉家属，必要时看医生。",
			en: "Do not deny or argue — validate the feeling first (\"that's upsetting, let's look together\"). Items are usually put away and forgotten, so check their usual hiding places, and don't point out that they misremembered. Keep spare wallets or keys. To move on, shift to a topic or small activity they enjoy. Tell the family if it is frequent or intense."
		}
	},
	{
		id: "tips.wants-to-go-home",
		topic: "care-tips",
		keywords: [
			"go home",
			"want to leave",
			"won't go home",
			"回家",
			"想出门",
			"不肯回家",
			"要走",
			"出去"
		],
		title: {
			zh: "想出门或不肯回家",
			en: "Wanting to leave, or refusing to go home"
		},
		body: {
			zh: "“想回家”往往表达的是不安或想找熟悉的人，不是地址。先接住情绪：“想家了是吧，跟我说说家里什么样。”再给一件当下的事做过渡（喝水、吃点东西、一起走一段、看老照片）；不要说“这里就是你家”或直接拦住。天黑前后更常见，提前安排活动会减少。反复要出门有走失风险时告知家属并开启安全区提醒。",
			en: "\"I want to go home\" usually means unease or missing a familiar person, not an address. Meet the feeling first (\"tell me about home\"), then bridge into something concrete — a drink, a snack, a short walk together, old photos. Don't say \"this is your home\" or physically block them. It peaks around dusk, so plan activity earlier. If they repeatedly try to leave, tell the family and turn on safe-zone alerts."
		}
	},
	{
		id: "tips.companionship",
		topic: "care-tips",
		keywords: [
			"chat",
			"story",
			"lonely",
			"reminisce",
			"accompany",
			"陪",
			"聊天",
			"讲故事",
			"孤单",
			"回忆",
			"无聊"
		],
		title: {
			zh: "陪聊、讲故事与回忆往事",
			en: "Chatting, stories, and reminiscing"
		},
		body: {
			zh: "从久远、愉快的记忆入手（老家、年轻时的工作、孩子小时候、爱吃的菜、老歌）；用开放但简单的问题，允许长时间停顿，不纠正细节、不测试记忆。可以讲短小、温和、结局明确的故事，一次两三分钟；配合老照片、老歌效果更好。对方情绪低落时先陪着，不急于转移。",
			en: "Start from old, happy memories — hometown, early work, the children as babies, favourite food, old songs. Ask simple open questions, allow long pauses, never correct details or test memory. Short, gentle stories with a clear ending work well, two or three minutes at a time, and old photos or music help. If they are low, stay with the feeling before changing the subject."
		}
	},
	{
		id: "tips.restlessness",
		topic: "care-tips",
		keywords: [
			"restless",
			"won't sit",
			"pacing",
			"keeps getting up",
			"坐不住",
			"走动",
			"来回",
			"起来",
			"不听劝"
		],
		title: {
			zh: "坐不住、反复起身走动",
			en: "Restlessness and pacing"
		},
		body: {
			zh: "先排除需要：如厕、口渴、饿、疼、太热或太吵。不要反复命令“坐下”，改成邀请：“陪我一起叠这些毛巾好吗”“我们走到窗边看看”。给手上有事做（折毛巾、择菜、摸熟悉的物件），并把走动路线上的障碍和地毯清掉，防止跌倒。突然明显加重要考虑疼痛、感染或用药影响。",
			en: "Rule out needs first: toilet, thirst, hunger, pain, heat, noise. Instead of repeating \"sit down\", invite them — \"help me fold these towels\", \"let's look out the window\". Give their hands something to do and clear obstacles and loose rugs along their walking route to prevent falls. A sudden increase warrants checking pain, infection, or medication."
		}
	},
	{
		id: "tips.caregiver-burnout",
		topic: "care-tips",
		keywords: [
			"burnout",
			"stress",
			"tired",
			"累",
			"压力",
			"崩溃",
			"喘息"
		],
		title: {
			zh: "照护者自身的压力",
			en: "Caregiver strain"
		},
		body: {
			zh: "把任务分给群组成员，安排固定的休息时段；使用喘息服务或日间照护；记录自己的睡眠和情绪变化；持续低落、失眠或易怒时寻求专业支持。",
			en: "Share tasks with your care group and schedule real breaks, use respite or day care, watch your own sleep and mood, and seek professional support if low mood, insomnia, or irritability persists."
		}
	}
];
function normalize(s) {
	return (s || "").toLowerCase();
}
function scoreEntry(entry, q) {
	const hay = normalize(q);
	let score = 0;
	for (const kw of entry.keywords) {
		if (!kw) continue;
		if (hay.includes(normalize(kw))) score += kw.length > 3 ? 2 : 1;
	}
	if (hay.includes(normalize(entry.title.zh)) || hay.includes(normalize(entry.title.en))) score += 3;
	return score;
}
/**
* On-demand retrieval: returns request text containing only the snippets that
* match the question. Empty string when nothing is relevant.
*/
function retrieveStaticKnowledge(question, options = {}) {
	const { topics, isChinese = false, limit = 4, maxChars = 1800, fallbackToIndex = true } = options;
	const pool = topics?.length ? KNOWLEDGE.filter((k) => topics.includes(k.topic)) : KNOWLEDGE;
	const ranked = pool.map((e) => ({
		e,
		score: scoreEntry(e, question)
	})).filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
	const header = isChinese ? "以下是本应用的参考资料。回答操作类问题时优先使用这些内容；资料里没有的就直接说明，不要编造功能。这些是一般性护理经验，不是医疗诊断。" : "The reference material below comes from this app's own knowledge base. Prefer it for how-to questions, say plainly when something is not covered, and never invent features. These are general care practices, not medical diagnosis.";
	if (ranked.length === 0) {
		if (!fallbackToIndex) return "";
		const titles = pool.map((e) => isChinese ? e.title.zh : e.title.en).join("、");
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
/**
* Device permission layer (push / location / calendar).
*
* Works on three surfaces with one API:
*   - iOS & Android via Capacitor plugins
*   - Web via the browser APIs (Notification, Geolocation)
*   - Any surface where the capability is missing → "unsupported", never a crash
*
* Nothing here asks for a permission on load. Permissions are requested only in
* direct response to a user action (the iOS review requirement and the habit
* users expect), and a denied permission always yields an actionable recovery
* path via `openAppSettings()`.
*/
var isNative = () => Capacitor.isNativePlatform();
var platform = () => Capacitor.getPlatform();
async function checkPushPermission() {
	if (isNative()) try {
		const { PushNotifications } = await import("../_libs/_44.mjs");
		const r = await PushNotifications.checkPermissions();
		return r.receive === "granted" ? "granted" : r.receive === "denied" ? "denied" : "prompt";
	} catch {
		return "unsupported";
	}
	if (typeof Notification === "undefined") return "unsupported";
	return Notification.permission === "granted" ? "granted" : Notification.permission === "denied" ? "denied" : "prompt";
}
/**
* Request push permission and register the device token.
* Returns the resulting state; the token registration is reported through
* `onToken` because APNs/FCM deliver it asynchronously.
*/
async function requestPushPermission(onToken) {
	if (isNative()) try {
		const { PushNotifications } = await import("../_libs/_44.mjs");
		const req = await PushNotifications.requestPermissions();
		if (req.receive !== "granted") return req.receive === "denied" ? "denied" : "prompt";
		if (onToken) {
			await PushNotifications.removeAllListeners();
			await PushNotifications.addListener("registration", (t) => onToken(t.value, platform() === "ios" ? "apn" : "fcm"));
		}
		await PushNotifications.register();
		return "granted";
	} catch {
		return "unsupported";
	}
	if (typeof Notification === "undefined") return "unsupported";
	try {
		const result = await Notification.requestPermission();
		return result === "granted" ? "granted" : result === "denied" ? "denied" : "prompt";
	} catch {
		return "denied";
	}
}
async function checkLocationPermission() {
	if (isNative()) try {
		const { Geolocation } = await import("../_libs/_42.mjs");
		const r = await Geolocation.checkPermissions();
		const v = r.location ?? r.coarseLocation;
		return v === "granted" ? "granted" : v === "denied" ? "denied" : "prompt";
	} catch {
		return "unsupported";
	}
	if (typeof navigator === "undefined" || !navigator.geolocation) return "unsupported";
	try {
		const status = await navigator.permissions?.query({ name: "geolocation" });
		if (!status) return "prompt";
		return status.state === "granted" ? "granted" : status.state === "denied" ? "denied" : "prompt";
	} catch {
		return "prompt";
	}
}
async function requestLocationPermission() {
	if (isNative()) try {
		const { Geolocation } = await import("../_libs/_42.mjs");
		const r = await Geolocation.requestPermissions();
		return r.location === "granted" ? "granted" : r.location === "denied" ? "denied" : "prompt";
	} catch {
		return "unsupported";
	}
	if (typeof navigator === "undefined" || !navigator.geolocation) return "unsupported";
	return new Promise((resolve) => {
		navigator.geolocation.getCurrentPosition(() => resolve("granted"), (err) => resolve(err.code === err.PERMISSION_DENIED ? "denied" : "prompt"), { timeout: 1e4 });
	});
}
/**
* Calendar access is optional: the in-app calendar (CCT 187) always works.
* A native calendar plugin is imported lazily so the web build never breaks
* when it is not installed.
*/
async function checkCalendarPermission() {
	if (!isNative()) return "unsupported";
	try {
		const r = await (await import(
			/* @vite-ignore */
			"@ebarooni/capacitor-calendar"
)).CapacitorCalendar.checkPermission({ alias: "readCalendar" });
		return r.result === "granted" ? "granted" : r.result === "denied" ? "denied" : "prompt";
	} catch {
		return "unsupported";
	}
}
async function requestCalendarPermission() {
	if (!isNative()) return "unsupported";
	try {
		const r = await (await import(
			/* @vite-ignore */
			"@ebarooni/capacitor-calendar"
)).CapacitorCalendar.requestPermission({ alias: "readCalendar" });
		return r.result === "granted" ? "granted" : r.result === "denied" ? "denied" : "prompt";
	} catch {
		return "unsupported";
	}
}
/** Deep-link into the OS settings screen so a denied permission is recoverable. */
async function openAppSettings() {
	if (isNative()) try {
		const { NativeSettings, AndroidSettings, IOSSettings } = await import(
			/* @vite-ignore */
			"capacitor-native-settings"
);
		await NativeSettings.open({
			optionAndroid: AndroidSettings.ApplicationDetails,
			optionIOS: IOSSettings.App
		});
		return true;
	} catch {
		try {
			const { App } = await import("../_libs/_40.mjs");
			await App.openUrl?.({ url: "app-settings:" });
			return true;
		} catch {
			return false;
		}
	}
	return false;
}
async function checkPermission(kind) {
	if (kind === "push") return checkPushPermission();
	if (kind === "location") return checkLocationPermission();
	return checkCalendarPermission();
}
async function requestPermission(kind) {
	if (kind === "push") return requestPushPermission();
	if (kind === "location") return requestLocationPermission();
	return requestCalendarPermission();
}
/**
* ---
* name: care-dynamic-knowledge
* description: >-
*   Dynamic skill for ChallengeD / CareCNC / NotchSafety. Use whenever a request
*   needs this user's own data or changes it: cared ones, medicines, check-ins,
*   care groups, tasks, bookings, locations and safe zones, notifications, and
*   every app setting. Owns the data model (CCT + column codes), the per-sub-app
*   write differences, view permissions, and the actual reads and writes.
* keywords: [cared one, medicine, 用药, check-in, 签到, care group, 群组, task, 任务,
*   booking, 预约, location, 定位, safe zone, 安全区, notification, 推送, setting, 设置]
* entrypoints: [resolveAssistantContext(), resolveBriefingFacts(), resolveWriteSkill(),
*   readSettingSkill(), runSettingSkill(), runNotificationSkill()]
* ---
*
* Anthropic Agent Skills layout, expressed as an executable TypeScript module so
* ordinary non-AI screens call the very same skills with zero token cost.
*
* Design rules (do not break these):
*  1. The AI never queries anything. It only ever receives finished text, and it
*     may only write by naming a skill declared here.
*  2. Permissions are ordinary code here, never instructions in a prompt.
*  3. Resolvers run on demand and return small AGGREGATED summaries, never raw
*     rows — so cost stays flat whether a person has 20 records or 20,000.
*  4. Field codes stay inside the feature/service layer; only plain language
*     leaves this file.
*  5. Sub-app is decided by currentAppScope() inside the skill; callers never
*     pass it. Edge callers must send the lowercase sub-app id explicitly.
*
* When the data model, business rules, or view permissions change, this file is
* the only one that changes.
*/
/**
* ONE skill per user-facing setting. Each skill carries, in the same entry:
*   • the wording shown on screen,
*   • the allowed values,
*   • how to READ the current value,
*   • how to WRITE it (the real CCT / column / device target),
*   • which sub-apps show it and, when they differ, the per-sub-app target.
*
* Everything goes through a skill NAME. The settings screen, the header theme
* button, the language menu and the AI floating assistant all call the same
* skill, so no front-end file stores a data structure or a write path.
*
* Sub-app detection: currentAppScope() only (URL `?__site=` in preview, the real
* domain in production). Callers never pass an app. An edge/server caller must
* pass an explicit app name through appScopeFromEdge(), which rejects anything
* that is not one of the three known apps instead of silently defaulting.
*
* Storage targets used below:
*   CCT 151 `users_extended_prof`, linked to the user by Relation 152
*     challenged  → column a95  (User's app setting for ChallengeD)
*     notchsafety → column a95  (same data as ChallengeD; it is a skin over it)
*     carecnc     → column a96  (User's app setting for CareCNC)
*   local  → this device only (localStorage / i18next)
*   device → an OS permission; we only record that we asked
*/
var ai_dynamic_knowledge_exports = /* @__PURE__ */ __exportAll({
	DEFAULT_APP_SETTINGS: () => DEFAULT_APP_SETTINGS,
	KNOWN_APPS: () => KNOWN_APPS,
	LANGUAGES: () => LANGUAGES,
	NOTIFICATION_SKILL_NAMES: () => NOTIFICATION_SKILL_NAMES,
	NOTIFICATION_TYPES: () => NOTIFICATION_TYPES,
	SETTING_GROUPS: () => SETTING_GROUPS,
	SETTING_SKILLS: () => SETTING_SKILLS,
	SETTING_SKILL_NAMES: () => SETTING_SKILL_NAMES,
	WRITE_SKILL_NAMES: () => WRITE_SKILL_NAMES,
	appScopeFromEdge: () => appScopeFromEdge,
	applyDisplaySettings: () => applyDisplaySettings,
	askPermissionSkill: () => askPermissionSkill,
	buildBriefingRequest: () => buildBriefingRequest,
	buildCareGroupHelpRequest: () => buildCareGroupHelpRequest,
	buildCheckInContext: () => buildCheckInContext,
	buildInfoSheetContext: () => buildInfoSheetContext,
	buildInfoSheetIntroduction: () => buildInfoSheetIntroduction,
	buildMedicineDoseContext: () => buildMedicineDoseContext,
	buildMedicineDoseStarter: () => buildMedicineDoseStarter,
	buildSafetyContext: () => buildSafetyContext,
	fetchAppSettings: () => fetchAppSettings,
	loadSettingSkill: () => loadSettingSkill,
	normalizeNotificationType: () => normalizeNotificationType,
	notificationRecipients: () => notificationRecipients,
	notificationTarget: () => notificationTarget,
	permissionSkillStates: () => permissionSkillStates,
	readSettingSkill: () => readSettingSkill,
	resolveAssistantContext: () => resolveAssistantContext,
	resolveBriefingFacts: () => resolveBriefingFacts,
	resolveCaredOneAccess: () => resolveCaredOneAccess,
	resolveCheckInFacts: () => resolveCheckInFacts,
	resolveGroupAccess: () => resolveGroupAccess,
	resolveGroupFacts: () => resolveGroupFacts,
	resolveLocationFacts: () => resolveLocationFacts,
	resolveMedicineFacts: () => resolveMedicineFacts,
	resolveSettingFacts: () => resolveSettingFacts,
	resolveTaskFacts: () => resolveTaskFacts,
	resolveViewerFacts: () => resolveViewerFacts,
	resolveWriteSkill: () => resolveWriteSkill,
	runNotificationSkill: () => runNotificationSkill,
	runSettingSkill: () => runSettingSkill,
	settingSkill: () => settingSkill,
	settingSkillAppliesTo: () => settingSkillAppliesTo,
	settingSkillsForApp: () => settingSkillsForApp,
	settingSkillsInGroup: () => settingSkillsInGroup,
	validateSettingWrite: () => validateSettingWrite
});
var Z = (isChinese, zh, en) => isChinese ? zh : en;
function line(label, value) {
	const v = value === 0 ? "0" : value;
	return v ? `${label}: ${v}` : "";
}
function join(parts) {
	return parts.filter(Boolean).join("\n");
}
function buildInfoSheetContext(ctx, isChinese) {
	const facts = [
		ctx.sheetName ? `${isChinese ? "说明标题" : "Sheet"}: ${ctx.sheetName}` : "",
		ctx.caredOneName ? `${isChinese ? "被护理者" : "Person"}: ${ctx.caredOneName}` : "",
		ctx.description ? `${isChinese ? "基本情况" : "Background"}: ${ctx.description}` : "",
		ctx.situationDetails ? `${isChinese ? "本次护理安排" : "This situation"}: ${ctx.situationDetails}` : "",
		ctx.locationText ? `${isChinese ? "最近位置" : "Last known location"}: ${ctx.locationText}` : "",
		ctx.contacts?.length ? `${isChinese ? "紧急联系人" : "Emergency contacts"}: ${ctx.contacts.map((c) => [
			c.name,
			c.relationship,
			c.phone,
			c.note
		].filter(Boolean).join(" / ")).join(" | ")}` : "",
		ctx.knowledge || ""
	].filter(Boolean).join("\n");
	return `${isChinese ? "以下是你关于这位家人已经知道的情况。像自己熟悉这家人一样自然地说，不要提到“卡片”“须知”这类字眼。对方通常是自愿帮忙的邻居、朋友或亲戚，语气温和、客气、感谢；也可以回答一般照顾常识、陪对方聊天。不知道的不要编，涉及安全或沟通的关键信息请对方联系下面的联系人。" : "Below is what you already know about this family. Speak as someone familiar with them — never mention a \"card\" or \"sheet\". The reader is usually a neighbour, friend, or relative who volunteered, so be warm and appreciative; general care know-how and plain conversation are fine too. Never invent anything, and when a missing detail could affect safety or understanding, ask them to call a contact listed below."}\n\n${isChinese ? "信息卡内容" : "Card facts"}:\n${facts || (isChinese ? "（暂无更多信息）" : "(no further details provided)")}`;
}
function buildInfoSheetIntroduction(task, caredOneName, isChinese) {
	return isChinese ? `${caredOneName || "这位家人"}的家人正在请人帮忙。用两三句温和、感谢的话说明这次帮忙内容：${task}。不要使用命令句，最后邀请对方随时提问。` : `A family is asking a neighbour or friend for a favour. In two or three warm, appreciative, non-commanding sentences, explain this favour: ${task}. End by inviting questions.`;
}
function buildCheckInContext(checkinName, instructions, caredOneName, isChinese) {
	return isChinese ? `你正在为“${caredOneName}”进行“${checkinName}”每日探望签到。${instructions ? `附加说明：${instructions}。` : ""}\n逐个询问 3–5 个简短友好的问题，涵盖心情、睡眠、食欲、疼痛或不适、今日特别情况。每次不超过两句。信息足够后只返回 JSON：{"done":true,"summary":"用 2–3 句总结今天状态","status":"checked"}。明确跳过则返回：{"done":true,"summary":"用户选择跳过。","status":"skipped"}。` : `Conduct the “${checkinName}” daily check-in for “${caredOneName}”. ${instructions ? `Additional instructions: ${instructions}.` : ""}\nAsk 3–5 short, friendly questions one at a time about mood, sleep, appetite, pain or discomfort, and anything notable today. Keep each turn under two sentences. Once enough is known, return only JSON: {"done":true,"summary":"2–3 sentence summary","status":"checked"}. If they clearly skip, return: {"done":true,"summary":"User chose to skip.","status":"skipped"}.`;
}
function buildMedicineDoseContext(dose, isChinese) {
	return isChinese ? `这是已从用药日程精确读取的本次提醒：${dose}。只确认本次是否服用或跳过，不更改剂量。确认后只返回 JSON：{"done":true,"summary":"一句说明","status":"taken"} 或 status 为 "skipped"。` : `This reminder was read directly from the medicine schedule: ${dose}. Confirm only whether this dose was taken or skipped; never change dosage. When confirmed, return only JSON: {"done":true,"summary":"one sentence","status":"taken"} or status "skipped".`;
}
function buildMedicineDoseStarter(dose, isChinese) {
	return isChinese ? `现在提醒用户确认这次用药：${dose}。` : `Prompt the user to confirm this scheduled dose now: ${dose}.`;
}
function buildSafetyContext(circleFacts, isChinese) {
	return `${isChinese ? "以下是这个圈子的位置与安全区事实。回答位置相关问题时只用这些事实，不要编造；缺失就直接说明。" : "The facts below are this circle's location and safe-zone data. For location questions use only these facts, never invent them, and say plainly when something is missing."}\n\n${isChinese ? "圈子事实" : "Circle facts"}:\n${circleFacts}`;
}
function buildCareGroupHelpRequest(question, groupName, isChinese) {
	return isChinese ? `用户正在使用护理群组${groupName ? `“${groupName}”` : ""}。可以解释群组内的首页、日历、任务、被护理者位置、对话、公告、祝福、相册、群组被护理者、成员、邀请成员、子群组和群组设置怎么用；不确定就直接说明。${question ? `问题：${question}` : ""}` : `The user is using their care group${groupName ? ` “${groupName}”` : ""}. You may explain how its Home, Calendar, Tasks, Cared One's Location, Messages, Announcements, Well Wishes, Gallery, Group Cared Ones, Members, Invite Members, Member Groups, and Group Setting features work, and say plainly when unsure.${question ? ` Question: ${question}` : ""}`;
}
function buildBriefingRequest(data, isChinese) {
	return isChinese ? `只根据数据写今日家庭护理简报，不编造安排。没有用药或签到安排时直接说明；有安排则说明时间和事项；任务仅在存在时提及。严格返回 JSON：{"alerts":[{"level":"high|medium|low","text":"..."}],"summary":"2-3 句中文，直接说今天几点做什么","suggestions":[{"title":"...","detail":"..."}]}\n数据：${data}` : `Write today's family-care briefing only from the data; never invent a schedule. State plainly when no medicine or check-in is scheduled; otherwise give each time and item. Mention tasks only when present. Return strict JSON: {"alerts":[{"level":"high|medium|low","text":"..."}],"summary":"2–3 sentences saying what is due and when","suggestions":[{"title":"...","detail":"..."}]}\nData: ${data}`;
}
/**
* What the signed-in viewer may see about a cared one.
*  - "full": the viewer is a caregiver of this person, or a member of a care
*    group that this person belongs to.
*  - "shared-card": the viewer opened a shared information card (no account
*    relationship) — only what is printed on that card.
*  - "none": no relationship, nothing is attached.
*/
async function resolveCaredOneAccess(caredOneId, opts = {}) {
	if (!caredOneId) return "none";
	if (opts.sharedCard) return "shared-card";
	try {
		const { wpFetchCaredOnes } = await import("../_libs/_4.mjs").then((n) => n.r);
		if ((await wpFetchCaredOnes()).some((c) => String(c.user_id) === String(caredOneId))) return "full";
	} catch {}
	try {
		const { wpFetchCareGroups } = await import("../_libs/_4.mjs").then((n) => n.r);
		const groups = await wpFetchCareGroups();
		const { fetchGroupCaredOneIdsWordPress } = await import("../_libs/_15.mjs").then((n) => n.N).catch(() => ({}));
		if (typeof fetchGroupCaredOneIdsWordPress === "function") {
			for (const g of groups) if ((await fetchGroupCaredOneIdsWordPress(String(g.id)).catch(() => [])).some((id) => String(id) === String(caredOneId))) return "full";
		}
	} catch {}
	return "none";
}
/** Whether the viewer is a member of this care group. */
async function resolveGroupAccess(groupId) {
	if (!groupId) return "none";
	try {
		const { wpFetchCareGroups } = await import("../_libs/_4.mjs").then((n) => n.r);
		return (await wpFetchCareGroups()).some((g) => String(g.id) === String(groupId)) ? "full" : "none";
	} catch {
		return "none";
	}
}
/** Who the viewer is, plus the people and groups they are connected to. */
async function resolveViewerFacts({ isChinese }) {
	try {
		const { wpFetchCaredOnes, wpFetchCareGroups } = await import("../_libs/_4.mjs").then((n) => n.r);
		const { fetchMyProfileWordPress } = await import("../_libs/_3.mjs").then((n) => n.n);
		const [caredOnes, groups, profile] = await Promise.all([
			wpFetchCaredOnes().catch(() => []),
			wpFetchCareGroups().catch(() => []),
			fetchMyProfileWordPress().catch(() => null)
		]);
		const role = [].concat(profile?.general_user_role || []).map((r) => String(r).toLowerCase()).some((r) => r.includes("cared")) ? Z(isChinese, "账号登记为被护理者本人（只是起始假设，可随对话改变）", "account is registered as the person being cared for (starting assumption only; it may change during the conversation)") : Z(isChinese, "账号登记为护理者（只是起始假设，可随对话改变）", "account is registered as a caregiver (starting assumption only; it may change during the conversation)");
		return join([
			line(Z(isChinese, "今天日期", "Today"), (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)),
			line(Z(isChinese, "当前用户身份", "Who is signed in"), role),
			line(Z(isChinese, "我照护的人", "People I care for"), caredOnes.map((c) => c.cared_one?.full_name).filter(Boolean).join("、") || Z(isChinese, "无", "none")),
			line(Z(isChinese, "我的护理群组", "My care groups"), groups.map((g) => g.name).filter(Boolean).join("、") || Z(isChinese, "无", "none"))
		]);
	} catch {
		return "";
	}
}
/** Medicine: schedule summary + today's adherence. Aggregated, never raw logs. */
async function resolveMedicineFacts(caredOneId, { isChinese }) {
	try {
		const { fetchMedicinesWordPress, fetchTodayMedicineLogsWordPress } = await import("../_libs/_13.mjs").then((n) => n.c);
		const [meds, logs] = await Promise.all([fetchMedicinesWordPress(caredOneId).catch(() => []), fetchTodayMedicineLogsWordPress(caredOneId).catch(() => [])]);
		const schedule = meds.slice(0, 20).map((m) => `${m.name}${m.dosage ? ` ${m.dosage}` : ""}${m.time_slot?.length ? ` @ ${m.time_slot.join(",")}` : ""}`).join("; ");
		const taken = logs.filter((l) => String(l.status || "").includes("taken")).length;
		const skipped = logs.length - taken;
		return join([line(Z(isChinese, "用药安排", "Medicine schedule"), schedule || Z(isChinese, "未设置", "none set")), line(Z(isChinese, "今日用药记录", "Today's medicine log"), `${Z(isChinese, "已服用", "taken")} ${taken} / ${Z(isChinese, "跳过或未记录", "skipped or unlogged")} ${skipped}`)]);
	} catch {
		return "";
	}
}
/** Check-ins: what is scheduled and today's result. */
async function resolveCheckInFacts(caredOneId, { isChinese }) {
	try {
		const { fetchCheckinsWordPress, fetchTodayCheckinLogsWordPress } = await import("../_libs/_14.mjs").then((n) => n.E);
		const [checkins, logs] = await Promise.all([fetchCheckinsWordPress(caredOneId).catch(() => []), fetchTodayCheckinLogsWordPress(caredOneId).catch(() => [])]);
		return join([line(Z(isChinese, "探望签到安排", "Check-ins scheduled"), checkins.slice(0, 10).map((c) => `${c.name || c.title || ""}${c.time ? ` @ ${c.time}` : ""}`).filter(Boolean).join("; ") || Z(isChinese, "未设置", "none set")), line(Z(isChinese, "今日签到", "Today's check-ins"), logs.length ? logs.slice(0, 5).map((l) => `${l.status || ""} ${String(l.summary || "").slice(0, 120)}`.trim()).join(" | ") : Z(isChinese, "今天还没有签到记录", "no check-in recorded yet today"))]);
	} catch {
		return "";
	}
}
/**
* Location: latest position, safe zones, and — for "where is he usually?" —
* a frequency summary over a wider window instead of hundreds of raw points.
*/
async function resolveLocationFacts(caredOneId, { isChinese }, opts = {}) {
	try {
		const { fetchCurrentLocation, fetchLocationHistory } = await import("../_libs/_17.mjs").then((n) => n.i);
		const { fetchSafeZonesWordPress } = await import("../_libs/_19.mjs").then((n) => n.g);
		const [current, zones] = await Promise.all([fetchCurrentLocation(caredOneId).catch(() => null), fetchSafeZonesWordPress(caredOneId).catch(() => [])]);
		let pattern = "";
		if (opts.pattern) {
			const sinceDays = opts.sinceDays ?? 30;
			pattern = summarizeLocationPattern(await fetchLocationHistory(caredOneId, {
				limit: 500,
				since: (/* @__PURE__ */ new Date(Date.now() - sinceDays * 864e5)).toISOString()
			}).catch(() => []), zones, isChinese);
		}
		return join([
			line(Z(isChinese, "最新位置", "Latest location"), current ? `${current.address || `${current.latitude}, ${current.longitude}`}${current.captured_at ? ` (${current.captured_at})` : ""}` : Z(isChinese, "暂无位置数据", "no location data")),
			line(Z(isChinese, "安全区", "Safe zones"), zones.slice(0, 10).map((z) => z.zone_name || z.name).filter(Boolean).join("、") || Z(isChinese, "未设置", "none set")),
			pattern
		]);
	} catch {
		return "";
	}
}
/** Turns hundreds of points into a handful of percentages. */
function summarizeLocationPattern(history, zones, isChinese) {
	if (!history.length) return "";
	const bucket = /* @__PURE__ */ new Map();
	for (const p of history) {
		const zone = zones.find((z) => {
			const r = Number(z.radius_meters || 200);
			const d = haversine(Number(p.latitude), Number(p.longitude), Number(z.latitude), Number(z.longitude));
			return Number.isFinite(d) && d <= r;
		});
		const key = zone?.zone_name || zone?.name || Z(isChinese, "其他地点", "elsewhere");
		bucket.set(key, (bucket.get(key) || 0) + 1);
	}
	const total = history.length;
	const top = [...bucket.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, n]) => `${k} ${Math.round(n / total * 100)}%`).join("、");
	return line(Z(isChinese, "常出现的地点（近一个月）", "Where they usually are (last month)"), top);
}
function haversine(lat1, lon1, lat2, lon2) {
	if (![
		lat1,
		lon1,
		lat2,
		lon2
	].every(Number.isFinite)) return NaN;
	const R = 6371e3;
	const dLat = (lat2 - lat1) * Math.PI / 180;
	const dLon = (lon2 - lon1) * Math.PI / 180;
	const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
	return 2 * R * Math.asin(Math.sqrt(a));
}
/** Tasks assigned to or created by the viewer, counts plus the next few. */
async function resolveTaskFacts({ isChinese }) {
	try {
		const { wpFetchCareTasks } = await import("../_libs/_4.mjs").then((n) => n.r);
		const { fetchUserCaredOnesWordPress } = await import("../_libs/_9.mjs").then((n) => n.n);
		const [tasks, caredOnes] = await Promise.all([wpFetchCareTasks().catch(() => []), fetchUserCaredOnesWordPress().catch(() => [])]);
		const mine = new Set((caredOnes || []).map((c) => String(c.user_id).replace(/^wp-/, "")));
		const open = tasks.filter((t) => {
			const co = String(t.cared_one_id ?? "").replace(/^wp-/, "");
			return !!co && mine.has(co) && t.status !== "completed";
		});
		return join([line(Z(isChinese, "未完成任务数", "Open tasks"), open.length), line(Z(isChinese, "最近的任务", "Next tasks"), open.slice(0, 5).map((t) => `${t.title}${t.due_date ? ` (${t.due_date})` : ""}`).join("; "))]);
	} catch {
		return "";
	}
}
/**
* Dashboard smart-briefing facts. The dashboard page renders only; every read
* and every permission decision happens here.
*/
async function resolveBriefingFacts({ isChinese }) {
	const [viewer, tasks] = await Promise.all([resolveViewerFacts({ isChinese }), resolveTaskFacts({ isChinese })]);
	let bookings = "";
	let unread = "";
	let schedules = "";
	try {
		const { fetchUserCaredOnesWordPress } = await import("../_libs/_9.mjs").then((n) => n.n);
		const people = await fetchUserCaredOnesWordPress();
		schedules = (await Promise.all(people.map(async (person) => {
			const id = String(person.user_id).replace(/^wp-/, "");
			const [medicine, checkins] = await Promise.all([resolveMedicineFacts(id, { isChinese }), resolveCheckInFacts(id, { isChinese })]);
			return join([
				person.cared_one?.full_name,
				medicine,
				checkins
			]);
		}))).join("\n");
	} catch {}
	try {
		const { wpFetchBookings } = await import("../_libs/_4.mjs").then((n) => n.r);
		const list = await wpFetchBookings().catch(() => []);
		const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		const next = list.filter((b) => String(b.appointment_date || b.start_time || "").slice(0, 10) >= today).slice(0, 5).map((b) => `${b.service_name || b.title || ""} ${b.appointment_date || b.start_time || ""}`.trim()).filter(Boolean);
		bookings = line(Z(isChinese, "接下来的预约", "Upcoming bookings"), next.join("; "));
	} catch {}
	try {
		const { wpFetchConversations } = await import("../_libs/_4.mjs").then((n) => n.r);
		const n = (await wpFetchConversations().catch(() => [])).reduce((sum, c) => sum + Number(c.unread_count || 0), 0);
		unread = line(Z(isChinese, "未读消息", "Unread messages"), n);
	} catch {}
	return join([
		viewer,
		tasks,
		schedules,
		bookings,
		unread
	]);
}
/** Group facts, gated on membership. */
async function resolveGroupFacts(groupId, groupName, { isChinese }) {
	if (await resolveGroupAccess(groupId) !== "full") return line(Z(isChinese, "当前群组", "Current group"), groupName || Z(isChinese, "未指定", "unspecified"));
	try {
		const { wpFetchCareGroups } = await import("../_libs/_4.mjs").then((n) => n.r);
		const g = (await wpFetchCareGroups()).find((x) => String(x.id) === String(groupId));
		return join([
			line(Z(isChinese, "群组名称", "Group name"), g?.name || groupName),
			line(Z(isChinese, "群组说明", "Group description"), g?.description),
			line(Z(isChinese, "私密性", "Privacy"), g?.is_private ? Z(isChinese, "私密群组", "private") : Z(isChinese, "公开群组", "open"))
		]);
	} catch {
		return line(Z(isChinese, "群组名称", "Group name"), groupName);
	}
}
/**
* Settings: read straight off the SETTING SKILLS registry at the bottom of this
* same file, which also performs the writes. One structure, one file.
*/
async function resolveSettingFacts({ isChinese }) {
	try {
		const skills = settingSkillsForApp().filter((s) => s.kind !== "action");
		const current = await fetchAppSettings().catch(() => null);
		const rows = skills.map((s) => {
			const value = current && s.readFrom ? s.readFrom(current) : void 0;
			const shown = typeof value === "boolean" ? Z(isChinese, value ? "开" : "关", value ? "on" : "off") : value == null ? Z(isChinese, "未设置", "not set") : String(value);
			const where = s.storage === "backend" ? Z(isChinese, "保存在账号里", "saved to the account") : s.storage === "local" ? Z(isChinese, "只保存在这台设备", "this device only") : Z(isChinese, "设备权限", "device permission");
			const allowed = s.kind === "switch" ? "true / false" : s.kind === "time" ? "HH:MM" : (s.options?.(isChinese) ?? []).map((o) => o.value).join(" / ");
			return `- ${s.name} — ${s.label(isChinese)}（${where}${allowed ? `; ${Z(isChinese, "可选值", "allowed")}: ${allowed}` : ""}）: ${shown}`;
		});
		return join([Z(isChinese, "用户设置全部保存在同一处（扩展资料 CCT 151 的应用设置 JSON）。要修改设置时，只能使用下面列出的 skill 名，并给出允许值：", "All user settings live in one place (the app-settings JSON on extended profile CCT 151). To change one, use only the skill names listed below with an allowed value:"), ...rows]);
	} catch {
		return "";
	}
}
/** Cheap, deterministic intent detection. Rules, not a model. */
function needs(question) {
	const q = (question || "").toLowerCase();
	const has = (...terms) => terms.some((t) => q.includes(t));
	return {
		medicine: has("medicine", "medication", "dose", "pill", "用药", "吃药", "药"),
		checkIn: has("check-in", "checkin", "check in", "visit", "签到", "探望"),
		location: has("location", "where", "gps", "zone", "位置", "在哪", "定位", "安全区"),
		pattern: has("usually", "often", "pattern", "常", "经常", "一般在", "平时"),
		tasks: has("task", "todo", "任务", "待办"),
		settings: has("setting", "notification", "notify", "language", "theme", "dark mode", "text size", "quiet hours", "permission", "设置", "通知", "提醒方式", "语言", "主题", "字号", "免打扰", "权限")
	};
}
/**
* The one entry point AI surfaces call. It picks the static snippets that match
* the question and attaches only the permitted dynamic facts the question needs.
*/
async function resolveAssistantContext(input) {
	const { question, isChinese, caredOneId, groupId, groupName, topics, sharedCard } = input;
	const lang = { isChinese };
	const want = needs(question);
	const staticPart = retrieveStaticKnowledge(question, {
		topics,
		isChinese,
		fallbackToIndex: false
	});
	const dynamic = [];
	const access = await resolveCaredOneAccess(caredOneId, { sharedCard });
	if (access === "full" && caredOneId) {
		const [med, chk, loc] = await Promise.all([
			want.medicine ? resolveMedicineFacts(caredOneId, lang) : Promise.resolve(""),
			want.checkIn ? resolveCheckInFacts(caredOneId, lang) : Promise.resolve(""),
			want.location ? resolveLocationFacts(caredOneId, lang, { pattern: want.pattern }) : Promise.resolve("")
		]);
		dynamic.push(med, chk, loc);
	} else if (access === "none" && caredOneId && (want.medicine || want.checkIn || want.location)) dynamic.push(Z(isChinese, "权限说明", "Access note") + ": " + Z(isChinese, "当前用户没有查看这位被护理者详细记录的权限，请说明无法提供，并建议联系家属。", "The viewer is not allowed to see this person's detailed records — say so plainly and suggest contacting the family."));
	if (want.tasks) dynamic.push(await resolveTaskFacts(lang));
	if (want.settings && !sharedCard) dynamic.push(await resolveSettingFacts(lang));
	if (groupId || groupName) dynamic.push(await resolveGroupFacts(groupId, groupName, lang));
	if (!sharedCard) dynamic.push(await resolveViewerFacts(lang));
	const facts = dynamic.filter(Boolean).join("\n");
	return [staticPart, facts ? `${isChinese ? "以下是从数据库读取的、当前用户有权查看的事实。回答相关问题时只使用这些事实，缺少的就直接说明，不要编造。" : "The facts below were read from the database and are what this viewer is allowed to see. Use only these for data questions, say plainly when something is missing, and never invent values."}\n\n${facts}` : ""].filter(Boolean).join("\n\n");
}
/** The three sub-apps this backend serves. */
var KNOWN_APPS = [
	"challenged",
	"carecnc",
	"notchsafety"
];
/** Edge / server callers must name their app; unknown names are refused. */
function appScopeFromEdge(appName) {
	const n = String(appName || "").toLowerCase();
	if (n === "carecnc") return "carecnc";
	if (n === "challenged" || n === "notchsafety") return "challenged";
	throw new Error(`Unknown app "${appName}". Allowed: ${KNOWN_APPS.join(", ")}`);
}
var DEFAULT_APP_SETTINGS = {
	notifications: {
		push: false,
		email: true,
		sms: false,
		muted_types: []
	},
	display: {
		theme: "system",
		text_size: "default",
		reduce_motion: false,
		help_bubble: true
	},
	permissions_asked: {}
};
function mergeSettings(raw) {
	const d = DEFAULT_APP_SETTINGS;
	return {
		notifications: {
			...d.notifications,
			...raw?.notifications ?? {}
		},
		display: {
			...d.display,
			...raw?.display ?? {}
		},
		permissions_asked: {
			...d.permissions_asked,
			...raw?.permissions_asked ?? {}
		}
	};
}
/**
* Read / write of this app's settings. The JSON blob lives on column a87 of the
* user's single row for this app (a01), and the "?" help button state lives on
* its own column a92 — see features/shared/app-profile.ts.
*/
async function fetchAppSettings(_scope = currentAppScope()) {
	const [json, helpVisible] = await Promise.all([fetchAppSettingsJson().catch(() => null), fetchHelpBubbleVisible().catch(() => true)]);
	const merged = mergeSettings(json);
	merged.display.help_bubble = helpVisible;
	return merged;
}
async function saveAppSettings(patch, _scope = currentAppScope()) {
	const current = await fetchAppSettings();
	const next = mergeSettings({
		...current,
		...patch
	});
	if (next.display.help_bubble !== current.display.help_bubble) await saveHelpBubbleVisible(next.display.help_bubble);
	await saveAppSettingsJson(next);
	return next;
}
/** Puts the display half of the settings on screen at once. */
function applyDisplaySettings(display) {
	const root = document.documentElement;
	root.classList.remove("text-size-large", "text-size-xlarge");
	if (display.text_size === "large") root.classList.add("text-size-large");
	if (display.text_size === "xlarge") root.classList.add("text-size-xlarge");
	root.classList.toggle("reduce-motion", !!display.reduce_motion);
}
var LANGUAGES = [
	{
		code: "en",
		flag: "🇺🇸"
	},
	{
		code: "zh-CN",
		flag: "🇨🇳"
	},
	{
		code: "zh-TW",
		flag: "🇹🇼"
	},
	{
		code: "ja",
		flag: "🇯🇵"
	},
	{
		code: "ko",
		flag: "🇰🇷"
	},
	{
		code: "es",
		flag: "🇪🇸"
	},
	{
		code: "fr",
		flag: "🇫🇷"
	},
	{
		code: "de",
		flag: "🇩🇪"
	},
	{
		code: "pt",
		flag: "🇧🇷"
	},
	{
		code: "hi",
		flag: "🇮🇳"
	},
	{
		code: "ar",
		flag: "🇸🇦"
	},
	{
		code: "vi",
		flag: "🇻🇳"
	},
	{
		code: "th",
		flag: "🇹🇭"
	},
	{
		code: "id",
		flag: "🇮🇩"
	},
	{
		code: "tl",
		flag: "🇵🇭"
	},
	{
		code: "ru",
		flag: "🇷🇺"
	},
	{
		code: "it",
		flag: "🇮🇹"
	}
];
var channelSkill = (key, name, zh, en, zhHint, enHint) => ({
	name,
	group: "channels",
	kind: "switch",
	storage: "backend",
	apps: "all",
	label: (cn) => Z(cn, zh, en),
	hint: (cn) => Z(cn, zhHint, enHint),
	readFrom: (s) => s.notifications[key],
	patch: (s, value) => ({ notifications: {
		...s.notifications,
		[key]: value
	} })
});
var categorySkill = (key, name, zh, en, zhHint, enHint, opts = {}) => ({
	name,
	group: "categories",
	kind: "switch",
	storage: "backend",
	apps: "all",
	locked: opts.locked,
	label: (cn) => Z(cn, zh, en),
	hint: (cn) => Z(cn, zhHint, enHint),
	readFrom: (s) => !s.notifications.muted_types.includes(key),
	patch: (s, value) => {
		const muted = new Set(s.notifications.muted_types);
		value ? muted.delete(key) : muted.add(key);
		return { notifications: {
			...s.notifications,
			muted_types: [...muted]
		} };
	}
});
var quietDefaults = {
	enabled: false,
	from: "22:00",
	to: "07:00"
};
var quietOf = (s) => ({
	...quietDefaults,
	...s.notifications.quiet_hours ?? {}
});
var SETTING_SKILLS = [
	{
		name: "set-personal-profile",
		group: "profile",
		kind: "form",
		storage: "backend",
		apps: "all",
		label: (cn) => Z(cn, "个人资料（姓名、头像、地区）", "Personal details (name, photo, area)"),
		read: async () => {
			const { fetchMyProfileWordPress } = await import("../_libs/_3.mjs").then((n) => n.n);
			return await fetchMyProfileWordPress();
		},
		run: async (value) => {
			const { updateProfileWordPress } = await import("../_libs/_3.mjs").then((n) => n.n);
			await updateProfileWordPress(value);
		},
		perApp: {
			challenged: "CCT 151/258; display name in the per-app name column",
			carecnc: "same row; CareCNC name column"
		}
	},
	channelSkill("push", "set-alerts-on-phone", "手机提醒", "Phone alerts", "直接弹在你手机或电脑上", "Pop up on your phone or computer"),
	channelSkill("email", "set-alerts-by-email", "邮件", "Email", "发到你注册时用的邮箱", "Sent to the email address on your account"),
	channelSkill("sms", "set-alerts-by-text", "短信", "Text message", "只在紧急情况下发，比如老人走失", "Only for urgent things, such as a loved one going missing"),
	categorySkill("chat", "set-category-messages", "消息", "Messages", "家人或护理者给你发新消息时", "When family or a caregiver sends you a new message"),
	categorySkill("booking", "set-category-appointments", "预约", "Appointments", "预约被接受、确认或取消时", "When an appointment is accepted, confirmed or cancelled"),
	categorySkill("check_in", "set-category-visits", "探望与签到", "Visits and check-ins", "到了该去看看老人、该签到的时候", "Reminders when it is time to visit or check in"),
	categorySkill("medicine", "set-category-medicine", "吃药提醒", "Medicine reminders", "到了吃药或日常安排的时间", "When it is time for medicine or a daily routine"),
	categorySkill("location", "set-category-safety-alerts", "走失提醒", "Safety alerts", "老人走出安全范围时马上告诉你，这一项不能关", "If your loved one leaves the area you marked as safe — this one cannot be switched off", { locked: true }),
	categorySkill("system", "set-category-account", "账号消息", "Account messages", "登录、密码和账号安全相关的通知", "Sign-in, password and account safety notices"),
	{
		name: "set-quiet-hours",
		group: "quiet",
		kind: "switch",
		storage: "backend",
		apps: "all",
		label: (cn) => Z(cn, "夜里不要打扰我", "Do not disturb at night"),
		hint: (cn) => Z(cn, "走失这类紧急提醒仍然会发。", "Urgent alerts, such as a loved one going missing, still come through."),
		readFrom: (s) => quietOf(s).enabled,
		patch: (s, value) => ({ notifications: {
			...s.notifications,
			quiet_hours: {
				...quietOf(s),
				enabled: value
			}
		} })
	},
	{
		name: "set-quiet-hours-start",
		group: "quiet",
		kind: "time",
		storage: "backend",
		apps: "all",
		label: (cn) => Z(cn, "从", "From"),
		readFrom: (s) => quietOf(s).from,
		patch: (s, value) => ({ notifications: {
			...s.notifications,
			quiet_hours: {
				...quietOf(s),
				from: value
			}
		} })
	},
	{
		name: "set-quiet-hours-end",
		group: "quiet",
		kind: "time",
		storage: "backend",
		apps: "all",
		label: (cn) => Z(cn, "到", "Until"),
		readFrom: (s) => quietOf(s).to,
		patch: (s, value) => ({ notifications: {
			...s.notifications,
			quiet_hours: {
				...quietOf(s),
				to: value
			}
		} })
	},
	{
		name: "set-text-size",
		group: "display",
		kind: "choice",
		storage: "backend",
		apps: "all",
		label: (cn) => Z(cn, "字的大小", "Text size"),
		options: (cn) => [
			{
				value: "default",
				label: Z(cn, "标准", "Standard")
			},
			{
				value: "large",
				label: Z(cn, "大", "Large")
			},
			{
				value: "xlarge",
				label: Z(cn, "特大", "Extra large")
			}
		],
		readFrom: (s) => s.display.text_size,
		patch: (s, value) => ({ display: {
			...s.display,
			text_size: value
		} })
	},
	{
		name: "set-reduce-motion",
		group: "display",
		kind: "switch",
		storage: "backend",
		apps: "all",
		label: (cn) => Z(cn, "减少晃动效果", "Reduce movement"),
		hint: (cn) => Z(cn, "关掉画面的滑动和淡入淡出，看着更稳。", "Turns off sliding and fading, which can feel steadier."),
		readFrom: (s) => s.display.reduce_motion,
		patch: (s, value) => ({ display: {
			...s.display,
			reduce_motion: value
		} })
	},
	{
		name: "set-help-bubble",
		group: "display",
		kind: "switch",
		storage: "backend",
		apps: "all",
		label: (cn) => Z(cn, "显示“问号”帮助按钮", "Show the “?” help button"),
		hint: (cn) => Z(cn, "右下角的小问号。不知道怎么用这个应用时，点它问一句就行。", "The small “?” in the corner. Tap it to ask how to use this app."),
		readFrom: (s) => s.display.help_bubble,
		patch: (s, value) => ({ display: {
			...s.display,
			help_bubble: value
		} })
	},
	{
		name: "set-language",
		group: "language",
		kind: "choice",
		storage: "local",
		apps: "all",
		label: (cn) => Z(cn, "语言", "Language"),
		options: () => LANGUAGES.map((l) => ({
			value: l.code,
			label: `${l.flag} ${l.code}`
		})),
		readFrom: () => {
			try {
				return localStorage.getItem("i18nextLng") || "en";
			} catch {
				return "en";
			}
		},
		run: async (value) => {
			try {
				localStorage.setItem("i18nextLng", value);
			} catch {}
			await (await import("../_libs/_25.mjs").then((n) => n.n)).default?.changeLanguage?.(value);
		}
	},
	{
		name: "set-permission-phone-alerts",
		group: "permissions",
		kind: "permission",
		storage: "device",
		apps: "all",
		permission: "push",
		label: (cn) => Z(cn, "手机提醒", "Phone alerts"),
		hint: (cn) => Z(cn, "允许后，即使没打开这个应用也能收到提醒", "Lets us reach you even when the app is closed"),
		readFrom: (s) => !!s.permissions_asked.push,
		patch: (s, value) => ({ permissions_asked: {
			...s.permissions_asked,
			push: value
		} })
	},
	{
		name: "set-permission-location",
		group: "permissions",
		kind: "permission",
		storage: "device",
		apps: "all",
		permission: "location",
		label: (cn) => Z(cn, "位置", "Location"),
		hint: (cn) => Z(cn, "用来看老人在哪里，以及是否走出安全范围", "Used to show where your loved one is and whether they left the safe area"),
		readFrom: (s) => !!s.permissions_asked.location,
		patch: (s, value) => ({ permissions_asked: {
			...s.permissions_asked,
			location: value
		} })
	},
	{
		name: "set-permission-calendar",
		group: "permissions",
		kind: "permission",
		storage: "device",
		apps: "all",
		permission: "calendar",
		label: (cn) => Z(cn, "日历", "Calendar"),
		hint: (cn) => Z(cn, "可选：把探望安排一起写进你手机的日历", "Optional: also writes visits into your phone's own calendar"),
		readFrom: (s) => !!s.permissions_asked.calendar,
		patch: (s, value) => ({ permissions_asked: {
			...s.permissions_asked,
			calendar: value
		} })
	},
	{
		name: "download-my-data",
		group: "privacy",
		kind: "action",
		storage: "backend",
		apps: "all",
		label: (cn) => Z(cn, "下载我的数据", "Download my data"),
		run: async () => {
			const { fetchMyProfileWordPress } = await import("../_libs/_3.mjs").then((n) => n.n);
			const [profile, settings] = await Promise.all([fetchMyProfileWordPress().catch(() => null), fetchAppSettings().catch(() => null)]);
			return {
				exported_at: (/* @__PURE__ */ new Date()).toISOString(),
				profile: profile ? {
					full_name: profile.full_name,
					email: profile.email,
					phone: profile.phone,
					location: profile.location,
					bio: profile.bio,
					avatar_url: profile.avatar_url,
					general_user_role: profile.general_user_role
				} : null,
				settings
			};
		}
	},
	{
		name: "close-my-account",
		group: "privacy",
		kind: "action",
		storage: "backend",
		apps: "all",
		label: (cn) => Z(cn, "注销账号", "Close my account"),
		run: async () => {
			const { wpDeleteAccount } = await import("../_libs/_.mjs").then((n) => n.f);
			await wpDeleteAccount();
		}
	},
	{
		name: "set-provider-availability",
		group: "provider",
		kind: "form",
		storage: "backend",
		apps: ["challenged", "carecnc"],
		label: (cn) => Z(cn, "可预约时间", "Bookable hours"),
		read: async () => {
			const { getProviderCalendarAvailability } = await import("../_libs/_34.mjs").then((n) => n.t);
			const me = getCurrentUserIdNumber();
			if (!me) return null;
			return await getProviderCalendarAvailability(String(me));
		},
		run: async (value) => {
			const { upsertProviderCalendarAvailability } = await import("../_libs/_34.mjs").then((n) => n.t);
			const providerId = value?.providerId || String(getCurrentUserIdNumber() ?? "");
			if (!providerId) throw new Error("set-provider-availability needs the signed-in provider");
			await upsertProviderCalendarAvailability(providerId, value?.slots ?? []);
		}
	},
	{
		name: "set-location-sharing",
		group: "location",
		kind: "form",
		storage: "backend",
		apps: "all",
		label: (cn) => Z(cn, "把我的位置分享给护理团队", "Share my location with my care team"),
		hint: (cn) => Z(cn, "开启后会写入当前位置并检查安全区（CCT 213 / 214）。", "Turning it on writes the current position and checks the safe areas (CCT 213 / 214)."),
		run: async (value) => {
			if (!(typeof value === "boolean" ? value : !!value?.enabled)) {
				const { disableMyLocationSharingWordPress } = await import("../_libs/_19.mjs").then((n) => n.g);
				await disableMyLocationSharingWordPress();
				return;
			}
			const { getCurrentPosition } = await import("../_libs/_27.mjs").then((n) => n.t);
			const pos = await getCurrentPosition({ timeout: 1e4 });
			if (!pos) throw new Error("Could not read this device's location");
			const { writeLocationAndCheckZones } = await import("../_libs/_17.mjs").then((n) => n.i);
			await writeLocationAndCheckZones(pos.latitude, pos.longitude, {
				accuracy: pos.accuracy,
				is_cared_one: !!value?.isCaredOne
			});
		}
	},
	{
		name: "set-safe-zone-alerts",
		group: "location",
		kind: "form",
		storage: "backend",
		apps: "all",
		label: (cn) => Z(cn, "安全区的进入 / 离开提醒", "Arrive and leave alerts for a safe area"),
		hint: (cn) => Z(cn, "每个安全区各有两个开关。", "Each safe area has its own two switches."),
		run: async (value) => {
			const { updateSafeZoneWordPress } = await import("../_libs/_19.mjs").then((n) => n.g);
			const { zoneId, ...updates } = value;
			if (!zoneId) throw new Error("set-safe-zone-alerts needs a zoneId");
			await updateSafeZoneWordPress(String(zoneId), updates);
		}
	}
];
var SETTING_GROUPS = [
	{
		id: "profile",
		title: (cn) => Z(cn, "个人资料", "Personal details"),
		description: (cn) => Z(cn, "别人在圈子里看到的就是这些。", "This is what other people in your circle see.")
	},
	{
		id: "channels",
		title: (cn) => Z(cn, "我们怎么联系你", "How we reach you"),
		description: (cn) => Z(cn, "关掉一项，我们就不会再用这个方式联系你。", "Switch one off and we will stop contacting you that way.")
	},
	{
		id: "categories",
		title: (cn) => Z(cn, "你想收到哪些提醒", "What you want to hear about"),
		description: (cn) => Z(cn, "这里的选择对上面每一种联系方式都有效。", "These choices apply to every way of contacting you above.")
	},
	{
		id: "quiet",
		title: (cn) => Z(cn, "免打扰时段", "Quiet hours"),
		description: (cn) => Z(cn, "这段时间里我们不发一般提醒。", "We hold back everyday reminders during these hours.")
	},
	{
		id: "display",
		title: (cn) => Z(cn, "看得清楚一点", "Making it easier to read"),
		description: (cn) => Z(cn, "这些改动马上生效，只影响你自己的界面。", "These take effect right away and only change what you see.")
	},
	{
		id: "language",
		title: (cn) => Z(cn, "语言", "Language"),
		description: (cn) => Z(cn, "只改这台设备上的显示语言。", "Changes the language on this device only.")
	},
	{
		id: "permissions",
		title: (cn) => Z(cn, "这台设备上的权限", "What this device allows"),
		description: (cn) => Z(cn, "只有你自己点了才会去问，随时可以改。", "We only ask when you tap, and you can change it any time.")
	},
	{
		id: "privacy",
		title: (cn) => Z(cn, "你的数据", "Your data"),
		description: (cn) => Z(cn, "随时可以带走或删除。", "You can take it with you or remove it at any time.")
	},
	{
		id: "provider",
		title: (cn) => Z(cn, "接单设置", "Taking bookings"),
		description: (cn) => Z(cn, "你提供的服务和可预约的时间。", "The services you offer and when you can be booked.")
	},
	{
		id: "location",
		title: (cn) => Z(cn, "位置与安全区", "Location and safe areas"),
		description: (cn) => Z(cn, "谁能看到位置，什么时候提醒你。", "Who can see the location, and when we alert you.")
	}
];
function settingSkill(name) {
	return SETTING_SKILLS.find((s) => s.name === name);
}
/** Every legal skill name. Handed to the AI verbatim, so it can never invent one. */
var SETTING_SKILL_NAMES = SETTING_SKILLS.map((s) => s.name);
function settingSkillAppliesTo(skill, scope = currentAppScope()) {
	return skill.apps === "all" || skill.apps.includes(scope);
}
function settingSkillsForApp(scope = currentAppScope()) {
	return SETTING_SKILLS.filter((s) => settingSkillAppliesTo(s, scope));
}
/** Every skill of one group that the running app shows. */
function settingSkillsInGroup(group, scope = currentAppScope()) {
	return SETTING_SKILLS.filter((s) => s.group === group && settingSkillAppliesTo(s, scope));
}
/**
* Guard for anything coming from outside (the AI above all). A wrong name, a
* wrong type or a value outside the declared options is refused here and never
* half-written.
*/
function validateSettingWrite(name, value) {
	const skill = settingSkill(name);
	if (!skill) return {
		ok: false,
		error: `Unknown setting skill: ${name}. Allowed: ${SETTING_SKILL_NAMES.join(", ")}`
	};
	if (!settingSkillAppliesTo(skill)) return {
		ok: false,
		error: `${name} is not available in this app`
	};
	if (skill.locked && value === false) return {
		ok: false,
		error: `${name} cannot be switched off`
	};
	if (skill.kind === "switch" && typeof value !== "boolean") return {
		ok: false,
		error: `${name} expects true or false`
	};
	if (skill.kind === "choice") {
		const allowed = (skill.options?.(false) ?? []).map((o) => o.value);
		if (allowed.length && !allowed.includes(String(value))) return {
			ok: false,
			error: `${name} expects one of: ${allowed.join(", ")}`
		};
	}
	if (skill.kind === "time" && !/^\d{2}:\d{2}$/.test(String(value))) return {
		ok: false,
		error: `${name} expects a time like 22:00`
	};
	return {
		ok: true,
		skill
	};
}
/** Current value of one skill, out of an already-fetched settings snapshot. */
function readSettingSkill(name, settings = DEFAULT_APP_SETTINGS) {
	const skill = settingSkill(name);
	return skill?.readFrom ? skill.readFrom(settings) : void 0;
}
/** Current value of a skill that reads on its own (profile, availability…). */
async function loadSettingSkill(name) {
	const skill = settingSkill(name);
	return skill?.read ? await skill.read() : void 0;
}
/**
* THE single write path for every setting, from any entry point (settings page,
* header button, language menu, AI assistant, edge caller).
*/
async function runSettingSkill(name, value, opts = {}) {
	const scope = opts.app ? appScopeFromEdge(opts.app) : currentAppScope();
	const checked = validateSettingWrite(name, value);
	if (checked.ok === false) throw new Error(checked.error);
	const skill = checked.skill;
	if (skill.run) {
		const result = await skill.run(value, scope);
		if (skill.patch) {
			const base = opts.settings ?? await fetchAppSettings(scope);
			return await saveAppSettings(skill.patch(base, value), scope);
		}
		return result ?? opts.settings ?? DEFAULT_APP_SETTINGS;
	}
	if (!skill.patch) return opts.settings ?? DEFAULT_APP_SETTINGS;
	const base = opts.settings ?? await fetchAppSettings(scope);
	const next = await saveAppSettings(skill.patch(base, value), scope);
	applyDisplaySettings(next.display);
	return next;
}
/** Ask the OS for a permission, then record that we asked. */
async function askPermissionSkill(name, settings) {
	const skill = settingSkill(name);
	if (!skill?.permission) throw new Error(`Not a permission skill: ${name}`);
	return {
		state: await requestPermission(skill.permission),
		settings: await runSettingSkill(name, true, { settings })
	};
}
async function permissionSkillStates() {
	const skills = SETTING_SKILLS.filter((s) => s.kind === "permission" && settingSkillAppliesTo(s));
	const states = await Promise.all(skills.map((s) => checkPermission(s.permission)));
	return Object.fromEntries(skills.map((s, i) => [s.name, states[i]]));
}
var WRITE_SKILL_NAMES = [
	"record-medicine-dose",
	"record-check-in",
	"save-care-tip"
];
var asStatus = (allowed, status) => status && allowed.includes(status) ? status : allowed[0];
function resolveWriteSkill(name, target, { isChinese }) {
	if (!WRITE_SKILL_NAMES.includes(name)) throw new Error(`Unknown write skill: ${name}`);
	const label = target.label || "";
	if (name === "record-medicine-dose") {
		const statuses = [
			"taken",
			"skipped",
			"no-response"
		];
		const dose = target.detail || label;
		const rule = Z(isChinese, `这是${label || "这次"}用药的记录对话。确认服用、跳过，或对方始终没有回应时，返回 JSON：{"done":true,"status":"taken|skipped|no-response","summary":"一两句说明"}。不要询问剂量以外的医疗判断。`, `This exchange records the ${label || "current"} dose. When it is confirmed taken, skipped, or the person never responds, return JSON: {"done":true,"status":"taken|skipped|no-response","summary":"one or two sentences"}. Do not give medical judgement beyond the dose.`);
		return {
			name,
			statuses,
			rule,
			title: Z(isChinese, "用药提醒", "Medicine reminder"),
			contextPrompt: [buildMedicineDoseContext(dose, isChinese), rule].join("\n\n"),
			starterPrompt: buildMedicineDoseStarter(dose, isChinese),
			starterFallback: Z(isChinese, `到了 ${label} 的用药时间。已经服用了吗？`, `It is time for ${label}. Has this dose been taken?`),
			toastFor: (status) => asStatus(statuses, status) === "taken" ? Z(isChinese, `${label} 已记录服用`, `${label} recorded as taken`) : Z(isChinese, `${label} 已跳过`, `${label} skipped`),
			write: async ({ status, summary }) => {
				const { logMedicineWordPress } = await import("../_libs/_13.mjs").then((n) => n.c);
				const { todayAtSlot } = await import("../_libs/_31.mjs").then((n) => n.t);
				await logMedicineWordPress({
					medicine_id: String(target.recordId),
					status: asStatus(statuses, status) === "taken" ? "taken" : "skipped",
					note: summary || void 0,
					user_id: target.caredOneId,
					scheduled_date: target.slot ? todayAtSlot(target.slot) : null
				});
			},
			invalidateKeys: [["medicineLogs"], ["todayMedicineLogs"]]
		};
	}
	if (name === "record-check-in") {
		const statuses = [
			"checked",
			"skipped",
			"no-response"
		];
		const rule = Z(isChinese, `这是${label || "本次"}签到对话。签到完成、对方选择跳过，或对方始终没有回应时，返回 JSON：{"done":true,"status":"checked|skipped|no-response","summary":"把问到的情况写成一两句"}。`, `This exchange is the ${label || "current"} check-in. When it is completed, skipped, or the person never responds, return JSON: {"done":true,"status":"checked|skipped|no-response","summary":"one or two sentences of what was reported"}.`);
		return {
			name,
			statuses,
			rule,
			title: Z(isChinese, "AI 签到", "AI Check-In"),
			contextPrompt: [buildCheckInContext(label || Z(isChinese, "签到", "Check-In"), target.detail || "", Z(isChinese, "被护理者", "the cared one"), isChinese), rule].join("\n\n"),
			starterPrompt: Z(isChinese, "现在请开始签到。", "Please start the check-in now."),
			starterFallback: Z(isChinese, "你好，到了签到时间。今天感觉怎么样？", "Hi, it is check-in time. How are you today?"),
			toastFor: () => Z(isChinese, "AI 签到已保存", "AI check-in saved"),
			write: async ({ status, summary }) => {
				const { logCheckinWordPress } = await import("../_libs/_14.mjs").then((n) => n.E);
				const s = asStatus(statuses, status);
				await logCheckinWordPress({
					checkin_id: String(target.recordId),
					status: s === "checked" ? "checked" : s === "skipped" ? "skipped" : "missed",
					note: summary || "",
					checked_by_ai: true,
					cared_one_id: target.caredOneId,
					checkin_name: label || void 0
				});
			},
			invalidateKeys: [["checkinLogs"], ["todayCheckinLogs"]]
		};
	}
	const statuses = ["saved", "discarded"];
	const tipRule = Z(isChinese, `当用户想把一条护理小贴士存下来时，返回 JSON：{"done":true,"status":"saved","summary":"小贴士正文"}；用户改主意就用 status "discarded"。`, `When the user wants a care tip saved, return JSON: {"done":true,"status":"saved","summary":"the tip text"}; use status "discarded" if they change their mind.`);
	return {
		name: "save-care-tip",
		statuses,
		rule: tipRule,
		title: Z(isChinese, "护理小贴士", "Care tip"),
		contextPrompt: tipRule,
		starterPrompt: Z(isChinese, "请帮我把这条护理小贴士整理好。", "Help me word this care tip."),
		starterFallback: Z(isChinese, "想记下哪一条护理小贴士？", "Which care tip would you like to save?"),
		toastFor: (status) => asStatus(statuses, status) === "saved" ? Z(isChinese, "小贴士已保存", "Care tip saved") : Z(isChinese, "已丢弃", "Discarded"),
		write: async ({ status, summary }) => {
			if (asStatus(statuses, status) !== "saved" || !summary) return;
			const { createCareTipWordPress } = await import("../_libs/_14.mjs").then((n) => n.E);
			await createCareTipWordPress({
				user_id: String(target.caredOneId),
				content: summary
			});
		},
		invalidateKeys: [["careTips"]]
	};
}
var NOTIFICATION_SKILL_NAMES = [
	"send-notification",
	"list-notifications",
	"mark-notification-read",
	"mark-all-notifications-read"
];
/** Semantic notification types the radio column accepts (aliases normalised). */
var NOTIFICATION_TYPES = [
	"chat",
	"task",
	"booking",
	"system",
	"location",
	"check_in",
	"medicine"
];
var NOTIFICATION_TYPE_ALIASES = {
	message: "chat",
	job: "system",
	community: "system",
	shared_task: "task",
	safe_zone: "location",
	safe_zone_breach: "location",
	location_alert: "location",
	location_request: "location",
	emergency_location_request: "location",
	sos: "location",
	checkin: "check_in"
};
function normalizeNotificationType(type) {
	const raw = String(type || "").trim();
	if (NOTIFICATION_TYPES.includes(raw)) return raw;
	return NOTIFICATION_TYPE_ALIASES[raw] ?? "system";
}
function notificationTarget(scope = currentAppScope()) {
	return {
		app: scope,
		cct: "notification",
		columns: {
			type: "a55",
			title: "a56",
			content: "a57",
			actionUrl: "a58",
			isRead: "a59"
		},
		relation: "user→notification"
	};
}
var stripWp = (id) => id == null ? "" : String(id).replace(/^wp-/, "");
/** Recipients minus the signed-in actor, de-duplicated, blanks dropped. */
async function notificationRecipients(ids) {
	let me = "";
	try {
		const { getStoredWPUser } = await import("../_libs/_.mjs").then((n) => n.f);
		me = stripWp(getStoredWPUser()?.user_id);
	} catch {}
	return [...new Set(ids.map(stripWp).filter(Boolean))].filter((id) => id !== me);
}
async function runNotificationSkill(name, params) {
	if (!NOTIFICATION_SKILL_NAMES.includes(name)) throw new Error(`Unknown notification skill: ${name}`);
	const source = await import("./source.wordpress-4K22Mifm.mjs");
	if (name === "send-notification") {
		const p = params;
		const targets = p?.includeSelf ? [...new Set((p.userIds ?? []).map(stripWp).filter(Boolean))] : await notificationRecipients(p?.userIds ?? []);
		if (targets.length === 0) return 0;
		const type = normalizeNotificationType(p.type);
		const title = String(p.title || "").trim();
		if (!title) throw new Error("send-notification requires a title");
		await Promise.all(targets.map((user_id) => source.createNotificationWordPress({
			user_id,
			type,
			title,
			message: String(p.message || ""),
			action_url: p.actionUrl ?? null
		}).catch(() => void 0)));
		return targets.length;
	}
	if (name === "list-notifications") {
		const rows = await source.fetchNotificationsWordPress();
		const wanted = params?.type ? normalizeNotificationType(params.type) : null;
		return rows.filter((r) => (!wanted || r.type === wanted) && (!params?.unreadOnly || !r.is_read));
	}
	if (name === "mark-notification-read") {
		const id = String(params?.id || "");
		if (!id) throw new Error("mark-notification-read requires an id");
		return source.markNotificationReadWordPress(id);
	}
	return source.markAllNotificationsReadWordPress();
}
//#endregion
export { resolveBriefingFacts as _, ai_dynamic_knowledge_exports as a, runSettingSkill as b, buildBriefingRequest as c, buildInfoSheetIntroduction as d, fetchAppSettings as f, resolveAssistantContext as g, permissionSkillStates as h, SETTING_GROUPS as i, buildCareGroupHelpRequest as l, openAppSettings as m, KNOWLEDGE as n, applyDisplaySettings as o, isNative as p, LANGUAGES as r, askPermissionSkill as s, DEFAULT_APP_SETTINGS as t, buildInfoSheetContext as u, resolveWriteSkill as v, settingSkillsInGroup as x, runNotificationSkill as y };
