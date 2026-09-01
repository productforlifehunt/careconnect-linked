import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Home, Loader2, MapPin, Pencil, Plus, Trash2, Crosshair, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getCurrentPosition } from "@/lib/locationService";
import {
  createSafeZoneWordPress, updateSafeZoneWordPress, deleteSafeZoneWordPress,
} from "@/features/location/source.wordpress-extended";
import {
  ZONE_TYPE, ZONE_TYPE_CODES, zoneTypeLabel, isCustomZone, isDangerZone,
} from "@/features/location/zone-types";
import { useSafetyCircle } from "./useSafetyCircle";

const emptyForm = {
  id: "",
  // CCT 214 a55 zone type + a57 zone name (custom zones carry their own name).
  zone_type: ZONE_TYPE.SAFE as string,
  custom_name: "",
  description: "",
  latitude: "",
  longitude: "",
  radius_meters: "200",
  notify_on_enter: true,
  notify_on_exit: true,
  is_active: true,
  receiver_ids: [] as string[],
};


/** Life360-style "Places" — arrival/departure geofences, fully managed in-app. */
export default function SafetyPlaces() {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const { toast } = useToast();
  const { selfId, members, zones, loading, refreshZones } = useSafetyCircle();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const openNew = () => {
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const openEdit = (z: any) => {
    const code = String(z.zone_type || ZONE_TYPE.SAFE);
    setForm({
      id: String(z.id),
      zone_type: code,
      custom_name: isCustomZone(code) ? String(z.zone_name || "") : "",
      description: z.description || "",
      latitude: z.latitude != null ? String(z.latitude) : "",
      longitude: z.longitude != null ? String(z.longitude) : "",
      radius_meters: String(z.radius_meters ?? 200),
      notify_on_enter: !!z.notify_on_enter,
      notify_on_exit: !!z.notify_on_exit,
      is_active: !!z.is_active,
      receiver_ids: Array.isArray(z.receiver_ids) ? z.receiver_ids.map(String) : [],
    });
    setOpen(true);
  };

  const useMyLocation = async () => {
    try {
      const pos = await getCurrentPosition({ timeout: 10000 });
      if (!pos) throw new Error("no-position");
      setForm((f) => ({ ...f, latitude: pos.latitude.toFixed(6), longitude: pos.longitude.toFixed(6) }));
    } catch {
      toast({ title: Z("无法获取位置", "Could not get your location"), variant: "destructive" });
    }
  };

  const save = async () => {
    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    const radius = Number(form.radius_meters);
    const isCustom = isCustomZone(form.zone_type);
    if (isCustom && !form.custom_name.trim())
      return toast({ title: Z("请填写自定义区域名称", "Custom zone name is required"), variant: "destructive" });
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180)
      return toast({ title: Z("坐标无效", "Invalid coordinates"), variant: "destructive" });
    if (!Number.isFinite(radius) || radius < 20)
      return toast({ title: Z("半径至少 20 米", "Radius must be at least 20 m"), variant: "destructive" });

    setSaving(true);
    try {
      const payload = {
        zone_type: form.zone_type,
        // a57 — the zone's own name; Safe/Danger get their fixed label.
        zone_name: isCustom ? form.custom_name.trim() : "",
        description: form.description.trim(),
        shape_type: "Radius",
        latitude: lat,
        longitude: lng,
        radius_meters: radius,
        notify_on_enter: form.notify_on_enter,
        notify_on_exit: form.notify_on_exit,
        is_active: form.is_active,
        receiver_ids: form.receiver_ids,
      };
      if (form.id) {
        await updateSafeZoneWordPress(form.id, { ...payload, user_id: String(selfId) });
      } else {
        await createSafeZoneWordPress({ ...payload, user_id: String(selfId) });
      }
      await refreshZones();
      setOpen(false);
      toast({ title: form.id ? Z("地点已更新", "Place updated") : Z("地点已创建", "Place created") });
    } catch (err: any) {
      toast({ title: Z("保存失败", "Could not save place"), description: err?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }

  };

  const remove = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteSafeZoneWordPress(id);
      await refreshZones();
      toast({ title: Z("地点已删除", "Place deleted") });
    } catch {
      toast({ title: Z("删除失败", "Could not delete place"), variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">{Z("地点", "Places")}</h1>
          <p className="text-xs text-muted-foreground">
            {Z("到达和离开时提醒圈子成员。", "Get alerts when your circle arrives or leaves.")}
          </p>
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus className="mr-1 h-4 w-4" />
          {Z("添加", "Add")}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : zones.length === 0 ? (
        <div className="rounded-xl border border-dashed py-12 text-center">
          <Home className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{Z("还没有地点。添加家、学校或工作地点。", "No places yet. Add home, school or work.")}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {zones.map((z: any, idx: number) => {
            const isDanger = isDangerZone(String(z.zone_type));
            const label = zoneTypeLabel(String(z.zone_type), z.zone_name, isCN);
            return (
              <li key={`${z.id || "zone"}-${idx}`} className="flex items-start gap-3 rounded-xl border p-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    isDanger ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                  }`}
                >
                  {isDanger ? <ShieldAlert className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{label}</span>
                    {z.description && (
                      <span className="truncate text-xs text-muted-foreground">{z.description}</span>
                    )}
                    {isDanger && (
                      <Badge variant="destructive" className="h-4 px-1 text-[10px]">
                        {Z("危险", "Danger")}
                      </Badge>
                    )}
                    {!z.is_active && (
                      <Badge variant="outline" className="h-4 px-1 text-[10px]">
                        {Z("已停用", "Paused")}
                      </Badge>
                    )}
                  </div>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {z.latitude != null && z.longitude != null ? `${z.latitude.toFixed(4)}, ${z.longitude.toFixed(4)}` : Z("无坐标", "No coordinates")} · {z.radius_meters || 200} m
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {[z.notify_on_enter ? Z("到达提醒", "Arrival alerts") : null, z.notify_on_exit ? Z("离开提醒", "Departure alerts") : null]
                      .filter(Boolean)
                      .join(" · ") || Z("无提醒", "No alerts")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(z)} aria-label={Z("编辑", "Edit")}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => remove(String(z.id))}
                    disabled={deletingId === String(z.id)}
                    aria-label={Z("删除", "Delete")}
                  >
                    {deletingId === String(z.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? Z("编辑地点", "Edit place") : Z("新建地点", "New place")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="place-type">{Z("区域类型", "Zone type")}</Label>
              <Select
                value={form.zone_type}
                onValueChange={(v) => setForm((f) => ({
                  ...f,
                  zone_type: v,
                  custom_name: isCustomZone(v) ? f.custom_name : "",
                }))}
              >
                <SelectTrigger id="place-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ZONE_TYPE_CODES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {zoneTypeLabel(code, null, isCN)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isCustomZone(form.zone_type) && (
              <div>
                <Label htmlFor="place-custom-name">
                  {Z("自定义区域名称", "Custom zone name")}
                </Label>
                <Input
                  id="place-custom-name"
                  value={form.custom_name}
                  onChange={(e) => setForm((f) => ({ ...f, custom_name: e.target.value }))}
                  placeholder={Z("学校 / 公园", "School / Park")}
                />
              </div>
            )}
            <div>
              <Label htmlFor="place-desc">{Z("描述", "Description")}</Label>
              <Input
                id="place-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder={Z("可选说明", "Optional detail")}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="place-lat">{Z("纬度", "Latitude")}</Label>
                <Input id="place-lat" value={form.latitude} onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="place-lng">{Z("经度", "Longitude")}</Label>
                <Input id="place-lng" value={form.longitude} onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))} />
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={useMyLocation}>
              <Crosshair className="mr-2 h-4 w-4" />
              {Z("使用我的当前位置", "Use my current location")}
            </Button>
            <div>
              <Label htmlFor="place-radius">{Z("半径（米）", "Radius (m)")}</Label>
              <Input
                id="place-radius"
                type="number"
                min={20}
                value={form.radius_meters}
                onChange={(e) => setForm((f) => ({ ...f, radius_meters: e.target.value }))}
              />
            </div>
            <div className="space-y-2 rounded-lg border p-3">
              <ToggleRow
                label={Z("到达时提醒", "Alert on arrival")}
                checked={form.notify_on_enter}
                onChange={(v) => setForm((f) => ({ ...f, notify_on_enter: v }))}
              />
              <ToggleRow
                label={Z("离开时提醒", "Alert on departure")}
                checked={form.notify_on_exit}
                onChange={(v) => setForm((f) => ({ ...f, notify_on_exit: v }))}
              />
              <div>
                <Label className="text-sm">{Z("提醒接收人（对所有地点生效）", "Alert receivers (apply to all places)")}</Label>
                <div className="mt-2 max-h-32 space-y-2 overflow-auto rounded-md border p-2">
                  {members.length === 0 && (
                    <p className="text-xs text-muted-foreground">{Z("暂无可选成员", "No members available")}</p>
                  )}
                  {members.map((m) => {
                    const pid = String(m.userId).replace(/^wp-/, "");
                    const checked = form.receiver_ids.some((r) => String(r).replace(/^wp-/, "") === pid);
                    return (
                      <label key={m.userId} className="flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => setForm((f) => ({
                            ...f,
                            receiver_ids: checked
                              ? f.receiver_ids.filter((r) => String(r).replace(/^wp-/, "") !== pid)
                              : [...f.receiver_ids, pid],
                          }))}
                        />
                        <span>{m.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              <ToggleRow
                label={Z("启用此地点", "Place active")}
                checked={form.is_active}
                onChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {Z("取消", "Cancel")}
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {Z("保存", "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
