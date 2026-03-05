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

This is a caregiving platform — think of it as Uber meets Facebook Groups, but for caregivers and families. Families can search, compare, and book professional caregivers. They can also form "Care Groups" (like private family teams) to coordinate care for a loved one together. The entire app runs two brands from a single codebase — a general version called "CareConnected" and a dementia-focused version called "Challenged".

这是一个护理平台——想象成 Uber 和 Facebook 群组的结合，但面向护理人员和家庭。家庭可以搜索、比较和预约专业护理人员。他们也可以组建"护理小组"（类似私人家庭团队）来协作照顾亲人。整个应用从一套代码库运行两个品牌——通用版"CareConnected"和专注失智症的"Challenged"。

- **Stack / 技术栈:** React 18, TypeScript, Vite, TailwindCSS, shadcn/ui
- **State management / 状态管理:** React Query (`@tanstack/react-query`) for all server state. No Redux. Query keys follow `["entity-name", id?]`.
- **i18n / 国际化:** 17 languages via `i18next`. Translation files in `src/i18n/locales/`. Always use `useTranslation()` and `t()`.
- **Test account / 测试账号:** `guowei.jiang.work@gmail.com` / password: `J4913836j@@@@@`

---

## 2. NEVER DO THESE THINGS / 永远不要做这些事

These are hard rules. Break them and the app will break or connect to the wrong database.

这些是硬性规则。违反它们，应用会崩溃或连接到错误的数据库。

- **NEVER** import from `src/integrations/supabase/client.ts`. That file connects to an empty Lovable Cloud database we don't use. Always use `careDb` and `careAuth` from `src/integrations/supabase/external-client.ts`.
- **永远不要**从 `src/integrations/supabase/client.ts` 导入。那个文件连接到我们不使用的空 Lovable Cloud 数据库。始终使用 `src/integrations/supabase/external-client.ts` 中的 `careDb` 和 `careAuth`。

- **NEVER** create mock data, fallback data, hardcoded workarounds, or fake anything. The app is production-ready. If you can't access something, ASK the developer.
- **永远不要**创建模拟数据、回退数据、硬编码变通或伪造任何东西。应用是生产就绪的。如果无法访问某些东西，问开发者。

- **NEVER** hardcode brand names like "CareConnected" or "Challenged" in components. Always get brand text from `useSite()` hook or `t()` translation keys.
- **永远不要**在组件中硬编码品牌名称。始终从 `useSite()` hook 或 `t()` 翻译键获取品牌文本。

---

## 3. TWO SUB-APPS, ONE CODEBASE / 两个子应用，一套代码

This is NOT just "two themes" or "two brands". Think of it as **two separate sub-apps** — CareConnected (general caregiving) and Challenged (dementia care) — that happen to share one React codebase and one database. They share most pages but each sub-app has its own landing page personality, its own terminology, and Challenged has extra dementia-specific features that CareConnected doesn't show at all.

这不仅仅是"两个主题"或"两个品牌"。把它想成**两个独立的子应用** —— CareConnected（通用护理）和 Challenged（失智症护理）—— 恰好共享一套 React 代码库和一个数据库。它们共享大部分页面，但每个子应用有自己的首页风格、自己的术语，而且 Challenged 有额外的失智症专属功能，CareConnected 完全不显示。

### 3a. How the switch works / 切换逻辑

The detection logic lives in `src/contexts/SiteContext.tsx`. On every page load it decides which sub-app you're in:

检测逻辑在 `src/contexts/SiteContext.tsx` 中。每次页面加载时决定你在哪个子应用：

1. **URL param override / URL 参数覆盖:** `?__site=challenged` or `?__site=careconnected` — for dev testing.
2. **Hostname match / 域名匹配:** `DOMAIN_MAP` maps hostnames → site IDs (e.g. `challenged.com` → challenged, `localhost:5174` → challenged).
3. **Fallback / 回退:** Defaults to `"challenged"`.

- **Challenged is the default.** Opening the root URL with no params gives you Challenged.
- **Challenged 是默认子应用。** 不带参数打开根 URL 时显示 Challenged。

### 3b. Terminology differences / 术语差异

|                                  | **CareConnected**             | **Challenged** (DEFAULT)   |
| -------------------------------- | ----------------------------- | -------------------------- |
| **Focus / 定位**                 | General caregiving / 通用护理 | Dementia care / 失智症护理 |
| **Group label / 小组标签**       | "Care Group"                  | "Care Team"                |
| **Patient label / 被照顾者标签** | "Cared One"                   | "Loved One"                |
| **Search label / 搜索标签**      | "Find Care"                   | "Find Help"                |

Use `useSite()` to get the right label. Never hardcode these strings.

用 `useSite()` 获取正确标签。永远不要硬编码这些字符串。

### 3c. Page-by-page breakdown — shared vs. site-specific / 逐页分析——共享还是专属

