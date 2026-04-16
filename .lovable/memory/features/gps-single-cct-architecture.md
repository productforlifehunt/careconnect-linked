---
name: Single CCT GPS Architecture
description: Append-only current_location CCT as single source for live + historical GPS data, no Trackserver
type: feature
---
## Architecture: Single CCT "current_location"

**CCT Name**: "The current location of one user"  
**CCT Slug**: `current_location`  
**DB Table**: `wp_jet_cct_current_location`

Every GPS ping creates a NEW row (append-only, never UPDATE):
- **Current location** = latest row: `ORDER BY cct_created DESC LIMIT 1`
- **History/trail** = all rows: `ORDER BY cct_created ASC`
- **No separate location_history or location_sharing table needed**

### CCT Fields
latitude, longitude, accuracy_meters, altitude_meters, heading_degrees, speed, is_moving, moving_type, platform, battery_level, phone_is_charging, address_text, captured_at (Datetime), is_emergency (Radio: No/Yes)

### JetEngine Relation
**Name**: "One user can have many related current location snapshots"  
**Type**: Users → current_location (One-to-many)  
**Relation custom field**: user_type (Radio: "Not someone special", "Cared one")  
**Relation ID**: 117 (REL_USER_CURRENT_LOCATION)

### Read pattern
For efficiency, reads use `cct_author_id` filter on the CCT endpoint directly rather than fetching relation children individually.

### Key files
- `src/features/location/source.wordpress.ts` — write + read (current & history)
- `src/features/location/source.wordpress-extended.ts` — safe zones, alerts, requests

### Trackserver REMOVED
No Trackserver plugin, no OsmAnd protocol, no cc-trackserver-rest plugin. Deleted files:
- `src/features/location/source.trackserver.ts`
- `wp-plugins/cc-trackserver-rest/`

### Safe Zone CCT
**Name**: "Safe Zone" | **Slug**: `safe_zone`  
**Fields**: zone_type (Radio: Safe/Danger), shape_type (Radio: Radius/Polygon), custom_name, custom_description, custom_color (Colorpicker), latitude, longitude, radius_meters (Number, default 100), polygon_points (Textarea), notify_on_enter (Radio: Off/On), notify_on_exit (Radio: Off/On), schedule_enabled (Radio: Off/On), schedule_start_time (Datetime), schedule_end_time (Datetime), is_active (Radio: No/Yes)  
**Relation**: "One user can have many related safe zones" (Users → safe_zone, one-to-many, ID: 118)
