---
name: Trackserver GPS Integration
description: Hybrid Trackserver (OsmAnd ingestion) + JetEngine CCT (retrieval) architecture for live GPS tracking
type: feature
---
The GPS tracking system uses a hybrid architecture:

**Ingestion (sender)**: Capacitor background-geolocation plugin → Trackserver OsmAnd protocol (GET with Basic Auth). Dual-write to both Trackserver (`wp_ts_locations`) and `location_sharing` CCT via `dualWriteLocation()`.

**Retrieval (viewer)**: JetEngine CCT REST API (`location_sharing` for current position, `location_history` for breadcrumb trails). Trackserver's `gettrack` requires WordPress nonces (incompatible with headless), so retrieval stays on CCTs.

**Polling**: 15-second auto-refresh for both sender (sharing my location) and viewer (fetching others' locations). Uses `refetchInterval` on react-query.

**Geofencing**: `safe_zone` CCT supports both radius and polygon shapes. Breach detection runs client-side via `checkBreaches()` with 5-minute dedup window. Alerts written to `cc_notification` CCT.

**Key files**:
- `src/features/location/source.trackserver.ts` — OsmAnd ingestion client
- `src/features/location/source.wordpress-extended.ts` — CCT CRUD + breach detection
- `src/pages/GPSTracking.tsx` — Map/Alerts/Zones tabs, 15s polling, trail polylines

**Trackserver endpoint**: `https://app.challenged-dementia.com/careconnected/trackserver/?lat=X&lon=Y&timestamp=Z&speed=S` with Basic Auth
