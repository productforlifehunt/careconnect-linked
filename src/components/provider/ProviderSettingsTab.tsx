import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, DollarSign, Briefcase, Shield, Phone, Eye, EyeOff, X, Store, ShoppingBag } from "lucide-react";
import { useMyProfile, useUpdateProfile } from "@/hooks/use-care-data";
import { useSyncProviderToWooCommerce, useProviderWooCommerceProduct } from "@/hooks/use-woocommerce";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { ALL_CERTIFICATIONS, getCertificationKey } from "@/lib/specialty-i18n";
import PayoutAccountsCard from "./PayoutAccountsCard";

/**
 * Profile tab — Basic Info, Certifications, Active toggle, Payout accounts.
 * Service Packages (pa_service-type + location + hourly rate) now live in the
 * dedicated "My Booking Services" tab so the WC Bookings product setup is
 * decoupled from profile metadata.
 */

export default function ProviderSettingsTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: profile } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const syncToWooCommerce = useSyncProviderToWooCommerce();
  const { data: wcProduct, isLoading: wcLoading } = useProviderWooCommerceProduct();

  const [location, setLocation] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (profile && !loaded) {
      setLocation(profile.location || "");
      setHourlyRate(profile.care_provider_starts_hourly_rate?.toString() || "");
      setBio(profile.bio || "");
      setPhone(profile.phone || "");
      setExperience(profile.years_of_experience?.toString() || "");
      setCertifications(profile.certifications || []);
      setIsActive(profile.provider_is_active || false);
      setLoaded(true);
    }
  }, [profile, wcProduct, loaded]);

  const toggleCert = (name: string) => {
    setCertifications(prev =>
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );
  };

  const handleSave = async () => {
    try {
      // Save profile via WordPress
      await updateProfile.mutateAsync({
        location,
        care_provider_starts_hourly_rate: parseFloat(hourlyRate) || 0,
        bio,
        phone,
        years_of_experience: parseInt(experience) || 0,
        certifications,
        provider_is_active: isActive,
      });

      // Sync Basic Info → Dokan store + WC product meta. Service packages
      // are managed in the "My Booking Services" tab and intentionally not
      // touched here, so leave `serviceResources` undefined.
      await syncToWooCommerce.mutateAsync({
        hourlyRate: parseFloat(hourlyRate) || 0,
        bio,
        certifications,
        yearsOfExperience: parseInt(experience) || 0,
        location,
        providerIsActive: isActive,
      });

      toast({ title: t("profile.profileUpdated"), description: "Profile synced to marketplace" });
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

      {/* WooCommerce/Dokan Integration Status */}
      <Card className="border-transparent card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" /> {t("providerDash.marketplaceIntegration") || "Marketplace Integration"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-foreground">
                  {wcLoading ? "Checking..." : wcProduct ? t("providerDash.productListed") || "Service Product Listed" : t("providerDash.productNotListed") || "Service Product Not Listed"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {wcProduct
                    ? `${t("providerDash.productId") || "Product ID"}: ${wcProduct.id}`
                    : t("providerDash.saveToList") || "Save profile to list your service on the marketplace"}
                </p>
              </div>
            </div>
            <Badge variant={wcProduct ? "default" : "secondary"}>
              {wcProduct ? t("providerDash.listed") || "Listed" : t("providerDash.notListed") || "Not Listed"}
            </Badge>
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
            </div>
            <div>
              <Label className="mb-1.5">{t("becomeCaregiver.yearsOfExperience")}</Label>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger><SelectValue placeholder={t("common.selectOption")} /></SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4", "5", "7", "10", "15", "20+"].map(y => (
                    <SelectItem key={y} value={y}>{y} {y === "20+" ? "" : t("common.yearsExp")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="mb-1.5">{t("providerDash.bioAboutMe")}</Label>
            <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder={t("providerDash.bioPlaceholder")} rows={4} />
          </div>
        </CardContent>
      </Card>

      {/* Service Packages — structured (service-type + location + rate) */}
      <Card className="border-transparent card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Service Packages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            For each package, pick the <span className="font-medium">service category</span>, where you deliver it
            (<span className="font-medium">In-Person</span>, <span className="font-medium">Remote</span>, or
            <span className="font-medium"> Both</span>), and your hourly rate. Total = rate × hours booked.
            Categories drive marketplace search filters; the rate is what clients pay at checkout.
          </p>

          {serviceResources.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">No packages yet.</p>
              <Button variant="coral" size="sm" onClick={addRow}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add package
              </Button>
            </div>
          )}

          {serviceResources.length > 0 && (
            <>
              <div className="space-y-2">
                {serviceResources.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center p-3 rounded-lg border bg-card"
                  >
                    {/* Service-type dropdown — pulls 21 terms from pa_service-type */}
                    <Select
                      value={row.serviceTypeSlug}
                      onValueChange={v => updateRow(idx, { serviceTypeSlug: v })}
                    >
                      <SelectTrigger className="col-span-5 h-9">
                        <SelectValue placeholder={t("provider.serviceType", "Service type")} />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {serviceTypes.map(st => (
                          <SelectItem key={st.slug} value={st.slug}>{st.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Location dropdown — in-person / remote / hybrid */}
                    <Select
                      value={row.locationSlug || "in-person"}
                      onValueChange={v => updateRow(idx, { locationSlug: v })}
                    >
                      <SelectTrigger className="col-span-3 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATION_OPTIONS.map(l => (
                          <SelectItem key={l.slug} value={l.slug}>{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Rate */}
                    <div className="col-span-3 flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <Input
                        type="number"
                        min="0"
                        step="5"
                        className="h-9 text-sm text-right"
                        value={row.ratePerHour}
                        onChange={e => updateRow(idx, { ratePerHour: e.target.value })}
                        placeholder="50"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">/hr</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="col-span-1 h-8 w-8 text-muted-foreground hover:text-destructive justify-self-end"
                      onClick={() => removeRow(idx)}
                      aria-label={t("provider.removePackage", "Remove package")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addRow} className="w-full">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add another package
              </Button>
            </>
          )}

          <p className="text-xs text-muted-foreground">
            Tip: clients can also negotiate a custom price in chat — those don't need to be listed here.
          </p>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card className="border-transparent card-elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> {t("becomeCaregiver.certifications")}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ALL_CERTIFICATIONS.map(c => (
              <Badge
                key={c}
                variant={certifications.includes(c) ? "default" : "outline"}
                className="cursor-pointer text-xs py-1 px-2.5"
                onClick={() => toggleCert(c)}
              >
                {t(getCertificationKey(c))}
                {certifications.includes(c) && <X className="h-3 w-3 ml-1" />}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <Button
        variant="coral"
        className="w-full"
        onClick={handleSave}
        disabled={updateProfile.isPending || syncToWooCommerce.isPending}
      >
        {updateProfile.isPending || syncToWooCommerce.isPending
          ? t("common.saving")
          : t("providerDash.saveProfileSettings")}
      </Button>
    </div>
  );
}
