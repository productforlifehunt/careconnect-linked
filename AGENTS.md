
<!-- LOVABLE:BEGIN -->
## Shared-repository preservation rules (user requirement, 2026-11-07)

These replace the older TanStack-specific architecture notes below as the user's requested repository-preservation policy. Higher-priority platform restrictions still apply: disclose conflicts, never silently migrate.

- Shared target: `productforlifehunt/careconnect-linked`, branch `draftbit`; never switch branches or overwrite Draftbit's latest changes without authorization, because both editors share business work.
- Preserve the inspected React Router 7 framework mode (`src/app`, existing route config); no unsolicited TanStack migration, `react-router-dom`, or second router, because the repository structure is authoritative evidence of what currently exists.
- Follow existing page organization, server-action interfaces, login/authorization, styles and declared package manager (currently Yarn 4); extend existing patterns, not a parallel implementation, because duplicate systems drift.
- Preserve Draftbit element identification, visual-editor integration and optional plugin-hook existence checks; do not edit platform-generated files, because both previews depend on those safeguards.
- Declare every required dependency so both environments can install it, including repository-local package paths; no Draftbit-temporary-only dependencies, because local availability is not portable installation evidence.
- Verify synchronization with Draftbit's latest saved revision before business-code edits; disclose the exact evidence or inability to verify, because local sandbox Git state is not proof of the configured sync branch.
- Resolve conflicts preserving both sides' business changes; never overwrite a new structure wholesale with an old template, because that can silently delete features.
- After implementation edits, check types, relevant tests and real preview; dependency/router/server-configuration changes also require production-package verification. Use platform-permitted checks and explicitly report any blocked verification, because unperformed checks cannot support a completion claim.
- Never claim Draftbit compatibility without opening and checking Draftbit; report only observed results, because source inspection is not cross-platform runtime verification.
- If platform requirements conflict with this structure or workflow, state the conflict and impact before proceeding; do not silently migrate, remove features or bypass permissions, because preserving work and authorization is mandatory.
- React Router defaults to `dist` without editor-only environment detection; `REACT_ROUTER_BUILD_DIRECTORY=build` explicitly supports Draftbit's output requirement, with SSR preserved and no fabricated directories.
- Shared history navigation is the sole page-back UI; resource module/lesson and inbox conversation selections use existing-route query parameters so browser back/forward restores internal views.
- Favorite hearts read account-scoped REL295 IDs, not hydrated provider lists; explicit save/remove intent writes the relation once and updates membership only after success, preventing profile fan-out and stale heart states.
- Review editing uses the existing server-action dispatcher with fresh WordPress session and saved CCT-author verification; only content/rating may change, because the reviewed provider is not the review's author.

<!-- LOVABLE:END -->

- Interview audio and transcript archives live in the private `interview-audio` bucket; existing Raw archives and separate Edited archives never overwrite each other. Fresh generation never reads either archive; only the WordPress-verified researcher saves archives, with Raw saving limited to a complete run and Edited saving explicit manual corrections.
- Research participant display overrides are private research-file metadata, not account changes or participant/interview relations; both research lists use one explicit-code comparator, and display renames never alter questionnaire roles or answers.
- Participant and interview read-only recruitment sources share RecruitmentSourceDetails, keeping disclosure behavior consistent without changing saved metadata or researcher editing.
- The application is light-only; keep one forced light theme and do not expose theme-switching controls, because the care interface must remain visually stable.
- NotchSafety uses the shared `Index` homepage with site-gated family-location content while retaining its reduced `SafetyShell` route tree, preventing landing-page drift without exposing care-marketplace features.
- All user-visible brand identity must come from the current site and language; ChallengeD/忆畅, CareCNC/护畅, and Notch Safety/诺驰安全 must never cross-leak in pages, dialogs, metadata, AI labels, or notifications.
- Researcher screening uses a presentation-only helper for role-specific item selection and exact original questionnaire provenance; interview role overrides mixed legacy fields, shared secondary instruments cite Sections 2.2.1/2.2.2, and unnumbered items never inherit generated question codes, preventing cross-role display without changing stored answers.
- The app runs on React Router 7 framework mode with flat file routes in `src/app/routes/`, discovered by `src/app/routes.ts`; `src/lib/router-compat.tsx` centralizes string-based navigation. Site-gated sub-apps keep their own path lists via `src/lib/path-routes.tsx`, because one codebase serves several brands chosen at runtime.
- Pages that import browser-only libraries (Leaflet, FullCalendar) are loaded through `src/components/routing/BrowserOnlyPages.tsx`, because those libraries crash server rendering at import time.
- The shared AI message renderer loads the Mermaid engine only when a diagram renders, so diagram dependency initialization cannot blank every sub-app at startup.
- The root route mounts site/auth providers only after the browser mounts, because brand and language come from the browser tab and must not mismatch the server render.
- Standalone sub-apps are lazy-loaded only when their site is selected, so unrelated research, survey and safety pages cannot delay care-homepage initialization.
- Care-app location views and information-card location panels all render `src/components/care/LocationCard.tsx`; information cards use its read-only mode for their REL220-associated person, without management queries or viewer-position fallback, so map rendering cannot drift or show the wrong person. Live/emergency sharing permission is read from CCT 258 via `src/features/location/sharing-flags.ts`.
- Live sharing and emergency answers are written by `LocationSharingAgent` on the shared person's own device while the app is open, because a web app cannot read someone's position remotely.
- All runtime brand icons render through BrandIcon using one shared square silhouette; favicon artwork derives from that renderer, preventing shape and language drift across surfaces.

