import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useMyProfile, usePost, useDeletePost, useUpdatePost, useToggleVote, useVoteCount } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { ArrowLeft, Loader2, MoreHorizontal, Pencil, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchForumNames } from "@/features/shared/wp-users";

function PostEditorDialog({
  open,
  onOpenChange,
  title,
  content,
  isZh,
  pending,
  onTitleChange,
  onContentChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  isZh: boolean;
  pending: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isZh ? "编辑帖子" : "Edit Post"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <Input placeholder={isZh ? "标题" : "Title"} value={title} onChange={(e) => onTitleChange(e.target.value)} />
          <Textarea placeholder={isZh ? "内容..." : "Content..."} value={content} onChange={(e) => onContentChange(e.target.value)} rows={8} />
          <Button onClick={onSubmit} disabled={pending} className="w-full" variant="coral">
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isZh ? "保存修改" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CommunityPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { data: profile } = useMyProfile();
  const communityPostType = "care_community_post";
  const { data: post, isLoading } = usePost(id || null, communityPostType);
  const deletePost = useDeletePost();
  const updatePost = useUpdatePost();
  const toggleVote = useToggleVote();
  const { data: voteState = { score: 0, upvotes: 0, downvotes: 0, userVote: 0 as -1 | 0 | 1 } } = useVoteCount("post", id || null);
  const isZh = i18n.language?.startsWith("zh");
  const dateLocale = isZh ? zhCN : enUS;

  const [editing, setEditing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // Forum name for this app only (CCT 151 a56).
  const { data: forumNames } = useQuery({
    queryKey: ["forumNames", [post?.author_id]],
    queryFn: () => fetchForumNames([post!.author_id]),
    enabled: !!post?.author_id,
    staleTime: 10 * 60 * 1000,
  });
  const authorForumName = post?.author_id ? forumNames?.get(Number(post.author_id)) || "" : "";

  const handleStartEdit = () => {
    if (!post) return;
    setEditTitle(post.title || "");
    setEditContent(post.content || "");
    setEditing(true);
  };

  const handleUpdate = () => {
    if (!post || !editTitle.trim() || !editContent.trim()) {
      toast({ title: isZh ? "请填写标题和内容" : "Please fill in title and content", variant: "destructive" });
      return;
    }
    updatePost.mutate(
      {
        id: post.id,
        title: editTitle.trim(),
        content: editContent.trim(),
      },
      {
        onSuccess: () => {
          setEditing(false);
          toast({ title: isZh ? "修改已保存" : "Post updated" });
        },
        onError: (err: any) => toast({ title: isZh ? "更新失败" : "Failed to update", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleDelete = () => {
    if (!post) return;
    deletePost.mutate(post.id, {
      onSuccess: () => {
        setConfirmDeleteOpen(false);
        toast({ title: isZh ? "已删除" : "Deleted" });
        navigate("/community");
      },
    });
  };

  return (
    <div className="container max-w-4xl mx-auto py-6 px-4 space-y-6">
      <PostEditorDialog
        open={editing}
        onOpenChange={setEditing}
        title={editTitle}
        content={editContent}
        isZh={isZh}
        pending={updatePost.isPending}
        onTitleChange={setEditTitle}
        onContentChange={setEditContent}
        onSubmit={handleUpdate}
      />

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isZh ? "删除帖子？" : "Delete post?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isZh ? "这会永久删除该帖子以及下面的讨论回复。" : "This will permanently delete this post and the discussion replies under it."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isZh ? "取消" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
              {isZh ? "删除" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" asChild className="px-0 hover:bg-transparent">
          <Link to="/community">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isZh ? "返回社区" : "Back to Community"}
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </CardContent>
        </Card>
      ) : !post ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {isZh ? "帖子不存在或已被删除" : "Post not found or deleted"}
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                {(authorForumName || post.author?.full_name || "?")[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-foreground">{authorForumName || post.author?.full_name || (isZh ? "未填姓名" : "No name")}</span>
                  <span className="text-[11px] text-muted-foreground ml-auto shrink-0">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: dateLocale })}
                  </span>
                </div>
                <h1 className="text-2xl font-semibold mt-2 text-foreground">{post.title}</h1>
              </div>
              {profile?.user_id === post.author_id ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="min-h-11 min-w-11 shrink-0" aria-label={isZh ? "帖子操作" : "Post actions"}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleStartEdit}>
                      <Pencil className="h-4 w-4 mr-2" />
                      {isZh ? "编辑" : "Edit"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setConfirmDeleteOpen(true)} className="text-destructive focus:text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isZh ? "删除" : "Delete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-base leading-7 text-foreground whitespace-pre-wrap">{post.content}</div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-2 ${voteState.userVote === 1 ? "text-primary" : "text-muted-foreground"}`}
                disabled={!isAuthenticated || toggleVote.isPending}
                onClick={() => toggleVote.mutate({ entityType: "post", entityId: post.id, value: 1 })}
              >
                <ThumbsUp className="h-4 w-4 mr-1.5" />
                {voteState.upvotes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-2 ${voteState.userVote === -1 ? "text-destructive" : "text-muted-foreground"}`}
                disabled={!isAuthenticated || toggleVote.isPending}
                onClick={() => toggleVote.mutate({ entityType: "post", entityId: post.id, value: -1 })}
              >
                <ThumbsDown className="h-4 w-4 mr-1.5" />
                {voteState.downvotes}
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                {isZh ? `总分 ${voteState.score}` : `Score ${voteState.score}`}
              </span>
              <span className="text-sm text-muted-foreground">
                {isZh ? "像传统论坛一样进入帖子页讨论" : "Full discussion page, like a classic forum"}
              </span>
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{isZh ? "讨论" : "Discussion"}</h2>
                <p className="text-sm text-muted-foreground">{isZh ? "支持回复、编辑、删除、赞成、反对和取消投票" : "Replies support create, edit, delete, upvote, downvote, and unvote."}</p>
              </div>
              <CommentsSection entityType="community_post" entityId={post.id} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