All pages use the same routes. The difference is **what renders inside them** depending on `site.id`.

所有页面使用相同路由。区别在于根据 `site.id`，**内部渲染的内容不同**。

**PUBLIC PAGES / 公开页面:**

| Route               | Page                   | Shared?      | Notes                                                                                                                                                                                                                                                       |
| ------------------- | ---------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                 | `Index.tsx`            | ⚠️ Partially | Same layout structure, but hero text, CTA, trust badges, "how it works" steps all come from `SiteConfig` — so they look totally different per sub-app. / 相同布局结构，但主标题、CTA、信任徽章、步骤说明都来自 `SiteConfig`——所以每个子应用看起来完全不同。 |
| `/search`           | `SearchResults.tsx`    | ✅ Shared    | Same search UI. Provider cards are the same. / 相同搜索界面，服务商卡片相同。                                                                                                                                                                               |
| `/caregiver/:id`    | `CaregiverProfile.tsx` | ✅ Shared    | Same provider profile page. / 相同的服务商个人页面。                                                                                                                                                                                                        |
| `/auth`             | `Auth.tsx`             | ✅ Shared    | Same login/signup flow. / 相同登录注册流程。                                                                                                                                                                                                                |
| `/reset-password`   | `ResetPassword.tsx`    | ✅ Shared    | Same. / 相同。                                                                                                                                                                                                                                              |
| `/how-it-works`     | `HowItWorks.tsx`       | ⚠️ Partially | Same structure, but steps content comes from `SiteConfig.howItWorksSteps`. / 相同结构，但步骤内容来自 `SiteConfig`。                                                                                                                                        |
| `/trust-safety`     | `TrustSafety.tsx`      | ⚠️ Partially | Same structure, contact email from `site.contactEmail`. / 相同结构，联系邮箱来自 `site.contactEmail`。                                                                                                                                                      |
| `/become-caregiver` | `BecomeCaregiver.tsx`  | ✅ Shared    | Same provider signup page. / 相同的服务商注册页面。                                                                                                                                                                                                         |

**PROTECTED PAGES (require login) / 受保护页面（需要登录）:**

| Route                 | Page                    | Shared?              | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------- | ----------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/dashboard`          | `Dashboard.tsx`         | ⚠️ MAJOR DIFFERENCES | This is where the two sub-apps diverge the most. Both show stats, bookings, tasks. But **Challenged adds**: Emergency SOS, Patient Summary Cards, Dementia Stage Selector, Symptom Tracker, Caregiver Wellness, AI Insights, AI Daily Summary, AI Care Tips, Daily Timeline, and the floating Dementia Assistant. If user `is_cared_one`, Challenged shows a completely different simplified `LovedOneSimpleView`. / 这是两个子应用差异最大的地方。两者都显示统计、预约、任务。但 **Challenged 额外有**：紧急SOS、患者摘要卡、失智阶段选择器、症状追踪、照顾者健康、AI洞察、AI日报、AI护理建议、每日时间线和悬浮失智助手。如果用户 `is_cared_one`，Challenged 显示完全不同的简化 `LovedOneSimpleView`。 |
| `/care-circle`        | `CareCircle.tsx`        | ✅ Shared            | Same care group management UI. / 相同的护理小组管理界面。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `/cared-ones`         | `CaredOnes.tsx`         | ✅ Shared            | Same cared-ones management. / 相同的被照顾者管理。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `/bookings`           | `Bookings.tsx`          | ✅ Shared            | Same booking management. / 相同的预约管理。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `/messages`           | `Messages.tsx`          | ✅ Shared            | Same messaging UI. / 相同的消息界面。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `/gps-tracking`       | `GPSTracking.tsx`       | ✅ Shared            | Same GPS tracking. / 相同的GPS追踪。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `/favorites`          | `Favorites.tsx`         | ✅ Shared            | Same favorites list. / 相同的收藏列表。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `/profile`            | `Profile.tsx`           | ✅ Shared            | Same profile editor. / 相同的个人资料编辑。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `/notifications`      | `Notifications.tsx`     | ✅ Shared            | Same notifications. / 相同的通知。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `/jobs`               | `Jobs.tsx`              | ✅ Shared            | Provider job board. / 服务商工作板。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `/provider-dashboard` | `ProviderDashboard.tsx` | ✅ Shared            | Provider-specific dashboard. / 服务商专属仪表板。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

**KEY TAKEAWAY / 关键要点:** Most pages are fully shared — the sub-app difference is mainly branding/labels (via `useSite()`) and the Dashboard, which conditionally renders ~10 extra Challenged-only widgets from `src/components/challenged/`.

**关键要点：** 大部分页面完全共享——子应用的区别主要在品牌/标签（通过 `useSite()`）和仪表板，仪表板会根据条件渲染 `src/components/challenged/` 中约10个 Challenged 专属组件。

### 3d. How to use SiteContext in code / 如何在代码中使用 SiteContext

```tsx
import { useSite } from "@/contexts/SiteContext";

