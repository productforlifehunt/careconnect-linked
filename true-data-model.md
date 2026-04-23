# 核心护理功能数据字典 (True Data Model)

> **Source of Truth** — 此文件为本项目数据模型的唯一权威参考。所有 CCT、Relation、Field 必须以此为准在 WordPress (JetEngine) 中创建。
> **架构原则**：WordPress 自带用户字段 + JetEngine CCT (作为独立 MySQL 表) + JetEngine Relation (作为独立 join 表)。绝不使用自定义 FK / link / id join。

---

## 1. 用户信息与用户角色

用户的核心信息使用 WP 自带用户字段，附加信息储存在 JetEngine CCT **"User's extended profile"**。

### CCT: User's extended profile

| Property | Value |
|---|---|
| Jet Engine CCT Name | User's extended profile |
| Jet Engine CCT Slug | users_extended_prof |
| DB Table Name | wp_5_jet_cct_users_extended_prof |

#### Custom Fields

| Field Label | Field Type | Options | Usage |
|---|---|---|---|
| Allow emergency location request | Radio | 1. "No" 2. "Yes" | 当用户设定为 "Yes" 时，护理者可以不经过用户允许直接获取被护理者位置 |
| Location share is on | Radio | 1. "No" 2. "Yes" | 当用户设为 "Yes" 时开启共享信息；当用户接受允许共享信息时此 radio 也写入为 "Yes" |
| Notification preference |  |  |  |
| General user role | Checkbox | 1. "cared one", 2. "caring one" | 仅作综合用户角色界定 / onboarding；用户可多选或不选；选 cared one 不代表什么；选 caring one 不代表成为付费护理者（大部分用户其实是家庭非付费护理者） |
| Is care provider | Radio | 1. "no", 2. "yes" | 是否是付费护理提供者；用户选择成为护理者即勾选 yes |
| Care provider is active | Radio | 1. "no", 2. "yes" | 护理提供者是否活跃；成为护理者后默认 yes；可在设置切换为 no；为 no 时暂不可在护理市场搜索 |
| Care provider is background checked | Radio | 1. "no", 2. "yes" | 默认 no；经过背景验证后为 yes |
| Care provider's background check detail | Text |  |  |
| Care provider's cancellation policy |  |  |  |
| Care provider's service area |  |  |  |
| Care provider's starts hourly rate | Number |  | 每小时价格从多少起 |
| Care provider offers in-person service | Radio | 1. "No" 2. "Yes" | care provider 提供服务的大类，作为护理市场和用户设置页面大的分类快速区分 |
| Care provider offers virtual service | Radio | 1. "No" 2. "Yes" | care provider 提供服务的大类，作为护理市场和用户设置页面大的分类快速区分 |
| Care provider offers care service general type | Checkbox | 1. "Pet care and companion" 2. "Child care and companion" 3. "Adult care and companion" 4. "Elderly care and companion" 5. "Tutoring" 6. "Dementia care and companion" 7. "Housekeeping" 8. "Errand" 9. "Transportation" 10. "Medical Escort" 11. "In-person checkin" 12. "Remote checkin and medicine supervision" | 主要参照 care.com 分类 |
| Care provider offers pet care for | Checkbox | 1. Dogs 2. Cats 3. Small mammals 4. Birds 5. Fish |  |
| Care provider offers dementia care type | Checkbox | 1. In-person day care 2. In-person overnight care 3. In-person companion 4. In-person checkin 5. Household help 6. Remote companion 7. Remote medicine management 8. Remote checkin |  |
| Care provider offers elderly care service |  |  |  |
| Care provider offers special needs care service | Checkbox |  |  |
| Care provider offers household help service | Checkbox | 1. "Housekeeping" 2. "Gardening" |  |
| Care provider offers errand service |  |  |  |
| Care provider offers transportation service |  |  |  |
| Care provider offers medical escort service |  |  |  |
| Care provider offers childcare service as | Checkbox | 1. "Babysitter" 2. "Nanny" 3. "Childminder" |  |
| Care provider offers childcare service | Checkbox | 1. "Cooking / Meal preparation" 2. "Pick-up / Drop off" 3. "Light housekeeping" 4. "Activities (e.g. swimming)" 5. "Putting kids to bed" 6. "Homework help" 7. "Bathing" 8. "Virtual Care" |  |
| Care provider offers dog care service type | Checkbox | 1. "Dog sitting" 2. "Dog walking" 3. "Dog feeding" 4. "Dog day care" 5. "Dog transportation" 6. "Dog overnight sitting" 7. "Dog training" 8. "Dog grooming" |  |
| Care provider offers cat care service | Checkbox | 1. "Cat sitting" 2. "Cat walking" 3. "Cat feeding" 4. "Cat day care" 5. "Cat transportation" 6. "Cat overnight sitting" 7. "Cat training" 8. "Cat grooming" |  |
| Care provider offers small mammal care service type |  |  |  |
| Care provider offers bird care service |  |  |  |
| Care provider offers fish care service |  |  |  |
| Care provider is a doctor and offers care tip consultancy |  |  |  |
| Care provider is a doctor and offers accompany tip consultancy |  |  |  |
| Care provides can drive | Radio | 1. "No" 2. "Yes" |  |
| Care provides has own transportation | Radio | 1. "No" 2. "Yes" |  |
| Care provider is a Non-smoker | Radio | 1. "No" 2. "Yes" |  |
| Care provider is experienced with | Checkbox | 1. "Newborn (up to 12 months)" 2. "Toddler (1-3 years)" 3. "Early School Age (4-6 years)" 4. "Primary school age (7-12 years)" 5. "Teenager (12+ years)" 6. "Twins/Multiples" 7. "Special Needs Children" |  |

