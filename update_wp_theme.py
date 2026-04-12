#!/usr/bin/env python3
"""Update WordPress theme header, footer, and Additional CSS to match React app."""
import urllib.request
import urllib.error
import json
import http.cookiejar

BASE = "http://170.106.171.59:8080/careconnected"
COOKIE_FILE = "/tmp/wp_cookies.txt"

jar = http.cookiejar.MozillaCookieJar(COOKIE_FILE)
jar.load(ignore_discard=True, ignore_expires=True)
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))

# Get fresh nonce
nonce_req = urllib.request.Request(f"{BASE}/wp-admin/admin-ajax.php?action=rest-nonce")
nonce_resp = opener.open(nonce_req)
NONCE = nonce_resp.read().decode()
print(f"Nonce: {NONCE}")

def api_post(endpoint, data):
    url = f"{BASE}/wp-json/wp/v2/{endpoint}"
    payload = json.dumps(data).encode()
    req = urllib.request.Request(url, data=payload, method="POST")
    req.add_header("X-WP-Nonce", NONCE)
    req.add_header("Content-Type", "application/json")
    try:
        resp = opener.open(req)
        body = json.loads(resp.read())
        return body
    except urllib.error.HTTPError as e:
        err = e.read().decode()[:500]
        print(f"  ERR {e.code}: {err}")
        return None

def api_get(endpoint):
    url = f"{BASE}/wp-json/wp/v2/{endpoint}"
    req = urllib.request.Request(url)
    req.add_header("X-WP-Nonce", NONCE)
    try:
        resp = opener.open(req)
        return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"  GET ERR {e.code}: {e.read().decode()[:300]}")
        return None

# ─── 1. UPDATE HEADER TEMPLATE PART ───
print("\n=== Updating Header ===")
header_content = '''<!-- wp:group {"tagName":"header","style":{"color":{"background":"#0d9488"},"spacing":{"padding":{"top":"0.75rem","bottom":"0.75rem","left":"2rem","right":"2rem"}}},"layout":{"type":"constrained"}} -->
<header class="wp-block-group has-background" style="background-color:#0d9488;padding-top:0.75rem;padding-bottom:0.75rem;padding-left:2rem;padding-right:2rem">
<!-- wp:group {"align":"wide","layout":{"type":"flex","justifyContent":"space-between","flexWrap":"wrap"}} -->
<div class="wp-block-group alignwide">
<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group">
<!-- wp:group {"style":{"color":{"background":"#ffffff"},"border":{"radius":"8px"},"spacing":{"padding":{"top":"0.2rem","bottom":"0.2rem","left":"0.5rem","right":"0.5rem"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group has-background" style="background-color:#ffffff;border-radius:8px;padding:0.2rem 0.5rem">
<!-- wp:paragraph {"style":{"typography":{"fontWeight":"800","fontSize":"0.7rem"},"color":{"text":"#0d9488"}}} -->
<p style="color:#0d9488;font-size:0.7rem;font-weight:800">CC</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
<!-- wp:heading {"level":3,"style":{"typography":{"fontWeight":"700","fontSize":"1.25rem"},"elements":{"link":{"color":{"text":"#ffffff"}}},"color":{"text":"#ffffff"}}} -->
<h3 class="wp-block-heading has-text-color" style="color:#ffffff;font-size:1.25rem;font-weight:700"><a href="/careconnected/">CareConnected</a></h3>
<!-- /wp:heading -->
</div>
<!-- /wp:group -->
<!-- wp:group {"layout":{"type":"flex","flexWrap":"wrap","verticalAlignment":"center"},"style":{"spacing":{"blockGap":"1.75rem"}}} -->
<div class="wp-block-group">
<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.875rem","fontWeight":"500"},"elements":{"link":{"color":{"text":"#ffffff"}}},"color":{"text":"#ffffff"}}} -->
<p style="color:#ffffff;font-size:0.875rem;font-weight:500"><a href="/careconnected/find-care/">Find Care</a></p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.875rem","fontWeight":"500"},"elements":{"link":{"color":{"text":"#ffffff"}}},"color":{"text":"#ffffff"}}} -->
<p style="color:#ffffff;font-size:0.875rem;font-weight:500"><a href="/careconnected/dashboard/">Dashboard</a></p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.875rem","fontWeight":"500"},"elements":{"link":{"color":{"text":"#ffffff"}}},"color":{"text":"#ffffff"}}} -->
<p style="color:#ffffff;font-size:0.875rem;font-weight:500"><a href="/careconnected/care-groups/">Care Groups</a></p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.875rem","fontWeight":"500"},"elements":{"link":{"color":{"text":"#ffffff"}}},"color":{"text":"#ffffff"}}} -->
<p style="color:#ffffff;font-size:0.875rem;font-weight:500"><a href="/careconnected/messages/">Messages</a></p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.875rem","fontWeight":"500"},"elements":{"link":{"color":{"text":"#ffffff"}}},"color":{"text":"#ffffff"}}} -->
<p style="color:#ffffff;font-size:0.875rem;font-weight:500"><a href="/careconnected/care-jobs-board/">Jobs</a></p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"typography":{"fontSize":"0.875rem","fontWeight":"500"},"elements":{"link":{"color":{"text":"#ffffff"}}},"color":{"text":"#ffffff"}}} -->
<p style="color:#ffffff;font-size:0.875rem;font-weight:500"><a href="/careconnected/community/">Community</a></p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
</div>
<!-- /wp:group -->
</header>
<!-- /wp:group -->'''

