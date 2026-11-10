import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CircleDashed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCareGroups } from "@/hooks/use-care-data";
import { getStoredWPUser } from "@/services/wp-auth";
import { getCurrentPosition } from "@/lib/geolocation";
import {
  BUBBLE_MAX_HOURS, burstBubble, clearBubbleCaches, createBubble, fetchMyActiveBubblesWithGroup, groupAllowsBubbles, popBubble,
  type LocationBubble,
} from "@/features/location/bubbles";

const MILE = 1609.344;
const bare = (v: unknown) => String(v ?? "").replace(/^wp-/, "");

interface Props {
  subjectId: string;
  subjectName: string;
  /** The bubble hiding this person from me (from the masked location row). */
  bubble?: LocationBubble | null | undefined;
}

/** Life360-style Bubbles: create / pop for yourself, burst for others. */
export function BubbleControls({ subjectId, subjectName, bubble }: Props) {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isZh ? cn : en);
  const { toast } = useToast();
  const qc = useQueryClient();
  const me = bare(getStoredWPUser()?.user_id);
  const isSelf = !!me && bare(subjectId) === me;
  const { data: groups = [] } = useCareGroups();
  const { data: mine = [] } = useQuery({
    queryKey: ["myBubbles", me],
    queryFn: fetchMyActiveBubblesWithGroup,
    enabled: isSelf,
    refetchInterval: 60_000,
  });
  const [open, setOpen] = useState(false);
  const [groupId, setGroupId] = useState("");
  const [miles, setMiles] = useState(1);
  const [hours, setHours] = useState(1);
  const [busy, setBusy] = useState(false);
  const [burstOpen, setBurstOpen] = useState(false);

  const groupName = (id: string) => (groups as any[]).find((g) => bare(g.id) === bare(id))?.name || "";
  const until = (iso: string) => new Date(iso).toLocaleTimeString(isZh ? "zh-CN" : "en-US", { hour: "numeric", minute: "2-digit" });
  const refresh = () => {
    clearBubbleCaches();
    ["myBubbles", "locationShares", "caredOneLocation", "caredOneLocationHistory"].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
  };
  const fail = (e: unknown) => toast({ title: Z("操作失败", "Something went wrong"), description: e instanceof Error ? e.message : String(e), variant: "destructive" });

  if (!isSelf) {
    if (!bubble) return null;
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="gap-1 text-xs">
          <CircleDashed className="h-3 w-3" />
          {Z(`在泡泡中，只显示大概范围 · ${until(bubble.endsAt)} 结束`, `In a Bubble — general area only · ends ${until(bubble.endsAt)}`)}
        </Badge>
        <Button size="sm" variant="outline" onClick={() => setBurstOpen(true)} disabled={busy}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : Z("戳破泡泡", "Burst Bubble")}
        </Button>
        <AlertDialog open={burstOpen} onOpenChange={setBurstOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{Z(`戳破 ${subjectName} 的泡泡？`, `Burst ${subjectName}'s Bubble?`)}</AlertDialogTitle>
              <AlertDialogDescription>{Z("会马上显示对方的准确位置，并通知群组里的所有人。", "Their exact location is shown right away and everyone in the group is notified.")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{Z("取消", "Cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={async () => {
                setBusy(true);
                try { await burstBubble(bubble, subjectName); refresh(); toast({ title: Z("泡泡已戳破", "Bubble burst") }); }
                catch (e) { fail(e); } finally { setBusy(false); }
              }}>{Z("戳破", "Burst")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  const usedGroups = new Set(mine.map((b) => bare(b.groupId)));
  const choices = (groups as any[]).filter((g) => groupAllowsBubbles(g) && !usedGroups.has(bare(g.id)));

  const start = async () => {
    const gid = groupId || (choices[0] ? String(choices[0].id) : "");
    if (!gid) return;
    setBusy(true);
    try {
      const pos = await getCurrentPosition({ timeout: 15000 });
      if (!pos) throw new Error(Z("无法获取你的位置，请允许定位。", "Could not get your location. Please allow location access."));
      await createBubble({ groupId: gid, latitude: pos.latitude, longitude: pos.longitude, radiusMeters: miles * MILE, hours });
      setOpen(false);
      refresh();
      toast({ title: Z("泡泡已创建", "Bubble created") });
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {mine.map((b) => (
        <span key={b.id} className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 text-xs">
            <CircleDashed className="h-3 w-3" />
            {Z(`泡泡中${groupName(b.groupId) ? `（${groupName(b.groupId)}）` : ""} · ${until(b.endsAt)} 结束`, `Bubble${groupName(b.groupId) ? ` in ${groupName(b.groupId)}` : ""} · ends ${until(b.endsAt)}`)}
          </Badge>
          <Button size="sm" variant="outline" disabled={busy} onClick={async () => {
            setBusy(true);
            try { await popBubble(b); refresh(); toast({ title: Z("泡泡已结束", "Bubble ended") }); }
            catch (e) { fail(e); } finally { setBusy(false); }
          }}>{Z("结束泡泡", "Pop Bubble")}</Button>
        </span>
      ))}
      {choices.length > 0 && (
        <Button size="sm" variant="outline" onClick={() => { setGroupId(String(choices[0].id)); setOpen(true); }}>
          <CircleDashed className="h-3.5 w-3.5 mr-1" /> {Z("创建泡泡", "Create a Bubble")}
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{Z("创建泡泡", "Create a Bubble")}</DialogTitle>
            <DialogDescription>{Z("在这段时间里，这个群组的成员只看到你的大概范围。求救或紧急情况时泡泡会自动戳破，成员担心你时也可以戳破。", "For this time, the group only sees your general area. SOS or an emergency request bursts it automatically, and members can burst it if they are worried.")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            {choices.length > 1 && (
              <div className="space-y-1.5">
                <Label>{Z("群组", "Group")}</Label>
                <Select value={groupId} onValueChange={setGroupId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {choices.map((g) => <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>{Z(`范围：约 ${(miles * 1.609).toFixed(1)} 公里`, `Size: ${miles} ${miles === 1 ? "mile" : "miles"}`)}</Label>
              <Slider min={1} max={25} step={1} value={[miles]} onValueChange={(v) => setMiles(v[0] ?? 1)} aria-label={Z("范围", "Size")} />
            </div>
            <div className="space-y-2">
              <Label>{Z(`时长：${hours} 小时`, `Duration: ${hours} ${hours === 1 ? "hour" : "hours"}`)}</Label>
              <Slider min={1} max={BUBBLE_MAX_HOURS} step={1} value={[hours]} onValueChange={(v) => setHours(v[0] ?? 1)} aria-label={Z("时长", "Duration")} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>{Z("取消", "Cancel")}</Button>
            <Button onClick={start} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : Z("创建", "Create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
