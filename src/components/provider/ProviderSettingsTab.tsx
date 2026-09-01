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

/**
 * Profile tab — Basic Info, Active toggle, Payout accounts.
 *
 * Writes to CCT 258 only. Nothing here touches WooCommerce/Dokan: a Woo
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (profile && !loaded) {
      setLocation(profile.location || "");
      setHourlyRate(profile.care_provider_starts_hourly_rate?.toString() || "");
      setBio(profile.bio || "");
      setPhone(profile.phone || "");
      setIsActive(profile.provider_is_active || false);
      setLoaded(true);
    }
  }, [profile, loaded]);

  const handleSave = async () => {
    try {
      // Save profile via WordPress
      await updateProfile.mutateAsync({
        location,
        care_provider_starts_hourly_rate: parseFloat(hourlyRate) || 0,
        bio,
        phone,
        provider_is_active: isActive,
        // Turning marketplace visibility on also marks the account as a paid
        // care provider (a59) — search only lists rows where a59 and a60 are
        // both Yes, and this is the flag that provisions the payout account.
        ...(isActive ? { is_care_provider: true } : {}),
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
            <Switch checked={isActive} onCheckedChange={setIsActive} />
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
              <Label className="flex items-center gap-1.5 mb-1.5"><MapPin className="h-3.5 w-3.5" /> {t("common.location")}</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder={t("providerDash.locationPlaceholder")} />
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
              <p className="text-xs text-muted-foreground mt-1">{i18n.language?.startsWith("zh") ? "仅用于收款账户，不会公开显示。" : "Used for your payout account only — never shown publicly."}</p>
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
