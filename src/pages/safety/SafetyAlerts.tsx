import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, CheckCheck, MapPin, ShieldAlert, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  fetchNotificationsWordPress,
  markNotificationReadWordPress,
  markAllNotificationsReadWordPress,
} from "@/features/notifications/source.wordpress";

function iconFor(type: string) {
  if (/sos|emergency|紧急/i.test(type)) return ShieldAlert;
  if (/zone|place|geofence/i.test(type)) return Home;
  if (/location|gps/i.test(type)) return MapPin;
  return Bell;
}

/** Safety alerts feed — SOS, place enter/exit and location requests. */
export default function SafetyAlerts() {
  const { i18n } = useTranslation();
  const zh = i18n.language?.startsWith("zh");
  const L = (cn: string, en: string) => (zh ? cn : en);
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["nn-alerts"],
    queryFn: fetchNotificationsWordPress,
    refetchInterval: 60_000,
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["nn-alerts"] });
    qc.invalidateQueries({ queryKey: ["nn-unread"] });
  };

  const markAll = async () => {
    try {
      await markAllNotificationsReadWordPress();
      refresh();
      toast({ title: L("全部已读", "All caught up") });
    } catch (e: any) {
      toast({ title: L("暂时无法更新", "Couldn't update just now"), description: e?.message, variant: "destructive" });
    }
  };

  const unread = (data as any[]).filter((n) => !n.is_read).length;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <h1 className="mr-auto text-xl font-bold md:text-2xl">{L("提醒", "Alerts")}</h1>
        {unread > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={markAll}>
            <CheckCheck className="h-4 w-4" />{L("全部标记已读", "Mark all read")}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}</div>
      ) : (data as any[]).length === 0 ? (
        <Card className="border-transparent card-elevated">
          <CardContent className="p-10 text-center">
            <BellOff className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-medium">{L("暂无提醒", "No alerts yet")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {L("家人进出你设置的地点时，提醒会出现在这里。", "Alerts appear here when family arrive at or leave your places.")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {(data as any[]).map((n) => {
            const Icon = iconFor(String(n.type || ""));
            return (
              <button
                key={n.id}
                type="button"
                onClick={async () => {
                  if (n.is_read) return;
                  try { await markNotificationReadWordPress(String(n.id)); refresh(); } catch { /* ignore */ }
                }}
                className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors hover:bg-accent ${
                  n.is_read ? "bg-card" : "bg-accent/40"
                }`}
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{n.title || L("提醒", "Alert")}</span>
                  {n.message && <span className="mt-0.5 block text-sm text-muted-foreground">{n.message}</span>}
                  {n.created_at && (
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleString(zh ? "zh-CN" : undefined)}
                    </span>
                  )}
                </span>
                {!n.is_read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
