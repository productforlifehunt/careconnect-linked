import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { uploadWPMedia } from "@/lib/wp-media";

interface MessageAttachmentProps {
  onAttach: (url: string, type: "image" | "file", name?: string) => void;
  disabled?: boolean;
}

/**
 * Real attachment picker: opens the device's photo library / files chooser
 * (camera on phones), uploads to the WordPress media library and hands back a
 * usable URL. No URL typing — caregivers are not expected to know what a URL is.
 */
export function MessageAttachment({ onAttach, disabled }: MessageAttachmentProps) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const media = await uploadWPMedia(file);
      onAttach(media.url, media.isImage ? "image" : "file", media.name || file.name);
    } catch {
      toast({
        title: Z("没能添加这个文件", "Couldn't add that file"),
        description: Z("请再试一次，或选择小一点的照片。", "Please try again, or pick a smaller photo."),
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="min-h-11 min-w-11 shrink-0"
        disabled={disabled || uploading}
        title={Z("添加照片或文件", "Add a photo or file")}
        aria-label={Z("添加照片或文件", "Add a photo or file")}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </>
  );
}
