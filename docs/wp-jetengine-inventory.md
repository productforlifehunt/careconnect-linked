# WordPress JetEngine — Live CCT & Relation Inventory

Pulled live from `app.challenged-dementia.com/careconnected` via `/jet-engine/v2`.
Total: **42 CCTs**, **61 Relations**.

## CCTs

| ID | Slug | Name | Field count |
|---:|------|------|---:|
| 9 | `care_group` | Care Group | 0 |
| 13 | `care_group_invite` | Care Group Invite | 0 |
| 14 | `care_group_gallery` | Care Group Gallery | 0 |
| 15 | `medicine` | Cared one’s medicine schedule | 0 |
| 16 | `medicine_log` | Care one's medicine log | 0 |
| 17 | `checkin_log` | Care one's checkin log | 0 |
| 18 | `health_vital` | Health Vital | 0 |
| 19 | `care_tip` | Cared one's care tip | 0 |
| 20 | `care_plan` | Cared one's care plan | 0 |
| 21 | `care_plan_goal` | Care Plan Goal | 0 |
| 22 | `care_note` | Cared one’s care note | 0 |
| 23 | `care_document` | Cared one's care document | 0 |
| 24 | `emergency_contact` | Cared one’s emergency contact person | 0 |
| 25 | `activity_log` | Activity Log | 0 |
| 26 | `chat_conversation` | Chat Conversation | 0 |
| 27 | `chat_message` | Chat Message | 0 |
| 29 | `job_posting` | Job Posting | 0 |
| 30 | `job_application` | Job Application | 0 |
| 33 | `cc_vote` | Vote | 0 |
| 64 | `care_facility` | Care Facility | 0 |
| 65 | `review` | Review | 0 |
| 67 | `comment` | Comment | 0 |
| 70 | `care_community_post` | Care community post | 0 |
| 74 | `care_group_private_member_group` | The related private member groups of one care group | 0 |
| 76 | `care_group_not_too_special_post` | The related not too special posts of one care group | 0 |
| 80 | `universal_care_task` | Care Task | 0 |
| 100 | `challenged_content` | Challenged App Content | 0 |
| 101 | `caregiver_wellness_log` | Caregiver Wellness Log | 0 |
| 110 | `users_extended_prof` | User‘s extended profile | 0 |
| 112 | `current_location` | The current location of one user | 0 |
| 116 | `safe_zone` | Safe Zone | 0 |
| 122 | `users_study_notes` | User’s study notes | 0 |
| 125 | `cared_ones_informat` | Cared one’s information card | 0 |
| 128 | `users_calendar_even` | User’s calendar event | 0 |
| 133 | `location_request` | Location Request | 0 |
| 134 | `safe_zone_alert` | Safe Zone Alert | 0 |
| 136 | `ownership_claim` | Ownership Claim | 0 |
| 137 | `ownership_dispute` | Ownership Dispute | 0 |
| 138 | `checkin_schedule` | Cared one’s checkin schedule | 0 |
| 139 | `care_job` | Care Job | 0 |
| 146 | `notification` | Notification | 0 |
| 147 | `users_notification_` | User’s notification token | 0 |

## Relations

