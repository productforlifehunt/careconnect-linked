# WordPress Directory Plugin Comparison for Care Home Directory

## Tested Plugins (All Active on http://170.106.171.59:8080)

| # | Plugin | Version | Post Type |
|---|--------|---------|-----------|
| 1 | **GeoDirectory** | Free | `gd_place` |
| 2 | **Classified Listing** | Free (AI-Powered) | `rtcl_listing` |
| 3 | **Directorist** | Free | `at_biz_dir` |
| 4 | **Business Directory Plugin** | Lite | `wpbdp_listing` |

---

## 1. Data Model Efficiency & Clarity

### GeoDirectory
- **Post type:** `gd_place` (called "Places")
- **Native fields:** Category (required), Address (required), Country, Region, City, Zip, Lat/Lng (required), Map View selector, Place Tags, Place Attachments (unlimited images), Excerpt, Custom Fields (native meta key/value), Place Owner
- **Taxonomy:** `gd_placecategory`, `gd_place_tags`
- **Dummy data installer:** Built-in with templates (Default, Property, Classifieds, Job Board)
- **Verdict:** ⭐⭐⭐⭐ — **Geography-first data model.** Every listing MUST have coordinates. Very clean for location-based directories. The required lat/lng means every care home will be map-ready. Custom fields are basic (key/value meta), not a visual builder.

### Classified Listing
- **Post type:** `rtcl_listing`
- **Native fields:** Listing Type (Sell/Buy/Exchange/Job/To-Let), Category (required), Location (required), Price/Price Range/Negotiable/On Call, Condition (New/Used), Features (checkbox list), Gallery Images, Video URL, Address, Zip, Phone (required), Email, Website, Map (Leaflet), Business Hours, Social Profiles, Author
- **Taxonomy:** `rtcl_category`, `rtcl_location`, `rtcl_tag`
- **Form Builder:** Native visual form builder (React-based) — can create multiple forms with different field layouts per listing type
- **Ajax Filter Builder:** Native — create custom search/filter interfaces without code
- **Verdict:** ⭐⭐⭐⭐⭐ — **Most feature-rich free data model.** The form builder alone sets it apart — you can create a "Care Home" specific form with custom fields, without any ACF or code. Business hours, social profiles, pricing types, and condition fields are all native. The Listing Type system (Sell/Buy/Exchange/Job/To-Let) can be repurposed but is classified-ad oriented.

### Directorist
- **Post type:** `at_biz_dir`
- **Native fields:** Categories, Locations, Tags, Price/Price Range, Features, Contact Info (Email, Phone, Website), Address + Map (OpenStreetMap with coordinates), Preview Image, Gallery Images, Video URL, Author, Reviews, Expiration Date
- **Taxonomy:** `at_biz_dir-category`, `at_biz_dir-location`, `at_biz_dir-tags`
- **Directory Builder:** Visual drag-and-drop builder for: Add Listing Form, Single Page Layout, All Listing Layout, Search Form — all configurable without code
- **Multi-Directory support:** Can create completely separate directory types with different fields/layouts (free feature toggle in settings)
- **Verdict:** ⭐⭐⭐⭐⭐ — **Best directory-specific data model.** The Directory Builder is the strongest native feature — you can visually design the listing form, single page, archive layout, AND search form all from one interface. Multi-Directory means you could have "Care Homes" and "Pharmacies" as separate directory types with different fields. This is exactly what a care home directory needs.

### Business Directory Plugin
- **Post type:** `wpbdp_listing`
- **Native fields:** Website, Phone, Email (required), Address, ZIP Code, Listing Owner (dropdown of WP users), Directory Categories, Directory Tags, Plan (Free Listing), Expiry, Featured, Recurring, # of Images limit, Renewal URL/Email
- **Taxonomy:** `wpbdp_category`, `wpbdp_tag`
- **Editor:** Gutenberg block editor (can be slow)
- **Verdict:** ⭐⭐⭐ — **Simplest, cleanest data model** but also the most limited in free version. The Listing Owner dropdown is the most explicit owner assignment. Plan/Expiry/Recurring is a clear monetization model. But no visual form builder, no map integration in free, no business hours, no social profiles.