const site = useSite();
// site.id            → "careconnected" | "challenged"
// site.name          → "Care·Connected" | "Challenged"
// site.caredOneSingular → "Cared One" | "Loved One"
// site.careGroupSingular → "Care Group" | "Care Team"
// site.navLabels.careGroups → "Care Groups" | "Care Teams"
// site.contactEmail  → "safety@careconnected.com" | "safety@challenged.com"
```

- CSS theming uses a class on `<html>`: `.site-challenged` or `.site-careconnected`. Override styles with `.site-challenged .your-class { ... }`.
- CSS 主题在 `<html>` 上使用类：`.site-challenged` 或 `.site-careconnected`。用 `.site-challenged .your-class { ... }` 覆盖样式。

- Challenged-only components live in `src/components/challenged/`. They should only render when `site.id === "challenged"`.
- Challenged 专属组件在 `src/components/challenged/` 中。只在 `site.id === "challenged"` 时渲染。

---

## 4. THE DATABASE — EXTERNAL SUPABASE / 数据库——外部 Supabase

All application data lives in an external Supabase project, NOT the Lovable Cloud one. Two clients are exported from `src/integrations/supabase/external-client.ts`:

所有应用数据都在外部 Supabase 项目中，不是 Lovable Cloud 的。两个客户端从 `src/integrations/supabase/external-client.ts` 导出：

- **`careDb`** — for all data queries. Pre-configured to use the `care_connector` schema, so you write `.from("profile")` not `.from("care_connector.profile")`.
- **`careDb`** — 用于所有数据查询。预配置使用 `care_connector` schema，所以你写 `.from("profile")` 而不是 `.from("care_connector.profile")`。

- **`careAuth`** — for all authentication operations (sign up, sign in, sign out, get session). Uses the default `public` schema for Supabase auth internals.
- **`careAuth`** — 用于所有认证操作（注册、登录、登出、获取会话）。使用默认的 `public` schema 处理 Supabase auth 内部机制。

- External project URL: `https://yekarqanirdkdckimpna.supabase.co`
- All app tables are in the `care_connector` schema. Not `public`. Not any other schema.
- 所有应用表在 `care_connector` schema 中。不是 `public`。不是其他 schema。

---

## 5. THE PROFILE TABLE — EVERY USER IS A ROW HERE / Profile 表——每个用户在这里是一行

The `profile` table is the single source of truth for all users. There is no separate "users" table. One row = one user. It stores personal info, provider settings, and role flags all in the same row.

`profile` 表是所有用户的唯一事实来源。没有单独的"users"表。一行 = 一个用户。个人信息、提供者设置和角色标志全存在同一行中。

### 5a. Role flags — how we know what a user IS / 角色标志——我们如何知道用户是什么

- **Care provider / 护理提供者:** `is_care_provider = true`. This single boolean is the ONLY way to determine if someone is a provider (shows up in marketplace, is searchable and bookable). Do NOT check any other column.
- **是否是护理提供者:** `is_care_provider = true`。这个布尔值是判断某人是否是提供者的唯一方式。不要检查其他列。

- **Provider active for search / 提供者是否可被搜索:** `provider_is_active = true` means currently discoverable in the marketplace. `false` = paused (still a provider, just hidden from search). Think of it like an "online/offline" toggle.
- **提供者是否活跃:** `provider_is_active = true` 表示当前在市场中可发现。`false` = 暂停（仍是提供者，只是隐藏了）。类似"在线/离线"开关。

- **Cared one (care recipient) / 被照顾者:** `is_cared_one = true`. These profiles represent patients (e.g. an elderly parent). They are created by a caregiver user, so `created_by_user_id` points to that caregiver, and `relationship_to_creator` describes the relationship (e.g. "mother").
- **被照顾者:** `is_cared_one = true`。这些档案代表患者（如年迈的父母）。由照顾者用户创建，所以 `created_by_user_id` 指向该照顾者，`relationship_to_creator` 描述关系（如"母亲"）。

### 5b. Personal info fields / 个人信息字段

- `full_name`, `first_name`, `last_name`, `user_name`, `email`, `phone_number`, `avatar_url`, `bio`, `location`, `address`, `address_latitude`, `address_longitude`, `timezone`, `currency`.
- Notification prefs: `email_notification`, `push_notification`, `quiet_hour_start`, `quiet_hour_end`.

### 5c. Provider-specific fields (only meaningful when `is_care_provider = true`) / 提供者专属字段

- `provider_type`, `hourly_rate`, `specialty` (text[]), `service_offered` (text[]), `years_of_experience`, `certification` (text[]), `background_check_status`, `instant_book_enabled`, `rating_average`, `rating_count`, `total_booking_count`, `response_time_minute`, `cancellation_policy`, `service_area` (text[]).
- These fields describe what the provider offers, their pricing, qualifications, and track record. They only matter for provider profiles.
- 这些字段描述提供者提供什么、定价、资质和记录。只对提供者档案有意义。

