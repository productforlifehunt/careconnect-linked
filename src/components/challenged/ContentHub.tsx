import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock, BookOpen, ChevronRight } from "lucide-react";
import { fetchChallengedContent, type ChallengedContentItem } from "@/features/challenged-content/source.wordpress";
import { useTranslation } from "react-i18next";
import { stripHtml } from "@/features/shared/wordpress-client";

export interface ContentHubSubcategory {
  key: string;
  label: string;
  labelZh: string;
}

interface ContentHubProps {
  category: string;
  brandName: string;
  brandNameZh: string;
  title: string;
  titleZh: string;
  subtitle: string;
  subtitleZh: string;
  icon: React.ReactNode;
  accentColor: string; // tailwind class like "from-purple-600 to-indigo-700"
  subcategories: ContentHubSubcategory[];
  basePath: string; // e.g. "/awared"
}

export function ContentHub({
  category,
  brandName,
  brandNameZh,
  title,
  titleZh,
  subtitle,
  subtitleZh,
  icon,
  accentColor,
  subcategories,
  basePath,
}: ContentHubProps) {
  const { i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const [activeSubcategory, setActiveSubcategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: articles, isLoading } = useQuery({
    queryKey: ["challenged-content", category, activeSubcategory],
    queryFn: () =>
      fetchChallengedContent(
        category,
        activeSubcategory === "all" ? undefined : activeSubcategory
      ),
  });

  const filtered = (articles || []).filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title?.toLowerCase().includes(q) ||
      a.excerpt?.toLowerCase().includes(q)
    );
  });

  const displayTitle = isChinese ? titleZh : title;
  const displaySubtitle = isChinese ? subtitleZh : subtitle;
  const displayBrand = isChinese ? brandNameZh : brandName;

  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className={`relative bg-gradient-to-br ${accentColor} py-12 md:py-16`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              {icon}
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-sm font-bold backdrop-blur-sm">
              {displayBrand}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {displayTitle}
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mb-6">
            {displaySubtitle}
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isChinese ? "搜索文章..." : "Search articles..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/95 border-0 h-11 text-foreground"
            />
          </div>
        </div>
      </section>

      {/* Subcategory Tabs */}
      <div className="border-b bg-card sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-none">
            <button
              onClick={() => setActiveSubcategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeSubcategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {isChinese ? "全部" : "All"}
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.key}
                onClick={() => setActiveSubcategory(sub.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeSubcategory === sub.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {isChinese ? sub.labelZh : sub.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Article Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 rounded-t-lg" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isChinese ? "暂无内容" : "No articles yet"}
            </h3>
            <p className="text-muted-foreground">
              {isChinese
                ? "我们正在编写更多内容，请稍后再来查看。"
                : "We're working on adding more content. Check back soon."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article) => (
              <ContentCard
                key={article.id}
                article={article}
                basePath={basePath}
                isChinese={isChinese}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ContentCard({
  article,
  basePath,
  isChinese,
}: {
  article: ChallengedContentItem;
  basePath: string;
  isChinese: boolean;
}) {
  const excerpt = article.excerpt
    ? stripHtml(article.excerpt)
    : stripHtml(article.content || "").slice(0, 150);

  const readTime = article.reading_time || (isChinese ? "3分钟" : "3 min read");

  return (
    <Link to={`${basePath}/${article.id}`}>
      <Card className="group h-full hover:shadow-lg transition-all duration-300 overflow-hidden border hover:border-primary/30">
        {article.featured_image && (
          <div className="aspect-video overflow-hidden">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        )}
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs capitalize">
              {article.subcategory || article.category}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readTime}
            </span>
          </div>
          <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {excerpt}
          </p>
          <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            {isChinese ? "阅读更多" : "Read more"}
            <ChevronRight className="h-4 w-4" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
