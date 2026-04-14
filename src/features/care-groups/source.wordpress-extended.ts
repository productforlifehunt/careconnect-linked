import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";

// JetEngine Relation IDs
const REL_GROUP_MEMBER = 72; // care_group → users (many-to-many)
const REL_GROUP_POST = 77; // care_group → care_group_not_too_special_post
const REL_GROUP_GALLERY = 46; // care_group → care_group_gallery
const REL_GROUP_MEMBER_CATEGORY = 47; // care_group → member_category
const REL_GROUP_INVITE = 45;          // care_group → care_group_invite

function normalizeWpObjectId(value: string | number | null | undefined): number {
  return Number(String(value ?? "").replace(/^wp-/, ""));
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
    } catch {
      return null;
    }
  }));
  return items.filter(Boolean);
}

// ─── Care Group Posts ───────────────────────────────────────
// CCT slug: care_group_post | flat fields
export async function fetchCareGroupPostsWordPress(groupId: string, type?: string): Promise<any[]> {
  try {
    const posts = await fetchRelatedCctItems(REL_GROUP_POST, groupId, "care_group_not_too_special_post");
    if (!Array.isArray(posts)) return [];
    // JetEngine returns type as array (e.g. ["wish"]) — normalize to string
    const normalizeType = (t: any): string => Array.isArray(t) ? (t[0] || "discussion") : (t || "discussion");
    return posts
      .filter((p: any) => !type || normalizeType(p.type) === type)
      .map((p: any) => {
        const authorId = p.author_id || null; // from normalizeCCT (cct_author_id)
        return {
          id: p.id,
          group_id: groupId,
          author_id: authorId,
          type: normalizeType(p.type),
          title: p.title || null,
          content: p.content || null,
          is_pinned: p.is_pinned === true || p.is_pinned === "yes",
          visibility: p.visibility || "all",
          created_at: p.created_at,
          updated_at: p.updated_at || p.created_at,
          author: authorId ? { id: authorId, full_name: p.author_name || null, avatar_url: null } : null,
        };
      });
  } catch { return []; }
}

export async function createGroupPostWordPress(post: { group_id: string; content: string; type?: string; title?: string }): Promise<void> {
  // JetEngine auto-sets cct_author_id — no need to send author fields
  const created = await wordpressCCTFetch<any>("care_group_not_too_special_post", {
    method: "POST",
    body: {
      title: post.title || post.content.substring(0, 50),
      content: post.content,
      type: post.type || "discussion",
    },
  });
  const groupId = normalizeWpObjectId(post.group_id);
  const postId = created?.item_id || normalizeWpObjectId(created?._ID || created?.id);
  if (groupId && postId) {
    await wordpressFetch(`jet-rel/${REL_GROUP_POST}`, {
      method: "POST",
      body: { parent_id: groupId, child_id: Number(postId), context: "child", store_items_type: "update" },
    });
  }
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
// CCT slug: care_group | flat fields
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
// CCT slug: care_group_invite | linked via JetEngine relation 45
export async function inviteToGroupWordPress(groupId: string, userId: string, role?: string): Promise<void> {
  const created = await wordpressCCTFetch<any>("care_group_invite", {
    method: "POST",
    body: { user_id: userId, role: role || "member", status: "pending" },
  });
  const parentId = normalizeWpObjectId(groupId);
  const childId = normalizeWpObjectId(created?._ID || created?.id);
  if (parentId && childId) {
    await wordpressFetch(`jet-rel/${REL_GROUP_INVITE}`, {
      method: "POST",
      body: { parent_id: parentId, child_id: childId, context: "child", store_items_type: "update" },
    });
  }
}

export async function fetchGroupInvitationsWordPress(groupId: string): Promise<any[]> {
  try {
    const parentId = normalizeWpObjectId(groupId);
    const relData = await wordpressFetch<any>(`jet-rel/${REL_GROUP_INVITE}`, { params: { parent_id: parentId } });
    const childIds: number[] = Array.isArray(relData) ? relData.map((r: any) => r.child_id || r.child_object_id) : [];
    if (!childIds.length) return [];
    const invites = await wordpressCCTFetch<any[]>("care_group_invite", { params: { _limit: 100 } });
    if (!Array.isArray(invites)) return [];
    const related = invites.filter((inv: any) => childIds.includes(Number(inv._ID || inv.id)));
    return related.map((i: any) => ({
      id: String(i._ID || i.id || ""),
      group_id: groupId,
      user_id: i.user_id || null,
      role: i.role || "member",
      invitation_status: i.status || "pending",
      invited_email: i.email || null,
      created_at: i.cct_created || i.created_at,
    }));
  } catch { return []; }
}

export async function cancelInvitationWordPress(invitationId: string): Promise<void> {
  await wordpressCCTFetch("care_group_invite", { id: invitationId, method: "DELETE" });
}

export async function fetchMyPendingInvitationsWordPress(): Promise<any[]> {
  try {
    const invites = await wordpressCCTFetch<any[]>("care_group_invite", {
      params: { status: "pending", _limit: 100 },
    });
    if (!Array.isArray(invites)) return [];
    return invites.map((i: any) => ({
      id: String(i._ID || i.id || ""),
      group_id: null,
      user_id: i.user_id || null,
      role: i.role || "member",
      invitation_status: "pending",
      created_at: i.cct_created || i.created_at,
      group: null,
    }));
  } catch { return []; }
}

export async function acceptInvitationWordPress(invitationId: string): Promise<void> {
  await wordpressCCTFetch("care_group_invite", { id: invitationId, method: "PUT", body: { status: "accepted" } });
}

export async function declineInvitationWordPress(invitationId: string): Promise<void> {
  await wordpressCCTFetch("care_group_invite", { id: invitationId, method: "PUT", body: { status: "declined" } });
}

// ─── Member Roles & Removal ─────────────────────────────────
// Uses JetEngine relation 72 (care_group → users)
export async function updateMemberRoleWordPress(memberId: string, role: string, groupId?: string): Promise<void> {
  // Update member role via JetEngine relation 72 meta field (care_groups_member_types)
  const normalizedGroupId = normalizeWpObjectId(groupId);
  const normalizedMemberId = normalizeWpObjectId(memberId);
  if (!normalizedGroupId || !normalizedMemberId) return;
  await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
    method: "POST",
    body: {
      parent_id: normalizedGroupId,
      child_id: normalizedMemberId,
      context: "child",
      store_items_type: "update",
      meta: { care_groups_member_types: role },
    },
  });
}

