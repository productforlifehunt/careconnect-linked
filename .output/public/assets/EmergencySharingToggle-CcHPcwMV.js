var e=`import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";

interface Props {
  allowed: boolean;
  pending: boolean;
  isZh: boolean;
  onSave: (allowed: boolean) => Promise<void>;
}

export function EmergencySharingToggle({ allowed, pending, isZh, onSave }: Props) {
  const [next, setNext] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const busy = pending || saving;
  const confirm = async () => {
    if (next === null || busy) return;
    setSaving(true);
    try {
      await onSave(next);
      setNext(null);
    } catch {
      // The caller displays the actual save error; retain the confirmation.
    } finally {
      setSaving(false);
    }
  };
  return <>
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor="emergency-sharing-toggle">{isZh ? "紧急共享模式" : "Emergency sharing mode"}</Label>
      <Switch id="emergency-sharing-toggle" checked={allowed} disabled={busy} onCheckedChange={setNext} />
    </div>
    <AlertDialog open={next !== null} onOpenChange={open => { if (!open && !busy) setNext(null); }}>
      <AlertDialogContent className="w-[calc(100%-2rem)]">
        <AlertDialogHeader>
          <AlertDialogTitle>{next ? (isZh ? "开启紧急共享模式？" : "Turn on emergency sharing mode?") : (isZh ? "关闭紧急共享模式？" : "Turn off emergency sharing mode?")}</AlertDialogTitle>
          <AlertDialogDescription>{next
            ? (isZh ? "开启后，护理者可以发送不需要对方确认的紧急位置请求。" : "Caregivers will be able to send emergency location requests without the cared one's confirmation.")
            : (isZh ? "关闭会关闭紧急共享模式，请确认其他护理者暂时不需要此功能。" : "Turning this off will disable emergency sharing mode. Please confirm that other caregivers do not need this feature for now.")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{isZh ? "取消" : "Cancel"}</AlertDialogCancel>
          <Button variant={next ? "default" : "destructive"} disabled={busy} onClick={confirm}>{busy ? (isZh ? "正在保存…" : "Saving…") : next ? (isZh ? "确认开启" : "Confirm turn on") : (isZh ? "确认关闭" : "Confirm turn off")}</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}`;export{e as default};