# Location structure document and related-note recheck

## Verified inventory

The original document contains all newly introduced structures: CCT327 with six fields, CCT199 a60, and REL328/329/330. No new CCT258 column or separate check-in/battery table is needed.

Read-only /afresh JetEngine GUI inspection confirmed:
- CCT327 actual name `Location bubble`, slug `location_bubble`, table `wp_2_jet_cct_location_bubble`.
- Field labels: Center latitude (a55/text), Center longitude (a56/text), Radius meters (a57/number), Start time (a58/text), End time (a59/text), Status (a60/radio).
- Status display labels: Active, Popped by creator, Burst. Application dictionary uses b55/b56/b57 respectively.
- CCT199 is existing `199. Care Group`; a60 `Members can use bubbles` is radio with Yes/No labels.
- REL328: `One user can have many created location bubbles`, Users → location_bubble, one_to_many.
- REL329: `One care group can have many related location bubbles`, care_group → location_bubble, one_to_many.
- REL330: `Users pause location sharing with care groups`, Users → care_group, many_to_many.
- All three have empty parent relation and no additional meta fields.

Corrected document saved as a versioned Word file, retaining six tables. Both rendered pages were inspected; REL328 was moved entirely onto page two to avoid its header splitting across pages. Original file retained.

## Note checks and writes

- Fresh authorized catalogue: 10,604 records, matching the earlier count.
- All 618 previously updated location notes retain their update section and nonempty bodies.
- All 154 note IDs referenced directly from those notes' a59 metadata exist. Eleven referenced records fall outside the original selection; unaffected form or unrelated course/facility descriptions did not require new location logic.
- Existing REL325 catalogue contains 11 rows, unchanged by this request. This does not establish why its current count differs from older historical reports.
- Expanded location-source/title/body search found ten additional candidates. Seven are navigation-only records requiring no new business description; two notification totals and one group total lacked the new behavior.
- Added location-specific supplements to five existing unlocked notes: #10590 group total, #10589 notification total, #10563 Inbox notification logic, #7546 location requests, #6855 information-card total.
- Supplements distinguish group pause from REL219/card access; snapshot vs notification-only check-in; circle accepted-member recipients vs REL290 zone recipients; owner-device emergency response vs remote tracking; display bubble masking vs raw API confidentiality; device-dependent battery warning vs scheduled background service.
- Immediate full-body readback: 5/5. Independent complete-catalogue readback: 5/5 exact intended bodies.
- All 10,604 a59 values unchanged; untargeted bodies unchanged; locked #10658/#6861/#6859/#6856 bodies unchanged. No REL325 write, schema change, business-data write or app-code change.

## Boundaries

This confirms the new location inventory and saved related-note supplements. It is not an exhaustive audit of every old paragraph or every visible UI association, and does not close prior real-device battery or raw-API privacy verification gaps.

Baseline commit and locally recorded Draftbit ref: 3bdaddcf. Remote Draftbit not fetched or independently confirmed. Project: c85459d8-8acf-4fc5-a8e4-d5448f6ae818.