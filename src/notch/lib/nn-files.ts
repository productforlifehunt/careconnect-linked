/**
 * Notch Note — file uploads via Supabase Storage bucket `nn-files`.
 * Bucket is private but readable via public URL policy; we return
 * the public URL for embedding directly.
 */
import { supabase } from "@/integrations/supabase/client";

export async function nnUploadFile(file: File, userId: string | number): Promise<{ url: string; path: string; name: string; size: number; type: string; }> {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const safeExt = (ext || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `u${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
  const { error } = await supabase.storage.from("nn-files").upload(path, file, {
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });
  if (error) throw error;
  const { data: signed, error: sErr } = await supabase.storage.from("nn-files").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (sErr) throw sErr;
  return { url: signed.signedUrl, path, name: file.name, size: file.size, type: file.type };
}

export function pickFile(accept?: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    if (accept) input.accept = accept;
    input.onchange = () => resolve(input.files?.[0] || null);
    input.click();
  });
}
