import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";
import { fetchMyAppUserName } from "@/features/profile/app-user-name";
import { T, R } from "@/integrations/wp-schema";
import { fetchWPUserSafe } from "@/features/cared-ones/source.wordpress-extended";
import { fetchWPUserPublicProfile } from "@/features/shared/wp-users";
import {
  encodeRel72Meta,
  decodeRel72Meta,
  encodeRel75Meta,
  decodeRel75Meta,
  type InvitationStatus,
} from "./rel-meta";

// Live JetEngine relations (per data bible)
const REL_GROUP_MEMBER = R.careGroupMembers;          // care_group → users
const REL_GROUP_GALLERY = R.careGroupGalleries;         // care_group → care_group_gallery
const REL_GROUP_SUBGROUP = R.careGroupPrivateMemberGroups;        // care_group → care_group_private_member_group
const REL_GROUP_POST = R.careGroupPosts;            // care_group → care_group_not_too_special_post
const REL_SUBGROUP_MEMBERS = R.privateMemberGroupMembers;      // care_group_private_member_group → users
const REL_GROUP_INVITE = R.careGroupInvites;         // care_group → care_group_invite

// ─── Opaque field codes (bible) ──────────────────────────────
const F_POST = T.careGroupPost.f;       // 202. care group post
const F_INVITE = T.careGroupInvite.f;    // 200. care group invite link
const O_INVITE = T.careGroupInvite.opt;
const F_GALLERY = T.careGroupGallery.f;    // 203. care group gallery
const F_SUBGROUP = T.careGroupPrivateMemberGroup.f;   // 201. private member group
const F_GROUP = T.careGroup.f;            // 199. care group
const O_GROUP = T.careGroup.opt;
const YES = "b55";
const NO = "b56";

// Post type option codes — CCT 202 a55: b55=discussion, b56=announcement, b57=wish
const POST_TYPE_CODE: Record<string, string> = { discussion: "b55", announcement: "b56", wish: "b57" };
const POST_TYPE_LABEL: Record<string, string> = { b55: "discussion", b56: "announcement", b57: "wish" };

function isYesCode(v: unknown): boolean {
  if (v === true) return true;
  if (typeof v === "string") {
    const s = v.toLowerCase();
    return s === "b55" || s === "yes" || s === "1" || s === "true";
  }
  return false;
}

/** REL 72 meta — opaque-code only (dictionary). */
const memberMeta = encodeRel72Meta;

function normalizeWpObjectId(value: string | number | null | undefined): number {
  return Number(String(value ?? "").replace(/^wp-/, ""));
}

function normalizeMetaList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

async function fetchRelatedCctItems(relationId: number, parentId: string, cctSlug: string): Promise<any[]> {
  const normalizedParentId = normalizeWpObjectId(parentId);
  if (!normalizedParentId) return [];
  const rels = await wordpressFetch<any[]>(`jet-rel/${relationId}/children/${normalizedParentId}`);
  if (!Array.isArray(rels) || rels.length === 0) return [];
  const childIds = rels.map((r: any) => String(r.child_object_id || "")).filter(Boolean);
  // Beyond a few children, one list request beats N per-id requests (the old
  // N+1 made the care-circle feed take ~20s to appear).
  if (childIds.length > 3) {
    try {
      const all = await wordpressCCTFetch<any[]>(cctSlug);
      if (Array.isArray(all)) {
        const wanted = new Set(childIds);
        const byId = new Map(all.map((it: any) => [String(it.id), it]));
        const hits = childIds.map((cid) => byId.get(cid)).filter(Boolean);
        if (hits.length === wanted.size) return hits;
      }
    } catch { /* fall through to per-id fetch */ }
  }
  const items = await Promise.all(childIds.map(async (childId) => {
    try {
      return await wordpressCCTFetch(cctSlug, { id: childId });
    } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
  }));
  return items.filter(Boolean);
}

