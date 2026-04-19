# User's Calendar — CCT 字段清单 + Relation 表格

> **状态**: CCT 骨架已建 ✅ (`User's Calendar` / slug `users_calendar` / table `wp_5_jet_cct_users_calendar`)
> **下一步**: 你照下面清单到 JetEngine GUI 手动加 40 字段 + 8 条 Relation
> **入口**: https://app.challenged-dementia.com/careconnected/wp-admin/admin.php?page=jet-engine-cct → 点 `User's Calendar` 的 Edit

---

## 一、Meta Fields 清单 (35 个,JetEngine 自动加 _ID/cct_*,所以实际 35 + 5 系统字段)

> 操作: Edit CCT 页面 → Fields 区段 → 点 "New Field" → 填以下表格的一行 → 不要点 Update,继续加下一个 → 全部加完后再点 **Update Content Type**

### Batch A — 核心时间字段 (10 个)

| # | Label | Name | Type | Required | Default | 说明 |
|---|-------|------|------|----------|---------|------|
| 1 | Title | `title` | Text | ✅ | — | 事件标题 |
| 2 | Description | `description` | Textarea | — | — | 富文本说明 |
| 3 | Location | `location` | Text | — | — | 位置文字 (地址/视频链接外的备注) |
| 4 | Start At | `start_at` | Datetime | ✅ | — | 开始时间 (Datetime 含日期+时间) |
| 5 | End At | `end_at` | Datetime | ✅ | — | 结束时间 |
| 6 | All Day | `all_day` | Checkbox | — | `0` | 是否整日事件 |
| 7 | Timezone | `timezone` | Text | — | `UTC` | IANA 时区 (e.g. `Asia/Shanghai`) |
| 8 | Status | `status` | Select | — | `confirmed` | Options: `tentative` / `confirmed` / `cancelled` |
| 9 | Priority | `priority` | Select | — | `normal` | Options: `low` / `normal` / `high` / `urgent` |
| 10 | Color | `color` | Text | — | `#7c3aed` | HEX 颜色,前端按 event_type 映射 |

### Batch B — 重复 / 类型 / 提醒 (12 个)

| # | Label | Name | Type | Required | Default | 说明 |
|---|-------|------|------|----------|---------|------|
| 11 | RRULE | `rrule` | Text | — | — | iCalendar RRULE 字符串 (e.g. `FREQ=WEEKLY;BYDAY=MO`) |
| 12 | RRULE Until | `rrule_until` | Datetime | — | — | 重复结束时间 (UNTIL) |
| 13 | EXDATES | `exdates` | Textarea | — | — | 例外日期 JSON 数组 |
| 14 | Event Type | `event_type` | Select | ✅ | `personal` | Options: `personal` / `family` / `medicine` / `task` / `appointment` / `availability` / `birthday` / `holiday` / `booking` / `check_in` |
| 15 | Show As | `show_as` | Select | — | `busy` | Options: `busy` / `free` / `tentative` / `oof` (out-of-office) |
| 16 | Visibility | `visibility` | Select | — | `default` | Options: `default` / `public` / `private` / `confidential` |
| 17 | Reminders | `reminders` | Textarea | — | — | JSON 数组 e.g. `[{"minutes":10,"method":"push"},{"minutes":1440,"method":"email"}]` |
| 18 | Is Availability | `is_availability` | Checkbox | — | `0` | 标记为"我有空"声明 (非交易型) |
| 19 | Availability Note | `availability_note` | Text | — | — | e.g. "今晚有空可以聊" |
| 20 | RSVP Required | `rsvp_required` | Checkbox | — | `0` | 是否需要回复 |
| 21 | Allow Comments | `allow_comments` | Checkbox | — | `1` | 群组事件是否允许评论 |
| 22 | Recurrence ID | `recurrence_id` | Text | — | — | iCal RECURRENCE-ID,处理"修改单次重复事件"场景 |

### Batch C — 同步 / 附件 / 元数据 (13 个)