### 5d. User-to-cared-one link / 用户与被照顾者的关联

- The `user_cared_one` junction table links a caregiver to their cared-one profiles. `user_id` = the caregiver, `cared_one_id` = the cared-one profile, `relationship` = text, `is_primary` = boolean.
- `user_cared_one` 关联表将照顾者链接到他们的被照顾者档案。`user_id` = 照顾者，`cared_one_id` = 被照顾者档案，`relationship` = 文本，`is_primary` = 布尔值。

---

## 6. LANDING PAGE & MARKETPLACE — The First Thing Users See / 首页和市场——用户看到的第一个东西

### 6a. Landing page (route `/`) / 首页

The landing page (`src/pages/Index.tsx`) has: hero section with search bar, care category browse, top-rated providers grid, "How It Works" steps, and a CTA. All text is site-aware (uses `useSite()` + `t()` for translations). Provider cards pull from `profile` where `is_care_provider = true`, sorted by `rating_average`.

首页（`src/pages/Index.tsx`）包含：带搜索栏的英雄区、护理分类浏览、高评分提供者网格、"如何运作"步骤和行动号召。所有文本是站点感知的（使用 `useSite()` + `t()` 翻译）。提供者卡片从 `profile` 中拉取 `is_care_provider = true` 的数据，按 `rating_average` 排序。

### 6b. Search results (route `/search`) / 搜索结果

The marketplace search page filters providers from the `profile` table: `is_care_provider = true AND provider_is_active = true`. Supports filtering by text, location, specialty, price range, background check, and rating. Sort options: rating, price, experience, review count.

市场搜索页从 `profile` 表过滤提供者：`is_care_provider = true AND provider_is_active = true`。支持按文本、位置、专长、价格范围、背景调查和评分过滤。排序选项：评分、价格、经验、评论数。

### 6c. Provider detail page (route `/caregiver/:id`) / 提供者详情页

Shows the full provider profile, their reviews (from `review` table), and a booking form. Reviews have `entity_id` = provider, `reviewer_id` = reviewer, `rating` (1-5), `comment`, `response_text` (provider reply).

显示完整的提供者资料、评价（来自 `review` 表）和预约表单。评价有 `entity_id` = 提供者，`reviewer_id` = 评价者，`rating`（1-5），`comment`，`response_text`（提供者回复）。

### 6d. Service categories / 服务分类

- The `service_category` lookup table lists care service types (Elder Care, Child Care, etc.) shown on the landing page. Fields: `name`, `description`, `icon`.
- `service_category` 查找表列出显示在首页的护理服务类型。字段：`name`、`description`、`icon`。

---

## 7. CARE GROUPS — A Private Facebook Group for Your Care Team / 护理小组——您护理团队的私人 Facebook 群组

Think of a Care Group as a private family coordination space. Multiple people caring for the same patient create a group, invite family members, share updates, assign tasks, and post announcements. Similar to CaringBridge or LotsaHelpingHands.

把护理小组想象成一个私人家庭协调空间。照顾同一患者的多个人创建一个组，邀请家人，分享更新，分配任务，发布公告。类似 CaringBridge 或 LotsaHelpingHands。

Route: `/care-circle` with tabs: Home, Members, Tasks, Announcements, Wishes, Messages, Calendar, Gallery, Cared Ones, Check-Ins.

路由：`/care-circle`，包含标签页：首页、成员、任务、公告、祝福、消息、日历、相册、被照顾者、签到。

### 7a. The `care_group` table / `care_group` 表

- Each group has `name`, `description`, `created_by`, `member_count`.
- **Private vs Public:** `is_private = true` means invitation-only, only members can see content. `is_private = false` means anyone can access it.
- **私有 vs 公开:** `is_private = true` 表示仅限邀请，只有成员能看到内容。`is_private = false` 表示任何人都可以访问。
- Groups can have a `join_code` for easy private invitations.
- 组可以有 `join_code` 方便私有邀请。

### 7b. Members — `care_group_member` junction table / 成员——`care_group_member` 关联表

This table links users to groups. `group_id` → `care_group.id`, `user_id` → `profile.id`.

这个表将用户链接到组。`group_id` → `care_group.id`，`user_id` → `profile.id`。

- **Four member roles (checked via boolean columns):**
  - `is_owner = true` → Group creator with full control / 组创建者，完全控制
  - `is_admin = true` → Can manage members, posts, tasks / 可管理成员、帖子、任务
  - `is_cared_one = true` → The patient/care recipient in the group / 组中的患者/被照顾者
  - None of the above → Regular member / 普通成员

- **Invitation status:** `invitation_status` = `accepted` | `pending` | `declined`.
- **Group display name:** `group_display_name` — the name this person goes by within the group (can differ from their profile name).
- **组内显示名称:** `group_display_name` — 此人在组内使用的名称（可以与 profile 名称不同）。