result = api_post("template-parts/twentytwentyfive//header", {"content": header_content})
if result:
    print(f"  Header updated: {result.get('id')}")
else:
    print("  Trying URL-encoded ID...")
    result = api_post("template-parts/twentytwentyfive%2F%2Fheader", {"content": header_content})
    if result:
        print(f"  Header updated: {result.get('id')}")


# ─── 2. UPDATE FOOTER TEMPLATE PART ───
print("\n=== Updating Footer ===")
footer_content = '''<!-- wp:group {"style":{"color":{"background":"#f8fafc"},"spacing":{"padding":{"top":"3rem","bottom":"3rem","left":"2rem","right":"2rem"}},"border":{"top":{"width":"1px","color":"#e5e7eb"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group has-background" style="background-color:#f8fafc;padding:3rem 2rem;border-top:1px solid #e5e7eb">
<!-- wp:group {"align":"wide","layout":{"type":"flex","justifyContent":"space-between","flexWrap":"wrap","verticalAlignment":"top"}} -->
<div class="wp-block-group alignwide">
<!-- wp:group {"style":{"spacing":{"blockGap":"0.5rem"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"},"style":{"spacing":{"blockGap":"0.5rem"}}} -->
<div class="wp-block-group">
<!-- wp:group {"style":{"color":{"background":"#0d9488"},"border":{"radius":"8px"},"spacing":{"padding":{"top":"0.25rem","bottom":"0.25rem","left":"0.5rem","right":"0.5rem"}}}} -->
<div class="wp-block-group has-background" style="background-color:#0d9488;border-radius:8px;padding:0.25rem 0.5rem">
<!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","fontSize":"0.65rem"},"color":{"text":"#ffffff"}}} -->
<p style="color:#ffffff;font-size:0.65rem;font-weight:700">CC</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
<!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","fontSize":"1rem"},"color":{"text":"#111827"}}} -->
<p style="color:#111827;font-size:1rem;font-weight:700">CareConnected</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
<!-- wp:paragraph {"style":{"color":{"text":"#6b7280"},"typography":{"fontSize":"0.8rem"}}} -->
<p style="color:#6b7280;font-size:0.8rem">Connecting families with quality care.</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
<!-- wp:group {"style":{"spacing":{"blockGap":"0.25rem"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
<!-- wp:paragraph {"style":{"typography":{"fontWeight":"600","fontSize":"0.8rem"},"color":{"text":"#111827"}}} -->
<p style="color:#111827;font-size:0.8rem;font-weight:600">For Families</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"color":{"text":"#6b7280"},"typography":{"fontSize":"0.8rem"}}} -->
<p style="color:#6b7280;font-size:0.8rem"><a href="/careconnected/find-care/">Find Caregivers</a></p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"color":{"text":"#6b7280"},"typography":{"fontSize":"0.8rem"}}} -->
<p style="color:#6b7280;font-size:0.8rem"><a href="/careconnected/care-groups/">Care Groups</a></p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"color":{"text":"#6b7280"},"typography":{"fontSize":"0.8rem"}}} -->
<p style="color:#6b7280;font-size:0.8rem"><a href="/careconnected/my-bookings/">My Bookings</a></p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
<!-- wp:group {"style":{"spacing":{"blockGap":"0.25rem"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
<!-- wp:paragraph {"style":{"typography":{"fontWeight":"600","fontSize":"0.8rem"},"color":{"text":"#111827"}}} -->
<p style="color:#111827;font-size:0.8rem;font-weight:600">For Caregivers</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"color":{"text":"#6b7280"},"typography":{"fontSize":"0.8rem"}}} -->
<p style="color:#6b7280;font-size:0.8rem"><a href="/careconnected/care-jobs-board/">Jobs Board</a></p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"color":{"text":"#6b7280"},"typography":{"fontSize":"0.8rem"}}} -->
<p style="color:#6b7280;font-size:0.8rem"><a href="/careconnected/provider-dashboard/">Provider Dashboard</a></p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
<!-- wp:group {"style":{"spacing":{"blockGap":"0.25rem"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
<!-- wp:paragraph {"style":{"typography":{"fontWeight":"600","fontSize":"0.8rem"},"color":{"text":"#111827"}}} -->
<p style="color:#111827;font-size:0.8rem;font-weight:600">Company</p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"color":{"text":"#6b7280"},"typography":{"fontSize":"0.8rem"}}} -->
<p style="color:#6b7280;font-size:0.8rem"><a href="/careconnected/articles/">Articles</a></p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"style":{"color":{"text":"#6b7280"},"typography":{"fontSize":"0.8rem"}}} -->
<p style="color:#6b7280;font-size:0.8rem"><a href="/careconnected/community/">Community</a></p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
</div>
<!-- /wp:group -->
<!-- wp:separator {"align":"wide","style":{"spacing":{"margin":{"top":"2rem","bottom":"1rem"}}}} -->
<hr class="wp-block-separator alignwide"/>
<!-- /wp:separator -->
<!-- wp:paragraph {"align":"center","style":{"color":{"text":"#9ca3af"},"typography":{"fontSize":"0.75rem"}}} -->
<p class="has-text-align-center" style="color:#9ca3af;font-size:0.75rem">© 2025 CareConnected. All rights reserved.</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->'''

