# Complete the ESM screening and update the English ChallengeD logo

## What will change
- Rebuild the screening flow from the uploaded 1,567-line source list as the authority, preserving every question, sentence, answer choice, scale, order, and stored value.
- Include all primary-caregiver pages: personal information, care-recipient information, ADL, IADL, all 12 NPI-Q symptom/severity/distress sets, all 7 SSCQ items, all 12 MSPSS items, perseverance time, all 30 ADKS items, and all 20 DAS items.
- Include all secondary-caregiver fields from a134–a143, plus the same existing ADKS and DAS questions stored in a84–a133; do not create duplicate questions or storage fields.
- Keep internal numbers and storage codes hidden from participants while retaining their exact existing values for submission.
- Make every required input usable by touch, typing, and voice; preserve conditional “Other” fields and NPI-Q follow-up behavior.

## Profile and reminder settings
- Keep the participant name saved with screening information.
- Replace the incomplete reminder switches with the specified controls: hourly reminder on/off, reminder hours from 8:00 AM through 10:00 PM, and multiple device-only do-not-disturb periods.
- Keep the daily 10:00 PM reminder mandatory, with the specified next-morning, noon, and evening missed-daily-summary reminder rules shown accurately.
- Store all reminder and do-not-disturb choices only on the device, not in WordPress.

## English ChallengeD logo
- Change only the English ChallengeD logo to a flat purple, TechCrunch-style block “CD” treatment.
- Keep the Chinese 忆畅 logo, all other brands, and the existing purple brand color unchanged.
- Use the same shared logo component everywhere so header, menu, and sign-in placements stay identical.

## Data and safety constraints
- Use the current fixed structures: CCT318 screening, CCT319 hourly log, CCT317 daily log, CCT320 people; preserve REL305/306/307/308/316/321.
- Do not delete, rebuild, rename, renumber, or create any CCT or Relation, and do not create any `_v2` structure.
- Do not change the uploaded wording, answer choices, selector values, or column mapping.

## Verification
- Compare every uploaded screening item against the rendered primary and secondary flows, with exact counts and field-by-field storage mapping.
- Complete both flows in English and Chinese, including voice-answer controls, conditional fields, draft persistence, submission payloads, and saved participant name.
- Verify reminder settings persist, allow multiple do-not-disturb periods, and correctly represent the mandatory daily reminder schedule.
- Check the English ChallengeD logo in every shared placement and confirm the Chinese logo is unchanged.
- Test desktop and mobile layouts and report each verified item explicitly.
