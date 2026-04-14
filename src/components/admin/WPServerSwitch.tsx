import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Server, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { WP_SERVERS, getActiveServerId, setActiveServer, type WPServer } from "@/lib/wp-servers";
import { buildWPUrl, buildWPHeaders } from "@/lib/wp-url";

type HealthStatus = "checking" | "online" | "offline";

function useServerHealth() {
  const [health, setHealth] = useState<Record<string, HealthStatus>>(() =>
    Object.fromEntries(WP_SERVERS.map((s) => [s.id, "checking" as HealthStatus]))
  );

  useEffect(() => {
    WP_SERVERS.forEach((server) => {
      checkHealth(server).then((ok) =>
        setHealth((prev) => ({ ...prev, [server.id]: ok ? "online" : "offline" }))
      );
    });

    const interval = setInterval(() => {
      WP_SERVERS.forEach((server) => {
        checkHealth(server).then((ok) =>
          setHealth((prev) => ({ ...prev, [server.id]: ok ? "online" : "offline" }))
        );
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return health;
}

async function checkHealth(server: WPServer): Promise<boolean> {
  try {
    // Build a URL that goes through the edge proxy for this specific server
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
    const proxyUrl = `${supabaseUrl}/functions/v1/wp-proxy`;
    const qs = new URLSearchParams({
      path: "/wp-json/wp/v2/types",
      wp_base: server.baseUrl,
    });
    const headers: Record<string, string> = { apikey: anonKey };

    const res = await fetch(`${proxyUrl}?${qs}`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function HealthDot({ status }: { status: HealthStatus }) {
  if (status === "checking") {
    return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;
  }
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${
        status === "online" ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" : "bg-destructive shadow-[0_0_6px_rgba(239,68,68,0.5)]"
      }`}
      title={status === "online" ? "Server reachable" : "Server unreachable"}
    />
  );
}

export function WPServerSwitch() {
  const [activeId, setActiveId] = useState(getActiveServerId());
  const [switching, setSwitching] = useState(false);
  const health = useServerHealth();

  const handleSwitch = (serverId: string) => {
    if (serverId === activeId) return;
    setSwitching(true);
    setActiveServer(serverId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Server className="h-5 w-5" />
          WordPress Server
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {WP_SERVERS.map((server) => {
          const isActive = server.id === activeId;
          const status = health[server.id] || "checking";
          return (
            <div
              key={server.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <HealthDot status={status} />
                {isActive ? (
                  <CheckCircle className="h-4 w-4 text-primary" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <div>
                  <p className="font-medium text-sm">{server.label}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[260px]">
                    {server.baseUrl}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {server.isPrimary && (
                  <Badge variant="secondary" className="text-xs">Primary</Badge>
                )}
                {isActive ? (
                  <Badge className="text-xs">Active</Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={switching || status === "offline"}
                    onClick={() => handleSwitch(server.id)}
                  >
                    {switching ? "Switching…" : status === "offline" ? "Offline" : "Switch"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
          <AlertTriangle className="h-3 w-3" />
          Switching servers will reload the app. Both servers share the same data model.
        </p>
      </CardContent>
    </Card>
  );
}
