import "../_runtime.mjs";
import { i as WP, n as R } from "./wp-schema-Dnlz0TVP.mjs";
import { t as decodeRel219Status } from "./rel219-meta-CiKakwJu.mjs";
import { n as FAMILY_VOICE_STATE, t as FAMILY_VOICE_CCT } from "./schema-C7za4mA0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store.server-LsTp-Uay.js
var BASE = "https://app.challenged-dementia.com/afresh/wp-json";
async function verifiedActor(token) {
	if (!token) throw new Error("Please sign in. / 请先登录。");
	const res = await fetch(`${BASE}/wp/v2/users/me?context=edit`, { headers: { Authorization: `Bearer ${token}` } });
	if (!res.ok) throw new Error("Session could not be verified. / 无法验证登录状态。");
	const user = await res.json();
	if (!user.id) throw new Error("Invalid WordPress identity");
	return {
		id: String(user.id),
		name: user.name || ""
	};
}
function wordpressStore(user, password) {
	if (!user || !password) throw new Error("Voice storage is not configured");
	const auth = `Basic ${btoa(`${user}:${password}`)}`;
	const request = async (path, method = "GET", body) => {
		const res = await fetch(`${BASE}/${path}`, {
			method,
			headers: {
				Authorization: auth,
				"Content-Type": "application/json"
			},
			...body === void 0 ? {} : { body: JSON.stringify(body) }
		});
		if (!res.ok) {
			const detail = await res.json().catch(() => ({}));
			throw new Error(`Voice storage failed [${res.status}] ${detail.message || detail.code || ""}`);
		}
		return res.json();
	};
	const relations = async (relation, side, id) => {
		const result = await request(`jet-rel/${relation}/${side}/${id}`);
		if (!Array.isArray(result)) throw new Error("Voice relationships could not be read");
		return result;
	};
	const access = async (actor, person) => {
		if (actor === person) return;
		if (!(await relations(R.userCaredOnes, "children", actor)).some((r) => String(r.child_object_id) === person && decodeRel219Status(r.meta) === "accepted")) throw new Error("No access to this person's voices. / 无权访问此人的亲友声音。");
	};
	const get = async (id) => await request(`jet-cct/${FAMILY_VOICE_CCT.slug}/${id}`);
	const owned = async (actor, id, person) => {
		const links = await relations(323, "parents", id);
		if (links.length !== 1) throw new Error("Voice has no unique cared-one relationship");
		const owner = String(links[0]?.parent_object_id || "");
		if (person && person !== owner) throw new Error("Voice belongs to a different cared one");
		await access(actor, owner);
		return {
			row: await get(id),
			person: owner
		};
	};
	const map = (row, person, name = "") => ({
		id: String(row._ID),
		voiceId: String(row[FAMILY_VOICE_CCT.fields.voiceId] || ""),
		label: String(row[FAMILY_VOICE_CCT.fields.label] || ""),
		model: String(row[FAMILY_VOICE_CCT.fields.model] || ""),
		state: String(row[FAMILY_VOICE_CCT.fields.state] || FAMILY_VOICE_STATE.pending),
		error: String(row[FAMILY_VOICE_CCT.fields.error] || ""),
		audioSaved: !!row[FAMILY_VOICE_CCT.fields.audioPath],
		caredOneId: person,
		caredOneName: name,
		createdAt: String(row.cct_created || "").replace(" ", "T")
	});
	const list = async (actor, person) => {
		const people = person ? [person] : [actor, ...(await relations(R.userCaredOnes, "children", actor)).filter((r) => decodeRel219Status(r.meta) === "accepted").map((r) => String(r.child_object_id))];
		return (await Promise.all([...new Set(people)].map(async (p) => {
			await access(actor, p);
			const links = await relations(323, "children", p);
			let name = "";
			const profileLinks = await relations(152, "children", p);
			const profileId = String(profileLinks[0]?.child_object_id || "");
			if (profileId) {
				const profile = await request(`jet-cct/${WP.cct["151"].slug}/${profileId}`);
				name = String(profile[WP.cct["151"].f["USER_NAME_FOR_CHALLENGED"] || ""] || "");
			}
			return Promise.all(links.map(async (r) => map(await get(String(r.child_object_id)), p, name)));
		}))).flat();
	};
	const update = (id, body) => request(`jet-cct/${FAMILY_VOICE_CCT.slug}/${id}`, "POST", body);
	const create = async (actor, person, body) => {
		await access(actor, person);
		const result = await request(`jet-cct/${FAMILY_VOICE_CCT.slug}`, "POST", {
			...body,
			cct_author_id: actor,
			cct_status: "publish"
		});
		const id = String(typeof result === "number" || typeof result === "string" ? result : result?._ID || result?.item_id || "");
		if (!/^\d+$/.test(id)) throw new Error("Voice record ID was not returned");
		await request(`jet-rel/323`, "POST", {
			parent_id: Number(person),
			child_id: Number(id),
			context: "child",
			store_items_type: "update"
		});
		await owned(actor, id, person);
		return id;
	};
	const remove = async (person, id) => {
		await request(`jet-cct/${FAMILY_VOICE_CCT.slug}/${id}`, "DELETE");
		await request(`jet-rel/323`, "POST", {
			parent_id: Number(person),
			child_id: Number(id),
			context: "child",
			store_items_type: "disconnect"
		});
	};
	return {
		request,
		relations,
		access,
		get,
		owned,
		map,
		list,
		update,
		create,
		remove
	};
}
//#endregion
export { verifiedActor, wordpressStore };
