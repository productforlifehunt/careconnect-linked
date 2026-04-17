import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, DollarSign, Briefcase, Shield, Phone, Eye, EyeOff, X, Store, ShoppingBag, Home, Video } from "lucide-react";
import { useMyProfile, useUpdateProfile } from "@/hooks/use-care-data";
import { useSyncProviderToWooCommerce, useProviderWooCommerceProduct } from "@/hooks/use-woocommerce";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { ALL_CERTIFICATIONS, getCertificationKey } from "@/lib/specialty-i18n";
import { FIXED_SERVICE_TYPES } from "@/lib/fixed-service-types";

export default function ProviderSettingsTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: profile } = useMyProfile();
  const updateProfile = useUpdateProfile();
  const syncToWooCommerce = useSyncProviderToWooCommerce();
  const { data: wcProduct, isLoading: wcLoading } = useProviderWooCommerceProduct();
  const serviceTypes = FIXED_SERVICE_TYPES;

  const [location, setLocation] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceRates, setServiceRates] = useState<Record<string, string>>({});
  const [certifications, setCertifications] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [localCost, setLocalCost] = useState("0");
  const [virtualCost, setVirtualCost] = useState("0");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (profile && !loaded) {
      setLocation(profile.location || "");
      setHourlyRate(profile.care_provider_starts_hourly_rate?.toString() || "");
      setBio(profile.bio || "");
      setPhone(profile.phone || "");
      setExperience(profile.years_of_experience?.toString() || "");
      setSelectedServices(profile.specialty || []);
      setCertifications(profile.certifications || []);
      setIsActive(profile.care_provider_is_active || false);
      setLocalCost(((profile as any).care_provider_local_cost ?? 0).toString());
      setVirtualCost(((profile as any).care_provider_virtual_cost ?? 0).toString());
      // Initialize per-service rates from profile meta if available
      const existingRates: Record<string, string> = {};
      (profile.specialty || []).forEach((s: string) => {
        existingRates[s] = profile.care_provider_starts_hourly_rate?.toString() || "";
      });
      setServiceRates(existingRates);
      setLoaded(true);
    }
  }, [profile, loaded]);

  // Initialize rate for newly selected service with default rate
  useEffect(() => {
    setServiceRates(prev => {
      const next = { ...prev };
      selectedServices.forEach(s => {
        if (!(s in next)) next[s] = hourlyRate || "";
      });
      // Remove rates for deselected services
      Object.keys(next).forEach(k => {
        if (!selectedServices.includes(k)) delete next[k];
      });
      return next;
    });
  }, [selectedServices, hourlyRate]);

  const toggleService = (name: string) => {
    setSelectedServices(prev =>
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );
  };

  const toggleCert = (name: string) => {
    setCertifications(prev =>
      prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
    );
  };

  const handleSave = async () => {
    try {
      const rateEntries = selectedServices.map(s => ({
        serviceType: s,
        hourlyRate: parseFloat(serviceRates[s]) || parseFloat(hourlyRate) || 0,
      }));

      // Save profile via WordPress
      await updateProfile.mutateAsync({
        location,
        care_provider_starts_hourly_rate: parseFloat(hourlyRate) || 0,
        bio,
        phone,
        years_of_experience: parseInt(experience) || 0,
        specialty: selectedServices,
        certifications,
        care_provider_is_active: isActive,
      });

      // Then sync to WooCommerce/Dokan with per-service-type rates + delivery costs
      await syncToWooCommerce.mutateAsync({
        hourlyRate: parseFloat(hourlyRate) || 0,
        bio,
        specialties: selectedServices,
        certifications,
        yearsOfExperience: parseInt(experience) || 0,
        location,
        providerIsActive: isActive,
        serviceRates: rateEntries,
        deliveryCosts: {
          localCost: parseFloat(localCost) || 0,
          virtualCost: parseFloat(virtualCost) || 0,
        },
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
          
          {wcProduct && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>{t("providerDash.productName") || "Product Name"}:</strong> {wcProduct.name}</p>
              <p><strong>{t("providerDash.type") || "Type"}:</strong> {wcProduct.type === 'booking' ? 'Bookable (WC Bookings)' : wcProduct.type === 'variable' ? 'Variable (legacy)' : wcProduct.type}</p>
              <p><strong>{t("providerDash.status") || "Status"}:</strong> {wcProduct.status === 'publish' ? 'Published' : 'Draft'}</p>
            </div>
          )}
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

      {/* Service Types with Per-Service Pricing — like Care.com */}
      <Card className="border-transparent card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> {t("becomeCaregiver.specialties") || "Services Offered"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("providerDash.selectServicesDesc") || "Select the services you offer. Each service becomes a bookable option with its own hourly rate."}
          </p>
          {serviceTypesLoading ? (
            <div className="grid sm:grid-cols-2 gap-2">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 rounded-md" />)}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {serviceTypes.map(st => (
                <Badge
                  key={st.slug}
                  variant={selectedServices.includes(st.name) ? "default" : "outline"}
                  className="cursor-pointer text-xs py-1.5 px-3 transition-colors"
                  onClick={() => toggleService(st.name)}
                >
                  {st.name}
                  {selectedServices.includes(st.name) && <X className="h-3 w-3 ml-1" />}
                </Badge>
              ))}
            </div>
          )}

          {/* Per-service pricing cards */}
          {selectedServices.length > 0 && (
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">{t("providerDash.perServiceRates") || "Per-Service Hourly Rates"}</Label>
                <span className="text-xs text-muted-foreground">
                  {t("providerDash.defaultRate") || "Default"}: ${hourlyRate || "0"}/hr
                </span>
              </div>
              <div className="grid gap-3">
                {selectedServices.map(s => {
                  const customRate = serviceRates[s];
                  const isCustom = customRate && customRate !== hourlyRate && customRate !== "";
                  return (
                    <div key={s} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium truncate">{s}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          step="5"
                          className="h-8 w-20 text-sm text-right"
                          value={serviceRates[s] || ""}
                          onChange={e => setServiceRates(prev => ({ ...prev, [s]: e.target.value }))}
                          placeholder={hourlyRate || "0"}
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">/hr</span>
                        {isCustom && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {t("providerDash.custom") || "Custom"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("providerDash.pricingNote") || "Leave blank to use your default rate. Each service will be listed as a separate bookable variation on the marketplace."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Mode Surcharges (Local vs Virtual) — WC Bookings Resources */}
      <Card className="border-transparent card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" /> {t("providerDash.deliveryMode") || "Delivery Mode Surcharges"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("providerDash.deliveryModeDesc") || "Customers choose Local (in-person) or Virtual (remote) at booking. Add an optional per-hour surcharge for each mode (set to 0 for no extra cost)."}
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Home className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium truncate">
                  {t("providerDash.localInPerson") || "Local (In-Person)"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  step="5"
                  className="h-8 w-20 text-sm text-right"
                  value={localCost}
                  onChange={e => setLocalCost(e.target.value)}
                  placeholder="0"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">/hr</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Video className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium truncate">
                  {t("providerDash.virtualRemote") || "Virtual (Remote)"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  step="5"
                  className="h-8 w-20 text-sm text-right"
                  value={virtualCost}
                  onChange={e => setVirtualCost(e.target.value)}
                  placeholder="0"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">/hr</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("providerDash.deliveryModeNote") || "Surcharges are per booked hour and added on top of the per-service rate. Customer picks one delivery mode per booking."}
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