---

## 2. Ease of Getting Care Home Data (Import, Google Maps, Scraping, AI)

### GeoDirectory
- **Import/Export tab:** Present in settings (General > Import/Export) but content didn't render in free version
- **Dummy Data Installer:** Built-in with multiple templates — can auto-populate sample data with 1-30 items
- **Google Maps API:** Native integration field in settings (API key input + verify button)
- **Directory Converter addon:** Free addon to import from other directory plugins
- **AI/Scraping:** None native
- **Verdict:** ⭐⭐⭐⭐ — Google Maps API key is a first-class setting. Dummy data installer is unique. But CSV import may require premium.

### Classified Listing
- **Export/Import page:** Native dedicated page at Classified Listing > Export / Import
  - **Export Categories, Location & Settings** as JSON
  - **Export Listings** as CSV
  - **Import** supported
- **AI-Powered:** Plugin name includes "AI-Powered" — has AI features in premium
- **Scraping:** No native scraping
- **Verdict:** ⭐⭐⭐⭐⭐ — **Best native import/export.** CSV export of listings + JSON export of categories/locations means you can bulk-prepare care home data in a spreadsheet (e.g., scraped from Google Maps or CQC) and import directly. The dual export format is very practical.

### Directorist
- **Import and Export:** Listed in Settings menu (Settings > Import and Export)
- **Directory Builder Export:** Can export the entire form/layout/settings config as a file
- **Data migration:** Form Builder has a "Data migration" tab
- **Verdict:** ⭐⭐⭐⭐ — Has import/export in settings. The config export from Directory Builder is useful for replicating setups. Less focused on bulk CSV import than Classified Listing.

### Business Directory Plugin
- **Import/Export:** Not visible in free version
- **Verdict:** ⭐⭐ — No native import/export in free version. Would need premium or manual entry.

### None of the 4 plugins have native Google Maps scraping, web scraping, or AI search for acquiring care home data.

The practical workflow for all of them would be:
1. Scrape data externally (Google Maps API, CQC website, etc.)
2. Format into CSV
3. Import via the plugin's import feature (Classified Listing is best for this)

---

## 3. Product Linking & Owner/Claim Management

### GeoDirectory
- **Place Owner:** Native dropdown to assign any WP user as owner
- **Claim Listings:** Available as premium addon ($49) — not in free
- **Product linking:** No native WooCommerce product linking
- **Reported Posts:** Native in settings
- **Verdict:** ⭐⭐⭐ — Owner assignment is native and clear. Claim requires paid addon.

### Classified Listing
- **Author:** Standard WordPress author field
- **Claim:** Not visible in free version (no "claim" keyword found on listing pages)
- **Product Information:** Native "Product Information" section with Pricing Type, Price Type (Fixed/Negotiable/On Call), Condition — this is the closest to linking products/services
- **Abuse Report:** Native moderation stats (Notification by Moderator, Visitor, Abuse Report counts)
- **Verdict:** ⭐⭐⭐ — Good for classified marketplace where the listing IS the product. No separate product linking or claim feature in free.

### Directorist
- **Author:** Standard WordPress author assignment
- **Claim:** Available via premium extension (listed under Themes & Extensions)
- **Monetization:** Native settings section for monetization
- **Reviews:** Native review system (visible on listing edit page)
- **Multi-Directory:** Can conceptually separate "Care Home listings" from "Product listings" as different directory types
- **Verdict:** ⭐⭐⭐⭐ — Reviews are native and important for care homes. Multi-Directory could theoretically link care homes to product directories. Claim is premium. Monetization settings show revenue intent.

### Business Directory Plugin
- **Listing Owner:** Most explicit — dedicated dropdown showing all WP users with email
- **Plan system:** Native Free Listing plan with Amount, Expiry, Featured, Recurring, # of Images
- **Renewal URL & Email:** Native tools to send renewal notices
- **Stripe Connect:** Free payment gateway with 3% fee
- **Verdict:** ⭐⭐⭐⭐ — **Best native owner/payment model.** The owner concept is the clearest. Plan + Renewal + Stripe Connect means you can monetize listings immediately. But no claim workflow — owner must be manually assigned.

