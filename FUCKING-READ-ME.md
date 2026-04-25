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

- **NEVER** use any Supabase database client for data. All data is in headless WordPress (JetEngine CCTs). Supabase is only used for Edge Functions (AI, voice, wp-proxy). Data fetching goes through `wp-proxy` Edge Function → WordPress REST API.
- **永远不要**用 Supabase 数据库存数据。所有数据在 headless WordPress 的 JetEngine CCT 中。Supabase 仅用于 Edge Functions（AI、语音、wp-proxy 桥接）。数据请求通过 `wp-proxy` Edge Function → WordPress REST API。

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

## 4. THE DATABASE — HEADLESS WORDPRESS + JETENGINE / 数据库——无头 WordPress + JetEngine

All application data lives in headless WordPress on the `careconnected` multisite subsite. There is **no Supabase database**. Supabase is only used for Edge Functions (AI proxies, voice, wp-proxy bridge).

所有应用数据都在 headless WordPress 的 `careconnected` 子站点中。**没有 Supabase 数据库**。Supabase 仅用于 Edge Functions（AI 代理、语音、wp-proxy 桥接）。

- **Storage model / 存储模型**: All custom tables are JetEngine **Custom Content Types (CCTs)**. Each CCT is a dedicated standalone MySQL table (`wp_{blog}_jet_cct_{slug}`), not WP postmeta. Fast indexed queries.
- **Relations / 关联**: 100% via JetEngine **Relations**. Never custom FKs, never join via raw IDs in code. Each relation auto-creates an indexed join table.
- **Author tracking / 作者追踪**: Use JetEngine CCT's built-in author field. Never add a custom `created_by` column when CCT author works.
- **E-commerce / 电商**: WooCommerce + Dokan only. Caregiver services are Woo products owned by the Dokan vendor (the user). Never custom-built carts/orders.
- **All CCT/Relation creation MUST be done via WP admin GUI in 90-year-old mode.** Never SQL, never REST shortcuts. JetEngine GUI auto-creates indexes and registers schemas — direct SQL bypasses these and breaks WP.
- **所有 CCT/Relation 的创建必须在 WP 后台 GUI 用 90 岁老爷爷模式手动点击创建。** 绝不直接 SQL，绝不走 REST 捷径。

---

## 5. CORE DATA DICTIONARY / 核心数据字典

This is the single source of truth for every CCT, every field, every relation. If WordPress doesn't match this, WordPress is wrong — fix WordPress, never change this spec to match WP drift.

这是每一个 CCT、每一个字段、每一个关联的唯一真相。如果 WordPress 与此不符，是 WordPress 错了 —— 修 WordPress，绝不修改本规范去迁就 WP。

---

### 5.1 USER PROFILE & ROLES / 用户信息与角色

Core user fields use WordPress's built-in `wp_users` table. All extended fields live in CCT **`User's extended profile`**, linked 1:1 via Relation.

核心字段用 WP 自带 `wp_users`。扩展字段全部存在 CCT **`User's extended profile`**，通过 1:1 Relation 关联。

#### CCT: `User's extended profile`

