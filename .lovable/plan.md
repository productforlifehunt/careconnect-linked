# Stabilize branding and audit every interface

## Goal
Prevent any logo, sub-app identity, or homepage copy from changing incorrectly during normal use, then verify every registered route for both sub-apps on desktop and mobile.

## Work
1. **Reproduce and isolate the switching defect**
   - Test clean load, repeated reloads, language changes, navigation, query-string variants, and stored browser state.
   - Capture the rendered brand, homepage translation keys, console errors, and failed requests at each step.
   - Distinguish browser deployment cache from app-state, translation initialization, and site-detection defects.

2. **Make brand rendering deterministic**
   - Use one brand component and one resolved site identity across header, drawer, auth, homepage, and footer.
   - Prevent initial-language hydration from briefly rendering the wrong logo or untranslated homepage configuration.
   - Ensure unsupported or stale site overrides cannot bleed into normal URLs.

3. **Audit every route**
   - Enumerate all routes from the router; test public and authenticated views in both sub-apps.
   - Check desktop and mobile for logo/nav consistency, overflow, missing content, untranslated keys, placeholders/null data, contradictory labels/actions, loading/error/empty states, accessibility names, and tap targets.
   - Track each route as pass, fixed, blocked by unavailable data, or not applicable.

4. **Fix and verify**
   - Apply only reproducible frontend/UI fixes; do not alter the WordPress data model or invent fallback/mock content.
   - Re-test affected flows, inspect screenshots, and confirm the latest build/runtime/console/network signals.
   - Report the exact route count and remaining blockers; claim completion only when the full matrix passes.

## Technical details
- Brand is resolved from hostname and the explicit `__site` development override; language is a separate persisted preference.
- Test matrices: ChallengeD EN, 忆畅 ZH, CareCNC EN, 护畅 ZH; desktop 1280px and mobile 390px.
- Protected checks use only the already-approved project test account and never change credentials.
