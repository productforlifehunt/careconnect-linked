/**
 * Location bubbles (Life360 "Bubbles").
 *   CCT 327 location_bubble: a55 centre lat · a56 centre lng · a57 radius m ·
 *   a58 start (ISO) · a59 end (ISO) · a60 status (b55 active / b56 popped by creator / b57 burst)
 *   REL 328 user → bubble (creator) · REL 329 care group → bubble
 *   CCT 199 a60: members can use bubbles (b56 = no; empty or b55 = yes)
 *
 * While a bubble is active, the other members of that group see only the
 * bubble area — not the exact spot, address, movement or trail.
 */
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { readLinkedCCTRows } from "@/features/shared/cct-rows";
import { getStoredWPUser } from "@/services/wp-auth";
import { T, R } from "@/integrations/wp-schema";
import i18n from "i18next";
import { decodeRel72Meta } from "@/features/care-groups/rel-meta";

const B = T.locationBubble;
const F = B.f;
const S = B.opt.STATUS;

export const BUBBLE_MAX_RADIUS_M = 40_234; // 25 miles
export const BUBBLE_MAX_HOURS = 6;

export interface LocationBubble {
  id: string;
  groupId: string;
  creatorId: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  startsAt: string;
  endsAt: string;
}

const bare = (v: string | number | null | undefined) => String(v ?? "").replace(/^wp-/, "");
const meId = () => bare(getStoredWPUser()?.user_id);

function isLive(row: any): boolean {
  if (String(row?.[F.STATUS] ?? "") !== S.ACTIVE) return false;
  const end = new Date(String(row?.[F.END_TIME] || "")).getTime();
  return Number.isFinite(end) && end > Date.now();
}

/** Active bubbles in every group I belong to. */
export async function fetchActiveBubblesInGroups(groupIds: string[]): Promise<LocationBubble[]> {
  const ids = [...new Set(groupIds.map(bare).filter(Boolean))];
  if (!ids.length) return [];
  const perGroup = await Promise.all(ids.map(async (gid) => {
    const rels = await wordpressFetch<any[]>(`jet-rel/${R.careGroupLocationBubbles}/children/${gid}`).catch(() => []);
    return (Array.isArray(rels) ? rels : []).map((r: any) => ({ gid, bid: String(r.child_object_id || "") })).filter((x) => x.bid);
  }));
  const links = perGroup.flat();
  if (!links.length) return [];
  const rows = await readLinkedCCTRows(B.slug, links.map((l) => l.bid));
  const live = rows.filter(isLive);
  const groupOf = new Map(links.map((l) => [l.bid, l.gid]));
  const out = await Promise.all(live.map(async (row) => {
    const id = String(row.id ?? row._ID);
    const parents = await wordpressFetch<any[]>(`jet-rel/${R.userLocationBubbles}/parents/${id}`).catch(() => []);
    const creatorId = Array.isArray(parents) && parents[0] ? String(parents[0].parent_object_id) : "";
    if (!creatorId) return null;
    return {
      id,
      groupId: groupOf.get(id) || "",
      creatorId,
      latitude: Number(row[F.CENTER_LATITUDE]),
      longitude: Number(row[F.CENTER_LONGITUDE]),
      radiusMeters: Number(row[F.RADIUS_METERS]),
      startsAt: String(row[F.START_TIME] || ""),
      endsAt: String(row[F.END_TIME] || ""),
    } as LocationBubble;
  }));
  return out.filter((b): b is LocationBubble => !!b && Number.isFinite(b.latitude) && Number.isFinite(b.longitude));
}

/** My own active bubbles (read from REL 328). */
export async function fetchMyActiveBubbles(): Promise<Array<Pick<LocationBubble, "id" | "latitude" | "longitude" | "radiusMeters" | "endsAt">>> {
  const me = meId();
  if (!me) return [];
  const rels = await wordpressFetch<any[]>(`jet-rel/${R.userLocationBubbles}/children/${me}`).catch(() => []);
  const ids = (Array.isArray(rels) ? rels : []).map((r: any) => String(r.child_object_id || "")).filter(Boolean);
  if (!ids.length) return [];
  const rows = await readLinkedCCTRows(B.slug, ids);
  return rows.filter(isLive).map((row) => ({
    id: String(row.id ?? row._ID),
    latitude: Number(row[F.CENTER_LATITUDE]),
    longitude: Number(row[F.CENTER_LONGITUDE]),
    radiusMeters: Number(row[F.RADIUS_METERS]),
    endsAt: String(row[F.END_TIME] || ""),
  }));
}

/**
 * The bubble that hides `subjectId` from me: an active bubble created by that
 * person in a group I share with them. My own bubbles never hide me from myself.
 */
