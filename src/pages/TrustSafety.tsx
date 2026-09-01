import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Lock, Eye, FileCheck, AlertTriangle, Phone, Mail } from "lucide-react";
import { useSite } from "@/contexts/SiteContext";
import { useTranslation } from "react-i18next";

export default function TrustSafety() {
  const { t } = useTranslation();
  const site = useSite();
  const safeguards = [
    { icon: FileCheck, title: t("trustSafety.comprehensiveBgChecks"), desc: t("trustSafety.comprehensiveBgChecksDesc"), badge: t("trustSafety.badgeRequired") },
    { icon: Shield, title: t("trustSafety.identityVerification"), desc: t("trustSafety.identityVerificationDesc"), badge: t("trustSafety.badgeVerified") },
    { icon: CheckCircle, title: t("trustSafety.credentialValidation"), desc: t("trustSafety.credentialValidationDesc"), badge: t("trustSafety.badgeValidated") },
    { icon: Eye, title: t("trustSafety.verifiedReviews"), desc: t("trustSafety.verifiedReviewsDesc"), badge: t("trustSafety.badgeAuthentic") },
    { icon: Lock, title: t("trustSafety.securePayments"), desc: t("trustSafety.securePaymentsDesc"), badge: t("trustSafety.badgeEncrypted") },
    { icon: AlertTriangle, title: t("trustSafety.realtimeSafetyAlerts"), desc: t("trustSafety.realtimeSafetyAlertsDesc"), badge: t("trustSafety.badge24_7") },
  ];

  const stats = [
    { label: t("trustSafety.bgChecksCompleted"), value: "50,000+" },
    { label: t("trustSafety.activeVerified"), value: "12,000+" },
    { label: t("trustSafety.familiesServed"), value: "25,000+" },
    { label: t("trustSafety.safetyIncidents"), value: "99.8%" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl hero-gradient flex items-center justify-center mb-3"><Shield className="h-7 w-7 sm:h-8 sm:w-8 text-primary-foreground" /></div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">{t("trustSafety.title")}</h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">{t("trustSafety.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map(s => (
          <Card key={s.label} className="border-transparent card-elevated text-center">
            <CardContent className="p-6"><p className="text-2xl md:text-3xl font-bold text-primary">{s.value}</p><p className="text-sm text-muted-foreground mt-1">{s.label}</p></CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6 mb-12">
        {safeguards.map((sg, i) => (
          <Card key={i} className="border-transparent card-elevated">
            <CardContent className="p-6 flex gap-5">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0"><sg.icon className="h-6 w-6 text-primary" /></div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2"><h3 className="font-semibold text-lg text-foreground">{sg.title}</h3><Badge variant="secondary" className="bg-success/10 text-success">{sg.badge}</Badge></div>
                <p className="text-muted-foreground">{sg.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-transparent card-elevated">
        <CardHeader><CardTitle>{t("trustSafety.reportConcern")}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{t("trustSafety.reportConcernDesc")}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="coral" className="gap-2"><Phone className="h-4 w-4" /> {t("trustSafety.callSafetyLine")}</Button>
            <Button variant="outline" className="gap-2"><Mail className="h-4 w-4" /> {t("trustSafety.emailSafety", { email: site.contactEmail })}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
