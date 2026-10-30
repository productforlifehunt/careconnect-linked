## Current request: Family voice STS, steady playback and schema disclosure
- [x] Official Qwen/CosyVoice documentation checked: realtime audio conversation exists, but no publicly documented timing/prosody-preserving target-voice conversion API found; no STS feature added or paid probe made.
- [x] Preview, original and AI-call players explicitly use volume=1; 18/18 focused tests pass, including multi-sentence single synthesis/playback and three full-volume paths. Build OK. No existing app fade/ramp was present; provider audio is preserved unchanged.
- [ ] Live audible outcome remains unverified: test1 signs in and opens /cared-ones/1/family-voice, but the real voice list remains loading after an additional 45 seconds; no playable voice, alert or page error. User-native microphone and provider-produced loudness are not verified. No stored recordings changed.
- [x] Actual CCT322 a55–a61, b55/b56/b57 states, REL323 cared-one parent/voice child, private original storage and accepted REL219/self checks inspected; disclose below without modifying WordPress schema.

## Current request: Server-persisted cared-one family voices
- [x] Created CCT322 cared_one_relatives_voice and REL323 Users → voices one-to-many through /afresh GUI; reopened and verified a55–a61, separate relation table, manage_options direct access and screenshots.
- [x] Server persistence retains private original audio, provider ID/model/state/error; verified WordPress session and accepted REL219 (or self) gates every action. Added server rename/delete/reclone, explicit legacy reference import preserving local originals, and server-fed AI-call selection.
- [x] Real test1 recorded official sample into CCT322/REL323, Qwen 3.1 Plus cloned successfully; fresh browser had no family-voices-v1 yet read it, refresh retained it, original and synthetic playback reached Stop playback; server rename read back, zero page errors. Original re-cloning succeeded; temporary voice deleted and empty server list read back. 17/17 tests passed. No user recording changed. Failed pre-record-creation attempts left private unlinked sample files, not user audio.
- [ ] Remaining verification: second-caregiver live account sharing, old user-device imports, full AI call, and other model billing remain unverified; two-caregiver access is covered by explicit relationship tests, not a real shared-caregiver session.

## Current request: Cared-one switching and voice attribution
- [x] Clicking a cared-one name switches the current care tool; a separate pencil + Edit button opens the existing popup.
- [x] 12/12 tests pass, build OK. Real test1 UI: name navigates to /cared-ones/1 with no dialog; Edit opens the existing dialog. Screenshots checked. This session exposes only one cared one, so switching between two real people is covered by tests, not live verification.
- [ ] Identify which cared one owns 董卿/金星/高晓松: blocked by device-local family-voices-v1 data unavailable in this browser; source, history and available logs provide no verified mapping. No saved voice was changed.

## Current request: Recording duration and preview dictation
- [x] Verify official Qwen-Audio-TTS/CosyVoice recommendation of 10–20 seconds and maximum 60 seconds; extend UI auto-stop to 60 seconds, retaining manual stop.
- [x] Add preview dictation through the existing transcription client, with editable text and explicit synthesis.
- [x] Focused tests cover 20s continuing/60s stopping and editable dictation without automatic synthesis; real test1 browser records the official spoken sample, transcription returns text in the preview field with no alerts/page errors; screenshot checked, build OK. This new browser has no local cloned voices, so the new dictation-to-cloned-playback chain is not verified end-to-end. Real 60-second enrollment and native-device microphone not separately exercised.

## Current request: Alibaba family voice model comparison
- [x] Verify current Qwen/CosyVoice versions, Beijing prices, shared 10–20-second recording recommendation, default long-lived voices and parallel product lines; exclude MiniMax. Token-priced Qwen 3.1 Flash is separate from character-price ranking.
- [x] Add nine price-listed per-model enrollment choices and shared-text preview buttons; persist exact model, keep historical Qwen default, route AI calls through saved model, preserve rename behavior. Recording stops at 20 seconds; failed remote deletes retain references.
- [x] 8/8 focused tests pass; latest build OK. Real test1 browser records Alibaba's official 18.87-second WAV through the microphone flow: all 9 models enroll successfully, 7 synthesize Chinese and invoke actual playback, with temporary voices deleted. EN desktop and ZH desktop/393px inspected; nine rows, no page overflow or runtime errors; final local voice list empty.
- [ ] CosyVoice 3.5 Flash/Plus synthesis blocked by Alibaba 403 “Free quota exhausted…add funds or disable use free tier only”; no account billing setting changed. All nine enrollment/deletion paths work; these two playback paths remain blocked. No listening-quality judgement or native-device microphone check performed; new-model AI-call output routing checked in source, not end-to-end conversation. No unsupported claim of future model survival.

