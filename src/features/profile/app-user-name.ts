/**
 * The user's display name for THIS app.
 *
 * Stored as column a55 on the user's single JetEngine CCT 151
 * `users_extended_prof` row for this app (a01), linked through Relation 152.
 * The WordPress user login / display name is shared by every app on this
 * backend and is never shown or written.
 *
 * The implementation lives in features/shared/app-profile.ts — this file only
 * keeps the historical import path.
 */
export { fetchMyAppUserName, saveMyAppUserName } from "@/features/shared/app-profile";
