import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Booking notes carry machine tags the client never typed ("[Service: ...]",
 * "[Recurring: weekly]") because the order only has one free-text field.
 * Strip them before showing the note to a human.
 */
export function cleanBookingNote(note?: string | null): string {
  return String(note || "").replace(/\[(Service|Recurring):[^\]]*\]/gi, "").trim();
}

/**
 * Show enough of an email address to recognise your own account, never enough
 * for a stranger to copy it out of a search result or a screenshot.
 * "guowei.jiang@gmail.com" → "g••••••g@gmail.com"
 */
export function maskEmail(email?: string | null): string {
  const value = String(email ?? "").trim();
  const at = value.indexOf("@");
  if (at < 1) return value ? "•••" : "";
  const name = value.slice(0, at);
  const domain = value.slice(at);
  if (name.length <= 2) return `${name[0]}•${domain}`;
  return `${name[0]}${"•".repeat(Math.min(name.length - 2, 6))}${name[name.length - 1]}${domain}`;
}
