import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, DollarSign, Briefcase, Shield, Phone, Eye, EyeOff, X, Store, ShoppingBag, Plus, Trash2 } from "lucide-react";
import { useMyProfile, useUpdateProfile } from "@/hooks/use-care-data";
import { useSyncProviderToWooCommerce, useProviderWooCommerceProduct } from "@/hooks/use-woocommerce";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { ALL_CERTIFICATIONS, getCertificationKey } from "@/lib/specialty-i18n";

/**
 * Flat service-resource model. Each row is one bookable_resource the
 * customer picks at checkout (e.g. "儿童陪伴(当面)"). The full hourly rate
 * lives on the resource — no separate person/delivery split.
 */
interface ServiceResourceRow {
  name: string;
  ratePerHour: string;
}

const STARTER_RESOURCES: ServiceResourceRow[] = [
  { name: "老人陪伴 (当面)", ratePerHour: "50" },
  { name: "老人陪伴 (远程)", ratePerHour: "30" },
  { name: "儿童陪伴 (当面)", ratePerHour: "40" },
  { name: "儿童陪伴 (远程)", ratePerHour: "25" },
];

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
  const [serviceResources, setServiceResources] = useState<ServiceResourceRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (profile && !loaded) {
      setLocation(profile.location || "");
      setHourlyRate(profile.care_provider_starts_hourly_rate?.toString() || "");
      setBio(profile.bio || "");
      setPhone(profile.phone || "");
      setExperience(profile.years_of_experience?.toString() || "");
      setCertifications(profile.certifications || []);
      setIsActive(profile.care_provider_is_active || false);

      // Hydrate flat service resources from existing WC product meta if present.
      // _service_rates is a JSON map { name: rate }. If empty, leave list empty
      // so the user can either add their own or click "Use starter list".
      let initial: ServiceResourceRow[] = [];
      try {
        const meta = (wcProduct as any)?.meta_data?.find?.((m: any) => m.key === "_service_rates")?.value;
        if (meta) {
          const parsed = typeof meta === "string" ? JSON.parse(meta) : meta;
          initial = Object.entries(parsed || {}).map(([name, rate]) => ({
            name,
            ratePerHour: String(rate ?? ""),
          }));
        }
      } catch { /* ignore */ }
      setServiceResources(initial);
      setLoaded(true);
    }
  }, [profile, wcProduct, loaded]);

  const toggleCert = (name: string) => {
    setCertifications(prev =>
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );
  };

  const updateRow = (idx: number, patch: Partial<ServiceResourceRow>) => {
    setServiceResources(prev => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    setServiceResources(prev => [...prev, { name: "", ratePerHour: hourlyRate || "" }]);
  };

  const removeRow = (idx: number) => {
    setServiceResources(prev => prev.filter((_, i) => i !== idx));
  };

  const useStarterList = () => {
    setServiceResources(STARTER_RESOURCES.map(r => ({ ...r })));
  };

  const handleSave = async () => {
    try {
      // Normalize: drop empty names; coerce rates to numbers
      const cleaned = serviceResources
        .map(r => ({ name: r.name.trim(), ratePerHour: parseFloat(r.ratePerHour) || 0 }))
        .filter(r => r.name.length > 0);

      // Save profile via WordPress
      await updateProfile.mutateAsync({
        location,
        care_provider_starts_hourly_rate: parseFloat(hourlyRate) || 0,
        bio,
        phone,
        years_of_experience: parseInt(experience) || 0,
        // Mirror the resource names into legacy `specialty` for display fallback
        specialty: cleaned.map(r => r.name),
        certifications,
        care_provider_is_active: isActive,
      });

      // Sync to WooCommerce/Dokan with the flat service-resource list
      await syncToWooCommerce.mutateAsync({
        hourlyRate: parseFloat(hourlyRate) || 0,
        bio,
        specialties: cleaned.map(r => r.name),
        certifications,
        yearsOfExperience: parseInt(experience) || 0,
        location,
        providerIsActive: isActive,
        serviceResources: cleaned,
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

      {/* Basic Info */}
      <Card className="border-transparent card-elevated">
        <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> {t("providerDash.basicInfo")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><MapPin className="h-3.5 w-3.5" /> {t("common.location")}</Label>
              <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. San Francisco, CA" />
            </div>
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><DollarSign className="h-3.5 w-3.5" /> {t("becomeCaregiver.hourlyRateDollar")} (default)</Label>
              <Input type="number" min="0" step="5" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="e.g. 35" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-1.5 mb-1.5"><Phone className="h-3.5 w-3.5" /> {t("providerDash.phoneNumber")}</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +1 (555) 123-4567" />
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

      {/* Service Packages — flat resource list */}
      <Card className="border-transparent card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Service Packages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Each package is one bookable service the customer picks at checkout. Name it however you like
            (e.g. <span className="font-medium">老人陪伴 (当面)</span>, <span className="font-medium">儿童陪伴 (远程)</span>) and set
            its hourly rate. Total = rate × hours booked.
          </p>

          {serviceResources.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">No packages yet.</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={useStarterList}>
                  Use starter list
                </Button>
                <Button variant="coral" size="sm" onClick={addRow}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add package
                </Button>
              </div>
            </div>
          )}

          {serviceResources.length > 0 && (
            <>
              <div className="space-y-2">
                {serviceResources.map((row, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-3 rounded-lg border bg-card"
                  >
                    <Input
                      className="flex-1"
                      value={row.name}
                      onChange={e => updateRow(idx, { name: e.target.value })}
                      placeholder="e.g. 老人陪伴 (当面)"
                    />
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        step="5"
                        className="h-9 w-20 text-sm text-right"
                        value={row.ratePerHour}
                        onChange={e => updateRow(idx, { ratePerHour: e.target.value })}
                        placeholder="50"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">/hr</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                      onClick={() => removeRow(idx)}
                      aria-label="Remove package"
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
            Tip: clients can also negotiate a custom price in chat (hourly or one-time flat rate) — those don't need to be listed here.
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
