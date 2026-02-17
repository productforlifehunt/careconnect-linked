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
import {
  ArrowLeft, ArrowRight, CheckCircle, Upload, Shield, Star, DollarSign, Clock, MapPin, Heart
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

const allLanguages = ["English", "Spanish", "Mandarin", "French", "Korean", "Tagalog", "Vietnamese", "Arabic", "Hindi", "Russian"];

export default function BecomeCaregiver() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Step 1: Personal Info
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");

  // Step 2: Qualifications
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["English"]);
  const [experience, setExperience] = useState("");

  // Step 3: Availability & Pricing
  const [availDays, setAvailDays] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState("");
  const [availability, setAvailability] = useState("full-time");

  // Step 4: Background
  const [agreeBackground, setAgreeBackground] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [hasInsurance, setHasInsurance] = useState(false);

  const toggleItem = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);
  };

  const progress = (step / totalSteps) * 100;

  const handleSubmit = () => {
    toast({
      title: "Application Submitted! 🎉",
      description: "We'll review your application within 2 business days. You'll receive an email with next steps.",
    });
    navigate("/");
  };

  const canProceed = () => {
    if (step === 1) return fullName && email && phone && city;
    if (step === 2) return selectedSpecialties.length > 0 && experience;
    if (step === 3) return availDays.length > 0 && hourlyRate;
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
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Become a Caregiver</h1>
        <p className="text-muted-foreground mt-2">Join thousands of caregivers making a difference</p>
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
                <Label>Full Name *</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" />
              </div>
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
            <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Upload Profile Photo</p>
              <p className="text-xs text-muted-foreground">JPG or PNG, max 5MB</p>
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
                  <Badge
                    key={s}
                    variant={selectedSpecialties.includes(s) ? "default" : "outline"}
                    className="cursor-pointer text-sm py-1.5 px-3"
                    onClick={() => toggleItem(selectedSpecialties, s, setSelectedSpecialties)}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-3 block">Certifications (select all that apply)</Label>
              <div className="flex flex-wrap gap-2">
                {allCertifications.map(c => (
                  <Badge
                    key={c}
                    variant={selectedCerts.includes(c) ? "default" : "outline"}
                    className="cursor-pointer text-sm py-1.5 px-3"
                    onClick={() => toggleItem(selectedCerts, c, setSelectedCerts)}
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-3 block">Languages</Label>
              <div className="flex flex-wrap gap-2">
                {allLanguages.map(l => (
                  <Badge
                    key={l}
                    variant={selectedLanguages.includes(l) ? "default" : "outline"}
                    className="cursor-pointer text-sm py-1.5 px-3"
                    onClick={() => toggleItem(selectedLanguages, l, setSelectedLanguages)}
                  >
                    {l}
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
            <CardTitle>Availability & Pricing</CardTitle>
            <CardDescription>Set your schedule and rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-3 block">Available Days * (select all that apply)</Label>
              <div className="flex flex-wrap gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                  <Badge
                    key={day}
                    variant={availDays.includes(day) ? "default" : "outline"}
                    className="cursor-pointer text-sm py-2 px-4"
                    onClick={() => toggleItem(availDays, day, setAvailDays)}
                  >
                    {day}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Availability Type</Label>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="weekends">Weekends only</SelectItem>
                  <SelectItem value="overnight">Overnight</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Hourly Rate ($) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={hourlyRate}
                  onChange={e => setHourlyRate(e.target.value)}
                  placeholder="25"
                  className="pl-9"
                  min={10}
                  max={100}
                />
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
              <ul className="space-y-1.5 text-sm text-muted-foreground ml-9">
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-success" /> National criminal records check</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-success" /> Sex offender registry</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-success" /> Identity verification</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-success" /> Professional license validation</li>
              </ul>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox checked={agreeBackground} onCheckedChange={(c) => setAgreeBackground(!!c)} className="mt-1" />
                <span className="text-sm text-foreground">I consent to a comprehensive background check and understand that my application is contingent upon passing. *</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox checked={hasInsurance} onCheckedChange={(c) => setHasInsurance(!!c)} className="mt-1" />
                <span className="text-sm text-foreground">I have professional liability insurance (recommended but not required)</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox checked={agreeTerms} onCheckedChange={(c) => setAgreeTerms(!!c)} className="mt-1" />
                <span className="text-sm text-foreground">I agree to Care·Connected's Terms of Service, Privacy Policy, and Caregiver Code of Conduct. *</span>
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
            <Button variant="coral" onClick={handleSubmit} disabled={!canProceed()}>
              Submit Application <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
