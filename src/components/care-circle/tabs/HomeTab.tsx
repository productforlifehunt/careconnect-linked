import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSite } from "@/contexts/SiteContext";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListTodo, Users, Heart } from "lucide-react";
import { PostActions, VisibilitySelect } from "../PostActions";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface HomeTabProps {
  pendingTasksCount: number;
  membersCount: number;
  caredOnesCount: number;
  allPosts: any[];
  activeGroupId: string | null;
  userId: string | undefined;
  isAdmin: boolean;
  memberCategories: any[];
  createPost: any;
  onEditPost: (post: any) => void;
  onTogglePin: (post: any) => void;
  onDeletePost: (id: string) => void;
}

export function HomeTab({
  pendingTasksCount, membersCount, caredOnesCount,
  allPosts, activeGroupId, userId, isAdmin, memberCategories,
  createPost, onEditPost, onTogglePin, onDeletePost,
}: HomeTabProps) {
  const { toast } = useToast();
  const site = useSite();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("discussion");
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("group");

  const addPost = () => {
    if (!content.trim() || !activeGroupId) return;
    createPost.mutate({ group_id: activeGroupId, content, type: postType, title: title || undefined, visibility }, {
      onSuccess: () => { setContent(""); setTitle(""); setVisibility("group"); toast({ title: "Posted!" }); },
    });
  };

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pending Tasks", value: pendingTasksCount, icon: ListTodo },
          { label: "Members", value: membersCount, icon: Users },
          { label: site.navLabels.caredOnes, value: caredOnesCount, icon: Heart },
        ].map(s => (
          <Card key={s.label} className="border-transparent card-elevated">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className="h-5 w-5 text-primary" />
              <div><p className="text-xl font-bold text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-transparent card-elevated mb-6">
        <CardContent className="p-4">
          <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Share an update with your care team..." className="mb-3" rows={2} />
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-2">
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="discussion">Discussion</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="wish">Well Wish</SelectItem>
                </SelectContent>
              </Select>
              <VisibilitySelect value={visibility} onChange={setVisibility} memberCategories={memberCategories} />
            </div>
            <Button variant="coral" size="sm" onClick={addPost} disabled={!content.trim() || createPost.isPending}>Post</Button>
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
            </CardContent>
          </Card>
        ))}
        {(allPosts || []).length === 0 && <p className="text-center py-8 text-muted-foreground">No posts yet. Share an update above!</p>}
      </div>
    </div>
  );
}
