/**
 * Caregiver Wellness Monitor — tracks stress, sleep, mood with AI burnout detection.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Plus, Brain, SmilePlus, X } from "lucide-react";
import { useCaregiverWellnessLogs, useCreateCaregiverWellnessLog } from "@/hooks/use-care-data";
import { invokeAI } from "@/lib/ai-service";
import { toast } from "@/hooks/use-toast";

const MOOD_OPTIONS = [
  { value: "great", emoji: "😊", label: "Great" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "stressed", emoji: "😰", label: "Stressed" },
  { value: "overwhelmed", emoji: "😩", label: "Overwhelmed" },
];

const STRESS_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function CaregiverWellness() {
  const { data: logs, isLoading } = useCaregiverWellnessLogs();
  const createLog = useCreateCaregiverWellnessLog();
  const [showForm, setShowForm] = useState(false);
  const [mood, setMood] = useState("");
  const [stressLevel, setStressLevel] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [notes, setNotes] = useState("");
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleSubmit = async () => {
    if (!mood) return;
    try {
      await createLog.mutateAsync({
        mood,
        stress_level: stressLevel,
        sleep_hours: sleepHours,
        notes: notes || null,
      });
      toast({ title: "Wellness logged", description: "Take care of yourself too! 💛" });
      setShowForm(false);
      setMood("");
      setStressLevel(5);
      setSleepHours(7);
      setNotes("");

      // Auto-trigger AI if stress is high
      if (stressLevel >= 7) {
        generateAISupport();
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const generateAISupport = async () => {
    setAiLoading(true);
    try {
      const recentLogs = (logs || []).slice(0, 10).map((l: any) => ({
        mood: l.mood, stress: l.stress_level, sleep: l.sleep_hours, date: l.created_at,
      }));
      const context = `Caregiver wellness data over recent days:\n${JSON.stringify(recentLogs)}\n\nThe caregiver just reported mood: ${mood || "unknown"}, stress: ${stressLevel}/10, sleep: ${sleepHours}hrs. Please provide compassionate, actionable wellness advice.`;
      const reply = await invokeAI("care_tips", context);
      setAiTip(reply);
    } catch {
      setAiTip("Remember: you can't pour from an empty cup. Take a moment for yourself today.");
    } finally {
      setAiLoading(false);
    }
  };

  const stressColor = (s: number) => {
    if (s >= 8) return "bg-destructive text-destructive-foreground";
    if (s >= 6) return "bg-warning text-warning-foreground";
    if (s >= 4) return "bg-muted text-muted-foreground";
    return "bg-success text-success-foreground";
  };

  return (
    <Card className="border-transparent card-elevated">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary" />
          Your Wellness
        </CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={generateAISupport} disabled={aiLoading} className="h-7 text-xs">
            <Brain className={`h-3 w-3 mr-1 ${aiLoading ? "animate-spin" : ""}`} />
            AI Support
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowForm(!showForm)} className="h-7 text-xs">
            {showForm ? <X className="h-3 w-3" /> : <><SmilePlus className="h-3 w-3 mr-1" /> Check-in</>}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="p-3 rounded-lg bg-muted/50 space-y-3">
            {/* Mood selection */}
            <div>
              <p className="text-xs font-medium text-foreground mb-1.5">How are you feeling?</p>
              <div className="flex gap-1.5">
                {MOOD_OPTIONS.map(m => (
                  <button
                    key={m.value}
                    className={`flex-1 p-2 rounded-lg text-center transition-all border-2 ${
                      mood === m.value ? "border-primary bg-primary/10" : "border-transparent bg-muted/50 hover:bg-muted"
                    }`}
                    onClick={() => setMood(m.value)}
                  >
                    <span className="text-lg block">{m.emoji}</span>
                    <span className="text-[10px] text-muted-foreground">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stress slider */}
            <div>
              <p className="text-xs font-medium text-foreground mb-1">Stress Level: {stressLevel}/10</p>
              <input
                type="range"
                min={1}
                max={10}
                value={stressLevel}
                onChange={e => setStressLevel(parseInt(e.target.value))}
                className="w-full h-1.5 accent-primary"
              />
            </div>

            {/* Sleep hours */}
            <div>
              <p className="text-xs font-medium text-foreground mb-1">Sleep Last Night: {sleepHours}hrs</p>
              <input
                type="range"
                min={0}
                max={12}
                step={0.5}
                value={sleepHours}
                onChange={e => setSleepHours(parseFloat(e.target.value))}
                className="w-full h-1.5 accent-primary"
              />
            </div>

            <Textarea
              className="text-xs min-h-[40px]"
              placeholder="Any thoughts or notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <Button size="sm" className="w-full h-7 text-xs" onClick={handleSubmit} disabled={createLog.isPending || !mood}>
              {createLog.isPending ? "Saving..." : "Log Wellness"}
            </Button>
          </div>
        )}

        {/* AI Support */}
        {aiTip && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Heart className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">AI Wellness Support</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{aiTip}</p>
          </div>
        )}

        {/* Recent logs */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
          </div>
        ) : logs && logs.length > 0 ? (
          <div className="space-y-1.5">
            {logs.slice(0, 5).map((log: any) => {
              const moodInfo = MOOD_OPTIONS.find(m => m.value === log.mood);
              return (
                <div key={log.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                  <span className="text-sm">{moodInfo?.emoji || "😐"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{moodInfo?.label || log.mood}</p>
                    <p className="text-[10px] text-muted-foreground">{log.sleep_hours}hrs sleep</p>
                  </div>
                  <Badge variant="outline" className={`text-[9px] px-1.5 ${stressColor(log.stress_level)}`}>
                    Stress {log.stress_level}/10
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
            How are you doing today? Check in to track your wellness.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
