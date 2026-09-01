/**
 * General app settings — notifications, device permissions, display.
 * Persisted as one JSON blob on the user's extended profile (CCT 151),
 * which is exactly what the notification dispatcher reads before sending,
 * so a switch turned off here really stops the message.
 */
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Bell, MapPin, CalendarDays, Loader2, Settings2, ExternalLink } from "lucide-react";
import {
  fetchAppSettings,
  saveAppSettings,
  DEFAULT_APP_SETTINGS,
  type AppSettings,
} from "@/features/settings/app-settings";
import {
  checkPermission,
  requestPermission,
  openAppSettings,
  isNative,
  type PermissionKind,
  type PermissionState,
} from "@/features/settings/permissions";
import { applyDisplaySettings } from "@/features/settings/display";
import { subscribeWebPushAndRegister } from "@/features/notifications/tokens.wordpress";

type Z = (cn: string, en: string) => string;

const categories = (Z: Z): { key: string; label: string; hint: string }[] => [
  { key: "chat", label: Z("消息", "Messages"), hint: Z("家人或护理者给你发新消息时", "When family or a caregiver sends you a new message") },
  { key: "booking", label: Z("预约", "Appointments"), hint: Z("预约被接受、确认或取消时", "When an appointment is accepted, confirmed or cancelled") },
  { key: "check_in", label: Z("探望与签到", "Visits and check-ins"), hint: Z("到了该去看看老人、该签到的时候", "Reminders when it is time to visit or check in") },
  { key: "medicine", label: Z("吃药提醒", "Medicine reminders"), hint: Z("到了吃药或日常安排的时间", "When it is time for medicine or a daily routine") },
  { key: "location", label: Z("走失提醒", "Safety alerts"), hint: Z("老人走出安全范围时马上告诉你", "If your loved one leaves the area you marked as safe") },
  { key: "system", label: Z("账号消息", "Account messages"), hint: Z("登录、密码和账号安全相关的通知", "Sign-in, password and account safety notices") },
];

const permissions = (Z: Z): { kind: PermissionKind; label: string; why: string; icon: typeof Bell }[] => [
  { kind: "push", label: Z("手机提醒", "Phone alerts"), why: Z("允许后，即使没打开这个应用也能收到提醒", "Lets us reach you even when the app is closed"), icon: Bell },
  { kind: "location", label: Z("位置", "Location"), why: Z("用来看老人在哪里，以及是否走出安全范围", "Used to show where your loved one is and whether they left the safe area"), icon: MapPin },
  { kind: "calendar", label: Z("日历", "Calendar"), why: Z("可选：把探望安排一起写进你手机的日历", "Optional: also writes visits into your phone's own calendar"), icon: CalendarDays },
];

function stateBadge(state: PermissionState, Z: Z) {
  const map: Record<PermissionState, { text: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    granted: { text: Z("已允许", "On"), variant: "default" },
    denied: { text: Z("已在手机设置里关闭", "Turned off in your settings"), variant: "destructive" },
    prompt: { text: Z("还没设置", "Not chosen yet"), variant: "secondary" },
    unsupported: { text: Z("这台设备用不了", "Not available on this device"), variant: "outline" },
  };
  const m = map[state];
  return <Badge variant={m.variant}>{m.text}</Badge>;
}

