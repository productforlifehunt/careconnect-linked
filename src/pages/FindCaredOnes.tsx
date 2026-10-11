import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentPosition } from "@/lib/geolocation";
import { fetchWPUserProfile } from "@/features/shared/wp-users";
import { useRespondToLocationRequest } from "@/hooks/use-care-data";
import { useTranslation } from "react-i18next";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationCard from "@/components/care/LocationCard";
import { useUserCaredOnes } from "@/hooks/use-care-data";

/**
 * Find page for the care apps: the signed-in user's own cared ones (REL 219,
 * accepted), switchable, each shown with the same LocationCard used on the
 * cared-one page and the care-group location tab.
 */
export default function FindCaredOnes() {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const { data: caredOnes, isLoading } = useUserCaredOnes();

  const people = useMemo(
    () =>
      (caredOnes || [])
        .filter((c: any) => !c.invitation_status || c.invitation_status === "accepted")
        .map((c: any) => ({
          id: String(c.user_id ?? c.cared_one?.id ?? "").replace(/^wp-/, ""),
          name: c.cared_one?.full_name || Z("被护理者", "Cared one"),
        }))
        .filter((p) => p.id),
    [caredOnes, isCN],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // A location request notification opens /find?request_from=<asker>.
  const { toast } = useToast();
  const [requesterId, setRequesterId] = useState<string | null>(null);
  useEffect(() => {
    setRequesterId(new URLSearchParams(window.location.search).get("request_from"));
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
      onSuccess: () => { toast({ title: accept ? Z("已分享你的位置 ✓", "Your location was shared ✓") : Z("已告诉对方暂不分享", "They were told you are not sharing") }); clearRequest(); },
      onError: (e: any) => toast({ title: Z("操作失败", "Failed"), description: e?.message, variant: "destructive" }),
    });
  };
  const requesterName = requester?.full_name || Z("你的护理者", "Your caregiver");
  const busy = locating || respond.isPending;
  const active = people.find((p) => p.id === selectedId) || people[0];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">{Z("定位", "Find")}</h1>
      {requesterId && (
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-3">
            <p className="font-semibold">{Z(`${requesterName}请求查看你现在的位置`, `${requesterName} asks to see where you are`)}</p>
            <p className="text-sm text-muted-foreground">{Z("同意后会把你此刻的位置发给对方一次，不会持续追踪。", "Agreeing sends your position right now, once. It does not keep tracking you.")}</p>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => answer(true)} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
                {Z("分享我现在的位置", "Share my location now")}
              </Button>
              <Button variant="outline" onClick={() => answer(false)} disabled={busy}>{Z("暂不分享", "Not now")}</Button>
            </div>
          </CardContent>
        </Card>
      )}
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{Z("加载中…", "Loading…")}</div>
      ) : people.length === 0 ? (requesterId ? null :
        <div className="text-center py-12">
          <MapPin className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">{Z("你还没有被护理者，先在「被护理者」页面添加。", "You have no cared ones yet — add one on the Cared Ones page first.")}</p>
        </div>
      ) : (
        <>
          {people.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {people.map((p) => (
                <Button key={p.id} size="sm" variant={active?.id === p.id ? "default" : "outline"} onClick={() => setSelectedId(p.id)}>
                  {p.name}
                </Button>
              ))}
            </div>
          )}
          {active && <LocationCard key={active.id} caredOneId={active.id} caredOneName={active.name} />}
        </>
      )}
    </div>
  );
}