// ─── Care Group Posts (CCT 76) ──────────────────────────────
export async function fetchCareGroupPostsWordPress(groupId: string, type?: string): Promise<any[]> {
  try {
    const posts = await fetchRelatedCctItems(REL_GROUP_POST, groupId, "care_group_post");
    if (!Array.isArray(posts)) return [];
    const normalizeType = (raw: any): string => {
      const v = Array.isArray(raw) ? (raw[0] || "") : (raw || "");
      return POST_TYPE_LABEL[String(v)] || String(v) || "discussion";
    };
    const myId = getStoredWPUser()?.user_id ? Number(getStoredWPUser()!.user_id) : 0;
    const notYetDue = (p: any): boolean => {
      const raw = p[F_POST.SCHEDULED_AT];
      if (!raw) return false;
      const due = Date.parse(String(raw).replace(" ", "T"));
      if (!Number.isFinite(due)) return false;
      return due > Date.now();
    };
    return posts
      .filter((p: any) => !type || normalizeType(p[F_POST.TYPE]) === type)
      // a59 scheduled_at in the future = not published yet; only its author sees it.
      .filter((p: any) => !notYetDue(p) || Number(p.cct_author_id || p.author_id) === myId)
      // Newest first, deterministic: relation order is not guaranteed.
      .sort((a: any, b: any) => {
        const ta = Date.parse(a.created_at || "") || 0;
        const tb = Date.parse(b.created_at || "") || 0;
        if (tb !== ta) return tb - ta;
        return Number(b.id || b._ID || 0) - Number(a.id || a._ID || 0);
      })
      .map((p: any) => ({
        id: p.id,
        group_id: groupId,
        author_id: p.author_id || null,
        type: normalizeType(p[F_POST.TYPE]),
        title: p[F_POST.TITLE] || null,
        content: p[F_POST.CONTENT] || null,
        is_pinned: isYesCode(p[F_POST.IS_PINNED]),
        scheduled_at: p[F_POST.SCHEDULED_AT] || null,
        is_scheduled: notYetDue(p),
        created_at: p.created_at,
        updated_at: p.updated_at || p.created_at,
        author: p.author_id ? { id: p.author_id, full_name: null, avatar_url: null } : null,
      }));
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

export async function createGroupPostWordPress(post: { group_id: string; content: string; type?: string; title?: string; scheduled_at?: string | null }): Promise<string | null> {
  const created = await wordpressCCTFetch<any>(T.careGroupPost.slug, {
    method: "POST",
    body: {
      [F_POST.TITLE]: post.title || post.content.substring(0, 50),
      [F_POST.CONTENT]: post.content,
      [F_POST.TYPE]: POST_TYPE_CODE[post.type || "discussion"] || "b55",
      [F_POST.IS_PINNED]: NO,
      [F_POST.SCHEDULED_AT]: post.scheduled_at || "",
    },
  });
  const groupId = normalizeWpObjectId(post.group_id);
  const postId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  if (groupId && postId) {
    await wordpressFetch(`jet-rel/${REL_GROUP_POST}`, {
      method: "POST",
      body: { parent_id: groupId, child_id: postId, context: "child", store_items_type: "update" },
    });
  }

  // Notify group members — non-blocking, never fails the post.
  if (groupId && postId) {
    try {
      const rels = await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_MEMBER}/children/${groupId}`);
      const memberIds = Array.isArray(rels) ? rels.map((r: any) => r.child_object_id).filter(Boolean) : [];
      const { notifyGroupPost } = await import("@/features/notifications/notify-events");
      await notifyGroupPost(
        memberIds,
        String(groupId),
        post.title || post.content.substring(0, 50),
        (post.type || "discussion") === "announcement",
      );
    } catch { /* non-blocking */ }
  }

  return postId ? String(postId) : null;
}

export async function updateGroupPostWordPress(id: string, updates: { content?: string; title?: string; is_pinned?: boolean; type?: string; scheduled_at?: string | null }): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.content !== undefined) body[F_POST.CONTENT] = updates.content;
  if (updates.title !== undefined) body[F_POST.TITLE] = updates.title;
  if (updates.is_pinned !== undefined) body[F_POST.IS_PINNED] = updates.is_pinned ? YES : NO;
  if (updates.type !== undefined) body[F_POST.TYPE] = POST_TYPE_CODE[updates.type] || updates.type;
  if (updates.scheduled_at !== undefined) body[F_POST.SCHEDULED_AT] = updates.scheduled_at || "";
  await wordpressCCTFetch(T.careGroupPost.slug, { id, method: "PUT", body });
}

export async function deleteGroupPostWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(T.careGroupPost.slug, { id, method: "DELETE" });
}

// ─── Group Settings (CCT 199 — care_group) ──────────────────
export async function updateCareGroupWordPress(id: string, updates: {
  name?: string;
  description?: string;
  is_private?: boolean;
  join_code?: string;
  is_active?: boolean;
}): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.name !== undefined) body[F_GROUP.NAME] = updates.name;
  if (updates.description !== undefined) body[F_GROUP.DESCRIPTION] = updates.description;
  if (updates.is_private !== undefined) {
    body[F_GROUP.GROUP_TYPE] = updates.is_private ? O_GROUP.GROUP_TYPE.PRIVATE : O_GROUP.GROUP_TYPE.PUBLIC;
  }
  if (updates.join_code !== undefined) body[F_GROUP.JOIN_CODE] = updates.join_code;
  if (updates.is_active !== undefined) {
    body[F_GROUP.STATUS] = updates.is_active ? O_GROUP.STATUS.ACTIVE : O_GROUP.STATUS.NO;
  }
  await wordpressCCTFetch(T.careGroup.slug, { id, method: "PUT", body });
}

export async function deleteCareGroupWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(T.careGroup.slug, { id, method: "DELETE" });
}

// ─── Invitations ────────────────────────────────────────────
// Dictionary source of truth: invitation state lives on Rel 72 meta, not a separate CCT.

/** Group display name (best-effort, only used for notification copy). */
async function groupNameOf(groupId: string | number): Promise<string> {
  try {
    const g = await wordpressCCTFetch<any>(T.careGroup.slug, { id: String(groupId) });
    return g?.[T.careGroup.f.NAME] || g?.name || "your care group";
  } catch {
    return "your care group";
  }
}

/** Owner/admin user ids of a group, from Rel 72 meta (notification routing). */
async function groupAdminIds(groupId: number): Promise<number[]> {
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_MEMBER}/children/${groupId}`);
    return (Array.isArray(rels) ? rels : [])
      .filter((r: any) => {
        const m = decodeRel72Meta(r?.meta);
        return m.memberTypes.includes("owner") || m.memberTypes.includes("admin");
      })
      .map((r: any) => Number(r.child_object_id))
      .filter((n) => Number.isFinite(n) && n > 0);
  } catch {
    return [];
  }
}

/**
 * Bible flow: every invitation — in-app user or outside email — travels as a
 * CCT 200 invite link. Inviting somebody creates an "App Native generated"
 * one-time link (never expires, no use cap, hidden from the invite-links list)
 * and delivers that link. Membership is only written when the invited person
 * confirms and completes the group onboarding popup.
 */
export async function inviteToGroupWordPress(
  groupId: string,
  userIdOrEmail: string,
  invitedAs: InvitedAs = "normal group member",
): Promise<{ token: string; url: string; email: "sent" | "skipped" | "failed" }> {
  const isEmail = userIdOrEmail.includes("@");
  const normalizedGroupId = normalizeWpObjectId(groupId);
  if (!normalizedGroupId) throw new Error("Invalid care group");
  const childId = isEmail ? 0 : normalizeWpObjectId(userIdOrEmail);
  if (!isEmail && !childId) throw new Error("Invalid user");

  const invite = await createGroupInviteWordPress({
    groupId: String(normalizedGroupId),
    name: "",
    note: "",
    invitedAs,
    source: "app native generated",
  });
  const url = `${window.location.origin}/join/${invite.token}`;
  const groupName = await groupNameOf(normalizedGroupId);

  let emailResult: "sent" | "skipped" | "failed" = "skipped";
  if (childId) {
    // App user: the invite arrives as an in-app notification carrying the link.
    try {
      const { notifyGroupInvite } = await import("@/features/notifications/notify-events");
      await notifyGroupInvite(childId, groupName, url);
    } catch { /* best-effort */ }
  } else {
    // Outside email address: the link is emailed to them.
    try {
      const { sendGroupInviteEmail } = await import("@/features/notifications/invite-email");
      emailResult = (await sendGroupInviteEmail(userIdOrEmail, groupName, url)) ? "sent" : "failed";
    } catch { emailResult = "failed"; }
  }
  return { token: invite.token, url, email: emailResult };
}


export async function fetchGroupInvitationsWordPress(groupId: string): Promise<any[]> {
  try {
    const normalizedGroupId = normalizeWpObjectId(groupId);
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_MEMBER}/children/${normalizedGroupId}`);
    return (Array.isArray(rels) ? rels : [])
      .filter((r: any) => decodeRel72Meta(r?.meta).invitationStatus === "pending")
      .map((r: any) => ({
        id: `${normalizedGroupId}:${r.child_object_id}`,
        group_id: groupId,
        user_id: `wp-${r.child_object_id}`,
        role: "nothing special",
        invitation_status: "pending",
        invited_email: null,
        created_at: null,
      }));
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

export async function cancelInvitationWordPress(invitationId: string): Promise<void> {
  const [groupPart, userPart] = invitationId.split(":");
  const groupId = normalizeWpObjectId(groupPart);
  const userId = normalizeWpObjectId(userPart);
  if (!groupId || !userId) return;
  await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
    method: "POST",
    body: { parent_id: groupId, child_id: userId, context: "child", store_items_type: "disconnect" },
  });
}

export async function fetchMyPendingInvitationsWordPress(): Promise<any[]> {
  try {
    const wpUser = getStoredWPUser();
    if (!wpUser?.user_id) return [];
    const userId = Number(wpUser.user_id);
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_MEMBER}/parents/${userId}`);
    const pending = (Array.isArray(rels) ? rels : []).filter(
      (r: any) => decodeRel72Meta(r?.meta).invitationStatus === "pending"
    );
    // Enrich with real group names
    const enriched = await Promise.all(pending.map(async (r: any) => {
      const groupId = r.parent_object_id ? String(r.parent_object_id) : null;
      let groupName = "Care Group";
      if (groupId) {
        try {
          const g = await wordpressCCTFetch<any>(T.careGroup.slug, { id: groupId });
          groupName = g?.name || groupName;
        } catch {}
      }
      return {
        id: `${r.parent_object_id}:${userId}`,
        group_id: groupId,
        user_id: `wp-${userId}`,
        role: "member",
        invitation_status: "pending",
        created_at: null,
        group: groupId ? { id: groupId, name: groupName } : null,
      };
    }));
    return enriched;
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

export async function acceptInvitationWordPress(invitationId: string): Promise<void> {
  const [groupPart, userPart] = invitationId.split(":");
  const groupId = normalizeWpObjectId(groupPart);
  const userId = normalizeWpObjectId(userPart) || (getStoredWPUser()?.user_id ? Number(getStoredWPUser()!.user_id) : 0);
  if (groupId && userId) {
    await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
      method: "POST",
      body: {
        parent_id: groupId,
        child_id: userId,
        context: "child",
        store_items_type: "update",
        meta: memberMeta({ invitationStatus: "accepted" }),
      },
    });
    await notifyInviteOutcome(groupId, true);
  }
}

