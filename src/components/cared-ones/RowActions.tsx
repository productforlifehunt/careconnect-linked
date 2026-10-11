import { useState } from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/** Standard per-row Edit + Delete buttons used by every cared-one feature list. */
export function RowActions({ onEdit, onDelete }: { onEdit?: (() => void) | undefined; onDelete?: (() => Promise<unknown>) | undefined }) {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");
  const { toast } = useToast();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const doDelete = async () => {
    if (!onDelete) return;
    setBusy(true);
    try { await onDelete(); toast({ title: zh ? "已删除" : "Deleted" }); setConfirm(false); }
    catch (e: any) { toast({ title: zh ? "没能删除" : "Couldn't delete", description: e?.message, variant: "destructive" }); }
    finally { setBusy(false); }
  };
  return (
    <div className="flex shrink-0 items-center gap-1">
      {onEdit && (
        <Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label={zh ? "编辑" : "Edit"} title={zh ? "编辑" : "Edit"} onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" aria-label={zh ? "删除" : "Delete"} title={zh ? "删除" : "Delete"} onClick={() => setConfirm(true)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{zh ? "确定删除？" : "Delete this item?"}</AlertDialogTitle>
            <AlertDialogDescription>{zh ? "删除后无法恢复。" : "This cannot be undone."}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{zh ? "取消" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); void doDelete(); }} disabled={busy} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}{zh ? "删除" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
