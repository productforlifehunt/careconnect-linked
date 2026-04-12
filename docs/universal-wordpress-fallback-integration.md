# Universal WordPress Fallback Integration Guide

## Purpose

This guide describes a reusable pattern for adding **WordPress as a backup authentication and backup data source** to a React application that normally uses another primary backend such as Supabase, Firebase, a custom API, or another headless service.

The goal is to make the app continue working when:

- the primary auth provider is unavailable
- the primary database is degraded or down
- a user belongs to a WordPress-backed multisite tenant
- a staged migration is moving from WordPress to another backend, or vice versa

This guide is intentionally **site-agnostic** and **multisite-friendly** so it can be reused across workspaces and tenants.

---

# Why use WordPress fallback

## Benefits

- **Business continuity**
  - Users can still sign in and access essential data if the primary backend is unavailable.

- **Safer migrations**
  - Teams can move gradually between WordPress and another backend without a hard cutover.

- **Tenant flexibility**
  - In multisite environments, some sites may rely more heavily on WordPress-native data than others.

- **Operational resilience**
  - Read-heavy app pages can still render with fallback data even when write paths are partially degraded.

- **Reduced lock-in**
  - The frontend is no longer tightly coupled to a single backend vendor.

## Best use cases

- Marketplace or directory apps
- Community and article platforms
- Booking or service marketplaces
- Multisite apps where some tenants are WordPress-first
- Hybrid apps where WordPress remains the editorial or backup system of record

---

# Core design principle

Treat WordPress fallback as a **first-class backup backend**, not as an ad hoc patch.

That means:

- auth source must be explicit
- data source switching must be centralized
- fallback rules must be deterministic
- UI must indicate backup mode
- app hooks must return the same shape regardless of source
- degraded write operations must fail safely or become read-only when needed

---

# Recommended architecture

## Primary components

- **Primary backend**
  - Your normal auth/data provider.

- **WordPress multisite**
  - Backup auth and backup content/data source.

- **Custom JWT auth plugin**
  - A small WordPress plugin exposing custom auth endpoints for login and token validation.

- **Frontend auth context**
  - Tracks current auth state and current auth source.

- **Frontend WP data service**
  - Central wrapper for WordPress REST API access.

- **Hook-level source switching**
  - Existing React Query hooks decide whether to fetch from the primary backend or WordPress.

## Required frontend state

At minimum, the frontend auth layer should expose:

- `user`
- `session`
- `isAuthenticated`
- `isLoading`
- `authSource`
  - `primary`
  - `wordpress`
  - `null`
- `fallbackReason`
  - optional but strongly recommended
- `primaryBackendHealthy`
  - optional but strongly recommended

---

# Fallback modes

## Mode 1: Normal primary mode

Use the primary backend when:

- health check passes
- sign-in succeeds
- session restoration succeeds

## Mode 2: WordPress auth fallback

Use WordPress auth when:

- primary login fails due to outage, timeout, transport failure, or auth service degradation
- a tenant is configured to prefer WordPress auth
- a user explicitly signs in with WordPress credentials

## Mode 3: WordPress data fallback

Use WordPress data when:

- `authSource === "wordpress"`
- primary backend health check fails
- a tenant is configured as WordPress-backed
- a page is explicitly marked as WordPress-sourced

## Mode 4: Degraded hybrid mode

Use this when:

- reads come from WordPress
- some writes remain disabled
- pages stay usable but some editing or mutation flows are intentionally limited

---

# Custom JWT plugin: what it should do

A reusable WordPress fallback setup needs a small custom plugin for auth.

## Plugin responsibilities

- authenticate a username/email + password against WordPress
- issue a signed token
- validate an existing token
- return normalized user payload fields
- work correctly in multisite
- optionally expose site/blog context
- optionally expose roles/capabilities used by the frontend

## Minimum endpoints

### 1. Login endpoint

`POST /wp-json/cc/v1/token`

Request body:

```json
{
  "username": "string",
  "password": "string"
}
```

Successful response:

```json
{
  "success": true,
  "token": "jwt-token",
  "expires": 1712345678,
  "user_id": 123,
  "user_email": "user@example.com",
  "user_login": "username",
  "user_display_name": "User Name"
}
```

### 2. Validate token endpoint

`POST /wp-json/cc/v1/token/validate`

Request body:

```json
{
  "token": "jwt-token"
}
```

Successful response:

```json
{
  "success": true,
  "user_id": 123,
  "user_email": "user@example.com",
  "user_login": "username",
  "user_display_name": "User Name"
}
```

## Recommended optional response fields

For a more universal multisite implementation, add:

```json
{
  "site_id": 4,
  "site_slug": "tenant-a",
  "roles": ["subscriber"],
  "capabilities": ["read"],
  "network_user": true
}
```

