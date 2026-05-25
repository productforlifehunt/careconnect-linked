import type { CareGroup } from "@/types/care-connector";
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";
import { encodeRel72Meta, decodeRel72Meta } from "./rel-meta";

// Live JetEngine relations (verified from prd-to-wp-mapping.md)
const REL_GROUP_MEMBER = 72; // M:M  care_group → users

function normalizeWpObjectId(value: string | number | null | undefined): number {
  return Number(String(value ?? "").replace(/^wp-/, ""));
}

// CCT slug: care_group | fields: a55=name, a56=description, a57=group type, a58=join code, a59=status
// Invite codes/links live on a separate CCT (care_group_invite, Rel 161) — not on the group itself.

export async function fetchCareGroupsWordPress(): Promise<CareGroup[]> {
  try {
    const groups = await wordpressCCTFetch<any[]>("care_group", { params: { _limit: 50 } });
    if (!Array.isArray(groups)) return [];
    return groups.map((g: any) => ({
      id: String(g.id || g._ID || ""),
      name: g.a55 || "",
      description: g.a56 || null,
      is_private: String(g.a57) === "b56",
      group_type: String(g.a57) === "b56" ? "private" : "public",
      invite_code: null,
      join_code: g.a58 || null,
      is_active: String(g.a59 || "b55") === "b55",
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
          const decoded = decodeRel72Meta(rel?.meta);
          const memberTypes = decoded.memberTypes;
          const memberRoles = decoded.memberRoles;
          const displayName = decoded.displayName || u.name || u.slug || "Member";
          const invitationStatus = decoded.invitationStatus;
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
  const result = await wordpressCCTFetch<any>("care_group", {
    method: "POST",
    body: {
      a55: group.name,
      a56: group.description || "",
      a57: group.is_private ? "b56" : "b55",
      a59: "b55",
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
          meta: encodeRel72Meta({
            displayName: wpUser.user_display_name || wpUser.user_login || "Owner",
            memberTypes: ["owner", "admin"],
            memberRoles: ["nothing special"],
            invitationStatus: "accepted",
          }),
        },
      });
    } catch (e) {
      console.warn("Failed to auto-add creator as member:", e);
    }
  }
  return result as unknown as CareGroup;
}
