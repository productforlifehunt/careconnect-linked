import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";
import { WP } from "@/integrations/wp-schema";

// Live JetEngine relations (per data bible)
const REL_GROUP_MEMBER = 72;          // care_group → users
const REL_GROUP_GALLERY = 46;         // care_group → care_group_gallery
const REL_GROUP_SUBGROUP = 47;        // care_group → care_group_private_member_group
const REL_GROUP_POST = 77;            // care_group → care_group_not_too_special_post
const REL_SUBGROUP_MEMBERS = 75;      // care_group_private_member_group → users
const REL_GROUP_INVITE = 161;         // care_group → care_group_invite

// ─── Opaque field codes (bible) ──────────────────────────────
const F_POST = WP.cct["76"].fields;       // care_group_not_too_special_post
const F_INVITE = WP.cct["160"].fields;    // care_group_invite
const F_GALLERY = WP.cct["14"].fields;    // care_group_gallery
const F_SUBGROUP = WP.cct["74"].fields;   // care_group_private_member_group
// Main care_group CCT (id 9, not in dictionary) uses fields a55-a59 verified live.
const F_GROUP = { NAME: "a55", DESCRIPTION: "a56", GROUP_TYPE: "a57", JOIN_CODE: "a58", IS_ACTIVE: "a59" } as const;
const YES = "b55";
const NO = "b56";

// Post type option codes — CCT 76 a55: b55=discussion, b56=announcement
const POST_TYPE_CODE: Record<string, string> = { discussion: "b55", announcement: "b56" };
const POST_TYPE_LABEL: Record<string, string> = { b55: "discussion", b56: "announcement" };

function isYesCode(v: unknown): boolean {
  if (v === true) return true;
  if (typeof v === "string") {
    const s = v.toLowerCase();
    return s === "b55" || s === "yes" || s === "1" || s === "true";
  }
  return false;
}

function memberMeta(input: {
  displayName?: string;
  memberTypes?: string[];
  memberRoles?: string[];
  invitationStatus?: "accepted" | "pending" | "declined";
} = {}) {
  return {
    care_groups_member_display_name_: input.displayName || "Member",
    care_groups_member_types: input.memberTypes?.length ? input.memberTypes : ["nothing special"],
    care_groups_member_roles: input.memberRoles?.length ? input.memberRoles : ["nothing special"],
    care_groups_member_invitation_status: input.invitationStatus || "accepted",
  };
}

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
  const items = await Promise.all(childIds.map(async (childId) => {
    try {
      return await wordpressCCTFetch(cctSlug, { id: childId });
    } catch { return null; }
  }));
  return items.filter(Boolean);
}

// ─── Care Group Posts (CCT 76) ──────────────────────────────
export async function fetchCareGroupPostsWordPress(groupId: string, type?: string): Promise<any[]> {
  try {
    const posts = await fetchRelatedCctItems(REL_GROUP_POST, groupId, "care_group_not_too_special_post");
    if (!Array.isArray(posts)) return [];
    const normalizeType = (raw: any): string => {
      const v = Array.isArray(raw) ? (raw[0] || "") : (raw || "");
      return POST_TYPE_LABEL[String(v)] || String(v) || "discussion";
    };
    return posts
      .filter((p: any) => !type || normalizeType(p[F_POST.TYPE]) === type)
      .map((p: any) => ({
        id: p.id,
        group_id: groupId,
        author_id: p.author_id || null,
        type: normalizeType(p[F_POST.TYPE]),
        title: p[F_POST.TITLE] || null,
        content: p[F_POST.CONTENT] || null,
        is_pinned: isYesCode(p[F_POST.IS_PINNED]),
        scheduled_at: p[F_POST.SCHEDULED_AT] || null,
        created_at: p.created_at,
        updated_at: p.updated_at || p.created_at,
        author: p.author_id ? { id: p.author_id, full_name: null, avatar_url: null } : null,
      }));
  } catch { return []; }
}

