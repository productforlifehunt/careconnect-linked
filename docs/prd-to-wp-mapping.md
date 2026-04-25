# PRD → WordPress Live Mapping (Source of Truth)

Pulled live from `app.challenged-dementia.com/careconnected` via JetEngine REST.
**42 CCTs · 58 Relations** (after dedup of 105/123/124).

> ⚠️ JetEngine truncates slugs to 19 chars. Use the LIVE slug verbatim — never guess.

## CCT slugs — `/wp-json/jet-cct/{slug}`

| Dictionary | Live slug | CCT |
|---|---|---:|
| User's extended profile | `users_extended_prof` | 110 |
| User's notification token | `users_notification_` | 147 |
| User's calendar event | `users_calendar_even` | 128 |
| User's study notes | `users_study_notes` | 122 |
| Cared one's information card | `cared_ones_informat` | 125 |
| Cared one's medicine schedule | `medicine` | 15 |
| Care one's medicine log | `medicine_log` | 16 |
| Cared one's care tip | `care_tip` | 19 |
| Cared one's care plan | `care_plan` | 20 |
| Cared one's care note | `care_note` | 22 |
| Cared one's care document | `care_document` | 23 |
| Cared one's emergency contact | `emergency_contact` | 24 |
| Cared one's checkin schedule | `checkin_schedule` | 138 |
| Care one's checkin log | `checkin_log` | 17 |
| Health Vital | `health_vital` | 18 |
| Care Plan Goal | `care_plan_goal` | 21 |
| Care Group | `care_group` | 9 |
| Care Group Invite | `care_group_invite` | 13 |
| Care Group Gallery | `care_group_gallery` | 14 |
| Care Group Private Member Group | `care_group_private_member_group` | 74 |
| Care Group Not-too-special Post | `care_group_not_too_special_post` | 76 |
| Care Task (universal) | `universal_care_task` | 80 |
| Chat Conversation | `chat_conversation` | 26 |
| Chat Message | `chat_message` | 27 |
| Notification | `notification` | 146 |
| Current Location | `current_location` | 112 |
| Safe Zone | `safe_zone` | 116 |
| Care Facility | `care_facility` | 64 |
| Review | `review` | 65 |
| Comment | `comment` | 67 |
| Care Community Post | `care_community_post` | 70 |
| Care Job | `care_job` | 139 |
| Job Posting | `job_posting` | 29 |
| Job Application | `job_application` | 30 |
| Vote | `cc_vote` | 33 |
| Activity Log | `activity_log` | 25 |
| Challenged App Content | `challenged_content` | 100 |
| Caregiver Wellness Log | `caregiver_wellness_log` | 101 |

## Relations — `/wp-json/jet-rel/{id}`

| ID | Type | Parent → Child | Purpose |
|---:|---|---|---|
| 41 | 1:M | users → job_posting | Posted jobs |
| 42 | 1:M | users → job_application | Job apps |
| 45 | 1:M | care_group → care_group_invite | Invites |
| 46 | 1:M | care_group → care_group_gallery | Photos |
| 47 | 1:M | care_group → private_member_group | Sub-groups |
| 48 | M:M | care_group → universal_care_task | Group tasks |
| 54 | 1:M | care_plan → medicine | Plan→meds |
| 63 | 1:M | users → emergency_contact | Direct emergency |
| 66 | 1:M | care_facility → review | Reviews |
| 68 | 1:M | review → comment | Review comments |
| 69 | M:M | comment → comment | Threads |
| 71 | 1:M | care_community_post → comment | Post comments |
| **72** | M:M | **care_group → users** | **Group members** |
| 75 | M:M | private_member_group → users | Sub-group members |
| 77 | 1:M | care_group → not_too_special_post | Group posts |
| 78 | 1:M | not_too_special_post → comment | Group post comments |
| 79 | M:M | users → users | User→cared ones (legacy) |
| **81** | 1:M | universal_care_task → users | Task→**caregivers** |
| 82 | 1:M | universal_care_task → comment | Task comments |
| 83 | 1:M | users → medicine | User→meds |
| 88 | 1:M | users → care_tip | User→tips |
| 92 | 1:M | users → care_note | User→notes |
| 94 | 1:M | users → activity_log | Activity |
| 95 | 1:M | users → care_document | User→docs |
| 96 | 1:M | users → health_vital | Vitals |
| 97 | 1:M | users → care_plan | User→plans |
| 103 | M:M | not_too_special_post → private_member_group | Visibility |
| 104 | M:M | not_too_special_post → users | Visibility |
| 107 | 1:M | care_facility → users | Facility staff |
| 108 | M:M | universal_care_task → users | Task visibility |
| 109 | M:M | universal_care_task → private_member_group | Task visibility (groups) |
| **111** | 1:1 | users → users_extended_prof | **User profile** |
| 117 | 1:M | users → current_location | GPS snapshots |
| 118 | 1:M | users → safe_zone | Safe zones |
| 121 | 1:M | medicine → medicine_log | Med log |
| 126 | 1:M | users → cared_ones_informat | User→cared one cards |
| 127 | 1:M | cared_ones_informat → emergency_contact | Card emergency |
| 129 | 1:M | users → users_calendar_even | User→events |
| 130 | 1:M | users_calendar_even → users | Event invitees |
| 131 | 1:M | universal_care_task → users_calendar_even | Task→cal |
| 140 | 1:1 | care_group → chat_conversation | Group chat |
| **141** | 1:M | universal_care_task → users | Task→**cared ones** |
| **142** | M:M | chat_conversation → users | Chat members |
| 143 | 1:M | chat_conversation → chat_message | Conv→msgs |
| 144 | 1:M | chat_message → chat_message | Reply parent |
| **148** | 1:M | users → notification | **Notifications** |
| **149** | 1:M | users → users_notification_ | **Push tokens** |
| 150 | 1:M | users → checkin_schedule | Checkin |
| 151 | 1:M | checkin_schedule → checkin_log | Checkin log |
| 152 | 1:M | care_job → users | Job→cared ones |
| 153 | 1:M | care_job → users | Job→caregivers |
| 154 | 1:M | care_group → care_job | Group→jobs |
| 155 | M:M | care_job → universal_care_task | Job→tasks |
| 156 | 1:M | care_job → comment | Job comments |
| **157** | 1:M | users → challenged_content | User→learned |
| **158** | 1:M | challenged_content → users_study_notes | Content→notes |
| **159** | 1:M | challenged_content → care_tip | Content→tips |

## Removed (do not use)
- ~~105~~ → **141**
- ~~123~~ → **158**
- ~~124~~ → **159**

## REST patterns

```ts
// CCT list:    GET    /wp-json/jet-cct/{slug}?_limit=100
// CCT one:     GET    /wp-json/jet-cct/{slug}/{_ID}
// CCT create:  POST   /wp-json/jet-cct/{slug}            body: {...fields}
// CCT update:  PUT    /wp-json/jet-cct/{slug}/{_ID}      body: {...fields}
// CCT delete:  DELETE /wp-json/jet-cct/{slug}/{_ID}

// Relation children of a parent:
// GET /wp-json/jet-rel/{relId}/parent/{parentId}    → list of child IDs/objects
// GET /wp-json/jet-rel/{relId}/child/{childId}      → list of parent IDs/objects
// POST /wp-json/jet-rel/{relId}                     body: {parent_id, child_id, context, store_items_type}
// DELETE /wp-json/jet-rel/{relId}/{context}/{_ID}
```