> **注意**：护理者的护理服务只在 woo product 里储存最少的信息，不使用 woo 的 attribute 系统。护理服务的类型和价格均通过关联（因为 dokan shop 的本质是用户的 meta data）用户的 "User's extended profile" 来显示。价格直接在勾选确认后覆盖写入 woo 的价格；woo 价格默认为空，由前端加入购物车时覆盖写入。

#### Relation: One user can have one user's extended profile

| Parent | Child | Relation type |
|---|---|---|
| Users | User's extended profile | One to One |

#### Relation: One user can have many related cared ones

| Parent | Child | Relation type |
|---|---|---|
| Users | Users | Many to Many |

---

## 2. Cared one's information card

每个 Cared one 可以有多个信息卡片，用于在不同情景展示。

### CCT: Cared one's information card

| Property | Value |
|---|---|
| Jet Engine CCT Name | Cared one's information card |

#### Custom Fields

| Field Label | Field Type | Options |
|---|---|---|
| Cared one's name | Text |  |
| Cared one's description | Textarea |  |
| Cared one's information card name | Text |  |
| Status | Radio | 1. "Draft" 2. "Active" 3. "Paused" |
| Displays location | Radio | 1. "No" 2. "Yes" |

#### Relation: One cared one can have many related cared one's information cards

| Parent | Child | Relation type |
|---|---|---|
| Users | Cared one's information card | One to Many |

#### Relation: One cared one's information card can have many related cared one's emergency contact persons

默认全选，用户可以选择仅显示哪些，或者新建。

| Parent | Child | Relation type |
|---|---|---|
| Cared one's information card | Users | One to Many |

---

## 3. User's calendar event

用户的 Calendar 使用 JetEngine CCT **"User's calendar event"** 储存，不做聚合。

### CCT: User's calendar event

#### Custom Fields