export async function removeGroupMemberWordPress(memberId: string, groupId?: string): Promise<void> {
  // Remove user from group via JetEngine relation 72
  const normalizedGroupId = normalizeWpObjectId(groupId);
  const normalizedMemberId = normalizeWpObjectId(memberId);
  if (normalizedGroupId && normalizedMemberId) {
    await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
      method: "DELETE",
      body: { parent_id: normalizedGroupId, child_id: normalizedMemberId },
    });
  }
}

// ─── Join by Code ───────────────────────────────────────────
export async function joinGroupByCodeWordPress(code: string): Promise<any> {
  try {
    const groups = await wordpressCCTFetch("care_group", {
      params: { invite_code: code, _limit: 1 },
    });
    if (!Array.isArray(groups) || groups.length === 0) throw new Error("Invalid invite code");
    return { group_id: groups[0].id, group_name: groups[0].name };
  } catch {
    throw new Error("Invalid invite code");
  }
}

// ─── Gallery ────────────────────────────────────────────────
// CCT slug: care_group_gallery | flat fields
export async function fetchCareGroupGalleryWordPress(groupId: string): Promise<any[]> {
  try {
    const items = await fetchRelatedCctItems(REL_GROUP_GALLERY, groupId, "care_group_gallery");
    if (!Array.isArray(items)) return [];
    return items.map((m: any) => ({
      id: String(m._ID || m.id),
      group_id: m.group_id || groupId,
      image_url: m.url || m.file_url || m.image_url || null,
      url: m.url || m.file_url || m.image_url || null,
      type: m.media_type || "image",
      caption: m.caption || null,
      created_at: m.created_at,
    }));
  } catch { return []; }
}

export async function createCareGroupGalleryItemWordPress(groupId: string, url: string, caption?: string): Promise<void> {
  const created = await wordpressCCTFetch<any>("care_group_gallery", {
    method: "POST",
    body: { url, caption: caption || "", media_type: "image" },
  });
  const normalizedGroupId = normalizeWpObjectId(groupId);
  const itemId = normalizeWpObjectId(created?._ID || created?.id);
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

// ─── Member Categories ──────────────────────────────────────
// CCT slug: member_category | flat fields
export async function fetchMemberCategoriesWordPress(groupId: string): Promise<any[]> {
  try {
    const cats = await fetchRelatedCctItems(REL_GROUP_MEMBER_CATEGORY, groupId, "member_category");
    if (!Array.isArray(cats)) return [];
    return cats.map((c: any) => ({
      id: c.id,
      group_id: c.group_id || groupId,
      name: c.name || "",
      color: c.color || null,
      created_at: c.created_at,
    }));
  } catch { return []; }
}

export async function createMemberCategoryWordPress(groupId: string, name: string, color?: string): Promise<void> {
  const created = await wordpressCCTFetch<any>("member_category", {
    method: "POST",
    body: { name, color: color || null },
  });
  const normalizedGroupId = normalizeWpObjectId(groupId);
  const categoryId = normalizeWpObjectId(created?._ID || created?.id);
  if (normalizedGroupId && categoryId) {
    await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER_CATEGORY}`, {
      method: "POST",
      body: { parent_id: normalizedGroupId, child_id: categoryId, context: "child", store_items_type: "update" },
    });
  }
}

export async function deleteMemberCategoryWordPress(categoryId: string): Promise<void> {
  await wordpressCCTFetch("member_category", { id: categoryId, method: "DELETE" });
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
export async function addCaredOneToGroupWordPress(groupId: string, caredOneId: string): Promise<void> {
  // Add user to group via JetEngine relation 72
  const normalizedGroupId = normalizeWpObjectId(groupId);
  const normalizedCaredOneId = normalizeWpObjectId(caredOneId);
  await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
    method: "POST",
    body: { parent_id: normalizedGroupId, child_id: normalizedCaredOneId, context: "child", store_items_type: "update" },
  });
}

// ─── Leave Group ────────────────────────────────────────────
export async function leaveGroupWordPress(groupId: string, userId?: string): Promise<void> {
  if (!userId) return;
  try {
    const normalizedGroupId = normalizeWpObjectId(groupId);
    const normalizedUserId = normalizeWpObjectId(userId);
    if (!normalizedGroupId || !normalizedUserId) return;
    // Remove current user from group via JetEngine relation 72
    await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
      method: "DELETE",
      body: { parent_id: normalizedGroupId, child_id: normalizedUserId },
    });
  } catch {}
}
