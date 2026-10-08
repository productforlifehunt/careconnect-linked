
- Interview audio and researcher-approved transcript archives live in the private `interview-audio` bucket; fresh generation never reads the archive, while the researcher may overwrite the public read-only archive after a complete run.
- The application is light-only; keep one forced light theme and do not expose theme-switching controls, because the care interface must remain visually stable.
- NotchSafety uses the shared `Index` homepage with site-gated family-location content while retaining its reduced `SafetyShell` route tree, preventing landing-page drift without exposing care-marketplace features.
- All user-visible brand identity must come from the current site and language; ChallengeD/忆畅, CareCNC/护畅, and Notch Safety/诺驰安全 must never cross-leak in pages, dialogs, metadata, AI labels, or notifications.
- Researcher screening provenance uses a presentation-only helper with original questionnaire headings and question references; explicitly handle unnumbered ADL/IADL items so inherited generated codes cannot misidentify their source.