| Field Label | Field Type | Options |
|---|---|---|
| Title | Text |  |
| Description | Textarea |  |
| Start at | Datetime |  |
| End at | Datetime |  |
| All day | Checkbox |  |
| Event type | Text |  |
| Location | Text |  |
| Timezone | Text |  |
| Status | Select | 1. "confirmed" 2. "tentative" 3. "cancelled" |
| Priority | Select | 1. "normal" 2. "low" 3. "normal" 4. "high" 5. "urgent" |
| Color | Colorpicker |  |
| RRULE | Text (iCal RRULE) |  |
| RRULE Until | Datetime |  |
| EXDATES | Textarea |  |
| RDATES | Textarea |  |
| Recurrence ID | Text |  |
| Show as | Select | 1. "busy" 2. "free" 3. "tentative" 4. "oof" |
| Visibility | Select | 1. "default" 2. "public" 3. "private" 4. "confidential" |
| Reminders | Textarea |  |
| Is availability | Radio | 1. "Yes" 2. "No" |
| Availability note | Text |  |
| RSVP required | Radio | 1. "Yes" 2. "No" |
| Allow comments | Radio | 1. "Yes" 2. "No" |
| External source | Select | 1. "internal" 2. "google" 3. "outlook" 4. "apple" |
| iCal UID | Text |  |
| Sequence | Text |  |
| ETag | Text |  |
| Google Event ID | Text |  |
| Meeting URL | Text |  |
| Attachments | Textarea |  |
| Last sync at | Datetime |  |
| Sync token | Text |  |
| Geo Lat | Text |  |
| Geo Lng | Text |  |
| Tags | Text |  |
| Custom data | Textarea |  |

#### Relations

| Relation Name | Parent | Child | Type |
|---|---|---|---|
| One user can have many related user's calendar events | Users | User's calendar event | One to Many |
| One user's calendar event can have many related invited users | User's calendar event | Users | One to Many |
| One care task can have many related user's calendar events | Care Task | User's calendar event | One to Many |

---

## 4. 公开护理市场

### 搜索页

搜索页 query: `is_care_provider = true` (用户是付费护理者) **AND** `care_provider_is_active = true` (护理提供者状态为活跃)。

---

## 5. 护理群组

护理群组是围绕被护理人所建立的讨论组，被护理人可以是组员也可以不是。

### CCT: Care Group

#### Custom Fields

| Field Label | Field Type | Options |
|---|---|---|
| Name | Text |  |
| Description | Textarea |  |
| Group type | Radio | public / private |
| Join code | Text |  |
| Status | Radio | active / no |

#### Relation: One care group can have many related care group members

| Parent | Child | Relation type |
|---|---|---|
| Care Group | Users | Many to Many |

##### Relation Custom Fields

| Field Label | Field Type | Options |
|---|---|---|
| care group's member display name | Text |  |
| care group's member types | Checkbox | 1. "nothing special" 2. "owner" 3. "admin" |
| care group's member roles | Checkbox | 1. "nothing special" 2. "cared one" |
| care group's member invitation status | Radio | 1. "accepted" 2. "pending" 3. "declined" — 群组创建者自动 accepted |

### CCT: The related private member groups of one care group

每个群组可以建立多个子群组（如家人、朋友、邻居、护理者等），群组内信息和选择只对子群组可见。

#### Custom Fields

| Field Label | Field Type |
|---|---|
| name | Text |
| description | Textarea |
| color | Colorpicker |

#### Relation: One care group can have many related private member groups

| Parent | Child | Relation type |
|---|---|---|
| Care Group | The related private member groups of one care group | One to Many |

#### Relation: One care group's private member group can have related members

| Parent | Child | Relation type |
|---|---|---|
| The related private member groups of one care group | Users | Many to Many |

### CCT: The related not too special posts of one care group

护理小组讨论普通讨论。

#### Custom Fields

| Field Label | Field Type | Options |
|---|---|---|
| type | Checkbox | 1. "discussion" → 一般组讨论（默认） 2. "announcement" → 重要组通知 3. "wish" → 祝福帖（生日、康复、鼓励） |
| title | Text |  |
| content | Text |  |
| is pinned | Radio | "no" / "yes" |
| scheduled at | Datetime |  |

发布者使用 JetEngine CCT 自带的发布者。

#### Relations

| Relation Name | Parent | Child | Type |
|---|---|---|---|
| One care group can have many related not too special posts | Care Group | The related not too special posts of one care group | One to Many |
| One related not too special posts of one care group can have many related care group's private member groups that it's visible to | The related not too special posts of one care group | The related private member groups of one care group | Many to Many |
| One related not too special posts of one care group can have many related users that it's visible to | The related not too special posts of one care group | Users | Many to Many |
| One related not too special posts of one care group can have many related comments | The related not too special posts of one care group | Comment | One to Many |