## Current request: Family voice text preview and rename
- [x] Add bottom text preview using the selected existing cloned voice, with playback/error states. Existing provider/model unchanged.
- [x] Rename saved voices without changing their provider IDs; synchronize AI-call voice labels through the existing shared change event.
- [ ] Verification: 2/2 focused tests pass (rename persistence/event and exact entered text + original voice ID + playback, mocked synthesis), latest build OK. Real test1 login opens /cared-ones/46/family-voice, bottom text preview visibly renders, zero page errors. Actual cloned-voice playback is unverified because this fresh browser has no device-local saved voices; the user's existing recording is on their own device. No real recordings changed or fake voice IDs submitted.

## Current request: Community, documents and unread consistency
- [x] Remove Score from community list/detail and leave one Open discussion link; separate up/down counts retained. Live list/detail checked.
- [x] My Posts compares existing author/session WordPress IDs without wp-prefix/type mismatch or waiting for full profile. test1 created a temporary post, found it under My Posts before/after refresh, opened detail and deleted it. Original screenshot post is not test1's; challenged login did not establish a session, so original-account readback is not verified.
- [x] Identify 阿甘照护 in live CCT151 row84 a56, a01=challenged, a55 empty. No hardcoded name found; who originally entered this saved value is not established. No account/profile renamed.
- [x] Documents has one right-side Add opening the same form with Upload files retained; actual dialog and screenshots checked, existing files not edited.
- [x] Inbox/header/mobile/dashboard share unread notifications + unread conversation flags. Live test1: 23+2=25 at every surface, All40/Unread25/Read15; open chat decrements and survives same-context refresh; Mark all as read eventually reads back All40/Unread0/Read40 and dashboard0. Notification writes were delayed on first check; final readback succeeded. Test1's old notifications were marked read for verification; messages are account-scoped device-local, so a fresh browser still has two unread conversations.
- [x] 25/25 focused tests pass, latest build OK; EN1280 and ZH393 screenshots have no horizontal overflow or runtime errors. SafetyShell shares hook but its signed-in view not separately exercised.
- [ ] About/Demo preservation visual verification: none of the six supplied screenshots shows these entries, and no matching combined header was located; existing About/Demo content was not changed. Needs identifiable target before claiming that part checked.

## Current request: Stable medicine and check-in toolbar
- [x] Keep three fixed view tabs and an independent right-side Add button in every view; use matching constrained dimensions for both pages.
- [x] Real test1 session: both pages × three tabs × 794px/393px widths (12/12) retain identical Add/tab positions and dimensions on switching; all 12 Add dialogs open, screenshots checked, no horizontal overflow or runtime errors. No records changed.

## Current request: Check-in and medicine time-write parity
- [x] Both create/update paths use scheduleTimeColumns for CCT187 a57/a58/a66; ordinary edits preserve a68/a69, and a90/a70 are never written. Check-in cutoff handling matches medicine.
- [x] 12/12 focused tests pass, including actual create/update payload parity, UNTIL and exception preservation; latest build OK.
- [ ] Real create/save/readback not verified: test1 signs in but /cared-ones/54/checkin remains on the loading spinner after 15 seconds, with no page errors. No live records changed.

## Current request: One-picture sick-leave notice
- [x] Add a standalone `sick` micro site at `/?__site=sick`: one picture, no words, no app shell, no brand; user's photo stored as a stripped-metadata CDN asset.
- [x] Real browser (clean session): page renders only the picture (0 body characters, no nav/header/footer), right-click over the picture is cancelled, drag/selection disabled, `noindex` applied, zero page errors; homepage and consent page unaffected in clean sessions. 8/8 tests pass, build OK.
- [ ] Published site not updated; true download prevention is impossible in a browser (screenshot / network panel remain available to any visitor).

