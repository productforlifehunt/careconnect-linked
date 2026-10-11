import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLocationSharingFlags, useSetLocationSharingFlags } from "@/hooks/use-care-data";

/** CCT 258 a55 — whether emergency location sharing is allowed for this cared one (b55 = yes). */
export function EmergencyShareSetting({ caredOneId }: { caredOneId: string }) {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");
  const { toast } = useToast();
  const { data: flags, isLoading } = useLocationSharingFlags(caredOneId || null);
  const setFlags = useSetLocationSharingFlags();
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <span>
        <span className="block text-sm font-medium">{zh ? "允许紧急定位分享" : "Allow emergency location sharing"}</span>
        <span className="block text-xs text-muted-foreground">
          {zh ? "开启后，紧急时护理者无需对方确认即可获取位置。" : "In an emergency, caregivers can get the location without asking first."}
        </span>
      </span>
      <Switch
        checked={!!flags?.emergencyAllowed}
        disabled={isLoading || setFlags.isPending}
        onCheckedChange={(v) => setFlags.mutate({ userId: caredOneId, emergencyAllowed: v }, {
          onSuccess: () => toast({ title: zh ? "已保存" : "Saved" }),
          onError: (e: any) => toast({ title: zh ? "保存失败" : "Could not save", description: e?.message, variant: "destructive" }),
        })}
      />
    </label>
  );
}