- **Invitations:** `care_group_invitation` table handles email-based invites. Has `care_group_id`, `invited_by_user_id`, `invitee_email`, `status`. An invitation creates a row here first; it becomes a member row only upon acceptance.
- **邀请:** `care_group_invitation` 表处理邮件邀请。先在这里创建行，接受后才变成成员行。

- **Owner auto-created:** When you create a group, a database trigger automatically inserts the owner as a member. Do NOT insert a duplicate member row in code.
- **所有者自动创建:** 创建组时，数据库触发器自动插入所有者为成员。不要在代码中插入重复的成员行。

### 7c. Member Categories — Sub-groups for visibility control / 成员分类——用于可见性控制的子组

Each care group can have unlimited member categories — think of them as tags like "Night Shift", "Family Only", or "Medical Staff". They control who can see which posts and tasks.

每个护理小组可以有无限个成员分类——把它们想成"夜班"、"仅家人"或"医疗人员"等标签。它们控制谁能看到哪些帖子和任务。

- **`care_group_member_category`:** Defines categories. Linked to `care_group.id` via `group_id`. Each has `name`, optional `description`, optional `color`.
- **`care_group_member_category`:** 定义分类。通过 `group_id` 链接到 `care_group.id`。每个有 `name`、可选 `description`、可选 `color`。

- **`care_group_member_assigned_category`:** Assigns members to categories. Links to `care_group_member_category.id` via `member_category_id`, and to **`care_group_member.id`** (the junction table's own UUID, NOT the user's UUID) via `care_group_member_id`. We link to the member row so we can easily pull `group_display_name` in the same query.
- **`care_group_member_assigned_category`:** 将成员分配到分类。通过 `member_category_id` 链接到 `care_group_member_category.id`，通过 `care_group_member_id` 链接到 **`care_group_member.id`**（关联表自身的 UUID，不是用户的 UUID）。

- **How visibility works / 可见性如何工作:** Posts and tasks have a `visible_to_member_category_id` (text[]) column. If it has values, only members in those categories see the content. If empty/null, everyone sees it.
- **可见性工作方式:** 帖子和任务有 `visible_to_member_category_id`（text[]）列。有值时只有对应分类的成员能看到。为空/null 时所有人可见。

---

## 8. CARE GROUP POSTS — The Group's Activity Feed / 护理小组帖子——小组的活动信息流

All group posts live in one table: `care_group_post`. The `type` column says what kind of post it is:

所有组帖子在一个表中：`care_group_post`。`type` 列说明帖子类型：

- `type = 'announcement'` → Important group notice, can be pinned / 重要组通知，可置顶
- `type = 'wish'` → Wish post (birthday, get-well, encouragement) / 祝福帖（生日、康复、鼓励）
- `type = 'discussion'` → General group conversation / 一般组讨论

- Key fields: `group_id`, `author_id`, `title`, `content`, `is_draft`, `is_pinned`, `scheduled_at`, `wish_message_type`, `visible_to_member_category_id`.
- 关键字段：`group_id`、`author_id`、`title`、`content`、`is_draft`、`is_pinned`、`scheduled_at`、`wish_message_type`、`visible_to_member_category_id`。

- **CRITICAL:** Tasks are NOT posts. Tasks have their own `care_task` table. See next section.
- **重要:** 任务不是帖子。任务有自己的 `care_task` 表。见下一节。

- **Gallery:** `care_group_gallery` table stores photos/media shared in a group. Each has `group_id`, `uploaded_by`, file URL, caption.
- **相册:** `care_group_gallery` 表存储组内分享的照片/媒体。

---

## 9. CARE TASKS — A Standalone Task System / 护理任务——独立任务系统

Tasks live in the `care_task` table. They are completely separate from posts. Do NOT store tasks in `care_group_post`.

任务在 `care_task` 表中。与帖子完全独立。不要把任务存在 `care_group_post` 中。

- Key fields: `group_id` (optional — tasks can exist without a group), `created_by`, `assigned_to`, `care_recipient_id`, `title`, `description`, `status`, `priority`, `category`, `due_date`, `completed_at`, `visible_to_member_category_id` (text[]).
- 关键字段：`group_id`（可选——任务可以不属于组）、`created_by`、`assigned_to`、`care_recipient_id`、`title`、`description`、`status`、`priority`、`category`、`due_date`、`completed_at`、`visible_to_member_category_id`（text[]）。

- **Task → Job bridge:** Tasks can be promoted to the public Job Board. When a family needs outside help, they use "Find Help" to create a `job_posting` linked via `job_id`.
- **任务 → 工作桥接:** 任务可以推广到公开工作板。当家庭需要外部帮助时，通过"寻找帮助"创建通过 `job_id` 链接的 `job_posting`。

---

## 10. BOOKINGS — Scheduling Care Sessions / 预约——安排护理会议

