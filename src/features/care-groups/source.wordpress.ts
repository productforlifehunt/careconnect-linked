import type { CareGroup } from "@/types/care-connector";
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";
import { encodeRel72Meta, decodeRel72Meta } from "./rel-meta";
import { T, R } from "@/integrations/wp-schema";
import { fetchWPUserProfile } from "@/features/shared/wp-users";
import { dedupeRead } from "@/features/shared/rel-batch";
import { fetchMyAppUserName } from "@/features/profile/app-user-name";
import { randomJoinCode } from "./join-link";
import { readLinkedCCTRows } from '@/features/shared/cct-rows';

// Live JetEngine relations (verified from prd-to-wp-mapping.md)
const REL_GROUP_MEMBER = R.careGroupMembers; // M:M  care_group → users

function normalizeWpObjectId(value: string | number | null | undefined): number {
  return Number(String(value ?? "").replace(/^wp-/, ""));
}

// CCT slug: care_group | fields: a55=name, a56=description, a57=group type, a58=join code, a59=status
// Invite codes/links live on a separate CCT (care_group_invite, Rel 161) — not on the group itself.

/**
 * Only the care groups the signed-in user actually belongs to.
 * Membership is JetEngine Relation 72 (care_group → users); we read the
 * relation from the user's side and then load each group record.
 */
export async function fetchCareGroupsWordPress(): Promise<CareGroup[]> {
  const stored = getStoredWPUser();
  const userId = stored?.user_id ? Number(stored.user_id) : null;
  if (!userId) return [];

  const rels = await dedupeRead(
    `rel-parents:${REL_GROUP_MEMBER}:${userId}`,
    () => wordpressFetch<any[]>(`jet-rel/${REL_GROUP_MEMBER}/parents/${userId}`),
  );
  if (!Array.isArray(rels) || rels.length === 0) return [];

  const myGroupIds = Array.from(new Set(
    rels
      // Only accepted rows are memberships; a pending row is an invitation.
      .filter((r: any) => decodeRel72Meta(r?.meta).invitationStatus === "accepted")
      .map((r: any) => String(r.parent_object_id || ""))
      .filter(Boolean)
  ));
  if (myGroupIds.length === 0) return [];

  const groups = await readLinkedCCTRows(T.careGroup.slug, myGroupIds);

  return groups.filter(Boolean).map((g: any) => ({
    id: String(g.id || g._ID || ""),
    name: g.a55 || "",
    description: g.a56 || null,
    is_private: String(g.a57) === "b56",
    group_type: String(g.a57) === "b56" ? "private" : "public",
    invite_code: null,
    join_code: g.a58 || null,
    // No default: a missing a59 is unknown, never assumed active.
    is_active: String(g.a59 ?? "") === "b55",
    created_by: g.cct_author_id ? `wp-${g.cct_author_id}` : (g.author_id ? `wp-${g.author_id}` : null),
    created_at: g.created_at,
  })) as unknown as CareGroup[];
}


export async function fetchCareGroupMembersWordPress(groupId: string): Promise<any[]> {
  try {
    const normalizedGroupId = normalizeWpObjectId(groupId);
    if (!normalizedGroupId) return [];
    const rels = await dedupeRead(
      `rel-children:${REL_GROUP_MEMBER}:${normalizedGroupId}`,
      () => wordpressFetch<any[]>(`jet-rel/${REL_GROUP_MEMBER}/children/${normalizedGroupId}`),
    );
    if (!Array.isArray(rels) || rels.length === 0) return [];
    const userIds = rels.map((r: any) => Number(r.child_object_id)).filter(Boolean);
    const members = await Promise.all(
      userIds.map(async (uid) => {
        const rel = rels.find((r: any) => Number(r.child_object_id) === uid);
        try {
          const u = await fetchWPUserProfile(uid);
          const decoded = decodeRel72Meta(rel?.meta);
          const memberTypes = decoded.memberTypes;
          const memberRoles = decoded.memberRoles;
          // Names come from the relation meta or this app's own column on
          // CCT 151 — never the shared WordPress user name.
          const displayName = decoded.displayName || u.full_name || "";
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
            profile: { id: `wp-${uid}`, full_name: displayName, email: u.email || null, avatar_url: u.avatar_url || null },
          };
        } catch {
          // Subscriber accounts are invisible to wp/v2/users for other
          // subscribers, so the profile read can fail even though the
          // membership relation row is real. One such member must not wipe
          // the whole roster — fall back to the relation meta (a55 holds the
          // in-group display name) with an empty profile.
          const decoded = decodeRel72Meta(rel?.meta);
          const memberTypes = decoded.memberTypes;
          const memberRoles = decoded.memberRoles;
          const displayName = decoded.displayName || "";
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
            invitation_status: decoded.invitationStatus,
            profile: { id: `wp-${uid}`, full_name: displayName, email: null, avatar_url: null },
          };
        }
      })
    );
    // Pending invitations and declined ones are not members — hide them.
    return members.filter((m: any) => m && m.invitation_status === "accepted");
  } catch (e) {
    // Never turn a failed read into "this group has no members" — that hides
    // owner/admin controls and wrongly offers "Join" to the owner.
    throw e instanceof Error ? e : new Error("Could not load group members");
  }
}

export async function createCareGroupWordPress(group: { name: string; description?: string | undefined; is_private?: boolean | undefined; displayName?: string | undefined }): Promise<CareGroup> {
  const result = await wordpressCCTFetch<any>(T.careGroup.slug, {
    method: "POST",
    body: {
      a55: group.name,
      a56: group.description || "",
      a57: group.is_private ? "b56" : "b55",
      // Every new group starts with a six-digit join code (a58).
      a58: randomJoinCode(),
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
            displayName: group.displayName?.trim() || (await fetchMyAppUserName()),
            memberTypes: ["owner"],
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


/**
 * Rel 223 a55 — the member's display name INSIDE this care group.
 * Every group-internal surface shows this name (dictionary requirement),
 * so members must be able to set it for themselves.
 */
export async function setMyGroupDisplayNameWordPress(groupId: string, displayName: string): Promise<void> {
  const gid = normalizeWpObjectId(groupId);
  const stored = getStoredWPUser();
  const uid = stored?.user_id ? Number(stored.user_id) : 0;
  if (!gid || !uid) return;
  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_GROUP_MEMBER}/children/${gid}`);
  const existing = (Array.isArray(rels) ? rels : []).find((r: any) => Number(r.child_object_id) === uid);
  const decoded = decodeRel72Meta(existing?.meta);
  await wordpressFetch(`jet-rel/${REL_GROUP_MEMBER}`, {
    method: "POST",
    body: {
      parent_id: gid,
      child_id: uid,
      context: "child",
      store_items_type: "update",
      meta: encodeRel72Meta({
        displayName: displayName.trim(),
        memberTypes: decoded.memberTypes,
        memberRoles: decoded.memberRoles,
        invitationStatus: decoded.invitationStatus,
      }),
    },
  });
}
