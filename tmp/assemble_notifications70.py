#!/usr/bin/env python3
import json
import os

BASE = os.path.dirname(os.path.abspath(__file__))
COLUMNS_OPEN = '<!-- wp:columns {"isStackedOnMobile":false} -->\n<div class="wp-block-columns is-not-stacked-on-mobile">'
MAIN_COLUMN_OPEN = '<!-- wp:column {"style":{"color":{"background":"#f9fafb"}}} -->\n<div class="wp-block-column has-background" style="background-color:#f9fafb">\n<!-- wp:group {"style":{"spacing":{"padding":{"right":"1.5rem","left":"1.5rem","bottom":"1.5rem"}}}} -->\n<div class="wp-block-group" style="padding-right:1.5rem;padding-left:1.5rem;padding-bottom:1.5rem">'
MAIN_COLUMN_CLOSE = '</div>\n<!-- /wp:group -->\n</div>\n<!-- /wp:column --></div>\n<!-- /wp:columns -->'
SIDEBAR = """<!-- wp:column {"width":"220px"} -->
<div class="wp-block-column" style="flex-basis:220px"><!-- wp:group {"style":{"spacing":{"padding":{"top":"1rem","right":"0.75rem","bottom":"1rem","left":"0.75rem"}},"border":{"right":{"color":"#e5e7eb","width":"1px"}}},"backgroundColor":"base","layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group has-base-background-color has-background" style="border-right-color:#e5e7eb;border-right-width:1px;padding-top:1rem;padding-right:0.75rem;padding-bottom:1rem;padding-left:0.75rem"><!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/dashboard/">🏠 Dashboard</a></p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","right":"0.75rem","bottom":"0.5rem","left":"0.75rem"}},"typography":{"fontSize":"0.875rem"}}} -->
<p style="padding-top:0.5rem;padding-right:0.75rem;padding-bottom:0.5rem;padding-left:0.75rem;font-size:0.875rem"><a href="/careconnected/notifications/">🔔 Notifications</a></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->"""
BLOCKS = [
    "notifications70-shell-block.html",
    "notifications70-all-block.html",
    "notifications70-invitations-block.html",
]
parts = []
for name in BLOCKS:
    with open(os.path.join(BASE, name), 'r') as f:
        parts.append(f.read().strip())
content = COLUMNS_OPEN + SIDEBAR + "\n" + MAIN_COLUMN_OPEN + "\n" + os.linesep.join(parts) + "\n" + MAIN_COLUMN_CLOSE
payload = {"content": content, "status": "publish"}
out = os.path.join(BASE, "notifications70_payload.json")
with open(out, 'w') as f:
    json.dump(payload, f, ensure_ascii=False)
print(f"Generated {out} ({len(content):,} chars)")
