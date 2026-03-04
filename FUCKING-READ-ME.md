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

- **Personal info fields / 个人信息字段:** `full_name`, `first_name`, `last_name`, `user_name`, `email`, `phone_number`, `avatar_url`, `bio`, `location`, `address`, `address_latitude`, `address_longitude`, `timezone`, `currency`.
- **个人信息字段补充:** 基本用户资料，包括姓名、用户名、邮箱、电话、头像、简介、位置（文本描述）、完整地址、经纬度、时区、货币。

- **Notification preferences / 通知偏好:** `email_notification`, `push_notification`, `quiet_hour_start`, `quiet_hour_end`.
- **通知偏好补充:** 邮件通知开关、推送通知开关、免打扰开始时间、结束时间。

- **User-to-cared-one relationship / 用户与被照顾者的关系:** The `user_cared_one` junction table links a user to their cared-one profiles. `user_id` = the caregiver, `cared_one_id` = the cared-one profile, `relationship` = text description, `is_primary` = boolean for primary cared one.
- **用户与被照顾者关系补充:** `user_cared_one` 关联表将用户链接到他们的被照顾者档案。`user_id` = 照顾者，`cared_one_id` = 被照顾者档案，`relationship` = 文字描述，`is_primary` = 是否为主要被照顾者。

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

- **Invitations / 邀请:** The `care_group_invitation` table handles email-based invitations. It has `care_group_id`, `invited_by_user_id`, `invitee_email`, and `status` (pending/accepted/declined). This is separate from the member table — an invitation creates a row here first, and only becomes a member row upon acceptance.
- **邀请补充:** `care_group_invitation` 表处理基于邮箱的邀请。有 `care_group_id`、`invited_by_user_id`、`invitee_email` 和 `status`（pending/accepted/declined）。这与成员表分开——邀请先在这里创建一行，接受后才变成成员行。

### 4c. Member Categories — Private Sub-groups / 成员分类——私有子组

Each care group can have unlimited **member categories** — think of them as tags or sub-groups used to assign tasks and control content visibility.

每个护理小组可以有无限个**成员分类**——把它们想象成标签或子组，用于分配任务和控制内容可见性。

- **`care_group_member_category` table / 表:** Defines the categories. Linked to `care_group.id` via `group_id`. Each category has a `name`, optional `description`, and optional `color`. Created by a user via `created_by`.
- **`care_group_member_category` 表补充:** 定义分类。通过 `group_id` 链接到 `care_group.id`。每个分类有 `name`，可选 `description` 和 `color`。通过 `created_by` 记录创建者。

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

### 5a. Care Group Gallery / 护理小组相册

- The `care_group_gallery` table stores photos/media shared within a group. Each item has `group_id`, `uploaded_by`, file URL, and caption.
- `care_group_gallery` 表存储组内分享的照片/媒体。每个项目有 `group_id`、`uploaded_by`、文件 URL 和标题。

---

## 6. CARE TASKS — Standalone Task System / 护理任务——独立的任务系统

Tasks are stored in the `care_task` table. They are NOT posts. They are NOT stored in `care_group_post`.

任务存储在 `care_task` 表中。它们不是帖子。它们不存储在 `care_group_post` 中。

- Each task has: `group_id` (optional — tasks can exist without a group), `created_by`, `assigned_to`, `care_recipient_id`, `title`, `description`, `status`, `priority`, `category`, `due_date`, `completed_at`.
- 每个任务有：`group_id`（可选——任务可以不属于任何组）、`created_by`、`assigned_to`、`care_recipient_id`、`title`、`description`、`status`、`priority`、`category`、`due_date`、`completed_at`。

- Tasks also have `visible_to_member_category_id` (text[]) for category-based visibility control, same as posts.
- 任务也有 `visible_to_member_category_id`（text[]）用于基于分类的可见性控制，与帖子相同。

- Tasks can be promoted to the Job Board via the `job_id` field linking to `job_posting`. When a family needs outside help for a task, they use the "Find Help" bridge to create a job posting.
- 任务可以通过 `job_id` 字段链接到 `job_posting` 推广到工作板。当家庭需要外部帮助完成任务时，他们使用"寻找帮助"桥接创建工作发布。

