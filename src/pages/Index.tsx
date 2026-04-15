import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search, MapPin, Star, Shield, Clock, Heart,
  Users, Stethoscope, Baby, Moon, ArrowRight, CheckCircle, Loader2
} from "lucide-react";
import { useProviders, useServiceCategories } from "@/hooks/use-care-data";
import { useSite } from "@/contexts/SiteContext";
import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-image.jpg";
import heroImageCn from "@/assets/hero-image-cn.jpg";
import yichangIcon from "@/assets/yichang-icon.png";
import type { Profile } from "@/types/care-connector";
import { getSpecialtyKey } from "@/lib/specialty-i18n";

const Index = () => {
  const navigate = useNavigate();
  const site = useSite();
  const { t, i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const { data: topProviders, isLoading } = useProviders({ sortBy: "rating" });
  const { data: categories } = useServiceCategories();
  const featuredProviders = (topProviders || []).slice(0, 3);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (locationQuery) params.set("location", locationQuery);
    navigate(`/search?${params.toString()}`);
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    "Elder Care": <Heart className="h-6 w-6" />,
    "Child Care": <Baby className="h-6 w-6" />,
    "Special Needs": <Users className="h-6 w-6" />,
    "Nursing Care": <Stethoscope className="h-6 w-6" />,
    "Companionship": <Users className="h-6 w-6" />,
    "Respite Care": <Moon className="h-6 w-6" />,
  };

  const displayCategories = (categories || []).slice(0, 6).map(c => ({ name: c.name, count: 0 }));

  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={isChinese && site.id === "challenged" ? heroImageCn : heroImage} alt="Compassionate caregiving" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight animate-fade-in">
              {t(`site.${site.id}.heroTitle`)}{" "}
              <span className="text-coral">{t(`site.${site.id}.heroHighlight`)}</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              {t(`site.${site.id}.heroSubtitle`)}
            </p>

            <div className="bg-card rounded-xl p-2 shadow-xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t(`site.${site.id}.searchPlaceholder`)}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 border-0 bg-muted/50 h-12"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t("home.cityOrZip")}
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="pl-9 border-0 bg-muted/50 h-12"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button variant="coral" size="lg" className="h-12 px-8" onClick={handleSearch}>
                  {t("common.search")}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              {site.trustBadges.map((badgeKey) => (
                <div key={badgeKey} className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>{t(`site.${site.id}.${badgeKey}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{t("home.browseByCategory")}</h2>
        <p className="text-muted-foreground mb-8">{t("home.findRightCare")}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayCategories.map((cat) => (
            <Card key={cat.name} className="card-elevated cursor-pointer group border-transparent" onClick={() => navigate(`/search?q=${encodeURIComponent(cat.name)}`)}>
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {categoryIcons[cat.name] || <Heart className="h-6 w-6" />}
                </div>
                <h3 className="font-semibold text-sm text-foreground">{t(getSpecialtyKey(cat.name))}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Caregivers */}
      <section className="bg-muted/50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">{t("home.topRatedCaregivers")}</h2>
              <p className="text-muted-foreground mt-1">{t("home.trustedProfessionals")}</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/search")} className="hidden sm:flex">
              {t("home.viewAllCaregivers")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProviders.map((cg: Profile) => (
                <Card key={cg.id} className="card-elevated cursor-pointer border-transparent overflow-hidden" onClick={() => navigate(`/caregiver/${cg.id}`)}>
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <img src={cg.avatar_url || "/placeholder.svg"} alt={cg.full_name || ""} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground truncate">{cg.full_name}</h3>
                            {cg.care_provider_is_background_checked && <Shield className="h-4 w-4 text-primary shrink-0" />}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-4 w-4 text-warning fill-warning" />
                            <span className="text-sm font-medium">{cg.rating_average?.toFixed(1) || t("common.new")}</span>
                            <span className="text-xs text-muted-foreground">({cg.rating_count || 0})</span>
                          </div>
                          {cg.location && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {cg.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {(cg.specialty || []).slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary" className="bg-accent text-accent-foreground text-xs">{s}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-end mt-4 pt-4 border-t">
                        <div className="text-right">
                          <span className="text-lg font-bold text-foreground">${cg.care_provider_starts_hourly_rate || 0}</span>
                          <span className="text-sm text-muted-foreground">{t("common.perHour")}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" onClick={() => navigate("/search")}>
              {t("home.viewAllCaregivers")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">{t(`site.${site.id}.howItWorksTitle`)}</h2>
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
      <section className="hero-gradient py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">{t(`site.${site.id}.ctaTitle`)}</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">{t(`site.${site.id}.ctaSubtitle`)}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="coral" size="lg" onClick={() => navigate("/search")}>
              {t(`site.${site.id}.ctaButton`)}
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate("/auth?mode=signup")}>
              {t("home.createFreeAccount")}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {site.id === "challenged" && isChinese ? (
                  <img src={yichangIcon} alt="忆畅" className="w-12 h-12 rounded-xl" loading="lazy" />
                ) : (
                  <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-xs">{site.logoText}</span>
                  </div>
                )}
                <span className="font-bold text-foreground">{t(`site.${site.id}.footerBrand`)}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t(`site.${site.id}.footerTagline`)}</p>
            </div>
            {[
              { title: t("home.forFamilies"), links: [
                { label: t("home.findCaregivers"), href: "/search" },
                { label: t("nav.howItWorks"), href: "/how-it-works" },
                { label: t("nav.trustSafety"), href: "/trust-safety" },
                { label: t(site.id === "challenged" ? "nav.careTeams" : "nav.careGroups"), href: "/care-circle" },
              ] },
              { title: t("home.forCaregivers"), links: [
                { label: t("home.joinAsCaregiver"), href: "/become-caregiver" },
                { label: t("nav.jobsBoard"), href: "/jobs" },
                { label: t("nav.providerDashboard"), href: "/provider-dashboard" },
                { label: t("nav.trustSafety"), href: "/trust-safety" },
              ] },
              { title: t("home.company"), links: [
                { label: t("nav.howItWorks"), href: "/how-it-works" },
                { label: t("nav.trustSafety"), href: "/trust-safety" },
                { label: t("common.signUp"), href: "/auth?mode=signup" },
                { label: t("common.signIn"), href: "/auth" },
              ] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-foreground mb-3 text-sm">{col.title}</h4>
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
            {t("common.copyright", { brand: t(`site.${site.id}.footerBrand`) })}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
