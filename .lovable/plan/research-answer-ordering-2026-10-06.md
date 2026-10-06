# Research answer ordering

## Change
- Sort every participant's Hourly answers from study day 1 through day 7, then from morning to evening within each day.
- Sort every participant's Daily answers from study day 1 through day 7.
- Keep Screening answers and all saved answer content unchanged.

## Verification
- Open the researcher dashboard and confirm the visible order for all 11 participants in both Hourly and Daily tabs.
- Check the preview build and runtime error logs.

## Technical details
- Derive ordering from the same answer timestamp currently used to display “Study day N,” not from record creation order.
- Use record creation time and ID only as stable tie-breakers.
