import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, Lightbulb, ListChecks, RefreshCw, Loader2, Pill, ClipboardCheck, CheckSquare } from "lucide-react";
import { useTranslation } from "react-i18next";
import { invokeAI, parseAIJson } from "@/lib/ai-service";
import {
  useUserCaredOnes,
  useCareTasks,
  useCheckinLogs,
  useMedicines,
  useCheckins,
  useTodayMedicineLogs,
  useTodayCheckinLogs,
} from "@/hooks/use-care-data";
import { formatDate } from "@/lib/locale";
import { useSite } from "@/contexts/SiteContext";
import { getStoredWPUser } from "@/services/wp-auth";
import { buildBriefingRequest } from "../../../supabase/functions/_shared/ai-prompts";

interface Briefing {
  alerts: { level: "high" | "medium" | "low"; text: string }[];
  summary: string;
  suggestions: { title: string; detail?: string }[];
}

const CACHE_KEY = "ai_smart_briefing_v2";

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

/** "08:30" → "8:30 AM" (locale-agnostic short clock used across the dashboard). */
function clock(slot: string): { label: string; sort: number } {
  const [h, m] = String(slot).split(":");
  const hour = Number.parseInt(h || "0", 10);
  const minute = Number.parseInt(m || "0", 10);
  const isPM = hour >= 12;
  return {
    label: `${hour > 12 ? hour - 12 : hour || 12}:${String(minute).padStart(2, "0")} ${isPM ? "PM" : "AM"}`,
    sort: hour * 100 + minute,
  };
}

