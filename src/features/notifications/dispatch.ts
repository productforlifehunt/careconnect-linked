/**
 * Single client entry point for sending a notification.
 *
 * Each app has exactly ONE notification edge function:
 *   ChallengeD → `challenged-notify`
 *   CareCNC    → `carecnc-notify`
 *   Notch Safety shares ChallengeD's data scope but carries its own brand.
 *
 * Those functions own every channel (in-app inbox row, web push, email, SMS)
 * and enforce the user's notification preferences, so the frontend never writes
 * a notification row directly and can never double-send.
 */
import { currentAppScope } from "@/features/shared/app-scope";
import { getWPToken } from "@/services/wp-auth";
import { detectSite } from "@/contexts/SiteContext";

export type NotifyChannel = "inbox" | "push" | "email" | "sms";

export interface NotifyInput {
  user_id: string | number;
  /** chat | booking | system | location | check_in | medicine */
  type: string;
  title: string;
  message: string;
  action_url?: string | null;
  email?: string | null;
  phone?: string | null;
  channels?: Partial<Record<NotifyChannel, boolean>>;
  idempotency_key?: string;
  /** Visual/email identity; data scope remains unchanged for shared backends. */
  brand?: "challenged" | "carecnc" | "notchsafety";
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

/** Resolve the notification function for the running app. */
export function notifyFunctionName(): "challenged-notify" | "carecnc-notify" {
  return currentAppScope() === "carecnc" ? "carecnc-notify" : "challenged-notify";
}

export async function sendNotification(input: NotifyInput | NotifyInput[]): Promise<boolean> {
  const fn = notifyFunctionName();
  const detected = detectSite();
  const brand = detected === "notchsafety" ? "notchsafety" : detected === "carecnc" ? "carecnc" : "challenged";
  const branded = (item: NotifyInput): NotifyInput => ({ ...item, brand });
  const payload = Array.isArray(input) ? { notifications: input.map(branded) } : branded(input);
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON_KEY,
        "x-wp-token": getWPToken() ?? "",
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}
