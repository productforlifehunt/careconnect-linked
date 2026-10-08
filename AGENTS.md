
- Interview audio and researcher-approved transcript archives live in the private `interview-audio` bucket; fresh generation never reads the archive, while the researcher may overwrite the public read-only archive after a complete run.
- The application is light-only; keep one forced light theme and do not expose theme-switching controls, because the care interface must remain visually stable.
- NotchSafety uses the shared `Index` homepage with site-gated family-location content while retaining its reduced `SafetyShell` route tree, preventing landing-page drift without exposing care-marketplace features.
- All user-visible brand identity must come from the current site and language; ChallengeD/忆畅, CareCNC/护畅, and Notch Safety/诺驰安全 must never cross-leak in pages, dialogs, metadata, AI labels, or notifications.
- Researcher screening uses a presentation-only helper for role-specific item selection and exact original questionnaire provenance; interview role overrides mixed legacy fields, shared secondary instruments cite Sections 2.2.1/2.2.2, and unnumbered items never inherit generated question codes, preventing cross-role display without changing stored answers.
