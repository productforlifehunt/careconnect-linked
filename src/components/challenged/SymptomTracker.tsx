/**
 * Symptom & Behavior Tracker — logs sundowning, agitation, sleep, wandering
 * with AI behavior analysis. For caregivers on the Challenged site.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity, Plus, Sparkles, TrendingUp, Sun, Moon, AlertTriangle, RefreshCw, X
} from "lucide-react";
import { useSymptomLogs, useCreateSymptomLog } from "@/hooks/use-care-data";
import { invokeAI } from "@/lib/ai-service";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface SymptomTrackerProps {
  caredOneId: string;
  caredOneName: string;
}

const SYMPTOM_ICONS: Record<string, typeof Sun> = {
  sundowning: Sun,
  agitation: AlertTriangle,
  wandering: Activity,
  sleep_disruption: Moon,
  confusion: Sparkles,
  anxiety: Activity,
};

export function SymptomTracker({ caredOneId, caredOneName }: SymptomTrackerProps) {
  const { t } = useTranslation();
  const { data: logs, isLoading } = useSymptomLogs(caredOneId);
  const createLog = useCreateSymptomLog();

  const [showForm, setShowForm] = useState(false);
  const [symptomType, setSymptomType] = useState("");
  const [severity, setSeverity] = useState("");
  const [notes, setNotes] = useState("");
  const [trigger, setTrigger] = useState("");

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const SYMPTOM_TYPES = [
    { value: "sundowning", label: t("symptoms.types.sundowning") },
    { value: "agitation", label: t("symptoms.types.agitation") },
    { value: "wandering", label: t("symptoms.types.wandering") },
    { value: "sleep_disruption", label: t("symptoms.types.sleepDisruption") },
    { value: "confusion", label: t("symptoms.types.confusion") },
    { value: "anxiety", label: t("symptoms.types.anxiety") },
  ];

  const SEVERITY_OPTIONS = [
    { value: "1", label: t("symptoms.severity.mild") },
    { value: "2", label: t("symptoms.severity.moderate") },
    { value: "3", label: t("symptoms.severity.significant") },
    { value: "4", label: t("symptoms.severity.severe") },
    { value: "5", label: t("symptoms.severity.critical") },
  ];

  const handleSubmit = async () => {
    if (!symptomType || !severity) return;
    try {
      await createLog.mutateAsync({
        user_id: caredOneId,
        symptom: symptomType,
        severity: parseInt(severity),
        notes: notes || null,
      });
      toast({ title: t("symptoms.symptomLogged"), description: t("symptoms.entryRecorded") });
      setShowForm(false);
      setSymptomType("");
      setSeverity("");
      setNotes("");
      setTrigger("");
    } catch (err: any) {
      toast({ title: t("common.errorOccurred"), description: err.message, variant: "destructive" });
    }
  };

  const runAIAnalysis = async () => {
    if (!logs || logs.length === 0) return;
    setAiLoading(true);
    try {
      const context = `Behavioral observations for ${caredOneName} over the past 2 weeks:\n${JSON.stringify(
        logs.slice(0, 20).map((l: any) => ({
          type: l.symptom_type,
          severity: l.severity,
          trigger: l.trigger,
          notes: l.notes,
          date: l.created_at,
        }))
      )}`;
      const reply = await invokeAI("behavior_analysis", context);
      setAiAnalysis(reply);
    } catch {
      setAiAnalysis("Unable to generate analysis at this time.");
    } finally {
      setAiLoading(false);
    }
  };

  const severityColor = (s: number) => {
    if (s >= 4) return "bg-destructive/10 text-destructive";
    if (s >= 3) return "bg-warning/10 text-warning";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Card className="border-transparent card-elevated">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          {t("symptoms.symptomTracker")}
        </CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={runAIAnalysis} disabled={aiLoading || !logs?.length} className="h-7 text-xs">
            <Sparkles className={`h-3 w-3 mr-1 ${aiLoading ? "animate-spin" : ""}`} />
            {t("symptoms.aiAnalysis")}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowForm(!showForm)} className="h-7 text-xs">
            {showForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3 mr-1" />}
            {showForm ? "" : t("symptoms.log")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Select value={symptomType} onValueChange={setSymptomType}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t("symptoms.symptomType")} /></SelectTrigger>
                <SelectContent>
                  {SYMPTOM_TYPES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t("symptoms.severityLabel")} /></SelectTrigger>
                <SelectContent>
                  {SEVERITY_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs placeholder:text-muted-foreground"
              placeholder={t("symptoms.triggerPlaceholder")}
              value={trigger}
              onChange={e => setTrigger(e.target.value)}
            />
            <Textarea
              className="text-xs min-h-[50px]"
              placeholder={t("symptoms.additionalNotes")}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <Button size="sm" className="w-full h-7 text-xs" onClick={handleSubmit} disabled={createLog.isPending || !symptomType || !severity}>
              {createLog.isPending ? t("common.saving") : t("symptoms.saveEntry")}
            </Button>
          </div>
        )}

        {aiAnalysis && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">{t("ai.aiBehaviorAnalysis")}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{aiAnalysis}</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        ) : logs && logs.length > 0 ? (
          <div className="space-y-1.5">
            {logs.slice(0, 8).map((log: any) => {
              const typeLabel = SYMPTOM_TYPES.find(s => s.value === log.symptom_type)?.label || log.symptom_type;
              const Icon = SYMPTOM_ICONS[log.symptom_type] || Activity;
              return (
                <div key={log.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                  <div className="shrink-0">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{typeLabel}</p>
                    {log.trigger && <p className="text-[10px] text-muted-foreground">{t("symptoms.trigger")}: {log.trigger}</p>}
                  </div>
                  <Badge variant="outline" className={`text-[9px] px-1.5 ${severityColor(log.severity)}`}>
                    {t("symptoms.sev")} {log.severity}/5
                  </Badge>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(log.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-3">
            {t("symptoms.noSymptomsLogged")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
