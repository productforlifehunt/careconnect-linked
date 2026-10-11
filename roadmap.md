## Screening question provenance labels

## Current request: re-recording guide and flat app logos
- [x] Deliver all 22 interview questions with natural follow-ups about changes, new experiences, and corrections since the first interview.
- [x] Standardize app logos in both languages to one Apple-style square silhouette without gradients, retaining each brand's identity.
- [x] Verify six brand/language login surfaces and matching favicon assets; shared renderer has square dimensions and no gradient nodes. Protected pages have not been individually visually audited.

- [x] Separate researcher primary/secondary viewing and editing using original Sections 1 and 2, preserve shared ADKS/DAS, and verify role boundaries with mixed legacy records. Rendered-component tests verify both viewing and editing; 190/190 tests pass, build OK. Primary ends at DAS20; secondary uses 2.1 then all 50 shared items with 2.2 provenance. Stored answers untouched.
- [x] Add Chinese translations and original questionnaire/item references to all 146 researcher screening fields, including editing mode.
- [x] Verify source mapping against the supplied questionnaire; explicitly retain unnumbered ADL/IADL, single-item 1.6, shared 2.1.2 and Other follow-up references. Real researcher login confirmed Age, ADL, ADKS30, DAS20 and editing labels; build OK.
- [x] Correct secondary-caregiver provenance to the uploaded numbering exactly: Education Level is unnumbered in Section 2.1; personal items retain 2.1.1–2.1.8; shared scales cite only Sections 2.2.1/2.2.2 and their listed item positions.

## Knowledge-topic archive documentation

- [x] Replace the outdated five-topic rows with the verified frontend article, CCT217 anchor, CCT218 note, REL255/256, and link-snapshot facts.

## Locale-specific brand audit

- [ ] Align the three brand names and marks across every applicable page, popup, share surface, notification identity, and browser metadata in English and Chinese.
- [ ] Use the requested homepage image for every ChallengeD, CareCNC, and NotchSafety language variant; verify all six variants visually.
- [x] Explain how family voice references and provider-specific cloned voice IDs are stored without claiming a portable voiceprint.

# UI/UX verification roadmap

## NotchSafety shared homepage and knowledge-topic audit

- [x] Route NotchSafety `/` through the same shared homepage file as ChallengeD and CareCNC.
- [x] Keep NotchSafety family-location-only by disabling caregiver marketplace, facilities, and community content.
- [x] Verify all three homepage variants in English/Chinese and desktop/mobile widths.
- [x] Audit all five ChallengeD topic collections, title anchors, and study-note persistence against the current implementation.

## Shared page header correction

- [x] Correct only the shared page header: logo scale, navigation spacing, control sizing, and one aligned inner grid.
- [x] Remove the night-mode control and force the application to use the light appearance.
- [x] Verify the corrected header at desktop and mobile widths without changing homepage content or footer.

## Interview-authoritative participant survey correction

- [x] Audit every supplied interview transcript line by line; treat interview answers as authoritative and exclude conflicting preamble details.
- [x] Match each interviewee to the correct existing participant and screening row without deleting, recreating, or renumbering any CCT/Relation.
- [x] Update the supported questionnaire fields through the WordPress/JetEngine interface only; blank unsupported or unasked answers through the interface.
- [x] Second batch (梁静, 钱建华, 陈志明, 林小梅; re-sent 孙志强/孙思敏/王慧兰/赵桂兰/王海涛 identical) corrected and re-read in WordPress.
- [x] Verify every corrected participant and every changed answer in the researcher dashboard against the interview transcript (15/15 read).
- [x] User clarified role-specific questionnaire display: primary records hide secondary-member fields in viewing and editing; existing stored answers remain untouched.

## ChallengeD Logo consistency

- [x] Increase the upper C–D spacing while preserving the continuous flat lower connection.
- [x] Replace stale footer and onboarding Logo implementations with the shared Logo.
- [x] Regenerate both ChallengeD favicon files and verify all branded surfaces on desktop and mobile.

- [x] Eliminate brand/logo and homepage configuration flicker across reload, language, and site variants.
- [x] Verify public routes for both ChallengeD/忆畅 and CareCNC/护畅 at desktop and mobile widths.
- [ ] Verify protected routes with the approved test account at desktop and mobile widths.
- [ ] Fix every reproducible UI/UX display or business-label mismatch found.
- [ ] Re-run route matrix and confirm build/runtime/console/network health.

# Unified AI and role correction

- [x] Remove the separate cared-one dashboard and all invented AI tips/exercise/summary/insight surfaces.
- [x] Use one shared floating AI dialog for ordinary chat, group help, information cards, check-ins, and medicine reminders.
- [x] Automatically open the shared dialog when a due check-in or medicine reminder is shown to the cared one.
- [x] Replace the invented “Care Seeker” label with the real A58 cared-one/caring-one choice and make it editable in Profile settings.
- [ ] Update the current app/page/interaction inventory with the verified implementation only.
- [ ] Verify the changed flows in the running app and check current errors.
- [ ] Expand every retained English journal paper/project into a self-contained factual methods dossier (purpose, sample, procedure, measures, analysis, results, limitations), while preserving source links.

# Scoping review protocol editorial revision

