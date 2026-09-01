---
name: Safe Zone model (CCT 214) — 2026-09-01 dictionary
description: Zone type a55 has exactly 3 options (b55 Safe, b56 Danger, b57 Custom); the zone's name lives in a57 on the zone row itself
type: feature
---

CCT 214 `safe_zone`:
- a55 Zone type = Radio, **3 options only**: b55 Safe, b56 Danger, b57 Custom.
- a57 Zone name = Text. "Safe"/"Danger" for the fixed types; the user's own name for a Custom zone (unlimited custom zone types, one name per zone).
- a58 Custom description = note only, never a name.
- a59 Custom color.

There are **no** custom-zone-name slots on any profile CCT. The old model
(9 type codes b55..b63 + CCT 258 a95..a101 name slots) is dead — never restore it.

App settings (notifications push/email/sms, display, permission nudges) are ONE JSON blob on
CCT 151: a95 = ChallengeD, a96 = CareCNC. CCT 258 has no a91/a92/a93 notification radios.

CCT 213 `current_location` has no "is moving" column; movement is a62 Moving type only.
