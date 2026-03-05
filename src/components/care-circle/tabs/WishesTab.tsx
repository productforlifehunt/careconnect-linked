import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { PostActions } from "../PostActions";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useToast } from "@/hooks/use-toast";

interface WishesTabProps {
  wishes: any[];
  activeGroupId: string | null;
  userId: string | undefined;
  isAdmin: boolean;
  createPost: any;
  onEditPost: (post: any) => void;
  onTogglePin: (post: any) => void;
  onDeletePost: (id: string) => void;
}

export function WishesTab({ wishes, activeGroupId, userId, isAdmin, createPost, onEditPost, onTogglePin, onDeletePost }: WishesTabProps) {
  const { toast } = useToast();
  const [content, setContent] = useState("");

  return (
    <div>
      <Card className="border-transparent card-elevated mb-4">
        <CardContent className="p-4">
          <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Send words of encouragement..." rows={2} className="mb-3" />
          <Button variant="coral" size="sm" onClick={() => {
            if (!content.trim() || !activeGroupId) return;
            createPost.mutate({ group_id: activeGroupId, content, type: "wish" }, {
              onSuccess: () => { setContent(""); toast({ title: "Wish sent! 💛" }); },
            });
          }} disabled={!content.trim() || createPost.isPending}><Star className="h-3.5 w-3.5 mr-1" /> Send Wish</Button>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {(wishes || []).map((w: any) => (
          <Card key={w.id} className="border-transparent card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-warning" />
                <span className="font-medium text-sm text-foreground">{w.author?.full_name || "Someone"}</span>
                <span className="text-xs text-muted-foreground ml-auto">{new Date(w.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                <PostActions post={w} userId={userId} isAdmin={isAdmin} onEdit={onEditPost} onTogglePin={onTogglePin} onDelete={onDeletePost} />
              </div>
              <p className="text-sm text-muted-foreground">{w.content}</p>
              <CommentsSection entityType="post" entityId={w.id} compact />
            </CardContent>
          </Card>
        ))}
        {(wishes || []).length === 0 && <p className="text-center py-12 text-muted-foreground">No well wishes yet. Be the first!</p>}
      </div>
    </div>
  );
}