export function bubbleHiding(bubbles: LocationBubble[], subjectId: string | number): LocationBubble | null {
  const s = bare(subjectId);
  if (!s || s === meId()) return null;
  return bubbles.find((b) => b.creatorId === s) || null;
}

/** Replace exact position facts with the bubble area. */
export function maskWithBubble<T extends Record<string, any>>(row: T, bubble: LocationBubble | null): T {
  if (!bubble) return row;
  return {
    ...row,
    latitude: bubble.latitude,
    longitude: bubble.longitude,
    accuracy_meters: bubble.radiusMeters,
    address_text: null,
    speed: null,
    moving_type: null,
    bubble,
  };
}

/** Accepted members of one group (REL careGroupMembers), excluding me. */
async function otherMemberIds(groupId: string): Promise<string[]> {
  const rels = await wordpressFetch<any[]>(`jet-rel/${R.careGroupMembers}/children/${bare(groupId)}`).catch(() => []);
  const me = meId();
  return (Array.isArray(rels) ? rels : [])
    .filter((r: any) => decodeRel72Meta(r?.meta).invitationStatus === "accepted")
    .map((r: any) => String(r.child_object_id || ""))
    .filter((id) => id && id !== me);
}

async function notifyGroup(groupId: string, title: string, message: string) {
  try {
    const ids = await otherMemberIds(groupId);
    if (!ids.length) return;
    const { notifyUsers } = await import("@/features/notifications/notify-events");
    await notifyUsers(ids, { type: "location", title, message, action_url: "/gps-tracking" });
  } catch { /* best-effort */ }
}

const Z = (cn: string, en: string) => ((i18n.language || "").startsWith("zh") ? cn : en);

async function myName(): Promise<string> {
  try { return await (await import("@/features/profile/app-user-name")).fetchMyAppUserName(); } catch { return ""; }
}

/** Is creating bubbles switched on for this group (CCT 199 a60)? */
export function groupAllowsBubbles(group: any): boolean {
  return group?.bubbles_allowed !== false;
}

/**
 * Create a bubble in one group around my current position. The stored centre
 * is moved a random distance (up to half the radius) so it never marks the exact spot.
 */
export async function createBubble(input: { groupId: string; latitude: number; longitude: number; radiusMeters: number; hours: number }): Promise<string> {
  const me = meId();
  if (!me) throw new Error("Not authenticated");
  const gid = bare(input.groupId);
  const group = await wordpressCCTFetch<any>(T.careGroup.slug, { id: gid });
  if (String(group?.[T.careGroup.f.MEMBERS_CAN_USE_BUBBLES] ?? "") === T.careGroup.opt.MEMBERS_CAN_USE_BUBBLES.NO) {
    throw new Error(Z("这个群组的管理员关闭了泡泡功能。", "An admin turned off Bubbles for this group."));
  }
  const radius = Math.min(Math.max(Math.round(input.radiusMeters), 1), BUBBLE_MAX_RADIUS_M);
  const hours = Math.min(Math.max(input.hours, 0.25), BUBBLE_MAX_HOURS);
  const angle = Math.random() * 2 * Math.PI;
  const dist = Math.random() * radius * 0.5;
  const dLat = (dist * Math.cos(angle)) / 111_320;
  const dLng = (dist * Math.sin(angle)) / (111_320 * Math.cos((input.latitude * Math.PI) / 180));
  const start = new Date();
  const end = new Date(start.getTime() + hours * 3600_000);
  const created = await wordpressCCTFetch<any>(B.slug, {
    method: "POST",
    body: {
      [F.CENTER_LATITUDE]: String(input.latitude + dLat),
      [F.CENTER_LONGITUDE]: String(input.longitude + dLng),
      [F.RADIUS_METERS]: String(radius),
      [F.START_TIME]: start.toISOString(),
      [F.END_TIME]: end.toISOString(),
      [F.STATUS]: S.ACTIVE,
    },
  });
  const id = String(created?.item_id || created?._ID || created?.id || "");
  if (!id) throw new Error("Bubble was created without an item ID");
  await Promise.all([
    wordpressFetch(`jet-rel/${R.userLocationBubbles}`, { method: "POST", body: { parent_id: Number(me), child_id: Number(id), context: "child", store_items_type: "update" } }),
    wordpressFetch(`jet-rel/${R.careGroupLocationBubbles}`, { method: "POST", body: { parent_id: Number(gid), child_id: Number(id), context: "child", store_items_type: "update" } }),
  ]);
  clearBubbleCaches();
  const who = await myName();
  void notifyGroup(gid,
    Z(`${who || "有成员"} 创建了一个泡泡`, `${who || "A member"} created a Bubble`),
    Z(`在 ${hours} 小时内只显示大概范围。担心安全时可以戳破泡泡。`, `Only the general area is shown for ${hours} h. You can burst the Bubble if you are worried.`));
  return id;
}

