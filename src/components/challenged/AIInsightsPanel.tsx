import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Wand2, RefreshCw, AlertTriangle, Lightbulb, Shield } from "lucide-react";
import { invokeAI, parseAIJson } from "@/lib/ai-service";
import { useTranslation } from "react-i18next";

interface Insight {
  title: string;
  insight: string;
  priority: "high" | "medium" | "low";
}

interface AIInsightsPanelProps {
  caredOnes?: any[];
  tasks?: any[];
  bookings?: any[];
}

export function AIInsightsPanel({ caredOnes, tasks, bookings }: AIInsightsPanelProps) {
  const { t, i18n } = useTranslation();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const context = JSON.stringify({
        caredOnesCount: caredOnes?.length || 0,
        caredOnes: (caredOnes || []).slice(0, 3).map((co: any) => ({
          name: co.cared_one?.full_name || "",
          relationship: co.relationship,
        })),
        pendingTasks: (tasks || []).filter((t: any) => t.status !== "completed").length,
        taskTitles: (tasks || []).filter((t: any) => t.status !== "completed").slice(0, 5).map((t: any) => t.title),
        upcomingBookings: (bookings || []).filter((b: any) => ["confirmed", "pending"].includes(b.status)).length,
      });
      const reply = await invokeAI("insights", context, { persist: false, language: i18n.language });
      const parsed = parseAIJson<Insight[]>(reply);
      if (parsed && Array.isArray(parsed)) {
        setInsights(parsed);
      } else {
        setError(t("common.errorOccurred"));
      }
    } catch (err: any) {
      setError(err.message || t("common.errorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caredOnes && caredOnes.length > 0) {
      generateInsights();
    }
  }, [caredOnes?.length]);

  const priorityConfig = {
    high: { color: "bg-destructive/10 text-destructive border-destructive/30", icon: AlertTriangle },
    medium: { color: "bg-warning/10 text-warning border-warning/30", icon: Lightbulb },
    low: { color: "bg-success/10 text-success border-success/30", icon: Shield },
  };

  return (
    <Card className="border-transparent card-elevated">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          {t("ai.aiCareInsights")}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={generateInsights} disabled={loading} className="h-7 text-xs">
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
          {t("common.refresh")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && !insights.length ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                <Skeleton className="h-4 w-4 rounded-full mt-0.5 shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-xs text-muted-foreground text-center py-2">{error}</p>
        ) : insights.length > 0 ? (
          insights.map((ins, i) => {
            const config = priorityConfig[ins.priority] || priorityConfig.low;
            const Icon = config.icon;
            return (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50">
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${ins.priority === "high" ? "text-destructive" : ins.priority === "medium" ? "text-warning" : "text-success"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-xs font-semibold text-foreground">{ins.title}</p>
                    <Badge variant="outline" className={`text-[9px] px-1 py-0 ${config.color}`}>
                      {ins.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ins.insight}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">
            {t("ai.addRecipientsForInsights")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
