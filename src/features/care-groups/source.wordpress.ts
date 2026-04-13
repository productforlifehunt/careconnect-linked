import type { CareGroup } from "@/types/care-connector";
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";

// JetEngine Relation IDs
const REL_GROUP_MEMBER = 72; // care_group → users (many-to-many)

function normalizeWpObjectId(value: string | number | null | undefined): number {
  return Number(String(value ?? "").replace(/^wp-/, ""));
}

// CCT slug: care_group | Members via JetEngine relation 72
export async function fetchCareGroupsWordPress(): Promise<CareGroup[]> {
  try {
    const groups = await wordpressCCTFetch("care_group", { params: { _limit: 50 } });
    if (!Array.isArray(groups)) return [];
    return groups.map((g: any) => ({
      id: String(g._ID || g.id || ""),
      name: g.name || "",
      description: g.description || null,
      is_private: g.is_private === true || g.is_private === "yes",
      invite_code: g.join_code || g.invite_code || null,
      created_by: g.cct_author_id ? `wp-${g.cct_author_id}` : null,
      created_at: g.cct_created || g.created_at,
    })) as unknown as CareGroup[];
  } catch {
    return [];
  }
}

export async function fetchCareGroupMembersWordPress(groupId: string): Promise<any[]> {
  try {
    const normalizedGroupId = normalizeWpObjectId(groupId);
    if (!normalizedGroupId) return [];
    // Use JetEngine relation 72 to get member user IDs
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_MEMBER}/children/${normalizedGroupId}`);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    const userIds = rels.map((r: any) => Number(r.child_object_id)).filter(Boolean);
    // Fetch WP user profiles for all member IDs
    const members = await Promise.all(
      userIds.map(async (uid) => {
        try {
          const u = await wordpressFetch<any>(`wp/v2/users/${uid}`);
          const rel = rels.find((r: any) => Number(r.child_object_id) === uid);
          const roleMeta = rel?.meta?.care_groups_special_role_type;
          const isOwner = roleMeta === "owner";
          const isAdmin = roleMeta === "admin" || isOwner;
          return {
            id: String(uid),
            user_id: `wp-${uid}`,
            group_id: groupId,
            role: roleMeta || "member",
            is_admin: isAdmin,
            is_owner: isOwner,
            invitation_status: "accepted",
            profile: { id: `wp-${uid}`, full_name: u.name || u.slug, avatar_url: u.avatar_urls?.["96"] || null },
          };
        } catch { return null; }
      })
    );
    return members.filter(Boolean);
  } catch {
    return [];
  }
}

export async function createCareGroupWordPress(group: { name: string; description?: string; is_private?: boolean }): Promise<CareGroup> {
  const result = await wordpressCCTFetch<any>("care_group", {
    method: "POST",
    body: { name: group.name, description: group.description || "", is_private: group.is_private ? "yes" : "no" },
  });
  // Auto-add creator as owner via JetEngine relation 72
  const groupId = normalizeWpObjectId(result?._ID || result?.id);
  const wpUser = getStoredWPUser();
  const userId = wpUser?.user_id ? Number(wpUser.user_id) : null;
  if (groupId && userId) {
    try {
      await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
        method: "POST",
        body: {
          parent_id: groupId,
          child_id: userId,
          context: "child",
          store_items_type: "update",
          meta: { care_groups_special_role_type: "owner" },
        },
      });
    } catch (e) {
      console.warn("Failed to auto-add creator as member:", e);
    }
  }
  return result as unknown as CareGroup;
}