export function AISmartBriefing() {
  const { t, i18n } = useTranslation();
  const site = useSite();
  const isChinese = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isChinese ? cn : en);

  const { data: caredOnes } = useUserCaredOnes();
  const { data: tasks } = useCareTasks();
  const firstCaredOneId = caredOnes?.[0]?.user_id || null;
  const { data: checkinLogs } = useCheckinLogs(firstCaredOneId);
  const { data: medicines } = useMedicines(firstCaredOneId);
  const { data: checkinSchedules } = useCheckins(firstCaredOneId);
  const { data: todayMedLogs } = useTodayMedicineLogs(firstCaredOneId);
  const { data: todayCheckinLogs } = useTodayCheckinLogs(firstCaredOneId);

  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const caredOneName =
    caredOnes?.[0]?.cared_one?.full_name || site.caredOneSingular;

  /** Only the tasks this user owns: created by them, or assigned to them. */
  const myTasks = useMemo(() => {
    const me = String(getStoredWPUser()?.user_id ?? "");
    if (!me) return [];
    return (tasks || []).filter((tk: any) => {
      const ids = (tk.assigned_to_ids || []).map((x: any) => String(x));
      return String(tk.created_by ?? "") === me || ids.includes(me);
    });
  }, [tasks]);

  const today = new Date().toDateString();

  /** Today's medicine slots, check-in slots and tasks — nothing else. */
  const plan = useMemo(() => {
    const medItems: { time: string; sort: number; text: string; done: boolean }[] = [];
    (medicines || []).forEach((med: any) => {
      const log = (todayMedLogs || []).find((l: any) => String(l.medicine_id) === String(med.id));
      const done = log?.status === "taken";
      const slots: string[] = Array.isArray(med.time_slot) ? med.time_slot : [];
      const name = [med.name, med.dosage].filter(Boolean).join(" · ");
      if (slots.length === 0) {
        medItems.push({ time: Z("任意时间", "Any time"), sort: 2400, text: name, done });
      } else {
        slots.forEach((s) => {
          const c = clock(s);
          medItems.push({ time: c.label, sort: c.sort, text: name, done });
        });
      }
    });

    const checkinItems: { time: string; sort: number; text: string; done: boolean }[] = [];
    (checkinSchedules || []).forEach((ci: any) => {
      const log = (todayCheckinLogs || []).find((l: any) => String(l.medicine_id ?? l.checkin_id) === String(ci.id));
      const done = log?.status === "taken" || log?.status === "checked";
      const slots: string[] = Array.isArray(ci.time_slot) && ci.time_slot.length > 0 ? ci.time_slot : [];
      const name = ci.name || Z("每日签到", "Daily check-in");
      if (slots.length === 0) {
        checkinItems.push({ time: Z("任意时间", "Any time"), sort: 2400, text: name, done });
      } else {
        slots.forEach((s) => {
          const c = clock(s);
          checkinItems.push({ time: c.label, sort: c.sort, text: name, done });
        });
      }
    });

    const taskItems = myTasks
      .filter((tk: any) => {
        const when = tk.task_date || tk.due_date;
        return when && new Date(when).toDateString() === today;
      })
      .map((tk: any) => {
        const c = tk.start_time ? clock(tk.start_time) : { label: Z("今天", "Today"), sort: 2400 };
        return { time: c.label, sort: c.sort, text: tk.title, done: tk.status === "completed" };
      });

    const sort = (a: { sort: number }, b: { sort: number }) => a.sort - b.sort;
    return {
      medicines: medItems.sort(sort),
      checkins: checkinItems.sort(sort),
      tasks: taskItems.sort(sort),
    };
  }, [medicines, checkinSchedules, todayMedLogs, todayCheckinLogs, myTasks, today, isChinese]);

  /** Rule-based alerts, scoped to this user's own tasks and cared one. */
  const ruleAlerts = useMemo(() => {
    const out: { level: "high" | "medium" | "low"; text: string }[] = [];
    const now = Date.now();

    myTasks.forEach((tk: any) => {
      if (tk.status !== "completed" && tk.due_date) {
        const due = new Date(tk.due_date).getTime();
        if (due < now - 24 * 60 * 60 * 1000) {
          out.push({
            level: "high",
            text: Z(`任务「${tk.title}」已逾期`, `Task "${tk.title}" is overdue`),
          });
        }
      }
    });

    const latest = checkinLogs?.[0];
    if (latest) {
      const ts = new Date(latest.created_at || latest.cct_created || latest.checkin_date || 0).getTime();
      if (ts && now - ts > 24 * 60 * 60 * 1000 && (checkinSchedules?.length || 0) > 0) {
        out.push({
          level: "high",
          text: Z(`${caredOneName} 已超过 24 小时没有签到`, `${caredOneName} has not checked in for over 24 hours`),
        });
      }
      if (Number(latest.pain_level) >= 7) {
        out.push({
          level: "high",
          text: Z(`${caredOneName} 记录的疼痛为 ${latest.pain_level}/10`, `${caredOneName} recorded pain at ${latest.pain_level}/10`),
        });
      }
    }

    return out.slice(0, 5);
  }, [myTasks, checkinLogs, checkinSchedules, caredOneName, isChinese]);

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const date = formatDate(new Date(), i18n.language, { weekday: "long", month: "long", day: "numeric" });
      const context = JSON.stringify({
        language: isChinese ? "zh-CN" : "en",
        date,
        caredOne: caredOneName,
        medicationSchedule: plan.medicines.map((m) => ({ time: m.time, medicine: m.text, taken: m.done })),
        checkInSchedule: plan.checkins.map((c) => ({ time: c.time, checkIn: c.text, done: c.done })),
        myTasksToday: plan.tasks.map((tk) => ({ time: tk.time, task: tk.text, done: tk.done })),
        alerts: ruleAlerts,
      });

      const prompt = buildBriefingRequest(context, !!isChinese);

      const reply = await invokeAI("daily_summary", prompt, { persist: false, language: isChinese ? "zh" : "en" });
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

  // Auto-load once per day, during browser idle time so the AI request never
  // queues ahead of the dashboard's own data.
  useEffect(() => {
    if (!caredOnes) return;
    const cached = loadCache();
    if (cached && cached.date === new Date().toDateString()) {
      setBriefing(cached.data);
      return;
    }
    if ((caredOnes?.length || 0) === 0 && myTasks.length === 0) return;

    const idle = (window as any).requestIdleCallback as
      | ((cb: () => void, opts?: { timeout: number }) => number)
      | undefined;
    let handle: any;
    if (idle) handle = idle(() => generate(), { timeout: 2500 });
    else handle = window.setTimeout(() => generate(), 800);
    return () => {
      const cancel = (window as any).cancelIdleCallback;
      if (idle && cancel) cancel(handle);
      else window.clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caredOnes?.length, myTasks.length]);

  const levelColor: Record<string, string> = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-warning/10 text-warning border-warning/20",
    low: "bg-muted text-muted-foreground border-transparent",
  };

  const mergedAlerts = [
    ...ruleAlerts,
    ...((briefing?.alerts || []).filter((a) => !ruleAlerts.some((r) => r.text === a.text))),
  ].slice(0, 6);

  const planRow = (
    key: string,
    icon: typeof Pill,
    items: { time: string; text: string; done: boolean }[],
    emptyText: string,
  ) => {
    const Icon = icon;
    return (
      <div key={key} className="flex items-start gap-2">
        <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1 space-y-0.5">
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground">{emptyText}</p>
          ) : (
            items.map((it, i) => (
              <p key={i} className="text-sm text-foreground">
                <span className="text-muted-foreground mr-1.5">{it.time}</span>
                <span className={it.done ? "line-through text-muted-foreground" : ""}>{it.text}</span>
              </p>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-transparent card-elevated bg-gradient-to-br from-primary/5 via-transparent to-coral/5">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          {Z("今日简报", "Today's Briefing")}
          <Badge variant="outline" className="text-[9px] uppercase tracking-wide">
            {Z("实时", "Live")}
          </Badge>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => generate()} disabled={loading} className="h-7 text-xs">
          {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
          {Z("刷新", "Refresh")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {mergedAlerts.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/80">
              <AlertTriangle className="h-3 w-3" />
              {Z("需要注意", "Needs attention")}
            </div>
            {mergedAlerts.map((a, i) => (
              <div key={i} className={`text-xs px-2.5 py-2 rounded-lg border ${levelColor[a.level] || levelColor.low}`}>
                {a.text}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/80">
            <ListChecks className="h-3 w-3" />
            {Z("今天要做的事", "Due today")}
          </div>
          {planRow("meds", Pill, plan.medicines, Z("今天没有用药安排", "No medication scheduled today"))}
          {planRow("checkins", ClipboardCheck, plan.checkins, Z("今天没有签到安排", "No check-in scheduled today"))}
          {plan.tasks.length > 0 && planRow("tasks", CheckSquare, plan.tasks, "")}
        </div>

        {(loading || briefing?.summary || error) && (
          <div className="space-y-1.5">
            {loading && !briefing ? (
              <p className="text-xs text-muted-foreground animate-pulse">
                {Z("正在整理今天的安排…", "Putting today's plan together…")}
              </p>
            ) : briefing?.summary ? (
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{briefing.summary}</p>
            ) : (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>
        )}

        {briefing?.suggestions && briefing.suggestions.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/80">
              <Lightbulb className="h-3 w-3" />
              {Z("建议", "Suggestions")}
            </div>
            {briefing.suggestions.slice(0, 4).map((s, i) => (
              <div key={i} className="text-xs p-2 rounded-lg bg-muted/50">
                <p className="font-medium text-foreground">{s.title}</p>
                {s.detail && <p className="text-muted-foreground mt-0.5 leading-relaxed">{s.detail}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
