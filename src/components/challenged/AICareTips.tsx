import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Heart, Shield, MessageCircle, Activity, Gamepad2 } from "lucide-react";
import { invokeAI, parseAIJson } from "@/lib/ai-service";

interface CareTip {
  tip: string;
  category: "daily_care" | "communication" | "safety" | "wellness" | "activities";
}

const categoryIcons: Record<string, typeof Heart> = {
  daily_care: Heart,
  communication: MessageCircle,
  safety: Shield,
  wellness: Activity,
  activities: Gamepad2,
};

const categoryColors: Record<string, string> = {
  daily_care: "text-primary",
  communication: "text-secondary",
  safety: "text-warning",
  wellness: "text-success",
  activities: "text-accent-foreground",
};

interface AICareTipsProps {
  caredOneName?: string;
  dementiaStage?: string;
}

export function AICareTips({ caredOneName, dementiaStage }: AICareTipsProps) {
  const [tips, setTips] = useState<CareTip[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTips = async () => {
    setLoading(true);
    try {
      const context = `Patient: ${caredOneName || "a loved one"}. Dementia stage: ${dementiaStage || "unknown"}. Provide 3 personalized daily care tips.`;
      const reply = await invokeAI("care_tips", context);
      const parsed = parseAIJson<CareTip[]>(reply);
      if (parsed && Array.isArray(parsed)) setTips(parsed);
    } catch (err) {
      console.error("Care tips error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTips(); }, [caredOneName, dementiaStage]);

  return (
    <Card className="border-transparent card-elevated">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Care Tips
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={fetchTips} disabled={loading} className="h-7 text-xs">
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} /> New Tips
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && !tips.length ? (
          <div className="py-4 text-center text-xs text-muted-foreground animate-pulse">Generating tips...</div>
        ) : tips.length > 0 ? (
          tips.map((tip, i) => {
            const Icon = categoryIcons[tip.category] || Heart;
            const color = categoryColors[tip.category] || "text-primary";
            return (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/50">
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                <p className="text-xs text-foreground leading-relaxed">{tip.tip}</p>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">No tips available</p>
        )}
      </CardContent>
    </Card>
  );
}
