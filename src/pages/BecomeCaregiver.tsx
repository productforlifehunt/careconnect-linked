import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSite } from "@/contexts/SiteContext";
import { useSubmitProviderApplication } from "@/hooks/use-care-data";
import { ArrowLeft, ArrowRight, CheckCircle, Upload, Shield, DollarSign, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ALL_CERTIFICATIONS, getSpecialtyKey, getCertificationKey } from "@/lib/specialty-i18n";
import { useServiceTypes } from "@/hooks/use-service-types";

const allCertifications = ALL_CERTIFICATIONS;

export default function BecomeCaregiver() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const site = useSite();
  const submitApplication = useSubmitProviderApplication();
  const { serviceTypeNames: allSpecialties, isLoading: serviceTypesLoading } = useServiceTypes();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [agreeBackground, setAgreeBackground] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [hasInsurance, setHasInsurance] = useState(false);

  const toggleItem = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);
  };

  const progress = (step / totalSteps) * 100;

  const handleSubmit = async () => {
    if (!isAuthenticated) { toast({ title: t("becomeCaregiver.pleaseSignInFirst"), variant: "destructive" }); navigate("/auth"); return; }
    const expMap: Record<string, number> = { "0-1": 1, "1-3": 2, "3-5": 4, "5-10": 7, "10+": 12 };
    try {
      await submitApplication.mutateAsync({
        bio,
        specialty: selectedSpecialties,
        certifications: selectedCerts,
        years_of_experience: expMap[experience] || 1,
        care_provider_starts_hourly_rate: parseFloat(hourlyRate) || 0,
        phone: phone,
        location: city,
      });

      toast({ title: t("becomeCaregiver.applicationSubmitted"), description: t("becomeCaregiver.applicationSubmittedDesc") });
      navigate("/dashboard");
    } catch (err: any) { toast({ title: t("becomeCaregiver.submissionFailed"), description: err.message, variant: "destructive" }); }
  };

  const canProceed = () => {
    if (step === 1) return phone && city;
    if (step === 2) return selectedSpecialties.length > 0 && experience;
    if (step === 3) return hourlyRate;
    if (step === 4) return agreeBackground && agreeTerms;
    return false;
  };

  const siteKey = site.id;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Button variant="ghost" size="sm" className="mb-4 gap-1.5 -ml-2" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> {step > 1 ? t("becomeCaregiver.previousStep") : t("common.back")}
      </Button>

      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 rounded-2xl hero-gradient flex items-center justify-center mb-3"><Heart className="h-6 w-6 text-primary-foreground" /></div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">{t(`site.${siteKey}.becomeTitle`)}</h1>
        <p className="text-sm text-muted-foreground mt-1.5">{t(`site.${siteKey}.becomeSubtitle`)}</p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>{t("becomeCaregiver.stepOf", { current: step, total: totalSteps })}</span>
          <span>{t("becomeCaregiver.percentComplete", { percent: Math.round(progress) })}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {step === 1 && (
        <Card className="border-transparent card-elevated">
          <CardHeader><CardTitle>{t("becomeCaregiver.personalInfo")}</CardTitle><CardDescription>{t("becomeCaregiver.tellAboutYourself")}</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>{t("common.phone")} *</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000-0000" /></div>
              <div><Label>{t("becomeCaregiver.cityZip")} *</Label><Input value={city} onChange={e => setCity(e.target.value)} placeholder={t("becomeCaregiver.cityZipPlaceholder", "Brooklyn, NY")} /></div>
            </div>
            <div><Label>{t("becomeCaregiver.aboutYou")}</Label><Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder={t("becomeCaregiver.aboutYouPlaceholder")} rows={4} /></div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-transparent card-elevated">
          <CardHeader><CardTitle>{t("becomeCaregiver.qualifications")}</CardTitle><CardDescription>{t("becomeCaregiver.yourSkills")}</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-3 block">{t("becomeCaregiver.specialties")} * ({t("becomeCaregiver.selectAllApply")})</Label>
              <div className="flex flex-wrap gap-2">{allSpecialties.map(s => (<Badge key={s} variant={selectedSpecialties.includes(s) ? "default" : "outline"} className="cursor-pointer text-sm py-1.5 px-3" onClick={() => toggleItem(selectedSpecialties, s, setSelectedSpecialties)}>{t(getSpecialtyKey(s))}</Badge>))}</div>
            </div>
            <div>
              <Label className="mb-3 block">{t("becomeCaregiver.certifications")}</Label>
              <div className="flex flex-wrap gap-2">{allCertifications.map(c => (<Badge key={c} variant={selectedCerts.includes(c) ? "default" : "outline"} className="cursor-pointer text-sm py-1.5 px-3" onClick={() => toggleItem(selectedCerts, c, setSelectedCerts)}>{t(getCertificationKey(c))}</Badge>))}</div>
            </div>
            <div>
              <Label>{t("becomeCaregiver.yearsOfExperience")} *</Label>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger><SelectValue placeholder={t("common.selectOption")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">{t("becomeCaregiver.lessThan1")}</SelectItem>
                  <SelectItem value="1-3">{t("becomeCaregiver.years1to3")}</SelectItem>
                  <SelectItem value="3-5">{t("becomeCaregiver.years3to5")}</SelectItem>
                  <SelectItem value="5-10">{t("becomeCaregiver.years5to10")}</SelectItem>
                  <SelectItem value="10+">{t("becomeCaregiver.years10plus")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-transparent card-elevated">
          <CardHeader><CardTitle>{t("becomeCaregiver.pricing")}</CardTitle><CardDescription>{t("becomeCaregiver.setYourRates")}</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>{t("becomeCaregiver.hourlyRateDollar")} *</Label>
              <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="25" className="pl-9" min={10} max={100} /></div>
              <p className="text-xs text-muted-foreground mt-1">{t("becomeCaregiver.avgRate")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="border-transparent card-elevated">
          <CardHeader><CardTitle>{t("becomeCaregiver.bgCheckAgreement")}</CardTitle><CardDescription>{t("becomeCaregiver.finalStep")}</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg bg-accent/50 space-y-3">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <div><h4 className="font-semibold text-foreground">{t("becomeCaregiver.bgCheckRequired")}</h4><p className="text-sm text-muted-foreground">{t("becomeCaregiver.bgCheckPartner")}</p></div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer"><Checkbox checked={agreeBackground} onCheckedChange={(c) => setAgreeBackground(!!c)} className="mt-1" /><span className="text-sm text-foreground">{t("becomeCaregiver.consentBgCheck")}</span></label>
              <label className="flex items-start gap-3 cursor-pointer"><Checkbox checked={hasInsurance} onCheckedChange={(c) => setHasInsurance(!!c)} className="mt-1" /><span className="text-sm text-foreground">{t("becomeCaregiver.hasInsurance")}</span></label>
              <label className="flex items-start gap-3 cursor-pointer"><Checkbox checked={agreeTerms} onCheckedChange={(c) => setAgreeTerms(!!c)} className="mt-1" /><span className="text-sm text-foreground">{t("becomeCaregiver.agreeTerms")}</span></label>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between mt-6">
        {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}><ArrowLeft className="h-4 w-4 mr-2" /> {t("common.back")}</Button>}
        <div className="ml-auto">
          {step < totalSteps ? (
            <Button variant="coral" onClick={() => setStep(step + 1)} disabled={!canProceed()}>{t("common.continue")} <ArrowRight className="h-4 w-4 ml-2" /></Button>
          ) : (
            <Button variant="coral" onClick={handleSubmit} disabled={!canProceed() || submitApplication.isPending}>
              {submitApplication.isPending ? t("becomeCaregiver.submitting") : t("becomeCaregiver.submitApplication")} <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