export async function createGroupPostWordPress(post: { group_id: string; content: string; type?: string; title?: string }): Promise<string | null> {
  const created = await wordpressCCTFetch<any>("care_group_not_too_special_post", {
    method: "POST",
    body: {
      [F_POST.TITLE]: post.title || post.content.substring(0, 50),
      [F_POST.CONTENT]: post.content,
      [F_POST.TYPE]: POST_TYPE_CODE[post.type || "discussion"] || "b55",
      [F_POST.IS_PINNED]: NO,
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
  return postId ? String(postId) : null;
}

export async function updateGroupPostWordPress(id: string, updates: { content?: string; title?: string; is_pinned?: boolean; type?: string }): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.content !== undefined) body[F_POST.CONTENT] = updates.content;
  if (updates.title !== undefined) body[F_POST.TITLE] = updates.title;
  if (updates.is_pinned !== undefined) body[F_POST.IS_PINNED] = updates.is_pinned ? YES : NO;
  if (updates.type !== undefined) body[F_POST.TYPE] = POST_TYPE_CODE[updates.type] || updates.type;
  await wordpressCCTFetch("care_group_not_too_special_post", { id, method: "PUT", body });
}

export async function deleteGroupPostWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("care_group_not_too_special_post", { id, method: "DELETE" });
}

// ─── Group Settings (CCT 9 — care_group) ────────────────────
export async function updateCareGroupWordPress(id: string, updates: { name?: string; description?: string; is_private?: boolean }): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.name !== undefined) body[F_GROUP.NAME] = updates.name;
  if (updates.description !== undefined) body[F_GROUP.DESCRIPTION] = updates.description;
  if (updates.is_private !== undefined) body[F_GROUP.GROUP_TYPE] = updates.is_private ? "b56" : "b55";
  await wordpressCCTFetch("care_group", { id, method: "PUT", body });
}

export async function deleteCareGroupWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("care_group", { id, method: "DELETE" });
}

// ─── Invitations ────────────────────────────────────────────
// Dictionary source of truth: invitation state lives on Rel 72 meta, not a separate CCT.
export async function inviteToGroupWordPress(groupId: string, userIdOrEmail: string, _role?: string): Promise<void> {
  const isEmail = userIdOrEmail.includes("@");
  const normalizedGroupId = normalizeWpObjectId(groupId);
  const childId = isEmail ? 0 : normalizeWpObjectId(userIdOrEmail);
  if (normalizedGroupId && childId) {
    await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
      method: "POST",
      body: {
        parent_id: normalizedGroupId,
        child_id: childId,
        context: "child",
        store_items_type: "update",
        meta: memberMeta({ invitationStatus: "pending" }),
      },
    });
    return;
  }
  throw new Error(isEmail ? "Dictionary requires group invitations through Users relation. Select an existing user, not email-only invite." : "Invalid user");
}

