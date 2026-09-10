/**
 * General app settings — rendered entirely from the SETTING SKILLS in
 * src/lib/ai-dynamic-knowledge.ts. This file only draws rows; it decides nothing
 * about wording, app scope, storage or persistence, and it stores no data shape.
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
  SETTING_GROUPS,
  settingSkillsInGroup,
  runSettingSkill,
  askPermissionSkill,
  permissionSkillStates,
  fetchAppSettings,
  DEFAULT_APP_SETTINGS,
  type AppSettings,
  type SettingSkill,
} from "@/lib/ai-dynamic-knowledge";
import { openAppSettings, isNative, type PermissionState } from "@/features/settings/permissions";
import { subscribeWebPushAndRegister } from "@/features/notifications/tokens.wordpress";

type Z = (cn: string, en: string) => string;

const PERM_ICON: Record<string, typeof Bell> = {
  "set-permission-phone-alerts": Bell,
  "set-permission-location": MapPin,
  "set-permission-calendar": CalendarDays,
};

function stateBadge(state: PermissionState | undefined, Z: Z) {
  const map: Record<PermissionState, { text: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    granted: { text: Z("已允许", "On"), variant: "default" },
    denied: { text: Z("已在手机设置里关闭", "Turned off in your settings"), variant: "destructive" },
    prompt: { text: Z("还没设置", "Not chosen yet"), variant: "secondary" },
    unsupported: { text: Z("这台设备用不了", "Not available on this device"), variant: "outline" },
  };
  const m = map[state ?? "prompt"];
  return <Badge variant={m.variant}>{m.text}</Badge>;
}

type SectionId = "channels" | "categories" | "quiet" | "display" | "permissions";

export function AppSettingsPanel({
  sections = ["channels", "categories", "quiet", "display", "permissions"],
}: { sections?: SectionId[] } = {}) {
  const show = (id: SectionId) => sections.includes(id);
  const { i18n } = useTranslation();
  const isCN = !!i18n.language?.startsWith("zh");
  const Z: Z = (cn, en) => (isCN ? cn : en);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["appSettings"],
    queryFn: () => fetchAppSettings(),
  });
  const local: AppSettings = settings ?? DEFAULT_APP_SETTINGS;

  const save = useMutation({
    mutationFn: ({ name, value }: { name: string; value: any }) => runSettingSkill(name, value, { settings: local }),
    onSuccess: (next) => {
      qc.setQueryData(["appSettings"], next);
      toast({ title: Z("已保存", "Saved") });
    },
    onError: () =>
      toast({ title: Z("没能保存，请再试一次", "Could not save — please try again"), variant: "destructive" }),
  });
  const set = (name: string, value: any) => save.mutate({ name, value });

  const [perm, setPerm] = useState<Record<string, PermissionState>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    permissionSkillStates().then(setPerm).catch(() => {});
  }, []);

  const ask = async (spec: SettingSkill) => {
    setBusy(spec.name);
    try {
      const { state, settings: next } = await askPermissionSkill(spec.name, local);
      setPerm((p) => ({ ...p, [spec.name]: state }));
      qc.setQueryData(["appSettings"], next);
      if (spec.permission === "push" && state === "granted") {
        await subscribeWebPushAndRegister(import.meta.env.VITE_VAPID_PUBLIC_KEY);
        set("set-alerts-on-phone", true);
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

  const renderSwitch = (spec: SettingSkill) => (
    <div key={spec.name} className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <Label htmlFor={spec.name} className="text-sm font-medium">{spec.label(isCN)}</Label>
        {spec.hint && <p className="text-xs text-muted-foreground mt-0.5">{spec.hint(isCN)}</p>}
      </div>
      <Switch
        id={spec.name}
        checked={!!spec.readFrom?.(local)}
        onCheckedChange={(v) => set(spec.name, v)}
        disabled={save.isPending || spec.locked}
      />
    </div>
  );

  const renderChoice = (spec: SettingSkill) => (
    <div key={spec.name} className="space-y-2">
      <Label className="text-sm font-medium">{spec.label(isCN)}</Label>
      <div className="flex flex-wrap gap-2">
        {(spec.options?.(isCN) ?? []).map((o) => (
          <Button
            key={o.value}
            size="sm"
            variant={spec.readFrom?.(local) === o.value ? "default" : "outline"}
            onClick={() => set(spec.name, o.value)}
            disabled={save.isPending}
          >
            {o.label}
          </Button>
        ))}
      </div>
    </div>
  );

  const quietSpecs = settingSkillsInGroup("quiet");
  const quietEnabled = quietSpecs.find((s) => s.name === "set-quiet-hours");
  const quietTimes = quietSpecs.filter((s) => s.kind === "time");

  const groupTitle = (id: string) => SETTING_GROUPS.find((g) => g.id === id)!;

  return (
    <div className="space-y-6">
      {(["channels", "categories"] as const).map((gid) => {
        const g = groupTitle(gid);
        return (
          <Card key={gid} className="border-transparent card-elevated">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">{g.title(isCN)}</CardTitle>
              <CardDescription className="text-sm">{g.description(isCN)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">{settingSkillsInGroup(gid).map(renderSwitch)}</CardContent>
          </Card>
        );
      })}

      <Card className="border-transparent card-elevated">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">{groupTitle("quiet").title(isCN)}</CardTitle>
          <CardDescription className="text-sm">{groupTitle("quiet").description(isCN)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {quietEnabled && renderSwitch(quietEnabled)}
          {quietEnabled?.readFrom?.(local) && (
            <div className="flex items-center gap-3">
              {quietTimes.map((spec) => (
                <div key={spec.name} className="space-y-1">
                  <Label htmlFor={spec.name} className="text-xs text-muted-foreground">{spec.label(isCN)}</Label>
                  <Input
                    id={spec.name}
                    type="time"
                    value={spec.readFrom?.(local) ?? ""}
                    onChange={(e) => set(spec.name, e.target.value)}
                    className="w-28"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-transparent card-elevated">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">{groupTitle("display").title(isCN)}</CardTitle>
          <CardDescription className="text-sm">{groupTitle("display").description(isCN)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {settingSkillsInGroup("display").map((spec) =>
            spec.kind === "choice" ? renderChoice(spec) : renderSwitch(spec),
          )}
        </CardContent>
      </Card>

      <Card className="border-transparent card-elevated">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">{groupTitle("permissions").title(isCN)}</CardTitle>
          <CardDescription className="text-sm">{groupTitle("permissions").description(isCN)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settingSkillsInGroup("permissions").map((spec) => {
            const Icon = PERM_ICON[spec.name] ?? Bell;
            const state = perm[spec.name];
            return (
              <div key={spec.name} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{spec.label(isCN)}</span>
                      {stateBadge(state, Z)}
                    </div>
                    {spec.hint && <p className="text-xs text-muted-foreground mt-0.5">{spec.hint(isCN)}</p>}
                  </div>
                </div>
                <div className="shrink-0">
                  {state === "denied" ? (
                    <Button size="sm" variant="outline" onClick={openAppSettings}>
                      <Settings2 className="h-4 w-4 mr-1.5" /> {Z("打开设置", "Open settings")}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant={state === "granted" ? "ghost" : "outline"}
                      onClick={() => ask(spec)}
                      disabled={busy === spec.name}
                    >
                      {busy === spec.name ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : state === "granted" ? (
                        Z("重新检查", "Check again")
                      ) : (
                        Z("允许", "Allow")
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {!isNative() && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ExternalLink className="h-3 w-3" />{" "}
              {Z("如果你把这个应用装到手机上，这些会由手机自己弹窗来问你。", "If you install this app on your phone, your phone will ask you these instead.")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AppSettingsPanel;
