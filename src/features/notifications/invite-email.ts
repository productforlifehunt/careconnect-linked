/**
 * Emails a care-group invite link to an address that does not belong to an app
 * user yet. Registered app users receive the same link as an in-app
 * notification instead, so this path is only for outside addresses.
 *
 * The email travels through the app's single notification edge function
 * (challenged-notify / carecnc-notify) with the email channel forced on and the
 * inbox/push channels off — there is no inbox row to write for a stranger.
 */
import { currentAppScope } from "@/features/shared/app-scope";
import { getWPToken } from "@/services/wp-auth";

const SUPABASE_URL = import.meta.env["VITE_SUPABASE_URL"] || "";
const ANON_KEY = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || "";

export async function sendGroupInviteEmail(
  email: string,
  groupName: string,
  inviteUrl: string,
  joinCode?: string | undefined,
): Promise<boolean> {
  const address = (email || "").trim();
  if (!address.includes("@")) return false;
  const fn = currentAppScope() === "carecnc" ? "carecnc-notify" : "challenged-notify";
  const name = groupName || "";
  // The join code is written in the email text, never inside the link.
  const code = String(joinCode || "").trim();
  const codeLine = code
    ? ` After opening it, enter the join code: ${code}`
    : " After opening it, tap \u201cAsk to join\u201d and an admin will let you in.";
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
        "x-wp-token": getWPToken() ?? "",
      },
      body: JSON.stringify({
        user_id: 0,
        type: "system",
        title: name ? `Invitation to join ${name}` : "Care group invitation",
        message: (name
          ? `You have been invited to join the care group "${name}". Open this link: ${inviteUrl}.`
          : `You have been invited to join a care group. Open this link: ${inviteUrl}.`) + codeLine,
        action_url: inviteUrl,
        email: address,
        channels: { inbox: false, push: false, email: true },
      }),
    });
    if (!res.ok) return false;
    const body = await res.json().catch(() => null);
    const result = body?.result?.email ?? body?.email;
    return result ? result === "sent" : true;
  } catch {
    return false;
  }
}
