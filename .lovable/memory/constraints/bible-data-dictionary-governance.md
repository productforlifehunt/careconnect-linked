---
name: Memory 101 — Data Dictionary is the Bible
description: Absolute governance rules for the ChallengeD/Afresh data dictionary; zero deviation, zero fallback, no backend change without approval
type: constraint
---
## Memory 101 (highest priority, never deviate)

The user's data dictionary (canonical copy: `/mnt/documents/最新数据字典-2026-08.txt`, mirrored into
`docs/wp-truth.json` + `src/integrations/wp-schema.ts` by `scripts/build-truth.mjs` +
`scripts/gen-wp-constants.mjs`) is the **single Bible**. It is the user's only maintenance
reference — a one-character divergence destroys his ability to maintain/upgrade the app.

### Hard rules
1. **Zero deviation.** Every CCT id, field code (aNN), option code (bNN) and relation id comes
   from the Bible only. Never infer meaning from names — slugs are auto-generated and misleading.
2. **Zero fallback / zero mock / zero placeholder / zero fake or "strategic" functions.** If
   something cannot be written or read, find the ROOT CAUSE (backend capability, wrong id, wrong
   logic) and report it. Never invent a workaround, never build engineering around a permission gap.
3. **Relations only.** All links use JetEngine relations. Never a custom UUID/ID/FK column.
4. **No backend change without explicit approval** — including creating, editing, or deleting any
   CCT, field, option or relation. Report reason, wait for a clear yes, then act (GUI / 90-year-old
   browser mode only).
5. **Stop and report** when the dictionary is missing, ambiguous, contradictory, or not executable
   for the business logic. Let the user decide whether to update the Bible. Never decide alone.
6. **Read the whole dictionary end to end** to grasp its intent; use only the parts relevant to
   ChallengeD/Care, and always apply app-scope selectors on shared CCTs (notifications 185,
   chat 121, calendar 187, token 186, community post 149).
7. Failed tests must be root-caused (backend not wired / frontend wrong id / design flaw) — never
   silenced.
8. **Assume it already exists (99% rule).** If a Bible CCT / field / relation returns 404, empty, or
   "not found", it almost certainly EXISTS in WordPress already. NEVER conclude "missing from
   backend", and NEVER create a duplicate. Check, in the GUI, in this order:
   - JetEngine relation edit screen: **Register REST API Endpoint**, **Register separate DB table**,
     and the allow-create / allow-update / allow-delete toggles — these are often OFF.
   - CCT settings: REST API enabled, and read/edit/delete **capability** set so subscribers can
     access it (normalize to `read`).
   - JWT / auth: the request may be unauthenticated or proxied without credentials.
   Only after all toggles are verified ON may you report a genuine gap — and still ask before
   creating anything.
9. **Never create duplicate relations/CCTs.** Duplicates fork the data. If a duplicate was created
   by mistake, delete it in the GUI and repoint code to the Bible ID.

### Workflow when the user sends a new dictionary copy
- Diff against the stored copy, report every delta, replace the stored copy, regenerate
  `wp-truth.json` and `wp-schema.ts`, then run `node scripts/audit-dict-compliance.mjs` and a typecheck.
