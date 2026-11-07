import "../_runtime.mjs";
import { i as WP } from "./wp-schema-Dnlz0TVP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rel-meta-Ubi-lVVD.js
/**
* Opaque-code meta encoders / decoders for the two care-group membership
* relations. Every code below is read from the generated schema, which is built
* from the data dictionary — the ONLY source of truth. Nothing is hardcoded.
*
*  REL 223 — 199. Care Group → Users (Many to Many)
*    a55 care group's member display name          Text
*    a56 care group's member types                 Radio { nothing special | owner | admin }
*    a57 care group's member roles                 Radio { nothing special | cared one }
*    a58 care group's member invitation status      Radio { accepted | pending | declined }
*
*  REL 225 — 201. Care group's private member group → Users (Many to Many)
*    a55 private member group member types          Radio { nothing special | owner | admin }
*    (invitation status is deprecated by the dictionary — subgroup members are
*     always accepted, so nothing else is written here.)
*/
var R223 = WP.rel["223"];
var R225 = WP.rel["225"];
var F223 = {
	displayName: R223.f["CARE_GROUP_S_MEMBER_DISPLAY_NAME"],
	types: R223.f["CARE_GROUP_S_MEMBER_TYPES"],
	roles: R223.f["CARE_GROUP_S_MEMBER_ROLES"],
	status: R223.f["CARE_GROUP_S_MEMBER_INVITATION_STATUS"]
};
var F225 = { types: R225.f["CARE_GROUP_S_PRIVATE_MEMBER_GROUP_MEMBER_TYPES"] };
var TYPE_OPT = R223.opt["CARE_GROUP_S_MEMBER_TYPES"];
var ROLE_OPT = R223.opt["CARE_GROUP_S_MEMBER_ROLES"];
var STATUS_OPT = R223.opt["CARE_GROUP_S_MEMBER_INVITATION_STATUS"];
var SUB_TYPE_OPT = R225.opt["CARE_GROUP_S_PRIVATE_MEMBER_GROUP_MEMBER_TYPES"];
/** label → code, accepting a few friendly synonyms used across the UI. */
var MEMBER_TYPE_CODE = {
	"nothing special": TYPE_OPT["NOTHING_SPECIAL"],
	nothing: TYPE_OPT["NOTHING_SPECIAL"],
	member: TYPE_OPT["NOTHING_SPECIAL"],
	owner: TYPE_OPT["OWNER"],
	admin: TYPE_OPT["ADMIN"]
};
var MEMBER_TYPE_LABEL = {
	[TYPE_OPT["NOTHING_SPECIAL"]]: "nothing special",
	[TYPE_OPT["OWNER"]]: "owner",
	[TYPE_OPT["ADMIN"]]: "admin"
};
var MEMBER_ROLE_CODE = {
	"nothing special": ROLE_OPT["NOTHING_SPECIAL"],
	nothing: ROLE_OPT["NOTHING_SPECIAL"],
	"cared one": ROLE_OPT["CARED_ONE"],
	cared_one: ROLE_OPT["CARED_ONE"],
	"cared-one": ROLE_OPT["CARED_ONE"]
};
var MEMBER_ROLE_LABEL = {
	[ROLE_OPT["NOTHING_SPECIAL"]]: "nothing special",
	[ROLE_OPT["CARED_ONE"]]: "cared one"
};
var INVITATION_STATUS_CODE = {
	accepted: STATUS_OPT["ACCEPTED"],
	active: STATUS_OPT["ACCEPTED"],
	pending: STATUS_OPT["PENDING"],
	invited: STATUS_OPT["PENDING"],
	declined: STATUS_OPT["DECLINED"],
	rejected: STATUS_OPT["DECLINED"]
};
var INVITATION_STATUS_LABEL = {
	[STATUS_OPT["ACCEPTED"]]: "accepted",
	[STATUS_OPT["PENDING"]]: "pending",
	[STATUS_OPT["DECLINED"]]: "declined"
};
var SUB_TYPE_CODE = {
	"nothing special": SUB_TYPE_OPT["NOTHING_SPECIAL"],
	nothing: SUB_TYPE_OPT["NOTHING_SPECIAL"],
	member: SUB_TYPE_OPT["NOTHING_SPECIAL"],
	owner: SUB_TYPE_OPT["OWNER"],
	admin: SUB_TYPE_OPT["ADMIN"]
};
var SUB_TYPE_LABEL = {
	[SUB_TYPE_OPT["NOTHING_SPECIAL"]]: "nothing special",
	[SUB_TYPE_OPT["OWNER"]]: "owner",
	[SUB_TYPE_OPT["ADMIN"]]: "admin"
};
var TYPE_PRIORITY = [
	"owner",
	"admin",
	"nothing special"
];
var ROLE_PRIORITY = ["cared one", "nothing special"];
/**
* Meta values can come back as an array, a plain code, a comma list, or a
* PHP-serialized array (rows written before these fields became Radio).
* All shapes reduce to the list of `bNN` codes they contain.
*/
function parseCodes(value) {
	if (value == null) return [];
	if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
	const s = String(value).trim();
	if (!s) return [];
	if (/^a:\d+:\{/.test(s)) return Array.from(s.matchAll(/"(b\d+)"/g)).map((m) => m[1]);
	return s.split(",").map((x) => x.trim()).filter(Boolean);
}
function pickCode(value, map, priority, fallback) {
	const codes = parseCodes(value).map((v) => /^b\d+$/.test(v) ? v : map[v.toLowerCase()] || map[v] || "").filter((v) => /^b\d+$/.test(v));
	if (codes.length === 0) return fallback;
	for (const label of priority) {
		const wanted = map[label];
		if (wanted && codes.includes(wanted)) return wanted;
	}
	return codes[0];
}
/**
* Radio fields hold one value; decoding returns a one-element array so
* existing `.includes("owner")` call sites keep working. Legacy serialized
* rows may hold several codes — the highest-privilege one wins.
*/
function decodeSingle(value, labelMap, priority) {
	const codes = parseCodes(value);
	if (codes.length === 0) return [];
	for (const label of priority) {
		const code = Object.keys(labelMap).find((c) => labelMap[c] === label);
		if (code && codes.includes(code)) return [label];
	}
	return [labelMap[codes[0]] || codes[0]];
}
function pickLabel(value, labelMap, fallback) {
	const codes = parseCodes(value);
	if (codes.length === 0) return fallback;
	return labelMap[codes[0]] || codes[0];
}
function encodeRel72Meta(input = {}) {
	const type = pickCode(input.memberTypes, MEMBER_TYPE_CODE, TYPE_PRIORITY, TYPE_OPT["NOTHING_SPECIAL"]);
	const role = pickCode(input.memberRoles, MEMBER_ROLE_CODE, ROLE_PRIORITY, ROLE_OPT["NOTHING_SPECIAL"]);
	return {
		[F223.displayName]: input.displayName ?? "",
		[F223.types]: [type],
		[F223.roles]: [role],
		[F223.status]: INVITATION_STATUS_CODE[input.invitationStatus || "accepted"] || STATUS_OPT["ACCEPTED"]
	};
}
function decodeRel72Meta(meta) {
	const m = meta || {};
	return {
		displayName: m[F223.displayName] || "",
		memberTypes: decodeSingle(m[F223.types], MEMBER_TYPE_LABEL, TYPE_PRIORITY),
		memberRoles: decodeSingle(m[F223.roles], MEMBER_ROLE_LABEL, ROLE_PRIORITY),
		invitationStatus: pickLabel(m[F223.status], INVITATION_STATUS_LABEL, "accepted")
	};
}
function encodeRel75Meta(input = {}) {
	const type = pickCode(input.types, SUB_TYPE_CODE, TYPE_PRIORITY, SUB_TYPE_OPT["NOTHING_SPECIAL"]);
	return { [F225.types]: [type] };
}
function decodeRel75Meta(meta) {
	return { types: decodeSingle((meta || {})[F225.types], SUB_TYPE_LABEL, TYPE_PRIORITY) };
}
//#endregion
export { encodeRel75Meta as i, decodeRel75Meta as n, encodeRel72Meta as r, decodeRel72Meta as t };
