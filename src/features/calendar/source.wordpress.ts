/**
 * Calendar — JetEngine CCT 187 `users_calendar_event`
 * Shared across every app on the backend: field a91 (App) scopes each event, so
 * reads filter it and writes stamp it (see features/shared/app-scope).
 * Field map (data dictionary CCT 187):
 *   a55=title  a56=description  a57=start_at  a58=end_at  a59=all_day
 *   a60=event_type  a61=location  a62=timezone
 *   a63=status   (b55 confirmed | b56 tentative | b57 cancelled)
 *   a64=priority (b55 normal | b56 low | b57 high | b58 urgent)
 *   a65=color  a66=rrule  a67=rrule_until  a68=exdates  a69=rdates
 *   a70=recurrence_id
 *   a71=show_as  (b55 busy | b56 free | b57 tentative | b58 oof)
 *   a72=visibility (b55 default | b56 public | b57 private | b58 confidential)
 *   a73=reminders  a74=is_availability (b55 Yes | b56 No)
 *   a75=availability_note  a76=rsvp_required  a77=allow_comments
 *   a78=external_source (b55 internal | b56 google | b57 outlook | b58 apple)
 *   a79=ical_uid  a80=sequence  a81=etag  a82=google_event_id  a83=meeting_url
 *   a84=attachments  a85=last_sync_at  a86=sync_token  a87=geo_lat  a88=geo_lng
 *   a89=tags  a90=custom_data  a91=App
 * Relations: 190 users→event (owner), 262 event→users (invitees)
 */
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { getCurrentUserId } from "@/features/shared/current-user";
import type { CalendarEvent, CalendarEventType } from "./types";
import { T, R } from "@/integrations/wp-schema";
import { appScopeBody, isInAppScope } from "@/features/shared/app-scope";

const SLUG = T.calendarEvent.slug;
const REL_USER_EVENT = R.userCalendarEvents;
const REL_EVENT_INVITEES = R.calendarEventInvitees;

// Option dictionaries (label → opaque code)
const STATUS_OUT: Record<string, string> = { confirmed: "b55", tentative: "b56", cancelled: "b57" };
const STATUS_IN: Record<string, string>  = { b55: "confirmed", b56: "tentative", b57: "cancelled" };
const PRIO_OUT:  Record<string, string> = { normal: "b55", low: "b56", high: "b57", urgent: "b58" };
const PRIO_IN:   Record<string, string> = { b55: "normal", b56: "low", b57: "high", b58: "urgent" };
const SHOWAS_OUT: Record<string, string> = { busy: "b55", free: "b56", tentative: "b57", oof: "b58" };
const SHOWAS_IN:  Record<string, string> = { b55: "busy", b56: "free", b57: "tentative", b58: "oof" };
const VIS_OUT: Record<string, string> = { default: "b55", public: "b56", private: "b57", confidential: "b58" };
const VIS_IN:  Record<string, string> = { b55: "default", b56: "public", b57: "private", b58: "confidential" };
const YESNO_OUT = (v: boolean | undefined): string => (v ? "b55" : "b56");
const YESNO_IN  = (v: any): boolean => v === "b55" || v === true || v === 1 || v === "1" || v === "yes";

function normalizeWPUserId(id: string | number | null | undefined): string {
  return String(id ?? "").replace(/^wp-/, "");
}

function mapEventFromWP(raw: any): CalendarEvent {
  return {
    id: String(raw.id ?? raw._ID),
    title: raw.a55 ?? "",
    description: raw.a56 ?? "",
    start_at: raw.a57 ?? raw.cct_created ?? "",
    end_at: raw.a58 ?? "",
    all_day: YESNO_IN(raw.a59),
    event_type: ((raw.a60 as CalendarEventType) || "personal"),
    location: raw.a61 ?? "",
    timezone: raw.a62 ?? undefined,
    status: ((STATUS_IN[raw.a63] || raw.a63 || "confirmed") as any),
    priority: ((PRIO_IN[raw.a64] || raw.a64 || "normal") as any),
    color: raw.a65 ?? "",
    rrule: raw.a66 ?? undefined,
    rrule_until: raw.a67 ?? undefined,
    exdates: raw.a68 ?? undefined,
    show_as: ((SHOWAS_IN[raw.a71] || raw.a71 || "busy") as any),
    visibility: ((VIS_IN[raw.a72] || raw.a72 || "default") as any),
    reminders: (() => { try { return raw.a73 ? JSON.parse(raw.a73) : []; } catch { return []; } })(),
    is_availability: YESNO_IN(raw.a74),
    availability_note: raw.a75 ?? undefined,
    meeting_url: raw.a83 ?? undefined,
  };
}

