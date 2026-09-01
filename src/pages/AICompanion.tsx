import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MessageCircle, Mic, Languages, Heart, BookOpen, LayoutDashboard,
  AlertTriangle, MinusCircle, ArrowRight,
} from "lucide-react";

const FEATURES = [
  { icon: MessageCircle, key: "f1" },
  { icon: Mic, key: "f2" },
  { icon: Languages, key: "f3" },
  { icon: Heart, key: "f4" },
  { icon: BookOpen, key: "f5" },
  { icon: LayoutDashboard, key: "f6" },
];

const AICompanion = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="hero-gradient py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4 bg-primary-foreground/20 text-primary-foreground border-0 text-xs sm:text-sm px-3 py-1">
            {t("aiCompanion.badge")}
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-primary-foreground mb-4 sm:mb-6 leading-tight">
            {t("aiCompanion.heroTitle")}{" "}
            <span className="text-coral">{t("aiCompanion.heroHighlight")}</span>
          </h1>
          <p className="text-base sm:text-lg text-primary-foreground/90 max-w-2xl mx-auto mb-6 sm:mb-8">
            {t("aiCompanion.heroSubtitle")}
          </p>
          <Button variant="coral" size="lg" onClick={() => navigate("/auth?mode=signup")}>
            {t("aiCompanion.tryNow")} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* What it does */}
      <section className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3">
          {t("aiCompanion.featuresTitle")}
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
          {t("aiCompanion.featuresSubtitle")}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((item) => (
            <Card key={item.key} className="card-elevated border-transparent">
              <CardContent className="p-6">
                <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-4 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{t(`aiCompanion.${item.key}Title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(`aiCompanion.${item.key}Desc`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* What it does not do */}
      <section className="bg-muted/50 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-3">
            {t("aiCompanion.limitsTitle")}
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">
            {t("aiCompanion.limitsSubtitle")}
          </p>
          <div className="space-y-3">
            {["limit1", "limit2", "limit3", "limit4", "limit5"].map((key) => (
              <div key={key} className="flex items-start gap-3 p-4 bg-card rounded-xl border">
                <MinusCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-foreground leading-relaxed">{t(`aiCompanion.${key}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3">{t("aiCompanion.ctaTitle")}</h2>
        <p className="text-muted-foreground mb-6">{t("aiCompanion.ctaSubtitle")}</p>
        <Button variant="coral" size="lg" onClick={() => navigate("/auth?mode=signup")}>
          {t("aiCompanion.tryNow")}
        </Button>
      </section>

      {/* Disclaimer */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <div className="bg-muted/50 rounded-xl p-6 border">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">{t("aiCompanion.disclaimerTitle")}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("aiCompanion.disclaimerText")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AICompanion;
