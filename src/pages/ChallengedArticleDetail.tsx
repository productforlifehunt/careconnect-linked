import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, Calendar, Share2 } from "lucide-react";
import { fetchChallengedContentById } from "@/features/challenged-content/source.wordpress";
import { StudyNotesPanel } from "@/components/challenged/StudyNotesPanel";
import { useTranslation } from "react-i18next";
import { formatDate, formatTime, formatDateTime } from "@/lib/locale";

/** Maps category to route base */
const CATEGORY_ROUTES: Record<string, string> = {
  aware: "/awared",
  care: "/cared",
  cope: "/coped",
  safe: "/safed",
  accompany: "/accompanied",
};

const CATEGORY_NAMES: Record<string, { en: string; zh: string }> = {
  aware: { en: "AwareD", zh: "认知篇" },
  care: { en: "CareD", zh: "护理篇" },
  cope: { en: "CopeD", zh: "应对篇" },
  safe: { en: "SafeD", zh: "安全篇" },
  accompany: { en: "AccompanieD", zh: "陪伴篇" },
};

export default function ChallengedArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");

  const { data: article, isLoading } = useQuery({
    queryKey: ["challenged-content-detail", id],
    queryFn: () => fetchChallengedContentById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold mb-2">
          {isChinese ? "文章未找到" : "Article not found"}
        </h2>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isChinese ? "返回" : "Go Back"}
        </Button>
      </div>
    );
  }

  const categoryRoute = CATEGORY_ROUTES[article.category] || "/awared";
  const categoryName = CATEGORY_NAMES[article.category];
  const readTime = article.reading_time || (isChinese ? "3分钟" : "3 min read");

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to={categoryRoute} className="hover:text-primary transition-colors">
          {isChinese ? categoryName?.zh : categoryName?.en}
        </Link>
        <span>/</span>
        <span className="text-foreground truncate">{article.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline" className="capitalize">
            {article.subcategory || article.category}
          </Badge>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {readTime}
          </span>
          {article.created_at && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(article.created_at)}
            </span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
          {article.title}
        </h1>

        {article.author_name && (
          <p className="text-muted-foreground">
            {isChinese ? "作者：" : "By "}
            {article.author_name}
          </p>
        )}
      </div>

      {/* Featured Image */}
      {article.featured_image && (
        <div className="rounded-xl overflow-hidden mb-8">
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-auto object-cover max-h-[400px]"
          />
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-lg dark:prose-invert max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: article.content || "" }}
      />

      {/* Study notes & lesson tracking */}
      {id && !String(id).startsWith("static-") && (
        <div className="mb-12">
          <StudyNotesPanel
            articleId={String(id).replace(/^wp-/, "")}
            showFinishedToggle={article.category === "learn"}
          />
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between border-t pt-6">
        <Button variant="outline" onClick={() => navigate(categoryRoute)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isChinese ? "返回列表" : "Back to list"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: article.title, url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
            }
          }}
        >
          <Share2 className="h-4 w-4 mr-2" />
          {isChinese ? "分享" : "Share"}
        </Button>
      </div>
    </article>
  );
}