## Current request: Recruitment source collapsed display
- [x] Replace expanded read-only recruitment paragraphs in Participants and Interviews with a default-collapsed button; preserve full text and existing researcher editing.
- [x] Real visitor first interview defaults collapsed, expands the original full paragraph, and collapses again; screenshots captured, zero runtime errors. Affected tests 20/20 pass and latest build OK. Participant surface uses the same disclosure; authenticated participant interaction not separately exercised. Published site not updated; no saved research records changed.

## Current request: Interview overview
- [x] Add a default-collapsed overview to each interview, using Gemini Flash and saved corrected text before Edited lines; cover care context, challenges, coordination and stated services/products by importance, with no archive writes.
- [x] 17/17 source-selection and existing archive tests pass; real first interview defaults collapsed, expands and collapses again, with zero browser runtime errors. AI failure clears loading and displays the actual credit error.
- [ ] Successful real overview and factual output review blocked: gateway returns “Not enough credits”. No additional model probes; no summaries have been generated or saved. Only one interview's interaction exercised live.

## Current request: Six consented demo recordings preload
- [x] Freeze the first four currently displayed interviews by recording identity; use native full preload only for these, with existing playback switches still enforced and no download control. Remaining recordings retain five-second click-started streaming. No audio, metadata, archives or WordPress records changed.
- [x] Existing handler deployed; 29/29 tests pass. Live visitor: all six demo preload calls return 200, all eleven non-demo calls return 403; Li Ting preloads before click without autoplay and advances on Play, Wang Hai Tao uses stream only. Playback screenshots checked, zero runtime errors; latest build OK. Full end-to-end playback of every recording not exercised; full preload is browser-managed and cannot guarantee extraction prevention or instantaneous complete buffering.

## Current request: Atomic interview button readiness
- [x] Load all five archives concurrently and commit together; lock interview controls and fresh generation until the entire set succeeds. Failed reads remain locked with a whole-set retry; late results from a different interview are ignored.
- [x] 25/25 focused tests pass, including delayed fifth read and whole-set retry after failure. Real visitor delayed-read check locks all five archives and generation together; after release all five existing archives enable together and Raw reads 238 sentences. Screenshot checked, zero runtime errors or generation/audio/archive-write calls; latest build OK. Researcher-specific loading tested with mocked requests, not a real researcher session; no researcher write changes in this request.

## Current request: Click-only streaming playback
- [x] Replace playback signed URLs with five-second server-authorized binary chunks requested only after Play; hidden/disabled visitors receive no audio; legacy play_url/transcribe_url return 403 for everyone.
- [x] Remove browser audio download/decode fallback from transcript generation; retain server-only WAV/MP3 generation and independent archives. All 17 current recordings have .wav names; unsupported formats fail closed.
- [x] 27/27 tests pass. Real visitor Play returns audio/wav, advances playback position, and has zero pre-click stream requests, storage requests, signed URL requests or audio elements. All 8 currently restricted recordings reject stream with 403/no URL. Restricted fresh-generation first segment returns text only (200); zero browser audio requests/runtime errors; build OK.
- [ ] Researcher-authenticated streaming and full long-recording playback/generation remain unverified. Previously issued signed URLs expire on their original schedule and already-copied audio cannot be recalled; permitted streaming does not prevent capture by listeners.

## Current request: Prevent restricted recording extraction
- [x] Deny visitor audio URLs for both hidden and disabled players, including transcription URL requests; shared permission tests pass. Live restricted recording play_url and transcribe_url both return 403. Bucket is private and deployed storage.objects has no direct-read policies.
- [x] Process WAV/MP3 transcription server-side and return text only; preserve archives and researcher access. Actual .wav file 73 is MP3 internally, handled without replacing the recording.
- [x] 26/26 focused tests pass; live anonymous recording 73 generates its first segment (200, text plus numeric cursor only), browser has zero audio elements/storage-audio requests/transcribe_url requests, zero runtime errors; build OK. No archives/settings edited.
- [ ] Full long-recording run and actual researcher access not exercised. Previously issued six-hour playback and fifteen-minute transcription URLs cannot be retroactively revoked by these switches; may remain valid until expiry. Non-WAV/MP3 restricted formats fail closed, rather than return audio.

