---
name: WordPress Site URL Migration
description: Site URL changed from http://170.106.171.59:8080/careconnected to https://app.challenged-dementia.com/careconnected
type: feature
---
WordPress site URL migrated to HTTPS domain: https://app.challenged-dementia.com/careconnected
- The root domain (app.challenged-dementia.com) is the WP main site — NOT our app
- Our app data lives on the /careconnected subsite
- Old IP (170.106.171.59:8080) no longer resolves the careconnected subsite
- WP admin CSS is broken via Cloudflare tunnel — GUI operations require SSH
