import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { PostActions } from "../PostActions";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { formatDate, formatTime, formatDateTime } from "@/lib/locale";

interface WishesTabProps {
  wishes: any[];
  wishesLoading?: boolean;
  activeGroupId: string | null;
  userId: string | undefined;
  isAdmin: boolean;
  createPost: any;
  onEditPost: (post: any) => void;
  onTogglePin: (post: any) => void;
  onDeletePost: (id: string) => void;
}

export function WishesTab({ wishes, wishesLoading, activeGroupId, userId, isAdmin, createPost, onEditPost, onTogglePin, onDeletePost }: WishesTabProps) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const [content, setContent] = useState("");

  return (
    <div>
      <Card className="border-transparent card-elevated mb-4">
        <CardContent className="p-4">
          <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder={Z("发送鼓励与祝福……", "Send words of encouragement...")} rows={2} className="mb-3" />
          <Button variant="coral" size="sm" onClick={() => {
            if (!content.trim() || !activeGroupId) return;
            createPost.mutate({ group_id: activeGroupId, content, type: "wish" }, {
              onSuccess: () => { setContent(""); toast({ title: Z("祝福已送达！💛", "Wish sent! 💛") }); },
            });
          }} disabled={!content.trim() || createPost.isPending}><Star className="h-3.5 w-3.5 mr-1" /> {Z("送出祝福", "Send Wish")}</Button>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {(wishes || []).map((w: any) => (
          <Card key={w.id} className="border-transparent card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-warning" />
                <span className="font-medium text-sm text-foreground">{w.author?.full_name || Z("某成员", "Someone")}</span>
                <span className="text-xs text-muted-foreground ml-auto">{formatDate(w.created_at, isCN ? "zh-CN" : "en", { month: "short", day: "numeric" })}</span>
                <PostActions post={w} userId={userId} isAdmin={isAdmin} onEdit={onEditPost} onTogglePin={onTogglePin} onDelete={onDeletePost} />
              </div>
              <p className="text-sm text-muted-foreground">{w.content}</p>
              <CommentsSection entityType="post" entityId={w.id} compact />
            </CardContent>
          </Card>
        ))}
        {wishesLoading && (wishes || []).length === 0 && (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        )}
        {!wishesLoading && (wishes || []).length === 0 && <p className="text-center py-12 text-muted-foreground">{Z("还没有祝福，来做第一个吧！", "No well wishes yet. Be the first!")}</p>}
      </div>
    </div>
  );
}
