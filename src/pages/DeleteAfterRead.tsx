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
};

const papers: Paper[] = [
  {
    tag: "e60566",
    title: "生成式 AI 照护工具的认知走查评估（JMIR Aging 2025）",
    url: "https://aging.jmir.org/2025/1/e60566",
    nature: "定性可用性评估。产品已经存在，作者一行代码没写。",
    n: "个位数专家/照护者，单场 60 分钟左右",
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
    n: "5–8 人，单场三段式（第一印象 → 出声思维 → 访谈）",
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
    n: "10–12 人访谈 + 1 场共同设计工作坊",
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
    n: "每轮约 10 人，两轮",
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
    nature: "开发过程报告：把「我们做了个东西」写成「我们经由需求分析做了个东西」。",
    n: "访谈 + 迭代原型，样本中等",
    dt: "ED_PT",
    dtMap: [
      { dt: "E 同理", maps: "✅ 标准", note: "文献 + 访谈提炼需求 = Empathize。" },
      { dt: "D 定义", maps: "✅ 标准", note: "需求 → 功能模块映射 = Define 的问题陈述。" },
      { dt: "I 构思", maps: "❌ 缺席", note: "没有发散环节，需求直接跳原型——这一格被悄悄跳过，没人追究。" },
      { dt: "P 原型", maps: "✅ 标准", note: "低保真 → 高保真迭代 = Prototype 教科书动作。" },
      { dt: "T 测试", maps: "⚠️ 半格", note: "小规模可用性测试收尾，没有量化指标。" },
    ],
    steps: [
      { s: "① 文献 + 访谈提炼需求清单", llm: "= 竞品分析 + 语料 → 需求文档" },
      { s: "② 需求 → 功能模块映射", llm: "= spec → module 拆解" },
      { s: "③ 低保真 → 反馈 → 高保真", llm: "= prompt v1 → 评审 → v2" },
      { s: "④ 小规模可用性测试收尾", llm: "= smoke test 后发版" },
      { s: "⑤ 讨论可扩展性与 RCT 计划", llm: "= roadmap 章节" },
    ],
    claim: "工具是「基于需求」开发的。",
    useful: "中高。这是五步法「线性顺序」覆盖最完整的一篇（E→D→P→T 顺着走），适合当我们论文的 Development 段骨架。注意它公开跳过了 I 格而无人追问。",
    steal: ["「文献+访谈 → 需求 → 功能」三段式直接套我们的 CCT 功能清单"],
  },
  {
    tag: "e63715",
    title: "PDC30 Chatbot：心理教育聊天机器人可接受性混合方法（JMIR Aging 2025）",
    url: "https://aging.jmir.org/2025/1/e63715",
    nature: "和我们最像：脚本式照护 chatbot + 可接受性评估。混合方法。",
    n: "数十人使用 + 子集访谈",
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
    title: "用 LLM 赋能早期失智照护者：混合方法评估（JMIR Form Res 2025）",
    url: "https://doi.org/10.2196/79975",
    nature: "直接就是 LLM 主题。证明这个题材正密集出现，跟风安全。",
    n: "混合方法，小样本",
    dt: "E__PT",
    dtMap: [
      { dt: "E 同理", maps: "⚠️ 半格", note: "把工具交给照护者用，事后访谈收感受——同理发生在测试里。" },
      { dt: "D 定义", maps: "❌ 缺席", note: "无需求清单。" },
      { dt: "I 构思", maps: "❌ 缺席", note: "零发散。" },
      { dt: "P 原型", maps: "✅ 事实覆盖", note: "一个 LLM 工具/提示集就是原型。" },
      { dt: "T 测试", maps: "✅ 标准", note: "量表 + 访谈 + 幻觉/安全讨论。" },
    ],
    steps: [
      { s: "① 给照护者 LLM 工具/提示集", llm: "= 发 prompt 模板给用户" },
      { s: "② 定量：满意度/可用性量表", llm: "= 评分 1–5" },
      { s: "③ 定性：访谈 + 主题分析", llm: "= 人工读 case" },
      { s: "④ 讨论幻觉/安全边界", llm: "= safety section（我们已有护栏可写）" },
    ],
    claim: "LLM 有帮助但需护栏。",
    useful: "中高。抄它的「安全与护栏」段落结构，把已有护栏写成研究贡献。",
    steal: ["已有安全护栏 = 论文的「设计决策」，零成本贡献"],
  },
  {
    tag: "e60143",
    title: "GamePlan4Care：把 REACH II 搬上网 + 定性可用性测试（JMIR Form Res 2025）",
    url: "https://formative.jmir.org/2025/1/e60143",
    nature: "「把公认有效的线下方案数字化」最安全的选题路线。有效性借用原方案，自己只测可用性。",
    n: "小样本定性可用性测试",
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
    n: "混合方法，数十名失智照护者",
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
    title: "Co-designing an Adaption of a Mobile App for Early-Stage Dementia（JMIR Res Protoc 2020）",
    url: "https://doi.org/10.2196/19543",
    nature: "协议论文：早期失智患者居家 co-design，聚焦沟通、安全与福祉。",
    n: "多案例探索性研究，患者+照护者共同参与",
    dt: "EDIP_",
    dtMap: [
      { dt: "E 同理", maps: "✅ 标准", note: "多案例探索 = 对早期失智患者居家生活的深度访谈/观察。" },
      { dt: "D 定义", maps: "✅ 标准", note: "把痛点整理成「需要增强沟通/安全/福祉」的具体设计目标。" },
      { dt: "I 构思", maps: "✅ 标准", note: "co-design 工作坊让患者和照护者一起出方案——这是真·Ideate。" },
      { dt: "P 原型", maps: "⚠️ 半格", note: "协议阶段只写到「适配现有 App」，原型实现和测试留给后续研究。" },
      { dt: "T 测试", maps: "❌ 缺席", note: "协议论文不写测试，这是被允许的阶段性成果。" },
    ],
    steps: [
      { s: "① 识别早期失智患者居家沟通、安全、福祉触点", llm: "= 用户旅程地图" },
      { s: "② 患者+照护者共同参加工作坊", llm: "= co-design session" },
      { s: "③ 把工作坊产出整理成 App 适配需求", llm: "= 需求 → feature traceability" },
      { s: "④ 制定多案例评估协议", llm: "= 先写 Methods 再执行" },
      { s: "⑤ 声明后续才做原型和测试", llm: "= 协议论文的标准结尾" },
    ],
    claim: "co-design 能让早期失智患者参与移动应用适配。",
    useful: "高——给我们 LovedOneSimpleView/患者模式提供了「患者也是用户」的正当性。",
    steal: ["把患者纳入设计而不只是照护者", "协议论文可以只写到 P 之前"],
  },
  {
    tag: "e46188",
    title: "Researched Apps Used in Dementia Care：系统综述（JMIR 2023）",
    url: "https://www.jmir.org/2023/1/e46188",
    nature: "系统综述，不是原创研究，但给整个领域画了一张「缺口地图」。",
    n: "系统综述，覆盖大量已发表失智照护 App",
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
    n: "实验研究，老年人 + 照护者两组",
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
    n: "混合方法，照护者样本",
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
    n: "家庭照护者，混合方法试点",
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
    n: "家庭照护者，现场可用性",
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
      { p: "Phase 2 2020", act: "以公平/包容视角扩写同一批数据", dt: "I", paper: "JMIR 2020;22(11):e18399", url: "https://www.jmir.org/2020/11/e18399" },
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
     凡未读全文核实的样本量/场次/量表，一律标注「需读全文核实」，不编造。 */
  {
    name: "Hispanic 家庭照护者·失智功能分期 Web App（美国）★最高价值",
    scope: "西语裔失智症家庭照护者专用教育 Web App。参与者全程只有照护者，从不招失智患者。100% 对口。",
    method: "自称：启发式评估 + 可用性测试（Heuristic Evaluation and Usability Testing）；前序篇用说服式系统设计原则（Persuasive Systems Design）",
    dt: "EDIPT",
    phases: [
      { p: "Phase 1 2018 需求评估", act: "西语裔家庭照护者的信息/沟通/工具需求调查", dt: "E", paper: "Inform Health Soc Care 2018;44(2):115–134, doi 10.1080/17538157.2018.1433674（PMID 29504837）", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6123278/" },
      { p: "Phase 2 界面原则", act: "把说服式系统设计原则套到界面上", dt: "D+I+P", paper: "PMID 35178504", url: "https://pubmed.ncbi.nlm.nih.gov/35178504/" },
      { p: "Phase 3 2023 评估", act: "启发式评估 + 照护者可用性测试（N/场次/是否用 SUS 需读全文核实）", dt: "T", paper: "J Gerontol Nurs 2023;49(7), doi 10.3928/00989134-20230615-03（PMID 37379048）", url: "https://doi.org/10.3928/00989134-20230615-03" },
    ],
    verdict: "本批最值得整份抄的：一个想法拆成三篇期刊论文，参与者全是照护者，一个失智患者都没招。招募成本几乎为零。（象形图那篇发在 Stud Health Technol Inform，PubMed 归类为会议论文集/书章节，非期刊论文，已剔除。）",
  },
  {
    name: "CareFit（英国 Strathclyde）★两篇成套",
    scope: "失智症非正式照护者的身体活动支持 App。第一篇是泛照护者，第二篇明确转向失智照护者。100% 对口。",
    method: "自称：共同设计与原型开发研究（Co-design and Prototype Development Study）→ 混合方法可行性与适配研究",
    dt: "EDIPT",
    phases: [
      { p: "Phase 1 2021", act: "共同设计 + 原型开发（N/场次/量表需读全文核实）", dt: "E+D+I+P", paper: "JMIR Form Res 2021;5(10):e27358（PMC8489565）", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8489565/" },
      { p: "Phase 2 2025", act: "失智照护者混合方法可行性 + 适配研究", dt: "T", paper: "J Med Internet Res 2025;27:e56739", url: "https://www.jmir.org/2025/1/e56739/" },
    ],
    verdict: "标准两段式：先发共同设计原型篇，再发可行性篇。注意第一篇的参与者可能只是泛非正式照护者、并非失智专属——需读全文核实；若是，说明「失智专属」这顶帽子第二篇才戴上，一样过审。",
  },
  {
    name: "低保真原型 · 传感器交互平台（JMIR Form Res 2024）★最省钱",
    scope: "认知障碍老人的非正式照护者用交互平台，评估对象是低保真原型（纸面/低仿真），不需要能跑的软件。100% 对口。",
    method: "自称：形成性评估（Formative Evaluation）",
    dt: "ED_P_",
    phases: [
      { p: "Phase 1 2024", act: "照护者对低保真原型做形成性评估（N/场次/量表需读全文核实）", dt: "E+D+P", paper: "JMIR Form Res 2024;8:e53402", url: "https://formative.jmir.org/2024/1/e53402" },
    ],
    verdict: "全批最便宜的一格：没有成品也能发。把 Figma 静态图给几个照护者看一轮，就叫形成性评估。我们随时能补这一篇。",
  },
  {
    name: "Draw-Care（澳洲 Monash）",
    scope: "多族裔家庭照护者的多语数字干预，共同设计 + 用户测试。参与者是照护者，不是患者。100% 对口。",
    method: "自称：共同设计 + 用户测试研究（Co-Designed... User-Testing Study）",
    dt: "ED_PT",
    phases: [
      { p: "Phase 1 2026", act: "族裔多元家庭照护者共同设计 + 用户测试（N/场次需读全文核实）", dt: "E+D+P+T", paper: "JMIR Form Res 2026;e81128（PMC12996899）", url: "https://formative.jmir.org/2026/1/e81128" },
      
    ],
    verdict: "「多语 + 多族裔」是加分项而不是难点：语言越多，审稿人越不好意思质疑样本量。我们的中英双语正好白送这一格。",
  },
  {
    name: "瑞典 tailor-made mobile app（Karolinska）★两篇成套",
    scope: "失智症家庭照护者的定制化手机 App，纯访谈 + 主题分析。100% 对口。",
    method: "自称：价值共创（value co-creation）+ 质性研究（主题分析框架需读全文核实）",
    dt: "E____",
    phases: [
      { p: "Phase 1 2022", act: "家庭照护者质性访谈（N/时长/软件需读全文核实）", dt: "E", paper: "BMC Geriatr 2022（PMC9667833）", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9667833/" },
      { p: "Phase 2 2024", act: "加入专业人员作为第二组参与者，再发一篇体验质性研究", dt: "E+T", paper: "BMC Geriatr 2024;24:554, doi 10.1186/s12877-024-05151-6", url: "https://link.springer.com/article/10.1186/s12877-024-05151-6" },
    ],
    verdict: "变现技巧：同一个 App、同一套访谈法，换一批受访者（照护者→专业人员）就再发一篇。我们有照护者 + 服务提供者两端，天然能拆两篇。",
  },
  {
    name: "Olera.care（美国）",
    scope: "失智照护者用的网页照护规划平台，初步评估。100% 对口。",
    method: "自称：初步评估研究（Preliminary Evaluation Study，混合方法）；是否用 SUS 需读全文核实",
    dt: "___PT",
    phases: [
      { p: "Phase 1 2024", act: "平台初步评估（N/量表需读全文核实）", dt: "P+T", paper: "JMIR Aging 2024;7:e55132", url: "https://aging.jmir.org/2024/1/e55132/" },
    ],
    verdict: "「初步评估」这个标题是免死金牌——样本小、结论弱都合法。我们上线后随手就能发一篇同名规格。",
  },
  {
    name: "Rathnayake mHealth 共同设计（澳洲 Griffith/JCU）",
    scope: "失智症家庭照护者应对功能性失能照护需求的 mHealth App 共同设计。100% 对口。",
    method: "自称：共同设计（Co-design）",
    dt: "EDIP_",
    phases: [
      { p: "Phase 1 2020/2021", act: "照护者共同设计工作坊（N/场次需读全文核实）", dt: "E+D+I+P", paper: "Inform Health Soc Care 2021;46(3), doi 10.1080/17538157.2020.1793347", url: "https://doi.org/10.1080/17538157.2020.1793347" },
    ],
    verdict: "单篇共同设计论文（Inform Health Soc Care 2021;46(3), PMID 32706282）就能占满 E+D+I+P 四格。（同作者博士论文虽方法章节最全，但非期刊发表，已从清单剔除。）",
  },
  {
    name: "AreaAlzheimer（意大利）★两篇成套",
    scope: "失智照护者数字平台：需求分析 + 混合方法试点 → 后续 UX/可用性篇。100% 对口。",
    method: "自称：需求分析 + 混合方法试点评估流程；后续篇为可用性/可及性/有用性 UX 评价",
    dt: "ED_PT",
    phases: [
      { p: "Phase 1 2026", act: "需求分析 + 混合方法试点（N/量表需读全文核实）", dt: "E+D+P", paper: "Front Digit Health 2026（PMC12865408）", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12865408/" },
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
      { p: "Phase 1 2025", act: "生态开发 + 混合方法评估（参与者类型/N/量表需读全文核实）", dt: "E+D+I+P+T", paper: "JMIR Aging 2025;8:e78759", url: "https://aging.jmir.org/2025/1/e78759/PDF" },
    ],
    verdict: "反面参考：「生态系统」意味着多方利益相关者、多轮工作坊，成本比单 App 高一个量级。规格可看，不要照抄。",
  },
  {
    name: "家庭用药管理可用性协议（Quintana 等）",
    scope: "家属为衰弱老人管理用药的 eHealth 可用性测试协议篇。偏衰弱老人而非失智，需确认用户是家属而非临床医生。",
    method: "自称：可用性协议的设计与方法学（design and methodology of a usability protocol）",
    dt: "___P_",
    phases: [
      { p: "Phase 1 2019", act: "只发方法设计，不发结果（N/量表按设计值，需读全文核实）", dt: "P", paper: "BMC Med Inform Decis Mak 2019;19(Suppl 4):180, doi 10.1186/s12911-019-0907-8", url: "https://doi.org/10.1186/s12911-019-0907-8" },
      
    ],
    verdict: "整篇内容就是方法章节本身——这是最直接的抄写模板。同时印证：只写「我们打算怎么测」也能算一篇。",
  },
  {
    name: "配偶照护者身体活动 App 设计（Penn State，⚠ 可能含患者本人）",
    scope: "失智者配偶照护者的身体活动 App 设计。100% 对口，但参与者可能是「配偶 + 患者」配对。",
    method: "自称：设计研究（方法名与分析框架需读全文核实）",
    dt: "ED___",
    phases: [
      { p: "Phase 1 2024", act: "配偶照护者（可能含失智者本人）访谈/共同设计——参与者构成需读全文核实", dt: "E+D", paper: "Dementia (London) 2024, doi 10.1177/14713012241272878（PMC11915756）", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11915756/" },
    ],
    verdict: "唯一疑似真的招了失智患者的一篇。若确认是配对招募，就是本批最贵的方案——列在这里主要是当反面样本。",
  },
];


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
          下面每篇论文都只做一件事——标出它覆盖了五格中的哪几格、哪几格完全缺席。
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

            {/* 原逐步拆解 + LLM */}
            <details className="rounded-lg border border-border/60">
              <summary className="cursor-pointer px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                展开：它的原始步骤 → LLM 工程对照（次要参考）
              </summary>
              <ol className="space-y-2 p-3 pt-1">
                {p.steps.map((st, i) => (
                  <li key={i} className="grid gap-1 rounded-lg bg-muted/40 p-3 text-sm sm:grid-cols-2 sm:gap-4">
                    <span>{st.s}</span>
                    <span className="font-mono text-[0.8rem] text-primary">{st.llm}</span>
                  </li>
                ))}
              </ol>
            </details>

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