| Field Label | Type | Options | Usage |
|---|---|---|---|
| Allow emergency location request | Radio | No / Yes | Yes = caregivers can pull location without per-request consent |
| Location share is on | Radio | No / Yes | Master toggle for sharing; flips to Yes when user accepts a share request |
| General user role | Checkbox | cared one / caring one | Onboarding hint only. Multi-select. Optional. Selecting "caring one" does NOT mean paid provider — most users are unpaid family caregivers |
| Is care provider | Radio | no / yes | yes = paid provider on marketplace |
| Care provider is active | Radio | no / yes | Default yes when becoming provider; user can pause via settings → hidden from marketplace search |
| Care provider is background checked | Radio | no / yes | Default no |
| Care provider's background check detail | Text | | |
| Care provider's cancellation policy | Text | | |
| Care provider's service area | Text | | |
| Care provider's starts hourly rate | Number | | "From $X/hr" |
| Care provider offers in-person service | Radio | No / Yes | Top-level marketplace filter |
| Care provider offers virtual service | Radio | No / Yes | Top-level marketplace filter |
| Care provider offers care service general type | Checkbox | Pet care and companion / Child care and companion / Adult care and companion / Elderly care and companion / Tutoring / Dementia care and companion / Housekeeping / Errand / Transportation / Medical Escort / In-person checkin / Remote checkin and medicine supervision | Care.com-style top categories |
| Care provider offers pet care for | Checkbox | Dogs / Cats / Small mammals / Birds / Fish | |
| Care provider offers dementia care type | Checkbox | In-person day care / In-person overnight care / In-person companion / In-person checkin / Household help / Remote companion / Remote medicine management / Remote checkin | |
| Care provider offers elderly care service | Checkbox | | |
| Care provider offers special needs care service | Checkbox | | |
| Care provider offers household help service | Checkbox | Housekeeping / Gardening | |
| Care provider offers errand service | Checkbox | | |
| Care provider offers transportation service | Checkbox | | |
| Care provider offers medical escort service | Checkbox | | |
| Care provider offers childcare service as | Checkbox | Babysitter / Nanny / Childminder | |
| Care provider offers childcare service | Checkbox | Cooking/Meal prep / Pick-up/Drop off / Light housekeeping / Activities (e.g. swimming) / Putting kids to bed / Homework help / Bathing / Virtual Care | |
| Care provider offers dog care service type | Checkbox | Sitting / Walking / Feeding / Day care / Transportation / Overnight sitting / Training / Grooming | |
| Care provider offers cat care service | Checkbox | Sitting / Walking / Feeding / Day care / Transportation / Overnight sitting / Training / Grooming | |
| Care provider offers small mammal care service type | Checkbox | | |
| Care provider offers bird care service | Checkbox | | |
| Care provider offers fish care service | Checkbox | | |
| Care provider is a doctor and offers care tip consultancy | Radio | | |
| Care provider is a doctor and offers accompany tip consultancy | Radio | | |
| Care provides can drive | Radio | No / Yes | |
| Care provides has own transportation | Radio | No / Yes | |
| Care provider is a Non-smoker | Radio | No / Yes | |
| Care provider is experienced with | Checkbox | Newborn (≤12mo) / Toddler (1-3y) / Early School (4-6y) / Primary (7-12y) / Teenager (12+) / Twins/Multiples / Special Needs Children | |
| Cared one's AI system prompt | Text | | User-authored AI system prompt. Lets users customize AI persona without us adding redundant preference fields |
| User enabled push notification | Radio | No / Yes | |
| User enabled email notification | Radio | No / Yes | |
| User enabled sms notification | Radio | No / Yes | |

**Provider service pricing rule / 护理者价格规则**: WooCommerce products store the **minimum** info only. We do **NOT** use Woo's attribute system. Service types and prices come from the user's `User's extended profile` (via Dokan vendor → user link). Woo product price defaults to empty; the frontend writes the final negotiated price into the Woo product price at "Add to cart" time.

#### Relation: `One user can have one user's extended profile`
- Parent: `Users` · Child: `User's extended profile` · Type: **One to One**

#### Relation: `One user can have many related cared ones`
- Parent: `Users` · Child: `Users` · Type: **Many to Many**
- Links a caregiver to the cared-ones they personally look after.

---

### 5.2 CARED-ONE INFORMATION CARDS / 被照顾者信息卡片

Each cared-one can have multiple info cards for different contexts (home, school, hospital).

#### CCT: `Cared one's information card`

| Field Label | Type | Options |
|---|---|---|
| Cared one's name | Text | |
| Cared one's description | Textarea | |
| Cared one's information card name | Text | |
| Status | Radio | Draft / Active / Paused |
| Displays location | Radio | No / Yes |

#### Relation: `One cared one can have many related cared one's information cards`
- Parent: `Users` · Child: `Cared one's information card` · Type: **One to Many**

#### Relation: `One cared one's information card can have many related cared one's emergency contact persons`
- Parent: `Cared one's information card` · Child: `Users` · Type: **One to Many**
- Default = all emergency contacts. User picks subset per card or adds new.

---

### 5.3 CALENDAR EVENTS / 日历事件

No aggregation table. Each event is one CCT row.

#### CCT: `User's calendar event`