function mapEventToWP(e: Partial<CalendarEvent>): Record<string, any> {
  const b: Record<string, any> = {};
  if (e.title !== undefined) b.a55 = e.title;
  if (e.description !== undefined) b.a56 = e.description;
  if (e.start_at !== undefined) b.a57 = e.start_at;
  if (e.end_at !== undefined) b.a58 = e.end_at;
  if (e.all_day !== undefined) b.a59 = YESNO_OUT(e.all_day);
  if (e.event_type !== undefined) b.a60 = e.event_type;
  if (e.location !== undefined) b.a61 = e.location;
  if (e.timezone !== undefined) b.a62 = e.timezone;
  if (e.status !== undefined) b.a63 = STATUS_OUT[e.status as string] ?? e.status;
  if (e.priority !== undefined) b.a64 = PRIO_OUT[e.priority as string] ?? e.priority;
  if (e.color !== undefined) b.a65 = e.color;
  if (e.rrule !== undefined) b.a66 = e.rrule;
  if (e.rrule_until !== undefined) b.a67 = e.rrule_until;
  if (e.exdates !== undefined) b.a68 = e.exdates;
  if (e.show_as !== undefined) b.a71 = SHOWAS_OUT[e.show_as as string] ?? e.show_as;
  if (e.visibility !== undefined) b.a72 = VIS_OUT[e.visibility as string] ?? e.visibility;
  if (e.reminders !== undefined) b.a73 = JSON.stringify(e.reminders);
  if (e.is_availability !== undefined) b.a74 = YESNO_OUT(e.is_availability);
  if (e.availability_note !== undefined) b.a75 = e.availability_note;
  if (e.meeting_url !== undefined) b.a83 = e.meeting_url;
  return b;
}

export async function fetchCalendarEventsWordPress(): Promise<CalendarEvent[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];
  return fetchCalendarEventsForUserWordPress(userId);
}

export async function fetchCalendarEventsForUserWordPress(userIdInput: string | number): Promise<CalendarEvent[]> {
  const userId = normalizeWPUserId(userIdInput);
  if (!userId) return [];
  try {
    const ownedRels: any[] = await wordpressFetch<any[]>(`jet-rel/${REL_USER_EVENT}/children/${userId}`).catch(() => []);
    const invitedRels: any[] = await wordpressFetch<any[]>(`jet-rel/${REL_EVENT_INVITEES}/parents/${userId}`).catch(() => []);
    const ownedIds: string[] = (Array.isArray(ownedRels) ? ownedRels : [])
      .map((r: any) => String(r?.child_object_id ?? r?._ID ?? r?.id ?? "").replace(/^wp-/, ""))
      .filter(Boolean);
    const invitedIds: string[] = (Array.isArray(invitedRels) ? invitedRels : [])
      .map((r: any) => String(r?.parent_object_id ?? r?._ID ?? r?.id ?? "").replace(/^wp-/, ""))
      .filter(Boolean);
    const allIds = Array.from(new Set([...ownedIds, ...invitedIds]));
    if (allIds.length === 0) return [];
    const rows = await Promise.all(allIds.map((id) => wordpressCCTFetch<any>(SLUG, { id }).catch(() => null)));
    // Drop events belonging to the other apps sharing this CCT.
    return rows
      .filter((r): r is any => Boolean(r) && isInAppScope("calendarEvent", r))
      .map(mapEventFromWP);
  } catch {
    return [];
  }
}

export async function createCalendarEventWordPress(event: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;
  return createCalendarEventForUserWordPress(userId, event);
}

export async function createCalendarEventForUserWordPress(
  ownerUserIdInput: string | number,
  event: Partial<CalendarEvent>,
): Promise<CalendarEvent | null> {
  const userId = normalizeWPUserId(ownerUserIdInput);
  if (!userId) return null;
  const created: any = await wordpressCCTFetch(SLUG, { method: "POST", body: { ...mapEventToWP(event), ...appScopeBody("calendarEvent") } });
  const newId = String(created?.item_id ?? created?._ID ?? created?.id ?? "");
  if (!newId) return null;
  try {
    await wordpressFetch(`jet-rel/${REL_USER_EVENT}`, {
      method: "POST",
      body: { parent_id: userId, child_id: newId, context: "child", store_items_type: "update" },
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

/**
 * Invite a user to an event via REL 262. The relation exists in the dictionary
 * but is not registered on the live backend yet — swallow 404s so the event
 * itself still saves.
 */
export async function inviteUserToEventWordPress(eventId: string, userId: string): Promise<void> {
  try {
    await wordpressFetch(`jet-rel/${REL_EVENT_INVITEES}`, {
      method: "POST",
      body: { parent_id: eventId, child_id: userId, context: "child", store_items_type: "update" },
    });
  } catch {
    /* relation not registered on this install */
  }
}

