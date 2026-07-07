# Notch Note — Notion 1:1 复刻计划

## 一、前端定位

- 新建独立子应用 `notch-note`，与 CareCNC / ChallengeD 平级
- 独立登录（走 WordPress Simple JWT Login，走 careconnected 子站）
- 独立域名/子路径（先用 `/notch` 前缀开发，之后独立部署）
- 完全独立的路由树、独立 header/sidebar，不共用 CareCNC 或 ChallengeD 的任何组件外壳
- UI 1:1 对标 Notion：左侧可折叠 workspace sidebar、顶部面包屑、中间无边框编辑器、右上分享/评论/…菜单、斜杠命令菜单、hover 拖拽把手、`/turn into` 转换菜单

## 二、后端：WordPress JetEngine CCT（90 岁老奶奶 GUI 模式）

严格镜像 Notion 官方 API 文档 + Teton-Landis 2021 博客里公开的字段命名。**所有 CCT 通过 JetEngine 后台 GUI 手动建，所有 relation 通过 JetEngine Relations GUI 建，0 行 SQL，0 个自定义 FK。**

### CCT 列表（Notion 命名 100% 对齐）

| # | CCT slug | 对应 Notion 概念 | 关键字段（全部 GUI 建） |
|---|---|---|---|
| 1 | `nn_workspace` | Workspace | name, icon, domain, plan_type, created_time |
| 2 | `nn_block` | Block（一切的核心，页面/文本/待办/图片/database 都是 block） | type (enum: page / database / child_page / child_database / paragraph / heading_1 / heading_2 / heading_3 / bulleted_list_item / numbered_list_item / to_do / toggle / quote / callout / divider / code / image / video / file / bookmark / embed / equation / table / table_row / column / column_list / synced_block / template / breadcrumb / table_of_contents), properties (JSON), content_order (JSON array of child block ids), plain_text, icon, cover, archived, in_trash, created_time, last_edited_time |
| 3 | `nn_page_property_schema` | Database schema | name, type (title/rich_text/number/select/multi_select/status/date/people/files/checkbox/url/email/phone_number/formula/relation/rollup/created_time/created_by/last_edited_time/last_edited_by/unique_id), config (JSON: options / format / formula expr / relation target) |
| 4 | `nn_page_property_value` | Row 的每个属性值 | value (JSON — 按 type 存不同结构) |
| 5 | `nn_view` | Database 视图 | type (table/board/list/gallery/calendar/timeline), name, filter (JSON), sort (JSON), group_by, visible_properties (JSON), page_size |
| 6 | `nn_comment` | 块级评论 | rich_text, resolved, discussion_id |
| 7 | `nn_permission` | 权限 | role (owner/editor/commenter/reader), scope_type (workspace/page/block) |
| 8 | `nn_template` | 模板 | name, icon, category, block_tree_snapshot (JSON), is_public, install_count |
| 9 | `nn_favorite` | 侧栏收藏 | position |
| 10 | `nn_activity_log` | 编辑历史 | action_type, snapshot (JSON) |

### JetEngine Relations（全部 GUI 建，禁止自定义 FK）

- Rel: workspace → block（parent，1-to-many）
- Rel: block → block（parent_id，1-to-many，Notion 的 tree）
- Rel: user → workspace（membership，many-to-many）
- Rel: user → block（created_by / last_edited_by，两条独立 relation）
- Rel: block(database) → page_property_schema（1-to-many）
- Rel: block(row) → page_property_value（1-to-many）
- Rel: page_property_value → page_property_schema（many-to-1）
- Rel: block(database) → view（1-to-many）
- Rel: block → comment（1-to-many）
- Rel: user → favorite → block
- Rel: user → template（作者）

## 三、前端功能范围（第一阶段 = 可用的 Notion）

以下全部覆盖，1:1 对齐 Notion：

1. **认证**：邮箱注册/登录/忘记密码（Simple JWT Login）
2. **Workspace 与 Sidebar**：workspace 切换、页面树无限嵌套、拖拽排序、收藏区、`Private` / `Shared` / `Teamspaces` 分区、垃圾桶、模板入口、设置
3. **页面**：图标（emoji / 上传 / 随机 gallery）、封面、标题、面包屑、全宽切换、小字体切换、锁定
4. **块编辑器**：斜杠命令、hover `+` 与 `⋮⋮` 把手、拖拽重排、`Turn into`、复制/剪切/粘贴、复制链接、颜色、注释、AI（预留占位）
5. **块类型**：文本、H1/H2/H3、待办、bulleted/numbered/toggle 列表、quote、callout、divider、code（带语言选择+复制）、image、video、file、bookmark（unfurl）、embed、equation、table、column（分栏拖拽）、synced block、template button、breadcrumb、TOC
6. **Database**：inline 与 full-page 两种；Table / Board / List / Gallery / Calendar / Timeline 六种视图；property 全 22 种类型；filter / sort / group / hidden；每行可作为 subpage 打开
7. **分享**：workspace 内成员+角色、公开发布链接、复制页面为模板
8. **评论**：块级评论、页面评论、@提及、resolve
9. **搜索**：全站搜索（先走 WP REST `search` + CCT meta 查询）
10. **快捷键**：`Cmd+P` 搜索、`Cmd+/` 命令菜单、`Cmd+\` 折叠侧栏、`Cmd+Shift+N` 新页面 …
11. **样式**：Notion 默认字体栈（-apple-system / Segoe UI / Helvetica / …）、Notion 灰阶色板、hover 高亮、圆角、密度

## 四、执行顺序

1. 用 browser automation 登录 `app.challenged-dementia.com/careconnected` wp-admin，在 JetEngine → CCT 90 模式手动建上面 10 个 CCT，再去 JetEngine → Relations 建全部 relation。每建完一个立刻截图肉眼校验。
2. 在当前项目里以 `/notch/*` 路由做前端骨架（sidebar + 空白页面 + block 编辑器 MVP），走独立 AuthContext（`NotchAuthContext`）与独立 wp-client 命名空间，确保和 CareCNC/ChallengeD 完全隔离。
3. 分批实现块类型 → database → 视图 → 分享 → 评论 → 搜索。
4. 可用后再谈迁移到独立前端仓库/独立域名。

## 五、技术要点（给能看懂的读者）

- 块树用 `nn_block.parent_id` (relation) + `content_order` (JSON array of child ids) 双写，读时按 order 数组还原，Notion 就是这么做的
- `properties` 全部塞进 block 的 JSON meta，不为每种块建列，和 Notion 一致
- Database row 特殊：row 本身是一个 `type=child_page` 的 block，它的 property values 走 `nn_page_property_value` 表（因为要 filter/sort，需要真正的列可查）
- 编辑器：直接引入 [BlockNote](https://www.blocknotejs.org/) 或 TipTap + 自定义 Notion 皮肤（TipTap 更贴 Notion 行为）
- 无实时协作 v1（Notion 也不是一开始就有），先做单人编辑 + 保存去抖 300ms
- 全站 API 走 wp-proxy Edge Function（沿用现有的 HTTPS→HTTP 桥）

## 六、明确不做（第一阶段）

- 实时多人光标（v2）
- Notion AI（v2，届时走 Lovable AI Gateway）
- 移动 app（v3，Capacitor 打包）
- Notion Calendar 集成
- API/webhook 开放平台

---

**请确认这个范围与 CCT 表结构**。批准后我立刻：
1. 启动 browser automation 进 wp-admin 用 GUI 90 模式建全部 10 个 CCT + 全部 relations（会花很久，全程截图）
2. 建完后启动 `/notch` 前端骨架
