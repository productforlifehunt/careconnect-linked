import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import i18n from "i18next";
import { Switch } from "@/components/ui/switch";
import { useCareGroups } from "@/hooks/use-care-data";
import { fetchPausedGroupIds, setLocationPausedForGroup } from "@/features/location/circle-sharing";
import { toast } from "sonner";

const Z = (cn: string, en: string) => ((i18n.language || "").startsWith("zh") ? cn : en);
const bare = (v: unknown) => String(v ?? "").replace(/^wp-/, "");

/** Life360 per-circle "Location Sharing": one switch for each of my circles. */
export function CircleSharingSwitches({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const { data: groups = [] } = useCareGroups();
  const { data: paused } = useQuery({ queryKey: ["pausedGroups", userId], queryFn: () => fetchPausedGroupIds(userId), enabled: !!userId });
  const [busy, setBusy] = useState<string | null>(null);
  if (!(groups as any[]).length || !paused) return null;
  const toggle = async (gid: string, share: boolean) => {
    setBusy(gid);
    try {
      await setLocationPausedForGroup(gid, !share);
      const next = new Set(paused); share ? next.delete(gid) : next.add(gid);
      qc.setQueryData(["pausedGroups", userId], next);
      qc.invalidateQueries({ queryKey: ["locationShares"] });
    } catch (e: any) {
      toast.error(Z("保存失败", "Save failed"), { description: e?.message });
    } finally { setBusy(null); }
  };
  return (
    <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1">
      {(groups as any[]).map((g) => {
        const gid = bare(g.id);
        return (
          <label key={gid} className="flex items-center gap-2 text-xs text-muted-foreground">
            <Switch
              checked={!paused.has(gid)}
              disabled={busy === gid}
              onCheckedChange={(v) => toggle(gid, v)}
              aria-label={Z(`向 ${g.name} 共享位置`, `Share location with ${g.name}`)}
            />
            {g.name}
          </label>
        );
      })}
    </div>
  );
}
