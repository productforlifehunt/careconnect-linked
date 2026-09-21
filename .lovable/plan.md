# ESM Survey — minimal data model (your format), then build it in WordPress

Design first, then I create it in the JetEngine GUI by hand (90-mode), nothing via MySQL or code.

## Three CCTs (one per questionnaire type), opaque columns

**CCT A — `esm_screening`** (one row per participant per role)
| column | meaning | values |
|---|---|---|
| a01 | app id | `b59` = esm_survey |
| a02 | role | `b01` primary caregiver ｜ `b02` other caregiver |
| a03 | submitted at | datetime |
| a04 | answers | JSON (every item keyed by the question id already in the app) |
| a05 | voice transcripts | JSON (question id → spoken text) |

**CCT B — `esm_hourly_log`** (one row per hourly entry)
| column | meaning | values |
|---|---|---|
| a01 | app id | `b59` |
| a06 | log date | date |
| a07 | hour slot | 8–22 |
| a08 | when it happened | `b03` now ｜ `b04` other time ｜ `b05` not tied to a time |
| a04 | answers | JSON (activity + people + challenges tabs, all items) |
| a05 | voice transcripts | JSON |

**CCT C — `esm_daily_log`** (one row per evening entry)
| column | meaning | values |
|---|---|---|
| a01 | app id | `b59` |
| a06 | log date | date |
| a09 | overall daily burden | −3 … +3 |
| a04 | answers | JSON (3 daily SSCQ items + supplemented hourly notes) |
| a05 | voice transcripts | JSON |

Why JSON for the item answers: the five instruments are 100+ fixed items; one column per item would be
100+ columns to hand-create and would break the moment an instrument is re-verified. The queryable
things (role, date, slot, burden) get their own columns.

## Three relations, your naming format

```
One User can have many related esm screening responses
One User can have many related esm hourly log entries
One User can have many related esm daily log entries
```

All three: parent = Users, child = the CCT, One-to-Many, separate DB table ON,
get REST endpoint ON, update REST endpoint ON, access capability left empty.

## What I do after you approve

1. WordPress admin on `/afresh`, JetEngine → Custom Content Types → create the three CCTs by clicking,
   field by field, REST API on, capability `read`.
2. JetEngine → Relations → create the three relations by clicking, both REST toggles on, verify by
   reopening each screen.
3. Probe each endpoint with the `test1` account, then wire the app: submit writes to the CCT and links
   the row to the user through the relation; local drafts stay as the offline buffer only.
4. Report the real IDs (CCT ids, relation ids) and add the esm_survey row to the sub-app table.
