import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { i as WP } from "./wp-schema-Dnlz0TVP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rel219-meta-CiKakwJu.js
/**
* Relation 219 — "One user can have many related cared ones" (Users → Users,
* Many to Many). Parent = the caregiver, child = the cared one.
*
* The relation carries exactly one custom field per the data dictionary:
*   a58  cared one invitation status   Radio { accepted b55 | pending b56 | declined b57 }
*
* Codes are read from the generated schema, never hardcoded here.
*/
var rel219_meta_exports = /* @__PURE__ */ __exportAll({
	REL219_STATUS_CODE: () => REL219_STATUS_CODE,
	REL219_STATUS_FIELD: () => REL219_STATUS_FIELD,
	decodeRel219Status: () => decodeRel219Status,
	encodeRel219Meta: () => encodeRel219Meta
});
var R219 = WP.rel["219"];
var REL219_STATUS_FIELD = R219.f["CARED_ONE_INVITATION_STATUS"];
var OPT = R219.opt["CARED_ONE_INVITATION_STATUS"];
var REL219_STATUS_CODE = {
	accepted: OPT["ACCEPTED"],
	pending: OPT["PENDING"],
	declined: OPT["DECLINED"]
};
var LABEL = {
	[OPT["ACCEPTED"]]: "accepted",
	[OPT["PENDING"]]: "pending",
	[OPT["DECLINED"]]: "declined"
};
/** Meta payload for a link/update on Relation 219. */
function encodeRel219Meta(status) {
	return { [REL219_STATUS_FIELD]: REL219_STATUS_CODE[status] };
}
/**
* Meta comes back as a bare code, an array, a comma list, or a PHP-serialized
* array on rows written before the field existed. Rows with nothing stored are
* historical links made before the consent field was added — they are treated
* as accepted so nobody loses an existing connection.
*/
function decodeRel219Status(meta) {
	const raw = meta?.[REL219_STATUS_FIELD];
	if (raw == null) return "accepted";
	const s = Array.isArray(raw) ? raw.map(String).join(",") : String(raw);
	const codes = /^a:\d+:\{/.test(s.trim()) ? Array.from(s.matchAll(/"(b\d+)"/g)).map((m) => m[1]) : s.split(",").map((x) => x.trim()).filter(Boolean);
	for (const c of codes) if (LABEL[c]) return LABEL[c];
	return "accepted";
}
//#endregion
export { encodeRel219Meta as n, rel219_meta_exports as r, decodeRel219Status as t };
