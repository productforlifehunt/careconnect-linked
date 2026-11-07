var e=`import { useParams, useNavigate, Link, useLocation } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import { StudyNotesPanel } from "@/components/challenged/StudyNotesPanel";
import { useTranslation } from "react-i18next";
import { getHubArticle, HUB_ARTICLE_CONTENT_IDS, type HubKey } from "@/data/hub-articles";

const CATEGORY_ROUTES: Record<HubKey, string> = {
  aware: "/awared",
  care: "/cared",
  cope: "/coped",
  safe: "/safed",
  accompany: "/accompanied",
};

const CATEGORY_NAMES: Record<HubKey, { en: string; zh: string }> = {
  aware: { en: "AwareD", zh: "认知篇" },
  care: { en: "CareD", zh: "护理篇" },
  cope: { en: "CopeD", zh: "应对篇" },
  safe: { en: "SafeD", zh: "安全篇" },
  accompany: { en: "AccompanieD", zh: "陪伴篇" },
};

export default function ChallengedArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const article = id ? getHubArticle(id) : undefined;
  const fallbackRoute = "/" + (location.pathname.split("/")[1] || "awared");

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-semibold mb-2">{isChinese ? "文章未找到" : "Article not found"}</h2>
        <Button variant="outline" onClick={() => navigate(fallbackRoute)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isChinese ? "返回" : "Go Back"}
        </Button>
      </div>
    );
  }

  const route = CATEGORY_ROUTES[article.hub];
  const name = CATEGORY_NAMES[article.hub];
  const title = isChinese ? article.title.zh : article.title.en;
  const body = isChinese ? article.body.zh : article.body.en;
  const anchorId = HUB_ARTICLE_CONTENT_IDS[article.key];

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to={route} className="hover:text-primary transition-colors">{isChinese ? name.zh : name.en}</Link>
        <span>/</span>
        <span className="text-foreground truncate">{title}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline">{isChinese ? name.zh : name.en}</Badge>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {isChinese ? \`\${article.minutes}分钟\` : \`\${article.minutes} min read\`}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">{title}</h1>
      </div>

      <div className="space-y-4 text-base leading-relaxed text-foreground mb-12">
        {body.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      {anchorId && (
        <div className="mb-12">
          <StudyNotesPanel articleId={anchorId} sourceTitle={title} />
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-6">
        <Button variant="outline" onClick={() => navigate(route)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isChinese ? "返回列表" : "Back to list"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            if (navigator.share) navigator.share({ title, url: window.location.href }).catch(() => {});
            else navigator.clipboard.writeText(window.location.href);
          }}
        >
          <Share2 className="h-4 w-4 mr-2" />
          {isChinese ? "分享" : "Share"}
        </Button>
      </div>
    </article>
  );
}
`;export{e as default};