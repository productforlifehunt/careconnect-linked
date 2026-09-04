import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts, useCreatePost, useDeletePost, useMyProfile, useToggleVote, useUpdatePost, useVoteSummary } from "@/hooks/use-care-data";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MessageSquare, Loader2, Newspaper, MoreHorizontal, Pencil, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";

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
          <Input
            placeholder={isZh ? "标题" : "Title"}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
          />
          <Textarea
            placeholder={isZh ? "内容..." : "Content..."}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            rows={6}
          />
          <Button onClick={onSubmit} disabled={pending} className="w-full" variant="coral">
            {pending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isZh ? "保存修改" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Community() {
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { data: profile } = useMyProfile();
  const isZh = i18n.language?.startsWith("zh");
  const area = isZh ? "china" : "global";
  const communityPostType = "care_community_post";
  const dateLocale = isZh ? zhCN : enUS;

  const [postScope, setPostScope] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [pendingDeletePost, setPendingDeletePost] = useState<any | null>(null);

  const { data: posts, isLoading } = usePosts(communityPostType, area);
  const createPost = useCreatePost();
  const deletePost = useDeletePost();
  const updatePost = useUpdatePost();
  const toggleVote = useToggleVote();

  const handleCreate = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast({ title: isZh ? "请填写标题和内容" : "Please fill in title and content", variant: "destructive" });
      return;
    }
    createPost.mutate(
      { title: newTitle.trim(), content: newContent.trim(), postType: communityPostType, area },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setNewTitle("");
          setNewContent("");
          toast({ title: isZh ? "发布成功" : "Post created" });
        },
        onError: (err: any) => toast({ title: isZh ? "发布失败" : "Failed", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: string) => {
    deletePost.mutate(id, {
      onSuccess: () => {
        setPendingDeletePost(null);
        toast({ title: isZh ? "已删除" : "Deleted" });
      },
    });
  };

  const filteredPosts = (posts || []).filter((p: any) => {
    if (postScope === "mine") return p.author_id === profile?.user_id;
    return true;
  });
  const postIds = useMemo(() => (filteredPosts || []).map((p: any) => p.id), [filteredPosts]);
  const { data: voteSummary = {} } = useVoteSummary("post", postIds);

  const handleStartEdit = (post: any) => {
    setEditingPost(post);
    setEditTitle(post.title || "");
    setEditContent(post.content || "");
  };

  const handleUpdate = () => {
    if (!editingPost || !editTitle.trim() || !editContent.trim()) {
      toast({ title: isZh ? "请填写标题和内容" : "Please fill in title and content", variant: "destructive" });
      return;
    }
    updatePost.mutate(
      {
        id: editingPost.id,
        title: editTitle.trim(),
        content: editContent.trim(),
      },
      {
        onSuccess: () => {
          setEditingPost(null);
          toast({ title: isZh ? "修改已保存" : "Post updated" });
        },
        onError: (err: any) => toast({ title: isZh ? "更新失败" : "Failed to update", description: err.message, variant: "destructive" }),
      }
    );
  };

  return (
    <div className="container max-w-4xl mx-auto py-5 px-4 space-y-5">
      <PostEditorDialog
        open={!!editingPost}
        onOpenChange={(open) => { if (!open) setEditingPost(null); }}
        title={editTitle}
        content={editContent}
        isZh={isZh}
        pending={updatePost.isPending}
        onTitleChange={setEditTitle}
        onContentChange={setEditContent}
        onSubmit={handleUpdate}
      />

      <AlertDialog open={!!pendingDeletePost} onOpenChange={(open) => { if (!open) setPendingDeletePost(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isZh ? "删除帖子？" : "Delete post?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isZh ? "这会永久删除该帖子以及下面的讨论回复。" : "This will permanently delete this post and the discussion replies under it."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isZh ? "取消" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => pendingDeletePost && handleDelete(pendingDeletePost.id)}
            >
              {isZh ? "删除" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isZh ? "社区" : "Community"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isZh ? "分享经验、获取建议、互相支持" : "Share experiences, get advice, support each other"}
          </p>
        </div>
        {isAuthenticated && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="coral">
                <Plus className="h-4 w-4 mr-1" />
                {isZh ? "发帖" : "New Post"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{isZh ? "发布新帖" : "Create New Post"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <Input
                  placeholder={isZh ? "标题" : "Title"}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <Textarea
                  placeholder={isZh ? "内容..." : "Content..."}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={5}
                />
                <Button onClick={handleCreate} disabled={createPost.isPending} className="w-full" variant="coral">
                  {createPost.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isZh ? "发布" : "Publish"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Tabs value={postScope} onValueChange={setPostScope}>
        <div className="flex items-center gap-3 flex-wrap">
          <TabsList>
            <TabsTrigger value="all">{isZh ? "全部帖子" : "All Posts"}</TabsTrigger>
            <TabsTrigger value="mine">{isZh ? "我的帖子" : "My Posts"}</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      {/* Posts */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>{isZh ? "暂无帖子" : "No posts yet"}</p>
            {isAuthenticated && (
              <Button variant="outline" className="mt-3" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                {isZh ? "成为第一个发帖的人" : "Be the first to post"}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post: any) => (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                    {(post.author?.full_name || "?")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">
                        {post.author?.full_name || (isZh ? "未填姓名" : "No name")}
                      </span>
                      <span className="text-[11px] text-muted-foreground ml-auto shrink-0">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: dateLocale })}
                      </span>
                    </div>
                    <Link to={`/community/${post.id}`} className="block hover:opacity-90 transition-opacity">
                      <h3 className="text-base font-semibold mt-1 text-foreground">{post.title}</h3>
                    </Link>
                  </div>
                  {profile?.user_id === post.author_id ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="min-h-11 min-w-11 shrink-0" aria-label={isZh ? "帖子操作" : "Post actions"}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStartEdit(post)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          {isZh ? "编辑" : "Edit"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPendingDeletePost(post)} className="text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {isZh ? "删除" : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 rounded-full px-3 ${voteSummary[post.id]?.userVote === 1 ? "text-primary" : "text-muted-foreground"}`}
                    disabled={!isAuthenticated || toggleVote.isPending}
                    onClick={() => toggleVote.mutate({ entityType: "post", entityId: post.id, value: 1 })}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1.5" />
                    {voteSummary[post.id]?.upvotes || 0}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 rounded-full px-3 ${voteSummary[post.id]?.userVote === -1 ? "text-destructive" : "text-muted-foreground"}`}
                    disabled={!isAuthenticated || toggleVote.isPending}
                    onClick={() => toggleVote.mutate({ entityType: "post", entityId: post.id, value: -1 })}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1.5" />
                    {voteSummary[post.id]?.downvotes || 0}
                  </Button>
                  <span className="text-xs font-medium text-muted-foreground">
                    {isZh ? `总分 ${voteSummary[post.id]?.score || 0}` : `Score ${voteSummary[post.id]?.score || 0}`}
                  </span>
                  <Link
                    to={`/community/${post.id}`}
                    className="inline-flex h-8 items-center rounded-full border px-3 text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/20"
                  >
                    <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                    {isZh ? "进入帖子讨论" : "Open discussion"}
                  </Link>
                  <CommentsSection entityType="community_post" entityId={post.id} compact hideComposer openPostHref={`/community/${post.id}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
