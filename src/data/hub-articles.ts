/**
 * Front-end short articles for the AwareD / CareD / CopeD / SafeD / AccompanieD hubs.
 * One article per subcategory. Content lives here (front-end only). Each article has a
 * title-only anchor row in CCT 217 (see HUB_ARTICLE_CONTENT_IDS) so study notes (REL 256)
 * can attach to it. General education only — not medical advice.
 */
export type HubKey = "aware" | "care" | "cope" | "safe" | "accompany";

export interface HubArticle {
  key: string;
  hub: HubKey;
  sub: string;
  title: { en: string; zh: string };
  body: { en: string[]; zh: string[] };
  minutes: number;
}

const a = (hub: HubKey, sub: string, en: string, zh: string, bodyEn: string[], bodyZh: string[]): HubArticle => ({
  key: `${hub}-${sub}`, hub, sub, title: { en, zh }, body: { en: bodyEn, zh: bodyZh },
  minutes: Math.max(2, Math.round(bodyEn.join(" ").split(/\s+/).length / 180)),
});

export const HUB_ARTICLES: HubArticle[] = [
  // ───────── AwareD ─────────
  a("aware", "understanding", "What dementia is — and what it is not", "什么是失智症，什么不是",
    [
      "Dementia is not one disease. It is an umbrella term for a group of conditions that damage the brain over time and affect memory, thinking, language, judgement and behaviour badly enough to interfere with everyday life.",
      "It is not a normal part of ageing. Many older people keep a sharp mind into their nineties. Forgetting a name and remembering it later is common; forgetting that a conversation happened at all, again and again, is not.",
      "Dementia is progressive: symptoms usually get worse over months and years. But the person is still the same person. Their feelings, preferences, history and ability to enjoy life remain, even when words and memory fade.",
      "Understanding this helps carers respond with patience rather than frustration. The person is not being difficult on purpose — their brain is changing.",
    ],
    [
      "失智症不是单一疾病，而是一组会随时间损害大脑的病症的统称，会影响记忆、思考、语言、判断和行为，严重到干扰日常生活。",
      "失智症不是正常衰老。许多老人到九十多岁仍然头脑清楚。一时想不起名字、过后又想起来很常见；但反复完全忘记刚才说过的话，就不正常了。",
      "失智症是进行性的：症状通常会在数月到数年间逐渐加重。但这个人依然是他自己，他的感受、喜好、经历和享受生活的能力依然存在，即使言语和记忆在减退。",
      "理解这一点，能帮助护理者用耐心代替挫败感。对方不是故意为难你——是他的大脑在变化。",
    ]),
  a("aware", "types", "Common types and causes", "常见类型与病因",
    [
      "Alzheimer's disease is the most common cause, accounting for roughly 60–70% of cases. It usually starts with trouble remembering recent events.",
      "Vascular dementia follows reduced blood flow to the brain, often after strokes. Changes may appear in steps rather than gradually, and slowed thinking or planning problems are common.",
      "Dementia with Lewy bodies can bring vivid visual hallucinations, fluctuating alertness, movement stiffness and sleep disturbance. Frontotemporal dementia often starts younger and first changes personality, behaviour or language rather than memory.",
      "Many people have mixed dementia — more than one cause at once. Some memory problems are caused by treatable conditions such as thyroid problems, vitamin B12 deficiency, depression or medication side effects, which is why a proper assessment matters.",
    ],
    [
      "阿尔茨海默病是最常见的病因，约占 60–70%，通常从记不住最近发生的事开始。",
      "血管性失智症源于大脑供血减少，常发生在中风之后。变化可能呈阶梯式出现，而不是缓慢加重，常见思维变慢或计划能力下降。",
      "路易体失智症可能出现逼真的视幻觉、清醒程度时好时坏、动作僵硬和睡眠紊乱。额颞叶失智症往往发病较早，最先改变的是性格、行为或语言，而不是记忆。",
      "很多人属于混合型失智症，即同时有多种病因。另外，有些记忆问题由可治疗的情况引起，例如甲状腺问题、维生素 B12 缺乏、抑郁或药物副作用，所以正规评估很重要。",
    ]),
  a("aware", "signs", "Early signs worth noticing", "值得留意的早期征兆",
    [
      "Early signs are often subtle and easy to explain away. Look for patterns rather than single incidents.",
      "Common early changes include: repeating the same question; losing track of dates or appointments; difficulty with familiar tasks like paying bills or following a recipe; getting lost in a familiar place; struggling to find words; misplacing things in unusual places; poorer judgement with money; withdrawing from hobbies or social life; and changes in mood such as irritability, anxiety or low mood.",
      "Keep a simple note of what you notice and when. Concrete examples help a doctor far more than a general feeling that \"something is off\".",
      "If you notice several of these changes lasting more than a few months, encourage a check-up — gently, and ideally framed as a general health visit.",
    ],
    [
      "早期征兆往往很细微，容易被找理由解释过去。要留意的是反复出现的模式，而不是单次事件。",
      "常见的早期变化包括：反复问同一个问题；搞不清日期或约定；熟悉的事情变得困难，如交费、照菜谱做饭；在熟悉的地方迷路；想不起词；把东西放在奇怪的地方；理财判断变差；不再参与爱好或社交；情绪变化，如易怒、焦虑或情绪低落。",
      "把你注意到的情况和时间简单记下来。具体例子比“感觉哪里不对”对医生有用得多。",
      "如果多项变化持续超过几个月，建议温和地劝对方去做检查，最好说成是一次常规体检。",
    ]),
  a("aware", "stages", "How dementia progresses", "失智症如何发展",
    [
      "Dementia is often described in three broad stages. Every person moves through them differently and at a different pace.",
      "Early stage: the person is mostly independent but forgets recent events, repeats themselves and may find complex tasks or new places harder. This is the best time to talk about wishes for the future.",
      "Middle stage: usually the longest. Memory and communication problems grow, the person needs help with daily tasks like dressing or cooking, and behaviour changes such as restlessness, suspicion or sleep problems are more common.",
      "Late stage: the person depends on others for most care, may speak little, and can have difficulty walking, swallowing and controlling the bladder. Comfort, touch, music and a calm presence matter most.",
      "Stages are a guide, not a timetable. Focus on what the person can still do today.",
    ],
    [
      "失智症通常被粗略分为三个阶段。每个人经历的方式和速度都不一样。",
      "早期：基本能自理，但会忘记最近的事、重复说话，复杂的事或陌生环境变得更难。这是讨论未来意愿的最佳时机。",
      "中期：通常持续最久。记忆和沟通问题加重，穿衣、做饭等日常事务需要帮助，躁动、多疑、睡眠问题等行为变化更常见。",
      "晚期：大部分照护依赖他人，话可能很少，走路、吞咽和控制小便都可能困难。此时最重要的是舒适、触摸、音乐和平静的陪伴。",
      "阶段只是参考，不是时间表。把注意力放在对方今天还能做什么。",
    ]),
  a("aware", "diagnosis", "Getting a diagnosis", "如何获得诊断",
    [
      "A diagnosis usually starts with a family doctor or a memory clinic. Bring a list of the changes you have noticed, when they started, and all current medicines.",
      "The assessment typically includes a conversation about history, short memory and thinking tests, a physical examination and blood tests to rule out other causes. Some people are referred for a brain scan.",
      "Getting a diagnosis can feel frightening, but it has real benefits: treatable causes can be found, some medicines may help symptoms, the person can take part in planning their own future, and the family can access support earlier.",
      "Ask the doctor what type of dementia is suspected, what to expect next, and who to contact with questions. It is fine to ask for a second appointment to take it all in.",
    ],
    [
      "诊断通常从家庭医生或记忆门诊开始。带上一份清单：你注意到的变化、开始时间，以及目前所有用药。",
      "评估一般包括询问病史、简短的记忆与思维测试、体格检查和抽血，以排除其他原因。有些人会被安排做脑部影像检查。",
      "得到诊断可能让人害怕，但确实有好处：可以发现可治疗的原因；某些药物可能缓解症状；本人可以参与规划自己的未来；家人也能更早获得支持。",
      "可以问医生：怀疑是哪种类型、接下来会怎样、有问题找谁。如果一时消化不了，可以再约一次复诊。",
    ]),
  a("aware", "prevention", "Lowering the risk", "降低风险",
    [
      "There is no guaranteed way to prevent dementia, but research suggests that a significant share of cases is linked to factors we can influence.",
      "What helps the brain also helps the heart: keep blood pressure, blood sugar and cholesterol under control; do not smoke; limit alcohol; stay physically active; and keep a healthy weight.",
      "Protect hearing and eyesight — using hearing aids when needed is linked to lower risk. Stay socially connected and keep learning new things. Treat depression, sleep well, and protect your head from injury.",
      "It is never too early or too late to start. These habits also make life better for carers, who are under strain themselves.",
    ],
    [
      "目前没有保证能预防失智症的方法，但研究表明，相当一部分病例与我们可以改变的因素有关。",
      "对心脏好的，对大脑也好：控制血压、血糖和血脂；不吸烟；少喝酒；保持运动；保持健康体重。",
      "保护听力和视力——需要时佩戴助听器与较低风险相关。保持社交联系，持续学习新东西。治疗抑郁，睡好觉，保护头部免受外伤。",
      "开始永远不嫌早，也不嫌晚。这些习惯同样能改善承受压力的护理者自己的生活。",
    ]),
  a("aware", "treatments", "What treatment can and cannot do", "治疗能做什么，不能做什么",
    [
      "At present there is no cure for most types of dementia. Treatment aims to ease symptoms, keep the person as independent as possible and maintain quality of life.",
      "Some medicines can modestly help memory or thinking for a period in certain types of dementia. Newer medicines for early Alzheimer's are available in some countries but have strict criteria and risks. Always discuss benefits and side effects with a doctor.",
      "Non-drug approaches are just as important: regular routines, physical activity, meaningful activities, music, reminiscence, good sleep, treating pain and hearing or vision problems, and support for the carer.",
      "For behaviour changes, first look for causes such as pain, infection, constipation, fear or boredom. Sedating medicines should be a last resort and reviewed regularly.",
    ],
    [
      "目前大多数类型的失智症无法治愈。治疗的目标是缓解症状、尽量保持自理，并维持生活质量。",
      "在某些类型中，有些药物能在一段时间内适度改善记忆或思维。部分国家已有针对早期阿尔茨海默病的新药，但适用条件严格、存在风险。务必与医生讨论获益与副作用。",
      "非药物方法同样重要：规律作息、身体活动、有意义的活动、音乐、怀旧、良好睡眠、治疗疼痛及听力视力问题，以及对护理者的支持。",
      "出现行为变化时，先找原因，如疼痛、感染、便秘、害怕或无聊。镇静类药物应作为最后手段，并定期复查。",
    ]),

  // ───────── CareD ─────────
  a("care", "daily-routines", "Building a steady daily routine", "建立稳定的日常作息",
    [
      "A predictable day lowers anxiety for someone with dementia because they do not have to work out what happens next.",
      "Keep getting up, meals, outings and bedtime at roughly the same times. Put demanding tasks such as bathing or appointments at the time of day the person is usually at their best — often the morning.",
      "Break tasks into small steps and give one instruction at a time. Leave room for rest, and avoid packing the day too full.",
      "Keep the routine flexible. If the person refuses something, try again later rather than insisting. The routine is there to help them, not to be followed at all costs.",
    ],
    [
      "可预期的一天能减轻失智症患者的焦虑，因为他们不需要费力去想接下来要做什么。",
      "起床、吃饭、外出和睡觉尽量固定在差不多的时间。洗澡、看病等费力的事安排在对方状态最好的时段——通常是上午。",
      "把任务拆成小步骤，一次只说一个指令。留出休息时间，不要把一天排得太满。",
      "作息要保持弹性。对方拒绝时，过一会儿再试，而不是坚持。作息是为了帮助他，不是非完成不可。",
    ]),
  a("care", "nutrition", "Making meals easier", "让吃饭更容易",
    [
      "People with dementia may forget to eat, lose interest in food, struggle with cutlery or find a busy plate confusing.",
      "Serve one or two foods at a time on a plain plate that contrasts with the table. Offer finger foods if cutlery is hard. Eat together — people often copy what they see.",
      "Offer drinks regularly through the day, as thirst is often not noticed. Watch for weight loss, coughing while eating or pocketing food in the cheeks, and mention these to a doctor.",
      "Allow plenty of time, keep the room quiet, and let the person do as much as they can themselves, even if it is messy.",
    ],
    [
      "失智症患者可能忘记吃饭、对食物失去兴趣、不会用餐具，或被满满一盘菜弄糊涂。",
      "一次只上一两样食物，用与桌面颜色对比明显的素色盘子。用餐具困难就提供手抓食物。一起吃饭——人们常会模仿看到的动作。",
      "全天定时递上饮水，因为口渴常不被察觉。留意体重下降、吃饭时呛咳或把食物含在腮里，并告诉医生。",
      "给足时间，保持房间安静，让对方尽量自己吃，哪怕会弄脏。",
    ]),
  a("care", "hygiene", "Bathing and personal hygiene with dignity", "有尊严地洗漱与个人卫生",
    [
      "Washing and dressing are private. Help can feel intrusive or frightening, so start from respect.",
      "Keep the bathroom warm, prepare everything in advance and explain each step simply. Use a towel to cover parts of the body not being washed. A shower every day is not always necessary; a wash with a flannel can be enough.",
      "Offer choices with only two options: \"The blue shirt or the green one?\" Lay clothes out in the order they are put on.",
      "If the person refuses, stop, stay calm and try again later, perhaps with a different helper or approach. Refusal is often about fear, cold or embarrassment rather than stubbornness.",
    ],
    [
      "洗漱和穿衣是私密的事。别人帮忙可能让人觉得被冒犯或害怕，所以要从尊重开始。",
      "浴室要保暖，事先备齐用品，每一步都简单说明。用毛巾盖住没在洗的部位。不一定每天都要淋浴，用毛巾擦洗也可以。",
      "只给两个选项：“蓝衬衫还是绿衬衫？”按穿衣顺序把衣服摆好。",
      "对方拒绝时，停下来、保持冷静，过会儿再试，或换一个人、换一种方式。拒绝往往源于害怕、怕冷或难为情，而不是固执。",
    ]),
  a("care", "communication", "Talking so you are understood", "让对方听得懂的沟通",
    [
      "Approach from the front, make eye contact and say the person's name. Reduce background noise such as the TV.",
      "Use short sentences and ask one question at a time. Closed questions (\"Would you like tea?\") are easier than open ones (\"What would you like?\"). Wait longer than feels natural for an answer.",
      "Do not argue or correct every mistake. If the person believes something that is not true, respond to the feeling behind it: \"You sound worried about your mother — tell me about her.\"",
      "Body language matters more as words fade. A calm voice, a smile and gentle touch can say more than a long explanation.",
    ],
    [
      "从正面靠近，看着对方的眼睛，叫他的名字。减少电视等背景噪音。",
      "用短句，一次只问一个问题。封闭式问题（“要喝茶吗？”）比开放式问题（“你想要什么？”）更容易回答。等待回答的时间要比你觉得自然的更长。",
      "不要争论，也不要纠正每个错误。如果对方相信的事不是真的，回应背后的感受：“你好像在担心你妈妈——跟我说说她吧。”",
      "随着语言能力减退，肢体语言更重要。平静的语气、微笑和轻柔的触碰，比长篇解释更有用。",
    ]),
  a("care", "behaviors", "Understanding changed behaviour", "理解行为变化",
    [
      "Agitation, shouting, refusing care or following you around are often a way of communicating a need the person cannot put into words.",
      "Ask: Could they be in pain, hungry, thirsty, too hot or cold, tired, bored, frightened or needing the toilet? Did something in the environment change — noise, visitors, a new room?",
      "Keep a simple diary of when the behaviour happens, what happened just before, and what helped. Patterns often appear within a week or two.",
      "Stay calm, reassure rather than reason, and try distraction with a favourite activity or a change of room. Look after yourself too: take a short break when you feel your own temper rising.",
    ],
    [
      "躁动、叫喊、拒绝照护或一直跟着你，往往是在表达一种说不出口的需要。",
      "问问自己：他会不会疼、饿、渴、太热太冷、累、无聊、害怕，或者想上厕所？环境有没有变化——噪音、访客、新房间？",
      "简单记录行为何时出现、之前发生了什么、什么方法有效。一两周内通常就能看出规律。",
      "保持冷静，安抚而不讲道理，用喜欢的活动或换个房间来转移注意力。也要照顾好自己：感觉自己要发火时，先短暂离开一下。",
    ]),
  a("care", "sleep", "Sleep problems and late-day confusion", "睡眠问题与黄昏时的混乱",
    [
      "Many people with dementia become more confused, restless or anxious in the late afternoon and evening. Sleep may also become broken, with night waking and daytime napping.",
      "Get outside in daylight in the morning and keep active during the day. Limit long naps, caffeine after lunch and large evening meals.",
      "In the late afternoon, close the curtains before it gets dark, turn on lights to reduce shadows, and choose calm, familiar activities. Keep a steady bedtime routine.",
      "If the person wakes at night, speak softly, check for toilet needs or pain, and guide them back without a debate. Night lights on the way to the toilet help prevent falls.",
    ],
    [
      "很多失智症患者在傍晚和晚上会更混乱、躁动或焦虑。睡眠也可能变得零碎，夜里醒来、白天打盹。",
      "早上到户外晒太阳，白天保持活动。限制长时间午睡、午饭后的咖啡因和丰盛的晚餐。",
      "傍晚天黑前拉上窗帘，开灯减少阴影，选择平静、熟悉的活动。保持固定的睡前流程。",
      "夜里醒来时，轻声说话，看看是否要上厕所或哪里疼，不争论地引导他回床。通往厕所的路上装夜灯，有助于防跌倒。",
    ]),
  a("care", "activities", "Meaningful things to do", "有意义的日常活动",
    [
      "Having something to do gives a sense of purpose and reduces boredom, which is a common trigger for distress.",
      "Build on the person's past: a former cook may enjoy peeling vegetables; a gardener may enjoy watering plants; someone who loved music may enjoy singing old songs.",
      "Simple household tasks count: folding towels, setting the table, sorting buttons, wiping a counter. The result does not need to be perfect.",
      "Keep activities short, offer help only where needed, and stop before the person gets tired. Enjoyment in the moment matters even if the memory of it does not last.",
    ],
    [
      "有事可做能带来价值感，并减少无聊——无聊是引发不安的常见原因。",
      "从对方的过去出发：以前做饭的人可能喜欢择菜；喜欢园艺的人可能喜欢浇花；爱音乐的人可能喜欢唱老歌。",
      "简单家务也算：叠毛巾、摆碗筷、分扣子、擦台面。结果不需要完美。",
      "活动时间要短，只在需要时帮忙，在对方累之前停下来。即使事后记不住，当下的快乐依然重要。",
    ]),
  a("care", "medication", "Managing medicines at home", "居家用药管理",
    [
      "Keep an up-to-date list of every medicine, dose and time, including vitamins and herbal products, and bring it to every appointment.",
      "A weekly pill organiser or pharmacy blister pack makes it easy to see whether a dose was taken. As dementia progresses, a carer usually needs to hand over each dose rather than rely on reminders alone.",
      "If the person refuses a tablet, do not force it. Try again later, and ask the pharmacist whether a liquid or different form is available. Never crush tablets without checking first.",
      "Watch for new confusion, drowsiness, falls or constipation after a medicine change and report it promptly. Ask the doctor to review all medicines at least once a year.",
    ],
    [
      "保存一份最新清单，列出每种药、剂量和时间，包括维生素和中草药，每次就诊都带上。",
      "用一周药盒或药房分装包，可以一眼看出是否已服药。随着病情发展，通常需要护理者把每一次的药亲手递给对方，而不能只靠提醒。",
      "对方拒绝吃药时，不要强迫。过会儿再试，并问药师有没有口服液或其他剂型。未经确认不要把药片碾碎。",
      "换药后留意是否出现新的混乱、嗜睡、跌倒或便秘，并及时报告。请医生至少每年复查一次全部用药。",
    ]),

  // ───────── CopeD ─────────
  a("cope", "stress", "Noticing and easing stress", "觉察并缓解压力",
    [
      "Caring for someone with dementia is one of the most demanding roles a person can take on. Stress is a normal response, not a sign of failure.",
      "Warning signs include poor sleep, irritability, headaches, feeling constantly tired, withdrawing from friends and losing interest in things you used to enjoy.",
      "Short practices help: slow breathing for two minutes, a walk around the block, stretching, or writing down what is worrying you. Small breaks during the day add up.",
      "Identify which situations stress you most and plan for them. If stress feels overwhelming, talk to a doctor or counsellor.",
    ],
    [
      "照顾失智症患者是一个人能承担的最辛苦的角色之一。有压力是正常反应，不代表你做得不好。",
      "预警信号包括睡不好、易怒、头痛、总是很累、疏远朋友、对原本喜欢的事失去兴趣。",
      "简短的练习有帮助：慢呼吸两分钟、绕街区走一圈、拉伸，或把担心的事写下来。一天中的小休息会累积起作用。",
      "找出最让你有压力的情境，提前做好准备。如果压力难以承受，请找医生或心理咨询师聊聊。",
    ]),
  a("cope", "self-care", "Looking after yourself is part of caring", "照顾自己也是照护的一部分",
    [
      "You cannot pour from an empty cup. Your health directly affects the quality of care you can give.",
      "Keep your own medical appointments. Try to eat regular meals, move your body every day and protect your sleep as much as possible.",
      "Keep at least one thing that is just for you — a hobby, a phone call with a friend, a TV programme — and put it in the calendar like any other appointment.",
      "Notice guilt when it appears. Taking time for yourself is not selfish; it is what allows you to keep going.",
    ],
    [
      "空杯子倒不出水。你的健康直接影响你能给出的照护质量。",
      "按时去看自己的医生。尽量规律吃饭，每天活动身体，尽可能保护好睡眠。",
      "至少保留一件只属于你的事——爱好、和朋友通个电话、一档电视节目——像其他约定一样写进日程。",
      "内疚出现时，觉察它。给自己留时间不是自私，而是让你能坚持下去。",
    ]),
  a("cope", "emotional", "Guilt, anger and sadness", "内疚、愤怒与悲伤",
    [
      "Carers often feel a mix of love, anger, guilt, sadness, embarrassment and loneliness — sometimes all in one day. All of these feelings are normal.",
      "Anger usually comes when you are exhausted or when something feels unfair. It does not make you a bad carer. When you feel it rising, step away for a moment if it is safe to do so.",
      "Try to notice unhelpful thoughts such as \"I should be able to cope alone\" and replace them with kinder ones: \"I am doing a hard job and it is fine to ask for help.\"",
      "Talking to someone who understands — a friend, a support group or a counsellor — can lighten the load.",
    ],
    [
      "护理者常常同时感到爱、愤怒、内疚、悲伤、难为情和孤独——有时一天之内全都有。这些感受都很正常。",
      "愤怒通常出现在筋疲力尽或觉得不公平的时候，这不代表你是糟糕的护理者。感到怒气上升时，在安全的前提下先离开一会儿。",
      "试着觉察那些没帮助的想法，如“我应该一个人撑得住”，换成更温和的：“我在做一件很难的事，寻求帮助是可以的。”",
      "和懂你的人聊聊——朋友、互助小组或心理咨询师——能减轻负担。",
    ]),
  a("cope", "support", "Building your support network", "建立你的支持网络",
    [
      "Many carers wait too long to ask for help. People often want to help but do not know how.",
      "Make a list of specific tasks others could do: pick up groceries, sit with the person for an hour, drive to an appointment, make a phone call. Specific requests are easier to say yes to.",
      "Look for local carer groups, dementia associations, community centres and online communities. Meeting others in the same situation reduces isolation and gives practical tips.",
      "Share information with family members regularly so the load does not fall on one person, and decide together who does what.",
    ],
    [
      "很多护理者求助得太晚。别人其实常常想帮忙，只是不知道怎么帮。",
      "列出别人可以做的具体事：买菜、陪对方一小时、开车去看病、打个电话。具体的请求更容易被答应。",
      "寻找本地护理者小组、失智症协会、社区中心和线上社群。认识处境相同的人能减少孤立感，还能得到实用建议。",
      "定期和家人分享情况，别让担子落在一个人身上，一起商量谁负责什么。",
    ]),
  a("cope", "work-life", "Balancing work and caring", "平衡工作与照护",
    [
      "Many carers also have a job. Juggling both can be exhausting, but leaving work is a big decision that affects income, pension and your own wellbeing.",
      "Find out what your workplace offers: flexible hours, working from home, carer's leave or an employee assistance programme. Telling a trusted manager can open options you did not know existed.",
      "Plan backup care for emergencies, and keep a shared calendar with family for appointments.",
      "Before reducing hours or resigning, get advice on finances and on the care services available. Work can also be a valuable source of identity and a break from caring.",
    ],
    [
      "很多护理者还有工作。两头兼顾可能很累，但辞职是影响收入、养老金和自身健康的大决定。",
      "了解单位能提供什么：弹性工时、居家办公、照护假或员工援助计划。告诉一位信任的上级，可能会打开你原本不知道的选项。",
      "为紧急情况安排备用照护，和家人共用一个日程记录就诊安排。",
      "在减少工时或辞职前，先咨询财务问题和可用的照护服务。工作也能是自我认同的重要来源，以及从照护中暂时抽身的机会。",
    ]),
  a("cope", "financial", "Money and legal planning", "财务与法律规划",
    [
      "It is best to plan while the person can still take part in decisions. Talking early respects their wishes and avoids crises later.",
      "Key topics include: who will manage money and property if the person cannot; who can make health and care decisions on their behalf; wishes about future care and end-of-life care; and an up-to-date will.",
      "Laws differ by country and region, so ask a lawyer, notary or local advice service about the right documents where you live.",
      "Gather important papers in one place — bank details, insurance, pensions, property and identity documents — and check what benefits or subsidies the person or carer may be entitled to.",
    ],
    [
      "最好在对方还能参与决定时就做好规划。尽早沟通既尊重他的意愿，也能避免日后陷入危机。",
      "关键议题包括：如果本人无法管理，谁来管理钱财和房产；谁可以代为做医疗和照护决定；对未来照护和临终照护的意愿；以及一份最新的遗嘱。",
      "各国各地法律不同，请向律师、公证处或当地咨询服务了解你所在地需要哪些文件。",
      "把重要文件集中存放——银行信息、保险、养老金、房产和身份证件——并了解本人或护理者可能享有哪些补贴或福利。",
    ]),
  a("cope", "respite", "Taking a break: respite care", "喘息照护：给自己放个假",
    [
      "Respite means someone else takes over caring for a while so you can rest. It can last an hour, a day or a few weeks.",
      "Options include family or friends sitting in, paid home carers, day centres, and short stays in a care home.",
      "Many carers feel guilty using respite, or worry the person will be upset. Start small, visit the place together first, and bring familiar objects. Most people settle better than expected.",
      "Plan breaks regularly rather than waiting for a crisis. Rested carers can keep caring for longer.",
    ],
    [
      "喘息照护是指由别人暂时接手照护，让你休息。可以是一小时、一天，也可以是几周。",
      "选择包括：家人朋友来陪、聘请上门护理、日间照料中心，以及在养老机构短住。",
      "很多护理者使用喘息照护时会内疚，或担心对方不适应。可以从短时间开始，先一起去参观，带上熟悉的物品。大多数人比预想的适应得好。",
      "定期安排休息，而不是等到撑不住。休息好的护理者能照顾得更久。",
    ]),
  a("cope", "grief", "Grief along the way", "照护路上的悲伤",
    [
      "Grief in dementia often starts long before death. Carers may mourn the loss of shared memories, conversations, roles and the future they had planned. This is sometimes called anticipatory or ambiguous grief.",
      "These feelings can come and go and may surprise you — for example when the person no longer recognises you, or moves into a care home.",
      "Give yourself permission to grieve. Talk about the person as they were and as they are now. Keep photos, stories and rituals that matter to you.",
      "After the person dies, carers may feel relief as well as sorrow, and a sudden emptiness in their days. Support groups and bereavement services can help.",
    ],
    [
      "失智症中的悲伤往往早在离世前就开始了。护理者可能为失去共同的回忆、对话、角色和原本规划的未来而难过，这有时被称为预期性悲伤或模糊性丧失。",
      "这些感受会时来时去，可能让你措手不及——比如当对方不再认得你，或搬进养老机构时。",
      "允许自己悲伤。聊聊他过去的样子和现在的样子。保留对你有意义的照片、故事和仪式。",
      "对方离世后，护理者可能既悲伤又如释重负，生活突然空了下来。互助小组和哀伤辅导服务可以提供帮助。",
    ]),

  // ───────── SafeD ─────────
  a("safe", "home-safety", "A safer home, room by room", "逐个房间打造更安全的家",
    [
      "Good lighting is the simplest safety change: bright, even light in halls and stairs, and night lights between the bedroom and toilet.",
      "Remove loose rugs and clutter from walkways. Lock away cleaning products, medicines, sharp tools and car keys if needed.",
      "Use clear signs or pictures on doors such as the toilet. Contrasting colours — a coloured toilet seat, tape on step edges — help failing eyesight and depth perception.",
      "Keep changes gradual and familiar. Too many changes at once can be confusing; the goal is safety without taking away independence.",
    ],
    [
      "改善照明是最简单的安全措施：走廊和楼梯要明亮均匀，卧室到厕所之间装夜灯。",
      "清除通道上的松动地毯和杂物。必要时把清洁剂、药品、锋利工具和车钥匙锁起来。",
      "在厕所等门上贴清晰的标志或图片。对比色——彩色马桶圈、台阶边缘贴胶带——能帮助视力和深度感知下降的人。",
      "改变要循序渐进、保持熟悉感。一次改太多会让人困惑；目标是安全，同时不剥夺自主。",
    ]),
  a("safe", "wandering", "Preventing getting lost", "预防走失",
    [
      "Walking can be healthy and purposeful, but a person with dementia may get lost even close to home.",
      "Try to understand why they want to go out: looking for someone, going \"to work\", boredom, or needing exercise. Regular accompanied walks can meet the need safely.",
      "Make sure the person carries identification with a contact number. Tell trusted neighbours and local shopkeepers. Keep a recent photo and a description of usual clothing ready.",
      "Door chimes, sensors or location devices can help, but use them with respect for the person's dignity. If the person goes missing, search nearby first and contact the police quickly — do not wait.",
    ],
    [
      "走动可以是健康且有目的的，但失智症患者即使在家附近也可能迷路。",
      "试着理解他为什么想出去：找人、要去“上班”、无聊或需要活动。定期陪同散步能安全地满足这种需要。",
      "确保对方随身带着有联系电话的身份信息。告诉信得过的邻居和附近店主。准备好近照和常穿衣物的描述。",
      "门铃、感应器或定位设备有帮助，但使用时要尊重对方的尊严。一旦走失，先在附近寻找，并尽快报警——不要等。",
    ]),
  a("safe", "bathing", "Safety in the bathroom", "浴室安全",
    [
      "The bathroom is where many falls and scalds happen.",
      "Install grab rails by the toilet, bath and shower, and use non-slip mats inside and outside the bath. A shower seat and a hand-held shower make washing easier and safer.",
      "Set the water heater to a safe temperature and always check water temperature before the person gets in. Never leave someone with advanced dementia alone in the bath.",
      "Remove electrical appliances from the bathroom and consider removing the lock from the inside of the door so you can get in quickly if needed.",
    ],
    [
      "浴室是跌倒和烫伤的高发地。",
      "在马桶、浴缸和淋浴旁安装扶手，浴缸内外都铺防滑垫。淋浴椅和手持花洒让洗澡更轻松、更安全。",
      "把热水器设在安全温度，对方进去前一定先试水温。不要让晚期失智症患者单独在浴缸里。",
      "把电器移出浴室，考虑拆掉门内侧的锁，以便必要时能迅速进去。",
    ]),
  a("safe", "fire", "Fire safety and smoking", "消防安全与吸烟",
    [
      "Forgotten pans, heaters left on and smoking are common fire risks when memory declines.",
      "Fit smoke alarms on every floor and test them monthly. Consider an automatic cooker shut-off device or removing the knobs when the kitchen is not supervised. Keep a fire blanket in the kitchen.",
      "Smoking is a serious risk: dropped cigarettes can set clothing, bedding and chairs alight. Supervise smoking, use deep, heavy ashtrays and fire-retardant bedding, and never allow smoking in bed.",
      "Talk to a doctor about stopping smoking. Nicotine replacement therapy (patches, gum, lozenges) can reduce cravings without a flame, and may be a safer option to discuss.",
    ],
    [
      "记忆减退时，忘关的锅、没关的取暖器和吸烟都是常见的火灾隐患。",
      "每层都装烟雾报警器，每月测试。考虑安装灶具自动断火装置，或在无人看管时拆下旋钮。厨房备一块灭火毯。",
      "吸烟风险很大：掉落的烟头会点燃衣物、被褥和椅子。要在看护下吸烟，使用深而重的烟灰缸和阻燃被褥，绝不允许在床上吸烟。",
      "和医生谈谈戒烟。尼古丁替代疗法（贴片、口香糖、含片）能在没有明火的情况下缓解烟瘾，是值得讨论的更安全选择。",
    ]),
  a("safe", "falls", "Preventing falls", "预防跌倒",
    [
      "Dementia increases the risk of falls because of changes in balance, eyesight, judgement and sometimes medicines.",
      "Keep floors clear, add rails on stairs, use good lighting and make sure shoes fit well with non-slip soles. Avoid long trousers or dressing gowns that can trip.",
      "Regular exercise that builds strength and balance, such as walking or chair exercises, lowers risk. Ask for eyesight and medicine reviews.",
      "If a fall happens, do not rush to lift the person. Check for injury, stay calm, and get help if they are hurt or cannot get up. Tell the doctor about any fall, even without injury.",
    ],
    [
      "由于平衡、视力、判断力的变化，有时也因为药物，失智症会增加跌倒风险。",
      "保持地面通畅，楼梯装扶手，照明充足，鞋子合脚且防滑。避免会绊脚的长裤或长睡袍。",
      "规律做增强力量和平衡的运动，如散步或坐姿操，可以降低风险。请医生检查视力和复查用药。",
      "如果跌倒，不要急着扶起来。先检查有没有受伤，保持冷静，受伤或起不来时要求助。任何一次跌倒，即使没受伤，也要告诉医生。",
    ]),
  a("safe", "medication", "Medication safety", "用药安全",
    [
      "Taking too many, too few or the wrong tablets is a real risk when memory declines.",
      "Store medicines in a locked box and give out only the day's doses. Use a pill organiser or pharmacy blister pack and check it each evening.",
      "Be careful with over-the-counter sleeping tablets, strong painkillers and some allergy medicines, which can worsen confusion. Ask a pharmacist before adding anything new.",
      "Dispose of old or unused medicines through a pharmacy, and keep an emergency number visible in case a double dose is taken.",
    ],
    [
      "记忆减退时，吃多、吃少或吃错药都是真实存在的风险。",
      "把药锁在盒子里，每天只拿出当天的量。使用药盒或药房分装包，每晚检查一次。",
      "谨慎使用非处方安眠药、强效止痛药和部分抗过敏药，它们可能加重混乱。添加任何新药前先问药师。",
      "过期或不用的药交给药房处理，把急救电话放在显眼处，以防重复服药。",
    ]),
  a("safe", "driving", "Driving and dementia", "驾驶与失智症",
    [
      "A diagnosis does not always mean driving must stop at once, but dementia eventually affects reaction time, judgement and navigation.",
      "Warning signs include getting lost on familiar routes, new dents or scrapes, near misses, confusing the pedals and ignoring road signs.",
      "Check the legal requirements where you live — many places require informing the licensing authority. A formal driving assessment can give an objective view.",
      "Stopping driving can feel like losing independence. Plan alternatives together — lifts from family, taxis, community transport — and involve the doctor so the decision does not rest on you alone.",
    ],
    [
      "确诊并不总意味着必须马上停止驾驶，但失智症最终会影响反应速度、判断和认路能力。",
      "预警信号包括：在熟悉路线上迷路、车上出现新凹痕或刮痕、险些出事、踩错踏板、忽视交通标志。",
      "了解当地的法律要求——许多地方需要告知驾照管理部门。正式的驾驶评估能提供客观意见。",
      "停止开车可能让人觉得失去独立。一起规划替代方式——家人接送、出租车、社区交通——并请医生参与，这样决定不会只压在你一个人身上。",
    ]),
  a("safe", "emergency", "Planning for emergencies", "应急规划",
    [
      "Emergencies are harder to handle when you have not planned. A little preparation now saves panic later.",
      "Keep a one-page summary of the person's diagnosis, medicines, allergies, doctors, and how best to communicate with them. Keep copies at home, in your bag and on your phone.",
      "Agree who will step in if you are suddenly ill or in hospital. Tell that person where the key information and spare keys are.",
      "Save emergency numbers in the phone and on the fridge, and consider a personal alarm or location device for times the person is alone.",
    ],
    [
      "没有提前规划，紧急情况会更难应对。现在做一点准备，能避免日后慌乱。",
      "准备一页纸的摘要：诊断、用药、过敏、医生，以及和他沟通的最佳方式。在家里、包里和手机里各存一份。",
      "商量好如果你突然生病或住院，由谁接手。告诉那个人关键资料和备用钥匙放在哪里。",
      "把急救电话存进手机并贴在冰箱上，对方独处时考虑使用紧急呼叫器或定位设备。",
    ]),

  // ───────── AccompanieD ─────────
  a("accompany", "find-companions", "How to find a companion or helper", "如何找到陪伴者或帮手",
    [
      "A companion can spend time with the person — talking, walking, doing activities — so the main carer gets a break and the person has fresh company.",
      "In this app, open Find to browse companions and care providers near you or available remotely. Read their profile, experience and reviews, and use messages to ask questions before booking.",
      "Before the first visit, share practical information: routines, likes and dislikes, how the person communicates, and what usually calms them.",
      "Stay for the first session if you can, and ask afterwards how it went. A good match often takes one or two tries.",
    ],
    [
      "陪伴者可以陪对方聊天、散步、做活动，让主要护理者喘口气，也让对方有新的陪伴。",
      "在本应用中打开“找”，可以浏览附近或远程的陪伴者和护理服务。阅读他们的资料、经验和评价，预约前可以先发消息询问。",
      "第一次见面前，分享实用信息：作息、喜好和讨厌的事、对方如何沟通、什么通常能让他平静。",
      "如果可以，第一次陪伴时在场，结束后问问进展如何。合适的人选往往需要试一两次。",
    ]),
  a("accompany", "ai-companion", "Using the AI companion", "如何使用 AI 陪伴",
    [
      "The AI companion is a chat assistant you can open from the round button on screen. It can answer general questions about dementia care, help you think through a difficult moment, and remind you of check-ins and medicines you have set up.",
      "Ask in plain language, for example: \"My mother keeps asking to go home in the evening — what can I try?\"",
      "The AI gives general information only. It is not a doctor and cannot diagnose or change medicines. For urgent or medical issues, contact a health professional or emergency services.",
      "Do not share passwords or bank details in the chat.",
    ],
    [
      "AI 陪伴是一个聊天助手，点屏幕上的圆形按钮就能打开。它可以回答失智症照护的一般问题，帮你理清困难时刻的思路，并提醒你已设置的签到和用药。",
      "用平常的话提问，例如：“我妈每到晚上就吵着要回家，我可以怎么做？”",
      "AI 只提供一般信息，它不是医生，不能诊断或调整用药。紧急或医疗问题，请联系医护人员或急救服务。",
      "不要在聊天中发送密码或银行信息。",
    ]),
  a("accompany", "companion-guides", "Being a good companion", "如何做一个好的陪伴者",
    [
      "Good company is less about what you do and more about how you are: calm, unhurried and interested.",
      "Introduce yourself each time, even if you have met before. Sit at eye level, speak slowly and follow the person's lead in conversation.",
      "Enter their reality rather than correcting it. If they talk about going to work, ask what their work was like.",
      "Notice signs of tiredness or discomfort and adjust. A quiet half hour holding hands and listening to music is a successful visit.",
    ],
    [
      "好的陪伴，重要的不是做了什么，而是你的状态：平静、不着急、真心感兴趣。",
      "每次都先介绍自己，即使以前见过。坐在与对方视线齐平的位置，说话慢一些，谈话时跟着对方的思路走。",
      "进入他的世界，而不是纠正他。如果他说要去上班，就问问他以前的工作是什么样的。",
      "留意疲倦或不适的信号并及时调整。安静地牵着手听半小时音乐，也是一次成功的陪伴。",
    ]),
  a("accompany", "activities", "Activities to enjoy together", "可以一起做的活动",
    [
      "Shared activities create moments of connection even when conversation is hard.",
      "Ideas: looking through old photos; listening to or singing favourite songs; short walks; simple baking; gardening; folding laundry together; watching birds; hand massage with lotion; looking at picture books about their hometown or old job.",
      "Choose activities that match the person's current abilities and past interests. Prepare materials in advance and keep instructions simple.",
      "Success is measured by enjoyment, not results. If something is not working, change it without making a fuss.",
    ],
    [
      "即使交谈困难，一起做的活动也能创造连接的时刻。",
      "可以尝试：翻看老照片；听或唱喜欢的歌；短距离散步；简单烘焙；园艺；一起叠衣服；看鸟；用润肤露按摩手；看关于家乡或老职业的画册。",
      "选择符合对方当前能力和过去兴趣的活动。提前准备材料，说明保持简单。",
      "成功的标准是开心，而不是结果。行不通就换一个，不用大惊小怪。",
    ]),
  a("accompany", "remote-care", "Staying close from far away", "远距离也能保持亲近",
    [
      "Many families live far apart. You can still play an important role from a distance.",
      "Schedule regular video or phone calls at the time of day the person is most alert. Keep calls short and warm; show familiar faces, pets or places.",
      "Offer practical help: manage online shopping, book appointments, handle paperwork, or give the local carer a regular break by arranging a companion.",
      "Stay in touch with the main carer, not just the person with dementia. Asking \"How are you doing?\" matters as much as asking about the patient.",
    ],
    [
      "很多家庭相隔很远，但你依然可以在远方发挥重要作用。",
      "在对方最清醒的时段定期视频或打电话。通话要短而温暖；让他看看熟悉的面孔、宠物或地方。",
      "提供实际帮助：负责网购、预约就诊、处理文书，或安排陪伴者，让本地护理者定期休息。",
      "不只联系患者本人，也要联系主要护理者。问一句“你还好吗？”和问病人的情况一样重要。",
    ]),
];

/** hub-article key → CCT 217 title-anchor row ID (created via JetEngine GUI). */
export const HUB_ARTICLE_CONTENT_IDS: Record<string, number> = Object.fromEntries(
  HUB_ARTICLES.map((x, i) => [x.key, 29 + i]),
); // rows 29–64, added in HUB_ARTICLES order

export function getHubArticle(key: string) {
  return HUB_ARTICLES.find((x) => x.key === key);
}
