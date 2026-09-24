/**
 * WHO iSupport — full-text extension sections ("只多不少").
 * Appended AFTER each lesson's existing sections; nothing existing is removed.
 * Source: WHO iSupport for Dementia manual (2019), lesson by lesson.
 * Progress: Module 1 L1 ✅, Module 2 L1 ✅ — remaining lessons pending.
 */
import type { ISupportSection } from "./isupport-modules";

export const ISUPPORT_EXTENDED: Record<string, ISupportSection[]> = {
  "intro-to-dementia": [
    {
      heading: "Why is this lesson important? (WHO)",
      headingZh: "为什么这一课很重要？（WHO）",
      body: "Dementia can be overwhelming for the person with dementia, and also for you as a carer. There are many myths about dementia. Learning more helps explain common misunderstandings and gives you the basics every carer needs: what dementia is and how it affects someone.",
      bodyZh: "失智症可能让患者本人不堪重负，也会让作为护理者的你感到压力。关于失智症有很多误解。多了解一些，可以帮你澄清常见误会，并掌握每位护理者都需要的基础知识：失智症是什么、它如何影响一个人。",
    },
    {
      heading: "Alzheimer’s disease",
      headingZh: "阿尔茨海默病",
      body: "Alzheimer’s disease is the most common cause of dementia. It destroys brain cells and nerves and disrupts the transmitters that carry messages in the brain — particularly those responsible for storing memories.",
      bodyZh: "阿尔茨海默病是失智症最常见的病因。它会破坏脑细胞和神经，干扰大脑中传递信息的递质——尤其是负责储存记忆的部分。",
    },
    {
      heading: "Vascular dementia",
      headingZh: "血管性失智症",
      body: "Vascular dementia happens when blood vessels are damaged, the oxygen supply to the brain fails, and brain cells die. Symptoms can appear suddenly after a stroke, or gradually through a series of small strokes. It accounts for about 20%–30% of all dementia cases.",
      bodyZh: "当血管受损、大脑供氧不足、脑细胞因此死亡时，就会出现血管性失智症。症状可能在一次中风后突然出现，也可能因多次小中风而逐渐出现。它约占全部失智症病例的 20%–30%。",
    },
    {
      heading: "Dementia with Lewy bodies",
      headingZh: "路易体失智症",
      body: "Like Alzheimer’s disease, it is caused by nerve cells in the brain deteriorating and dying. It is named after abnormal protein deposits — Lewy bodies — inside brain nerve cells. It may account for around 10% of cases. About half of people with Lewy body disease also develop signs of Parkinson’s disease.",
      bodyZh: "与阿尔茨海默病相似，它由大脑神经细胞退化和死亡引起，名称来自神经细胞内异常的蛋白质沉积——路易体。它约占病例的 10%。约一半的路易体病患者还会出现帕金森病的症状。",
    },
    {
      heading: "Fronto-temporal dementia and rarer causes",
      headingZh: "额颞叶失智症及较少见的病因",
      body: "In fronto-temporal dementia (including Pick’s disease), damage is usually concentrated in the front part of the brain. At first, personality and behaviour are affected more than memory. There are also many rarer causes, such as alcohol-related dementia and dementia due to HIV/AIDS.",
      bodyZh: "额颞叶失智症（包括皮克病）的损害通常集中在大脑前部。早期性格和行为受到的影响比记忆更明显。此外还有许多较少见的病因，例如酒精相关失智症和 HIV/艾滋病导致的失智症。",
    },
    {
      heading: "Every person is unique",
      headingZh: "每个人都是独特的",
      body: "Dementia affects people differently; no two people develop the same difficulties in exactly the same way. It is not only the brain damage that decides how dementia affects someone, but also their personality, life course, general health and functioning, and living environment.",
      bodyZh: "失智症对每个人的影响不同，没有两个人会以完全相同的方式出现相同的困难。决定失智症如何影响一个人的，不只是脑损伤，还有他的性格、人生经历、整体健康和功能状况，以及生活环境。",
    },
    {
      heading: "Dementia has stages",
      headingZh: "失智症有不同阶段",
      body: "Symptoms range from minor memory loss to severe difficulties that make daily life impossible without help. Stages are only a rough guide — not everyone has every symptom, and some appear only at one stage.\n\n• Early stage: memory problems, losing track of time, getting lost in familiar places, difficulty making decisions.\n• Middle stage: becoming very forgetful and needing help with shopping, dressing and washing.\n• Late stage: may no longer recognise relatives or friends, and may show behaviour changes that are upsetting for the person and those around them.",
      bodyZh: "症状可以从轻微的记忆减退，到严重到没有帮助就无法完成日常活动。阶段只是粗略参考——并非每个人都会出现所有症状，有些症状只在某一阶段出现。\n\n• 早期：记忆问题、搞不清时间、在熟悉的地方迷路、难以做决定。\n• 中期：变得非常健忘，购物、穿衣、洗漱需要帮助。\n• 晚期：可能认不出亲友，出现令本人和身边人不安、痛苦的行为变化。",
    },
    {
      heading: "Activity: does the person you care for…",
      headingZh: "练习：你照顾的人是否……",
      body: "Answer Yes or No for each:\n• Have trouble remembering things from minutes before? (forgetting recent events, repeating questions)\n• Find daily activities difficult? (money, shopping, preparing dinner)\n• Struggle to identify time or place? (forgetting appointment dates and times)\n• Communicate differently than before? (hard to express themselves, finding the right words)\n• Misplace things? (can’t find keys; suspecting things are stolen)\n• Withdraw socially? (less social activity, lacking urge to do things)\n• Show changes in feelings or personality? (many ups and downs, more anxious than before)",
      bodyZh: "逐项回答“是”或“否”：\n• 记不住几分钟前发生的事？（忘记刚发生的事、反复问同一问题）\n• 觉得日常活动变难？（管钱、购物、做饭）\n• 分不清时间或地点？（忘记约定的日期和时间）\n• 交流方式和以前不同？（难以表达、想不起合适的词）\n• 乱放东西？（找不到钥匙；怀疑东西被偷）\n• 社交退缩？（社交活动减少、做事缺乏动力）\n• 情绪或性格改变？（情绪起伏大、比以前更焦虑）",
    },
    {
      heading: "Only a doctor can tell",
      headingZh: "只有医生能判断",
      body: "The doctor will check body and brain function and rule out treatable causes of memory problems, such as depression, urinary tract infection, medication side effects, lack of vitamins, or a brain tumour. Only a medical doctor — not this app — can say whether memory problems are really dementia.",
      bodyZh: "医生会检查身体和大脑功能，排除可以治疗的记忆问题原因，例如抑郁、尿路感染、药物副作用、维生素缺乏或脑肿瘤。只有医生——而不是这个应用——能判断记忆问题是否真的是失智症。",
    },
    {
      heading: "Check your understanding: answers explained",
      headingZh: "检查理解：答案解析",
      body: "Q1. “People with dementia often forget things or have trouble with their memory.” — TRUE.\n\nQ2. First step if you think someone has dementia:\n✗ Call a friend or relative — support helps, but cannot replace a medical exam.\n✗ Use iSupport alone — information cannot replace a medical exam by a certified doctor.\n✓ Call a doctor’s office and make an appointment — the best first step if not done yet.\n✓ Already diagnosed by a doctor — you have completed the first important step.",
      bodyZh: "第 1 题：“失智症患者经常忘事或记忆有问题。”——正确。\n\n第 2 题：怀疑家人患失智症时的第一步：\n✗ 打电话给亲友——支持有帮助，但不能代替医学检查。\n✗ 只靠 iSupport——信息不能代替执业医生的检查。\n✓ 联系医院预约——如果还没做，这是最好的第一步。\n✓ 已看过医生并确诊——你已经完成了重要的第一步。",
    },
    {
      heading: "Keep in mind",
      headingZh: "请记住",
      body: "• Dementia affects a person’s brain.\n• Dementia is common, especially in older people.\n• Dementia is a disease, not a part of ageing.\n• As a first step, see a medical doctor if possible.\n• Take care of yourself, not only the person you care for.\n• Contact your local Alzheimer’s association for information and support in your area — some services are free.\n• iSupport can support you as a carer.",
      bodyZh: "• 失智症影响的是大脑。\n• 失智症很常见，尤其在老年人中。\n• 失智症是一种疾病，不是衰老的一部分。\n• 如有可能，第一步是去看医生。\n• 照顾好自己，而不只是照顾对方。\n• 联系当地的阿尔茨海默病协会，了解本地的信息和支持——部分服务免费。\n• iSupport 可以支持你做好护理者。",
    },
  ],

  "the-journey-together": [
    {
      heading: "How may your roles change over time?",
      headingZh: "你的角色会如何随时间变化？",
      body: "Dementia changes daily life for both of you. In the early stage you may still enjoy many activities together. As it progresses, you will help more with everyday tasks such as giving medicines and going to appointments. In the middle and later stages you may help with personal care such as bathing, toileting and dressing. Some of these tasks can be challenging and cause stress.",
      bodyZh: "失智症会改变你们两个人的日常生活。早期你们也许还能一起做很多事。随着病情发展，你需要在日常事务上帮得更多，比如给药、陪同就诊。到中晚期，你可能需要协助洗澡、如厕和穿衣等个人护理。其中一些任务很有挑战，也会带来压力。",
    },
    {
      heading: "Example: Olivia and Jacob",
      headingZh: "案例：奥利维娅和雅各布",
      body: "Olivia has dementia and lives with her husband Jacob. Her memory loss has become more frequent. The last few times she went shopping she couldn’t remember what to buy and came home with the wrong things, which was frustrating.\n\nHow should Jacob respond?\n✓ Ask Olivia how she feels about her memory loss — it addresses the impact and keeps them connected; Jacob can share his own worries too.\n✓ Don’t blame her; make a shopping list together before each trip — it helps her keep shopping and stay independent longer.\n✗ Leave her alone and see what happens — both are frustrated; they need to talk.\n✗ Ask her to ‘work harder’ to remember — memory loss is part of dementia and unlikely to change.\n✗ Stop her from shopping — it takes away independence too early.",
      bodyZh: "奥利维娅患有失智症，与丈夫雅各布同住。最近几个月她忘事越来越频繁。最近几次购物她都记不起要买什么，买回来的东西不对，这让人很沮丧。\n\n雅各布该怎么做？\n✓ 问奥利维娅对自己记忆减退有什么感受——正视影响、保持联结；雅各布也可以说出自己的担心。\n✓ 不责怪她，每次购物前一起列清单——帮她继续购物，尽可能久地保持独立。\n✗ 不管她，看看会怎样——两人都很沮丧，需要沟通。\n✗ 要她“再努力一点”去记——记忆减退是失智症的一部分，不太可能改变。\n✗ 不再让她去购物——过早剥夺了她的独立性。",
    },
    {
      heading: "Tips to stay connected",
      headingZh: "保持联结的小建议",
      body: "The sooner you start talking about dementia and its effects on both of you, the better — it gets harder over time. Talk about changes now and what may come.\n• Use simple sentences.\n• Try to stay in control of your feelings.\n• Create time for yourself and for each other.\nSee Lesson 2 “Improving communication” for more.",
      bodyZh: "越早开始谈论失智症及其对你们双方的影响越好——随着时间推移会越来越难。聊聊现在的变化，以及将来可能发生的事。\n• 用简单的句子。\n• 尽量控制好自己的情绪。\n• 给自己、也给彼此留出时间。\n更多内容见第 2 课“改善沟通”。",
    },
    {
      heading: "Example: Molly and Jess — conflicting duties",
      headingZh: "案例：莫莉和杰丝——职责冲突",
      body: "Molly’s mother-in-law Jess has dementia. Molly must leave for work at 7:30 for a big deadline; the paid helper can’t come until 9:00, leaving Jess alone for over an hour.\n\nWhat could Molly do?\n✓ Ask a neighbour to visit Jess until the helper arrives.\n✓ Ask her husband to go in late and stay with Jess.\n✓ Ask the paid helper to come in early.\n✗ Leave Jess alone and see what happens.\n✗ Ask Jess to ‘take care of herself’.\nCaring is sometimes too big a job for one person — let others know when you need a break.",
      bodyZh: "莫莉的婆婆杰丝患有失智症。莫莉第二天 7:30 必须出门赶一个重要截止期限，而护理员 9:00 才能到，杰丝要独自待一个多小时。\n\n莫莉可以怎么做？\n✓ 请邻居来陪杰丝，直到护理员到来。\n✓ 请丈夫晚点上班，陪着杰丝。\n✓ 请护理员提早来。\n✗ 让杰丝独自在家，看看会怎样。\n✗ 让杰丝“自己照顾好自己”。\n照护有时是一个人承担不了的工作——需要喘口气时，让别人知道。",
    },
    {
      heading: "Activity: questions to discuss for the future",
      headingZh: "练习：关于未来需要讨论的问题",
      body: "Planning early makes things easier and lets the person say what they want while they still can. Write down answers together:\n• When they can no longer bathe themselves, who would they prefer to help — a man or woman, a family member, or an unrelated professional?\n• What do they want to keep doing themselves for as long as possible?\n• If more help is needed at home, what kind of help would they prefer now and later?\n• What are their wishes at the end of life?\n• Also discuss who might provide care and how to plan for future care costs.",
      bodyZh: "越早规划越轻松，也能让对方在还有能力时说出自己的意愿。一起写下答案：\n• 当他/她无法自己洗澡时，希望谁来帮忙——男性还是女性、家人还是无亲属关系的专业人员？\n• 他/她希望尽可能久地自己做哪些事？\n• 如果家里需要更多帮助，他/她现在和将来希望得到哪种帮助？\n• 他/她对生命末期有什么愿望？\n• 还要讨论由谁提供照护，以及如何规划将来的照护费用。",
    },
    {
      heading: "Ways to maintain intimacy",
      headingZh: "维系亲密的方法",
      body: "Olivia and Jacob have a healthy, satisfying physical relationship, but Jacob worries about the day it may stop. As dementia progresses, sexual relations and physical intimacy may become harder. Ways to stay connected:\n• Touch, hold hands or give a gentle massage to show warmth, safety and love.\n• Use music they like — a universal language.\n• Keep your sense of humour to ease frustration and tension.\n• Talk about what they like and need — more than once, as things change.",
      bodyZh: "奥利维娅和雅各布的亲密生活健康而满意，但雅各布担心有一天会停止。随着失智症发展，性生活和身体亲密可能变得更难。保持联结的方法：\n• 抚触、牵手或轻柔按摩，传达温暖、安全和爱。\n• 播放对方喜欢的音乐——音乐是共通的语言。\n• 保持幽默感，缓解沮丧和紧张。\n• 聊聊对方喜欢和需要什么——要多次聊，因为情况会变化。",
    },
    {
      heading: "Reminder: it is okay",
      headingZh: "提醒：这些都没关系",
      body: "• It is okay to take a break.\n• It is okay to ask for help.\n• It is okay to feel frustrated sometimes.\n• It is okay to feel lonely sometimes if the person can no longer meaningfully communicate with you.",
      bodyZh: "• 休息一下没关系。\n• 寻求帮助没关系。\n• 有时感到沮丧没关系。\n• 当对方已无法与你有意义地交流时，有时感到孤单也没关系。",
    },
    {
      heading: "Let’s review what you have learned",
      headingZh: "回顾本课所学",
      body: "• As your role changes, stay connected during your journey together.\n• Plan pleasant activities and relaxation so your role doesn’t become overwhelming.\n• Ask for help — caring for someone with dementia is tiring.\n• Plan well for the future.\n• There are many ways to maintain intimacy and stay connected.",
      bodyZh: "• 角色变化时，在共同的旅程中保持联结。\n• 安排愉快的活动和放松，别让照护压垮你。\n• 寻求帮助——照护失智症患者很累。\n• 好好规划未来。\n• 维系亲密、保持联结的方法有很多。",
    },
  ],
};
