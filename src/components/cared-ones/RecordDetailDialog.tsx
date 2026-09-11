import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Pencil, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface DetailRow {
  label: string;
  value?: ReactNode;
}

/**
 * Shared detail popup for every cared-one record card (tasks, tips, notes,
 * plans, documents, contacts, visits...).
 *
 * Rules it enforces everywhere:
 *  - a record is opened, read in full, and only then acted on;
 *  - nothing destructive or state-changing happens on a single card tap;
 *  - delete always asks for confirmation inside the popup.
 */
export function RecordDetailDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  rows,
  actions,
  onEdit,
  onDelete,
  isDeleting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  rows: DetailRow[];
  /** Extra record-specific buttons (call, mark done, share...). */
  actions?: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!open) setConfirming(false);
  }, [open]);

  const visible = rows.filter((r) => r.value !== undefined && r.value !== null && r.value !== "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
          <DialogDescription>{subtitle || Z("查看这条记录的完整内容，再决定要做什么。", "Read the whole record first, then choose what to do.")}</DialogDescription>
        </DialogHeader>

        <div className="mt-1 space-y-3">
          {visible.length === 0 ? (
            <p className="text-sm text-muted-foreground">{Z("这条记录还没有填写内容。", "Nothing has been written in this record yet.")}</p>
          ) : (
            visible.map((r, i) => (
              <div key={`${r.label}-${i}`}>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{r.label}</p>
                <div className="text-sm text-foreground whitespace-pre-wrap break-words">{r.value}</div>
              </div>
            ))
          )}
        </div>

        {actions && <div className="flex flex-wrap gap-2 pt-2">{actions}</div>}

        {(onEdit || onDelete) && (
          <div className="mt-2 border-t pt-3">
            {confirming && onDelete ? (
              <div className="space-y-3">
                <p className="text-sm text-foreground flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  {Z("删除后无法恢复，确定要删除这条记录吗？", "This cannot be undone. Delete this record?")}
                </p>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>{Z("取消", "Cancel")}</Button>
                  <Button variant="destructive" size="sm" onClick={onDelete} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
                    {Z("确认删除", "Yes, delete")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 justify-end">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={onEdit}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> {Z("编辑", "Edit")}
                  </Button>
                )}
                {onDelete && (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setConfirming(true)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> {Z("删除", "Delete")}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
