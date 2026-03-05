import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, DollarSign, Briefcase, Shield, Phone, Eye, EyeOff, X } from "lucide-react";
import { useMyProfile, useUpdateProfile } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";

const ALL_SPECIALTIES = [
  "Elder Care", "Child Care", "Special Needs", "Nursing Care", "Companionship",
  "Respite Care", "Physical Therapy", "Dementia Care", "Palliative Support",
  "Post-Surgery Care", "Meal Preparation", "Transportation", "Medication Management",
  "Wound Care", "Mobility Support", "Tutoring", "Overnight Care",
];

const ALL_CERTIFICATIONS = [
  "CNA", "RN", "LPN", "CPR", "First Aid", "Home Health Aide",
  "Child Development Associate", "Special Ed Certificate", "PTA License",
  "BSN", "IV Certification", "Wound Care", "Alzheimer's Care", "Hospice Care", "Food Safety",
];

export default function ProviderSettingsTab() {
  const { toast } = useToast();
  const { data: profile } = useMyProfile();
  const updateProfile = useUpdateProfile();

  const [location, setLocation] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (profile && !loaded) {
      setLocation(profile.location || "");
      setHourlyRate(profile.hourly_rate?.toString() || "");
      setBio(profile.bio || "");
      setPhone(profile.phone_number || "");
      setExperience(profile.years_of_experience?.toString() || "");
      setSpecialties(profile.specialty || []);
      setCertifications(profile.certification || []);
      setIsActive(profile.provider_is_active || false);
      setLoaded(true);
    }
  }, [profile, loaded]);

  const toggleItem = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter(x => x !== item) : [...list, item]);
  };

  const handleSave = () => {
    updateProfile.mutate(
      {
        location,
        hourly_rate: parseFloat(hourlyRate) || 0,
        bio,
        phone_number: phone,
        years_of_experience: parseInt(experience) || 0,
        specialty: specialties,
        certification: certifications,
        provider_is_active: isActive,
      },
      {
        onSuccess: () => toast({ title: "Profile updated" }),
        onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Active Status */}
      <Card className="border-transparent card-elevated">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isActive ? <Eye className="h-5 w-5 text-success" /> : <EyeOff className="h-5 w-5 text-muted-foreground" />}
              <div>
                <p className="font-semibold text-foreground">Marketplace Visibility</p>
                <p className="text-sm text-muted-foreground">
                  {isActive ? "You are visible and bookable on the marketplace" : "You are hidden from search results"}
                </p>
              </div>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card className="border-transparent card-elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Basic Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><MapPin className="h-3.5 w-3.5" /> Location</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><DollarSign className="h-3.5 w-3.5" /> Hourly Rate ($)</Label>
              <Input type="number" min="0" step="5" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="e.g. 35" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><Phone className="h-3.5 w-3.5" /> Phone Number</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +1 (555) 123-4567" />
            </div>
            <div>
              <Label className="mb-1.5">Years of Experience</Label>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4", "5", "7", "10", "15", "20+"].map(y => (
                    <SelectItem key={y} value={y}>{y} {y === "20+" ? "" : "years"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="mb-1.5">Bio / About Me</Label>
            <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell families about yourself, your experience, and why you love caregiving..." rows={4} />
          </div>
        </CardContent>
      </Card>

      {/* Specialties */}
      <Card className="border-transparent card-elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Specialties</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ALL_SPECIALTIES.map(s => (
              <Badge
                key={s}
                variant={specialties.includes(s) ? "default" : "outline"}
                className="cursor-pointer text-xs py-1 px-2.5"
                onClick={() => toggleItem(specialties, s, setSpecialties)}
              >
                {s}
                {specialties.includes(s) && <X className="h-3 w-3 ml-1" />}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card className="border-transparent card-elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Certifications</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ALL_CERTIFICATIONS.map(c => (
              <Badge
                key={c}
                variant={certifications.includes(c) ? "default" : "outline"}
                className="cursor-pointer text-xs py-1 px-2.5"
                onClick={() => toggleItem(certifications, c, setCertifications)}
              >
                {c}
                {certifications.includes(c) && <X className="h-3 w-3 ml-1" />}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <Button variant="coral" className="w-full" onClick={handleSave} disabled={updateProfile.isPending}>
        {updateProfile.isPending ? "Saving..." : "Save Profile Settings"}
      </Button>
    </div>
  );
}
