---
name: Trackserver GPS Integration
description: Trackserver as single GPS source — OsmAnd write + custom REST read (cc/v1/location/*)
type: feature
---
The GPS tracking system uses Trackserver as the **single source of truth** for all GPS data:

**Write (OsmAnd protocol)**: `GET /trackserver/?lat=X&lon=Y&timestamp=Z` with Basic Auth (Application Password). Writes to `wp_ts_locations` table.

**Read (custom REST plugin)**: `cc-trackserver-rest` plugin exposes two JWT-compatible endpoints:
- `GET /wp-json/cc/v1/location/live/{user_id}` — latest GPS point
- `GET /wp-json/cc/v1/location/history/{user_id}?limit=N&since=ISO` — breadcrumb trail

**No dual-write needed**. Old CCT-based location_sharing/location_history tables are deprecated for GPS data. Trackserver tables (`wp_ts_tracks`, `wp_ts_locations`) handle both live and historical positions.

**Zone breach detection**: Still runs client-side via `safe_zone` CCT + `checkBreaches()`. Alerts written to `cc_notification` CCT.

**Key files**:
- `wp-plugins/cc-trackserver-rest/cc-trackserver-rest.php` — REST read endpoints
- `src/features/location/source.trackserver.ts` — Unified write + read client
- `src/features/location/source.wordpress-extended.ts` — Safe zones, alerts, requests (still CCT)
- `src/pages/GPSTracking.tsx` — Map/Alerts/Zones tabs, 15s polling

**Plugin must be installed**: Upload `cc-trackserver-rest` to WordPress plugins and activate.
