import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useCreatePost, useDeletePost, useMyProfile, usePostTypes, usePosts, useToggleVote, useUpdatePost, useVoteSummary } from "@/hooks/use-care-data";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Newspaper, MoreHorizontal, Pencil, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";

function ArticleEditorDialog({
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isZh ? "编辑文章" : "Edit Article"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <Input placeholder={isZh ? "标题" : "Title"} value={title} onChange={(e) => onTitleChange(e.target.value)} />
          <Textarea placeholder={isZh ? "内容..." : "Content..."} value={content} onChange={(e) => onContentChange(e.target.value)} rows={10} />
          <Button onClick={onSubmit} disabled={pending} className="w-full" variant="coral">
            {pending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isZh ? "保存修改" : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Articles() {
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { data: profile } = useMyProfile();
  const isZh = i18n.language?.startsWith("zh");
  const area = isZh ? "china" : "global";
  const articlePostType = "challenged_article";
  const { data: articleSubtypes = [] } = usePostTypes(2);
  const availableSubtypes = useMemo(
    () => articleSubtypes.filter((item) => ["challenged_user_article", "challenged_expert_article", "challenged_official_article"].includes(item.key)),
    [articleSubtypes]
  );
  const [articleScope, setArticleScope] = useState<string>("all");
  const [selectedSubtype, setSelectedSubtype] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [pendingDeleteArticle, setPendingDeleteArticle] = useState<any | null>(null);
  const activeSubtype = selectedSubtype === "all" ? null : selectedSubtype;
  const { data: posts, isLoading } = usePosts(articlePostType, area, activeSubtype);
  const createPost = useCreatePost();
  const deletePost = useDeletePost();
  const updatePost = useUpdatePost();
  const toggleVote = useToggleVote();
  const dateLocale = isZh ? zhCN : enUS;

  const filteredPosts = (posts || []).filter((p: any) => (articleScope === "mine" ? p.author_id === profile?.user_id : true));
  const postIds = useMemo(() => filteredPosts.map((p: any) => p.id), [filteredPosts]);
  const { data: voteSummary = {} } = useVoteSummary("post", postIds);

  const handleCreate = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast({ title: isZh ? "请填写标题和内容" : "Please fill in title and content", variant: "destructive" });
      return;
    }
    createPost.mutate(
      { title: newTitle.trim(), content: newContent.trim(), postType: articlePostType, area },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setNewTitle("");
          setNewContent("");
          toast({ title: isZh ? "文章已发布" : "Article created" });
        },
        onError: (err: any) => toast({ title: isZh ? "发布失败" : "Failed", description: err.message, variant: "destructive" }),
      }
    );
  };

  return (
    <div className="container max-w-5xl mx-auto py-6 px-4 space-y-6">
      <ArticleEditorDialog
        open={!!editingArticle}
        onOpenChange={(open) => { if (!open) setEditingArticle(null); }}
        title={editTitle}
        content={editContent}
        isZh={isZh}
        pending={updatePost.isPending}
        onTitleChange={setEditTitle}
        onContentChange={setEditContent}
        onSubmit={() => {
          if (!editingArticle || !editTitle.trim() || !editContent.trim()) return;
          updatePost.mutate({ id: editingArticle.id, title: editTitle.trim(), content: editContent.trim() }, { onSuccess: () => setEditingArticle(null) });
        }}
      />

      <AlertDialog open={!!pendingDeleteArticle} onOpenChange={(open) => { if (!open) setPendingDeleteArticle(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isZh ? "删除文章？" : "Delete article?"}</AlertDialogTitle>
            <AlertDialogDescription>{isZh ? "这会永久删除该文章。" : "This will permanently delete this article."}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isZh ? "取消" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => pendingDeleteArticle && deletePost.mutate(pendingDeleteArticle.id, { onSuccess: () => setPendingDeleteArticle(null) })}>{isZh ? "删除" : "Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{isZh ? "文章" : "Articles"}</h1>
          <p className="text-sm text-muted-foreground mt-1">{isZh ? "按类型沉淀经验、专业知识与官方内容" : "Publish user stories, expert insights, and official updates"}</p>
        </div>
        {isAuthenticated && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="coral"><Plus className="h-4 w-4 mr-1" />{isZh ? "写文章" : "New Article"}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader><DialogTitle>{isZh ? "发布新文章" : "Create New Article"}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <Input placeholder={isZh ? "标题" : "Title"} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                <Textarea placeholder={isZh ? "内容..." : "Content..."} value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={10} />
                <Button onClick={handleCreate} disabled={createPost.isPending} className="w-full" variant="coral">{createPost.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{isZh ? "发布" : "Publish"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={articleScope} onValueChange={setArticleScope}>
        <div className="flex items-center gap-3 flex-wrap">
          <TabsList>
            <TabsTrigger value="all">{isZh ? "全部文章" : "All Articles"}</TabsTrigger>
            <TabsTrigger value="mine">{isZh ? "我的文章" : "My Articles"}</TabsTrigger>
          </TabsList>
          <TabsList>
            <TabsTrigger value="all" onClick={() => setSelectedSubtype("all")}>{isZh ? "全部类型" : "All Types"}</TabsTrigger>
            {availableSubtypes.map((item) => (
              <TabsTrigger key={item.id} value={item.key} onClick={() => setSelectedSubtype(item.key)}>{item.name || item.key}</TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filteredPosts.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Newspaper className="h-10 w-10 mx-auto mb-3 opacity-40" /><p>{isZh ? "暂无文章" : "No articles yet"}</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post: any) => {
            const subtype = availableSubtypes.find((item) => item.id === post.child_post_type_id);
            return (
              <Card key={post.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground">{post.author?.full_name || (isZh ? "匿名" : "Anonymous")}</span>
                        {subtype ? <Badge variant="outline">{subtype.name || subtype.key}</Badge> : null}
                        <span className="text-[11px] text-muted-foreground ml-auto shrink-0">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: dateLocale })}</span>
                      </div>
                      <Link to={`/articles/${post.id}`} className="block hover:opacity-90 transition-opacity"><h3 className="text-lg font-semibold mt-1 text-foreground">{post.title}</h3></Link>
                    </div>
                    {profile?.user_id === post.author_id ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingArticle(post); setEditTitle(post.title || ""); setEditContent(post.content || ""); }}><Pencil className="h-4 w-4 mr-2" />{isZh ? "编辑" : "Edit"}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setPendingDeleteArticle(post)} className="text-destructive focus:text-destructive"><Trash2 className="h-4 w-4 mr-2" />{isZh ? "删除" : "Delete"}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed line-clamp-4">{post.content}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Button variant="ghost" size="sm" className={`h-8 rounded-full px-3 ${voteSummary[post.id]?.userVote === 1 ? "text-primary" : "text-muted-foreground"}`} disabled={!isAuthenticated || toggleVote.isPending} onClick={() => toggleVote.mutate({ entityType: "post", entityId: post.id, value: 1 })}><ThumbsUp className="h-4 w-4 mr-1.5" />{voteSummary[post.id]?.upvotes || 0}</Button>
                    <Button variant="ghost" size="sm" className={`h-8 rounded-full px-3 ${voteSummary[post.id]?.userVote === -1 ? "text-destructive" : "text-muted-foreground"}`} disabled={!isAuthenticated || toggleVote.isPending} onClick={() => toggleVote.mutate({ entityType: "post", entityId: post.id, value: -1 })}><ThumbsDown className="h-4 w-4 mr-1.5" />{voteSummary[post.id]?.downvotes || 0}</Button>
                    <span className="text-xs font-medium text-muted-foreground">{isZh ? `总分 ${voteSummary[post.id]?.score || 0}` : `Score ${voteSummary[post.id]?.score || 0}`}</span>
                    <Link to={`/articles/${post.id}`} className="inline-flex h-8 items-center rounded-full border px-3 text-xs text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/20">{isZh ? "阅读全文" : "Read article"}</Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