---

## 7. CARE MARKETPLACE — Find & Book Providers / 护理市场——寻找和预约提供者

The marketplace is the core feature for searching and booking care providers. It reads from the `profile` table filtering `is_care_provider = true` and `provider_is_active = true`.

护理市场是搜索和预约护理提供者的核心功能。它从 `profile` 表中读取，过滤 `is_care_provider = true` 和 `provider_is_active = true`。

- **Search filters / 搜索过滤:** By name/bio text, location (string match), specialties (array overlap), hourly rate range, verified-only (background check), minimum rating. Sort by rating, price, experience, or review count.
- **搜索过滤补充:** 按姓名/简介文本、位置（字符串匹配）、专长（数组重叠）、时薪范围、仅已验证（背景调查）、最低评分。按评分、价格、经验或评论数排序。

- **Provider profile page / 提供者详情页:** Route `/caregiver/:id`. Shows full profile, reviews, and booking form. Reviews are fetched from the `review` table.
- **提供者详情页补充:** 路由 `/caregiver/:id`。显示完整资料、评价和预约表单。评价从 `review` 表获取。

- **Become a provider / 成为提供者:** Route `/become-caregiver`. A form that updates `profile` with `is_care_provider = true` (initially `provider_is_active = false`), plus provider fields like specialty, rate, experience, etc.
- **成为提供者补充:** 路由 `/become-caregiver`。一个表单，将 `profile` 更新为 `is_care_provider = true`（初始 `provider_is_active = false`），加上专长、费率、经验等提供者字段。

---

## 8. BOOKINGS / 预约

The `booking` table stores care service appointments between a client and a provider.

`booking` 表存储客户和提供者之间的护理服务预约。

