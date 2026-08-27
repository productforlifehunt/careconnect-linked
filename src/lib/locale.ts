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
export function safeLocale(input?: string | null): string {
  const raw = (input || "").trim();
  if (!raw) return "en";

  const candidates = [raw, raw.split("@")[0], raw.split("@")[0].split("_")[0], raw.split("-")[0]];
  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      // Throws for structurally invalid tags.
      new Intl.DateTimeFormat(candidate);
      return candidate;
    } catch {
      /* try the next, less specific candidate */
    }
  }
  return "en";
}

/** Safe wrapper around Date#toLocaleDateString. */
export function formatDate(
  value: string | number | Date | null | undefined,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (value === null || value === undefined || value === "") return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(safeLocale(locale), options);
}

/** Safe wrapper around Date#toLocaleTimeString. */
export function formatTime(
  value: string | number | Date | null | undefined,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (value === null || value === undefined || value === "") return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(safeLocale(locale), options);
}

/** Safe wrapper around Date#toLocaleString (date + time). */
export function formatDateTime(
  value: string | number | Date | null | undefined,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (value === null || value === undefined || value === "") return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(safeLocale(locale), options);
}