| ID | Type | Parent | Child | Name |
|---:|------|--------|-------|------|
| 41 | one_to_many | `mix::users` | `cct::job_posting` | _(unnamed)_ |
| 42 | one_to_many | `mix::users` | `cct::job_application` | _(unnamed)_ |
| 45 | one_to_many | `cct::care_group` | `cct::care_group_invite` | _(unnamed)_ |
| 46 | one_to_many | `cct::care_group` | `cct::care_group_gallery` | _(unnamed)_ |
| 47 | one_to_many | `cct::care_group` | `cct::care_group_private_member_group` | One care group can have many related private member groups |
| 48 | many_to_many | `cct::care_group` | `cct::universal_care_task` | One care group can have many related care tasks |
| 54 | one_to_many | `cct::care_plan` | `cct::medicine` | _(unnamed)_ |
| 63 | one_to_many | `mix::users` | `cct::emergency_contact` | One cared one can have many related cared one’s emergency contact persons |
| 66 | one_to_many | `cct::care_facility` | `cct::review` | One care facility can have many related reviews |
| 68 | one_to_many | `cct::review` | `cct::comment` | One review can have many related comments |
| 69 | many_to_many | `cct::comment` | `cct::comment` | One comment can have many related comments |
| 71 | one_to_many | `cct::care_community_post` | `cct::comment` | One care community post can have many related comments |
| 72 | many_to_many | `cct::care_group` | `mix::users` | One care group can have many related care group members |
| 75 | many_to_many | `cct::care_group_private_member_group` | `mix::users` | One care group's private member group can have related members |
| 77 | one_to_many | `cct::care_group` | `cct::care_group_not_too_special_post` | One care group can have many related not too special posts |
| 78 | one_to_many | `cct::care_group_not_too_special_post` | `cct::comment` | One related not too special posts of one care group can have many related comments |
| 79 | many_to_many | `mix::users` | `mix::users` | One user can have many related cared ones |
| 81 | one_to_many | `cct::universal_care_task` | `mix::users` | One care task can have many related assigned caregivers |
| 82 | one_to_many | `cct::universal_care_task` | `cct::comment` | One care task can have many related comments |
| 83 | one_to_many | `mix::users` | `cct::medicine` | One cared one can have many related cared one’s medicine schedules |
| 88 | one_to_many | `mix::users` | `cct::care_tip` | One cared one can have many related cared one’s care tips |
| 92 | one_to_many | `mix::users` | `cct::care_note` | One cared one can have many related cared one’s care notes |
| 94 | one_to_many | `mix::users` | `cct::activity_log` | Users to Activity Log |
| 95 | one_to_many | `mix::users` | `cct::care_document` | One cared one can have many related cared one’s care documents |
| 96 | one_to_many | `mix::users` | `cct::health_vital` | Users to Health Vital |
| 97 | one_to_many | `mix::users` | `cct::care_plan` | One cared one can have many related cared one’s care plans |
| 103 | many_to_many | `cct::care_group_not_too_special_post` | `cct::care_group_private_member_group` | One related not too special posts of one care group can have many related care group’s private member groups that it’s visible to |
| 104 | many_to_many | `cct::care_group_not_too_special_post` | `mix::users` | One related not too special posts of one care group can have many related users that it’s visible to |
| 105 | one_to_many | `cct::universal_care_task` | `mix::users` | One care task can have many related cared ones |
| 107 | one_to_many | `cct::care_facility` | `mix::users` | One care facility can have many related facility members |
| 108 | many_to_many | `cct::universal_care_task` | `mix::users` | One care task can have many related users that it’s only visible to |
| 109 | many_to_many | `cct::universal_care_task` | `cct::care_group_private_member_group` | One care task can have many related care group’s private member groups that it’s visible to |
| 111 | one_to_one | `mix::users` | `cct::users_extended_prof` | One user can have one user‘s extended profile |
| 117 | one_to_many | `mix::users` | `cct::current_location` | One user can have many related current location snapshots |
| 118 | one_to_many | `mix::users` | `cct::safe_zone` | One user can have many related safe zones |
| 121 | one_to_many | `cct::medicine` | `cct::medicine_log` | One cared one’s medicine schedule can have many related care one's medicine logs |
| 123 | one_to_many | `cct::challenged_content` | `cct::users_study_notes` | One user can many related finished ChallengeD learn content |
| 124 | one_to_many | `cct::challenged_content` | `cct::care_tip` | One Challenged App Content can have many related cared one’s care tips |
| 126 | one_to_many | `mix::users` | `cct::cared_ones_informat` | One cared one can have many related cared one’s information cards |
| 127 | one_to_many | `cct::cared_ones_informat` | `cct::emergency_contact` | One cared one’s information card can have many related cared one’s emergency contact persons |
| 129 | one_to_many | `mix::users` | `cct::users_calendar_even` | One user can have many related user’s calendar events |
| 130 | one_to_many | `cct::users_calendar_even` | `mix::users` | One user’s calendar event can have many related invited users |
| 131 | one_to_many | `cct::universal_care_task` | `cct::users_calendar_even` | One care task can have many related user’s calendar events |
| 140 | one_to_one | `cct::care_group` | `cct::chat_conversation` | One care group can have one related group live chat conversation |
| 141 | one_to_many | `cct::universal_care_task` | `mix::users` | One care task can have many related cared ones |
| 142 | many_to_many | `cct::chat_conversation` | `mix::users` | One chat conversation can have many related chatters |
| 143 | one_to_many | `cct::chat_conversation` | `cct::chat_message` | One chat conversation can have many related chat messages |
| 144 | one_to_many | `cct::chat_message` | `cct::chat_message` | One chat message can have one parent chat message that it is specifically replying to |
| 145 | one_to_many | `mix::users` | `posts::post` | One cared one can have many related cared one's checkin schedules |
| 148 | one_to_many | `mix::users` | `cct::notification` | One user can have many related notifications to receive |
| 149 | one_to_many | `mix::users` | `cct::users_notification_` | One user can have many related notification tokens |
| 150 | one_to_many | `mix::users` | `cct::checkin_schedule` | One cared one can have many related cared one’s checkin schedules |
| 151 | one_to_many | `cct::checkin_schedule` | `cct::checkin_log` | One cared one’s checkin schedule can have many related care one's checkin logs |
| 152 | one_to_many | `cct::care_job` | `mix::users` | One care job can have many related cared ones |
| 153 | one_to_many | `cct::care_job` | `mix::users` | One care job can have many assigned caregivers |
| 154 | one_to_many | `cct::care_group` | `cct::care_job` | One care group can have many related care jobs |
| 155 | many_to_many | `cct::care_job` | `cct::universal_care_task` | One care job can have many related care tasks |
| 156 | one_to_many | `cct::care_job` | `cct::comment` | One care job can have many related comments |
| 157 | one_to_many | `mix::users` | `cct::challenged_content` | One user can many related finished ChallengeD learn content |
| 158 | one_to_many | `cct::challenged_content` | `cct::users_study_notes` | One Challenged App Content can have many related user’s study notes |
| 159 | one_to_many | `cct::challenged_content` | `cct::care_tip` | One Challenged App Content can have many related cared one’s care tips |

