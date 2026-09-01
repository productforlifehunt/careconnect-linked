import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCategoryOptions, useCategoryTypes, useCustomFieldTypes, useDeletePost, useEntityCategoryOptions, useEntityCustomFieldValues, useMyProfile, usePost, usePostTypes, useToggleVote, useUpdatePost, useVoteCount } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { ArrowLeft, Loader2, MoreHorizontal, Pencil, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";

function ArticleEditorDialog({ open, onOpenChange, title, content, isZh, pending, onTitleChange, onContentChange, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; content: string; isZh: boolean; pending: boolean; onTitleChange: (value: string) => void; onContentChange: (value: string) => void; onSubmit: () => void; }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>{isZh ? "编辑文章" : "Edit Article"}</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <Input placeholder={isZh ? "标题" : "Title"} value={title} onChange={(e) => onTitleChange(e.target.value)} />
          <Textarea placeholder={isZh ? "内容..." : "Content..."} value={content} onChange={(e) => onContentChange(e.target.value)} rows={12} />
          <Button onClick={onSubmit} disabled={pending} className="w-full" variant="coral">{pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{isZh ? "保存修改" : "Save Changes"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ArticlePost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { data: profile } = useMyProfile();
  const articlePostType = "challenged_article";
  const { data: post, isLoading } = usePost(id || null, articlePostType);
  const { data: articleSubtypes = [] } = usePostTypes(2);
  const { data: categoryTypes = [] } = useCategoryTypes();
  const { data: entityCategories = [] } = useEntityCategoryOptions(id || null);
  const { data: customFieldTypes = [] } = useCustomFieldTypes();
  const { data: customFieldValues = [] } = useEntityCustomFieldValues(id || null);
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

  const subtype = articleSubtypes.find((item) => item.id === post?.child_post_type_id);
  const categorySummary = entityCategories.map((item) => {
    const type = categoryTypes.find((ct) => ct.id === item.category_type_id);
    return { ...item, typeName: type?.name || type?.key || item.category_type_id };
  });
  const customFieldSummary = customFieldValues.map((item) => {
    const type = customFieldTypes.find((ct) => ct.id === item.custom_field_type_id);
    return { ...item, fieldName: type?.name || type?.key || item.custom_field_type_id };
  });

  return (
    <div className="container max-w-5xl mx-auto py-6 px-4 space-y-6">
      <ArticleEditorDialog open={editing} onOpenChange={setEditing} title={editTitle} content={editContent} isZh={isZh} pending={updatePost.isPending} onTitleChange={setEditTitle} onContentChange={setEditContent} onSubmit={() => {
        if (!post || !editTitle.trim() || !editContent.trim()) {
          toast({ title: isZh ? "请填写标题和内容" : "Please fill in title and content", variant: "destructive" });
          return;
        }
        updatePost.mutate({ id: post.id, title: editTitle.trim(), content: editContent.trim() }, { onSuccess: () => setEditing(false) });
      }} />

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isZh ? "删除文章？" : "Delete article?"}</AlertDialogTitle>
            <AlertDialogDescription>{isZh ? "这会永久删除该文章以及下面的评论。" : "This will permanently delete this article and its discussion."}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isZh ? "取消" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => post && deletePost.mutate(post.id, { onSuccess: () => navigate("/articles") })}>{isZh ? "删除" : "Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button variant="ghost" asChild className="px-0 hover:bg-transparent"><Link to="/articles"><ArrowLeft className="h-4 w-4 mr-2" />{isZh ? "返回文章" : "Back to Articles"}</Link></Button>

      {isLoading ? (
        <Card><CardHeader className="space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-2/3" /></CardHeader><CardContent className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /><Skeleton className="h-4 w-4/6" /></CardContent></Card>
      ) : !post ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">{isZh ? "文章不存在或已被删除" : "Article not found or deleted"}</CardContent></Card>
      ) : (
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-foreground">{post.author?.full_name || (isZh ? "匿名" : "Anonymous")}</span>
                  {subtype ? <Badge variant="outline">{subtype.name || subtype.key}</Badge> : null}
                  <span className="text-[11px] text-muted-foreground ml-auto shrink-0">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: dateLocale })}</span>
                </div>
                <h1 className="text-3xl font-semibold mt-2 text-foreground">{post.title}</h1>
              </div>
              {profile?.user_id === post.author_id ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="min-h-11 min-w-11 shrink-0" aria-label={isZh ? "文章操作" : "Article actions"}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditTitle(post.title || ""); setEditContent(post.content || ""); setEditing(true); }}><Pencil className="h-4 w-4 mr-2" />{isZh ? "编辑" : "Edit"}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setConfirmDeleteOpen(true)} className="text-destructive focus:text-destructive"><Trash2 className="h-4 w-4 mr-2" />{isZh ? "删除" : "Delete"}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-base leading-8 text-foreground whitespace-pre-wrap">{post.content}</div>
            {categorySummary.length > 0 ? <div className="space-y-2"><h2 className="text-sm font-semibold text-foreground">{isZh ? "分类" : "Categories"}</h2><div className="flex gap-2 flex-wrap">{categorySummary.map((item) => <Badge key={item.id} variant="secondary">{item.typeName}</Badge>)}</div></div> : null}
            {customFieldSummary.length > 0 ? <div className="space-y-2"><h2 className="text-sm font-semibold text-foreground">{isZh ? "自定义字段" : "Custom Fields"}</h2><div className="grid gap-2">{customFieldSummary.map((item) => <div key={item.id} className="text-sm text-muted-foreground"><span className="font-medium text-foreground mr-2">{item.fieldName}:</span>{item.value || "-"}</div>)}</div></div> : null}
            <div className="flex items-center gap-3 flex-wrap">
              <Button variant="ghost" size="sm" className={`h-8 px-2 ${voteState.userVote === 1 ? "text-primary" : "text-muted-foreground"}`} disabled={!isAuthenticated || toggleVote.isPending} onClick={() => toggleVote.mutate({ entityType: "post", entityId: post.id, value: 1 })}><ThumbsUp className="h-4 w-4 mr-1.5" />{voteState.upvotes}</Button>
              <Button variant="ghost" size="sm" className={`h-8 px-2 ${voteState.userVote === -1 ? "text-destructive" : "text-muted-foreground"}`} disabled={!isAuthenticated || toggleVote.isPending} onClick={() => toggleVote.mutate({ entityType: "post", entityId: post.id, value: -1 })}><ThumbsDown className="h-4 w-4 mr-1.5" />{voteState.downvotes}</Button>
              <span className="text-sm font-medium text-muted-foreground">{isZh ? `总分 ${voteState.score}` : `Score ${voteState.score}`}</span>
            </div>
            <Separator />
            <div className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{isZh ? "评论" : "Comments"}</h2>
                <p className="text-sm text-muted-foreground">{isZh ? "文章使用通用 comment/vote 结构。" : "Articles use the shared comment/vote structure."}</p>
              </div>
              <CommentsSection entityType="post" entityId={post.id} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