export async function declineInvitationWordPress(invitationId: string): Promise<void> {
  const [groupPart, userPart] = invitationId.split(":");
  const groupId = normalizeWpObjectId(groupPart);
  const userId = normalizeWpObjectId(userPart);
  if (!groupId || !userId) return;
  await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
    method: "POST",
    body: { parent_id: groupId, child_id: userId, context: "child", store_items_type: "update", meta: memberMeta({ invitationStatus: "declined" }) },
  });
  await notifyInviteOutcome(groupId, false);
}

/** Tell the group's owners/admins how an invitation was answered. Never throws. */
async function notifyInviteOutcome(groupId: number, accepted: boolean): Promise<void> {
  try {
    const [{ notifyInviteResponse }, admins, name] = await Promise.all([
      import("@/features/notifications/notify-events"),
      groupAdminIds(groupId),
      groupNameOf(groupId),
    ]);
    await notifyInviteResponse(admins, String(groupId), name, accepted);
  } catch { /* best-effort */ }
}


// ─── Member Roles & Removal ─────────────────────────────────
// JetEngine relation 72 (care_group → users) dictionary meta fields.
export async function updateMemberRoleWordPress(memberId: string, updates: any, groupId?: string): Promise<void> {
  const normalizedGroupId = normalizeWpObjectId(groupId);
  const normalizedMemberId = normalizeWpObjectId(memberId);
  if (!normalizedGroupId || !normalizedMemberId) return;
  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_MEMBER}/children/${normalizedGroupId}`);
  const existing = (Array.isArray(rels) ? rels : []).find((r: any) => Number(r.child_object_id) === normalizedMemberId);
  const decoded = decodeRel72Meta(existing?.meta);
  const nextTypes = new Set(decoded.memberTypes.length ? decoded.memberTypes : ["nothing special"]);
  const nextRoles = new Set(decoded.memberRoles.length ? decoded.memberRoles : ["nothing special"]);

  if (typeof updates === "string") {
    nextTypes.clear();
    nextTypes.add(updates);
  } else {
    if (updates?.is_owner !== undefined) updates.is_owner ? nextTypes.add("owner") : nextTypes.delete("owner");
    if (updates?.is_admin !== undefined) updates.is_admin ? nextTypes.add("admin") : nextTypes.delete("admin");
    if (updates?.is_cared_one !== undefined) updates.is_cared_one ? nextRoles.add("cared one") : nextRoles.delete("cared one");
  }
  if ([...nextTypes].some((v) => v !== "nothing special")) nextTypes.delete("nothing special");
  if ([...nextRoles].some((v) => v !== "nothing special")) nextRoles.delete("nothing special");
  await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
    method: "POST",
    body: {
      parent_id: normalizedGroupId,
      child_id: normalizedMemberId,
      context: "child",
      store_items_type: "update",
      meta: memberMeta({
        displayName: decoded.displayName || undefined,
        memberTypes: [...nextTypes],
        memberRoles: [...nextRoles],
        invitationStatus: decoded.invitationStatus,
      }),
    },
  });
  // The affected member must know their own role changed — non-blocking.
  try {
    const { notifyMemberRoleChanged } = await import("@/features/notifications/notify-events");
    const label = [...nextTypes].filter((v) => v !== "nothing special").join(", ") || "member";
    await notifyMemberRoleChanged(normalizedMemberId, String(normalizedGroupId), label);
  } catch { /* best-effort */ }
}

export async function removeGroupMemberWordPress(memberId: string, groupId?: string): Promise<void> {
  const normalizedGroupId = normalizeWpObjectId(groupId);
  const normalizedMemberId = normalizeWpObjectId(memberId);
  if (normalizedGroupId && normalizedMemberId) {
    const name = await groupNameOf(normalizedGroupId);
    await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
      method: "POST",
      body: { parent_id: normalizedGroupId, child_id: normalizedMemberId, context: "child", store_items_type: "disconnect" },
    });
    try {
      const { notifyMemberRemoved } = await import("@/features/notifications/notify-events");
      await notifyMemberRemoved(normalizedMemberId, name);
    } catch { /* best-effort */ }
  }
}


// ─── Group invite links (CCT 200 + Rel 222) ─────────────────
// a55 token · a56 name · a57 expires_at · a58 max_uses · a59 use_count
// a60 is revoked (Radio) · a61 note · a62 invited as (Radio) · a63 custom / app native (Radio)
function generateInviteToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export type InvitedAs = "normal group member" | "owner" | "admin";
export type InviteSource = "custom" | "app native generated";

const INVITED_AS_CODE: Record<InvitedAs, string> = {
  "normal group member": O_INVITE.THE_USER_IS_INVITED_AS.NORMAL_GROUP_MEMBER,
  owner: O_INVITE.THE_USER_IS_INVITED_AS.OWNER,
  admin: O_INVITE.THE_USER_IS_INVITED_AS.ADMIN,
};
const INVITED_AS_LABEL: Record<string, InvitedAs> = {
  [O_INVITE.THE_USER_IS_INVITED_AS.NORMAL_GROUP_MEMBER]: "normal group member",
  [O_INVITE.THE_USER_IS_INVITED_AS.OWNER]: "owner",
  [O_INVITE.THE_USER_IS_INVITED_AS.ADMIN]: "admin",
};
const SOURCE_CODE: Record<InviteSource, string> = {
  custom: O_INVITE.CUSTOM_OR_APP_NATIVE_GENERATED.CUSTOM,
  "app native generated": O_INVITE.CUSTOM_OR_APP_NATIVE_GENERATED.APP_NATIVE_GENERATED,
};
const SOURCE_LABEL: Record<string, InviteSource> = {
  [O_INVITE.CUSTOM_OR_APP_NATIVE_GENERATED.CUSTOM]: "custom",
  [O_INVITE.CUSTOM_OR_APP_NATIVE_GENERATED.APP_NATIVE_GENERATED]: "app native generated",
};

function normalizeInvite(raw: any, groupId?: string) {
  const id = String(raw.id || raw._ID || "");
  const expiresRaw = raw[F_INVITE.EXPIRES_AT];
  const expires = expiresRaw ? String(expiresRaw) : null;
  const isExpired = expires ? new Date(expires).getTime() < Date.now() : false;
  const maxUses = Number(raw[F_INVITE.MAX_USES] || 0);
  const useCount = Number(raw[F_INVITE.USE_COUNT] || 0);
  const isRevoked = String(raw[F_INVITE.IS_REVOKED] || "") === O_INVITE.IS_REVOKED.YES;
  const isExhausted = maxUses > 0 && useCount >= maxUses;
  return {
    id,
    group_id: groupId || null,
    token: raw[F_INVITE.TOKEN] || "",
    name: raw[F_INVITE.NAME] || "",
    note: raw[F_INVITE.NOTE] || "",
    invited_as: INVITED_AS_LABEL[String(raw[F_INVITE.THE_USER_IS_INVITED_AS] || "")] || "normal group member",
    source: SOURCE_LABEL[String(raw[F_INVITE.CUSTOM_OR_APP_NATIVE_GENERATED] || "")] || "custom",
    expires_at: expires,
    max_uses: maxUses,
    use_count: useCount,
    is_revoked: isRevoked,
    is_expired: isExpired,
    is_exhausted: isExhausted,
    is_active: !isRevoked && !isExpired && !isExhausted,
    created_at: raw.created_at || raw.cct_created || null,
  };
}

/**
 * Only the links the group's owners/admins created themselves are listed
 * (a63 = Custom). App-native one-time links stay out of the list.
 */
export async function fetchGroupInvitesWordPress(groupId: string): Promise<any[]> {
  try {
    const items = await fetchRelatedCctItems(REL_GROUP_INVITE, groupId, T.careGroupInvite.slug);
    return items.map((i: any) => normalizeInvite(i, groupId)).filter((i) => i.source === "custom");
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

export async function createGroupInviteWordPress(input: {
  groupId: string;
  name?: string;
  note?: string;
  expiresAt?: string | null;
  maxUses?: number;
  token?: string;
  invitedAs?: InvitedAs;
  source?: InviteSource;
}): Promise<any> {
  const token = (input.token || generateInviteToken()).trim();
  const source: InviteSource = input.source || "custom";
  const created = await wordpressCCTFetch<any>(T.careGroupInvite.slug, {
    method: "POST",
    body: {
      [F_INVITE.TOKEN]: token,
      [F_INVITE.NAME]: input.name || "",
      // App-native one-time links never expire and have no use cap.
      [F_INVITE.EXPIRES_AT]: source === "app native generated" ? "" : (input.expiresAt || ""),
      // JetEngine REST validates CCT number columns as strings — send them as strings.
      [F_INVITE.MAX_USES]: source === "app native generated" ? "0" : String(Number(input.maxUses || 0)),
      [F_INVITE.USE_COUNT]: "0",
      [F_INVITE.IS_REVOKED]: O_INVITE.IS_REVOKED.NO,
      [F_INVITE.NOTE]: input.note || "",
      [F_INVITE.THE_USER_IS_INVITED_AS]: INVITED_AS_CODE[input.invitedAs || "normal group member"],
      [F_INVITE.CUSTOM_OR_APP_NATIVE_GENERATED]: SOURCE_CODE[source],
    },
  });
  const groupIdNum = normalizeWpObjectId(input.groupId);
  const inviteId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  if (groupIdNum && inviteId) {
    await wordpressFetch(`jet-rel/${REL_GROUP_INVITE}`, {
      method: "POST",
      body: { parent_id: groupIdNum, child_id: inviteId, context: "child", store_items_type: "update" },
    });
  }
  return normalizeInvite({ ...created, id: inviteId, [F_INVITE.TOKEN]: token }, input.groupId);
}

export async function updateGroupInviteWordPress(id: string, updates: {
  name?: string;
  note?: string;
  token?: string;
  expiresAt?: string | null;
  maxUses?: number;
  isRevoked?: boolean;
  invitedAs?: InvitedAs;
}): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.name !== undefined) body[F_INVITE.NAME] = updates.name;
  if (updates.note !== undefined) body[F_INVITE.NOTE] = updates.note;
  if (updates.token !== undefined) body[F_INVITE.TOKEN] = updates.token;
  if (updates.expiresAt !== undefined) body[F_INVITE.EXPIRES_AT] = updates.expiresAt || "";
  if (updates.maxUses !== undefined) body[F_INVITE.MAX_USES] = String(Number(updates.maxUses || 0));
  if (updates.isRevoked !== undefined) {
    body[F_INVITE.IS_REVOKED] = updates.isRevoked ? O_INVITE.IS_REVOKED.YES : O_INVITE.IS_REVOKED.NO;
  }
  if (updates.invitedAs !== undefined) body[F_INVITE.THE_USER_IS_INVITED_AS] = INVITED_AS_CODE[updates.invitedAs];
  await wordpressCCTFetch(T.careGroupInvite.slug, { id, method: "PUT", body });
}

export async function deleteGroupInviteWordPress(id: string): Promise<void> {
  await wordpressCCTFetch(T.careGroupInvite.slug, { id, method: "DELETE" });
}

/** Invite-link preview for the join page: which group, invited as what. */
export async function previewGroupInviteWordPress(token: string): Promise<{
  group_id: string;
  group_name: string;
  invited_as: InvitedAs;
  note: string;
  name: string;
}> {
  const { invite, groupId, groupName } = await resolveInviteByToken(token);
  return {
    group_id: String(groupId),
    group_name: groupName,
    invited_as: invite.invited_as as InvitedAs,
    note: invite.note,
    name: invite.name,
  };
}

// ─── Join by invite link / invite code ──────────────────────
/** Finds a CCT 200 link by its token (a55), validates it, resolves its group. */
async function resolveInviteByToken(token: string): Promise<{
  invite: ReturnType<typeof normalizeInvite>;
  inviteId: number;
  groupId: number;
  groupName: string;
}> {
  const trimmed = (token || "").trim();
  if (!trimmed) throw new Error("Invalid invite link");
  const invites = await wordpressCCTFetch<any[]>(T.careGroupInvite.slug, { params: { _limit: 500 } });
  if (!Array.isArray(invites)) throw new Error("Invalid invite link");
  const lower = trimmed.toLowerCase();
  const match = invites.find((i: any) => String(i[F_INVITE.TOKEN] || "").trim().toLowerCase() === lower);
  if (!match) throw new Error("Invalid invite link");
  const invite = normalizeInvite(match);
  if (invite.is_revoked) throw new Error("This invite link has been revoked.");
  if (invite.is_expired) throw new Error("This invite link has expired.");
  if (invite.is_exhausted) throw new Error("This invite link has reached its maximum uses.");

  const inviteId = normalizeWpObjectId(match.id || match._ID);
  const parents = await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_INVITE}/parents/${inviteId}`);
  const groupId = Array.isArray(parents) && parents.length ? Number(parents[0].parent_object_id) : 0;
  if (!groupId) throw new Error("This invite link is not connected to a group.");
  const groupName = await groupNameOf(groupId);
  return { invite, inviteId, groupId, groupName };
}

