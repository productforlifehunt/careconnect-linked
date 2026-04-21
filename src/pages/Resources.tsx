import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  Circle,
  ExternalLink,
  Clock,
  BookOpen,
  Sparkles,
  PlayCircle,
  HelpCircle,
  Lightbulb,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ISUPPORT_MODULES,
  getModule,
  getNextLesson,
  TOTAL_LESSONS,
  type ISupportModule,
  type ISupportLesson,
  type ISupportQuiz,
} from "@/data/isupport-modules";
import { fetchChallengedContent } from "@/features/challenged-content/source.wordpress";
import { stripHtml } from "@/features/shared/wordpress-client";

const PROGRESS_KEY = "isupport_completed_lessons";

function loadProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveProgress(set: Set<string>) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify([...set]));
  } catch {
    // ignore
  }
}

export default function Resources() {
  const { i18n, t } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const [activeModuleKey, setActiveModuleKey] = useState<string | null>(null);
  const [activeLessonKey, setActiveLessonKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [progress, setProgress] = useState<Set<string>>(() => loadProgress());

  const activeModule = activeModuleKey ? getModule(activeModuleKey) : null;
  const activeLesson = useMemo(() => {
    if (!activeModule || !activeLessonKey) return null;
    return activeModule.lessons.find((l) => l.key === activeLessonKey) || null;
  }, [activeModule, activeLessonKey]);

  // search across all lessons (must run before any early return)
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    const results: Array<{ module: ISupportModule; lesson: ISupportLesson }> =
      [];
    ISUPPORT_MODULES.forEach((m) => {
      m.lessons.forEach((l) => {
        const hay = (
          (isZh ? l.titleZh + l.summaryZh : l.title + l.summary) +
          " " +
          (isZh ? m.titleZh : m.title)
        ).toLowerCase();
        if (hay.includes(q)) results.push({ module: m, lesson: l });
      });
    });
    return results;
  }, [search, isZh]);

  const toggleComplete = (lessonKey: string) => {
    const next = new Set(progress);
    if (next.has(lessonKey)) next.delete(lessonKey);
    else next.add(lessonKey);
    setProgress(next);
    saveProgress(next);
  };

  // ─── LESSON DETAIL VIEW ──────────────────────────────────────
  if (activeModule && activeLesson) {
    return (
      <LessonView
        module={activeModule}
        lesson={activeLesson}
        isZh={isZh}
        isComplete={progress.has(activeLesson.key)}
        onToggleComplete={() => toggleComplete(activeLesson.key)}
        onBack={() => setActiveLessonKey(null)}
      />
    );
  }

  // ─── MODULE DETAIL VIEW ──────────────────────────────────────
  if (activeModule) {
    return (
      <ModuleView
        module={activeModule}
        isZh={isZh}
        progress={progress}
        onBack={() => setActiveModuleKey(null)}
        onSelectLesson={(key) => setActiveLessonKey(key)}
      />
    );
  }

  // ─── HUB VIEW (5 modules) ────────────────────────────────────
  const totalLessons = TOTAL_LESSONS;
  const completedCount = progress.size;
  const overallPct = Math.round((completedCount / totalLessons) * 100);
  const nextUp = getNextLesson(progress);

  return (
    <div className="min-h-full bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground py-10 md:py-14">
        <div className="max-w-5xl mx-auto px-4">
          <Badge
            variant="secondary"
            className="bg-white/20 text-white border-0 mb-3 backdrop-blur-sm"
          >
            {isZh ? "WHO iSupport · 失智症照护指南" : "WHO iSupport · Dementia Care Guide"}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {isZh ? "资源中心" : "Resources"}
          </h1>
          <p className="text-primary-foreground/90 max-w-2xl mb-6">
            {isZh
              ? "由世界卫生组织 iSupport 框架精心编排的 5 个模块、23 节课，帮助您从认识失智症到照顾好自己。"
              : "5 modules, 23 lessons — curated from the WHO iSupport framework. From understanding dementia to looking after yourself."}
          </p>

          {/* Overall progress */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-md">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>{isZh ? "我的进度" : "Your progress"}</span>
              <span className="font-semibold">
                {completedCount} / {totalLessons}
              </span>
            </div>
            <Progress value={overallPct} className="h-2 bg-white/20" />
          </div>

          {/* Search */}
          <div className="relative max-w-md mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isZh ? "搜索课程，如「躁动」「沐浴」" : "Search lessons (e.g. 'sundowning')"
              }
              className="pl-9 bg-white/95 border-0 h-11 text-foreground"
            />
          </div>
        </div>
      </section>

      {/* Search results overlay */}
      {search.trim() && (
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h2 className="text-lg font-semibold mb-3">
            {isZh ? "搜索结果" : "Search results"} · {searchResults.length}
          </h2>
          {searchResults.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {isZh ? "找不到相关课程" : "No matching lessons"}
            </p>
          ) : (
            <div className="space-y-2">
              {searchResults.map(({ module, lesson }) => (
                <button
                  key={`${module.key}-${lesson.key}`}
                  onClick={() => {
                    setActiveModuleKey(module.key);
                    setActiveLessonKey(lesson.key);
                    setSearch("");
                  }}
                  className="w-full text-left p-4 rounded-lg border bg-card hover:border-primary/40 transition-colors flex items-center gap-3"
                >
                  <module.icon className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground">
                      {isZh ? module.titleZh : module.title}
                    </div>
                    <div className="font-medium truncate">
                      {isZh ? lesson.titleZh : lesson.title}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modules grid */}
      {!search.trim() && (
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Continue learning */}
          {nextUp && (
            <button
              onClick={() => {
                setActiveModuleKey(nextUp.module.key);
                setActiveLessonKey(nextUp.lesson.key);
              }}
              className="w-full text-left mb-6 group"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all border-primary/20">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`bg-gradient-to-br ${nextUp.module.accent} text-white rounded-xl p-3 shrink-0`}>
                    <PlayCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs uppercase tracking-wide text-primary font-semibold mb-1">
                      {completedCount === 0
                        ? isZh ? "开始学习" : "Start learning"
                        : isZh ? "继续学习" : "Continue learning"}
                    </div>
                    <div className="font-semibold text-base truncate">
                      {isZh ? nextUp.lesson.titleZh : nextUp.lesson.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {isZh ? nextUp.module.titleZh : nextUp.module.title}
                      {nextUp.lesson.readMinutes ? (
                        <> · {nextUp.lesson.readMinutes} {isZh ? "分钟" : "min read"}</>
                      ) : null}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </CardContent>
              </Card>
            </button>
          )}

          {/* Section heading */}
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-xl font-bold">
              {isZh ? "5 个学习模块" : "5 Learning Modules"}
            </h2>
            <span className="text-xs text-muted-foreground">
              {totalLessons} {isZh ? "节课" : "lessons"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ISUPPORT_MODULES.map((m) => {
              const moduleProgress = m.lessons.filter((l) =>
                progress.has(l.key)
              ).length;
              const pct = Math.round(
                (moduleProgress / m.lessons.length) * 100
              );
              return (
                <button
                  key={m.key}
                  onClick={() => setActiveModuleKey(m.key)}
                  className="text-left group"
                >
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/30">
                    <div
                      className={`bg-gradient-to-br ${m.accent} p-5 text-white relative`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5">
                          <m.icon className="h-6 w-6" />
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-white/20 text-white border-0 backdrop-blur-sm"
                        >
                          {isZh ? `模块 ${m.number}` : `Module ${m.number}`}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold mt-4">
                        {isZh ? m.titleZh : m.title}
                      </h3>
                    </div>
                    <CardContent className="p-5">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {isZh ? m.descriptionZh : m.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {m.lessons.length} {isZh ? "节课" : "lessons"}
                        </span>
                        <span>
                          {moduleProgress}/{m.lessons.length}{" "}
                          {isZh ? "完成" : "done"}
                        </span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <p className="text-xs text-muted-foreground text-center mt-8 max-w-2xl mx-auto">
            {isZh
              ? "本指南改编自世界卫生组织（WHO）iSupport for Dementia 计划，仅供教育用途，不能替代专业医疗建议。"
              : "Adapted from the World Health Organization's iSupport for Dementia programme. Educational only — not a substitute for professional medical advice."}
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MODULE VIEW — list of lessons with progress
// ═══════════════════════════════════════════════════════════════
function ModuleView({
  module,
  isZh,
  progress,
  onBack,
  onSelectLesson,
}: {
  module: ISupportModule;
  isZh: boolean;
  progress: Set<string>;
  onBack: () => void;
  onSelectLesson: (key: string) => void;
}) {
  const completed = module.lessons.filter((l) => progress.has(l.key)).length;
  const pct = Math.round((completed / module.lessons.length) * 100);

  return (
    <div className="min-h-full bg-background">
      <section className={`bg-gradient-to-br ${module.accent} text-white py-8`}>
        <div className="max-w-3xl mx-auto px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/20 mb-3 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {isZh ? "返回资源中心" : "All Resources"}
          </Button>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5">
              <module.icon className="h-6 w-6" />
            </div>
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-0 backdrop-blur-sm"
            >
              {isZh ? `模块 ${module.number}` : `Module ${module.number}`}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {isZh ? module.titleZh : module.title}
          </h1>
          <p className="text-white/90 mb-4">
            {isZh ? module.descriptionZh : module.description}
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 max-w-sm">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span>{isZh ? "本模块进度" : "Module progress"}</span>
              <span className="font-semibold">
                {completed}/{module.lessons.length}
              </span>
            </div>
            <Progress value={pct} className="h-1.5 bg-white/20" />
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-2">
        {module.lessons.map((lesson, idx) => {
          const done = progress.has(lesson.key);
          return (
            <button
              key={lesson.key}
              onClick={() => onSelectLesson(lesson.key)}
              className="w-full text-left p-4 rounded-xl border bg-card hover:border-primary/40 hover:shadow-sm transition-all flex items-center gap-4 group"
            >
              <div className="shrink-0">
                {done ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-xs font-semibold text-muted-foreground">
                    {idx + 1}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base mb-0.5">
                  {isZh ? lesson.titleZh : lesson.title}
                </div>
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {isZh ? lesson.summaryZh : lesson.summary}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LESSON VIEW — summary + linked tools + linked deep-dive articles
// ═══════════════════════════════════════════════════════════════
function LessonView({
  module,
  lesson,
  isZh,
  isComplete,
  onToggleComplete,
  onBack,
}: {
  module: ISupportModule;
  lesson: ISupportLesson;
  isZh: boolean;
  isComplete: boolean;
  onToggleComplete: () => void;
  onBack: () => void;
}) {
  // Pull related deep-dive articles (if any)
  const { data: articles, isLoading } = useQuery({
    queryKey: [
      "isupport-related",
      lesson.contentCategory,
      lesson.contentSubcategory,
    ],
    queryFn: () =>
      lesson.contentCategory
        ? fetchChallengedContent(
            lesson.contentCategory,
            lesson.contentSubcategory
          )
        : Promise.resolve([]),
    enabled: !!lesson.contentCategory,
  });

  const articleBasePath =
    lesson.contentCategory === "aware"
      ? "/aware"
      : lesson.contentCategory === "care"
        ? "/care-guides"
        : lesson.contentCategory === "coping"
          ? "/coping"
          : lesson.contentCategory === "safe"
            ? "/safety-guides"
            : "/accompanied";

  return (
    <div className="min-h-full bg-background">
      <section className={`bg-gradient-to-br ${module.accent} text-white py-6`}>
        <div className="max-w-3xl mx-auto px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/20 mb-3 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {isZh ? module.titleZh : module.title}
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">
            {isZh ? lesson.titleZh : lesson.title}
          </h1>
          {lesson.readMinutes && (
            <div className="flex items-center gap-1.5 text-white/80 text-sm mt-2">
              <Clock className="h-3.5 w-3.5" />
              {lesson.readMinutes} {isZh ? "分钟阅读" : "min read"}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Summary */}
        <Card>
          <CardContent className="p-6">
            <p className="text-base leading-relaxed">
              {isZh ? lesson.summaryZh : lesson.summary}
            </p>
          </CardContent>
        </Card>

        {/* Key actions */}
        {lesson.keyActions && lesson.keyActions.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm uppercase tracking-wide text-primary">
                  {isZh ? "今天就可以做" : "Try today"}
                </h3>
              </div>
              <ul className="space-y-2">
                {(isZh && lesson.keyActionsZh
                  ? lesson.keyActionsZh
                  : lesson.keyActions
                ).map((action, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed">
                    <span className="shrink-0 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Reflect — WHO 'Stop & think' prompt */}
        {lesson.reflectQuestion && (
          <Card className="border-amber-300/40 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h3 className="font-semibold text-sm uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  {isZh ? "停下来想一想" : "Stop & think"}
                </h3>
              </div>
              <p className="text-base leading-relaxed italic">
                {isZh ? lesson.reflectQuestionZh : lesson.reflectQuestion}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Self-check Quiz */}
        {lesson.quiz && <QuizCard quiz={lesson.quiz} isZh={isZh} />}

        {/* Tool CTA */}
        {lesson.toolPath && lesson.toolLabel && (
          <Link to={lesson.toolPath}>
            <Card className="hover:border-primary/40 hover:shadow-sm transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2.5">
                  <ExternalLink className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">
                    {isZh ? "在应用中尝试" : "Try in app"}
                  </div>
                  <div className="font-semibold">
                    {isZh
                      ? lesson.toolLabelZh || lesson.toolLabel
                      : lesson.toolLabel}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Mark complete */}
        <Button
          onClick={onToggleComplete}
          variant={isComplete ? "secondary" : "default"}
          className="w-full"
        >
          {isComplete ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isZh ? "已完成 · 点击取消" : "Completed · tap to undo"}
            </>
          ) : (
            <>
              <Circle className="h-4 w-4 mr-2" />
              {isZh ? "标记为已完成" : "Mark as complete"}
            </>
          )}
        </Button>

        {/* Deep dive articles */}
        {lesson.contentCategory && (
          <div>
            <h2 className="text-lg font-semibold mb-3">
              {isZh ? "深入阅读" : "Go deeper"}
            </h2>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : articles && articles.length > 0 ? (
              <div className="space-y-2">
                {articles.slice(0, 6).map((a) => {
                  const excerpt = a.excerpt
                    ? stripHtml(a.excerpt)
                    : stripHtml(a.content || "").slice(0, 140);
                  return (
                    <Link
                      key={a.id}
                      to={`${articleBasePath}/${a.id}`}
                      className="block p-4 rounded-lg border bg-card hover:border-primary/40 hover:shadow-sm transition-all"
                    >
                      <div className="font-semibold mb-1 line-clamp-1">
                        {a.title}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {excerpt}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {a.reading_time || (isZh ? "3 分钟" : "3 min read")}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isZh
                  ? "暂无更多深入文章。"
                  : "No additional articles yet."}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// QUIZ CARD — single-question self-check (WHO format)
// ═══════════════════════════════════════════════════════════════
function QuizCard({ quiz, isZh }: { quiz: ISupportQuiz; isZh: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);
  const question = isZh ? quiz.questionZh : quiz.question;
  const options = isZh ? quiz.optionsZh : quiz.options;
  const explanation = isZh ? quiz.explanationZh : quiz.explanation;
  const isCorrect = selected === quiz.correct;
  const answered = selected !== null;

  return (
    <Card className="border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm uppercase tracking-wide text-primary">
            {isZh ? "小测验" : "Quick check"}
          </h3>
        </div>
        <p className="text-base font-medium mb-4">{question}</p>
        <div className="space-y-2">
          {options.map((opt, i) => {
            const isPicked = selected === i;
            const showCorrect = answered && i === quiz.correct;
            const showWrong = answered && isPicked && i !== quiz.correct;
            return (
              <button
                key={i}
                onClick={() => !answered && setSelected(i)}
                disabled={answered}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-start gap-3 text-sm ${
                  showCorrect
                    ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                    : showWrong
                      ? "border-destructive bg-destructive/5"
                      : isPicked
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/50"
                } ${answered ? "cursor-default" : "cursor-pointer"}`}
              >
                <span
                  className={`shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    showCorrect
                      ? "border-green-500 bg-green-500 text-white"
                      : showWrong
                        ? "border-destructive bg-destructive text-destructive-foreground"
                        : "border-muted-foreground/40"
                  }`}
                >
                  {showCorrect && <CheckCircle2 className="h-3 w-3" />}
                  {showWrong && <XCircle className="h-3 w-3" />}
                </span>
                <span className="flex-1">{opt}</span>
              </button>
            );
          })}
        </div>
        {answered && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              isCorrect
                ? "bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-200"
                : "bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200"
            }`}
          >
            <div className="font-semibold mb-1">
              {isCorrect
                ? isZh
                  ? "✓ 正确！"
                  : "✓ Correct!"
                : isZh
                  ? "再想想"
                  : "Not quite"}
            </div>
            <p className="leading-relaxed">{explanation}</p>
            {!isCorrect && (
              <button
                onClick={() => setSelected(null)}
                className="mt-2 text-xs underline opacity-80 hover:opacity-100"
              >
                {isZh ? "再试一次" : "Try again"}
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