| Field Label | Type | Options |
|---|---|---|
| Title | Text | |
| Description | Textarea | |
| Start at | Datetime | |
| End at | Datetime | |
| All day | Checkbox | |
| Event type | Text | |
| Location | Text | |
| Timezone | Text | |
| Status | Select | confirmed / tentative / cancelled |
| Priority | Select | normal / low / normal / high / urgent |
| Color | Colorpicker | |
| RRULE | Text | iCal RRULE |
| RRULE Until | Datetime | |
| EXDATES | Textarea | |
| RDATES | Textarea | |
| Recurrence ID | Text | |
| Show as | Select | busy / free / tentative / oof |
| Visibility | Select | default / public / private / confidential |
| Reminders | Textarea | |
| Is availability | Radio | Yes / No |
| Availability note | Text | |
| RSVP required | Radio | Yes / No |
| Allow comments | Radio | Yes / No |
| External source | Select | internal / google / outlook / apple |
| iCal UID | Text | |
| Sequence | Text | |
| ETag | Text | |
| Google Event ID | Text | |
| Meeting URL | Text | |
| Attachments | Textarea | |
| Last sync at | Datetime | |
| Sync token | Text | |
| Geo Lat | Text | |
| Geo Lng | Text | |
| Tags | Text | |
| Custom data | Textarea | |

#### Relations
- `One user can have many related user's calendar events` — Users → User's calendar event — **One to Many**
- `One user's calendar event can have many related invited users` — User's calendar event → Users — **One to Many**
- `One care task can have many related user's calendar events` — Care Task → User's calendar event — **One to Many**

---

### 5.4 PUBLIC CARE MARKETPLACE / 公开护理市场

The marketplace is just a frontend query against `User's extended profile`:
`Is care provider = yes AND Care provider is active = yes`.

No separate marketplace CCT.

---

### 5.5 CARE GROUPS / 护理群组

A care group is a discussion circle around a cared-one. The cared-one may or may not be a member.

#### CCT: `Care Group`

| Field Label | Type | Options |
|---|---|---|
| Name | Text | |
| Description | Textarea | |
| Group type | Radio | public / private |
| Join code | Text | |
| Status | Radio | active / no |

#### Relation: `One care group can have many related care group members`
- Parent: `Care Group` · Child: `Users` · Type: **Many to Many**

Relation custom fields:

| Field Label | Type | Options |
|---|---|---|
| care group's member display name | Text | |
| care group's member types | Checkbox | nothing special / owner / admin |
| care group's member roles | Checkbox | nothing special / cared one |
| care group's member invitation status | Radio | accepted / pending / declined (creator auto-set to accepted) |

#### CCT: `the related private member groups of one care group`
Sub-groups within a care group (family / friends / neighbors / caregivers). Posts/tasks can be visible to a subset of these.

| Field Label | Type |
|---|---|
| name | Text |
| description | Textarea |
| color | Colorpicker |

#### Relation: `One care group can have many related private member groups`
- Parent: `Care Group` · Child: `the related private member groups of one care group` · Type: **One to Many**

#### Relation: `One care group's private member group can have related members`
- Parent: `the related private member groups of one care group` · Child: `Users` · Type: **Many to Many**

#### CCT: `The related not too special posts of one care group`
General group posts (discussion / announcement / wish).

| Field Label | Type | Options |
|---|---|---|
| type | Checkbox | discussion (default) / announcement / wish |
| title | Text | |
| content | Text | |
| is pinned | Radio | no / yes |
| scheduled at | Datetime | |

Author = JetEngine CCT default author.

#### Relations
- `One care group can have many related not too special posts` — Care Group → posts — **One to Many**
- `One related not too special posts of one care group can have many related care group's private member groups that it's visible to` — posts → private member groups — **Many to Many**
- `One related not too special posts of one care group can have many related users that it's visible to` — posts → Users — **Many to Many**
- `One related not too special posts of one care group can have many related comments` — posts → Comment — **One to Many**