## Current request: Simple model explanations
- [x] Remove reasoning/budget/snapshot and historical-settings caveats from interview explanations; Raw generation names the actual model/ID and the transcription and translation instructions shown above. No model behavior changed.
- [x] Live page and paragraph screenshot verify model/ID plus above-instructions wording; removed English/Chinese caveats absent; build OK.

## Current request: Manual anonymization
- [x] Add researcher-only manual anonymization beside automatic generation, opening current Edited lines immediately without AI; explicit save uses the existing separate anonymized archive and overwrite confirmation.
- [x] 17/17 tests pass, including manual draft/edit/save/readback without AI, Edited preservation and visitor restriction; live public page loads and build OK. Real researcher-authenticated save remains unverified; tested save uses mocked storage.

## Current request: Recording controls screenshot correction
- [x] Left recording list has no size rendering; move legend above Participants/Interviews tabs and New interview.
- [x] Move all three researcher-only visitor controls below Delete and Play recording; visitors see no switches. No archive or recording changed.
- [x] 15/15 focused tests pass; live screenshot confirms legend above tabs, left list without file sizes and zero visitor switches; build OK. Actual researcher session save remains unverified.

## Current request: Recording display controls
- [x] Remove displayed recording sizes and move the code legend full-width between the tabs and the interview/list area; live screenshot and position checks pass.
- [x] Add researcher-only per-recording saved switches for visitor playback permission, player visibility and Generate New visibility, with no extra explanations; disabled visitor playback has an unclickable control and no playback URL; researcher retains playback and generation. Preserve generation and all archives. Existing service deployed.
- [x] 26/26 focused tests pass, including three-switch save/reload, visitor no-audio and archive-only views; anonymous settings write denied 403. Live public layout and occasional-caregiver hidden audio/no-note/generate retained pass; Raw archive reads 312 lines, zero runtime errors, build OK.
- [ ] Actual researcher-authenticated live switch save/readback remains unverified: no researcher WordPress session is available in this sandbox. Test save/reload uses mocked storage; no existing recording settings or archives modified for verification.

## Current request: Truthful research AI model labels
- [x] Verify transcription/translation/anonymization model IDs and explicit reasoning settings against source requests and successful gateway logs: google/gemini-3.8-flash for joint audio transcription/translation and anonymization; openai/gpt-5-nano with reasoning_effort none for diary translation.
- [x] Correct research labels with exact model IDs, unspecified Gemini defaults, explicit GPT reasoning_effort none, unavailable underlying snapshots, historical/cached provenance caveats and non-AI manual/text operations. No model calls or archives changed.
- [x] Run 17/17 focused tests including three concrete model-request configuration checks; live visitor verifies joint transcription/translation model, reasoning defaults, anonymization model, no-AI text operations and historical uncertainty; existing Raw archive reads 312 lines, zero runtime errors, screenshot checked, build OK. GPT gateway response additionally confirms gpt-5-nano-2025-08-07 and reasoning_tokens 0 on 2026-10-21; label distinguishes observed snapshot from unpinned alias. Researcher-only translation label checked in source, not authenticated live UI.

## Current request: Interview explanations and appendix text
- [x] Separate public metadata and archive actions, with six dark bilingual explanations; live visitor screenshot checked.
- [x] Remove timestamps from generated and existing displayed/downloaded text with a shared formatter; expand speaker labels on every utterance. 14/14 focused tests pass; existing live text has expanded labels and no sentence timestamps. Stored manual corrections remain untouched.
- [x] Verify live visitor view with zero runtime errors and build OK. Authenticated model catalog confirms GPT-5 nano accepts only text/image, not audio; keep truthful Gemini Flash labeling.
- [ ] Requested ChatGPT 5 nano direct raw-audio generation cannot be implemented: model has no audio input support. Existing audio engine retained; no misleading model claim added.

