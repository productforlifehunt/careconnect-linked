# FUCKING READ ME / 他妈的必读文档

> FUCKING READ ME AND KEEP IN YOUR CONTEXT IF POSSIBLE.  
> 他妈的读这个文档并尽可能保持在你的上下文中。  

> WHEN IN DOUBT, FUCKING READ ME.  
> 有疑问时，他妈的读这个文档。  

> NEVER FUCKING GUESS.  
> 永远不要他妈的猜测。  

> THESE ARE THINGS YOU FREQUENTLY GUESSED WRONG ALMOST EACH AND EVERY TIME.  
> 这些是你几乎每次都猜错的东西。  

> NEVER FUCKING GUESS. FUCKING READ ME!!!  
> 永远不要他妈的猜测。他妈的读这个文档！！！  

> This file is designed as a transferable system prompt to be fully pasted to any AI workspace. Only write in brief bullet point paragraphs!  
> 这个文件被设计为可转移的系统提示，可以完整粘贴到任何AI工作空间。只用简短的要点段落写作！

---

## 1. WHAT IS THIS APP / 这个应用是什么

CareConnected is a caregiving platform that connects care providers (professional caregivers) with families who need care. It also has a second brand called "Challenged" specifically for dementia care. Both brands run from the same codebase — the app detects which brand to show based on the hostname.

CareConnected 是一个护理平台，连接护理提供者（专业护理人员）和需要护理的家庭。它还有一个叫 "Challenged" 的第二品牌，专门用于失智症护理。两个品牌运行在同一套代码上——应用根据域名检测显示哪个品牌。

- **Stack / 技术栈:** React 18, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend / 后端:** An EXTERNAL Supabase project (`yekarqanirdkdckimpna.supabase.co`). All app tables live in the `care_connector` schema. There is also a Lovable Cloud Supabase but we DO NOT USE IT for anything — it's empty and irrelevant.
- **后端补充:** 外部 Supabase 项目（`yekarqanirdkdckimpna.supabase.co`）。所有应用表都在 `care_connector` schema 中。还有一个 Lovable Cloud Supabase，但我们不用它——它是空的，无关紧要。
- **Supabase clients / Supabase 客户端:** `careDb` (data, uses `care_connector` schema) and `careAuth` (auth) — both from `src/integrations/supabase/external-client.ts`. NEVER import from `src/integrations/supabase/client.ts` — that's the unused Lovable Cloud client.
- **Supabase 客户端补充:** `careDb`（数据，使用 `care_connector` schema）和 `careAuth`（认证）——都来自 `src/integrations/supabase/external-client.ts`。永远不要从 `src/integrations/supabase/client.ts` 导入——那是未使用的 Lovable Cloud 客户端。
- **Multi-site / 多站点:** `SiteContext.tsx` with hostname-based detection (`DOMAIN_MAP`). Dev override: `?__site=challenged`. All user-facing text must use `useSite()` hooks — never hardcode brand names. CSS theming via `.site-challenged` class on `<html>`.
- **多站点补充:** `SiteContext.tsx` 基于域名检测（`DOMAIN_MAP`）。开发覆盖：`?__site=challenged`。所有面向用户的文本必须使用 `useSite()` hooks——永远不要硬编码品牌名称。CSS 主题通过 `<html>` 上的 `.site-challenged` 类实现。
- **i18n / 国际化:** 17 languages via `i18next` and `react-i18next`. Translation files in `src/i18n/locales/`. Use `useTranslation()` hook and `t()` function for all strings.
- **国际化补充:** 通过 `i18next` 和 `react-i18next` 支持 17 种语言。翻译文件在 `src/i18n/locales/`。所有字符串使用 `useTranslation()` hook 和 `t()` 函数。
- **Test account / 测试账号:** `guowei.jiang.work@gmail.com` / password: `J4913836j@@@@@`

---

## 2. NEVER DO THESE THINGS / 永远不要做这些事

- **NEVER** import from `src/integrations/supabase/client.ts`. That connects to the WRONG (empty Lovable Cloud) database. Always use `careDb` and `careAuth` from `external-client.ts`.
- **永远不要** 从 `src/integrations/supabase/client.ts` 导入。那连接的是错误的（空的 Lovable Cloud）数据库。始终使用 `external-client.ts` 中的 `careDb` 和 `careAuth`。

