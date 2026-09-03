import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Car, Gauge, Route, Timer, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { fetchLocationHistory, type LocationSnapshot } from "@/features/location/source.wordpress";
import { getDistanceMeters } from "@/lib/locationService";
import { formatDateTime } from "@/lib/locale";
import { useSafetyCircle } from "./useSafetyCircle";

interface Trip {
  start: string;
  end: string;
  km: number;
  minutes: number;
  topKmh: number;
  points: number;
}

/** Group ordered snapshots into trips: movement runs separated by >10 min of standing still. */
function buildTrips(history: LocationSnapshot[]): Trip[] {
  const pts = history
    .filter((h) => h.latitude != null && h.longitude != null && h.captured_at)
    .map((h) => ({
      lat: Number(h.latitude),
      lng: Number(h.longitude),
      t: new Date(h.captured_at as string).getTime(),
      speed: Number(h.speed || 0),
    }))
    .filter((p) => Number.isFinite(p.t))
    .sort((a, b) => a.t - b.t);

  const trips: Trip[] = [];
  let run: typeof pts = [];

  const flush = () => {
    if (run.length < 3) {
      run = [];
      return;
    }
    let meters = 0;
    for (let i = 1; i < run.length; i++) {
      meters += getDistanceMeters(run[i - 1].lat, run[i - 1].lng, run[i].lat, run[i].lng);
    }
    if (meters < 300) {
      run = [];
      return;
    }
    const speeds = run.map((p) => p.speed).filter((s) => Number.isFinite(s) && s > 0);
    trips.push({
      start: new Date(run[0].t).toISOString(),
      end: new Date(run[run.length - 1].t).toISOString(),
      km: meters / 1000,
      minutes: Math.max(1, Math.round((run[run.length - 1].t - run[0].t) / 60000)),
      topKmh: speeds.length ? Math.max(...speeds) * 3.6 : 0,
      points: run.length,
    });
    run = [];
  };

  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const prev = pts[i - 1];
    if (!prev) {
      run = [p];
      continue;
    }
    const gapMin = (p.t - prev.t) / 60000;
    const moved = getDistanceMeters(prev.lat, prev.lng, p.lat, p.lng);
    // A long pause, or a long stationary stretch, ends the trip.
    if (gapMin > 20 || (gapMin > 10 && moved < 80)) {
      flush();
      run = [p];
    } else {
      run.push(p);
    }
  }
  flush();

  return trips.reverse();
}

/** Driving & movement reports built from the location snapshots we already store. */
export default function SafetyDrives() {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");
  const L = (cn: string, en: string) => (zh ? cn : en);
  const { members, selfId } = useSafetyCircle();
  const [who, setWho] = useState<string | null>(null);
  const activeId = who || selfId || members[0]?.userId || null;
  const active = members.find((m) => m.userId === activeId);

  const historyQ = useQuery({
    queryKey: ["safety", "drives", activeId],
    queryFn: () => fetchLocationHistory(String(activeId), { limit: 500 }),
    enabled: !!activeId,
  });

  const trips = useMemo(() => buildTrips(historyQ.data || []), [historyQ.data]);

  const totals = useMemo(() => {
    const km = trips.reduce((s, t) => s + t.km, 0);
    const minutes = trips.reduce((s, t) => s + t.minutes, 0);
    const top = trips.reduce((s, t) => Math.max(s, t.topKmh), 0);
    return { km, minutes, top, count: trips.length };
  }, [trips]);

  return (
    <div className="space-y-4 px-4 py-4 md:px-0">
      <header>
        <h1 className="flex items-center gap-2 text-xl font-bold md:text-2xl">
          <Car className="h-5 w-5 text-primary" />
          {L("出行报告", "Trip reports")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {L("根据位置记录整理出的行程、里程与最高速度。", "Trips, distance and top speed worked out from recorded locations.")}
        </p>
      </header>

      {members.length > 1 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
          {members.map((m) => (
            <Button
              key={m.userId}
              size="sm"
              variant={m.userId === activeId ? "default" : "outline"}
              className="shrink-0 rounded-full"
              onClick={() => setWho(m.userId)}
            >
              {m.isSelf ? L("我", "Me") : m.name}
            </Button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: Route, label: L("行程", "Trips"), value: String(totals.count) },
          { icon: TrendingUp, label: L("总里程", "Distance"), value: `${totals.km.toFixed(1)} km` },
          { icon: Timer, label: L("在路上", "Time moving"), value: `${totals.minutes} ${L("分钟", "min")}` },
          { icon: Gauge, label: L("最高速度", "Top speed"), value: `${Math.round(totals.top)} km/h` },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <s.icon className="h-4 w-4 text-primary" />
              <p className="mt-2 text-lg font-bold leading-none">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {active ? (active.isSelf ? L("我的行程", "My trips") : L(`${active.name} 的行程`, `${active.name}'s trips`)) : L("行程", "Trips")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {historyQ.isLoading && (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </>
          )}
          {!historyQ.isLoading && trips.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {L("还没有可以整理成行程的位置记录。", "No location records long enough to form a trip yet.")}
            </p>
          )}
          {trips.map((t) => (
            <div key={t.start} className="flex items-center justify-between rounded-xl border p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{formatDateTime(t.start)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t.minutes} {L("分钟", "min")} · {t.points} {L("个位置点", "points")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant="secondary">{t.km.toFixed(1)} km</Badge>
                {t.topKmh > 0 && <Badge variant="outline">{Math.round(t.topKmh)} km/h</Badge>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