These help the frontend choose tenant-specific behavior without extra round-trips.

---

# Multisite requirements for the plugin

For WordPress multisite, the plugin should be:

- **network-activated** when shared across all tenant sites
- aware of the current site context
- careful about cross-site auth assumptions
- explicit about whether tokens are site-scoped or network-scoped

## Recommended multisite policy

Choose one and document it clearly:

### Option A: Site-scoped token

- token is valid only for one site/blog
- best when each tenant is isolated
- simpler permission reasoning

### Option B: Network-scoped token

- token is valid across multiple sites in the network
- useful for shared user accounts across tenants
- requires clearer site resolution logic in the frontend

## Recommendation

Default to **site-scoped tokens** unless there is a strong reason to share session behavior across sites.

---

# Frontend auth contract

## Local storage

Store at least:

- WP token
- normalized WP user object
- optional current site/blog metadata
- optional fallback reason

Example keys:

- `wp_token`
- `wp_user`
- `wp_site`
- `auth_source`

## Auth context behavior

The auth provider should support:

- `loginPrimary(email, password)`
- `loginWordPress(username, password)`
- `logout()`
- `restoreSession()`
- `authSource`
- `primaryBackendHealthy`

## Recommended login sequence

### Primary sign-in button flow

1. attempt primary login
2. if success, use primary mode
3. if failure is outage-like or configured for fallback, attempt WordPress login
4. if WordPress login succeeds, set `authSource = "wordpress"`
5. store a fallback reason for UI and diagnostics
6. navigate into app normally

### Explicit WordPress sign-in flow

1. call WordPress login directly
2. set `authSource = "wordpress"`
3. store token and user payload
4. navigate into app normally

## Recommended fallback reason values

- `primary_login_failed`
- `primary_healthcheck_failed`
- `tenant_prefers_wordpress`
- `manual_wordpress_login`
- `primary_session_restore_failed`

---

# Frontend health check design

The app should periodically or opportunistically test the primary backend.

## When to check

- app startup
- before primary login
- after session restore failure
- before critical data loads
- on a timer if needed

## What counts as unhealthy

- network error
- DNS failure
- timeout
- 5xx response
- auth service unavailable
- transport-level failure

## What should not trigger fallback by default

- normal invalid credentials
- user-specific authorization failures
- expected 4xx business logic responses

This distinction matters. Do not treat every primary login error as an outage.

---

# WP data service design

Create a dedicated service layer for all WordPress reads and writes.

## Responsibilities

- attach JWT token when present
- build endpoint URLs consistently
- normalize API response shapes
- convert WordPress objects into app-level objects
- catch errors and return safe empty values where appropriate
- keep all fallback logic out of UI components

## Recommended service functions

Examples:

- `wpFetchDashboardStats()`
- `wpFetchBookings()`
- `wpFetchTasks()`
- `wpFetchProviders()`
- `wpFetchGroups()`
- `wpFetchNotifications()`
- `wpFetchPosts()`
- `wpFetchComments()`
- `wpFetchFacilities()`
- `wpFetchProfile()`
- `wpUpdateProfile()`

## Important rule

Return the **same app-level shape** as the primary backend hooks wherever possible.

That means if the app expects:

```ts
{
  id: string,
  title: string,
  created_at: string
}
```

then the WordPress data service should map WP responses into that shape before hooks return them.

---

# Hook-level integration pattern

Each existing read hook should switch sources centrally.

## Recommended pattern

```ts
useQuery({
  queryKey: ["providers"],
  queryFn: async () => {
    if (isWordPressMode()) return wpFetchProviders();
    return primaryFetchProviders();
  },
});
```

## Good candidates for fallback

- dashboard stats
- bookings
- tasks
- cared ones / family members
- providers
- care groups / teams
- conversations if available
- notifications
- posts / articles
- facilities
- service categories
- profile reads

## Mutation policy

Mutations need an explicit policy. Pick one per feature:

### Option A: WP mutation supported

If the WP API supports it, allow writes.

### Option B: Read-only fallback

If no safe WP write path exists, disable the mutation in WP mode and show a clear message.

### Option C: Queue and retry later

Useful only if your app already has a reliable retry queue.

## Recommendation

Default to **read fallback first**, then add writes only where the WordPress API contract is stable.

---

# Backup mode UI requirements

The user should know which backend is active.

## Show at least one subtle indicator

Examples:

- header badge: `WP`
- account menu label: `Backup Mode`
- tooltip: `Using WordPress backup services`

## Optional diagnostics

For admins or internal users, also expose:

- active auth source
- fallback reason
- primary backend health state
- last health check time

---

# CORS and proxy strategy