- [x] Replace the over-written editorial audit with a conservative, local-only revision that preserves the author's wording and changes only genuine language or logic problems.

# ESM survey participant flow

- [x] Add Me with Profile & settings and Screening questions tabs.
- [x] Add the 24-hour Today timeline with current-hour emphasis and multiple-entry counts.
- [x] Merge hourly and daily entry choices under Log entry.
- [x] Split My entries into hourly events and daily summaries.
- [x] Add study Help and AI assistant entry.
- [x] Verify Primary and Secondary flows, persistence, responsive layouts, and runtime health.

# ESM screening completeness and English logo

- [ ] Verify and expose every primary screening section from 1.1 through 1.7.
- [ ] Verify and expose every secondary screening field plus shared ADKS and DAS.
- [ ] Implement the exact device-only reminder schedule and multiple do-not-disturb periods.
- [ ] Replace only the English ChallengeD icon with a flat purple block CD logo.
- [ ] Verify English/Chinese desktop/mobile flows, persistence, submissions, and logo variants.

# ESM participant continuation

- [ ] Replace the English CD artwork with one continuous flat baseline and verify it at header and favicon sizes.
- [ ] Add Li Shufen from the supplied screenshots through the WordPress/JetEngine GUI only, including profile, caregiving details, and all 16 interview answers.
- [ ] Redistribute every participant's hourly entries to varied 0–4-entry days without deleting records or changing any CCT/REL number.
- [ ] Verify Li Shufen appears in the researcher dashboard and audit every participant's daily hourly counts and timeline consistency.

# WHO iSupport course fidelity audit

- [ ] Verify all 23 lessons individually against the official 2019 WHO iSupport manual.
- [ ] Restore every missing WHO lesson element and correct every altered fact, example, activity, answer, and feedback item.
- [ ] Remove content that cannot be traced to the WHO lesson; keep only optional readability edits or clearly faithful expansion.
- [ ] Verify all 23 lessons in English and Chinese in the running Resources page, including every quiz interaction.
- [ ] Produce a 23-lesson evidence matrix with source ranges, corrections, and final pass/fail results.

# Interview recordings

- [x] Researcher Interviews tab: upload long recordings (≤500 MB), Generate button re-transcribes A/B sentence by sentence in Chinese + English.
- [x] Hide all recording and sentence times, remove the native download menu, and rename the Generate action and explanatory text.
- [x] Let only the researcher overwrite a completed transcript archive; let every viewer read that archive in a separate view.
- [x] Fix interrupted requests with buffered responses and bounded retries; verified 21/21 sections, 114 fresh and archived lines as researcher and guest.
- [ ] Participants viewing their own interviews — waiting on user: recordings are not linked to participants yet ("先不关联").
# Fifteen-participant transcript reconciliation

- [x] Match each of the 15 participants to the authoritative interview Q&A supplied in chat; do not infer identity from recording titles.
- [x] Check every Screening, Hourly, and Daily answer against the matching Q&A for direct contradictions; preserve explicit non-answers and blank unsupported fields.
- [ ] Correct confirmed mismatches only through the WordPress/JetEngine visual interface.
- [x] Hide calendar dates in researcher Hourly/Daily displays while retaining AM/PM and clock time.
- [ ] Verify all 15 participants after the confirmed Liang Yu screening correction is saved through the WordPress/JetEngine visual interface.

# Context-mapping sticky-note logic corrections

- [x] Leave Zhang Lei and Li Ting unchanged.
- [x] Re-review Zhao Guilan through Liu Weidong conservatively: preserve approximately coherent informal-chat details and change only clear interview conflicts or obviously unrelated answers.
- [x] Apply every confirmed correction through the researcher editing interface, without deleting or renumbering any CCT or relation.
- [x] Reopen every changed record and verify the saved values person by person.


# Framework upgrade (TanStack Start)

- [x] Migrate from Classic Vite + React Router to TanStack Start; type check clean, build green, every page opens, tests pass.

# Dashboard care-task correction

- [x] Limit homepage care tasks to tasks linked to the signed-in user's cared-one relationships.
- [x] Open each homepage task in that person's Care Tasks card, and remove misleading arrow decoration.
- [x] Make every dashboard cared-one summary open that specific person's card page and show that person's correct pending-task count.
- [x] Verify the corrected dashboard in the running app with both approved test accounts: unrelated AUDIT/E2E tasks are absent, empty state is correct, and the misleading arrows are gone. A live row-click could not be exercised because neither account currently has a related pending task.

# Fixed information-card links
- [x] Use the card item ID for sharing; remove token generation, expiry and revoke controls.
- [x] Read current card visibility and show bilingual family-contact guidance on denied access.
- [x] Verify anonymous public-card access and zero writes while opening/copying sharing; 4/4 automated tests cover current visibility and denial. Live visibility-change verification remains unperformed to avoid changing real records; existing WordPress direct-API authorization risk remains unresolved.

# Permission audit and information-card reuse
- [ ] Audit all application permissions, tracking live checks separately from source-only and mocked checks.
- [ ] Test every information-card visibility scope and both approved accounts plus anonymous reads; do not modify or delete real records.
- [ ] Identify whether the information-card map and AI reuse standard interfaces and document privacy gaps.
