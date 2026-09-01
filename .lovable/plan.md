# Restore Removed Product Content

## Scope
- Restore the full AI Companion page and its English/Chinese copy, including all feature, capability, safety, comparison, use-case, CTA, and disclaimer sections removed in the last cleanup.
- Restore the other content removed or weakened in that cleanup: homepage trust signals and copy, Trust & Safety content, AwareD/AccompanieD copy, and related English/Chinese/Japanese translations.
- Keep WHO/iSupport attribution out of the visible product UI: do not restore the homepage WHO badge, and remove the current Resources-page WHO badge/source wording.
- Do not change backend logic, data models, or unrelated pages.

## Verification
- Check the diff to confirm every cleanup deletion is restored except visible WHO/iSupport attribution.
- Run the focused test/build checks and confirm the preview renders the restored AI Companion page and homepage without runtime errors.

## Technical Details
- Use the repository version immediately before the cleanup commits as the restoration source, then apply the narrow WHO-only exception.
- Preserve current routing, shared components, styling tokens, and bilingual parity.