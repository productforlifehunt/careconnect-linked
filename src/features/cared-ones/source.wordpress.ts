import { wordpressFetch } from "@/features/shared/wordpress-client";
import { getStoredWPUser } from "@/services/wp-auth";

const REL_USER_CARED_ONE = 219;

// Cared ones via JetEngine relation 79: users -> users
export async function fetchUserCaredOnesWordPress(): Promise<any[]> {
  try {
    const storedUser = getStoredWPUser();
    if (!storedUser?.user_id) return [];

    const rels = await wordpressFetch<any[]>(`jet-rel/${REL_USER_CARED_ONE}/children/${storedUser.user_id}`);
    if (!Array.isArray(rels) || rels.length === 0) return [];

    const caredOneIds = rels.map((r: any) => String(r.child_object_id)).filter(Boolean);
    const caredOnes = await Promise.all(
      caredOneIds.map(async (userId: string) => {
        try {
          const u = await wordpressFetch<any>(`wp/v2/users/${userId}?context=edit`);
          const fullName = u.name || u.slug || "Cared One";
          return {
            user_id: `wp-${userId}`,
            relationship: null,
            cared_one: {
              id: `wp-${userId}`,
              full_name: fullName,
              first_name: fullName.split(" ")[0] || null,
              avatar_url: u.avatar_urls?.["96"] || null,
              dementia_stage: null,
            },
          };
        } catch {
          return null;
        }
      })
    );

    return caredOnes.filter(Boolean);
  } catch {
    return [];
  }
}