async function setStatus(bubbleId: string, status: string) {
  await wordpressCCTFetch(B.slug, { id: bubbleId, method: "PUT", body: { [F.STATUS]: status } });
  clearBubbleCaches();
}

/** The creator ends their own bubble. */
export async function popBubble(bubble: { id: string; groupId: string }): Promise<void> {
  await setStatus(bubble.id, S.POPPED_BY_CREATOR);
  const who = await myName();
  void notifyGroup(bubble.groupId,
    Z(`${who || "成员"} 的泡泡已结束`, `${who || "A member"}'s Bubble ended`),
    Z("现在重新显示准确位置。", "Exact location is shared again."));
}

/** Any other member bursts a bubble out of concern; the whole group is told. */
export async function burstBubble(bubble: { id: string; groupId: string }, creatorName: string): Promise<void> {
  await setStatus(bubble.id, S.BURST);
  const who = await myName();
  const ids = await otherMemberIds(bubble.groupId);
  const { notifyUsers } = await import("@/features/notifications/notify-events");
  void notifyUsers(ids, {
    type: "location",
    title: Z(`${who || "有成员"} 戳破了 ${creatorName || "成员"} 的泡泡`, `${who || "A member"} burst ${creatorName || "a member"}'s Bubble`),
    message: Z("现在显示准确位置。", "Exact location is shown again."),
    action_url: "/gps-tracking",
  }).catch(() => {});
}

let myBubblesCache: { at: number; list: Awaited<ReturnType<typeof fetchMyActiveBubbles>> } | null = null;

async function myBubblesCached() {
  if (myBubblesCache && Date.now() - myBubblesCache.at < 60_000) return myBubblesCache.list;
  const list = await fetchMyActiveBubbles();
  myBubblesCache = { at: Date.now(), list };
  return list;
}

async function groupOfBubble(id: string): Promise<string> {
  const p = await wordpressFetch<any[]>(`jet-rel/${R.careGroupLocationBubbles}/parents/${id}`).catch(() => []);
  return Array.isArray(p) && p[0] ? String(p[0].parent_object_id) : "";
}

function metersBetween(aLat: number, aLng: number, bLat: number, bLng: number) {
  const r = 6_371_000, toR = Math.PI / 180;
  const dLat = (bLat - aLat) * toR, dLng = (bLng - aLng) * toR;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * toR) * Math.cos(bLat * toR) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

/**
 * Called on my device after each position write: leaving a bubble pops it;
 * an emergency (SOS / emergency answer) bursts all of them.
 */
export async function checkMyBubblesAfterPosition(lat: number, lng: number, emergency: boolean): Promise<void> {
  if (!meId()) return;
  const mine = await myBubblesCached();
  if (!mine.length) return;
  await Promise.all(mine.map(async (b) => {
    const outside = metersBetween(lat, lng, b.latitude, b.longitude) > b.radiusMeters;
    if (!emergency && !outside) return;
    const groupId = await groupOfBubble(b.id);
    if (emergency) {
      await setStatus(b.id, S.BURST);
      if (groupId) void notifyGroup(groupId, Z("紧急情况：泡泡已自动戳破", "Emergency: Bubble burst automatically"), Z("现在显示准确位置。", "Exact location is shown again."));
    } else {
      await popBubble({ id: b.id, groupId });
    }
  }));
}

let forMeCache: { at: number; p: Promise<LocationBubble[]> } | null = null;

/** Active bubbles in all of my groups (short cache: every location view shares it). */
export function activeBubblesForMe(): Promise<LocationBubble[]> {
  if (forMeCache && Date.now() - forMeCache.at < 15_000) return forMeCache.p;
  const p = (async () => {
    const { fetchMyCareGroupIdsWordPress } = await import("@/features/care-groups/source.wordpress");
    return fetchActiveBubblesInGroups(await fetchMyCareGroupIdsWordPress());
  })().catch(() => [] as LocationBubble[]);
  forMeCache = { at: Date.now(), p };
  return p;
}

export function clearBubbleCaches() {
  forMeCache = null;
  myBubblesCache = null;
}

/** My active bubbles together with the group each one is in. */
export async function fetchMyActiveBubblesWithGroup(): Promise<Array<{ id: string; groupId: string; radiusMeters: number; endsAt: string }>> {
  const mine = await fetchMyActiveBubbles();
  return Promise.all(mine.map(async (b) => ({ id: b.id, groupId: await groupOfBubble(b.id), radiusMeters: b.radiusMeters, endsAt: b.endsAt })));
}
