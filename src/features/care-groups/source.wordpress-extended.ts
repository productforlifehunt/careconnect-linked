import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";

// Live JetEngine relations (verified from prd-to-wp-mapping.md)
const REL_GROUP_MEMBER = 72;          // M:M  care_group → users
const REL_GROUP_GALLERY = 46;         // 1:M  care_group → care_group_gallery
const REL_GROUP_SUBGROUP = 47;        // 1:M  care_group → care_group_private_member_group
const REL_GROUP_POST = 77;            // 1:M  care_group → care_group_not_too_special_post
const REL_SUBGROUP_MEMBERS = 75;      // M:M  care_group_private_member_group → users
const REL_GROUP_INVITE = 161;         // 1:M  care_group → care_group_invite

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

// ─── Care Group Posts ───────────────────────────────────────
// CCT slug: care_group_not_too_special_post | fields: type, title, content, is_pinned, scheduled_at
export async function fetchCareGroupPostsWordPress(groupId: string, type?: string): Promise<any[]> {
  try {
    const posts = await fetchRelatedCctItems(REL_GROUP_POST, groupId, "care_group_not_too_special_post");
    if (!Array.isArray(posts)) return [];
    const normalizeType = (t: any): string => Array.isArray(t) ? (t[0] || "discussion") : (t || "discussion");
    return posts
      .filter((p: any) => !type || normalizeType(p.type) === type)
      .map((p: any) => ({
        id: p.id,
        group_id: groupId,
        author_id: p.author_id || null,
        type: normalizeType(p.type),
        title: p.title || null,
        content: p.content || null,
        is_pinned: p.is_pinned === true || p.is_pinned === "yes" || p.is_pinned === "1",
        scheduled_at: p.scheduled_at || null,
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
      title: post.title || post.content.substring(0, 50),
      content: post.content,
      type: post.type || "discussion",
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

export async function updateGroupPostWordPress(id: string, updates: { content?: string; title?: string; is_pinned?: boolean }): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.content !== undefined) body.content = updates.content;
  if (updates.title !== undefined) body.title = updates.title;
  if (updates.is_pinned !== undefined) body.is_pinned = updates.is_pinned ? "yes" : "no";
  await wordpressCCTFetch("care_group_not_too_special_post", { id, method: "PUT", body });
}

export async function deleteGroupPostWordPress(id: string): Promise<void> {
  await wordpressCCTFetch("care_group_not_too_special_post", { id, method: "DELETE" });
}

// ─── Group Settings ─────────────────────────────────────────
// CCT slug: care_group | fields: name, description, group_type, is_active
export async function updateCareGroupWordPress(id: string, updates: { name?: string; description?: string; is_private?: boolean }): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.name !== undefined) body.name = updates.name;
  if (updates.description !== undefined) body.description = updates.description;
  if (updates.is_private !== undefined) body.group_type = updates.is_private ? "private" : "public";
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
  const expires = raw.expires_at ? String(raw.expires_at) : null;
  const isExpired = expires ? new Date(expires).getTime() < Date.now() : false;
  const maxUses = Number(raw.max_uses || 0);
  const useCount = Number(raw.use_count || 0);
  const isRevoked = raw.is_revoked === true || raw.is_revoked === "yes" || raw.is_revoked === "1" || raw.is_revoked === 1;
  const isExhausted = maxUses > 0 && useCount >= maxUses;
  return {
    id,
    group_id: groupId || null,
    token: raw.token || "",
    name: raw.name || "",
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
      token,
      name: input.name || "Invite link",
      expires_at: input.expiresAt || "",
      max_uses: Number(input.maxUses || 0),
      use_count: 0,
      is_revoked: "no",
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
  return normalizeInvite({ ...created, id: inviteId, token }, input.groupId);
}

export async function updateGroupInviteWordPress(id: string, updates: {
  name?: string;
  token?: string;
  expiresAt?: string | null;
  maxUses?: number;
  isRevoked?: boolean;
}): Promise<void> {
  const body: Record<string, any> = {};
  if (updates.name !== undefined) body.name = updates.name;
  if (updates.token !== undefined) body.token = updates.token;
  if (updates.expiresAt !== undefined) body.expires_at = updates.expiresAt || "";
  if (updates.maxUses !== undefined) body.max_uses = Number(updates.maxUses || 0);
  if (updates.isRevoked !== undefined) body.is_revoked = updates.isRevoked ? "yes" : "no";
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
    const match = invites.find((i: any) => String(i.token || "").trim().toLowerCase() === lower);
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
      groupName = g?.name || groupName;
    } catch {}

    // Add user to group via Rel 72
    const wpUser = getStoredWPUser();
    const userId = wpUser?.user_id ? Number(wpUser.user_id) : 0;
    if (userId) {
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
    }

    // Increment use_count (best-effort)
    wordpressCCTFetch("care_group_invite", {
      id: String(inviteIdNum),
      method: "PUT",
      body: { use_count: invite.use_count + 1 },
    }).catch(() => {});

    return { group_id: String(parentGroupId), group_name: groupName };
  } catch (e: any) {
    throw new Error(e?.message || "Invalid invite link");
  }
}