**Display name rule / 显示名规则**: All in-group actions display the user's `care group's member display name` from the relation, not the global username.

---

### 5.6 CARE TASKS / 护理任务

Same CCT used for group tasks, direct cared-one tasks, and tasks shared to the marketplace for help.

#### CCT: `Care Task`

| Field Label | Type | Options |
|---|---|---|
| title | Text | |
| description | Textarea | |
| Due date | Datetime | |
| Completed at | Datetime | |
| Status | Radio | pending / in progress / completed |

#### Relations
- `One care task can have many related cared ones` — Care Task → Users — **One to Many**
- `One care task can have many related assigned caregivers` — Care Task → Users — **One to Many**
- `One care group can have many related care tasks` — Care Group → Care Task — **Many to Many**
- `One care task can have many related care group's private member groups that it's visible to` — Care Task → private member groups — **Many to Many**
- `One care task can have many related users that it's visible to` — Care Task → Users — **Many to Many**
- `One care task can have many related comments` — Care Task → Comment — **One to Many**

Creator = CCT default author.

---

### 5.7 INSTANT CHAT / 即时对话

#### CCT: `Chat Conversion`

| Field Label | Type | Options |
|---|---|---|
| Chat type | Radio | One to One / Many users / AI |
| Chat name | Text | nullable |
| AI chat mode | Radio | nullable |
| Last message at | Datetime | |

Initiator = CCT author. Each Care Group auto-spawns one group chat.

#### Relation: `One care group can have one related group live chat conversation`
- Parent: `Care Group` · Child: `Chat Conversion` · Type: **One to One**

#### Relation: `One chat conversation can have many related chatters`
- Parent: `Chat Conversion` · Child: `Users` · Type: **Many to Many**

Relation custom fields:

| Field Label | Type | Options |
|---|---|---|
| The user joined this chat conversation at this time | Datetime | |
| The user last read this chat conversation at this time | Datetime | |
| The user has fucking muted this chat | Radio | No / Yes |

#### CCT: `Chat Message`

| Field Label | Type | Options |
|---|---|---|
| Chat message content | Text | |
| Chat message type | Radio | Text / Image / AI / System message / Price card |

`Image` = render image. `Price card` = negotiated price card between two parties. Created-at and author come from CCT defaults.

#### Relations
- `One chat conversation can have many related chat messages` — Chat Conversion → Chat Message — **One to Many**
- `One chat message can have one parent chat message that it is specifically replying to` — Chat Message → Chat Message — **One to Many** (only for AI/threaded; 1:1 and group chats just sort by time)

---

### 5.8 NOTIFICATIONS / 推送

#### CCT: `Notification`

| Field Label | Type | Options |
|---|---|---|
| Notification type | Radio | User chat / Booking / System / Location alert |
| Notification title | Text | |
| Notification content | Textarea | |
| Action url | Text | Click-through target |
| Notification is read | Radio | No / Yes |

**Brand/app routing / 品牌路由**: The sending app (CareConnector / ChallengeD / 忆畅) is determined by `app_area` looked up at send time and mapped to a `BRAND_CONFIG` constant in code (email sender name, push app icon, push title prefix). Brand identity is **not** stored on the notification row.

#### CCT: `User's notification token`

| Field Label | Type | Options |
|---|---|---|
| Endpoint or token | Text | |
| Notification provider | Radio | Web push notification / Firebase FCM / Apple APN / J Push / WeChat |
| Device label | Text | |
| Auth Key | Text | |
| P256dh | Text | |
| Is active | Radio | No / Yes |

One user → many tokens (phone + tablet + browser + WeChat). Tokens are user-level, not notification-level.

#### Relations
- `One user can have many related notifications to receive` — Users → Notification — **One to Many**
- `One user can have many related notification tokens` — Users → User's notification token — **One to Many**

---

### 5.9 MEDICATION / 用药管理

#### CCT: `Cared one's medicine schedule`

| Field Label | Type |
|---|---|
| Name | Text |
| Dosage | Text |
| Frequency | Text |
| Time slot | Textarea |
| Instructions | Text |
| Prescribing doctor | Text |
| Pharmacy | Text |
| Side effects | Textarea |
| Start date | Date |
| Is active | Radio |
| Note | Textarea |

#### Relation: `One cared one can have many related cared one's medicine schedules`
- Parent: `Users` · Child: `Cared one's medicine schedule` · Type: **One to Many**

