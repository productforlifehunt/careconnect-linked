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
import { subscribeWebPushAndRegister } from "@/features/notifications/tokens.wordpress";

const CATEGORIES: { key: string; label: string; hint: string }[] = [
  { key: "chat", label: "Messages", hint: "New direct messages from your care circle" },
  { key: "booking", label: "Bookings", hint: "Requests, confirmations and cancellations" },
  { key: "check_in", label: "Check-ins", hint: "Visit and wellbeing check-in reminders" },
  { key: "medicine", label: "Medication", hint: "Medication and routine reminders" },
  { key: "location", label: "Safety alerts", hint: "Safe-zone and location alerts" },
  { key: "system", label: "Account & system", hint: "Security and account notices" },
];

const PERMISSIONS: { kind: PermissionKind; label: string; why: string; icon: typeof Bell }[] = [
  { kind: "push", label: "Notifications", why: "Needed to deliver alerts when the app is closed", icon: Bell },
  { kind: "location", label: "Location", why: "Needed for safe zones and live location sharing", icon: MapPin },
  { kind: "calendar", label: "Calendar", why: "Optional — adds care visits to your device calendar", icon: CalendarDays },
];

function stateBadge(state: PermissionState) {
  const map: Record<PermissionState, { text: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    granted: { text: "Allowed", variant: "default" },
    denied: { text: "Blocked", variant: "destructive" },
    prompt: { text: "Not set", variant: "secondary" },
    unsupported: { text: "Not available here", variant: "outline" },
  };
  const m = map[state];
  return <Badge variant={m.variant}>{m.text}</Badge>;
}

export function AppSettingsPanel() {
  const { t } = useTranslation();
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
      toast({ title: "Settings saved" });
    },
    onError: () => toast({ title: "Could not save settings", variant: "destructive" }),
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
          title: "Permission blocked",
          description: isNative()
            ? "Open system settings to allow it again."
            : "Allow it from your browser's site settings, then refresh.",
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
          <CardTitle className="text-base sm:text-lg">{t("profile.notificationPrefs", "How we reach you")}</CardTitle>
          <CardDescription className="text-sm">
            Turn a channel off and nothing is sent on it — the app checks these before every message.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {([
            ["push", "Push notifications", "On this device and any device you allow"],
            ["email", "Email", "Sent to your account email address"],
            ["sms", "Text messages", "Only for urgent safety alerts"],
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
          <CardTitle className="text-base sm:text-lg">What to notify me about</CardTitle>
          <CardDescription className="text-sm">Applies to every channel above.</CardDescription>
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
          <CardTitle className="text-base sm:text-lg">Device permissions</CardTitle>
          <CardDescription className="text-sm">
            We only ask when you tap. You can change these any time.
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
                    {stateBadge(perm[kind])}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{why}</p>
                </div>
              </div>
              <div className="shrink-0">
                {perm[kind] === "prompt" && (
                  <Button size="sm" variant="outline" onClick={() => ask(kind)} disabled={busy === kind}>
                    {busy === kind ? <Loader2 className="h-4 w-4 animate-spin" /> : "Allow"}
                  </Button>
                )}
                {perm[kind] === "denied" && (
                  <Button size="sm" variant="outline" onClick={openAppSettings}>
                    <Settings2 className="h-4 w-4 mr-1.5" /> Open settings
                  </Button>
                )}
                {perm[kind] === "granted" && (
                  <Button size="sm" variant="ghost" onClick={() => ask(kind)} disabled={busy === kind}>
                    Re-check
                  </Button>
                )}
              </div>
            </div>
          ))}
          {!isNative() && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ExternalLink className="h-3 w-3" /> On the installed app these use your phone's system prompts.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AppSettingsPanel;
