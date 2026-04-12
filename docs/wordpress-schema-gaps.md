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
- `notifications` -> `wp/v2/notification`
- `care_groups` -> `wp/v2/care_group`
- `care_group` -> `wp/v2/care_group/{id}`
- `care_facilities` -> `wp/v2/care_facility`
- `care_facility` -> `wp/v2/care_facility/{id}`
- `categories` -> `wp/v2/{taxonomy}`
- `reviews` -> `wp/v2/comments`
- `review_create` -> `wp/v2/comments`
- `care_tasks` -> `wp/v2/care_task`
- `wp_user` -> `wp/v2/users/{id}`

## Provisional (status: "provisional" in schema — wired but CPT/fields need backend confirmation)

- `care_group_members` -> reads ACF `members` field on care_group CPT, then fetches each user
- `cared_ones` -> `wp/v2/cared_one` (CPT assumed, needs backend confirmation)
- `saved_providers` -> `wp/v2/saved_provider` (CPT assumed, needs backend confirmation)
- `saved_provider` -> `wp/v2/saved_provider/{id}`
- `location_shares` -> `wp/v2/location_share` (CPT assumed, needs backend confirmation)
- `location_share_me` -> `wp/v2/location_share` (filtered per_page=1 for current user)
- `conversations` -> `wp/v2/conversation` (CPT assumed, needs backend confirmation)
- `conversation_messages` -> `wp/v2/chat_message?conversation_id={id}` (CPT assumed)
- `conversation_message` -> `wp/v2/chat_message` (create)

## Still unresolved (NOT in schema — do not wire)

### Messaging advanced
- unread tracking / mark-read
- conversation membership model
- group messages (distinct from direct)
- start conversation

### Care group internals
- group posts
- invitations
- member roles
- join by code
- member categories
- gallery source

### Cared-one sub-features
- check-in logs
- medicines / medicine logs
- health vitals
- care tips / care plans / care plan goals
- care notes
- emergency contacts
- activity logs / symptom logs
- cared-one documents
- dementia stage storage

### Facilities advanced
- facility members
- ownership claims / disputes
- permission model
- facility review summaries if not derived from comments

### Jobs
- job postings (`wp/v2/job_posting` file exists but is orphaned — not imported at runtime)
- job applications (`wp/v2/job_application` file exists but is orphaned)

### Generic posts CRUD
- `posts/source.wordpress.ts` exists but is orphaned — not imported at runtime

### Meta engine parity
- Decision needed: native WP post types/taxonomies directly vs mirrored meta engine

## Quarantined files (not runtime-imported, contain guessed WP logic)

- `src/features/cared-ones/source.wordpress-extended.ts`
- `src/features/care-groups/source.wordpress-extended.ts`
- `src/features/location/source.wordpress-extended.ts`
- `src/features/facilities/source.wordpress-extended.ts`
- `src/features/jobs/source.wordpress.ts`
- `src/features/posts/source.wordpress.ts`

## Process

1. Confirm the WP source of truth here.
2. Add the confirmed mapping to `src/features/shared/wordpress-schema.ts` with `status: "confirmed"`.
3. Use the generic adapter (`wordpress-adapter.ts`) only.
4. Then wire hooks.
5. Provisional entries can be promoted to confirmed once backend is verified.