The `booking` table stores appointments between a client (family) and a provider (caregiver).

`booking` 表存储客户（家庭）和提供者（护理人员）之间的预约。

- **Who's who:** `user_id` = the client who booked, `provider_id` = the caregiver, `care_recipient_id` = the person actually receiving care (could be different from the client, e.g. the client's parent).
- **谁是谁:** `user_id` = 预约的客户，`provider_id` = 护理人员，`care_recipient_id` = 实际接受护理的人（可能与客户不同，如客户的父母）。

- **Status flow:** `pending` → `confirmed` → `completed` (or `cancelled` at any point).
- **状态流转:** `pending` → `confirmed` → `completed`（或任何时候 `cancelled`）。

- **Permission rules:** Clients can only Cancel. Providers can Confirm and Complete. Rescheduling resets status to pending.
- **权限规则:** 客户只能取消。提供者可以确认和完成。重新安排将状态重置为 pending。

- Schedule fields: `start_time`, `end_time`, `appointment_date`, `appointment_time`, `duration_hour`, `service_type`, `hourly_rate`, `total_cost`, `location`, `special_instruction`.
- Payment: `payment_status`, `payment_intent_id` (Stripe).

---

## 11. PROVIDER DASHBOARD — The Provider's Command Center / 提供者仪表板——提供者的指挥中心

Route: `/provider-dashboard`. Only visible to users with `is_care_provider = true`.

路由：`/provider-dashboard`。仅对 `is_care_provider = true` 的用户可见。

- **Incoming bookings:** Uses `useProviderBookings()` — queries bookings where current user is `provider_id`. Provider can confirm or complete.
- **收到的预约:** 使用 `useProviderBookings()` — 查询当前用户是 `provider_id` 的预约。提供者可以确认或完成。

- **Availability:** Two tables: `provider_availability` (weekly recurring slots with `day_of_week`, `start_time`, `end_time`, `is_available`, optional `specific_date` for overrides) and `provider_availability_setting` (general settings like buffer time, advance booking limits).
- **可用性:** 两个表：`provider_availability`（每周循环时段）和 `provider_availability_setting`（通用设置如缓冲时间、提前预约限制）。

- **Earnings:** `provider_payout` table tracks payments. Queried by `provider_id`.
- **收入:** `provider_payout` 表追踪支付。通过 `provider_id` 查询。

- **Become a provider:** Route `/become-caregiver`. A form that sets `is_care_provider = true` (initially `provider_is_active = false`) plus provider fields.
- **成为提供者:** 路由 `/become-caregiver`。表单将 `is_care_provider` 设为 true（初始 `provider_is_active = false`）加上提供者字段。

---

## 12. MESSAGING — Direct Messages / 消息——私信

Two tables work together:

两个表配合：

- **`conversation`:** One row per unique pair of users. Has `participant_1_id`, `participant_2_id`, `last_message_at`.
- **`conversation`:** 每对唯一用户一行。有 `participant_1_id`、`participant_2_id`、`last_message_at`。

- **`direct_message`:** Individual messages. `sender_id`, `receiver_id` (for DMs), `group_id` (messages can also belong to a care group), `message_content`, `attachment_url`, `message_type`, `read_at`, `reply_to_id`.
- **`direct_message`:** 单条消息。`sender_id`、`receiver_id`（私信）、`group_id`（消息也可属于护理小组）、`message_content`、`attachment_url`、`message_type`、`read_at`、`reply_to_id`。

- Auto-refresh every 10 seconds via `refetchInterval`. Unread count = messages where `sender_id != currentUser` and `read_at` is null.
- 每 10 秒通过 `refetchInterval` 自动刷新。未读数 = `sender_id != currentUser` 且 `read_at` 为 null 的消息。

---

## 13. CARED ONES — The Patient Management Toolkit / 被照顾者——患者管理工具箱

Route: `/cared-ones`. A comprehensive dashboard for managing each care recipient. The user picks a cared-one profile, then accesses ten specialized CRUD cards.

路由：`/cared-ones`。管理每个护理接受者的综合仪表板。用户选择一个被照顾者档案，然后访问十个专业 CRUD 卡片。

### 13a. Medications / 用药管理

- **`medicine`:** Prescriptions for a cared one. `user_id` = the cared one. Fields: `name`, `dosage`, `frequency`, `time_slot` (text[] for scheduled times), `note`, `form` (pill/liquid/etc), `category`.
- **`medicine_log`:** Tracks whether meds were taken. `medicine_id` → links to medicine, `status` (taken/skipped/missed), `log_date`, `logged_by` (who recorded), `user_id` (cared one), note (note)

### 13b. Wellness Check-Ins / 健康签到

- **`checkin_log`:** Mood, energy, pain, sleep tracking. `user_id` = cared one, `recorded_by` = who did the check-in. Fields: `mood` (emoji), `energy_level`, `pain_level`, `sleep_hours`, `note`.
- NOTE: `recorded_by` lacks a native FK, so app code must manually join reporter profiles.
- 注意：`recorded_by` 缺少原生外键，应用代码必须手动 join 记录者档案。