- **NEVER** run the `supabase--migration` tool, `supabase--read-query`, `supabase--insert`, or `supabase--analytics-query`. These all target the wrong database. If you need a schema change, tell the developer to run it manually on the external Supabase dashboard.
- **永远不要** 运行 `supabase--migration` 工具、`supabase--read-query`、`supabase--insert` 或 `supabase--analytics-query`。这些都指向错误的数据库。如果需要 schema 更改，告诉开发者在外部 Supabase 控制台手动运行。

- **NEVER** create fallback data, mock data, hardcoded workarounds, or fake anything. If you can't access the DB or need a key, ASK. The app must be 100% real, production-ready CRUD.
- **永远不要** 创建回退数据、模拟数据、硬编码的变通方案或任何假数据。如果你无法访问数据库或需要密钥，问我。应用必须是 100% 真实的、生产就绪的 CRUD。

- **NEVER** hardcode brand names. Always use `useSite()` context for brand-specific labels.
- **永远不要** 硬编码品牌名称。始终使用 `useSite()` 上下文获取品牌特定的标签。

---

## 3. THE PROFILE TABLE — THE SINGLE SOURCE OF TRUTH / Profile 表——唯一的事实来源

The `profile` table is the center of everything. One row per user. It stores personal info, provider settings, and role flags all in one place. There is NO separate "users" table for app data — `profile` IS the user record.

`profile` 表是一切的中心。每个用户一行。它在一个地方存储个人信息、提供者设置和角色标志。没有单独的 "users" 表用于应用数据——`profile` 就是用户记录。

- **Who is a care provider / 谁是护理提供者:** `profile.is_care_provider = true`. That's it. This single boolean is the ONLY way to determine if someone is a care provider (appears in the care marketplace, searchable, bookable). Don't double-check with other fields. Don't guess another way.
- **谁是护理提供者补充:** `profile.is_care_provider = true`。就这样。这个单一布尔值是确定某人是否是护理提供者的唯一方式（出现在护理市场、可搜索、可预约）。不要用其他字段交叉验证。不要猜测其他方式。

- **Is the provider currently active / 提供者当前是否活跃:** `profile.provider_is_active = true` means the provider is currently discoverable in the marketplace. `false` means they've paused — they're still a provider, just not visible for search right now.
- **提供者活跃状态补充:** `profile.provider_is_active = true` 意味着提供者当前在市场中可被发现。`false` 意味着他们暂停了——他们仍然是提供者，只是目前不可被搜索。

- **Provider-specific fields / 提供者特有字段:** `provider_type`, `hourly_rate`, `specialty` (text[]), `service_offered` (text[]), `years_of_experience`, `certification` (text[]), `background_check_status`, `instant_book_enabled`, `rating_average`, `rating_count`, `total_booking_count`, `response_time_minute`, `cancellation_policy`, `service_area` (text[]).
- **提供者特有字段补充:** 这些字段只在用户是提供者时有意义。包括类型、时薪、专长、服务项目、经验年数、证书、背景调查状态、即时预约、评分、预约总数、响应时间、取消政策、服务区域。

- **Cared-one profiles / 被照顾者档案:** Some profiles represent care recipients (e.g., an elderly parent). These are created by a caregiver user. `profile.is_cared_one = true`, and `profile.created_by_user_id` points to the caregiver who created the profile. `profile.relationship_to_creator` describes the relationship (e.g., "mother", "father").
- **被照顾者档案补充:** 一些 profile 代表护理接受者（如年迈的父母）。这些由照顾者用户创建。`profile.is_cared_one = true`，`profile.created_by_user_id` 指向创建该档案的照顾者。`profile.relationship_to_creator` 描述关系（如"母亲"、"父亲"）。

---

## 4. CARE GROUPS — Like a Facebook Group for Caregivers / 护理小组——像照顾者的 Facebook 群组

A Care Group is a collaborative space where multiple people caring for the same patient can coordinate. Think CaringBridge or LotsaHelpingHands. It has posts, tasks, members, and categories.

护理小组是一个协作空间，多个照顾同一患者的人可以在这里协调。类似 CaringBridge 或 LotsaHelpingHands。它有帖子、任务、成员和分类。

