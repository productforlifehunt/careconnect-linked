import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Battery, Bell, Clock, Loader2, MapPin, Navigation, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fetchLocationHistory, type LocationSnapshot } from "@/features/location/source.wordpress";
import { sendLocationRequestWordPress } from "@/features/location/source.wordpress-extended";
import { getDistanceMeters } from "@/lib/locationService";
import { formatDateTime } from "@/lib/locale";
import { useSafetyCircle, timeAgo } from "./useSafetyCircle";

/** Life360-style member detail: live position, breadcrumb trail, daily drive stats. */
export default function SafetyMemberDetail() {
  const { userId = "" } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const { toast } = useToast();
  const { members } = useSafetyCircle();
  const member = members.find((m) => m.userId === String(userId));
  const [requesting, setRequesting] = useState(false);

  const historyQ = useQuery({
    queryKey: ["safety", "history", userId],
    queryFn: () => fetchLocationHistory(userId, { limit: 200 }),
    enabled: !!userId,
    refetchInterval: 60_000,
  });

  const history: LocationSnapshot[] = historyQ.data || [];
  const trail = useMemo(
    () =>
      history
        .filter((h) => h.latitude != null && h.longitude != null)
        .map((h) => [Number(h.latitude), Number(h.longitude)] as [number, number])
        .slice()
        .reverse(),
    [history]
  );

  const stats = useMemo(() => {
    let meters = 0;
    for (let i = 1; i < trail.length; i++) {
      meters += getDistanceMeters(trail[i - 1][0], trail[i - 1][1], trail[i][0], trail[i][1]);
    }
    const speeds = history.map((h) => Number(h.speed || 0)).filter((s) => Number.isFinite(s) && s > 0);
    return {
      km: meters / 1000,
      topKmh: speeds.length ? Math.max(...speeds) * 3.6 : 0,
      points: history.length,
    };
  }, [trail, history]);

  const mapEl = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapEl.current || map.current) return;
    const m = L.map(mapEl.current, { zoomControl: false, attributionControl: false }).setView([39.83, -98.58], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(m);
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m || trail.length === 0) return;
    const line = L.polyline(trail, { color: "hsl(var(--primary))", weight: 4, opacity: 0.7 }).addTo(m);
    const last = trail[trail.length - 1];
    const pin = L.circleMarker(last, { radius: 8, color: "#fff", weight: 3, fillColor: "hsl(var(--primary))", fillOpacity: 1 }).addTo(m);
    m.fitBounds(line.getBounds(), { padding: [40, 40] });
    return () => {
      line.remove();
      pin.remove();
    };
  }, [trail]);

  const requestLocation = async () => {
    setRequesting(true);
    try {
      await sendLocationRequestWordPress({ caredOneId: String(userId), message: Z("请分享你的当前位置。", "Please share your current location.") });
      toast({ title: Z("已发送位置请求", "Location request sent") });
    } catch {
      toast({ title: Z("请求发送失败", "Could not send request"), variant: "destructive" });
    } finally {
      setRequesting(false);
    }
  };

  const latest = member?.snapshot || history[0] || null;

  return (
    <div className="pb-4">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/")} aria-label={Z("返回", "Back")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="truncate font-semibold">{member?.name || Z("成员", "Member")}</span>
        {member?.isSelf && (
          <Badge variant="secondary" className="h-4 px-1 text-[10px]">
            {Z("我", "You")}
          </Badge>
        )}
      </div>

      <div ref={mapEl} className="h-[38vh] min-h-[240px] w-full bg-muted" />

      <div className="space-y-3 px-4 py-4">
        <div className="rounded-xl border p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 text-primary" />
            {latest?.address_text ||
              (latest?.latitude != null
                ? `${latest.latitude.toFixed(5)}, ${latest.longitude?.toFixed(5)}`
                : Z("暂无位置", "No location shared"))}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(latest?.captured_at, isCN)}
            </span>
            {latest?.battery_level != null && (
              <span className="flex items-center gap-1">
                <Battery className="h-3 w-3" />
                {Math.round(latest.battery_level)}%
              </span>
            )}
            {latest?.speed != null && (
              <span className="flex items-center gap-1">
                <Navigation className="h-3 w-3" />
                {Math.round(Number(latest.speed) * 3.6)} km/h
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label={Z("行程距离", "Distance")} value={`${stats.km.toFixed(1)} km`} />
          <Stat label={Z("最高速度", "Top speed")} value={`${Math.round(stats.topKmh)} km/h`} />
          <Stat label={Z("位置点", "Pings")} value={String(stats.points)} />
        </div>

        {!member?.isSelf && (
          <Button variant="outline" className="w-full" onClick={requestLocation} disabled={requesting}>
            {requesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bell className="mr-2 h-4 w-4" />}
            {Z("请求位置更新", "Request location update")}
          </Button>
        )}

        <div>
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Route className="h-4 w-4" />
            {Z("位置历史", "Location history")}
          </h2>
          {historyQ.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{Z("暂无历史记录。", "No history yet.")}</p>
          ) : (
            <ol className="space-y-2">
              {history.slice(0, 40).map((h) => (
                <li key={h.id} className="flex gap-3 rounded-lg border p-2.5">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">
                      {h.address_text || `${h.latitude?.toFixed(5)}, ${h.longitude?.toFixed(5)}`}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {h.captured_at ? formatDateTime(h.captured_at, isCN ? "zh-CN" : "en") : ""}
                      {h.is_emergency === "b55" ? ` · ${Z("紧急 SOS", "SOS")}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3 text-center">
      <div className="text-sm font-semibold">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
