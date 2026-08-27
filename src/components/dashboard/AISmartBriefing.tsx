import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, Lightbulb, ListChecks, RefreshCw, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { invokeAI, parseAIJson } from "@/lib/ai-service";
import { useUserCaredOnes, useCareTasks, useBookings, useCheckinLogs } from "@/hooks/use-care-data";
import { formatDate, formatTime, formatDateTime } from "@/lib/locale";

interface Briefing {
  alerts: { level: "high" | "medium" | "low"; text: string }[];
  summary: string;
  suggestions: { title: string; detail?: string }[];
}

const CACHE_KEY = "ai_smart_briefing_v1";

function loadCache(): { date: string; data: Briefing } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.date && parsed?.data) return parsed;
  } catch {}
  return null;
}

function saveCache(data: Briefing) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ date: new Date().toDateString(), data }));
  } catch {}
}

export function AISmartBriefing() {
  const { t, i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const { data: caredOnes } = useUserCaredOnes();
  const { data: tasks } = useCareTasks();
  const { data: bookings } = useBookings();
  const firstCaredOneId = caredOnes?.[0]?.user_id || null;
  const { data: checkins } = useCheckinLogs(firstCaredOneId);

  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local rule-based anomaly detection (always shown, instant, no AI cost)
  const ruleAlerts = useMemo(() => {
    const out: { level: "high" | "medium" | "low"; text: string }[] = [];
    const now = Date.now();

    // Overdue tasks
    (tasks || []).forEach((tk: any) => {
      if (tk.status !== "completed" && tk.due_date) {
        const due = new Date(tk.due_date).getTime();
        if (due < now - 24 * 60 * 60 * 1000) {
          out.push({
            level: "high",
            text: isChinese
              ? `任务 "${tk.title}" 已逾期`
              : `Task "${tk.title}" is overdue`,
          });
        }
      }
    });

    // Missed check-in (latest >24h ago)
    if (caredOnes && caredOnes.length > 0) {
      const latest = checkins?.[0];
      const name = caredOnes[0].cared_one?.full_name || caredOnes[0].cared_one?.first_name || "";
      if (!latest) {
        out.push({
          level: "medium",
          text: isChinese
            ? `${name} 尚未有签到记录`
            : `${name} has no check-in records yet`,
        });
      } else {
        const ts = new Date(latest.created_at || latest.cct_created || latest.checkin_date || 0).getTime();
        if (ts && now - ts > 24 * 60 * 60 * 1000) {
          out.push({
            level: "high",
            text: isChinese
              ? `${name} 已超过 24 小时未签到`
              : `${name} has not checked in for over 24 hours`,
          });
        }
        if (latest.mood && ["sad", "anxious", "1", "2"].includes(String(latest.mood).toLowerCase())) {
          out.push({
            level: "medium",
            text: isChinese
              ? `${name} 最近情绪偏低（${latest.mood}）`
              : `${name}'s recent mood is low (${latest.mood})`,
          });
        }
        if (Number(latest.pain_level) >= 7) {
          out.push({
            level: "high",
            text: isChinese
              ? `${name} 报告疼痛等级 ${latest.pain_level}/10`
              : `${name} reports pain level ${latest.pain_level}/10`,
          });
        }
      }
    }

    return out.slice(0, 5);
  }, [tasks, checkins, caredOnes, isChinese]);

  const generate = async (force = false) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const today = formatDate(new Date(), i18n.language, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      const context = JSON.stringify({
        language: isChinese ? "zh-CN" : "en",
        date: today,
        caredOnes: (caredOnes || []).map((c: any) => ({
          name: c.cared_one?.full_name || c.cared_one?.first_name,
          relationship: c.relationship,
        })),
        upcomingBookings: (bookings || [])
          .filter((b: any) => ["confirmed", "pending"].includes(b.status))
          .slice(0, 5)
          .map((b: any) => ({
            date: b.appointment_date || b.start_time,
            provider: b.provider?.full_name,
            service: b.service_type,
            status: b.status,
          })),
        tasks: (tasks || []).slice(0, 10).map((tk: any) => ({
          title: tk.title,
          status: tk.status,
          priority: tk.priority,
          due: tk.due_date,
          assignee: tk.assignee_profile?.full_name,
        })),
        latestCheckin: checkins?.[0]
          ? {
              mood: checkins[0].mood,
              energy: checkins[0].energy_level,
              pain: checkins[0].pain_level,
              notes: checkins[0].notes,
              at: checkins[0].created_at || checkins[0].cct_created,
            }
          : null,
        detectedAlerts: ruleAlerts,
      });

      const prompt = isChinese
        ? `你是家庭护理协调 AI 助手。基于以下数据生成今日护理简报。
严格返回 JSON：{"alerts":[{"level":"high|medium|low","text":"..."}],"summary":"2-3 句中文概述","suggestions":[{"title":"...","detail":"..."}]}
数据：${context}`
        : `You are a family care coordination AI. Based on the data below, generate today's care briefing.
Return STRICT JSON: {"alerts":[{"level":"high|medium|low","text":"..."}],"summary":"2-3 sentence overview","suggestions":[{"title":"...","detail":"..."}]}
Data: ${context}`;

      const reply = await invokeAI("daily_summary", prompt);
      const parsed = parseAIJson<Briefing>(reply);
      if (parsed && parsed.summary) {
        setBriefing(parsed);
        saveCache(parsed);
      } else {
        setBriefing({ alerts: ruleAlerts, summary: reply, suggestions: [] });
      }
    } catch (e: any) {
      console.error("AI briefing error:", e);
      setError(e?.message || "AI service unavailable");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load once per day
  useEffect(() => {
    if (!caredOnes) return;
    const cached = loadCache();
    if (cached && cached.date === new Date().toDateString()) {
      setBriefing(cached.data);
      return;
    }
    // Auto-generate when we have at least some context
    if ((caredOnes?.length || 0) > 0 || (tasks?.length || 0) > 0) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caredOnes?.length, tasks?.length]);

  const levelColor: Record<string, string> = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-warning/10 text-warning border-warning/20",
    low: "bg-muted text-muted-foreground border-transparent",
  };

  const mergedAlerts = [
    ...ruleAlerts,
    ...((briefing?.alerts || []).filter(
      (a) => !ruleAlerts.some((r) => r.text === a.text)
    )),
  ].slice(0, 6);

  return (
    <Card className="border-transparent card-elevated bg-gradient-to-br from-primary/5 via-transparent to-coral/5">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          {isChinese ? "AI 智能动态简报" : "AI Smart Briefing"}
          <Badge variant="outline" className="text-[9px] uppercase tracking-wide">
            {isChinese ? "实时" : "Live"}
          </Badge>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => generate(true)}
          disabled={loading}
          className="h-7 text-xs"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3 mr-1" />
          )}
          {isChinese ? "刷新" : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {mergedAlerts.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/80">
              <AlertTriangle className="h-3 w-3" />
              {isChinese ? "异常与提醒" : "Alerts"}
            </div>
            {mergedAlerts.map((a, i) => (
              <div
                key={i}
                className={`text-xs px-2.5 py-2 rounded-lg border ${levelColor[a.level] || levelColor.low}`}
              >
                {a.text}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/80">
            <ListChecks className="h-3 w-3" />
            {isChinese ? "今日护理概述" : "Today's Overview"}
          </div>
          {loading && !briefing ? (
            <p className="text-xs text-muted-foreground animate-pulse">
              {isChinese ? "AI 正在分析你的护理数据…" : "AI is analyzing your care data…"}
            </p>
          ) : briefing?.summary ? (
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {briefing.summary}
            </p>
          ) : error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {isChinese ? "暂无概述，点击刷新生成。" : "No overview yet. Tap refresh to generate."}
            </p>
          )}
        </div>

        {briefing?.suggestions && briefing.suggestions.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/80">
              <Lightbulb className="h-3 w-3" />
              {isChinese ? "AI 建议" : "Suggestions"}
            </div>
            {briefing.suggestions.slice(0, 4).map((s, i) => (
              <div key={i} className="text-xs p-2 rounded-lg bg-muted/50">
                <p className="font-medium text-foreground">{s.title}</p>
                {s.detail && (
                  <p className="text-muted-foreground mt-0.5 leading-relaxed">{s.detail}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
