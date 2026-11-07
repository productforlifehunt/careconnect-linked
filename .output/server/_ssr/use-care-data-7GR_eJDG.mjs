import "../_runtime.mjs";
import { n as __name$1 } from "./rolldown-runtime-CNktS9qV.mjs";
import { a as getWPToken, i as getStoredWPUser } from "./wp-auth-DL1jfVY7.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { t as getCurrentUserId } from "./current-user-CV-pp6xq.mjs";
import { i as WP, n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
import { r as communityTypeCode } from "./app-scope-Cq6C10CZ.mjs";
import { n as fetchRelChildrenMap, r as fetchRelChildrenOf } from "./rel-batch-97Y7fPM-.mjs";
import { t as readLinkedCCTRows } from "./cct-rows-C0yQLswP.mjs";
import { t as createCalendarEventForUserWordPress } from "./source.wordpress-AL18NEGx.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { r as currentAppId } from "./app-profile-DeZHIfiB.mjs";
import { r as fetchWPUserPublicProfile } from "./wp-users-C2nRIR2f.mjs";
import { a as deliveryIdsToSlugs, l as updateProfileWordPress, r as careServiceIdsToSlugs, s as fetchMyProfileWordPress } from "./source.wordpress-CI9kg3_M.mjs";
import { n as wpFetchProviderBookings, t as wpFetchBookings } from "./wp-data-P-np9eD9.mjs";
import { b as updateOrderStatus } from "./woocommerce-api-BoF1FQHg.mjs";
import { i as setMyGroupDisplayNameWordPress, n as fetchCareGroupMembersWordPress, r as fetchCareGroupsWordPress, t as createCareGroupWordPress } from "./source.wordpress-kaOca10B.mjs";
import { t as fetchUserCaredOnesWordPress } from "./source.wordpress-Dw6aJMyP.mjs";
import { y as runNotificationSkill } from "./ai-dynamic-knowledge-C5tnjGCy.mjs";
import { t as notifySubgroupApproved } from "./notify-events-1KsuTnlc.mjs";
import { P as updateMedicineWordPress, S as logMedicineWordPress, _ as fetchMedicinesWordPress, g as fetchMedicineLogsWordPress, m as fetchAllMedicineLogsWordPress, p as deleteMedicineWordPress, u as createMedicineWordPress, v as fetchTodayMedicineLogsWordPress } from "./source.medicine-C8MN5KOu.mjs";
import { A as updateCaredOneDocumentWordPress, C as fetchTodayCheckinLogsWordPress, D as updateCareNoteWordPress, M as updateEmergencyContactWordPress, O as updateCarePlanWordPress, S as fetchGroupCaredOnesWordPress, T as logCheckinWordPress, _ as fetchCareTipsWordPress, a as createCheckinWordPress, b as fetchCheckinsWordPress, c as deleteCareNoteWordPress, d as deleteCaredOneDocumentWordPress, f as deleteCheckinWordPress, g as fetchCarePlansWordPress, h as fetchCareNotesWordPress, i as createCaredOneDocumentWordPress, j as updateCheckinWordPress, k as updateCareTipWordPress, l as deleteCarePlanWordPress, m as deleteUserCaredOneWordPress, n as createCarePlanWordPress, o as createEmergencyContactWordPress, p as deleteEmergencyContactWordPress, r as createCareTipWordPress, s as createUserCaredOneWordPress, t as createCareNoteWordPress, u as deleteCareTipWordPress, v as fetchCaredOneDocumentsWordPress, x as fetchEmergencyContactsWordPress, y as fetchCheckinLogsWordPress } from "./source.wordpress-extended-FYtgdTd3.mjs";
import { A as removeMemberFromSubgroupWordPress, C as fetchSubgroupMemberRecordsWordPress, D as leaveGroupWordPress, E as joinGroupByJoinCodeWordPress, F as updateGroupInviteWordPress, I as updateGroupPostWordPress, L as updateMemberCategoryWordPress, M as searchProfilesWordPress, O as previewGroupInviteWordPress, P as updateCareGroupWordPress, R as updateMemberRoleWordPress, S as fetchMyPendingInvitationsWordPress, T as joinGroupByAnyCodeWordPress, _ as fetchGroupInvitationsWordPress, a as cancelInvitationWordPress, b as fetchJoinRequesterWordPress, c as createMemberCategoryWordPress, d as deleteCareGroupWordPress, f as deleteGroupInviteWordPress, g as fetchCareGroupPostsWordPress, h as fetchCareGroupGalleryWordPress, i as answerJoinRequestWordPress, j as requestToJoinGroupWordPress, k as removeGroupMemberWordPress, l as declineInvitationWordPress, m as deleteMemberCategoryWordPress, n as addCaredOneToGroupWordPress, p as deleteGroupPostWordPress, r as addMemberToSubgroupWordPress, s as createGroupPostWordPress, t as acceptInvitationWordPress, v as fetchGroupInvitesWordPress, w as inviteToGroupWordPress, x as fetchMemberCategoriesWordPress, y as fetchGroupLinkStateWordPress, z as updateSubgroupMemberRoleWordPress } from "./source.wordpress-extended-GzmnoRoT.mjs";
import { i as setTaskVisibility, n as filterVisibleTasks, r as setPostVisibility, t as filterVisiblePosts } from "./visibility-Ka39tmJT.mjs";
import { r as fetchLocationSharesWordPress } from "./source.wordpress-CSA-mU0R.mjs";
import { S as updateSafeZoneWordPress, a as cancelLocationRequestWordPress, b as shareMyLocationWordPress, c as enableEmergencyLocationPermissionWordPress, d as fetchCaredOneLocationWordPress, f as fetchLocationRequestsWordPress, i as acknowledgeAllAlertsWordPress, l as fetchCaredOneLocationHistoryWordPress, m as fetchSafeZonesWordPress, o as createSafeZoneWordPress, p as fetchSafeZoneAlertsWordPress, r as acknowledgeAlertWordPress, s as deleteSafeZoneWordPress, u as fetchCaredOneLocationSettingsWordPress, v as respondToLocationRequestWordPress, y as sendLocationRequestWordPress } from "./source.wordpress-extended-CLFqt_H_.mjs";
import { i as linkTaskToCalendarEventWordPress, n as deleteCareTaskWordPress, o as updateAssigneeStatusWordPress, r as fetchCareTasksWordPress, s as updateCareTaskWordPress, t as createCareTaskWordPress } from "./source.wordpress-D8uiZfdo.mjs";
import { a as sendMessageWordPress, i as markMessagesReadWordPress, n as fetchDirectMessagesWordPress, r as getOrCreateGroupConversationWordPress, s as startConversationWordPress, t as fetchConversationsWordPress } from "./source.wordpress-D7cB4zyC.mjs";
import { a as updateCommentWordPress, n as deleteCommentWordPress, r as fetchCommentsWordPress, t as createCommentWordPress } from "./source.wordpress-CHAAtgyh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-care-data-7GR_eJDG.js
/**
* Last-good snapshot cache (stale-while-revalidate).
*
* Some lists must cross a slow hop before they can render — the booking list,
* for example, has to be read with the store's own credentials on the server.
* Instead of showing an empty card until that round-trip finishes, we keep the
* previous successful result in localStorage and show it immediately, then
* replace it as soon as fresh data lands. The user sees content instantly and
* never a spinner on a screen they have already visited.
*/
var PREFIX = "cc_lastgood_";
var MAX_AGE_MS = 1440 * 60 * 1e3;
function readLastGood(key) {
	if (typeof window === "undefined") return void 0;
	try {
		const raw = localStorage.getItem(PREFIX + key);
		if (!raw) return void 0;
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed.at !== "number") return void 0;
		if (Date.now() - parsed.at > MAX_AGE_MS) return void 0;
		return parsed.data;
	} catch {
		return;
	}
}
function writeLastGood(key, data) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(PREFIX + key, JSON.stringify({
			at: Date.now(),
			data
		}));
	} catch {}
}
/** Wrap a fetcher so every successful result is remembered for next time. */
function withLastGood(key, fetcher) {
	return async () => {
		const data = await fetcher();
		writeLastGood(key, data);
		return data;
	};
}
function inboxCounts(notifications = [], conversations = []) {
	const unreadNotifications = notifications.filter((n) => !n.is_read).length;
	const unreadMessages = conversations.filter((c) => Number(c.unread_count) > 0).length;
	return {
		unreadNotifications,
		unreadMessages,
		unread: unreadNotifications + unreadMessages,
		total: notifications.length + conversations.length,
		read: notifications.length + conversations.length - unreadNotifications - unreadMessages
	};
}
/**
* Reviews — JetEngine CCT 31 "Review" (a55 title, a56 content, a57 rating)
* attached to its parent through JetEngine relations only:
*   144 → 2. Shop
*   264 → Users (care provider)
*   294 → 215. care facility
*   145 → 140. nicotine product
* Replies live in CCT 141 Comment via relation 143 (and 142 for nested).
* No WooCommerce/Dokan reviews, no custom foreign keys.
*/
var REVIEW = T.review;
var F$5 = REVIEW.f;
R.providerReviews;
/** entity_type → JetEngine relation id whose parent owns the reviews. */
var ENTITY_REVIEW_REL = {
	provider: R.providerReviews,
	caregiver: R.providerReviews,
	user: R.providerReviews,
	facility: R.facilityReviews,
	care_facility: R.facilityReviews,
	shop: R.shopReviews,
	store: R.shopReviews,
	product: R.productReviews,
	nicotine_product: R.productReviews
};
function relForEntity(entityType) {
	const rel = ENTITY_REVIEW_REL[entityType ?? "provider"];
	if (!rel) throw new Error(`No review relation for "${entityType}"`);
	return rel;
}
function numericId(value) {
	return Number(String(value ?? "").replace(/^wp-/, "")) || 0;
}
async function fetchReviewRows(parentId, relId) {
	const ids = (await fetchRelChildrenOf(relId, parentId)).map((c) => c.childId);
	return readLinkedCCTRows(REVIEW.slug, ids);
}
async function resolveAuthorName(authorId) {
	if (!authorId) return "";
	return (await fetchWPUserPublicProfile(authorId)).full_name;
}
async function fetchEntityReviewsWordPress(entityId, entityType) {
	const parentId = numericId(entityId);
	if (!parentId) return [];
	const rows = await fetchReviewRows(parentId, relForEntity(entityType));
	if (rows.length === 0) return [];
	const authorNames = /* @__PURE__ */ new Map();
	await Promise.all(Array.from(new Set(rows.map((r) => Number(r.author_id || r.cct_author_id) || 0))).filter(Boolean).map(async (id) => authorNames.set(id, await resolveAuthorName(id))));
	return rows.map((row) => {
		const authorId = Number(row.author_id || row.cct_author_id) || 0;
		return {
			id: String(row.id ?? row._ID),
			title: String(row[F$5.TITLE] ?? ""),
			content: String(row[F$5.CONTENT] ?? ""),
			rating: Number(row[F$5.RATING] ?? 0) || 0,
			author_id: authorId ? `wp-${authorId}` : null,
			author_name: authorNames.get(authorId) || "",
			created_at: row.cct_created ?? row.created_at ?? null,
			updated_at: row.cct_modified ?? row.updated_at ?? row.created_at ?? null
		};
	}).sort((a, b) => String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")));
}
/** Rating aggregate for any review parent, computed from the Review CCT. */
async function fetchRatingSummary(parentId, entityType) {
	const pid = numericId(parentId);
	if (!pid) return {
		average: null,
		count: 0
	};
	const ratings = (await fetchReviewRows(pid, relForEntity(entityType))).map((r) => Number(r[F$5.RATING])).filter((n) => Number.isFinite(n) && n > 0);
	if (ratings.length === 0) return {
		average: null,
		count: 0
	};
	return {
		average: ratings.reduce((a, b) => a + b, 0) / ratings.length,
		count: ratings.length
	};
}
/**
* Real rating aggregate for a care provider, computed from the Review CCT.
* Returns null averages when the provider has no reviews — callers must render
* "New" rather than a fabricated score.
*/
async function fetchProviderRatingSummary(providerUserId) {
	return fetchRatingSummary(providerUserId, "provider");
}
async function createReviewWordPress(review) {
	const parentId = numericId(review.entity_id);
	if (!parentId) throw new Error("Missing id — review cannot be posted.");
	const rating = Math.round(Number(review.rating));
	if (!Number.isFinite(rating) || rating < 1 || rating > 5) throw new Error("Rating must be between 1 and 5.");
	const created = await wordpressCCTFetch(REVIEW.slug, {
		method: "POST",
		body: {
			[F$5.TITLE]: String(review.title ?? ""),
			[F$5.CONTENT]: String(review.comment ?? ""),
			[F$5.RATING]: String(rating)
		}
	});
	const newId = Number(created?.item_id ?? created?._ID ?? created?.id ?? 0);
	if (!newId) throw new Error("Review could not be saved.");
	await wordpressFetch(`jet-rel/${relForEntity(review.entity_type)}`, {
		method: "POST",
		body: {
			parent_id: parentId,
			child_id: newId,
			context: "child",
			store_items_type: "update"
		}
	});
}
var P2 = T.userProfile2;
var F_PROFILE = P2.f;
function parseWpList(value) {
	if (Array.isArray(value)) return value.map(String).filter(Boolean);
	if (typeof value === "string" && value.trim()) {
		try {
			const parsed = JSON.parse(value);
			if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
		} catch {}
		return value.split(",").map((s) => s.trim()).filter(Boolean);
	}
	return null;
}
function isListedProviderRow(row) {
	return String(row?.[F_PROFILE.IS_PAID_CARE_PROVIDER]) === P2.opt.IS_PAID_CARE_PROVIDER.YES && String(row?.[F_PROFILE.CARE_PROVIDER_IS_ACTIVE]) === P2.opt.CARE_PROVIDER_IS_ACTIVE.YES;
}
async function mapProviderRow(row) {
	{
		const userId = Number(row.author_id || row.cct_author_id || row.user_id);
		if (!userId) return null;
		const user = await fetchWPUserPublicProfile(userId);
		const fullName = user.full_name;
		const rateNumbers = [
			row[F_PROFILE.CARE_PROVIDER_S_HOURLY_RATE_FOR_IN_PERSON_SERVICE],
			row[F_PROFILE.CARE_PROVIDER_S_HOURLY_RATE_FOR_REMOTE_SERVICE],
			row[F_PROFILE.CARE_PROVIDER_S_RATE_FOR_REMOTE_CHECKINS],
			row[F_PROFILE.CARE_PROVIDER_S_RATE_FOR_REMOTE_MEDICINE_SUPERVISION]
		].map((v) => parseFloat(v)).filter((n) => Number.isFinite(n) && n > 0);
		const startsAt = rateNumbers.length ? Math.min(...rateNumbers) : null;
		return {
			id: `wp-${userId}`,
			user_id: `wp-${userId}`,
			email: null,
			first_name: null,
			last_name: null,
			full_name: fullName,
			user_name: user.slug || null,
			avatar_url: user.avatar_url || null,
			bio: null,
			general_user_role: parseWpList(row[F_PROFILE.GENERAL_USER_ROLE]),
			is_care_provider: String(row[F_PROFILE.IS_PAID_CARE_PROVIDER]) === P2.opt.IS_PAID_CARE_PROVIDER.YES,
			provider_is_active: String(row[F_PROFILE.CARE_PROVIDER_IS_ACTIVE]) === P2.opt.CARE_PROVIDER_IS_ACTIVE.YES,
			care_provider_is_background_checked: String(row[F_PROFILE.CARE_PROVIDER_IS_BACKGROUND_CHECKED]) === P2.opt.CARE_PROVIDER_IS_BACKGROUND_CHECKED.YES,
			care_provider_background_check_detail: row[F_PROFILE.CARE_PROVIDER_S_BACKGROUND_CHECK_DETAIL] || null,
			care_provider_starts_hourly_rate: startsAt,
			min_block_cost: startsAt,
			service_location_slugs: deliveryIdsToSlugs(row[F_PROFILE.CARE_PROVIDER_OFFERS_SERVICE_TYPE]),
			service_type_slugs: careServiceIdsToSlugs(row[F_PROFILE.CARE_PROVIDER_OFFERS_CARE_SERVICE_TYPE]),
			care_provider_hourly_rate_in_person: parseFloat(row[F_PROFILE.CARE_PROVIDER_S_HOURLY_RATE_FOR_IN_PERSON_SERVICE]) || null,
			care_provider_hourly_rate_remote: parseFloat(row[F_PROFILE.CARE_PROVIDER_S_HOURLY_RATE_FOR_REMOTE_SERVICE]) || null,
			care_provider_rate_remote_checkin: parseFloat(row[F_PROFILE.CARE_PROVIDER_S_RATE_FOR_REMOTE_CHECKINS]) || null,
			care_provider_rate_remote_medicine: parseFloat(row[F_PROFILE.CARE_PROVIDER_S_RATE_FOR_REMOTE_MEDICINE_SUPERVISION]) || null,
			care_provider_cancellation_policy: row[F_PROFILE.CARE_PROVIDER_S_CANCELLATION_POLICY] || null,
			phone: null,
			location: row[F_PROFILE.CARE_PROVIDER_S_LOCATION] || null,
			years_of_experience: null,
			certifications: null,
			specialty: null,
			rating_average: null,
			rating_count: null,
			created_at: row.created_at || null,
			updated_at: row.updated_at || row.created_at || null
		};
	}
}
async function fetchDictionaryProviderProfiles() {
	const rows = await wordpressCCTFetch(P2.slug, { params: { _limit: 200 } });
	const activeRows = (Array.isArray(rows) ? rows : []).filter(isListedProviderRow);
	return (await Promise.all(activeRows.map((row) => mapProviderRow(row)))).filter(Boolean);
}
/** Listed providers with their ratings — read once and shared; filters/sorting run on this list without re-downloading. */
async function fetchProviderDirectoryWordPress() {
	const sourceProfiles = await fetchDictionaryProviderProfiles();
	const ratingSummaries = /* @__PURE__ */ new Map();
	await Promise.all(sourceProfiles.map(async (p) => {
		const uid = String(p.id).replace(/^wp-/, "");
		ratingSummaries.set(uid, await fetchProviderRatingSummary(uid));
	}));
	return sourceProfiles.map((p) => {
		const numericId = String(p.id).replace(/^wp-/, "");
		const rating = ratingSummaries.get(numericId) || {
			average: null,
			count: 0
		};
		return {
			...p,
			rating_average: rating.average,
			rating_count: rating.count
		};
	});
}
function filterProviders(directory, filters) {
	try {
		let results = [...directory];
		if (filters?.query) {
			const q = filters.query.toLowerCase();
			results = results.filter((p) => [
				p.full_name,
				p.user_name,
				p.bio,
				p.location,
				...p.specialty || []
			].some((v) => String(v || "").toLowerCase().includes(q)));
		}
		if (filters?.location) {
			const loc = filters.location.toLowerCase();
			results = results.filter((p) => p.location?.toLowerCase().includes(loc));
		}
		if (filters?.minRating != null) results = results.filter((p) => (p.rating_average ?? 0) >= filters.minRating);
		if (filters?.serviceLocations && filters.serviceLocations.length > 0) {
			const want = new Set(filters.serviceLocations.map((s) => s.toLowerCase()));
			results = results.filter((p) => (p.service_location_slugs || []).some((s) => want.has(s)));
		}
		if (filters?.serviceTypeSlugs && filters.serviceTypeSlugs.length > 0) {
			const want = new Set(filters.serviceTypeSlugs.map((s) => s.toLowerCase()));
			results = results.filter((p) => (p.service_type_slugs || []).some((s) => want.has(s)));
		}
		if (filters?.minRate != null) results = results.filter((p) => (p.care_provider_starts_hourly_rate ?? 0) >= filters.minRate);
		if (filters?.maxRate != null) results = results.filter((p) => (p.care_provider_starts_hourly_rate ?? Number.POSITIVE_INFINITY) <= filters.maxRate);
		const byRatingDesc = (a, b) => (b.rating_average ?? -1) - (a.rating_average ?? -1);
		const priceOf = (p) => p.care_provider_starts_hourly_rate;
		if (filters?.sortBy === "rating") results.sort(byRatingDesc);
		else if (filters?.sortBy === "price-low") results.sort((a, b) => (priceOf(a) ?? Number.POSITIVE_INFINITY) - (priceOf(b) ?? Number.POSITIVE_INFINITY));
		else if (filters?.sortBy === "price-high") results.sort((a, b) => (priceOf(b) ?? -1) - (priceOf(a) ?? -1));
		else results.sort(byRatingDesc);
		return results;
	} catch (error) {
		throw new Error(`Failed to fetch providers: ${error instanceof Error ? error.message : String(error)}`);
	}
}
async function fetchProviderByIdWordPress(id) {
	try {
		const numericId = String(id).replace(/^wp-/, "");
		const rows = await wordpressCCTFetch(P2.slug, { params: {
			cct_author_id: numericId,
			_limit: 20
		} });
		const row = (Array.isArray(rows) ? rows : []).find((r) => String(r.author_id || r.cct_author_id || r.user_id) === numericId);
		if (!row || !isListedProviderRow(row)) return null;
		const profile = await mapProviderRow(row);
		if (!profile) return null;
		const rating = await fetchProviderRatingSummary(numericId);
		return {
			...profile,
			rating_average: rating.average,
			rating_count: rating.count
		};
	} catch (error) {
		throw new Error(`Failed to fetch provider ${id}: ${error instanceof Error ? error.message : String(error)}`);
	}
}
async function fetchBookingsWordPress() {
	try {
		return await wpFetchBookings();
	} catch {
		return [];
	}
}
async function fetchProviderBookingsWordPress() {
	try {
		return await wpFetchProviderBookings();
	} catch {
		return [];
	}
}
async function updateBookingStatusWordPress(id, status) {
	const mapped = status === "confirmed" ? "processing" : status === "completed" ? "completed" : status === "pending" ? "on-hold" : status.startsWith("cancelled") ? "cancelled" : "pending";
	const order = await updateOrderStatus(parseInt(id, 10), mapped);
	try {
		const recipients = [];
		if (order?.customer_id) recipients.push(order.customer_id);
		const vendorMeta = Array.isArray(order?.meta_data) ? order.meta_data.find((m) => m?.key === "_dokan_vendor_id") : null;
		if (vendorMeta?.value) recipients.push(vendorMeta.value);
		if (recipients.length > 0) {
			const { notifyBookingStatus } = await import("../_libs/_12.mjs").then((n) => n.n);
			await notifyBookingStatus(recipients, id, status);
		}
	} catch {}
}
async function fetchCareFacilitiesWordPress() {
	const F = T.careFacility.f;
	const items = await wordpressCCTFetch(T.careFacility.slug, { params: {
		_limit: 100,
		_filters: JSON.stringify([{
			field: F.FACILITY_IS_APPROVED,
			operator: "=",
			value: T.careFacility.opt.FACILITY_IS_APPROVED.YES
		}])
	} });
	if (!Array.isArray(items)) throw new Error("Care facilities returned an invalid response");
	return items.filter((f) => String(f[F.FACILITY_IS_APPROVED]) === T.careFacility.opt.FACILITY_IS_APPROVED.YES).map((f) => ({
		id: f.id,
		name: f[F.NAME] || null,
		description: f[F.DETAIL] || null,
		location: f[F.LOCATION] || null,
		address: f[F.ADDRESS] || null,
		phone: f[F.PHONE] || null,
		email: f[F.EMAIL] || null,
		type: f[F.CARE_FACILITY_TYPE] || null,
		dementia_stage: f[F.CARE_FACILITY_CAN_CARE_FOR_DEMENTIA_STAGE] || null,
		room_type: f[F.CARE_FACILITY_ROOM_TYPE] || null,
		room_facility: f[F.CARE_FACILITY_PROVIDES_ROOM_FACILITY] || null,
		community_facility: f[F.CARE_FACILITY_PROVIDES_COMMUNITY_FACILITY] || null,
		people_number: f[F.CARE_FACILITY_PEOPLE_NUMBER] || null,
		is_approved: true,
		created_at: f.created_at
	}));
}
async function fetchCareFacilityByIdWordPress(id) {
	const F = T.careFacility.f;
	const f = await wordpressCCTFetch(T.careFacility.slug, { id });
	if (!f || String(f[F.FACILITY_IS_APPROVED]) !== T.careFacility.opt.FACILITY_IS_APPROVED.YES) return null;
	return {
		id: f.id,
		name: f[F.NAME] || null,
		description: f[F.DETAIL] || null,
		location: f[F.LOCATION] || null,
		address: f[F.ADDRESS] || null,
		phone: f[F.PHONE] || null,
		email: f[F.EMAIL] || null,
		type: f[F.CARE_FACILITY_TYPE] || null,
		dementia_stage: f[F.CARE_FACILITY_CAN_CARE_FOR_DEMENTIA_STAGE] || null,
		room_type: f[F.CARE_FACILITY_ROOM_TYPE] || null,
		room_facility: f[F.CARE_FACILITY_PROVIDES_ROOM_FACILITY] || null,
		community_facility: f[F.CARE_FACILITY_PROVIDES_COMMUNITY_FACILITY] || null,
		people_number: f[F.CARE_FACILITY_PEOPLE_NUMBER] || null,
		is_approved: true,
		created_at: f.created_at,
		updated_at: f.updated_at
	};
}
/**
* Care Facility (CCT 215) option codes — the data dictionary is the only truth.
* a57 type, a58 dementia stage, a59 room type, a60 room facility,
* a61 community facility, a62 people number.
* Codes are meaningless (b55, b56, ...); labels live only here.
*/
var O$1 = T.careFacility.opt;
var FACILITY_TYPE_OPTIONS = [
	{
		code: O$1.CARE_FACILITY_TYPE.ADULT_DAY_CARE,
		en: "Adult day care",
		zh: "日间照料"
	},
	{
		code: O$1.CARE_FACILITY_TYPE.ASSISTED_LIVING,
		en: "Assisted living",
		zh: "协助生活"
	},
	{
		code: O$1.CARE_FACILITY_TYPE.HOME_CARE,
		en: "Home care",
		zh: "居家照护"
	},
	{
		code: O$1.CARE_FACILITY_TYPE.HOSPICE,
		en: "Hospice",
		zh: "临终关怀"
	},
	{
		code: O$1.CARE_FACILITY_TYPE.INDEPENDENT_LIVING,
		en: "Independent living",
		zh: "自主生活"
	},
	{
		code: O$1.CARE_FACILITY_TYPE.MEMORY_CARE,
		en: "Memory care",
		zh: "失智症专区"
	},
	{
		code: O$1.CARE_FACILITY_TYPE.NURSING_HOMES,
		en: "Nursing home",
		zh: "养护院"
	},
	{
		code: O$1.CARE_FACILITY_TYPE.RESIDENTIAL_CARE_HOMES,
		en: "Residential care home",
		zh: "住宿型护理院"
	},
	{
		code: O$1.CARE_FACILITY_TYPE.SENIOR_APARTMENTS,
		en: "Senior apartments",
		zh: "老年公寓"
	}
];
var FACILITY_STAGE_OPTIONS = [
	{
		code: O$1.CARE_FACILITY_CAN_CARE_FOR_DEMENTIA_STAGE.EARLY_STAGE,
		en: "Early stage",
		zh: "早期"
	},
	{
		code: O$1.CARE_FACILITY_CAN_CARE_FOR_DEMENTIA_STAGE.MIDDLE_STAGE,
		en: "Middle stage",
		zh: "中期"
	},
	{
		code: O$1.CARE_FACILITY_CAN_CARE_FOR_DEMENTIA_STAGE.LATE_STAGE,
		en: "Late stage",
		zh: "晚期"
	}
];
var FACILITY_ROOM_TYPE_OPTIONS = [
	{
		code: O$1.CARE_FACILITY_ROOM_TYPE.STUDIO,
		en: "Studio",
		zh: "开间"
	},
	{
		code: O$1.CARE_FACILITY_ROOM_TYPE.ONE_BED_ROOM,
		en: "One bedroom",
		zh: "一居室"
	},
	{
		code: O$1.CARE_FACILITY_ROOM_TYPE.TWO_BED_ROOM,
		en: "Two bedroom",
		zh: "两居室"
	},
	{
		code: O$1.CARE_FACILITY_ROOM_TYPE.MORE_THAN_TWO_BED_ROOM,
		en: "More than two bedrooms",
		zh: "两居室以上"
	}
];
var FACILITY_ROOM_FACILITY_OPTIONS = [
	{
		code: O$1.CARE_FACILITY_PROVIDES_ROOM_FACILITY.BALCONY,
		en: "Balcony",
		zh: "阳台"
	},
	{
		code: O$1.CARE_FACILITY_PROVIDES_ROOM_FACILITY.TOILET,
		en: "Private toilet",
		zh: "独立卫生间"
	},
	{
		code: O$1.CARE_FACILITY_PROVIDES_ROOM_FACILITY.KITCHEN,
		en: "Kitchen",
		zh: "厨房"
	}
];
var FACILITY_COMMUNITY_FACILITY_OPTIONS = [
	{
		code: O$1.CARE_FACILITY_PROVIDES_COMMUNITY_FACILITY.SWIMMING_POOL,
		en: "Swimming pool",
		zh: "泳池"
	},
	{
		code: O$1.CARE_FACILITY_PROVIDES_COMMUNITY_FACILITY.ACTIVE_LIFESTYLE,
		en: "Activity programmes",
		zh: "活动项目"
	},
	{
		code: O$1.CARE_FACILITY_PROVIDES_COMMUNITY_FACILITY.ENTERTAINMENT_VENUE,
		en: "Entertainment venue",
		zh: "娱乐场所"
	},
	{
		code: O$1.CARE_FACILITY_PROVIDES_COMMUNITY_FACILITY.LAUNDRY,
		en: "Laundry",
		zh: "洗衣服务"
	}
];
var FACILITY_PEOPLE_NUMBER_OPTIONS = [
	{
		code: O$1.CARE_FACILITY_PEOPLE_NUMBER.LESS_THAN_5,
		en: "Fewer than 5 residents",
		zh: "少于 5 人"
	},
	{
		code: O$1.CARE_FACILITY_PEOPLE_NUMBER["5_20"],
		en: "5–20 residents",
		zh: "5–20 人"
	},
	{
		code: O$1.CARE_FACILITY_PEOPLE_NUMBER["20_50"],
		en: "20–50 residents",
		zh: "20–50 人"
	},
	{
		code: O$1.CARE_FACILITY_PEOPLE_NUMBER.MORE_THAN_50,
		en: "More than 50 residents",
		zh: "50 人以上"
	}
];
/** Checkbox values arrive as arrays, comma strings, or JSON strings. */
function toCodeList(value) {
	if (Array.isArray(value)) return value.map(String).filter(Boolean);
	const raw = String(value ?? "").trim();
	if (!raw) return [];
	if (raw.startsWith("[")) try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
	} catch {}
	return raw.split(",").map((s) => s.trim()).filter(Boolean);
}
function facilityLabel(options, code, isZh) {
	const hit = options.find((o) => o.code === String(code));
	return hit ? isZh ? hit.zh : hit.en : String(code);
}
function facilityLabels(options, value, isZh) {
	return toCodeList(value).map((code) => facilityLabel(options, code, isZh));
}
/**
* Care Facility extended ops.
*
* CCT 215 `care_facility` — opaque field map:
*   a55 name, a56 detail, a57 type, a58 dementia_stage, a59 room_type,
*   a60 room_facility, a61 community_facility, a62 people_number,
*   a63 location, a64 address.
*
* Facility membership uses JetEngine Relation 249. Relation meta:
*   a55 = Facility member type   Checkbox: b55 nothing | b56 owner | b57 admin
*   a56 = Facility member role   Text (self-described)
*
*/
var CCT_SLUG$1 = T.careFacility.slug;
var F$4 = T.careFacility.f;
var REL_FACILITY_MEMBER = R.careFacilityMembers;
var REL249 = WP.rel["249"];
var RF = REL249.f;
var MEMBER_TYPE_TO_CODE = {
	member: REL249.opt.FACILITY_MEMBER_TYPE.NOTHING_SPECIAL,
	owner: REL249.opt.FACILITY_MEMBER_TYPE.OWNER,
	admin: REL249.opt.FACILITY_MEMBER_TYPE.ADMIN
};
var MEMBER_CODE_TO_TYPE = Object.fromEntries(Object.entries(MEMBER_TYPE_TO_CODE).map(([label, code]) => [code, label]));
function normalizeWpObjectId(value) {
	return Number(String(value ?? "").replace(/^wp-/, ""));
}
async function createCareFacilityWordPress(input) {
	const list = (v) => Array.isArray(v) ? v.filter(Boolean) : v ? [String(v)] : [];
	if (input.isOwner) {
		const { getStoredWPUser } = await import("../_libs/_.mjs").then((n) => n.f);
		if (!normalizeWpObjectId(getStoredWPUser()?.user_id)) throw new Error("You must be signed in to claim ownership");
	}
	const result = await wordpressCCTFetch(CCT_SLUG$1, {
		method: "POST",
		body: {
			[F$4.NAME]: input.title ?? input.name ?? "",
			[F$4.DETAIL]: input.content ?? input.description ?? "",
			[F$4.CARE_FACILITY_TYPE]: list(input.type),
			[F$4.CARE_FACILITY_CAN_CARE_FOR_DEMENTIA_STAGE]: list(input.dementia_stage),
			[F$4.CARE_FACILITY_ROOM_TYPE]: list(input.room_type),
			[F$4.CARE_FACILITY_PROVIDES_ROOM_FACILITY]: list(input.room_facility),
			[F$4.CARE_FACILITY_PROVIDES_COMMUNITY_FACILITY]: list(input.community_facility),
			[F$4.CARE_FACILITY_PEOPLE_NUMBER]: input.people_number || "",
			[F$4.LOCATION]: input.location || "",
			[F$4.ADDRESS]: input.address || "",
			[F$4.PHONE]: input.phone || "",
			[F$4.EMAIL]: input.email || "",
			[F$4.FACILITY_IS_APPROVED]: T.careFacility.opt.FACILITY_IS_APPROVED.NO
		}
	});
	const facilityId = String(normalizeWpObjectId(result?.item_id || result?._ID || result?.id) || "");
	if (!facilityId) throw new Error("Care facility was not created");
	if (input.isOwner) await createFacilityOwnershipClaimWordPress({
		facility_id: facilityId,
		claim: [input.ownerRole?.trim() ? `Role / 职务：${input.ownerRole.trim()}` : "", input.ownershipClaim || ""].filter(Boolean).join("\n\n"),
		attachment_urls: input.ownershipAttachmentUrls || [],
		is_dispute: false
	});
	return { id: facilityId };
}
async function updateCareFacilityWordPress(id, updates) {
	const body = {};
	if (updates["title"] !== void 0 || updates["name"] !== void 0) body[F$4.NAME] = updates["title"] ?? updates["name"];
	if (updates["content"] !== void 0 || updates["description"] !== void 0) body[F$4.DETAIL] = updates["content"] ?? updates["description"];
	if (updates["type"] !== void 0) body[F$4.CARE_FACILITY_TYPE] = updates["type"];
	if (updates["dementia_stage"] !== void 0) body[F$4.CARE_FACILITY_CAN_CARE_FOR_DEMENTIA_STAGE] = updates["dementia_stage"];
	if (updates["room_type"] !== void 0) body[F$4.CARE_FACILITY_ROOM_TYPE] = updates["room_type"];
	if (updates["room_facility"] !== void 0) body[F$4.CARE_FACILITY_PROVIDES_ROOM_FACILITY] = updates["room_facility"];
	if (updates["community_facility"] !== void 0) body[F$4.CARE_FACILITY_PROVIDES_COMMUNITY_FACILITY] = updates["community_facility"];
	if (updates["people_number"] !== void 0) body[F$4.CARE_FACILITY_PEOPLE_NUMBER] = updates["people_number"];
	if (updates["location"] !== void 0) body[F$4.LOCATION] = updates["location"];
	if (updates["address"] !== void 0) body[F$4.ADDRESS] = updates["address"];
	if (updates["phone"] !== void 0) body[F$4.PHONE] = updates["phone"];
	if (updates["email"] !== void 0) body[F$4.EMAIL] = updates["email"];
	return { id: (await wordpressCCTFetch(CCT_SLUG$1, {
		id,
		method: "PUT",
		body
	}))?.id || id };
}
async function fetchFacilityMembersWordPress(facilityId) {
	try {
		const fid = normalizeWpObjectId(facilityId);
		if (!fid) return [];
		const rels = await wordpressFetch(`jet-rel/${REL_FACILITY_MEMBER}/children/${fid}`);
		if (!Array.isArray(rels)) return [];
		return rels.map((r) => {
			const userId = normalizeWpObjectId(r.child_object_id);
			const meta = r.meta || r.meta_fields || {};
			const codes = toCodeList(meta[RF.FACILITY_MEMBER_TYPE]);
			if (!codes.length || codes.some((code) => !MEMBER_CODE_TO_TYPE[code])) throw new Error("Invalid facility-member checkbox codes");
			const isOwner = codes.includes(REL249.opt.FACILITY_MEMBER_TYPE.OWNER);
			const isAdmin = codes.includes(REL249.opt.FACILITY_MEMBER_TYPE.ADMIN);
			return {
				id: String(r.id || `${fid}-${userId}`),
				post_id: facilityId,
				user_id: userId ? `wp-${userId}` : null,
				role: isOwner ? "owner" : isAdmin ? "admin" : "member",
				member_types: codes,
				is_owner: isOwner,
				is_admin: isAdmin,
				role_label: meta[RF.FACILITY_MEMBER_ROLE] || null,
				created_at: r.created_at || null,
				profile: null
			};
		});
	} catch (error) {
		throw new Error(`Failed to fetch facility ${facilityId} members: ${error instanceof Error ? error.message : String(error)}`);
	}
}
async function getMyFacilityPermissionWordPress(facilityId) {
	try {
		const { getStoredWPUser } = await import("../_libs/_.mjs").then((n) => n.f);
		const meId = normalizeWpObjectId(getStoredWPUser()?.user_id);
		if (!meId) return {
			canEdit: false,
			membership: null
		};
		const mine = (await fetchFacilityMembersWordPress(facilityId)).find((m) => normalizeWpObjectId(m.user_id) === meId);
		if (!mine) return {
			canEdit: false,
			membership: null
		};
		return {
			canEdit: mine.is_owner || mine.is_admin,
			membership: mine
		};
	} catch {
		return {
			canEdit: false,
			membership: null
		};
	}
}
async function fetchFacilityReviewSummariesWordPress(facilityIds) {
	const result = {};
	(await Promise.all(facilityIds.map(async (id) => [id, await fetchRatingSummary(id, "facility")]))).forEach(([id, summary]) => {
		result[id] = summary;
	});
	return result;
}
var CLAIM = T.ownershipClaim;
var FC = CLAIM.f;
var REL_FACILITY_CLAIM = R.careFacilityOwnershipClaims;
var CLAIM_STATUS_LABEL = {
	[CLAIM.opt.STATUS.PENDING]: "pending",
	[CLAIM.opt.STATUS.APPROVED]: "approved",
	[CLAIM.opt.STATUS.REJECTED]: "rejected"
};
CLAIM.opt.STATUS.PENDING, CLAIM.opt.STATUS.APPROVED, CLAIM.opt.STATUS.REJECTED;
function parseProof(value) {
	if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean);
	if (typeof value === "string" && value.trim()) {
		try {
			const parsed = JSON.parse(value);
			if (Array.isArray(parsed)) return parsed.map((v) => String(v)).filter(Boolean);
		} catch {}
		return value.split(/[\n,]/).map((v) => v.trim()).filter(Boolean);
	}
	return [];
}
function mapClaim(row, facilityId) {
	const statusCode = String(row[FC.STATUS] || "");
	const status = CLAIM_STATUS_LABEL[statusCode];
	if (!status) throw new Error(`Invalid ownership claim status code: ${statusCode}`);
	return {
		id: String(row.id || row._ID),
		entity_id: facilityId,
		facility_id: facilityId,
		post_id: facilityId,
		claim: row[FC.CLAIM] || null,
		attachment_urls: parseProof(row[FC.PROOF]),
		status,
		is_dispute: String(row[FC.IS_DISPUTE]) === CLAIM.opt.IS_DISPUTE.YES,
		reject_reason: row[FC.REPLY] || null,
		reply: row[FC.REPLY] || null,
		user_id: row.cct_author_id ? `wp-${row.cct_author_id}` : row.author_id ? `wp-${row.author_id}` : "",
		created_at: row.created_at,
		updated_at: row.updated_at
	};
}
/** All ownership claims/disputes attached to a facility (Relation 291). */
async function fetchFacilityOwnershipClaimsWordPress(facilityId) {
	const fid = normalizeWpObjectId(facilityId);
	if (!fid) throw new Error("Invalid facility ID");
	const rels = await wordpressFetch(`jet-rel/${REL_FACILITY_CLAIM}/children/${fid}`);
	if (!Array.isArray(rels)) throw new Error(`Relation ${REL_FACILITY_CLAIM} returned an invalid response`);
	return (await Promise.all(rels.map((r) => String(r.child_object_id || "")).filter(Boolean).map((cid) => wordpressCCTFetch(CLAIM.slug, { id: cid })))).filter(Boolean).map((row) => mapClaim(row, facilityId));
}
/** Claims only (is dispute = No). */
async function fetchFacilityClaimsOnlyWordPress(facilityId) {
	return (await fetchFacilityOwnershipClaimsWordPress(facilityId)).filter((c) => !c.is_dispute);
}
/** Disputes only (is dispute = Yes). */
async function fetchFacilityDisputesWordPress(facilityId) {
	return (await fetchFacilityOwnershipClaimsWordPress(facilityId)).filter((c) => c.is_dispute);
}
/**
* Submit an ownership claim (or dispute) for a facility.
* Status always starts pending — approval is an admin action.
*/
async function createFacilityOwnershipClaimWordPress(input) {
	const fid = normalizeWpObjectId(input.facility_id);
	if (!fid) throw new Error("Invalid facility ID");
	const proof = parseProof(input.attachment_urls);
	const result = await wordpressCCTFetch(CLAIM.slug, {
		method: "POST",
		body: {
			[FC.CLAIM]: input.claim || "",
			[FC.PROOF]: JSON.stringify(proof),
			[FC.STATUS]: CLAIM.opt.STATUS.PENDING,
			[FC.IS_DISPUTE]: input.is_dispute ? CLAIM.opt.IS_DISPUTE.YES : CLAIM.opt.IS_DISPUTE.NO,
			[FC.REPLY]: ""
		}
	});
	const claimId = normalizeWpObjectId(result?.item_id || result?._ID || result?.id);
	if (!claimId) throw new Error("Ownership claim was not created");
	await wordpressFetch(`jet-rel/${REL_FACILITY_CLAIM}`, {
		method: "POST",
		body: {
			parent_id: fid,
			child_id: claimId,
			context: "child",
			store_items_type: "update"
		}
	});
	return { id: String(claimId) };
}
/**
* Shared care tasks — the marketplace side of JetEngine CCT 204 `care_task`.
*
* The 2026-09-04 bible removed CCT 216 "care job": a task IS the job. A task
* becomes visible to helpers outside the care group when a65 (Task help status)
* is b56 "Task needs help"; b57 means help was found. Paid help uses a68
* (Needs payment) + a69 (Price).
*
* Relations:
*   232 care_task → users   applicants / assigned caregivers (meta = response)
*   236 care_task → comment the applicant's message ("cover letter")
*   253 care_task → care_task  sub-tasks bundled into a shared task
*/
var SLUG$2 = T.careTask.slug;
var F$3 = T.careTask.f;
var O = T.careTask.opt;
var REL232 = WP.rel["232"];
var ASSIGNEE_FIELD = REL232.f.ASSIGNED_CAREGIVER_STATUS;
var REL_TASK_ASSIGNEE = R.careTaskAssignees;
var stripWp$1 = /* @__PURE__ */ __name$1((v) => v == null ? "" : String(v).replace(/^wp-/, ""), "stripWp");
var numId = (v) => Number(stripWp$1(v));
var RESPONSE_CODE = {
	pending: REL232.opt.ASSIGNED_CAREGIVER_STATUS.PENDING,
	accepted: REL232.opt.ASSIGNED_CAREGIVER_STATUS.ACCEPTED,
	rejected: REL232.opt.ASSIGNED_CAREGIVER_STATUS.REJECTED
};
var RESPONSE_LABEL = Object.fromEntries(Object.entries(RESPONSE_CODE).map(([k, v]) => [v, k]));
function mapShared(t) {
	const helpCode = String(t[F$3.TASK_HELP_STATUS] || "");
	return {
		id: String(t.id || t._ID),
		posted_by: t.cct_author_id ?? t.author_id ?? null,
		title: t[F$3.TITLE] || "",
		description: t[F$3.DESCRIPTION] || "",
		location: t[F$3.LOCATION] || "",
		task_date: t[F$3.DATE_OF_THE_TASK] || null,
		start_time: t[F$3.TASK_START_TIME] || null,
		end_time: t[F$3.TASK_END_TIME] || null,
		people_needed: t[F$3.PEOPLE_NEEDED] ? Number(t[F$3.PEOPLE_NEEDED]) : null,
		needs_payment: String(t[F$3.NEEDS_PAYMENT] || "") === O.NEEDS_PAYMENT.YES,
		price: t[F$3.PRICE] || "",
		help_status: helpCode,
		/** open = still looking for help, filled = help found */
		status: helpCode === O.TASK_HELP_STATUS.TASK_HAS_FOUND_HELP ? "filled" : "open",
		finished: String(t[F$3.TASK_FINISH_STATUS] || "") === O.TASK_FINISH_STATUS.FINISHED,
		created_at: t.cct_created || t.created_at || null
	};
}
/** Every task its owner shared out for help (a65 = b56 or b57). */
async function fetchHelpTasksWordPress(filters) {
	const rows = await wordpressCCTFetch(SLUG$2, { params: {
		_limit: 100,
		...filters?.author ? { cct_author_id: String(filters.author) } : {},
		_filters: JSON.stringify([{
			field: F$3.TASK_HELP_STATUS,
			operator: "IN",
			value: [O.TASK_HELP_STATUS.TASK_NEEDS_HELP, O.TASK_HELP_STATUS.TASK_HAS_FOUND_HELP]
		}])
	} });
	if (!Array.isArray(rows)) throw new Error("Care tasks returned an invalid response");
	const shared = rows.filter((t) => {
		const code = String(t[F$3.TASK_HELP_STATUS] || "");
		return code === O.TASK_HELP_STATUS.TASK_NEEDS_HELP || code === O.TASK_HELP_STATUS.TASK_HAS_FOUND_HELP;
	}).map(mapShared).filter((t) => filters?.paid === void 0 ? true : t.needs_payment === filters.paid).filter((t) => filters?.status ? t.status === filters.status : true);
	const posterIds = [...new Set(shared.map((t) => numId(t.posted_by)).filter(Boolean))];
	const profiles = /* @__PURE__ */ new Map();
	await Promise.all(posterIds.map(async (id) => {
		try {
			profiles.set(id, await fetchWPUserPublicProfile(id));
		} catch {}
	}));
	return shared.map((t) => {
		const p = profiles.get(numId(t.posted_by));
		return {
			...t,
			poster: p ? {
				id: `wp-${numId(t.posted_by)}`,
				full_name: p.full_name,
				avatar_url: p.avatar_url,
				location: p.location
			} : null
		};
	});
}
/** Shared tasks I posted. */
async function fetchMyHelpTasksWordPress() {
	const stored = getStoredWPUser();
	if (!stored?.user_id) throw new Error("Not authenticated");
	const me = Number(stored.user_id);
	return (await fetchHelpTasksWordPress({ author: me })).filter((t) => numId(t.posted_by) === me);
}
/** People who offered to help one shared task — Relation 232 with its status meta. */
async function fetchTaskApplicantsWordPress(taskId) {
	const tid = numId(taskId);
	if (!tid) throw new Error("Invalid task id");
	const rels = await wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}/children/${tid}`);
	if (!Array.isArray(rels)) throw new Error(`Relation ${REL_TASK_ASSIGNEE} returned an invalid response`);
	const profiles = await Promise.all(rels.map(async (r) => {
		if (!r.child_object_id) return null;
		try {
			return await fetchWPUserPublicProfile(r.child_object_id);
		} catch {
			return null;
		}
	}));
	return rels.map((r, i) => {
		const meta = r.meta || r.meta_fields || null;
		return {
			id: `${tid}:${numId(r.child_object_id)}`,
			task_id: String(tid),
			applicant_id: r.child_object_id ? `wp-${numId(r.child_object_id)}` : null,
			applicant: profiles[i] ? {
				full_name: profiles[i].full_name,
				avatar_url: profiles[i].avatar_url
			} : null,
			status: RESPONSE_LABEL[String(meta?.[ASSIGNEE_FIELD])] || "pending",
			created_at: r.created_at || null
		};
	});
}
/** Offer to help: Relation 232 link (pending) + the message as a task comment. */
async function applyToSharedTaskWordPress(taskId, message) {
	const stored = getStoredWPUser();
	const me = stored?.user_id ? Number(stored.user_id) : null;
	if (!me) throw new Error("Not authenticated");
	const tid = numId(taskId);
	if (!tid) throw new Error("Invalid task id");
	await wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}`, {
		method: "POST",
		body: {
			parent_id: tid,
			child_id: me,
			context: "child",
			store_items_type: "update",
			meta: { [ASSIGNEE_FIELD]: RESPONSE_CODE["pending"] }
		}
	});
	if (message?.trim()) {
		const { createCommentWordPress } = await import("../_libs/_22.mjs").then((n) => n.i);
		const { R } = await import("../_libs/_2.mjs").then((n) => n.a);
		await createCommentWordPress({
			relationId: R.careTaskComments,
			parentId: String(tid),
			content: message.trim()
		});
	}
	try {
		const task = await wordpressCCTFetch(SLUG$2, { id: String(tid) });
		const posterId = task?.cct_author_id ?? task?.author_id;
		if (posterId) {
			const { notifyTaskHelpOffer } = await import("../_libs/_12.mjs").then((n) => n.n);
			await notifyTaskHelpOffer(posterId, String(task?.[F$3.TITLE] || ""), String(tid));
		}
	} catch {}
}
/** Shared tasks I offered to help with. */
async function fetchMyTaskApplicationsWordPress() {
	const stored = getStoredWPUser();
	if (!stored?.user_id) throw new Error("Not authenticated");
	const me = Number(stored.user_id);
	const rels = await wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}/parents/${me}`);
	if (!Array.isArray(rels)) throw new Error(`Relation ${REL_TASK_ASSIGNEE} returned an invalid response`);
	const taskIds = [...new Set(rels.map((r) => numId(r.parent_object_id)).filter(Boolean))];
	const tasks = await Promise.all(taskIds.map(async (id) => {
		try {
			return mapShared(await wordpressCCTFetch(SLUG$2, { id: String(id) }));
		} catch {
			return null;
		}
	}));
	return rels.map((r) => {
		const tid = numId(r.parent_object_id);
		const task = tasks.find((t) => t && Number(t.id) === tid) || null;
		const meta = r.meta || r.meta_fields || null;
		return {
			id: `${tid}:${me}`,
			task_id: String(tid),
			task,
			applicant_id: `wp-${me}`,
			status: RESPONSE_LABEL[String(meta?.[ASSIGNEE_FIELD])] || "pending",
			created_at: r.created_at || null
		};
	}).filter((a) => a.task);
}
/**
* Task owner decides on a helper. Accepting also moves the task to
* a65 = b57 "Task has found help"; rejecting unlinks the helper.
*/
async function decideTaskApplicantWordPress(applicationId, status) {
	const [taskId, userId] = applicationId.split(":").map(numId);
	if (!taskId || !userId) throw new Error("An application ID must be taskId:userId");
	if (status === "rejected") {
		await wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}`, {
			method: "POST",
			body: {
				parent_id: taskId,
				child_id: userId,
				context: "child",
				store_items_type: "disconnect"
			}
		});
		return;
	}
	await wordpressFetch(`jet-rel/${REL_TASK_ASSIGNEE}`, {
		method: "POST",
		body: {
			parent_id: taskId,
			child_id: userId,
			context: "child",
			store_items_type: "update",
			meta: { [ASSIGNEE_FIELD]: RESPONSE_CODE["accepted"] }
		}
	});
	await wordpressCCTFetch(SLUG$2, {
		id: String(taskId),
		method: "PUT",
		body: { [F$3.TASK_HELP_STATUS]: O.TASK_HELP_STATUS.TASK_HAS_FOUND_HELP }
	});
}
/** Share an existing task out for help (optionally paid). */
async function shareTaskWordPress(taskId, opts) {
	const tid = numId(taskId);
	if (!tid) throw new Error("Invalid task id");
	await wordpressCCTFetch(SLUG$2, {
		id: String(tid),
		method: "PUT",
		body: {
			[F$3.TASK_HELP_STATUS]: O.TASK_HELP_STATUS.TASK_NEEDS_HELP,
			[F$3.NEEDS_PAYMENT]: opts?.needs_payment ? O.NEEDS_PAYMENT.YES : O.NEEDS_PAYMENT.NO,
			[F$3.PRICE]: opts?.price || ""
		}
	});
}
/** Stop sharing a task (back to "doesn't need help"). */
async function unshareTaskWordPress(taskId) {
	const tid = numId(taskId);
	if (!tid) throw new Error("Invalid task id");
	await wordpressCCTFetch(SLUG$2, {
		id: String(tid),
		method: "PUT",
		body: { [F$3.TASK_HELP_STATUS]: O.TASK_HELP_STATUS.TASK_DOESN_T_NEED_HELP }
	});
}
var SLUG$1 = T.afreshCommunityPost.slug;
var F$2 = T.afreshCommunityPost.f;
R.communityPostComments;
R.commentReplies;
async function fetchCommunityPostsWordPress(locale) {
	try {
		const params = { _limit: 50 };
		params[F$2.COMMUNITY_TYPE] = communityTypeCode();
		if (locale?.category) params[F$2.COMMUNITY_POST_CATEGORY] = locale.category;
		const posts = await wordpressCCTFetch(SLUG$1, { params });
		if (!Array.isArray(posts)) return [];
		const matchesLocale = (p) => {
			if (locale?.area) {
				const raw = p[F$2.APP_AREA];
				const value = raw === null || raw === void 0 ? "" : String(raw);
				if (value && !value.includes(locale.area)) return false;
			}
			if (locale?.language) {
				const value = p[F$2.LANGUAGE] ? String(p[F$2.LANGUAGE]) : "";
				if (value && value !== locale.language) return false;
			}
			return true;
		};
		return posts.filter(matchesLocale).map((p) => ({
			id: p.id,
			title: p[F$2.TITLE] || "",
			content: p[F$2.CONTENT] || "",
			community_type: p[F$2.COMMUNITY_TYPE] || null,
			app_area: p[F$2.APP_AREA] || null,
			language: p[F$2.LANGUAGE] || null,
			category: p[F$2.COMMUNITY_POST_CATEGORY] || null,
			author_id: p.author_id,
			created_at: p.created_at,
			updated_at: p.updated_at
		}));
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
async function fetchCommunityPostByIdWordPress(id) {
	try {
		const p = await wordpressCCTFetch(SLUG$1, { id });
		if (!p) return null;
		return {
			id: p.id,
			title: p[F$2.TITLE] || "",
			content: p[F$2.CONTENT] || "",
			community_type: p[F$2.COMMUNITY_TYPE] || null,
			app_area: p[F$2.APP_AREA] || null,
			language: p[F$2.LANGUAGE] || null,
			category: p[F$2.COMMUNITY_POST_CATEGORY] || null,
			author_id: p.author_id,
			created_at: p.created_at,
			updated_at: p.updated_at
		};
	} catch (e) {
		throw e instanceof Error ? e : new Error(String(e));
	}
}
async function createCommunityPostWordPress(post) {
	const result = await wordpressCCTFetch(SLUG$1, {
		method: "POST",
		body: {
			[F$2.TITLE]: post.title,
			[F$2.CONTENT]: post.content,
			[F$2.COMMUNITY_TYPE]: communityTypeCode(),
			[F$2.APP_AREA]: post.app_area || "",
			[F$2.LANGUAGE]: post.language || "",
			[F$2.COMMUNITY_POST_CATEGORY]: post.category || ""
		}
	});
	return { id: String(result?.item_id || result?.id || result?._ID) };
}
async function updateCommunityPostWordPress(id, updates) {
	const body = {};
	if (updates.title !== void 0) body[F$2.TITLE] = updates.title;
	if (updates.content !== void 0) body[F$2.CONTENT] = updates.content;
	if (updates.app_area !== void 0) body[F$2.APP_AREA] = updates.app_area;
	if (updates.language !== void 0) body[F$2.LANGUAGE] = updates.language;
	if (updates.category !== void 0) body[F$2.COMMUNITY_POST_CATEGORY] = updates.category;
	await wordpressCCTFetch(SLUG$1, {
		id,
		method: "PUT",
		body
	});
}
async function deleteCommunityPostWordPress(id) {
	await wordpressCCTFetch(SLUG$1, {
		id,
		method: "DELETE"
	});
}
T.comment.slug;
T.comment.f;
/**
* Posts data source.
*
* There is no WordPress CPT behind community content — everything lives in the
* shared "Afresh community post" CCT (149). The row's Community-type radio
* scopes it to ChallengeD / Care-CNC, and the Community-post-category radio
* separates discussions from articles. Codes are opaque and come from the
* dictionary via `T`, never inferred.
*/
var CATEGORY = T.afreshCommunityPost.opt.COMMUNITY_POST_CATEGORY;
var AREA = T.afreshCommunityPost.opt.APP_AREA;
var LANGUAGE = T.afreshCommunityPost.opt.LANGUAGE;
/** Logical post types used by the UI. */
var ARTICLE_TYPES = [
	"challenged_article",
	"article",
	"care_article"
];
/** Map a UI post type to the opaque Community-post-category code. */
function postCategoryCode(postType) {
	return postType && ARTICLE_TYPES.includes(postType) ? CATEGORY.ARTICLE : CATEGORY.DISCUSSION;
}
/** Map the UI's area string ("china" / "global") to its opaque checkbox code. */
function areaCode(area) {
	if (!area) return void 0;
	return area === "china" ? AREA.CHINA : AREA.GLOBAL_ENGLISH;
}
/** Map an i18n language tag to its opaque radio code. */
function languageCode(language) {
	if (!language) return void 0;
	return language.startsWith("zh") ? LANGUAGE.SIMPLIFIED_CHINESE : LANGUAGE.ENGLISH;
}
async function fetchPostsWordPress(postType, area, _childPostType) {
	return fetchCommunityPostsWordPress({
		area: areaCode(area),
		category: postCategoryCode(postType)
	});
}
async function fetchPostByIdWordPress(id, _postType) {
	return fetchCommunityPostByIdWordPress(id);
}
async function createPostWordPress(post) {
	const pt = post.postType || post.post_type;
	return createCommunityPostWordPress({
		title: post.title,
		content: post.content || "",
		app_area: areaCode(post.area),
		language: languageCode(post.language),
		category: postCategoryCode(pt)
	});
}
async function updatePostWordPress(id, updates, _postType) {
	await updateCommunityPostWordPress(id, {
		title: updates.title,
		content: updates.content
	});
}
async function deletePostWordPress(id, _postType) {
	await deleteCommunityPostWordPress(id);
}
/**
* Saved providers (favorites).
*
* Backed by JetEngine Relation 295 —
*   "295. One user can have many related saved/favorite care givers"
*   Users -> Users (Many to Many)
* Parent = the signed-in user, Child = the saved care provider.
* No local storage, no invented table: favorites follow the account.
*/
/** Relation 295 — user → saved/favorite care givers (verified live on /wp-json/jet-rel/295). */
var REL_SAVED_PROVIDERS = 295;
var stripWp = (v) => v == null ? "" : String(v).replace(/^wp-/, "");
function requireUserId() {
	const stored = getStoredWPUser();
	const id = stored?.user_id ? Number(stored.user_id) : null;
	if (!id) throw new Error("Not authenticated");
	return id;
}
async function fetchSavedProvidersWordPress() {
	const userId = requireUserId();
	const rels = await wordpressFetch(`jet-rel/${REL_SAVED_PROVIDERS}/children/${userId}`);
	if (!Array.isArray(rels)) throw new Error(`Relation ${REL_SAVED_PROVIDERS} returned an invalid response`);
	return (await Promise.all(rels.map(async (r) => {
		const childId = r.child_object_id ?? r.child_id;
		if (!childId) return null;
		let provider = null;
		try {
			provider = await fetchProviderByIdWordPress(`wp-${childId}`);
		} catch {
			provider = null;
		}
		if (!provider) return null;
		return {
			id: String(r._ID || r.id || `${userId}-${childId}`),
			provider_id: `wp-${childId}`,
			provider,
			provider_name: provider.full_name ?? null,
			provider_avatar: provider.avatar_url ?? null,
			created_at: r.created_at || null
		};
	}))).filter(Boolean);
}
async function toggleSavedProviderWordPress(providerId) {
	const userId = requireUserId();
	const childId = Number(stripWp(providerId));
	if (!childId) throw new Error("Invalid provider id");
	const rels = await wordpressFetch(`jet-rel/${REL_SAVED_PROVIDERS}/children/${userId}`);
	const already = Array.isArray(rels) && rels.some((r) => Number(r.child_object_id ?? r.child_id) === childId);
	await wordpressFetch(`jet-rel/${REL_SAVED_PROVIDERS}`, {
		method: "POST",
		body: {
			parent_id: userId,
			child_id: childId,
			context: "child",
			store_items_type: already ? "disconnect" : "update"
		}
	});
}
/**
* Votes — JetEngine CCT 30 "Vote" (a55: b55 = Upvote, b56 = Downvote).
*
* A vote row is linked to what it votes on ONLY through a JetEngine relation,
* addressed by its dictionary number:
*   166  149. Community post → 30. Vote   (R.communityPostVotes)
*   167  141. Comment        → 30. Vote   (R.commentVotes)
*
* The voter is the vote row's own JetEngine author (cct_author_id), a native
* CCT column — no custom user/vote link is invented.
*/
/** Relation numbers that may carry votes. Anything else is a caller bug. */
var VOTE_RELATIONS = [R.communityPostVotes, R.commentVotes];
var SLUG = T.vote.slug;
var F$1 = T.vote.f.UPVOTE_OR_DOWNVOTE;
var UP = T.vote.opt.UPVOTE_OR_DOWNVOTE.UPVOTE;
var DOWN = T.vote.opt.UPVOTE_OR_DOWNVOTE.DOWNVOTE;
var strip = (v) => String(v).replace(/^wp-/, "");
function assertRelation(relationId) {
	if (!VOTE_RELATIONS.includes(relationId)) throw new Error(`Relation ${relationId} is not a vote relation (allowed: ${VOTE_RELATIONS.join(", ")})`);
}
function toRow(raw) {
	const code = String(raw?.[F$1] ?? "");
	const value = code === UP ? 1 : code === DOWN ? -1 : 0;
	return {
		id: String(raw.id ?? raw._ID),
		value,
		authorId: raw.author_id ?? (raw.cct_author_id != null ? String(raw.cct_author_id) : null)
	};
}
async function fetchVoteRows(ids) {
	return Promise.all(ids.map(async (id) => toRow(await wordpressCCTFetch(SLUG, { id }))));
}
/** Pure tally — exported for tests. */
function summarize(rows, me) {
	let upvotes = 0;
	let downvotes = 0;
	let userVote = 0;
	for (const r of rows) {
		if (r.value === 1) upvotes++;
		else if (r.value === -1) downvotes++;
		if (me && r.authorId === me && r.value !== 0) userVote = r.value;
	}
	return {
		score: upvotes - downvotes,
		upvotes,
		downvotes,
		userVote
	};
}
async function loadRelation(relationId) {
	const map = await fetchRelChildrenMap(relationId);
	if (!map.loaded) throw new Error(`Could not read JetEngine relation ${relationId}`);
	return map;
}
async function fetchVoteSummaries(relationId, parentIds) {
	assertRelation(relationId);
	const me = getCurrentUserId() ? strip(getCurrentUserId()) : null;
	const out = {};
	await Promise.all(parentIds.map(async (pid) => {
		const rows = await fetchVoteRows((await fetchRelChildrenOf(relationId, strip(pid))).map((c) => c.childId));
		out[pid] = summarize(rows, me);
	}));
	return out;
}
async function fetchVoteSummary(relationId, parentId) {
	return (await fetchVoteSummaries(relationId, [parentId]))[parentId];
}
/**
* Same value again = remove my vote; other value = switch; none = create.
* Create writes the CCT 30 row and then links it through the relation; if the
* link fails the new row is deleted so no orphan vote is left behind.
*/
async function toggleVote(relationId, parentId, value) {
	assertRelation(relationId);
	const meRaw = getCurrentUserId();
	if (!meRaw) throw new Error("Please sign in to vote");
	const me = strip(meRaw);
	const parent = Number(strip(parentId));
	if (!Number.isFinite(parent) || parent <= 0) throw new Error(`Invalid item id: ${parentId}`);
	const mine = (await fetchVoteRows(((await loadRelation(relationId)).get(String(parent)) || []).map((c) => c.childId))).filter((r) => r.authorId === me);
	if (mine.length) {
		const [first, ...extra] = mine;
		if (first.value === value) {
			for (const r of mine) await removeVote(relationId, parent, r.id);
			return;
		}
		await wordpressCCTFetch(SLUG, {
			id: first.id,
			method: "PUT",
			body: { [F$1]: value === 1 ? UP : DOWN }
		});
		for (const r of extra) await removeVote(relationId, parent, r.id);
		return;
	}
	const created = await wordpressCCTFetch(SLUG, {
		method: "POST",
		body: { [F$1]: value === 1 ? UP : DOWN }
	});
	const voteId = Number(created?.item_id ?? created?._ID ?? created?.id);
	if (!Number.isFinite(voteId) || voteId <= 0) throw new Error("Vote was not created: backend returned no item id");
	try {
		await wordpressFetch(`jet-rel/${relationId}`, {
			method: "POST",
			body: {
				parent_id: parent,
				child_id: voteId,
				context: "child",
				store_items_type: "update"
			}
		});
	} catch (e) {
		await wordpressCCTFetch(SLUG, {
			id: String(voteId),
			method: "DELETE"
		}).catch(() => void 0);
		throw e instanceof Error ? e : new Error(String(e));
	}
}
async function removeVote(relationId, parent, voteId) {
	await wordpressFetch(`jet-rel/${relationId}`, {
		method: "POST",
		body: {
			parent_id: parent,
			child_id: Number(voteId),
			context: "child",
			store_items_type: "disconnect"
		}
	});
	await wordpressCCTFetch(SLUG, {
		id: voteId,
		method: "DELETE"
	});
}
var REL_USER_INFO_CARD = R.caredOneInfoCards;
var REL_INFO_CARD_EMERGENCY = R.infoCardEmergencyContacts;
var CCT_SLUG = T.infoCard.slug;
var F = T.infoCard.f;
var STATUS_TO_CODE = {
	Draft: "b55",
	Active: "b56",
	Paused: "b57",
	draft: "b55",
	active: "b56",
	paused: "b57"
};
var STATUS_FROM_CODE = {
	b55: "Draft",
	b56: "Active",
	b57: "Paused"
};
var YESNO_TO_CODE = {
	Yes: "b55",
	No: "b56"
};
var YESNO_FROM_CODE = {
	b55: "Yes",
	b56: "No"
};
var VIS_TO_CODE = {
	"Visible to public": "b55",
	"Visible to the care group of the cared one": "b56",
	"Visible to caregivers of the cared one": "b57",
	"Visible to the care group of the cared one and the caregivers of the cared one": "b58"
};
var VIS_FROM_CODE = {
	b55: "Visible to public",
	b56: "Visible to the care group of the cared one",
	b57: "Visible to caregivers of the cared one",
	b58: "Visible to the care group of the cared one and the caregivers of the cared one"
};
var AFTER_EXPIRY_DEFAULT = "Visible to the care group of the cared one and the caregivers of the cared one";
/** Parse a JetEngine datetime-local value; legacy non-date text counts as empty. */
function parseCardDate(v) {
	const s = String(v ?? "").trim();
	if (!/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/.test(s)) return null;
	const t = new Date(s.replace(" ", "T")).getTime();
	return Number.isFinite(t) ? t : null;
}
/** Datetime-local string ("YYYY-MM-DDTHH:mm") for a local time. */
function toDatetimeLocal(ms = Date.now()) {
	const d = new Date(ms);
	const p = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
/**
* Start/expiry only apply to public cards. Before the start, or once an
* expiring public share has passed its end time, the card falls back to a621
* (default: care group + caregivers). The author can always see the card.
*/
function effectiveVisibility(card, now = Date.now()) {
	const v = String(card.share_visibility || "");
	if (v !== "Visible to public") return v;
	const fallback = card.share_visibility_after_expiry || AFTER_EXPIRY_DEFAULT;
	const start = parseCardDate(card.public_share_starts_at);
	if (start !== null && now < start) return fallback;
	if (card.public_share_expires === "Yes") {
		const end = parseCardDate(card.public_share_expires_at);
		if (end !== null && now >= end) return fallback;
	}
	return v;
}
/** True when the stored a62 is public but the public window has ended. */
function publicShareHasExpired(card, now = Date.now()) {
	if (card.share_visibility !== "Visible to public" || card.public_share_expires !== "Yes") return false;
	const end = parseCardDate(card.public_share_expires_at);
	return end !== null && now >= end;
}
/** Persist the automatic switch a62 := a621 once a public share expires. */
async function applyExpiry(card) {
	if (!publicShareHasExpired(card)) return card;
	const next = card.share_visibility_after_expiry || AFTER_EXPIRY_DEFAULT;
	if (getStoredWPUser()?.user_id) try {
		await updateInformationCardWordPress(card.id, { share_visibility: next });
	} catch {}
	return {
		...card,
		share_visibility: next
	};
}
function decodeCard(raw) {
	const status = STATUS_FROM_CODE[String(raw[F.STATUS])];
	const displaysLocation = YESNO_FROM_CODE[String(raw[F.DISPLAYS_LOCATION])];
	const visibility = VIS_FROM_CODE[String(raw[F.SHARE_VISIBILITY])];
	if (!status || !displaysLocation || !visibility) throw new Error(`Information card ${raw._ID || raw.id} contains an invalid option code`);
	return {
		id: String(raw._ID || raw.id),
		cared_ones_name: raw[F.CARED_ONE_S_NAME] || "",
		cared_ones_description: raw[F.CARED_ONE_S_DESCRIPTION] || "",
		cared_ones_information_card_name: raw[F.CARED_ONE_S_INFORMATION_CARD_NAME] || "",
		cared_ones_information_card_description: raw[F.CARED_ONE_S_INFORMATION_CARD_DESCRIPTION] || "",
		status,
		displays_location: displaysLocation,
		public_share_starts_at: parseCardDate(raw[F.PUBLIC_SHARE_STARTS_AT]) !== null ? String(raw[F.PUBLIC_SHARE_STARTS_AT]) : "",
		public_share_expires_at: parseCardDate(raw[F.PUBLIC_SHARE_EXPIRES_AT]) !== null ? String(raw[F.PUBLIC_SHARE_EXPIRES_AT]) : "",
		public_share_expires: YESNO_FROM_CODE[String(raw[F.PUBLIC_SHARE_EXPIRES])] || "No",
		share_visibility: visibility,
		share_visibility_after_expiry: VIS_FROM_CODE[String(raw[F.SHARE_VISIBILITY_AFTER_PUBLIC_EXPIRES])] || "",
		cct_author_id: raw.cct_author_id,
		cct_created: raw.cct_created
	};
}
function encodeCardUpdates(u) {
	const b = {};
	if (u.cared_ones_name !== void 0) b[F.CARED_ONE_S_NAME] = u.cared_ones_name || "";
	if (u.cared_ones_description !== void 0) b[F.CARED_ONE_S_DESCRIPTION] = u.cared_ones_description || "";
	if (u.cared_ones_information_card_name !== void 0) b[F.CARED_ONE_S_INFORMATION_CARD_NAME] = u.cared_ones_information_card_name || "";
	if (u.cared_ones_information_card_description !== void 0) b[F.CARED_ONE_S_INFORMATION_CARD_DESCRIPTION] = u.cared_ones_information_card_description || "";
	if (u.status !== void 0) {
		const code = STATUS_TO_CODE[String(u.status)];
		if (!code) throw new Error(`Invalid information-card status: ${u.status}`);
		b[F.STATUS] = code;
	}
	if (u.displays_location !== void 0) {
		const code = YESNO_TO_CODE[String(u.displays_location)];
		if (!code) throw new Error(`Invalid displays-location value: ${u.displays_location}`);
		b[F.DISPLAYS_LOCATION] = code;
	}
	if (u.public_share_starts_at !== void 0) b[F.PUBLIC_SHARE_STARTS_AT] = u.public_share_starts_at || "";
	if (u.public_share_expires_at !== void 0) b[F.PUBLIC_SHARE_EXPIRES_AT] = u.public_share_expires_at || "";
	if (u.public_share_expires !== void 0) {
		const code = YESNO_TO_CODE[String(u.public_share_expires)];
		if (!code) throw new Error(`Invalid public-share-expires value: ${u.public_share_expires}`);
		b[F.PUBLIC_SHARE_EXPIRES] = code;
	}
	if (u.share_visibility_after_expiry !== void 0) if (!u.share_visibility_after_expiry) b[F.SHARE_VISIBILITY_AFTER_PUBLIC_EXPIRES] = "";
	else {
		const code = VIS_TO_CODE[String(u.share_visibility_after_expiry)];
		if (!code || code === "b55") throw new Error(`Invalid after-expiry visibility: ${u.share_visibility_after_expiry}`);
		b[F.SHARE_VISIBILITY_AFTER_PUBLIC_EXPIRES] = code;
	}
	if (u.share_visibility !== void 0) {
		const code = VIS_TO_CODE[String(u.share_visibility)];
		if (!code) throw new Error(`Invalid information-card visibility: ${u.share_visibility}`);
		b[F.SHARE_VISIBILITY] = code;
	}
	return b;
}
function normalizeWpId(value) {
	return Number(String(value ?? "").replace(/^wp-/, ""));
}
async function fetchInformationCardsWordPress(caredOneId) {
	const id = normalizeWpId(caredOneId);
	if (!id) return [];
	const rels = await wordpressFetch(`jet-rel/${REL_USER_INFO_CARD}/children/${id}`);
	if (!Array.isArray(rels)) throw new Error(`Relation ${REL_USER_INFO_CARD} returned an invalid response`);
	return (await Promise.all(rels.map(async (rel) => {
		try {
			const raw = await wordpressCCTFetch(CCT_SLUG, { id: rel.child_object_id });
			return raw && typeof raw === "object" ? await applyExpiry(decodeCard(raw)) : null;
		} catch {
			return null;
		}
	}))).filter((card) => card !== null);
}
async function fetchInformationCardWordPress(cardId) {
	const raw = await wordpressCCTFetch(CCT_SLUG, { id: normalizeWpId(cardId) });
	return raw && typeof raw === "object" ? decodeCard(raw) : null;
}
/** REL 220 parent = the cared one (WP user) this card belongs to. */
async function fetchInformationCardCaredOneIdWordPress(cardId) {
	const id = normalizeWpId(cardId);
	if (!id) return null;
	try {
		const rels = await wordpressFetch(`jet-rel/${REL_USER_INFO_CARD}/parents/${id}`);
		if (!Array.isArray(rels) || rels.length === 0) return null;
		return String(rels[0].parent_object_id);
	} catch {
		return null;
	}
}
/** Thrown by the share viewer when the reader may not see a non-public card. */
var ShareAccessError = class extends Error {
	reason;
	constructor(reason) {
		super(reason);
		this.reason = reason;
	}
};
var REL_CAREGIVER_CARED_ONE = R.userCaredOnes;
var REL_GROUP_MEMBER = R.careGroupMembers;
async function viewerIsCaregiverOf(viewerId, caredOneId) {
	const { decodeRel219Status } = await import("../_libs/_8.mjs").then((n) => n.r);
	const rels = await wordpressFetch(`jet-rel/${REL_CAREGIVER_CARED_ONE}/children/${viewerId}`);
	return Array.isArray(rels) && rels.some((r) => Number(r.child_object_id) === caredOneId && decodeRel219Status(r?.meta) === "accepted");
}
async function viewerSharesGroupWith(viewerId, caredOneId) {
	const groups = await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}/parents/${viewerId}`);
	if (!Array.isArray(groups)) return false;
	for (const g of groups) {
		const members = await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}/children/${Number(g.parent_object_id)}`);
		if (Array.isArray(members) && members.some((m) => Number(m.child_object_id) === caredOneId)) return true;
	}
	return false;
}
/** Fixed card-ID link. Always check the card's current visibility. */
async function fetchSharedInformationCardWordPress(cardId) {
	if (!/^\d+$/.test(cardId) || !normalizeWpId(cardId)) return null;
	const stored = await fetchInformationCardWordPress(cardId);
	if (!stored) return null;
	const card = await applyExpiry(stored);
	const v = effectiveVisibility(card);
	if (v === "Visible to public") return card;
	const viewer = Number(getStoredWPUser()?.user_id || 0);
	if (!viewer) throw new ShareAccessError("login");
	if (Number(card.cct_author_id) === viewer) return card;
	const caredOne = Number(await fetchInformationCardCaredOneIdWordPress(card.id) || 0);
	if (!caredOne) throw new ShareAccessError("forbidden");
	const groupOk = v === "Visible to the care group of the cared one" || v === "Visible to the care group of the cared one and the caregivers of the cared one";
	if ((v === "Visible to caregivers of the cared one" || v === "Visible to the care group of the cared one and the caregivers of the cared one") && await viewerIsCaregiverOf(viewer, caredOne)) return card;
	if (groupOk && await viewerSharesGroupWith(viewer, caredOne)) return card;
	throw new ShareAccessError("forbidden");
}
async function createInformationCardWordPress(input) {
	if (!getStoredWPUser()?.user_id) throw new Error("Not authenticated");
	const parentId = normalizeWpId(input.caredOneUserId);
	if (!parentId) throw new Error("Invalid cared one");
	const created = await wordpressCCTFetch(CCT_SLUG, {
		method: "POST",
		body: encodeCardUpdates({
			cared_ones_name: input.cared_ones_name || "",
			cared_ones_description: input.cared_ones_description || "",
			cared_ones_information_card_name: input.cared_ones_information_card_name,
			cared_ones_information_card_description: input.cared_ones_information_card_description || "",
			status: input.status || "Draft",
			displays_location: input.displays_location || "No",
			share_visibility: input.share_visibility || "Visible to caregivers of the cared one",
			public_share_starts_at: input.public_share_starts_at || toDatetimeLocal(),
			public_share_expires: input.public_share_expires || "No",
			public_share_expires_at: input.public_share_expires === "Yes" ? input.public_share_expires_at || "" : "",
			share_visibility_after_expiry: input.public_share_expires === "Yes" ? input.share_visibility_after_expiry || AFTER_EXPIRY_DEFAULT : ""
		})
	});
	const childId = created?.item_id || created?._ID || created?.id;
	if (!childId) throw new Error("Information card was created without an item ID");
	await wordpressFetch(`jet-rel/${REL_USER_INFO_CARD}`, {
		method: "POST",
		body: {
			parent_id: parentId,
			child_id: Number(childId),
			context: "child",
			store_items_type: "update"
		}
	});
	return decodeCard(await wordpressCCTFetch(CCT_SLUG, { id: Number(childId) }));
}
async function updateInformationCardWordPress(id, updates) {
	const body = encodeCardUpdates(updates);
	await wordpressCCTFetch(CCT_SLUG, {
		id: normalizeWpId(id),
		method: "PUT",
		body
	});
}
async function deleteInformationCardWordPress(id) {
	await wordpressCCTFetch(CCT_SLUG, {
		id: normalizeWpId(id),
		method: "DELETE"
	});
}
async function fetchInformationCardContactIdsWordPress(cardId) {
	const id = normalizeWpId(cardId);
	if (!id) return [];
	try {
		const rels = await wordpressFetch(`jet-rel/${REL_INFO_CARD_EMERGENCY}/children/${id}`);
		if (!Array.isArray(rels)) return [];
		return rels.map((r) => String(r.child_object_id));
	} catch {
		return [];
	}
}
async function setInformationCardContactsWordPress(cardId, contactIds) {
	const parentId = normalizeWpId(cardId);
	if (!parentId) throw new Error("Invalid card");
	const current = await fetchInformationCardContactIdsWordPress(cardId);
	const currentSet = new Set(current.map(String));
	const desiredSet = new Set(contactIds.map((c) => String(normalizeWpId(c))));
	const toAdd = [...desiredSet].filter((c) => !currentSet.has(c));
	for (const childId of toAdd) await wordpressFetch(`jet-rel/${REL_INFO_CARD_EMERGENCY}`, {
		method: "POST",
		body: {
			parent_id: parentId,
			child_id: Number(childId),
			context: "child",
			store_items_type: "update"
		}
	});
	const toRemove = [...currentSet].filter((c) => !desiredSet.has(c));
	for (const childId of toRemove) await wordpressFetch(`jet-rel/${REL_INFO_CARD_EMERGENCY}`, {
		method: "POST",
		body: {
			parent_id: parentId,
			child_id: Number(childId),
			context: "child",
			store_items_type: "disconnect"
		}
	});
}
function usePostTypes(_level, _parentId) {
	return useQuery({
		queryKey: ["postTypes"],
		queryFn: async () => []
	});
}
function useCategoryTypes() {
	return useQuery({
		queryKey: ["categoryTypes"],
		queryFn: async () => []
	});
}
function useEntityCategoryOptions(_postId) {
	return useQuery({
		queryKey: ["entityCategoryOptions", _postId],
		queryFn: async () => [],
		enabled: !!_postId
	});
}
function useCustomFieldTypes() {
	return useQuery({
		queryKey: ["customFieldTypes"],
		queryFn: async () => []
	});
}
function useEntityCustomFieldValues(_postId) {
	return useQuery({
		queryKey: ["entityCustomFieldValues", _postId],
		queryFn: async () => [],
		enabled: !!_postId
	});
}
function dedupeFacilities(list) {
	const map = /* @__PURE__ */ new Map();
	list.forEach((item) => map.set(item.id, item));
	return Array.from(map.values());
}
function useProviders(filters) {
	return useQuery({
		queryKey: ["providers"],
		queryFn: fetchProviderDirectoryWordPress,
		staleTime: 6e4,
		select: (list) => filterProviders(list, filters)
	});
}
function useProvider(id) {
	return useQuery({
		queryKey: ["provider", id],
		queryFn: () => fetchProviderByIdWordPress(id),
		enabled: !!id
	});
}
function useCareFacilities(filters) {
	return useQuery({
		queryKey: ["facilities"],
		queryFn: fetchCareFacilitiesWordPress,
		staleTime: 6e4,
		select: (raw) => {
			let results = dedupeFacilities(raw);
			if (filters?.query) {
				const q = filters.query.toLowerCase();
				results = results.filter((f) => f.name?.toLowerCase().includes(q) || f.description?.toLowerCase().includes(q));
			}
			if (filters?.location) {
				const loc = filters.location.toLowerCase();
				results = results.filter((f) => f.location?.toLowerCase().includes(loc) || f.address?.toLowerCase().includes(loc));
			}
			if (filters?.facilityTypes?.length) results = results.filter((f) => toCodeList(f.type).some((code) => filters.facilityTypes.includes(code)));
			if (filters?.dementiaStages?.length) results = results.filter((f) => toCodeList(f.dementia_stage).some((code) => filters.dementiaStages.includes(code)));
			return results;
		}
	});
}
function useCareFacility(id) {
	return useQuery({
		queryKey: ["facility", id],
		queryFn: () => fetchCareFacilityByIdWordPress(id),
		enabled: !!id
	});
}
function useFacilityReviewSummaries(facilityIds) {
	return useQuery({
		queryKey: ["facilityReviewSummaries", facilityIds],
		queryFn: () => fetchFacilityReviewSummariesWordPress(facilityIds),
		enabled: facilityIds.length > 0
	});
}
function useFacilityMembers(facilityId) {
	return useQuery({
		queryKey: ["facilityMembers", facilityId],
		queryFn: () => fetchFacilityMembersWordPress(facilityId),
		enabled: !!facilityId
	});
}
function useMyFacilityPermission(facilityId) {
	return useQuery({
		queryKey: ["myFacilityPermission", facilityId],
		queryFn: () => getMyFacilityPermissionWordPress(facilityId),
		enabled: !!facilityId
	});
}
function useCreateCareFacility() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input) => createCareFacilityWordPress(input),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["facilities"] });
		}
	});
}
function useFacilityOwnershipClaims(facilityId) {
	return useQuery({
		queryKey: ["facilityOwnershipClaims", facilityId],
		queryFn: () => fetchFacilityClaimsOnlyWordPress(facilityId),
		enabled: !!facilityId
	});
}
function useFacilityOwnershipDisputes(facilityId) {
	return useQuery({
		queryKey: ["facilityOwnershipDisputes", facilityId],
		queryFn: () => fetchFacilityDisputesWordPress(facilityId),
		enabled: !!facilityId
	});
}
function useCreateFacilityOwnershipClaim() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input) => createFacilityOwnershipClaimWordPress(input),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["facilityOwnershipClaims"] });
			qc.invalidateQueries({ queryKey: ["facilityOwnershipDisputes"] });
		}
	});
}
function useUpdateCareFacility() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...updates }) => updateCareFacilityWordPress(id, updates),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["facilities"] });
			qc.invalidateQueries({ queryKey: ["facility"] });
		}
	});
}
function useEntityReviews(entityId, entityType = "provider") {
	return useQuery({
		queryKey: [
			"entityReviews",
			entityType,
			entityId
		],
		queryFn: () => fetchEntityReviewsWordPress(entityId, entityType),
		enabled: !!entityId
	});
}
function useProviderReviews(providerId) {
	return useEntityReviews(providerId, "provider");
}
function useFacilityReviews(facilityId) {
	return useEntityReviews(facilityId, "facility");
}
function useCreateReview() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (review) => createReviewWordPress(review),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["entityReviews"] });
			qc.invalidateQueries({ queryKey: ["facilityReviewSummaries"] });
			qc.invalidateQueries({ queryKey: ["providerRatingSummary"] });
		}
	});
}
function useBookings() {
	return useQuery({
		queryKey: ["bookings"],
		queryFn: withLastGood("bookings", fetchBookingsWordPress),
		initialData: () => readLastGood("bookings"),
		initialDataUpdatedAt: 0
	});
}
function useProviderBookings() {
	return useQuery({
		queryKey: ["providerBookings"],
		queryFn: withLastGood("providerBookings", fetchProviderBookingsWordPress),
		initialData: () => readLastGood("providerBookings"),
		initialDataUpdatedAt: 0
	});
}
function useConversations() {
	const me = getStoredWPUser();
	const myId = me ? `wp-${me.user_id}` : "";
	return useQuery({
		queryKey: ["conversations", myId],
		queryFn: () => fetchConversationsWordPress(myId),
		enabled: !!myId,
		refetchInterval: 3e4
	});
}
/**
* react-query keeps `isLoading` true for *disabled* queries (status stays
* "pending" while fetchStatus is "idle"), which makes skeletons hang forever
* when the query has no id yet. Normalize that once, here.
*/
function withIdleAwareLoading(q) {
	return q.fetchStatus === "idle" && q.isLoading ? {
		...q,
		isLoading: false
	} : q;
}
function useDirectMessages(otherUserId) {
	return withIdleAwareLoading(useQuery({
		queryKey: ["messages", otherUserId],
		queryFn: () => fetchDirectMessagesWordPress(otherUserId),
		enabled: !!otherUserId
	}));
}
/**
* Group live chat (per spec: REL 140 care_group → chat_conversation, 1:1).
* Resolves the group's conversation id, then fetches its messages via REL 143.
*/
function useGroupMessages(groupId) {
	return useQuery({
		queryKey: ["groupMessages", groupId],
		queryFn: async () => {
			if (!groupId) return [];
			const convoId = await getOrCreateGroupConversationWordPress(groupId);
			if (!convoId) return [];
			return fetchDirectMessagesWordPress(convoId);
		},
		enabled: !!groupId,
		refetchInterval: 15e3,
		refetchIntervalInBackground: false
	});
}
function useSendMessage() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			const me = getStoredWPUser();
			const senderId = me ? `wp-${me.user_id}` : "";
			if (!senderId) throw new Error("Not authenticated");
			let convoId = null;
			if ("groupId" in input && input.groupId) convoId = await getOrCreateGroupConversationWordPress(input.groupId);
			else if ("conversationId" in input) convoId = input.conversationId;
			if (!convoId) throw new Error("No conversation");
			const receiver = "receiverUserId" in input && input.receiverUserId ? input.receiverUserId : "";
			return sendMessageWordPress(convoId, input.content, senderId, receiver);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["messages"] });
			qc.invalidateQueries({ queryKey: ["groupMessages"] });
			qc.invalidateQueries({ queryKey: ["conversations"] });
		}
	});
}
function useMarkMessagesRead() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (conversationId) => markMessagesReadWordPress(conversationId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["conversations"] });
		}
	});
}
function useStartConversation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (otherUserId) => {
			const uid = typeof otherUserId === "string" ? otherUserId : otherUserId.otherUserId;
			const me = getStoredWPUser();
			const myId = me ? `wp-${me.user_id}` : "";
			if (!myId) throw new Error("Not authenticated");
			return startConversationWordPress(uid, myId);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["conversations"] });
		}
	});
}
function useCareGroups() {
	return useQuery({
		queryKey: ["careGroups"],
		queryFn: () => fetchCareGroupsWordPress()
	});
}
function useCareGroupMembers(groupId) {
	return withIdleAwareLoading(useQuery({
		queryKey: ["careGroupMembers", groupId],
		queryFn: () => fetchCareGroupMembersWordPress(groupId),
		enabled: !!groupId
	}));
}
function useCreateCareGroup() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (group) => createCareGroupWordPress(group),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careGroups"] });
		}
	});
}
/** Rel 223 a55 — my display name inside one care group. */
function useUpdateMyGroupDisplayName() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ groupId, displayName }) => setMyGroupDisplayNameWordPress(groupId, displayName),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careGroupMembers"] });
		}
	});
}
function useInviteToGroup() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ groupId, userId, email, invitedAs }) => inviteToGroupWordPress(groupId, userId || email || "", invitedAs || "normal group member"),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careGroupMembers"] });
			qc.invalidateQueries({ queryKey: ["groupInvites"] });
			qc.invalidateQueries({ queryKey: ["groupInvitations"] });
		}
	});
}
function useUpdateMemberRole() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ memberId, groupId, role, updates }) => updateMemberRoleWordPress(memberId, updates ?? role ?? {}, groupId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careGroupMembers"] });
		}
	});
}
function useRemoveGroupMember() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ memberId, groupId }) => removeGroupMemberWordPress(memberId, groupId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careGroupMembers"] });
		}
	});
}
function useCareGroupGallery(groupId) {
	return useQuery({
		queryKey: ["careGroupGallery", groupId],
		queryFn: () => fetchCareGroupGalleryWordPress(groupId),
		enabled: !!groupId
	});
}
function useCareTasks(groupId) {
	return useQuery({
		queryKey: ["careTasks", groupId],
		queryFn: async () => {
			return await filterVisibleTasks(await fetchCareTasksWordPress(groupId));
		}
	});
}
function useCreateTask() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (task) => {
			const { subgroupIds, visibilityUserIds, ...payload } = task;
			const newId = await createCareTaskWordPress(payload);
			if (newId && ((subgroupIds?.length ?? 0) > 0 || (visibilityUserIds?.length ?? 0) > 0)) await setTaskVisibility(newId, subgroupIds || [], visibilityUserIds || []);
			try {
				const groupId = task.group_id || task.care_group_id;
				const stored = getStoredWPUser();
				const creatorId = stored?.user_id ? String(stored.user_id) : null;
				const assignees = Array.isArray(task.assigned_to) ? task.assigned_to : task.assigned_to ? [task.assigned_to] : [];
				const ownerIds = Array.from(new Set([creatorId, ...assignees.map((a) => String(a).replace(/^wp-/, ""))].filter(Boolean)));
				const startAt = task.start_time || task.task_date || task.due_date || "";
				const endAt = task.end_time || startAt;
				await Promise.all(ownerIds.map(async (uid) => {
					const ev = await createCalendarEventForUserWordPress(uid, {
						title: task.title,
						description: task.description || "",
						location: task.location || "",
						start_at: startAt,
						end_at: endAt,
						event_type: "task",
						status: "confirmed",
						show_as: "busy"
					}).catch(() => null);
					if (newId && ev?.id) await linkTaskToCalendarEventWordPress(newId, ev.id).catch(() => null);
				}));
				if (groupId) qc.invalidateQueries({ queryKey: ["calendarEvents"] });
			} catch {}
			return newId;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careTasks"] });
		}
	});
}
function useUpdateAssigneeStatus() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ taskId, userId, status }) => updateAssigneeStatusWordPress(taskId, userId, status),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careTasks"] });
		}
	});
}
function useUpdateTaskStatus() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, status, updates }) => updateCareTaskWordPress(id, updates ?? { status }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careTasks"] });
		}
	});
}
function useNotifications() {
	return useQuery({
		queryKey: [
			"notifications",
			getStoredWPUser()?.user_id,
			currentAppId()
		],
		queryFn: () => runNotificationSkill("list-notifications"),
		enabled: hasWPSession(),
		refetchInterval: 3e4
	});
}
function useInboxCounts() {
	const notifications = useNotifications();
	const conversations = useConversations();
	return {
		...inboxCounts(notifications.data || [], conversations.data || []),
		isLoading: notifications.isLoading || conversations.isLoading,
		error: notifications.error || conversations.error
	};
}
function useMarkNotificationRead() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => runNotificationSkill("mark-notification-read", { id }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["notifications"] });
		}
	});
}
function useMarkAllNotificationsRead() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: () => runNotificationSkill("mark-all-notifications-read"),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["notifications"] });
		}
	});
}
function useSavedProviders() {
	return useQuery({
		queryKey: ["savedProviders"],
		queryFn: () => fetchSavedProvidersWordPress()
	});
}
function useToggleSavedProvider() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (providerId) => toggleSavedProviderWordPress(providerId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["savedProviders"] });
		}
	});
}
/**
* True when a WordPress session token is present. Private CCT reads are gated on
* this so anonymous visitors on public pages never fire 401 background polls.
*/
function hasWPSession() {
	return Boolean(getWPToken());
}
function useMyProfile() {
	return useQuery({
		queryKey: ["myProfile"],
		queryFn: () => fetchMyProfileWordPress(),
		enabled: hasWPSession()
	});
}
function useUpdateProfile() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (updates) => updateProfileWordPress(updates),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["myProfile"] });
		}
	});
}
function useSubmitProviderApplication() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input) => {
			return updateProfileWordPress({
				is_care_provider: true,
				provider_is_active: true,
				service_type_slugs: input.service_type_slugs || [],
				care_provider_starts_hourly_rate: input.hourlyRate || input.care_provider_starts_hourly_rate || 0,
				bio: input.bio || "",
				location: input.location || "",
				phone: input.phone || input.phone_number || void 0
			});
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["myProfile"] });
		}
	});
}
function useCareGroupPosts(groupId, type) {
	return withIdleAwareLoading(useQuery({
		queryKey: ["careGroupPosts", groupId],
		queryFn: async () => {
			return await filterVisiblePosts(await fetchCareGroupPostsWordPress(groupId));
		},
		enabled: !!groupId,
		select: (posts) => type ? posts.filter((p) => p?.type === type) : posts
	}));
}
function useCreateGroupPost() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (post) => {
			const { subgroupIds, visibilityUserIds, hiddenSubgroupIds, hiddenUserIds, ...payload } = post;
			const newId = await createGroupPostWordPress(payload);
			const hasVisibility = (subgroupIds?.length ?? 0) > 0 || (visibilityUserIds?.length ?? 0) > 0 || (hiddenSubgroupIds?.length ?? 0) > 0 || (hiddenUserIds?.length ?? 0) > 0;
			if (newId && hasVisibility) await setPostVisibility(newId, subgroupIds || [], visibilityUserIds || [], hiddenSubgroupIds || [], hiddenUserIds || []);
			return newId;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careGroupPosts"] });
		}
	});
}
function useUpdateGroupPost() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async ({ id, subgroupIds, visibilityUserIds, hiddenSubgroupIds, hiddenUserIds, ...updates }) => {
			await updateGroupPostWordPress(id, updates);
			if (subgroupIds || visibilityUserIds || hiddenSubgroupIds || hiddenUserIds) await setPostVisibility(id, subgroupIds || [], visibilityUserIds || [], hiddenSubgroupIds || [], hiddenUserIds || []);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careGroupPosts"] });
		}
	});
}
function useDeleteGroupPost() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deleteGroupPostWordPress(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careGroupPosts"] });
		}
	});
}
function useUpdateCareGroup() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...updates }) => updateCareGroupWordPress(id, updates),
		onSuccess: (_d, vars) => {
			qc.setQueryData(["careGroups"], (prev) => Array.isArray(prev) ? prev.map((g) => String(g.id) === String(vars.id) ? {
				...g,
				...vars.name !== void 0 ? { name: vars.name } : {},
				...vars.description !== void 0 ? { description: vars.description } : {},
				...vars.is_private !== void 0 ? {
					is_private: vars.is_private,
					group_type: vars.is_private ? "private" : "public"
				} : {}
			} : g) : prev);
			qc.invalidateQueries({ queryKey: ["careGroups"] });
		}
	});
}
function useDeleteCareGroup() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deleteCareGroupWordPress(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careGroups"] });
		}
	});
}
function useGroupInvites(groupId) {
	return useQuery({
		queryKey: ["groupInvites", groupId],
		queryFn: () => fetchGroupInvitesWordPress(groupId),
		enabled: !!groupId
	});
}
function useUpdateGroupInvite() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...updates }) => updateGroupInviteWordPress(id, updates),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["groupInvites"] });
		}
	});
}
function useDeleteGroupInvite() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id }) => deleteGroupInviteWordPress(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["groupInvites"] });
		}
	});
}
function useGroupInvitations(groupId) {
	return useQuery({
		queryKey: ["groupInvitations", groupId],
		queryFn: () => fetchGroupInvitationsWordPress(groupId),
		enabled: !!groupId
	});
}
function useCancelInvitation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (invitationId) => cancelInvitationWordPress(invitationId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["groupInvitations"] });
		}
	});
}
function useSearchProfiles(query) {
	return useQuery({
		queryKey: ["searchProfiles", query],
		queryFn: () => searchProfilesWordPress(query),
		enabled: query.length >= 2
	});
}
function useAddCaredOneToGroup() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ groupId, caredOneId }) => addCaredOneToGroupWordPress(groupId, caredOneId),
		onSuccess: (_data, vars) => {
			qc.invalidateQueries({ queryKey: ["careGroupMembers", vars.groupId] });
			qc.invalidateQueries({ queryKey: ["groupCaredOnes", vars.groupId] });
		}
	});
}
function useCreateUserCaredOne() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (caredOne) => createUserCaredOneWordPress(caredOne),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["userCaredOnes"] });
		}
	});
}
function useMyPendingInvitations() {
	return useQuery({
		queryKey: ["myPendingInvitations"],
		queryFn: () => fetchMyPendingInvitationsWordPress()
	});
}
function useAcceptInvitation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input) => typeof input === "string" ? acceptInvitationWordPress(input) : acceptInvitationWordPress(input.id, input.displayName),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["myPendingInvitations"] });
			qc.invalidateQueries({ queryKey: ["careGroups"] });
			qc.invalidateQueries({ queryKey: ["careGroupMembers"] });
			qc.invalidateQueries({ queryKey: ["groupLinkState"] });
		}
	});
}
function useDeclineInvitation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (invitationId) => declineInvitationWordPress(invitationId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["myPendingInvitations"] });
			qc.invalidateQueries({ queryKey: ["groupLinkState"] });
		}
	});
}
function useMemberCategories(groupId) {
	return useQuery({
		queryKey: ["memberCategories", groupId],
		queryFn: () => fetchMemberCategoriesWordPress(groupId),
		enabled: !!groupId
	});
}
function useCreateMemberCategory() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ groupId, name, color, description }) => createMemberCategoryWordPress(groupId, name, color, description),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["memberCategories"] });
		}
	});
}
function useUpdateMemberCategory() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ categoryId, ...updates }) => updateMemberCategoryWordPress(categoryId, updates),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["memberCategories"] });
		}
	});
}
function useDeleteMemberCategory() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (categoryId) => deleteMemberCategoryWordPress(categoryId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["memberCategories"] });
		}
	});
}
function useAddMemberToSubgroup() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ subgroupId, userId, types }) => addMemberToSubgroupWordPress(subgroupId, userId, { types }),
		onSuccess: (_res, vars) => {
			qc.invalidateQueries({ queryKey: ["subgroupMembers"] });
			qc.invalidateQueries({ queryKey: ["subgroupMemberRecords"] });
			qc.invalidateQueries({ queryKey: ["subgroupPending"] });
			qc.invalidateQueries({ queryKey: ["mySubgroupPending"] });
			qc.invalidateQueries({ queryKey: ["careGroupPosts"] });
			qc.invalidateQueries({ queryKey: ["careTasks"] });
			notifySubgroupApproved(vars.userId, vars.subgroupId);
		}
	});
}
function useRemoveMemberFromSubgroup() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ subgroupId, userId }) => removeMemberFromSubgroupWordPress(subgroupId, userId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["subgroupMembers"] });
			qc.invalidateQueries({ queryKey: ["subgroupMemberRecords"] });
			qc.invalidateQueries({ queryKey: ["subgroupPending"] });
			qc.invalidateQueries({ queryKey: ["mySubgroupPending"] });
			qc.invalidateQueries({ queryKey: ["careGroupPosts"] });
			qc.invalidateQueries({ queryKey: ["careTasks"] });
		}
	});
}
function useSubgroupMemberRecords(subgroupId) {
	return useQuery({
		queryKey: ["subgroupMemberRecords", subgroupId],
		queryFn: () => fetchSubgroupMemberRecordsWordPress(subgroupId),
		enabled: !!subgroupId
	});
}
/** Preview an invite link before joining: which group, invited as what. */
function useGroupInvitePreview(token) {
	return useQuery({
		queryKey: ["groupInvitePreview", token],
		queryFn: () => previewGroupInviteWordPress(token),
		enabled: !!token,
		retry: false
	});
}
/** One code box: accepts an invite-link code or a group's own join code. */
function useJoinGroupByAnyCode() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ code, displayName }) => joinGroupByAnyCodeWordPress(code, displayName),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careGroups"] });
			qc.invalidateQueries({ queryKey: ["careGroupMembers"] });
		}
	});
}
/** Join a care group with its join code (CCT 199 a58). */
function useJoinGroupByJoinCode() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ groupId, code, displayName }) => joinGroupByJoinCodeWordPress(groupId, code, displayName),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careGroups"] });
			qc.invalidateQueries({ queryKey: ["careGroupMembers"] });
			qc.invalidateQueries({ queryKey: ["groupLinkState"] });
		}
	});
}
/** The one group page (/group/<id>): the group plus the viewer's place in it. */
function useGroupLinkState(groupId, enabled = true) {
	return useQuery({
		queryKey: ["groupLinkState", groupId],
		queryFn: () => fetchGroupLinkStateWordPress(groupId),
		enabled: !!groupId && enabled,
		retry: false
	});
}
function useRequestToJoinGroup() {
	return useMutation({ mutationFn: (groupId) => requestToJoinGroupWordPress(groupId) });
}
function useJoinRequester(groupId, requesterId, enabled = true) {
	return useQuery({
		queryKey: [
			"joinRequester",
			groupId,
			requesterId
		],
		queryFn: () => fetchJoinRequesterWordPress(groupId, requesterId),
		enabled: !!groupId && !!requesterId && enabled,
		retry: false
	});
}
function useAnswerJoinRequest() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ groupId, requesterId, approve }) => answerJoinRequestWordPress(groupId, requesterId, approve),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["joinRequester"] });
			qc.invalidateQueries({ queryKey: ["careGroupMembers"] });
		}
	});
}
function useUpdateSubgroupMemberRole() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ subgroupId, userId, role }) => updateSubgroupMemberRoleWordPress(subgroupId, userId, role),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["subgroupMemberRecords"] });
			qc.invalidateQueries({ queryKey: ["subgroupMembers"] });
		}
	});
}
function usePosts(postType, area, childPostType) {
	return useQuery({
		queryKey: [
			"posts",
			postType,
			area,
			childPostType
		],
		queryFn: () => fetchPostsWordPress(postType, area, childPostType)
	});
}
function usePost(id, postType) {
	return useQuery({
		queryKey: [
			"post",
			id,
			postType
		],
		queryFn: () => fetchPostByIdWordPress(id, postType),
		enabled: !!id
	});
}
function useCreatePost() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (post) => createPostWordPress(post),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["posts"] });
		}
	});
}
function useUpdatePost() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...updates }) => updatePostWordPress(id, updates),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["posts"] });
			qc.invalidateQueries({ queryKey: ["post"] });
		}
	});
}
function useDeletePost() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deletePostWordPress(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["posts"] });
		}
	});
}
function useLocationShares(refetchIntervalMs = 15e3, scope = "cared-ones") {
	return useQuery({
		queryKey: ["locationShares", scope],
		queryFn: () => fetchLocationSharesWordPress(scope),
		enabled: hasWPSession(),
		refetchInterval: refetchIntervalMs,
		refetchIntervalInBackground: false
	});
}
function useUserCaredOnes() {
	return useQuery({
		queryKey: ["userCaredOnes"],
		queryFn: () => fetchUserCaredOnesWordPress()
	});
}
function useGroupCaredOnes(groupId) {
	return useQuery({
		queryKey: ["groupCaredOnes", groupId],
		queryFn: () => fetchGroupCaredOnesWordPress(groupId),
		enabled: !!groupId
	});
}
function useCheckins(caredOneId) {
	return useQuery({
		queryKey: ["checkins", caredOneId],
		queryFn: () => fetchCheckinsWordPress(caredOneId),
		enabled: !!caredOneId
	});
}
function useCheckinLogs(caredOneId) {
	return useQuery({
		queryKey: ["checkinLogs", caredOneId],
		queryFn: () => fetchCheckinLogsWordPress(caredOneId),
		enabled: !!caredOneId
	});
}
function useTodayCheckinLogs(caredOneId) {
	const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	return useQuery({
		queryKey: [
			"todayCheckinLogs",
			caredOneId,
			today
		],
		queryFn: () => fetchTodayCheckinLogsWordPress(caredOneId),
		enabled: !!caredOneId
	});
}
function useCreateCheckin() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (checkin) => createCheckinWordPress(checkin),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["checkins"] });
			qc.invalidateQueries({ queryKey: ["checkinLogs"] });
			qc.invalidateQueries({ queryKey: ["todayCheckinLogs"] });
		}
	});
}
function useLogCheckin() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (log) => logCheckinWordPress(log),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["checkinLogs"] });
			qc.invalidateQueries({ queryKey: ["todayCheckinLogs"] });
		}
	});
}
function useUpdateCheckin() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...updates }) => updateCheckinWordPress(id, updates),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["checkins"] });
		}
	});
}
function useDeleteCheckin() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deleteCheckinWordPress(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["checkins"] });
			qc.invalidateQueries({ queryKey: ["checkinLogs"] });
			qc.invalidateQueries({ queryKey: ["todayCheckinLogs"] });
		}
	});
}
function useMedicines(caredOneId) {
	return useQuery({
		queryKey: ["medicines", caredOneId],
		queryFn: () => fetchMedicinesWordPress(caredOneId),
		enabled: !!caredOneId
	});
}
function useCreateMedicine() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (med) => createMedicineWordPress(med),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["medicines"] });
		}
	});
}
function useDeleteMedicine() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deleteMedicineWordPress(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["medicines"] });
		}
	});
}
function useMedicineLogs(medicineId) {
	return useQuery({
		queryKey: ["medicineLogs", medicineId],
		queryFn: () => fetchMedicineLogsWordPress(medicineId),
		enabled: !!medicineId
	});
}
function useAllMedicineLogs(caredOneId) {
	return useQuery({
		queryKey: ["allMedicineLogs", caredOneId],
		queryFn: () => fetchAllMedicineLogsWordPress(caredOneId),
		enabled: !!caredOneId
	});
}
function useTodayMedicineLogs(caredOneId) {
	const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	return useQuery({
		queryKey: [
			"todayMedicineLogs",
			caredOneId,
			today
		],
		queryFn: () => fetchTodayMedicineLogsWordPress(caredOneId),
		enabled: !!caredOneId
	});
}
function useLogMedicine() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (log) => logMedicineWordPress(log),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["medicineLogs"] });
			qc.invalidateQueries({ queryKey: ["todayMedicineLogs"] });
			qc.invalidateQueries({ queryKey: ["allMedicineLogs"] });
		}
	});
}
function useUpdateMedicine() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...updates }) => updateMedicineWordPress(id, updates),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["medicines"] });
		}
	});
}
function useCareTips(caredOneId) {
	return useQuery({
		queryKey: ["careTips", caredOneId],
		queryFn: () => fetchCareTipsWordPress(caredOneId),
		enabled: !!caredOneId
	});
}
function useCreateCareTip() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (tip) => createCareTipWordPress(tip),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careTips"] });
		}
	});
}
function useUpdateCareTip() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...updates }) => updateCareTipWordPress(id, updates),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careTips"] });
		}
	});
}
function useDeleteCareTip() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deleteCareTipWordPress(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careTips"] });
		}
	});
}
function useCarePlans(caredOneId) {
	return useQuery({
		queryKey: ["carePlans", caredOneId],
		queryFn: () => fetchCarePlansWordPress(caredOneId),
		enabled: !!caredOneId
	});
}
function useCreateCarePlan() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (plan) => createCarePlanWordPress(plan),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["carePlans"] });
		}
	});
}
function useUpdateCarePlan() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...updates }) => updateCarePlanWordPress(id, updates),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["carePlans"] });
		}
	});
}
function useDeleteCarePlan() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deleteCarePlanWordPress(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["carePlans"] });
		}
	});
}
function useCareNotes(caredOneId) {
	return useQuery({
		queryKey: ["careNotes", caredOneId],
		queryFn: () => fetchCareNotesWordPress(caredOneId),
		enabled: !!caredOneId
	});
}
function useCreateCareNote() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (note) => createCareNoteWordPress(note),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careNotes"] });
		}
	});
}
function useUpdateCareNote() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...updates }) => updateCareNoteWordPress(id, updates),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careNotes"] });
		}
	});
}
function useDeleteCareNote() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deleteCareNoteWordPress(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careNotes"] });
		}
	});
}
function useEmergencyContacts(caredOneId) {
	return useQuery({
		queryKey: ["emergencyContacts", caredOneId],
		queryFn: () => fetchEmergencyContactsWordPress(caredOneId),
		enabled: !!caredOneId
	});
}
function useCreateEmergencyContact() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (contact) => createEmergencyContactWordPress(contact),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["emergencyContacts"] });
		}
	});
}
function useUpdateEmergencyContact() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...updates }) => updateEmergencyContactWordPress(id, updates),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["emergencyContacts"] });
		}
	});
}
function useDeleteEmergencyContact() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deleteEmergencyContactWordPress(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["emergencyContacts"] });
		}
	});
}
function useSafeZones(caredOneId) {
	return useQuery({
		queryKey: ["safeZones", caredOneId],
		queryFn: () => fetchSafeZonesWordPress(caredOneId),
		enabled: !!caredOneId
	});
}
function useCreateSafeZone() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (zone) => createSafeZoneWordPress(zone),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["safeZones"] });
		}
	});
}
function useUpdateSafeZone() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...updates }) => updateSafeZoneWordPress(id, updates),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["safeZones"] });
		}
	});
}
function useDeleteSafeZone() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deleteSafeZoneWordPress(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["safeZones"] });
		}
	});
}
function useCaredOneDocuments(caredOneId) {
	return useQuery({
		queryKey: ["caredOneDocuments", caredOneId],
		queryFn: () => fetchCaredOneDocumentsWordPress(caredOneId),
		enabled: !!caredOneId
	});
}
function useCreateCaredOneDocument() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (doc) => createCaredOneDocumentWordPress(doc),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["caredOneDocuments"] });
		}
	});
}
function useUpdateCaredOneDocument() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...updates }) => updateCaredOneDocumentWordPress(id, updates),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["caredOneDocuments"] });
		}
	});
}
function useDeleteCaredOneDocument() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deleteCaredOneDocumentWordPress(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["caredOneDocuments"] });
		}
	});
}
function useComments(relationId, parentId) {
	return useQuery({
		queryKey: [
			"comments",
			relationId,
			parentId
		],
		queryFn: () => fetchCommentsWordPress(relationId, parentId),
		enabled: !!parentId
	});
}
function useCreateComment() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ relationId, parentId, content, replyToCommentId }) => createCommentWordPress({
			relationId,
			parentId,
			content,
			replyToCommentId
		}),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["comments"] });
		}
	});
}
function useUpdateComment() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, content }) => updateCommentWordPress(id, content),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["comments"] });
		}
	});
}
function useDeleteComment() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id }) => deleteCommentWordPress(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["comments"] });
		}
	});
}
function useVoteSummary(relationId, parentIds) {
	return useQuery({
		queryKey: [
			"voteSummary",
			relationId,
			parentIds
		],
		queryFn: () => fetchVoteSummaries(relationId, parentIds),
		enabled: parentIds.length > 0
	});
}
function useVoteCount(relationId, parentId) {
	return useQuery({
		queryKey: [
			"voteSummary",
			relationId,
			[parentId]
		],
		queryFn: () => fetchVoteSummary(relationId, parentId),
		enabled: !!parentId
	});
}
function useToggleVote() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ relationId, parentId, value }) => toggleVote(relationId, parentId, value),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["voteSummary"] });
		}
	});
}
function useDeleteTask() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deleteCareTaskWordPress(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["care-tasks"] });
		}
	});
}
function useDeleteUserCaredOne() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deleteUserCaredOneWordPress(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["userCaredOnes"] });
			qc.invalidateQueries({ queryKey: ["groupCaredOnes"] });
		}
	});
}
function useUpdateBookingStatus() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, status }) => updateBookingStatusWordPress(id, status),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["bookings"] });
			qc.invalidateQueries({ queryKey: ["providerBookings"] });
		}
	});
}
function useLeaveGroup() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (groupId) => {
			const userId = (await fetchMyProfileWordPress())?.id;
			if (!userId) throw new Error("Not logged in");
			return leaveGroupWordPress(groupId, userId);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["careGroups"] });
			qc.invalidateQueries({ queryKey: ["careGroupMembers"] });
		}
	});
}
function useProviderAvailability(providerId) {
	return useQuery({
		queryKey: ["providerAvailability", providerId],
		queryFn: async () => {
			const { getProviderCalendarAvailability } = await import("../_libs/_34.mjs").then((n) => n.t);
			return getProviderCalendarAvailability(providerId);
		},
		enabled: !!providerId
	});
}
function useUpsertProviderAvailability() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (data) => {
			const { runSettingSkill } = await import("../_libs/_11.mjs").then((n) => n.i);
			return runSettingSkill("set-provider-availability", {
				providerId: data.providerId,
				slots: data.slots
			});
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["providerAvailability"] });
		}
	});
}
function useHelpTasks(filters) {
	return useQuery({
		queryKey: ["tasksNeedingHelp", filters],
		queryFn: () => fetchHelpTasksWordPress(filters)
	});
}
function useMyHelpTasks() {
	return useQuery({
		queryKey: ["myHelpTasks"],
		queryFn: () => fetchMyHelpTasksWordPress()
	});
}
function useMyTaskApplications() {
	return useQuery({
		queryKey: ["myTaskApplications"],
		queryFn: () => fetchMyTaskApplicationsWordPress()
	});
}
function useTaskApplicants(taskId) {
	return useQuery({
		queryKey: ["taskApplicants", taskId],
		queryFn: () => fetchTaskApplicantsWordPress(taskId),
		enabled: !!taskId
	});
}
function useApplyToSharedTask() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ taskId, message }) => applyToSharedTaskWordPress(taskId, message),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["tasksNeedingHelp"] });
			qc.invalidateQueries({ queryKey: ["myTaskApplications"] });
			qc.invalidateQueries({ queryKey: ["taskApplicants"] });
		}
	});
}
function useDecideTaskApplicant() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, status }) => decideTaskApplicantWordPress(id, status),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["taskApplicants"] });
			qc.invalidateQueries({ queryKey: ["tasksNeedingHelp"] });
			qc.invalidateQueries({ queryKey: ["myHelpTasks"] });
		}
	});
}
function useShareTask() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ taskId, needs_payment, price }) => shareTaskWordPress(taskId, {
			needs_payment,
			price
		}),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["tasksNeedingHelp"] });
			qc.invalidateQueries({ queryKey: ["myHelpTasks"] });
			qc.invalidateQueries({ queryKey: ["careTasks"] });
		}
	});
}
function useUnshareTask() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (taskId) => unshareTaskWordPress(taskId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["tasksNeedingHelp"] });
			qc.invalidateQueries({ queryKey: ["myHelpTasks"] });
			qc.invalidateQueries({ queryKey: ["careTasks"] });
		}
	});
}
function useCaredOneLocation(caredOneId) {
	return useQuery({
		queryKey: ["caredOneLocation", caredOneId],
		queryFn: () => fetchCaredOneLocationWordPress(caredOneId),
		enabled: !!caredOneId,
		refetchInterval: 3e4
	});
}
function useCaredOneLocationHistory(caredOneId) {
	return useQuery({
		queryKey: ["caredOneLocationHistory", caredOneId],
		queryFn: () => fetchCaredOneLocationHistoryWordPress(caredOneId),
		enabled: !!caredOneId
	});
}
function useCaredOneLocationSettings(caredOneId) {
	return useQuery({
		queryKey: ["caredOneLocationSettings", caredOneId],
		queryFn: () => fetchCaredOneLocationSettingsWordPress(caredOneId),
		enabled: !!caredOneId
	});
}
function useShareMyLocation() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (data) => shareMyLocationWordPress(data.latitude, data.longitude, {
			accuracy: data.accuracy,
			batteryLevel: data.batteryLevel,
			addressText: data.addressText,
			isEmergency: data.isEmergency,
			enabled: data.enabled
		}),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["caredOneLocation"] });
			qc.invalidateQueries({ queryKey: ["locationHistory"] });
		}
	});
}
function useSafeZoneAlerts(caredOneId) {
	return useQuery({
		queryKey: ["safeZoneAlerts", caredOneId],
		queryFn: () => fetchSafeZoneAlertsWordPress(caredOneId),
		enabled: !!caredOneId
	});
}
function useAcknowledgeAlert() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (alertId) => acknowledgeAlertWordPress(alertId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["safeZoneAlerts"] });
		}
	});
}
function useAcknowledgeAllAlerts() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (caredOneId) => acknowledgeAllAlertsWordPress(caredOneId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["safeZoneAlerts"] });
		}
	});
}
function useLocationRequests(caredOneId) {
	return useQuery({
		queryKey: ["locationRequests", caredOneId],
		queryFn: () => fetchLocationRequestsWordPress(caredOneId),
		enabled: !!caredOneId,
		refetchInterval: 3e4
	});
}
function useSendLocationRequest() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input) => {
			return sendLocationRequestWordPress(typeof input === "string" ? { caredOneId: input } : input);
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["locationRequests"] });
		}
	});
}
function useCancelLocationRequest() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input) => cancelLocationRequestWordPress(input.requestId, input.caredOneId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["locationRequests"] });
		}
	});
}
function useLocationSharingFlags(userId) {
	return useQuery({
		queryKey: ["locationSharingFlags", userId],
		queryFn: async () => (await import("../_libs/_18.mjs").then((n) => n.r)).fetchLocationSharingFlags(userId),
		enabled: !!userId,
		refetchInterval: 6e4
	});
}
function useSetLocationSharingFlags() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: async (input) => (await import("../_libs/_18.mjs").then((n) => n.r)).setLocationSharingFlags(input.userId, {
			shareOn: input.shareOn,
			emergencyAllowed: input.emergencyAllowed
		}),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["locationSharingFlags"] });
		}
	});
}
function useEnableEmergencyLocationPermission() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (caredOneId) => enableEmergencyLocationPermissionWordPress(caredOneId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["locationSharingFlags"] });
		}
	});
}
function useRespondToLocationRequest() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: respondToLocationRequestWordPress,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["caredOneLocation"] });
			qc.invalidateQueries({ queryKey: ["locationSharingFlags"] });
		}
	});
}
function useInformationCards(caredOneId) {
	return useQuery({
		queryKey: ["informationCards", caredOneId],
		queryFn: () => fetchInformationCardsWordPress(caredOneId),
		enabled: !!caredOneId
	});
}
function useCreateInformationCard() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (input) => createInformationCardWordPress(input),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["informationCards"] });
		}
	});
}
function useUpdateInformationCard() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...updates }) => updateInformationCardWordPress(id, updates),
		onSuccess: (_d, vars) => {
			qc.invalidateQueries({ queryKey: ["informationCards"] });
			qc.invalidateQueries({ queryKey: ["informationCard", vars.id] });
			qc.invalidateQueries({ queryKey: ["sharedInformationCard", vars.id] });
		}
	});
}
function useDeleteInformationCard() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id) => deleteInformationCardWordPress(id),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["informationCards"] });
		}
	});
}
function useInformationCardContactIds(cardId) {
	return useQuery({
		queryKey: ["informationCardContacts", cardId],
		queryFn: () => fetchInformationCardContactIdsWordPress(cardId),
		enabled: !!cardId
	});
}
function useSetInformationCardContacts() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ cardId, contactIds }) => setInformationCardContactsWordPress(cardId, contactIds),
		onSuccess: (_d, vars) => {
			qc.invalidateQueries({ queryKey: ["informationCardContacts", vars.cardId] });
		}
	});
}
function useSharedInformationCard(cardId) {
	return useQuery({
		queryKey: ["sharedInformationCard", cardId],
		queryFn: () => cardId ? fetchSharedInformationCardWordPress(cardId) : Promise.resolve(null),
		enabled: !!cardId,
		staleTime: 0,
		refetchOnMount: "always",
		refetchOnWindowFocus: "always",
		refetchInterval: 3e4,
		retry: false
	});
}
//#endregion
export { useCreateFacilityOwnershipClaim as $, useUpdateCareNote as $n, useLeaveGroup as $t, useCareGroups as A, useSafeZones as An, useEmergencyContacts as At, useCheckinLogs as B, useStartConversation as Bn, useGroupInvitations as Bt, useCancelInvitation as C, useProviderReviews as Cn, useDeleteMedicine as Ct, useCareGroupGallery as D, useRequestToJoinGroup as Dn, useDeleteTask as Dt, useCareFacility as E, useRemoveMemberFromSubgroup as En, useDeleteSafeZone as Et, useCaredOneDocuments as F, useSetInformationCardContacts as Fn, useFacilityOwnershipClaims as Ft, useCreateCareGroup as G, useTodayMedicineLogs as Gn, useHelpTasks as Gt, useComments as H, useSubmitProviderApplication as Hn, useGroupInvites as Ht, useCaredOneLocation as I, useSetLocationSharingFlags as In, useFacilityOwnershipDisputes as It, useCreateCareTip as J, useUnshareTask as Jn, useInformationCards as Jt, useCreateCareNote as K, useToggleSavedProvider as Kn, useInboxCounts as Kt, useCaredOneLocationHistory as L, useShareMyLocation as Ln, useFacilityReviewSummaries as Lt, useCarePlans as M, useSearchProfiles as Mn, useEntityCategoryOptions as Mt, useCareTasks as N, useSendLocationRequest as Nn, useEntityCustomFieldValues as Nt, useCareGroupMembers as O, useRespondToLocationRequest as On, useDeleteUserCaredOne as Ot, useCareTips as P, useSendMessage as Pn, useFacilityMembers as Pt, useCreateEmergencyContact as Q, useUpdateCareGroup as Qn, useJoinRequester as Qt, useCaredOneLocationSettings as R, useShareTask as Rn, useFacilityReviews as Rt, useBookings as S, useProviderBookings as Sn, useDeleteInformationCard as St, useCareFacilities as T, useRemoveGroupMember as Tn, useDeletePost as Tt, useConversations as U, useTaskApplicants as Un, useGroupLinkState as Ut, useCheckins as V, useSubgroupMemberRecords as Vn, useGroupInvitePreview as Vt, useCreateCareFacility as W, useTodayCheckinLogs as Wn, useGroupMessages as Wt, useCreateCheckin as X, useUpdateBookingStatus as Xn, useJoinGroupByAnyCode as Xt, useCreateCaredOneDocument as Y, useUpdateAssigneeStatus as Yn, useInviteToGroup as Yt, useCreateComment as Z, useUpdateCareFacility as Zn, useJoinGroupByJoinCode as Zt, useAddCaredOneToGroup as _, usePost as _n, useUpdateTaskStatus as _r, useDeleteCheckin as _t, FACILITY_STAGE_OPTIONS as a, useMarkAllNotificationsRead as an, useUpdateEmergencyContact as ar, useCreateReview as at, useAnswerJoinRequest as b, useProvider as bn, useVoteCount as br, useDeleteGroupInvite as bt, facilityLabels as c, useMedicineLogs as cn, useUpdateInformationCard as cr, useCreateUserCaredOne as ct, parseCardDate as d, useMyFacilityPermission as dn, useUpdateMemberRole as dr, useDeclineInvitation as dt, useLocationRequests as en, useUpdateCarePlan as er, useCreateGroupPost as et, toCodeList as f, useMyHelpTasks as fn, useUpdateMyGroupDisplayName as fr, useDeleteCareGroup as ft, useAcknowledgeAllAlerts as g, useNotifications as gn, useUpdateSubgroupMemberRole as gr, useDeleteCaredOneDocument as gt, useAcknowledgeAlert as h, useMyTaskApplications as hn, useUpdateSafeZone as hr, useDeleteCareTip as ht, FACILITY_ROOM_TYPE_OPTIONS as i, useLogMedicine as in, useUpdateComment as ir, useCreatePost as it, useCareNotes as j, useSavedProviders as jn, useEnableEmergencyLocationPermission as jt, useCareGroupPosts as k, useSafeZoneAlerts as kn, useDirectMessages as kt, fetchInformationCardCaredOneIdWordPress as l, useMedicines as ln, useUpdateMedicine as lr, useCustomFieldTypes as lt, useAcceptInvitation as m, useMyProfile as mn, useUpdateProfile as mr, useDeleteCarePlan as mt, FACILITY_PEOPLE_NUMBER_OPTIONS as n, useLocationSharingFlags as nn, useUpdateCaredOneDocument as nr, useCreateMedicine as nt, FACILITY_TYPE_OPTIONS as o, useMarkMessagesRead as on, useUpdateGroupInvite as or, useCreateSafeZone as ot, toDatetimeLocal as p, useMyPendingInvitations as pn, useUpdatePost as pr, useDeleteCareNote as pt, useCreateCarePlan as q, useToggleVote as qn, useInformationCardContactIds as qt, FACILITY_ROOM_FACILITY_OPTIONS as r, useLogCheckin as rn, useUpdateCheckin as rr, useCreateMemberCategory as rt, facilityLabel as s, useMarkNotificationRead as sn, useUpdateGroupPost as sr, useCreateTask as st, FACILITY_COMMUNITY_FACILITY_OPTIONS as t, useLocationShares as tn, useUpdateCareTip as tr, useCreateInformationCard as tt, fetchInformationCardContactIdsWordPress as u, useMemberCategories as un, useUpdateMemberCategory as ur, useDecideTaskApplicant as ut, useAddMemberToSubgroup as v, usePostTypes as vn, useUpsertProviderAvailability as vr, useDeleteComment as vt, useCancelLocationRequest as w, useProviders as wn, useDeleteMemberCategory as wt, useApplyToSharedTask as x, useProviderAvailability as xn, useVoteSummary as xr, useDeleteGroupPost as xt, useAllMedicineLogs as y, usePosts as yn, useUserCaredOnes as yr, useDeleteEmergencyContact as yt, useCategoryTypes as z, useSharedInformationCard as zn, useGroupCaredOnes as zt };
