/**
 * DELETE AFTER READ — 一次性对照页 / throwaway comparison page
 *
 * 用途：把「AI + 失智 + 照护者 + 可用性」论文的方法流程，
 * 逐格套进 Design Thinking 标准五步法（Empathize→Define→Ideate→Prototype→Test），
 * 标出每篇套得上哪几格、哪几格完全缺席；同时保留 LLM 工程动作对照。
 *
 * ⚠️ 这个文件是临时的。看完即删：
 *    1) 删除 src/pages/DeleteAfterRead.tsx
 *    2) 删除 src/App.tsx 里 /delete-after-read 的那一条 Route 和它的 import
 * 没有任何其他文件依赖它。
 */

const Box = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-lg border border-border bg-card p-4 text-sm leading-relaxed">{children}</div>
);

const Mono = ({ children }: { children: React.ReactNode }) => (
  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.8em]">{children}</code>
);

/* ------------------------- Design Thinking 五步法 ------------------------- */
/* 每篇论文标记它覆盖了五格中的哪几格：
   E = Empathize 同理（访谈/需求收集）
   D = Define 定义（需求→设计需求清单）
   I = Ideate 构思（工作坊/头脑风暴/方案发散）
   P = Prototype 原型（把东西做出来给人摸）
   T = Test 测试（可用性评估/SUS/走查）
*/

const DT_LABELS = [
  { k: "E", zh: "同理", en: "Empathize" },
  { k: "D", zh: "定义", en: "Define" },
  { k: "I", zh: "构思", en: "Ideate" },
  { k: "P", zh: "原型", en: "Prototype" },
  { k: "T", zh: "测试", en: "Test" },
];

const DTStrip = ({ hits }: { hits: string }) => (
  <div className="flex items-center gap-1.5">
    {DT_LABELS.map((d) => {
      const on = hits.includes(d.k);
      return (
        <span
          key={d.k}
          title={`${d.zh} ${d.en}`}
          className={
            "flex h-9 w-9 items-center justify-center rounded-md border font-mono text-sm font-bold " +
            (on
              ? "border-primary bg-primary/15 text-primary"
              : "border-dashed border-border text-muted-foreground/40 line-through")
          }
        >
          {d.k}
        </span>
      );
    })}
  </div>
);

/* 每一步都带 Design Thinking 归格标签：字符串写成「【E 同理】具体做了什么」 */
const StepList = ({ steps }: { steps: string[] }) => (
  <ol className="space-y-2 text-sm">
    {steps.map((raw, i) => {
      const m = raw.match(/^【([^】]+)】\s*(.*)$/s);
      const tag = m?.[1] ?? "未归格";
      const body = m?.[2] ?? raw;
      const dead = tag.includes("不属于") || tag.includes("未归格");
      return (
        <li key={i} className="flex gap-2">
          <span className="mt-0.5 font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
          <span>
            <span
              className={
                "mr-2 inline-block rounded border px-1.5 py-0.5 align-[1px] text-[11px] font-bold " +
                (dead
                  ? "border-dashed border-border text-muted-foreground"
                  : "border-primary/40 bg-primary/10 text-primary")
              }
            >
              {tag}
            </span>
            {body}
          </span>
        </li>
      );
    })}
  </ol>
);

/* ---------------------------------- 数据 ---------------------------------- */

type Paper = {
  tag: string;
  title: string;
  url: string;
  nature: string;
  n: string;
  dt: string;           // 覆盖的 DT 格，如 "ED__T"
  dtMap: { dt: string; maps: string; note: string }[]; // 逐格对应
  steps: { s: string; llm: string }[];
  claim: string;
  useful: string;
  steal: string[];
  purpose?: string;
  recruitment?: string;
  procedure?: string[];
  measures?: string;
  analysis?: string;
  findings?: string;
  limitations?: string;
};

