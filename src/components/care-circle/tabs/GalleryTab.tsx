import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Trash2, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useTranslation } from "react-i18next";
import {
  createCareGroupGalleryItemWordPress,
  deleteCareGroupGalleryItemWordPress,
  uploadToWPMedia,
} from "@/features/care-groups/source.wordpress-extended";

function GalleryUploadForm({ groupId }: { groupId: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!file || !groupId) return;
    setSaving(true);
    try {
      const mediaId = await uploadToWPMedia(file);
      await createCareGroupGalleryItemWordPress(groupId, mediaId, caption.trim());
      setFile(null); setCaption("");
      if (fileRef.current) fileRef.current.value = "";
      toast({ title: Z("照片已添加！", "Photo added!") });
      qc.invalidateQueries({ queryKey: ["careGroupGallery"] });
    } catch (e: any) {
      toast({ title: Z("添加照片失败", "Failed to add photo"), description: e.message || Z("请稍后再试", "Please try again later"), variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{Z("添加照片", "Add a Photo")}</p>
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          {file ? Z("更换", "Change") : Z("选择图片", "Choose image")}
        </Button>
        <span className="text-xs text-muted-foreground truncate flex-1">
          {file ? file.name : Z("尚未选择文件", "No file chosen")}
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <div className="flex gap-2">
        <Input value={caption} onChange={e => setCaption(e.target.value)} placeholder={Z("说明（可选）", "Caption (optional)")} className="flex-1" />
        <Button size="sm" variant="coral" onClick={handleAdd} disabled={saving || !file}>
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : Z("添加", "Add")}
        </Button>
      </div>
    </div>
  );
}

interface GalleryTabProps {
  gallery: any[];
  activeGroupId: string | null;
}

export function GalleryTab({ gallery, activeGroupId }: GalleryTabProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);

  return (
    <div>
      <Card className="border-transparent card-elevated mb-4">
        <CardContent className="p-4">
          <GalleryUploadForm groupId={activeGroupId!} />
        </CardContent>
      </Card>
      {(gallery || []).length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {(gallery || []).map((img: any) => (
            <Card key={img.id} className="border-transparent card-elevated overflow-hidden group relative">
              {img.image_url ? (
                <img src={img.image_url} alt={img.caption || ""} className="w-full aspect-square object-cover" />
              ) : (
                <div className="w-full aspect-square bg-muted flex items-center justify-center">
                  <Image className="h-8 w-8 text-muted-foreground/40" />
                </div>
              )}
              <button
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-full p-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={async () => {
                  try {
                    await deleteCareGroupGalleryItemWordPress(img.id);
                    toast({ title: Z("照片已删除", "Photo removed") });
                    qc.invalidateQueries({ queryKey: ["careGroupGallery"] });
                  } catch (e: any) {
                    toast({ title: Z("删除失败", "Failed to remove"), description: e.message, variant: "destructive" });
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              {img.caption && <CardContent className="p-2"><p className="text-xs text-muted-foreground truncate">{img.caption}</p></CardContent>}
              <CardContent className="p-2 pt-0">
                <CommentsSection entityType="gallery" entityId={img.id} compact />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Image className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">{Z("暂无照片。请在上方上传图片！", "No photos yet. Upload an image above!")}</p>
        </div>
      )}
    </div>
  );
}
