#!/usr/bin/env python3
"""Assemble all page payloads with sidebar for REST API deployment."""
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


def wrap_page(title, subtitle, block_files):
    """Wrap block content in a columns layout with sidebar."""
    # Read block files
    blocks_content = ""
    for f in block_files:
        path = os.path.join(BASE, f)
        if os.path.exists(path):
            with open(path, 'r') as fh:
                blocks_content += fh.read() + "\n\n"
        else:
            print(f"  WARNING: {f} not found")

    # Build full page
    content = f"""<!-- wp:columns {{"isStackedOnMobile":false}} -->
<div class="wp-block-columns is-not-stacked-on-mobile">{SIDEBAR}

<!-- wp:column {{"style":{{"color":{{"background":"#f9fafb"}}}}}} -->
<div class="wp-block-column has-background" style="background-color:#f9fafb"><!-- wp:group {{"style":{{"spacing":{{"padding":{{"top":"1.5rem","right":"1.5rem","left":"1.5rem"}}}}}},"layout":{{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}}}} -->
<div class="wp-block-group" style="padding-top:1.5rem;padding-right:1.5rem;padding-left:1.5rem"><!-- wp:heading {{"level":1,"style":{{"typography":{{"fontSize":"clamp(0.984rem, 0.984rem + ((1vw - 0.2rem) * 0.809), 1.5rem)","fontWeight":"700"}},"spacing":{{"margin":{{"top":"0","bottom":"0.25rem"}}}}}}}} -->
<h1 class="wp-block-heading" style="margin-top:0;margin-bottom:0.25rem;font-size:clamp(0.984rem, 0.984rem + ((1vw - 0.2rem) * 0.809), 1.5rem);font-weight:700">{title}</h1>
<!-- /wp:heading --></div>
<!-- /wp:group -->

<!-- wp:paragraph {{"style":{{"color":{{"text":"#6b7280"}},"typography":{{"fontSize":"0.875rem"}},"spacing":{{"padding":{{"left":"1.5rem"}}}}}}}} -->
<p class="has-text-color" style="color:#6b7280;font-size:0.875rem;padding-left:1.5rem">{subtitle}</p>
<!-- /wp:paragraph -->

<!-- wp:spacer {{"height":"1rem"}} -->
<div style="height:1rem" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:group {{"style":{{"spacing":{{"padding":{{"right":"1.5rem","left":"1.5rem","bottom":"1.5rem"}}}}}},"layout":{{"type":"default"}}}} -->
<div class="wp-block-group" style="padding-right:1.5rem;padding-left:1.5rem;padding-bottom:1.5rem">{blocks_content}</div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->"""

    return content


# Page definitions: (page_id, title, subtitle, block_files, output_name)
pages = [
    (24, "Welcome back!", "Here is your care overview and daily summary.", 
     ["dashboard-stats-block.html", "dashboard-bookings-block.html", "dashboard-tasks-block.html", "dashboard-quick-actions-block.html", "dashboard-cared-ones-block.html"],
     "payload_dashboard.json"),
    
    (162, "Appointments", "Manage your care bookings and appointments.",
     ["bookings-tabs-block.html", "bookings-list-block.html"],
     "payload_bookings.json"),
    
    (161, "Messages", "Chat with your care circle and providers.",
     ["messages-conversations-block.html"],
     "payload_messages.json"),
    
    (None, "Jobs Board", "Find and post caregiving opportunities.",
     ["jobs-board-block.html"],
     "payload_jobs.json"),
    
    (None, "My Profile", "Manage your account settings and preferences.",
     ["profile-block.html"],
     "payload_profile.json"),
    
    (None, "Notifications", "Stay updated on your care activities.",
     ["notifications-block.html"],
     "payload_notifications.json"),
    
    (None, "Favorites", "Your saved care providers.",
     ["favorites-block.html"],
     "payload_favorites.json"),
    
    (None, "GPS Tracking", "Track and share locations with your care circle.",
     ["gps-tracking-block.html"],
     "payload_gps.json"),
    
    (None, "Provider Hub", "Manage your bookings, schedule, and earnings.",
     ["provider-dashboard-block.html"],
     "payload_provider.json"),
    
    (None, "Community", "Connect and share with other caregivers.",
     ["community-block.html"],
     "payload_community.json"),
    
    (None, "Articles", "Read and share caregiving knowledge.",
     ["articles-block.html"],
     "payload_articles.json"),
]

print("Assembling page payloads...\n")

for page_id, title, subtitle, block_files, output_name in pages:
    content = wrap_page(title, subtitle, block_files)
    payload = {"content": content}
    if page_id:
        payload["id"] = page_id
    
    output_path = os.path.join(BASE, output_name)
    with open(output_path, 'w') as f:
        json.dump(payload, f, ensure_ascii=False)
    
    size = len(content)
    blocks = len(block_files)
    id_str = f"ID {page_id}" if page_id else "ID TBD"
    print(f"  ✅ {title:20s} ({id_str}) — {blocks} blocks, {size:,} chars → {output_name}")

print(f"\nDone! {len(pages)} page payloads generated in {BASE}/")
print("\nTo deploy, use curl with cookie auth:")
print('  curl -X POST "http://170.106.171.59:8080/careconnected/wp-json/wp/v2/pages/{ID}" \\')
print('    -H "Content-Type: application/json" -H "Cookie: ..." -H "X-WP-Nonce: ..." \\')
print('    -d @payload_xxx.json')
