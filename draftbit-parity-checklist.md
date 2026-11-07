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
- [ ] Groups 14 部分：Home、Calendar、Tasks、Location、Messages、Announcements、Wishes、Gallery、Cared ones、Members、Invite members、Member groups、Settings、Help。
- [ ] Calendar：月/周、日期筛选、邀请、日程 CRUD 与复发。
- [ ] Inbox：本人会话、成员解析、发消息、回复、读标记、通知与群/预约聊天；REL137/138/139。
- [ ] Community/Post：评论、投票 REL166/167、本人帖子、编辑删除、搜索分页与错误。
- [ ] Settings：Personal、Display、Notifications、Privacy；头像、资料、社区名字、角色、护理关系、数据导出、注销账户。
- [ ] Assistant：历史、多轮、共享帮助逐条展开/收起、语言和隐藏设置。
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