export function AppSettingsPanel() {
  const { t, i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z: Z = (cn, en) => (isCN ? cn : en);
  const CATEGORIES = categories(Z);
  const PERMISSIONS = permissions(Z);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["appSettings"],
    queryFn: fetchAppSettings,
  });
  const local = settings ?? DEFAULT_APP_SETTINGS;

  const save = useMutation({
    mutationFn: (patch: Partial<AppSettings>) => saveAppSettings(patch),
    onSuccess: (next) => {
      qc.setQueryData(["appSettings"], next);
      applyDisplaySettings(next.display);
      toast({ title: Z("已保存", "Saved") });
    },
    onError: () => toast({ title: Z("没能保存，请再试一次", "Could not save — please try again"), variant: "destructive" }),
  });

  const [perm, setPerm] = useState<Record<PermissionKind, PermissionState>>({
    push: "prompt",
    location: "prompt",
    calendar: "unsupported",
  });
  const [busy, setBusy] = useState<PermissionKind | null>(null);

  useEffect(() => {
    (async () => {
      const [push, location, calendar] = await Promise.all([
        checkPermission("push"),
        checkPermission("location"),
        checkPermission("calendar"),
      ]);
      setPerm({ push, location, calendar });
    })();
  }, []);

  const setChannel = (channel: "push" | "email" | "sms", value: boolean) =>
    save.mutate({ notifications: { ...local.notifications, [channel]: value } });

  const setCategory = (key: string, enabled: boolean) => {
    const muted = new Set(local.notifications.muted_types);
    enabled ? muted.delete(key) : muted.add(key);
    save.mutate({ notifications: { ...local.notifications, muted_types: [...muted] } });
  };

  const setQuiet = (patch: Partial<{ enabled: boolean; from: string; to: string }>) => {
    const q = { enabled: false, from: "22:00", to: "07:00", ...(local.notifications.quiet_hours ?? {}) };
    save.mutate({ notifications: { ...local.notifications, quiet_hours: { ...q, ...patch } } });
  };

  const ask = async (kind: PermissionKind) => {
    setBusy(kind);
    try {
      const state = await requestPermission(kind);
      setPerm((p) => ({ ...p, [kind]: state }));
      if (kind === "push" && state === "granted") {
        await subscribeWebPushAndRegister(import.meta.env.VITE_VAPID_PUBLIC_KEY);
        save.mutate({
          notifications: { ...local.notifications, push: true },
          permissions_asked: { ...local.permissions_asked, push: true },
        });
      }
      if (state === "denied") {
        toast({
          title: Z("这一项目前是关着的", "This is switched off right now"),
          description: isNative()
            ? Z("打开手机的设置，找到这个应用，把它打开就可以了。", "Open your phone settings, find this app, and switch it on.")
            : Z("在浏览器的网站设置里把它打开，然后刷新页面。", "Switch it on in your browser's settings for this site, then refresh the page."),
        });
      }
    } finally {
      setBusy(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-transparent card-elevated">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">{t("profile.notificationPrefs", Z("我们怎么联系你", "How we reach you"))}</CardTitle>
          <CardDescription className="text-sm">
            {Z("关掉一项，我们就不会再用这个方式联系你。", "Switch one off and we will stop contacting you that way.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {([
            ["push", Z("手机提醒", "Phone alerts"), Z("直接弹在你手机或电脑上", "Pop up on your phone or computer")],
            ["email", Z("邮件", "Email"), Z("发到你注册时用的邮箱", "Sent to the email address on your account")],
            ["sms", Z("短信", "Text message"), Z("只在紧急情况下发，比如老人走失", "Only for urgent things, such as a loved one going missing")],
          ] as const).map(([key, label, hint]) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Label htmlFor={`ch-${key}`} className="text-sm font-medium">{label}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
              </div>
              <Switch
                id={`ch-${key}`}
                checked={local.notifications[key]}
                onCheckedChange={(v) => setChannel(key, v)}
                disabled={save.isPending}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-transparent card-elevated">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">{Z("你想收到哪些提醒", "What you want to hear about")}</CardTitle>
          <CardDescription className="text-sm">{Z("这里的选择对上面每一种联系方式都有效。", "These choices apply to every way of contacting you above.")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {CATEGORIES.map((c) => (
            <div key={c.key} className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Label htmlFor={`cat-${c.key}`} className="text-sm font-medium">{c.label}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">{c.hint}</p>
              </div>
              <Switch
                id={`cat-${c.key}`}
                checked={!local.notifications.muted_types.includes(c.key)}
                onCheckedChange={(v) => setCategory(c.key, v)}
                disabled={save.isPending}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-transparent card-elevated">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">{Z("免打扰时间", "Quiet hours")}</CardTitle>
          <CardDescription className="text-sm">
            {Z("这段时间里不再响铃、不发短信；消息仍会留在应用里，回来就能看到。紧急走失提醒不受影响。", "During these hours we stop ringing your phone and stop texting. Messages still wait for you inside the app. Urgent safety alerts always come through.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <Label htmlFor="quiet-on" className="text-sm font-medium">{Z("开启免打扰", "Turn on quiet hours")}</Label>
            <Switch
              id="quiet-on"
              checked={!!local.notifications.quiet_hours?.enabled}
              onCheckedChange={(v) => setQuiet({ enabled: v })}
              disabled={save.isPending}
            />
          </div>
          {local.notifications.quiet_hours?.enabled && (
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <Label htmlFor="quiet-from" className="text-xs text-muted-foreground">{Z("从", "From")}</Label>
                <Input
                  id="quiet-from"
                  type="time"
                  value={local.notifications.quiet_hours?.from ?? "22:00"}
                  onChange={(e) => setQuiet({ from: e.target.value })}
                  className="w-28"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="quiet-to" className="text-xs text-muted-foreground">{Z("到", "Until")}</Label>
                <Input
                  id="quiet-to"
                  type="time"
                  value={local.notifications.quiet_hours?.to ?? "07:00"}
                  onChange={(e) => setQuiet({ to: e.target.value })}
                  className="w-28"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-transparent card-elevated">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">{Z("看得清楚一点", "Making it easier to read")}</CardTitle>
          <CardDescription className="text-sm">
            {Z("这些改动马上生效，只影响你自己的界面。", "These take effect right away and only change what you see.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">{Z("字的大小", "Text size")}</Label>
            <div className="flex flex-wrap gap-2">
              {([
                ["default", Z("标准", "Standard")],
                ["large", Z("大", "Large")],
                ["xlarge", Z("特大", "Extra large")],
              ] as const).map(([value, label]) => (
                <Button
                  key={value}
                  size="sm"
                  variant={local.display.text_size === value ? "default" : "outline"}
                  onClick={() => save.mutate({ display: { ...local.display, text_size: value } })}
                  disabled={save.isPending}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">{Z("亮色或暗色", "Light or dark")}</Label>
            <div className="flex flex-wrap gap-2">
              {([
                ["system", Z("跟手机一样", "Match my device")],
                ["light", Z("亮色", "Light")],
                ["dark", Z("暗色", "Dark")],
              ] as const).map(([value, label]) => (
                <Button
                  key={value}
                  size="sm"
                  variant={local.display.theme === value ? "default" : "outline"}
                  onClick={() => save.mutate({ display: { ...local.display, theme: value } })}
                  disabled={save.isPending}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Label htmlFor="reduce-motion" className="text-sm font-medium">{Z("减少晃动效果", "Reduce movement")}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {Z("关掉画面的滑动和淡入淡出，看着更稳。", "Turns off sliding and fading, which can feel steadier.")}
              </p>
            </div>
            <Switch
              id="reduce-motion"
              checked={local.display.reduce_motion}
              onCheckedChange={(v) => save.mutate({ display: { ...local.display, reduce_motion: v } })}
              disabled={save.isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-transparent card-elevated">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">{Z("这台设备上的权限", "What this device allows")}</CardTitle>
          <CardDescription className="text-sm">
            {Z("只有你自己点了才会去问，随时可以改。", "We only ask when you tap, and you can change it any time.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {PERMISSIONS.map(({ kind, label, why, icon: Icon }) => (
            <div key={kind} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 min-w-0">
                <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{label}</span>
                    {stateBadge(perm[kind], Z)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{why}</p>
                </div>
              </div>
              <div className="shrink-0">
                {perm[kind] === "prompt" && (
                  <Button size="sm" variant="outline" onClick={() => ask(kind)} disabled={busy === kind}>
                    {busy === kind ? <Loader2 className="h-4 w-4 animate-spin" /> : Z("允许", "Allow")}
                  </Button>
                )}
                {perm[kind] === "denied" && (
                  <Button size="sm" variant="outline" onClick={openAppSettings}>
                    <Settings2 className="h-4 w-4 mr-1.5" /> {Z("打开设置", "Open settings")}
                  </Button>
                )}
                {perm[kind] === "granted" && (
                  <Button size="sm" variant="ghost" onClick={() => ask(kind)} disabled={busy === kind}>
                    {Z("重新检查", "Check again")}
                  </Button>
                )}
              </div>
            </div>
          ))}
          {!isNative() && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ExternalLink className="h-3 w-3" /> {Z("如果你把这个应用装到手机上，这些会由手机自己弹窗来问你。", "If you install this app on your phone, your phone will ask you these instead.")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AppSettingsPanel;
