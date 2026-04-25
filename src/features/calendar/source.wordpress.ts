/**
 * Calendar — JetEngine CCT `users_calendar_even` (CCT 128)
 *
 * Live fields: title, description, start_at, end_at, all_day, event_type,
 *   location, timezone, status, priority, color, rrule, rrule_until_, exdates,
 *   rdates, recurrence_id, show_as, visibility, reminders, is_availability,
 *   availability_note, rsvp_required, allow_comments, external_source, ical_uid,
 *   sequence, etag, google_event_id, meeting_url, attachments, last_sync_at,
 *   sync_token, geo_lat, geo_lng, tags, custom_data
 *
 * Relations:
 *   - 129: users → users_calendar_even (event owner)
 *   - 130: users_calendar_even → users  (event invitees)
 *   - 131: universal_care_task → users_calendar_even (task→event link)
 */
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import type { CalendarEvent, CalendarEventType } from "./types";

const SLUG = "users_calendar_even";
const REL_USER_EVENT = 129;
const REL_EVENT_INVITEES = 130;

function getCurrentUserId(): string | null {
  try {
    const raw = localStorage.getItem("cc_wp_user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?.id ? String(u.id) : null;
  } catch {
    return null;
  }
}

function asBool(v: any): boolean {
  return v === true || v === "yes" || v === "1" || v === 1 || v === "true";
}

function asWPBool(v: boolean | undefined): string {
  return v ? "yes" : "no";
}

function mapEventFromWP(raw: any): CalendarEvent {
  return {
    id: String(raw.id ?? raw._ID),
    title: raw.title ?? "",
    description: raw.description ?? "",
    location: raw.location ?? "",
    start_at: raw.start_at ?? raw.cct_created ?? "",
    end_at: raw.end_at ?? "",
    all_day: asBool(raw.all_day),
    timezone: raw.timezone ?? undefined,
    status: (raw.status as any) || "confirmed",
    priority: (raw.priority as any) || "normal",
    color: raw.color ?? "",
    rrule: raw.rrule ?? undefined,
    rrule_until: raw.rrule_until_ ?? undefined,
    exdates: raw.exdates ?? undefined,
    event_type: (raw.event_type as CalendarEventType) || "personal",
    show_as: (raw.show_as as any) || "busy",
    visibility: (raw.visibility as any) || "default",
    is_availability: asBool(raw.is_availability),
    availability_note: raw.availability_note ?? undefined,
    meeting_url: raw.meeting_url ?? undefined,
    reminders: (() => {
      try { return raw.reminders ? JSON.parse(raw.reminders) : []; } catch { return []; }
    })(),
  };
}

function mapEventToWP(e: Partial<CalendarEvent>): Record<string, any> {
  const body: Record<string, any> = {};
  if (e.title !== undefined) body.title = e.title;
  if (e.description !== undefined) body.description = e.description;
  if (e.location !== undefined) body.location = e.location;
  if (e.start_at !== undefined) body.start_at = e.start_at;
  if (e.end_at !== undefined) body.end_at = e.end_at;
  if (e.all_day !== undefined) body.all_day = asWPBool(e.all_day);
  if (e.timezone !== undefined) body.timezone = e.timezone;
  if (e.status !== undefined) body.status = e.status;
  if (e.priority !== undefined) body.priority = e.priority;
  if (e.color !== undefined) body.color = e.color;
  if (e.rrule !== undefined) body.rrule = e.rrule;
  if (e.rrule_until !== undefined) body.rrule_until_ = e.rrule_until;
  if (e.exdates !== undefined) body.exdates = e.exdates;
  if (e.event_type !== undefined) body.event_type = e.event_type;
  if (e.show_as !== undefined) body.show_as = e.show_as;
  if (e.visibility !== undefined) body.visibility = e.visibility;
  if (e.is_availability !== undefined) body.is_availability = asWPBool(e.is_availability);
  if (e.availability_note !== undefined) body.availability_note = e.availability_note;
  if (e.meeting_url !== undefined) body.meeting_url = e.meeting_url;
  if (e.reminders !== undefined) body.reminders = JSON.stringify(e.reminders);
  return body;
}

export async function fetchCalendarEventsWordPress(): Promise<CalendarEvent[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];
  try {
    // Owned events via Rel 129
    const owned: any[] = await wordpressFetch<any[]>(`jet-rel/${REL_USER_EVENT}/parent/${userId}`).catch(() => []);
    // Invited events via Rel 130 (event → users) — fetch by child=user
    const invited: any[] = await wordpressFetch<any[]>(`jet-rel/${REL_EVENT_INVITEES}/child/${userId}`).catch(() => []);
    const seen = new Set<string>();
    const all = [...(Array.isArray(owned) ? owned : []), ...(Array.isArray(invited) ? invited : [])];
    return all
      .map(mapEventFromWP)
      .filter((e) => {
        if (!e.id || seen.has(e.id)) return false;
        seen.add(e.id);
        return true;
      });
  } catch {
    return [];
  }
}

export async function createCalendarEventWordPress(event: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;
  const created: any = await wordpressCCTFetch(SLUG, { method: "POST", body: mapEventToWP(event) });
  const newId = String(created?.item_id ?? created?._ID ?? created?.id ?? "");
  if (!newId) return null;
  // Link to owner via Rel 129
  try {
    await wordpressFetch(`jet-rel/${REL_USER_EVENT}`, {
      method: "POST",
      body: { parent_id: userId, child_id: newId, context: "child_object", store_items_type: "replace" },
    });
  } catch { /* non-fatal */ }
  return mapEventFromWP({ ...created, id: newId });
}

export async function updateCalendarEventWordPress(id: string, patch: Partial<CalendarEvent>): Promise<void> {
  await wordpressCCTFetch(SLUG, { id, method: "PUT", body: mapEventToWP(patch) });
}

export async function deleteCalendarEventWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(SLUG, { id, method: "DELETE" });
}

export async function inviteUserToEventWordPress(eventId: string, userId: string): Promise<void> {
  await wordpressFetch(`jet-rel/${REL_EVENT_INVITEES}`, {
    method: "POST",
    body: { parent_id: eventId, child_id: userId, context: "child_object", store_items_type: "update" },
  });
}
