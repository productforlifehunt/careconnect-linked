import "../_runtime.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ownership-Cg5g5zqD.js
/** Compare existing WordPress identities only; this creates no relationship. */
function isPostAuthor(authorId, userId) {
	const normalize = (value) => String(value ?? "").trim().replace(/^wp-/, "");
	const author = normalize(authorId);
	const user = normalize(userId);
	return /^\d+$/.test(author) && Number(author) > 0 && Number(author) === Number(user);
}
//#endregion
export { isPostAuthor as t };
