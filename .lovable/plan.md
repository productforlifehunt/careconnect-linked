# Centralize every AI prompt

## Goal
Put all AI instructions in one source of truth so every AI feature is reviewable in one place and English never presents the Chinese name “小忆”.

## Changes
- Create one shared AI prompt registry used by both the app and cloud functions.
- Move the common companion identity, language rules, care modes, check-in, information-sheet, location safety, note search/writing, and voice-reading instructions into that registry.
- Use one brand rule everywhere: Chinese responses identify as “小忆 AI”; English responses identify as “ChallengeD Assistant”; English must never output “小忆” or “XiaoYi”.
- Replace every inline system prompt and AI instruction template with a registry function call.
- Keep feature-specific facts dynamic: current location, medicines, check-ins, care-sheet details, and notes are appended at call time rather than copied into prompt files.
- Preserve the existing two-bucket memory rule and 10,000-character rolling window.

## Verification
- Search the entire app and cloud-function tree for remaining inline system prompts and old English “小忆/XiaoYi” branding.
- Run focused type/build checks.
- Deploy all changed AI cloud functions, then invoke the AI endpoint and confirm an English request uses the English brand and succeeds.
- Check current build/runtime logs and report each prompt category migrated.

## Technical details
- The single registry will live in the cloud functions’ shared folder and be imported by frontend modules through a small path alias, avoiding duplicated prompt text.
- Existing feature components remain separate UI files; only their AI instruction text is centralized. Combining unrelated screens into one component would make the app harder to maintain without improving prompt review.
