import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, RefreshCw } from "lucide-react";
import { invokeAI } from "@/lib/ai-service";
import { useTranslation } from "react-i18next";

interface AIDailySummaryProps {
  caredOneName: string;
  medicines?: any[];
  tasks?: any[];
  checkins?: any[];
}

export function AIDailySummary({ caredOneName, medicines, tasks, checkins }: AIDailySummaryProps) {
  const { t, i18n } = useTranslation();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const today = new Date().toLocaleDateString(i18n.language, { weekday: "long", month: "long", day: "numeric" });
      const context = JSON.stringify({
        date: today,
        patient: caredOneName,
        medicationsCount: medicines?.length || 0,
        medicationNames: (medicines || []).slice(0, 8).map((m: any) => m.name),
        completedTasks: (tasks || []).filter((t: any) => t.status === "completed").length,
        pendingTasks: (tasks || []).filter((t: any) => t.status !== "completed").length,
        taskList: (tasks || []).slice(0, 6).map((t: any) => ({ title: t.title, status: t.status })),
        latestCheckin: checkins?.[0] ? {
          mood: checkins[0].mood,
          energy: checkins[0].energy_level,
          pain: checkins[0].pain_level,
          notes: checkins[0].notes,
        } : null,
      });
      const reply = await invokeAI("daily_summary", `Summarize today's care for ${caredOneName}:\n${context}`);
      setSummary(reply);
    } catch (err) {
      console.error("Daily summary error:", err);
      setSummary(t("common.tryAgain"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-transparent card-elevated">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          {t("ai.aiDailySummary")}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={generate} disabled={loading} className="h-7 text-xs">
          {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
          {summary ? t("common.refresh") : t("ai.generate")}
        </Button>
      </CardHeader>
      <CardContent>
        {loading && !summary ? (
          <div className="py-4 text-center text-xs text-muted-foreground animate-pulse">
            {t("ai.analyzingData")}
          </div>
        ) : summary ? (
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{summary}</p>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground mb-2">
              {t("ai.getSummaryDesc", { name: caredOneName })}
            </p>
            <Button size="sm" variant="outline" onClick={generate}>
              {t("ai.generateSummary")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
