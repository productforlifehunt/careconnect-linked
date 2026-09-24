# ESM survey navigation and participant flow

## What will change

- Add a top-right **Me** entry to the study header.
- Create a two-tab Me page:
  - **Profile & settings**: edit the participant name, saved to the screening answer/draft; keep reminder and display preferences on this device.
  - **Screening questions**: choose Primary or Secondary caregiver locally, show the matching questionnaire and completion state, and provide a direct **Finish your self-introduction questions** link when the opening personal-information section is incomplete.
- Keep the caregiver-role choice on the device only; do not add a WordPress field for it.
- Replace Today’s grid with a horizontally scrolling **24-hour timeline** (00:00–23:00), initially centered on the current hour.
  - Each hour shows recorded/not recorded status.
  - The current prompted hour uses the solid Sensor Tower light-green outline.
  - Every hour remains selectable for backfilling and supports multiple entries.
  - At 10 PM, show the instruction to complete the daily questionnaire the following morning.
- Merge the old hourly and end-of-day navigation into one **Log entry** page with two choices:
  - **Log hourly care event**
  - **Log daily care summary**
- Reduce the bottom navigation to four destinations: **Today**, **Log entry**, **My entries**, and **Help**.
- Add Help with concise completion guidance and an AI chatbot entry for study questions.
- Split My entries into two tabs: **Hourly care events** and **Daily care summaries**.

## Technical details

- Preserve CCT 317/318/319/320, REL 305/306/307/308/316/321, their numbers, fields, and existing write paths unchanged.
- Extend local study state for profile/settings, role selection, per-hour multiple-entry counts, and draft progress.
- Reuse the existing screening, hourly, daily, voice-answer, and AI surfaces; only add navigation/state needed for the revised flow.
- Keep `?__site=esm_survey` on every route and deep link.

## Verification

- Check the full flow as Primary and Secondary: Me → matching screening → resume self-introduction → Today → selected hour → hourly save → daily save → filtered entries → Help.
- Verify 24 hourly items, current-hour positioning/highlight, multiple entries for one hour, 10 PM message, local settings persistence, voice controls, mobile and desktop layouts, and current build/runtime logs.
