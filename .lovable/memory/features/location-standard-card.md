---
name: Location standard card spec
description: User's spec for /find, cared-one location and group location tab; CCT258 a55/a56 sharing flags; five tabs; CCT213/214 columns
type: feature
---
- /find has three tabs: 我 / 我的亲友 (button tabs of my REL 219 cared ones) / 我的群组 (group cared ones = REL 223 members with a57=b56).
- /cared-ones/:personId/location shows that cared one's card; button tabs on top switch between my REL 219 cared ones.
- /care-circle location tab: button tabs of the group's cared ones.
- Standard card: map first (fallback: viewer's own position), five tabs below: 实时位置, 共享请求, 提醒, 安全区域, 历史记录.
- CCT 258 a56 b55 = live sharing on; a55 b55 = emergency requests allowed.
- Ordinary request → cared one allows → a56 set to b55 and sharing starts.
- Emergency request (only if a55=b55) → no confirmation; snapshot written with CCT 213 a68=b55 when a56 is off.
- Caregiver can turn on "紧急请求许可" (a55=b55) for the cared one; a push notification goes to the cared one.
- Tab 1 details: a66 address, a63 device, a67 last update, a64 battery, a65 charging, a68=b55 → emergency mode.
- Tab 4 lists zones: name, type, enter/exit switches; CCT 214 a55..a69 as in safe-zone memory.