> **注意**：群组内成员的所有操作都显示群组成员的组内显示名 "care group's member display name"。回复的作者使用 cct 默认的作者；如无特殊说明，本 app 所有发布者均使用 jet engine cct 默认作者。回复的回复使用通用 Relation "One comment can have many related comments" 来连接子评论。

### 护理小组相册

(待补充)

---

## 6. 护理任务 Care Task

护理任务使用 JetEngine CCT **"Care Task"**。群组内护理任务、对被护理者的直接护理任务均使用此 CCT；Care Task 也可以分享至护理市场找寻帮手。

#### Custom Fields

| Field Label | Field Type | Options |
|---|---|---|
| title | Text |  |
| description | Textarea |  |
| Due date | Datetime |  |
| Completed at | Datetime |  |
| Status | Radio | 1. "pending" 2. "in progress" 3. "completed" |

#### Relations

| Relation Name | Parent | Child | Type |
|---|---|---|---|
| One care task can have many related cared ones | Care Task | Users | One to Many |
| One care task can have many related assigned caregivers | Care Task | Users | One to Many |
| One care group can have many related care tasks | Care Group | Care Task | Many to Many |
| One care task can have many related care group's private member groups that it's visible to | Care Task | The related private member groups of one care group | Many to Many |
| One care task can have many related users that it's visible to | Care Task | Users | Many to Many |
| One care task can have many related comments | Care Task | Comment | One to Many |

> **注意**：Care task 的创建者使用 jet engine CCT 默认的作者。

---

## 7. 即时对话 Chat

### CCT: Chat Conversion

| Field Label | Field Type | Options |
|---|---|---|
| Chat type | Radio | 1. "One to One" 2. "Many users" |
| Chat name | Text | 可为 null，除非用户闲的起个名 |

Chat 发起人即 jet engine CCT 作者。

#### Relation: One care group can have one related group live chat conversation

每个护理群组在创建时自动生成一个群组的群组即时会话。

| Parent | Child | Relation type |
|---|---|---|
| Care Group | Chat Conversion | One to One |

#### Relation: One chat conversation can have many related chatters

| Parent | Child | Relation type |
|---|---|---|
| Chat Conversion | Users | Many to Many |

##### Relation Custom Fields

| Field Label | Field Type | Options |
|---|---|---|
| The user joined this chat conversation at this time | Datetime |  |
| The user last read this chat conversation at this time | Datetime |  |
| The user has fucking muted this chat | Radio | 1. "No" 2. "Yes" |

### CCT: Chat Message

| Field Label | Field Type | Options |
|---|---|---|
| Chat message content | Text |  |
| Chat message type | Radio | 1. "Text" 2. "Image" 3. "AI" 4. "System message" 5. "Price card" |

> **注意**：Image 即图片，渲染图片；Price card 是双方砍价时确定的价格。Chat created at 使用 JetEngine CCT 创建时间，无需额外储存；作者即 CCT 创建者。

#### Relations

| Relation Name | Parent | Child | Type |
|---|---|---|---|
| One chat conversation can have many related chat messages | Chat Conversion | Chat Message | One to Many |
| One chat message can have one parent chat message that it is specifically replying to | Chat Message | Chat Message | One to Many |

> **注意**：普通一对一聊天和多人聊天不需要回复关联表，只需按时间排序即可。

---

## 8. 用药管理

### CCT: Cared one's medicine schedule

| Field Label | Field Type |
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

#### Relation: One cared one can have many related cared one's medicine schedules

| Parent | Child | Type |
|---|---|---|
| Users | Cared one's medicine schedule | One to Many |

### CCT: Care one's medicine log

| Field Label | Field Type | Options |
|---|---|---|
| Status | Radio | 1. "Taken" 2. "Skipped" 3. "Missed" |
| Note | Textarea |  |

#### Relation: One cared one's medicine schedule can have many related care one's medicine logs

| Parent | Child | Type |
|---|---|---|
| Cared one's medicine schedule | Care one's medicine log | One to Many |

---

## 9. 查看 / 探望 Checkin

### CCT: Cared one's checkin schedule

| Field Label | Field Type |
|---|---|
| Name | Text |
| Detail | Text |
| Frequency | Text |
| Time slot | Textarea |
| Instructions | Text |
| Start date | Date |
| Is active | Radio |
| Note | Textarea |

