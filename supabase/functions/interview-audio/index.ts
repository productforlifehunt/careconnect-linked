/**
 * Interview recordings (private file storage). Researcher only.
 * Actions: list, upload_url, play_url. Nothing is ever deleted here.
 */
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { isResearcher } from "../_shared/wp-researcher.ts";

const BUCKET = "interview-audio";
const headers = { ...corsHeaders, "Access-Control-Allow-Headers": `${corsHeaders["Access-Control-Allow-Headers"]}, x-wp-token` };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...headers, "Content-Type": "application/json" } });

  if (!(await isResearcher(req))) return json({ error: "Only the researcher account can use interview recordings." }, 403);

  let body: { action?: string; name?: string; path?: string };
  try { body = await req.json(); } catch { return json({ error: "Invalid request" }, 400); }

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const store = admin.storage.from(BUCKET);

  if (body.action === "list") {
    const { data, error } = await store.list("", { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
    if (error) return json({ error: error.message }, 500);
    return json({
      items: (data || []).filter((f) => f.id).map((f) => ({
        path: f.name,
        size: (f.metadata as any)?.size ?? 0,
        type: (f.metadata as any)?.mimetype ?? "",
        created: f.created_at,
      })),
    });
  }

  if (body.action === "upload_url") {
    const name = String(body.name || "").trim();
    if (!name || name.length > 200) return json({ error: "A file name is required." }, 400);
    const safe = name.replace(/[^\p{L}\p{N}._-]+/gu, "_");
    const path = `${Date.now()}_${safe}`;
    const { data, error } = await store.createSignedUploadUrl(path);
    if (error) return json({ error: error.message }, 500);
    return json({ path, token: data.token });
  }

  if (body.action === "play_url") {
    const path = String(body.path || "");
    if (!path || path.includes("/")) return json({ error: "Invalid recording" }, 400);
    const { data, error } = await store.createSignedUrl(path, 60 * 60 * 6);
    if (error) return json({ error: error.message }, 404);
    return json({ url: data.signedUrl });
  }

  return json({ error: "Unknown action" }, 400);
});
