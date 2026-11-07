import "../_runtime.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/locale-DKwjQju2.js
/**
* Locale safety helpers.
*
* Browsers/OS environments can report BCP-47-invalid tags (for example
* `en-US@posix` on some Linux builds, or `zh-CN-u-foo`). Passing those straight
* into `Intl` / `toLocaleDateString` throws a RangeError and crashes the page.
* Every date/number formatting call in the app must run its locale through
* `safeLocale()` first.
*/
/** Returns a locale tag Intl accepts, falling back to "en". */
function safeLocale(input) {
	const raw = (input || "").trim();
	if (!raw) return "en";
	const candidates = [
		raw,
		raw.split("@")[0],
		raw.split("@")[0].split("_")[0],
		raw.split("-")[0]
	];
	for (const candidate of candidates) {
		if (!candidate) continue;
		try {
			new Intl.DateTimeFormat(candidate);
			return candidate;
		} catch {}
	}
	return "en";
}
/** Safe wrapper around Date#toLocaleDateString. */
function formatDate(value, locale, options) {
	if (value === null || value === void 0 || value === "") return "";
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleDateString(safeLocale(locale), options);
}
/** Safe wrapper around Date#toLocaleTimeString. */
function formatTime(value, locale, options) {
	if (value === null || value === void 0 || value === "") return "";
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleTimeString(safeLocale(locale), options);
}
/** Safe wrapper around Date#toLocaleString (date + time). */
function formatDateTime(value, locale, options) {
	if (value === null || value === void 0 || value === "") return "";
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleString(safeLocale(locale), options);
}
//#endregion
export { formatDateTime as n, formatTime as r, formatDate as t };