export async function fetchGroupInvitationsWordPress(groupId: string): Promise<any[]> {
  try {
    const normalizedGroupId = normalizeWpObjectId(groupId);
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_MEMBER}/children/${normalizedGroupId}`);
    return (Array.isArray(rels) ? rels : [])
      .filter((r: any) => r?.meta?.care_groups_member_invitation_status === "pending")
      .map((r: any) => ({
        id: `${normalizedGroupId}:${r.child_object_id}`,
        group_id: groupId,
        user_id: `wp-${r.child_object_id}`,
        role: "nothing special",
        invitation_status: "pending",
        invited_email: null,
        created_at: null,
      }));
  } catch { return []; }
}

export async function cancelInvitationWordPress(invitationId: string): Promise<void> {
  const [groupPart, userPart] = invitationId.split(":");
  const groupId = normalizeWpObjectId(groupPart);
  const userId = normalizeWpObjectId(userPart);
  if (!groupId || !userId) return;
  await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
    method: "DELETE",
    body: { parent_id: groupId, child_id: userId },
  });
}

export async function fetchMyPendingInvitationsWordPress(): Promise<any[]> {
  try {
    const wpUser = getStoredWPUser();
    if (!wpUser?.user_id) return [];
    const userId = Number(wpUser.user_id);
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_MEMBER}/parents/${userId}`);
    const pending = (Array.isArray(rels) ? rels : []).filter(
      (r: any) => r?.meta?.care_groups_member_invitation_status === "pending"
    );
    // Enrich with real group names
    const enriched = await Promise.all(pending.map(async (r: any) => {
      const groupId = r.parent_object_id ? String(r.parent_object_id) : null;
      let groupName = "Care Group";
      if (groupId) {
        try {
          const g = await wordpressCCTFetch<any>("care_group", { id: groupId });
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
  } catch { return []; }
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
}

// ─── Member Roles & Removal ─────────────────────────────────
// JetEngine relation 72 (care_group → users) dictionary meta fields.
export async function updateMemberRoleWordPress(memberId: string, updates: any, groupId?: string): Promise<void> {
  const normalizedGroupId = normalizeWpObjectId(groupId);
  const normalizedMemberId = normalizeWpObjectId(memberId);
  if (!normalizedGroupId || !normalizedMemberId) return;
  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_MEMBER}/children/${normalizedGroupId}`).catch(() => []);
  const existing = (Array.isArray(rels) ? rels : []).find((r: any) => Number(r.child_object_id) === normalizedMemberId);
  const currentTypes = normalizeMetaList(existing?.meta?.care_groups_member_types);
  const currentRoles = normalizeMetaList(existing?.meta?.care_groups_member_roles);
  const nextTypes = new Set(currentTypes.length ? currentTypes : ["nothing special"]);
  const nextRoles = new Set(currentRoles.length ? currentRoles : ["nothing special"]);

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
        displayName: existing?.meta?.care_groups_member_display_name_ || undefined,
        memberTypes: [...nextTypes],
        memberRoles: [...nextRoles],
        invitationStatus: existing?.meta?.care_groups_member_invitation_status || "accepted",
      }),
    },
  });
}

export async function removeGroupMemberWordPress(memberId: string, groupId?: string): Promise<void> {
  const normalizedGroupId = normalizeWpObjectId(groupId);
  const normalizedMemberId = normalizeWpObjectId(memberId);
  if (normalizedGroupId && normalizedMemberId) {
    await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
      method: "DELETE",
      body: { parent_id: normalizedGroupId, child_id: normalizedMemberId },
    });
  }
}

// ─── Group Invites (CCT 160 + Rel 161) ──────────────────────
// CCT slug: care_group_invite | fields: token, name, expires_at, max_uses, use_count, is_revoked
// Linked via JetEngine relation 161 (care_group → care_group_invite)
function generateInviteToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function normalizeInvite(raw: any, groupId?: string) {
  const id = String(raw.id || raw._ID || "");
  const expiresRaw = raw[F_INVITE.EXPIRES_AT];
  const expires = expiresRaw ? String(expiresRaw) : null;
  const isExpired = expires ? new Date(expires).getTime() < Date.now() : false;
  const maxUses = Number(raw[F_INVITE.MAX_USES] || 0);
  const useCount = Number(raw[F_INVITE.USE_COUNT] || 0);
  const rev = raw[F_INVITE.IS_REVOKED];
  const isRevoked = rev === true || rev === 1 || (typeof rev === "string" && ["yes","1","true","on"].includes(rev.toLowerCase()));
  const isExhausted = maxUses > 0 && useCount >= maxUses;
  return {
    id,
    group_id: groupId || null,
    token: raw[F_INVITE.TOKEN] || "",
    name: raw[F_INVITE.NAME] || "",
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

export async function fetchGroupInvitesWordPress(groupId: string): Promise<any[]> {
  try {
    const items = await fetchRelatedCctItems(REL_GROUP_INVITE, groupId, "care_group_invite");
    return items.map((i: any) => normalizeInvite(i, groupId));
  } catch { return []; }
}

export async function createGroupInviteWordPress(input: {
  groupId: string;
  name: string;
  expiresAt?: string | null;
  maxUses?: number;
  token?: string;
}): Promise<any> {
  const token = (input.token || generateInviteToken()).trim();
  const created = await wordpressCCTFetch<any>("care_group_invite", {
    method: "POST",
    body: {
      [F_INVITE.TOKEN]: token,
      [F_INVITE.NAME]: input.name || "Invite link",
      [F_INVITE.EXPIRES_AT]: input.expiresAt || "",
      [F_INVITE.MAX_USES]: Number(input.maxUses || 0),
      [F_INVITE.USE_COUNT]: 0,
      [F_INVITE.IS_REVOKED]: "0",
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
  token?: string;
  expiresAt?: string | null;
  maxUses?: number;
  isRevoked?: boolean;
}): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.name !== undefined) body[F_INVITE.NAME] = updates.name;
  if (updates.token !== undefined) body[F_INVITE.TOKEN] = updates.token;
  if (updates.expiresAt !== undefined) body[F_INVITE.EXPIRES_AT] = updates.expiresAt || "";
  if (updates.maxUses !== undefined) body[F_INVITE.MAX_USES] = Number(updates.maxUses || 0);
  if (updates.isRevoked !== undefined) body[F_INVITE.IS_REVOKED] = updates.isRevoked ? "1" : "0";
  await wordpressCCTFetch("care_group_invite", { id, method: "PUT", body });
}

export async function deleteGroupInviteWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("care_group_invite", { id, method: "DELETE" });
}

// ─── Join by Token ──────────────────────────────────────────
// Looks up the care_group_invite CCT by token, validates, increments use_count,
// then adds the user to the group via JetEngine relation 72.
export async function joinGroupByCodeWordPress(token: string): Promise<any> {
  try {
    const trimmed = (token || "").trim();
    if (!trimmed) throw new Error("Invalid invite link");
    const invites = await wordpressCCTFetch<any[]>("care_group_invite", { params: { _limit: 500 } });
    if (!Array.isArray(invites)) throw new Error("Invalid invite link");
    const lower = trimmed.toLowerCase();
    const match = invites.find((i: any) => String(i[F_INVITE.TOKEN] || "").trim().toLowerCase() === lower);
    if (!match) throw new Error("Invalid invite link");
    const invite = normalizeInvite(match);
    if (invite.is_revoked) throw new Error("This invite link has been revoked.");
    if (invite.is_expired) throw new Error("This invite link has expired.");
    if (invite.is_exhausted) throw new Error("This invite link has reached its maximum uses.");

    // Resolve parent group via Rel 161
    const inviteIdNum = normalizeWpObjectId(match.id || match._ID);
    const parents = await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_INVITE}/parents/${inviteIdNum}`).catch(() => []);
    const parentGroupId = Array.isArray(parents) && parents.length ? Number(parents[0].parent_object_id) : 0;
    if (!parentGroupId) throw new Error("This invite link is not connected to a group.");

    // Fetch group name for confirmation
    let groupName = "Care Group";
    try {
      const g = await wordpressCCTFetch<any>("care_group", { id: String(parentGroupId) });
      groupName = g?.[F_GROUP.NAME] || groupName;
    } catch {}

    // Check membership FIRST
    const wpUser = getStoredWPUser();
    const userId = wpUser?.user_id ? Number(wpUser.user_id) : 0;
    if (!userId) throw new Error("Please sign in to join this group.");

    const existingMembers = await wordpressFetch<any[]>(
      `jet-rel/${REL_GROUP_MEMBER}/children/${parentGroupId}`
    ).catch(() => []);
    const alreadyMember = (Array.isArray(existingMembers) ? existingMembers : [])
      .some((r: any) => Number(r.child_object_id) === userId
        && (r?.meta?.care_groups_member_invitation_status || "accepted") === "accepted");

    if (alreadyMember) {
      return { group_id: String(parentGroupId), group_name: groupName, already_member: true };
    }

    await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
      method: "POST",
      body: {
        parent_id: parentGroupId,
        child_id: userId,
        context: "child",
        store_items_type: "update",
        meta: memberMeta({
          displayName: wpUser.user_display_name || wpUser.user_login || "Member",
          memberTypes: ["nothing special"],
          memberRoles: ["nothing special"],
          invitationStatus: "accepted",
        }),
      },
    });

    // Increment use_count only on real join (best-effort)
    wordpressCCTFetch("care_group_invite", {
      id: String(inviteIdNum),
      method: "PUT",
      body: { [F_INVITE.USE_COUNT]: invite.use_count + 1 },
    }).catch(() => {});

    return { group_id: String(parentGroupId), group_name: groupName, already_member: false };
  } catch (e: any) {
    throw new Error(e?.message || "Invalid invite link");
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
  } catch { return null; }
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
  } catch { return []; }
}

