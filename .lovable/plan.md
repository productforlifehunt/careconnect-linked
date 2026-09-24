# ESM survey complete Chinese/English interface

## What will change
- Add a compact Chinese/English switch in the top-right, immediately left of the participant name.
- Replace the profile icon-only area with the saved participant name; use a neutral “Me / 我” fallback before a name is saved.
- Translate every visible ESM screen, action, status, message, toast, field placeholder, voice control, People editor, survey title, section title, question, help text, option, and scale label.
- Keep English mode entirely English and Chinese mode entirely Chinese, including dates and generated status sentences.
- Remove all displayed research numbering and internal codes from survey headings, questions, validation messages, People details, and entry metadata.
- Replace research-facing terms with participant-friendly names, including “Log hourly care event” and “Log daily care summary.”

## Behaviour
- Language choice persists on the device and follows the app’s existing language setting.
- Switching language updates the current screen immediately without changing answers or navigation state.
- Stored answer values, CCT columns, Relation IDs, CCT/Relation numbers, WordPress data structures, and submission payloads remain unchanged.

## Verification
- Check every ESM route in both English and Chinese.
- Search the rendered Chinese screens for leftover English and visible internal identifiers.
- Verify the saved name appears in the header and both language options work on desktop and mobile.
- Verify survey choices still save the same underlying values after labels are translated.