#### CCT: `Care one's medicine log`

| Field Label | Type | Options |
|---|---|---|
| Status | Radio | Taken / Skipped / Missed |
| Note | Textarea | |

#### Relation: `One cared one's medicine schedule can have many related care one's medicine logs`
- Parent: `Cared one's medicine schedule` · Child: `Care one's medicine log` · Type: **One to Many**

---

### 5.10 CHECK-IN / 查看·探望

#### CCT: `Cared one's checkin schedule`

| Field Label | Type |
|---|---|
| Name | Text |
| Detail | Text |
| Frequency | Text |
| Time slot | Textarea |
| Instructions | Text |
| Start date | Date |
| Is active | Radio |
| Note | Textarea |

#### Relation: `One cared one can have many related cared one's checkin schedules`
- Parent: `Users` · Child: `Cared one's checkin schedule` · Type: **One to Many**

#### CCT: `Care one's checkin log`

| Field Label | Type | Options |
|---|---|---|
| Status | Radio | Checked / Skipped / Missed |
| Note | Textarea | |

#### Relation: `One cared one's checkin schedule can have many related care one's checkin logs`
- Parent: `Cared one's checkin schedule` · Child: `Care one's checkin log` · Type: **One to Many**

---

### 5.11 CARE NOTES / 护理记录

#### CCT: `Cared one's care note`

| Field Label | Type |
|---|---|
| Title | Text |
| Content | Textarea |

#### Relation: `One cared one can have many related cared one's care notes`
- Parent: `Users` · Child: `Cared one's care note` · Type: **One to Many**

---

### 5.12 CARE TIPS / 护理方法

#### CCT: `Cared one's care tip`

| Field Label | Type | Options |
|---|---|---|
| Title | Text | |
| Content | Textarea | |
| Category | Radio | tip / avoid |
| Is pinned | Radio | Yes / No |

#### Relation: `One cared one can have many related cared one's care tips`
- Parent: `Users` · Child: `Cared one's care tip` · Type: **One to Many**

---

### 5.13 CARE PLANS / 护理计划

#### CCT: `Cared one's care plan`

| Field Label | Type | Options |
|---|---|---|
| Title | Text | |
| Content | Textarea | |
| Is pinned | Radio | Yes / No |

#### Relation: `One cared one can have many related cared one's care plans`
- Parent: `Users` · Child: `Cared one's care plan` · Type: **One to Many**

---

### 5.14 EMERGENCY CONTACTS / 紧急联系人

#### CCT: `Cared one's emergency contact person`

| Field Label | Type |
|---|---|
| Name | Text |
| Content | Textarea |
| Phone | Text |
| Address | Text |
| Relationship | Text |
| Note | Text |

#### Relation: `One cared one can have many related cared one's emergency contact persons`
- Parent: `Users` · Child: `Cared one's emergency contact person` · Type: **One to Many**

---

### 5.15 DOCUMENTS / 文档

#### CCT: `Cared one's care document`

| Field Label | Type |
|---|---|
| Name | Text |
| Content | Textarea |

#### Relation: `One cared one can have many related cared one's care document`
- Parent: `Users` · Child: `Cared one's care document` · Type: **One to Many**

---

### 5.16 LOCATION TRACKING / 地点定位

#### CCT: `The current location of one user`
**Append-only**. Every location pull writes a new row. To get a user's "now" position = query latest row. To draw history = query all rows. No separate history table.

| Field Label | Type | Options |
|---|---|---|
| Latitude | Text | |
| Longitude | Text | |
| Accuracy meters | Text | |
| Altitude meters | Text | |
| Heading degrees | Text | |
| Speed | Text | |
| Is moving | Text | |
| Moving type | Text | |
| Platform | Text | |
| Battery level | Text | |
| Phone is charing | Text | |
| Address text | Text | |
| Captured at | Datetime | |
| Is so much of an emergency that we don't bother to ask for the cared one's permission | Radio | No / Yes — only allowed when the subject's `Allow emergency location request = Yes`. Stamps the snapshot so the user can later see which pulls bypassed consent |

#### Relation: `One user can have many related current location snapshots`
- Parent: `Users` · Child: `The current location of one user` · Type: **One to Many**