/** Upload a File to WP Media Library and return the media ID. */
export async function uploadToWPMedia(file: File): Promise<number> {
  const { buildWPUrl, buildWPHeaders } = await import("@/lib/wp-url");
  const { getWPToken } = await import("@/services/wp-auth");
  const url = buildWPUrl("/wp-json/wp/v2/media");
  const headers = buildWPHeaders(getWPToken());
  delete (headers as any)["Content-Type"];
  headers["Content-Disposition"] = `attachment; filename="${file.name.replace(/"/g, "")}"`;
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(url, { method: "POST", headers, body: fd });
  if (!res.ok) throw new Error(`Media upload failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return Number(json.id);
}

export async function createCareGroupGalleryItemWordPress(
  groupId: string,
  mediaId: number,
  caption?: string,
  takenAt?: string,
): Promise<void> {
  const normalizedGroupId = normalizeWpObjectId(groupId);
  const created = await wordpressCCTFetch<any>("care_group_gallery", {
    method: "POST",
    body: {
      [F_GALLERY.IMAGE]: mediaId,
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
  await wordpressCCTFetch("care_group_gallery", { id: itemId, method: "DELETE" });
}

// ─── Sub-groups (CCT 74 — care_group_private_member_group) ──
export async function fetchMemberCategoriesWordPress(groupId: string): Promise<any[]> {
  try {
    const cats = await fetchRelatedCctItems(REL_GROUP_SUBGROUP, groupId, "care_group_private_member_group");
    return cats.map((c: any) => ({
      id: String(c.id || c._ID),
      group_id: groupId,
      name: c[F_SUBGROUP.NAME] || "",
      description: c[F_SUBGROUP.DESCRIPTION] || null,
      color: c[F_SUBGROUP.COLOR] || null,
      created_at: c.created_at,
    }));
  } catch { return []; }
}

export async function createMemberCategoryWordPress(groupId: string, name: string, color?: string, description?: string): Promise<void> {
  const created = await wordpressCCTFetch<any>("care_group_private_member_group", {
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

export async function deleteMemberCategoryWordPress(categoryId: string): Promise<void> {
  await wordpressCCTFetch("care_group_private_member_group", { id: categoryId, method: "DELETE" });
}

// ─── Sub-group member assignment (REL 75) ───────────────────
// Rel 75 meta fields (configured in JetEngine GUI):
//   • care_group_s_private_member_group_member_types  (checkbox: nothing special | owner | admin)
//   • care_group_s_private_member_group_member_invitation_status  (radio: accepted | pending | declined)
const SUBGROUP_META_TYPES = "care_group_s_private_member_group_member_types";
const SUBGROUP_META_STATUS = "care_group_s_private_member_group_member_invitation_status";

function subgroupMeta(input: {
  types?: string[];
  status?: "accepted" | "pending" | "declined";
} = {}) {
  return {
    [SUBGROUP_META_TYPES]: input.types?.length ? input.types : ["nothing special"],
    [SUBGROUP_META_STATUS]: input.status || "accepted",
  };
}

export interface SubgroupMemberRecord {
  user_id: number;
  status: "accepted" | "pending" | "declined";
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
        const types = normalizeMetaList(r?.meta?.[SUBGROUP_META_TYPES]);
        const status = (r?.meta?.[SUBGROUP_META_STATUS] || "accepted") as SubgroupMemberRecord["status"];
        const is_owner = types.includes("owner");
        const is_admin = types.includes("admin") || is_owner;
        return { user_id: uid, status, types: types.length ? types : ["nothing special"], is_owner, is_admin };
      })
      .filter(Boolean) as SubgroupMemberRecord[];
  } catch { return []; }
}

/** Backwards-compatible: returns only ACCEPTED member user ids. */
export async function fetchSubgroupMembersWordPress(subgroupId: string): Promise<number[]> {
  const recs = await fetchSubgroupMemberRecords(subgroupId);
  return recs.filter((r) => r.status === "accepted").map((r) => r.user_id);
}

/** Full member records (including pending/declined) for admin views. */
export async function fetchSubgroupMemberRecordsWordPress(subgroupId: string): Promise<SubgroupMemberRecord[]> {
  return fetchSubgroupMemberRecords(subgroupId);
}

/** Admin-side direct add — auto-accepted. */
export async function addMemberToSubgroupWordPress(
  subgroupId: string,
  userId: string | number,
  opts: { status?: "accepted" | "pending"; types?: string[] } = {},
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
      meta: subgroupMeta({ status: opts.status || "accepted", types: opts.types }),
    },
  });
}

export async function removeMemberFromSubgroupWordPress(subgroupId: string, userId: string | number): Promise<void> {
  const sid = normalizeWpObjectId(subgroupId);
  const uid = normalizeWpObjectId(userId);
  if (!sid || !uid) return;
  await wordpressFetch(`jet-rel/${REL_SUBGROUP_MEMBERS}`, {
    method: "DELETE",
    body: { parent_id: sid, child_id: uid },
  });
}

/** Current user requests to join a sub-group (creates a pending Rel 75 row). */
export async function requestJoinSubgroupWordPress(subgroupId: string): Promise<void> {
  const wpUser = getStoredWPUser();
  const uid = wpUser?.user_id ? Number(wpUser.user_id) : 0;
  const sid = normalizeWpObjectId(subgroupId);
  if (!sid || !uid) return;
  await wordpressFetch(`jet-rel/${REL_SUBGROUP_MEMBERS}`, {
    method: "POST",
    body: {
      parent_id: sid,
      child_id: uid,
      context: "child",
      store_items_type: "update",
      meta: subgroupMeta({ status: "pending" }),
    },
  });
}

/** Admin approves a pending request by flipping status → accepted. */
export async function approveSubgroupMemberWordPress(subgroupId: string, userId: string | number): Promise<void> {
  const sid = normalizeWpObjectId(subgroupId);
  const uid = normalizeWpObjectId(userId);
  if (!sid || !uid) return;
  // Preserve existing types if any
  const recs = await fetchSubgroupMemberRecords(subgroupId);
  const existing = recs.find((r) => r.user_id === uid);
  await wordpressFetch(`jet-rel/${REL_SUBGROUP_MEMBERS}`, {
    method: "POST",
    body: {
      parent_id: sid,
      child_id: uid,
      context: "child",
      store_items_type: "update",
      meta: subgroupMeta({ status: "accepted", types: existing?.types }),
    },
  });
}

/** Admin (or self) declines / removes a pending request. */
export async function declineSubgroupMemberWordPress(subgroupId: string, userId: string | number): Promise<void> {
  return removeMemberFromSubgroupWordPress(subgroupId, userId);
}

/** Update sub-group member role (owner/admin/nothing special). */
export async function updateSubgroupMemberRoleWordPress(
  subgroupId: string,
  userId: string | number,
  role: "owner" | "admin" | "nothing special",
): Promise<void> {
  const sid = normalizeWpObjectId(subgroupId);
  const uid = normalizeWpObjectId(userId);
  if (!sid || !uid) return;
  const recs = await fetchSubgroupMemberRecords(subgroupId);
  const existing = recs.find((r) => r.user_id === uid);
  const nextTypes = new Set(existing?.types?.length ? existing.types : ["nothing special"]);
  if (role === "nothing special") {
    nextTypes.delete("owner");
    nextTypes.delete("admin");
    nextTypes.add("nothing special");
  } else {
    nextTypes.delete("nothing special");
    nextTypes.add(role);
  }
  if ([...nextTypes].some((v) => v !== "nothing special")) nextTypes.delete("nothing special");
  await wordpressFetch(`jet-rel/${REL_SUBGROUP_MEMBERS}`, {
    method: "POST",
    body: {
      parent_id: sid,
      child_id: uid,
      context: "child",
      store_items_type: "update",
      meta: subgroupMeta({ status: existing?.status || "accepted", types: [...nextTypes] }),
    },
  });
}

/** Fetch pending join requests for a single sub-group (admin view). */
export async function fetchSubgroupPendingRequestsWordPress(subgroupId: string): Promise<SubgroupMemberRecord[]> {
  const recs = await fetchSubgroupMemberRecords(subgroupId);
  return recs.filter((r) => r.status === "pending");
}

/** Fetch the current user's pending sub-group join requests across the whole site. */
export async function fetchMyPendingSubgroupRequestsWordPress(): Promise<Array<{ subgroup_id: number; status: string }>> {
  try {
    const wpUser = getStoredWPUser();
    if (!wpUser?.user_id) return [];
    const userId = Number(wpUser.user_id);
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_SUBGROUP_MEMBERS}/parents/${userId}`);
    return (Array.isArray(rels) ? rels : [])
      .filter((r: any) => (r?.meta?.[SUBGROUP_META_STATUS] || "accepted") === "pending")
      .map((r: any) => ({ subgroup_id: Number(r.parent_object_id), status: "pending" }));
  } catch { return []; }
}