This is one of the most common failure points.

## Development

Use a local proxy when the frontend runs on a different origin.

Example approach:

- React/Vite requests `/wp-api/...`
- dev server proxies to `https://tenant-domain.com/wp-json/...`

This avoids browser CORS failures during local development.

## Production

Choose one:

- enable proper CORS headers on WordPress REST responses
- place frontend and WordPress behind the same origin/reverse proxy
- route API requests through your backend gateway

## Recommendation

For long-term reliability, prefer either:

- same-origin deployment, or
- reverse-proxy routing through one domain

---

# WordPress REST API requirements

Your fallback only works if the relevant WP endpoints are actually accessible.

## Ensure these are configured correctly

- custom post types are exposed in REST
- ACF fields are available if required
- custom taxonomies are exposed if needed
- authenticated endpoints accept the JWT token
- permissions are correct for each route
- response shape is stable enough to normalize

## Common WordPress-side causes of failure

- CPT not registered with `show_in_rest = true`
- route permissions too restrictive
- auth header stripped by server/proxy
- CORS headers missing
- WooCommerce or Dokan routes requiring different auth/capability handling
- multisite site context not resolved properly

---

# Recommended universal rollout steps

## Phase 1: Auth only

- build/install custom JWT plugin
- expose login and validate endpoints
- implement frontend WP auth service
- restore WP sessions on app startup
- add `authSource`
- add visible backup mode badge

## Phase 2: Read fallback

Wire the most important read hooks first:

- dashboard
- profile
- bookings
- providers
- content pages
- notifications

## Phase 3: Health-based switching

- add primary backend health check
- auto-switch to WP when primary is degraded
- track fallback reason

## Phase 4: Mutation support

- add profile updates
- add selected content writes if safe
- keep unsupported features explicitly disabled in WP mode

## Phase 5: Multisite hardening

- confirm plugin is network-activated where needed
- validate each site’s REST exposure
- confirm site-specific data mapping
- test each tenant separately

---

# Testing checklist

## Authentication

- primary login succeeds in healthy mode
- WordPress login succeeds directly
- primary failure triggers WP fallback when appropriate
- invalid credentials do not incorrectly trigger outage mode
- logout clears WP token and state
- protected routes redirect when neither session exists

## Data reads

- dashboard loads in WP mode
- profile loads in WP mode
- providers load in WP mode
- groups load in WP mode
- posts/articles load in WP mode
- notifications load in WP mode
- facilities load in WP mode
- empty-state pages render cleanly when WP returns no data

## Data writes

- supported mutations succeed in WP mode
- unsupported mutations fail clearly and safely
- no page crashes when a mutation is blocked in backup mode

## Resilience

- primary backend can go down after app load and fallback still works
- session restore succeeds for stored WP token
- health check does not flap excessively
- source switching does not corrupt cache state

## Multisite

- token behavior is correct per site
- tenant routing resolves the correct WP base URL
- data does not bleed across sites
- each site has the required CPTs/routes enabled

---

# Troubleshooting guide

## Problem: WordPress login works but data requests fail

Likely causes:

- CORS on WordPress REST endpoints
- missing auth header forwarding
- route permission callback returning forbidden
- CPT not exposed in REST

## Problem: some fallback pages work, others show empty data

Likely causes:

- that WP route is unavailable
- response shape changed
- hook not yet wired to WP fallback
- normalization function missing fields

## Problem: multisite users log in but see wrong site data

Likely causes:

- token treated as network-wide without site scoping
- current site resolution is wrong
- frontend is using the wrong base URL for the tenant

## Problem: app keeps switching between primary and WP

Likely causes:

- health check is too aggressive
- timeout threshold too low
- cache invalidation strategy is unstable
- app treats all 4xx errors as outages

---

# Universal implementation checklist

## WordPress side

- custom JWT plugin installed
- login endpoint working
- token validation endpoint working
- network activation decision documented
- REST routes exposed for all required data
- auth headers preserved by server/proxy
- CORS or reverse proxy configured

## Frontend side

- auth context supports multiple auth sources
- fallback reason is stored
- WordPress auth service implemented
- WordPress data service implemented
- critical hooks wired to fallback
- backup mode badge visible
- health check implemented
- empty states handled cleanly

## Operations

- fallback behavior documented
- tenant-specific config documented
- test accounts prepared per site
- recovery/runbook documented for outages

---

# Recommendation for other workspaces

When reusing this pattern in another multisite workspace:

1. start with auth fallback only
2. wire the highest-value read hooks next
3. normalize shapes in one service layer
4. make backup mode visible in UI
5. define explicit mutation policy per feature
6. test each tenant independently
7. do not rely on direct browser-to-WP calls without a proxy or CORS plan

---

