# 统一 NotchSafety 首页并核准五个知识专题

## 实施内容
- 让 NotchSafety 的 `/` 直接使用与 ChallengeD、CareCNC 相同的首页文件与版式，不再维护独立首页。
- 在共享首页内按站点配置内容：NotchSafety 只显示家庭定位、地点提醒、SOS、圈子与登录注册；隐藏护理者搜索、护理者推荐、护理任务及其他不相关入口。
- 保留 NotchSafety 现有独立功能页面和导航，只替换公开首页。
- 删除不再使用的 NotchSafety 独立首页文件，避免以后两套首页继续分叉。

## 五个知识专题核准
- 核对 AwareD、CareD、CopeD、SafeD、AccompanieD 的文章数量、正文来源、标题锚点及学习笔记关系。
- 输出一份基于当前代码与现有 CCT/REL 的新版总结，明确哪些在前端、哪些在 WordPress、哪些只是关联锚点。

## 验证
- 检查 ChallengeD、CareCNC、NotchSafety 三个首页，确认共享版式没有把护理者内容带入 NotchSafety。
- 检查中英文及手机/桌面宽度、页面链接、运行错误和构建结果。
