# Zero-Fallback Data-Model Alignment

## Goal
Make every frontend operation named in the supplied data model use the exact JetEngine CCT, opaque field IDs/options, relation IDs/directions, and relation metadata. Remove every fallback, mock, placeholder, inferred join, silent failure, and local-only substitute in scope.

## Work
1. **Freeze and validate the schema contract**
   - Compare CCT 197–218 and 258 plus Relations 219–260 against the supplied dictionary and the generated constants.
   - Correct generator source/schema constants where the dictionary and current generated output differ; never hand-edit generated files.
   - Verify the `/afresh` WordPress configuration visually. If a CCT, field, option, or relation differs, correct it only through the WordPress/JetEngine GUI on that subsite.

2. **Replace permissive data access with exact, failing access**
   - Remove catch-and-empty/null, placeholder names, guessed defaults, legacy-code conversion, author-ID joins, public/profile fallbacks, local/session storage substitutes, and swallowed relation writes from all affected sources.
   - Centralize strict CCT and relation reads/writes: invalid IDs, malformed rows, missing linked records, unavailable endpoints, or incomplete relation writes throw explicit errors and surface in the UI.
   - Keep only legitimate empty states proven by a successful backend response containing zero records.

3. **Align all domain flows**
   - Relation 219 cared ones; CCT 198 cards and Relations 220–221.
   - Provider search from CCT 258 where `a59=b55` and `a60=b55`.
   - CCT 199–203 and Relations 222–230: groups, invites, member/subgroup metadata, visibility, posts/replies, display names, gallery.
   - CCT 204 and Relations 231–236: task fields, cared ones, assignees/status, groups, visibility, comments.
   - CCT 205–212 and Relations 237–246: medicine, check-ins/receivers, notes, tips, plans, contacts, documents.
   - CCT 213–214 and Relations 247–248 plus the exact configured location-notification receiver relation: append-only location snapshots and safe/danger zones. No author query as a relation substitute and no local alert persistence.
   - CCT 215–218 and Relations 249–257: facilities, jobs, content, completion, and study notes.

4. **Frontend completeness**
   - Trace every hook/page/dialog using these sources and ensure create, read, update, delete, assignment, visibility, invite, sharing, status, notification, and comment actions are available in the headless frontend.
   - Replace fake success with explicit success only after both CCT and required relation writes succeed; surface actionable errors otherwise.

5. **Verification**
   - Run targeted checks and inspect build/runtime/network diagnostics.
   - Use browser automation with only the mandated `test1` account to test each available operation on both relevant sides; never open or send users to WordPress pages.
   - Record every CCT/relation/operation as pass, fail, or blocked. Do not report 100% until all listed items pass with evidence.

## Technical constraints
- WordPress/JetEngine remains the only database; Lovable Cloud functions may proxy privileged API access but store no domain data.
- All object relationships use JetEngine Relations—no custom FK, raw-ID join, or inferred ownership.
- All WordPress configuration changes use the `/afresh` GUI only; no SQL, REST writes, code snippets, or relation MCP operations.
- WooCommerce/Dokan remain outside these care-data flows except the established cart/payment boundary.
- No fallback means errors are explicit; it does not mean fabricating a value when the backend is wrong.
