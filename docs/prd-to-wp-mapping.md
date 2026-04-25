# PRD Name → Live WordPress JetEngine Mapping

> Source of truth: `FUCKING-READ-ME.md` (PRD names) ↔ live WP at
> `app.challenged-dementia.com/careconnected` (auto-generated slugs/IDs from `/jet-engine/v2`).
>
> **Rule**: Match by **CCT/Relation Name** (字典名), then bind to whatever **slug/ID** JetEngine generated. Never guess.

---

## 1. CCT Name → Slug

| PRD Name (字典) | Live JetEngine Name | Live Slug | CCT ID |
|---|---|---|---|
| User's extended profile | `User‘s extended profile` | `users_extended_prof` | 110 |
| Care Group | `Care Group` | `care_group` | 9 |
| Care Group Invite | `Care Group Invite` | `care_group_invite` | 13 |
| Care Group Gallery | `Care Group Gallery` | `care_group_gallery` | 14 |
| The related private member groups of one care group | `The related private member groups of one care group` | `care_group_private_member_group` | 74 |
| The related not too special posts of one care group | `The related not too special posts of one care group` | `care_group_not_too_special_post` | 76 |
| Care Task (universal) | `Care Task` | `universal_care_task` | 80 |
| Care Job | `Care Job` | `care_job` | 139 |
| Cared one's information card | `Cared one’s information card` | `cared_ones_informat` | 125 |
| Cared one's medicine schedule | `Cared one’s medicine schedule` | `medicine` | 15 |
| Care one's medicine log | `Care one's medicine log` | `medicine_log` | 16 |
| Cared one's checkin schedule | `Cared one’s checkin schedule` | `checkin_schedule` | 138 |
| Care one's checkin log | `Care one's checkin log` | `checkin_log` | 17 |
| Health Vital | `Health Vital` | `health_vital` | 18 |
| Cared one's care tip | `Cared one's care tip` | `care_tip` | 19 |
| Cared one's care plan | `Cared one's care plan` | `care_plan` | 20 |
| Care Plan Goal | `Care Plan Goal` | `care_plan_goal` | 21 |
| Cared one's care note | `Cared one’s care note` | `care_note` | 22 |
| Cared one's care document | `Cared one's care document` | `care_document` | 23 |
| Cared one's emergency contact person | `Cared one’s emergency contact person` | `emergency_contact` | 24 |
| Activity Log | `Activity Log` | `activity_log` | 25 |
| Caregiver Wellness Log | `Caregiver Wellness Log` | `caregiver_wellness_log` | 101 |
| Chat Conversation | `Chat Conversation` | `chat_conversation` | 26 |
| Chat Message | `Chat Message` | `chat_message` | 27 |
| Notification | `Notification` | `notification` | 146 |
| User's notification token | `User’s notification token` | `users_notification_` | 147 |
| User's calendar event | `User’s calendar event` | `users_calendar_even` | 128 |
| User's study notes | `User’s study notes` | `users_study_notes` | 122 |
| Challenged App Content | `Challenged App Content` | `challenged_content` | 100 |
| The current location of one user | `The current location of one user` | `current_location` | 112 |
| Safe Zone | `Safe Zone` | `safe_zone` | 116 |
| Safe Zone Alert | `Safe Zone Alert` | `safe_zone_alert` | 134 |
| Location Request | `Location Request` | `location_request` | 133 |
| Care Facility | `Care Facility` | `care_facility` | 64 |
| Review | `Review` | `review` | 65 |
| Comment | `Comment` | `comment` | 67 |
| Care community post | `Care community post` | `care_community_post` | 70 |
| Vote | `Vote` | `cc_vote` | 33 |
| Job Posting | `Job Posting` | `job_posting` | 29 |
| Job Application | `Job Application` | `job_application` | 30 |
| Ownership Claim | `Ownership Claim` | `ownership_claim` | 136 |
| Ownership Dispute | `Ownership Dispute` | `ownership_dispute` | 137 |

---

## 2. Relation Name → ID

### User ↔ Profile / Cared Ones / Tokens / Notifications
| Relation (PRD intent) | Live Name | ID | Type | Parent → Child |
|---|---|---:|---|---|
| User → Extended Profile (1:1) | One user can have one user‘s extended profile | **111** | one_to_one | `users` → `users_extended_prof` |
| Caregiver → Cared Ones | One user can have many related cared ones | **79** | many_to_many | `users` → `users` |
| User → Notification tokens | One user can have many related notification tokens | **149** | one_to_many | `users` → `users_notification_` |
| User → Notifications | One user can have many related notifications to receive | **148** | one_to_many | `users` → `notification` |
| User → Calendar events | One user can have many related user's calendar events | **129** | one_to_many | `users` → `users_calendar_even` |
| Calendar event → Invited users | One user's calendar event can have many related invited users | **130** | one_to_many | `users_calendar_even` → `users` |
| User → Activity Log | Users to Activity Log | **94** | one_to_many | `users` → `activity_log` |
| User → Health Vital | Users to Health Vital | **96** | one_to_many | `users` → `health_vital` |

### Care Group
| Relation | Live Name | ID | Type | Parent → Child |
|---|---|---:|---|---|
| Care Group ↔ Members | One care group can have many related care group members | **72** | many_to_many | `care_group` → `users` (meta: `care_groups_member_types`, `care_groups_member_roles`, `..._display_name_`, `..._invitation_status`) |
| Care Group → Invites | _(unnamed)_ | **45** | one_to_many | `care_group` → `care_group_invite` |
| Care Group → Gallery | _(unnamed)_ | **46** | one_to_many | `care_group` → `care_group_gallery` |
| Care Group → Private member groups | One care group can have many related private member groups | **47** | one_to_many | `care_group` → `care_group_private_member_group` |
| Private member group ↔ Members | One care group's private member group can have related members | **75** | many_to_many | `care_group_private_member_group` → `users` |
| Care Group ↔ Care Tasks | One care group can have many related care tasks | **48** | many_to_many | `care_group` → `universal_care_task` |
| Care Group → Care Jobs | One care group can have many related care jobs | **154** | one_to_many | `care_group` → `care_job` |
| Care Group → Not-too-special posts | One care group can have many related not too special posts | **77** | one_to_many | `care_group` → `care_group_not_too_special_post` |
| Not-too-special post → Comments | _ | **78** | one_to_many | `care_group_not_too_special_post` → `comment` |
| Not-too-special post ↔ Visible private groups | _ | **103** | many_to_many | `care_group_not_too_special_post` → `care_group_private_member_group` |
| Not-too-special post ↔ Visible users | _ | **104** | many_to_many | `care_group_not_too_special_post` → `users` |
| Care Group → Group chat (1:1) | One care group can have one related group live chat conversation | **140** | one_to_one | `care_group` → `chat_conversation` |

### Care Task
| Relation | Live Name | ID | Type | Parent → Child |
|---|---|---:|---|---|
| Task → Assigned caregivers | One care task can have many related assigned caregivers | **81** | one_to_many | `universal_care_task` → `users` |
| Task → Comments | One care task can have many related comments | **82** | one_to_many | `universal_care_task` → `comment` |
| Task → Cared ones | One care task can have many related cared ones | **105** | one_to_many | `universal_care_task` → `users` |
| Task → Cared ones (dup) | One care task can have many related cared ones | **141** | one_to_many | `universal_care_task` → `users` |
| Task ↔ Visible-only users | One care task can have many related users that it's only visible to | **108** | many_to_many | `universal_care_task` → `users` |
| Task ↔ Visible private groups | One care task can have many related care group's private member groups that it's visible to | **109** | many_to_many | `universal_care_task` → `care_group_private_member_group` |
| Task → Calendar events | One care task can have many related user's calendar events | **131** | one_to_many | `universal_care_task` → `users_calendar_even` |

### Care Job
| Relation | Live Name | ID | Type | Parent → Child |
|---|---|---:|---|---|
| Job → Cared ones | One care job can have many related cared ones | **152** | one_to_many | `care_job` → `users` |
| Job → Assigned caregivers | One care job can have many assigned caregivers | **153** | one_to_many | `care_job` → `users` |
| Job ↔ Care Tasks | One care job can have many related care tasks | **155** | many_to_many | `care_job` → `universal_care_task` |
| Job → Comments | One care job can have many related comments | **156** | one_to_many | `care_job` → `comment` |

### Cared-one toolkit
| Relation | Live Name | ID | Type | Parent → Child |
|---|---|---:|---|---|
| Cared one → Information cards | One cared one can have many related cared one's information cards | **126** | one_to_many | `users` → `cared_ones_informat` |
| Info card → Emergency contacts | One cared one's information card can have many related cared one's emergency contact persons | **127** | one_to_many | `cared_ones_informat` → `emergency_contact` |
| Cared one → Emergency contacts (legacy) | One cared one can have many related cared one's emergency contact persons | **63** | one_to_many | `users` → `emergency_contact` |
| Cared one → Medicine schedules | One cared one can have many related cared one's medicine schedules | **83** | one_to_many | `users` → `medicine` |
| Medicine → Logs | One cared one's medicine schedule can have many related care one's medicine logs | **121** | one_to_many | `medicine` → `medicine_log` |
| Care plan → Medicines | _(unnamed)_ | **54** | one_to_many | `care_plan` → `medicine` |
| Cared one → Care plans | One cared one can have many related cared one's care plans | **97** | one_to_many | `users` → `care_plan` |
| Cared one → Care notes | One cared one can have many related cared one's care notes | **92** | one_to_many | `users` → `care_note` |
| Cared one → Care tips | One cared one can have many related cared one's care tips | **88** | one_to_many | `users` → `care_tip` |
| Cared one → Care documents | One cared one can have many related cared one's care documents | **95** | one_to_many | `users` → `care_document` |
| Cared one → Checkin schedules | One cared one can have many related cared one's checkin schedules | **150** | one_to_many | `users` → `checkin_schedule` |
| Checkin schedule → Logs | One cared one's checkin schedule can have many related care one's checkin logs | **151** | one_to_many | `checkin_schedule` → `checkin_log` |
| Cared one → Checkin (posts) | One cared one can have many related cared one's checkin schedules | **145** | one_to_many | `users` → `posts::post` |

### Location & Safe Zone
| Relation | Live Name | ID | Type | Parent → Child |
|---|---|---:|---|---|
| User → Location snapshots | One user can have many related current location snapshots (meta: `user_type`) | **117** | one_to_many | `users` → `current_location` |
| User → Safe zones | One user can have many related safe zones | **118** | one_to_many | `users` → `safe_zone` |

### Chat
| Relation | Live Name | ID | Type | Parent → Child |
|---|---|---:|---|---|
| Conversation ↔ Chatters | One chat conversation can have many related chatters (meta: `the_user_joined_this_chat_conversation_at_this_time`, `the_user_last_read_this_chat_conversation_at_this_time`, `the_user_has_fucking_muted_this_chat`) | **142** | many_to_many | `chat_conversation` → `users` |
| Conversation → Messages | One chat conversation can have many related chat messages | **143** | one_to_many | `chat_conversation` → `chat_message` |
| Message → Parent (reply) | One chat message can have one parent chat message that it is specifically replying to | **144** | one_to_many | `chat_message` → `chat_message` |

### Marketplace (Facility / Review / Comment / Community / Jobs)
| Relation | Live Name | ID | Type | Parent → Child |
|---|---|---:|---|---|
| Facility → Members | One care facility can have many related facility members (meta: `facility_member_type`, `role`) | **107** | one_to_many | `care_facility` → `users` |
| Facility → Reviews | One care facility can have many related reviews | **66** | one_to_many | `care_facility` → `review` |
| Review → Comments | One review can have many related comments | **68** | one_to_many | `review` → `comment` |
| Comment ↔ Replies | One comment can have many related comments | **69** | many_to_many | `comment` → `comment` |
| Community post → Comments | One care community post can have many related comments | **71** | one_to_many | `care_community_post` → `comment` |
| User → Job postings | _(unnamed)_ | **41** | one_to_many | `users` → `job_posting` |
| User → Job applications | _(unnamed)_ | **42** | one_to_many | `users` → `job_application` |

### Challenged Knowledge Hub
| Relation | Live Name | ID | Type | Parent → Child |
|---|---|---:|---|---|
| User → Finished ChallengeD content | One user can many related finished ChallengeD learn content (meta: `user_has_finished_learning_this_lesson`) | **157** | one_to_many | `users` → `challenged_content` |
| Content → Study notes | One Challenged App Content can have many related user's study notes | **158** | one_to_many | `challenged_content` → `users_study_notes` |
| Content → Care tips | One Challenged App Content can have many related cared one's care tips | **159** | one_to_many | `challenged_content` → `care_tip` |
| Content → Study notes (dup) | One user can many related finished ChallengeD learn content | **123** | one_to_many | `challenged_content` → `users_study_notes` |
| Content → Care tips (dup) | One Challenged App Content can have many related cared one's care tips | **124** | one_to_many | `challenged_content` → `care_tip` |

---

## 3. Notes & Open Questions

1. **Truncated slugs** (JetEngine 19-char limit): `users_extended_prof`, `users_notification_`, `users_calendar_even`, `users_study_notes`, `cared_ones_informat`, `current_location`. Frontend must use these exact slugs.
2. **Duplicate relations** to clarify before code wiring:
   - Task → Cared ones: **105** vs **141** (same definition, both exist)
   - Cared one → Emergency contacts: **63** (direct) vs **127** (via info card)
   - ChallengeD content → Study notes: **123** vs **158** (same definition)
   - ChallengeD content → Care tips: **124** vs **159** (same definition)
3. **Notification CCT field schema** is empty in `/jet-engine/v2` response — fields exist in WP but aren't exposed via this endpoint. Will use REST `cct/v1/notification` to discover field keys at runtime.
4. **Push tokens** live in CCT `users_notification_` (slug truncated from `users_notification_token`), linked via Rel **149**. Per your latest decision, this is the storage location (not a profile column).
