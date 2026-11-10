import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getCurrentPosition } from "@/lib/geolocation";
import { fetchWPUserProfile } from "@/features/shared/wp-users";
import { getStoredWPUser } from "@/services/wp-auth";
import LocationCard from "@/components/care/LocationCard";
import { CircleSharingSwitches } from "@/components/location/CircleSharingSwitches";
import { fetchPausedGroupIds } from "@/features/location/circle-sharing";
import {
  useUserCaredOnes, useCareGroups, useGroupCaredOnes,
  useRespondToLocationRequest, useLocationSharingFlags, useSetLocationSharingFlags,
} from "@/hooks/use-care-data";

type Person = { id: string; name: string };
type MainTab = "me" | "people" | "groups";

const bare = (v: any) => String(v ?? "").replace(/^wp-/, "");

/** Button tabs of people, then the standard location card of the chosen one. */
function PeopleSwitcher({ people, empty }: { people: Person[]; empty: string }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const active = people.find((p) => p.id === selectedId) || people[0];
  if (!people.length) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">{empty}</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {people.map((p) => (
          <Button key={p.id} size="sm" variant={active?.id === p.id ? "default" : "outline"} onClick={() => setSelectedId(p.id)}>
            {p.name}
          </Button>
        ))}
      </div>
      {active && <LocationCard key={active.id} caredOneId={active.id} caredOneName={active.name} />}
    </div>
  );
}

function GroupsTab({ Z }: { Z: (cn: string, en: string) => string }) {
  const { data: groups, isLoading } = useCareGroups();
  const list = (groups || []) as any[];
  const [groupId, setGroupId] = useState<string | null>(null);
  const activeGroup = list.find((g) => String(g.id) === groupId) || list[0];
  const { data: groupCaredOnes, isLoading: loadingPeople } = useGroupCaredOnes(activeGroup ? String(activeGroup.id) : null);
  const allPeople: Person[] = (groupCaredOnes || []).map((c: any) => ({
    id: bare(c.user_id || c.id),
    name: c.full_name || c.name || Z("被护理者", "Cared one"),
  }));
  const gid = activeGroup ? bare(activeGroup.id) : "";
  // Life360 per-circle sharing: hide people who paused their location for this group (fail closed).
  const { data: visibleIds, isLoading: loadingPaused } = useQuery({
    queryKey: ["groupVisible", gid, allPeople.map((p) => p.id).join(",")],
    enabled: !!gid && allPeople.length > 0,
    queryFn: async () => new Set((await Promise.all(allPeople.map((p) =>
      fetchPausedGroupIds(p.id).then((s) => (s.has(gid) ? null : p.id), () => null)))).filter(Boolean) as string[]),
  });
  const people = allPeople.filter((p) => visibleIds?.has(p.id));
  if (isLoading) return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
  if (!list.length) return <p className="text-muted-foreground py-8 text-center">{Z("你还没有加入护理群组。", "You are not in a care group yet.")}</p>;
  return (
    <div className="space-y-4">
      {list.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {list.map((g) => (
            <Button key={g.id} size="sm" variant={String(activeGroup?.id) === String(g.id) ? "secondary" : "ghost"} onClick={() => setGroupId(String(g.id))}>
              {g.name || g.title || Z("护理群组", "Care group")}
            </Button>
          ))}
        </div>
      )}
      {loadingPeople || (allPeople.length > 0 && loadingPaused) ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <PeopleSwitcher key={String(activeGroup?.id)} people={people} empty={Z("这个群组还没有被护理者。", "This group has no cared ones yet.")} />
      )}
    </div>
  );
}

function MeTab({ Z }: { Z: (cn: string, en: string) => string }) {
  const { toast } = useToast();
  const me = bare(getStoredWPUser()?.user_id);
  const { data: flags } = useLocationSharingFlags(me || null);
  const setFlags = useSetLocationSharingFlags();
  const [checking, setChecking] = useState(false);
  const checkIn = async () => {
    setChecking(true);
    try {
      const pos = await getCurrentPosition({ timeout: 8000 });
      if (!pos) throw new Error(Z("无法获取位置", "Location unavailable"));
      const n = await (await import("@/features/location/circle-alerts")).checkInToCircles(`${pos.latitude.toFixed(4)}, ${pos.longitude.toFixed(4)}`);
      toast({ title: Z("已签到", "Checked in"), description: Z(`已通知 ${n} 人`, `Notified ${n}`) });
    } catch (e: any) {
      toast({ title: Z("签到失败", "Check-in failed"), description: e?.message, variant: "destructive" });
    } finally { setChecking(false); }
  };
  const save = (patch: { shareOn?: boolean; emergencyAllowed?: boolean }) =>
    setFlags.mutate({ userId: me, ...patch }, {
      onError: (e: any) => toast({ title: Z("保存失败", "Could not save"), description: e?.message, variant: "destructive" }),
    });
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          <label className="flex items-center justify-between gap-3">
            <span>
              <span className="block text-sm font-medium">{Z("开启实时位置分享", "Live location sharing")}</span>
              <span className="block text-xs text-muted-foreground">{Z("开启后，应用打开时每 3 分钟更新一次你的位置，照顾你的人可以看到。", "While the app is open, your location updates every 3 minutes for the people who care for you.")}</span>
            </span>
            <Switch checked={!!flags?.shareOn} disabled={setFlags.isPending} onCheckedChange={(v) => save({ shareOn: v })} />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span>
              <span className="block text-sm font-medium">{Z("允许紧急位置请求", "Allow emergency location requests")}</span>
              <span className="block text-xs text-muted-foreground">{Z("开启后，紧急时护理者不需要你确认就能拿到你的位置。", "In an emergency your caregiver can get your location without asking you first.")}</span>
            </span>
            <Switch checked={!!flags?.emergencyAllowed} disabled={setFlags.isPending} onCheckedChange={(v) => save({ emergencyAllowed: v })} />
          </label>
          {me && <CircleSharingSwitches userId={me} />}
          <Button size="sm" variant="outline" disabled={checking} onClick={checkIn}>
            {checking ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <MapPin className="h-4 w-4 mr-1" />}
            {Z("签到", "Check in")}
          </Button>
        </CardContent>
      </Card>
      {me && <LocationCard caredOneId={me} caredOneName={Z("我", "Me")} />}
    </div>
  );
}

