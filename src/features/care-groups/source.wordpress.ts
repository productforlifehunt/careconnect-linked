import type { CareGroup } from "@/types/care-connector";
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";

// Live JetEngine relations (verified from prd-to-wp-mapping.md)
const REL_GROUP_MEMBER = 72; // M:M  care_group → users

function normalizeWpObjectId(value: string | number | null | undefined): number {
  return Number(String(value ?? "").replace(/^wp-/, ""));
}

function normalizeMetaList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") return value.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

// CCT slug: care_group | fields: name, description, group_type, join_code, is_active
export async function fetchCareGroupsWordPress(): Promise<CareGroup[]> {
  try {
    const groups = await wordpressCCTFetch<any[]>("care_group", { params: { _limit: 50 } });
    if (!Array.isArray(groups)) return [];
    return groups.map((g: any) => ({
      id: String(g.id || g._ID || ""),
      name: g.name || "",
      description: g.description || null,
      is_private: g.group_type === "private",
      group_type: g.group_type || "public",
      invite_code: g.join_code || null,
      join_code: g.join_code || null,
      is_active: g.is_active === "active" || g.is_active === "Active" || g.is_active === true || g.is_active === "yes",
      created_by: g.cct_author_id ? `wp-${g.cct_author_id}` : (g.author_id ? `wp-${g.author_id}` : null),
      created_at: g.created_at,
    })) as unknown as CareGroup[];
  } catch {
    return [];
  }
}

export async function fetchCareGroupMembersWordPress(groupId: string): Promise<any[]> {
  try {
    const normalizedGroupId = normalizeWpObjectId(groupId);
    if (!normalizedGroupId) return [];
    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_MEMBER}/children/${normalizedGroupId}`);
    if (!Array.isArray(rels) || rels.length === 0) return [];
    const userIds = rels.map((r: any) => Number(r.child_object_id)).filter(Boolean);
    const members = await Promise.all(
      userIds.map(async (uid) => {
        try {
          const u = await wordpressFetch<any>(`wp/v2/users/${uid}`);
          const rel = rels.find((r: any) => Number(r.child_object_id) === uid);
          const memberTypes = normalizeMetaList(rel?.meta?.care_groups_member_types);
          const memberRoles = normalizeMetaList(rel?.meta?.care_groups_member_roles);
          const displayName = rel?.meta?.care_groups_member_display_name_ || u.name || u.slug || "Member";
          const invitationStatus = rel?.meta?.care_groups_member_invitation_status || "accepted";
          const isOwner = memberTypes.includes("owner");
          const isAdmin = memberTypes.includes("admin") || isOwner;
          return {
            id: String(uid),
            user_id: `wp-${uid}`,
            group_id: groupId,
            display_name: displayName,
            member_types: memberTypes.length ? memberTypes : ["nothing special"],
            member_roles: memberRoles.length ? memberRoles : ["nothing special"],
            role: isOwner ? "owner" : isAdmin ? "admin" : "nothing special",
            is_admin: isAdmin,
            is_owner: isOwner,
            is_cared_one: memberRoles.includes("cared one"),
            invitation_status: invitationStatus,
            profile: { id: `wp-${uid}`, full_name: displayName, email: u.email || null, avatar_url: u.avatar_urls?.["96"] || null },
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
  // Auto-generate human-friendly join code (8 chars, no ambiguous letters)
  const generateJoinCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  };
  const result = await wordpressCCTFetch<any>("care_group", {
    method: "POST",
    body: {
      name: group.name,
      description: group.description || "",
      group_type: group.is_private ? "private" : "public",
      join_code: generateJoinCode(),
      is_active: "active",
    },
  });
  // Auto-add creator as owner via JetEngine relation 72
  const groupId = normalizeWpObjectId(result?.item_id || result?._ID || result?.id);
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
          meta: {
            care_groups_member_types: ["owner", "admin"],
            care_groups_member_roles: ["nothing special"],
            care_groups_member_display_name_: wpUser.user_display_name || wpUser.user_login || "Owner",
            care_groups_member_invitation_status: "accepted",
          },
        },
      });
    } catch (e) {
      console.warn("Failed to auto-add creator as member:", e);
    }
  }
  return result as unknown as CareGroup;
}