- Information-card links use the existing card item ID and the shared viewer checks current visibility; sharing only copies/sends the URL, avoiding duplicate token/expiry/revocation state.

- Private task, group, notification and AI-summary reads resolve current-user JetEngine relations before loading CCT rows; legacy service entrypoints delegate to feature sources and account transitions clear read caches so ownership rules and cached identities cannot drift.

- Interview appendix display, editing and TXT/Word export share the timestamp-free formatter, including legacy text, without overwriting stored manual corrections; Word files are built in the browser from that same text so both exports cannot diverge.
- Interview playback uses click-started, authorized binary chunks except a fixed allowlist of consented demos, which use authorized native full preload with custom no-download controls; hidden/disabled visitors receive no new audio, and transcription stays server-only. Freeze demo eligibility by existing recording identity so sorting/title edits cannot extend consent.
- Interview controls unlock only after all five archive reads succeed and commit together; failed reads keep controls locked with a whole-set retry, preventing incomplete loading from suggesting missing archives or triggering costly generation.
- Interview overviews use a public server function that reads only the same publicly readable saved Edited/text archives, never browser-supplied transcript, raw audio or metadata preambles; no archive is modified and generation starts only on explicit expansion.
- The `consent` site (`/?__site=consent`) is a standalone single-page informed-consent micro site (`src/pages/consent/ConsentApp.tsx`) with no app shell, no care features and no brand identity; its ethics approval fields stay unnumbered because the approval letter leaves number and date blank, and the confirmation is a local browser marker only.
- The `sick` site (`/?__site=sick`) is a standalone one-picture sick-leave notice (`src/pages/sick/SickApp.tsx`) with no words, no app shell and no brand; it stays link-only (noindex) and its right-click, drag and long-press save paths are blocked only as a deterrent, because a browser that can display a picture can always have it captured.
- `src/integrations/wp-schema.ts` carries live-GUI-verified corrections that `scripts/build-truth.mjs`/`gen-wp-constants.mjs` do not reproduce; patch it in place and never regenerate it wholesale, because regeneration silently drops verified fields and relation numbers.
- Comments and votes are addressed by dictionary relation number (`R.*`: comments 150/143/229/236 with replies 142; votes 166 post / 167 comment), never by entity-name strings, so a caller cannot route a write to the wrong relation.
- CCT 187 medicine and health check-in create/update paths share `scheduleTimeColumns` for a57/a58/a66, preserve a68/a69 on ordinary time edits, and read recurrence through `src/features/schedules/recurrence.ts`; never read/write a90, because shared dictionary-backed serialization prevents time-storage drift.
- A CCT 161 dose log names the dose it answers in a88 Scheduled date and links to its plan only through REL191, so per-dose status is derived, never written onto the plan.
- Inbox, care navigation and dashboard derive unread totals through useInboxCounts (unread notifications plus unread conversations); read marks are account-scoped device state, and total/read counters are explicitly separated so badges cannot drift or misrepresent message volume.
- Community ownership compares normalized existing WordPress author/session identities; profile loading cannot determine ownership, and no new relationship or account name is created by this comparison.
- Family voices persist in GUI-created CCT322 and cared-one → voice REL323; original audio is private Cloud storage, and every read/mutation/synthesis verifies WordPress identity plus accepted REL219 access (or the cared one themself), because shared caregivers must read the same server record without local ownership drift. Renames never re-enroll; legacy local references are explicitly imported without deleting originals.
- Family voice enrollment, comparison previews and AI calls share an exact-model allowlist and persist each enrollment's model; absent model fields retain the historical default because provider voice IDs cannot cross models.
- Family voice preview dictation reuses the shared complete-WAV recorder and transcription client, populating editable text without automatically synthesizing or enrolling a voice.
- Family voice previews, original playback and AI-call playback explicitly use constant full HTML audio volume without gain ramps or sentence-level replays, preserving the provider's complete returned audio.
- Cared-one tool views remount when the selected person or tool changes, because in-progress recordings and transient playback state must not carry across people.
- Dashboard, person badges, summaries and care-task lists share the dictionary-backed pending-task selector; count links open the first matching person's task tool so totals remain traceable without new relations.
- Zone path editing uses a browser-only Leaflet overlay and sampled curve boundaries in the existing polygon field; no new CCT/REL or hidden control-point storage is introduced, so saved containment checks follow the visible boundary.
- Every care group has one page and one shared link, /care-circle/<id> (NotchSafety shows it under /circle/<id>), built only by `src/features/care-groups/join-link.ts`; members see the group there and non-members see the group onboarding on that same page, while old /group/<id>, ?group=<id> and /join/<token> addresses only forward to it. The join code (CCT199 a58) never goes into a URL, personal invites are pending REL223 rows carrying the role, and join requests are admin notifications only (no row), so pending REL223 rows always mean admin-sent invitations and only accepted rows count as membership.
- The researcher read-write inspector (src/components/inspector, src/features/inspector) only observes: it records requests in wordpress-client (holding back every non-GET there while inspect mode is on) and only observes other fetches (store operations, app server functions by export/action), and its AI explanation server function re-verifies the researcher WP token; code references are re-read from current source on every click (no stored index), because a saved map drifts from the code.
- Inspector notes: CCT324 a55/a56 store the title and body; a57 identifies the app (new ChallengeD notes use `ChallengeD`); a59 `inspectorBindings` stores site/page/element positions while preserving other metadata, and a63/a64 store the note type and tab order. One note can have multiple position bindings; REL325 stores related-note links and note-version links. Researcher-gated.
- Emergency toggle uses shared flags to prevent permission drift.

