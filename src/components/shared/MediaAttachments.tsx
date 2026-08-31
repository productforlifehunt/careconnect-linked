import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, X, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { uploadWPMediaBatch, resolveWPMedia, type WPMediaItem } from "@/lib/wp-media";
import { useToast } from "@/hooks/use-toast";

interface MediaAttachmentsProps {
  /** Currently selected WP media IDs. */
  value: number[];
  onChange: (ids: number[]) => void;
  /** File input accept string. Defaults to images only. */
  accept?: string;
  label?: string;
  disabled?: boolean;
}

/**
 * Multi-file picker backed by the WordPress media library.
 * Uploads immediately and hands back the media IDs, which JetEngine
 * Gallery fields store as a comma-separated list.
 */
export function MediaAttachments({ value, onChange, accept = "image/*", label, disabled }: MediaAttachmentsProps) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<WPMediaItem[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let alive = true;
    if (value.length === 0) { setItems([]); return; }
    resolveWPMedia(value).then((res) => { if (alive) setItems(res); });
    return () => { alive = false; };
  }, [value.join(",")]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await uploadWPMediaBatch(Array.from(files));
      onChange([...value, ...uploaded.map((u) => u.id)]);
    } catch (e: any) {
      toast({ title: Z("上传失败", "Upload failed"), description: e?.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" variant="outline" disabled={disabled || uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1.5" />}
          {label || Z("上传文件", "Upload files")}
        </Button>
        <span className="text-xs text-muted-foreground">
          {value.length > 0 ? Z(`已选 ${value.length} 个`, `${value.length} selected`) : Z("可多选", "Multiple allowed")}
        </span>
        <input ref={inputRef} type="file" multiple accept={accept} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((m) => (
            <div key={m.id} className="relative rounded-md border overflow-hidden bg-muted/40">
              {m.isImage ? (
                <img src={m.url} alt={m.name} className="h-16 w-16 object-cover" />
              ) : (
                <a href={m.url} target="_blank" rel="noopener" className="h-16 w-24 flex flex-col items-center justify-center gap-1 px-1">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">{m.name}</span>
                </a>
              )}
              <button
                type="button"
                className="absolute top-0.5 right-0.5 rounded-full bg-background/80 p-0.5 text-destructive"
                onClick={() => onChange(value.filter((id) => id !== m.id))}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Read-only thumbnail strip for stored media IDs. */
export function MediaAttachmentList({ ids }: { ids: number[] }) {
  const [items, setItems] = useState<WPMediaItem[]>([]);
  useEffect(() => {
    let alive = true;
    if (!ids || ids.length === 0) { setItems([]); return; }
    resolveWPMedia(ids).then((res) => { if (alive) setItems(res); });
    return () => { alive = false; };
  }, [(ids || []).join(",")]);

  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {items.map((m) => (
        <a key={m.id} href={m.url} target="_blank" rel="noopener" className="rounded border overflow-hidden">
          {m.isImage ? (
            <img src={m.url} alt={m.name} className="h-12 w-12 object-cover" />
          ) : (
            <span className="h-12 px-2 flex items-center gap-1 text-[10px] text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />{m.name}
            </span>
          )}
        </a>
      ))}
    </div>
  );
}
