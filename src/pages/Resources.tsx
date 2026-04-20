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
  type ISupportModule,
  type ISupportLesson,
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