/**
 * Completes the group onboarding popup: writes the Rel 223 membership with the
 * in-group display name and the role the link invited the person as, then bumps
 * a59 use count.
 */
export async function joinGroupByCodeWordPress(token: string, displayName?: string): Promise<any> {
  try {
    const { invite, inviteId, groupId, groupName } = await resolveInviteByToken(token);

    const wpUser = getStoredWPUser();
    const userId = wpUser?.user_id ? Number(wpUser.user_id) : 0;
    if (!userId) throw new Error("Please sign in to join this group.");

    const existingMembers = await wordpressFetch<any[]>(
      `jet-rel/${REL_GROUP_MEMBER}/children/${groupId}`
    );
    const alreadyMember = (Array.isArray(existingMembers) ? existingMembers : [])
      .some((r: any) => Number(r.child_object_id) === userId
        && decodeRel72Meta(r?.meta).invitationStatus === "accepted");

    if (alreadyMember) {
      return { group_id: String(groupId), group_name: groupName, already_member: true };
    }

    // a62 decides the membership type written on Rel 223 a56.
    const memberType = invite.invited_as === "owner"
      ? "owner"
      : invite.invited_as === "admin"
        ? "admin"
        : "nothing special";

    await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
      method: "POST",
      body: {
        parent_id: groupId,
        child_id: userId,
        context: "child",
        store_items_type: "update",
        meta: memberMeta({
          displayName: displayName?.trim() || (await fetchMyAppUserName()),
          memberTypes: [memberType],
          memberRoles: ["nothing special"],
          invitationStatus: "accepted",
        }),
      },
    });

    // Every use updates a59 Use count.
    wordpressCCTFetch(T.careGroupInvite.slug, {
      id: String(inviteId),
      method: "PUT",
      body: { [F_INVITE.USE_COUNT]: String(Number(invite.use_count || 0) + 1) },
    }).catch(() => {});

    return { group_id: String(groupId), group_name: groupName, already_member: false };
  } catch (e: any) {
    throw new Error(e?.message || "Invalid invite link");
  }
}