/**
 * /find — Me / My people (REL 219) / My groups (REL 223, members marked as
 * cared one). Every person opens the same standard LocationCard.
 */
export default function FindCaredOnes() {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const { toast } = useToast();
  const { data: caredOnes, isLoading } = useUserCaredOnes();
  const [tab, setTab] = useState<MainTab>("people");

  const people = useMemo<Person[]>(
    () =>
      (caredOnes || [])
        .filter((c: any) => !c.invitation_status || c.invitation_status === "accepted")
        .map((c: any) => ({ id: bare(c.user_id ?? c.cared_one?.id), name: c.cared_one?.full_name || Z("被护理者", "Cared one") }))
        .filter((p) => p.id),
    [caredOnes, isCN],
  );

  // A location request notification opens /find?request_from=<asker>[&emergency=1].
  const [requesterId, setRequesterId] = useState<string | null>(null);
  const [emergency, setEmergency] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setRequesterId(q.get("request_from"));
    setEmergency(q.get("emergency") === "1");
  }, []);
  const { data: requester } = useQuery({
    queryKey: ["locationRequester", requesterId],
    queryFn: () => fetchWPUserProfile(String(requesterId)),
    enabled: !!requesterId,
  });
  const respond = useRespondToLocationRequest();
  const [locating, setLocating] = useState(false);
  const clearRequest = () => {
    setRequesterId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("request_from");
    url.searchParams.delete("emergency");
    window.history.replaceState({}, "", url.toString());
  };
  const answer = async (accept: boolean) => {
    if (!requesterId) return;
    let position;
    if (accept) {
      setLocating(true);
      position = await getCurrentPosition({ timeout: 15000 });
      setLocating(false);
      if (!position) {
        toast({ title: Z("拿不到你的位置", "Could not get your location"), description: Z("请在浏览器或手机设置里允许本应用使用位置后再试。", "Allow location access for this app in your browser or phone settings, then try again."), variant: "destructive" });
        return;
      }
    }
    respond.mutate({ requesterId, accept, position }, {
      onSuccess: () => { toast({ title: accept ? Z("已允许，实时位置分享已开启 ✓", "Allowed — live sharing is on ✓") : Z("已告诉对方暂不分享", "They were told you are not sharing") }); clearRequest(); },
      onError: (e: any) => toast({ title: Z("操作失败", "Failed"), description: e?.message, variant: "destructive" }),
    });
  };
  const requesterName = requester?.full_name || Z("你的护理者", "Your caregiver");
  const busy = locating || respond.isPending;

  const tabs: { key: MainTab; label: string }[] = [
    { key: "me", label: Z("我", "Me") },
    { key: "people", label: Z("我的亲友", "My people") },
    { key: "groups", label: Z("我的群组", "My groups") },
  ];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">{Z("定位", "Find")}</h1>

      {requesterId && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            {emergency ? (
              <>
                <p className="font-semibold">{Z(`${requesterName}发出了紧急位置请求`, `${requesterName} sent an emergency location request`)}</p>
                <p className="text-sm text-muted-foreground">{Z("如果你允许紧急请求，你的位置已自动发送，不需要操作。", "If you allow emergency requests, your location was sent automatically — nothing to do.")}</p>
                <Button variant="outline" onClick={clearRequest}>{Z("知道了", "OK")}</Button>
              </>
            ) : (
              <>
                <p className="font-semibold">{Z(`${requesterName}请求查看你的位置，是否允许？`, `${requesterName} asks to see your location. Allow?`)}</p>
                <p className="text-sm text-muted-foreground">{Z("允许后会开启实时位置分享，可以随时在「我」里关掉。", "Allowing turns on live sharing. You can turn it off any time under Me.")}</p>
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => answer(true)} disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
                    {Z("允许", "Allow")}
                  </Button>
                  <Button variant="outline" onClick={() => answer(false)} disabled={busy}>{Z("不允许", "Decline")}</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 ${tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "me" && <MeTab Z={Z} />}
      {tab === "people" && (isLoading
        ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        : <PeopleSwitcher people={people} empty={Z("你还没有被护理者，先在「被护理者」页面添加。", "You have no cared ones yet — add one on the Cared Ones page first.")} />)}
      {tab === "groups" && <GroupsTab Z={Z} />}
    </div>
  );
}
