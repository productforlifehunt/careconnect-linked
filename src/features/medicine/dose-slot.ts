/**
 * One dose = one schedule (CCT 187) + one daily time slot. A dose log
 * (CCT 161) records which slot it belongs to in a88 Scheduled date, so
 * logging the 08:00 dose never marks the 12:00 dose as done.
 */
function pad(n: number): string { return String(n).padStart(2, "0"); }

/** "HH:MM" of a stored datetime such as "2026-10-27 08:00:00" or ISO. */
export function slotOfDatetime(value: unknown): string | null {
  const m = String(value ?? "").match(/[ T](\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : null;
}

/** Today's local date at the slot, in the CCT datetime format. */
export function todayAtSlot(slot: string, now: Date = new Date()): string {
  const [h = "0", m = "0"] = slot.split(":");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(Number(h))}:${pad(Number(m))}:00`;
}

/** The log that belongs to this medicine's slot (no slot → any log of the medicine). */
export function findDoseLog<T extends { medicine_id?: unknown; scheduled_date?: unknown }>(
  logs: T[], medicineId: unknown, slot?: string | undefined,
): T | undefined {
  const mine = logs.filter((l) => String(l.medicine_id) === String(medicineId));
  if (!slot) return mine[0];
  return mine.find((l) => slotOfDatetime(l.scheduled_date) === slot.substring(0, 5));
}