result = api_post("template-parts/twentytwentyfive//footer", {"content": footer_content})
if result:
    print(f"  Footer updated: {result.get('id')}")
else:
    print("  Trying URL-encoded ID...")
    result = api_post("template-parts/twentytwentyfive%2F%2Ffooter", {"content": footer_content})
    if result:
        print(f"  Footer updated: {result.get('id')}")


# ─── 3. ADD ADDITIONAL CSS VIA CUSTOMIZER ───
print("\n=== Adding Additional CSS ===")

additional_css = '''
/* ===== CareConnected Global Styles ===== */

/* Font */
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; color: #111827; }

/* Remove default theme padding */
.wp-site-blocks { padding: 0 !important; }
.wp-site-blocks > * + * { margin-top: 0 !important; }

/* Fix header link styles */
header a { text-decoration: none !important; }
header a:hover { opacity: 0.85; }

/* Footer link styles */
footer a, .wp-block-group a { text-decoration: none; }
footer a:hover { color: #0d9488 !important; }

/* Cover block improvements */
.wp-block-cover { border-radius: 0 !important; }
.wp-block-cover .wp-block-cover__inner-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }

/* Card-like groups */
.wp-block-group[style*="border:1px solid"] { box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: box-shadow 0.2s; }
.wp-block-group[style*="border:1px solid"]:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

/* Button improvements */
.wp-block-button__link { transition: all 0.2s; font-weight: 600 !important; }
.wp-block-button__link:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.wp-block-button.is-style-outline .wp-block-button__link { border-width: 1.5px !important; }
.wp-block-button.is-style-outline .wp-block-button__link:hover { background: rgba(13,148,136,0.05) !important; }

/* Teal primary buttons */
.wp-block-button__link[style*="background-color:#0d9488"]:hover { background-color: #0f766e !important; }

/* Orange/coral accent buttons */
.wp-block-button__link[style*="background-color:#f97316"]:hover { background-color: #ea580c !important; }

/* Content area max-width */
.entry-content > *, .wp-block-group.alignwide { max-width: 1200px; margin-left: auto; margin-right: auto; }

/* Pill buttons for filters */
.wp-block-button.is-style-outline .wp-block-button__link[style*="border-radius:999px"] {
    padding: 0.35rem 0.9rem !important;
    border-color: #d1d5db !important;
    color: #374151 !important;
    font-weight: 500 !important;
}
.wp-block-button.is-style-outline .wp-block-button__link[style*="border-radius:999px"]:hover {
    border-color: #0d9488 !important;
    color: #0d9488 !important;
    background: rgba(13,148,136,0.05) !important;
}

/* Dokan store listing improvements */
.dokan-store-wrap { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
.dokan-store-wrap .dokan-single-store .store-banner-img { border-radius: 12px; overflow: hidden; }
.dokan-store-wrap .dokan-single-store .profile-info-box { border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
#dokan-seller-listing-wrap .dokan-seller-wrap .dokan-single-seller {
    border-radius: 12px !important;
    border: 1px solid #e5e7eb !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    transition: box-shadow 0.2s;
    overflow: hidden;
}
#dokan-seller-listing-wrap .dokan-seller-wrap .dokan-single-seller:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}
.dokan-store-tabs { border-bottom: 2px solid #e5e7eb !important; }
.dokan-store-tabs ul li.active a { border-bottom: 2px solid #0d9488 !important; color: #0d9488 !important; }
.dokan-btn { background: #0d9488 !important; border-color: #0d9488 !important; border-radius: 8px !important; }
.dokan-btn:hover { background: #0f766e !important; }
.dokan-follow-store-btn { border-radius: 8px !important; }

/* WooCommerce improvements */
.woocommerce .button, .woocommerce a.button, .woocommerce input.button {
    background: #0d9488 !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
}
.woocommerce .button:hover, .woocommerce a.button:hover {
    background: #0f766e !important;
}
.woocommerce-message { border-top-color: #0d9488 !important; }

/* Search block styling */
.wp-block-search .wp-block-search__inside-wrapper {
    border-radius: 12px !important;
    border: 1px solid #e5e7eb !important;
    overflow: hidden;
}
.wp-block-search .wp-block-search__button {
    background: #0d9488 !important;
    border: none !important;
    font-weight: 600 !important;
}
.wp-block-search .wp-block-search__button:hover {
    background: #0f766e !important;
}

/* Headings */
h1, h2, h3, h4, h5, h6 { color: #111827; }

/* Spacer fine-tuning */
.wp-block-spacer { margin: 0 !important; }

/* Columns responsive */
@media (max-width: 768px) {
    .wp-block-columns { flex-direction: column !important; }
    .wp-block-column { flex-basis: 100% !important; }
}

/* Query block - article cards */
.wp-block-query .wp-block-group { transition: box-shadow 0.2s; }
.wp-block-query .wp-block-group:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

/* Page title styling */
.wp-block-post-title { display: none; }

/* Breadcrumbs */
.woocommerce-breadcrumb { max-width: 1200px; margin: 1rem auto; padding: 0 1rem; font-size: 0.875rem; color: #6b7280; }

/* Sidebar widget styling */
.widget-area .widget { border-radius: 12px; border: 1px solid #e5e7eb; padding: 1.5rem; margin-bottom: 1.5rem; }
.widget-area .widget-title { font-weight: 700; font-size: 1rem; margin-bottom: 1rem; }
'''

