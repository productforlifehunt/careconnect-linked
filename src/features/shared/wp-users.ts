import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { wpAdminOps } from "@/services/woocommerce-api";
import { T, R } from "@/integrations/wp-schema";
import { dedupeRead } from "@/features/shared/rel-batch";
import { appUserNameField } from "@/features/shared/app-scope";

export interface WPUserRecord {
  id: number;
  name: string;
  slug: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  roles: string[];
  avatar_url: string | null;
}

function toRecord(u: any): WPUserRecord {
  return {
    id: Number(u.id),
    name: u.name || u.slug || "",
    slug: u.slug || "",
    email: u.email || null,
    first_name: u.first_name || null,
    last_name: u.last_name || null,
    roles: Array.isArray(u.roles) ? u.roles : [],
    avatar_url: u.avatar_urls?.["96"] || u.avatar || null,
  };
}

/**
 * Reads real WordPress users by ID.
 *
 * App users are WP subscribers and cannot read other users over the REST API,
 * so the read is performed through the `wp-admin-ops` edge function (admin
 * credentials stay server-side). There is NO degraded/public fallback: either
 * the real record comes back, or the caller sees the failure.
 */
export async function fetchWPUsers(ids: Array<number | string>): Promise<Map<number, WPUserRecord>> {
  const clean = Array.from(
    new Set(
      ids
        .map((v) => Number(String(v ?? "").replace(/^wp-/, "")))
        .filter((n) => Number.isFinite(n) && n > 0),
    ),
  );
  const out = new Map<number, WPUserRecord>();
  if (clean.length === 0) return out;

  return dedupeRead(`wp-users:${clean.slice().sort((a, b) => a - b).join(",")}`, async () => {
    const proxied = await wpAdminOps<any[]>("get_user_names", { ids: clean });
    if (!Array.isArray(proxied)) {
      throw new Error("Could not read WordPress users through wp-admin-ops");
    }
    for (const u of proxied) out.set(Number(u.id), toRecord(u));
    return out;
  });
}

export async function fetchWPUser(id: number | string): Promise<WPUserRecord> {
  const numeric = Number(String(id ?? "").replace(/^wp-/, ""));
  const map = await fetchWPUsers([numeric]);
  const rec = map.get(numeric);
  if (!rec) throw new Error(`WordPress user ${numeric} not found`);
  return rec;
}

/** One-to-one child CCT row of a user (Relation 152 / 259). */
async function fetchOneToOneChild(relationId: number, userId: number, cctSlug: string): Promise<any | null> {
  const rels = await wordpressFetch<any[]>(`jet-rel/${relationId}/children/${userId}`);
  if (!Array.isArray(rels)) throw new Error(`Relation ${relationId} returned an invalid response`);
  const childId = rels[0]?.child_object_id;
  if (!childId) return null;
  return wordpressCCTFetch<any>(cctSlug, { id: childId });
}

export interface WPUserProfile extends WPUserRecord {
  /** 151. User's extended profile (Relation 152) */
  profile: any | null;
  /** 258. User's extended profile 2 (Relation 259) */
  profile2: any | null;
  /** Display name preferring the profile's own USER_NAME field. */
  full_name: string;
  condition_types: string[];
}

/**
 * Full user identity per the data model: the WP user record plus its two
 * extended-profile CCT rows, joined through JetEngine relations 152 and 259.
 */
export async function fetchWPUserProfile(id: number | string): Promise<WPUserProfile> {
  const user = await fetchWPUser(id);
  const [profile, profile2] = await Promise.all([
    fetchOneToOneChild(R.userProfileRel, user.id, T.userProfile.slug),
    fetchOneToOneChild(R.userProfile2Rel, user.id, T.userProfile2.slug),
  ]);
  // Display name comes ONLY from the per-app column on CCT 151
  // (a556 ChallengeD / a557 CareCNC). The WordPress user name is shared across
  // every app on this backend and is never shown.
  const nameField = appUserNameField();
  const profileName = profile?.[nameField];
  const raw = profile2?.[T.userProfile2.f.CARED_ONE_S_CONDITION_TYPE];
  const condition_types = Array.isArray(raw)
    ? raw.map(String)
    : typeof raw === "string" && raw.trim()
      ? (() => {
          try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed.map(String) : raw.split(",").map((s) => s.trim());
          } catch {
            return raw.split(",").map((s) => s.trim()).filter(Boolean);
          }
        })()
      : [];
  return {
    ...user,
    profile,
    profile2,
    full_name: typeof profileName === "string" ? profileName.trim() : "",
    condition_types,
  };
}

export async function fetchWPUserProfiles(ids: Array<number | string>): Promise<WPUserProfile[]> {
  const users = await fetchWPUsers(ids);
  return Promise.all(Array.from(users.keys()).map((id) => fetchWPUserProfile(id)));
}
