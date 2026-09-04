---
name: Single CCT GPS Architecture (dictionary-exact)
description: CCT 213 current_location append-only snapshots + CCT 214 safe_zone, relations 247/248/290; no history table, no Trackserver
type: feature
---
Shared by afresh/notch and any future GPS app. Nothing extra needs adding to afresh/notch today.

## CCT 213 "The current location of one user" (slug `current_location`)
Append-only: every pull writes a NEW row. Current = latest row; history = all rows.
No separate location_history or management table.

a55 Latitude (Text) · a56 Longitude (Text) · a57 Accuracy meters (horizontalAccuracy) ·
a58 Altitude meters · a59 Heading degrees (course) · a60 Speed ·
**a61 "Is moving" is RETIRED — never write or read it; stillness = a62 == stationary** ·
a62 Moving type (Radio, CMMotionActivity): b55 stationary, b56 walking, b57 running, b58 cycling, b59 automotive, b60 unknown ·
a63 Platform (Radio): b55 iOS, b56 Android, b57 Web ·
a64 Battery level (0–100) · a65 Phone is charging (Radio: b55 Yes, b56 No) ·
a66 Address text · a67 Captured at (Datetime) ·
a68 Emergency-without-permission (Radio: b55 Yes, b56 No) — every snapshot taken in
emergency mode is written Yes so the cared one can later see that window.

## Relation 247 "One user can have many related current location snapshots"
Users → CCT 213, one-to-many. Relation field **a55 User type**: b55 "Not someone special",
b56 "Cared one" (use b56 only when the subject is a cared one). The snapshot must be
attached to the person being recorded — cared one, or any user sharing with others.

## CCT 214 "Safe Zone" (safe & danger & custom zones)
a55 Zone type (b55 Safe, b56 Danger, b57 Custom) · a56 Shape type (b55 Radius, b56 Polygon) ·
a57 Zone name ("Safe"/"Danger", or the user's own name for Custom) · a58 Zone description ·
a59 Custom color (Colorpicker; defaults green/red/blue, picker must always offer those three) ·
a60 Latitude · a61 Longitude · a62 Radius meters (default 100) — radius zones only ·
a63 Polygon points (Textarea, JSON) · a64 Notify on enter (b55 Off, b56 On) ·
a65 Notify on exit (b55 Off, b56 On) · a66 Schedule enabled (b55 Off, b56 On) ·
a67 Schedule start time (Textarea, RFC 5545) · a68 Schedule end time (Textarea, RFC 5545) ·
a69 Is active (b55 Yes, b56 No). Creator = CCT author.

Relation **248** "One user can have many related safe zones" — Users → CCT 214, one-to-many.

## Relation 290 location notification receivers
"One cared one's location notification can have many added related receivers" — Users → Users,
one-to-many. Receiver picker offers the cared one's caregivers, care groups and private
subgroups, plus search/add by email; groups expand to all members. Push targets are the
receivers linked to the cared one, **not** per-zone.

### Key files
- `src/features/location/source.wordpress.ts` — snapshot write + read
- `src/features/location/source.wordpress-extended.ts` — zones, alerts, receivers

### Trackserver REMOVED — no plugin, no OsmAnd protocol.
