var e=`import { readLinkedCCTRows } from '@/features/shared/cct-rows';
import { wordpressFetch, wordpressCCTFetch } from "@/features/shared/wordpress-client";
import { T, R } from "@/integrations/wp-schema";
import { dedupeRead, fetchRelChildrenMap } from "@/features/shared/rel-batch";
import { APP_PROFILE_F, currentAppId } from "@/features/shared/app-profile";

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
 * Process-level record cache.
 *
 * A screen that renders N people used to cost N separate admin-ops calls,
 * because each single-id read had its own dedupe key. Records resolved by any
 * batch are reused, so one batched request covers the whole screen.
 */
const userRecordCache = new Map<number, WPUserRecord>();
let userCacheGeneration = 0;
if (typeof window !== 'undefined') {
  window.addEventListener('wp-write', () => { userRecordCache.clear(); userCacheGeneration++; });
}

/**
 * Micro-batching queue — reads people straight from WordPress.
 *
 * \`wp/v2/users?include=\` answers for ANY user id (subscribers included) over a
 * plain authenticated HTTPS request, so there is no edge function in this path
 * at all. Every id requested inside the same ~25ms window is collapsed into ONE
 * request, so a screen with N people costs one round-trip, not N.
 */
let pendingIds = new Set<number>();
let pendingBatch: Promise<void> | null = null;

function enqueueUserIds(ids: number[]): Promise<void> {
  ids.forEach((id) => pendingIds.add(id));
  if (!pendingBatch) {
    pendingBatch = new Promise<void>((resolve, reject) => {
      setTimeout(async () => {
        const batch = Array.from(pendingIds);
        const generation = userCacheGeneration;
        pendingIds = new Set();
        pendingBatch = null;
        try {
          const rows = await wordpressFetch<any[]>("wp/v2/users", {
            params: { include: batch.join(","), per_page: Math.max(batch.length, 10) },
          });
          if (!Array.isArray(rows)) {
            throw new Error("Could not read WordPress users");
          }
          if (generation !== userCacheGeneration) throw new Error('Account or user data changed; retry the read.');
          for (const u of rows) {
            const rec = toRecord(u);
            userRecordCache.set(rec.id, rec);
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      }, 25);
    });
  }
  return pendingBatch;
}


/**
 * Reads real WordPress users by ID.
 *
 * App users are WP subscribers and cannot read other users over the REST API,
 * so the read is performed through the \`wp-admin-ops\` edge function (admin
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

  const missing: number[] = [];
  for (const id of clean) {
    const cached = userRecordCache.get(id);
    if (cached) out.set(id, cached);
    else missing.push(id);
  }
  if (missing.length === 0) return out;

  await enqueueUserIds(missing);

  for (const id of missing) {
    const rec = userRecordCache.get(id);
    if (rec) out.set(id, rec);
  }
  return out;
}


export async function fetchWPUser(id: number | string): Promise<WPUserRecord> {
  const numeric = Number(String(id ?? "").replace(/^wp-/, ""));
  const map = await fetchWPUsers([numeric]);
  const rec = map.get(numeric);
  if (!rec) throw new Error(\`WordPress user \${numeric} not found\`);
  return rec;
}


/**
 * Rows of a CCT by ID, gathered for one tick and read with one JetEngine IN filter.
 * A screen with N people costs one small request for exactly their rows — never the whole table.
 */
const pendingRows = new Map<string, { ids: Set<string>; wait: Promise<Map<string, any>> }>();
function fetchCCTRowsBatched(cctSlug: string, id: string): Promise<any | null> {
  let batch = pendingRows.get(cctSlug);
  if (!batch) {
    const ids = new Set<string>();
    const wait = new Promise<Map<string, any>>((resolve, reject) => setTimeout(() => {
      pendingRows.delete(cctSlug);
      readLinkedCCTRows(cctSlug, [...ids]).then((rows) => resolve(new Map(rows.map((r: any) => [String(r?.id ?? r?._ID), r])))).catch(reject);
    }, 0));
    batch = { ids, wait };
    pendingRows.set(cctSlug, batch);
  }
  batch.ids.add(id);
  return batch.wait.then((m) => m.get(id) ?? null);
}

/**
 * One-to-one child CCT row of a user (Relation 152 / 259).
 *
 * Reads the relation through the batched whole-relation map and resolves the
 * row from a single whole-CCT read, so a screen with N people costs ~2
 * requests total instead of 2N+ sequential round-trips.
 */
async function fetchOneToOneChild(relationId: number, userId: number, cctSlug: string): Promise<any | null> {
  let childId: string | number | null = null;
  const map = await fetchRelChildrenMap(relationId);
  if (map.loaded) {
    childId = map.get(String(userId))?.[0]?.childId ?? null;
  } else {
    const rels = await dedupeRead(\`rel-children:\${relationId}:\${userId}\`, () =>
      wordpressFetch<any[]>(\`jet-rel/\${relationId}/children/\${userId}\`),
    );
    if (!Array.isArray(rels)) throw new Error(\`Relation \${relationId} returned an invalid response\`);
    childId = rels[0]?.child_object_id ?? null;
  }
  if (!childId) return null;
  return fetchCCTRowsBatched(cctSlug, String(childId));
}

/**
 * A user's CCT 151 row FOR THIS APP (column a01), joined through Relation 152.
 * Every app keeps its own row, so the child list is filtered by app id instead
 * of taking the first child.
 */
async function fetchAppProfileChild(userId: number): Promise<any | null> {
  const app = currentAppId();
  const slug = T.userProfile.slug;
  let childIds: string[] = [];
  const map = await fetchRelChildrenMap(R.userProfileRel);
  if (map.loaded) {
    childIds = (map.get(String(userId)) ?? []).map((c: any) => String(c.childId));
  } else {
    const rels = await dedupeRead(\`rel-children:\${R.userProfileRel}:\${userId}\`, () =>
      wordpressFetch<any[]>(\`jet-rel/\${R.userProfileRel}/children/\${userId}\`),
    );
    if (!Array.isArray(rels)) throw new Error(\`Relation \${R.userProfileRel} returned an invalid response\`);
    childIds = rels.map((r) => String(r?.child_object_id ?? "")).filter(Boolean);
  }
  if (childIds.length === 0) return null;

  const rows = await Promise.all(childIds.map((id) => fetchCCTRowsBatched(slug, id).catch(() => null)));
  const present = rows.filter(Boolean) as any[];
  const mine = present.find((r) => String(r?.[APP_PROFILE_F.APP] ?? "").toLowerCase() === app);
  // Rows written before a01 existed have no app stamp; they still belong to the
  // person and carry their only name.
  return mine ?? present.find((r) => !String(r?.[APP_PROFILE_F.APP] ?? "").trim()) ?? null;
}



/**
 * Forum display names for this app only (CCT 151 a56, Relation 152).
 * Falls back to the app name (a55) when the person never picked a forum name.
 */
export async function fetchForumNames(ids: Array<number | string>): Promise<Map<number, string>> {
  const numeric = Array.from(
    new Set(
      ids
        .map((id) => Number(String(id ?? "").replace(/^wp-/, "")))
        .filter((n) => Number.isFinite(n) && n > 0),
    ),
  );
  const out = new Map<number, string>();
  await Promise.all(
    numeric.map(async (id) => {
      const row = await fetchAppProfileChild(id).catch(() => null);
      const forum = String(row?.[APP_PROFILE_F.COMMUNITY_NAME] ?? "").trim();
      const name = forum || String(row?.[APP_PROFILE_F.NAME] ?? "").trim();
      if (name) out.set(id, name);
    }),
  );
  return out;
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
  const numeric = Number(String(id ?? "").replace(/^wp-/, ""));
  // The relation joins only need the numeric user id, so nothing has to wait on
  // the user record read — all three go out at once instead of in a waterfall.
  const [user, profile, profile2] = await Promise.all([
    fetchWPUser(numeric),
    fetchAppProfileChild(numeric),
    fetchOneToOneChild(R.userProfile2Rel, numeric, T.userProfile2.slug),
  ]);

  // Display name comes ONLY from the per-app column on CCT 151
  // (a556 ChallengeD / a557 CareCNC). The WordPress user name is shared across
  // every app on this backend and is never shown.
  const profileName = profile?.[APP_PROFILE_F.NAME];
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
  const clean = [...new Set(ids.map(id => Number(String(id).replace(/^wp-/, ''))).filter(id => Number.isFinite(id) && id > 0))];
  return Promise.all(clean.map(id => fetchWPUserProfile(id)));
}

/**
 * Guest-safe identity read for public marketplace browsing.
 *
 * The admin-ops route needs a logged-in WP session, so anonymous visitors
 * cannot use it. Public discovery only needs the display name (CCT 151 app
 * column, joined via relation 152) plus the public user record (slug/avatar).
 */
export async function fetchWPUserPublicProfile(id: number | string): Promise<{
  id: number;
  slug: string;
  avatar_url: string | null;
  full_name: string;
}> {
  const numeric = Number(String(id ?? "").replace(/^wp-/, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) throw new Error(\`Invalid WordPress user id: \${id}\`);
  // The user record goes through the ~25ms micro-batch queue, so N cards on one
  // screen share ONE \`wp/v2/users?include=\` request instead of N single reads.
  const [users, profile] = await Promise.all([
    fetchWPUsers([numeric]).catch(() => new Map<number, WPUserRecord>()),
    fetchAppProfileChild(numeric),
  ]);
  const user = users.get(numeric);

  const profileName = profile?.[APP_PROFILE_F.NAME];
  const displayName = typeof profileName === "string" ? profileName.trim() : "";
  return {
    id: numeric,
    slug: user?.slug || "",
    avatar_url: user?.avatar_url || null,
    // People who never filled in a display name still deserve a name on screen:
    // fall back to their WordPress account name, then their login slug.
    full_name: displayName || (user?.name || "").trim() || user?.slug || "",
  };

}
`;export{e as default};