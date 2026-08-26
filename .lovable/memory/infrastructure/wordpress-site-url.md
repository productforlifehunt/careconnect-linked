---
name: WordPress Site URL & Admin Access
description: HTTPS careconnected subsite; WP admin GUI fully works via Cloudflare (CSS renders correctly)
type: reference
---
WordPress site URL: https://app.challenged-dementia.com/afresh

- Root domain `app.challenged-dementia.com` = WP main site (NOT our app)
- Our app data lives on the `/afresh` subsite
- Old `/careconnected` subsite is deprecated
- **WP admin GUI works fully via HTTPS Cloudflare** — CSS renders, JetEngine dashboards work, no SSH needed for 90-mode browser automation
- JetEngine CCT list: `wp-admin/admin.php?page=jet-engine-cct`
- JetEngine CCT create: `wp-admin/admin.php?page=jet-engine-cct&cct_action=add`
- Login: `wp-login.php` with account `challenged` / `challenged5527@@@@@`