## Current request: Research participant metadata and code ordering
- [x] Add researcher-only persisted participant display title/identity, recruitment source and notes without changing accounts, answers or relations; backend rejects anonymous reads and writes with 403.
- [x] Add recruitment source between interview title and notes; preserve it across saves. Focused test verifies no generation or archive write during metadata save.
- [x] Use shared CN-first numeric ordering and show P/CN/A/B/C definitions in both lists; Participants uses current interview display titles as existing-name defaults, while saved participant overrides take precedence. Live visitor list verified all 17 displayed recordings in CN-first order with P-C1–P-C4 last.
- [ ] Verification: 18/18 focused tests pass, live anonymous read/write denials pass, visitor legend/list screenshot checked with zero runtime errors. Researcher live Participants rendering and actual save/reload remain unverified: no researcher session found, and approved test accounts are not the researcher identity. No real records were edited for verification.

## Current request: Raw and edited interview archives
- [x] Label fresh generation and existing archives Raw; add green Edited archive view. Live visitor screenshot confirms both buttons and 312 existing Raw sentences.
- [x] Implement researcher-only editing and explicit separate Edited save, browser draft preservation, and overwrite confirmation; 5/5 focused tests pass including save/readback and Raw isolation.
- [ ] Authenticated researcher live edit/save/readback remains unverified: no existing researcher session or known researcher password found; approved challenged/test1 accounts are not the researcher identity. Live anonymous save is denied 403, Edited read returns 200/null, visitor has zero edit controls and zero runtime errors. No existing archive was modified for verification.

## Current request: Network 8 context mapping
- [x] Both Network 8 participant titles already match saved interviews exactly; confirmed with researcher login.
- [x] Add seven reconstructed Daily context notes per participant through JetEngine GUI, link through existing REL307, and read all fourteen back in researcher view. Every note labels reconstruction and archived sentence references; uncollected daily scale scores remain blank, not invented.
- [x] Add one further transcript-grounded, time-unbound Hourly note per participant through JetEngine GUI and existing REL306. Verified final counts: Chen 7 hourly / 7 daily / 1 screening; Lin 5 hourly / 7 daily / 1 screening. No schema, relation configuration, existing answers or account credentials changed; no browser runtime errors.

## Current request: user-data scope audit and NotchSafety green
- [x] Audit task/group/notification/AI services and private feature sources; remove whole-CCT reads from private task/group/notification lists, delegate legacy services, and clear account caches. Public helper-task listings are intentionally shared; their global transport read remains, as do chat bulk transport reads (not an all-page security audit).
- [x] Live test1 verification after briefing identity/schedule correction: tasks 0 in both list and briefing, unread messages 2 in both, QA Morning Checkin appears in timeline and briefing; no runtime errors, build OK. AI still produced contradictory wording about whether the listed check-in is scheduled; report this remaining output-quality issue, plus chat/public-task bulk transport reads and incomplete all-page live coverage.
- [x] Match NotchSafety theme and favicon to CareCNC green: both brands resolve primary 173 100% 41%; English/Chinese NotchSafety login screenshots verified; build OK.

## Screening question provenance labels

## Current request: Life360 comparison and card-only visibility
- [x] Evaluate blue versus mint/teal for NotchSafety without changing colors: favor restrained teal identity with pale mint surfaces and dark readable text; color does not establish eye protection or children's preferences.
- [x] Verify card-only viewer permissions in source and anonymous browser on card 10: shared LocationCard map and safe zone rendered, associated care-plan/medicine reads returned 200, AI answered an actual typed question without login. No person-position record exists for this card, so a live person marker remains unverified. Subagent's claimed transport auth gate was disproven by current source and browser evidence; no application change needed.
- [x] Research official Life360 invitations (72 hours), per-circle sharing and visible paused status, Bubbles, temporary browser links, temporary Circles, and Tile Bluetooth finding; explain collision math without claiming unpublished server internals. No official who-viewed log documentation found; absence is not conclusively established. Native app interaction was not tested.

