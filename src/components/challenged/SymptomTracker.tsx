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
  Activity, Plus, Brain, TrendingUp, Sun, Moon, AlertTriangle, RefreshCw, X
} from "lucide-react";
import { useSymptomLogs, useCreateSymptomLog } from "@/hooks/use-care-data";
import { invokeAI } from "@/lib/ai-service";
import { toast } from "@/hooks/use-toast";

interface SymptomTrackerProps {
  caredOneId: string;
  caredOneName: string;
}

const SYMPTOM_TYPES = [
  { value: "sundowning", label: "Sundowning", icon: Sun },
  { value: "agitation", label: "Agitation", icon: AlertTriangle },
  { value: "wandering", label: "Wandering", icon: Activity },
  { value: "sleep_disruption", label: "Sleep Disruption", icon: Moon },
  { value: "confusion", label: "Confusion", icon: Brain },
  { value: "anxiety", label: "Anxiety", icon: Activity },
];

const SEVERITY_OPTIONS = [
  { value: "1", label: "Mild" },
  { value: "2", label: "Moderate" },
  { value: "3", label: "Significant" },
  { value: "4", label: "Severe" },
  { value: "5", label: "Critical" },
];

export function SymptomTracker({ caredOneId, caredOneName }: SymptomTrackerProps) {
  const { data: logs, isLoading } = useSymptomLogs(caredOneId);
  const createLog = useCreateSymptomLog();

  const [showForm, setShowForm] = useState(false);
  const [symptomType, setSymptomType] = useState("");
  const [severity, setSeverity] = useState("");
  const [notes, setNotes] = useState("");
  const [trigger, setTrigger] = useState("");

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleSubmit = async () => {
    if (!symptomType || !severity) return;
    try {
      await createLog.mutateAsync({
        cared_one_id: caredOneId,
        symptom_type: symptomType,
        severity: parseInt(severity),
        notes: notes || null,
        trigger: trigger || null,
      });
      toast({ title: "Symptom logged", description: "Entry recorded successfully." });
      setShowForm(false);
      setSymptomType("");
      setSeverity("");
      setNotes("");
      setTrigger("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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
          Symptom & Behavior Tracker
        </CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={runAIAnalysis} disabled={aiLoading || !logs?.length} className="h-7 text-xs">
            <Brain className={`h-3 w-3 mr-1 ${aiLoading ? "animate-spin" : ""}`} />
            AI Analysis
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowForm(!showForm)} className="h-7 text-xs">
            {showForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3 mr-1" />}
            {showForm ? "" : "Log"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Quick-add form */}
        {showForm && (
          <div className="p-3 rounded-lg bg-muted/50 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Select value={symptomType} onValueChange={setSymptomType}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Symptom type" /></SelectTrigger>
                <SelectContent>
                  {SYMPTOM_TYPES.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Severity" /></SelectTrigger>
                <SelectContent>
                  {SEVERITY_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs placeholder:text-muted-foreground"
              placeholder="Trigger (optional, e.g. 'loud TV', 'unfamiliar visitor')"
              value={trigger}
              onChange={e => setTrigger(e.target.value)}
            />
            <Textarea
              className="text-xs min-h-[50px]"
              placeholder="Additional notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <Button size="sm" className="w-full h-7 text-xs" onClick={handleSubmit} disabled={createLog.isPending || !symptomType || !severity}>
              {createLog.isPending ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        )}

        {/* AI Analysis */}
        {aiAnalysis && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Brain className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">AI Behavior Analysis</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{aiAnalysis}</p>
          </div>
        )}

        {/* Recent logs */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        ) : logs && logs.length > 0 ? (
          <div className="space-y-1.5">
            {logs.slice(0, 8).map((log: any) => {
              const typeInfo = SYMPTOM_TYPES.find(s => s.value === log.symptom_type);
              return (
                <div key={log.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                  <div className="shrink-0">
                    {typeInfo ? <typeInfo.icon className="h-3.5 w-3.5 text-muted-foreground" /> : <Activity className="h-3.5 w-3.5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{typeInfo?.label || log.symptom_type}</p>
                    {log.trigger && <p className="text-[10px] text-muted-foreground">Trigger: {log.trigger}</p>}
                  </div>
                  <Badge variant="outline" className={`text-[9px] px-1.5 ${severityColor(log.severity)}`}>
                    Sev {log.severity}/5
                  </Badge>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(log.created_at).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-3">
            No symptoms logged yet. Tap "Log" to start tracking.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
