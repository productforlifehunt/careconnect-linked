import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pin, Megaphone } from "lucide-react";
import { PostActions } from "../PostActions";
import { VisibilityPicker, EMPTY_VISIBILITY, type VisibilityValue } from "../VisibilityPicker";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useToast } from "@/hooks/use-toast";

interface AnnouncementsTabProps {
  announcements: any[];
  activeGroupId: string | null;
  userId: string | undefined;
  isAdmin: boolean;
  memberCategories: any[];
  members?: any[];
  createPost: any;
  onEditPost: (post: any) => void;
  onTogglePin: (post: any) => void;
  onDeletePost: (id: string) => void;
}

export function AnnouncementsTab({
  announcements, activeGroupId, userId, isAdmin, memberCategories, members,
  createPost, onEditPost, onTogglePin, onDeletePost,
}: AnnouncementsTabProps) {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<VisibilityValue>(EMPTY_VISIBILITY);

  return (
    <div>
      {isAdmin && (
        <Card className="border-transparent card-elevated mb-4">
          <CardContent className="p-4">
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title..." className="mb-2" />
            <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write an announcement..." className="mb-3" rows={2} />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <VisibilityPicker value={visibility} onChange={setVisibility} memberCategories={memberCategories} members={members} />
              <Button variant="coral" size="sm" onClick={() => {
                if (!content.trim() || !activeGroupId) return;
                createPost.mutate(
                  {
                    group_id: activeGroupId,
                    content,
                    type: "announcement",
                    title: title || undefined,
                    subgroupIds: visibility.subgroupIds,
                    visibilityUserIds: visibility.userIds,
                  },
                  {
                    onSuccess: () => {
                      setContent(""); setTitle(""); setVisibility(EMPTY_VISIBILITY);
                      toast({ title: "Announcement posted!" });
                    },
                  }
                );
              }} disabled={!content.trim() || createPost.isPending}>
                <Megaphone className="h-3.5 w-3.5 mr-1" /> Post
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="space-y-3">
        {(announcements || []).map((a: any) => (
          <Card key={a.id} className={`border-transparent card-elevated ${a.is_pinned ? "border-l-4 border-l-primary" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {a.is_pinned && <Pin className="h-3.5 w-3.5 text-primary" />}
                <span className="text-sm font-medium text-foreground">{a.author?.full_name || "Admin"}</span>
                <span className="text-xs text-muted-foreground ml-auto">{new Date(a.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                <PostActions post={a} userId={userId} isAdmin={isAdmin} onEdit={onEditPost} onTogglePin={onTogglePin} onDelete={onDeletePost} />
              </div>
              {a.title && <h4 className="font-semibold text-foreground mb-1">{a.title}</h4>}
              <p className="text-sm text-muted-foreground">{a.content}</p>
              <CommentsSection entityType="post" entityId={a.id} compact />
            </CardContent>
          </Card>
        ))}
        {(announcements || []).length === 0 && <p className="text-center py-12 text-muted-foreground">No announcements yet.</p>}
      </div>
    </div>
  );
}
