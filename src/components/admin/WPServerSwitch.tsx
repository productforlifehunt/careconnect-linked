import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Server, CheckCircle, AlertTriangle } from "lucide-react";
import { WP_SERVERS, getActiveServerId, setActiveServer } from "@/lib/wp-servers";

export function WPServerSwitch() {
  const [activeId, setActiveId] = useState(getActiveServerId());
  const [switching, setSwitching] = useState(false);

  const handleSwitch = (serverId: string) => {
    if (serverId === activeId) return;
    setSwitching(true);
    setActiveServer(serverId); // This triggers reload
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
                    disabled={switching}
                    onClick={() => handleSwitch(server.id)}
                  >
                    {switching ? "Switching…" : "Switch"}
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