### 13c. Health Vitals / 健康体征

- **`health_vital`:** Vital signs (blood pressure, temperature, weight, blood sugar). `user_id` = cared one, `recorded_by` = recorder. Fields: `vital_type`, `value`, `unit`, `note`.

### 13d. Care Tips / 护理提示

- **`care_tip`:** Notes and tips for caring for the patient. `user_id` = cared one, `created_by` = author. Fields: `title`, `content`, `category`, `is_pinned`.

### 13e. Care Plans & Goals / 护理计划和目标

- **`care_plan`:** Plans with goals. `user_id` = cared one. Fields: `title`, `description`, `status`.
- **`care_plan_goal`:** Individual goals within a plan. `care_plan_id` → links to plan. Fields: `title`, `description`, `status`.

### 13f. Care Notes / 护理笔记

- **`care_note`:** Free-form notes about condition. `user_id` = cared one, `created_by` = author. Fields: `title`, `content`, `category`.

### 13g. Emergency Contacts / 紧急联系人

- **`emergency_contact`:** `user_id` = cared one. Fields: `name`, `phone`, `relationship`, `is_primary`.

### 13h. Documents / 文档

- **`cared_one_document`:** Uploaded files (medical records, insurance). `user_id` = cared one, `uploaded_by` = uploader. Fields: `title`, `document_type`, `file_url`, `notes`.

### 13i. Visit Log / 访问日志

- **`activity_log`:** Activity/visit tracking. `cared_one_id` = cared one, `user_id` = who performed it (NOTE: this table uses `user_id`, not `recorded_by`). Fields: `activity_type`, `description`, `duration_minutes`.

---

## 14. GPS TRACKING & SAFE ZONES / GPS 追踪和安全区域

Route: `/gps-tracking`. Location safety features, critical for dementia care where patients may wander.

路由：`/gps-tracking`。位置安全功能，对失智症护理至关重要，因为患者可能走失。

- **`location_share`:** GPS entries. `user_id`, `latitude`, `longitude`, `accuracy`, `timestamp`, `is_emergency`. Multiple rows per user = location history. Most recent = "current" location.
- **`location_share`:** GPS 记录。每用户多行 = 位置历史。最新行 = "当前"位置。

- **Scoped visibility:** Users only see locations of people in their care groups. App fetches group memberships first, then filters location data to those user IDs.
- **范围可见性:** 用户只能看到同一护理小组成员的位置。

- **`safe_zone`:** Geofenced areas for cared ones. `user_id` = cared one, `created_by` = setter. Key fields: `name`, lat/lng, `radius` (meters), `zone_type`, `shape_type`, `polygon_points`, `is_active` (soft delete), schedule fields, `notify_on_enter`, `notify_on_exit`.
- **`safe_zone`:** 被照顾者的地理围栏区域。关键字段：名称、经纬度、半径（米）、区域类型、形状、是否活跃、计划、进入/离开通知。

- **`safe_zone_alert`:** Triggered when a cared one crosses a zone boundary. `user_id` = cared one, `safe_zone_id`, `is_read`, `acknowledged_by`, `acknowledged_at`.
- **`safe_zone_alert`:** 被照顾者越过区域边界时触发。

- **`location_request`:** Ask someone to share location. `user_id` = target, `requester_id` = asker, `status` (pending/approved/emergency_approved/cancelled), `expire_at`, `is_emergency`.

- **`cared_one_location_sharing`:** Per-cared-one location sharing preferences.

---

## 15. JOB BOARD / 工作板

Route: `/jobs`. Families post care job listings, providers apply.

路由：`/jobs`。家庭发布护理工作列表，提供者申请。

- **`job_posting`:** `posted_by` = family user. Fields: `title`, `description`, `status` (open/closed), `job_source_type` (general or from care task), `location`, `start_date`, `care_recipient_id`, `linked_task_id`, `linked_group_id`.
- **`job_application`:** `job_id` → posting, `applicant_id` = provider, `cover_letter`, `status` (pending/accepted/rejected). Duplicates prevented in app code.

---

## 16. REVIEWS / 评价

The `review` table stores provider ratings. `entity_id` = provider being reviewed, `reviewer_id` = who wrote it.

`review` 表存储提供者评分。`entity_id` = 被评价的提供者，`reviewer_id` = 评价者。

