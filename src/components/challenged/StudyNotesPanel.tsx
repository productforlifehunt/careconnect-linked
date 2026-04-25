import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, Plus, BookOpenCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  fetchStudyNotesForArticle,
  createStudyNote,
  updateStudyNote,
  deleteStudyNote,
  isLessonFinished,
  markLessonFinished,
} from "@/features/study-notes/source.wordpress";
import { useToast } from "@/hooks/use-toast";

interface Props {
  articleId: string | number;
  /** Show the "Mark as finished" toggle (only meaningful for Learn lessons). */
  showFinishedToggle?: boolean;
}

export function StudyNotesPanel({ articleId, showFinishedToggle = false }: Props) {
  const { i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const qc = useQueryClient();
  const { toast } = useToast();

  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const notesQuery = useQuery({
    queryKey: ["study-notes", String(articleId)],
    queryFn: () => fetchStudyNotesForArticle(articleId),
  });

  const finishedQuery = useQuery({
    queryKey: ["lesson-finished", String(articleId)],
    queryFn: () => isLessonFinished(articleId),
    enabled: showFinishedToggle,
  });

  const createMut = useMutation({
    mutationFn: () => createStudyNote({ article_id: articleId, title: draftTitle, content: draftContent }),
    onSuccess: () => {
      setDraftTitle(""); setDraftContent("");
      qc.invalidateQueries({ queryKey: ["study-notes", String(articleId)] });
      toast({ title: isChinese ? "笔记已保存" : "Note saved" });
    },
    onError: () => toast({ title: isChinese ? "保存失败" : "Save failed", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id }: { id: string }) => updateStudyNote(id, { title: editTitle, content: editContent }),
    onSuccess: () => {
      setEditingId(null);
      qc.invalidateQueries({ queryKey: ["study-notes", String(articleId)] });
      toast({ title: isChinese ? "已更新" : "Updated" });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteStudyNote(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["study-notes", String(articleId)] });
      toast({ title: isChinese ? "笔记已删除" : "Note deleted" });
    },
  });

  const finishedMut = useMutation({
    mutationFn: (next: boolean) => markLessonFinished(articleId, next),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lesson-finished", String(articleId)] }),
  });

  return (
    <section className="space-y-4">
      {showFinishedToggle && (
        <Card className="p-4 flex items-center gap-3">
          <BookOpenCheck className="h-5 w-5 text-primary" />
          <label className="flex items-center gap-2 cursor-pointer flex-1">
            <Checkbox
              checked={!!finishedQuery.data}
              onCheckedChange={(v) => finishedMut.mutate(!!v)}
              disabled={finishedMut.isPending}
            />
            <span className="text-sm font-medium">
              {isChinese ? "标记此课程为已完成" : "Mark this lesson as finished"}
            </span>
          </label>
        </Card>
      )}

      <Card className="p-4 space-y-3">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Plus className="h-4 w-4" /> {isChinese ? "添加笔记" : "Add a note"}
        </h3>
        <Input
          placeholder={isChinese ? "标题" : "Title"}
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
        />
        <Textarea
          placeholder={isChinese ? "你的想法..." : "Your thoughts…"}
          value={draftContent}
          onChange={(e) => setDraftContent(e.target.value)}
          rows={3}
        />
        <Button
          size="sm"
          onClick={() => createMut.mutate()}
          disabled={!draftTitle.trim() || !draftContent.trim() || createMut.isPending}
        >
          {createMut.isPending ? (isChinese ? "保存中…" : "Saving…") : isChinese ? "保存笔记" : "Save note"}
        </Button>
      </Card>

      <div className="space-y-3">
        <h3 className="text-base font-semibold">{isChinese ? "我的笔记" : "My notes"}</h3>
        {notesQuery.isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : notesQuery.data && notesQuery.data.length > 0 ? (
          notesQuery.data.map((n) => (
            <Card key={n.id} className="p-4">
              {editingId === n.id ? (
                <div className="space-y-2">
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={3} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateMut.mutate({ id: n.id })} disabled={updateMut.isPending}>
                      {isChinese ? "保存" : "Save"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      {isChinese ? "取消" : "Cancel"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-medium">{n.title}</h4>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => {
                        setEditingId(n.id); setEditTitle(n.title); setEditContent(n.content);
                      }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => deleteMut.mutate(n.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{n.content}</p>
                </>
              )}
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            {isChinese ? "还没有笔记" : "No notes yet"}
          </p>
        )}
      </div>
    </section>
  );
}
