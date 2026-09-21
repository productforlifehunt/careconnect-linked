# ESM Survey sub-app — "A Week in the Life of Dementia Caregivers"

A new sub-app (`esm_survey`) alongside ChallengeD / CareCNC / NotchSafety, reached with
`?__site=esm_survey`. Its own shell, own landing, own navigation — none of the care-app
menus. Every single answer can be given by voice.

## What gets built

**1. Screening — Primary caregiver (Section 1)**
- Personal info 1.1.1–1.1.11 (name, age, gender, education, employment, marital status,
  self-rated health 1–5, relationship, caregiving duration, hours/week, distance)
- Care recipient info 1.2.1–1.2.6 (age, gender, dementia type, years since diagnosis,
  CDR stage, education)
- ADL 5 items + IADL 5 items (Independent / Needs help / Cannot do)
- NPI-Q full 12 items (presence → severity 1–3 → caregiver distress 0–5)
- SSCQ 7 items, MSPSS 12 items (3 subscales), Perseverance time (6 options)
- ADKS 30 True/False, DAS 20-item scale

**2. Screening — Other caregiver (Section 2)**
- Personal info 2.1.1–2.1.8 incl. contact frequency
- ADKS 30 + DAS 20 (shared item banks with Section 1)

**3. Hourly log (Section 3)** — three tabs in one entry
- Activity tab: timing (NOW / OTHER TIME / NOT TIED TO TIME), 14 activity categories
  multi-select (the "ADL:"/"IADL:" prefixes are hidden from participants), event stress
  −3…+3, description, MBP checklist 3 × Yes/No, MBP distress 0–4, unfulfilled needs,
  ideas, minutes, positive affect 4 × 1–7, negative affect 7 × 1–7
- People tab: pick from care network or "Just Me", people involved, who else you wish
  could help, challenges reaching them
- Challenges & Resources tab: challenge level −3…+3, 11 challenge types multi-select,
  challenges faced, resources used, resources wished for

**4. Daily log (Section 4)** — supplement missed hourly entries, 3 daily SSCQ items
(1–7), overall daily burden −3…+3.

**5. Reminders** — hourly prompts 8 AM–10 PM plus the 10 PM end-of-day prompt, shown
in-app with a "due now" banner and an entry list of completed/missing slots.

**6. Voice everywhere** — every question (free text, scales, single- and multi-select)
has a mic button: record → transcribe → the answer is filled in, and for scales/choices
the spoken answer is matched to an option and shown for confirmation before it is saved.
Free-text answers keep both the transcript and the audio reference.

## Technical notes

- Site registration: add `esm_survey` to the site slug grammar and brand configs in
  `src/contexts/SiteContext.tsx`; `RootRouter` renders a new `src/pages/esm/EsmApp.tsx`
  with its own shell, exactly like NotchSafety does.
- Questionnaire content lives in typed item banks under `src/features/esm/` (NPI-Q,
  SSCQ, MSPSS, ADKS, DAS, activity/challenge taxonomies) so scoring and rendering are
  data-driven and every item is present, not paraphrased.
- One generic renderer per answer type (text, number, single choice, multi choice,
  Likert, bipolar −3…+3, yes/no), each wired to the shared voice-answer control.
- Speech-to-text runs server-side through a Supabase edge function calling Lovable AI
  (`google/gemini-3.5-transcribe`); the browser uploads a complete WAV.
- Storage: JetEngine CCTs on the headless WordPress backend, created via the JetEngine
  GUI (90-mode), with participant links as JetEngine relations — no custom FKs. Answers
  are drafted in `localStorage` so a half-finished log survives a reload, then submitted.

## Question for you before I build the storage side

The CCTs for this study (screening response, hourly log, daily log, item answers) do not
exist yet on the backend. Creating them through the JetEngine GUI takes a while but is
the only safe way. I will do that as part of this work unless you tell me to run the
survey front end on local drafts first.
