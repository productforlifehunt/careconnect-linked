/**
 * CareCNC (忆畅) — the ONE notification endpoint for this app.
 * Every CareCNC in-app / push / email / SMS message is dispatched here.
 */
import { dispatch, type NotifyRequest } from "../_shared/notify-core.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-wp-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function bad(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return bad("Use POST", 405);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON body");
  }

  const items: NotifyRequest[] = Array.isArray(body?.notifications) ? body.notifications : [body];
  for (const item of items) {
    if (!item || item.user_id === undefined || item.user_id === null || item.user_id === "") {
      return bad("user_id is required");
    }
    if (typeof item.title !== "string" || item.title.trim() === "") return bad("title is required");
    if (typeof item.message !== "string") return bad("message must be a string");
    if (item.title.length > 255) return bad("title too long");
    if (item.message.length > 5000) return bad("message too long");
  }

  const wpToken =
    req.headers.get("x-wp-token") ??
    (req.headers.get("authorization")?.startsWith("Bearer ")
      ? req.headers.get("authorization")!.slice(7)
      : null);

  try {
    const results = [];
    for (const item of items) results.push(await dispatch("carecnc", item, wpToken));
    return new Response(JSON.stringify({ app: "carecnc", results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
