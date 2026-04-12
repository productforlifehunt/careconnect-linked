# WordPress Schema Gaps

This file is the single place to track unresolved WordPress backend mappings.

## Rule

If a feature is not confirmed here or in `src/features/shared/wordpress-schema.ts`, do not wire it in hooks and do not invent CPTs, taxonomies, ACF fields, or custom routes.

## Confirmed (status: "confirmed" in schema)

- `providers` -> `dokan/v1/stores`
- `provider` -> `dokan/v1/stores/{id}`
- `bookings` -> `wc/v3/orders`
- `booking` -> `wc/v3/orders/{id}`
- `profile_me` -> `wp/v2/users/me`
- `articles` -> `wp/v2/posts`
- `article` -> `wp/v2/posts/{id}`
- `notifications` -> `jet-cct/cc_notification`
- `care_groups` -> `wp/v2/care_group`
- `care_group` -> `wp/v2/care_group/{id}`
- `care_facilities` -> `wp/v2/care_facility`
- `care_facility` -> `wp/v2/care_facility/{id}`
- `categories` -> `wp/v2/{taxonomy}`
- `reviews` -> `jet-cct/review`
- `review_create` -> `jet-cct/review`
- `care_tasks` -> `jet-cct/universal_care_task`
- `wp_user` -> `wp/v2/users/{id}`
- `conversations` -> `jet-cct/chat_conversation`
- `messages` -> `jet-cct/chat_message`
- `chat_member` -> `jet-cct/chat_member` (unread tracking via last_read_message_id)
- `job_posting` -> `jet-cct/job_posting`
- `job_application` -> `jet-cct/job_application`
- `saved_provider` -> `jet-cct/saved_provider`
- `location_current` -> `jet-cct/location_current`
- `cc_notification` -> `jet-cct/cc_notification`
- `care_community_post` -> `jet-cct/care_community_post`
- `reply` -> `jet-cct/reply`
- `vote` -> `jet-cct/vote`
- `medicine` -> `jet-cct/medicine`
- `medicine_log` -> `jet-cct/medicine_log`
- `activity_log` -> `jet-cct/activity_log`
- `care_note` -> `jet-cct/care_note`
- `care_tip` -> `jet-cct/care_tip`
- `care_plan` -> `jet-cct/care_plan`
- `care_plan_goal` -> `jet-cct/care_plan_goal`
- `emergency_contact` -> `jet-cct/emergency_contact`
- `cared_one_document` -> `jet-cct/care_document`
- `health_vital` -> `jet-cct/health_vital` (also stores symptom_log with vital_type=symptom)
- `caregiver_wellness_log` -> `jet-cct/caregiver_wellness_log`
- `ai_conversation` -> `jet-cct/ai_conversations`
- `ai_message` -> `jet-cct/ai_messages`
- `ai_context_memory` -> `jet-cct/ai_context_memory`
- `safe_zone` -> `jet-cct/safe_zone`
- `safe_zone_alert` -> `jet-cct/safe_zone_alert`
- `location_request` -> `jet-cct/location_request`

## JetEngine Relations (User → CCT via jet-rel/{ID})

These are confirmed JetEngine Relations linking Users to CCTs:

| Rel ID | Name | Parent | Child |
|--------|------|--------|-------|
| 63 | User → Emergency Contact | Users | emergency_contact |
| 72 | Care Group → Members | care_group (CPT) | Users |
| 79 | User → Cared One | Users | Users |
| 83 | User → Medicine | Users | medicine |
| 84 | Medicine → Medicine Log | medicine | medicine_log |
| 88 | User → Care Tip | Users | care_tip |
| 91 | Location Sharing | Users | Users |
| 92 | User → Care Note | Users | care_note |
| 94 | User → Activity Log | Users | activity_log |
| 95 | User → Care Document | Users | care_document |
| 96 | User → Health Vital | Users | health_vital |
| 97 | User → Care Plan | Users | care_plan |
| 98 | Care Plan → Goal | care_plan | care_plan_goal |

## CCT Field-Level Joins (NOT Relations — Correct Architecture)

JetEngine Relations UI does NOT support CCT-to-CCT links. These CCTs use field-level
filtering which is the standard JetEngine CCT approach:

- `chat_message.conversation_id` → filters messages by conversation
- `chat_member.conversation_id` → filters members by conversation
- `ai_messages.conversation_id` → filters AI messages by conversation
- `vote.entity_type + entity_id` → polymorphic (post/reply/review)
- `reply.forum_post_id / care_group_post_id / review_id` → polymorphic comments
- `safe_zone_alert.safe_zone_id` → alerts per safe zone

These are NOT legacy or incorrect — CCT field filtering is the intended JetEngine approach.

## Legacy Supabase Status

**0 legacy database connections remain.** The only Supabase reference is the AI Edge Function
(`supabase.functions.invoke("ai-care-engine")`) which is the intended architecture.

## Quarantined files — NONE

All previously quarantined files are now active:
- `src/features/jobs/source.wordpress.ts` — ✅ activated, uses jet-cct/job_posting and jet-cct/job_application
- `src/features/cared-ones/source.wordpress-extended.ts` — ✅ active
- `src/features/care-groups/source.wordpress-extended.ts` — ✅ active
- `src/features/location/source.wordpress-extended.ts` — ✅ active
- `src/features/facilities/source.wordpress-extended.ts` — ✅ active
- `src/features/posts/source.wordpress.ts` — ✅ active

## Process

1. Confirm the WP source of truth here.
2. Add the confirmed mapping to `src/features/shared/wordpress-schema.ts` with `status: "confirmed"`.
3. Use the generic adapter (`wordpress-adapter.ts`) only.
4. Then wire hooks.
5. Provisional entries can be promoted to confirmed once backend is verified.
