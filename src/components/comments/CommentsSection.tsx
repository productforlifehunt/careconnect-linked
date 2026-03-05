import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Reply, Trash2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useComments, useCreateComment, useDeleteComment } from "@/hooks/use-care-data";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CommentsSectionProps {
  entityType: "post" | "review" | "gallery" | "task";
  entityId: string;
  /** Compact mode hides the header and shows fewer items initially */
  compact?: boolean;
}

function CommentItem({
  comment,
  entityType,
  entityId,
  userId,
  deleteComment,
  createComment,
  depth,
}: {
  comment: any;
  entityType: string;
  entityId: string;
  userId: string | undefined;
  deleteComment: any;
  createComment: any;
  depth: number;
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { toast } = useToast();

  const handleReply = () => {
    if (!replyText.trim()) return;
    createComment.mutate(
      { entityType, entityId, content: replyText.trim(), parentId: comment.id },
      {
        onSuccess: () => {
          setReplyText("");
          setReplyOpen(false);
        },
        onError: (err: any) => toast({ title: "Failed to reply", description: err.message, variant: "destructive" }),
      }
    );
  };

  return (
    <div className={depth > 0 ? "ml-6 border-l-2 border-muted pl-3" : ""}>
      <div className="py-2 group">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-medium text-primary shrink-0">
            {(comment.author?.full_name || "?")[0]}
          </div>
          <span className="text-xs font-medium text-foreground">{comment.author?.full_name || "User"}</span>
          <span className="text-[10px] text-muted-foreground">
            {new Date(comment.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
          </span>
          <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {depth === 0 && (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyOpen(!replyOpen)}>
                <Reply className="h-3 w-3" />
              </Button>
            )}
            {comment.author_id === userId && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive"
                onClick={() =>
                  deleteComment.mutate({ id: comment.id, entityType, entityId }, {
                    onSuccess: () => toast({ title: "Comment deleted" }),
                  })
                }
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground pl-8">{comment.content}</p>
      </div>

      {/* Reply input */}
      {replyOpen && (
        <div className="ml-8 mb-2 flex gap-2">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows={1}
            className="text-sm min-h-[32px]"
          />
          <Button size="sm" variant="coral" onClick={handleReply} disabled={!replyText.trim() || createComment.isPending}>
            {createComment.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Reply"}
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
          depth={1}
        />
      ))}
    </div>
  );
}

export function CommentsSection({ entityType, entityId, compact }: CommentsSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: comments, isLoading } = useComments(entityType, entityId);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const [newComment, setNewComment] = useState("");
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    if (!user?.id) {
      toast({ title: "Please sign in to comment", variant: "destructive" });
      return;
    }
    createComment.mutate(
      { entityType, entityId, content: newComment.trim() },
      {
        onSuccess: () => {
          setNewComment("");
          setExpanded(true);
        },
        onError: (err: any) => toast({ title: "Failed to comment", description: err.message, variant: "destructive" }),
      }
    );
  };

  const commentCount = (comments || []).reduce((acc: number, c: any) => acc + 1 + (c.replies?.length || 0), 0);

  if (compact && !expanded && commentCount === 0) {
    return (
      <button
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
        onClick={() => setExpanded(true)}
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Reply
      </button>
    );
  }

  return (
    <div className={compact ? "mt-2" : "mt-3"}>
      {/* Toggle header */}
      {compact && commentCount > 0 && !expanded && (
        <button
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setExpanded(true)}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          {commentCount} {commentCount === 1 ? "reply" : "replies"}
          <ChevronDown className="h-3 w-3" />
        </button>
      )}

      {(!compact || expanded) && (
        <>
          {compact && commentCount > 0 && (
            <button
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
              onClick={() => setExpanded(false)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {commentCount} {commentCount === 1 ? "reply" : "replies"}
              <ChevronUp className="h-3 w-3" />
            </button>
          )}

          {isLoading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-border/50">
              {(comments || []).map((c: any) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  entityType={entityType}
                  entityId={entityId}
                  userId={user?.id}
                  deleteComment={deleteComment}
                  createComment={createComment}
                  depth={0}
                />
              ))}
            </div>
          )}

          {/* New comment input */}
          <div className="flex gap-2 mt-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={compact ? "Write a reply..." : "Add a comment..."}
              rows={1}
              className="text-sm min-h-[32px]"
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
        </>
      )}
    </div>
  );
}