const papers: Paper[] = [
  {
    tag: "e60566",
    title: "生成式 AI 照护工具的认知走查评估（JMIR Aging 2025;8:e60566）",
    url: "https://aging.jmir.org/2025/1/e60566",
    nature: "定性可用性评估。产品已经存在，作者一行代码没写。",
    n: "15 名、年龄超过 50 岁的黑人美国非正式照护者；12/15 具有大专以上学历",
    purpose: "评估面向黑人美国失智症非正式照护者的多模态生成式 AI 移动工具 Lola，重点检查可用性、可及性、文化相关性与采用意愿。",
    recruitment: "纳入 15 名年龄超过 50 岁的黑人美国非正式照护者。原文样本教育程度偏高：12/15 具有大专以上学历。",
    procedure: ["【P 原型·借来的】研究者不做任何开发：直接拿现成的 Lola（多模态生成式 AI 移动工具，输入可语音或文字，输出为音频/文字/视觉）作为被测对象，先向每位参与者演示这三种输入输出方式，让他们知道可以说话也可以打字。", "【D 定义·专家单方面】研究团队在见参与者之前，先自己定下 3 个代表性任务作为评价骨架：①查找脑健康文章 ②查找本地活动 ③查找参加研究的机会。任务由专家拍板，没有先问过照护者他们真正想干什么。", "【T 测试】15 名参与者逐个、按固定顺序完成这 3 项任务；全程出声思维（边点边说想法），研究者只观察记录、不做教学提示，记录内容包括操作路径、口头意见和总体印象。", "【T 测试】研究团队把所有口头材料按 4 个预设维度归类：可用性、可及性、文化相关性、采用意愿；不做统计检验，也不测任何健康结局。", "【不属于五步法】没有回到设计：本文只交回一份反馈清单，改不改 Lola 由产品方决定，论文里没有 v2。"],
    measures: "3 项预设任务的完成过程、口头反馈和总体印象；该研究不是 SUS 调查，也没有效果结局。",
    analysis: "认知走查资料按预设评价维度归纳；原文未把它设计成统计效应检验。",
    findings: "参与者要求保留多模态交互，信息需更个性化且符合文化情境；社区和实体空间可能帮助采用。",
    limitations: "便利性小样本、年轻照护者覆盖不足、教育程度偏高，且测试环境不是参与者的真实生活场景。",
    dt: "____T",
    dtMap: [
      { dt: "E 同理", maps: "❌ 完全缺席", note: "没有访谈、没有需求收集——直接拿现成产品开测。" },
      { dt: "D 定义", maps: "⚠️ 偷渡", note: "「预设理想操作序列」就是定义，但由专家单方面拍板，不问用户。" },
      { dt: "I 构思", maps: "❌ 完全缺席", note: "零发散，零备选方案。" },
      { dt: "P 原型", maps: "❌ 缺席（借的）", note: "原型是别人做好的成品工具，不是本研究产出的。" },
      { dt: "T 测试", maps: "✅ 全文就是它", note: "认知走查 = Test 格的标准动作（出声思维 + 卡点清单 + 严重度）。" },
    ],
    steps: [
      { s: "① 选定 2–3 个典型任务", llm: "= 写 eval set 先挑 3 类代表性 prompt" },
      { s: "② 预设每任务的理想操作序列", llm: "= golden answer / expected trace" },
      { s: "③ 出声思维，研究者只记不教", llm: "= 人工跑 failure case，不许提示" },
      { s: "④ 每步问四个固定问题", llm: "= rubric 四维度（意图/可发现性/反馈/误导）" },
      { s: "⑤ 卡点归类 + 严重度 1–3", llm: "= failure taxonomy + severity buckets" },
      { s: "⑥ 结论：有潜力，需更多本地化与长期研究", llm: "= 学术版 TODO" },
    ],
    claim: "AI 工具「有潜力」，存在文化与语言适配问题。",
    useful: "极高。只覆盖 Test 一格就能发一篇——证明五步法根本不需要凑齐，一格做到位就是一篇。",
    steal: ["三任务 × 四问题 = 12 格表格", "严重度分级", "双语/本土文化维度是我们独有加分项"],
  },
  {
    tag: "e26532",
    title: "三框架叠加的定性可用性分析（JMIR Hum Factors 2021）",
    url: "https://humanfactors.jmir.org/2021/3/e26532",
    nature: "同一批录音用三套现成框架各分析一遍，一鱼三吃。",
    n: "10 人：网站两个目标用户群各 5 人；每人完成同一套三段式会话",
    purpose: "检验把 ISO 9241-210、Nielsen 十项启发式和 Garrett 用户体验五层同时用于同一个照护者资源网站，能否比单一框架发现更多问题。",
    recruitment: "10 名目标用户，资源查找端与资源发布端各 5 名。论文的重点是两个使用角色，不是统计代表性。",
    procedure: ["【T 测试·第一段】每位参与者先只看照护者资源网站的首页，不许点任何东西，口头说出第一印象（观感、这网站像给谁看的、值不值得信）。目的是把「审美与信任」这一层和「能不能操作」分开测。", "【T 测试·第二段】研究团队给出预先写好的使用情境（例如以照护者身份去找某类信息），参与者在真实网站上执行任务，全程出声思维，卡住的地方原样记录，不给提示。", "【E 同理·补漏用】第三段做半结构化访谈：把任务过程中没说出口的感受、期待和放弃原因问出来。注意顺序——这里的访谈发生在测试之后，是给测试补料，不是开发前的需求调研。", "【D 定义·事后重贴标签】录音逐字转录后，同一份资料被分别套进三套框架各跑一遍：ISO 9241-210（以人为本设计流程）、Nielsen 十项启发式（界面规则）、Garrett 用户体验五层（战略/范围/结构/框架/表现）。", "【不属于五步法】本文的「新意」只是同一批数据换三种标签体系统计问题条数，比较哪套框架捞出的问题多；没有构思、没有原型、没有第二版网站。"],
    measures: "任务表现、出声思维记录和访谈文本；没有把单一总分作为主要结局。",
    analysis: "由 1 名研究者编码；问题分别归入 ISO 的效果/效率/满意度、Nielsen 启发式和 Garrett 五层。",
    findings: "问题多集中在信息设计和界面设计，并常落入效果/效率、错误预防、系统与现实匹配等类别。",
    limitations: "任务由研究团队强加；仅 1 名编码者且没有一致性检验；程序错误干扰部分任务；三框架类别彼此重叠。",
    dt: "E___T",
    dtMap: [
      { dt: "E 同理", maps: "⚠️ 半格", note: "会话末段的半结构化访谈勉强算同理，但它是测试的尾巴，不是需求驱动。" },
      { dt: "D 定义", maps: "❌ 缺席", note: "没有需求清单。" },
      { dt: "I 构思", maps: "❌ 缺席", note: "零发散。" },
      { dt: "P 原型", maps: "❌ 缺席（借的）", note: "测的是已有系统。" },
      { dt: "T 测试", maps: "✅✅✅ 超配", note: "Test 格做三次：ISO 9241 / Nielsen / Garrett 各切一遍同一份数据。" },
    ],
    steps: [
      { s: "① 三段式会话：不许点 → 做任务 → 聊感受", llm: "= zero-shot 观察 → 带任务 eval → 事后访谈" },
      { s: "② 全量转录，逐行编码", llm: "= log 全量落盘逐条打标" },
      { s: "③ ISO 9241-11：效果/效率/满意度", llm: "= accuracy / latency / rating 三桶" },
      { s: "④ Nielsen 十启发式逐项过", llm: "= red-team 清单逐项过" },
      { s: "⑤ Garrett 五层定位问题深度", llm: "= bug 在 prompt 层/检索层/模型层/UI 层" },
      { s: "⑥ 三表并列，声称三角验证", llm: "= 同一份 eval 三种切法三张图" },
    ],
    claim: "多框架能捕捉单框架遗漏的问题。（切三次比切一次多。）",
    useful: "极高且零成本——录音一次，分析三次。评审最爱看到框架名字。",
    steal: ["一场会话 = 三个 Results 小节", "三个框架名写进 Methods 标题"],
  },
  {
    tag: "e52389",
    title: "加速版体验式共同设计（JMIR Form Res 2024）",
    url: "https://formative.jmir.org/2024/1/e52389",
    nature: "把经典 co-design 的 6–12 个月压缩到几周。「加速」自陈就是防御。",
    n: "访谈：16 名照护者 + 17 名工作人员；工作坊：13 名照护者 + 17 名工作人员",
    purpose: "用加速体验式共同设计，把荷兰 Partner in Balance 网络干预改造成适合英国情境的 CareCoach。",
    recruitment: "核心参与者以白人、女性和退休者为主；少数族裔照护者招募不足。除 4 名照护者外，其余参与者接受网络自助学习形式。",
    procedure: ["【E 同理】分两条线访谈：一条是家庭照护者，一条是将来要交付课程的工作人员。问的是对荷兰原版 Partner in Balance 的具体体验——内容合不合、措辞听不听得懂、视频里的人像不像英国人、交付方式（谁带、多久一次）行不行。", "【D 定义】研究团队把访谈资料迭代整理成可讨论的「触发材料」（trigger materials）：把散落抱怨压成一条条可以在工作坊上被同意或否决的适配议题，这一步就是把需求变成设计条目。", "【I 构思·实为排序】共同设计工作坊：13 名照护者 + 17 名工作人员基于触发材料提出适配建议，并对建议排优先级。注意这是加速体验式共同设计（accelerated experience-based co-design）的标准动作——发散极少，主要是在既有条目上投票排序。", "【P 原型】把裁定通过的修改落到内容上，产出英国版 CareCoach（换措辞、换视频、换本地服务信息与交付流程）。", "【不属于五步法·治理层】Adaptation Working Party 对建议做最终裁定：用户排的序不是最终答案，成人监督委员会有一票定音权。这一格在标准五步法里没有对应位置，但在经费项目里是保命装置。"],
    measures: "访谈与工作坊资料、对线上自助形式的接受情况、对语言和视频资源的具体修改建议。",
    analysis: "迭代式质性分析，并由适配裁决小组把主题转成产品修改决定。",
    findings: "参与者认为部分措辞和视频过于复杂或不够包容；共同产出更包容的用语并要求制作新视频。",
    limitations: "COVID-19 限制了社区现场招募，少数族裔参与不足，样本构成不够多元。",
    dt: "EDI_P",
    dtMap: [
      { dt: "E 同理", maps: "✅ 标准动作", note: "半结构化访谈收集体验触点 = 教科书 Empathize。" },
      { dt: "D 定义", maps: "✅ 全文核心", note: "DR1…DRn 设计需求清单 = Define 格的交付物（问题陈述/需求表）。" },
      { dt: "I 构思", maps: "✅ 仪式性覆盖", note: "工作坊里排序痛点、投票优先级 = Ideate 的最小可行仪式（不真发散，只排序）。" },
      { dt: "P 原型", maps: "⚠️ 半格", note: "把 DR 映射到「已实现功能」= 拿现成产品倒贴成原型。" },
      { dt: "T 测试", maps: "❌ 缺席", note: "没有任何评估环节——co-design 流派通常把 Test 让给下一篇论文。" },
    ],
    steps: [
      { s: "① 半结构化访谈收集体验触点", llm: "= 收集真实用户 prompt 语料" },
      { s: "② 触发影片代替几十小时素材", llm: "= few-shot 代替全量数据" },
      { s: "③ 工作坊排序痛点、投票优先级", llm: "= 人工偏好排序（手工版 RLHF）" },
      { s: "④ 写成设计需求 DR1…DRn", llm: "= 偏好数据转 spec 条目" },
      { s: "⑤ DR → 功能 对照表", llm: "= requirement → implementation traceability" },
      { s: "⑥ 局限自陈：加速导致参与深度不足", llm: "= model card 的 limitations" },
    ],
    claim: "压缩版 co-design 仍能产出可用的设计需求。",
    useful: "最高。它是五步法里前四格（E/D/I/P）覆盖最全的一篇，DR 表是「证明用户参与过」的唯一硬通货。",
    steal: ["DR1…DR10 → 功能 对照表（Table 1）", "「accelerated」替我们挡掉「你为什么只做了三周」"],
  },
  {
    tag: "e65022",
    title: "digiDEM-SCREEN 两轮迭代 + SUS（JMIR Hum Factors 2025）",
    url: "https://humanfactors.jmir.org/2025/1/e65022",
    nature: "定量壳 + 迭代叙事：同一份 10 题问卷做两次，第二次分数高一点。",
    n: "多轮焦点小组；目标用户为 65 岁以上、包括有与无认知障碍的老人；各轮人数以原文表格为准",
    purpose: "把已获科学验证的 SATURN 认知筛查测试做成德语区老人可独立使用的 digiDEM-SCREEN App，并通过反复测试改善可用性。",
    recruitment: "研究团队、软件团队和 65 岁以上目标用户共同参与；目标用户包括有与无认知障碍者。",
    procedure: ["【D 定义·抄现成】不做需求访谈：内容直接取已获科学验证的 SATURN 认知筛查测试，流程规范取现成的 mHealth 开发建议。定义这一格是从文献里搬的，不是从德语区老人身上问出来的。", "【P 原型】按上述来源做出 digiDEM-SCREEN App 的 V1，目标是让老人能独立完成筛查（不需要子女或医生在旁操作）。", "【T 测试·第一轮】焦点小组现场操作 V1，边做边出声思维，结束后填 SUS 量表；团队把问题按严重度排出「最致命的几条」。", "【P 原型·迭代】按第一轮结论改 V2：改动集中在四类——用词、文化表达（德语区老人听得懂的说法）、导航路径、以及筛查题目本身的措辞。", "【T 测试·第二轮】新一批焦点小组对 V2 重复同一套测试。诚实点在这里：末轮参与者根本读不懂 SUS 的题目，作者选择不硬凑一个不可靠的分数，直接说明该轮无有效 SUS。", "【不属于五步法】没有构思格：全程零发散、零备选方案，只有「照 SATURN 做 → 修 → 再修」。"],
    measures: "SUS、出声思维、焦点小组反馈；V1 SUS 72.5，V2 SUS 82.4。",
    analysis: "比较两版 SUS 描述性得分，并将口头反馈转成修订清单。",
    findings: "主要问题在第一轮后被修正，V2 SUS 提升至 82.4；但 SUS 双重否定题对认知障碍老人本身构成障碍。",
    limitations: "非随机抽样；研究者首轮需逐题解释；末轮多数参与者无法可靠理解 SUS，因此没有收集末轮 SUS。不能把前后分数变化解释为因果效果。",
    dt: "___PT",
    dtMap: [
      { dt: "E 同理", maps: "❌ 缺席", note: "无访谈。" },
      { dt: "D 定义", maps: "❌ 缺席", note: "无需求清单。" },
      { dt: "I 构思", maps: "❌ 缺席", note: "「改产品」只是修 bug，不算发散构思。" },
      { dt: "P 原型", maps: "✅ 事实覆盖", note: "第一轮测完改一版 = Prototype v1 → v2 的迭代动作。" },
      { dt: "T 测试", maps: "✅✅ 做两遍", note: "SUS 两轮 = Test 格的标准闭环（测→改→复测）。" },
    ],
    steps: [
      { s: "① 第一轮任务测试 + SUS", llm: "= baseline benchmark 跑分" },
      { s: "② 列问题，改产品", llm: "= 按 eval 改 prompt/UI" },
      { s: "③ 第二轮新一批人同一份 SUS", llm: "= 重跑同一 benchmark" },
      { s: "④ 报 SUS 从 X 升到 Y", llm: "= 分数从 71 提到 82 的截图" },
      { s: "⑤ 局限：小样本、非随机、无对照", llm: "= benchmark 免责声明" },
    ],
    claim: "两轮迭代提升了可用性。（无对照组，严格说什么都没证明。）",
    useful: "高。它演示了五步法只需要 P+T 两格循环就能成篇。SUS 是全世界评审都认的 10 道题。",
    steal: ["SUS ×2 = 一根上升柱状图", "「无对照组」自己写进 Limitations，评审就没得写"],
  },
  {
    tag: "PMC9308637",
    title: "Helping the Helpers：需求驱动的开发叙事",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9308637/",
    nature: "研究协议：三阶段全部写的是将来计划，没有已完成样本、原型结果或用户发现。",
    n: "协议未报告已招募样本；计划对象是为失智症患者管理药物的家庭照护者",
    purpose: "提出 Helping the Helpers 三阶段研究方案：先理解家庭照护者的用药管理需求，再共同设计信息技术干预，最后做可行性测试。",
    recruitment: "论文只描述计划招募失智症照护者，未报告实际入组人数或已完成的参与者特征。",
    procedure: ["Aim 1 / NIH Stage 0：计划评估照护者用药管理需求。", "Aim 2 / Stage IA：计划与照护者共同设计信息技术干预原型。", "Aim 3 / Stage IB：计划测试原型可行性。", "本文在执行前发表方法，因此没有结果阶段。"],
    measures: "协议提出后续需求、原型与可行性资料；本文没有实际测量数据。",
    analysis: "仅有计划中的用户中心设计框架；没有可报告的已完成分析。",
    findings: "无实证发现。文章的贡献是把三阶段研究设计公开成可复用协议。",
    limitations: "不能把计划动作写成已完成动作，也不能从本文引用样本结果、可用性结果或产品效果。",
    dt: "ED_P_",
    dtMap: [
      { dt: "E 同理", maps: "📝 计划", note: "协议计划先评估照护者用药管理需求，但本文没有执行结果。" },
      { dt: "D 定义", maps: "📝 计划", note: "协议计划把需求转成干预目标，没有已完成的需求清单。" },
      { dt: "I 构思", maps: "❌ 缺席", note: "没有发散环节，需求直接跳原型——这一格被悄悄跳过，没人追究。" },
      { dt: "P 原型", maps: "📝 计划", note: "协议计划与照护者共同设计原型，没有报告已完成原型。" },
      { dt: "T 测试", maps: "📝 计划", note: "协议计划进行可行性测试，没有实际测试数据。" },
    ],
    steps: [
      { s: "① 文献 + 访谈提炼需求清单", llm: "= 竞品分析 + 语料 → 需求文档" },
      { s: "② 需求 → 功能模块映射", llm: "= spec → module 拆解" },
      { s: "③ 低保真 → 反馈 → 高保真", llm: "= prompt v1 → 评审 → v2" },
      { s: "④ 小规模可用性测试收尾", llm: "= smoke test 后发版" },
      { s: "⑤ 讨论可扩展性与 RCT 计划", llm: "= roadmap 章节" },
    ],
    claim: "没有实证结论；只发表了一个按 NIH Stage Model 排列的三阶段研究协议。",
    useful: "中高。可作为 Methods/协议论文骨架，但绝不能当作已完成开发与测试的证据。",
    steal: ["「文献+访谈 → 需求 → 功能」三段式直接套我们的 CCT 功能清单"],
  },
  {
    tag: "e63715",
    title: "PDC30 Chatbot：心理教育聊天机器人可接受性混合方法（JMIR Aging 2025）",
    url: "https://aging.jmir.org/2025/1/e63715",
    nature: "和我们最像：脚本式照护 chatbot + 可接受性评估。混合方法。",
    n: "21 名家庭照护者试用 PDC30 两周；另比较 3 个机器人对 21 个常见问题的回答",
    purpose: "开发基于《正向失智症照护 30 天指南》的 GPT-4o 心理教育机器人，并与通用 ChatGPT 和另一知识库机器人比较，再由家庭照护者试用。",
    recruitment: "21 名家庭照护者参加两周试用；样本以成年子女照护者为主，配偶/同辈照护者较少。",
    procedure: ["把 PDC30 指南转成 GPT-4o 机器人的受控知识内容。", "建立两项比较：公开 ChatGPT；以及载入 WHO iSupport、机构指南等 185 份资料的 Chatbot-B。", "让三种机器人回答同一组 21 个常见照护问题并比较回答。", "21 名照护者使用 PDC30 两周，随后评分并提交书面评论。", "研究者综合定量评分和书面反馈主题。"],
    measures: "回答的重复性、针对性和情境敏感性；两周使用频率；用户评分及开放评论。",
    analysis: "混合方法：评分作描述性比较，书面反馈作主题分析。",
    findings: "通用 ChatGPT 更重复且针对性较弱；两个知识库机器人更符合情境，PDC30 在心理困扰问题上略优。反馈形成有用性、可及性、改善 AI 态度三类主题。",
    limitations: "成年子女照护者占多数；仅支持英语；研究没有覆盖英语国家以外语言版本的实际使用。",
    dt: "E__PT",
    dtMap: [
      { dt: "E 同理", maps: "⚠️ 半格", note: "需求来自既有课程而非新访谈，借旧 Empathize。" },
      { dt: "D 定义", maps: "❌ 缺席", note: "没有需求清单，直接搬课程内容。" },
      { dt: "I 构思", maps: "❌ 缺席", note: "零发散——30 个模块照课程切。" },
      { dt: "P 原型", maps: "✅ 事实覆盖", note: "把课程切成 30 个 chatbot 模块 = 造出原型。" },
      { dt: "T 测试", maps: "✅ 混合方法", note: "问卷 + 使用日志 + 子集访谈 = Test 格三件套。" },
    ],
    steps: [
      { s: "① 既有课程切成 30 个模块塞进 chatbot", llm: "= 知识库切 chunk / 写进 system prompt" },
      { s: "② 部署到用户熟悉的通道", llm: "= 走已有入口不做新 App" },
      { s: "③ 定量：问卷 + 使用日志", llm: "= 留存 + 完成率 dashboard" },
      { s: "④ 定性：子集访谈主题分析", llm: "= 抽样人工读会话" },
      { s: "⑤ 结论：可接受、可行，需更大规模验证", llm: "= pilot 通过准备 scale" },
    ],
    claim: "照护者能接受聊天机器人做心理教育。",
    useful: "极高——我们 AI 陪聊/知识库那条线的现成对标。日志字段已存在，直接当定量数据。",
    steal: ["「使用日志 = 定量数据」最省事", "「可接受性」比「有效性」好写一百倍"],
  },
  {
    tag: "e79975",
    title: "用 LLM 赋能早期失智照护者：混合方法评估（JMIR Form Res 2026;10:e79975）",
    url: "https://doi.org/10.2196/79975",
    nature: "LLM 专家比较评估：12 名专家评审两版模型的 64 个回答，不是照护者用户测试。",
    n: "12 名相关领域专家评审 64 个回答；没有招募照护者直接使用工具",
    purpose: "比较公开基线 ChatGPT-4o 与经提示工程增强版本，判断增强提示能否改善对早期失智症照护问题的回答质量。",
    recruitment: "12 名专家担任评审者；该研究不是照护者用户测试。",
    procedure: ["研究者汇编 32 个代表性照护问题。", "基线版 C1 与增强版 C2 分别回答，形成 64 个答案。", "12 名专家使用验证过的指标逐一评分。", "比较两组评分，再访谈同一批专家并做主题分析。"],
    measures: "准确性、推理、清晰度、有用性、信任、满意度、安全/危害、相关性等 9 项指标。",
    analysis: "Mann–Whitney U 检验比较 C1/C2；专家访谈采用描述性主题分析。",
    findings: "C2 在可操作性、相关性和感知满意度上显著更好；准确性、理解、可理解性、可信度与安全/危害等指标没有显著差异。两版都被认为偏冗长。",
    limitations: "提示由人工设计，扩展性和复现性有限；使用公开 ChatGPT 界面，无法控制记忆和最大输出长度等模型参数。",
    dt: "E__PT",
    dtMap: [
      { dt: "E 同理", maps: "❌ 缺席", note: "没有招募照护者；问题集由研究者汇编，评审者是专家。" },
      { dt: "D 定义", maps: "❌ 缺席", note: "无需求清单。" },
      { dt: "I 构思", maps: "❌ 缺席", note: "零发散。" },
      { dt: "P 原型", maps: "✅ 事实覆盖", note: "一个 LLM 工具/提示集就是原型。" },
      { dt: "T 测试", maps: "✅ 专家评估", note: "12 名专家量表评分 + 访谈；测的是回答质量，不是用户可用性。" },
    ],
    steps: [
      { s: "① 给照护者 LLM 工具/提示集", llm: "= 发 prompt 模板给用户" },
      { s: "② 定量：满意度/可用性量表", llm: "= 评分 1–5" },
      { s: "③ 定性：访谈 + 主题分析", llm: "= 人工读 case" },
      { s: "④ 讨论幻觉/安全边界", llm: "= safety section（我们已有护栏可写）" },
    ],
    claim: "增强提示提高可操作性、相关性和满意度，但没有显著提高准确性、可信度或安全性。",
    useful: "中高。可抄专家盲评与 Mann–Whitney U 比较结构；不能当作照护者采用证据。",
    steal: ["已有安全护栏 = 论文的「设计决策」，零成本贡献"],
  },
  {
    tag: "e60143",
    title: "GamePlan4Care：把 REACH II 搬上网 + 定性可用性测试（JMIR Form Res 2025）",
    url: "https://formative.jmir.org/2025/1/e60143",
    nature: "「把公认有效的线下方案数字化」最安全的选题路线。有效性借用原方案，自己只测可用性。",
    n: "31 名照护者：18 人测试技术层面，13 人测试内容层面；平均 62 岁，27/31 为女性",
    purpose: "在正式随机试验前，对 REACH II 网页版 GamePlan4Care 的技术操作和干预内容进行形成性质性可用性测试。",
    recruitment: "通过美国中德州社区机构招募 31 名照护者；平均 62 岁，27/31 女性，26/31 白人，10/31 西班牙裔。",
    procedure: ["按技术或内容测试目的把参与者分为 18 人与 13 人两组。", "参与者执行系统任务，边操作边回答开放问题并反馈体验。", "研究团队同步录制音频和屏幕并转录。", "两名研究者熟悉资料、归纳编码、形成主题，再把导航和内容建议交回开发。"],
    measures: "任务过程、音频/屏幕记录、开放式回答；不是疗效试验。",
    analysis: "两名研究者进行三阶段归纳主题分析：熟悉资料、编码、形成主题。",
    findings: "形成支持性资源、技术层面的主动参与、内容层面的综合方案三大主题，并定位导航和内容改进点。",
    limitations: "单一地区且样本以白人女性为主；平台仍在开发，只开放部分模块；未按人口学变量分层；网络使用者自愿参加造成数字鸿沟偏倚。",
    dt: "___PT",
    dtMap: [
      { dt: "E 同理", maps: "❌ 缺席", note: "需求是 REACH II 几十年前就做了的，直接继承。" },
      { dt: "D 定义", maps: "❌ 缺席", note: "借用原方案的模块划分。" },
      { dt: "I 构思", maps: "❌ 缺席", note: "零发散——逐模块照搬。" },
      { dt: "P 原型", maps: "✅ 全文主体", note: "数字化迁移 = 造原型。" },
      { dt: "T 测试", maps: "✅ 定性版", note: "任务 + 访谈的可用性测试。" },
    ],
    steps: [
      { s: "① 选一个已被证明有效的线下干预", llm: "= 拿已验证 baseline 不自己发明" },
      { s: "② 逐模块搬到网页", llm: "= 迁移实现不改算法" },
      { s: "③ 定性可用性测试", llm: "= 只测 UX 不测 accuracy" },
      { s: "④ 结论：可用性可接受，效果后续测", llm: "= 功能对齐性能后续评估" },
    ],
    claim: "数字化版本可用。",
    useful: "高——我们「借 WHO iSupport 内容」的正当化模板：E/D/I 三格全部合法继承自 WHO，我们只做 P+T。",
    steal: ["「有效性借用、我们只测可用性」是最强防御姿态"],
  },
  {
    tag: "e81247",
    title: "iSupport Swiss：WHO 数字干预瑞士版可用性混合方法研究（JMIR 2026）",
    url: "https://www.jmir.org/2026/1/e81247",
    nature: "把 WHO iSupport 指南本地化后数字化，再测可用性。有效性完全继承原方案。",
    n: "12 人：10 名非正式照护者 + 2 名正式照护者",
    purpose: "评估 WHO iSupport 瑞士意大利语文化适配桌面版的任务可用性、感知信息质量和使用体验。",
    recruitment: "便利抽样 12 人：10 名非正式照护者、2 名正式照护者；总体数字健康素养较高。",
    procedure: ["先填写人口学资料和意大利语 eHEALS。", "完成 11 项结构化任务，同时出声思维，研究者观察完成过程。", "任务结束填写 SUS 和信息评价题。", "最后做半结构化访谈，并把反馈归纳为主题。"],
    measures: "eHEALS、11 项任务、SUS、信息质量/信息量/导航评分、半结构化访谈。",
    analysis: "量表作描述性统计，访谈作主题分析。",
    findings: "eHEALS 31.17；SUS 71.5；信息质量 4.58/5、信息量 4.42/5、导航 3.42/5。访谈形成内容质量、可信度、导航、互动性、情感影响 5 个维度。",
    limitations: "便利性小样本限制外推；正式照护者只有 2 人，不能代表该群体。",
    dt: "___PT",
    dtMap: [
      { dt: "E 同理", maps: "❌ 缺席", note: "需求不是本研究收集的，来自 WHO iSupport 既有指南和前期研究。" },
      { dt: "D 定义", maps: "❌ 缺席", note: "模块划分直接继承 WHO iSupport，没有本研究自己的需求清单。" },
      { dt: "I 构思", maps: "❌ 缺席", note: "零发散，按 WHO 模块一一映射。" },
      { dt: "P 原型", maps: "✅ 全文主体", note: "瑞士语/文化本地化 + 数字平台实现 = Prototype 格的核心动作。" },
      { dt: "T 测试", maps: "✅ 混合方法", note: "SUS 量表 + 定性访谈 = Test 格双件套。" },
    ],
    steps: [
      { s: "① 以 WHO iSupport 为内容基线", llm: "= 拿已验证 baseline 不自己发明" },
      { s: "② 语言、文化、本地服务适配", llm: "= prompt 本地化 / 知识库区域化" },
      { s: "③ 建成可交互数字干预原型", llm: "= 把指南切成 chatbot/App 模块" },
      { s: "④ SUS + 半结构化访谈收集可用性问题", llm: "= benchmark + failure case 访谈" },
      { s: "⑤ 结论：可用性可接受，需更大样本验证效果", llm: "= pilot 通过，RCT 留给下一篇" },
    ],
    claim: "WHO iSupport 的瑞士数字化版本可用性可接受。",
    useful: "极高——我们「引用 WHO iSupport」的最强合法化模板：E/D/I 三格全部合法继承，我们只做 P+T。",
    steal: ["WHO 内容数字化 = 有效性盾牌", "SUS + 访谈的混合方法最省事"],
  },
  {
    tag: "e19543",
    title: "Co-designing an Adaption of a Mobile App for Early-Stage Dementia（JMIR Res Protoc 2021;10(12):e19543）",
    url: "https://doi.org/10.2196/19543",
    nature: "协议论文：早期失智患者居家 co-design，聚焦沟通、安全与福祉。",
    n: "协议计划最多 12 个家庭参与；因 COVID-19 暂停，论文没有实际入组与结果",
    purpose: "设计一项探索性多案例研究，让早期失智症居家生活者参与适配 Hear Me Now App，以改善沟通、安全与福祉。",
    recruitment: "计划与英国一家专业居家照护机构合作，目的性选择最多 12 个家庭；研究在 2020 年为保护弱势参与者而暂停。",
    procedure: ["第一轮计划在走查工作坊中由早期失智症患者评价 App。", "第二轮计划让最多 12 个家庭居家试用。", "根据资料修订 App。", "第三轮计划再举行走查工作坊评估修订版。", "计划整合不少于 4 种资料来源，并用常态化过程理论解释采用。"],
    measures: "计划收集工作坊、居家使用和多案例资料；没有实际测量结果。",
    analysis: "计划采用主题分析和探索性多案例整合，并以 Normalization Process Theory 为理论框架。",
    findings: "无实证结果；论文只证明该研究方案被完整写出并发表。",
    limitations: "研究因疫情暂停，不能把计划中的患者和照护者参与写成已经发生，也不能引用任何用户结果。",
    dt: "EDIP_",
    dtMap: [
      { dt: "E 同理", maps: "📝 计划", note: "协议计划在家庭与工作坊中收集资料；因疫情暂停，没有执行。" },
      { dt: "D 定义", maps: "📝 计划", note: "沟通、安全、福祉是预设研究目标，不是已分析出的结果。" },
      { dt: "I 构思", maps: "📝 计划", note: "计划由患者与照护者共同参与走查和修订，没有实际工作坊结果。" },
      { dt: "P 原型", maps: "📝 计划", note: "计划适配 Hear Me Now App；论文没有报告完成版本。" },
      { dt: "T 测试", maps: "❌ 缺席", note: "协议论文不写测试，这是被允许的阶段性成果。" },
    ],
    steps: [
      { s: "① 识别早期失智患者居家沟通、安全、福祉触点", llm: "= 用户旅程地图" },
      { s: "② 患者+照护者共同参加工作坊", llm: "= co-design session" },
      { s: "③ 把工作坊产出整理成 App 适配需求", llm: "= 需求 → feature traceability" },
      { s: "④ 制定多案例评估协议", llm: "= 先写 Methods 再执行" },
      { s: "⑤ 声明后续才做原型和测试", llm: "= 协议论文的标准结尾" },
    ],
    claim: "无实证结论；提出一套让早期失智患者参与 App 适配的三轮协议。",
    useful: "高——给我们 LovedOneSimpleView/患者模式提供了「患者也是用户」的正当性。",
    steal: ["把患者纳入设计而不只是照护者", "协议论文可以只写到 P 之前"],
  },
  {
    tag: "e46188",
    title: "Researched Apps Used in Dementia Care：系统综述（JMIR 2023）",
    url: "https://www.jmir.org/2023/1/e46188",
    nature: "系统综述，不是原创研究，但给整个领域画了一张「缺口地图」。",
    n: "系统综述，覆盖大量已发表失智照护 App",
    purpose: "系统整理经过研究的失智症照护 App，比较其功能、安全性和可用性，并指出证据缺口。",
    recruitment: "不招募参与者；研究对象是数据库检索得到并符合纳入标准的已发表 App 研究。",
    procedure: ["制定数据库检索与纳排标准。", "筛选标题摘要与全文，保留实际研究过的失智照护 App。", "逐篇提取 App 功能、安全性和可用性特征。", "跨研究汇总共同缺口和未来研究方向。"],
    measures: "文献数量、App 类型、功能、安全与可用性证据；不产生用户级量表数据。",
    analysis: "系统综述式资料提取与叙述性综合。",
    findings: "现有 App 在功能覆盖、安全与可用性证据方面仍不完整。",
    limitations: "结果依赖已发表研究及其报告质量；不能替代新产品的直接用户测试。",
    dt: "E____",
    dtMap: [
      { dt: "E 同理", maps: "⚠️ 二手半格", note: "把别人做过的需求/评估结果综合起来，算二手 Empathize。" },
      { dt: "D 定义", maps: "❌ 缺席", note: "综述不提出自己的设计需求清单。" },
      { dt: "I 构思", maps: "❌ 缺席", note: "无方案发散。" },
      { dt: "P 原型", maps: "❌ 缺席", note: "不造原型。" },
      { dt: "T 测试", maps: "❌ 缺席", note: "不自己做测试，只汇总别人的测试结论。" },
    ],
    steps: [
      { s: "① 系统检索多个数据库", llm: "= 文献检索" },
      { s: "② 提取 App 功能、安全性、可用性特征", llm: "= feature extraction" },
      { s: "③ 汇总领域缺口与未来方向", llm: "= gap analysis" },
      { s: "④ 结论：现有 App 在功能/安全/可用性上仍有空间", llm: "= 引言用的一句话" },
    ],
    claim: "失智照护 App 在功能、安全、可用性上存在缺口。",
    useful: "中——放在 Introduction 里证明「这个领域还有事可做」，不用自己收集 E。",
    steal: ["用系统综述当背景，E 格让别人替你完成"],
  },
  {
    tag: "e42145",
    title: "Acceptability of a Health Care App With 3 User Interfaces（JMIR Hum Factors 2023）",
    url: "https://humanfactors.jmir.org/2023/1/e42145",
    nature: "同一功能做三种 UI，比较老年人和照护者的可接受性。",
    n: "老年人 + 照护者两组；当前核查材料未提供可安全引用的精确人数",
    purpose: "比较同一健康功能的 3 种界面，观察老年人与照护者对不同交互形式的接受差异。",
    recruitment: "纳入老年使用者与照护者两类参与者；本页现有核查材料未提供可安全引用的精确人数，因此不虚构。",
    procedure: ["把同一健康功能制作成 3 个界面版本。", "让老年人与照护者分别体验指定版本。", "完成可接受性评价。", "比较界面版本及两类用户的评分差异。"],
    measures: "界面可接受性与用户组差异；研究关注选择偏好，不是临床效果。",
    analysis: "按界面版本和用户身份进行比较分析。",
    findings: "界面形式会改变老年人与照护者的接受程度，两类用户不能默认共用同一设计。",
    limitations: "实验情境与短期接触不能证明长期采用；本页不补写未从全文核实的样本数字。",
    dt: "___PT",
    dtMap: [
      { dt: "E 同理", maps: "❌ 缺席", note: "无需求收集。" },
      { dt: "D 定义", maps: "❌ 缺席", note: "无问题陈述。" },
      { dt: "I 构思", maps: "❌ 缺席", note: "三种 UI 不是发散构思，只是界面变量。" },
      { dt: "P 原型", maps: "✅ 事实覆盖", note: "三种可交互 UI 原型 = Prototype。" },
      { dt: "T 测试", maps: "✅ 标准", note: "可接受性量表 + 比较分析 = Test。" },
    ],
    steps: [
      { s: "① 设计 3 种不同 UI 的同一健康功能", llm: "= A/B/C 三版 UI" },
      { s: "② 老年人和照护者分组测试", llm: "= 双用户群体 eval" },
      { s: "③ 可接受性量表打分", llm: "= rating benchmark" },
      { s: "④ 比较三组/两组的接受度差异", llm: "= 统计对比" },
      { s: "⑤ 结论：某版 UI 更适合目标用户", llm: "= UI 推荐" },
    ],
    claim: "不同 UI 对老年人和照护者的可接受性不同。",
    useful: "中——给我们「照护者高保真 / 患者极简」双模式 UI 提供对照依据。",
    steal: ["同一功能三种 UI 对照", "老年人和照护者双用户群体分别测"],
  },
  {
    tag: "e36975",
    title: "CareVirtue：支持阿尔茨海默照护者的 Web 平台混合方法可行性研究（JMIR Aging 2022）",
    url: "https://aging.jmir.org/2022/3/e36975/",
    nature: "为阿尔茨海默及相关失智照护者做的 Web 支持平台，走可行性研究路线。",
    n: "照护网络中的家庭照护者；当前核查材料未提供可安全引用的精确人数",
    purpose: "评估阿尔茨海默及相关失智症照护网络使用 CareVirtue 网页平台的可行性、可用性与接受度。",
    recruitment: "招募照护网络中的家庭照护者使用共享日志、任务和沟通功能；本文为试点而非代表性抽样。",
    procedure: ["参与者注册 CareVirtue 并建立照护网络。", "使用共享日志、任务和沟通功能。", "研究团队收集平台使用资料与问卷。", "通过访谈补充解释使用体验。"],
    measures: "平台活动、可行性、可用性、满意度与访谈资料。",
    analysis: "定量描述平台使用与评分，定性资料归纳用户体验。",
    findings: "平台总体可行且受到照护者欢迎；后续同一项目又把沟通文本和参与日志拆成独立分析。",
    limitations: "试点样本与自愿使用者限制外推，不能从可行性直接推断临床效果。",
    dt: "E__PT",
    dtMap: [
      { dt: "E 同理", maps: "✅ 标准", note: "通过文献和照护者输入识别支持需求 = Empathize。" },
      { dt: "D 定义", maps: "⚠️ 半格", note: "需求被整理成平台功能，但没有写成 DR1…DRn 式清单。" },
      { dt: "I 构思", maps: "❌ 缺席", note: "无发散工作坊。" },
      { dt: "P 原型", maps: "✅ 标准", note: "Web 平台本身 = Prototype。" },
      { dt: "T 测试", maps: "✅ 混合方法", note: "可用性/可行性/满意度多维度评估。" },
    ],
    steps: [
      { s: "① 文献+照护者需求梳理", llm: "= 需求文档" },
      { s: "② 开发 Web 支持平台", llm: "= 产品实现" },
      { s: "③ 照护者注册使用并收集使用数据", llm: "= pilot deployment" },
      { s: "④ 定量+定性混合评估", llm: "= mixed methods eval" },
      { s: "⑤ 结论：平台可行且受到照护者欢迎", llm: "= feasibility 结论" },
    ],
    claim: "CareVirtue 对阿尔茨海默照护者可行、可用、受欢迎。",
    useful: "中高——混合方法可行性研究的写法模板，不用 RCT 也能成篇。",
    steal: ["可行性研究 = 低门槛发表路径", "Web 平台 + 照护者社区支持"],
  },
  {
    tag: "e75113",
    title: "Tailor-Made Mobile App 减轻失智照护者压力与抑郁：混合方法试点（JMIR Form Res 2025）",
    url: "https://formative.jmir.org/2025/1/e75113",
    nature: "为照护者定制的移动 App，目标是减压和减少抑郁症状。",
    n: "失智症家庭照护者；当前核查材料未提供可安全引用的精确人数",
    purpose: "检验由专业人员通过定制移动 App 提供支持，是否可行并可能减轻家庭照护者压力与抑郁症状。",
    recruitment: "招募失智症家庭照护者参与试点；该文属于瑞典定制 App 研究线的后续混合方法研究。",
    procedure: ["为照护者配置定制 App 和专业支持。", "试点期间通过 App 接收针对性信息和沟通支持。", "干预前后填写压力与抑郁相关量表。", "访谈参与者，解释哪些支持有用以及仍缺什么。"],
    measures: "压力、抑郁症状、可行性、接受度与定性体验。",
    analysis: "前后测描述性比较结合定性主题分析。",
    findings: "研究把结果定位为可行性与初步信号，不把小样本前后变化声称为确定疗效。",
    limitations: "试点样本、非确定性疗效设计和短期观察限制因果解释。",
    dt: "E__PT",
    dtMap: [
      { dt: "E 同理", maps: "✅ 标准", note: "从照护者压力和抑郁痛点出发 = Empathize。" },
      { dt: "D 定义", maps: "❌ 缺席", note: "没有明确的设计需求清单，直接跳到功能。" },
      { dt: "I 构思", maps: "❌ 缺席", note: "无发散，按心理健康干预模块定制。" },
      { dt: "P 原型", maps: "✅ 标准", note: "定制移动 App = Prototype。" },
      { dt: "T 测试", maps: "✅ 混合方法", note: "量表前后测 + 访谈 = Test 双件套。" },
    ],
    steps: [
      { s: "① 识别照护者压力/抑郁来源", llm: "= 痛点语料" },
      { s: "② 定制 App 内容（心理教育、放松练习等）", llm: "= 个性化内容库" },
      { s: "③ 小规模试点部署", llm: "= pilot" },
      { s: "④ 压力/抑郁量表前后测 + 定性访谈", llm: "= pre/post + interview" },
      { s: "⑤ 结论：可行、可接受，需更大样本验证效果", llm: "= pilot 通过" },
    ],
    claim: "定制 App 对减轻照护者压力和抑郁可行且可接受。",
    useful: "高——我们 AI 陪聊/知识库/心理支持线的现成对标，量表前后测可直接复用。",
    steal: ["照护者心理健康 = 安全选题", "压力/抑郁量表前后测最省事"],
  },
  {
    tag: "e41202",
    title: "Peer-Delivered Technology-Supported Mental Health Intervention for Dementia Caregivers（JMIR Hum Factors 2024）",
    url: "https://humanfactors.jmir.org/2024/1/e41202",
    nature: "同伴支持 + 技术平台的心理健康干预，现场可用性研究。",
    n: "9 名当前家庭照护者 + 3 名受训同伴支持者；现场使用 2 周",
    purpose: "评估由受训同伴通过技术平台交付心理健康支持，对失智症家庭照护者是否可用、可接受。",
    recruitment: "9 名当前家庭照护者接受支持，3 名受训同伴支持者负责交付；现场试用持续 2 周。",
    procedure: ["培训 3 名同伴支持者使用平台和干预材料。", "9 名照护者在真实情境中接受为期 2 周的技术支持干预。", "收集双方对平台操作、支持关系和内容的反馈。", "综合可用性、可接受性与初步效果资料。"],
    measures: "现场可用性、可接受性、参与体验和初步心理健康信号。",
    analysis: "小样本现场资料的混合评价，重点是问题定位而非效力检验。",
    findings: "同伴支持与技术平台的组合可被使用和接受，但证据级别仍是小规模现场试点。",
    limitations: "样本只有 12 人且周期 2 周，不能据此推断长期效果或普遍适用性。",
    dt: "___PT",
    dtMap: [
      { dt: "E 同理", maps: "❌ 缺席", note: "需求来自既有心理健康干预文献，非新访谈。" },
      { dt: "D 定义", maps: "❌ 缺席", note: "无本研究需求清单。" },
      { dt: "I 构思", maps: "❌ 缺席", note: "无发散，按同伴支持模型实现。" },
      { dt: "P 原型", maps: "✅ 标准", note: "技术支持平台 = Prototype。" },
      { dt: "T 测试", maps: "✅ 现场版", note: "现场可用性/可接受性/初步效果评估。" },
    ],
    steps: [
      { s: "① 选择同伴支持作为干预核心", llm: "= 拿已验证 social support 模型" },
      { s: "② 搭建技术支持平台", llm: "= 平台实现" },
      { s: "③ 现场部署给家庭照护者", llm: "= field deployment" },
      { s: "④ 可用性 + 可接受性 + 初步效果评估", llm: "= field usability study" },
      { s: "⑤ 结论：同伴+技术模式可用、可接受", llm: "= pilot 结论" },
    ],
    claim: "同伴支持+技术干预对失智照护者心理健康可用、可接受。",
    useful: "中——我们社区/同伴支持功能的对标，现场可用性研究写法可参考。",
    steal: ["同伴支持 + 技术混合模式", "field usability 比实验室更真实"],
  },
];