Relation custom fields:

| Field Label | Type | Options |
|---|---|---|
| User type | Radio | Not someone special / Cared one |

The subject (whose location it is) can be a cared-one OR another user sharing location peer-to-peer.

#### CCT: `Safe Zone` (covers both safe zones AND danger zones)

| Field Label | Type | Options |
|---|---|---|
| Zone type | Radio | Safe / Danger |
| Shape type | Radio | Radius / Polygon |
| Custom name | Text | |
| Custom description | Textarea | |
| Custom color | Colorpicker | |
| Latitude | Text | (radius center) |
| Longitude | Text | (radius center) |
| Radius meters | Number | default 100 |
| Polygon points | Textarea | |
| Notify on enter | Radio | Off / On |
| Notify on exit | Radio | Off / On |
| Schedule enabled | Radio | Off / On |
| Schedule start time | Datetime | |
| Schedule end time | Datetime | |
| Is active | Radio | No / Yes (overridden by schedule when scheduled window is active) |

Creator = CCT author.

#### Relation: `One user can have many related safe zones`
- Parent: `Users` · Child: `Safe Zone` · Type: **One to Many**

#### Location request (TBD CCT: `Location request`)

| Field | Type | Options |
|---|---|---|
| cared_one (relation) | Users | |
| requester (relation) | Users | |
| message | Text | |
| is_emergency | Radio | No / Yes |
| status | Radio | pending / approved / declined / cancelled / expired |
| expire_at | Datetime | |

#### Safe zone alert (TBD CCT: `Safe zone alert`)

| Field | Type | Options |
|---|---|---|
| cared_one (relation) | Users | |
| safe_zone (relation) | Safe Zone | |
| current_location (relation) | The current location of one user | |
| message | Text | |
| alert_type | Radio | entered_safe_zone / exited_safe_zone / entered_danger_zone / exited_danger_zone |
| expire_at | Datetime | |

---

### 5.17 CARE FACILITIES / 护理场所

#### CCT: `Care Facility`

| Field Label | Type | Options |
|---|---|---|
| name | Text | |
| detail | Textarea | |
| Care facility type | Checkbox | Adult Day Care / Assisted living / Home Care / Hospice / Independent living / Memory care / Nursing homes / Residential care homes / Senior Apartments |
| Care facility can care for dementia stage | Checkbox | Early-stage / Middle-stage / Late-stage |
| Care facility room type | Checkbox | Studio / One Bed Room / Two Bed Room / More Than Two Bed Room |
| Care facility provides room facility | Checkbox | Balcony / Toilet / Kitchen |
| Care facility provides community facility | Checkbox | swimming pool / active lifestyle / entertainment venue / laundry |
| Care facility people number | Checkbox | Less than 5 / 5-20 / 20-50 / More than 50 |
| location | | |
| address | | |

#### Relation: `One care facility can have many related facility members`
- Parent: `Care Facility` · Child: `Users` · Type: **Many to Many**

Relation custom fields:

| Field Label | Type | Options |
|---|---|---|
| Facility member type | Checkbox | nothing special / owner / admin (1 owner only; owner can promote admins with full owner powers) |
| Facility member role | Text | Self-described, e.g. "I'm the fucking boss" |

Submission only — the site owner reviews and processes manually.

#### CCT: `Review`

| Field Label | Type |
|---|---|
| title | Text |
| content | Textarea |
| rating | Number |

#### Relations
- `One care facility can have many related reviews` — Care facility → Review — **One to Many**
- `One review can have many related comments` — Review → Comment — **One to Many**

---

### 5.18 CARE JOBS / 护理工作

#### CCT: `Care Job`

| Field Label | Type | Options |
|---|---|---|
| title | Text | |
| description | Textarea | |
| Due date | Datetime | |
| Completed at | Datetime | |
| Status | Radio | pending / in progress / completed |

#### Relations
- `One care job can have many related cared ones` — Care Job → Users — **One to Many**
- `One care job can have many assigned caregivers` — Care Job → Users — **One to Many**
- `One care group can have many related care jobs` — Care Group → Care Job — **Many to Many**
- `One care job can have many related care tasks` — Care Job → Care Task — **Many to Many**
- `One care job can have many related comments` — Care Job → Comment — **One to Many**

