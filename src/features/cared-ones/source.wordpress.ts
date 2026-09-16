import { wordpressFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";
import { R } from "@/integrations/wp-schema";
import { fetchWPUserProfile } from "@/features/shared/wp-users";
import { decodeRel219Status } from "./rel219-meta";

const REL_USER_CARED_ONE = R.userCaredOnes;

/**
 * Cared ones via JetEngine Relation 219 (Users -> Users, Many to Many).
 * Each cared one is a real WordPress user; its identity comes from the user
 * record plus CCT 151 / 258 joined through Relations 152 / 259. No fallbacks,
 * no placeholders — a failed read surfaces as a failed read.
 */
export async function fetchUserCaredOnesWordPress(): Promise<any[]> {
  const storedUser = getStoredWPUser();
  if (!storedUser?.user_id) return [];

  const rels = await wordpressFetch<any[]>(`jet-rel/${REL_USER_CARED_ONE}/children/${storedUser.user_id}`);
  if (!Array.isArray(rels) || rels.length === 0) return [];

  const selfId = String(storedUser.user_id).replace(/^wp-/, "");
  // A user is never their own cared one — Relation 219 rows pointing back at the
  // caller are ignored so the dashboard never lists the signed-in user.
  // Declined requests disappear; pending ones stay visible but are marked, so
  // the caregiver can see they are still waiting for an answer.
  const rows = rels
    .filter((r: any) => decodeRel219Status(r?.meta) !== "declined")
    .map((r: any) => ({
      id: String(r.child_object_id ?? ""),
      status: decodeRel219Status(r?.meta),
    }))
    .filter((r) => r.id && r.id.replace(/^wp-/, "") !== selfId);

  // No blocking pre-fetch: every person read below joins the same 25ms
  // micro-batch inside fetchWPUsers, so the user records and the profile
  // relation joins all leave together instead of in two stages.


  const caredOnes = await Promise.all(
    rows.map(async (row) => {

      const u = await fetchWPUserProfile(row.id);
      return {
        user_id: `wp-${u.id}`,
        relationship: null,
        invitation_status: row.status,
        cared_one: {
          id: `wp-${u.id}`,
          // The ONLY name source is this app's own column on CCT 151. The shared
          // WordPress account name/login is never read and never displayed.
          full_name: u.full_name,
          first_name: u.full_name ? u.full_name.split(" ")[0] : null,
          email: u.email,
          avatar_url: u.avatar_url,
          condition_types: u.condition_types,
        },

      };
    }),
  );

  return caredOnes;
}

