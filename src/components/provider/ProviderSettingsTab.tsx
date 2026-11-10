import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MapPin, DollarSign, Briefcase, Phone, Eye, EyeOff } from "lucide-react";
import { useMyProfile, useUpdateProfile } from "@/hooks/use-care-data";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import PayoutAccountsCard from "./PayoutAccountsCard";
import { canActivateProvider, providerActivationMessage } from "@/features/providers/activation";
import { Link } from "@/lib/router-compat";

/**
 * Profile tab — Basic Info, Active toggle, Payout accounts.
 *
 * Writes service settings and biography to CCT258 and phone to app-scoped CCT151. A Woo
 * product is created just-in-time when a buyer adds a service to the cart,
 * per the data dictionary. Rates per service live in "My Booking Services".
 */

export default function ProviderSettingsTab() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { data: profile } = useMyProfile();
  const updateProfile = useUpdateProfile();

  const [location, setLocation] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    if (profile) {
      setLocation(profile.location || "");
      setHourlyRate(profile.care_provider_starts_hourly_rate?.toString() || "");
      setBio(profile.bio || "");
      setPhone(profile.phone || "");
      setIsActive(profile.provider_is_active || false);
    }
  }, [profile]);

  const handleSave = async () => {
    if (isActive && !canActivateProvider({ ...profile, location, care_provider_hourly_rate_in_person: parseFloat(hourlyRate) })) {
      toast({ title: providerActivationMessage(i18n.language?.startsWith("zh")), variant: "destructive" });
      return;
    }
    try {
      // Save profile via WordPress
      await updateProfile.mutateAsync({
        location,
        care_provider_starts_hourly_rate: parseFloat(hourlyRate) || 0,
        bio,
        phone,
        provider_is_active: isActive,
      });


      toast({ title: t("profile.profileUpdated") });
    } catch (e: any) {
      toast({ title: t("profile.updateFailed"), description: e.message, variant: "destructive" });
    }
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
                <p className="font-semibold text-foreground">{t("providerDash.marketplaceVisibility")}</p>
                <p className="text-sm text-muted-foreground">
                  {isActive ? t("providerDash.visibleBookable") : t("providerDash.hiddenFromSearch")}
                </p>
              </div>
            </div>
            <Switch aria-label={i18n.language?.startsWith("zh") ? "公开接单" : "Accept bookings publicly"} checked={isActive} onCheckedChange={next => {
              if (next && !canActivateProvider({ ...profile, location, care_provider_hourly_rate_in_person: parseFloat(hourlyRate) })) {
                toast({ title: providerActivationMessage(i18n.language?.startsWith("zh")), variant: "destructive" });
                return;
              }
              setIsActive(next);
            }} />
          </div>
        </CardContent>
      </Card>

      {/* Vendor payout accounts (Stripe / PayPal / Alipay) */}
      <PayoutAccountsCard />



      {/* Basic Info */}
      <Card className="border-transparent card-elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> {t("providerDash.basicInfo")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="provider-location" className="flex items-center gap-1.5 mb-1.5"><MapPin className="h-3.5 w-3.5" /> {t("common.location")} *</Label>
              <Input id="provider-location" value={location} onChange={e => setLocation(e.target.value)} placeholder={t("providerDash.locationPlaceholder")} />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><DollarSign className="h-3.5 w-3.5" /> {t("becomeCaregiver.hourlyRateDollar")} ({t("providerDash.defaultRate")})</Label>
              <Input type="number" min="0" step="5" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder={t("providerDash.ratePlaceholder")} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><Phone className="h-3.5 w-3.5" /> {t("providerDash.phoneNumber")}</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder={t("providerDash.phonePlaceholder")} />
            </div>
          </div>
          <div>
            <Label className="mb-1.5">{t("providerDash.bioAboutMe")}</Label>
            <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder={t("providerDash.bioPlaceholder")} rows={4} />
          </div>
        </CardContent>
      </Card>

      {/* Service Packages — structured (service-type + location + rate) */}
      {/* Service Packages moved to the "My Booking Services" tab. */}

      {/* Save */}
      <Button variant="outline" asChild><Link to="/caregiver-setting?tab=services">{i18n.language?.startsWith("zh") ? "服务类型与价格" : "Service types and rates"}</Link></Button>
      <Button
        variant="coral"
        className="w-full"
        onClick={handleSave}
        disabled={updateProfile.isPending}
      >
        {updateProfile.isPending
          ? t("common.saving")
          : t("providerDash.saveProfileSettings")}
      </Button>
    </div>
  );
}
