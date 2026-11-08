# Draftbit 全量复刻核查清单

依据：原代码静态核查及 Draftbit GUI；没有扫描原 App。页面存在不代表功能已完成。当前 Draftbit 26 个页面（原24页加 HowItWorks、TrustSafety）；不以页面数量计算完成率。

## 页面缺项（别名不重复建页）
- [ ] Onboarding：引导与角色选择。
- [ ] ResetPassword：恢复状态、密码确认、错误与提交。
- [ ] Articles + ArticlePost：文章列表与详情。
- [ ] AccompanieD、AwareD、CareD、CopeD、SafeD：五个内容列表，共用 ChallengedArticleDetail。
- [ ] TrustSafety：原英文统计及七项安全/反馈正文、共用页头和返回已保存回读；分项卡片、图标、联系按钮、双语和真实运行未完成。
- [ ] 搜索细分、CaregiverProfile、CareFacilityProfile、CareFacilityForm 新建/编辑、BecomeCaregiver、Favorites、ProviderDashboard。
- [ ] TasksNeedingHelp（不是被护理者 Tasks）。
- [ ] Cart、OrderConfirmation；结账与订单操作按现有 Woo/Dokan 实现。
- [ ] 信息卡分享、SharedStudyNote、DeleteAfterRead、XianyuListings。
- [ ] LocationCard 与 NotchSafety 地图/区域页面。
- [ ] ESM：Today、Screening、LogEntry、HourlyLog、DailyLog、Entries、Help、Me。
- [ ] Researcher：登录、参与者、问卷、访谈及全部录音/档案操作。
- [ ] Consent 单页与 Sick 单图片微站。
- [ ] HowItWorks：原文、共用页头、Find CTA和独立 More 入口已保存并回读；Web/iOS预览截图有正文；实际按钮点按、双语及完整布局未完成。

## 已有页面中的功能缺项
- [ ] Meds/Checks：保存后刷新已配置回读；签到新增时间选择器、a57/a58一致格式及每日a66已保存回读。多时段、复发选择、按次记录、编辑时间回填、提醒、失败状态和实际读写仍未完成；CCT187 a57/a58/a66/a68/a69；CCT161 a88，REL190/191/173，不使用 a90。
- [ ] Tasks：详情、可留空日期时间、时间回填、删除后自动刷新、真实新增/编辑/删除/状态读回。
- [ ] Contacts/Cards/Docs/Tips/Notes/Plan：六页保存后刷新已配置并逐页回读；联系人详情a56、地址a58、备注a60与各自空隐藏条件严格核验通过。真实表单/CRUD/确认/刷新仍未验证，运行画面Updating时新增表单未出现；不可把配置回读当实际写入验证。
- [ ] Groups：唯一群首页加入流程；申请/邀请/接受/拒绝/退出/角色/管理/隐私/深链。
- [ ] Groups 内容：REL226→CCT202 按当前群组读取已保存回读，标题a56/正文a57已绑定，复制来的社区跳转和联系人写入已移除；两层轮询0。群组专用Get Group Post已GUI测试200并接入，刷新后schema错误消失，共用Get Row未改。真实群组内容未验证。发布与关联动作均暂停，未实际写入；定时/受众过滤、提交后刷新未完成。
- [ ] Groups 14 部分：Home、Calendar、Tasks、Location、Messages、Announcements、Wishes、Gallery、Cared ones、Members、Invite members、Member groups、Settings、Help。
- [ ] Calendar：月/周、日期筛选、邀请、日程 CRUD 与复发。
- [ ] Inbox：本人会话、成员解析、发消息、回复、读标记、通知与群/预约聊天；REL137/138/139。
- [ ] Community/Post：评论、投票 REL166/167、本人帖子、编辑删除、搜索分页与错误。
- [ ] Settings：Personal、Display、Notifications、Privacy；头像、资料、社区名字、角色、护理关系、数据导出、注销账户。
- [ ] Assistant：共用 AssistantFabs（23页使用）原生Modal、打开/发送/回复/X关闭已实测；2026-11-07 两个入口纯空格均不发AI请求、成功响应后输入清空已实测，悬浮窗回复hello截图已检查。当前仍是单问单答，不是完整聊天。完整缺项见下方逐项清单；Web Preview间歇Updating仍未解决。
- [ ] 全部AI：任务写入助手、信息卡AI、首页简报、语音输入/朗读、群组上下文、亲友声音、研究员核对/冲突/全站分析；已按原代码盘点，不以通用聊天替代这些独立流程。
- [ ] Voices：授权服务接线、录音、原始样本、复刻/重新复刻、试听、文字/语音输入、删除、按人隔离；CCT322/REL323。现有 public wrapper 仅 list/speak，不能假定支持录音创建。
- [ ] Bookings/电商：非空订单、状态、取消/退款/评价/消息；服务商请求/日程/可用时间/价格/结算，全部遵循 Woo/Dokan。
- [ ] Resources：五模块23课、学习笔记及每条交互。
- [ ] 全局：七 site 身份、品牌隔离、中英全量、会话恢复/刷新/失效、返回路径、姓名优先级、真实待处理计数与正确跳转。
- [ ] 真机：麦克风、定位、推送、分享、权限拒绝；前台运行限制如实保留。
- [ ] 隐私授权：每个真实读写流程单独核验，不照搬原代码已知权限漏洞。

