import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Shield, Heart, Brain, MessageCircle, Lock, AlertTriangle,
  CheckCircle, Bot, Phone, Video, Headphones, ArrowRight, Eye
} from "lucide-react";

const AICompanion = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isChinese = i18n.language?.startsWith("zh");

  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="hero-gradient py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4 bg-primary-foreground/20 text-primary-foreground border-0 text-sm px-4 py-1">
            {t("aiCompanion.badge")}
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            {t("aiCompanion.heroTitle")}{" "}
            <span className="text-coral">{t("aiCompanion.heroHighlight")}</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/90 max-w-3xl mx-auto mb-8">
            {t("aiCompanion.heroSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="coral" size="lg" onClick={() => navigate("/auth?mode=signup")}>
              {t("aiCompanion.tryNow")}
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate("/how-it-works")}>
              {t("common.learnMore")}
            </Button>
          </div>
        </div>
      </section>

      {/* Why our AI is different */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
          {t("aiCompanion.whyDifferentTitle")}
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
          {t("aiCompanion.whyDifferentSubtitle")}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Brain, titleKey: "feature1Title", descKey: "feature1Desc" },
            { icon: Shield, titleKey: "feature2Title", descKey: "feature2Desc" },
            { icon: Lock, titleKey: "feature3Title", descKey: "feature3Desc" },
            { icon: Heart, titleKey: "feature4Title", descKey: "feature4Desc" },
            { icon: MessageCircle, titleKey: "feature5Title", descKey: "feature5Desc" },
            { icon: AlertTriangle, titleKey: "feature6Title", descKey: "feature6Desc" },
            { icon: Eye, titleKey: "feature7Title", descKey: "feature7Desc" },
          ].map((item) => (
            <Card key={item.titleKey} className="card-elevated border-transparent">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{t(`aiCompanion.${item.titleKey}`)}</h3>
                <p className="text-sm text-muted-foreground">{t(`aiCompanion.${item.descKey}`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Capabilities — Qwen3.5-Omni powered */}
      <section className="bg-accent/30 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
            {t("aiCompanion.capabilitiesTitle")}
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            {t("aiCompanion.capabilitiesSubtitle")}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <Card key={n} className="card-elevated border-transparent">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-foreground mb-2 text-base">
                    {t(`aiCompanion.cap${n}Title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`aiCompanion.cap${n}Desc`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Safety guarantees */}
      <section className="bg-muted/50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
            {t("aiCompanion.safetyTitle")}
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            {t("aiCompanion.safetySubtitle")}
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "safetyGuard1", "safetyGuard2", "safetyGuard3", "safetyGuard4",
              "safetyGuard5", "safetyGuard6", "safetyGuard7", "safetyGuard8",
              "safetyGuard9", "safetyGuard10",
            ].map((key) => (
              <div key={key} className="flex items-start gap-3 p-4 bg-card rounded-xl border">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{t(`aiCompanion.${key}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison with other AI */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
          {t("aiCompanion.comparisonTitle")}
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Other AI */}
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-6">
              <h3 className="font-bold text-destructive mb-4">{t("aiCompanion.otherAITitle")}</h3>
              <ul className="space-y-3">
                {["otherAI1", "otherAI2", "otherAI3", "otherAI4", "otherAI5", "otherAI6", "otherAI7"].map((key) => (
                  <li key={key} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-destructive shrink-0">✗</span>
                    {t(`aiCompanion.${key}`)}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          {/* Our AI */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-6">
              <h3 className="font-bold text-primary mb-4">{t("aiCompanion.ourAITitle")}</h3>
              <ul className="space-y-3">
                {["ourAI1", "ourAI2", "ourAI3", "ourAI4", "ourAI5", "ourAI6", "ourAI7"].map((key) => (
                  <li key={key} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-primary shrink-0">✓</span>
                    {t(`aiCompanion.${key}`)}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="hero-gradient py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            {t("aiCompanion.ctaTitle")}
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            {t("aiCompanion.ctaSubtitle")}
          </p>
          <Button variant="coral" size="lg" onClick={() => navigate("/auth?mode=signup")}>
            {t("aiCompanion.tryNow")} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-4xl mx-auto px-4 py-12">
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