---

## 4. Overall Suitability for Care Home Directory

### Scoring Matrix (1-5, based on actual hands-on testing)

| Criteria | GeoDirectory | Classified Listing | Directorist | BDP |
|----------|:---:|:---:|:---:|:---:|
| Data model clarity | 4 | 4 | 5 | 3 |
| Care home field coverage | 3 | 4 | 5 | 2 |
| Map integration (free) | 5 | 3 | 4 | 1 |
| Form/field customization | 2 | 5 | 5 | 2 |
| Import/Export | 3 | 5 | 4 | 1 |
| Owner assignment | 4 | 3 | 3 | 5 |
| Claim management | 2* | 1 | 2* | 2 |
| Reviews/Ratings | 3 | 2 | 5 | 2 |
| Monetization | 2 | 3 | 4 | 5 |
| Search/Filter | 3 | 5 | 4 | 2 |
| Multi-directory types | 2* | 3 | 5 | 1 |
| Business hours | 1 | 5 | 1 | 1 |
| Social profiles | 1 | 5 | 1 | 1 |
| **TOTAL** | **35** | **48** | **48** | **28** |

*\* = available as paid addon*

---

## 🏆 Final Recommendation

### Tie: **Classified Listing** and **Directorist** (48 points each)

But they excel in different areas:

### Choose **Directorist** if:
- You want the **most "directory-like" experience** for care homes
- You need **Multi-Directory** (separate Care Homes, Pharmacies, etc. with different fields)
- **Visual Directory Builder** (drag-and-drop form, page layout, search form) is important
- **Native reviews** are critical (care homes need ratings)
- You plan to scale to multiple directory types later

### Choose **Classified Listing** if:
- You need the **best import/export** for bulk data loading (scrape → CSV → import)
- You want **Form Builder** with React-based visual editor for custom field types
- **Ajax Filter Builder** for advanced search without code is important
- **Business hours** and **social profiles** are native and needed
- The listing-as-marketplace model fits (listings have prices, conditions, negotiability)

### Choose **GeoDirectory** if:
- **Geography is #1 priority** — every listing must have coordinates, map is central
- You want **Google Maps API** as a first-class citizen
- **Dummy data installer** saves setup time
- You're okay with premium addons for claim & advanced search

### Avoid **Business Directory Plugin (Lite)** for this use case because:
- Most limited free feature set
- No map in free version
- No form builder
- No import/export in free
- Gutenberg editor is slow and automation-unfriendly
- Best for simple business directories, not complex care home directories

---

## What I Actually Created During Testing

| Plugin | Listing Title | Post ID | Status |
|--------|--------------|---------|--------|
| GeoDirectory | Sunrise Care Home - GeoDirectory Demo | #78 | Published |
| Classified Listing | Oakwood Care Home - Classified Listing Demo | Draft | Draft (React selects blocked type/category) |
| Directorist | Maple House Care Home - Directorist Demo | #80 | Published |
| BDP | (Gutenberg timeout prevented creation) | - | - |

## Categories Created
- **Classified Listing:** "Care Homes" category + "London" location
- **Directorist:** "Care Homes" category + "London" location
- **GeoDirectory:** Used existing "Uncategorized" (category creation requires separate page)
- **BDP:** Not tested (no visual category page found in free)

---

## Key Takeaway

For a **care home directory system**, the practical winner depends on your #1 priority:

| Priority | Winner |
|----------|--------|
| Best overall directory CMS | **Directorist** |
| Best for bulk data import/export | **Classified Listing** |
| Best map-first experience | **GeoDirectory** |
| Simplest owner/monetization | **Business Directory Plugin** |
| Best native reviews | **Directorist** |
| Best form customization (no code) | **Classified Listing** = **Directorist** |
| Best multi-directory support | **Directorist** |

**My recommendation: Start with Directorist** for the care home directory. It has the most balanced feature set, the strongest visual builder, multi-directory support for future expansion, and native reviews — all critical for a care home directory where families need to compare and rate facilities.