// ─── Gallery ────────────────────────────────────────────────
// CCT slug: care_group_gallery | fields: care_group_id, uploaded_by_user_id, image_url, caption
export async function fetchCareGroupGalleryWordPress(groupId: string): Promise<any[]> {
  try {
    const items = await fetchRelatedCctItems(REL_GROUP_GALLERY, groupId, "care_group_gallery");
    return items.map((m: any) => ({
      id: String(m.id || m._ID),
      group_id: m.care_group_id ? String(m.care_group_id) : groupId,
      image_url: m.image_url || null,
      url: m.image_url || null,
      type: "image",
      caption: m.caption || null,
      uploaded_by: m.uploaded_by_user_id ? `wp-${m.uploaded_by_user_id}` : null,
      created_at: m.created_at,
    }));
  } catch { return []; }
}

export async function createCareGroupGalleryItemWordPress(groupId: string, url: string, caption?: string): Promise<void> {
  const wpUser = getStoredWPUser();
  const uploaderId = wpUser?.user_id ? Number(wpUser.user_id) : null;
  const normalizedGroupId = normalizeWpObjectId(groupId);
  const created = await wordpressCCTFetch<any>("care_group_gallery", {
    method: "POST",
    body: {
      care_group_id: normalizedGroupId,
      uploaded_by_user_id: uploaderId,
      image_url: url,
      caption: caption || "",
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

// ─── Sub-groups (private member groups) ─────────────────────
// CCT slug: care_group_private_member_group | fields: name, description, color
// Linked via JetEngine relation 47 (care_group → care_group_private_member_group)
// Member assignment via JetEngine relation 75 (private_member_group → users)
export async function fetchMemberCategoriesWordPress(groupId: string): Promise<any[]> {
  try {
    const cats = await fetchRelatedCctItems(REL_GROUP_SUBGROUP, groupId, "care_group_private_member_group");
    return cats.map((c: any) => ({
      id: String(c.id || c._ID),
      group_id: groupId,
      name: c.name || "",
      description: c.description || null,
      color: c.color || null,
      created_at: c.created_at,
    }));
  } catch { return []; }
}

export async function createMemberCategoryWordPress(groupId: string, name: string, color?: string, description?: string): Promise<void> {
  const created = await wordpressCCTFetch<any>("care_group_private_member_group", {
    method: "POST",
    body: { name, description: description || "", color: color || "" },
  });
  const normalizedGroupId = normalizeWpObjectId(groupId);
  const categoryId = normalizeWpObjectId(created?.item_id || created?._ID || created?.id);
  if (normalizedGroupId && categoryId) {
    await wordpressFetch(`jet-rel/${REL_GROUP_SUBGROUP}`, {
      method: "POST",
      body: { parent_id: normalizedGroupId, child_id: categoryId, context: "child", store_items_type: "update" },
    });
  }
}

export async function deleteMemberCategoryWordPress(categoryId: string): Promise<void> {
  await wordpressCCTFetch("care_group_private_member_group", { id: categoryId, method: "DELETE" });
}

// ─── Sub-group member assignment (REL 75) ───────────────────
export async function fetchSubgroupMembersWordPress(subgroupId: string): Promise<number[]> {
  try {
    const sid = normalizeWpObjectId(subgroupId);
    if (!sid) return [];
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_SUBGROUP_MEMBERS}/children/${sid}`);
    return (Array.isArray(rels) ? rels : []).map((r: any) => Number(r.child_object_id)).filter(Boolean);
  } catch { return []; }
}

export async function addMemberToSubgroupWordPress(subgroupId: string, userId: string | number): Promise<void> {
  const sid = normalizeWpObjectId(subgroupId);
  const uid = normalizeWpObjectId(userId);
  if (!sid || !uid) return;
  await wordpressFetch(`jet-rel/${REL_SUBGROUP_MEMBERS}`, {
    method: "POST",
    body: { parent_id: sid, child_id: uid, context: "child", store_items_type: "update" },
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
  await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
    method: "POST",
    body: {
      parent_id: normalizedGroupId,
      child_id: normalizedCaredOneId,
      context: "child",
      store_items_type: "update",
      meta: memberMeta({ memberTypes: ["nothing special"], memberRoles: ["cared one"], invitationStatus: "accepted" }),
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