#### Relation: One cared one can have many related cared one's checkin schedules

| Parent | Child | Type |
|---|---|---|
| Users | Cared one's checkin schedule | One to Many |

### CCT: Care one's checkin log

| Field Label | Field Type | Options |
|---|---|---|
| Status | Radio | 1. "Checked" 2. "Skipped" 3. "Missed" |
| Note | Textarea |  |

#### Relation: One cared one's checkin schedule can have many related care one's checkin logs

| Parent | Child | Type |
|---|---|---|
| Cared one's checkin schedule | Care one's checkin log | One to Many |

---

## 10. 护理记录

### CCT: Cared one's care note

| Field Label | Field Type |
|---|---|
| Title | Text |
| Content | Textarea |

#### Relation: One cared one can have many related cared one's care notes

| Parent | Child | Type |
|---|---|---|
| Users | Cared one's care note | One to Many |

---

## 11. 护理方法

### CCT: Cared one's care tip

| Field Label | Field Type | Options |
|---|---|---|
| Title | Text |  |
| Content | Textarea |  |
| Category | Radio | 1. "tip" 2. "avoid" |
| Is pinned | Radio | 1. "Yes" 2. "No" |

#### Relation: One cared one can have many related cared one's care tips

| Parent | Child | Type |
|---|---|---|
| Users | Cared one's care tip | One to Many |

---

## 12. 护理计划

### CCT: Cared one's care plan

| Field Label | Field Type | Options |
|---|---|---|
| Title | Text |  |
| Content | Textarea |  |
| Is pinned | Radio | 1. "Yes" 2. "No" |

#### Relation: One cared one can have many related cared one's care plans

| Parent | Child | Type |
|---|---|---|
| Users | Cared one's care plan | One to Many |

---

## 13. 紧急联系人

### CCT: Cared one's emergency contact person

| Field Label | Field Type |
|---|---|
| Name | Text |
| Content | Textarea |
| Phone | Text |
| Address | Text |
| Relationship | Text |
| Note | Text |

#### Relation: One cared one can have many related cared one's emergency contact persons

| Parent | Child | Type |
|---|---|---|
| Users | Cared one's emergency contact person | One to Many |

---

## 14. 文档

### CCT: Cared one's care document

| Field Label | Field Type |
|---|---|
| Name | Text |
| Content | Textarea |

#### Relation: One cared one can have many related cared one's care documents

| Parent | Child | Type |
|---|---|---|
| Users | Cared one's care document | One to Many |

---

## 15. 地点定位

### CCT: The current location of one user

| Field Label | Field Type | Options |
|---|---|---|
| Latitude | Text |  |
| Longitude | Text |  |
| Accuracy meters | Text |  |
| Altitude meters | Text |  |
| Heading degrees | Text |  |
| Speed | Text |  |
| Is moving | Text |  |
| Moving type | Text |  |
| Platform | Text |  |
| Battery level | Text |  |
| Phone is charing | Text |  |
| Address text | Text |  |
| Captured at | Datetime |  |
| Is so much of an emergency that we don't bother to ask for the cared one's permission | Radio | 1. "No" 2. "Yes" — 当用户 Allow emergency location request 设为 "Yes" 时，允许在紧急模式下不经过用户允许获取用户信息；紧急模式下所有位置 snapshot 均写入紧急模式为 "Yes"，这样用户可以在查看记录时知道这段时间未经允许被获取了位置 |

#### Relation: One user can have many related current location snapshots

| Parent | Child | Relation type |
|---|---|---|
| Users | The current location of one user | One to Many |

> **注意**：此关联为一对多，用户的所有"当下"位置信息均记录为一条独立的 current location。当别的用户需要索取该用户的"当下"位置信息时，query 最新的一条 current location，即"当下"的"当下"。当绘制用户的位置记录历史时，即 query 属于该用户的所有历史"当下"位置记录。每次 pull 一次用户的位置信息即记录一条独立的 current location。
>
> 我们不需要独立的 location history 表单，也不需要独立的管理表，只需要直接 query 用户关联的所有 current location 位置记录 snapshot 即可以最直接高效地获取用户的位置记录。
>
> **特别注意**：current location 需要具体关联到被记录者，被记录者可以是 cared one，也可以是其他用户间相互分享位置。

