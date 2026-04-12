import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { createCareGroupGalleryItemWordPress, deleteCareGroupGalleryItemWordPress } from "@/features/care-groups/source.wordpress-extended";

function GalleryUploadForm({ groupId }: { groupId: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const handleAdd = async () => {
    if (!url.trim() || !groupId || !user?.id) return;
    setSaving(true);
    try {
      await createCareGroupGalleryItemWordPress(groupId, url.trim(), caption.trim());
      setUrl(""); setCaption("");
      toast({ title: "Photo added!" });
      qc.invalidateQueries({ queryKey: ["care-group-gallery"] });
    } catch (e: any) {
      toast({ title: "Failed to add photo", description: e.message || "Please try again later", variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">Add a Photo</p>
      <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="Image URL (e.g. https://...)" />
      <div className="flex gap-2">
        <Input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption (optional)" className="flex-1" />
        <Button size="sm" variant="coral" onClick={handleAdd} disabled={saving || !url.trim()}>
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : "Add"}
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
              <img src={img.image_url} alt={img.caption || ""} className="w-full aspect-square object-cover" />
              <button
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded-full p-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={async () => {
                  try {
                    await deleteCareGroupGalleryItemWordPress(img.id);
                    toast({ title: "Photo removed" });
                    qc.invalidateQueries({ queryKey: ["care-group-gallery"] });
                  } catch (e: any) {
                    toast({ title: "Failed to remove", description: e.message, variant: "destructive" });
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
          <p className="text-muted-foreground">No photos yet. Add an image URL above!</p>
        </div>
      )}
    </div>
  );
}