### 4a. The `care_group` table / `care_group` 表

- Each group has a `name`, `description`, `created_by` (who created it), and `member_count`.
- 每个组有 `name`、`description`、`created_by`（谁创建的）和 `member_count`。

- **Private vs Public / 私有 vs 公开:** `care_group.is_private = true` means the group requires an invitation to join and is only accessible to members. `is_private = false` means it's public and accessible to all.
- **私有 vs 公开补充:** `care_group.is_private = true` 意味着该组需要邀请才能加入，只有成员可以访问。`is_private = false` 意味着它是公开的，所有人都可以访问。

- Groups can have a `join_code` for easy sharing of private group invitations.
- 组可以有一个 `join_code` 用于方便分享私有组邀请。

### 4b. The `care_group_member` junction table / `care_group_member` 关联表

This table connects users to groups. It links `care_group.id` via `group_id` and `profile.id` via `user_id`.

这个表连接用户和组。通过 `group_id` 链接 `care_group.id`，通过 `user_id` 链接 `profile.id`。

- **Four types of members / 四种成员类型:**
  - `is_owner = true` → the group owner (creator, full control) / 组所有者（创建者，完全控制）
  - `is_admin = true` → an admin (can manage members, posts, etc.) / 管理员（可以管理成员、帖子等）
  - `is_cared_one = true` → a care recipient in the group (the patient) / 组中的被照顾者（患者）
  - If none of the above are true → ordinary member with no special role / 如果以上都不是 → 没有特殊角色的普通成员

- **Invitation status / 邀请状态:** `invitation_status` column with three values: `accepted`, `pending`, `declined`.
- **邀请状态补充:** `invitation_status` 列有三个值：`accepted`（已接受）、`pending`（待处理）、`declined`（已拒绝）。

- **Group display name / 组内显示名称:** `group_display_name` column — the name this member goes by within the group (could differ from their profile name).
- **组内显示名称补充:** `group_display_name` 列——该成员在组内使用的名称（可能与其 profile 名称不同）。

### 4c. Member Categories — Private Sub-groups / 成员分类——私有子组

Each care group can have unlimited **member categories** — think of them as tags or sub-groups used to assign tasks and control content visibility.

每个护理小组可以有无限个**成员分类**——把它们想象成标签或子组，用于分配任务和控制内容可见性。

- **`care_group_member_category` table / 表:** Defines the categories. Linked to `care_group.id` via `group_id`. Each category has a `name`.
- **`care_group_member_category` 表补充:** 定义分类。通过 `group_id` 链接到 `care_group.id`。每个分类有一个 `name`。

