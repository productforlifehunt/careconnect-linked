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
import {
  ArrowLeft, ArrowRight, CheckCircle, Upload, Shield, DollarSign, Heart
} from "lucide-react";

const allSpecialties = [
  "Elder Care", "Child Care", "Special Needs", "Nursing Care", "Companionship",
  "Respite Care", "Physical Therapy", "Dementia Care", "Palliative Support",
  "Post-Surgery Care", "Meal Preparation", "Transportation", "Medication Management",
  "Wound Care", "Mobility Support", "Tutoring", "Overnight Care",
];

const allCertifications = [
  "CNA", "RN", "LPN", "CPR", "First Aid", "Home Health Aide",
  "Child Development Associate", "Special Ed Certificate", "PTA License",
  "BSN", "IV Certification", "Wound Care", "Alzheimer's Care",
  "Hospice Care", "Food Safety",
];

export default function BecomeCaregiver() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const site = useSite();
  const submitApplication = useSubmitProviderApplication();
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
    if (!isAuthenticated) {
      toast({ title: "Please sign in first", variant: "destructive" });
      navigate("/auth");
      return;
    }
    const expMap: Record<string, number> = { "0-1": 1, "1-3": 2, "3-5": 4, "5-10": 7, "10+": 12 };
    try {
      await submitApplication.mutateAsync({
        bio,
        specialty: selectedSpecialties,
        certification: selectedCerts,
        years_of_experience: expMap[experience] || 1,
        hourly_rate: parseFloat(hourlyRate) || 25,
        phone_number: phone,
        location: city,
      });
      toast({
        title: "Application Submitted! 🎉",
        description: "We'll review your application within 2 business days.",
      });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    }
  };

  const canProceed = () => {
    if (step === 1) return phone && city;
    if (step === 2) return selectedSpecialties.length > 0 && experience;
    if (step === 3) return hourlyRate;
    if (step === 4) return agreeBackground && agreeTerms;
    return false;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-4 gap-2" onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}>
        <ArrowLeft className="h-4 w-4" /> {step > 1 ? "Previous Step" : "Back"}
      </Button>

      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-2xl hero-gradient flex items-center justify-center mb-4">
          <Heart className="h-7 w-7 text-primary-foreground" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{site.id === "challenged" ? "Join as a Dementia Caregiver" : "Become a Caregiver"}</h1>
        <p className="text-muted-foreground mt-2">{site.id === "challenged" ? "Help families navigating dementia care" : "Join thousands of caregivers making a difference"}</p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {step === 1 && (
        <Card className="border-transparent card-elevated">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Tell us about yourself</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Phone *</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000-0000" />
              </div>
              <div>
                <Label>City / ZIP *</Label>
                <Input value={city} onChange={e => setCity(e.target.value)} placeholder="Brooklyn, NY" />
              </div>
            </div>
            <div>
              <Label>About You</Label>
              <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell families why you're passionate about caregiving..." rows={4} />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-transparent card-elevated">
          <CardHeader>
            <CardTitle>Qualifications</CardTitle>
            <CardDescription>Your skills and experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-3 block">Specialties * (select all that apply)</Label>
              <div className="flex flex-wrap gap-2">
                {allSpecialties.map(s => (
                  <Badge key={s} variant={selectedSpecialties.includes(s) ? "default" : "outline"} className="cursor-pointer text-sm py-1.5 px-3" onClick={() => toggleItem(selectedSpecialties, s, setSelectedSpecialties)}>
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-3 block">Certifications</Label>
              <div className="flex flex-wrap gap-2">
                {allCertifications.map(c => (
                  <Badge key={c} variant={selectedCerts.includes(c) ? "default" : "outline"} className="cursor-pointer text-sm py-1.5 px-3" onClick={() => toggleItem(selectedCerts, c, setSelectedCerts)}>
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Years of Experience *</Label>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger><SelectValue placeholder="Select experience" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-1">Less than 1 year</SelectItem>
                  <SelectItem value="1-3">1-3 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5-10">5-10 years</SelectItem>
                  <SelectItem value="10+">10+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="border-transparent card-elevated">
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
            <CardDescription>Set your rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Hourly Rate ($) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="25" className="pl-9" min={10} max={100} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Average rate in your area: $22-35/hr</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card className="border-transparent card-elevated">
          <CardHeader>
            <CardTitle>Background Check & Agreement</CardTitle>
            <CardDescription>Final step to complete your application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg bg-accent/50 space-y-3">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <div>
                  <h4 className="font-semibold text-foreground">Background Check Required</h4>
                  <p className="text-sm text-muted-foreground">We partner with Checkr for comprehensive background screening</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox checked={agreeBackground} onCheckedChange={(c) => setAgreeBackground(!!c)} className="mt-1" />
                <span className="text-sm text-foreground">I consent to a comprehensive background check. *</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox checked={hasInsurance} onCheckedChange={(c) => setHasInsurance(!!c)} className="mt-1" />
                <span className="text-sm text-foreground">I have professional liability insurance (recommended)</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox checked={agreeTerms} onCheckedChange={(c) => setAgreeTerms(!!c)} className="mt-1" />
                <span className="text-sm text-foreground">I agree to the Terms of Service and Privacy Policy. *</span>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between mt-6">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        )}
        <div className="ml-auto">
          {step < totalSteps ? (
            <Button variant="coral" onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Continue <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button variant="coral" onClick={handleSubmit} disabled={!canProceed() || submitApplication.isPending}>
              {submitApplication.isPending ? "Submitting..." : "Submit Application"} <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
