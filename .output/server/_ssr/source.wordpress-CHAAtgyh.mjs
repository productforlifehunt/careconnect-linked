import "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-CNktS9qV.mjs";
import { a as wordpressFetch, i as wordpressCCTFetch } from "./wordpress-client-b834cpZh.mjs";
import { n as R, r as T } from "./wp-schema-Dnlz0TVP.mjs";
import { r as fetchRelChildrenOf } from "./rel-batch-97Y7fPM-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/source.wordpress-CHAAtgyh.js
var source_wordpress_exports = /* @__PURE__ */ __exportAll({
	COMMENT_RELATIONS: () => COMMENT_RELATIONS,
	createCommentWordPress: () => createCommentWordPress,
	deleteCommentWordPress: () => deleteCommentWordPress,
	fetchCommentsWordPress: () => fetchCommentsWordPress,
	updateCommentWordPress: () => updateCommentWordPress
});
/**
* Comments — JetEngine CCT 141 "Comment" (a55 title, a56 content).
*
* A comment is attached to its parent ONLY through a JetEngine relation, and
* callers address that relation by its dictionary number (from `R`), never by
* an entity-name string:
*   150  149. Community post        → 141. Comment   (R.communityPostComments)
*   143  31.  Review                → 141. Comment   (R.reviewComments)
*   229  202. Care group post       → 141. Comment   (R.careGroupPostComments)
*   236  204. Care task             → 141. Comment   (R.careTaskComments)
*   142  141. Comment               → 141. Comment   (R.commentReplies — second level)
*/
var COMMENT_RELATIONS = [
	R.communityPostComments,
	R.reviewComments,
	R.careGroupPostComments,
	R.careTaskComments
];
var SLUG = T.comment.slug;
var F = T.comment.f;
var strip = (v) => v == null ? "" : String(v).replace(/^wp-/, "");
function assertCommentRelation(relationId) {
	if (!COMMENT_RELATIONS.includes(relationId)) throw new Error(`Relation ${relationId} is not a comment relation (allowed: ${COMMENT_RELATIONS.join(", ")})`);
}
async function readComment(id) {
	const c = await wordpressCCTFetch(SLUG, { id });
	if (!c) throw new Error(`Comment ${id} is linked but could not be read`);
	return {
		id: String(c.id ?? c._ID),
		author_id: c.author_id ?? null,
		title: c[F.TITLE] || "",
		content: c[F.CONTENT] || "",
		created_at: c.created_at,
		updated_at: c.updated_at,
		replies: []
	};
}
/** Top-level comments of one parent plus their REL 142 replies (two levels). */
async function fetchCommentsWordPress(relationId, parentId) {
	assertCommentRelation(relationId);
	const ids = (await fetchRelChildrenOf(relationId, strip(parentId))).map((c) => c.childId);
	const comments = await Promise.all(ids.map(readComment));
	await Promise.all(comments.map(async (c) => {
		const replyIds = (await fetchRelChildrenOf(R.commentReplies, c.id)).map((r) => r.childId);
		c.replies = (await Promise.all(replyIds.map(readComment))).sort((a, b) => a.created_at.localeCompare(b.created_at));
	}));
	return comments.sort((a, b) => a.created_at.localeCompare(b.created_at));
}
/**
* Creates a CCT 141 row and links it. `relationId` is the parent's comment
* relation; when `replyToCommentId` is given the link goes through REL 142 to
* that comment instead. A failed link deletes the new row (no orphans).
*/
async function createCommentWordPress(input) {
	assertCommentRelation(input.relationId);
	const relId = input.replyToCommentId ? R.commentReplies : input.relationId;
	const parent = Number(strip(input.replyToCommentId || input.parentId));
	if (!Number.isFinite(parent) || parent <= 0) throw new Error(`Invalid parent id: ${input.replyToCommentId || input.parentId}`);
	const result = await wordpressCCTFetch(SLUG, {
		method: "POST",
		body: {
			[F.TITLE]: input.title || "",
			[F.CONTENT]: input.content
		}
	});
	const commentId = Number(result?.item_id ?? result?._ID ?? result?.id);
	if (!Number.isFinite(commentId) || commentId <= 0) throw new Error("Comment was not created: backend returned no item id");
	try {
		await wordpressFetch(`jet-rel/${relId}`, {
			method: "POST",
			body: {
				parent_id: parent,
				child_id: commentId,
				context: "child",
				store_items_type: "update"
			}
		});
	} catch (e) {
		await wordpressCCTFetch(SLUG, {
			id: String(commentId),
			method: "DELETE"
		}).catch(() => void 0);
		throw e instanceof Error ? e : new Error(String(e));
	}
	return { id: String(commentId) };
}
async function updateCommentWordPress(id, content) {
	await wordpressCCTFetch(SLUG, {
		id: strip(id),
		method: "PUT",
		body: { [F.CONTENT]: content }
	});
}
/** Deletes the comment and its REL 142 replies (the UI promises both). */
async function deleteCommentWordPress(id) {
	for (const r of await fetchRelChildrenOf(R.commentReplies, strip(id))) await wordpressCCTFetch(SLUG, {
		id: r.childId,
		method: "DELETE"
	});
	await wordpressCCTFetch(SLUG, {
		id: strip(id),
		method: "DELETE"
	});
}
//#endregion
export { updateCommentWordPress as a, source_wordpress_exports as i, deleteCommentWordPress as n, fetchCommentsWordPress as r, createCommentWordPress as t };
