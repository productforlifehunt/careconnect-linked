/**
 * DELETE AFTER READ — 一次性对照页 / throwaway comparison page
 *
 * 用途：把 5–8 篇「AI + 失智 + 照护者 + 可用性」论文的方法流程，
 * 逐步翻译成 LLM 工程师熟悉的动作，看清它们到底是不是同一套流程换了名字。
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

/* ---------------------------------- 数据 ---------------------------------- */

type Paper = {
  tag: string;
  title: string;
  url: string;
  nature: string;
  n: string;
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
    nature: "定性可用性评估。产品已经存在，作者一行代码没写，只是把别人的工具拉过来让人边用边说话。",
    n: "个位数专家/照护者，单场 60 分钟左右",
    steps: [
      { s: "① 选定 2–3 个「典型任务」（例如：问一个行为症状怎么处理／找一个本地资源／看一段解释）", llm: "= 你写 eval set 时先挑 3 个代表性 prompt 类别" },
      { s: "② 每个任务预先写出「理想操作序列」（专家认为用户应该走的每一步）", llm: "= 你给每个 prompt 预设 golden answer / expected trace" },
      { s: "③ 让参与者边操作边出声（think-aloud），研究者只记不教", llm: "= 人工标注跑一遍，记录 failure case，不许提示模型" },
      { s: "④ 在每一步问四个固定问题：用户知道要干什么吗／看得到该点的东西吗／点了之后知道自己对了吗／会不会误解反馈", llm: "= 你的 rubric 四个维度（意图识别／可发现性／反馈正确性／误导风险）" },
      { s: "⑤ 把所有卡点归类成「可用性问题清单」并标严重度 1–3", llm: "= failure taxonomy + severity buckets" },
      { s: "⑥ 结论段：工具有潜力，但需要更多本地化与更长期研究", llm: "= 「promising, more work needed」的学术版 TODO" },
    ],
    claim: "AI 工具对照护者「有潜力」，同时存在文化与语言适配问题。",
    useful: "极高。这是唯一一种「零开发、零招募压力、一次会话」就能产出一篇可投稿方法段的仪式。我们产品已经在跑，直接拉 5–8 人走查即可。",
    steal: [
      "三任务 × 四问题 = 12 格表格，填满就是 Results",
      "严重度分级让「我们发现了 14 个问题」听起来像发现",
      "双语/本土文化维度是我们独有的加分项（中英双 App）",
    ],
  },
  {
    tag: "e26532",
    title: "三框架叠加的定性可用性分析（JMIR Hum Factors 2021）",
    url: "https://humanfactors.jmir.org/2021/3/e26532",
    nature: "同一批录音，用三套现成框架各分析一遍。方法上的「一鱼三吃」。",
    n: "5–8 人，单场三段式（第一印象 → 出声思维 → 半结构化访谈）",
    steps: [
      { s: "① 一场会话切三段：先看不许点（第一印象）→ 再做任务（出声思维）→ 最后聊感受（访谈）", llm: "= zero-shot 观察 → 带任务跑 eval → 事后人工访谈补充" },
      { s: "② 转录全部录音，逐行编码", llm: "= 把 log 全量落盘，逐条打标签" },
      { s: "③ 第一遍用 ISO 9241-11：把问题归到 效果／效率／满意度", llm: "= 按 accuracy / latency / user rating 三桶分" },
      { s: "④ 第二遍用 Nielsen 十大启发式：一致性、可见性、错误预防……", llm: "= 按 red-team 清单逐项过（越权、幻觉、拒答、语气……）" },
      { s: "⑤ 第三遍用 Garrett 五层（策略/范围/结构/骨架/表层）定位问题「深度」", llm: "= 判断 bug 在 prompt 层／检索层／模型层／UI 层" },
      { s: "⑥ 三张表并列呈现，声称「多视角三角验证」", llm: "= 同一份 eval 换三种切法出三张图，叫 multi-metric evaluation" },
    ],
    claim: "多框架能捕捉单框架遗漏的问题。（等于说：切三次比切一次多。）",
    useful: "极高，而且几乎零成本——录音只录一次，分析三次。评审最爱看到「框架名字」。",
    steal: ["一场会话 = 三个 Results 小节", "三个框架名直接写进 Methods 标题，防御力拉满"],
  },
  {
    tag: "e52389",
    title: "加速版体验式共同设计（accelerated experience-based co-design, JMIR Form Res 2024）",
    url: "https://formative.jmir.org/2024/1/e52389",
    nature: "把经典 co-design 的 6–12 个月压缩到几周。承认自己是「加速版」——这句自陈就是防御。",
    n: "10–12 人访谈 + 1 场共同设计工作坊",
    steps: [
      { s: "① 半结构化访谈收集「体验触点」", llm: "= 收集真实用户 prompt 语料" },
      { s: "② 剪出「触发影片」/引子材料（trigger film）代替原版几十小时素材", llm: "= 用少量 few-shot 例子代替全量微调数据" },
      { s: "③ 一场工作坊：参与者排序痛点、投票优先级", llm: "= 人工偏好排序（pairwise ranking / RLHF 的手工版）" },
      { s: "④ 团队把投票结果写成「设计需求」清单 DR1…DRn", llm: "= 把偏好数据转成 spec / system prompt 条目" },
      { s: "⑤ 逐条把 DR 映射到已实现的功能，做成一张对照表", llm: "= requirement → implementation traceability matrix" },
      { s: "⑥ 局限段自陈：加速导致参与深度不足", llm: "= model card 的 limitations 章节" },
    ],
    claim: "压缩版 co-design 仍能产出可用的设计需求。",
    useful: "最高。DR 表就是「证明用户参与过」的唯一硬通货。我们已经有全部功能，倒推 DR1…DR10 只需半天。",
    steal: ["DR1…DR10 → 功能 对照表（Table 1，全文最有用的一张图）", "「accelerated」这个词本身就替我们挡掉「你为什么只做了三周」"],
  },
  {
    tag: "e65022",
    title: "digiDEM-SCREEN 两轮迭代 + SUS（JMIR Hum Factors 2025）",
    url: "https://humanfactors.jmir.org/2025/1/e65022",
    nature: "定量壳 + 迭代叙事。核心就是同一份 10 题问卷做两次，第二次分数高一点。",
    n: "每轮约 10 人，两轮",
    steps: [
      { s: "① 第一轮：任务测试 + SUS（10 题，0–100 分）", llm: "= baseline benchmark 跑分" },
      { s: "② 列出发现的问题，改产品", llm: "= 根据 eval 结果改 prompt / 改 UI" },
      { s: "③ 第二轮：新一批人，同一份 SUS", llm: "= 改完再跑同一 benchmark" },
      { s: "④ 报告 SUS 从 X 升到 Y，宣称迭代有效", llm: "= 「我们把分数从 71 提到 82」的截图" },
      { s: "⑤ 局限：样本小、非随机、无对照组", llm: "= 「benchmark 不代表真实分布」的免责声明" },
    ],
    claim: "两轮迭代提升了可用性。（没有对照组，所以严格说什么都没证明。）",
    useful: "高。SUS 是全世界评审都认的 10 道题，填两次就有一根「上升的柱子」。这是全套里唯一的定量证据。",
    steal: ["SUS ×2 轮，图表就是一根上升的柱状图", "「无对照组」自己写进 Limitations，评审就没得写"],
  },
  {
    tag: "PMC9308637",
    title: "Helping the Helpers：需求驱动的开发叙事",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9308637/",
    nature: "开发过程报告。把「我们做了个东西」写成「我们经由需求分析做了个东西」。",
    n: "访谈 + 迭代原型，样本中等",
    steps: [
      { s: "① 文献 + 访谈提炼照护者需求清单", llm: "= 竞品分析 + 用户语料 → 需求文档" },
      { s: "② 需求 → 功能模块映射", llm: "= spec → module 拆解" },
      { s: "③ 低保真原型 → 反馈 → 高保真", llm: "= prompt v1 → 人工评审 → prompt v2" },
      { s: "④ 小规模可用性测试收尾", llm: "= smoke test 后发版" },
      { s: "⑤ 讨论段谈可扩展性与后续 RCT 计划", llm: "= roadmap 章节" },
    ],
    claim: "工具是「基于需求」开发的。",
    useful: "中高。它给我们提供的是 Introduction 与 Development 段落的骨架，不是评估方法。",
    steal: ["「文献 + 访谈 → 需求 → 功能」三段式，直接套我们的 CCT 功能清单"],
  },
  {
    tag: "e63715",
    title: "PDC30 Chatbot：心理教育聊天机器人可接受性混合方法研究（JMIR Aging 2025）",
    url: "https://aging.jmir.org/2025/1/e63715",
    nature: "和我们最像的一篇：一个规则/脚本式照护聊天机器人 + 可接受性评估。混合方法（问卷 + 访谈）。",
    n: "数十人使用 + 子集访谈",
    steps: [
      { s: "① 内容开发：把既有心理教育课程切成 30 个模块塞进 chatbot", llm: "= 把知识库切 chunk 做 RAG / 或直接写进 system prompt" },
      { s: "② 部署到用户熟悉的通道（微信类/网页）", llm: "= 走用户已有入口，不做新 App" },
      { s: "③ 定量：可接受性/满意度问卷 + 使用日志（打开次数、完成模块数）", llm: "= 用户留存 + 完成率 dashboard" },
      { s: "④ 定性：子集访谈，主题分析", llm: "= 抽样人工阅读会话，归纳 failure/亮点" },
      { s: "⑤ 结论：可接受、可行，需更大规模验证", llm: "= 「pilot 通过，准备 scale」" },
    ],
    claim: "照护者能接受聊天机器人做心理教育。",
    useful: "极高——这就是我们 AI 陪聊/知识库那条线的现成对标论文。我们的日志字段已经存在，直接当定量数据。",
    steal: ["「使用日志 = 定量数据」这一招最省事：不用招人，后台已有", "「可接受性（acceptability）」这个词比「有效性」好写一百倍，因为不需要疗效"],
  },
  {
    tag: "e79975",
    title: "用 LLM 赋能早期失智照护者：混合方法评估（JMIR Form Res 2025）",
    url: "https://doi.org/10.2196/79975",
    nature: "直接就是 LLM 主题。证明这个题材现在稿件正在密集出现，跟风安全。",
    n: "混合方法，小样本",
    steps: [
      { s: "① 给照护者一个 LLM 工具/提示集", llm: "= 发一个 prompt 模板给用户" },
      { s: "② 定量：满意度/可用性量表", llm: "= 评分 1–5" },
      { s: "③ 定性：访谈 + 主题分析", llm: "= 人工读 case" },
      { s: "④ 讨论 LLM 的幻觉/安全边界", llm: "= safety section，我们已经有医疗/财务护栏可写" },
    ],
    claim: "LLM 对照护者有帮助但需护栏。",
    useful: "中高。我们抄它的「安全与护栏」段落结构，把我们已有的护栏（不给医疗建议、不确定就联系家属）写成研究贡献。",
    steal: ["已有的安全护栏 = 论文的「设计决策」，零成本贡献"],
  },
  {
    tag: "e60143",
    title: "GamePlan4Care：把线下干预（REACH II）搬上网 + 定性可用性测试（JMIR Form Res 2025）",
    url: "https://formative.jmir.org/2025/1/e60143",
    nature: "「把公认有效的线下方案数字化」这条最安全的选题路线。有效性借用原方案，自己只测可用性。",
    n: "小样本定性可用性测试",
    steps: [
      { s: "① 选一个已被证明有效的线下干预（REACH II）", llm: "= 拿一个已验证的 baseline，不自己发明" },
      { s: "② 逐模块搬到网页", llm: "= 迁移实现，不改算法" },
      { s: "③ 定性可用性测试（任务 + 访谈）", llm: "= 只测 UX，不测 accuracy" },
      { s: "④ 结论：可用性可接受，后续测效果", llm: "= 「功能对齐，性能后续评估」" },
    ],
    claim: "数字化版本可用。",
    useful: "高——这是我们「借 WHO iSupport 内容」的正当化模板：有效性是 WHO 的，我们只负责可用性。",
    steal: ["「有效性借用、我们只测可用性」是最强的防御姿态：没人能要求你证明疗效"],
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
          防御性论文的编舞手册：8 篇「AI + 失智照护 + 可用性」论文逐步拆解，并逐步对标 LLM 工程流程
        </h1>
        <p className="text-muted-foreground">
          论文不是进攻性的，是防御性的：目的不是证明我们对，而是让人无法证明我们错。
          下面把每篇论文的每一步，翻成你熟的 LLM 工程动作。看完删掉这一页。
        </p>
        <Box>
          <strong>删除方法</strong>：删 <Mono>src/pages/DeleteAfterRead.tsx</Mono>，
          再删 <Mono>src/App.tsx</Mono> 里 <Mono>/delete-after-read</Mono> 那一行 Route 和它的 import。无其他依赖。
        </Box>
      </header>

      {/* 大图：两条流水线 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">图 1 · 同一条流水线，两套术语</h2>
        <p className="text-sm text-muted-foreground">
          结论先说：学术可用性研究 <em>就是</em> LLM 评测流程，只是每一格换了一个 1980–1990 年代的框架名字，
          并且把「跑分」换成「人的转录稿」。没有任何一步是 LLM 工程里不存在的。
        </p>
        <div className="overflow-x-auto rounded-lg border border-border bg-card p-4">
          <pre className="font-mono text-[11px] leading-5 whitespace-pre text-foreground">{`
   你熟的 LLM 流程                        学术论文流程（同一件事，改名）
 ─────────────────────────────        ──────────────────────────────────────────
 ① 竞品拆解 / 需求收集          ⇄      ① 文献综述 + 半结构化访谈（8–15人）
        │                                      │
        ▼                                      ▼
 ② 写 spec / system prompt      ⇄      ② 「设计需求」DR1…DR10（co-design 证据）
        │                                      │
        ▼                                      ▼
 ③ 造 eval set（3 类任务）      ⇄      ③ 任务场景设计 + 理想操作序列
        │                                      │
        ▼                                      ▼
 ④ 跑 eval / 人工标注           ⇄      ④ 出声思维走查（think-aloud, 5–8人）
        │                                      │
        ▼                                      ▼
 ⑤ failure taxonomy + 严重度    ⇄      ⑤ ISO 9241 / Nielsen 十启发式 / Garrett 五层
        │                                      │
        ▼                                      ▼
 ⑥ 改 prompt，重跑 benchmark    ⇄      ⑥ 第二轮迭代测试（新一批参与者）
        │                                      │
        ▼                                      ▼
 ⑦ 报分数（MMLU 71→82）         ⇄      ⑦ 报 SUS 分（68→81），一根上升柱状图
        │                                      │
        ▼                                      ▼
 ⑧ model card / limitations     ⇄      ⑧ Limitations：小样本、无对照、单机构
`}</pre>
        </div>
        <Box>
          <strong>唯一实质差异</strong>：LLM 流程的裁判是<em>数字</em>（可复现、可被打败）；
          论文流程的裁判是<em>转录稿的解释</em>（不可复现、因此也不可被反驳）。
          这不是缺陷，这正是它作为防御工具的价值——不可复现 ⇒ 不可推翻。
        </Box>
      </section>

      {/* 图 2 攻防 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">图 2 · 每一步挡住的是哪一句质问</h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card p-4">
          <pre className="font-mono text-[11px] leading-5 whitespace-pre text-foreground">{`
 评审可能开的枪                     我们提前放的沙袋
 ───────────────────────────       ────────────────────────────────────────────
 「用户参与了吗？」            →   访谈 n=12 + DR1…DR10 对照表
 「凭什么这么设计？」          →   DR → 功能 traceability（Table 1）
 「有没有真实用户用过？」      →   出声思维走查 5–8 人，含双语参与者
 「分析方法是什么？」          →   ISO 9241-11 + Nielsen + Garrett（三框架）
 「改了之后变好了吗？」        →   SUS 两轮，分数上升
 「有效性呢？」                →   有效性借用 WHO iSupport / REACH II，本研究只测可用性
 「样本这么小？」              →   Limitations 自己先写：小样本、无对照、单中心
 「AI 会不会说错话？」         →   已有护栏写成设计决策（不给医疗建议、不确定转家属）
`}</pre>
        </div>
        <p className="text-sm text-muted-foreground">
          规律：<strong>每一个可用性仪式，对应一句自己先说出来的免责声明</strong>。
          自陈的局限不能被当作缺陷攻击——这是整个体裁的核心机制。
        </p>
      </section>

      {/* 论文逐篇 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">逐篇拆解（每一步都对标 LLM 动作）</h2>
        {papers.map((p) => (
          <article key={p.tag} className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs text-primary">{p.tag}</span>
                <a href={p.url} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground">
                  原文链接
                </a>
              </div>
              <h3 className="text-lg font-semibold">{p.title}</h3>
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

            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                它每一步干了什么 → 对应你熟的哪一步
              </div>
              <ol className="space-y-2">
                {p.steps.map((st, i) => (
                  <li key={i} className="grid gap-1 rounded-lg border border-border/60 p-3 text-sm sm:grid-cols-2 sm:gap-4">
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

      {/* 我们的四步 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">图 3 · 我们照抄的最小编舞（四步，一次做完）</h2>
        <div className="overflow-x-auto rounded-lg border border-border bg-card p-4">
          <pre className="font-mono text-[11px] leading-5 whitespace-pre text-foreground">{`
 第 1 步  半结构化访谈  8–15 主要照护者 + 6–12 次要        来源 e52389 / PMC9308637
          ↳ 现有两份问卷已覆盖全部功能，每份只补一句：
            「如果有个工具能做到 X/Y/Z，你最看重哪个？有什么顾虑？」
                     │
 第 2 步  DR 表      DR1…DR10 → 功能 对照（Table 1）      来源 e52389
          ↳ 全文最有用的一张表，功能已存在，倒推半天完成
                     │
 第 3 步  一次走查    5–8 人 × 60 分钟 Zoom 出声思维        来源 e60566 / e26532
          ↳ 三任务 × 四问题；同一批录音用三框架分析三次
                     │
 第 4 步  SUS ×2     每轮 ~10 人，中间改一版               来源 e65022
          ↳ 得到一根上升的柱子；Limitations 自己先写满

 明确跳过：工作坊、人物志、旅程图、贴点投票、疗效证据、RCT。
 医院软硬件只写 demonstrator，不承诺部署。
`}</pre>
        </div>
        <Box>
          <strong>为什么这四步就够</strong>：它同时覆盖了「用户参与」「设计依据」「真实使用」「前后改进」四条枪口，
          而总工作量约等于：两次问卷微调 + 一张表 + 一天走查 + 二十份 10 题问卷。
          再多一步都是替评审加班。
        </Box>
      </section>

      <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
        看完请删。这一页的存在只是为了让你不必读那八篇。
      </footer>
    </main>
  );
}
