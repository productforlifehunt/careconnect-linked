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
