import type { CareGroup } from "@/types/care-connector";
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";

// JetEngine Relation IDs
const REL_GROUP_MEMBER = 72; // care_group → users (many-to-many)

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
    // Use JetEngine relation 72 to get member user IDs
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_MEMBER}/children/${groupId}`);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    const userIds = rels.map((r: any) => Number(r.child_object_id)).filter(Boolean);
    // Fetch WP user profiles for all member IDs
    const members = await Promise.all(
      userIds.map(async (uid) => {
        try {
          const u = await wordpressFetch<any>(`wp/v2/users/${uid}`);
          return {
            id: String(uid),
            user_id: `wp-${uid}`,
            group_id: groupId,
            role: "member",
            is_admin: false,
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
  const result = await wordpressCCTFetch("care_group", {
    method: "POST",
    body: { name: group.name, description: group.description || "", is_private: group.is_private ? "yes" : "no" },
  });
  return result as unknown as CareGroup;
}
