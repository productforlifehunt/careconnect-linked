import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSite } from "@/contexts/SiteContext";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListTodo, Users, Heart } from "lucide-react";
import { PostActions } from "../PostActions";
import { VisibilityPicker, EMPTY_VISIBILITY, type VisibilityValue } from "../VisibilityPicker";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface HomeTabProps {
  pendingTasksCount: number;
  membersCount: number;
  caredOnesCount: number;
  allPosts: any[];
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

export function HomeTab({
  pendingTasksCount, membersCount, caredOnesCount,
  allPosts, activeGroupId, userId, isAdmin, memberCategories, members,
  createPost, onEditPost, onTogglePin, onDeletePost,
}: HomeTabProps) {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const site = useSite();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("discussion");
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<VisibilityValue>(EMPTY_VISIBILITY);

  const addPost = () => {
    if (!content.trim() || !activeGroupId) return;
    createPost.mutate(
      {
        group_id: activeGroupId,
        content,
        type: postType,
        title: title || undefined,
        subgroupIds: visibility.subgroupIds,
        visibilityUserIds: visibility.userIds,
      },
      {
        onSuccess: () => {
          setContent(""); setTitle(""); setVisibility(EMPTY_VISIBILITY);
          toast({ title: "Posted!" });
        },
      }
    );
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        {[
          { label: isCN ? "待办任务" : "Pending Tasks", value: pendingTasksCount, icon: ListTodo },
          { label: isCN ? "成员" : "Members", value: membersCount, icon: Users },
          { label: isCN ? "亲人" : site.navLabels.caredOnes, value: caredOnesCount, icon: Heart },
        ].map(s => (
          <Card key={s.label} className="border-transparent card-elevated">
            <CardContent className="p-3 sm:p-4 flex items-center gap-2">
              <s.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
              <div className="min-w-0"><p className="text-base sm:text-xl font-bold text-foreground leading-tight">{s.value}</p><p className="text-[11px] sm:text-xs text-muted-foreground truncate">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-transparent card-elevated mb-6">
        <CardContent className="p-4">
          <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder={isCN ? "与团队分享一条更新…" : "Share an update with your care team..."} className="mb-3" rows={2} />
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="discussion">{isCN ? "讨论" : "Discussion"}</SelectItem>
                  <SelectItem value="announcement">{isCN ? "公告" : "Announcement"}</SelectItem>
                  <SelectItem value="wish">{isCN ? "祝福" : "Well Wish"}</SelectItem>
                </SelectContent>
              </Select>
              <VisibilityPicker value={visibility} onChange={setVisibility} memberCategories={memberCategories} members={members} />
            </div>
            <Button variant="coral" size="sm" onClick={addPost} disabled={!content.trim() || createPost.isPending}>{isCN ? "发布" : "Post"}</Button>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {(allPosts || []).slice(0, 5).map((p: any) => (
          <Card key={p.id} className="border-transparent card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">{(p.author?.full_name || "?")[0]}</div>
                <span className="text-sm font-medium text-foreground">{p.author?.full_name || "Member"}</span>
                <Badge variant="outline" className="text-xs ml-auto">{p.type}</Badge>
                <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                <PostActions post={p} userId={userId} isAdmin={isAdmin} onEdit={onEditPost} onTogglePin={onTogglePin} onDelete={onDeletePost} />
              </div>
              {p.title && <p className="font-medium text-sm text-foreground mb-1">{p.title}</p>}
              <p className="text-sm text-muted-foreground">{p.content}</p>
              <CommentsSection entityType="post" entityId={p.id} compact />
            </CardContent>
          </Card>
        ))}
        {(allPosts || []).length === 0 && <p className="text-center py-8 text-muted-foreground">{isCN ? "还没有动态。在上方分享第一条吧！" : "No posts yet. Share an update above!"}</p>}
      </div>
    </div>
  );
}