##### Relation Custom Fields

| Field Label | Field Type | Options |
|---|---|---|
| User type | Radio | 1. "Not someone special" 2. "Cared one" — 如果是 cared one，选 Cared one；具体怎么用我们还没想好 |

### CCT: Safe Zone

安全区域与危险区域都使用同一个 CCT。

| Field Label | Field Type | Options |
|---|---|---|
| Zone type | Radio | 1. "Safe" 2. "Danger" |
| Shape type | Radio | 1. "Radius" 2. "Polygon" |
| Custom name | Text |  |
| Custom description |  |  |
| Custom color | Colorpicker |  |
| Latitude | Text | Only applies to polygon |
| Longitude | Text | Only applies to polygon |
| Radius meters | Number | Default: 100. Only applies to polygon |
| Polygon points | Textarea |  |
| Notify on enter | Radio | 1. "Off" 2. "On" |
| Notify on exit | Radio | 1. "Off" 2. "On" |
| Schedule enabled | Radio | 1. "Off" 2. "On" — 是否在预设时间启用 |
| Schedule start time | Datetime | 预设启用时间开始时间 |
| Schedule end time | Datetime | 预设启用时间结束时间 |
| Is active | Radio | 1. "No" 2. "Yes" — 是否启用；如果预设时间来临则 override |

创建人即 cct 作者。

#### Relation: One user can have many related safe zones

| Parent | Child | Type |
|---|---|---|
| Users | Safe Zone | One to Many |

### CCT: location_request (位置请求)

| Column | Type | Detail |
|---|---|---|
| id | UUID | PK |
| cared_one_id | UUID | 关联到 profile.user_id 被护理者 id |
| requester_id | UUID | 关联到 profile.user_id 请求者 id |
| message | text |  |
| is_emergency |  |  |
| status | text | pending / approved / declined / cancelled / expired |
| created_at |  |  |
| expire_at |  |  |

### CCT: safe_zone_alert (安全区域警报)

安全区域与危险区域警报都使用此 CCT。

| Column | Type | Detail |
|---|---|---|
| id | UUID | PK |
| cared_one_id | UUID | 关联到 profile.user_id 被护理者 id |
| safe_zone_id | UUID | 关联到 safe_zone.id |
| message | text |  |
| location_history_id | UUID | 关联到 location_history.id |
| alert_type | text | entered_safe_zone / exited_safe_zone / entered_danger_zone / exited_danger_zone |
| created_at |  |  |
| expire_at |  |  |

---

## 16. 护理场所 Care Facility

### CCT: Care Facility

| Field Label | Field Type | Options |
|---|---|---|
| name | text |  |
| detail | textarea |  |
| Care facility type | Checkbox | 1. "Adult Day Care" 2. "Assisted living" 3. "Home Care" 4. "Hospice" 5. "Independent living" 6. "Memory care" 7. "Nursing homes" 8. "Residential care homes" 9. "Senior Apartments" |
| Care facility can care for dementia stage | Checkbox | 1. "Early-stage" 2. "Middle-stage" 3. "Late-stage" |
| Care facility room type | Checkbox | 1. "Studio" 2. "One Bed Room" 3. "Two Bed Room" 4. "More Than Two Bed Room" |
| Care facility provides room facility | Checkbox | 1. "Balcony" 2. "Toilet" 3. "Kitchen" |
| Care facility provides community facility | Checkbox | 1. "swimming pool" 2. "active lifestyle" 3. "entertainment venue" 4. "laundry" |
| Care facility people number | Checkbox | 1. "Less than 5" 2. "5-20" 3. "20-50" 4. "More than 50" |
| location |  |  |
| address |  |  |

#### Relation: One care facility can have many related facility members

| Parent | Child |
|---|---|
| Care Facility | Users |

##### Relation Custom Fields

| Field Label | Field Type | Options | Usage |
|---|---|---|---|
| Facility member type | Checkbox | 1. "nothing special" 2. "owner" 3. "admin" | 普通成员 nothing special；主人为 owner，主人只能由一个；主人可以把多个成员添加为管理员，管理员有主人一样牛逼的权限 |
| Facility member role | Text |  | Self-described role, like "I'm the fucking boss" |

