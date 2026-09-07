import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, RefreshCw, AlertTriangle } from "lucide-react";
import { invokeAI, parseAIJson } from "@/lib/ai";
import { buildBriefingRequest } from "../../../supabase/functions/_shared/ai-prompts";
import i18n from "@/i18n/config";
import { formatDate } from "@/lib/locale";

type Briefing = {
  alerts?: Array<{ level?: string; text?: string }>;
  summary?: string;
  suggestions?: Array<{ title?: string; detail?: string }>;
};

export function AISmartBriefing({ facts }: { facts: string }) {
  const isCN = (i18n.language || "").startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const [data, setData] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const run = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const reply = await invokeAI(buildBriefingRequest(facts, isCN), { language: isCN ? "zh" : "en" });
      const parsed = parseAIJson<Briefing>(reply);
      if (parsed) setData(parsed);
      else setData({ summary: reply });
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [facts, isCN]);

  useEffect(() => { void run(); }, [run]);

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-primary" />
          {Z("今日智能简报", "Today's Smart Briefing")}
        </h2>
        <Button variant="ghost" size="sm" onClick={() => void run()} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 space-y-3">
          <p className="text-xs text-muted-foreground">{formatDate(new Date())}</p>
          {loading && !data ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          ) : failed ? (
            <p className="text-sm text-muted-foreground">
              {Z("暂时无法生成简报，请稍后再试。", "The briefing is unavailable right now. Please try again shortly.")}
            </p>
          ) : (
            <>
              {(data?.alerts || []).filter((a) => a?.text).map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${a.level === "high" ? "text-destructive" : "text-warning"}`} />
                  <span>{a.text}</span>
                </div>
              ))}
              {data?.summary ? (
                <p className="text-sm text-foreground leading-relaxed">{data.summary}</p>
              ) : null}
              {(data?.suggestions || []).filter((s) => s?.title).map((s, i) => (
                <div key={i} className="rounded-lg bg-card p-2.5 border">
                  <p className="text-sm font-medium text-foreground">{s.title}</p>
                  {s.detail ? <p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p> : null}
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