/** When a sub-group is created, auto-add creator as owner+accepted. */
export async function addSubgroupOwnerWordPress(subgroupId: string, userId: string | number): Promise<void> {
  return addMemberToSubgroupWordPress(subgroupId, userId, { status: "accepted", types: ["owner", "admin"] });
}

// ─── Search Profiles ────────────────────────────────────────
export async function searchProfilesWordPress(query: string): Promise<any[]> {
  try {
    const users = await wordpressFetch<any[]>("wp/v2/users", {
      params: { search: query, per_page: 20 },
    });
    if (!Array.isArray(users)) return [];
    return users.map((u: any) => ({
      id: `wp-${u.id}`,
      user_id: `wp-${u.id}`,
      full_name: u.name || u.slug,
      email: u.email || null,
      avatar_url: u.avatar_urls?.["96"] || null,
    }));
  } catch { return []; }
}

// ─── Add Cared One to Group ─────────────────────────────────
// Cared ones are stored as users. Adding them to the group is identical to adding any user via rel 72.
export async function addCaredOneToGroupWordPress(groupId: string, caredOneId: string): Promise<void> {
  const normalizedGroupId = normalizeWpObjectId(groupId);
  const normalizedCaredOneId = normalizeWpObjectId(caredOneId);
  if (!normalizedGroupId || !normalizedCaredOneId) return;
  let displayName = "Cared One";
  try {
    const user = await wordpressFetch<any>(`wp/v2/users/${normalizedCaredOneId}?context=edit`);
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
      method: "DELETE",
      body: { parent_id: normalizedGroupId, child_id: normalizedUserId },
    });
  } catch {}
}
