import { supabase } from "@/integrations/supabase/client";

/** Calls same-origin React Router resource actions with the current app identities. */
export async function invokeServerAction<T = any>(name: string, data: unknown): Promise<T> {
  const wpToken = typeof window === "undefined" ? "" : window.localStorage.getItem("cc_wp_token") || "";
  let bearer = "";
  try {
    bearer = (await supabase.auth.getSession()).data.session?.access_token || "";
  } catch {
    // WordPress-backed actions can still authenticate using their existing WP token.
  }
  const headers = new Headers({ "Content-Type": "application/json" });
  if (wpToken) headers.set("X-WP-Token", wpToken);
  if (bearer || wpToken) headers.set("Authorization", `Bearer ${bearer || wpToken}`);

  const response = await fetch("/api/server-actions", {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify({ name, data }),
  });
  const result: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = result && typeof result === "object" && "error" in result
      ? String(result.error)
      : "The request could not be completed.";
    throw new Error(message);
  }
  return result as T;
}
