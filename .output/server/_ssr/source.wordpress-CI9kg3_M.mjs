import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { i as getStoredWPUser } from "./wp-auth-DL1jfVY7.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch, r as stripHtml } from "./wordpress-client-b834cpZh.mjs";
import { n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
import { d as linkOwnRow, m as saveMyAppUserName, s as fetchMyAppUserName, u as findOwnRow } from "./app-profile-DeZHIfiB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/source.wordpress-CI9kg3_M.js
/** a68 — "Care provider offers care service type" (14 options, b55…b68). */
var CARE_SERVICE_TYPES = [
	{
		id: "b55",
		slug: "pet-care-and-companion",
		en: "Pet Care & Companion",
		zh: "宠物照护与陪伴"
	},
	{
		id: "b56",
		slug: "in-person-child-care-and-companion",
		en: "Child Care & Companion (In Person)",
		zh: "上门儿童照护与陪伴",
		delivery: "in-person"
	},
	{
		id: "b57",
		slug: "remote-child-companion",
		en: "Child Companion (Remote)",
		zh: "远程儿童陪伴",
		delivery: "remote"
	},
	{
		id: "b58",
		slug: "adult-care-and-companion",
		en: "Adult Care & Companion",
		zh: "成人照护与陪伴"
	},
	{
		id: "b59",
		slug: "adult-remote-companion",
		en: "Adult Companion (Remote)",
		zh: "远程成人陪伴",
		delivery: "remote"
	},
	{
		id: "b60",
		slug: "in-person-elderly-care-and-companion",
		en: "Elderly Care & Companion (In Person)",
		zh: "上门长者照护与陪伴",
		delivery: "in-person"
	},
	{
		id: "b61",
		slug: "remote-elderly-companion",
		en: "Elderly Companion (Remote)",
		zh: "远程长者陪伴",
		delivery: "remote"
	},
	{
		id: "b62",
		slug: "housekeeping",
		en: "Housekeeping",
		zh: "家务整理"
	},
	{
		id: "b63",
		slug: "errand-and-delivery",
		en: "Errands & Delivery",
		zh: "跑腿与代购"
	},
	{
		id: "b64",
		slug: "transportation",
		en: "Transportation",
		zh: "接送出行"
	},
	{
		id: "b65",
		slug: "medical-escort",
		en: "Medical Escort",
		zh: "陪同就医"
	},
	{
		id: "b66",
		slug: "in-person-checkin",
		en: "Check-in Visit (In Person)",
		zh: "上门探访签到",
		delivery: "in-person"
	},
	{
		id: "b67",
		slug: "remote-checkin",
		en: "Check-in Call (Remote)",
		zh: "远程电话签到",
		delivery: "remote"
	},
	{
		id: "b68",
		slug: "remote-medicine-supervision",
		en: "Medication Reminder (Remote)",
		zh: "远程用药提醒",
		delivery: "remote"
	}
];
/** a65 — "Care provider offers service type" (delivery mode). */
var SERVICE_DELIVERY_MODES = [{
	id: "b55",
	slug: "in-person",
	en: "In-Person",
	zh: "上门"
}, {
	id: "b56",
	slug: "remote",
	en: "Remote",
	zh: "远程"
}];
var BY_ID = new Map(CARE_SERVICE_TYPES.map((s) => [s.id, s]));
var BY_SLUG = new Map(CARE_SERVICE_TYPES.map((s) => [s.slug, s]));
var DELIVERY_BY_ID = new Map(SERVICE_DELIVERY_MODES.map((s) => [s.id, s]));
function careServiceTypeLabel(idOrSlug, zh) {
	const hit = BY_ID.get(String(idOrSlug)) || BY_SLUG.get(String(idOrSlug).toLowerCase());
	return hit ? zh ? hit.zh : hit.en : String(idOrSlug);
}
function deliveryModeLabel(idOrSlug, zh) {
	const hit = DELIVERY_BY_ID.get(String(idOrSlug)) || SERVICE_DELIVERY_MODES.find((m) => m.slug === String(idOrSlug).toLowerCase());
	return hit ? zh ? hit.zh : hit.en : String(idOrSlug);
}
/** Convert stored a68 checkbox values (option ids) into filter slugs. */
function careServiceIdsToSlugs(ids) {
	return toIdList(ids).map((id) => BY_ID.get(id)?.slug).filter(Boolean);
}
/** Convert stored a65 checkbox values into delivery slugs. */
function deliveryIdsToSlugs(ids) {
	return toIdList(ids).map((id) => DELIVERY_BY_ID.get(id)?.slug).filter(Boolean);
}
/** Convert filter slugs back into a68 checkbox option ids. */
function careServiceSlugsToIds(slugs) {
	return (slugs || []).map((slug) => BY_SLUG.get(String(slug).toLowerCase())?.id).filter(Boolean);
}
/** Convert delivery slugs back into a65 checkbox option ids. */
function deliverySlugsToIds(slugs) {
	return (slugs || []).map((slug) => SERVICE_DELIVERY_MODES.find((m) => m.slug === String(slug).toLowerCase())?.id).filter(Boolean);
}
/** JetEngine checkbox values arrive as array, JSON string, or comma list. */
function toIdList(value) {
	if (Array.isArray(value)) return value.map(String).filter(Boolean);
	if (typeof value === "string" && value.trim()) {
		try {
			const parsed = JSON.parse(value);
			if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
			if (parsed && typeof parsed === "object") return Object.entries(parsed).filter(([, v]) => v === true || v === 1 || v === "1").map(([k]) => k);
		} catch {}
		return value.split(",").map((s) => s.trim()).filter(Boolean);
	}
	if (value && typeof value === "object") return Object.entries(value).filter(([, v]) => v === true || v === 1 || v === "1").map(([k]) => k);
	return [];
}
function mapDokanStoreToProfile(store) {
	const addr = store.address;
	const addrStr = addr ? [
		addr.street_1,
		addr.city,
		addr.state
	].filter(Boolean).join(", ") : null;
	return {
		id: String(store.id),
		user_id: `wp-${store.id}`,
		email: store.email || null,
		first_name: store.store_name?.split(" ")[0] || store.first_name || null,
		last_name: store.store_name?.split(" ").slice(1).join(" ") || null,
		full_name: store.store_name || store.first_name || "Provider",
		user_name: null,
		avatar_url: store.gravatar || null,
		bio: store.description || null,
		general_user_role: ["caring one"],
		is_care_provider: true,
		provider_is_active: true,
		care_provider_is_background_checked: false,
		care_provider_background_check_detail: null,
		care_provider_starts_hourly_rate: null,
		phone: null,
		location: addr?.city || addrStr || null,
		years_of_experience: null,
		certifications: null,
		specialty: [],
		rating_average: store.rating?.rating != null ? parseFloat(String(store.rating.rating)) || null : null,
		rating_count: store.rating?.count != null ? parseInt(String(store.rating.count), 10) || 0 : 0,
		created_at: (/* @__PURE__ */ new Date()).toISOString(),
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function mapWooOrderToBooking(order) {
	let status = order.status;
	if (status === "processing") status = "confirmed";
	else if (status === "on-hold") status = "pending";
	return {
		id: String(order.id),
		user_id: "",
		provider_id: "",
		care_recipient_id: null,
		start_time: null,
		end_time: null,
		appointment_date: order.date_created,
		appointment_time: null,
		duration_hour: null,
		service_type: order.line_items?.[0]?.name || "Service",
		hourly_rate: null,
		total_cost: order.total ? parseFloat(order.total) : null,
		status,
		payment_status: order.status === "completed" ? "paid" : "pending",
		payment_intent_id: null,
		location: null,
		special_instruction: null,
		check_in_time: null,
		check_out_time: null,
		created_at: order.date_created,
		updated_at: order.date_created,
		provider: { full_name: "Provider" }
	};
}
function mapWPUserToProfile(user) {
	return {
		id: `wp-${user.id}`,
		user_id: `wp-${user.id}`,
		email: user.email || null,
		first_name: user.first_name || null,
		last_name: user.last_name || null,
		full_name: "",
		user_name: user.slug || null,
		avatar_url: user.avatar_urls?.["96"] || user.avatar_urls?.["48"] || null,
		bio: user.description || null,
		general_user_role: null,
		is_care_provider: false,
		provider_is_active: false,
		care_provider_is_background_checked: false,
		care_provider_background_check_detail: null,
		care_provider_starts_hourly_rate: null,
		phone: null,
		location: null,
		years_of_experience: null,
		certifications: null,
		specialty: null,
		rating_average: null,
		rating_count: null,
		created_at: (/* @__PURE__ */ new Date()).toISOString(),
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	};
}
function mapWPPostToArticle(post) {
	return {
		id: String(post.id),
		title: post.title?.rendered || "",
		content: post.content?.rendered || "",
		excerpt: stripHtml(post.excerpt?.rendered),
		slug: post.slug,
		author_name: post._embedded?.author?.[0]?.name || "Author",
		author_avatar: post._embedded?.author?.[0]?.avatar_urls?.["48"] || null,
		featured_image: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
		created_at: post.date,
		updated_at: post.modified,
		comment_count: 0,
		vote_count: 0,
		categories: (post._embedded?.["wp:term"]?.[0] || []).map((t) => t.name)
	};
}
function mapGenericWPPost(post, args) {
	return {
		id: String(post.id),
		post_type_id: null,
		post_type: args?.["postType"] || post.type || "post",
		title: post.title?.rendered || null,
		slug: post.slug || null,
		content: stripHtml(post.content?.rendered) || null,
		excerpt: stripHtml(post.excerpt?.rendered) || null,
		status: post.status || "publish",
		featured_image_url: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
		hunter_id: post.author ? String(post.author) : null,
		author_id: post.author ? String(post.author) : null,
		created_at: post.date,
		updated_at: post.modified
	};
}
var wordpressSchema = {
	providers: {
		status: "confirmed",
		endpoint: "dokan/v1/stores",
		defaultParams: { per_page: 50 },
		mapList: (stores) => Array.isArray(stores) ? stores.map(mapDokanStoreToProfile) : []
	},
	provider: {
		status: "confirmed",
		endpoint: ({ id }) => `dokan/v1/stores/${String(id).replace("wp-", "")}`,
		mapDetail: (store) => mapDokanStoreToProfile(store)
	},
	bookings: {
		status: "confirmed",
		endpoint: "wc/v3/orders",
		defaultParams: { per_page: 50 },
		mapList: (orders) => Array.isArray(orders) ? orders.map(mapWooOrderToBooking) : []
	},
	booking: {
		status: "confirmed",
		endpoint: ({ id }) => `wc/v3/orders/${id}`,
		mapDetail: (order) => mapWooOrderToBooking(order),
		buildCreateBody: (booking) => ({
			status: "pending",
			line_items: [{
				name: booking.service_type || "Care Service",
				quantity: 1,
				total: booking.total_cost ? String(booking.total_cost) : "0"
			}]
		}),
		buildUpdateBody: ({ status }) => {
			let wcStatus = status;
			if (status === "confirmed") wcStatus = "processing";
			else if (status === "pending") wcStatus = "on-hold";
			return { status: wcStatus };
		}
	},
	profile_me: {
		status: "confirmed",
		endpoint: "wp/v2/users/me",
		defaultParams: { context: "edit" },
		mapDetail: (user) => mapWPUserToProfile(user),
		buildUpdateBody: (updates) => {
			const body = {};
			if (updates.first_name !== void 0) body["first_name"] = updates.first_name;
			if (updates.last_name !== void 0) body["last_name"] = updates.last_name;
			if (updates.full_name !== void 0) body["name"] = updates.full_name;
			if (updates.bio !== void 0) body["description"] = updates.bio;
			return body;
		}
	},
	wp_user: {
		status: "confirmed",
		endpoint: ({ id }) => `wp/v2/users/${id}`,
		mapDetail: (user) => ({
			id: `wp-${user.id}`,
			full_name: user.name || "User",
			avatar_url: user.avatar_urls?.["48"] || user.avatar_urls?.["96"] || null,
			email: null
		})
	},
	articles: {
		status: "confirmed",
		endpoint: "wp/v2/posts",
		defaultParams: {
			per_page: 20,
			_embed: 1
		},
		mapList: (posts) => Array.isArray(posts) ? posts.map(mapWPPostToArticle) : []
	},
	article: {
		status: "confirmed",
		endpoint: ({ id }) => `wp/v2/posts/${id}`,
		defaultParams: { _embed: 1 },
		mapDetail: (post) => mapWPPostToArticle(post)
	},
	generic_posts: {
		status: "confirmed",
		endpoint: ({ postType }) => `wp/v2/${postType && postType !== "post" ? postType : "posts"}`,
		defaultParams: {
			per_page: 50,
			_embed: 1
		},
		mapList: (items, args) => Array.isArray(items) ? items.map((item) => mapGenericWPPost(item, args)) : [],
		buildCreateBody: (post) => ({
			title: post.title,
			content: post.content || "",
			status: post.status || "publish"
		})
	},
	generic_post: {
		status: "confirmed",
		endpoint: ({ id, postType }) => `wp/v2/${postType && postType !== "post" ? postType : "posts"}/${id}`,
		defaultParams: { _embed: 1 },
		mapDetail: (item, args) => mapGenericWPPost(item, args),
		buildUpdateBody: (updates) => {
			const body = {};
			if (updates.title !== void 0) body["title"] = updates.title;
			if (updates.content !== void 0) body["content"] = updates.content;
			if (updates.status !== void 0) body["status"] = updates.status;
			return body;
		}
	},
	categories: {
		status: "confirmed",
		endpoint: ({ taxonomy }) => {
			if (taxonomy === "post" || taxonomy === "categories") return "wp/v2/categories";
			return "wc/store/v1/products/categories";
		},
		defaultParams: { per_page: 100 },
		mapList: (cats) => Array.isArray(cats) ? cats.map((c) => ({
			id: String(c.id),
			name: c.name || "",
			slug: c.slug || "",
			description: c.description || null,
			count: c.count ?? 0,
			parent_id: c.parent ? String(c.parent) : null
		})) : []
	}
};
function resolveEndpoint(feature, args) {
	const entry = wordpressSchema[feature];
	return typeof entry.endpoint === "function" ? entry.endpoint(args ?? {}) : entry.endpoint;
}
function mergeParams(feature, params) {
	return {
		...wordpressSchema[feature].defaultParams || {},
		...params || {}
	};
}
function castResult(value) {
	return value;
}
async function getWordPressFeature(feature, args) {
	const entry = wordpressSchema[feature];
	const response = await wordpressFetch(resolveEndpoint(feature, args?.endpointArgs), { params: mergeParams(feature, args?.params) });
	return castResult(entry.mapDetail ? entry.mapDetail(response, args?.endpointArgs) : response);
}
async function updateWordPressFeature(feature, input, args) {
	const entry = wordpressSchema[feature];
	const endpoint = resolveEndpoint(feature, args?.endpointArgs);
	const body = entry.buildUpdateBody ? entry.buildUpdateBody(input, args?.endpointArgs) : input;
	const response = await wordpressFetch(endpoint, {
		method: args?.method || "POST",
		params: args?.params,
		body
	});
	return castResult(entry.mapDetail ? entry.mapDetail(response, args?.endpointArgs) : response);
}
var source_wordpress_exports = /* @__PURE__ */ __exportAll({
	fetchMyProfileWordPress: () => fetchMyProfileWordPress,
	updateProfileWordPress: () => updateProfileWordPress
});
var P2 = T.userProfile2;
var F = P2.f;
var CCT_SLUG = P2.slug;
var ROLE_OPT_TO_LABEL = {
	b55: "cared one",
	b56: "caring one"
};
var ROLE_LABEL_TO_OPT = {
	"cared one": "b55",
	"caring one": "b56"
};
var YES = "b55";
var NO = "b56";
var yesNoToBool = (v) => v === YES || v === true || v === 1 || v === "1" || v === "yes";
var boolToYesNo = (v) => v ? YES : NO;
function parseCheckboxList(v) {
	if (Array.isArray(v)) return v.map((x) => ROLE_OPT_TO_LABEL[String(x)] ?? String(x)).filter(Boolean);
	if (typeof v === "string" && v.trim()) {
		try {
			const parsed = JSON.parse(v);
			if (Array.isArray(parsed)) return parsed.map((x) => ROLE_OPT_TO_LABEL[String(x)] ?? String(x)).filter(Boolean);
		} catch {}
		return v.split(",").map((s) => ROLE_OPT_TO_LABEL[s.trim()] ?? s.trim()).filter(Boolean);
	}
	return null;
}
function serializeRoleList(roles) {
	if (!roles || !Array.isArray(roles)) return "";
	return JSON.stringify(roles.map((r) => ROLE_LABEL_TO_OPT[r] ?? r));
}
async function fetchMyProfileWordPress() {
	try {
		const [wpProfile, appName, cct] = await Promise.all([
			getWordPressFeature("profile_me"),
			fetchMyAppUserName(),
			findOwnRow(R.userProfile2Rel, CCT_SLUG)
		]);
		if (!wpProfile) return null;
		wpProfile.full_name = appName;
		if (cct) {
			wpProfile.general_user_role = parseCheckboxList(cct[F.GENERAL_USER_ROLE]) || wpProfile.general_user_role;
			wpProfile.is_care_provider = yesNoToBool(cct[F.IS_PAID_CARE_PROVIDER]);
			wpProfile.provider_is_active = yesNoToBool(cct[F.CARE_PROVIDER_IS_ACTIVE]);
			wpProfile.care_provider_is_background_checked = yesNoToBool(cct[F.CARE_PROVIDER_IS_BACKGROUND_CHECKED]);
			wpProfile.care_provider_background_check_detail = cct[F.CARE_PROVIDER_S_BACKGROUND_CHECK_DETAIL] || wpProfile.care_provider_background_check_detail;
			{
				const rate = cct[F.CARE_PROVIDER_S_HOURLY_RATE_FOR_IN_PERSON_SERVICE];
				wpProfile.care_provider_starts_hourly_rate = rate != null && rate !== "" ? parseFloat(rate) : wpProfile.care_provider_starts_hourly_rate;
			}
			wpProfile.service_location_slugs = deliveryIdsToSlugs(cct[F.CARE_PROVIDER_OFFERS_SERVICE_TYPE]);
			wpProfile.service_type_slugs = careServiceIdsToSlugs(cct[F.CARE_PROVIDER_OFFERS_CARE_SERVICE_TYPE]);
			const num = (v) => v != null && v !== "" && Number.isFinite(parseFloat(v)) ? parseFloat(v) : null;
			wpProfile.care_provider_hourly_rate_in_person = num(cct[F.CARE_PROVIDER_S_HOURLY_RATE_FOR_IN_PERSON_SERVICE]);
			wpProfile.care_provider_hourly_rate_remote = num(cct[F.CARE_PROVIDER_S_HOURLY_RATE_FOR_REMOTE_SERVICE]);
			wpProfile.care_provider_rate_remote_checkin = num(cct[F.CARE_PROVIDER_S_RATE_FOR_REMOTE_CHECKINS]);
			wpProfile.care_provider_rate_remote_medicine = num(cct[F.CARE_PROVIDER_S_RATE_FOR_REMOTE_MEDICINE_SUPERVISION]);
			wpProfile.care_provider_cancellation_policy = cct[F.CARE_PROVIDER_S_CANCELLATION_POLICY] || null;
			wpProfile.location = cct[F.CARE_PROVIDER_S_LOCATION] || wpProfile.location;
		}
		return wpProfile;
	} catch (error) {
		throw error;
	}
}
async function updateProfileWordPress(updates) {
	const wpFields = {};
	if (updates.first_name !== void 0) wpFields.first_name = updates.first_name;
	if (updates.last_name !== void 0) wpFields.last_name = updates.last_name;
	if (updates.bio !== void 0) wpFields.bio = updates.bio;
	if (Object.keys(wpFields).length > 0) await updateWordPressFeature("profile_me", wpFields);
	if (updates.full_name !== void 0) await saveMyAppUserName(updates.full_name ?? "");
	const body = {};
	if (updates.general_user_role !== void 0) body[F.GENERAL_USER_ROLE] = serializeRoleList(updates.general_user_role);
	if (updates.is_care_provider !== void 0) body[F.IS_PAID_CARE_PROVIDER] = boolToYesNo(updates.is_care_provider);
	if (updates.provider_is_active !== void 0) body[F.CARE_PROVIDER_IS_ACTIVE] = boolToYesNo(updates.provider_is_active);
	if (updates.care_provider_is_background_checked !== void 0) body[F.CARE_PROVIDER_IS_BACKGROUND_CHECKED] = boolToYesNo(updates.care_provider_is_background_checked);
	if (updates.care_provider_background_check_detail !== void 0) body[F.CARE_PROVIDER_S_BACKGROUND_CHECK_DETAIL] = updates.care_provider_background_check_detail;
	if (updates.care_provider_starts_hourly_rate !== void 0) body[F.CARE_PROVIDER_S_HOURLY_RATE_FOR_IN_PERSON_SERVICE] = String(updates.care_provider_starts_hourly_rate ?? "");
	if (updates.location !== void 0) body[F.CARE_PROVIDER_S_LOCATION] = updates.location ?? "";
	if (updates.service_location_slugs !== void 0) body[F.CARE_PROVIDER_OFFERS_SERVICE_TYPE] = deliverySlugsToIds(updates.service_location_slugs);
	if (updates.service_type_slugs !== void 0) body[F.CARE_PROVIDER_OFFERS_CARE_SERVICE_TYPE] = careServiceSlugsToIds(updates.service_type_slugs);
	const rate = (v) => v == null || Number.isNaN(v) ? "" : String(v);
	if (updates.care_provider_hourly_rate_in_person !== void 0) body[F.CARE_PROVIDER_S_HOURLY_RATE_FOR_IN_PERSON_SERVICE] = rate(updates.care_provider_hourly_rate_in_person);
	if (updates.care_provider_hourly_rate_remote !== void 0) body[F.CARE_PROVIDER_S_HOURLY_RATE_FOR_REMOTE_SERVICE] = rate(updates.care_provider_hourly_rate_remote);
	if (updates.care_provider_rate_remote_checkin !== void 0) body[F.CARE_PROVIDER_S_RATE_FOR_REMOTE_CHECKINS] = rate(updates.care_provider_rate_remote_checkin);
	if (updates.care_provider_rate_remote_medicine !== void 0) body[F.CARE_PROVIDER_S_RATE_FOR_REMOTE_MEDICINE_SUPERVISION] = rate(updates.care_provider_rate_remote_medicine);
	if (updates.care_provider_cancellation_policy !== void 0) body[F.CARE_PROVIDER_S_CANCELLATION_POLICY] = updates.care_provider_cancellation_policy ?? "";
	if (updates.is_care_provider === true) (async () => {
		try {
			const { ensureDokanVendor } = await import("../_libs/_5.mjs").then((n) => n.x);
			const stored = getStoredWPUser();
			await ensureDokanVendor({
				fullName: updates.full_name || await fetchMyAppUserName(),
				email: stored?.user_email || "",
				phone: updates.phone || void 0,
				location: updates.location || void 0,
				bio: updates.bio ?? void 0
			});
		} catch {}
	})();
	if (Object.keys(body).length === 0) return;
	const storedUser = getStoredWPUser();
	const wpUserId = storedUser?.user_id != null ? String(storedUser.user_id) : "";
	const existing = await findOwnRow(R.userProfile2Rel, CCT_SLUG);
	if (existing) {
		await wordpressCCTFetch(CCT_SLUG, {
			id: existing._ID || existing.id,
			method: "PUT",
			body
		});
		return;
	}
	const created = await wordpressCCTFetch(CCT_SLUG, {
		method: "POST",
		body: {
			...body,
			cct_author_id: wpUserId
		}
	});
	const newId = created?.item_id ?? created?._ID ?? created?.id;
	if (!newId) throw new Error("Could not create the extended profile 2 row");
	await linkOwnRow(R.userProfile2Rel, newId);
}
//#endregion
export { deliveryIdsToSlugs as a, source_wordpress_exports as c, careServiceTypeLabel as i, updateProfileWordPress as l, SERVICE_DELIVERY_MODES as n, deliveryModeLabel as o, careServiceIdsToSlugs as r, fetchMyProfileWordPress as s, CARE_SERVICE_TYPES as t };