/**
 * Join code path (CCT 199 a58): a non-member who types the group's join code
 * gets the group onboarding popup and becomes a normal member.
 */
export async function joinGroupByJoinCodeWordPress(groupId: string, code: string, displayName?: string): Promise<any> {
  const gid = normalizeWpObjectId(groupId);
  if (!gid) throw new Error("Invalid care group");
  const group = await wordpressCCTFetch<any>(T.careGroup.slug, { id: String(gid) });
  const expected = String(group?.[F_GROUP.JOIN_CODE] || "").trim();
  if (!expected) throw new Error("This care group has no join code. Ask an owner or admin for an invite link.");
  if (expected.toLowerCase() !== String(code || "").trim().toLowerCase()) {
    throw new Error("That join code is not correct.");
  }
  const wpUser = getStoredWPUser();
  const userId = wpUser?.user_id ? Number(wpUser.user_id) : 0;
  if (!userId) throw new Error("Please sign in to join this group.");
  await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
    method: "POST",
    body: {
      parent_id: gid,
      child_id: userId,
      context: "child",
      store_items_type: "update",
      meta: memberMeta({
        displayName: displayName?.trim() || (await fetchMyAppUserName()),
        memberTypes: ["nothing special"],
        memberRoles: ["nothing special"],
        invitationStatus: "accepted",
      }),
    },
  });
  return { group_id: String(gid), group_name: group?.[F_GROUP.NAME] || "", already_member: false };
}