Creator = CCT default author.

---

### 5.19 COMMUNITY & ARTICLES / 社区与文章

#### CCT: `Care community post`

| Field Label | Type | Options |
|---|---|---|
| Title | Text | |
| Content | Textarea | |
| Language | Radio | English / Simplified Chinese |
| app area | Checkbox | Global English / China |
| Care community post category | Checkbox | Discussion / Article |

Author = CCT default author.

#### Relation: `One care community post can have many related comments`
- Parent: `Care community post` · Child: `Comment` · Type: **One to Many**

---

### 5.20 CHALLENGED APP CONTENT (Dementia Knowledge Hub) / 失智症知识库

#### CCT: `Challenged App Content`

| Field Label | Type | Options |
|---|---|---|
| Title | Text | |
| Content | Textarea | |
| Language | Radio | English / Simplified Chinese |
| app area | Checkbox | Global English / China |
| App content type | Radio | Learn / Care and accompany tips / Find tips |
| Learn module number | Number | iSupport module ID (only when type=Learn; content is hardcoded in frontend, CCT only links study notes) |
| Learn lesson number | Number | iSupport lesson ID |
| Care and accompany tips category | Radio | Eating and drinking / Toileting and continence / Memory loss / Aggression / Depression, anxiety and apathy / Difficulty sleeping / Delusions and hallucinations / Repetitive behaviour / Changes in judgement |
| Find tips category | Radio | Wondering / Getting lost / Unwilling to return home |

**Learn rule**: Learn content is verbatim WHO iSupport shipped in frontend code. The CCT row exists only to anchor study notes — never put iSupport text in the CCT.

#### CCT: `User's study notes`

| Field Label | Type |
|---|---|
| Title | Text |
| Content | Textarea |

#### Relations
- `One Challenged App Content can have many related user's study notes` — Challenged App Content → User's study notes — **One to Many**
- `One Challenged App Content can have many related cared one's care tips` — Challenged App Content → Cared one's care tip — **One to Many** (lets users save a Find tip / Care tip into a specific cared-one's tip library; user picks the cared-one in frontend)

Author = CCT default author.

---

### 5.21 UNIVERSAL COMMENTS / 通用评论

One CCT serves every commentable entity (group posts, care tasks, care jobs, reviews, community posts).

#### CCT: `Comment`
Standard fields: content, author (CCT default).

#### Relation: `One comment can have many related comments`
- Parent: `Comment` · Child: `Comment` · Type: **One to Many** — for nested replies on any comment thread, regardless of parent entity.

Each commentable parent CCT defines its own `One {parent} can have many related comments` relation pointing into `Comment`.

---

### 5.22 ECOMMERCE / 电商

100% WooCommerce + Dokan. **No custom CCT.** Caregiver service offerings are Woo products owned by the Dokan vendor (= the user). All cart, checkout, order, payment, dispute, payout flows are headless via Woo/Dokan REST APIs.

100% WooCommerce + Dokan，**无自定义 CCT**。护理服务即 Dokan 店铺（用户本人）下的 Woo product。所有购物车、下单、支付、纠纷、分账逻辑均通过 Woo/Dokan REST API 走 headless。

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
| Schema / 数据库架构             | All data in headless WordPress JetEngine CCTs on the `careconnected` subsite. No Supabase DB.       |
| Data access / 数据访问          | Frontend → `wp-proxy` Supabase Edge Function → WP REST API. Auth = Simple JWT Login plugin.         |
| Migrations / 迁移               | If schema changes are needed, write SQL and tell developer to run it manually.                     |
| Mocks / 模拟                    | NEVER fake data. Ask for access if blocked.                                                        |
| Timestamps / 时间戳             | All tables use `created_at` and `updated_at`.                                                      |
| Performer tracking / 执行者追踪 | Always pass current user ID to `recorded_by` / `logged_by` / `user_id`. Never rely on DB defaults. |
| Owner membership / 所有者成员   | Auto-created by DB trigger when creating a care group. Do NOT insert duplicate.                    |
| Brand text / 品牌文本           | Always from `useSite()` or `t()`. Never hardcode.                                                  |