- **`care_group_member_assigned_category` junction table / 关联表:** Assigns members to categories. Links to `care_group_member_category.id` via `member_category_id`, and to `care_group_member.id` (NOT directly to user's uuid!) via `care_group_member_id`. We link to the member junction table's ID so we can easily query the member's `group_display_name` from the same join.
- **关联表补充:** 将成员分配到分类。通过 `member_category_id` 链接到 `care_group_member_category.id`，通过 `care_group_member_id` 链接到 `care_group_member.id`（不是直接链接到用户的 uuid！）。我们链接到成员关联表的 ID，这样可以从同一个 join 中轻松查询成员的 `group_display_name`。

- **Content visibility / 内容可见性:** Posts (`care_group_post`) and tasks (`care_task`) have a `visible_to_member_category_id` array column that stores category IDs. If this array has values, only members in those categories can see the content. If empty/null, everyone can see it.
- **内容可见性补充:** 帖子（`care_group_post`）和任务（`care_task`）有一个 `visible_to_member_category_id` 数组列，存储分类 ID。如果数组有值，只有这些分类中的成员可以看到内容。如果为空/null，所有人都可以看到。

---

## 5. CARE GROUP POSTS — The Group's Activity Feed / 护理小组帖子——小组的活动信息流

All group posts live in the `care_group_post` table. The `type` column determines what kind of post it is:

所有组帖子都在 `care_group_post` 表中。`type` 列决定帖子的类型：

- `type = 'announcement'` → Group announcement (pinnable, important notices) / 组公告（可置顶，重要通知）
- `type = 'wish'` → Wish post (birthday wishes, get-well messages, etc.) / 祝福帖（生日祝福、康复祝愿等）
- `type = 'discussion'` → General discussion thread / 一般讨论帖

- Each post has: `group_id`, `author_id`, `title`, `content`, `is_draft`, `is_pinned`, `scheduled_at`, `wish_message_type`.
- 每个帖子有：`group_id`、`author_id`、`title`、`content`、`is_draft`、`is_pinned`、`scheduled_at`、`wish_message_type`。

- **IMPORTANT:** Care tasks do NOT use this table. Tasks have their own standalone `care_task` table (see next section).
- **重要:** 护理任务不使用这个表。任务有自己独立的 `care_task` 表（见下一节）。

---

## 6. CARE TASKS — Standalone Task System / 护理任务——独立的任务系统

Tasks are stored in the `care_task` table. They are NOT posts. They are NOT stored in `care_group_post`.

任务存储在 `care_task` 表中。它们不是帖子。它们不存储在 `care_group_post` 中。

- Each task has: `group_id` (optional — tasks can exist without a group), `created_by`, `assigned_to`, `care_recipient_id`, `title`, `description`, `status`, `priority`, `category`, `due_date`.
- 每个任务有：`group_id`（可选——任务可以不属于任何组）、`created_by`、`assigned_to`、`care_recipient_id`、`title`、`description`、`status`、`priority`、`category`、`due_date`。

- Tasks also have `visible_to_member_category_id` (text[]) for category-based visibility control, same as posts.
- 任务也有 `visible_to_member_category_id`（text[]）用于基于分类的可见性控制，与帖子相同。

---

## 7. BOOKINGS / 预约

The `booking` table stores care service appointments between a client and a provider.

`booking` 表存储客户和提供者之间的护理服务预约。

- `user_id` = the client who booked / 预约的客户
- `provider_id` = the care provider / 护理提供者
- `care_recipient_id` = the person receiving care (could be different from the client, e.g., the client's parent) / 接受护理的人（可能与客户不同，如客户的父母）
- `status` = booking status (e.g., pending, confirmed, completed, cancelled) / 预约状态
- `payment_status`, `payment_intent_id` = Stripe payment tracking / Stripe 支付追踪
- Includes scheduling fields: `start_time`, `end_time`, `appointment_date`, `appointment_time`, `duration_hour`
- 包含调度字段：`start_time`、`end_time`、`appointment_date`、`appointment_time`、`duration_hour`

---

## 8. MESSAGING / 消息

Two tables work together for the messaging system:

两个表配合实现消息系统：

- **`conversation` table / 表:** Represents a 1-on-1 conversation between two users. Has `participant_1_id`, `participant_2_id`, and `last_message_at`. One row per unique pair of users.
- **`conversation` 表补充:** 代表两个用户之间的一对一对话。有 `participant_1_id`、`participant_2_id` 和 `last_message_at`。每对唯一用户一行。

- **`direct_message` table / 表:** Individual messages. `sender_id`, `receiver_id` (for DMs), `group_id` (for group messages), `message_content`, `attachment_url`, `message_type`, `read_at`, `reply_to_id`.
- **`direct_message` 表补充:** 单条消息。`sender_id`、`receiver_id`（用于私信）、`group_id`（用于群组消息）、`message_content`、`attachment_url`、`message_type`、`read_at`、`reply_to_id`。

---

## 9. REVIEWS / 评价

The `review` table stores ratings and comments. `entity_id` is the provider being reviewed, `reviewer_id` is who wrote the review.

`review` 表存储评分和评论。`entity_id` 是被评价的提供者，`reviewer_id` 是撰写评价的人。

- `rating` (1-5), `comment`, `response_text` (provider's reply to the review).
- `rating`（1-5）、`comment`（评论）、`response_text`（提供者对评价的回复）。

---

## 10. OTHER TABLES IN USE / 其他使用中的表

- **`notification` / 通知:** Push/in-app notifications per user. `user_id`, `type`, `title`, `content`, `link_url`, `is_read`.
- **`notification` 补充:** 每个用户的推送/应用内通知。`user_id`、`type`、`title`、`content`、`link_url`、`is_read`。

- **`saved_provider` / 收藏的提供者:** Users can save/favorite providers. `user_id` + `provider_id` junction.
- **`saved_provider` 补充:** 用户可以收藏提供者。`user_id` + `provider_id` 关联。

- **`location_share` / 位置分享:** GPS tracking feature. `user_id`, `latitude`, `longitude`, `address`, `is_sharing`.
- **`location_share` 补充:** GPS 追踪功能。`user_id`、`latitude`、`longitude`、`address`、`is_sharing`。

- **`service_category` / 服务分类:** Lookup table for care service types. `name`, `description`, `icon`.
- **`service_category` 补充:** 护理服务类型的查找表。`name`、`description`、`icon`。

---

## 11. LOGGING TABLES / 日志表

The app uses several logging tables for tracking care activities. All of these use `recorded_by` to store the ID of the person who recorded the entry, EXCEPT `activity_log` which uses `user_id`.

应用使用多个日志表来追踪护理活动。所有这些表都使用 `recorded_by` 来存储记录条目的人的 ID，除了 `activity_log` 使用 `user_id`。

- `medicine_log` — medication tracking / 用药追踪
- `checkin_log` — care check-ins / 护理签到
- `activity_log` — general activity logging (uses `user_id` not `recorded_by`) / 一般活动日志（使用 `user_id` 而不是 `recorded_by`）

Note: `checkin_log` lacks a native foreign key for `recorded_by`, so application logic must manually map reporter profiles when joining.

注意：`checkin_log` 的 `recorded_by` 缺少原生外键，因此应用逻辑在 join 时必须手动映射记录者的 profile。

---

## 12. SITE CONTEXT — MULTI-BRAND ARCHITECTURE / 站点上下文——多品牌架构

The app serves two brands from one codebase:

应用从一套代码库服务两个品牌：

- **CareConnected** (default) — general caregiving platform / 通用护理平台
- **Challenged** — dementia-focused variant with specialized components / 专注失智症的变体，有专门的组件

Key config fields in SiteContext: `caredOneSingular`, `careGroupSingular`, `contactEmail`, `brandSlug`.

SiteContext 中的关键配置字段：`caredOneSingular`、`careGroupSingular`、`contactEmail`、`brandSlug`。

- Site detection: hostname-based via `DOMAIN_MAP` in `SiteContext.tsx`
- 站点检测：基于域名，通过 `SiteContext.tsx` 中的 `DOMAIN_MAP`
- Dev override: add `?__site=challenged` to any URL
- 开发覆盖：在任何 URL 后添加 `?__site=challenged`
- Challenged-specific components live in `src/components/challenged/`
- Challenged 专属组件在 `src/components/challenged/` 中
- CSS theming: `.site-challenged` class is applied to `<html>` element
- CSS 主题：`.site-challenged` 类应用于 `<html>` 元素

---

## 13. KEY ARCHITECTURAL RULES / 关键架构规则

- **All data lives in `care_connector` schema.** Not `public`. Not any other schema.
- **所有数据都在 `care_connector` schema 中。** 不是 `public`。不是任何其他 schema。

- **`careDb` for data, `careAuth` for auth.** Both from `src/integrations/supabase/external-client.ts`. No exceptions.
- **`careDb` 用于数据，`careAuth` 用于认证。** 都来自 `src/integrations/supabase/external-client.ts`。没有例外。

- **No migrations from Lovable.** The migration tool targets the wrong database. Schema changes must be communicated to the developer to run manually.
- **不要从 Lovable 运行迁移。** 迁移工具指向错误的数据库。Schema 更改必须告知开发者手动运行。

- **No mocks, no fallbacks, no hardcoded data.** If something doesn't work, ask for access or credentials. Never fake it.
- **没有模拟、没有回退、没有硬编码数据。** 如果某些东西不工作，请求访问权限或凭据。永远不要伪造。

- **Standard timestamps:** All tables use `created_at` and `updated_at`.
- **标准时间戳:** 所有表使用 `created_at` 和 `updated_at`。

- **Performer tracking in mutations:** Always explicitly pass the current user's ID to `recorded_by` (or `user_id` for `activity_log`) columns. Never rely on database defaults for this.
- **变更中的执行者追踪:** 始终显式地将当前用户的 ID 传递给 `recorded_by`（或 `activity_log` 的 `user_id`）列。永远不要依赖数据库默认值。
