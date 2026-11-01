---
name: draftbit-classic-gui
description: Build or change the CareConnect backup app in Draftbit Classic (build.draftbit.com) purely through the visual builder with browser automation — no Draftbit AI, no code. Use when asked to add screens, data, logins or buttons to the Draftbit backup app.
---

# Draftbit Classic GUI builder (no AI, no code)

## When to use which Draftbit
- Draftbit **Classic** (build.draftbit.com) has a visual Action editor, Variables and Fetch/List data binding. Use it for anything with logic (login, API calls, buttons that do things).
- Draftbit **Next** (next.draftbit.com) has no visual action/variable editor (official docs: guides/adding-logic-and-state). Without its AI or the paid code editor it can only lay out screens. Do not promise logic there.
- Free Classic plan: max 2 apps; source-code view is paid. Never delete an app without the user's explicit OK.

## Browser setup
- Keep one long-lived Chromium with remote debugging on localhost:9333 and attach with `connect_over_cdp`; each step is a small script `async def run(pg, c)`.
- Draftbit overlays swallow normal Playwright clicks. Find the element's bounding box and use `page.mouse.click(x, y)`.
- Selects are react-select: click the box, type, read options from `[id*=option]`, click the exact option. Prefer an option whose text equals the wanted value; avoid `String: "…"` and `.keypath` look-alikes.
- The "↕" icon next to a property opens a static-value dialog (Text / JSON mode). Use JSON mode for booleans (`true`) and empty strings (`""`).
- Device-variable rows are read-only until the pencil is clicked; save with `[data-cy=SaveGlobalVariable]`.

## WordPress service
- REST service "WordPress Afresh", base `https://app.challenged-dementia.com/afresh/wp-json`; service header `Authorization` = Device Variable `AUTH_TOKEN`.
- Login endpoint: POST `/simple-jwt-login/v1/auth`, body `{"username": {{username}}, "password": {{password}}}`.
- Data endpoints read JetEngine relations then the row: `jet-rel/<REL>/parents|children/{{id}}` → `jet-cct/<slug>/{{id}}` or `wp/v2/users/{{id}}`. Relation numbers and field codes come only from the project data dictionary.
- Endpoints must be tested before saving. Test values become component defaults, so after testing clear any password test value and save with **Skip Test**. Clear temporary `AUTH_TOKEN` / `USER_ID` development values afterwards.

## Login workflow (button On Press)
API Request (Login, body from the two text inputs, result `loginResponse`) → Extract Key `.data.jwt` → `jwt` → Set Variable `AUTH_TOKEN` = `jwt` with transform `AddBearerPrefix` → Navigate Home (condition `jwt`).

## Relation-backed list pattern
Fetch (links endpoint, id = `USER_ID`) → List (data = Top-level response, key = `.parent_object_id` or `.child_object_id`) → inner Fetch (row endpoint, id = list item key) → Text with `{{var}}` bound to a field such as `.a55`.
- Classic conditional display only offers "exists / doesn't exist"; filtering by a code value (e.g. accepted status) needs a custom function, which is code. Report that instead of hiding it.

## Verifying
- The globe icon is Web Preview; it starts on the screen currently selected in the left list. Select Login first for a full flow, type with the keyboard at the input coordinates, and screenshot after each step.
