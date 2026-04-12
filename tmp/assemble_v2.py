#!/usr/bin/env python3
"""Assemble V2 page payloads with sidebar for REST API deployment.

V2 blocks are self-contained (include their own headers, styles, JS).
This script wraps each block with the shared sidebar in a 2-column layout.
"""
import json
import os

BASE = os.path.dirname(os.path.abspath(__file__))

# Sidebar block markup (shared across all pages)
SIDEBAR = """<!-- wp:column {"width":"220px"} -->
<div class="wp-block-column" style="flex-basis:220px"><!-- wp:group {"style":{"spacing":{"padding":{"top":"1rem","right":"0.75rem","bottom":"1rem","left":"0.75rem"}},"border":{"right":{"color":"#e5e7eb","width":"1px"}}},"backgroundColor":"base","layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group has-base-background-color has-background" style="border-right-color:#e5e7eb;border-right-width:1px;padding-top:1rem;padding-right:0.75rem;padding-bottom:1rem;padding-left:0.75rem"><!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/dashboard/">🏠 Dashboard</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/cared-ones/">❤️ Loved Ones</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/bookings/">📅 Appointments</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/inbox/">💬 Messages</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/care-circle/">👥 Care Teams</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/jobs/">💼 Jobs Board</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/store-listing/">🔍 Find Help</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/gps-tracking/">📍 GPS Tracking</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/favorites/">⭐ Favorites</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/community/">🗣 Community</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/articles/">📰 Articles</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/provider-dashboard/">⚙️ Provider Hub</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/notifications/">🔔 Notifications</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/profile/">👤 My Profile</a></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->"""


def wrap_page(block_file):
    """Wrap a V2 block in sidebar+main columns layout."""
    path = os.path.join(BASE, block_file)
    if not os.path.exists(path):
        print(f"  ERROR: {block_file} not found!")
        return None

    with open(path, 'r') as f:
        block_content = f.read().strip()

    content = f"""<!-- wp:columns {{"isStackedOnMobile":false}} -->
<div class="wp-block-columns is-not-stacked-on-mobile">{SIDEBAR}

<!-- wp:column {{"style":{{"color":{{"background":"#f9fafb"}}}}}} -->
<div class="wp-block-column has-background" style="background-color:#f9fafb">{block_content}</div>
<!-- /wp:column --></div>
<!-- /wp:columns -->"""

    return content


# Page definitions: (page_id, block_file, output_name, slug)
# page_id=None means we need to look it up or create it
pages = [
    (24,   "dashboard-v2.html",      "v2_dashboard.json",      "dashboard"),
    (162,  "bookings-v2.html",       "v2_bookings.json",       "bookings"),
    (161,  "messages-v2.html",       "v2_messages.json",       "inbox"),
    (None, "jobs-v2.html",           "v2_jobs.json",           "jobs"),
    (None, "profile-v2.html",        "v2_profile.json",        "profile"),
    (None, "notifications-v2.html",  "v2_notifications.json",  "notifications"),
    (None, "favorites-v2.html",      "v2_favorites.json",      "favorites"),
    (None, "gps-v2.html",           "v2_gps.json",            "gps-tracking"),
    (None, "provider-v2.html",       "v2_provider.json",       "provider-dashboard"),
    (None, "community-v2.html",      "v2_community.json",      "community"),
    (None, "articles-v2.html",       "v2_articles.json",       "articles"),
]

print("Assembling V2 page payloads...\n")

deploy_script_lines = []

for page_id, block_file, output_name, slug in pages:
    content = wrap_page(block_file)
    if content is None:
        continue

    payload = {"content": content, "status": "publish"}
    if page_id:
        payload["id"] = page_id

    output_path = os.path.join(BASE, output_name)
    with open(output_path, 'w') as f:
        json.dump(payload, f, ensure_ascii=False)

    size = len(content)
    id_str = f"ID {page_id}" if page_id else f"slug={slug}"
    print(f"  ✅ {slug:25s} ({id_str}) — {size:,} chars → {output_name}")

    # Build deploy curl command
    if page_id:
        endpoint = f"http://170.106.171.59:8080/careconnected/wp-json/wp/v2/pages/{page_id}"
    else:
        endpoint = f"http://170.106.171.59:8080/careconnected/wp-json/wp/v2/pages"
    
    deploy_script_lines.append(f'echo "Deploying {slug}..."')
    deploy_script_lines.append(f'curl -s -X POST "{endpoint}" \\')
    deploy_script_lines.append(f'  -H "Content-Type: application/json" \\')
    deploy_script_lines.append(f'  -H "Cookie: $COOKIE" \\')
    deploy_script_lines.append(f'  -H "X-WP-Nonce: $NONCE" \\')
    deploy_script_lines.append(f'  -d @{output_name} | python3 -c "import sys,json; d=json.load(sys.stdin); print(f\'  → Page ID: {{d.get(\"id\",\"?\")}} Status: {{d.get(\"status\",\"?\")}} Link: {{d.get(\"link\",\"?\")}}\")" 2>/dev/null || echo "  → FAILED"')
    deploy_script_lines.append('')

# Write deploy script
deploy_script = f"""#!/bin/bash
# Deploy all V2 pages to WordPress
# Usage: COOKIE="..." NONCE="..." bash deploy_v2.sh

cd "{BASE}"

if [ -z "$COOKIE" ] || [ -z "$NONCE" ]; then
  echo "ERROR: Set COOKIE and NONCE env vars first."
  echo ""
  echo "To get them:"
  echo "1. Log in to WordPress admin at http://170.106.171.59:8080/careconnected/wp-admin/"
  echo "2. Open browser console and run:"
  echo "   document.cookie  → copy the full cookie string"
  echo "   wpApiSettings.nonce  → copy the nonce"
  echo ""
  exit 1
fi

echo "Deploying {len(pages)} V2 pages to WordPress..."
echo ""

{chr(10).join(deploy_script_lines)}
echo ""
echo "Done! Check pages at http://170.106.171.59:8080/careconnected/"
"""

deploy_path = os.path.join(BASE, "deploy_v2.sh")
with open(deploy_path, 'w') as f:
    f.write(deploy_script)

print(f"\n✅ {len(pages)} payloads generated")
print(f"✅ Deploy script: {deploy_path}")
print(f"\nTo deploy, first get cookie+nonce from WP admin, then:")
print(f'  COOKIE="..." NONCE="..." bash {deploy_path}')