/**
 * One code box for the user: they paste whatever an admin gave them. It can be
 * an invite link code (CCT 200 a55) or the group's own join code (CCT 199 a58).
 */
export async function joinGroupByAnyCodeWordPress(code: string, displayName?: string): Promise<any> {
  const trimmed = String(code || "").trim();
  if (!trimmed) throw new Error("Please enter the code you were given.");
  try {
    return await joinGroupByCodeWordPress(trimmed, displayName);
  } catch (inviteError) {
    // Not an invite link — look for a care group whose own join code matches.
    const groups = await wordpressCCTFetch<any[]>(T.careGroup.slug, { params: { _limit: 500 } });
    const match = (Array.isArray(groups) ? groups : []).find(
      (g: any) => String(g?.[F_GROUP.JOIN_CODE] || "").trim().toLowerCase() === trimmed.toLowerCase(),
    );
    if (!match) throw inviteError instanceof Error ? inviteError : new Error(String(inviteError));
    const gid = normalizeWpObjectId(match?._ID || match?.item_id || match?.id);
    return joinGroupByJoinCodeWordPress(String(gid), trimmed, displayName);
  }
}

// ─── Gallery ────────────────────────────────────────────────
// CCT slug: care_group_gallery | fields: image (Media ID), image_description (textarea), taken_at (datetime)
// Linked to care_group via JetEngine Relation 46 (1:M)
async function resolveMediaUrl(mediaId: number | string | null): Promise<string | null> {
  if (!mediaId) return null;
  try {
    const m: any = await wordpressFetch(`/wp-json/wp/v2/media/${mediaId}`);
    return (
      m?.media_details?.sizes?.medium_large?.source_url ||
      m?.media_details?.sizes?.medium?.source_url ||
      m?.source_url ||
      null
    );
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

export async function fetchCareGroupGalleryWordPress(groupId: string): Promise<any[]> {
  try {
    const items = await fetchRelatedCctItems(REL_GROUP_GALLERY, groupId, "care_group_gallery");
    const enriched = await Promise.all(
      items.map(async (m: any) => {
        const mediaId = m[F_GALLERY.IMAGE] ?? null;
        const image_url = await resolveMediaUrl(mediaId);
        return {
          id: String(m.id || m._ID),
          group_id: groupId,
          media_id: mediaId,
          image_url,
          url: image_url,
          type: "image",
          caption: m[F_GALLERY.IMAGE_DESCRIPTION] || "",
          taken_at: m[F_GALLERY.TAKEN_AT] || null,
          created_at: m.created_at,
        };
      })
    );
    return enriched;
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

/**
 * Upload a File to WP Media Library and return the media ID.
 * Delegates to the shared uploader, which falls back to the privileged
 * wp-admin-ops path when WordPress refuses direct uploads for the role
 * (subscribers get 403 rest_cannot_create on wp/v2/media).
 */
export async function uploadToWPMedia(file: File): Promise<number> {
  const { uploadWPMedia } = await import("@/lib/wp-media");
  const media = await uploadWPMedia(file);
  if (!media?.id) throw new Error("Media upload failed");
  return Number(media.id);
}


export async function createCareGroupGalleryItemWordPress(
  groupId: string,
  mediaId: number,
  caption?: string,
  takenAt?: string,
): Promise<void> {
  const normalizedGroupId = normalizeWpObjectId(groupId);
  const created = await wordpressCCTFetch<any>(T.careGroupGallery.slug, {
    method: "POST",
    body: {
      // JetEngine REST rejects numeric payloads (rest_invalid_type) — always send strings
      [F_GALLERY.IMAGE]: String(mediaId),

      [F_GALLERY.IMAGE_DESCRIPTION]: caption || "",
      [F_GALLERY.TAKEN_AT]: takenAt || new Date().toISOString().slice(0, 19).replace("T", " "),
    },
  });
  const itemId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  if (normalizedGroupId && itemId) {
    await wordpressFetch(`jet-rel/${REL_GROUP_GALLERY}`, {
      method: "POST",
      body: { parent_id: normalizedGroupId, child_id: itemId, context: "child", store_items_type: "update" },
    });
  }
}

export async function deleteCareGroupGalleryItemWordPress(itemId: string): Promise<void> {
  await wordpressCCTFetch(T.careGroupGallery.slug, { id: itemId, method: "DELETE" });
}

// ─── Sub-groups (CCT 74 — care_group_private_member_group) ──
export async function fetchMemberCategoriesWordPress(groupId: string): Promise<any[]> {
  try {
    const cats = await fetchRelatedCctItems(REL_GROUP_SUBGROUP, groupId, "care_group_pmg");
    return cats.map((c: any) => ({
      id: String(c.id || c._ID),
      group_id: groupId,
      name: c[F_SUBGROUP.NAME] || "",
      description: c[F_SUBGROUP.DESCRIPTION] || null,
      color: c[F_SUBGROUP.COLOR] || null,
      created_at: c.created_at,
    }));
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

export async function createMemberCategoryWordPress(groupId: string, name: string, color?: string, description?: string): Promise<void> {
  const created = await wordpressCCTFetch<any>(T.careGroupPrivateMemberGroup.slug, {
    method: "POST",
    body: {
      [F_SUBGROUP.NAME]: name,
      [F_SUBGROUP.DESCRIPTION]: description || "",
      [F_SUBGROUP.COLOR]: color || "",
    },
  });
  const normalizedGroupId = normalizeWpObjectId(groupId);
  const categoryId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  if (normalizedGroupId && categoryId) {
    await wordpressFetch(`jet-rel/${REL_GROUP_SUBGROUP}`, {
      method: "POST",
      body: { parent_id: normalizedGroupId, child_id: categoryId, context: "child", store_items_type: "update" },
    });
    const wpUser = getStoredWPUser();
    const ownerId = wpUser?.user_id ? Number(wpUser.user_id) : 0;
    if (ownerId) {
      try { await addSubgroupOwnerWordPress(String(categoryId), ownerId); } catch {}
    }
  }
}

export async function updateMemberCategoryWordPress(
  categoryId: string,
  updates: { name?: string; description?: string; color?: string }
): Promise<void> {
  const body: Record<string, string> = {};
  if (updates.name !== undefined) body[F_SUBGROUP.NAME] = updates.name;
  if (updates.description !== undefined) body[F_SUBGROUP.DESCRIPTION] = updates.description;
  if (updates.color !== undefined) body[F_SUBGROUP.COLOR] = updates.color;
  await wordpressCCTFetch(T.careGroupPrivateMemberGroup.slug, {
    id: categoryId,
    method: "POST",
    body,
  });
}

export async function deleteMemberCategoryWordPress(categoryId: string): Promise<void> {
  await wordpressCCTFetch(T.careGroupPrivateMemberGroup.slug, { id: categoryId, method: "DELETE" });
}

// ─── Sub-group membership (REL 225) ─────────────────────────
// a55 member types (Radio) { nothing special | owner | admin }
// a56 invitation status — DEPRECATED by the dictionary: sub-group members are
// added directly by the sub-group's owners/admins, so there is no invitation,
// no request and no approval step.
const subgroupMeta = encodeRel75Meta;

export interface SubgroupMemberRecord {
  user_id: number;
  types: string[];
  is_owner: boolean;
  is_admin: boolean;
}

async function fetchSubgroupMemberRecords(subgroupId: string): Promise<SubgroupMemberRecord[]> {
  const sid = normalizeWpObjectId(subgroupId);
  if (!sid) return [];
  try {
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_SUBGROUP_MEMBERS}/children/${sid}`);
    return (Array.isArray(rels) ? rels : [])
      .map((r: any): SubgroupMemberRecord | null => {
        const uid = Number(r.child_object_id);
        if (!uid) return null;
        const { types } = decodeRel75Meta(r?.meta);
        const is_owner = types.includes("owner");
        const is_admin = types.includes("admin") || is_owner;
        return { user_id: uid, types: types.length ? types : ["nothing special"], is_owner, is_admin };
      })
      .filter(Boolean) as SubgroupMemberRecord[];
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

/** Member user ids of a sub-group. */
export async function fetchSubgroupMembersWordPress(subgroupId: string): Promise<number[]> {
  const recs = await fetchSubgroupMemberRecords(subgroupId);
  return recs.map((r) => r.user_id);
}

/** Full member records (with owner/admin flags) for management views. */
export async function fetchSubgroupMemberRecordsWordPress(subgroupId: string): Promise<SubgroupMemberRecord[]> {
  return fetchSubgroupMemberRecords(subgroupId);
}

/** Sub-group owners/admins add members directly. */
export async function addMemberToSubgroupWordPress(
  subgroupId: string,
  userId: string | number,
  opts: { types?: string[] } = {},
): Promise<void> {
  const sid = normalizeWpObjectId(subgroupId);
  const uid = normalizeWpObjectId(userId);
  if (!sid || !uid) return;
  await wordpressFetch(`jet-rel/${REL_SUBGROUP_MEMBERS}`, {
    method: "POST",
    body: {
      parent_id: sid,
      child_id: uid,
      context: "child",
      store_items_type: "update",
      meta: subgroupMeta({ types: opts.types }),
    },
  });
}

export async function removeMemberFromSubgroupWordPress(subgroupId: string, userId: string | number): Promise<void> {
  const sid = normalizeWpObjectId(subgroupId);
  const uid = normalizeWpObjectId(userId);
  if (!sid || !uid) return;
  await wordpressFetch(`jet-rel/${REL_SUBGROUP_MEMBERS}`, {
    method: "POST",
    body: { parent_id: sid, child_id: uid, context: "child", store_items_type: "disconnect" },
  });
}

/** Update sub-group member type (owner / admin / nothing special). */
export async function updateSubgroupMemberRoleWordPress(
  subgroupId: string,
  userId: string | number,
  role: "owner" | "admin" | "nothing special",
): Promise<void> {
  const sid = normalizeWpObjectId(subgroupId);
  const uid = normalizeWpObjectId(userId);
  if (!sid || !uid) return;
  await wordpressFetch(`jet-rel/${REL_SUBGROUP_MEMBERS}`, {
    method: "POST",
    body: {
      parent_id: sid,
      child_id: uid,
      context: "child",
      store_items_type: "update",
      meta: subgroupMeta({ types: [role] }),
    },
  });
}

/** The creator of a sub-group is its owner. */
export async function addSubgroupOwnerWordPress(subgroupId: string, userId: string | number): Promise<void> {
  return addMemberToSubgroupWordPress(subgroupId, userId, { types: ["owner"] });
}

// ─── Search Profiles ────────────────────────────────────────
export async function searchProfilesWordPress(query: string): Promise<any[]> {
  try {
    const users = await wordpressFetch<any[]>("wp/v2/users", {
      params: { search: query, per_page: 20 },
    });
    if (!Array.isArray(users)) return [];
    // WordPress user search only finds accounts; the displayed name comes
    // exclusively from this app's own column on CCT 151 (relation 152).
    // All profile reads run in parallel — never one after another.
    const profiles = await Promise.all(
      users.map(async (u: any) => {
        try {
          return await fetchWPUserPublicProfile(u.id);
        } catch {
          return null;
        }
      }),
    );
    return users.map((u: any, i: number) => ({
      id: `wp-${u.id}`,
      user_id: `wp-${u.id}`,
      full_name: profiles[i]?.full_name || "",
      email: u.email || null,
      avatar_url: profiles[i]?.avatar_url || u.avatar_urls?.["96"] || null,
    }));
  } catch (e) { throw e instanceof Error ? e : new Error(String(e)); }
}

// ─── Add Cared One to Group ─────────────────────────────────
// Cared ones are stored as users. Adding them to the group is identical to adding any user via rel 72.
export async function addCaredOneToGroupWordPress(groupId: string, caredOneId: string): Promise<void> {
  const normalizedGroupId = normalizeWpObjectId(groupId);
  const normalizedCaredOneId = normalizeWpObjectId(caredOneId);
  if (!normalizedGroupId || !normalizedCaredOneId) return;
  let displayName = "Cared One";
  try {
    const user = await fetchWPUserSafe(normalizedCaredOneId);
    displayName = user?.name || user?.slug || displayName;
  } catch {}
  await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
    method: "POST",
    body: {
      parent_id: normalizedGroupId,
      child_id: normalizedCaredOneId,
      context: "child",
      store_items_type: "update",
      meta: memberMeta({ displayName, memberTypes: ["nothing special"], memberRoles: ["cared one"], invitationStatus: "accepted" }),
    },
  });
}

// ─── Leave Group ────────────────────────────────────────────
export async function leaveGroupWordPress(groupId: string, userId?: string): Promise<void> {
  if (!userId) return;
  try {
    const normalizedGroupId = normalizeWpObjectId(groupId);
    const normalizedUserId = normalizeWpObjectId(userId);
    if (!normalizedGroupId || !normalizedUserId) return;
    await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
      method: "POST",
      body: { parent_id: normalizedGroupId, child_id: normalizedUserId, context: "child", store_items_type: "disconnect" },
    });
  } catch {}
}