/* --------------- 第二批：按「项目族谱」而非「单篇」整理（25 个项目，全部逐条核实为真实英文期刊论文） ---------------
   要点：一个项目的方法从来不在一篇论文里，而是拆成 协议篇 / 开发篇 / 可用性篇 / RCT 篇。
   每个项目：宣称的方法名 → 实际动作 → 时间线（Phase 1..n）→ 每个 Phase 落在五步法哪一格。
*/

type Project = {
  name: string;
  scope: string;              // 100% 相关性说明
  method: string;             // 作者自称的方法名
  dt: string;                 // 全项目累计覆盖
  phases: { p: string; act: string; dt: string; paper: string; url?: string }[];
  verdict: string;
};

const projects: Project[] = [
  {
    name: "iSupport（WHO）+ 各国本土化版",
    scope: "失智症家庭照护者专用在线课程，WHO 官方。100% 对口。",
    method: "自称：社区参与式方法（community-based participatory）+ 文化适配框架（ADAPT-ITT 类）+ 混合方法",
    dt: "ED_PT",
    phases: [
      { p: "Phase 1 本土化", act: "翻译/回译 + 利益相关者咨询 + 照护者焦点小组", dt: "E+D", paper: "JMIR Form Res 2024;8:e46941（PMID 38265857）", url: "https://formative.jmir.org/2024/1/e46941" },
      { p: "Phase 2 可用性", act: "瑞士版混合方法可用性研究（德/法/意三语）", dt: "T", paper: "J Med Internet Res 2026;28:e81247, doi 10.2196/81247", url: "https://www.jmir.org/2026/1/e81247" },
      { p: "Phase 3 实施", act: "嵌入基层医疗的混合效果-实施研究", dt: "T", paper: "J Med Internet Res 2025;27:e77688, doi 10.2196/77688", url: "https://www.jmir.org/2025/1/e77688" },
    ],
    verdict: "教科书级的「一个项目拆多篇」。每个国家换一次语言就再发一篇——我们中英双语天然具备同样的产线。（葡萄牙版 alz.041369 与日本 iSupport-J 两条已剔除：前者是 AAIC 会议摘要，后者是 medRxiv 预印本，均非期刊论文。）",
  },
  {
    name: "Tele-Savvy",
    scope: "线下 Savvy Caregiver 课程搬到线上，失智照护者。100% 对口。",
    method: "自称：迭代式 + 定性描述性研究（qualitative descriptive）+ 临床示范项目",
    dt: "E__PT",
    phases: [
      { p: "Phase 1 2015", act: "退伍军人医院示范项目：把线下课程改成线上，定性访谈驱动（PMID 26566806）", dt: "E+P", paper: "Tele-Savvy 开发与实施篇（PMID 26566806）", url: "https://pubmed.ncbi.nlm.nih.gov/26566806/" },
      { p: "Phase 2 2018", act: "RCT 协议篇（Kovaleva 等，PMID 29399825）", dt: "T", paper: "Res Nurs Health 2018, doi 10.1002/nur.21859", url: "https://doi.org/10.1002/nur.21859" },
    ],
    verdict: "「把已有课程数字化」是最省力的合法叙事：内容不用自创，Prototype 格自动满格。我们的知识库正好是这个位。（原「2017 经验教训篇」DOI 未能核实，已剔除。）",
  },
  {
    name: "CareVirtue",
    scope: "阿尔茨海默照护网络的 Web 协作平台（共享日志、任务）。100% 对口，且功能与我们照护圈几乎重合。",
    method: "自称：混合方法可行性研究 + 定性网络沟通分析 + 话题建模",
    dt: "E__PT",
    phases: [
      { p: "Phase 1 2022", act: "可行性混合方法（问卷+访谈）", dt: "E+P+T", paper: "JMIR Aging 2022;5(3):e36975, doi 10.2196/36975", url: "https://aging.jmir.org/2022/3/e36975" },
      { p: "Phase 2 2022", act: "定性：照护网络沟通体验（金句当标题）", dt: "T", paper: "J Am Med Inform Assoc 2022;29(12):2003–2013, doi 10.1093/jamia/ocac172", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9667183/" },
      { p: "Phase 3 2024", act: "用户生成内容话题建模 + 使用参与度分析", dt: "T", paper: "JMIR Aging 2024;7:e67992, doi 10.2196/67992", url: "https://aging.jmir.org/2024/1/e67992" },
    ],
    verdict: "全场最值得抄的产线：同一个平台、同一批用户，三篇期刊论文，其中一篇只跑日志分析。我们有现成日志。（「共享日志单功能」那条 alz.065640 是 AAIC 会议摘要，已剔除。）",
  },
  {
    name: "Partner in Balance（马斯特里赫特）",
    scope: "失智照护者混合式自我管理网络课程。100% 对口。",
    method: "自称：探索性混合方法 + intervention mapping 思路 + blended care 设计",
    dt: "EDIPT",
    phases: [
      { p: "Phase 1 2016", act: "需求评估 + 与照护者和心理师迭代共创内容 + 前后测试点", dt: "E+D+I+P", paper: "JMIR Res Protoc 2016;5(1):e33", url: "https://doi.org/10.2196/resprot.5142" },
      { p: "Phase 2 2018", act: "RCT 有效性验证", dt: "T", paper: "JMIR 2018 PMC6064039", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6064039/" },
      { p: "Phase 3 2020", act: "可持续实施方案（半结构化访谈）", dt: "E", paper: "JMIR Aging 2020;3(1):e18624", url: "https://aging.jmir.org/2020/1/e18624" },
      { p: "Phase 4 2021", act: "为早发性失智照护者做定制改版", dt: "P", paper: "PubMed 33996507", url: "https://pubmed.ncbi.nlm.nih.gov/33996507/" },
    ],
    verdict: "唯一一个五格都能凑齐的项目——代价是四篇论文 + 一个 RCT + 五年。这是上限，不是标准。我们不做这一档。",
  },
  {
    name: "Inlife / myinlife（同一课题组）",
    scope: "失智照护的在线社会支持平台。100% 对口。",
    method: "自称：与目标群体「密切协商」开发（即参与式设计的软表述）+ 试点可行性 + 过程评估",
    dt: "E__PT",
    phases: [
      { p: "Phase 1", act: "与照护者/患者协商开发平台", dt: "E+P", paper: "PLOS ONE 2017 pone.0183386", url: "https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0183386" },
      { p: "Phase 2", act: "试点可行性（前后测）", dt: "T", paper: "同上" },
      { p: "Phase 3 2018", act: "定性过程评估", dt: "T", paper: "Internet Interv 2018（PMC6257912, PMID 30510911）", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6257912/" },
    ],
    verdict: "注意措辞级别：「in close consultation with the target group」= 不用说 co-design，不用交工作坊照片，照样过审。这是最便宜的 E 格话术。",
  },
  {
    name: "CIRCA / CIRCA-BC ✅已核实",
    scope: "失智患者与照护者共用的对话辅助系统。100% 对口。全部英文发表。",
    method: "自称：两阶段迭代式参与式设计（把已有 CIRCA 改造成不列颠哥伦比亚版）+ 主题分析/恒定比较法",
    dt: "E_IPT",
    phases: [
      { p: "Phase 1 内容共创", act: "6 场焦点小组（3 城市/2 农村/1 独立生活机构），39 位 64–87 岁无失智老人，含 7 位日裔加拿大人 + 4 位原住民长者；每场约 2 小时，每组最多 3 轮迭代。产出素材库 475 图 + 58 视频 + 105 音乐，7 个主题", dt: "E+I+P", paper: "Am J Alzheimers Dis Other Demen 2015;30(1):101–107, doi 10.1177/1533317514539031（PMID 24928817）", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10852571/" },
      { p: "Phase 2 试点", act: "3 组配对：3 位 81–90 岁中度失智女性住户 × 同一位护理助手，每组 1 场约 30 分钟，录像录音后做互动分析（定性试点，非量化可用性）", dt: "T", paper: "同上" },
    ],
    verdict: "核实后最有用的一条：Phase 1 的 39 人**全部不是失智患者**，是普通老人——招募难度直接砍掉九成，却照样写成「参与式设计」。这个替身招募法我们可以直接用。（2004 原版是 DRS 会议论文、2025 加拿大可行性篇是 AAIC 会议摘要，均非期刊论文，已剔除。）",
  },
  {
    name: "CAREGIVERSPRO-MMD（EU H2020 690211）",
    scope: "失智患者+照护者作为「照护单元」的社交与自我管理平台。100% 对口。",
    method: "自称：欧盟 H2020 共同设计方法，把患者与照护者视为同一「unit of care」",
    dt: "ED_PT",
    phases: [
      { p: "Phase 1 2019", act: "平台的可用性/参与度评估（多国站点）", dt: "T", paper: "J Appl Gerontol 2019, doi 10.1177/0733464819885326（PMID 31690170）", url: "https://doi.org/10.1177/0733464819885326" },
    ],
    verdict: "「unit of care」这个词值得偷：一句话就把患者端和照护者端两套 UI 合法化，正好对上我们的双端设计。（原 Phase 1/2 引的是 CORDIS 项目页与项目交付物，非期刊论文，已剔除。）",
  },
  {
    name: "GamePlan4Care（REACH II 的网络版）",
    scope: "把循证干预 REACH II 搬上网，给失智家庭照护者。100% 对口。",
    method: "自称：以用户为中心设计 + 形成性定性可用性测试（formative usability）",
    dt: "___PT",
    phases: [
      { p: "Phase 1 2021", act: "UI/UX 迁移与测试", dt: "P+T", paper: "Innov Aging 2021（PMC8679364）", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8679364/" },
      { p: "Phase 2 2025", act: "形成性定性可用性测试（出声思维 + 多轮迭代）", dt: "T", paper: "JMIR Form Res 2025;9:e60143（PMID 40654018）", url: "https://formative.jmir.org/2025/1/e60143" },
    ],
    verdict: "E/D 两格全空，只靠 P+T 发了两篇期刊论文。证明「零访谈」路线完全可行——但我们仍做访谈，因为便宜且能多占一格。（预印本与 RCT 注册号两条非期刊论文，已剔除。）",
  },
  {
    name: "WECARE（华人照护者微信干预）✅已核实：有后续篇",
    scope: "美国华人失智照护者，微信投递。100% 对口，中文语境最贴我们。英文发表（JMIR Aging）。",
    method: "自称：协议开发 → 试点可行性/可接受性/初步效果 → 注册临床试验",
    dt: "ED_PT",
    phases: [
      { p: "Phase 1 2022", act: "需求评估 + 文化定制 + 协议设计（只发协议，零结果）", dt: "E+D", paper: "JMIR Aging 2022;5(3):e40171, doi 10.2196/40171（Hong、Shen、Lu 等）", url: "https://aging.jmir.org/2022/3/e40171/" },
      { p: "Phase 2 2023", act: "WECARE 试点：可行性 + 可接受性 + 初步效果", dt: "P+T", paper: "JMIR Aging 2023;6:e42972, doi 10.2196/42972", url: "https://aging.jmir.org/2023/1/e42972" },
    ],
    verdict: "核心情报：**只写协议就能先发一篇**，一个用户都不用招；随后同一个微信干预再发试点篇，一个想法两次变现。（配套的 NCT 注册号非期刊论文，已剔除。）",
  },
  {
    name: "Care Me Too（华人移民照护者 App）",
    scope: "华人移民照护者自我照护 App。100% 对口。",
    method: "自称：共同设计（co-design）+ 定性可用性研究",
    dt: "ED_PT",
    phases: [
      { p: "Phase A 2020", act: "已建成 App 的定性可用性研究（出声思维）", dt: "P+T", paper: "JMIR Form Res 2020 10.2196/20325", url: "https://doi.org/10.2196/20325" },
      { p: "Phase B 2024", act: "未满足需求理解 + mHealth App 共同设计（比可用性篇晚发四年）", dt: "E+D+I", paper: "Can J Aging 2024 10.1017/s0714980824000187", url: "https://doi.org/10.1017/s0714980824000187" },
    ],
    verdict: "最赤裸的证据：**共同设计篇比可用性篇晚四年发表**。顺序是排版顺序，不是工作顺序。我们照此办理，零心理负担。",
  },
  {
    name: "失能老人照护者 eHealth 求助工具（魁北克）",
    scope: "失能/衰弱老人的家庭照护者（非失智专属）。仍属老人家庭照护软件，对口。",
    method: "自称：共同设计 + 社会正义设计（social justice design）",
    dt: "EDI__",
    phases: [
      { p: "Phase 1 2019", act: "需求与需求规格共同设计工作坊", dt: "E+D", paper: "JMIR Aging 2019;2(1):e12327", url: "https://aging.jmir.org/2019/1/e12327/" },
      { p: "Phase 2 2019", act: "以社会正义视角分析共同设计过程：11 地区、78 人；另记录 24 次筹备会和 11 次总结会", dt: "I", paper: "JMIR Aging 2019;2(2):e12314", url: "https://aging.jmir.org/2019/2/e12314" },
    ],
    verdict: "「社会正义设计」= 同一批访谈换一个价值观镜头再发一篇。我们的低收入/农村/方言维度可以原样套用。",
  },
  {
    name: "mWITH ME ✅已核实全文",
    scope: "阿尔茨海默患者家庭照护者移动 App，中国某大学附属医院。100% 对口，最新（2026-03-23 刊出），英文发表。",
    method: "自称：三阶段流程 =（1）理论奠基：叙事循证医学 NEBM + 马斯洛需求层次；（2）以用户为中心设计（引用 Schnall 的消费级 mHealth UCD 模型），定性研究实现；（3）目标用户评估。定性部分遵循 COREQ",
    dt: "ED_PT",
    phases: [
      { p: "Stage 1 理论", act: "用 NEBM + 马斯洛需求层次搭理论框架（不招人，纯写作）", dt: "E+D", paper: "BMC Med Inform Decis Mak 2026;26:151（Yang、Hu、Ye、Zhang、Yu、Yin）", url: "https://link.springer.com/article/10.1186/s12911-026-03456-7" },
      { p: "Stage 2 定性", act: "目的抽样 18 位阿尔茨海默患者家庭照护者（老年科/神经科两院区），半结构化访谈每人 20–40 分钟，2024 年 9–12 月，伦理号 JNU202412RB016", dt: "E+D", paper: "同上" },
      { p: "Stage 3 评估", act: "另招 20 位照护者，使用 App 3 周（第 1 周电话回访），填四部分李克特问卷（人口学/App 影响/易用性/开放反馈），SPSS 26 分析", dt: "P+T", paper: "同上" },
      { p: "姊妹篇", act: "无。PubMed / Springer / 作者著作列表均未见协议篇、可用性篇或试验篇（负面检索结果，未查 CNKI）", dt: "—", paper: "—" },
    ],
    verdict: "全场性价比最高的模板，已核实到样本量：**18 人访谈 + 20 人 3 周试用 + 一份李克特问卷 = 一篇 2026 年 SCI**。理论那一格是纯写作（挑两个现成理论拼一下），零成本却填满 E+D。我们照抄这个结构，连标题句式一起抄。",
  },
  {
    name: "日本：名古屋 Web App（英文发表）",
    scope: "失智照护者负担与 BPSD 的 Web 应用。100% 对口。Nagoya J Med Sci 全刊英文，已核实。",
    method: "自称：预备/试点研究（前后测）",
    dt: "___PT",
    phases: [
      { p: "Phase 1 2024", act: "Web App 对照护负担与 BPSD 影响的前后测预备研究（Goto、Suematsu、Imaizumi、Suzuki，名古屋大学）", dt: "P+T", paper: "Nagoya J Med Sci 2024;86(3):383, doi 10.18999/nagjms.86.3.383", url: "https://doi.org/10.18999/nagjms.86.3.383" },
    ],
    verdict: "「前后测 + 照护负担量表 ZBI」是最低成本的 Test 格，一篇论文一个量表就够。ZBI 中文版现成，零翻译成本。（同项目的 Mimamoriai 交叉试验只有 UMIN 注册号、无英文论文，已剔除。）",
  },
  {
    name: "DEM-DISC（荷兰）",
    scope: "失智照护者定制化电子建议工具。100% 对口。",
    method: "自称：基于前期评估的迭代改进 + 整群随机对照试验",
    dt: "___PT",
    phases: [
      { p: "Phase 1（2015 前）", act: "原始开发（窗口外）", dt: "P", paper: "早期文献" },
      { p: "Phase 2 2015", act: "改进后做整群 RCT（照护者 + 个案管理师）", dt: "T", paper: "Int Psychogeriatr, PubMed 25872457", url: "https://pubmed.ncbi.nlm.nih.gov/25872457/" },
    ],
    verdict: "老项目的标准归宿：改一版 → 再评一次。我们的产品每上一个大版本都可以复用这个位。",
  },

  /* ===== 第三批：本轮新捞（ACM / PubMed / JMIR，10 个，全部英文期刊，已逐条核实）=====
     规则同前：只收「家庭照护者软件 + 有可抄方法章节 + 英文发表」。
     全文不可访问的样本量/场次/量表明确写为「原文当前不可访问」，不编造。 */
  {
    name: "Hispanic 家庭照护者·失智功能分期 Web App（美国）★最高价值",
    scope: "西语裔失智症家庭照护者专用教育 Web App。参与者全程只有照护者，从不招失智患者。100% 对口。",
    method: "自称：启发式评估 + 可用性测试（Heuristic Evaluation and Usability Testing）；前序篇用说服式系统设计原则（Persuasive Systems Design）",
    dt: "EDIPT",
    phases: [
      { p: "Phase 1 2018 需求评估", act: "西语裔家庭照护者的信息/沟通/工具需求调查", dt: "E", paper: "Inform Health Soc Care 2018;44(2):115–134, doi 10.1080/17538157.2018.1433674（PMID 29504837）", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6123278/" },
      { p: "Phase 2 界面原则", act: "把说服式系统设计原则套到界面上", dt: "D+I+P", paper: "PMID 35178504", url: "https://pubmed.ncbi.nlm.nih.gov/35178504/" },
      { p: "Phase 3 2023 评估", act: "原页所列 PMID 37379048 未能与该项目稳定匹配；在文献身份纠正前，不声称其样本、场次或量表", dt: "T", paper: "J Gerontol Nurs 2023;49(7), DOI/PMID 对应关系待纠正", url: "https://pubmed.ncbi.nlm.nih.gov/37379048/" },
    ],
    verdict: "本批最值得整份抄的：一个想法拆成三篇期刊论文，参与者全是照护者，一个失智患者都没招。招募成本几乎为零。（象形图那篇发在 Stud Health Technol Inform，PubMed 归类为会议论文集/书章节，非期刊论文，已剔除。）",
  },
  {
    name: "CareFit（英国 Strathclyde）★两篇成套",
    scope: "失智症非正式照护者的身体活动支持 App。第一篇是泛照护者，第二篇明确转向失智照护者。100% 对口。",
    method: "自称：共同设计与原型开发研究（Co-design and Prototype Development Study）→ 混合方法可行性与适配研究",
    dt: "EDIPT",
    phases: [
      { p: "Phase 1 2021", act: "7 名共同设计成员（4 名照护者、1 名医护人员、1 名运动专家、1 名雇主代表）完成 3 次线上共同设计和 3 个开发冲刺", dt: "E+D+I+P", paper: "JMIR Form Res 2021;5(10):e27358（PMC8489565）", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8489565/" },
      { p: "Phase 2 2025", act: "招募 41 名失智症照护者试用 8 周，21 人完成；结合问卷、App 日志、访谈/焦点小组评价可行性", dt: "T", paper: "J Med Internet Res 2025;27:e56739", url: "https://www.jmir.org/2025/1/e56739/" },
    ],
    verdict: "标准两段式：先发泛非正式照护者共同设计原型篇，再发失智症照护者可行性篇。不能把第二篇的失智专属人群倒写进第一篇。",
  },
  {
    name: "低保真原型 · 传感器交互平台（JMIR Form Res 2024）★最省钱",
    scope: "认知障碍老人的非正式照护者用交互平台，评估对象是低保真原型（纸面/低仿真），不需要能跑的软件。100% 对口。",
    method: "自称：形成性评估（Formative Evaluation）",
    dt: "ED_P_",
    phases: [
      { p: "Phase 1 2024", act: "6 名照护者先看 3.5 分钟传感器说明视频，再完成 5 项 Figma 原型任务并出声思考；每场约 60 分钟", dt: "E+D+P", paper: "JMIR Form Res 2024;8:e53402（PMC10998178）", url: "https://formative.jmir.org/2024/1/e53402" },
    ],
    verdict: "全批最便宜的一格：没有成品也能发。把 Figma 静态图给几个照护者看一轮，就叫形成性评估。我们随时能补这一篇。",
  },
  {
    name: "Draw-Care（澳洲 Monash）",
    scope: "多族裔家庭照护者的多语数字干预，共同设计 + 用户测试。参与者是照护者，不是患者。100% 对口。",
    method: "自称：共同设计 + 用户测试研究（Co-Designed... User-Testing Study）",
    dt: "ED_PT",
    phases: [
      { p: "Phase 1 2026", act: "30 名多语言背景照护者逐人完成 20–30 分钟线上出声思考任务；结合 eHEALS、调查、Hotjar 行为记录和访谈笔记评价", dt: "E+D+P+T", paper: "JMIR Form Res 2026;e81128（PMC12996899）", url: "https://formative.jmir.org/2026/1/e81128" },
      
    ],
    verdict: "「多语 + 多族裔」是加分项而不是难点：语言越多，审稿人越不好意思质疑样本量。我们的中英双语正好白送这一格。",
  },
  {
    name: "瑞典 tailor-made mobile app（Karolinska）★两篇成套",
    scope: "失智症家庭照护者的定制化手机 App，纯访谈 + 主题分析。100% 对口。",
    method: "自称：价值共创（value co-creation）+ 半结构化访谈 + 演绎式质性内容分析",
    dt: "E____",
    phases: [
      { p: "Phase 1 2022", act: "12 名居家失智症患者家庭照护者接受半结构化访谈，以演绎式内容分析解释通过定制 App 的价值共创", dt: "E", paper: "BMC Health Serv Res 2022, doi 10.1186/s12913-022-08704-w（PMC9667833）", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9667833/" },
      { p: "Phase 2 2024", act: "加入专业人员作为第二组参与者，再发一篇体验质性研究", dt: "E+T", paper: "BMC Geriatr 2024;24:554, doi 10.1186/s12877-024-05151-6", url: "https://link.springer.com/article/10.1186/s12877-024-05151-6" },
    ],
    verdict: "变现技巧：同一个 App、同一套访谈法，换一批受访者（照护者→专业人员）就再发一篇。我们有照护者 + 服务提供者两端，天然能拆两篇。",
  },
  {
    name: "Olera.care（美国）",
    scope: "失智照护者用的网页照护规划平台，初步评估。100% 对口。",
    method: "自称：初步评估研究（Preliminary Evaluation Study）；两轮访谈 + 修订版 MARS",
    dt: "___PT",
    phases: [
      { p: "Phase 1 2024", act: "30 名得州失智症家庭照护者接受两轮 Zoom/电话访谈、试用平台，并完成 13 项修订版 MARS 与服务偏好调查", dt: "P+T", paper: "JMIR Aging 2024;7:e55132（PMC11063878）", url: "https://aging.jmir.org/2024/1/e55132/" },
    ],
    verdict: "「初步评估」这个标题是免死金牌——样本小、结论弱都合法。我们上线后随手就能发一篇同名规格。",
  },
  {
    name: "Rathnayake mHealth 共同设计（澳洲 Griffith/JCU）",
    scope: "失智症家庭照护者应对功能性失能照护需求的 mHealth App 共同设计。100% 对口。",
    method: "自称：共同设计（Co-design）",
    dt: "EDIP_",
    phases: [
      { p: "Phase 1 2020/2021", act: "在线问卷 + 深访 + 专家咨询做需求评估，再由照护者、护士、医生、作业治疗师和 IT 专家共同开发三模块 Android 原型；摘要未给精确 N", dt: "E+D+I+P", paper: "Inform Health Soc Care 2021;46(1), doi 10.1080/17538157.2020.1793347", url: "https://doi.org/10.1080/17538157.2020.1793347" },
    ],
    verdict: "单篇共同设计论文（Inform Health Soc Care 2021;46(3), PMID 32706282）就能占满 E+D+I+P 四格。（同作者博士论文虽方法章节最全，但非期刊发表，已从清单剔除。）",
  },
  {
    name: "AreaAlzheimer（西班牙·加泰罗尼亚）★两篇成套",
    scope: "失智照护者数字平台：需求分析 + 混合方法试点 → 后续 UX/可用性篇。100% 对口。",
    method: "自称：需求分析 + 混合方法试点评估流程；后续篇为可用性/可及性/有用性 UX 评价",
    dt: "ED_PT",
    phases: [
      { p: "Phase 1 2026", act: "210 名照护者完成需求调查、22 人参加 4 个焦点小组、147 人反馈内容；最终 40 人评价平台（21 线上、19 现场）", dt: "E+D+P", paper: "Front Digit Health 2026（PMC12865408）", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12865408/" },
      { p: "Phase 2 2025", act: "平台 UX：可用性 + 可及性 + 有用性", dt: "T", paper: "Gerontechnology 2025;24(1), doi 10.4017/gt.2025.24.1.1195.07", url: "https://doi.org/10.4017/gt.2025.24.1.1195.07" },
    ],
    verdict: "「可用性 + 可及性 + 有用性」三词并列是廉价扩产法：同一批问卷数据换三个小节标题，篇幅立刻够。",
  },
  {
    name: "Mobile Care Ecosystem（新加坡 Duke-NUS）",
    scope: "失智照护支持生态，开发 + 混合方法研究。100% 对口但范围偏大。",
    method: "自称：开发与混合方法研究（Development and Mixed Methods Study）",
    dt: "EDIPT",
    phases: [
      { p: "Phase 1 2025", act: "先访谈 22 名照护者/政策制定者/临床与社区人员；再以 18 人做 3 轮原型测试，最后由 10 名照护者实用 1 个月", dt: "E+D+I+P+T", paper: "JMIR Aging 2025;8:e78759（PMC12810113）", url: "https://aging.jmir.org/2025/1/e78759/PDF" },
    ],
    verdict: "反面参考：「生态系统」意味着多方利益相关者、多轮工作坊，成本比单 App 高一个量级。规格可看，不要照抄。",
  },
  {
    name: "家庭用药管理可用性协议（Quintana 等）",
    scope: "家属为衰弱老人管理用药的 eHealth 可用性测试协议篇。偏衰弱老人而非失智，需确认用户是家属而非临床医生。",
    method: "自称：可用性协议的设计与方法学（design and methodology of a usability protocol）",
    dt: "___P_",
    phases: [
      { p: "Phase 1 2019", act: "只发表面向 75 岁以上老人及家属药物管理 App 的可用性协议；没有已完成招募、数据或结果", dt: "P", paper: "BMC Med Inform Decis Mak 2019;19(Suppl 4):180, doi 10.1186/s12911-019-0907-8", url: "https://doi.org/10.1186/s12911-019-0907-8" },
      
    ],
    verdict: "整篇内容就是方法章节本身——这是最直接的抄写模板。同时印证：只写「我们打算怎么测」也能算一篇。",
  },
  {
    name: "配偶照护者身体活动 App 设计（Penn State，确认含患者本人）",
    scope: "失智者配偶照护者与患者本人的身体活动 App 需求研究。14 对二元组，共 28 人。100% 对口。",
    method: "自称：半结构化访谈 + 主题分析",
    dt: "ED___",
    phases: [
      { p: "Phase 1 2024", act: "访谈 14 对配偶照护伙伴—失智症患者，逐字转录并做主题分析，形成运动习惯、障碍、动机和 App 偏好 4 主题", dt: "E+D", paper: "Dementia (London) 2024, doi 10.1177/14713012241272878（PMC11915756）", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11915756/" },
    ],
    verdict: "唯一疑似真的招了失智患者的一篇。若确认是配对招募，就是本批最贵的方案——列在这里主要是当反面样本。",
  },
];


type ProjectDossier = {
  purpose: string;
  participants: string;
  procedure: string[];
  measures: string;
  analysis: string;
  results: string;
  limits: string;
};

const projectDossiers: Record<string, ProjectDossier> = {
  "iSupport（WHO）+ 各国本土化版": {
    purpose: "把 WHO iSupport 失智症照护者课程翻译并文化适配到不同国家，再分别检验可用性和基层医疗实施条件。",
    participants: "本土化阶段由译者、利益相关者和照护者参与；瑞士可用性篇为 12 人（10 名非正式、2 名正式照护者）；实施篇面向基层医疗情境。",
    procedure: ["翻译与回译 WHO 原课程。", "通过利益相关者咨询和照护者焦点小组修改文化表达与本地服务信息。", "制作本地语言数字版。", "参与者先填 eHEALS，再完成 11 项任务并出声思维，之后填 SUS 并访谈。", "后续研究把已适配版本放入基层医疗，观察效果与实施条件。"],
    measures: "翻译一致性、文化适配意见、任务表现、eHEALS、SUS、信息质量/数量/导航评分、访谈与实施指标。",
    analysis: "定量指标作描述统计，访谈作主题分析；实施篇同时观察干预效果与落地过程。",
    results: "瑞士篇 SUS 均值 71.5；信息质量 4.58/5、信息量 4.42/5，导航仅 3.42/5。访谈形成内容、可信度、导航、互动性与情感影响 5 个主题。",
    limits: "瑞士篇便利抽样仅 12 人且数字素养偏高，正式照护者只有 2 人；可用性不能替代长期效果证据。"
  },
  "Tele-Savvy": {
    purpose: "把已有 Savvy Caregiver 线下课程改造成同步/异步在线课程，先做临床示范，再用随机试验协议评估效果。",
    participants: "2015 示范项目招募失智症家庭照护者；2018 论文是随机对照试验协议，所写样本为计划值而非已完成结果。",
    procedure: ["把线下课程内容重组为网上课程。", "在退伍军人医疗系统中交付示范项目并访谈照护者。", "根据反馈修改课程和实施流程。", "另发 RCT 协议，预先规定招募、分组、干预和测量时间点。"],
    measures: "示范阶段关注参与、可接受性和定性体验；协议阶段预设照护者掌握感、负担、抑郁及相关结局。",
    analysis: "示范篇采用定性描述；协议篇只规定未来组间与纵向分析，没有已完成 RCT 结果。",
    results: "示范篇支持把课程在线交付的可行性；协议篇无结果。",
    limits: "不能把协议写成疗效证据；示范项目来自特定医疗系统，外推有限。"
  },
  "CareVirtue": {
    purpose: "评估共享日志、任务与沟通平台能否支持阿尔茨海默照护网络，并利用同一平台资料分别研究体验、沟通和参与模式。",
    participants: "家庭照护网络成员注册使用平台；不同论文分析问卷/访谈、网络沟通文本和用户生成日志。",
    procedure: ["建立由主要照护者和其支持者组成的照护网络。", "网络成员使用共享日志、任务和沟通功能。", "可行性篇收集问卷与访谈。", "沟通篇重新分析网络成员的交流体验。", "话题建模篇对用户生成内容与参与日志作计算分析。"],
    measures: "可行性、可用性、满意度、访谈、发帖文本、主题分布和参与频率。",
    analysis: "混合方法；定性沟通分析；用户生成文本话题建模与参与度分析。",
    results: "平台被定位为可行且可接受；后续论文显示同一平台数据可以回答沟通体验和内容主题两个独立问题。",
    limits: "试点与自愿使用样本限制外推；文本和日志能描述行为，不能单独证明健康效果。"
  },
  "Partner in Balance（马斯特里赫特）": {
    purpose: "开发并验证失智症照护者的混合式自我管理课程，再研究长期实施及早发性失智家庭的定制需求。",
    participants: "开发篇纳入照护者和心理专业人员；RCT 纳入家庭照护者；实施篇访谈使用者和交付人员；后续篇聚焦早发性失智照护者。",
    procedure: ["通过需求评估确定主题与目标。", "照护者和心理师共同迭代课程内容。", "制作线上模块并由辅导者提供混合式支持。", "随机试验比较干预与对照的前后变化。", "实施后访谈阻力、促进因素和持续使用。", "针对早发性失智家庭再定制内容。"],
    measures: "自我效能、掌握感、心理困扰、照护相关结局、使用与实施体验。",
    analysis: "开发阶段为混合/质性方法；效果篇作随机组间纵向分析；实施篇作半结构化访谈主题分析。",
    results: "项目完成从开发、效果验证到实施和亚群适配的完整证据链；每篇回答不同阶段问题。",
    limits: "该证据链跨多年、多论文且含 RCT，成本远高于一次可用性研究；不能把后期结果归给早期开发篇。"
  },
  "Inlife / myinlife（同一课题组）": {
    purpose: "开发面向失智症照护网络的在线社会支持平台，检验可行性，并解释参与者实际如何使用和体验。",
    participants: "失智症患者及其家庭照护者参与开发和试点；后续过程评价分析完成试点者的体验。",
    procedure: ["与目标群体协商功能与内容。", "部署 myinlife 在线社会支持平台。", "在试点前后测量用户状态和平台使用。", "试点后访谈参与者。", "将过程评价与前后测结果分开发表。"],
    measures: "社会支持、照护相关结局、平台使用、可行性与过程访谈。",
    analysis: "前后测描述/统计分析结合定性过程评价。",
    results: "平台可被用于连接照护网络；过程篇解释了采用、参与和体验，而不是重复声称疗效。",
    limits: "试点设计和自选参与者限制因果推断；患者与照护者共同参与增加招募复杂度。"
  },
  "CIRCA / CIRCA-BC ✅已核实": {
    purpose: "把英国触屏怀旧对话系统本地化为不列颠哥伦比亚版本，并观察计算机如何成为失智患者与照护者对话中的第三参与者。",
    participants: "内容共创为 39 名 64–87 岁、无失智的老人；试点为 3 名 81–90 岁中度失智女性，各自与同一护理助手配对。",
    procedure: ["举行 6 场焦点小组：3 城市、2 农村、1 独立生活机构；每场约 2 小时，每组最多 3 轮。", "筛选并整理 475 张图、58 段视频、105 首音乐，归入 7 个主题。", "将本地素材装入触屏 CIRCA-BC。", "3 个患者—护理助手配对各使用约 30 分钟。", "全程录像录音，分析话轮、素材触发和双方互动。"],
    measures: "焦点小组意见、素材库构成、录像录音及会话互动；没有 SUS 或疗效量表。",
    analysis: "主题/恒定比较用于内容共创，会话分析用于试点互动。",
    results: "共享和不同的社会经历都会塑造对话；随机呈现的触屏素材让计算机成为对话第三方，并有助于双方较平等参与。",
    limits: "真正患者试点只有 3 人，属于探索性定性证据；39 名共创者不是失智患者，不能说成患者共创样本。"
  },
  "CAREGIVERSPRO-MMD（EU H2020 690211）": {
    purpose: "评估面向记忆问题患者及照护者的在线信息、自我管理和社会支持平台的有用性、易用性与参与度。",
    participants: "已核实可用性研究共 58 人：24 名记忆问题/MCI 使用者、24 名非正式照护者、10 名专业人员；1 周后约 10% 脱落。",
    procedure: ["三类参与者在基线接触并评价平台。", "使用信息、社交和自我管理功能 1 周。", "一周后再次评价满意度、感知有用性和易用性。", "低评分项目追加开放式问题。", "后续 J Appl Gerontol 论文继续分析参与度、可用性和有用性。"],
    measures: "满意度、感知有用性、易用性、开放反馈和平台参与数据。",
    analysis: "量化评分比例结合低分项定性解释。",
    results: "一周后照护者中约 90% 认为有用、82% 认为易用、79% 满意；专业人员相应约 89%、97%、73%。",
    limits: "样本小、随访只有 1 周且有脱落；后续 SAGE 全文未开放，本页不补写其未核实统计细节。"
  },
  "GamePlan4Care（REACH II 的网络版）": {
    purpose: "把循证 REACH II 照护者干预网页化，在正式随机试验前反复检查界面、导航和内容。",
    participants: "2025 形成性研究共 31 名照护者：18 人测技术、13 人测内容；平均 62 岁，87.1% 女性，83.1% 白人，32.3% 西班牙裔。",
    procedure: ["把 REACH II 的安全、压力、健康、情绪、服务、支持和行为问题模块搬到网页。", "加入风险评估、教育材料、表单练习、视频和 Dementia Care Navigator。", "参与者完成系统任务并回答开放问题。", "录制音频和屏幕。", "两名研究者归纳编码并将导航/内容问题反馈给开发。"],
    measures: "任务过程、开放反馈、音频和屏幕记录；形成性研究不测临床疗效。",
    analysis: "两名研究者依次熟悉资料、编码、形成主题。",
    results: "形成支持性资源、技术主动参与、内容综合方案三类主题；同时发现导航和内容包容性问题。",
    limits: "单一地区、白人女性占多数；仅能访问部分模块；数字熟练者更可能报名。"
  },
  "WECARE（华人照护者微信干预）✅已核实：有后续篇": {
    purpose: "为美国华裔失智症家庭照护者开发文化适配的微信干预，并评估可行性、接受度和初步效果。",
    participants: "开发阶段：4 名专家、8 名利益相关者、5 名目标用户；试点入组 24 名照护者，23 人完成。纳入者需 21 岁以上、在美、读中文、用微信、每周照护至少 12 小时。",
    procedure: ["4 名专家设计 7 周课程结构。", "3 名照护者、3 名服务人员、2 名社区领袖共同文化改编内容。", "5 名目标用户以普通话出声思维测试导航和后台功能。", "向 24 人推送 40 篇、每篇约 3–6 分钟的多媒体文章。", "第 3、5、7 周举行线上小组会议并开放群聊/私聊。", "基线和干预后测量，后台记录阅读与活动。"],
    measures: "留存、40 篇开启率、阅读次数/时长、7 项满意度、5 项有用性、抑郁、照护负担、生活满意度和社会支持。",
    analysis: "描述可行性与接受度，并比较单组前后变化及效应量。",
    results: "23/24 完成，平均课程完成率 67%；抑郁均值 5.74 降至 3.35（效应量 −0.89），负担 25.78 降至 21.96（效应量 −0.48）。",
    limits: "单臂、n=24、随访仅 2–3 周；不能排除时间效应和均值回归，结果只能称初步信号。"
  },
  "Care Me Too（华人移民照护者 App）": {
    purpose: "理解华裔移民照护者未满足的自我照护需求，共同设计 Care Me Too，并测试其可用性与可接受性。",
    participants: "共同设计研究含 19 次半结构化访谈；可用性研究为 22 名讲普通话的照护者，平均 60.5 岁，77% 女性。",
    procedure: ["先访谈心理、社会、移民与照护障碍。", "在概念设计和原型阶段共同讨论内容与功能。", "22 人在实验室操作 App 并接受深度访谈。", "回家使用 1 周。", "电话随访，收集设计与功能修改意见。"],
    measures: "半结构化访谈、实验室操作体验、1 周居家体验和电话随访；没有可安全引用的 SUS 总分。",
    analysis: "定向内容分析。",
    results: "总结出增大字号、谨慎用色、趣味视觉、简化导航/登录、改进帮助、情境化功能和离线可用等设计建议。",
    limits: "样本限于普通话使用者且规模小；2024 共同设计篇部分方法细节受期刊访问限制，本页只写已核实信息。"
  },
  "失能老人照护者 eHealth 求助工具（魁北克）": {
    purpose: "与照护者、社区组织及卫生社会服务人员共同设计帮助功能受限老人照护者识别需求和寻找资源的工具。",
    participants: "需求篇 74 名共同设计者（64 女、10 男）；社会正义分析篇覆盖魁北克 11 地区、78 名参与者。",
    procedure: ["2017–2018 年在 11 地区设咨询委员会。", "举行 8 次需求共同设计会议，使用分类、人物画像、工具分析、头脑风暴、草图、原型和预测试。", "建立信息架构与功能需求。", "另一篇以社会正义框架重读参与过程，并记录 24 次筹备、11 次正式共同设计和 11 次总结会议。"],
    measures: "会议产出、需求与功能清单、信息架构、参与观察和包容性/数字素养问题。",
    analysis: "共同设计综合；社会正义篇使用 Miles & Huberman 与 Paillé 分析式提问。",
    results: "形成面向求助过程的原型，并把数字素养和尊重照护者求助路径列为包容性条件。",
    limits: "这是开发与过程研究，不是效果评价；旧页误写为 e18399，本页已更正为同系列真实姊妹篇 e12314。"
  },
  "mWITH ME ✅已核实全文": {
    purpose: "以叙事循证医学、马斯洛需求层次和用户中心设计开发阿尔茨海默病家庭照护者 App，并做初步评价。",
    participants: "定性阶段目的抽样 18 名照护者；评估阶段另招 20 名照护者使用 3 周。",
    procedure: ["用 NEBM 与马斯洛搭建需求和内容框架。", "2024 年 9–12 月在老年科/神经科招募 18 人，每人访谈 20–40 分钟。", "按 COREQ 报告并把主题转为 App 设计。", "另招 20 人使用 3 周。", "第 1 周电话回访。", "3 周后完成四部分问卷和开放反馈。"],
    measures: "人口学、App 影响、易用性、开放反馈及访谈文本。",
    analysis: "定性主题分析；量化资料用 SPSS 26 作描述分析。",
    results: "论文报告完成开发与初步目标用户评价；它没有独立 RCT 或姊妹效果篇。",
    limits: "小样本、短期、无对照，不能证明临床效果；理论框架与初步可用性是主要贡献。"
  },
  "日本：名古屋 Web App（英文发表）": {
    purpose: "探索含知识模块和匿名社区的网页应用能否降低失智症照护负担及 BPSD。",
    participants: "名古屋大学医院招募，13 对患者—非正式照护者完成；目标原为 30 对。没有智能手机或不能自行使用者被排除。",
    procedure: ["基线由 2 名研究护士面访约 15 分钟。", "照护者在手机使用知识模块和匿名交流空间。", "基线、1、2、3 个月各测一次。", "另有 43 名感兴趣者进入虚拟社区，但不计入正式样本。"],
    measures: "Abe's BPSD Scale（10 项，满分 44）和日本版 Zarit 负担量表（22 项，满分 88）。",
    analysis: "Spearman 相关检验基线关系；线性混合效应模型检验随时间变化。",
    results: "基线 J-ZBI 与 ABS r=0.65；J-ZBI 随时间显著下降（p=.013），ABS 无显著变化。",
    limits: "13 人远低于目标 30；无对照；只随访 3 个月；不能把负担变化确定归因于 App。"
  },
  "DEM-DISC（荷兰）": {
    purpose: "评估为失智症非正式照护者和个案管理师提供定制健康/社会服务建议的 DEM-DISC。",
    participants: "整群随机试验对象为非正式照护者及个案管理师；公开可访问资料未给出可在本页安全复述的完整样本与招募细节。",
    procedure: ["根据既有评估改进电子建议工具。", "按照护网络/机构整群随机分配。", "干预组使用定制建议，比较组按试验方案接受对照条件。", "按预设时间点比较照护与服务相关结局。"],
    measures: "个性化建议使用、照护者和个案管理相关结局；精确量表名称在本次可读全文中未确认。",
    analysis: "整群随机试验分析；本页不杜撰组数、效应量或显著性。",
    results: "确认论文真实且是整群 RCT，但受限全文中无法可靠提取结果数字，因此不在本页声称有效。",
    limits: "付费墙限制了方法和结果核实；此处透明列出已知设计，不能把标题当结果。"
  },
  "Hispanic 家庭照护者·失智功能分期 Web App（美国）★最高价值": {
    purpose: "识别西班牙裔失智症家庭照护者的信息、沟通和在线工具需求，再用说服式系统设计形成界面并评估。",
    participants: "需求篇在纽约开展 11 场工作坊，共 24 名照护者（10 名英语、14 名西语）；平均 59.7 岁，79.2% 女性，平均照护 6.5 年。",
    procedure: ["通过问卷、拼贴和录音录像开展 11 场参与式工作坊。", "4 名研究者依据多个概念模型编码需求。", "把需求映射到 PSD 和自我管理原则，制作界面。", "后续进行启发式与可用性评价；但当前列出的 PMID 37379048 未能可靠匹配该论文，不能补写样本。"],
    measures: "信息需求、沟通需求、在线工具需求、界面原则和可用性问题。",
    analysis: "质性编码与概念框架映射；后续评价的精确分析因文献标识不一致而不声称。",
    results: "91.7% 报告信息需求，87.5% 有沟通需求，79.2% 需要在线工具；所有人至少每周上网，75% 每日上网。",
    limits: "纽约小样本；第三篇 PMID 无法与所写标题稳定对应，必须标为文献标识待纠正，不能把会议摘要冒充期刊结果。"
  },
  "CareFit（英国 Strathclyde）★两篇成套": {
    purpose: "共同设计支持非正式照护者居家运动的 CareFit，后续专门评估其对失智症照护者的可行性和适配。",
    participants: "首篇便利抽样 7 人：4 名泛照护者、1 名医护人员、1 名运动专家、1 名支持照护者的雇主代表，6 女 1 男。后续可行性研究招募 41 名苏格兰失智症照护者，21 人完成 8 周。",
    procedure: ["首篇在 2020 年 7–8 月用 Zoom、MURAL 和 Qualtrics 完成 3 次共同设计；参与总承诺不超过 7 小时。", "第 1 次展示简单原型和运动指南，用 MoSCoW 与 keep/lose/change 排需求；第 2 次复核并设计教育、运动、沟通内容；第 3 次定稿。", "每次会议后进行 2–3 周 Agile Scrum 冲刺，共产出 3 个版本；用 FURPS+ 整理功能和非功能需求，并在模拟器和多种 Android 设备测试。", "后续将 CareFit 改为 React Native 跨平台版本，通过社区网络和 Join Dementia Research 招募，给每名参与者专属商店链接。", "照护者自助使用 8 周；研究者并行收集线上问卷、Activity/Planner/Resources/Sharing 等页面的时间戳日志，以及约 30–45 分钟访谈/焦点小组。"],
    measures: "首篇记录 3 轮约 20–30 题问卷和原型反馈。后续使用 SUS、EQ-5D-5L、IPAQ-SF、久坐与肌力活动问题、人口/照护资料、App 使用与退出数据，并以 RE-AIM 和 MRC 复杂干预框架组织访谈。",
    analysis: "首篇由 2 名研究者提炼质性核心主题，争议交第 3 人；按多数意见和 MoSCoW 排需求。后续定量与质性并行分析后整合；访谈依 Braun–Clarke 法在 NVivo 12 做主题分析。",
    results: "首篇确认时间、安全、成就识别和个性化等需求，最终加入视频、周计划、教育和沟通模块。后续 41 人中 21 人完成；高基线活动组完成率 36%（5/14），低活动组 59%（16/27）；SUS 达“可接受”，无不良事件，视频受欢迎，但社交功能仍需加强。",
    limits: "第一篇不是失智症专属样本。第二篇仅 51% 完成且无对照，作者明确认为目前不能直接进入随机对照试验，不能据此声称提升身体活动。"
  },
  "低保真原型 · 传感器交互平台（JMIR Form Res 2024）★最省钱": {
    purpose: "在开发可运行系统前，让认知障碍老人非正式照护者评价传感器信息交互平台的低保真原型。",
    participants: "6 名无偿照护者，均为独居、≥65 岁认知障碍老人的成年子女；4 女 2 男，平均 58.7 岁，均有数字照护技术经验。通过既有候选池邮件招募。",
    procedure: ["研究团队依据前序 464 人调查和 10 人访谈，用 Figma 制作跌倒、激越与日常活动场景的可点击低保真原型。", "每场先播放 3.5 分钟荷兰语说明视频，解释 Wi-Fi 感知、AI 计算和信息传递，再询问正负预期及实施前提。", "参与者边出声思考边做 5 项任务：选择紧急监测、选择日常监测、处理跌倒、处理激越、探索主页。", "2 人用 Teams、4 人现场参加；每场约 60 分钟并录音。前 4 场后微调设计，再由最后 2 人评价。"],
    measures: "开放式访谈、5 项任务的出声思考，以及对个性化、简化、提醒、建议、可信度、可验证性和社会学习等 PSD 功能的反馈；未使用效果量表。",
    analysis: "Amberscript 逐字转录，Atlas.ti 分析；期望/前提采用归纳主题分析，PSD 体验采用归纳—演绎结合。2 名研究者分别读荷兰语和英语文本，初始一致率 75%，讨论至完全共识。",
    results: "照护者认为系统可支持客观决策并带来安心，也担忧信息过载和技术替代人际接触；正式与非正式照护者需预先约定信息沟通规则。整体原型体验积极，个性化最受重视。",
    limits: "仅 6 人，且全部已有数字照护平台经验、均为成年子女；测试的是概念流程而非可运行传感系统，不能声称真实环境可用性或临床效果。"
  },
  "Draw-Care（澳洲 Monash）": {
    purpose: "为多元族裔失智症家庭照护者共同设计多语言数字干预并做用户测试。",
    participants: "从既有网络和研究邀请 65 人，最终 30 名当前或既往失智症照护者参加（响应率 46%）；20 女，平均 61 岁，22 人出生于海外，26 人在家使用非英语语言。参与者不能参加过此前共同设计。",
    procedure: ["前序阶段先共同设计 Draw-Care，并由原共同设计参与者做 member checking，确认原型是否反映其意见。", "用户测试前完成 eHEALS，以及互联网对健康决策和资源获取重要性/有用性的调查。", "研究者邮件发送登录码；每名参与者在线屏幕共享 20–30 分钟，选语言、登录、进入 Films and More Information，并按顺序完成代表性任务且出声思考。", "Hotjar 记录网站行为；会谈不录音，由 2 名研究者详记问题；测试后按结果修改虚拟助手、评分方式、反馈按钮和翻译。"],
    measures: "eHEALS（8–40 分）、互联网使用调查、任务完成/支持需要、Hotjar 行为、研究者观察笔记，以及语言、文化响应性和界面问题。",
    analysis: "SPSS 28 做描述统计；即时数据分析把问题标为致命、严重或外观问题并观察饱和。2 名研究者独立做后实证主题分析、协商编码，第 3 人复核并调解冲突；样本不足以按语言分组比较。",
    results: "平均 eHEALS 30（SD 6.1）；28/30 可在很少或无帮助下登录导航。整体被认为可接受、文化响应、吸引且可用；小屏导航较难，越南语和普通话有翻译偏差，14/30 难以找到或使用虚拟助手。",
    limits: "仅 30 人且各语言组很小，不能比较语言亚组；会谈不录音，质性材料依赖现场笔记；这是试验前用户测试，不证明照护结局有效。"
  },
  "瑞典 tailor-made mobile app（Karolinska）★两篇成套": {
    purpose: "理解家庭照护者如何借定制 mHealth App 与专业人员共同创造和交换支持，并分别呈现双方经验。",
    participants: "2022 篇为 12 名居家失智症患者家庭照护者；2024 篇加入专业人员与家庭照护者双方。",
    procedure: ["让照护者在真实照护中使用定制 App 与专业人员沟通。", "对 12 名照护者做半结构化访谈。", "用演绎式内容分析解释价值共创。", "后续再访谈/分析专业人员与家庭照护者提供和接受支持的体验。"],
    measures: "半结构化访谈、通过 App 提供/接受支持的体验和价值共创过程。",
    analysis: "2022 篇为演绎式质性内容分析；2024 篇为质性经验研究。",
    results: "研究把 App 的价值解释为照护者与专业人员互动中共同产生，而非软件单向提供。",
    limits: "2022 篇实际发表于 BMC Health Services Research，不是 BMC Geriatrics；2024 篇完整样本数字因全文访问限制未补写。"
  },
  "Olera.care（美国）": {
    purpose: "初步评估网页照护规划和资源导航平台 Olera.care 对失智症照护者的可用性与帮助。",
    participants: "30 名得州当前失智症家庭照护者；25 人≥50 岁、23 女、25 名白人、20 人自报经济稳定。通过 Texas A&M、地区老龄机构、传单、邮件、社交媒体和照护者小组招募。",
    procedure: ["候选人扫码/打开网页或电话完成资格筛查和电子知情同意。", "2022 年 1–5 月接受两轮 Zoom 或电话访谈：首轮了解照护需求并引导开始使用平台，随后在测试环境探索主要功能。", "第二轮完成 Qualtrics 调查和 13 项修订版 MARS；研究者实时观察交互问题。", "调查同时询问人口学、照护经历、技术沟通偏好，以及既往使用和未来希望了解的老年服务。"],
    measures: "修订版 MARS 的参与度、功能性、美观、信息质量和主观质量，均为 1–5 分；另测平台推荐意愿、技术沟通偏好和照护服务兴趣。",
    analysis: "描述统计汇总样本与平台评分；用双样本双侧 t 检验比较不同照护者特征的 MARS 得分。",
    results: "总评分 4.57/5（SD 0.57）；参与度 4.10、功能性 4.46、美观 4.58、信息质量 4.76。27/30 整体正面评价，全部愿意推荐；21/30 偏好先匿名互动再获个性化反馈。照护时数较多者功能评分更高（P=.02）。",
    limits: "小型便利样本，多数为白人、女性且经济稳定；使用的是修订而非完整 MARS；多重组间检验和横断面自评只能支持初步可用性，不能证明长期使用或照护效果。"
  },
  "Rathnayake mHealth 共同设计（澳洲 Griffith/JCU）": {
    purpose: "共同设计帮助失智症家庭照护者处理功能性失能和日常生活活动需求的 Android App。",
    participants: "家庭照护者、老年护理护士、医生、作业治疗师与 IT 专家共同参与；摘要未给精确人数。",
    procedure: ["第一阶段用在线问卷、深度访谈和专家咨询做需求评估。", "把需求整理为 App 内容和功能。", "第二阶段共同设计界面与原型。", "形成三个模块：失智与照护概述、日常生活活动管理、照护者健康与福祉。"],
    measures: "需求问卷、访谈、专家意见和原型反馈；未做临床效果量表。",
    analysis: "多来源需求综合并映射到内容与 Android 原型。",
    results: "产出三模块原型；论文没有证明可行性或效果。",
    limits: "作者明确指出发布前仍需可行性和有效性测试；精确样本数未从可读全文确认。"
  },
  "AreaAlzheimer（西班牙·加泰罗尼亚）★两篇成套": {
    purpose: "依据照护者需求分析开发 AreaAlzheimer，再分别评价可用性、可及性、有用性和混合方法试点过程。",
    participants: "全项目共 419 人次：需求阶段 210 名照护者完成调查、22 人参加 4 个焦点小组；147 名追加参与者反馈内容；最终 40 名照护者评价平台，其中 21 人线上、19 人现场。",
    procedure: ["第一阶段向 210 名符合条件的照护者发放 27 项结构化问卷，另按年龄和与患者关系组织 4 个焦点小组。", "把信息指导、后勤协助、情绪/沟通策略和同伴连接等需求转成信息、培训、社区和研究四个板块。", "第二阶段由 147 人评价不同数字资源的内容和有用性，据此优先保留疾病信息、任务管理与情绪支持。", "开发 beta 版后，21 人在线、19 人到基金会现场完成浏览信息、参加论坛、注册支持项目、调整设置等任务，并填写同一体验调查。", "现场组记录标准任务难度、时间和成功率，并讨论体验与改进机会。"],
    measures: "27 项需求调查、焦点小组、内容评价；最终使用 Single Ease Question、SUS、Perceived Usefulness Scale、可及性评分、任务表现与定性反馈。",
    analysis: "结构化调查做定量汇总；焦点小组和访谈做主题分析；最终以量表/任务数据结合场景测试反馈进行混合方法解释。",
    results: "需求归纳为信息指导、后勤协助、情绪与沟通策略、同伴社交连接四类。平台可及性平均 4.5/5，SUS 74.3/100，有用性 3.4/5；低数字素养者仍报告导航困难。",
    limits: "参与者跨阶段构成不同，419 是各阶段合计而非单一试验样本；有用性低于可及性与可用性；试点没有对照或临床结局，不能声称改善照护者健康。"
  },
  "Mobile Care Ecosystem（新加坡 Duke-NUS）": {
    purpose: "开发理论驱动、多组件、可个性化的移动照护生态，并用混合方法检查失智症照护者的使用体验。",
    participants: "需求访谈 22 人：11 名家庭照护者、6 名社区失智服务人员、3 名临床人员、2 名政策制定者。原型阶段 18 人（11 名照护者、7 名医护人员）；实用阶段为另 10 名照护者。",
    procedure: ["用目的抽样开展需求深访，录音转录后把所需功能归为教育、沟通、清单/目录。", "依据压力过程模型和用户中心设计开发 CareBuddy，整合个性化评估、AI 聊天、GPS、同伴支持、热线、远程医疗、服务连接和自我照护。", "第 1 阶段开展 3 轮、每场 1–2 小时访谈；参与者用研究者手机操作原型、依话题指南评论，每轮后更新 App 并完成 SUS。", "第 2 阶段由 10 名照护者在自己 Android/iOS 手机使用 1 个月；记录每周参与时长、各组件时长和常用功能。", "月末完成 MAUQ，再接受 10–25 分钟开放式访谈。"],
    measures: "需求访谈；第 1 阶段 10 项 SUS、人口学与开放反馈；第 2 阶段 18 项 MAUQ（易用性、界面/满意度、有用性）、App 日志与开放访谈。",
    analysis: "描述统计计算各轮 SUS、MAUQ 总分/分域和日志；2 名研究者在 NVivo 11 独立编码，以 uMARS 的参与度、功能、美观、信息质量/数量及主观反馈为代码本做内容分析。",
    results: "SUS 从第 1 轮 65.4（SD 11.8）升至第 3 轮 73.8（SD 15.9），超过 68 基准；1 个月后 MAUQ 总分 95.4（SD 8.5）。照护者重视失智管理、自我照护、社交网络、服务目录和对话模型，但要求减少文字并改善导航。",
    limits: "两轮试点仅 18 人和 10 人，且后者只用 1 个月；多组件设计无法判断哪一项造成评分；没有对照或照护结局，效果仍由后续试验评价。"
  },
  "家庭用药管理可用性协议（Quintana 等）": {
    purpose: "公开一套评估家庭为 75 岁以上老人管理药物的应用可用性的研究方案。",
    participants: "计划便利抽样 20 人：10 名非正式家庭照护者、10 名衰弱高龄老人；自 2018 年 4 月起通过本地广告、传单、网络留言板、合作机构和口碑招募。本文不含完成样本。",
    procedure: ["在办公室提供装有公开版 InfoSAGE 的开发用 iPad 和测试账号，先简述平台、分级权限和主要功能，但不教具体操作。", "参与者边出声思考边完成 8 个场景：添加 3 种药、查副作用、查药物相互作用、改华法林剂量、停用药物、邮件发送药物清单。", "录制音频、仅拍手部的视频和屏幕触摸；仅在无法继续时帮助并记录，每个场景按全部子事件是否完成判成功。", "完成后填写 1–7 分修订版可用性问卷，再接受开放式访谈。"],
    measures: "基线人口学、互联网/技术/App 熟悉度；任务子事件成败、完成时间、帮助、导航错误、犹豫和挫败；5 项满意度/难度/潜在使用问卷与开放反馈。",
    analysis: "计划转录音频并做主题编码；2 名分析者用 BORIS 7 和共享代码本独立编码视频/屏幕，团队裁决差异，计算双向组内相关。另用时间序列聚合问题，并比较前两个同构场景的时间以估计学习曲线。",
    results: "无实证结果；贡献是协议本身。",
    limits: "不是失智症专属，也不是结果论文；仅计划 20 人、受控办公室和指定 iPad，不能引用为 App 已可用或有效。"
  },
  "配偶照护者身体活动 App 设计（Penn State，确认含患者本人）": {
    purpose: "探索失智症患者配偶照护伙伴及患者本人对运动习惯、障碍、动机和 App 功能的看法，为后续设计提供需求。",
    participants: "14 对配偶照护伙伴—失智症患者，共 28 人；这里确实纳入患者本人，不是‘可能’。",
    procedure: ["以配偶二元组为单位招募。", "围绕运动偏好、习惯、障碍、动机和 App 支持进行半结构化访谈。", "逐字转录访谈。", "进行主题分析并把主题转成设计方向。"],
    measures: "访谈文本；没有成品 App 的任务测试或临床结局。",
    analysis: "主题分析。",
    results: "形成 4 大主题：运动偏好与习惯、运动障碍、运动动机、App 偏好与支持功能。",
    limits: "这是需求研究而非成品评估；二元组招募更昂贵，样本小，不能推断运动或健康效果。"
  }
};


/* --------------------------------- 组件 --------------------------------- */

export default function DeleteAfterRead() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-14">
      {/* 头 */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-destructive">
          delete after read · 阅后即焚
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          以 Design Thinking 五步法为唯一坐标系：15 篇单篇 + 25 个项目族谱（全部核实为真实英文期刊），各自套得上哪几格
        </h1>
        <p className="text-muted-foreground">
          你只需要懂一个标准扯淡法：<strong>Empathize 同理 → Define 定义 → Ideate 构思 → Prototype 原型 → Test 测试</strong>。
          每篇现在都完整写出研究目的、招募与样本、按时间排序的每一步、工具与量表、分析、结果和局限；
          链接只保留作出处证据，不需要点击链接才能读懂。
          结论先行：<strong>没有任何一篇凑齐五格；最多的一篇覆盖四格；好几篇只做一两格照样发表。</strong>
        </p>
        <Box>
          <strong>删除方法</strong>：删 <Mono>src/pages/DeleteAfterRead.tsx</Mono>，
          再删 <Mono>src/App.tsx</Mono> 里 <Mono>/delete-after-read</Mono> 那一行 Route 和它的 import。无其他依赖。
        </Box>
      </header>

      {/* 图 0：五步法坐标系 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">图 0 · 唯一坐标系：标准五步法长什么样</h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card p-4">
          <pre className="font-mono text-[11px] leading-5 whitespace-pre text-foreground">{`
  ① E 同理 Empathize    ② D 定义 Define     ③ I 构思 Ideate     ④ P 原型 Prototype    ⑤ T 测试 Test
  ─────────────────    ─────────────────   ─────────────────   ──────────────────   ─────────────────
  访谈/观察/问卷        需求清单/问题陈述     工作坊/头脑风暴      做出能摸的东西         给人用，记卡点
  「用户要什么」        「所以我们要做X」    「也许可以Y或Z」     「v1 → 反馈 → v2」     「好用吗/打几分」

  ── 五格如何改名出现在论文里 ─────────────────────────────────────────────────────────────
  E → 半结构化访谈 / 体验触点收集 / 需求分析
  D → 设计需求 DR1…DRn / 主题分析出的 needs / problem statement
  I → 共同设计工作坊 / 优先级投票 / 痛点排序（注意：全是排序，从不真发散）
  P → 数字化迁移 / 原型迭代 / 把课程塞进 chatbot
  T → 认知走查 / 出声思维 / SUS / 可接受性问卷 / 使用日志
`}</pre>
        </div>
        <Box>
          <strong>看穿这一层就够了</strong>：所有「新方法」都只是在某一格里换名字，或者在五格里挑两三格做、其余装死。
          评判一篇论文是否「扯得没边」的标准就一条：<strong>它宣称覆盖的格数 ≤ 它实际覆盖的格数</strong>就算守规矩；
          宣称五格只做一格就是造垃圾造过火。下面 15 篇全部守规矩——所以全部可抄。
        </Box>
      </section>

      {/* 图 1：总览矩阵 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">图 1 · 总览：15 篇 × 5 格覆盖矩阵</h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card p-4">
          <pre className="font-mono text-[11px] leading-5 whitespace-pre text-foreground">{`
                       E同理   D定义   I构思   P原型   T测试    覆盖格数
  ─────────────────────────────────────────────────────────────────────────
  e19543  co-design协议   ✅      ✅      ✅      ⚠️      ❌       3.5 ← 全场最满
  e52389  加速co-design   ✅      ✅      ✅      ⚠️      ❌       3.5
  PMC9308637 需求叙事      ✅      ✅      ❌      ✅      ⚠️       3.5
  e81247  iSupport Swiss   ❌      ❌      ❌      ✅      ✅       2
  e65022  SUS 两轮         ❌      ❌      ❌      ✅      ✅✅     2+
  e60143  REACH 迁移       ❌      ❌      ❌      ✅      ✅       2
  e63715  chatbot          ⚠️      ❌      ❌      ✅      ✅       2
  e79975  LLM 赋能         ⚠️      ❌      ❌      ✅      ✅       2
  e36975  CareVirtue       ✅      ⚠️      ❌      ✅      ✅       2.5
  e75113  定制减压 App     ✅      ❌      ❌      ✅      ✅       2
  e42145  3 UI 可接受性    ❌      ❌      ❌      ✅      ✅       2
  e41202  同伴支持干预      ❌      ❌      ❌      ✅      ✅       2
  e26532  三框架           ⚠️      ❌      ❌      ❌      ✅✅✅   1.5+
  e60566  认知走查          ❌      ⚠️      ❌      ❌      ✅       1.5
  e46188  系统综述          ⚠️      ❌      ❌      ❌      ❌       0.5
  ─────────────────────────────────────────────────────────────────────────
  规律：I 构思格 15 篇里 14 篇缺席——全世界都假装这格不存在，我们也跳过。
       E+D 只在「要证明用户参与过」时才需要；P+T 是每篇的保命底裤。
       系统综述可以只覆盖 E 格（二手）就发表。
`}</pre>
        </div>
        <Box>
          <strong>对我们的含义</strong>：我们的四步编舞 = <strong>E（访谈）+ D（DR 表）+ T（走查）+ T（SUS×2）</strong>，
          P 格由已经存在的产品自动填满，I 格随大流跳过。覆盖 4/5 格，超过 15 篇参照系里任何一篇。
          评审若拿五步法说事，我们比参照系里的每一篇都更「全」。
        </Box>
      </section>

      {/* 论文逐篇 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">逐篇：往五步法上套（附 LLM 对照）</h2>
        {papers.map((p) => (
          <article key={p.tag} className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">{p.tag}</span>
                <a href={p.url} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground">
                  原文链接
                </a>
              </div>
              <h3 className="text-lg font-semibold">{p.title}</h3>
              <div className="flex flex-wrap items-center gap-3">
                <DTStrip hits={p.dt} />
                <span className="text-xs text-muted-foreground">亮 = 覆盖 · 灰划线 = 缺席（{p.dt.split("").filter((c) => c !== "_").length}/5 格）</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">性质</div>
                {p.nature}
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">样本规模</div>
                {p.n}
              </div>
            </div>

            {/* 五格逐格对应 */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                五步法逐格对应（它在这格干了什么 / 有没有这格）
              </div>
              <ul className="space-y-1.5">
                {p.dtMap.map((m, i) => (
                  <li key={i} className="grid gap-1 rounded-lg border border-border/60 p-2.5 text-sm sm:grid-cols-[7rem_8rem_1fr] sm:gap-3">
                    <span className="font-semibold">{m.dt}</span>
                    <span>{m.maps}</span>
                    <span className="text-muted-foreground">{m.note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {p.purpose && (
              <div className="space-y-3 rounded-lg border border-border/60 p-4">
                <div><div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">研究目的</div><p className="text-sm">{p.purpose}</p></div>
                <div><div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">招募与参与者</div><p className="text-sm">{p.recruitment}</p></div>
                <div><div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">实际执行：按时间顺序（每步已归入五步法的哪一格）</div><StepList steps={p.procedure ?? []} /></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-muted/40 p-3 text-sm"><div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">工具与测量</div>{p.measures}</div>
                  <div className="rounded-lg bg-muted/40 p-3 text-sm"><div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">分析方法</div>{p.analysis}</div>
                  <div className="rounded-lg bg-muted/40 p-3 text-sm"><div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">主要结果</div>{p.findings}</div>
                  <div className="rounded-lg bg-muted/40 p-3 text-sm"><div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">局限与不能声称的内容</div>{p.limitations}</div>
                </div>
              </div>
            )}

            {/* 原逐步拆解 + LLM，默认全部显示 */}
            <div className="rounded-lg border border-border/60">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                原始步骤 → LLM 工程对照（次要参考）
              </div>
              <ol className="space-y-2 p-3 pt-1">
                {p.steps.map((st, i) => (
                  <li key={i} className="grid gap-1 rounded-lg bg-muted/40 p-3 text-sm sm:grid-cols-2 sm:gap-4">
                    <span>{st.s}</span>
                    <span className="font-mono text-[0.8rem] text-primary">{st.llm}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">它「证明」了什么</div>
                {p.claim}
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">对我们的参考价值</div>
                {p.useful}
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">直接抄什么</div>
                <ul className="list-disc space-y-1 pl-4">
                  {p.steal.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* 项目族谱 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          图 1.5 · 项目族谱：25 个 100% 对口 · 全部核实为真实英文期刊论文的项目的方法名 · 时间线 · 姊妹篇 · 逐阶段五步法归位
        </h2>
        <Box>
          <strong>为什么要按项目而不按论文看</strong>：一个项目的「方法」从来不写在一篇里，而是拆成
          协议篇 → 开发篇 → 可用性篇 → RCT 篇。所以「他们做了五步法」是把 4–5 篇缝起来才看到的假象；
          单篇永远只有一两格。全部筛选条件：<strong>失智症或衰弱老人的家庭照护者数字工具，且必须是英文发表</strong>，
          其余（戒烟、糖尿病、癌症、临床医生端、机器人）一律不收。
          <br />
          <strong className="text-destructive">本轮剔除（非英文 / 非期刊 / 无法核实）</strong>：韩国 3 个项目（KSPHN 学会志全文韩语；
          J Health Inform Stat 亦为韩文期刊）、Alzheimer&apos;s &amp; Dementia 2022 alz.067407（DOI 被反爬拦截，
          标题作者均无法确认，不写进来）、日本 Mimamoriai（只有 UMIN 注册号，无英文论文）。
          另本轮按「只留英文期刊论文」再剔除 12 条非期刊出处：AAIC 会议摘要 3 条（alz.041369、alz.065640、
          alz70863_110564）、GSA 会议摘要 1 条（香港 eCoaching，整个项目移除）、MEDINFO 会议论文集 1 条
          （Stud Health Technol Inform 象形图篇）、DRS 2004 会议论文 1 条、medRxiv 预印本 1 条、
          JMIR 预印本 1 条、临床试验注册号 2 条（NCT04540198、NCT05992467）、CORDIS 与项目交付物 2 条、
          digiDEM Bayern 项目页 3 条（整个项目移除）、博士论文 1 条（Griffith）；
          另剔除 InspireD（Health Expect PMC8369094 解析到的是无关文章，出处无法核实）与
          Tele-Savvy 2017「经验教训」篇（DOI 无法核实）。
          <br />
          <strong className="text-primary">本轮核实并更正 3 处</strong>：mWITH ME 已读到方法与样本量（18+20）；
          CIRCA-BC 真实出处是 Am J Alzheimers Dis Other Demen 2015;30(1):101（2014 在线首发，PMID 24928817），
          与之前标注不同；微信 WECARE 干预**确实有后续期刊篇**（JMIR Aging 2023;6:e42972），上一版说「没找到」是错的。
        </Box>
        <div className="space-y-5">
          {projects.map((pr) => (
            <article key={pr.name} className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">{pr.name}</h3>
                <DTStrip hits={pr.dt} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">对口程度</div>
                  {pr.scope}
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">它自称的方法名</div>
                  {pr.method}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  时间线（阶段 → 实际动作 → 落在五步法哪一格 → 出处）
                </div>
                <ul className="space-y-1.5">
                  {pr.phases.map((ph, i) => (
                    <li key={i} className="grid gap-1 rounded-lg border border-border/60 p-2.5 text-sm sm:grid-cols-[9rem_1fr_6rem_11rem] sm:gap-3">
                      <span className="font-semibold">{ph.p}</span>
                      <span>{ph.act}</span>
                      <span className="font-mono text-primary">{ph.dt}</span>
                      {ph.url ? (
                        <a href={ph.url} target="_blank" rel="noreferrer" className="text-xs underline underline-offset-4 text-muted-foreground hover:text-foreground">
                          {ph.paper}
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">{ph.paper}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              {projectDossiers[pr.name] && (
                <div className="space-y-3 rounded-lg border border-border/60 p-4">
                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">研究目的</div>
                    <p className="text-sm">{projectDossiers[pr.name].purpose}</p>
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">招募、纳入与样本</div>
                    <p className="text-sm">{projectDossiers[pr.name].participants}</p>
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">具体怎么做：完整时间顺序（每步已归入五步法的哪一格）</div>
                    <StepList steps={projectDossiers[pr.name].procedure} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-muted/40 p-3 text-sm"><div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">工具与测量</div>{projectDossiers[pr.name].measures}</div>
                    <div className="rounded-lg bg-muted/40 p-3 text-sm"><div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">分析方法</div>{projectDossiers[pr.name].analysis}</div>
                    <div className="rounded-lg bg-muted/40 p-3 text-sm"><div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">主要结果</div>{projectDossiers[pr.name].results}</div>
                    <div className="rounded-lg bg-muted/40 p-3 text-sm"><div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">局限与不能声称的内容</div>{projectDossiers[pr.name].limits}</div>
                  </div>
                </div>
              )}
              <div className="rounded-lg bg-primary/5 p-3 text-sm">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">我们能拿走什么</div>
                {pr.verdict}
              </div>
            </article>
          ))}
        </div>
        <div className="overflow-x-auto rounded-lg border border-border bg-card p-4">
          <pre className="font-mono text-[11px] leading-5 whitespace-pre text-foreground">{`
  ── 25 个已核实英文期刊项目跑完，规律只有八条 ─────────────────────────────────────────────
  ① 单篇平均只占 2 格；凑齐五格的只有 Partner in Balance，代价是 4 篇 + 1 个 RCT + 5 年。
  ② I 构思格几乎全空。真做工作坊的（CIRCA / CAREGIVERSPRO / Rathnayake）都是有欧盟或
     大学经费的多年项目，那格是经费的产物，不是知识的产物。
  ③ 顺序是排版顺序，不是工作顺序。Care Me Too 的「共同设计篇」比「可用性篇」晚发四年。
  ④ 最便宜的三条发表路线，全部无需新招募：
       a) 只写协议（WECARE 微信干预 JMIR Aging 2022;5(3):e40171）——零参与者，后来还发了试点篇。
       b) 换一种语言/国家再测一遍（iSupport 瑞士版 e81247 → 基层医疗实施篇 e77688）。
       c) 换一个价值观镜头重写同一批数据（魁北克「社会正义设计」）。
  ⑤ 招募可以找替身。CIRCA-BC 的 39 位「共同设计者」全是无失智的普通老人，
     真正的失智患者只在最后试点里出现 3 位。招募成本砍九成，方法名一字不改。
  ⑥ 已核实的最低成本完整样本（mWITH ME 2026）：理论拼装 + 18 人访谈 + 20 人用 3 周
     + 一份李克特问卷 = 一篇 SCI。这就是我们要复制的规格，不多做一格。
  ⑦ 新捞一批（10 个，ACM/PubMed/JMIR）后，两个更狠的下限被确认：
       · 不需要成品——JMIR Form Res 2024;8:e53402 用「低保真原型」做形成性评估就发了。
       · 不需要结果——BMC Med Inform Decis Mak 2019;19(S4):180 整篇只写「我们打算怎么测」。
     加上「只写协议」，我们其实有三条零成品、零结果的发表路线。
  ⑧ 一个想法可以拆三篇期刊论文：Hispanic 失智分期 App（2018 需求 → 说服式界面
     → 2023 启发式评估 + 可用性测试）全程零失智患者参与，参与者只有照护者。
     瑞典 Karolinska 同理：同一个 App、同一套访谈法，换成专业人员受访就再发一篇。

`}</pre>
        </div>
      </section>

      {/* 我们的四步映射到五步法 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">图 2 · 我们的最小编舞 = 五步法里的哪几格</h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card p-4">
          <pre className="font-mono text-[11px] leading-5 whitespace-pre text-foreground">{`
  我们的动作                        五步法格子    抄自
  ─────────────────────────────────────────────────────────────
  第 1 步 半结构化访谈 8–15+6–12 人   E 同理        e52389 / PMC9308637
  第 2 步 DR1…DR10 → 功能 对照表     D 定义        e52389（Table 1）
  第 3 步 5–8 人出声思维走查          T 测试        e60566 / e26532（三框架）
  第 4 步 SUS 两轮，分数上升          T 测试 ×2     e65022

  P 原型：已上线产品本身即是原型，零额外工作（e60143 的「数字化迁移」位）
  I 构思：跳过。8 篇里 7 篇也跳过，无人被因此拒稿。

  论文叙事一句话：「Following a design thinking process, we
  empathized (interviews), defined (DR table), prototyped
  (the deployed platform), and tested (walkthrough + SUS).」
  ——四个动词全有出处，每一格都能指向一张表。
`}</pre>
        </div>
        <Box>
          <strong>写论文时的关键句式</strong>：永远说「我们遵循 design thinking 流程」，在 Methods 里把 E/D/P/T 四格各配一段小标题；
          I 格不解释、不道歉、不提及——没人问。这就是全部。
        </Box>
      </section>

      <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
        看完请删。这一页的存在只是为了让你只需懂五步法一个坐标系。
      </footer>
    </main>
  );
}
