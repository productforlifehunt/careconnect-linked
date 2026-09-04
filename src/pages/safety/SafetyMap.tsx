import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { themeColor } from "@/lib/theme-color";
import { useTranslation } from "react-i18next";
import {
  Battery, Crosshair, Loader2, MapPin, Navigation,
  RefreshCw, ShieldAlert, Users, CheckCircle2, ChevronRight, Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getCurrentPosition, getBatteryLevel, reverseGeocode, checkBreaches } from "@/lib/locationService";
import { writeLocationAndCheckZones } from "@/features/location/source.wordpress";
import { zoneColorOf } from "@/components/location/ZoneColorPicker";
import { createNotificationWordPress } from "@/features/notifications/source.wordpress";
import { fetchCaredOneLocationSettingsWordPress } from "@/features/location/source.wordpress-extended";
import { useSafetyCircle, timeAgo, type SafetyMember } from "./useSafetyCircle";

const POLL_MS = 15_000;

function initialsOf(name: string) {
  return name.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function SafetyMap() {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { selfId, circles, circleId, setCircleId, members, zones, loading, refresh } = useSafetyCircle(POLL_MS);

  const [sharing, setSharing] = useState(false);
  const [busy, setBusy] = useState<null | "share" | "checkin" | "sos" | "refresh">(null);
  const [sosOpen, setSosOpen] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const mapEl = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);
  const zoneLayers = useRef<L.Layer[]>([]);
  const breachSeen = useRef<Record<string, number>>({});

  const located = useMemo(
    () => members.filter((m) => m.snapshot?.latitude != null && m.snapshot?.longitude != null),
    [members]
  );

  // ── Sharing state from backend ───────────────────────────────
  useEffect(() => {
    if (!selfId) return;
    (async () => {
      try {
        const s = await fetchCaredOneLocationSettingsWordPress(String(selfId));
        if (s?.sharing_enabled) setSharing(true);
      } catch {}
    })();
  }, [selfId]);

  // ── Map init ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapEl.current || map.current) return;
    const m = L.map(mapEl.current, { zoomControl: false, attributionControl: false }).setView([39.83, -98.58], 4);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(m);
    L.control.zoom({ position: "bottomright" }).addTo(m);
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  // ── Places (geofences) ──────────────────────────────────────
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    zoneLayers.current.forEach((l) => m.removeLayer(l));
    zoneLayers.current = [];
    zones.filter((z) => z.is_active).forEach((z) => {
      const isDanger = !!z.is_danger;
      const color = zoneColorOf(z, isDanger ? "#EF4444" : themeColor("--primary", "#2563eb"));
      const label = isCN ? z.zone_type_label_zh : z.zone_type_label;
      const isPolygon = String(z.shape_type).toLowerCase() === "polygon" && z.polygon_points?.length >= 3;
      if (isPolygon) {
        const poly = L.polygon(z.polygon_points, {
          color,
          weight: 2,
          fillOpacity: 0.15,
          dashArray: isDanger ? "6 4" : undefined,
        }).addTo(m);
        poly.bindPopup(`<b>${label}</b><br/>${z.description ? `${z.description} · ` : ""}${isCN ? "手绘范围" : "Drawn area"}`);
        zoneLayers.current.push(poly);
        return;
      }
      if (z.latitude == null || z.longitude == null) return;
      const c = L.circle([z.latitude, z.longitude], {
        radius: z.radius_meters || 200,
        color,
        weight: 2,
        fillOpacity: 0.12,
        dashArray: isDanger ? "6 4" : undefined,
      }).addTo(m);
      c.bindPopup(`<b>${label}</b><br/>${z.description ? `${z.description} · ` : ""}${z.radius_meters || 200}m`);
      zoneLayers.current.push(c);
    });


  }, [zones]);

  // ── Member pins ─────────────────────────────────────────────
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    markers.current.forEach((mk) => mk.remove());
    markers.current = [];
    if (!located.length) return;

    located.forEach((person) => {
      const snap = person.snapshot!;
      const moving = Number(snap.speed || 0) > 2.5;
      const icon = L.divIcon({
        className: "notch-safety-pin",
        html: `<div style="width:44px;height:44px;border-radius:50%;background:${person.isSelf ? "hsl(var(--primary))" : "hsl(var(--foreground))"};color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;border:3px solid #fff;box-shadow:0 3px 12px rgba(0,0,0,.35)">
          ${initialsOf(person.name)}
          ${moving ? `<span style="position:absolute;bottom:-3px;right:-3px;width:14px;height:14px;border-radius:50%;background:#22c55e;border:2px solid #fff"></span>` : ""}
        </div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
      const mk = L.marker([snap.latitude!, snap.longitude!], { icon })
        .addTo(m)
        .bindPopup(
          `<b>${person.name}</b><br/>${snap.address_text || `${snap.latitude!.toFixed(4)}, ${snap.longitude!.toFixed(4)}`}<br/>${timeAgo(snap.captured_at, isCN)}`
        );
      mk.on("click", () => setFocused(person.userId));
      markers.current.push(mk);
    });

    if (focused) {
      const p = located.find((x) => x.userId === focused);
      if (p) m.setView([p.snapshot!.latitude!, p.snapshot!.longitude!], 15);
      return;
    }
    if (located.length === 1) {
      m.setView([located[0].snapshot!.latitude!, located[0].snapshot!.longitude!], 14);
    } else {
      m.fitBounds(L.latLngBounds(located.map((p) => [p.snapshot!.latitude!, p.snapshot!.longitude!] as [number, number])), {
        padding: [60, 60],
      });
    }
  }, [located, focused, isCN]);

  // ── Geofence breach toasts ──────────────────────────────────
  useEffect(() => {
    if (!zones.length || !located.length) return;
    located.forEach((p) => {
      checkBreaches(p.snapshot!.latitude!, p.snapshot!.longitude!, zones).forEach((b) => {
        const key = `${p.userId}-${b.zoneId}-${b.alertType}`;
        const now = Date.now();
        if (now - (breachSeen.current[key] || 0) < 5 * 60 * 1000) return;
        breachSeen.current[key] = now;
        toast({
          title: b.alertType.includes("danger") ? Z("⚠️ 危险地点提醒", "⚠️ Danger place alert") : Z("📍 地点提醒", "📍 Place alert"),
          description: `${p.name} — ${b.zoneName}`,
          variant: b.alertType.includes("danger") ? "destructive" : "default",
        });
      });
    });
  }, [located, zones]);

  // ── Background sharing loop ─────────────────────────────────
  useEffect(() => {
    if (!sharing || !selfId) return;
    const push = async () => {
      try {
        const pos = await getCurrentPosition({ timeout: 10000 });
        if (!pos) return;
        const battery = await getBatteryLevel().catch(() => null);
        await writeLocationAndCheckZones(pos.latitude, pos.longitude, {
          accuracy: pos.accuracy,
          speed: (pos as any).speed ?? null,
          heading: (pos as any).heading ?? null,
          battery_level: battery,
        });
      } catch {}
    };
    push();
    const id = setInterval(push, POLL_MS);
    return () => clearInterval(id);
  }, [sharing, selfId]);

  // ── Actions ─────────────────────────────────────────────────
  const notifyCircle = async (title: string, message: string, type: string, actionUrl: string) => {
    await Promise.all(
      members
        .filter((m) => !m.isSelf)
        .map((m) =>
          createNotificationWordPress({ user_id: m.userId, type, title, message, action_url: actionUrl }).catch(() => null)
        )
    );
  };

  const toggleSharing = async (next: boolean) => {
    setSharing(next);
    setBusy("share");
    try {
      if (next) {
        const pos = await getCurrentPosition({ timeout: 10000 });
        if (!pos) throw new Error("no-position");
        const battery = await getBatteryLevel().catch(() => null);
        await writeLocationAndCheckZones(pos.latitude, pos.longitude, { accuracy: pos.accuracy, battery_level: battery });
        await refresh();
        toast({ title: Z("已开启位置共享", "Location sharing on") });
      } else {
        const { disableMyLocationSharingWordPress } = await import("@/features/location/source.wordpress-extended");
        await disableMyLocationSharingWordPress();
        toast({ title: Z("已关闭位置共享", "Location sharing off") });
      }
    } catch {
      setSharing(!next);
      toast({
        title: Z("无法获取位置", "Could not get your location"),
        description: Z("请在系统设置中允许定位权限。", "Allow location access in your browser or device settings."),
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };

  const handleCheckIn = async () => {
    setBusy("checkin");
    try {
      const pos = await getCurrentPosition({ timeout: 10000 });
      if (!pos) throw new Error("no-position");
      const address = await reverseGeocode(pos.latitude, pos.longitude).catch(() => "");
      const battery = await getBatteryLevel().catch(() => null);
      await writeLocationAndCheckZones(pos.latitude, pos.longitude, {
        accuracy: pos.accuracy,
        battery_level: battery,
        address_text: address || null,
      });
      await notifyCircle(
        Z("✅ 签到", "✅ Check-in"),
        Z(`已在${address || "当前位置"}签到。`, `Checked in at ${address || "their current location"}.`),
        "check_in",
        "/"
      );
      await refresh();
      toast({ title: Z("签到已发送", "Check-in sent"), description: address || undefined });
    } catch {
      toast({ title: Z("签到失败", "Check-in failed"), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const handleSOS = async () => {
    setBusy("sos");
    try {
      const pos = await getCurrentPosition({ timeout: 8000 }).catch(() => null);
      await writeLocationAndCheckZones(pos?.latitude ?? 0, pos?.longitude ?? 0, {
        accuracy: pos?.accuracy ?? null,
        isEmergency: true,
      });
      await refresh();
      setSosOpen(false);
      toast({
        title: Z("SOS 已发送", "SOS sent"),
        description: Z("圈内所有成员已收到紧急提醒。", "Everyone in your circle has been alerted."),
      });
    } catch {
      toast({ title: Z("SOS 发送失败", "SOS failed"), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const recenter = () => {
    const self = located.find((m) => m.isSelf);
    if (self) {
      setFocused(self.userId);
      map.current?.setView([self.snapshot!.latitude!, self.snapshot!.longitude!], 15);
    } else {
      setFocused(null);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Circle switcher */}
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
        {circles.length > 0 ? (
          <Select value={circleId || undefined} onValueChange={setCircleId}>
            <SelectTrigger className="h-8 w-[190px] text-sm">
              <SelectValue placeholder={Z("选择圈子", "Select circle")} />
            </SelectTrigger>
            <SelectContent>
              {circles.map((c: any) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Button variant="link" size="sm" className="px-0" onClick={() => navigate("/circle")}>
            {Z("创建你的第一个圈子", "Create your first circle")}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-8 w-8"
          onClick={async () => {
            setBusy("refresh");
            await refresh();
            setBusy(null);
          }}
          aria-label={Z("刷新", "Refresh")}
        >
          {busy === "refresh" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {/* Map + side panel: stacked on phones, side by side from tablet up */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-4 lg:p-4">
      {/* Map */}
      <div className="relative lg:overflow-hidden lg:rounded-2xl lg:border">
        <div ref={mapEl} className="h-[45vh] min-h-[280px] w-full bg-muted md:h-[52vh] lg:h-[calc(100dvh-11rem)]" />
        <div className="absolute right-3 top-3 z-[400] flex flex-col gap-2">
          <Button size="icon" variant="secondary" className="h-9 w-9 shadow" onClick={recenter} aria-label={Z("回到我的位置", "Recenter")}>
            <Crosshair className="h-4 w-4" />
          </Button>
        </div>
        {loading && (
          <div className="pointer-events-none absolute inset-x-0 top-3 z-[400] flex justify-center">
            <span className="rounded-full bg-background/90 px-3 py-1 text-xs shadow">{Z("正在加载位置…", "Loading locations…")}</span>
          </div>
        )}
      </div>

      <div className="lg:space-y-3">
      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2 border-b px-4 py-3 lg:rounded-2xl lg:border lg:p-3">
        <Button variant="secondary" onClick={handleCheckIn} disabled={busy === "checkin"}>
          {busy === "checkin" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
          {Z("签到", "Check in")}
        </Button>
        <Button variant="destructive" onClick={() => setSosOpen(true)}>
          <ShieldAlert className="mr-2 h-4 w-4" />
          {Z("紧急 SOS", "Emergency SOS")}
        </Button>
      </div>

      {/* Sharing toggle */}
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 lg:rounded-2xl lg:border lg:p-3">
        <div>
          <Label htmlFor="notch-share" className="text-sm font-medium">
            {Z("共享我的位置", "Share my location")}
          </Label>
          <p className="text-xs text-muted-foreground">
            {Z("每 15 秒向圈子成员更新一次。", "Updates your circle every 15 seconds.")}
          </p>
        </div>
        <Switch id="notch-share" checked={sharing} onCheckedChange={toggleSharing} disabled={busy === "share"} />
      </div>

      {/* Member list */}
      <ul className="divide-y lg:overflow-hidden lg:rounded-2xl lg:border">
        {members.length === 0 && !loading && (
          <li className="px-4 py-10 text-center text-sm text-muted-foreground">
            {Z("圈子里还没有成员。", "No one in this circle yet.")}
          </li>
        )}
        {members.map((m) => (
          <MemberRow key={m.userId} member={m} isCN={isCN} onOpen={() => navigate(`/member/${m.userId}`)} onFocus={() => setFocused(m.userId)} />
        ))}
      </ul>
      </div>
      </div>

      <Dialog open={sosOpen} onOpenChange={setSosOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{Z("发送紧急 SOS？", "Send emergency SOS?")}</DialogTitle>
            <DialogDescription>
              {Z(
                "圈内所有成员都会立即收到你的位置和紧急提醒。",
                "Everyone in your circle is alerted immediately with your current location."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSosOpen(false)}>
              {Z("取消", "Cancel")}
            </Button>
            <Button variant="destructive" onClick={handleSOS} disabled={busy === "sos"}>
              {busy === "sos" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {Z("发送 SOS", "Send SOS")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MemberRow({
  member,
  isCN,
  onOpen,
  onFocus,
}: {
  member: SafetyMember;
  isCN: boolean;
  onOpen: () => void;
  onFocus: () => void;
}) {
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const snap = member.snapshot;
  const battery = snap?.battery_level;
  const moving = Number(snap?.speed || 0) > 2.5;

  return (
    <li>
      <div className="flex items-center gap-3 px-4 py-3">
        <button type="button" onClick={onFocus} className="shrink-0" aria-label={Z("在地图上定位", "Show on map")}>
          {member.avatar && !avatarBroken ? (
            <img
              src={member.avatar}
              alt={member.name}
              onError={() => setAvatarBroken(true)}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initialsOf(member.name)}
            </span>
          )}
        </button>
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{member.name}</span>
            {member.isSelf && <Badge variant="secondary" className="h-4 px-1 text-[10px]">{Z("我", "You")}</Badge>}
            {moving && (
              <Badge variant="outline" className="h-4 gap-1 px-1 text-[10px]">
                <Car className="h-2.5 w-2.5" />
                {Z("移动中", "Moving")}
              </Badge>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {snap?.address_text ||
                (snap?.latitude != null ? `${snap.latitude.toFixed(4)}, ${snap.longitude?.toFixed(4)}` : Z("暂无位置", "No location shared"))}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span>{timeAgo(snap?.captured_at, isCN)}</span>
            {battery != null && (
              <span className="flex items-center gap-1">
                <Battery className="h-3 w-3" />
                {Math.round(battery)}%
              </span>
            )}
            {snap?.speed != null && moving && (
              <span className="flex items-center gap-1">
                <Navigation className="h-3 w-3" />
                {Math.round(Number(snap.speed) * 3.6)} km/h
              </span>
            )}
          </div>
        </button>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
    </li>
  );
}
