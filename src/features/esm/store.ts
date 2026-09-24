/**
 * Local study data for the ESM survey.
 *
 * Answers are kept on the device so a half-finished log survives a reload or a
 * lost connection. Submitted records are queued here too, ready to be pushed to
 * the study's JetEngine tables once they exist on the backend.
 */
import { AnswerMap } from "./types";

const KEY = {
  profile: "esm:profile",
  settings: "esm:settings",
  draft: (id: string) => `esm:draft:${id}`,
  records: "esm:records",
} as const;

export type ParticipantRole = "primary" | "other";

export interface EsmProfile {
  role: ParticipantRole;
  /** Display name, used only inside the app. */
  name?: string;
  /** People the participant can pick on the People tab. */
  network: string[];
  screeningDone: boolean;
  startedAt: string;
}

export interface EsmSettings {
  hourlyReminders: boolean;
  reminderStart: string;
  reminderEnd: string;
  quietPeriods: QuietPeriod[];
  reducedMotion: boolean;
}

export interface QuietPeriod {
  id: string;
  start: string;
  end: string;
}

const DEFAULT_SETTINGS: EsmSettings = {
  hourlyReminders: true,
  reminderStart: "08:00",
  reminderEnd: "22:00",
  quietPeriods: [],
  reducedMotion: false,
};

export type RecordKind = "primary_screening" | "other_screening" | "hourly_log" | "daily_log";

export interface EsmRecord {
  id: string;
  kind: RecordKind;
  /** ISO timestamp the entry was submitted. */
  submittedAt: string;
  /** The hourly slot this entry answers, e.g. "2026-09-21T14" — logs only. */
  slot?: string;
  answers: AnswerMap;
  /** Spoken answers as transcribed, keyed by question id. */
  voice?: Record<string, string>;
  /** False until the study backend has accepted it. */
  synced: boolean;
  /** Row id in the study table once uploaded. */
  remoteId?: string;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — the UI keeps working in memory */
  }
}

export const getProfile = (): EsmProfile | null => read<EsmProfile | null>(KEY.profile, null);

export const getSettings = (): EsmSettings => {
  const saved = read<Partial<EsmSettings>>(KEY.settings, {});
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    quietPeriods: Array.isArray(saved.quietPeriods) ? saved.quietPeriods : [],
  };
};

export function saveSettings(settings: EsmSettings) {
  write(KEY.settings, settings);
}

export function saveProfile(profile: EsmProfile) {
  write(KEY.profile, profile);
  window.dispatchEvent(new CustomEvent("esm-profile-changed", { detail: profile }));
}

export function startProfile(role: ParticipantRole): EsmProfile {
  const existing = getProfile();
  const profile: EsmProfile = existing
    ? { ...existing, role }
    : { role, network: [], screeningDone: false, startedAt: new Date().toISOString() };
  saveProfile(profile);
  return profile;
}

const currentAnswerKeys = (answers: AnswerMap): AnswerMap => {
  const migrated: AnswerMap = {};
  for (const [key, value] of Object.entries(answers)) {
    const currentKey = key
      .replace(/^c302_/, "c318_")
      .replace(/^c303_/, "c319_")
      .replace(/^c304_/, "c317_");
    migrated[currentKey] = value;
  }
  return migrated;
};

export const getDraft = (id: string): AnswerMap => currentAnswerKeys(read<AnswerMap>(KEY.draft(id), {}));
export const saveDraft = (id: string, answers: AnswerMap) => write(KEY.draft(id), answers);
export const clearDraft = (id: string) => {
  try {
    localStorage.removeItem(KEY.draft(id));
  } catch {
    /* ignore */
  }
};

export const getRecords = (): EsmRecord[] => read<EsmRecord[]>(KEY.records, []).map((record) => ({
  ...record,
  answers: currentAnswerKeys(record.answers),
}));

export function addRecord(
  kind: RecordKind,
  answers: AnswerMap,
  slot?: string,
  voice?: Record<string, string>,
): EsmRecord {
  const record: EsmRecord = {
    id: `${kind}_${Date.now()}`,
    kind,
    submittedAt: new Date().toISOString(),
    slot,
    answers,
    voice,
    synced: false,
  };
  write(KEY.records, [record, ...getRecords()]);
  return record;
}

/** Marks a record as accepted by the study backend. */
export function markSynced(id: string, remoteId: string) {
  write(
    KEY.records,
    getRecords().map((r) => (r.id === id ? { ...r, synced: true, remoteId } : r)),
  );
}

export function deleteRecord(id: string) {
  write(KEY.records, getRecords().filter((r) => r.id !== id));
}

/* ------------------------------------------------------------ reminders */

/** The timeline covers the complete day; reminder settings determine when prompts appear. */
export const FIRST_HOUR = 0;
export const LAST_HOUR = 23;

export const slotId = (date: Date, hour: number) =>
  `${localDay(date)}T${String(hour).padStart(2, "0")}`;

export interface Slot {
  hour: number;
  id: string;
  label: string;
  done: boolean;
  count: number;
  due: boolean;
  future: boolean;
}

export function todaySlots(now = new Date()): Slot[] {
  const records = getRecords();
  const counts = records
    .filter((r) => r.kind === "hourly_log" && r.slot)
    .reduce<Record<string, number>>((all, record) => {
      const key = String(record.slot);
      all[key] = (all[key] ?? 0) + 1;
      return all;
    }, {});
  const slots: Slot[] = [];
  for (let hour = FIRST_HOUR; hour <= LAST_HOUR; hour++) {
    const id = slotId(now, hour);
    const label = `${((hour + 11) % 12) + 1}:00 ${hour < 12 ? "AM" : "PM"}`;
    slots.push({
      hour,
      id,
      label,
      done: (counts[id] ?? 0) > 0,
      count: counts[id] ?? 0,
      due: hour === now.getHours(),
      future: hour > now.getHours(),
    });
  }
  return slots;
}

export function dailyLogDone(now = new Date()): boolean {
  const day = localDay(now);
  return getRecords().some((r) => r.kind === "daily_log" && localDay(new Date(r.submittedAt)) === day);
}

/** Calendar day in the participant's own time zone (not UTC). */
export function localDay(date: Date): string {
  return (
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  );
}

export function yesterdayDailyLogDone(now = new Date()): boolean {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return dailyLogDone(yesterday);
}

const minutesOf = (value: string) => {
  const [hour = 0, minute = 0] = value.split(":").map(Number);
  return hour * 60 + minute;
};

/** Device-only reminder eligibility. The 24-hour timeline itself remains available. */
export function hourlyReminderActive(now = new Date(), settings = getSettings()): boolean {
  if (!settings.hourlyReminders) return false;
  const minute = now.getHours() * 60 + now.getMinutes();
  if (minute < minutesOf(settings.reminderStart) || minute > minutesOf(settings.reminderEnd)) return false;
  return !settings.quietPeriods.some((period) => {
    const start = minutesOf(period.start);
    const end = minutesOf(period.end);
    return start <= end ? minute >= start && minute <= end : minute >= start || minute <= end;
  });
}

/** Missed hourly slots earlier today, for the end-of-day supplement. */
export function missedSlots(now = new Date()): Slot[] {
  return todaySlots(now).filter((s) => !s.done && !s.future);
}

/** Export every record as JSON for the research team. */
export function exportJson(): string {
  return JSON.stringify({ profile: getProfile(), records: getRecords() }, null, 2);
}
