# Family voices — additive dictionary (GUI verified 2026-10-30)

- CCT **322**, `cared_one_relatives_voice`, “Cared one's relatives voices to be cloned”.
- REL **323**, “One cared one can have many related relatives voices to be cloned”: Users parent → CCT322 child, **one to many**, separate JetEngine relation table.
- All CCT and REL REST capabilities: `manage_options`; frontend uses authorized server actions, never privileged credentials.

| Field | Label | Type |
|---|---|---|
| a55 | Voice name | Text |
| a56 | Original audio private storage path | Text |
| a57 | Cloned provider voice ID | Text |
| a58 | Exact enrollment model | Text |
| a59 | Enrollment state | Text: b55 pending, b56 ready, b57 failed |
| a60 | Last enrollment error | Textarea |
| a61 | Original audio MIME type | Text |

Original files live in private `family-voice-audio` storage; only file paths are stored in a56, not public URLs. cct_author_id and creation/modification dates use JetEngine built-ins. Cared-one ownership exists only in REL323. Caregiver access checks accepted REL219 or the cared one's own account. Legacy local imports have no original audio and are labeled accordingly.