# Use the customizer settings API to add CSS
# First try the settings endpoint
settings_data = {"custom_css": additional_css}

# The Additional CSS in WP is stored as a custom_css post type
# Let's check for existing custom CSS post
existing = api_get("custom-css?per_page=5")
if existing and isinstance(existing, list) and len(existing) > 0:
    css_id = existing[0]["id"]
    print(f"  Found existing CSS post: {css_id}")
    result = api_post(f"custom-css/{css_id}", {"css": additional_css, "status": "publish"})
    if result:
        print(f"  CSS updated: {result.get('id')}")
else:
    print("  No existing CSS post, trying to find it via wp/v2/...")
    # Try direct custom-css creation
    # The custom CSS in block themes might use a different mechanism
    # Let's try the settings endpoint instead
    pass

# For block themes, Additional CSS is stored in global-styles
# Let's try to find the global styles post
print("\n  Trying global styles approach...")
# List all posts of type wp_global_styles
gstyles = api_get("global-styles?per_page=5")
if gstyles:
    print(f"  Global styles: {gstyles}")

# Alternatively, check if we can set CSS through the theme customizer
print("\n  Trying customizer settings...")
import urllib.parse

# Use the customize_save_* approach via admin-ajax
customize_data = urllib.parse.urlencode({
    "action": "customize_save",
    "wp_customize": "on",
    "nonce": NONCE,
    "customize_changeset_uuid": "care-connected-css-update",
    "customize_changeset_status": "publish",
    "customized": json.dumps({"custom_css[twentytwentyfive]": additional_css})
}).encode()

customize_req = urllib.request.Request(
    f"{BASE}/wp-admin/admin-ajax.php",
    data=customize_data,
    method="POST"
)
customize_req.add_header("Content-Type", "application/x-www-form-urlencoded")

try:
    resp = opener.open(customize_req)
    body = resp.read().decode()
    print(f"  Customizer response: {body[:300]}")
except urllib.error.HTTPError as e:
    print(f"  Customizer ERR {e.code}: {e.read().decode()[:300]}")

print("\n=== Done ===")
