/**
 * The user's display name for THIS app.
 *
 * Per the data dictionary the WordPress user login / display name is shared by
 * every app on this backend and must never be shown or written. Each app keeps
 * its own name column on JetEngine CCT 151 `users_extended_prof`:
 *   a55 afresh · a551 adry · a552 ablocked · a553 NRTlist ·
 *   a554 Smokelesslist · a555 BeNotch · a556 ChallengeD · a557 CareCNC
 * The row is linked to the user through JetEngine Relation 152 (one to one).
 */
import { wordpressCCTFetch, wordpressFetch } from "@/features/shared/wordpress-client";
import { getCurrentUserIdNumber } from "@/features/shared/current-user";
import { T, R } from "@/integrations/wp-schema";
import { appUserNameField } from "@/features/shared/app-scope";

const SLUG = T.userProfile.slug;
const REL_USER_PROFILE = R.userProfileRel;

async function findRow(): Promise<any | null> {
  const userId = getCurrentUserIdNumber();
  if (!userId) return null;
  const list = await wordpressCCTFetch<any[]>(SLUG, {
    params: { cct_author_id: userId, _limit: 1 },
  });
  return Array.isArray(list) && list.length > 0 ? list[0] : null;
}

/** Current user's name for the running app, or "" when it has not been set. */
export async function fetchMyAppUserName(): Promise<string> {
  const row = await findRow();
  const raw = row?.[appUserNameField()];
  return typeof raw === "string" ? raw.trim() : "";
}

/** Writes the name into this app's own column on CCT 151. */
export async function saveMyAppUserName(name: string): Promise<void> {
  const userId = getCurrentUserIdNumber();
  const body = { [appUserNameField()]: name };

  const row = await findRow();
  if (row) {
    await wordpressCCTFetch(SLUG, { id: String(row.id ?? row._ID), method: "PUT", body });
    return;
  }

  const created: any = await wordpressCCTFetch(SLUG, {
    method: "POST",
    body: { ...body, cct_author_id: String(userId ?? "") },
  });
  const newId = created?.item_id ?? created?._ID ?? created?.id;
  if (!newId || !userId) throw new Error("Could not create the extended profile row for the app user name");
  await wordpressFetch(`jet-rel/${REL_USER_PROFILE}`, {
    method: "POST",
    body: {
      parent_id: String(userId),
      child_id: String(newId),
      context: "child_object",
      store_items_type: "replace",
    },
  });
}
