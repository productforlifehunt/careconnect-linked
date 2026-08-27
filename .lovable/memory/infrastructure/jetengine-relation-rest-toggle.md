---
name: JetEngine Relation REST Toggles
description: jet-rel 404s mean a GUI switch is OFF — there are TWO separate REST toggles (get vs update); fix in WP GUI, never duplicate the relation
type: feature
---

A `jet-rel/<id>` 404 NEVER means the relation is missing. The Bible relation exists (99% Rule). It means a switch is OFF in JetEngine → Relations → Edit Relation.

There are **TWO INDEPENDENT REST toggles** per relation:

1. **"Register get items/item REST API Endpoint"** — controls `GET /wp-json/jet-rel/<id>` (reads: `/children/<id>`, `/parents/<id>`).
2. **"Register update REST API Endpoint"** — controls `POST /wp-json/jet-rel/<id>` (writes: attach/detach related items).

A relation can GET 200 and POST 404 at the same time. If a create/link operation fails with `rest_no_route` while reads work, it is toggle #2 that is off.

Also relevant: **"Register separate DB table"** must be on for the relation's own join table.

## 90-mode fix procedure (browser automation)

- URL: `<site>/wp-admin/admin.php?page=jet-engine-relations&cpt_relation_action=edit&id=<REL_ID>`
- Wait ~9s for the Vue app to hydrate.
- Locate the row: `.cx-vui-component` filtered by text `Register update REST API Endpoint`.
- Read state from `.cx-vui-switcher` class: `cx-vui-switcher--on` / `--off`.
- Click `.cx-vui-switcher__trigger` inside it to flip.
- Save: `#wpbody-content button` whose exact inner text is `Update Relation`. Match by exact string comparison — a regex `has_text` filter does NOT match this button, and flipping the switch without clicking Update Relation silently discards the change.
- Re-open the page and re-read the switcher class to verify persistence, then probe the endpoint.

## Verified state (this project)

All 83 relations referenced in `src/integrations/wp-schema.ts` return 200 on both GET and POST after enabling "Register update REST API Endpoint" on REL 260, 261, 262, 263.
