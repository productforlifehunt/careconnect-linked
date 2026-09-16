---
name: Relation 219 cared-one consent field
description: Relation 219 (Users→Users, cared ones) carries a58 invitation status b55 accepted / b56 pending / b57 declined; adding writes pending
type: feature
---

Relation 219 "One user can have many related cared ones" — Users → Users, Many to Many.
Parent = caregiver, child = cared one.

Custom field (only one on this relation):
- `a58` cared one invitation status — Radio: `b55` accepted, `b56` pending, `b57` declined.

Rules in code (`src/features/cared-ones/rel219-meta.ts`):
- A caregiver adding somebody writes `pending`. Nothing is shared until the cared one accepts.
- The cared one accepts/declines in Settings → "Who cares for me"
  (`respondToCaregiverRequestWordPress`), which updates a58 on the same row — never a second row.
- `declined` rows are hidden from both sides; rows with no value stored are legacy links and read as `accepted`.
- The earlier `a55: b56` ("User type") write was wrong and has been removed.
