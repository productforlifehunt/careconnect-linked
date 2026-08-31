---
name: WP users context=edit 403 fallback
description: App users (subscriber/customer) get 403 on wp/v2/users/<id>?context=edit; always fall back to the public user endpoint
type: feature
---

`GET wp/v2/users/<id>?context=edit` returns 403 for app-role users reading any other user. Symptom: cared ones / members silently disappear from lists because the per-user fetch throws and the row is filtered out.

Rule: never read another user with `context=edit` alone. Use `fetchWPUserSafe()` in `src/features/cared-ones/source.wordpress-extended.ts`, which retries `wp/v2/users/<id>` (public context: name, slug, avatar_urls — no email).

Related: `wp/v2/media` POST also 403s for app roles; `src/lib/wp-media.ts` falls back to the `upload_media` action of the `wp-admin-ops` edge function.
