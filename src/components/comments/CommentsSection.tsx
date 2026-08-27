import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, Reply, Trash2, Loader2, ChevronDown, ChevronUp, Pencil, ThumbsDown, ThumbsUp, CornerDownRight } from "lucide-react";
import { useComments, useCreateComment, useDeleteComment, useToggleVote, useUpdateComment, useVoteSummary } from "@/hooks/use-care-data";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { formatDate, formatTime, formatDateTime } from "@/lib/locale";

interface CommentsSectionProps {
  entityType: "post" | "community_post" | "review" | "gallery" | "task" | "comment";
  entityId: string;
  /** Compact mode hides the header and shows fewer items initially */
  compact?: boolean;
  hideComposer?: boolean;
  openPostHref?: string;
}

function CommentItem({
  comment,
  entityType,
  entityId,
  userId,
  deleteComment,
  createComment,
  updateComment,
  voteSummary,
  toggleVote,
  depth,
}: {
  comment: any;
  entityType: string;
  entityId: string;
  userId: string | undefined;
  deleteComment: any;
  createComment: any;
  updateComment: any;
  voteSummary: Record<string, { score: number; upvotes: number; downvotes: number; userVote: -1 | 0 | 1 }>;
  toggleVote: any;
  depth: number;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const voteState = voteSummary[comment.id] || { score: 0, upvotes: 0, downvotes: 0, userVote: 0 };
  const isZh = i18n.language?.startsWith("zh");

  const handleReply = () => {
    if (!replyText.trim()) return;
    createComment.mutate(
      { entityType, entityId, content: replyText.trim(), parentId: comment.id },
      {
        onSuccess: () => {
          setReplyText("");
          setReplyOpen(false);
        },
        onError: (err: any) => toast({ title: isZh ? "回复失败" : "Failed to reply", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleUpdate = () => {
    if (!editText.trim()) return;
    updateComment.mutate(
      { id: comment.id, entityType, entityId, content: editText.trim() },
      {
        onSuccess: () => {
          setEditing(false);
          toast({ title: isZh ? "回复已更新" : "Reply updated" });
        },
        onError: (err: any) => toast({ title: isZh ? "更新失败" : "Failed to update", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleDelete = () => {
    deleteComment.mutate(
      { id: comment.id, entityType, entityId },
      {
        onSuccess: () => {
          setConfirmDeleteOpen(false);
          toast({ title: isZh ? "回复已删除" : "Comment deleted" });
        },
      }
    );
  };

  return (
    <div className={depth > 0 ? "ml-6 pl-4 border-l border-border/70" : ""}>
      <div className="py-3 group">
        <div className="rounded-lg bg-muted/25 px-3 py-3 transition-colors group-hover:bg-muted/40">
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary shrink-0 mt-0.5">
              {(comment.author?.full_name || "?")[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-semibold text-foreground">{comment.author?.full_name || "User"}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDate(comment.created_at, i18n.language, { month: "short", day: "numeric" })}
                </span>
                {depth > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <CornerDownRight className="h-3 w-3" />
                    {isZh ? "回复" : "Reply"}
                  </span>
                ) : null}
              </div>
              <p className="text-sm leading-6 text-foreground whitespace-pre-wrap">{comment.content}</p>
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2 text-[11px] ${voteState.userVote === 1 ? "text-primary" : "text-muted-foreground"}`}
                  onClick={() => toggleVote.mutate({ entityType: "comment", entityId: comment.id, value: 1 })}
                >
                  <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                  {voteState.upvotes}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2 text-[11px] ${voteState.userVote === -1 ? "text-destructive" : "text-muted-foreground"}`}
                  onClick={() => toggleVote.mutate({ entityType: "comment", entityId: comment.id, value: -1 })}
                >
                  <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                  {voteState.downvotes}
                </Button>
                <span className="text-[11px] font-medium text-muted-foreground px-1">{isZh ? `总分 ${voteState.score}` : `Score ${voteState.score}`}</span>
                {depth === 0 && (
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-muted-foreground" onClick={() => setReplyOpen(!replyOpen)}>
                    <Reply className="h-3.5 w-3.5 mr-1" />
                    {isZh ? "回复" : "Reply"}
                  </Button>
                )}
                {comment.author_id === userId && (
                  <>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-muted-foreground" onClick={() => setEditing(true)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      {isZh ? "编辑" : "Edit"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[11px] text-destructive"
                      onClick={() => setConfirmDeleteOpen(true)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      {isZh ? "删除" : "Delete"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isZh ? "编辑回复" : "Edit reply"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={4} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(false)}>{isZh ? "取消" : "Cancel"}</Button>
              <Button variant="coral" onClick={handleUpdate} disabled={!editText.trim() || updateComment.isPending}>
                {updateComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isZh ? "保存" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isZh ? "删除回复？" : "Delete reply?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isZh ? "这会永久删除这条回复以及其下的嵌套回复。" : "This will permanently delete this reply and any nested replies under it."}
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

      {/* Reply input */}
      {replyOpen && (
        <div className="ml-4 mb-3 flex gap-2 rounded-lg border bg-background p-3">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={isZh ? "写下回复..." : "Write a reply..."}
            rows={1}
            className="text-sm min-h-[40px]"
          />
          <Button size="sm" variant="coral" onClick={handleReply} disabled={!replyText.trim() || createComment.isPending}>
            {createComment.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : isZh ? "回复" : "Reply"}
          </Button>
        </div>
      )}

      {/* Nested replies (level 2 max) */}
      {(comment.replies || []).map((reply: any) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          entityType={entityType}
          entityId={entityId}
          userId={userId}
          deleteComment={deleteComment}
          createComment={createComment}
          updateComment={updateComment}
          voteSummary={voteSummary}
          toggleVote={toggleVote}
          depth={1}
        />
      ))}
    </div>
  );
}

export function CommentsSection({ entityType, entityId, compact, hideComposer, openPostHref }: CommentsSectionProps) {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const { toast } = useToast();
  const { data: comments, isLoading } = useComments(entityType, entityId);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const updateComment = useUpdateComment();
  const toggleVote = useToggleVote();
  const [newComment, setNewComment] = useState("");
  const [expanded, setExpanded] = useState(false);
  const isZh = i18n.language?.startsWith("zh");
  const commentIds = useMemo(() => {
    const ids: string[] = [];
    (comments || []).forEach((c: any) => {
      ids.push(c.id);
      (c.replies || []).forEach((r: any) => ids.push(r.id));
    });
    return ids;
  }, [comments]);
  const { data: voteSummary = {} } = useVoteSummary("comment", commentIds);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    if (!user?.id) {
      toast({ title: isZh ? "请先登录再评论" : "Please sign in to comment", variant: "destructive" });
      return;
    }
    createComment.mutate(
      { entityType, entityId, content: newComment.trim() },
      {
        onSuccess: () => {
          setNewComment("");
          setExpanded(true);
        },
        onError: (err: any) => toast({ title: isZh ? "评论失败" : "Failed to comment", description: err.message, variant: "destructive" }),
      }
    );
  };

  const commentCount = (comments || []).reduce((acc: number, c: any) => acc + 1 + (c.replies?.length || 0), 0);

  if (compact && !expanded && commentCount === 0) {
    return (
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {openPostHref ? (
          <Link to={openPostHref} className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
            <MessageSquare className="h-3.5 w-3.5" />
            {isZh ? "打开讨论" : "Open discussion"}
          </Link>
        ) : null}
        <button
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
          onClick={() => setExpanded(true)}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {isZh ? "回复" : "Reply"}
        </button>
      </div>
    );
  }

  return (
    <div className={compact ? "mt-2" : "mt-3"}>
      {/* Toggle header */}
      {compact && commentCount > 0 && !expanded && (
        <div className="flex items-center gap-2 flex-wrap">
          {openPostHref ? (
            <Link to={openPostHref} className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors">
              <MessageSquare className="h-3.5 w-3.5" />
              {isZh ? "打开讨论" : "Open discussion"}
            </Link>
          ) : null}
          <button
            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
            onClick={() => setExpanded(true)}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {commentCount} {isZh ? "条回复" : commentCount === 1 ? "reply" : "replies"}
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      )}

      {(!compact || expanded) && (
        <>
          {compact && commentCount > 0 && (
            <button
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors mb-2"
              onClick={() => setExpanded(false)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {commentCount} {isZh ? "条回复" : commentCount === 1 ? "reply" : "replies"}
              <ChevronUp className="h-3 w-3" />
            </button>
          )}

          {isLoading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-1">
              {(comments || []).map((c: any) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  entityType={entityType}
                  entityId={entityId}
                  userId={user?.id}
                  deleteComment={deleteComment}
                  createComment={createComment}
                  updateComment={updateComment}
                  voteSummary={voteSummary}
                  toggleVote={toggleVote}
                  depth={0}
                />
              ))}
            </div>
          )}

          {/* New comment input */}
          {!hideComposer && (
            <div className="flex gap-2 mt-3 rounded-xl border bg-background p-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={compact ? isZh ? "写下回复..." : "Write a reply..." : isZh ? "添加评论..." : "Add a comment..."}
                rows={1}
                className="text-sm min-h-[44px]"
              />
              <Button
                size="sm"
                variant="coral"
                onClick={handleSubmit}
                disabled={!newComment.trim() || createComment.isPending}
                className="shrink-0"
              >
                {createComment.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <MessageSquare className="h-3 w-3" />}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