# Minimal reference implementation shape

## Frontend pieces

- `src/services/wp-auth.ts`
- `src/services/wp-data.ts`
- `src/contexts/AuthContext.tsx`
- existing hooks updated with source switching
- header/app shell badge for backup mode

## Backend pieces

- WordPress custom JWT plugin
- REST-exposed CPTs/taxonomies/ACF fields
- multisite-aware configuration
- CORS or reverse-proxy solution

---

# Final rule

A WordPress fallback system is only reliable if it is treated like a real backend integration.

Do not scatter fallback logic across pages.

  Centralize it in:

  - auth context
  - data service
  - hook wrappers
  - health checks
  - normalized response mapping

  That is what makes the pattern reusable across sites, tenants, and workspaces.

  ---

# 6. WordPress 和 WooCommerce 的数据结构到底有多不优雅？

一句话说：**非常不优雅，但非常能用**。

WordPress 最早是博客系统，所以它天然更擅长“内容”，不擅长“业务对象”。很多本该是独立表的东西，最后都被塞进了 `posts`、`postmeta`、`users`、`usermeta` 这一套通用结构里。WooCommerce 早期也沿用了这套思路，把订单当成一种特殊 post 来存，结果就是扩展方便，但查询、统计、关联、性能和语义都不漂亮。

如果你把 WordPress 当后台，会发现它的核心问题不是“不能做业务”，而是**业务能做，但数据层经常像在绕路**。你经常需要从 post 里取主对象，再去 meta 里拼字段，再从 user 或 plugin 表里拼关系。开发者看着难受，但中小体量项目通常依然够用。

## 6.1 为什么它依然值得用

- **[成熟]** 后台、权限、媒体、页面、插件生态全是现成的
- **[电商现成]** WooCommerce 已经把商品、订单、支付、优惠券、结账、后台运营这些最难的部分做完了
- **[适合早期项目]** 比起自建一套商城和后台，直接用更快更稳
- **[缺点主要在开发者侧]** 大多数时候，不优雅是开发者在忍，不是用户在忍

---

# 7. SupaPress 混合后端该怎么设计

SupaPress 的核心不是“把 WordPress 当数据库硬用”，而是**把 WordPress 当现成业务后台，把 Supabase 当更清晰的应用层数据后台**。

- **[WordPress / WooCommerce]** 负责商品、订单、支付、优惠券、结账、后台运营
- **[Supabase]** 负责非电商数据、权限编排、实时能力、自定义业务逻辑
- **[前端]** 不直接暴露底层结构，只消费统一的业务对象

设计重点是：**前端看的是 `order`、`profile`、`booking`、`task`，不是 `postmeta`、`usermeta`、`_billing_email`。**

---

# 8. WooCommerce 订单系统案例：旧系统 vs 新系统

这是 WordPress 数据设计最典型的案例：**同样是订单，旧系统像“拿博客系统硬装电商”，新系统则更像正常后台。**

## 8.1 旧订单系统（Legacy）

旧 WooCommerce 把订单当成一种文章类型：

- **[主表]** `wp_posts`
- **[post_type]** `shop_order`
- **[字段]** 状态、金额、账单地址、支付信息等大量数据都在 `wp_postmeta`

问题也很明显：

- **[查询重]** 订单字段散落在 `posts + postmeta`
- **[语义差]** 订单明明是交易对象，却伪装成内容对象
- **[扩展痛苦]** 报表、筛选、性能优化都很别扭

## 8.2 新订单系统（HPOS, High-Performance Order Storage）

新 Woo 把订单迁移到专用表，例如：

- **[核心订单表]** `wc_orders`
- **[地址表]** `wc_order_addresses`
- **[操作/状态表]** `wc_order_operational_data`
- **[meta 表]** `wc_orders_meta`

这说明 WooCommerce 自己也承认：**订单不应该长期放在 post/meta 里。**

- **[内容对象]** 适合 CPT，比如页面、文章、公告
- **[交易对象]** 更适合专表，比如订单、支付、库存、退款
- **[启发]** WordPress 可以做后台，但真正高频、强事务的数据，最好别继续伪装成内容

## 8.3 对本项目的直接启示

在 SupaPress 里可以直接照这个思路做拆分：

- **[留在 WordPress / Woo]** 商品、订单、支付、结账、营销后台
- **[放到 Supabase]** 用户扩展资料、关系链、业务状态机、实时消息、非电商任务流
- **[统一 API 输出]** 前端永远拿业务对象，不直接碰 WordPress 内部字段

---

# 9. 简短结论

如果一句话总结 SupaPress：**用 WordPress/WooCommerce 承担已经被行业验证过的后台能力，用 Supabase 承担更清晰、更现代的应用层能力。**