## Current request: auth boundary and shared information-card internals
- [x] Distinguish page login protection from data authorization: fresh anonymous browser redirected /cared-ones/46/location to /auth and denied private shared card 5; previous direct-read evidence still establishes a data-layer vulnerability, not a bypass of that page redirect. No backend fix was made.
- [x] Replace information-card standalone maps with shared LocationCard read-only mode, bound only to the card's associated person; disable management queries and viewer geolocation in this mode.
- [x] Verify public card 10 renders the shared Leaflet map with no request or add-zone buttons, no runtime errors, and build OK. It currently has zones but no person-position record, so no live person marker was verified. Both SheetAIPanel and floating AICompanionChatDialog import AICompanionChat; preserve card knowledge. InfoSheetAIDialog is only imported for its context type, not mounted.

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


# Preview startup recovery

- [x] Identify graphlib startup exception in the user's preview telemetry; localhost homepage renders without that error.
- [x] Defer the shared Mermaid engine until an actual diagram renders, preserving diagram support without executing its dependency graph on app startup.
- [x] Verify all five sub-app entry screens locally at the user's 743×669 viewport, including loaded researcher interview rows: HTTP 200 and zero runtime errors for each; routing test passed and latest build OK.
- [ ] Confirm the user's editor preview itself recovers after refresh; external automation redirects to the Lovable login wall and cannot observe that session.

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
- [x] Test four information-card visibility scopes in 36 mocked identity combinations; 42/42 tests passed. Live: both approved accounts and anonymous reads checked across all 6 existing information cards and 11 care/location read operations for cared one 46. Anonymous direct reads exposed all 4 private cards, 1 check-in, 1 plan, 1 medicine and 1 safe zone. Empty results do not prove authorization.
- [x] Confirm information-card map is independent SheetMiniMap, not LocationCard; AI shares AICompanionChat but uses independent inline SheetAIPanel, not AICompanionChatDialog. Public AI knowledge loads additional plans/notes/medicines. Polygon renderer expects lowercase but source returns capitalized Polygon.
- [ ] Live create/edit/delete/relationship permissions: not exercised to avoid modifying or deleting existing records; mocked update/delete tests demonstrate missing local authorization but do not establish backend write permissions.
- [ ] Remaining all-app live permission coverage: care-group role changes/subgroup visibility, chat isolation, commerce ownership, file operations, researcher access, location request/emergency writes. Read-only source inventory is not a live audit.

## 2026-10-22
- [x] /?__site=consent 知情同意书微站：新增 consent 站点（SiteContext + __root + src/pages/consent/ConsentApp.tsx），单页双语（英文在前），仅展示与确认键；伦理批号/日期留空不编造；确认仅存本机 localStorage。
- [x] 知情同意书措辞修订：第五条改为"研究结果仅以文字形式呈现（含匿名原话）"，新增"录音与录像文件均不会在研究发表或公开演示中呈现"；第二条确定"一周"不写"例如"。浏览器实测新旧措辞替换，测试 4/4。
- [x] 招募来源改为下拉框（RecruitmentSourceSelect，5 个预设 + Other 自定义，旧值不匹配自动进自定义模式保留原值）：ParticipantDetails 与 InterviewsPanel 两处替换；测试 24/24 通过，构建 OK。
- [x] 研究者登录实测恢复可用：researcher / superstrongpassword（历史会话确认）；?__site=researcher 参与者编辑框与访谈记录编辑框两处下拉框 Playwright 实测渲染与选择正常，未保存任何真实记录。

## Current request: Medicine schedule = dictionary calendar fields (one by one)
- [x] Step 1: mobile medicine card no longer truncated; each dose slot checks in separately (CCT161 a88 = slot time, REL191 + REL173). Tested live on 393px with test1.
- [x] Step 2: medicine + health check-in schedules read/write only a57/a58/a66/a68/a69; a90 no longer used; fields without a dictionary column removed from forms. Live create (3x daily) → edit (2x) → delete tested; 325 tests pass.
- [ ] Test dose log #235 (CCT161) left from live test; no delete control in app.