- Fields: `rating` (1-5), `comment`, `response_text` (provider's reply).
- **IMPORTANT:** `rating_average` and `rating_count` on the profile are NOT auto-calculated. They must be manually recalculated when reviews change.
- **重要:** profile 上的 `rating_average` 和 `rating_count` 不会自动计算。评价变更时必须手动重新计算。

---

## 17. NOTIFICATIONS / 通知

- **`notification`:** Per-user in-app notifications. `user_id`, `type` (booking_request, booking_confirmed, booking_cancelled, etc.), `title`, `content`, `link_url`, `is_read`.
- Created as side effects of other actions (e.g. new booking → notification for provider). Failures are caught and ignored (best-effort).
- 作为其他操作的副作用创建（如新预约 → 给提供者通知）。失败被捕获并忽略（尽力而为）。

---

## 18. FAVORITES / 收藏

- **`saved_provider`:** Users bookmark providers. `user_id` + `provider_id` junction. Toggle to save/unsave.
- **`saved_provider`:** 用户收藏提供者。`user_id` + `provider_id` 关联。切换收藏/取消收藏。

---

## 19. DEMENTIA-SPECIFIC FEATURES (Challenged brand only) / 失智症特有功能（仅 Challenged 品牌）

These components live in `src/components/challenged/` and render only when `site.id === "challenged"`.

这些组件在 `src/components/challenged/` 中，仅当 `site.id === "challenged"` 时渲染。

- **Symptom Tracker / 症状追踪器:** Logs behavioral symptoms in `symptom_log`. Fields: `cared_one_id`, `symptom_type`, `severity` (1-10), `notes`, `trigger`, `recorded_by`.
- **Caregiver Wellness / 照顾者健康:** Tracks caregiver stress/mood in `caregiver_wellness_log`. Fields: `user_id` (caregiver), stress/mood/sleep/notes. AI intervention triggers at stress ≥ 7/10.
- **Dementia Stage Selector / 失智症阶段:** Persists the patient's stage (Early/Middle/Late) in `profile.dementia_stage`. Used to adapt UI complexity.
- **Other components / 其他组件:** AI Care Tips, AI Daily Summary, AI Insights Panel, AI Medication Helper, Cognitive Exercises, Daily Timeline, Dementia Assistant, Emergency SOS, Loved One Simple View (high-contrast simplified UI), Patient Summary Card.

---

## 20. APP ROUTES & LAYOUT / 应用路由和布局

### Public routes (no login) / 公开路由

| Route               | Purpose / 用途                    |
| ------------------- | --------------------------------- |
| `/`                 | Landing page / 首页               |
| `/search`           | Marketplace search / 市场搜索     |
| `/caregiver/:id`    | Provider profile / 提供者详情     |
| `/auth`             | Login & signup / 登录注册         |
| `/reset-password`   | Password reset / 重置密码         |
| `/how-it-works`     | How platform works / 平台介绍     |
| `/trust-safety`     | Trust & safety info / 信任与安全  |
| `/become-caregiver` | Provider application / 提供者申请 |

### Protected routes (must be logged in) / 受保护路由

| Route                 | Purpose / 用途                                 |
| --------------------- | ---------------------------------------------- |
| `/dashboard`          | Main dashboard / 主仪表板                      |
| `/care-circle`        | Care Groups (10 tabs) / 护理小组（10个标签页） |
| `/cared-ones`         | Cared-one management (10 cards) / 被照顾者管理 |
| `/bookings`           | My bookings / 我的预约                         |
| `/messages`           | Direct messages / 私信                         |
| `/gps-tracking`       | GPS & safe zones / GPS和安全区域               |
| `/notifications`      | Notifications / 通知                           |
| `/favorites`          | Saved providers / 收藏的提供者                 |
| `/profile`            | User settings / 用户设置                       |
| `/jobs`               | Job board / 工作板                             |
| `/provider-dashboard` | Provider management / 提供者管理               |

### Layout system / 布局系统

- Protected dashboard routes get `DashboardLayout` with `AppSidebar` (sidebar navigation).
- Public pages get `AppLayout` only (header + content, no sidebar).
- 受保护的仪表板路由使用 `DashboardLayout`（带侧边栏导航）。公开页面仅使用 `AppLayout`（标题 + 内容，无侧边栏）。

---

## 21. KEY RULES SUMMARY / 关键规则总结

| Rule / 规则                     | Details / 详情                                                                                     |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| Schema / 数据库架构             | All data in `care_connector` schema. Not `public`.                                                 |
| Clients / 客户端                | `careDb` for data, `careAuth` for auth. Both from `external-client.ts`.                            |
| Migrations / 迁移               | If schema changes are needed, write SQL and tell developer to run it manually.                     |
| Mocks / 模拟                    | NEVER fake data. Ask for access if blocked.                                                        |
| Timestamps / 时间戳             | All tables use `created_at` and `updated_at`.                                                      |
| Performer tracking / 执行者追踪 | Always pass current user ID to `recorded_by` / `logged_by` / `user_id`. Never rely on DB defaults. |
| Owner membership / 所有者成员   | Auto-created by DB trigger when creating a care group. Do NOT insert duplicate.                    |
| Brand text / 品牌文本           | Always from `useSite()` or `t()`. Never hardcode.                                                  |