- `user_id` = the client who booked / 预约的客户
- `provider_id` = the care provider / 护理提供者
- `care_recipient_id` = the person receiving care (could be different from the client, e.g., the client's parent) / 接受护理的人（可能与客户不同，如客户的父母）
- `status` = booking status: pending → confirmed → completed (or cancelled) / 预约状态：pending → confirmed → completed（或 cancelled）
- `payment_status`, `payment_intent_id` = Stripe payment tracking / Stripe 支付追踪
- Scheduling fields: `start_time`, `end_time`, `appointment_date`, `appointment_time`, `duration_hour`, `service_type`, `hourly_rate`, `total_cost`, `location`, `special_instruction`.
- 调度字段：开始时间、结束时间、预约日期、预约时间、时长（小时）、服务类型、时薪、总费用、地点、特殊说明。

- **Permission rules / 权限规则:** Clients can only Cancel. Providers can Confirm and Complete. Rescheduling resets status to pending.
- **权限规则补充:** 客户只能取消。提供者可以确认和完成。重新安排会将状态重置为 pending。

---

## 9. PROVIDER DASHBOARD / 提供者仪表板

Route `/provider-dashboard`. Only visible to users with `is_care_provider = true`. Provides a central hub for care providers to manage their business.

路由 `/provider-dashboard`。仅对 `is_care_provider = true` 的用户可见。为护理提供者提供管理业务的中心枢纽。

- **Incoming booking requests / 收到的预约请求:** Uses `useProviderBookings()` which queries bookings where the current user is `provider_id`. Provider can confirm or complete bookings.
- **收到的预约请求补充:** 使用 `useProviderBookings()` 查询当前用户是 `provider_id` 的预约。提供者可以确认或完成预约。

- **Availability management / 可用性管理:** Two tables: `provider_availability` (weekly recurring slots with `day_of_week`, `start_time`, `end_time`, `is_available`, and optional `specific_date` for overrides) and `provider_availability_setting` (general settings like buffer time, advance booking limits).
- **可用性管理补充:** 两个表：`provider_availability`（每周循环时段，有 `day_of_week`、`start_time`、`end_time`、`is_available`，和可选的 `specific_date` 用于覆盖）和 `provider_availability_setting`（通用设置如缓冲时间、提前预约限制）。

- **Earnings / 收入:** `provider_payout` table tracks provider payments. Queried by `provider_id`.
- **收入补充:** `provider_payout` 表追踪提供者的支付记录。通过 `provider_id` 查询。

---

## 10. MESSAGING / 消息

Two tables work together for the messaging system:

两个表配合实现消息系统：

- **`conversation` table / 表:** Represents a 1-on-1 conversation between two users. Has `participant_1_id`, `participant_2_id`, and `last_message_at`. One row per unique pair of users.
- **`conversation` 表补充:** 代表两个用户之间的一对一对话。有 `participant_1_id`、`participant_2_id` 和 `last_message_at`。每对唯一用户一行。

- **`direct_message` table / 表:** Individual messages. `sender_id`, `receiver_id` (for DMs), `group_id` (for group messages — yes, messages can also belong to a care group), `message_content`, `attachment_url`, `message_type`, `read_at`, `reply_to_id`.
- **`direct_message` 表补充:** 单条消息。`sender_id`、`receiver_id`（用于私信）、`group_id`（用于群组消息——是的，消息也可以属于护理小组）、`message_content`、`attachment_url`、`message_type`、`read_at`、`reply_to_id`。

- Messages auto-refresh every 10 seconds via `refetchInterval`. Unread count is computed client-side by counting messages where `sender_id != currentUser` and `read_at` is null.
- 消息每 10 秒通过 `refetchInterval` 自动刷新。未读数在客户端计算，统计 `sender_id != currentUser` 且 `read_at` 为 null 的消息。

---

## 11. CARED ONES — The Patient Toolkit / 被照顾者——患者工具箱

Route `/cared-ones`. A comprehensive care management dashboard for each care recipient. The user selects a cared-one profile, then accesses ten specialized feature cards in a two-tab CRUD layout pattern.

路由 `/cared-ones`。为每个护理接受者提供全面的护理管理仪表板。用户选择一个被照顾者档案，然后在双标签 CRUD 布局模式下访问十个专业功能卡。

### 11a. Medications / 用药管理

- **`medicine` table / 表:** Stores medication prescriptions for a cared one. `user_id` = the cared one's profile ID. Fields: `name`, `dosage`, `frequency`, `time_slot` (text[] for scheduled times), `note`, `form` (pill/liquid/etc), `category`.
- **`medicine` 表补充:** 存储被照顾者的药物处方。`user_id` = 被照顾者的 profile ID。字段：药名、剂量、频率、时间段（文本数组，计划服药时间）、备注、剂型（药片/液体等）、分类。

- **`medicine_log` table / 表:** Tracks whether a medication was actually taken. `medicine_id` → links to medicine, `status` (taken/skipped/missed), `log_date`, `logged_by` (who recorded it), `user_id` (the cared one).
- **`medicine_log` 表补充:** 追踪药物是否实际服用。`medicine_id` → 链接到 medicine，`status`（taken/skipped/missed），`log_date`，`logged_by`（谁记录的），`user_id`（被照顾者）。

### 11b. Wellness Check-Ins / 健康签到

- **`checkin_log` table / 表:** Wellness check-ins with mood, energy, pain, sleep tracking. `user_id` = the cared one, `recorded_by` = who did the check-in. Fields: `mood` (emoji string), `energy_level`, `pain_level`, `sleep_hours`, `note`.
- **`checkin_log` 表补充:** 健康签到，包括心情、精力、疼痛、睡眠追踪。`user_id` = 被照顾者，`recorded_by` = 谁做的签到。字段：`mood`（表情符号字符串）、`energy_level`、`pain_level`、`sleep_hours`、`note`。

- **NOTE:** `checkin_log` lacks a native foreign key for `recorded_by`, so app code must manually map reporter profiles when joining.
- **注意:** `checkin_log` 的 `recorded_by` 缺少原生外键，因此应用代码在 join 时必须手动映射记录者的 profile。

### 11c. Health Vitals / 健康体征

- **`health_vital` table / 表:** Records vital signs like blood pressure, temperature, weight, blood sugar. `user_id` = cared one, `recorded_by` = who recorded it. Fields: `vital_type` (string), `value` (number), `unit`, `note`.
- **`health_vital` 表补充:** 记录生命体征如血压、体温、体重、血糖。`user_id` = 被照顾者，`recorded_by` = 谁记录的。字段：`vital_type`（字符串）、`value`（数字）、`unit`、`note`。

### 11d. Care Tips / 护理提示

- **`care_tip` table / 表:** Notes and tips for caring for the patient. `user_id` = cared one, `created_by` = who wrote the tip. Fields: `title`, `content`, `category`, `is_pinned`.
- **`care_tip` 表补充:** 关于如何照顾患者的笔记和提示。`user_id` = 被照顾者，`created_by` = 谁写的提示。字段：`title`、`content`、`category`、`is_pinned`。

### 11e. Care Plans & Goals / 护理计划和目标

- **`care_plan` table / 表:** Care plans with goals. `user_id` = cared one, `created_by` = who created it. Fields: `title`, `description`, `status`.
- **`care_plan` 表补充:** 护理计划及目标。`user_id` = 被照顾者，`created_by` = 谁创建的。字段：`title`、`description`、`status`。

- **`care_plan_goal` table / 表:** Goals within a care plan. `care_plan_id` → links to care plan. Fields: `title`, `description`, `status`.
- **`care_plan_goal` 表补充:** 护理计划中的目标。`care_plan_id` → 链接到护理计划。字段：`title`、`description`、`status`。

### 11f. Care Notes / 护理笔记

- **`care_note` table / 表:** Free-form notes about the cared one's condition. `user_id` = cared one, `created_by` = author. Fields: `title`, `content`, `category`.
- **`care_note` 表补充:** 关于被照顾者状况的自由格式笔记。`user_id` = 被照顾者，`created_by` = 作者。字段：`title`、`content`、`category`。

### 11g. Emergency Contacts / 紧急联系人

- **`emergency_contact` table / 表:** Emergency contacts for a cared one. `user_id` = cared one. Fields: `name`, `phone`, `relationship`, `is_primary`.
- **`emergency_contact` 表补充:** 被照顾者的紧急联系人。`user_id` = 被照顾者。字段：`name`、`phone`、`relationship`、`is_primary`。

### 11h. Documents / 文档

- **`cared_one_document` table / 表:** Documents uploaded for a cared one (medical records, insurance, etc). `user_id` = cared one, `uploaded_by` = who uploaded it. Fields: `title`, `document_type`, `file_url`, `notes`.
- **`cared_one_document` 表补充:** 为被照顾者上传的文档（病历、保险等）。`user_id` = 被照顾者，`uploaded_by` = 谁上传的。字段：`title`、`document_type`、`file_url`、`notes`。

### 11i. Visit Log / 访问日志

- **`activity_log` table / 表:** General activity/visit logging. `cared_one_id` = the cared one, `user_id` = who performed the activity (NOTE: this table uses `user_id` instead of `recorded_by`). Fields: `activity_type`, `description`, `duration_minutes`.
- **`activity_log` 表补充:** 一般活动/访问日志。`cared_one_id` = 被照顾者，`user_id` = 谁执行的活动（注意：这个表使用 `user_id` 而不是 `recorded_by`）。字段：`activity_type`、`description`、`duration_minutes`。

---

## 12. GPS TRACKING & SAFE ZONES / GPS 追踪和安全区域

Route `/gps-tracking`. Location-based safety features, especially important for dementia care.

路由 `/gps-tracking`。基于位置的安全功能，对失智症护理尤其重要。

- **`location_share` table / 表:** GPS location entries. `user_id`, `latitude`, `longitude`, `accuracy`, `timestamp`, `is_emergency`. Multiple rows per user = location history. The most recent row is the "current" location.
- **`location_share` 表补充:** GPS 位置记录。`user_id`、`latitude`、`longitude`、`accuracy`、`timestamp`、`is_emergency`。每个用户多行 = 位置历史。最新的一行是"当前"位置。

- **Scoped visibility / 范围可见性:** Users can only see locations of people who are in the same care groups. The app first fetches all group memberships, then filters `location_share` to only include those user IDs.
- **范围可见性补充:** 用户只能看到同一护理小组中人员的位置。应用先获取所有组成员关系，然后过滤 `location_share` 只包含这些用户 ID。

- **`safe_zone` table / 表:** Geofenced areas for cared ones. `user_id` = cared one, `created_by` = who set it up. Fields: `name`, `latitude`, `longitude`, `radius` (meters), `zone_type`, `shape_type`, `polygon_points`, `category`, `color`, `description`, `is_active` (soft delete), schedule fields (`schedule_enabled`, `schedule_start_time`, `schedule_end_time`, `schedule_days`), `notify_on_enter`, `notify_on_exit`.
- **`safe_zone` 表补充:** 被照顾者的地理围栏区域。`user_id` = 被照顾者，`created_by` = 谁设置的。字段：名称、经纬度、半径（米）、区域类型、形状类型、多边形点、分类、颜色、描述、`is_active`（软删除）、计划字段（启用、开始时间、结束时间、天数）、进入/离开通知。

- **`safe_zone_alert` table / 表:** Alerts triggered when a cared one enters/exits a safe zone. `user_id` = cared one, `safe_zone_id`. Fields: `is_read`, `acknowledged_by`, `acknowledged_at`.
- **`safe_zone_alert` 表补充:** 当被照顾者进入/离开安全区域时触发的警报。`user_id` = 被照顾者，`safe_zone_id`。字段：`is_read`、`acknowledged_by`、`acknowledged_at`。

- **`location_request` table / 表:** Request someone to share their location. `user_id` = target person, `requester_id` = who's asking, `status` (pending/approved/emergency_approved/cancelled), `expire_at`, `is_emergency`, `message`.
- **`location_request` 表补充:** 请求某人分享位置。`user_id` = 目标人员，`requester_id` = 请求者，`status`（pending/approved/emergency_approved/cancelled），`expire_at`，`is_emergency`，`message`。

- **`cared_one_location_sharing` table / 表:** Settings for a cared one's location sharing preferences (read-only for the caregiver).
- **`cared_one_location_sharing` 表补充:** 被照顾者位置分享偏好设置（照顾者只读）。

---

## 13. JOB BOARD / 工作板

Route `/jobs`. Families post care job listings and providers apply.

路由 `/jobs`。家庭发布护理工作列表，提供者申请。

- **`job_posting` table / 表:** Job listings. `posted_by` = the family user. Fields: `title`, `description`, `status` (open/closed), `job_source_type` (general or from a care group task), `location`, `start_date`, `care_recipient_id`, `linked_task_id` (if promoted from a care task), `linked_group_id`.
- **`job_posting` 表补充:** 工作列表。`posted_by` = 家庭用户。字段：`title`、`description`、`status`（open/closed）、`job_source_type`（general 或来自护理小组任务）、`location`、`start_date`、`care_recipient_id`、`linked_task_id`（如果从护理任务推广）、`linked_group_id`。

- **`job_application` table / 表:** Applications from providers. `job_id` → links to posting, `applicant_id` = the provider, `cover_letter`, `status` (pending/accepted/rejected). Duplicate applications are prevented in app code.
- **`job_application` 表补充:** 提供者的申请。`job_id` → 链接到发布，`applicant_id` = 提供者，`cover_letter`，`status`（pending/accepted/rejected）。重复申请在应用代码中被阻止。

---

## 14. REVIEWS / 评价

The `review` table stores ratings and comments. `entity_id` is the provider being reviewed, `reviewer_id` is who wrote the review.

`review` 表存储评分和评论。`entity_id` 是被评价的提供者，`reviewer_id` 是撰写评价的人。

- `rating` (1-5), `comment`, `response_text` (provider's reply to the review).
- `rating`（1-5）、`comment`（评论）、`response_text`（提供者对评价的回复）。

- **IMPORTANT:** The app does NOT auto-calculate `rating_average` and `rating_count` on the profile. These must be manually recalculated when reviews change.
- **重要:** 应用不会自动计算 profile 上的 `rating_average` 和 `rating_count`。当评价变更时必须手动重新计算。

---

## 15. NOTIFICATIONS / 通知

- **`notification` table / 表:** In-app notifications per user. `user_id`, `type` (booking_request, booking_confirmed, booking_cancelled, booking_update, etc.), `title`, `content`, `link_url`, `is_read`.
- **`notification` 表补充:** 每个用户的应用内通知。`user_id`、`type`（booking_request、booking_confirmed、booking_cancelled、booking_update 等）、`title`、`content`、`link_url`、`is_read`。

- Notifications are created as a side effect of other actions (e.g., creating a booking inserts a notification for the provider). They are "best-effort" — failures are caught and ignored.
- 通知是其他操作的副作用创建的（例如，创建预约会为提供者插入通知）。它们是"尽力而为"的——失败会被捕获并忽略。

---

## 16. FAVORITES / 收藏

- **`saved_provider` table / 表:** Users can bookmark providers. `user_id` + `provider_id` junction. Toggle saves/unsaves.
- **`saved_provider` 表补充:** 用户可以收藏提供者。`user_id` + `provider_id` 关联。切换收藏/取消收藏。

---

## 17. DEMENTIA-SPECIFIC FEATURES (Challenged site) / 失智症特有功能（Challenged 站点）

These components live in `src/components/challenged/` and are only shown on the Challenged brand.

这些组件在 `src/components/challenged/` 中，仅在 Challenged 品牌上显示。

- **Symptom Tracker / 症状追踪器:** Logs behavioral symptoms. Uses `symptom_log` table with `cared_one_id`, `symptom_type`, `severity` (1-10), `notes`, `trigger`, `recorded_by`.
- **症状追踪器补充:** 记录行为症状。使用 `symptom_log` 表，有 `cared_one_id`、`symptom_type`、`severity`（1-10）、`notes`、`trigger`、`recorded_by`。

- **Caregiver Wellness / 照顾者健康:** Tracks caregiver stress and mood. Uses `caregiver_wellness_log` table with `user_id` (the caregiver), stress/mood/sleep/notes fields. AI intervention triggers at stress level ≥ 7/10.
- **照顾者健康补充:** 追踪照顾者的压力和情绪。使用 `caregiver_wellness_log` 表，有 `user_id`（照顾者）、压力/情绪/睡眠/备注字段。压力级别 ≥ 7/10 时触发 AI 干预。

- **Dementia Stage Selector / 失智症阶段选择器:** UI component that persists the patient's dementia stage (Early/Middle/Late) in `profile.dementia_stage`. Used to adapt UI complexity.
- **失智症阶段选择器补充:** UI 组件，将患者的失智症阶段（早期/中期/晚期）持久化到 `profile.dementia_stage`。用于适配 UI 复杂度。

- **Other Challenged-only components / 其他 Challenged 专属组件:** AI Care Tips, AI Daily Summary, AI Insights Panel, AI Medication Helper, Cognitive Exercises, Daily Timeline, Dementia Assistant, Emergency SOS, Loved One Simple View (high-contrast simplified UI for patients), Patient Summary Card.
- **其他 Challenged 专属组件补充:** AI 护理提示、AI 每日摘要、AI 洞察面板、AI 用药助手、认知训练、每日时间线、失智症助手、紧急 SOS、亲人简化视图（患者的高对比度简化 UI）、患者摘要卡。

---

## 18. OTHER LOOKUP TABLES / 其他查找表

- **`service_category` / 服务分类:** Lookup table for care service types displayed in the marketplace. `name`, `description`, `icon`.
- **`service_category` 补充:** 市场中显示的护理服务类型查找表。`name`、`description`、`icon`。

---

## 19. MULTI-SITE ARCHITECTURE / 多站点架构

The app serves two brands from one codebase:

应用从一套代码库服务两个品牌：

- **CareConnected** — general caregiving platform. Uses "Care Group", "Cared One", "Find Care" terminology.
- **CareConnected 补充** — 通用护理平台。使用"Care Group"、"Cared One"、"Find Care"术语。
- **Challenged** (DEFAULT at root URL) — dementia-focused variant with specialized components. Uses "Care Team", "Loved One", "Find Help" terminology.
- **Challenged（根 URL 的默认品牌）** — 专注失智症的变体，有专门的组件。使用"Care Team"、"Loved One"、"Find Help"术语。

Key config fields in SiteContext: `caredOneSingular`, `careGroupSingular`, `contactEmail`, `brandSlug`, `navLabels` (object with keys: `careGroups`, `findCare`, `caredOnes`, `dashboard`).

SiteContext 中的关键配置字段：`caredOneSingular`、`careGroupSingular`、`contactEmail`、`brandSlug`、`navLabels`（对象，键为：`careGroups`、`findCare`、`caredOnes`、`dashboard`）。

- Site detection: hostname-based via `DOMAIN_MAP` in `SiteContext.tsx`
- 站点检测：基于域名，通过 `SiteContext.tsx` 中的 `DOMAIN_MAP`
- Dev override: add `?__site=challenged` or `?__site=careconnected` to any URL
- 开发覆盖：在任何 URL 后添加 `?__site=challenged` 或 `?__site=careconnected`
- Challenged-specific components live in `src/components/challenged/`
- Challenged 专属组件在 `src/components/challenged/` 中
- CSS theming: `.site-challenged` class is applied to `<html>` element
- CSS 主题：`.site-challenged` 类应用于 `<html>` 元素

---

## 20. APP ROUTES & LAYOUT / 应用路由和布局

**Public routes (no login required) / 公开路由（无需登录）:**
- `/` — Landing page (Index)
- `/search` — Marketplace search results
- `/caregiver/:id` — Provider profile page
- `/auth` — Login/signup
- `/reset-password` — Password reset
- `/how-it-works` — How the platform works
- `/trust-safety` — Trust & Safety info
- `/become-caregiver` — Provider application form

**Protected routes (RequireAuth) / 受保护路由（需要认证）:**
- `/dashboard` — Main dashboard with stats widgets
- `/care-circle` — Care Groups management (with tabs: Home, Members, Tasks, Announcements, Wishes, Messages, Calendar, Gallery, Cared Ones, Check-Ins)
- `/cared-ones` — Cared-one management (10 feature cards)
- `/bookings` — My bookings
- `/messages` — Direct messages
- `/gps-tracking` — GPS & safe zones
- `/notifications` — Notifications
- `/favorites` — Saved providers
- `/profile` — User profile settings
- `/jobs` — Job board
- `/provider-dashboard` — Provider management (bookings, availability, earnings)

**Layout / 布局:** Dashboard paths get a sidebar layout (`DashboardLayout` with `AppSidebar`). Public pages get `AppLayout` only (header + content).

**布局补充:** 仪表板路径使用侧边栏布局（`DashboardLayout` 带 `AppSidebar`）。公开页面仅使用 `AppLayout`（标题 + 内容）。

---

## 21. KEY ARCHITECTURAL RULES / 关键架构规则

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

- **Performer tracking in mutations:** Always explicitly pass the current user's ID to `recorded_by` (or `user_id` for `activity_log`, `logged_by` for `medicine_log`) columns. Never rely on database defaults for this.
- **变更中的执行者追踪:** 始终显式地将当前用户的 ID 传递给 `recorded_by`（或 `activity_log` 的 `user_id`，`medicine_log` 的 `logged_by`）列。永远不要依赖数据库默认值。

- **State management:** React Query (`@tanstack/react-query`) for all server state. No Redux. Query keys follow pattern `["entity-name", id?]`.
- **状态管理:** React Query（`@tanstack/react-query`）用于所有服务器状态。没有 Redux。查询键遵循模式 `["entity-name", id?]`。

- **Owner membership auto-created:** When creating a care group, the owner membership row is auto-created by a database trigger. Do NOT insert a duplicate member row in app code.
- **所有者成员自动创建:** 创建护理小组时，所有者的成员行由数据库触发器自动创建。不要在应用代码中插入重复的成员行。
