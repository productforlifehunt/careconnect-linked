import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search, MapPin, Star, Shield, Clock, Heart,
  Users, ArrowRight, CheckCircle, Loader2
} from "lucide-react";
import { useProviders } from "@/features/providers/use-providers";
import { useSite } from "@/contexts/SiteContext";
import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-image.jpg";
import heroImageCn from "@/assets/hero-image-cn.jpg";
import heroImageCarecnc from "@/assets/hero-image-carecnc.jpg";
import { BrandMark } from "@/components/BrandMark";
import type { Profile } from "@/types/care-connector";
import { searchCnCities } from "@/data/china-cities";
import { careServiceTypeLabel } from "@/lib/care-service-types";

const Index = () => {
  const navigate = useNavigate();
  const site = useSite();
  const { t, i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const isSafety = site.family === "notchsafety";
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [featuredVisible, setFeaturedVisible] = useState(false);
  const featuredProvidersRef = useRef<HTMLElement>(null);

  // Release builds hide the paid caregiver marketplace entirely.
  const paidCare = site.features.paidCaregivers;
  const {
    data: topProviders,
    isLoading,
    isError: providersError,
    isFetching: providersFetching,
    refetch: refetchProviders,
  } = useProviders(
    { sortBy: "rating" },
    { enabled: paidCare && featuredVisible },
  );
  const featuredProviders = (topProviders || []).slice(0, 3);
  const providersLoading =
    paidCare &&
    (!featuredVisible || isLoading || (providersFetching && featuredProviders.length === 0 && !providersError));

  useEffect(() => {
    if (!paidCare) return;
    const node = featuredProvidersRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setFeaturedVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setFeaturedVisible(true);
        observer.disconnect();
      },
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [paidCare]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (locationQuery) params.set("location", locationQuery);
    navigate(`/search?${params.toString()}`);
  };




  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={
              isSafety
                ? (isChinese ? heroImageCarecnc : heroImage)
                : site.id === "carecnc" && isChinese
                ? heroImageCarecnc
                : isChinese && site.family === "challenged"
                ? heroImageCn
                : heroImage
            }
            alt={isSafety ? (isChinese ? "家人一起查看位置地图" : "A family viewing their location map together") : (isChinese ? "用心的护理" : "Compassionate caregiving")}
            width={1536}
            height={864}
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div
            className={
              site.id === "carecnc"
                ? "absolute inset-0 bg-gradient-to-r from-card/85 via-card/40 to-transparent"
                : isSafety
                ? "absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-transparent"
                : "absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40"
            }
          />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-16 md:py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-[1.1] tracking-tight animate-fade-in max-w-[14ch] ${site.id === "carecnc" ? "text-foreground" : "text-primary-foreground"}`}>
              {t(`site.${site.id}.heroTitle`)}{" "}
              <span className={`${isSafety ? "text-primary-foreground" : "text-coral"} inline-block whitespace-nowrap`}>{t(`site.${site.id}.heroHighlight`)}</span>
            </h1>
            <p className={`text-base sm:text-lg md:text-xl mb-6 sm:mb-8 animate-fade-in max-w-[38rem] ${site.id === "carecnc" ? "text-foreground/80" : "text-primary-foreground/90"}`} style={{ animationDelay: "0.1s" }}>
              {t(`site.${site.id}.heroSubtitle`)}
            </p>

            {paidCare && (
            <div className="bg-card rounded-xl p-2 shadow-xl animate-fade-in max-w-4xl" style={{ animationDelay: "0.2s" }}>
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2">
                <div className="relative min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="home-care-search"
                    name="careSearch"
                    placeholder={t(`site.${site.id}.searchPlaceholder`)}
                    aria-label={t(`site.${site.id}.searchPlaceholder`)}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 border-0 bg-muted/50 h-12"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <div className="relative min-w-0">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    id="home-city-search"
                    name="cityOrZip"
                    placeholder={t("home.cityOrZip")}
                    aria-label={t("home.cityOrZip")}
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="pl-9 border-0 bg-muted/50 h-12"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    list={isChinese ? "cn-cities-list" : undefined}
                    autoComplete="off"
                  />
                  {isChinese && (
                    <datalist id="cn-cities-list">
                      {searchCnCities(locationQuery || "", 20).map(c => (
                        <option key={c.zip + c.name} value={`${c.name} ${c.zip}`}>{c.province}</option>
                      ))}
                    </datalist>
                  )}
                </div>
                <Button variant="coral" size="lg" className="h-12 px-8 lg:px-6 lg:min-w-[120px]" onClick={handleSearch}>
                  {t("common.search")}
                </Button>
              </div>
            </div>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              {site.trustBadges.map((badgeKey) => (
                <div key={badgeKey} className="flex items-center gap-2 text-primary-foreground/85 text-sm">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{t(`site.${site.id}.${badgeKey}`)}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>




      {/* Featured Caregivers */}
      {paidCare && (
      <section ref={featuredProvidersRef} className="bg-muted/50 py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground tracking-tight">{t("home.topRatedCaregivers")}</h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">{t("home.trustedProfessionals")}</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/search")} className="hidden sm:flex">
              {t("home.viewAllCaregivers")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {providersLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : providersError && featuredProviders.length === 0 ? (
            <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isChinese ? "暂时无法加载护理人员资料，请重试。" : "Caregiver profiles couldn't load right now. Please try again."}
              </p>
              <Button variant="outline" size="sm" onClick={() => void refetchProviders()} disabled={providersFetching}>
                {providersFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {providersFetching ? (isChinese ? "正在加载…" : "Loading…") : (isChinese ? "重试" : "Try again")}
              </Button>
            </div>
          ) : (
            <>
            {providersError && (
              <div role="status" className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2">
                <p className="text-sm text-muted-foreground">
                  {isChinese ? "暂时无法刷新护理人员列表，以下是已有结果。" : "Couldn't refresh caregiver profiles. Showing the latest available results."}
                </p>
                <Button variant="ghost" size="sm" className="shrink-0" onClick={() => void refetchProviders()} disabled={providersFetching}>
                  {providersFetching ? (isChinese ? "加载中…" : "Loading…") : (isChinese ? "重试" : "Try again")}
                </Button>
              </div>
            )}
            {featuredProviders.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProviders.map((cg: Profile) => (
                <Link key={cg.id} to={`/caregiver/${cg.id}`} aria-label={isChinese ? `查看${cg.full_name || "护理人员"}的资料` : `View ${cg.full_name || "caregiver"}'s profile`} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Card className="card-elevated cursor-pointer border-transparent overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <img src={cg.avatar_url || "/placeholder.svg"} alt={cg.full_name || ""} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground truncate">{cg.full_name}</h3>
                            {cg.care_provider_is_background_checked && <Shield className="h-4 w-4 text-primary shrink-0" />}
                          </div>
                          {cg.rating_average != null && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-4 w-4 text-warning fill-warning" />
                              <span className="text-sm font-medium">{cg.rating_average.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground">({cg.rating_count || 0})</span>
                            </div>
                          )}
                          {cg.location && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {cg.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {(cg.service_type_slugs || []).slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary" className="bg-accent text-accent-foreground text-xs">{careServiceTypeLabel(s, !!isChinese)}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-end mt-4 pt-4 border-t">
                        <div className="text-right">
                          {cg.care_provider_starts_hourly_rate ? (
                            <>
                              <span className="text-lg font-bold text-foreground">{isChinese ? "¥" : "$"}{cg.care_provider_starts_hourly_rate}</span>
                              <span className="text-sm text-muted-foreground">{t("common.perHour")}</span>
                            </>
                          ) : (
                            <span className="text-sm font-medium text-muted-foreground">{isChinese ? "价格待询" : "Rate on request"}</span>
                          )}
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>
                </Link>
              ))}
            </div>
            ) : (
              <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                {isChinese ? "目前没有可展示的护理人员。您可以浏览全部护理人员。" : "No caregiver profiles are available right now. Browse all caregivers instead."}
              </p>
            )}
            </>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" onClick={() => navigate("/search")}>
              {t("home.viewAllCaregivers")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      )}

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 py-10 sm:py-16">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground text-center mb-8 sm:mb-12 tracking-tight">{t(`site.${site.id}.howItWorksTitle`)}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {site.howItWorksSteps.map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl hero-gradient flex items-center justify-center mb-4">
                <span className="text-primary-foreground font-bold text-xl">{item.step}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t(`site.${site.id}.${item.titleKey}`)}</h3>
              <p className="text-muted-foreground">{t(`site.${site.id}.${item.descKey}`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground mb-3 sm:mb-4 tracking-tight">{t(`site.${site.id}.ctaTitle`)}</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">{t(`site.${site.id}.ctaSubtitle`)}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {paidCare && (
              <Button variant="coral" size="lg" onClick={() => navigate("/search")}>
                {t(`site.${site.id}.ctaButton`)}
              </Button>
            )}
            <Button variant="secondary" size="lg" onClick={() => navigate("/auth?mode=signup")}>
              {t("home.createFreeAccount")}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="w-full px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <BrandMark size={48} showWordmark />
              </div>
              <p className="text-sm text-muted-foreground">{t(`site.${site.id}.footerTagline`)}</p>
            </div>
            {(isSafety ? [
              { title: isChinese ? "家人安全" : "Family safety", links: [
                { label: isChinese ? "实时地图" : "Live map", href: "/auth" },
                { label: isChinese ? "地点提醒" : "Place alerts", href: "/auth" },
                { label: isChinese ? "家庭圈子" : "Family circle", href: "/auth" },
              ] },
              { title: isChinese ? "开始使用" : "Get started", links: [
                { label: isChinese ? "创建账号" : "Create account", href: "/auth?mode=signup" },
                { label: isChinese ? "登录" : "Sign in", href: "/auth" },
                { label: isChinese ? "创建家庭圈子" : "Create a family circle", href: "/auth?mode=signup" },
              ] },
              { title: isChinese ? "隐私与帮助" : "Privacy & help", links: [
                { label: isChinese ? "信任与安全" : "Trust & safety", href: "/trust-safety" },
                { label: isChinese ? "紧急求助" : "Emergency SOS", href: "/auth" },
              ] },
            ] : [
              { title: t("home.forFamilies"), links: [
                ...(paidCare ? [{ label: t("home.findCaregivers"), href: "/search" }] : []),
                { label: t("nav.howItWorks"), href: "/how-it-works" },
                { label: t("nav.trustSafety"), href: "/trust-safety" },
                { label: t(site.family === "challenged" ? "nav.careTeams" : "nav.careGroups"), href: "/care-circle" },
              ] },
              { title: t("home.forCaregivers"), links: paidCare ? [
                { label: t("home.joinAsCaregiver"), href: "/caregiver-setting" },
                { label: t("nav.tasksNeedingHelp"), href: "/tasks" },
                { label: t("nav.providerDashboard"), href: "/caregiver-setting" },
                { label: t("nav.trustSafety"), href: "/trust-safety" },
              ] : [
                { label: t("nav.tasksNeedingHelp"), href: "/tasks" },
                { label: t("nav.trustSafety"), href: "/trust-safety" },
              ] },
              { title: t("home.company"), links: [
                { label: t("nav.howItWorks"), href: "/how-it-works" },
                { label: t("nav.trustSafety"), href: "/trust-safety" },
                { label: t("common.signUp"), href: "/auth?mode=signup" },
                { label: t("common.signIn"), href: "/auth" },
              ] },
            ]).map((col) => (
              <div key={col.title}>
                <h3 className="font-semibold text-foreground mb-3 text-sm">{col.title}</h3>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            {t("common.copyright", { brand: site.name })}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