> 此表单仅作提交，由站主看到后手动处理。

### CCT: Review

护理场所的评价。

| Field Label | Field Type |
|---|---|
| title | text |
| content | textarea |
| rating | number |

#### Relations

| Relation Name | Parent | Child | Type |
|---|---|---|---|
| One care facility can have many related reviews | Care facility | Review | One to Many |
| One review can have many related comments | Review | Comment | One to Many |

> 回复的回复使用通用 Relation "One comment can have many related comments" 来连接子评论。

---

## 17. 护理工作 Care Job

### CCT: Care Job

| Field Label | Field Type | Options |
|---|---|---|
| title | Text |  |
| description | textarea |  |
| Due date | Datetime |  |
| Completed at | Datetime |  |
| Status | Radio | 1. "pending" 2. "in progress" 3. "completed" |

#### Relations

| Relation Name | Parent | Child | Type |
|---|---|---|---|
| One care job can have many related cared ones | Care Job | Users | One to Many |
| One care job can have many assigned caregivers | Care Job | Users | One to Many |
| One care group can have many related care jobs | Care Group | Care Job | Many to Many |
| One care job can have many related care tasks | Care Job | Care Task | Many to Many |
| One care job can have many related comments | Care Job | Comment | One to Many |

> **注意**：Care Job 的创建者使用 jet engine CCT 默认的作者。

---

## 18. 社区与文章

### CCT: Care community post

| Field Label | Field Type | Options |
|---|---|---|
| Title | Text |  |
| Content | Textarea |  |
| Language | Radio | 1. "English" 2. "Simplified Chinese" |
| app area | Checkbox | 1. "Global English" 2. "China" |
| Care community post category | Checkbox | 1. "Discussion" 2. "Article" |

发布者使用 JetEngine CCT 自带的发布者。

#### Relation: One care community post can have many related comments

| Parent | Child | Type |
|---|---|---|
| Care community post | Comment | One to Many |

> 回复的作者使用 cct 默认的作者。回复的回复使用通用 Relation "One comment can have many related comments"。

---

## 19. ChallengeD App 内容

### CCT: Challenged App Content

| Field Label | Field Type | Options | Usage |
|---|---|---|---|
| Title | Text |  |  |
| Content | Textarea |  |  |
| Language | Radio | 1. "English" 2. "Simplified Chinese" |  |
| app area | Checkbox | 1. "Global English" 2. "China" |  |
| App content type | Radio | 1. "Learn" 2. "Care and accompany tips" 3. "Find tips" | Learn 即完全照搬 WHO 推出的 isupport 内容，内容储存在前端，CCT 的目的只是链接学习笔记，不储存内容 |
| Learn module number | Number |  | 对应 isupport 模块编号 |
| Learn lesson number | Number |  | 对应 isupport 课程编号 |
| Care and accompany tips category | Radio | 1. "Eating and drinking" 2. "Toileting and continence" 3. "Memory loss" 4. "Aggression" 5. "Depression, anxiety and apathy" 6. "Difficulty sleeping" 7. "Delusions and hallucinations" 8. "Repetitive behaviour" 9. "Changes in judgement" |  |
| Find tips category | Radio | 1. "Wondering" 2. "Getting lost" 3. "Unwilling to return home" |  |

### CCT: User's study notes

每个 App Content 可以有多个学习笔记。

| Field Label | Field Type |
|---|---|
| Title | Text |
| Content | Textarea |

#### Relations

| Relation Name | Parent | Child | Type |
|---|---|---|---|
| One user can have many related finished ChallengeD learn content | (Users) | Challenged App Content | (note: 只适用 Learn) |
| One Challenged App Content can have many related user's study notes | Challenged App Content | User's study notes | One to Many |
| One Challenged App Content can have many related cared one's care tips | Challenged App Content | Cared one's care tip | One to Many |

> "Care and accompany tips"、"Find tips" 可以新建或者关联用户所照顾的 Cared one 的 care tips；前端用户选择自己关联的 Cared one。
> 发布者使用 JetEngine CCT 自带的发布者。

---

## 20. 推送

(待补充)