## Lovable ↔ Draftbit sync compatibility (must keep)

- Keep React Router 7 file routes in `src/app/routes/`, discovered by `flatRoutes()` in `src/app/routes.ts`; do not add a second router or manually edit generated route metadata.
- Keep internal navigation on React Router or the shared `src/lib/router-compat.tsx` shim; use real route paths and preserve existing deep links.
- Keep page UI in normal React components with inspectable DOM elements and stable `data-testid` values where tests or visual tooling depend on them.
- Keep browser data access in feature sources/hooks and server-only credentials in React Router loaders/actions, `src/app/routes/api.*`, or `.server` modules; never expose secrets through `VITE_*` variables.
- Keep environment variable names documented by usage, but never commit `.env` or replace generated Supabase files under `src/integrations/supabase/`.
- Keep `vite.config.ts` compatible with the shared Lovable React Router config: do not duplicate its plugins, hard-code sandbox hosts, or assume optional plugin hooks exist.
- Keep changes runnable in both Lovable and Draftbit previews; prefer additive, framework-native changes and preserve SSR-safe imports for browser-only libraries.
    
    ## Draftbit / Lovable shared-repository compatibility
    - Share productforlifehunt/careconnect-linked with Lovable on draftbit only; never switch branches or overwrite the other editor's saved work. Verify the latest saved revision before editing; preserve both sides' business changes when resolving conflicts. Save/Sync transfer code, not proof of compatibility.
    - Preserve current React Router 7 framework mode, Yarn, SSR/resource routes, aliases, styling major, brand routing and authorization. Never reintroduce TanStack Start, react-router-dom or another router/shell. Keep React Router framework packages on the same exact compatible version.
    - Preserve Draftbit visual editing, explicit element-identification attributes and source tagging. Check plugin hooks exist before invoking them outside Draftbit. Do not hand-edit platform-generated .draftbit files or require sandbox-only local files missing from the saved repository; verify clean-checkout installation.
    - Preserve secrets, server/browser boundaries and existing WordPress service contracts and dictionary-defined CCT/relations. Compatibility work does not authorize database, schema, plugin, permission or business-rule changes.
    - Before reporting ready, run supported project type checks and relevant tests, inspect actual changed preview flows, and verify production client/server output for dependency, routing or server changes. After Draftbit Save, inspect the saved preview and run Recommended Changes/Recheck; list every remaining warning/error. HTTP 200 or a blank screen is not success.
    - Never claim the other editor is compatible without its real install/build/runtime evidence. If a host reports a missing output directory, inspect its actual job logs and supported deployment adapters; never fabricate output, remove SSR or silently migrate frameworks.
    - Edit in one environment at a time. Pause writes during concurrent editing or repository-replacement prompts; preserve the intended latest repository version, never automatically restore old work or force-push. Report tested items, failures and unverified environments separately.
- 严禁画蛇添足，严禁添加没有明确要求的功能，严禁添加没有明确要求的限制性代码和指令，严禁把声明性文字，比如我已100%完成，100%显示真实数据，没有mock这种开发会话写入前端UI，前端UI是对普通用户使用的，不是给开发者交流的，严禁画蛇添足，任何没有100%必要的限制，类型检测，逻辑，fallback等都不要加，只做100%有必要且我明确要求做的
- App测试账号，researcher 密码：superstrongpassword 一切开发务必使用前端页面显示最快的方式，严禁偷懒做成序列读取，务必用前端用户显示最快的速度读写显示数据和元件
    