## CCT Fields (detail)

### 9 — `care_group` — Care Group
_(no custom fields)_

### 13 — `care_group_invite` — Care Group Invite
_(no custom fields)_

### 14 — `care_group_gallery` — Care Group Gallery
_(no custom fields)_

### 15 — `medicine` — Cared one’s medicine schedule
_(no custom fields)_

### 16 — `medicine_log` — Care one's medicine log
_(no custom fields)_

### 17 — `checkin_log` — Care one's checkin log
_(no custom fields)_

### 18 — `health_vital` — Health Vital
_(no custom fields)_

### 19 — `care_tip` — Cared one's care tip
_(no custom fields)_

### 20 — `care_plan` — Cared one's care plan
_(no custom fields)_

### 21 — `care_plan_goal` — Care Plan Goal
_(no custom fields)_

### 22 — `care_note` — Cared one’s care note
_(no custom fields)_

### 23 — `care_document` — Cared one's care document
_(no custom fields)_

### 24 — `emergency_contact` — Cared one’s emergency contact person
_(no custom fields)_

### 25 — `activity_log` — Activity Log
_(no custom fields)_

### 26 — `chat_conversation` — Chat Conversation
_(no custom fields)_

### 27 — `chat_message` — Chat Message
_(no custom fields)_

### 29 — `job_posting` — Job Posting
_(no custom fields)_

### 30 — `job_application` — Job Application
_(no custom fields)_

### 33 — `cc_vote` — Vote
_(no custom fields)_

### 64 — `care_facility` — Care Facility
_(no custom fields)_

### 65 — `review` — Review
_(no custom fields)_

### 67 — `comment` — Comment
_(no custom fields)_

### 70 — `care_community_post` — Care community post
_(no custom fields)_

### 74 — `care_group_private_member_group` — The related private member groups of one care group
_(no custom fields)_

### 76 — `care_group_not_too_special_post` — The related not too special posts of one care group
_(no custom fields)_

### 80 — `universal_care_task` — Care Task
_(no custom fields)_

### 100 — `challenged_content` — Challenged App Content
_(no custom fields)_

### 101 — `caregiver_wellness_log` — Caregiver Wellness Log
_(no custom fields)_

### 110 — `users_extended_prof` — User‘s extended profile
_(no custom fields)_

### 112 — `current_location` — The current location of one user
_(no custom fields)_

### 116 — `safe_zone` — Safe Zone
_(no custom fields)_

### 122 — `users_study_notes` — User’s study notes
_(no custom fields)_

### 125 — `cared_ones_informat` — Cared one’s information card
_(no custom fields)_

### 128 — `users_calendar_even` — User’s calendar event
_(no custom fields)_

### 133 — `location_request` — Location Request
_(no custom fields)_

### 134 — `safe_zone_alert` — Safe Zone Alert
_(no custom fields)_

### 136 — `ownership_claim` — Ownership Claim
_(no custom fields)_

### 137 — `ownership_dispute` — Ownership Dispute
_(no custom fields)_

### 138 — `checkin_schedule` — Cared one’s checkin schedule
_(no custom fields)_

### 139 — `care_job` — Care Job
_(no custom fields)_

### 146 — `notification` — Notification
_(no custom fields)_

### 147 — `users_notification_` — User’s notification token
_(no custom fields)_

## Relation meta fields

### Rel 72 — One care group can have many related care group members
| Field | Title | Type |
|-------|-------|------|
| `care_groups_member_types` | care group's member types | checkbox |
| `care_groups_member_roles` | care group's member roles | checkbox |
| `care_groups_member_display_name_` | care group's member display name  | text |
| `care_groups_member_invitation_status` | care group's member invitation status | radio |

### Rel 107 — One care facility can have many related facility members
| Field | Title | Type |
|-------|-------|------|
| `facility_member_type` | Facility member type | checkbox |
| `role` | Facility member role | text |

### Rel 117 — One user can have many related current location snapshots
| Field | Title | Type |
|-------|-------|------|
| `user_type` | User type | radio |

### Rel 118 — One user can have many related safe zones
| Field | Title | Type |
|-------|-------|------|
| `field` |  | text |
| `field_1` |  | text |

### Rel 142 — One chat conversation can have many related chatters
| Field | Title | Type |
|-------|-------|------|
| `the_user_joined_this_chat_conversation_at_this_time` | The user joined this chat conversation at this time | datetime-local |
| `the_user_last_read_this_chat_conversation_at_this_time` | The user last read this chat conversation at this time | datetime-local |
| `the_user_has_fucking_muted_this_chat` | The user has fucking muted this chat | radio |

### Rel 157 — One user can many related finished ChallengeD learn content
| Field | Title | Type |
|-------|-------|------|
| `user_has_finished_learning_this_lesson` | User has finished learning this lesson | radio |
