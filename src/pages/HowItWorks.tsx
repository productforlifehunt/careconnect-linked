import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSite } from "@/contexts/SiteContext";
import { useTranslation } from "react-i18next";
import { Search, CalendarDays, Users, MapPin, Shield, Star, CheckCircle, Heart } from "lucide-react";

export default function HowItWorks() {
  const navigate = useNavigate();
  const site = useSite();
  const { t } = useTranslation();

  const steps = [
    { icon: Search, title: t("howItWorks.step1Title"), desc: t("howItWorks.step1Desc") },
    { icon: CalendarDays, title: t("howItWorks.step2Title"), desc: t("howItWorks.step2Desc") },
    { icon: Users, title: t("howItWorks.step3Title"), desc: t("howItWorks.step3Desc") },
    { icon: MapPin, title: t("howItWorks.step4Title"), desc: t("howItWorks.step4Desc") },
  ];

  const features = [
    { icon: Shield, title: t("howItWorks.bgVerified"), desc: t("howItWorks.bgVerifiedDesc") },
    { icon: Star, title: t("howItWorks.verifiedReviews"), desc: t("howItWorks.verifiedReviewsDesc") },
    { icon: CheckCircle, title: t("howItWorks.certifiedPros"), desc: t("howItWorks.certifiedProsDesc") },
    { icon: Heart, title: t("howItWorks.careMatching"), desc: t("howItWorks.careMatchingDesc") },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-10 sm:mb-16">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">{t(`site.${site.id}.howItWorksTitle`)}</h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">{t("howItWorks.subtitle")}</p>
      </div>
      <div className="space-y-10 sm:space-y-12 mb-16 sm:mb-20">
        {steps.map((step, i) => (
          <div key={i} className={`flex flex-col md:flex-row gap-8 items-center ${i % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
            <div className="w-24 h-24 rounded-3xl hero-gradient flex items-center justify-center shrink-0">
              <step.icon className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <span className="text-sm font-bold text-primary">{t("common.step")} {i + 1}</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">{step.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">{t("howItWorks.whyTrust")}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <Card key={i} className="border-transparent card-elevated">
              <CardContent className="p-6 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="text-center hero-gradient rounded-2xl p-12">
        <h2 className="text-2xl font-bold text-primary-foreground mb-4">{t("howItWorks.readyToStart")}</h2>
        <p className="text-primary-foreground/80 mb-6">{t("howItWorks.searchForFree")}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="coral" size="lg" onClick={() => navigate("/search")}>{t(`site.${site.id}.ctaButton`)}</Button>
          <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" onClick={() => navigate("/auth?mode=signup")}>{t("howItWorks.createAccount")}</Button>
        </div>
      </div>
    </div>
  );
}
