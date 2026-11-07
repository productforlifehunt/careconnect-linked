var e=`import { createClient } from "@supabase/supabase-js";
import { bytesToBase64 } from "./provider.server";
const BUCKET = "family-voice-audio";
export function privateAudio(url: string, key: string) {
  if (!url || !key) throw new Error("Private voice audio storage is not configured");
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_") && headers.get("Authorization") === \`Bearer \${key}\`) headers.delete("Authorization");
    headers.set("apikey", key); return fetch(input, { ...init, headers });
  } } });
  return {
    async save(path: string, base64: string, mime: string) {
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const { error } = await client.storage.from(BUCKET).upload(path, bytes, { contentType: mime, upsert: false });
      if (error) throw new Error("Original recording was not saved. / 原始录音未能保存。");
    },
    async read(path: string) {
      if (!path || !path.startsWith("recordings/")) throw new Error("No original recording / 没有原始录音");
      const { data, error } = await client.storage.from(BUCKET).download(path);
      if (error || !data) throw new Error("Original recording could not be read");
      return bytesToBase64(new Uint8Array(await data.arrayBuffer()));
    },
    async remove(path: string) { if (!path) return; const { error } = await client.storage.from(BUCKET).remove([path]); if (error) throw new Error("Recording was not deleted"); },
  };
}`;export{e as default};