## 代码依据
- src/routes 与 src/lib/path-routes.tsx、src/lib/router-compat.tsx：页面及别名。
- src/pages/CaredOnes.tsx:39-73：11个护理工具。
- src/pages/CareCircle.tsx:351-386：14个群组部分。
- src/pages/Profile.tsx:95-176：设置操作与标签。
- src/pages/safety/SafetyApp.tsx:40-85；src/pages/esm/EsmApp.tsx:31-44：独立子站。
- src/features/medicine/source.medicine.ts；src/features/esm/backend.ts；src/features/family-voices/schema.ts：字典合同。
- src/services/woocommerce-api.ts；src/features/conversations/source.wordpress.ts：电商与聊天。

所有条目保持未勾选直到对应功能完成并具备明确验证证据；仅配置/仅渲染/真实持久化/权限/真机分开记录。

## AI 对话完整功能逐项验收（2026-11-07 源码核对）
依据：AICompanionChatDialog、AICompanionChat、ai-threads、ai-dynamic-knowledge、AIAssistantContext、lib/ai；仅读原代码，没有浏览原App。
- [x] 共用机器人入口、弹窗发送/回复/关闭：已有运行截图；不代表其余功能已完成。
- [x] 空白保护：Assistant/AssistantFabs 的条件均使用 Trim；两入口输入三个空格实际产生0个AI请求。
- [x] 成功响应后清空输入：两入口实际输入值为空；悬浮窗仍显示hello。当前在响应后清空，原版是在开始发送时清空，两者时机尚不相同。
- [ ] 一个共用聊天主体同时服务独立页及悬浮窗，不能维护两套聊天逻辑。
- [ ] 原版移动端/桌面弹窗尺寸、页头所有对话/新建/X，底部输入及可滚动消息区。
- [ ] 有序完整用户/助手消息列表、角色样式、Markdown、Thinking、滚动到底部。
- [ ] 多轮请求包含先前用户与助手消息，不只发送当前问题；原版模型上下文10000字符但不截断保存历史。
- [ ] 流式显示、并发发送保护、关闭取消生成及播放/录音、错误反馈。
- [ ] 原版Enter提交和输入法组合行为；Stop按钮原版禁用缺陷不能冒称正常。
- [ ] 会话启动：读取列表→恢复有效上次会话→最新会话→首个新会话，启动读完再挂载。
- [ ] 所有对话列表、当前选择、空状态、切换后读回对应消息。
- [ ] 新建会话及创建中禁用、失败不丢当前对话。
- [ ] 会话改名、非空trim、Enter保存/Escape取消、刷新读回。
- [ ] CCT121 AI会话+REL137本人归属，CCT126消息+REL138；按当前site过滤及活动时间排序。
- [ ] 真实保存用户消息、助手消息和会话更新时间；首条问题40字符自动标题。
- [ ] 会话/消息服务端本人权限、跨账号拒绝、退出清缓存、刷新持久性；不得只凭列表过滤认为授权正确。
- [ ] 历史加载和保存错误可见；加载期间新消息不被旧历史覆盖。
- [ ] 启动请求的标题、starterPrompt、fallback、scope和任务/帮助无存档模式。
- [ ] 每个问题按关键词取contextPrompt，人员/群组/本人资料读取遵守现有REL授权。
- [ ] 公共信息卡只读取卡片明确允许信息，无本人资料越权；卡片内独立380px聊天区。
- [ ] 四模式 Text/Read aloud/Live talk/Family call，选择状态、保存及旧设置迁移。
- [ ] 每条助手消息Listen/Stop及自动朗读；标准语音和分句音频队列。
- [ ] 按住麦克风、松开/移出结束、权限拒绝、转录中保护和可见错误。
- [ ] 16kHz单声道WAV及真实转录；文字模式回填可编辑，live/call识别后发送。
- [ ] 模拟亲友来电明确非真实通话；声音选择、称呼、角色设定及保存。
- [ ] 只列当前人员授权ready声音；原录音/复刻型号不改；真实speak合成播放及错误。
- [ ] 默认声音走标准实时语音；亲友声音生成完整文本后合成，1900字符边界。
- [ ] 问号帮助为同聊天无存档模式；初始4题、Show more/less，点题即时插入固定问答且0AI请求。原版不是逐条答案accordion。
- [ ] 隐藏帮助确认及设置恢复，不隐藏机器人；保存成功/失败反馈。
- [ ] 任务开场、done/summary/status验证，Skip和Finish & save，1500字符摘要边界。
- [ ] 仅record-medicine-dose、record-check-in、save-care-tip授权技能写入并刷新，不允许任意AI数据写入。
- [ ] 中英全部标签/问答/错误/上下文及当前site AI品牌，不增加原版没有的对话语言选择器。
- [ ] 真机麦克风、音频、长按、后台关闭；仅Web测试不可勾选。
- [ ] 其他独立AI：首页简报、群组上下文、信息卡、亲友声音、研究员核对/冲突/全站分析逐个完成。

准备状态：AI_MESSAGES=[]、AI_BUSY=false已通过GUI保存为App变量；尚未接线，不是多轮实现。试验用消息追加动作已删除，未保留错误或未配置动作。没有修改原App、WordPress笔记正文、a59绑定或REL325。

2026-11-08：GUI新建 AIChatBody；Assistant 与 AssistantFabs 改用此同一Block，悬浮窗保留独立X关闭键。AI_INPUT/AI_REPLY共享空字符串变量已保存。刷新后4项具体配置断言通过：请求AI_INPUT、条件Trim、回复response.reply→AI_REPLY、输入/回复展示绑定。共用主体已在Web出现，但实际发送仍停在Updating、输入未清空，随后运行iframe卸载；不能沿用旧版发送通过结论。多轮追加试验已删除，无实际多轮/语音/任务/持久化新增完成项。