| # | Label | Name | Type | Required | Default | 说明 |
|---|-------|------|------|----------|---------|------|
| 23 | Source CCT Slug | `source_cct_slug` | Text | — | — | 镜像来源 e.g. `medicine` / `care_task` |
| 24 | Source Item ID | `source_item_id` | Text | — | — | 来源 CCT 的 _ID (字符串存,避免类型坑) |
| 25 | External Source | `external_source` | Select | — | `internal` | Options: `internal` / `google` / `outlook` / `apple` / `caldav` |
| 26 | iCal UID | `ical_uid` | Text | — | — | iCalendar UID,跨日历去重 |
| 27 | Google Event ID | `google_event_id` | Text | — | — | Google Calendar 事件 ID |
| 28 | Meeting URL | `meeting_url` | Text | — | — | Zoom/Meet/Teams 链接 |
| 29 | Attachments | `attachments` | Textarea | — | — | JSON 数组 `[{"name":"x.pdf","url":"..."}]` |
| 30 | Last Sync At | `last_sync_at` | Datetime | — | — | 最后一次外部同步时间 |
| 31 | Sync Token | `sync_token` | Text | — | — | 增量同步 token (Google sync token) |
| 32 | Geo Lat | `geo_lat` | Text | — | — | 纬度 (字符串避免精度丢失) |
| 33 | Geo Lng | `geo_lng` | Text | — | — | 经度 |
| 34 | Tags | `tags` | Text | — | — | 逗号分隔标签 |
| 35 | Custom Data | `custom_data` | Textarea | — | — | 任意 JSON 扩展位 |

### 系统自动字段 (JetEngine 自动加,不用手动)
- `_ID` — 主键
- `cct_status` — `publish` / `draft`
- `cct_created` — Unix timestamp
- `cct_modified` — Unix timestamp
- `cct_author_id` — 作者 user_id

---

## 二、JetEngine Relations 清单 (8 条)

> 操作: WP Admin → JetEngine → Relations → "Add New" → 按下表填
> **命名规范**: 严格用 "One X can have many/one related Y" 格式
> **Cardinality**: `one-to-one` / `one-to-many` / `many-to-many`
> **零 ID 硬连接原则**: CCT 字段里**没有任何** `user_id` / `group_id` / `medicine_id`,全靠下面 Relation 关联

| # | Relation Name | Parent (From) | Child (To) | Cardinality |
|---|---------------|---------------|------------|-------------|
| 1 | One user can have many related user's calendar events | Users | CCT: User's Calendar | one-to-many |
| 2 | One care group can have many related shared calendar events | CCT: care_group | CCT: User's Calendar | one-to-many |
| 3 | One cared one can have many related calendar events | CCT: cared_one | CCT: User's Calendar | one-to-many |
| 4 | One medicine record can have one related calendar event | CCT: medicine | CCT: User's Calendar | one-to-one |
| 5 | One care task can have one related calendar event | CCT: universal_care_task | CCT: User's Calendar | one-to-one |
| 6 | One check-in schedule can have many related calendar events | CCT: check_in | CCT: User's Calendar | one-to-many |
| 7 | One booking can have one related calendar event | WooCommerce Order (post: shop_order) | CCT: User's Calendar | one-to-one |
| 8 | One calendar event can have many related invited users | CCT: User's Calendar | Users | many-to-many |

---

## 三、操作顺序

1. **加 35 个 Meta 字段** — Edit CCT 页面,分 3 批加,每批加完点一次 **Update Content Type** 防丢失
2. **加 8 条 Relation** — JetEngine → Relations,逐条添加,每条保存
3. **回到本项目** — 我已经搭好了 `/calendar` 页面用 mock 数据预览,你建完字段后我替换为真实 `wordpressCCTFetch('users_calendar')` 接口

---

## 四、约 5-10 分钟可完成 (你不掉 session)

| 任务 | 估时 |
|------|------|
| 35 字段 (Edit CCT 一页搞定,每个字段约 15 秒) | ~9 min |
| 8 Relation (每条约 30 秒) | ~4 min |
| **合计** | **~13 min** |
